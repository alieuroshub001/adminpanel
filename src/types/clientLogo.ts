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

// ========== BULK OPERATION TYPES ========== //

// Bulk form data types for multiple logo uploads
export type BulkClientLogoFormData = {
  logos: ClientLogoFormData[];
};

// Response type for bulk operations
export type BulkCreateResponse = {
  insertedIds: string[];
  successCount: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
};

// Response type for bulk delete operations
export type BulkDeleteResponse = {
  deletedCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
};

// Pagination response type
export type PaginatedClientLogos = {
  logos: ClientLogo[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
};

// Statistics type
export type ClientLogoStats = {
  totalLogos: number;
  logosByLine: Record<LogoLine, number>;
  uploadedLogos: number;
  linkedLogos: number;
};