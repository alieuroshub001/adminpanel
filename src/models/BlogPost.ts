import mongoose, { Schema, model, models } from 'mongoose';

const blogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // HTML
    image: { type: String, required: true },
    imageSource: { type: String, enum: ['upload', 'link'], default: 'link' },
    category: { type: String, required: true },
    tags: [{ type: String }],
    readTime: { type: String },
    date: { type: String, required: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    author: {
      name: { type: String, required: true },
      bio: { type: String },
      avatar: { type: String },
      social: {
        twitter: { type: String },
        linkedin: { type: String },
      },
    },
  },
  { timestamps: true }
);

const BlogPost = models.BlogPost || model('BlogPost', blogPostSchema);
export default BlogPost;
