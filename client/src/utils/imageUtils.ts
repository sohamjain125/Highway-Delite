/**
 * Utility function to get the correct path for static assets
 * This handles both development and production environments
 */
export const getImagePath = (imageName: string): string => {
  // In development, use the public directory
  if (import.meta.env.DEV) {
    return `/${imageName}`;
  }
  
  // In production, try different approaches
  const baseUrl = import.meta.env.BASE_URL || '';
  
  // First try with base URL
  if (baseUrl) {
    return `${baseUrl}${imageName}`;
  }
  
  // Fallback to relative path
  return `./${imageName}`;
};

/**
 * Utility function to get the correct path for any static asset
 */
export const getAssetPath = (assetName: string): string => {
  return getImagePath(assetName);
};

/**
 * Utility function to preload images for better performance
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Utility function to check if an image exists
 */
export const checkImageExists = async (src: string): Promise<boolean> => {
  try {
    await preloadImage(src);
    return true;
  } catch {
    return false;
  }
};
