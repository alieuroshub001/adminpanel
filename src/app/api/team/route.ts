import { NextResponse } from 'next/server';
import { getTeamMembers, createTeamMember } from '@/models/teamMember';

export async function GET() {
  try {
    const teamMembers = await getTeamMembers();
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { message: 'Error fetching team members', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const memberData = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      image: formData.get('image') as string || '',
      imageFile: formData.get('imageFile') as File || undefined,
      imageOption: formData.get('imageOption') as 'upload' | 'url',
      bio: formData.get('bio') as string || undefined,
      longBio: formData.get('longBio') as string || undefined,
      social: JSON.parse(formData.get('social') as string) || {},
      location: formData.get('location') as string || undefined,
      experience: formData.get('experience') as string || undefined,
      achievements: JSON.parse(formData.get('achievements') as string) || [],
      skills: JSON.parse(formData.get('skills') as string) || [],
    };

    // Validate required fields
    if (!memberData.name || !memberData.role) {
      return NextResponse.json(
        { message: 'Name and role are required' },
        { status: 400 }
      );
    }

    // Validate image option if provided
    if (memberData.imageOption === 'upload' && !memberData.imageFile) {
      return NextResponse.json(
        { message: 'Image file is required when choosing upload option' },
        { status: 400 }
      );
    }

    if (memberData.imageOption === 'url' && !memberData.image) {
      return NextResponse.json(
        { message: 'Image URL is required when choosing URL option' },
        { status: 400 }
      );
    }

    const memberId = await createTeamMember(memberData);
    
    return NextResponse.json(
      { _id: memberId.toString() }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { message: 'Error creating team member', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}