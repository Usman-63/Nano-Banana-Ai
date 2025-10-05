import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function EmailVerification({ onClose }) {
  const { currentUser, resendEmailVerification, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    try {
      setError('');
      setLoading(true);
      await resendEmailVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('❌ Failed to resend verification email:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          {/* Email Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{currentUser.email}</strong>
          </p>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the verification link in the email</li>
              <li>3. Return to this app and refresh the page</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-4">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;
