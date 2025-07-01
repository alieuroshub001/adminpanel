import { ObjectId } from 'mongodb';

// Social media links type
export type SocialLinks = {
  linkedin?: string;
  twitter?: string;
  email?: string;
  // You can add more social platforms as needed
};

// Database representation (used in models)
export type TeamMemberDB = {
  _id: ObjectId;
  name: string;
  role: string;
  image: string;
  bio?: string;
  longBio?: string;
  social?: SocialLinks;
  location?: string;
  experience?: string;
  achievements?: string[];
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type TeamMember = Omit<TeamMemberDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type TeamMemberFormData = {
  name: string;
  role: string;
  image?: string;
  imageFile?: File;
  imageOption?: 'upload' | 'url'; // To track image input method
  bio?: string;
  longBio?: string;
  social?: SocialLinks;
  location?: string;
  experience?: string;
  achievements?: string[];
  skills?: string[];
};