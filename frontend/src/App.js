import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ImageUpload from './components/ImageUpload';
import StyleSelector from './components/StyleSelector';
import Preview from './components/Preview';
import Loader from './components/Loader';
import ErrorBanner, { ErrorTypes } from './components/ErrorBanner';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';

function AppContent() {
  const { currentUser, getIdToken, userStats, canTransform, fetchUserStats } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('Anime Style');
  const [transformedImage, setTransformedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // App component state monitoring (debug mode only)
  if (process.env.NODE_ENV === 'development') {
    console.log('App: Component rendered with state -', {
      hasFile: !!selectedFile,
      hasPreview: !!previewUrl,
      selectedStyle,
      hasTransformed: !!transformedImage,
      isLoading,
      hasError: !!error
    });
  }

  const handleFileSelect = (file) => {
    
    if (file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        console.error('App: File too large -', file.size, 'bytes');
        setError(ErrorTypes.FILE_TOO_LARGE);
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('App: Invalid file type -', file.type);
        setError(ErrorTypes.INVALID_FILE_TYPE);
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setTransformedImage(null);
      setError(null);
    }
  };

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
  };

  const handleErrorDismiss = () => {
    setError(null);
  };

  const handleTransform = async () => {
    
    if (!currentUser) {
      console.error('App: User not authenticated');
      setShowLogin(true);
      return;
    }

    if (!selectedFile) {
      console.error('App: No file selected for transformation');
      setError(ErrorTypes.NO_IMAGE_SELECTED);
      return;
    }

    // Check usage limits
    if (!canTransform()) {
      console.error('App: User has exceeded transformation limit');
      setError('You have reached your transformation limit. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const idToken = await getIdToken();
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);

      const response = await fetch('http://localhost:5000/transform', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData,
      });


      if (!response.ok) {
        if (response.status === 401) {
          console.error('App: Authentication error from API');
          setShowLogin(true);
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 429) {
          console.error('App: Usage limit exceeded from API');
          const errorData = await response.json();
          throw new Error(errorData.message || 'You have reached your transformation limit.');
        } else if (response.status === 413) {
          console.error('App: File too large error from API');
          throw new Error(ErrorTypes.FILE_TOO_LARGE);
        } else if (response.status >= 500) {
          console.error('App: Server error from API');
          throw new Error(ErrorTypes.API_ERROR);
        } else {
          console.error('App: Network error from API');
          throw new Error(ErrorTypes.NETWORK_ERROR);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('App: Transformation failed -', data.message);
        throw new Error(data.message || ErrorTypes.TRANSFORMATION_FAILED);
      }

      setTransformedImage(data.transformedImage);
      
      // Update user stats after successful transformation
      await fetchUserStats();
    } catch (err) {
      console.error('App: Error transforming image -', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.error('App: Network connection error');
        setError(ErrorTypes.NETWORK_ERROR);
      } else {
        console.error('App: Setting error state -', err.message);
        setError(err.message || ErrorTypes.UNKNOWN_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative flex items-center justify-center">
            {/* Centered Title */}
            <div className="text-center px-4 sm:px-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                🍌 Nano Banana Image Editor
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-indigo-100">
                Transform your images with AI-powered artistic styles
              </p>
            </div>
            
            {/* Auth Section - Positioned absolutely to the right */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 sm:space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {/* Usage Stats */}
                  {userStats && (
                    <div className="text-sm text-indigo-100">
                      <span className={`font-medium ${
                        userStats.transformationsRemaining > 2 ? 'text-green-300' :
                        userStats.transformationsRemaining > 0 ? 'text-yellow-300' : 'text-red-300'
                      }`}>
                        {userStats.transformationsRemaining} / {userStats.maxTransformations}
                      </span>
                      <span className="ml-1">left</span>
                    </div>
                  )}
                  
                  {/* User Avatar */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors backdrop-blur-sm"
                  >
                    <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {currentUser.displayName || 'User'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-white hover:text-indigo-200 font-medium transition-colors border border-white/30 rounded-lg hover:bg-white/10"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Style Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ImageUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
              />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <StyleSelector
                selectedStyle={selectedStyle}
                onStyleChange={handleStyleChange}
              />
            </div>

            {/* Transform Button */}
      
          </div>

          {/* Right Column - Preview & Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {isLoading && (
                <div className="mb-6">
                  <Loader 
                    type="image-processing" 
                    message="AI is analyzing and transforming your image..."
                  />
                </div>
              )}
              
              <Preview
                originalImage={previewUrl}
                transformedImage={transformedImage}
                isLoading={isLoading}
              />
            </div>
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl p-6 mt-6 w-[70%] mx-auto" >
              <button
                onClick={() => {
                  handleTransform();
                }}
                disabled={!selectedFile || !selectedStyle || isLoading || (currentUser && !canTransform())}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform
                  ${!selectedFile || !selectedStyle || isLoading || (currentUser && !canTransform())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-white to-indigo-50 text-indigo-600 hover:from-indigo-50 hover:to-white hover:scale-105 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Loader type="spinner" size="small" />
                    <span className="ml-2">Transforming...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Transform Image
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mt-6">
            <ErrorBanner
              error={error}
              type="error"
              onDismiss={handleErrorDismiss}
              dismissible={true}
            />
          </div>
        )}
      </div>

      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;