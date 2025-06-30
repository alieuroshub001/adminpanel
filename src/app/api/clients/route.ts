import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import ClientLogo from '@/models/ClientLogo';
import { uploadImage } from '@/lib/uploadImage';

// GET all client logos or filter by line
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const line = searchParams.get('line');

  try {
    if (line) {
      const filtered = await ClientLogo.find({ line: parseInt(line) });
      return NextResponse.json(filtered, { status: 200 });
    }

    const allClients = await ClientLogo.find().sort({ createdAt: -1 });
    return NextResponse.json(allClients, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch client logos' }, { status: 500 });
  }
}

// POST: create a client logo
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { image, imageSource, line } = body;

    if (imageSource === 'upload' && image.startsWith('data:')) {
      image = await uploadImage(image, 'clients');
    }

    const newClient = await ClientLogo.create({
      image,
      imageSource,
      line,
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create client logo' }, { status: 500 });
  }
}

// PUT: update an existing logo
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    const { _id, image, imageSource, ...rest } = body;

    let finalImage = image;
    if (imageSource === 'upload' && image.startsWith('data:')) {
      finalImage = await uploadImage(image, 'clients');
    }

    const updated = await ClientLogo.findByIdAndUpdate(
      _id,
      { ...rest, image: finalImage, imageSource },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update logo' }, { status: 500 });
  }
}

// DELETE logo by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await ClientLogo.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Client logo deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 });
  }
}
