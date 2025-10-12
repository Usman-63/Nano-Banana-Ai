# 🍌 Nano Banana Image Editor

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/Firebase-Authentication-orange?logo=firebase" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/Google%20AI-Gemini%202.5-purple?logo=google" alt="Google AI" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</div>

<div align="center">
  <h3>Transform your images with AI-powered artistic styles</h3>
  <p>An intelligent image transformation application built with React, Node.js, and Google's Gemini 2.5 Flash AI model</p>

</div>

---

## ✨ Features

### 🎨 **AI-Powered Image Transformation**
- **Advanced AI Processing**: Powered by Google Gemini 2.5 Flash for superior image quality
- **Multiple Artistic Styles**: Transform images into Anime, Realistic, Cartoon, Oil Painting, Watercolor, and more
- **High-Quality Output**: Professional-grade image transformations with detailed artistic effects
- **Real-time Processing**: Fast and efficient image transformation pipeline

### 🔐 **Secure Authentication System**
- **Firebase Authentication**: Robust user management with email verification
- **Usage Tracking**: Intelligent quota system (6 transformations per user)
- **Session Management**: Secure token-based authentication
- **Password Recovery**: Built-in password reset functionality

### 🎯 **User Experience**
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Live Preview**: Real-time image preview before transformation
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with Tailwind CSS
- **Smart State Management**: Complete app reset on logout
- **Memory Efficient**: Optimized image handling and cleanup


---

## 🆕 Recent Updates

### **Performance Optimizations**
- ✅ **Binary Image Delivery**: Images sent as efficient binary data instead of large JSON responses
- ✅ **Memory Management**: Proper cleanup of object URLs and blob data
- ✅ **Production Ready**: Removed debug logs and optimized for production deployment

### **Enhanced User Experience**
- ✅ **Complete Logout Reset**: All app state resets when users log out
- ✅ **Firestore Integration**: Real-time user data synchronization
- ✅ **Improved Error Handling**: Better user feedback and error management
- ✅ **CORS Optimization**: Seamless frontend-backend communication

### **Technical Improvements**
- ✅ **Google AI Integration**: Updated to use @google/genai package
- ✅ **Security Enhancements**: Removed sensitive data from logs
- ✅ **Code Cleanup**: Production-ready code with proper error handling

---

## 🏗️ Architecture

### **Frontend (React.js)**
- **Framework**: React 18.2.0 with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Context API for global state
- **Authentication**: Firebase Auth integration
- **HTTP Client**: Axios for API communication

### **Backend (Node.js/Express)**
- **Runtime**: Node.js 18+ with Express.js
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Authentication**: Firebase Admin SDK
- **File Handling**: Multer for image uploads
- **CORS**: Configured for production deployment

### **Database & Storage**
- **Authentication**: Firebase Authentication
- **User Data**: Firestore cloud database
- **Usage Tracking**: Firestore with real-time sync
- **File Storage**: Temporary local storage

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google AI API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Usman-63/Nano-Banana-Ai.git
   cd Nano-Banana-Ai
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Or install separately
   npm run install-backend
   npm run install-frontend
   ```

3. **Environment Setup**

   **Backend Configuration** (`backend/.env`):
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   GOOGLE_API_KEY=your-google-api-key
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   NODE_ENV=development
   ```

   **Frontend Configuration** (`frontend/.env`):
   ```env
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

4. **Start Development Servers**
   ```bash
   # Start backend (Terminal 1)
   cd backend && npm start
   
   # Start frontend (Terminal 2)
   cd frontend && npm start
   ```

5. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

---

## 🌐 Deployment

### **Production Deployment**

#### **Backend (Railway)**
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Automatic deployment on code push

#### **Frontend (Vercel)**
1. Connect GitHub repository to Vercel
2. Set build-time environment variables
3. Automatic deployment on code push

#### **Environment Variables for Production**

**Railway (Backend)**:
```
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_API_KEY=your-google-api-key
FIREBASE_SERVICE_ACCOUNT_KEY=your-service-account-json
FRONTEND_URL=https://nano-banana-ai-beige.vercel.app
NODE_ENV=production
PORT=5000
```

**Vercel (Frontend)**:
```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_BACKEND_URL=https://your-railway-app.railway.app
NODE_ENV=production
```

---

## 📚 API Documentation

### **Endpoints**

#### **POST /transform**
Transform an image with AI
- **Authentication**: Required
- **Body**: `multipart/form-data` with `image` file and `style` string
- **Response**: Binary image data with usage stats in headers

#### **GET /user/stats**
Get user usage statistics
- **Authentication**: Required
- **Response**: User transformation count and limits

#### **GET /health**
Health check endpoint
- **Authentication**: None
- **Response**: Server status

#### **GET /auth/test**
Test authentication
- **Authentication**: Required
- **Response**: User information

---

## 🎨 Supported Styles

- **Anime Style**: Transform into beautiful anime art
- **Picasso Style**: Cubist masterpiece transformation
- **Oil Painting Style**: Classic Degas oil painting style
- **Frida Style**: Frida Kahlo artistic style
- **Miniature Effect**: 1/7 scale collectible figure

---

## 🛠️ Development

### **Project Structure**
```
nano-banana-image-editor/
├── backend/                 # Node.js API server
│   ├── firebase/           # Firebase Admin SDK
│   ├── middleware/          # Authentication middleware
│   ├── models/             # User usage tracking
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── firebase/      # Firebase config
│   └── public/            # Static assets
└── README.md              # This file
```

### **Available Scripts**

```bash
# Development
npm start              # Start backend server
npm run dev           # Start backend with nodemon
cd frontend && npm start  # Start React development server

# Building
npm run build         # Build frontend for production
npm run install-all   # Install all dependencies

# Testing
cd frontend && npm test  # Run React tests
```

---

## 🔧 Configuration

### **Firebase Setup**
1. Create a Firebase project
2. Enable Authentication
3. Configure sign-in methods
4. Download service account key
5. Set up authorized domains

### **Google AI Setup**
1. Get API key from Google AI Studio
2. Configure API restrictions
3. Set usage quotas

### **CORS Configuration**
Production CORS is configured for:
- Vercel frontend domains
- Railway backend domains
- Local development

---

## 📊 Usage Limits

- **Free Tier**: 6 transformations per user
- **File Size Limit**: 10MB maximum
- **Supported Formats**: JPEG, PNG, WebP, GIF
- **Rate Limiting**: Built-in usage tracking

---

<div align="center">
  <p>Made with ❤️ by the Nano Banana Team</p>
  <p>🚀 Transform your images with the power of AI</p>
</div>
