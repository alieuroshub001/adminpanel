import { ObjectId } from 'mongodb';

export type LogoLine = 1 | 2 | 3 | 4;
export type ImageSource = 'upload' | 'link';

// Database representation (used in models)
export type ClientLogoDB = {
  _id: ObjectId;
  image: string;
  imageSource: ImageSource;
  line: LogoLine;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type ClientLogo = Omit<ClientLogoDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type ClientLogoFormData = {
  image?: string;
  imageFile?: File;
  imageSource?: ImageSource;
  line: LogoLine;
};