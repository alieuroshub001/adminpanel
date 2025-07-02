// src/app/admin/events/edit/[id]/page.tsx
import EventForm from '@/components/Events/Form';

interface PageProps {
  params: { id: string };
}

export default async function AdminEditEventPage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/event/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch event data');
  }

  const data = await response.json();

  return <EventForm initialData={data} isEditing />;
}