import React from 'react';

const Preview = ({ originalImage, transformedImage, isLoading }) => {
  // Debug comment: Component state monitoring
  console.log('Preview: Component rendered with state -', {
    hasOriginal: !!originalImage,
    hasTransformed: !!transformedImage,
    isLoading
  });

  if (!originalImage && !transformedImage && !isLoading) {
    console.log('Preview: No content to display, hiding component'); // Debug comment: Component visibility
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Image Comparison</h2>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Original Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Original</h3>
            {originalImage && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Source
              </span>
            )}
          </div>
          
          <div className="relative aspect-square bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden">
            {originalImage ? (
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-full object-cover"
                onLoad={() => console.log('Preview: Original image loaded successfully')} // Debug comment: Original image load success
                onError={() => console.error('Preview: Original image failed to load')} // Debug comment: Original image load error
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No image uploaded</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transformed Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Transformed</h3>
            {transformedImage && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✨ AI Generated
              </span>
            )}
          </div>
          
          <div className="relative aspect-square bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-sm text-gray-600">Transforming image...</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  {/* Debug comment: Loading state active */}
                  {console.log('Preview: Loading state active - transformation in progress')}
                </div>
              </div>
            ) : transformedImage ? (
              <img
                src={transformedImage}
                alt="Transformed"
                className="w-full h-full object-cover"
                onLoad={() => console.log('Preview: Transformed image loaded successfully')} // Debug comment: Transformed image load success
                onError={() => console.error('Preview: Transformed image failed to load')} // Debug comment: Transformed image load error
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Awaiting transformation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
      {transformedImage && (
        <div className="flex justify-center">
          <a
            href={transformedImage}
            download="transformed-image.jpg"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => console.log('Preview: Download button clicked for transformed image')} // Debug comment: Download event
          >
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Transformed Image
          </a>
        </div>
      )}
    </div>
  );
};

export default Preview;