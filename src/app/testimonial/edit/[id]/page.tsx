// src/app/admin/testimonials/edit/[id]/page.tsx
import TestimonialForm from '@/components/Testimonials/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditTestimonialPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/testimonials/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch testimonial data');
  }

  const data = await response.json();

  return <TestimonialForm initialData={data} isEditing />;
}