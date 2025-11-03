// Firebase Admin SDK configuration for backend
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// and either set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// or provide the service account key directly

let firebaseApp;
let initializationError = null;

try {
  // Option 1: Using service account key file path from env variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (fs.existsSync(credsPath)) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      throw new Error(`Service account key file not found at: ${credsPath}`);
    }
  } 
  // Option 2: Using service account key object from env variable (for development/Railway)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      // Fix private key formatting for Railway/environment variables
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
      });
      console.log('✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_KEY');
    } catch (parseError) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError.message}`);
    }
  }
  // Option 3: Try to find service account key file in backend directory
  else {
    const possibleKeyFiles = [
      path.join(__dirname, '..', 'nano-banana-ai-7cd2f-firebase-adminsdk-fbsvc-1a0dfc254d.json'),
      path.join(__dirname, '..', 'serviceAccountKey.json'),
      path.join(__dirname, '..', 'firebase-adminsdk.json')
    ];
    
    let foundKeyFile = null;
    for (const keyFile of possibleKeyFiles) {
      if (fs.existsSync(keyFile)) {
        foundKeyFile = keyFile;
        break;
      }
    }
    
    if (foundKeyFile) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(foundKeyFile),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log(`✅ Firebase Admin SDK initialized using service account key file: ${path.basename(foundKeyFile)}`);
    } else {
      throw new Error('No Firebase credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_KEY, or place a service account key file in the backend directory.');
    }
  }
} catch (error) {
  initializationError = error;
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.error('   Please check your Firebase configuration in .env file');
  firebaseApp = null;
}

// Get Firebase Auth and Firestore instances
const auth = firebaseApp ? admin.auth() : null;
const db = firebaseApp ? admin.firestore() : null;

// Verify Firebase ID token
async function verifyIdToken(idToken) {
  if (!auth) {
    const errorMsg = initializationError 
      ? `Firebase Admin SDK not initialized: ${initializationError.message}`
      : 'Firebase Admin SDK not initialized';
    throw new Error(errorMsg);
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid token');
  }
}

// Get user by UID
async function getUserByUid(uid) {
  if (!auth) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('User not found');
  }
}

module.exports = {
  admin,
  auth,
  db,
  verifyIdToken,
  getUserByUid
};