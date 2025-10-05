# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for the Nano Banana Image Editor with usage limits (6 transformations per user).

## Prerequisites

1. A Google account
2. Node.js installed on your system
3. Firebase CLI (optional but recommended)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "nano-banana-image-editor")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Get Firebase Configuration

### For Frontend (React App)

1. In the Firebase console, click on the gear icon (Project settings)
2. Scroll down to "Your apps" section
3. Click on the web icon (`</>`) to add a web app
4. Enter an app nickname (e.g., "nano-banana-frontend")
5. Click "Register app"
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

7. Update `frontend/.env` with these values:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### For Backend (Node.js Server)

1. In the Firebase console, go to Project settings
2. Click on the "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file and save it securely
5. Update `backend/.env` with your project ID:

```env
FIREBASE_PROJECT_ID=your-project-id
```

6. Choose one of these options for authentication:

**Option A: Service Account Key File (Recommended for Production)**
```env
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./path/to/serviceAccountKey.json
```

**Option B: Service Account Key as Environment Variable (Development)**
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

**Option C: Application Default Credentials (Development)**
- Install Firebase CLI: `npm install -g firebase-tools`
- Login: `firebase login`
- No additional environment variables needed

## Step 4: Configure Firebase Rules (Optional)

For additional security, you can set up Firestore security rules if you plan to use Firestore for user data storage in the future.

## Step 5: Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`
4. Try registering a new user account
5. Test the image transformation feature
6. Check that usage limits are enforced (6 transformations per user)

## Usage Limits

- Each user is limited to 6 image transformations
- Usage is tracked per user account
- The limit resets can be implemented based on your business requirements
- Usage statistics are displayed in the user profile

## Troubleshooting

### Common Issues

1. **"Firebase project not found"**
   - Check that `FIREBASE_PROJECT_ID` matches your actual project ID
   - Ensure the service account has the correct permissions

2. **"Authentication failed"**
   - Verify that Email/Password authentication is enabled in Firebase Console
   - Check that the frontend Firebase configuration is correct

3. **"Permission denied"**
   - Ensure the service account key has the necessary permissions
   - Check that the Firebase Admin SDK is properly initialized

4. **"CORS errors"**
   - Make sure your frontend URL is added to Firebase's authorized domains
   - Check that the backend server is running on the correct port

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Check the backend server logs
3. Verify all environment variables are set correctly
4. Ensure Firebase services are properly enabled in the console

## Security Notes

- Never commit your service account key files to version control
- Use environment variables for all sensitive configuration
- Consider implementing additional security measures for production use
- Regularly rotate your service account keys