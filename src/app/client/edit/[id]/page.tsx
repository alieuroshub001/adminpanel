import ClientLogoForm from '@/components/Clients/Form';

interface PageProps {
  params: { id: string };
}

export default async function AdminEditClientLogoPage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/clients/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch client logo data');
  }

  const data = await response.json();

  return <ClientLogoForm initialData={data} isEditing />;
}