import { NextResponse, NextRequest } from 'next/server';
import { getExpertiseById, updateExpertise, deleteExpertise, toggleExpertiseFeatured } from '@/models/expertises';
import { ObjectId } from 'mongodb';
import { ExpertiseFormData, ExpertiseCategory } from '@/types/expertise';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid expertise ID format' },
        { status: 400 }
      );
    }

    const expertise = await getExpertiseById(id);
    
    if (!expertise) {
      return NextResponse.json(
        { message: 'Expertise not found' },
        { status: 404 }
      );
    }

    const serializedExpertise = {
      ...expertise,
      _id: expertise._id?.toString(),
    };

    return NextResponse.json(serializedExpertise);
  } catch (error) {
    console.error('Error fetching expertise:', error);
    return NextResponse.json(
      { message: 'Error fetching expertise', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid expertise ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const expertiseData: Partial<ExpertiseFormData> = {
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

    // Validate required fields if provided
    if (expertiseData.title !== undefined && !expertiseData.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    if (expertiseData.slug !== undefined && !expertiseData.slug) {
      return NextResponse.json(
        { message: 'Slug is required' },
        { status: 400 }
      );
    }
    if (expertiseData.category !== undefined && !expertiseData.category) {
      return NextResponse.json(
        { message: 'Category is required' },
        { status: 400 }
      );
    }
    if (expertiseData.icon !== undefined && !expertiseData.icon) {
      return NextResponse.json(
        { message: 'Icon is required' },
        { status: 400 }
      );
    }
    if (expertiseData.path !== undefined && !expertiseData.path) {
      return NextResponse.json(
        { message: 'Path is required' },
        { status: 400 }
      );
    }

    // Validate image option if provided
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

    const updatedCount = await updateExpertise(id, expertiseData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Expertise not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating expertise:', error);
    return NextResponse.json(
      { message: 'Error updating expertise', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid expertise ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteExpertise(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Expertise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expertise:', error);
    return NextResponse.json(
      { message: 'Error deleting expertise', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid expertise ID format' },
        { status: 400 }
      );
    }

    const { isFeatured } = await request.json();
    
    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { message: 'isFeatured must be a boolean' },
        { status: 400 }
      );
    }

    const updatedCount = await toggleExpertiseFeatured(id, isFeatured);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Expertise not found' },
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