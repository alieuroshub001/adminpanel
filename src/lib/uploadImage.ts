import cloudinary from './cloudinary';

export async function uploadImage(base64: string, folder: string = 'uploads') {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}
