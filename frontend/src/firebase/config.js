// Firebase configuration for frontend
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Check for required Firebase API key
if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  console.error('ERROR: Firebase API key is missing!');
  console.error('Please set REACT_APP_FIREBASE_API_KEY environment variable.');
  // In development, show a more visible error
  if (process.env.NODE_ENV === 'development') {
    document.body.innerHTML = `
      <div style="padding: 20px; background-color: #f44336; color: white; font-family: Arial, sans-serif;">
        <h1>Firebase Configuration Error</h1>
        <p>Firebase API key is missing. The application cannot start without proper Firebase credentials.</p>
        <p>Please set the required environment variables in your .env file:</p>
        <pre>REACT_APP_FIREBASE_API_KEY=your-api-key</pre>
        <p>See the documentation for more details.</p>
      </div>
    `;
  }
  throw new Error('Firebase API key is missing. Application cannot start.');
}

// Firebase config object - replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;