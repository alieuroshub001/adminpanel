export async function uploadToCloudinary(file: File): Promise<string> {
  const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // You should configure and use a preset in Cloudinary
  const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not defined in env variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url as string;
}
