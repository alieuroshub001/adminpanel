'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Image, Link, Upload, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogFormProps {
  initialData?: {
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    imageSource: 'upload' | 'link';
    category: string;
    tags: string[];
    readTime: string;
    date: string;
    featured: boolean;
    author: {
      name: string;
      bio: string;
      avatar?: string;
      social: {
        twitter?: string;
        linkedin?: string;
      };
    };
  };
}

const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Product'];
const tagOptions = ['React', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'CSS', 'UI/UX'];

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData?._id;

  const [formData, setFormData] = useState({
    _id: initialData?._id,
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    image: initialData?.image || '',
    imageSource: initialData?.imageSource || 'link',
    category: initialData?.category || categories[0],
    tags: initialData?.tags || [],
    readTime: initialData?.readTime || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    featured: initialData?.featured || false,
    author: {
      name: initialData?.author?.name || '',
      bio: initialData?.author?.bio || '',
      avatar: initialData?.author?.avatar || '',
      social: {
        twitter: initialData?.author?.social?.twitter || '',
        linkedin: initialData?.author?.social?.linkedin || '',
      },
    },
  });

  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate slug from title
  useEffect(() => {
    if (!isEditMode) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const url = isEditMode 
        ? `/api/blogs?_id=${formData._id}` 
        : '/api/blogs';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save blog post');
      }

      const result = await response.json();
      router.push('/dashboard/blogs');
      router.refresh();
    } catch (error) {
      console.error('Error saving blog post:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save blog post',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FileText className="mr-2" size={24} />
        {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image *
          </label>
          
          <div className="flex items-center space-x-4 mb-3">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="imageSource"
                checked={formData.imageSource === 'link'}
                onChange={() => setFormData({ ...formData, imageSource: 'link' })}
              />
              <span className="ml-2 flex items-center">
                <Link className="mr-1" size={16} /> Use Image URL
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="imageSource"
                checked={formData.imageSource === 'upload'}
                onChange={() => setFormData({ ...formData, imageSource: 'upload' })}
              />
              <span className="ml-2 flex items-center">
                <Upload className="mr-1" size={16} /> Upload Image
              </span>
            </label>
          </div>

          {formData.imageSource === 'link' ? (
            <input
              type="url"
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                setImagePreview(e.target.value);
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={!isEditMode}
              />
              <p className="mt-1 text-xs text-gray-500">JPG, PNG up to 2MB</p>
            </div>
          )}

          {imagePreview && (
            <div className="mt-3">
              <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600 focus:outline-none"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add new tag"
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div className="mt-1">
            <p className="text-xs text-gray-500">
              Suggestions: {tagOptions.join(', ')}
            </p>
          </div>
        </div>

        {/* Read Time */}
        <div>
          <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
            Read Time (e.g., "5 min read")
          </label>
          <input
            type="text"
            id="readTime"
            value={formData.readTime}
            onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Publish Date *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Featured */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Feature this post on the homepage
          </label>
        </div>

        {/* Author Section */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Author Information</h3>

          {/* Author Name */}
          <div className="mb-4">
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              id="authorName"
              value={formData.author.name}
              onChange={(e) => setFormData({
                ...formData,
                author: { ...formData.author, name: e.target.value },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Author Bio */}
          <div className="mb-4">
            <label htmlFor="authorBio" className="block text-sm font-medium text-gray-700 mb-1">
              Author Bio *
            </label>
            <textarea
              id="authorBio"
              value={formData.author.bio}
              onChange={(e) => setFormData({
                ...formData,
                author: { ...formData.author, bio: e.target.value },
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Author Avatar */}
          <div className="mb-4">
            <label htmlFor="authorAvatar" className="block text-sm font-medium text-gray-700 mb-1">
              Author Avatar URL
            </label>
            <input
              type="url"
              id="authorAvatar"
              value={formData.author.avatar || ''}
              onChange={(e) => setFormData({
                ...formData,
                author: { ...formData.author, avatar: e.target.value },
              })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Handle
              </label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  id="twitter"
                  value={formData.author.social.twitter || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    author: {
                      ...formData.author,
                      social: { ...formData.author.social, twitter: e.target.value },
                    },
                  })}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin"
                value={formData.author.social.linkedin || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  author: {
                    ...formData.author,
                    social: { ...formData.author.social, linkedin: e.target.value },
                  },
                })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push('/dashboard/blogs')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Post' : 'Publish Post'}
          </button>
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}