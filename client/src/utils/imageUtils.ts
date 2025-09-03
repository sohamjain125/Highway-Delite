/**
 * Utility function to get the correct path for static assets
 * This handles both development and production environments
 */
export const getImagePath = (imageName: string): string => {
  // In development, use the public directory
  if (import.meta.env.DEV) {
    return `/${imageName}`;
  }
  
  // In production, use the base URL with the image name
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // Ensure baseUrl ends with / and imageName doesn't start with /
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanImageName = imageName.startsWith('/') ? imageName.slice(1) : imageName;
  
  return `${cleanBaseUrl}${cleanImageName}`;
};

/**
 * Utility function to get the correct path for any static asset
 */
export const getAssetPath = (assetName: string): string => {
  return getImagePath(assetName);
};

