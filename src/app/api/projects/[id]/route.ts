import { NextResponse, NextRequest } from 'next/server';
import { getProjectById, updateProject, deleteProject, toggleProjectFeatured } from '@/models/projects';
import { ObjectId } from 'mongodb';
import { ProjectStatus } from '@/types/project';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    const project = await getProjectById(id);
    
    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: 'Error fetching project', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const projectData = {
      title: formData.get('title') as string,
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageOption: formData.get('imageOption') as 'upload' | 'url',
      category: formData.get('category') as string,
      status: formData.get('status') as ProjectStatus,
      description: formData.get('description') as string,
      longDescription: formData.get('longDescription') as string,
      technologies: JSON.parse(formData.get('technologies') as string) || [],
      highlights: JSON.parse(formData.get('highlights') as string) || [],
      date: formData.get('date') as string,
      featured: formData.get('featured') === 'true',
    };

    // Validate required fields if provided
    if (projectData.title !== undefined && !projectData.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    if (projectData.category !== undefined && !projectData.category) {
      return NextResponse.json(
        { message: 'Category is required' },
        { status: 400 }
      );
    }
    if (projectData.status !== undefined && !projectData.status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }
    if (projectData.description !== undefined && !projectData.description) {
      return NextResponse.json(
        { message: 'Description is required' },
        { status: 400 }
      );
    }
    if (projectData.date !== undefined && !projectData.date) {
      return NextResponse.json(
        { message: 'Date is required' },
        { status: 400 }
      );
    }

    // Validate image option if provided
    if (projectData.imageOption === 'upload' && !projectData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (projectData.imageOption === 'url' && !projectData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const updatedCount = await updateProject(id, projectData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Project not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { message: 'Error updating project', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid project ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteProject(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Error deleting project', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid project ID format' },
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

    const updatedCount = await toggleProjectFeatured(id, featured);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Project not found' },
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