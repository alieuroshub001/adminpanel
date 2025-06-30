import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Expertise from '@/models/Expertise';
import { uploadImage } from '@/lib/uploadImage';

// GET all expertises or filter by category/slug
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const category = searchParams.get('category');

  try {
    if (slug) {
      const data = await Expertise.findOne({ slug });
      if (!data) return NextResponse.json({ error: 'Expertise not found' }, { status: 404 });
      return NextResponse.json(data, { status: 200 });
    }

    if (category) {
      const filtered = await Expertise.find({ category });
      return NextResponse.json(filtered, { status: 200 });
    }

    const all = await Expertise.find().sort({ createdAt: -1 });
    return NextResponse.json(all, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expertises' }, { status: 500 });
  }
}

// POST: Create a new expertise
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { cardImage, detailImage, imageSource, ...rest } = body;

    if (imageSource === 'upload') {
      if (cardImage?.startsWith('data:')) {
        cardImage = await uploadImage(cardImage, 'expertise/cards');
      }
      if (detailImage?.startsWith('data:')) {
        detailImage = await uploadImage(detailImage, 'expertise/detail');
      }
    }

    const newExpertise = await Expertise.create({
      ...rest,
      cardImage,
      detailImage,
      imageSource,
    });

    return NextResponse.json(newExpertise, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expertise' }, { status: 500 });
  }
}

// PUT: Update an expertise
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const { _id, cardImage, detailImage, imageSource, ...rest } = await req.json();

    let finalCardImage = cardImage;
    let finalDetailImage = detailImage;

    if (imageSource === 'upload') {
      if (cardImage?.startsWith('data:')) {
        finalCardImage = await uploadImage(cardImage, 'expertise/cards');
      }
      if (detailImage?.startsWith('data:')) {
        finalDetailImage = await uploadImage(detailImage, 'expertise/detail');
      }
    }

    const updated = await Expertise.findByIdAndUpdate(
      _id,
      {
        ...rest,
        cardImage: finalCardImage,
        detailImage: finalDetailImage,
        imageSource,
      },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update expertise' }, { status: 500 });
  }
}

// DELETE: Remove expertise by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await Expertise.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Expertise deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expertise' }, { status: 500 });
  }
}
