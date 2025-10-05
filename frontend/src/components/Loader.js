import React from 'react';

const Loader = ({ type = 'spinner', message = 'Loading...', size = 'medium' }) => {
  // Debug comment: Loader component state monitoring
  console.log('Loader: Component rendered with props -', { type, message, size });

  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const SpinnerLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );

  const ShimmerLoader = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  );

  const DotsLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );

  const PulseLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`bg-blue-600 rounded-full animate-ping ${sizeClasses[size]}`}></div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );

  const ProgressLoader = ({ progress = 0 }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <p className="text-xs text-gray-500">{progress}% complete</p>
    </div>
  );

  const ImageProcessingLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      {/* AI Brain Animation */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-blue-600 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
          </svg>
        </div>
      </div>
      
      {/* Processing Steps */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">AI is working its magic ✨</h3>
        <p className="text-sm text-gray-600">{message}</p>
        
        <div className="flex justify-center space-x-2 mt-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Processing Steps Indicator */}
      <div className="w-full max-w-md space-y-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Image uploaded</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>AI processing...</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <span>Generating result</span>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'shimmer':
      console.log('Loader: Rendering shimmer loader'); // Debug comment: Shimmer loader type
      return <ShimmerLoader />;
    case 'dots':
      console.log('Loader: Rendering dots loader'); // Debug comment: Dots loader type
      return <DotsLoader />;
    case 'pulse':
      console.log('Loader: Rendering pulse loader'); // Debug comment: Pulse loader type
      return <PulseLoader />;
    case 'progress':
      console.log('Loader: Rendering progress loader'); // Debug comment: Progress loader type
      return <ProgressLoader />;
    case 'image-processing':
      console.log('Loader: Rendering image processing loader'); // Debug comment: Image processing loader type
      return <ImageProcessingLoader />;
    default:
      console.log('Loader: Rendering default spinner loader'); // Debug comment: Default spinner loader type
      return <SpinnerLoader />;
  }
};

export default Loader;