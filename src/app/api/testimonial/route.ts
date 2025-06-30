import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Testimonial from '@/models/Testimonial';
import { uploadImage } from '@/lib/uploadImage';

// GET all testimonials
export async function GET() {
  await connectToDB();

  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST: Create a new testimonial
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { image, imageSource, ...rest } = body;

    if (imageSource === 'upload' && image?.startsWith('data:')) {
      image = await uploadImage(image, 'testimonials');
    }

    const newTestimonial = await Testimonial.create({ ...rest, image, imageSource });
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}

// PUT: Update an existing testimonial
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const { _id, image, imageSource, ...rest } = await req.json();

    let finalImage = image;
    if (imageSource === 'upload' && image?.startsWith('data:')) {
      finalImage = await uploadImage(image, 'testimonials');
    }

    const updated = await Testimonial.findByIdAndUpdate(
      _id,
      { ...rest, image: finalImage, imageSource },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE: Remove testimonial by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await Testimonial.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Testimonial deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
