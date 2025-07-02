import JobForm from '@/components/Jobs/Form';

interface PageProps {
  params: { id: string };
}

export default async function AdminEditJobPage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch job data');
  }

  const data = await response.json();

  return <JobForm initialData={data} isEditing />;
}