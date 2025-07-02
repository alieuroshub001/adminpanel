import { NextResponse, NextRequest } from 'next/server';
import { getBlogPostById, updateBlogPost, deleteBlogPost, toggleBlogPostFeatured } from '../../../../models/blogPost';
import { ObjectId } from 'mongodb';
import { BlogPostFormData } from '@/types/blogPost';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog post ID format' },
        { status: 400 }
      );
    }

    const blogPost = await getBlogPostById(id);
    
    if (!blogPost) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    const serializedBlogPost = {
      ...blogPost,
      _id: blogPost._id?.toString(),
    };

    return NextResponse.json(serializedBlogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { message: 'Error fetching blog post', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog post ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const blogPostData: Partial<BlogPostFormData> = {
      slug: formData.get('slug') as string,
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageSource: formData.get('imageSource') as import('@/types/blogPost').ImageSource,
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

    // Validate required fields if provided
    if (blogPostData.slug !== undefined && !blogPostData.slug) {
      return NextResponse.json(
        { message: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate image option if provided
    if (blogPostData.imageSource === 'upload' && !blogPostData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (
      blogPostData.imageSource !== undefined &&
      blogPostData.imageSource === 'url' as import('@/types/blogPost').ImageSource &&
      !blogPostData.image
    ) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const updatedCount = await updateBlogPost(id, blogPostData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Blog post not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { message: 'Error updating blog post', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog post ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteBlogPost(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { message: 'Error deleting blog post', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid blog post ID format' },
        { status: 400 }
      );
    }

    const { featured } = await request.json();
    
    if (typeof featured !== 'boolean') {
      return NextResponse.json(
        { message: 'featured must be a boolean' },
        { status: 400 }
      );
    }

    const updatedCount = await toggleBlogPostFeatured(id, featured);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { message: 'Error updating featured status', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}