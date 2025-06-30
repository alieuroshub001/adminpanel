import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Project from '@/models/Project';
import { uploadImage } from '@/lib/uploadImage';

// GET all projects or filter by category
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  try {
    if (category) {
      const filtered = await Project.find({ category });
      return NextResponse.json(filtered, { status: 200 });
    }

    const projects = await Project.find().sort({ createdAt: -1 });
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST: Create a new project
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { image, imageSource, ...rest } = body;

    if (imageSource === 'upload' && image.startsWith('data:')) {
      image = await uploadImage(image, 'projects');
    }

    const newProject = await Project.create({ ...rest, image, imageSource });
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT: Update an existing project
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const { _id, image, imageSource, ...rest } = await req.json();

    let finalImage = image;
    if (imageSource === 'upload' && image.startsWith('data:')) {
      finalImage = await uploadImage(image, 'projects');
    }

    const updated = await Project.findByIdAndUpdate(
      _id,
      { ...rest, image: finalImage, imageSource },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE: Delete project by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await Project.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
