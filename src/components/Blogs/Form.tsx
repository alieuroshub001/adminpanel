'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BlogPostFormData } from '@/types/blogPost';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Image from 'next/image';
import RichTextEditor from '@/components/Blogs/RichTextEditor';

const blogPostSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  imageSource: z.enum(['upload', 'link']),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()),
  date: z.string().min(1, 'Date is required'),
  featured: z.boolean(),
  author: z.object({
    name: z.string().min(1, 'Author name is required'),
    bio: z.string().min(1, 'Author bio is required'),
    avatar: z.string().optional(),
    social: z.object({
      twitter: z.string().optional(),
      linkedin: z.string().optional()
    })
  })
});

type FormValues = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  initialData?: BlogPostFormData & { _id?: string };
  isEditing?: boolean;
}

export default function BlogPostForm({ initialData, isEditing = false }: BlogPostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: initialData || {
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      image: '',
      imageSource: 'link',
      category: '',
      tags: [],
      date: new Date().toISOString().split('T')[0],
      featured: false,
      author: {
        name: '',
        bio: '',
        avatar: '',
        social: {
          twitter: '',
          linkedin: ''
        }
      }
    }
  });

  const imageSource = watch('imageSource');
  const content = watch('content');

  useEffect(() => {
    if (initialData) {
      setValue('slug', initialData.slug);
      setValue('title', initialData.title);
      setValue('excerpt', initialData.excerpt);
      setValue('content', initialData.content);
      setValue('image', initialData.image || '');
      setValue('imageSource', initialData.imageSource || 'link');
      setValue('category', initialData.category);
      setValue('tags', initialData.tags || []);
      setValue('date', initialData.date);
      setValue('featured', initialData.featured || false);
      setValue('author', initialData.author);
      setTagsInput(initialData.tags?.join(', ') || '');
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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setValue('tags', tags);
  };

  const handleContentChange = (content: string) => {
    setValue('content', content);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('slug', data.slug);
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt);
      formData.append('content', data.content);
      formData.append('imageSource', data.imageSource);
      formData.append('category', data.category);
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('date', data.date);
      formData.append('featured', String(data.featured));
      formData.append('author.name', data.author.name);
      formData.append('author.bio', data.author.bio);
      formData.append('author.avatar', data.author.avatar || '');
      formData.append('author.social.twitter', data.author.social.twitter || '');
      formData.append('author.social.linkedin', data.author.social.linkedin || '');

      if (data.imageSource === 'upload' && data.imageFile) {
        formData.append('imageFile', data.imageFile);
      } else if (data.imageSource === 'link') {
        formData.append('image', data.image || '');
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/blogs/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/blogs', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(isEditing ? 'Blog post updated successfully' : 'Blog post created successfully');
      router.push('/blog');
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
        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter blog post title"
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

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="Enter category"
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Publish Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500">Example: react, nextjs, typescript</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={watch('featured')}
              onCheckedChange={(checked) => setValue('featured', checked)}
            />
            <Label htmlFor="featured">Featured Post</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Featured Image</Label>
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="image-link"
                value="link"
                checked={imageSource === 'link'}
                onChange={() => setValue('imageSource', 'link')}
              />
              <Label htmlFor="image-link">Image URL</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="image-upload"
                value="upload"
                checked={imageSource === 'upload'}
                onChange={() => setValue('imageSource', 'upload')}
              />
              <Label htmlFor="image-upload">Upload Image</Label>
            </div>
          </div>

          {imageSource === 'link' ? (
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
                    width={320}
                    height={160}
                    className="h-40 object-cover rounded"
                    style={{ width: '100%', height: 'auto' }}
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
                    width={320}
                    height={160}
                    className="h-40 object-cover rounded"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Textarea
            id="excerpt"
            {...register('excerpt')}
            placeholder="Enter a short excerpt"
            rows={3}
          />
          {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Write your blog post content here"
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Author Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="author-name">Name *</Label>
              <Input
                id="author-name"
                {...register('author.name')}
                placeholder="Author name"
              />
              {errors.author?.name && <p className="text-sm text-red-500">{errors.author.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-bio">Bio *</Label>
              <Textarea
                id="author-bio"
                {...register('author.bio')}
                placeholder="Author bio"
                rows={3}
              />
              {errors.author?.bio && <p className="text-sm text-red-500">{errors.author.bio.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Social Links</h3>
            
            <div className="space-y-2">
              <Label htmlFor="author-twitter">Twitter</Label>
              <Input
                id="author-twitter"
                {...register('author.social.twitter')}
                placeholder="Twitter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-linkedin">LinkedIn</Label>
              <Input
                id="author-linkedin"
                {...register('author.social.linkedin')}
                placeholder="LinkedIn profile URL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-avatar">Avatar URL</Label>
              <Input
                id="author-avatar"
                {...register('author.avatar')}
                placeholder="Author avatar URL"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/blog')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}