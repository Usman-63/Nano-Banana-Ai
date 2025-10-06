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

  // Debug comment: App component state monitoring
  console.log('App: Component rendered with state -', {
    hasFile: !!selectedFile,
    hasPreview: !!previewUrl,
    selectedStyle,
    hasTransformed: !!transformedImage,
    isLoading,
    hasError: !!error
  });

  const handleFileSelect = (file) => {
    console.log('App: File selection triggered -', file?.name); // Debug comment: File selection event
    
    if (file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        console.error('App: File too large -', file.size, 'bytes'); // Debug comment: File size validation error
        setError(ErrorTypes.FILE_TOO_LARGE);
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('App: Invalid file type -', file.type); // Debug comment: File type validation error
        setError(ErrorTypes.INVALID_FILE_TYPE);
        return;
      }
      
      console.log('App: File validation successful, setting up preview'); // Debug comment: File validation success
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setTransformedImage(null);
      setError(null);
    }
  };

  const handleStyleChange = (style) => {
    console.log('App: Style change triggered -', style); // Debug comment: Style change event
    setSelectedStyle(style);
  };

  const handleErrorDismiss = () => {
    console.log('App: Error dismissed'); // Debug comment: Error dismiss event
    setError(null);
  };

  const handleTransform = async () => {
    console.log('App: Transform initiated -', { file: selectedFile?.name, style: selectedStyle }); // Debug comment: Transform start event
    
    if (!currentUser) {
      console.error('App: User not authenticated'); // Debug comment: Auth validation error
      setShowLogin(true);
      return;
    }

    if (!selectedFile) {
      console.error('App: No file selected for transformation'); // Debug comment: Transform validation error
      setError(ErrorTypes.NO_IMAGE_SELECTED);
      return;
    }

    // Check usage limits
    if (!canTransform()) {
      console.error('App: User has exceeded transformation limit'); // Debug comment: Usage limit error
      setError('You have reached your transformation limit. Please try again later.');
      return;
    }

    console.log('App: Starting transformation process'); // Debug comment: Transform process start
    setIsLoading(true);
    setError(null);

    try {
      console.log('App: Getting authentication token'); // Debug comment: Auth token retrieval
      const idToken = await getIdToken();
      
      console.log('App: Preparing API request'); // Debug comment: API request preparation
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);

      console.log('App: Sending API request to transform endpoint'); // Debug comment: API request sent
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/transform`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData,
      });

      console.log('App: API response received -', response.status); // Debug comment: API response received

      if (!response.ok) {
        if (response.status === 401) {
          console.error('App: Authentication error from API'); // Debug comment: API auth error
          setShowLogin(true);
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 429) {
          console.error('App: Usage limit exceeded from API'); // Debug comment: API usage limit error
          const errorData = await response.json();
          throw new Error(errorData.message || 'You have reached your transformation limit.');
        } else if (response.status === 413) {
          console.error('App: File too large error from API'); // Debug comment: API file size error
          throw new Error(ErrorTypes.FILE_TOO_LARGE);
        } else if (response.status >= 500) {
          console.error('App: Server error from API'); // Debug comment: API server error
          throw new Error(ErrorTypes.API_ERROR);
        } else {
          console.error('App: Network error from API'); // Debug comment: API network error
          throw new Error(ErrorTypes.NETWORK_ERROR);
        }
      }

      const data = await response.json();
      console.log('App: API response data processed'); // Debug comment: API data processing
      
      if (!data.success) {
        console.error('App: Transformation failed -', data.message); // Debug comment: Transformation failure
        throw new Error(data.message || ErrorTypes.TRANSFORMATION_FAILED);
      }

      console.log('App: Transformation successful, setting result'); // Debug comment: Transformation success
      setTransformedImage(data.transformedImage);
      
      // Update user stats after successful transformation
      await fetchUserStats();
    } catch (err) {
      console.error('App: Error transforming image -', err); // Debug comment: Transform error caught
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.error('App: Network connection error'); // Debug comment: Network connection error
        setError(ErrorTypes.NETWORK_ERROR);
      } else {
        console.error('App: Setting error state -', err.message); // Debug comment: Error state setting
        setError(err.message || ErrorTypes.UNKNOWN_ERROR);
      }
    } finally {
      console.log('App: Transform process completed, stopping loading'); // Debug comment: Transform process end
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🍌 Nano Banana Image Editor
              </h1>
              <p className="text-lg text-gray-700">
                Transform your images with AI-powered artistic styles
              </p>
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {/* Usage Stats */}
                  {userStats && (
                    <div className="text-sm text-gray-600">
                      <span className={`font-medium ${
                        userStats.transformationsRemaining > 2 ? 'text-emerald-600' :
                        userStats.transformationsRemaining > 0 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {userStats.transformationsRemaining} / {userStats.maxTransformations}
                      </span>
                      <span className="ml-1">left</span>
                    </div>
                  )}
                  
                  {/* User Avatar */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser.displayName || 'User'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <ImageUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <StyleSelector
                selectedStyle={selectedStyle}
                onStyleChange={handleStyleChange}
              />
            </div>

            {/* Transform Button */}
      
          </div>

          {/* Right Column - Preview & Results */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
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
                  <div className="bg-white rounded-xl shadow-lg p-6 mt-6 w-[60%] mx-auto" >
              <button
                onClick={() => {
                  console.log('App: Transform button clicked'); // Debug comment: Transform button click event
                  handleTransform();
                }}
                disabled={!selectedFile || !selectedStyle || isLoading || (currentUser && !canTransform())}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform
                  ${!selectedFile || !selectedStyle || isLoading || (currentUser && !canTransform())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-xl'
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