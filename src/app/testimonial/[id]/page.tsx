// src/app/testimonial/[id]/page.tsx
import { notFound } from 'next/navigation';
import TestimonialView from '@/components/Testimonials/View';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminViewTestimonialPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/testimonials/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return notFound();
  }

  const data = await response.json();

  return <TestimonialView testimonial={data} />;
}