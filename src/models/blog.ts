import { Collection, Db, ObjectId, Filter } from 'mongodb';
import clientPromise from '../lib/db';
import cloudinary from '../lib/cloudinary';
import { BlogPostDB, BlogPost, BlogPostFormData, ImageSource } from '../types/blogPost';

let cachedDb: Db;
let cachedBlogPosts: Collection<BlogPostDB>;

async function connectToDatabase() {
  if (cachedDb && cachedBlogPosts) {
    return { db: cachedDb, blogPostsCollection: cachedBlogPosts };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedBlogPosts = db.collection<BlogPostDB>('blogPosts');

  // Create indexes for better query performance
  await cachedBlogPosts.createIndex({ slug: 1 }, { unique: true });
  await cachedBlogPosts.createIndex({ title: 'text', content: 'text' });
  await cachedBlogPosts.createIndex({ category: 1 });
  await cachedBlogPosts.createIndex({ tags: 1 });
  await cachedBlogPosts.createIndex({ featured: 1 });
  await cachedBlogPosts.createIndex({ 'author.name': 1 });

  return { db, blogPostsCollection: cachedBlogPosts };
}

// Helper function to convert DB object to client-safe object
function toClientBlogPost(blogPost: BlogPostDB): BlogPost {
  return {
    ...blogPost,
    _id: blogPost._id.toString(),
    createdAt: blogPost.createdAt.toISOString(),
    updatedAt: blogPost.updatedAt.toISOString()
  };
}

export const getBlogPosts = async (
  category?: string,
  featuredOnly: boolean = false,
  limit?: number
): Promise<BlogPost[]> => {
  const { blogPostsCollection } = await connectToDatabase();
  const query: Filter<BlogPostDB> = {};
  
  if (category) query.category = category;
  if (featuredOnly) query.featured = true;
  
  let queryBuilder = blogPostsCollection.find(query).sort({ date: -1 });
  if (limit) queryBuilder = queryBuilder.limit(limit);
  
  const blogPosts = await queryBuilder.toArray();
  return blogPosts.map(toClientBlogPost);
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const { blogPostsCollection } = await connectToDatabase();
  

  
  const blogPost = await blogPostsCollection.findOne({ slug });
  return blogPost ? toClientBlogPost(blogPost) : null;
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const { blogPostsCollection } = await connectToDatabase();
  const blogPost = await blogPostsCollection.findOne({ _id: new ObjectId(id) });
  return blogPost ? toClientBlogPost(blogPost) : null;
};

export const createBlogPost = async (blogPostData: BlogPostFormData): Promise<string> => {
  const { blogPostsCollection } = await connectToDatabase();
  
  let imageUrl = blogPostData.image || '';
  let imageSource: ImageSource = blogPostData.imageSource || 'link';
  
  // Handle image based on the selected option
  if (blogPostData.imageFile) {
    // Upload image to Cloudinary with optimization
    const arrayBuffer = await blogPostData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${blogPostData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'blog',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' }, // Blog featured image size
          { quality: 'auto' }
        ]
      }
    );
    imageUrl = uploadResult.secure_url;
    imageSource = 'upload';
  }

  const now = new Date();
  const result = await blogPostsCollection.insertOne({
    slug: blogPostData.slug,
    title: blogPostData.title,
    excerpt: blogPostData.excerpt,
    content: blogPostData.content,
    image: imageUrl,
    imageSource,
    category: blogPostData.category,
    tags: blogPostData.tags || [],
    readTime: blogPostData.readTime || calculateReadTime(blogPostData.content),
    date: blogPostData.date,
    featured: blogPostData.featured || false,
    author: {
      name: blogPostData.author.name,
      bio: blogPostData.author.bio,
      avatar: blogPostData.author.avatar,
      social: {
        twitter: blogPostData.author.social?.twitter,
        linkedin: blogPostData.author.social?.linkedin
      }
    },
    createdAt: now,
    updatedAt: now,
    _id: new ObjectId()
  });
  
  return result.insertedId.toString();
};

export const updateBlogPost = async (id: string, blogPostData: Partial<BlogPostFormData>): Promise<number> => {
  const { blogPostsCollection } = await connectToDatabase();
  
  const updateData: Partial<BlogPostDB> = {
    updatedAt: new Date(),
  };

  // Add only the fields that are provided
  if (blogPostData.slug !== undefined) updateData.slug = blogPostData.slug;
  if (blogPostData.title !== undefined) updateData.title = blogPostData.title;
  if (blogPostData.excerpt !== undefined) updateData.excerpt = blogPostData.excerpt;
  if (blogPostData.content !== undefined) updateData.content = blogPostData.content;
  if (blogPostData.category !== undefined) updateData.category = blogPostData.category;
  if (blogPostData.tags !== undefined) updateData.tags = blogPostData.tags;
  if (blogPostData.date !== undefined) updateData.date = blogPostData.date;
  if (blogPostData.featured !== undefined) updateData.featured = blogPostData.featured;
  if (blogPostData.author !== undefined) {
    updateData.author = {
      name: blogPostData.author.name,
      bio: blogPostData.author.bio,
      avatar: blogPostData.author.avatar,
      social: {
        twitter: blogPostData.author.social?.twitter,
        linkedin: blogPostData.author.social?.linkedin
      }
    };
  }

  // Handle image update
  if (blogPostData.imageFile) {
    // Upload new image
    const arrayBuffer = await blogPostData.imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const uploadResult = await cloudinary.uploader.upload(
      `data:${blogPostData.imageFile.type};base64,${base64String}`,
      { 
        folder: 'blog',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' },
          { quality: 'auto' }
        ]
      }
    );
    updateData.image = uploadResult.secure_url;
    updateData.imageSource = 'upload';
  } else if (blogPostData.image !== undefined) {
    updateData.image = blogPostData.image;
    updateData.imageSource = blogPostData.imageSource || 'link';
  }

  // Recalculate read time if content changed
  if (blogPostData.content !== undefined) {
    updateData.readTime = calculateReadTime(blogPostData.content);
  }

  const result = await blogPostsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return result.modifiedCount;
};

export const deleteBlogPost = async (id: string): Promise<number> => {
  const { blogPostsCollection } = await connectToDatabase();
  
  const blogPost = await blogPostsCollection.findOne({ _id: new ObjectId(id) });
  if (blogPost?.image && blogPost.imageSource === 'upload') {
    const publicId = blogPost.image.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`blog/${publicId}`);
    }
  }

  const result = await blogPostsCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount;
};

export const toggleBlogPostFeatured = async (id: string, featured: boolean): Promise<number> => {
  const { blogPostsCollection } = await connectToDatabase();
  const result = await blogPostsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { featured, updatedAt: new Date() } }
  );
  return result.modifiedCount;
};


// Helper function to calculate read time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}