import { ObjectId } from 'mongodb';

// Database representation (used in models)
export type EventDB = {
  _id: ObjectId;
  title: string;
  image: string;
  date: string; // ISO format
  location: string;
  attendees: number;
  category: string;
  description: string;
  highlights: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type Event = Omit<EventDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type EventFormData = {
  title: string;
  image?: string;
  imageFile?: File;
  imageOption?: 'upload' | 'url';
  date: string;
  location: string;
  attendees: number;
  category: string;
  description: string;
  highlights: string[];
  isFeatured?: boolean;
};