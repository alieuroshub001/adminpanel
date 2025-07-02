// src/app/client/edit/[id]/page.tsx (or wherever this file is located)
import ClientLogoForm from '@/components/Clients/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditClientLogoPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/clients/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch client logo data');
  }

  const data = await response.json();

  return <ClientLogoForm initialData={data} isEditing />;
}