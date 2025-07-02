// utils/image.ts
export const getDisplayImageUrl = (originalUrl: string) => {
  if (originalUrl.includes('res.cloudinary.com') && !originalUrl.includes('/upload/')) {
    // Add transformation for display
    return originalUrl.replace('/upload/', '/upload/w_200,h_100,c_scale/');
  }
  return originalUrl;
};