import React from 'react';

const StyleSelector = ({ selectedStyle, onStyleChange, disabled = false }) => {
  // Style definitions with enhanced metadata for debugging
  const styles = [
    {
      id: 'Anime Style',
      name: 'Anime Style',
      description: 'Transform into beautiful anime art',
      icon: '🎨',
      color: 'from-pink-400 to-purple-500'
    },
    {
      id: 'Picasso Style',
      name: 'Picasso Style',
      description: 'Cubist masterpiece transformation',
      icon: '🖼️',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      id: 'Oil Painting Style',
      name: 'Oil Painting Style',
      description: 'Classic Degas oil painting style',
      icon: '🎭',
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 'Frida Style',
      name: 'Frida Style',
      description: 'Frida Kahlo artistic style',
      icon: '🌺',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'Miniature Effect',
      name: 'Miniature Effect',
      description: '1/7 scale collectible figure',
      icon: '🎪',
      color: 'from-red-400 to-pink-500'
    }
  ];

  // Enhanced style change handler with debugging
  const handleStyleChange = (styleId) => {
    console.log('StyleSelector: Style change requested -', styleId); // Debug comment: Style selection event
    
    if (disabled) {
      console.warn('StyleSelector: Style change blocked - component is disabled'); // Debug comment: Disabled state warning
      return;
    }

    const selectedStyleObj = styles.find(style => style.id === styleId);
    if (selectedStyleObj) {
      console.log('StyleSelector: Valid style selected -', selectedStyleObj.name); // Debug comment: Valid style selection
      onStyleChange(styleId);
    } else {
      console.error('StyleSelector: Invalid style ID -', styleId); // Debug comment: Invalid style selection error
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Select Transformation Style
      </label>
      
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-1">
        {styles.map((style) => (
          <label
  key={style.id}
  className={`flex flex-col rounded-lg border p-4 shadow-sm max-w-sm h-full transition-all duration-200 ${
    disabled 
      ? 'cursor-not-allowed opacity-50' 
      : 'cursor-pointer hover:shadow-md hover:scale-105'
  } ${
    selectedStyle === style.id
      ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 bg-blue-50'
      : 'border-gray-300 hover:border-gray-400 bg-white'
  }`}
>
            <input
              type="radio"
              name="style"
              value={style.id}
              checked={selectedStyle === style.id}
              onChange={(e) => handleStyleChange(e.target.value)}
              disabled={disabled}
              className="sr-only"
              aria-describedby={`style-${style.id}-description`}
            />
            
            <div className="flex flex-1 items-center min-w-0">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${style.color} text-white text-xl shadow-sm transition-transform ${
                selectedStyle === style.id ? 'scale-110' : ''
              }`}>
                {style.icon}
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-start justify-between min-w-0">
                  <h3 className={`text-sm font-medium transition-colors break-words flex-1 mr-2 ${
                    selectedStyle === style.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {style.name}
                  </h3>
                  {selectedStyle === style.id && (
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <svg
                        className="h-4 w-4 text-blue-500 animate-pulse"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs font-medium text-blue-600 whitespace-nowrap">Selected</span>
                    </div>
                  )}
                </div>
                <p 
                  id={`style-${style.id}-description`}
                  className={`text-xs mt-1 transition-colors break-words ${
                    selectedStyle === style.id ? 'text-blue-700' : 'text-gray-500'
                  }`}
                >
                  {style.description}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>
      
      {/* Enhanced Selected Style Info */}
      {selectedStyle && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-blue-800 font-medium">
                  Ready to transform with: <span className="font-bold">{selectedStyle}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {styles.find(s => s.id === selectedStyle)?.description}
                </p>
              </div>
            </div>
            <div className="text-2xl">
              {styles.find(s => s.id === selectedStyle)?.icon}
            </div>
          </div>
        </div>
      )}
      
      {/* Disabled State Info */}
      {disabled && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-2 text-sm text-gray-600">
              Style selection is currently disabled
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleSelector;