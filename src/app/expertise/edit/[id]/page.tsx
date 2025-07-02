// src/app/admin/expertise/edit/[id]/page.tsx
import ExpertiseForm from '@/components/Expertise/Form';

interface PageProps {
  params: { id: string };
}

export default async function AdminEditExpertisePage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/expertise/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expertise data');
  }

  const data = await response.json();

  return <ExpertiseForm initialData={data} isEditing />;
}