import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import TeamMember from '@/models/TeamMember';
import { uploadImage } from '@/lib/uploadImage';

// GET all team members
export async function GET() {
  await connectToDB();

  try {
    const team = await TeamMember.find().sort({ createdAt: -1 });
    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST: Create a new team member
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    let { image, imageSource, ...rest } = body;

    if (imageSource === 'upload' && image.startsWith('data:')) {
      image = await uploadImage(image, 'team');
    }

    const newMember = await TeamMember.create({ ...rest, image, imageSource });
    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}

// PUT: Update team member
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const { _id, image, imageSource, ...rest } = await req.json();

    let finalImage = image;
    if (imageSource === 'upload' && image.startsWith('data:')) {
      finalImage = await uploadImage(image, 'team');
    }

    const updated = await TeamMember.findByIdAndUpdate(
      _id,
      { ...rest, image: finalImage, imageSource },
      { new: true }
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE: Remove team member
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await TeamMember.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Team member deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
