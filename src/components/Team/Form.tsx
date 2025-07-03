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
import { TeamMemberFormData } from '@/types/teamMember';
import Image from 'next/image';

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  image: z.string().optional(),
  imageFile: z.instanceof(File).optional(),
  imageOption: z.enum(['upload', 'url']),
  bio: z.string().optional(),
  longBio: z.string().optional(),
  social: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    email: z.string().optional(),
  }),
  location: z.string().optional(),
  experience: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  department: z.string().optional()
});

type FormValues = z.infer<typeof teamMemberSchema>;

interface TeamMemberFormProps {
  initialData?: TeamMemberFormData & { _id?: string };
  isEditing?: boolean;
}

export default function TeamMemberForm({ initialData, isEditing = false }: TeamMemberFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');
  const [achievementsInput, setAchievementsInput] = useState(initialData?.achievements?.join('\n') || '');
  const [skillsInput, setSkillsInput] = useState(initialData?.skills?.join(', ') || '');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: initialData || {
      name: '',
      role: '',
      image: '',
      imageOption: 'url',
      bio: '',
      longBio: '',
      social: {
        linkedin: '',
        twitter: '',
        email: '',
      },
      location: '',
      experience: '',
      achievements: [],
      skills: [],
      featured: false,
      department: ''
    }
  });

  const imageOption = watch('imageOption');
  const featured = watch('featured');

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('role', initialData.role);
      setValue('image', initialData.image || '');
      setValue('imageOption', initialData.imageOption || 'url');
      setValue('bio', initialData.bio || '');
      setValue('longBio', initialData.longBio || '');
      setValue('social', initialData.social || { linkedin: '', twitter: '', email: '' });
      setValue('location', initialData.location || '');
      setValue('experience', initialData.experience || '');
      setValue('achievements', initialData.achievements || []);
      setValue('skills', initialData.skills || []);
      setValue('featured', initialData.featured || false);
      setValue('department', initialData.department || '');
      setAchievementsInput(initialData.achievements?.join('\n') || '');
      setSkillsInput(initialData.skills?.join(', ') || '');
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

  const handleAchievementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAchievementsInput(value);
    const achievements = value.split('\n').filter(a => a.trim() !== '');
    setValue('achievements', achievements);
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillsInput(value);
    const skills = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setValue('skills', skills);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('role', data.role);
      formData.append('imageOption', data.imageOption);
      formData.append('bio', data.bio || '');
      formData.append('longBio', data.longBio || '');
      formData.append('social', JSON.stringify(data.social));
      formData.append('location', data.location || '');
      formData.append('experience', data.experience || '');
      formData.append('achievements', JSON.stringify(data.achievements || []));
      formData.append('skills', JSON.stringify(data.skills || []));
      formData.append('featured', String(data.featured || false));
      formData.append('department', data.department || '');

      if (data.imageOption === 'upload' && data.imageFile) {
        formData.append('imageFile', data.imageFile);
      } else if (data.imageOption === 'url') {
        formData.append('image', data.image || '');
      }

      let response;
      if (isEditing && initialData?._id) {
        response = await fetch(`/api/team/${initialData._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/team', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) throw new Error(response.statusText);

      toast.success(`Team member ${isEditing ? 'updated' : 'created'} successfully`);
      router.push('/team');
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
        {isEditing ? 'Edit Team Member' : 'Add New Team Member'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} placeholder="Enter team member name" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Input id="role" {...register('role')} placeholder="Enter team member role" />
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Profile Image</Label>
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <input type="radio" id="image-url" value="url" checked={imageOption === 'url'} onChange={() => setValue('imageOption', 'url')} />
              <Label htmlFor="image-url">Image URL</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="radio" id="image-upload" value="upload" checked={imageOption === 'upload'} onChange={() => setValue('imageOption', 'upload')} />
              <Label htmlFor="image-upload">Upload Image</Label>
            </div>
          </div>

          {imageOption === 'url' ? (
            <div className="space-y-2">
              <Input id="image" {...register('image')} placeholder="Enter image URL" />
              {imagePreview && (
                <div className="mt-2">
                  <Image src={imagePreview} alt="Preview" width={160} height={160} className="h-40 w-40 object-cover rounded-full" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input id="imageFile" type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-2">
                  <Image src={imagePreview} alt="Preview" width={160} height={160} className="h-40 w-40 object-cover rounded-full" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} placeholder="Enter location" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Input id="experience" {...register('experience')} placeholder="Enter years of experience" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Short Bio</Label>
          <Textarea id="bio" {...register('bio')} placeholder="Enter a short bio" rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longBio">Detailed Bio</Label>
          <Textarea id="longBio" {...register('longBio')} placeholder="Enter a detailed bio" rows={5} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="achievements">Achievements (one per line)</Label>
          <Textarea id="achievements" value={achievementsInput} onChange={handleAchievementsChange} placeholder="Enter achievements, one per line" rows={5} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma separated)</Label>
          <Input id="skills" value={skillsInput} onChange={handleSkillsChange} placeholder="Enter skills separated by commas" />
          <p className="text-xs text-gray-500">Example: JavaScript, React, Team Leadership</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" {...register('social.linkedin')} placeholder="Enter LinkedIn profile URL" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Handle</Label>
            <Input id="twitter" {...register('social.twitter')} placeholder="Enter Twitter username" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('social.email')} placeholder="Enter email address" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured">Mark as Featured (Only for Leadership (Owners) and do not add more than 3.)</Label>
          <input type="checkbox" id="featured" {...register('featured')} className="h-4 w-4 mr-2" />
        </div>

        {!featured && (
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <select id="department" {...register('department')} className="border border-gray-300 rounded px-3 py-2 w-full">
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Operations">Operations</option>
              <option value="Development">Development</option>
              <option value="VirtualAssistant">Virtual Assistant</option>


            </select>
            {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push('/team')} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Member' : 'Add Member'}
          </Button>
        </div>
      </form>
    </div>
  );
}
