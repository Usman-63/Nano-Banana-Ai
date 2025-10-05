require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");

// Firebase authentication and usage tracking
const { authenticateToken, optionalAuth } = require('./middleware/auth');
const { 
  canUserTransform, 
  recordTransformation, 
  getUserStats,
  resetUserUsage,
  getAllUsersUsage 
} = require('./models/userUsage');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-frontend-url.vercel.app'] 
    : true,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
  }
});

// ✅ Initialize the new SDK
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

function readImageAsBase64(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString("base64");
}

app.post('/transform', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log(`🔐 Transform request from user: ${req.user.email} (${req.user.uid})`);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Check if user can perform transformation
    const canTransform = await canUserTransform(req.user.uid);
    if (!canTransform) {
      const userStats = await getUserStats(req.user.uid);
      return res.status(429).json({ 
        success: false, 
        message: `Transformation limit exceeded. You have used ${userStats.transformationsUsed}/${userStats.maxTransformations} transformations.`,
        code: 'LIMIT_EXCEEDED',
        usage: userStats
      });
    }

    const style = req.body.style || 'Anime Style';
    console.log("🔹 Style:", style);

    const stylePrompts = { 
"Anime Style": "Using the provided image of this person, transform this portrait into pretty, anime style.", 
"Picasso Style": "Using the provided image of this person, transform this portrait into Picasso painting style.", 
"Oil Painting Style": "Using the provided image of this person, transform this portrait into the style of a Degas oil painting.", 
"Frida Style": "Using the provided image of this person, transform this portrait into Frida Kahlo painting style.", 
"Miniature Effect": "Create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork." 
};

    const prompt = stylePrompts[style];
    if (!prompt) {
      return res.status(400).json({ success: false, message: `Invalid style: ${style}` });
    }

    const imageData = readImageAsBase64(req.file.path);

    console.log("🔹 Prompt:", prompt);
    console.log("🔹 Mime:", req.file.mimetype);
    console.log("🔹 Image data length:", imageData?.length);

    // ✅ No getGenerativeModel needed
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: imageData
              }
            }
          ]
        }
      ],  
      config: {
    responseModalities: ["IMAGE", "TEXT"]
  }
    });

    // Extract image
    const transformedImage = response.candidates[0].content.parts.find(
      part => part.inlineData
    );

    if (!transformedImage) throw new Error("No image data returned from Gemini");

    // Record the transformation for usage tracking
    const usageStats = await recordTransformation(req.user.uid, 'image_transform');

    res.json({
      success: true,
      transformedImage: `data:image/jpeg;base64,${transformedImage.inlineData.data}`,
      usage: usageStats
    });

    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error('Error transforming image:', error);
    res.status(500).json({
      success: false,
      message: 'Error transforming image',
      error: error.message
    });
  }
});

// User stats endpoint
app.get('/user/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await getUserStats(req.user.uid);
    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name
      },
      usage: stats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user stats',
      error: error.message
    });
  }
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test auth endpoint
app.get('/auth/test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      emailVerified: req.user.emailVerified
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🔥 Firebase authentication enabled`);
  console.log(`📊 User usage tracking active (6 transformations per user)`);
});
