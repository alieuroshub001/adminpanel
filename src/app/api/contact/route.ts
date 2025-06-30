import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import ContactCard from '@/models/ContactCard';

// GET all contact cards
export async function GET() {
  await connectToDB();

  try {
    const cards = await ContactCard.find().sort({ createdAt: 1 });
    return NextResponse.json(cards, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 });
  }
}

// POST: create a contact card
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    const newCard = await ContactCard.create(body);
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact card' }, { status: 500 });
  }
}

// PUT: update a contact card
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const { _id, ...rest } = await req.json();
    const updated = await ContactCard.findByIdAndUpdate(_id, rest, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contact card' }, { status: 500 });
  }
}

// DELETE a contact card by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await ContactCard.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Contact card deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete contact card' }, { status: 500 });
  }
}
