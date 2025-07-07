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
import { ExpertiseFormData } from '@/types/expertise';
import Image from 'next/image';
import {
  Headphones,
  ClipboardList,
  Database,
  LayoutDashboard,
  HardDrive,
  Search,
  BarChart2,
  Server,
  Code,
  Smartphone,
  Globe,
  Cloud,
  Cpu,
  Users,
  CheckCircle,
  ShoppingCart,
  Paintbrush,
  Shield
} from 'lucide-react';

const iconOptions = [
  { value: 'fa-headphones', label: 'Headphones', icon: <Headphones className="w-4 h-4 mr-2" /> },
  { value: 'fa-clipboard-list', label: 'Clipboard List', icon: <ClipboardList className="w-4 h-4 mr-2" /> },
  { value: 'fa-database', label: 'Database', icon: <Database className="w-4 h-4 mr-2" /> },
  { value: 'fa-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
  { value: 'fa-hard-drive', label: 'Hard Drive', icon: <HardDrive className="w-4 h-4 mr-2" /> },
  { value: 'fa-search', label: 'Search', icon: <Search className="w-4 h-4 mr-2" /> },
  { value: 'fa-chart-bar', label: 'Chart Bar', icon: <BarChart2 className="w-4 h-4 mr-2" /> },
  { value: 'fa-server', label: 'Server', icon: <Server className="w-4 h-4 mr-2" /> },
  { value: 'fa-code', label: 'Code', icon: <Code className="w-4 h-4 mr-2" /> },
  { value: 'fa-mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4 mr-2" /> },
  { value: 'fa-globe', label: 'Globe', icon: <Globe className="w-4 h-4 mr-2" /> },
  { value: 'fa-cloud', label: 'Cloud', icon: <Cloud className="w-4 h-4 mr-2" /> },
  { value: 'fa-cpu', label: 'CPU', icon: <Cpu className="w-4 h-4 mr-2" /> },
  { value: 'fa-users', label: 'Users', icon: <Users className="w-4 h-4 mr-2" /> },
  { value: 'fa-check-circle', label: 'Check Circle', icon: <CheckCircle className="w-4 h-4 mr-2" /> },
  { value: 'fa-shopping-cart', label: 'Shopping Cart', icon: <ShoppingCart className="w-4 h-4 mr-2" /> },
  { value: 'fa-paint-brush', label: 'Paint Brush', icon: <Paintbrush className="w-4 h-4 mr-2" /> },
  { value: 'fa-shield-alt', label: 'Shield', icon: <Shield className="w-4 h-4 mr-2" /> },
];

const expertiseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.enum(['business', 'tech']),
  icon: z.string().min(1, 'Icon is required'),
  path: z.string().min(1, 'Path is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  imageOption: z.enum(['upload', 'url']),
  detailImages: z.array(z.string()).optional(),
  detailImageFiles: z.array(z.instanceof(File)).optional(),
  isFeatured: z.boolean(),
  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      image: z.string(),
      metrics: z.array(z.string()),
    })
  ).optional(),
});

type FormValues = z.infer<typeof expertiseSchema>;

interface ExpertiseFormProps {
  initialData?: ExpertiseFormData & { _id?: string };
  isEditing?: boolean;
}

export default function ExpertiseForm({ initialData, isEditing = false }: ExpertiseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [detailImagesPreviews, setDetailImagesPreviews] = useState<string[]>(initialData?.detailImages || []);
  const [insightsInput, setInsightsInput] = useState(initialData?.insights ? JSON.stringify(initialData.insights, null, 2) : '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(expertiseSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      category: initialData?.category || 'business',
      icon: initialData?.icon || '',
      path: initialData?.path || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      imageOption: initialData?.imageOption || 'url',
      detailImages: initialData?.detailImages || [],
      isFeatured: initialData?.isFeatured || false,
      insights: initialData?.insights || [],
    }
  });

  const imageOption = watch('imageOption');

  useEffect(() => {
    if (initialData) {
      setValue('title', initialData.title);
      setValue('slug', initialData.slug);
      setValue('category', initialData.category);
      setValue('icon', initialData.icon);
      setValue('path', initialData.path);
      setValue('description', initialData.description || '');
      setValue('image', initialData.image || '');
      setValue('imageOption', initialData.imageOption || 'url');
      setValue('detailImages', initialData.detailImages || []);
      setValue('isFeatured', initialData.isFeatured || false);
      setValue('insights', initialData.insights || []);
      setImagePreview(initialData.image || '');
      setDetailImagesPreviews(initialData.detailImages || []);
      setInsightsInput(initialData.insights ? JSON.stringify(initialData.insights, null, 2) : '');
    }
  }, [initialData, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('imageFile', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setValue('detailImageFiles', files);
      const previews = files.map(file => URL.createObjectURL(file));
      setDetailImagesPreviews(previews);
    }
  };

  const handleInsightsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInsightsInput(value);
    try {
      const insights = JSON.parse(value);
      setValue('insights', insights);
    } catch  {
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('slug', data.slug);
      formData.append('category', data.category);
      formData.append('icon', data.icon);
      formData.append('path', data.path);
      formData.append('description', data.description || '');
      formData.append('imageOption', data.imageOption);
      formData.append('isFeatured', data.isFeatured.toString());
      formData.append('insights', JSON.stringify(data.insights || []));

      if (data.imageOption === 'upload' && data.imageFile) {
        formData.append('imageFile', data.imageFile);
      } else if (data.imageOption === 'url') {
        formData.append('image', data.image || '');
      }

      if (data.detailImageFiles && data.detailImageFiles.length > 0) {
        data.detailImageFiles.forEach((file: string | Blob) => {
          formData.append('detailImageFiles', file);
        });
      } else {
        formData.append('detailImages', JSON.stringify(data.detailImages || []));
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/expertise/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/expertise', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(`Expertise ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/expertise');
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
        {isEditing ? 'Edit Expertise' : 'Add New Expertise'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter expertise title"
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="Enter URL slug"
            />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              {...register('category')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="business">Business</option>
              <option value="tech">Tech</option>
            </select>
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

         <div className="space-y-2">
  <Label htmlFor="icon">Icon *</Label>
  <select
    id="icon"
    {...register('icon')}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <option value="">Select an icon</option>
    {iconOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  {errors.icon && <p className="text-sm text-red-500">{errors.icon.message}</p>}
</div>

        </div>

        <div className="space-y-2">
          <Label htmlFor="path">Path *</Label>
          <Input
            id="path"
            {...register('path')}
            placeholder="Enter path (e.g., /business/consulting)"
          />
          {errors.path && <p className="text-sm text-red-500">{errors.path.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Main Image</Label>
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
          <Label>Detail Images</Label>
          <Input
            id="detailImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleDetailImagesChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {detailImagesPreviews.map((preview, index) => (
              <div key={index}>
                <Image
                  src={preview}
                  alt={`Detail preview ${index + 1}`}
                  width={400}
                  height={128}
                  className="h-32 w-full object-cover rounded-md"
                  style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: '0.375rem' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              {...register('isFeatured')}
            />
            <Label htmlFor="isFeatured">Featured Expertise</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="insights">Insights (JSON format)</Label>
          <Textarea
            id="insights"
            value={insightsInput}
            onChange={handleInsightsChange}
            placeholder="Enter insights in JSON format"
            rows={8}
          />
          {errors.insights && <p className="text-sm text-red-500">{errors.insights.message}</p>}
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/expertise')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Expertise' : 'Add Expertise'}
          </Button>
        </div>
      </form>
    </div>
  );
}