import { NextResponse, NextRequest } from 'next/server';
import { getTestimonialById, updateTestimonial, deleteTestimonial, toggleTestimonialFeatured } from '@/models/testimonial';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid testimonial ID format' },
        { status: 400 }
      );
    }

    const testimonial = await getTestimonialById(id);
    
    if (!testimonial) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json(
      { message: 'Error fetching testimonial', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid testimonial ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const testimonialData = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      content: formData.get('content') as string,
      rating: Number(formData.get('rating')),
      isFeatured: formData.get('isFeatured') === 'true',
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageOption: formData.get('imageOption') as 'upload' | 'url',
    };

    // Validate required fields if provided
    if (testimonialData.name !== undefined && !testimonialData.name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    if (testimonialData.role !== undefined && !testimonialData.role) {
      return NextResponse.json(
        { message: 'Role is required' },
        { status: 400 }
      );
    }
    if (testimonialData.content !== undefined && !testimonialData.content) {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }
    if (testimonialData.rating !== undefined && (testimonialData.rating < 1 || testimonialData.rating > 5)) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate image option if provided
    if (testimonialData.imageOption === 'upload' && !testimonialData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (testimonialData.imageOption === 'url' && !testimonialData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const updatedCount = await updateTestimonial(id, testimonialData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Testimonial not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { message: 'Error updating testimonial', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid testimonial ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteTestimonial(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { message: 'Error deleting testimonial', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid testimonial ID format' },
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

    const updatedCount = await toggleTestimonialFeatured(id, isFeatured);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
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