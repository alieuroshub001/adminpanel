import { ObjectId } from 'mongodb';

// Social media links type
export type SocialLinks = {
  linkedin?: string;
  twitter?: string;
  email?: string;
  // Add more platforms if needed
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
  featured?: boolean;
  department?: string; // ✅ Added
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in frontend)
export type TeamMember = Omit<TeamMemberDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used in create/update forms)
export type TeamMemberFormData = {
  name: string;
  role: string;
  image?: string;
  imageFile?: File;
  imageOption?: 'upload' | 'url';
  bio?: string;
  longBio?: string;
  social?: SocialLinks;
  location?: string;
  experience?: string;
  achievements?: string[];
  skills?: string[];
  featured?: boolean;
  department?: string; // ✅ Added
};
