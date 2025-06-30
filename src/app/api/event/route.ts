import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Event from '@/models/Event';
import { uploadImage } from '@/lib/uploadImage';

// GET all events or filter by category
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  try {
    if (category) {
      const filtered = await Event.find({ category });
      return NextResponse.json(filtered, { status: 200 });
    }

    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { image, imageSource, ...rest } = body;

    if (imageSource === 'upload' && image.startsWith('data:')) {
      image = await uploadImage(image, 'events');
    }

    const newEvent = await Event.create({ ...rest, image, imageSource });
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// PUT: Update an event
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    const { _id, image, imageSource, ...rest } = body;

    let finalImage = image;
    if (imageSource === 'upload' && image.startsWith('data:')) {
      finalImage = await uploadImage(image, 'events');
    }

    const updated = await Event.findByIdAndUpdate(
      _id,
      { ...rest, image: finalImage, imageSource },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE: Remove event by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await Event.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Event deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
