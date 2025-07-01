import { notFound } from 'next/navigation';
import TestimonialView from '@/components/Testimonials/View';

interface PageProps {
  params: { id: string };
}

export default async function AdminViewTestimonialPage({ params }: PageProps) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/testimonials/${params.id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return notFound();
  }

  const data = await response.json();

  return <TestimonialView testimonial={data} />;
}