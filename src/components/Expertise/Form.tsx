'use client';

import { ExpertiseCategory, ExpertiseFormData } from '@/types/expertise';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  ChevronDown, Check, X,
  Headphones, ClipboardList, Database, LayoutDashboard,
  HardDrive, Search, BarChart2, Server, Keyboard,
  Code, Smartphone, Globe, Cloud, Cpu
} from 'lucide-react';
import React from 'react';

const expertiseCategories: ExpertiseCategory[] = ['business', 'tech'];

// Create a map of available icons
const availableIcons = {
  Headphones,
  ClipboardList,
  Database,
  LayoutDashboard,
  HardDrive,
  Search,
  BarChart2,
  Server,
  Keyboard,
  Code,
  Smartphone,
  Globe,
  Cloud,
  Cpu
};

// Array of icon names for filtering and dropdown
const lucideIcons: string[] = [
  'Headphones',
  'ClipboardList',
  'Database',
  'LayoutDashboard',
  'HardDrive',
  'Search',
  'BarChart2',
  'Server',
  'Keyboard',
  'Code',
  'Smartphone',
  'Globe',
  'Cloud',
  'Cpu'
];

export default function ExpertiseForm({ expertiseId }: { expertiseId?: string }) {
  const router = useRouter();
  const [isEditing] = useState(!!expertiseId);
  const [isLoading, setIsLoading] = useState(expertiseId ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageOption, setImageOption] = useState<'upload' | 'url'>('url');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ExpertiseFormData>({
    title: '',
    slug: '',
    category: 'tech',
    icon: '',
    image: '',
    path: '',
    description: '',
    isFeatured: false,
    imageOption: 'url'
  });

  // Filter icons based on search
  const filteredIcons: string[] = lucideIcons.filter((icon: string) => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (expertiseId) {
      const fetchExpertise = async () => {
        try {
          const response = await fetch(`/api/expertise/${expertiseId}`);
          if (!response.ok) throw new Error('Failed to fetch expertise');
          const expertise = await response.json();
          setFormData({
            title: expertise.title,
            slug: expertise.slug,
            category: expertise.category,
            icon: expertise.icon,
            image: expertise.image,
            path: expertise.path,
            description: expertise.description || '',
            isFeatured: expertise.isFeatured || false,
            imageOption: 'url'
          });
        } catch (error) {
          console.error('Error fetching expertise:', error);
          setError('Failed to load expertise data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchExpertise();
    }
  }, [expertiseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
  };

  const handleImageOptionChange = (option: 'upload' | 'url') => {
    setImageOption(option);
    setFormData(prev => ({ ...prev, imageOption: option }));
    if (option === 'upload') {
      setFormData(prev => ({ ...prev, image: '' }));
    } else {
      setImgSrc(null);
    }
  };

  // Function to create a cropped image blob
  async function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob | null> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });

      // If we have a completed crop and image source, create a cropped image
      if (completedCrop && imgSrc && imgRef.current) {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        if (croppedImageBlob) {
          formDataToSend.append('imageFile', croppedImageBlob);
        }
      }

      const url = isEditing ? `/api/expertise/${expertiseId}` : '/api/expertise';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save expertise');
      }
      
      router.push('/expertise');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearImage = () => {
    if (imageOption === 'url') {
      setFormData(prev => ({ ...prev, image: '' }));
    } else {
      setImgSrc(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
    setIsIconDropdownOpen(false);
    setIconSearch('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Expertise' : 'Create New Expertise'}
        </h1>
        <p className="text-[var(--foreground)]/70">
          {isEditing ? 'Update the expertise details below' : 'Fill in the details to create a new expertise'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              placeholder="e.g. Web Development"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Slug (URL identifier) *
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={formData.slug}
              onChange={handleChange}
              className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              placeholder="e.g. web-development"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            >
              {expertiseCategories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label htmlFor="icon" className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Icon *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                className="w-full flex items-center justify-between bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <div className="flex items-center">
                  {formData.icon && lucideIcons[formData.icon as keyof typeof lucideIcons] ? (
                    <>
                      {React.createElement(lucideIcons[formData.icon as keyof typeof lucideIcons] as React.ElementType, { className: "w-5 h-5 mr-2" })}
                      <span>{formData.icon}</span>
                    </>
                  ) : (
                    <span>Select an icon</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
             {isIconDropdownOpen && (
    <div className="absolute z-10 mt-1 w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg shadow-lg max-h-60 overflow-auto">
      <div className="p-2 sticky top-0 bg-[var(--background)]">
        <input
          type="text"
          placeholder="Search icons..."
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          autoFocus
        />
      </div>
      <div className="divide-y divide-[var(--secondary)]/20">
        {filteredIcons.length > 0 ? (
          filteredIcons.map((icon: string) => {
            const IconComponent = availableIcons[icon as keyof typeof availableIcons];
            return (
              <button
                key={icon}
                type="button"
                onClick={() => handleIconSelect(icon)}
                className={`w-full flex items-center px-4 py-2 text-left hover:bg-[var(--secondary)]/10 ${formData.icon === icon ? 'bg-[var(--primary)]/10' : ''}`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="flex-1">{icon}</span>
                {formData.icon === icon && <Check className="w-4 h-4 text-[var(--primary)]" />}
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center text-[var(--foreground)]/70">
            No icons found
          </div>
        )}
      </div>
    </div>
  )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="path" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Path *
            <span className="text-xs text-[var(--foreground)]/50 ml-1">(Where this expertise links to)</span>
          </label>
          <input
            id="path"
            name="path"
            type="text"
            required
            value={formData.path}
            onChange={handleChange}
            className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder="e.g. /expertise/web-development"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder="Brief description of this expertise..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Image *
          </label>
          
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleImageOptionChange('url')}
              className={`px-4 py-2 rounded-lg ${imageOption === 'url' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]/20'}`}
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={() => handleImageOptionChange('upload')}
              className={`px-4 py-2 rounded-lg ${imageOption === 'upload' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]/20'}`}
            >
              Upload Image
            </button>
          </div>

          {imageOption === 'url' ? (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-[var(--background)] border border-[var(--secondary)] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                required
              />
              {formData.image && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 p-1 text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {formData.image && (
              <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-[var(--secondary)] relative">
                <Image
                  src={formData.image}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={() => setFormData(prev => ({ ...prev, image: '' }))}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="block w-full text-sm text-[var(--foreground)]/70
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-[var(--primary)]/10 file:text-[var(--primary)]
                hover:file:bg-[var(--primary)]/20"
              required={imageOption === 'upload'}
            />
            
            {imgSrc && (
              <div className="mt-4 space-y-2">
                <div className="relative">
                  <ReactCrop
                    crop={crop}
                    onChange={c => setCrop(c)}
                    onComplete={c => setCompletedCrop(c)}
                    aspect={16/9}
                    className="max-w-full max-h-96"
                  >
                    <Image
                      ref={imgRef}
                      src={imgSrc}
                      alt="Crop preview"
                      width={800}
                      height={450}
                      onLoad={() => {
                        setCrop({
                          unit: '%',
                          width: 100,
                          height: 100,
                          x: 0,
                          y: 0
                        });
                      }}
                    />
                  </ReactCrop>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[var(--foreground)]/70">
                  Drag to select the area you want to crop (16:9 aspect ratio)
                </p>
              </div>
            )}
          </div>
        )}
        </div>


        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
            className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] rounded"
          />
          <label htmlFor="isFeatured" className="ml-2 block text-sm text-[var(--foreground)]">
            <span className="font-medium">Feature this expertise</span>
            <span className="text-xs text-[var(--foreground)]/50 ml-1">(Show prominently on the site)</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.push('/expertise')}
            className="px-4 py-2 border border-[var(--secondary)] rounded-lg font-medium text-[var(--foreground)] hover:bg-[var(--secondary)]/20 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Saving...' : 'Creating...'}
              </span>
            ) : (
              isEditing ? 'Save Changes' : 'Create Expertise'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}