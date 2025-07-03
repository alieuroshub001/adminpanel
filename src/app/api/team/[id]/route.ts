import { NextResponse, NextRequest } from 'next/server';
import { getTeamMemberById, updateTeamMember, deleteTeamMember } from '@/models/teams';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid team member ID format' },
        { status: 400 }
      );
    }

    const member = await getTeamMemberById(id);

    if (!member) {
      return NextResponse.json(
        { message: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { message: 'Error fetching team member', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid team member ID format' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const featuredFlag = formData.get('featured') === 'true';

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
      featured: featuredFlag,
      department: !featuredFlag ? (formData.get('department') as string || undefined) : undefined, // ✅ added
    };

    // Required field validation
    if (!memberData.name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    if (!memberData.role) {
      return NextResponse.json({ message: 'Role is required' }, { status: 400 });
    }

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

    if (!featuredFlag && !memberData.department) {
      return NextResponse.json(
        { message: 'Department is required for non-featured members' },
        { status: 400 }
      );
    }

    const updatedCount = await updateTeamMember(id, memberData);

    if (updatedCount === 0) {
      return NextResponse.json(
        { message: 'Team member not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { message: 'Error updating team member', error: error instanceof Error ? error.message : 'Unknown error' },
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
        { message: 'Invalid team member ID format' },
        { status: 400 }
      );
    }

    const deletedCount = await deleteTeamMember(id);

    if (deletedCount === 0) {
      return NextResponse.json(
        { message: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { message: 'Error deleting team member', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
