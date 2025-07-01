import { NextResponse, NextRequest } from 'next/server';
import { getEventById, updateEvent, deleteEvent, toggleEventFeatured, incrementEventAttendees } from '@/models/event';
import { ObjectId } from 'mongodb';
import { EventFormData } from '@/types/event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const event = await getEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    const serializedEvent = {
      ...event,
      _id: event._id?.toString(),
    };

    return NextResponse.json(serializedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { message: 'Error fetching event', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const eventData: Partial<EventFormData> = {
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

    // Validate required fields if provided
    if (eventData.title !== undefined && !eventData.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    if (eventData.date !== undefined && !eventData.date) {
      return NextResponse.json(
        { message: 'Date is required' },
        { status: 400 }
      );
    }
    if (eventData.location !== undefined && !eventData.location) {
      return NextResponse.json(
        { message: 'Location is required' },
        { status: 400 }
      );
    }
    if (eventData.category !== undefined && !eventData.category) {
      return NextResponse.json(
        { message: 'Category is required' },
        { status: 400 }
      );
    }
    if (eventData.description !== undefined && !eventData.description) {
      return NextResponse.json(
        { message: 'Description is required' },
        { status: 400 }
      );
    }

    // Validate image option if provided
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

    const updatedCount = await updateEvent(id, eventData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Event not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: 'Error updating event', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteEvent(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { message: 'Error deleting event', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid event ID format' },
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

    const updatedCount = await toggleEventFeatured(id, isFeatured);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Event not found' },
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const updatedCount = await incrementEventAttendees(id);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error incrementing attendees:', error);
    return NextResponse.json(
      { message: 'Error incrementing attendees', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}