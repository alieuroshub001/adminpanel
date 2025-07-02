'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Expertise } from '@/types/expertise';
import Image from 'next/image';

export default function ExpertiseManagement() {
  const router = useRouter();
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExpertises = async () => {
      try {
        const response = await fetch('/api/expertise');
        if (!response.ok) {
          throw new Error('Failed to fetch expertises');
        }
        const data = await response.json();
        setExpertises(data);
      } catch {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertises();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expertise?')) return;

    try {
      const response = await fetch(`/api/expertise/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expertise');
      }

      toast.success('Expertise deleted successfully');
      setExpertises(expertises.filter(expertise => expertise._id !== id));
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/expertise/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured }),
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      toast.success(`Expertise ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
      setExpertises(expertises.map(expertise => 
        expertise._id === id ? { ...expertise, isFeatured } : expertise
      ));
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const filteredExpertises = expertises.filter(expertise =>
    expertise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expertise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expertise.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Expertises</h2>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Input
            placeholder="Search expertises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={() => router.push('/expertise/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Expertise
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpertises.length > 0 ? (
              filteredExpertises.map((expertise) => (
                <TableRow key={expertise._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {expertise.image && (
                        <Image
                          src={expertise.image}
                          alt={expertise.title}
                          width={40}
                          height={40}
                          className="h-10 w-10 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <div>{expertise.title}</div>
                        <div className="text-xs text-gray-500">{expertise.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{expertise.category}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expertise.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={expertise.isFeatured ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFeatured(expertise._id, !expertise.isFeatured)}
                    >
                      {expertise.isFeatured ? 'Featured' : 'Feature'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/expertise/edit/${expertise._id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDelete(expertise._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {searchTerm ? 'No matching expertises found' : 'No expertises yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}