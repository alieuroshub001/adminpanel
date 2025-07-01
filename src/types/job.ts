import { ObjectId } from 'mongodb';

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';

// Database representation (used in models)
export type JobDB = {
  _id: ObjectId;
  title: string;
  description: string;
  department: string;
  type: JobType;
  location: string;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type Job = Omit<JobDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type JobFormData = {
  title: string;
  description: string;
  department: string;
  type: JobType;
  location: string;
};