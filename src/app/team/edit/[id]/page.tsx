// src/app/admin/team/edit/[id]/page.tsx
import TeamMemberForm from '@/components/Team/Form';

interface PageProps {
  params: { id: string };
}

export default async function AdminEditTeamMemberPage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/team/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch team member data');
  }

  const data = await response.json();

  return <TeamMemberForm initialData={data} isEditing />;
}