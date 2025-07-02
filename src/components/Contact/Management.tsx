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
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ContactCard } from '@/types/contactCard';
import { Mail, Phone, MapPin, Globe, MessageSquare, User } from 'lucide-react';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'mail': return <Mail className="w-5 h-5" />;
    case 'phone': return <Phone className="w-5 h-5" />;
    case 'location': return <MapPin className="w-5 h-5" />;
    case 'website': return <Globe className="w-5 h-5" />;
    case 'social': return <MessageSquare className="w-5 h-5" />;
    case 'person': return <User className="w-5 h-5" />;
    default: return <Mail className="w-5 h-5" />;
  }
};

export default function ContactCardManagement() {
  const router = useRouter();
  const [contactCards, setContactCards] = useState<ContactCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContactCards = async () => {
      try {
        const response = await fetch('/api/contact');
        if (!response.ok) {
          throw new Error('Failed to fetch contact cards');
        }
        const data = await response.json();
        setContactCards(data);
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactCards();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact card?')) return;

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact card');
      }

      toast.success('Contact card deleted successfully');
      setContactCards(contactCards.filter(card => card._id !== id));
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const filteredCards = contactCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Contact Cards</h2>
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Input
            placeholder="Search contact cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={() => router.push('/contact/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Card
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => (
                <TableRow key={card._id}>
                  <TableCell>
                    {getIconComponent(card.icon)}
                  </TableCell>
                  <TableCell className="font-medium">{card.title}</TableCell>
                  <TableCell>{card.details}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {card.description}
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
                          onClick={() => router.push(`/contact/edit/${card._id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => handleDelete(card._id)}
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
                  {searchTerm ? 'No matching contact cards found' : 'No contact cards yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}