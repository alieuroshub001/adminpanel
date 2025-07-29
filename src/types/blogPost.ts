// blogPost.ts
import { ObjectId } from 'mongodb';

export type ImageSource = 'upload' | 'link';

export type AuthorSocial = {
  twitter?: string;
  linkedin?: string;
};

export type BlogAuthor = {
  name: string;
  bio: string;
  avatar?: string;
  social: AuthorSocial;
};

// Database representation (used in models)
export type BlogPostDB = {
  _id: ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  rawContent?: string; // JSON content for future flexibility
  image: string;
  imageSource: ImageSource;
  category: string;
  tags: string[];
  readTime: string;
  date: string;
  featured: boolean;
  author: BlogAuthor;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation (used in components)
export type BlogPost = Omit<BlogPostDB, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type (used for create/update operations)
export type BlogPostFormData = {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  rawContent?: string; // JSON content
  image?: string;
  imageFile?: File;
  imageSource?: ImageSource;
  category: string;
  tags: string[];
  readTime?: string;
  date: string;
  featured?: boolean;
  author: {
    name: string;
    bio: string;
    avatar?: string;
    social: {
      twitter?: string;
      linkedin?: string;
    };
  };
};