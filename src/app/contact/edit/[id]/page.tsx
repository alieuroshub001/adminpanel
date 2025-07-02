// src/app/admin/contact-cards/edit/[id]/page.tsx
import ContactCardForm from '@/components/Contact/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditContactCardPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/contact/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch contact card data');
  }

  const data = await response.json();

  return <ContactCardForm initialData={data} isEditing />;
}