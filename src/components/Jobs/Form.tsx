'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { JobType } from '@/types/job';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  department: z.string().min(1, 'Department is required'),
  type: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']),
  location: z.string().min(1, 'Location is required'),
});

type FormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: {
    _id?: string;
    title: string;
    description: string;
    department: string;
    type: JobType;
    location: string;
  };
  isEditing?: boolean;
}

export default function JobForm({ initialData, isEditing = false }: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      department: initialData?.department || '',
      type: initialData?.type || 'Full-time',
      location: initialData?.location || '',
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('department', data.department);
      formData.append('type', data.type);
      formData.append('location', data.location);

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/jobs/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/jobs', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(`Job ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/job');
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
        {isEditing ? 'Edit Job' : 'Add New Job'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter job title"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Enter department"
            />
            {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">Job Type *</Label>
            <select
              id="type"
              {...register('type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Enter location"
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter job description"
            rows={6}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/job')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Job' : 'Add Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}