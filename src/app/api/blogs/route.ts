import { NextResponse } from 'next/server';
import { createBlogPost, getBlogPosts } from '../../../models/blogPost';
import { BlogPostFormData, ImageSource } from '@/types/blogPost';

export async function GET() {
  try {
    const blogPosts = await getBlogPosts();
    
    // Convert ObjectId to string for client-side
    const serializedBlogPosts = blogPosts.map(item => ({
      ...item,
      _id: item._id?.toString(),
    }));
    
    return NextResponse.json(serializedBlogPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { message: 'Error fetching blog posts', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const blogPostData: BlogPostFormData = {
      slug: formData.get('slug') as string,
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageSource: formData.get('imageSource') as ImageSource,
      category: formData.get('category') as string,
      tags: JSON.parse(formData.get('tags') as string) as string[],
      date: formData.get('date') as string,
      featured: formData.get('featured') === 'true',
      author: {
        name: formData.get('author.name') as string,
        bio: formData.get('author.bio') as string,
        avatar: formData.get('author.avatar') as string || undefined,
        social: {
          twitter: formData.get('author.social.twitter') as string || undefined,
          linkedin: formData.get('author.social.linkedin') as string || undefined
        }
      }
    };

    // Validate required fields
    if (!blogPostData.slug || !blogPostData.title || !blogPostData.excerpt || 
        !blogPostData.content || !blogPostData.category || !blogPostData.date ||
        !blogPostData.author.name || !blogPostData.author.bio) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate image option
    if (!blogPostData.imageSource) {
      return NextResponse.json(
        { message: 'Please select an image option (upload or URL)' },
        { status: 400 }
      );
    }

    if (blogPostData.imageSource === 'upload' && !blogPostData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (blogPostData.imageSource === 'link' && !blogPostData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const blogPostId = await createBlogPost(blogPostData);
    
    return NextResponse.json(
      { _id: blogPostId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { message: 'Error creating blog post', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}