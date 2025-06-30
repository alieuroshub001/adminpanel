export interface Testimonial {
  _id?: string;
  name: string;
  role: string;
  content: string;
  rating: number; // 1 to 5
  isFeatured?: boolean;
  image?: string; // optional image URL or Cloudinary ID
  createdAt?: string;
  updatedAt?: string;
}
