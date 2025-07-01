import { NextResponse } from 'next/server';
import { createContactCard, getContactCards } from '@/models/contactCard';
import { ContactCardFormData } from '@/types/contactCard';

export async function GET() {
  try {
    const contactCards = await getContactCards();
    
    // Convert ObjectId to string for client-side
    const serializedContactCards = contactCards.map(item => ({
      ...item,
      _id: item._id?.toString(),
    }));
    
    return NextResponse.json(serializedContactCards);
  } catch (error) {
    console.error('Error fetching contact cards:', error);
    return NextResponse.json(
      { message: 'Error fetching contact cards', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const contactCardData: ContactCardFormData = {
      title: formData.get('title') as string,
      details: formData.get('details') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string,
      link: formData.get('link') as string || undefined
    };

    // Validate required fields
    if (!contactCardData.title || !contactCardData.details || 
        !contactCardData.description || !contactCardData.icon) {
      return NextResponse.json(
        { message: 'Title, details, description, and icon are required' },
        { status: 400 }
      );
    }

    const contactCardId = await createContactCard(contactCardData);
    
    return NextResponse.json(
      { _id: contactCardId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contact card:', error);
    return NextResponse.json(
      { message: 'Error creating contact card', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}