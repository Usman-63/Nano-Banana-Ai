# 🍌 Nano Banana Image Editor

An AI-powered image transformation application built with React, Node.js, and Firebase.

## Features

- 🎨 AI-powered image style transformation using Google Gemini 2.0 Flash
- 🔐 Firebase Authentication with email verification
- 📊 User usage tracking and limits
- 🎯 Multiple artistic styles (Anime, Realistic, Cartoon, etc.)
- 📱 Responsive design with modern UI
- 🚀 Real-time image processing

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Firebase Authentication
- Axios for API calls

### Backend
- Node.js/Express
- Firebase Admin SDK
- Google Generative AI
- Multer for file uploads

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase project
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nano-banana-image-editor
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Firebase and Google API credentials
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your Firebase config
   npm start
   ```

## Deployment

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set build-time environment variables
3. Deploy automatically

## Environment Variables

### Backend (.env)
```
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_API_KEY=your-google-api-key
FIREBASE_SERVICE_ACCOUNT_KEY=your-service-account-json
```

### Frontend (.env)
```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
```

## API Endpoints

- `POST /transform` - Transform image with AI
- `GET /user/stats` - Get user usage statistics
- `GET /health` - Health check
- `GET /auth/test` - Test authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
