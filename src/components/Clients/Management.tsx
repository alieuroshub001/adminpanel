'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { ClientLogo } from '@/types/clientLogo';

export default function ClientLogoManagement() {
  const router = useRouter();
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClientLogos = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error('Failed to fetch client logos');
        }
        const data = await response.json();
        setClientLogos(data);
      } catch {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientLogos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client logo?')) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client logo');
      }

      toast.success('Client logo deleted successfully');
      setClientLogos(clientLogos.filter(logo => logo._id !== id));
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const filteredClientLogos = clientLogos.filter(logo =>
    logo.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
    logo.line.toString().includes(searchTerm)
  );

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Client Logos</h2>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Input
            placeholder="Search logos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={() => router.push('/client/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Logo
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Line</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientLogos.length > 0 ? (
              filteredClientLogos.map((logo) => (
                <TableRow key={logo._id}>
                  <TableCell>{logo.line}</TableCell>
                  <TableCell>
                    <Image
                      src={logo.image}
                      alt={`Client logo line ${logo.line}`}
                      width={128}
                      height={64}
                      className="h-16 w-32 object-contain"
                    />
                  </TableCell>
                  <TableCell className="capitalize">{logo.imageSource}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/client/edit/${logo._id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDelete(logo._id)}
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
                <TableCell colSpan={4} className="text-center py-8">
                  {searchTerm ? 'No matching logos found' : 'No client logos yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}