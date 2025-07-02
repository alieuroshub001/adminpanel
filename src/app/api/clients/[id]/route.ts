import { NextResponse, NextRequest } from 'next/server';
import { getClientLogoById, updateClientLogo, deleteClientLogo } from '@/models/client';
import { ObjectId } from 'mongodb';
import { ClientLogoFormData, LogoLine, ImageSource } from '@/types/clientLogo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid client logo ID format' },
        { status: 400 }
      );
    }

    const clientLogo = await getClientLogoById(id);
    
    if (!clientLogo) {
      return NextResponse.json(
        { message: 'Client logo not found' },
        { status: 404 }
      );
    }

    const serializedClientLogo = {
      ...clientLogo,
      _id: clientLogo._id?.toString(),
    };

    return NextResponse.json(serializedClientLogo);
  } catch (error) {
    console.error('Error fetching client logo:', error);
    return NextResponse.json(
      { message: 'Error fetching client logo', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid client logo ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const clientLogoData: Partial<ClientLogoFormData> = {
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageSource: formData.get('imageSource') as ImageSource,
      line: parseInt(formData.get('line') as string) as LogoLine
    };

    // Validate line number if provided
    if (clientLogoData.line !== undefined && 
        (clientLogoData.line < 1 || clientLogoData.line > 4)) {
      return NextResponse.json(
        { message: 'Line number must be between 1 and 4' },
        { status: 400 }
      );
    }

    // Validate image option if provided
    if (clientLogoData.imageSource === 'upload' && !clientLogoData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (clientLogoData.imageSource !== undefined && clientLogoData.imageSource === ('url' as ImageSource) && !clientLogoData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const updatedCount = await updateClientLogo(id, clientLogoData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Client logo not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating client logo:', error);
    return NextResponse.json(
      { message: 'Error updating client logo', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid client logo ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteClientLogo(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Client logo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting client logo:', error);
    return NextResponse.json(
      { message: 'Error deleting client logo', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}