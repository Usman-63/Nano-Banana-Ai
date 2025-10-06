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
import EmailVerification from './components/EmailVerification';

function AppContent() {
  const { currentUser, getIdToken, userStats, canTransform, fetchUserStats, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('Anime Style');
  const [transformedImage, setTransformedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Debug comment: App component state monitoring
  console.log('App: Component rendered with state -', {
    hasFile: !!selectedFile,
    hasPreview: !!previewUrl,
    selectedStyle,
    hasTransformed: !!transformedImage,
    isLoading,
    hasError: !!error
  });

  // Check if user needs email verification
  React.useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      setShowEmailVerification(true);
    }
  }, [currentUser]);

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

    // Check if email is verified
    if (!currentUser.emailVerified) {
      console.error('App: Email not verified'); // Debug comment: Email verification error
      setShowEmailVerification(true);
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
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000'}/transform`, {
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

      console.log('App: Response is OK, processing image...'); // Debug comment: Image processing start
      
      // Get usage stats from response headers
      const usageStatsHeader = response.headers.get('X-Usage-Stats');
      let usageStats = null;
      if (usageStatsHeader) {
        try {
          usageStats = JSON.parse(usageStatsHeader);
          console.log('App: Usage stats from headers:', usageStats);
        } catch (e) {
          console.warn('App: Could not parse usage stats from headers');
        }
      }
      
      // Convert the binary response to a data URL
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      console.log('App: Image blob created, size:', imageBlob.size, 'bytes');
      console.log('App: Image URL created:', imageUrl);
      
      // Set the transformed image
      setTransformedImage(imageUrl);
      console.log('App: Transformed image set in state');
      
      // Update user stats after successful transformation
      console.log('App: Updating user stats...'); // Debug comment: Stats update start
      await fetchUserStats();
      console.log('App: User stats updated'); // Debug comment: Stats update complete
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
      console.log('App: Loading state set to false');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Additional gradient overlay for more depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50/40 via-transparent to-rose-50/40"></div>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-indigo-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse delay-1500"></div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-violet-200/10 to-indigo-200/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-200/15 to-rose-200/15 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-cyan-200/10 to-blue-200/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-28 h-28 bg-gradient-to-br from-emerald-200/10 to-teal-200/10 rounded-full blur-xl"></div>
      </div>
      {/* Header */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md shadow-lg border-b border-white/30 min-h-[140px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left flex-1">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                <div className="text-4xl sm:text-5xl">🍌</div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                    Nano Banana
                  </h1>
                  <h2 className="text-lg sm:text-xl text-gray-600 font-medium">
                    Image Editor
                  </h2>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto lg:mx-0">
                Transform your images with AI-powered artistic styles
              </p>
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {/* Usage Stats */}
                  {userStats && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4 py-2 border border-indigo-200/50">
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                        Transformations
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          userStats.transformationsRemaining > 2 ? 'bg-emerald-500' :
                          userStats.transformationsRemaining > 0 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></div>
                        <span className={`text-sm font-bold ${
                          userStats.transformationsRemaining > 2 ? 'text-emerald-600' :
                          userStats.transformationsRemaining > 0 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {userStats.transformationsRemaining} / {userStats.maxTransformations}
                        </span>
                        <span className="text-xs text-gray-500">left</span>
                      </div>
                    </div>
                  )}
                  
                  {/* User Avatar */}
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl px-4 py-3 transition-all duration-200 border border-indigo-200/50 hover:border-indigo-300/50 shadow-sm hover:shadow-md"
                  >
                    <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-800">
                        {currentUser.displayName || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentUser.email}
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors hover:bg-gray-50 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {showEmailVerification && (
        <EmailVerification onClose={() => setShowEmailVerification(false)} />
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