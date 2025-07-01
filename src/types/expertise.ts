import { ObjectId } from 'mongodb';

export type ExpertiseCategory = 'business' | 'tech';

export type ExpertiseInsight = {
  title: string;
  description: string;
  image: string;
  metrics: string[];
};

// Database representation (used in models)
export type ExpertiseDB = {
  _id: ObjectId;
  title: string;
  slug: string;
  category: ExpertiseCategory;
  icon: string;
  path: string;
  description?: string;
  image: string;
  detailImages?: string[];
  isFeatured: boolean;
  insights?: ExpertiseInsight[];
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type Expertise = Omit<ExpertiseDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type ExpertiseFormData = {
  title: string;
  slug: string;
  category: ExpertiseCategory;
  icon: string;
  path: string;
  description?: string;
  image?: string;
  imageFile?: File;
  imageOption?: 'upload' | 'url';
  detailImages?: string[];
  detailImageFiles?: File[];
  isFeatured?: boolean;
  insights?: ExpertiseInsight[];
};