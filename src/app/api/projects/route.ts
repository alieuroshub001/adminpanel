import { NextResponse } from 'next/server';
import { getProjects, createProject } from '@/models/projects';
import { ProjectStatus } from '@/types/project';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') as ProjectStatus | undefined;
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    const projects = await getProjects(category, status, featuredOnly);
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { message: 'Error fetching projects', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!projectData.title || !projectData.category || !projectData.status || 
        !projectData.description || !projectData.date) {
      return NextResponse.json(
        { message: 'Title, category, status, description, and date are required' },
        { status: 400 }
      );
    }

    // Validate image option
    if (!projectData.imageOption) {
      return NextResponse.json(
        { message: 'Please select an image option (upload or URL)' },
        { status: 400 }
      );
    }

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

    const projectId = await createProject(projectData);
    
    return NextResponse.json(
      { _id: projectId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: 'Error creating project', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}