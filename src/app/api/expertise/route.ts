import { NextResponse } from 'next/server';
import { createExpertise, getExpertises } from '@/models/expertises';
import { ExpertiseFormData, ExpertiseCategory } from '@/types/expertise';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ExpertiseCategory | undefined;
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    const expertises = await getExpertises(category, featuredOnly);
    
    // Convert ObjectId to string for client-side
    const serializedExpertises = expertises.map(item => ({
      ...item,
      _id: item._id?.toString(),
    }));
    
    return NextResponse.json(serializedExpertises);
  } catch (error) {
    console.error('Error fetching expertises:', error);
    return NextResponse.json(
      { message: 'Error fetching expertises', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const expertiseData: ExpertiseFormData = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      category: formData.get('category') as ExpertiseCategory,
      icon: formData.get('icon') as string,
      path: formData.get('path') as string,
      description: formData.get('description') as string || undefined,
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageOption: formData.get('imageOption') as 'upload' | 'url',
      detailImages: JSON.parse(formData.get('detailImages') as string) || [],
      detailImageFiles: formData.getAll('detailImageFiles') as File[] || [],
      isFeatured: formData.get('isFeatured') === 'true',
      insights: JSON.parse(formData.get('insights') as string) || []
    };

    // Validate required fields
    if (!expertiseData.title || !expertiseData.slug || !expertiseData.category || 
        !expertiseData.icon || !expertiseData.path) {
      return NextResponse.json(
        { message: 'Title, slug, category, icon, and path are required' },
        { status: 400 }
      );
    }

    // Validate image option
    if (!expertiseData.imageOption) {
      return NextResponse.json(
        { message: 'Please select an image option (upload or URL)' },
        { status: 400 }
      );
    }

    if (expertiseData.imageOption === 'upload' && !expertiseData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (expertiseData.imageOption === 'url' && !expertiseData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const expertiseId = await createExpertise(expertiseData);
    
    return NextResponse.json(
      { _id: expertiseId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expertise:', error);
    return NextResponse.json(
      { message: 'Error creating expertise', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}