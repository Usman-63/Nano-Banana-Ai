// Firebase Authentication Context
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
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
      
      console.log('✅ User account created successfully');
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
  const fetchUserStats = useCallback(async () => {
    if (!currentUser) {
      console.log('🔐 No current user, skipping stats fetch');
      return null;
    }
    
    try {
      console.log('📊 Fetching user stats for:', currentUser.email);
      const token = await getIdToken();
      const url = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/user/stats`;
      console.log('📊 Making request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 User stats received:', data.usage);
        setUserStats(data.usage);
        return data.usage;
      } else {
        const errorText = await response.text();
        console.error('📊 Failed to fetch user stats:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('📊 Error fetching user stats:', error);
      return null;
    }
  }, [currentUser, getIdToken]);

  // Update user stats after transformation
  function updateUserStats(newStats) {
    setUserStats(newStats);
  }

  // Check if user has transformations remaining
  function canTransform() {
    if (!currentUser) return false;
    if (!userStats) return true; // Allow transformation while loading stats
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

  // Listen for auth state changes
  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);
      
      if (user) {
        // Fetch user stats when user logs in
        await fetchUserStats();
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
    getUserInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}