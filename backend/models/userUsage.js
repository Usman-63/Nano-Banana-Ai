// User usage tracking system
const fs = require('fs').promises;
const path = require('path');

// Simple file-based storage for user usage data
// In production, you'd want to use a proper database
const USAGE_FILE = path.join(__dirname, '../data/userUsage.json');
const MAX_TRANSFORMATIONS = 6; // Each user gets 6 transformations

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(USAGE_FILE);
  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load usage data from file
async function loadUsageData() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(USAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty object
    return {};
  }
}

// Save usage data to file
async function saveUsageData(data) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving usage data:', error);
    throw new Error('Failed to save usage data');
  }
}

// Get user's current usage
async function getUserUsage(uid) {
  const usageData = await loadUsageData();
  const userUsage = usageData[uid] || {
    transformations: 0,
    lastReset: new Date().toISOString(),
    history: []
  };
  
  return userUsage;
}

// Check if user can perform transformation
async function canUserTransform(uid) {
  const usage = await getUserUsage(uid);
  return usage.transformations < MAX_TRANSFORMATIONS;
}

// Record a transformation for user
async function recordTransformation(uid, transformationType = 'image_transform') {
  const usageData = await loadUsageData();
  
  if (!usageData[uid]) {
    usageData[uid] = {
      transformations: 0,
      lastReset: new Date().toISOString(),
      history: []
    };
  }

  // Check if user has exceeded limit
  if (usageData[uid].transformations >= MAX_TRANSFORMATIONS) {
    throw new Error(`Transformation limit exceeded. You have used ${usageData[uid].transformations}/${MAX_TRANSFORMATIONS} transformations.`);
  }

  // Record the transformation
  usageData[uid].transformations += 1;
  usageData[uid].history.push({
    type: transformationType,
    timestamp: new Date().toISOString(),
    count: usageData[uid].transformations
  });

  // Keep only last 50 history entries
  if (usageData[uid].history.length > 50) {
    usageData[uid].history = usageData[uid].history.slice(-50);
  }

  await saveUsageData(usageData);
  
  console.log(`📊 User ${uid} used transformation ${usageData[uid].transformations}/${MAX_TRANSFORMATIONS}`);
  
  return {
    transformationsUsed: usageData[uid].transformations,
    transformationsRemaining: MAX_TRANSFORMATIONS - usageData[uid].transformations,
    maxTransformations: MAX_TRANSFORMATIONS
  };
}

// Get user's usage statistics
async function getUserStats(uid) {
  const usage = await getUserUsage(uid);
  return {
    transformationsUsed: usage.transformations,
    transformationsRemaining: MAX_TRANSFORMATIONS - usage.transformations,
    maxTransformations: MAX_TRANSFORMATIONS,
    lastReset: usage.lastReset,
    recentHistory: usage.history.slice(-10) // Last 10 transformations
  };
}

// Reset user's usage (admin function)
async function resetUserUsage(uid) {
  const usageData = await loadUsageData();
  
  if (usageData[uid]) {
    usageData[uid] = {
      transformations: 0,
      lastReset: new Date().toISOString(),
      history: usageData[uid].history || []
    };
    
    await saveUsageData(usageData);
    console.log(`🔄 Reset usage for user ${uid}`);
  }
  
  return await getUserStats(uid);
}

// Get all users' usage (admin function)
async function getAllUsersUsage() {
  const usageData = await loadUsageData();
  const summary = {};
  
  for (const [uid, usage] of Object.entries(usageData)) {
    summary[uid] = {
      transformationsUsed: usage.transformations,
      transformationsRemaining: MAX_TRANSFORMATIONS - usage.transformations,
      maxTransformations: MAX_TRANSFORMATIONS,
      lastReset: usage.lastReset
    };
  }
  
  return summary;
}

module.exports = {
  getUserUsage,
  canUserTransform,
  recordTransformation,
  getUserStats,
  resetUserUsage,
  getAllUsersUsage,
  MAX_TRANSFORMATIONS
};