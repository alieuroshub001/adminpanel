 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogoLine, ImageSource, BulkCreateResponse } from '@/types/clientLogo';
import Image from 'next/image';
import { Plus, Trash2, Upload, Link } from 'lucide-react';

const clientLogoSchema = z.object({
  line: z.number().min(1).max(4),
  imageOption: z.enum(['upload', 'link']),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
});

const bulkUrlSchema = z.object({
  urls: z.array(z.object({
    url: z.string().url('Please enter a valid URL'),
    line: z.number().min(1).max(4),
  })).min(1, 'At least one URL is required'),
});

type FormValues = z.infer<typeof clientLogoSchema>;
type BulkUrlValues = z.infer<typeof bulkUrlSchema>;

interface ClientLogoFormProps {
  initialData?: {
    _id?: string;
    image: string;
    imageSource: ImageSource;
    line: LogoLine;
  };
  isEditing?: boolean;
}

interface BulkFile {
  file: File;
  line: LogoLine;
  preview: string;
}

export default function ClientLogoForm({ initialData, isEditing = false }: ClientLogoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [activeTab, setActiveTab] = useState('single');

  // Bulk states
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([]);
  const [urlInputs, setUrlInputs] = useState([{ url: '', line: 1 as LogoLine }]);

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

  const {
    handleSubmit: handleBulkSubmit,
    setValue: setBulkValue,
  } = useForm<BulkUrlValues>({
    resolver: zodResolver(bulkUrlSchema),
    defaultValues: {
      urls: [{ url: '', line: 1 }],
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

  // Single logo handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('imageFile', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Bulk file handlers
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newBulkFiles: BulkFile[] = files.map(file => ({
      file,
      line: 1,
      preview: URL.createObjectURL(file)
    }));
    setBulkFiles(prev => [...prev, ...newBulkFiles]);
  };

  const updateBulkFileLine = (index: number, line: LogoLine) => {
    setBulkFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, line } : item
    ));
  };

  const removeBulkFile = (index: number) => {
    setBulkFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Clean up preview URL
      URL.revokeObjectURL(prev[index].preview);
      return newFiles;
    });
  };

  // Bulk URL handlers
  const addUrlInput = () => {
    setUrlInputs(prev => [...prev, { url: '', line: 1 }]);
  };

  const removeUrlInput = (index: number) => {
    setUrlInputs(prev => prev.filter((_, i) => i !== index));
  };

  const updateUrlInput = (index: number, field: 'url' | 'line', value: string | number) => {
    setUrlInputs(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
    
    // Update form values
    setBulkValue('urls', urlInputs.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Submit handlers
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
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      toast.success(`Client logo ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/client');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  });

  const onBulkFileSubmit = async () => {
    if (bulkFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('logoCount', bulkFiles.length.toString());
      
      bulkFiles.forEach((item, index) => {
        formData.append(`logos[${index}][line]`, item.line.toString());
        formData.append(`logos[${index}][imageSource]`, 'upload');
        formData.append(`logos[${index}][imageFile]`, item.file);
      });

      const response = await fetch('/api/clients/bulk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const result: BulkCreateResponse = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`${result.successCount} logos uploaded successfully, ${result.errors.length} failed`);
        result.errors.forEach(error => {
          toast.error(`File ${error.index + 1}: ${error.error}`);
        });
      } else {
        toast.success(`${result.successCount} logos uploaded successfully`);
      }

      router.push('/client');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onBulkUrlSubmit = handleBulkSubmit(async (data) => {
    setIsLoading(true);
    
    try {
      const logos = data.urls.map(item => ({
        image: item.url,
        imageSource: 'link' as ImageSource,
        line: item.line
      }));

      const response = await fetch('/api/clients/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logos }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }

      const result: BulkCreateResponse = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`${result.successCount} logos created successfully, ${result.errors.length} failed`);
        result.errors.forEach(error => {
          toast.error(`URL ${error.index + 1}: ${error.error}`);
        });
      } else {
        toast.success(`${result.successCount} logos created successfully`);
      }

      router.push('/client');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  });

  // Don't show bulk options when editing
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Edit Client Logo</h2>
        
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
              {isLoading ? 'Updating...' : 'Update Logo'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Add Client Logos</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Logo</TabsTrigger>
          <TabsTrigger value="bulk-files">Bulk Files</TabsTrigger>
          <TabsTrigger value="bulk-urls">Bulk URLs</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Single Logo Upload
              </CardTitle>
              <CardDescription>Add one logo at a time</CardDescription>
            </CardHeader>
            <CardContent>
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
                        onChange={(e) => setImagePreview(e.target.value)}
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
                    {isLoading ? 'Saving...' : 'Add Logo'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk File Upload
              </CardTitle>
              <CardDescription>Upload multiple image files at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="bulk-files">Select Image Files *</Label>
                <Input
                  id="bulk-files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkFileChange}
                />
              </div>

              {bulkFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Selected Files ({bulkFiles.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bulkFiles.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="relative">
                              <Image
                                src={item.preview}
                                alt={`Preview ${index + 1}`}
                                width={200}
                                height={100}
                                className="h-24 w-full object-contain rounded-md bg-gray-50"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => removeBulkFile(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div>
                              <Label>Line Number</Label>
                              <select
                                value={item.line}
                                onChange={(e) => updateBulkFileLine(index, parseInt(e.target.value) as LogoLine)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                              >
                                <option value="1">Line 1</option>
                                <option value="2">Line 2</option>
                                <option value="3">Line 3</option>
                                <option value="4">Line 4</option>
                              </select>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{item.file.name}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/client')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={onBulkFileSubmit}
                  disabled={isLoading || bulkFiles.length === 0}
                >
                  {isLoading ? 'Uploading...' : `Upload ${bulkFiles.length} Logos`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-urls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Bulk URL Upload
              </CardTitle>
              <CardDescription>Add multiple logos using image URLs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onBulkUrlSubmit} className="space-y-6">
                <div className="space-y-4">
                  {urlInputs.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-end space-x-4">
                          <div className="flex-1">
                            <Label>Image URL</Label>
                            <Input
                              value={item.url}
                              onChange={(e) => updateUrlInput(index, 'url', e.target.value)}
                              placeholder="https://example.com/logo.png"
                            />
                          </div>
                          <div className="w-32">
                            <Label>Line</Label>
                            <select
                              value={item.line}
                              onChange={(e) => updateUrlInput(index, 'line', parseInt(e.target.value))}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="1">Line 1</option>
                              <option value="2">Line 2</option>
                              <option value="3">Line 3</option>
                              <option value="4">Line 4</option>
                            </select>
                          </div>
                          {urlInputs.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeUrlInput(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {item.url && (
                          <div className="mt-4">
                            <Image
                              src={item.url}
                              alt={`Preview ${index + 1}`}
                              width={200}
                              height={100}
                              className="h-24 w-48 object-contain rounded-md bg-gray-50"
                              onError={() => {}}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addUrlInput}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another URL
                </Button>

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
                    {isLoading ? 'Creating...' : `Create ${urlInputs.length} Logos`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}