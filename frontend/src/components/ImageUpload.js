import React, { useState, useRef } from 'react';

const ImageUpload = ({ onFileSelect, selectedFile, previewUrl, error, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Enhanced file validation with debugging comments
  const handleFileChange = (file) => {
    if (!file) {
      console.error('ImageUpload: No file provided'); // Debug comment: File validation error
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Invalid file type. Please select an image file (PNG, JPG, GIF).';
      console.error('ImageUpload: Invalid file type -', file.type); // Debug comment: File type validation error
      onError?.(errorMsg);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const errorMsg = `File size too large. Maximum 10MB allowed. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      console.error('ImageUpload: File size too large -', file.size, 'bytes'); // Debug comment: File size validation error
      onError?.(errorMsg);
      return;
    }

    // Clear any previous errors and proceed
    console.log('ImageUpload: File validation successful -', file.name); // Debug comment: Successful file validation
    onError?.(null);
    onFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    console.log('ImageUpload: File input change triggered'); // Debug comment: File input event
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    console.log('ImageUpload: Drag over detected'); // Debug comment: Drag over event
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    console.log('ImageUpload: Drag leave detected'); // Debug comment: Drag leave event
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    console.log('ImageUpload: Drop detected with', files.length, 'files'); // Debug comment: Drop event
    
    if (files.length > 0) {
      handleFileChange(files[0]);
    } else {
      console.error('ImageUpload: No files in drop event'); // Debug comment: Drop event error
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Upload Image</label>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : selectedFile 
              ? 'border-green-400 bg-green-50' 
              : error
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleInputChange}
        />
        
        <div className="text-center">
          {/* Enhanced Upload Icon with dynamic colors */}
          <svg 
            className={`mx-auto h-12 w-12 transition-colors duration-200
              ${isDragOver 
                ? 'text-blue-500' 
                : selectedFile 
                  ? 'text-green-500' 
                  : error
                    ? 'text-red-500'
                    : 'text-gray-400'
              }
            `} 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          
          {/* Enhanced Upload Text with dynamic states */}
          <div className="mt-4">
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">
                  ✓ File selected successfully
                </p>
                <p className="text-xs text-gray-500">
                  Click to change or drag a new file
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-75 rounded-lg flex items-center justify-center border-2 border-blue-400 border-dashed">
            <div className="text-center">
              <div className="text-2xl mb-2">📁</div>
              <p className="text-blue-600 font-medium">Drop your image here</p>
            </div>
          </div>
        )}
      </div>

      {/* File Info Display */}
      {selectedFile && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-800">File Selected</p>
              <p className="text-xs text-green-600 truncate" title={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`}>
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">Upload Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;