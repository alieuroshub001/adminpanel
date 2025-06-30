export interface Job {
  _id?: string;
  title: string;
  description: string;
  department: string; // used as category
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | string;
  location: string;
  isLive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
