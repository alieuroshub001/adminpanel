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
import { ContactCardFormData } from '@/types/contactCard';
import { Mail, Phone, MapPin, Globe, MessageSquare, User, Clock } from 'lucide-react';

const contactCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  details: z.string().min(1, 'Details are required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  link: z.string().optional(),
});

type FormValues = z.infer<typeof contactCardSchema>;

interface ContactCardFormProps {
  initialData?: ContactCardFormData & { _id?: string };
  isEditing?: boolean;
}

const iconOptions = [
  { value: 'mail', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { value: 'location', label: 'Location', icon: <MapPin className="w-4 h-4" /> },
  { value: 'website', label: 'Website', icon: <Globe className="w-4 h-4" /> },
  { value: 'social', label: 'Social', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'person', label: 'Person', icon: <User className="w-4 h-4" /> },
  { value: 'clock', label: 'Clock', icon: <Clock className="w-4 h-4" /> },
];

export default function ContactCardForm({ initialData, isEditing = false }: ContactCardFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(contactCardSchema),
    defaultValues: initialData || {
      title: '',
      details: '',
      description: '',
      icon: '',
      link: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('details', initialData.details);
      setValue('description', initialData.description);
      setValue('icon', initialData.icon);
      setValue('link', initialData.link || '');
    }
  }, [initialData, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('details', data.details);
      formData.append('description', data.description);
      formData.append('icon', data.icon);
      if (data.link) formData.append('link', data.link);

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/contact/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/contact', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(`Contact card ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/contact');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Contact Card' : 'Add New Contact Card'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Email Support, Call Us"
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Details *</Label>
          <Input
            id="details"
            {...register('details')}
            placeholder="e.g., support@example.com, +1 (555) 123-4567"
          />
          {errors.details && <p className="text-sm text-red-500">{errors.details.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Short description of this contact method"
            rows={3}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Icon *</Label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-md border ${watch('icon') === option.value ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                onClick={() => setValue('icon', option.value)}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
          {errors.icon && <p className="text-sm text-red-500">{errors.icon.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Link (Optional)</Label>
          <Input
            id="link"
            {...register('link')}
            placeholder="e.g., mailto:support@example.com, tel:+15551234567"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/contact')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Card' : 'Add Card'}
          </Button>
        </div>
      </form>
    </div>
  );
}