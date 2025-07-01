import { ObjectId } from 'mongodb';

// Database representation (used in models)
export type ContactCardDB = {
  _id: ObjectId;
  title: string;
  details: string;
  description: string;
  icon: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type ContactCard = Omit<ContactCardDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type ContactCardFormData = {
  title: string;
  details: string;
  description: string;
  icon: string;
  link?: string;
};