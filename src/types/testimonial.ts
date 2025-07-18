import { ObjectId } from 'mongodb';

// Database representation (used in models)
export type TestimonialDB = {
  _id: ObjectId;
  name: string;
  role: string;
  content: string;
  rating: number; // 1 to 5
  isFeatured: boolean;
  image?: string; // Optional image link or uploaded image
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type Testimonial = Omit<TestimonialDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type TestimonialFormData = {
  name: string;
  role: string;
  content: string;
  rating: number;
  isFeatured?: boolean;
  image?: string; // Optional image URL
  imageFile?: File; // Optional uploaded image
  imageOption?: 'upload' | 'url'; // To determine image input method (or undefined if none)
};
