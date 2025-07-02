import { NextResponse } from 'next/server';
import { createEvent, getEvents } from '@/models/events';
import { EventFormData } from '@/types/event';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const featuredOnly = searchParams.get('featuredOnly') === 'true';
    const upcomingOnly = searchParams.get('upcomingOnly') === 'true';

    const events = await getEvents(category, featuredOnly, upcomingOnly);
    
    // Convert ObjectId to string for client-side
    const serializedEvents = events.map(item => ({
      ...item,
      _id: item._id?.toString(),
    }));
    
    return NextResponse.json(serializedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'Error fetching events', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const eventData: EventFormData = {
      title: formData.get('title') as string,
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageOption: formData.get('imageOption') as 'upload' | 'url',
      date: formData.get('date') as string,
      location: formData.get('location') as string,
      attendees: parseInt(formData.get('attendees') as string) || 0,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      highlights: JSON.parse(formData.get('highlights') as string) as string[],
      isFeatured: formData.get('isFeatured') === 'true'
    };

    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.location || 
        !eventData.category || !eventData.description) {
      return NextResponse.json(
        { message: 'Title, date, location, category, and description are required' },
        { status: 400 }
      );
    }

    // Validate image option
    if (!eventData.imageOption) {
      return NextResponse.json(
        { message: 'Please select an image option (upload or URL)' },
        { status: 400 }
      );
    }

    if (eventData.imageOption === 'upload' && !eventData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (eventData.imageOption === 'url' && !eventData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const eventId = await createEvent(eventData);
    
    return NextResponse.json(
      { _id: eventId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { message: 'Error creating event', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}