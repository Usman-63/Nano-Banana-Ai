// Firebase Authentication Context
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [onLogoutCallback, setOnLogoutCallback] = useState(null);

  // Sign up function
  async function signup(email, password, displayName) {
    try {
      console.log('🔐 Creating new user account...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
      
      // Send email verification
      await sendEmailVerification(result.user);
      console.log('✅ User account created and verification email sent');
      
      return result;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      console.log('🔐 Signing in user...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in successfully');
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      console.log('🔐 Signing out user...');
      await signOut(auth);
      setUserStats(null);
      
      // Call the logout callback to reset app state
      if (onLogoutCallback) {
        onLogoutCallback();
      }
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  // Reset password function
  async function resetPassword(email) {
    try {
      console.log('🔐 Sending password reset email...');
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  }

  // Get user's ID token
  const getIdToken = useCallback(async () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      const token = await currentUser.getIdToken();
      return token;
    } catch (error) {
      console.error('❌ Error getting ID token:', error);
      throw error;
    }
  }, [currentUser]);

  // Fetch user stats from backend
  const fetchUserStats = useCallback(async (user = currentUser) => {
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('fetchUserStats: No user provided');
      }
      return null;
    }
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('fetchUserStats: Fetching stats for user:', user.email);
      }
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.usage);
        if (process.env.NODE_ENV === 'development') {
          console.log('fetchUserStats: Stats loaded successfully:', data.usage);
        }
        return data.usage;
      } else {
        console.error('Failed to fetch user stats:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }, [currentUser]);

  // Update user stats after transformation
  function updateUserStats(newStats) {
    setUserStats(newStats);
  }

  // Check if user has transformations remaining
  function canTransform() {
    // If user is logged in but stats haven't loaded yet, allow transformation
    // (the backend will enforce limits)
    if (!userStats && currentUser) {
      if (process.env.NODE_ENV === 'development') {
        console.log('canTransform: User logged in but stats not loaded yet, allowing transformation');
      }
      return true;
    }
    if (!userStats) {
      if (process.env.NODE_ENV === 'development') {
        console.log('canTransform: No user stats and no current user, denying transformation');
      }
      return false;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('canTransform: User stats loaded, remaining:', userStats.transformationsRemaining);
    }
    return userStats.transformationsRemaining > 0;
  }

  // Get formatted user info
  function getUserInfo() {
    if (!currentUser) return null;
    
    return {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || currentUser.email,
      emailVerified: currentUser.emailVerified,
      photoURL: currentUser.photoURL
    };
  }

  // Register logout callback
  function registerLogoutCallback(callback) {
    setOnLogoutCallback(() => callback);
  }

  // Check if user's email is verified
  function isEmailVerified() {
    return currentUser && currentUser.emailVerified;
  }

  // Resend email verification
  async function resendEmailVerification() {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('🔐 Resending email verification...');
      await sendEmailVerification(currentUser);
      console.log('✅ Email verification sent');
    } catch (error) {
      console.error('❌ Error resending email verification:', error);
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      }
      setCurrentUser(user);
      
      if (user) {
        // Fetch user stats when user logs in, pass user directly to avoid race condition
        await fetchUserStats(user);
      } else {
        setUserStats(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserStats]);

  const value = {
    currentUser,
    userStats,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    getIdToken,
    fetchUserStats,
    updateUserStats,
    canTransform,
    getUserInfo,
    registerLogoutCallback,
    isEmailVerified,
    resendEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}