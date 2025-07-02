'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProjectFormData } from '@/types/project';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  imageOption: z.enum(['upload', 'url']),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['completed', 'ongoing', 'upcoming']),
  description: z.string().min(1, 'Description is required'),
  longDescription: z.string().min(1, 'Long description is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  highlights: z.array(z.string()).min(1, 'At least one highlight is required'),
  date: z.string().min(1, 'Date is required'),
  featured: z.boolean(),
});

type FormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: ProjectFormData & { _id?: string };
  isEditing?: boolean;
}

export default function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [technologiesInput, setTechnologiesInput] = useState(initialData?.technologies?.join(', ') || '');
  const [highlightsInput, setHighlightsInput] = useState(initialData?.highlights?.join('\n') || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || '',
      image: initialData?.image || '',
      imageOption: initialData?.imageOption || 'url',
      category: initialData?.category || '',
      status: initialData?.status || 'completed',
      description: initialData?.description || '',
      longDescription: initialData?.longDescription || '',
      technologies: initialData?.technologies || [],
      highlights: initialData?.highlights || [],
      date: initialData?.date || '',
      featured: typeof initialData?.featured === 'boolean' ? initialData.featured : false,
      imageFile: undefined,
    }
  });

  const imageOption = watch('imageOption');

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('image', initialData.image || '');
      setValue('imageOption', initialData.imageOption || 'url');
      setValue('category', initialData.category);
      setValue('status', initialData.status);
      setValue('description', initialData.description);
      setValue('longDescription', initialData.longDescription);
      setValue('technologies', initialData.technologies || []);
      setValue('highlights', initialData.highlights || []);
      setValue('date', initialData.date);
      setValue('featured', initialData.featured || false);
      setImagePreview(initialData.image || '');
      setTechnologiesInput(initialData.technologies?.join(', ') || '');
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

  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTechnologiesInput(value);
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
    setValue('technologies', technologies);
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
      formData.append('category', data.category);
      formData.append('status', data.status);
      formData.append('description', data.description);
      formData.append('longDescription', data.longDescription);
      formData.append('technologies', JSON.stringify(data.technologies));
      formData.append('highlights', JSON.stringify(data.highlights));
      formData.append('date', data.date);
      formData.append('featured', data.featured.toString());
      formData.append('imageOption', data.imageOption);

      if (data.imageOption === 'upload' && data.imageFile) {
        formData.append('imageFile', data.imageFile);
      } else if (data.imageOption === 'url') {
        formData.append('image', data.image || '');
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/projects/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/projects', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(`Project ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/project');
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
        {isEditing ? 'Edit Project' : 'Add New Project'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Project title"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="e.g., Web Development, Mobile App"
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
            </select>
            {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Project Image</Label>
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

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief project description"
            rows={3}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longDescription">Detailed Description *</Label>
          <Textarea
            id="longDescription"
            {...register('longDescription')}
            placeholder="Detailed project description"
            rows={5}
          />
          {errors.longDescription && <p className="text-sm text-red-500">{errors.longDescription.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="technologies">Technologies (comma separated) *</Label>
          <Input
            id="technologies"
            value={technologiesInput}
            onChange={handleTechnologiesChange}
            placeholder="e.g., React, Node.js, MongoDB"
          />
          {errors.technologies && <p className="text-sm text-red-500">{errors.technologies.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="highlights">Key Highlights (one per line) *</Label>
          <Textarea
            id="highlights"
            value={highlightsInput}
            onChange={handleHighlightsChange}
            placeholder="List key project highlights"
            rows={5}
          />
          {errors.highlights && <p className="text-sm text-red-500">{errors.highlights.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            {...register('featured')}
          />
          <Label htmlFor="featured">Featured Project</Label>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/project')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}