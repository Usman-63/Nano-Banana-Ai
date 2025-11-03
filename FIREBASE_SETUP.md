# Firebase Setup Guide

This guide will help you set up Firebase authentication and Firestore database for the Nano Banana Image Editor with usage limits (6 transformations per user).

> **Important**: The backend server will not start without proper Firebase credentials. You must configure either `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_KEY` environment variables.

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

## Step 3: Enable Firestore Database

> **Important**: Firestore is required for user usage tracking. The application needs it to store and retrieve user transformation counts. The backend server will not work without it.

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose your security rules:
   - **Production mode**: Start in production mode (recommended for production deployments)
   - **Test mode**: Start in test mode (only for development - allows read/write for 30 days)
4. Select a location for your database:
   - Choose the location closest to your users for better performance
   - This cannot be changed later, so choose carefully
5. Click "Enable"
6. Wait for Firestore to finish initializing (this usually takes a few minutes)

**Note**: Firestore needs to be enabled before the backend server can store user usage data. Without it, user stats will not load.

## Step 4: Get Firebase Configuration for Frontend

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

7. Create a `.env` file in the `frontend` directory and add these values:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Step 5: Get Firebase Project ID and Service Account Key

1. In the Firebase console, go to Project settings
2. Note your Project ID (you'll need this for the backend)
3. Click on the "Service accounts" tab
4. Click "Generate new private key"
5. Download the JSON file and save it securely
6. Ensure your service account has Firestore permissions:
   - The service account should have "Cloud Datastore User" role
   - This is usually set by default when generating the key

## Step 6: Get Google API Key

> **Required for backend**: The backend needs a Google API key to use the Gemini AI model for image transformations.

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the API key (you'll add this to your backend `.env` file)

## Step 7: Set Up Backend Environment Variables

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id

# Google API Configuration
GOOGLE_API_KEY=your-google-api-key

# Firebase Admin SDK Configuration
# Choose ONE of the following options:

# Option 1: Service Account Key as JSON string (for development/Railway)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}

# Option 2: Service Account Key file path (for production)
# GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json

# Server Configuration
PORT=5000

# Frontend URL for CORS (set this to your frontend URL)
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Backend Environment Variables Explained

1. **FIREBASE_PROJECT_ID**: Your Firebase project ID (from Step 5)
2. **GOOGLE_API_KEY**: Your Google AI API key (from Step 6)
3. **FIREBASE_SERVICE_ACCOUNT_KEY**: Choose ONE of these methods:

   **Option A: Service Account Key as JSON String (Recommended for Railway/Development)**
   - Open the service account key JSON file you downloaded in Step 5
   - Copy the entire JSON content
   - Paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` (keep it as a single line or properly escape it)
   - Fix private key formatting if needed (replace `\\n` with actual newlines)

   **Option B: Service Account Key File Path (Recommended for Production)**
   - Place the service account key JSON file in your backend directory
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the file
   - Example: `GOOGLE_APPLICATION_CREDENTIALS=./nano-banana-ai-7cd2f-firebase-adminsdk-fbsvc-1a0dfc254d.json`

   **Option C: Application Default Credentials (Development Only)**
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login: `firebase login`
   - No additional environment variables needed

4. **PORT**: The port your backend server runs on (default: 5000)
5. **FRONTEND_URL**: Your frontend URL for CORS configuration
6. **NODE_ENV**: Set to `production` for production deployments

## Step 8: Configure Firestore Security Rules (Optional)

For additional security, you can customize Firestore security rules. The backend uses the Admin SDK which bypasses security rules, but you can still set rules for direct client access if needed.

1. Go to Firestore Database in Firebase Console
2. Click on the "Rules" tab
3. Customize the rules as needed

**Note**: Since the backend uses Admin SDK, the service account key has elevated permissions and bypasses security rules. This is expected behavior for server-side operations.

## Step 9: Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

   If properly configured, you should see:
   ```
   ✅ Firebase Admin SDK initialized using...
   Server running on port 5000
   🔥 Firebase authentication enabled
   📊 User usage tracking active (6 transformations per user)
   ```

   If Firebase credentials are missing, the server will exit with an error:
   ```
   ❌ ERROR: Firebase Admin SDK not properly initialized.
   Please check your Firebase configuration in .env file
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

1. **"Firebase Admin SDK not properly initialized"**
   - Make sure the `.env` file is in the `backend` directory
   - Check that all environment variables are set correctly
   - Verify the Firebase project ID matches your actual project
   - Ensure the service account key JSON is valid
   - Verify that Firestore Database is enabled in your Firebase Console
   - Check that your service account has Firestore permissions
   - Restart the server after making changes

2. **"Firebase project not found"**
   - Check that `FIREBASE_PROJECT_ID` matches your actual project ID
   - Ensure the service account has the correct permissions

3. **"Firestore not initialized" error**
   - Make sure Firestore Database is enabled in Firebase Console
   - Verify that your service account key has Firestore access permissions
   - Check that `FIREBASE_PROJECT_ID` matches your Firebase project
   - Ensure the service account has the "Cloud Datastore User" role

4. **"Permission denied" when accessing Firestore**
   - Ensure your service account has the "Cloud Datastore User" role
   - Check Firestore security rules if you're using them

5. **"Authentication failed"**
   - Verify that Email/Password authentication is enabled in Firebase Console
   - Check that the frontend Firebase configuration is correct

6. **"User stats not loading"**
   - Verify that Firestore Database is enabled (not just Firebase Auth)
   - Check backend server logs for Firestore connection errors
   - Ensure service account key has Firestore permissions
   - Make sure the backend `.env` file is properly configured

7. **"CORS errors"**
   - Make sure your frontend URL is added to Firebase's authorized domains
   - Check that the backend server is running on the correct port
   - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

8. **Backend server exits on startup**
   - Check that `FIREBASE_PROJECT_ID` is set in `.env`
   - Verify that either `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_KEY` is set
   - Ensure Firestore Database is enabled in Firebase Console
   - Check server logs for specific error messages

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Check the backend server logs for detailed error information
3. Verify all environment variables are set correctly in both frontend and backend `.env` files
4. Ensure Firebase services (Authentication and Firestore) are properly enabled in the console
5. Verify that your service account key has the correct permissions

## Security Notes

- Never commit your service account key files or `.env` files to version control
- Add `.env` to your `.gitignore` file
- Use environment variables for all sensitive configuration
- Consider implementing additional security measures for production use
- Regularly rotate your service account keys
- Keep your Google API key secure and don't expose it in client-side code
