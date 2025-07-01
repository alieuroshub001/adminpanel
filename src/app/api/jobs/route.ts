import { NextResponse } from 'next/server';
import { getJobs, createJob } from '@/models/job';
import { JobType } from '@/types/job';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || undefined;
    const type = searchParams.get('type') as JobType | undefined;
    const searchQuery = searchParams.get('search') || undefined;

    const jobs = await getJobs(department, type, searchQuery);
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { message: 'Error fetching jobs', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const jobData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      department: formData.get('department') as string,
      type: formData.get('type') as JobType,
      location: formData.get('location') as string,
    };

    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.department || 
        !jobData.type || !jobData.location) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const jobId = await createJob(jobData);
    
    return NextResponse.json(
      { _id: jobId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { message: 'Error creating job', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}