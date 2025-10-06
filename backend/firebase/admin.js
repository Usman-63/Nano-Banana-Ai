// Firebase Admin SDK configuration for backend
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download the service account key from Firebase Console
// and either set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// or provide the service account key directly

let firebaseApp;

try {
  // Option 1: Using service account key file (recommended for production)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } 
  // Option 2: Using service account key object (for development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    // Fix private key formatting for Railway
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
  // Option 3: Development fallback
  else {
    console.warn('Firebase Admin SDK not properly configured. Please set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY');
    firebaseApp = null;
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  firebaseApp = null;
}

// Get Firebase Auth and Firestore instances
const auth = firebaseApp ? admin.auth() : null;
const db = firebaseApp ? admin.firestore() : null;

// Verify Firebase ID token
async function verifyIdToken(idToken) {
  if (!auth) {
    throw new Error('Firebase Admin SDK not initialized');
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