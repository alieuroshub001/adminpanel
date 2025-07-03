'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { EventFormData } from '@/types/event';
import Image from 'next/image';
import { Gift, Trophy, Award, PartyPopper, Bus } from 'lucide-react';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  imageOption: z.enum(['upload', 'url']),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  attendees: z.number().min(0, 'Attendees must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  highlights: z.array(z.string()).min(1, 'At least one highlight is required'),
  isFeatured: z.boolean(),
});

type FormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: EventFormData & { _id?: string };
  isEditing?: boolean;
}

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const router = useRouter();
  

 const categoryOptions = [
  { id: 'trips', label: 'Company Trips', icon: Bus },
  { id: 'anniversaries', label: 'Anniversaries', icon: Gift },
  { id: 'employee-month', label: 'Employee of the Month', icon: Trophy },
  { id: 'achievements', label: 'Team Achievements', icon: Award },
  { id: 'celebrations', label: 'Celebrations', icon: PartyPopper }
];

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [highlightsInput, setHighlightsInput] = useState(initialData?.highlights?.join('\n') || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: '',
      image: '',
      imageOption: 'url',
      date: '',
      location: '',
      attendees: 0,
      category: '',
      description: '',
      highlights: [],
      isFeatured: false,
    }
  });

  const imageOption = watch('imageOption');

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('image', initialData.image || '');
      setValue('imageOption', initialData.imageOption || 'url');
      setValue('date', initialData.date);
      setValue('location', initialData.location);
      setValue('attendees', initialData.attendees || 0);
      setValue('category', initialData.category);
      setValue('description', initialData.description);
      setValue('highlights', initialData.highlights || []);
      setValue('isFeatured', initialData.isFeatured ?? false);
      setImagePreview(initialData.image || '');
      setHighlightsInput(initialData.highlights?.join('\n') || '');
    }
  }, [initialData, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('imageFile', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleHighlightsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setHighlightsInput(value);
    const highlights = value.split('\n').filter(highlight => highlight.trim() !== '');
    setValue('highlights', highlights);
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('date', data.date);
      formData.append('location', data.location);
      formData.append('attendees', data.attendees.toString());
      formData.append('category', data.category);
      formData.append('description', data.description);
      formData.append('highlights', JSON.stringify(data.highlights));
      formData.append('isFeatured', data.isFeatured.toString());
      formData.append('imageOption', data.imageOption);

      if (data.imageOption === 'upload' && data.imageFile) {
        formData.append('imageFile', data.imageFile);
      } else if (data.imageOption === 'url') {
        formData.append('image', data.image || '');
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/event/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/event', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(`Event ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/event');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Event' : 'Add New Event'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Event title"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

         <div className="space-y-2">
  <Label htmlFor="category">Category *</Label>
  <select
    id="category"
    {...register('category')}
    className="w-full border rounded px-3 py-2 bg-white"
  >
    <option value="">Select a category</option>
    {categoryOptions.map(cat => (
      <option key={cat.id} value={cat.id}>
        {cat.label}
      </option>
    ))}
  </select>
  {errors.category && (
    <p className="text-sm text-red-500">{errors.category.message}</p>
  )}
</div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="datetime-local"
              {...register('date')}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Event location"
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Event Image</Label>
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
              <Input
                id="image"
                {...register('image')}
                placeholder="Enter image URL"
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={600}
                    height={160}
                    className="h-40 w-full object-cover rounded-md"
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                </div>
              )}
            </div>
          ) : (
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
                    width={600}
                    height={160}
                    className="h-40 w-full object-cover rounded-md"
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="attendees">Expected Attendees</Label>
            <Input
              id="attendees"
              type="number"
              min="0"
              {...register('attendees', { valueAsNumber: true })}
            />
            {errors.attendees && <p className="text-sm text-red-500">{errors.attendees.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Event description"
            rows={4}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="highlights">Key Highlights (one per line) *</Label>
          <Textarea
            id="highlights"
            value={highlightsInput}
            onChange={handleHighlightsChange}
            placeholder="List key event highlights"
            rows={5}
          />
          {errors.highlights && <p className="text-sm text-red-500">{errors.highlights.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            {...register('isFeatured')}
          />
          <Label htmlFor="isFeatured">Featured Event</Label>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/event')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Add Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}