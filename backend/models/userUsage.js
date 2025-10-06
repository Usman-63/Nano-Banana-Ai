// User usage tracking system using Firestore
const { db } = require('../firebase/admin');

const MAX_TRANSFORMATIONS = 6; // Each user gets 6 transformations
const COLLECTION_NAME = 'userUsage';

// Check if Firestore is available
function checkFirestore() {
  if (!db) {
    throw new Error('Firestore not initialized. Please check Firebase configuration.');
  }
}

// Get user's current usage from Firestore
async function getUserUsage(uid) {
  checkFirestore();
  
  try {
    const userDoc = await db.collection(COLLECTION_NAME).doc(uid).get();
    
    if (userDoc.exists) {
      const data = userDoc.data();
      return {
        transformations: data.transformations || 0,
        lastReset: data.lastReset || new Date().toISOString(),
        history: data.history || []
      };
    } else {
      // Create new user document with default values
      const defaultData = {
        transformations: 0,
        lastReset: new Date().toISOString(),
        history: []
      };
      
      await db.collection(COLLECTION_NAME).doc(uid).set(defaultData);
      console.log(`📊 Created new user document`);
      
      return defaultData;
    }
  } catch (error) {
    console.error('Error getting user usage from Firestore:', error);
    throw new Error('Failed to retrieve user usage data');
  }
}

// Check if user can perform transformation
async function canUserTransform(uid) {
  try {
    const usage = await getUserUsage(uid);
    return usage.transformations < MAX_TRANSFORMATIONS;
  } catch (error) {
    console.error('Error checking user transformation limit:', error);
    return false; // Fail safe - don't allow transformation if we can't check
  }
}

// Record a transformation for user
async function recordTransformation(uid, transformationType = 'image_transform') {
  checkFirestore();
  
  try {
    const userRef = db.collection(COLLECTION_NAME).doc(uid);
    
    // Use Firestore transaction to ensure atomicity
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      let userData;
      if (userDoc.exists) {
        userData = userDoc.data();
      } else {
        // Create new user document
        userData = {
          transformations: 0,
          lastReset: new Date().toISOString(),
          history: []
        };
      }
      
      // Check if user has exceeded limit
      if (userData.transformations >= MAX_TRANSFORMATIONS) {
        throw new Error(`Transformation limit exceeded. You have used ${userData.transformations}/${MAX_TRANSFORMATIONS} transformations.`);
      }
      
      // Record the transformation
      userData.transformations += 1;
      userData.history.push({
        type: transformationType,
        timestamp: new Date().toISOString(),
        count: userData.transformations
      });
      
      // Keep only last 50 history entries
      if (userData.history.length > 50) {
        userData.history = userData.history.slice(-50);
      }
      
      // Update the document
      transaction.set(userRef, userData);
      
      return {
        transformationsUsed: userData.transformations,
        transformationsRemaining: MAX_TRANSFORMATIONS - userData.transformations,
        maxTransformations: MAX_TRANSFORMATIONS
      };
    });
    
    console.log(`📊 User used transformation ${result.transformationsUsed}/${MAX_TRANSFORMATIONS}`);
    return result;
    
  } catch (error) {
    console.error('Error recording transformation in Firestore:', error);
    throw error;
  }
}

// Get user's usage statistics
async function getUserStats(uid) {
  try {
    const usage = await getUserUsage(uid);
    return {
      transformationsUsed: usage.transformations,
      transformationsRemaining: MAX_TRANSFORMATIONS - usage.transformations,
      maxTransformations: MAX_TRANSFORMATIONS,
      lastReset: usage.lastReset,
      recentHistory: usage.history.slice(-10) // Last 10 transformations
    };
  } catch (error) {
    console.error('Error getting user stats from Firestore:', error);
    throw new Error('Failed to retrieve user statistics');
  }
}

// Reset user's usage (admin function)
async function resetUserUsage(uid) {
  checkFirestore();
  
  try {
    const userRef = db.collection(COLLECTION_NAME).doc(uid);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const resetData = {
          transformations: 0,
          lastReset: new Date().toISOString(),
          history: userData.history || [] // Keep history but reset count
        };
        
        transaction.set(userRef, resetData);
      } else {
        // Create new user document
        const newData = {
          transformations: 0,
          lastReset: new Date().toISOString(),
          history: []
        };
        
        transaction.set(userRef, newData);
      }
    });
    
    console.log(`🔄 Reset usage for user`);
    return await getUserStats(uid);
    
  } catch (error) {
    console.error('Error resetting user usage in Firestore:', error);
    throw new Error('Failed to reset user usage');
  }
}

// Get all users' usage (admin function)
async function getAllUsersUsage() {
  checkFirestore();
  
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const summary = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      summary[doc.id] = {
        transformationsUsed: data.transformations || 0,
        transformationsRemaining: MAX_TRANSFORMATIONS - (data.transformations || 0),
        maxTransformations: MAX_TRANSFORMATIONS,
        lastReset: data.lastReset || new Date().toISOString()
      };
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting all users usage from Firestore:', error);
    throw new Error('Failed to retrieve all users usage data');
  }
}

// Health check for Firestore connection
async function checkFirestoreHealth() {
  try {
    checkFirestore();
    
    // Try to read from a test document
    const testRef = db.collection('_health').doc('test');
    await testRef.get();
    
    return {
      status: 'healthy',
      message: 'Firestore connection is working',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Firestore connection failed: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  getUserUsage,
  canUserTransform,
  recordTransformation,
  getUserStats,
  resetUserUsage,
  getAllUsersUsage,
  checkFirestoreHealth,
  MAX_TRANSFORMATIONS
};