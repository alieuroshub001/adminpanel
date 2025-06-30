import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import { uploadImage } from '@/lib/uploadImage';

// GET all blogs or search by slug
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      const blog = await BlogPost.findOne({ slug });
      if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      return NextResponse.json(blog, { status: 200 });
    }

    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST: create a new blog
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { title, slug, excerpt, content, image, imageSource, ...rest } = body;

    if (imageSource === 'upload' && image.startsWith('data:')) {
      image = await uploadImage(image, 'blogs');
    }

    const newBlog = await BlogPost.create({
      title,
      slug,
      excerpt,
      content,
      image,
      imageSource,
      ...rest,
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

// PUT: update an existing blog
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    const { _id, image, imageSource, ...rest } = body;

    let finalImage = image;
    if (imageSource === 'upload' && image.startsWith('data:')) {
      finalImage = await uploadImage(image, 'blogs');
    }

    const updated = await BlogPost.findByIdAndUpdate(
      _id,
      { ...rest, image: finalImage, imageSource },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE blog by ID (from body)
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await BlogPost.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Blog deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
