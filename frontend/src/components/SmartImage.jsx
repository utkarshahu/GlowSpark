import React, { useState } from 'react';
import { FaImage } from 'react-icons/fa';

const SmartImage = ({ src, alt, className, fallbackIcon: FallbackIcon = FaImage }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse z-0">
          <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800 z-10">
          <FallbackIcon className="text-3xl mb-2 opacity-50" />
          <span className="text-xs font-medium px-2 text-center break-words opacity-70">{alt || 'Image not found'}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-500 z-10 relative ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        />
      )}
    </div>
  );
};

export default SmartImage;
