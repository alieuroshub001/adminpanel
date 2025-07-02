// src/app/admin/projects/edit/[id]/page.tsx
import ProjectForm from '@/components/Projects/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProjectPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/projects/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project data');
  }

  const data = await response.json();

  return <ProjectForm initialData={data} isEditing />;
}