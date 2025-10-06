# 🚀 Deployment Guide - Nano Banana Image Editor

## Environment Variables Setup

### Frontend (Vercel)
Set these in your Vercel dashboard under Project Settings > Environment Variables:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=nano-banana-ai-9d003.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=nano-banana-ai-9d003
REACT_APP_FIREBASE_STORAGE_BUCKET=nano-banana-ai-9d003.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Backend URL (Railway)
REACT_APP_BACKEND_URL=https://nano-banana-image-editor-production.up.railway.app
```

### Backend (Railway)
Set these in your Railway dashboard under Variables:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=nano-banana-ai-9d003
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google AI
GOOGLE_API_KEY=your-google-api-key

# Frontend URL (for CORS) - Set this to your actual Vercel URL
FRONTEND_URL=https://your-actual-vercel-url.vercel.app

# Environment
NODE_ENV=production
```

## Common Issues & Solutions

### 1. Usage Stats Not Loading
- **Issue**: Frontend can't reach backend API
- **Solution**: Ensure `REACT_APP_BACKEND_URL` is set correctly in Vercel
- **Check**: Backend logs in Railway dashboard

### 2. CORS Errors
- **Issue**: Backend rejecting frontend requests
- **Solution**: Ensure `FRONTEND_URL` is set in Railway and matches your Vercel URL
- **Check**: Backend CORS configuration in `server.js`

### 3. Firebase Authentication Issues
- **Issue**: Users can't sign in/out
- **Solution**: Verify all Firebase environment variables are set correctly
- **Check**: Firebase console project settings

### 4. Image Transformation Fails
- **Issue**: Google AI API not working
- **Solution**: Ensure `GOOGLE_API_KEY` is set in Railway
- **Check**: Google AI API quota and billing

## Testing Deployment

1. **Check Backend Health**: Visit `https://your-backend-url.railway.app/health`
2. **Check Frontend**: Visit your Vercel URL
3. **Test Authentication**: Try signing in/out
4. **Test Usage Stats**: Check if user stats load after login
5. **Test Image Transform**: Upload and transform an image

## Debugging

### Frontend Console Logs
Look for these debug messages:
- `📊 Fetching user stats for: user@email.com`
- `📊 Making request to: https://backend-url/user/stats`
- `📊 Response status: 200`

### Backend Logs (Railway)
Look for these debug messages:
- `📊 User stats request from: user@email.com`
- `📊 Returning stats: {...}`
- `🔐 Authenticated user: user@email.com`

## URLs
- **Frontend**: https://nano-banana-ai-oefx.vercel.app
- **Backend**: https://nano-banana-image-editor-production.up.railway.app
- **GitHub**: https://github.com/Usman-63/Nano-Banana-Ai
