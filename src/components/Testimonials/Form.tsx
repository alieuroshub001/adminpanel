'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { TestimonialFormData } from '@/types/testimonial';

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  isFeatured: z.boolean(),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  imageOption: z.enum(['upload', 'url']).optional(), // made optional
});

type FormValues = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  initialData?: TestimonialFormData & { _id?: string };
  isEditing?: boolean;
}

export default function TestimonialForm({ initialData, isEditing = false }: TestimonialFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: initialData || {
      name: '',
      role: '',
      content: '',
      rating: 5,
      isFeatured: false,
      image: '',
      imageOption: undefined,
    }
  });

  const imageOption = watch('imageOption');
  const rating = watch('rating');

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('role', initialData.role);
      setValue('content', initialData.content);
      setValue('rating', initialData.rating);
      setValue('isFeatured', initialData.isFeatured || false);
      setValue('image', initialData.image || '');
      setValue('imageOption', initialData.imageOption || undefined);
      setImagePreview(initialData.image || '');
    }
  }, [initialData, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('imageFile', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('role', data.role);
      formData.append('content', data.content);
      formData.append('rating', data.rating.toString());
      formData.append('isFeatured', String(data.isFeatured));

      if (data.imageOption) {
        formData.append('imageOption', data.imageOption);

        if (data.imageOption === 'upload' && data.imageFile) {
          formData.append('imageFile', data.imageFile);
        } else if (data.imageOption === 'url') {
          formData.append('image', data.image || '');
        }
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/testimonials/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/testimonials', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) throw new Error(response.statusText);

      toast.success(`Testimonial ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/testimonial');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} placeholder="Enter person's name" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input id="role" {...register('role')} placeholder="Enter person's role" />
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Profile Image (optional)</Label>
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="image-url"
                value="url"
                checked={imageOption === 'url'}
                onChange={() => setValue('imageOption', 'url')}
              />
              <Label htmlFor="image-url">Image URL</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="image-upload"
                value="upload"
                checked={imageOption === 'upload'}
                onChange={() => setValue('imageOption', 'upload')}
              />
              <Label htmlFor="image-upload">Upload Image</Label>
            </div>
          </div>

          {imageOption === 'url' ? (
            <div className="space-y-2">
              <Input id="image" {...register('image')} placeholder="Enter image URL" />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={160}
                    height={160}
                    className="h-40 w-40 object-cover rounded-full"
                  />
                </div>
              )}
            </div>
          ) : imageOption === 'upload' ? (
            <div className="space-y-2">
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={160}
                    height={160}
                    className="h-40 w-40 object-cover rounded-full"
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Testimonial Content *</Label>
          <Textarea
            id="content"
            {...register('content')}
            placeholder="Enter the testimonial content"
            rows={5}
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={watch('isFeatured')}
              onCheckedChange={(checked) => setValue('isFeatured', checked)}
            />
            <Label htmlFor="isFeatured">Featured Testimonial</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/testimonial')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Testimonial' : 'Add Testimonial'}
          </Button>
        </div>
      </form>
    </div>
  );
}
