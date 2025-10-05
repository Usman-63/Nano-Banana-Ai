// User Profile Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function UserProfile({ onClose }) {
  const { currentUser, userStats, logout, fetchUserStats } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Refresh stats when component mounts
    if (currentUser) {
      fetchUserStats();
    }
  }, [currentUser, fetchUserStats]);

  async function handleLogout() {
    try {
      setLoading(true);
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshStats() {
    setLoading(true);
    await fetchUserStats();
    setLoading(false);
  }

  if (!currentUser) {
    return null;
  }

  const userInfo = {
    displayName: currentUser.displayName || 'User',
    email: currentUser.email
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userInfo.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{userInfo.displayName}</h3>
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            </div>
          </div>
          
        </div>

        {/* Usage Stats */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-gray-900">Usage Statistics</h4>
            <button
              onClick={handleRefreshStats}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {userStats ? (
            <div className="space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Transformations Used</span>
                  <span>{userStats.transformationsUsed} / {userStats.maxTransformations}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      userStats.transformationsRemaining > 2 ? 'bg-green-500' :
                      userStats.transformationsRemaining > 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${(userStats.transformationsUsed / userStats.maxTransformations) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.transformationsRemaining}
                  </div>
                  <div className="text-sm text-green-800">Remaining</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats.transformationsUsed}
                  </div>
                  <div className="text-sm text-blue-800">Used</div>
                </div>
              </div>

              {/* Warning if low on transformations */}
              {userStats.transformationsRemaining <= 2 && userStats.transformationsRemaining > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You have {userStats.transformationsRemaining} transformation{userStats.transformationsRemaining === 1 ? '' : 's'} remaining.
                  </p>
                </div>
              )}

              {/* No transformations left */}
              {userStats.transformationsRemaining === 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    🚫 You've used all your transformations. Your limit will reset soon.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading stats...</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;