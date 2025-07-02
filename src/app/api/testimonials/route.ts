import { NextResponse } from 'next/server';
import { getTestimonials, createTestimonial } from '@/models/testimonials';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    const testimonials = await getTestimonials(featuredOnly);
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { message: 'Error fetching testimonials', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Validate required fields
    if (!testimonialData.name || !testimonialData.role || !testimonialData.content || !testimonialData.rating) {
      return NextResponse.json(
        { message: 'Name, role, content, and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (testimonialData.rating < 1 || testimonialData.rating > 5) {
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

    const testimonialId = await createTestimonial(testimonialData);
    
    return NextResponse.json(
      { _id: testimonialId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { message: 'Error creating testimonial', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}