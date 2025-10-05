# Backend Environment Setup

To fix the "Firebase Admin SDK not configured" error, you need to create a `.env` file in the `backend` directory with the following configuration:

## Step 1: Create .env file

Create a file named `.env` in the `backend` directory with the following content:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id

# Google API Configuration
GOOGLE_API_KEY=your-google-api-key

# Firebase Admin SDK Configuration
# Choose ONE of the following options:

# Option 1: Service Account Key as JSON string (for development)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}

# Option 2: Service Account Key file path (for production)
# GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json

# Server Configuration
PORT=5000
```

## Step 2: Get Firebase Project ID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Copy the Project ID

## Step 3: Get Google API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the API key

## Step 4: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy the entire JSON content and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY`

## Step 5: Test the Setup

After creating the `.env` file with the correct values:

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
🔥 Firebase authentication enabled
📊 User usage tracking active (6 transformations per user)
```

## Troubleshooting

If you still get the Firebase Admin SDK error:

1. Make sure the `.env` file is in the `backend` directory
2. Check that all environment variables are set correctly
3. Verify the Firebase project ID matches your actual project
4. Ensure the service account key JSON is valid
5. Restart the server after making changes
