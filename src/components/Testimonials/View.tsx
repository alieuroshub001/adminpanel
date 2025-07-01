'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

interface TestimonialViewProps {
  testimonial: {
    _id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    isFeatured: boolean;
    image?: string;
    createdAt: string;
  };
}

export default function TestimonialView({ testimonial }: TestimonialViewProps) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Testimonial Details</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/testimonial/edit/${testimonial._id}`)}
        >
          Edit Testimonial
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <Avatar className="h-40 w-40">
            <AvatarImage src={testimonial.image} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <h2 className="text-xl font-semibold">Name</h2>
            <p>{testimonial.name}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Role</h2>
            <p>{testimonial.role}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Rating</h2>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < testimonial.rating ? 'text-yellow-400 text-2xl' : 'text-gray-300 text-2xl'}>
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Featured</h2>
            <p>{testimonial.isFeatured ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Testimonial Content</h2>
        <p className="whitespace-pre-line">{testimonial.content}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Created At</h2>
        <p>{new Date(testimonial.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}