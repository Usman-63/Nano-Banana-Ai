#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Nano Banana Image Editor - Backend Environment Setup\n');

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to recreate it, delete the existing .env file first.\n');
  process.exit(0);
}

// Create .env template
const envTemplate = `# Firebase Configuration
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
`;

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file template');
  console.log('📝 Please edit backend/.env with your actual values:');
  console.log('   1. FIREBASE_PROJECT_ID - Your Firebase project ID');
  console.log('   2. GOOGLE_API_KEY - Your Google AI API key');
  console.log('   3. FIREBASE_SERVICE_ACCOUNT_KEY - Your Firebase service account JSON');
  console.log('\n📖 See ../FIREBASE_SETUP.md for detailed instructions');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}
