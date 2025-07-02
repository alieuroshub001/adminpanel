// src/app/admin/events/edit/[id]/page.tsx
import EventForm from '@/components/Events/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditEventPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/event/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch event data');
  }

  const data = await response.json();

  return <EventForm initialData={data} isEditing />;
}