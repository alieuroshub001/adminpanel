import { NextResponse } from 'next/server';
import { createClientLogo, getClientLogos } from '@/models/client';
import { ClientLogoFormData, ImageSource, LogoLine } from '@/types/clientLogo';

export async function GET() {
  try {
    const clientLogos = await getClientLogos();
    
    // Convert ObjectId to string for client-side
    const serializedClientLogos = clientLogos.map(item => ({
      ...item,
      _id: item._id?.toString(),
    }));
    
    return NextResponse.json(serializedClientLogos);
  } catch (error) {
    console.error('Error fetching client logos:', error);
    return NextResponse.json(
      { message: 'Error fetching client logos', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const clientLogoData: ClientLogoFormData = {
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageSource: formData.get('imageSource') as ImageSource,
      line: parseInt(formData.get('line') as string) as LogoLine
    };

    // Validate required fields
    if (!clientLogoData.line || (clientLogoData.line < 1 || clientLogoData.line > 4)) {
      return NextResponse.json(
        { message: 'Line number must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Validate image option
    if (!clientLogoData.imageSource) {
      return NextResponse.json(
        { message: 'Please select an image option (upload or URL)' },
        { status: 400 }
      );
    }

    if (clientLogoData.imageSource === 'upload' && !clientLogoData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (clientLogoData.imageSource === 'link' && !clientLogoData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const clientLogoId = await createClientLogo(clientLogoData);
    
    return NextResponse.json(
      { _id: clientLogoId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating client logo:', error);
    return NextResponse.json(
      { message: 'Error creating client logo', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}