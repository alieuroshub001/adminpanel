import { ObjectId } from 'mongodb';

export type ProjectStatus = 'completed' | 'ongoing' | 'upcoming';

// Database representation (used in models)
export type ProjectDB = {
  _id: ObjectId;
  title: string;
  image: string;
  category: string;
  status: ProjectStatus;
  description: string;
  longDescription: string;
  technologies: string[];
  highlights: string[];
  date: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type Project = Omit<ProjectDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type ProjectFormData = {
  title: string;
  image?: string;
  imageFile?: File;
  imageOption?: 'upload' | 'url';
  category: string;
  status: ProjectStatus;
  description: string;
  longDescription: string;
  technologies: string[];
  highlights: string[];
  date: string;
  featured?: boolean;
};