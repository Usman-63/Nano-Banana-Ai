require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");

// Import Firebase admin to check initialization
const { db, auth } = require('./firebase/admin');

// Check if Firebase Admin SDK is properly initialized
if (!db || !auth) {
  console.error('❌ ERROR: Firebase Admin SDK not properly initialized.');
  console.error('   Please check your Firebase configuration:');
  console.error('   1. Set FIREBASE_PROJECT_ID in your .env file');
  console.error('   2. Set either GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY');
  console.error('   3. Or place a service account key JSON file in the backend directory');
  console.error('\n   See FIREBASE_SETUP.md for detailed instructions');
  process.exit(1);
}

// Firebase authentication and usage tracking
const { authenticateToken, optionalAuth } = require('./middleware/auth');
const { 
  canUserTransform, 
  recordTransformation, 
  getUserStats,
  resetUserUsage,
  getAllUsersUsage,
  checkFirestoreHealth
} = require('./models/userUsage');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Development origins
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Production origin from environment variable
    const prodOrigin = process.env.FRONTEND_URL;
    
    // Check if origin is allowed
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? (prodOrigin ? [prodOrigin] : [])
      : devOrigins;
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(express.json());

// Handle CORS preflight requests
app.options('*', (req, res) => {
  res.status(200).end();
});

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
    // Process transformation request
    
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
    // Process image transformation

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

    // Generate content with Google AI
    
    const response = await Promise.race([
      genAI.models.generateContent({
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
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Google AI request timeout')), 60000)
      )
    ]);
    
    // Extract image with better error handling
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }
    
    if (!response.candidates[0].content || !response.candidates[0].content.parts) {
      throw new Error("No content parts returned from Gemini");
    }
    
    // Find the image part (look for the part with inlineData)
    const transformedImage = response.candidates[0].content.parts.find(
      part => part.inlineData
    );
    
    if (!transformedImage || !transformedImage.inlineData) {
      throw new Error("No image data returned from Gemini");
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(transformedImage.inlineData.data, 'base64');
    
    // Record the transformation for usage tracking
    const usageStats = await recordTransformation(req.user.uid, 'image_transform');

    // Send the image directly as binary response
    res.setHeader('Content-Type', transformedImage.inlineData.mimeType || 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    res.setHeader('X-Usage-Stats', JSON.stringify(usageStats));
    
    res.send(imageBuffer);

    // Clean up uploaded file
    try {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
        // File cleaned up
      }
    } catch (cleanupError) {
      console.error("⚠️ Failed to clean up file:", cleanupError.message);
    }

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
    console.log('📊 Fetching user stats');
    const stats = await getUserStats(req.user.uid);
    console.log('✅ User stats retrieved successfully');
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
    console.error('❌ Error getting user stats:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Error getting user stats';
    if (error.message.includes('Firestore not initialized')) {
      errorMessage = 'Firebase configuration error. Please check server logs.';
    } else if (error.message.includes('Failed to retrieve')) {
      errorMessage = 'Unable to retrieve user statistics from database.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
  try {
    const firestoreHealth = await checkFirestoreHealth();
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      services: {
        server: 'healthy',
        firestore: firestoreHealth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
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
