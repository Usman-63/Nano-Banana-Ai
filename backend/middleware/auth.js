// Authentication middleware for Firebase
const { verifyIdToken } = require('../firebase/admin');

// Middleware to verify Firebase ID token
async function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || decodedToken.email
    };

    console.log(`🔐 User authenticated successfully`);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
}

// Middleware to check if user is authenticated (optional auth)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name || decodedToken.email
      };
      console.log(`🔐 Optional auth - user authenticated`);
    } else {
      req.user = null;
      console.log('🔓 Optional auth - no user');
    }
    
    next();
  } catch (error) {
    // For optional auth, continue without user if token is invalid
    req.user = null;
    console.log('🔓 Optional auth - invalid token, continuing without user');
    next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuth
};