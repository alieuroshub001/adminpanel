import { NextResponse, NextRequest } from 'next/server';
import { getContactCardById, updateContactCard, deleteContactCard } from '@/models/contactCard';
import { ObjectId } from 'mongodb';
import { ContactCardFormData } from '@/types/contactCard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid contact card ID format' },
        { status: 400 }
      );
    }

    const contactCard = await getContactCardById(id);
    
    if (!contactCard) {
      return NextResponse.json(
        { message: 'Contact card not found' },
        { status: 404 }
      );
    }

    const serializedContactCard = {
      ...contactCard,
      _id: contactCard._id?.toString(),
    };

    return NextResponse.json(serializedContactCard);
  } catch (error) {
    console.error('Error fetching contact card:', error);
    return NextResponse.json(
      { message: 'Error fetching contact card', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid contact card ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const contactCardData: Partial<ContactCardFormData> = {
      title: formData.get('title') as string,
      details: formData.get('details') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      link: formData.get('link') as string || undefined
    };

    // Validate required fields if provided
    if (contactCardData.title !== undefined && !contactCardData.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    if (contactCardData.details !== undefined && !contactCardData.details) {
      return NextResponse.json(
        { message: 'Details are required' },
        { status: 400 }
      );
    }
    if (contactCardData.description !== undefined && !contactCardData.description) {
      return NextResponse.json(
        { message: 'Description is required' },
        { status: 400 }
      );
    }
    if (contactCardData.icon !== undefined && !contactCardData.icon) {
      return NextResponse.json(
        { message: 'Icon is required' },
        { status: 400 }
      );
    }

    const updatedCount = await updateContactCard(id, contactCardData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Contact card not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating contact card:', error);
    return NextResponse.json(
      { message: 'Error updating contact card', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid contact card ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteContactCard(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Contact card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting contact card:', error);
    return NextResponse.json(
      { message: 'Error deleting contact card', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}