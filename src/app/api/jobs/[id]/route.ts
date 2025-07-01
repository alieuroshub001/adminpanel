import { NextResponse, NextRequest } from 'next/server';
import { getJobById, updateJob, deleteJob } from '@/models/job';
import { ObjectId } from 'mongodb';
import { JobType } from '@/types/job';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    const job = await getJobById(id);
    
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { message: 'Error fetching job', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const jobData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      department: formData.get('department') as string,
      type: formData.get('type') as JobType,
      location: formData.get('location') as string,
    };

    // Validate required fields if provided
    if (jobData.title !== undefined && !jobData.title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }
    if (jobData.description !== undefined && !jobData.description) {
      return NextResponse.json(
        { message: 'Description is required' },
        { status: 400 }
      );
    }
    if (jobData.department !== undefined && !jobData.department) {
      return NextResponse.json(
        { message: 'Department is required' },
        { status: 400 }
      );
    }
    if (jobData.type !== undefined && !jobData.type) {
      return NextResponse.json(
        { message: 'Type is required' },
        { status: 400 }
      );
    }
    if (jobData.location !== undefined && !jobData.location) {
      return NextResponse.json(
        { message: 'Location is required' },
        { status: 400 }
      );
    }

    const updatedCount = await updateJob(id, jobData);
    
    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Job not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { message: 'Error updating job', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid job ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteJob(id);
    
    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { message: 'Error deleting job', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}