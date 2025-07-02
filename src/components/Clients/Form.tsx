'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogoLine, ImageSource } from '@/types/clientLogo';
import Image from 'next/image';

const clientLogoSchema = z.object({
  line: z.number().min(1).max(4),
  imageOption: z.enum(['upload', 'link']),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof clientLogoSchema>;

interface ClientLogoFormProps {
  initialData?: {
    _id?: string;
    image: string;
    imageSource: ImageSource;
    line: LogoLine;
  };
  isEditing?: boolean;
}

export default function ClientLogoForm({ initialData, isEditing = false }: ClientLogoFormProps) {
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
    resolver: zodResolver(clientLogoSchema),
    defaultValues: {
      line: initialData?.line || 1,
      imageOption: initialData?.imageSource || 'link',
      image: initialData?.image || '',
    }
  });

  const imageOption = watch('imageOption');

  useEffect(() => {
    if (initialData) {
      setValue('line', initialData.line);
      setValue('imageOption', initialData.imageSource);
      setValue('image', initialData.image);
      setImagePreview(initialData.image);
    }
  }, [initialData, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('imageFile', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('line', data.line.toString());
      formData.append('imageSource', data.imageOption);

      if (data.imageOption === 'upload' && data.imageFile) {
        formData.append('imageFile', data.imageFile);
      } else if (data.imageOption === 'link') {
        formData.append('image', data.image || '');
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/clients/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/clients', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(`Client logo ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/client');
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
        {isEditing ? 'Edit Client Logo' : 'Add New Client Logo'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="line">Line Number *</Label>
          <select
            id="line"
            {...register('line', { valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="1">Line 1</option>
            <option value="2">Line 2</option>
            <option value="3">Line 3</option>
            <option value="4">Line 4</option>
          </select>
          {errors.line && <p className="text-sm text-red-500">{errors.line.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Image Source *</Label>
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="image-url"
                value="link"
                checked={imageOption === 'link'}
                onChange={() => setValue('imageOption', 'link')}
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

          {imageOption === 'link' ? (
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
                    width={400}
                    height={160}
                    className="h-40 w-full object-contain rounded-md"
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
                    width={400}
                    height={160}
                    className="h-40 w-full object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/client')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Logo' : 'Add Logo'}
          </Button>
        </div>
      </form>
    </div>
  );
}