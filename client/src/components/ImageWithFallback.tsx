import React, { useState, useEffect } from 'react';
import { getImagePath, checkImageExists } from '../utils/imageUtils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Get the correct image path
        const imagePath = getImagePath(src);
        
        // Check if the image exists
        const exists = await checkImageExists(imagePath);
        
        if (exists) {
          setImageSrc(imagePath);
        } else {
          // Try fallback if provided
          if (fallbackSrc) {
            const fallbackPath = getImagePath(fallbackSrc);
            const fallbackExists = await checkImageExists(fallbackPath);
            if (fallbackExists) {
              setImageSrc(fallbackPath);
            } else {
              throw new Error('Neither primary nor fallback image exists');
            }
          } else {
            throw new Error('Primary image does not exist');
          }
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        setHasError(true);
        onError?.();
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src, fallbackSrc, onError]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-gray-500 text-sm text-center">
          <div>Image failed to load</div>
          <div className="text-xs mt-1">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

export default ImageWithFallback;
