// src/app/admin/jobs/edit/[id]/page.tsx
import JobForm from '@/components/Jobs/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditJobPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch job data');
  }

  const data = await response.json();

  return <JobForm initialData={data} isEditing />;
}