import TestimonialForm from '@/components/Testimonials/Form';

interface PageProps {
  params: { id: string };
}

export default async function AdminEditTestimonialPage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/testimonials/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch testimonial data');
  }

  const data = await response.json();

  return <TestimonialForm initialData={data} isEditing />;
}