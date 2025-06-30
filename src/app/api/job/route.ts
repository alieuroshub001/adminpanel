import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Job from '@/models/Job';

// GET all jobs or by ID
export async function GET(req: NextRequest) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const job = await Job.findById(id);
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      return NextResponse.json(job, { status: 200 });
    }

    const jobs = await Job.find().sort({ createdAt: -1 });
    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST: Create a job
export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const body = await req.json();
    const newJob = await Job.create(body);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

// PUT: Update a job
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    const { _id, ...rest } = await req.json();
    const updated = await Job.findByIdAndUpdate(_id, rest, { new: true });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE: Delete a job by ID
export async function DELETE(req: NextRequest) {
  await connectToDB();

  try {
    const { _id } = await req.json();
    await Job.findByIdAndDelete(_id);
    return NextResponse.json({ message: 'Job deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
