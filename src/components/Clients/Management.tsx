'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { ClientLogo, LogoLine } from '@/types/clientLogo';

interface ClientLogoStats {
  totalLogos: number;
  logosByLine: Record<LogoLine, number>;
}

interface BulkDeleteError {
  id: string;
  error: string;
}

export default function ClientLogoManagement() {
  const router = useRouter();
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState<LogoLine | 'all'>('all');
  const [selectedLogos, setSelectedLogos] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stats, setStats] = useState<ClientLogoStats | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogos, setTotalLogos] = useState(0);
  const itemsPerPage = 10;

  const fetchClientLogos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        paginated: 'true',
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (selectedLine !== 'all') {
        params.append('line', selectedLine.toString());
      }

      const response = await fetch(`/api/clients?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client logos');
      }

      const data = await response.json();
      setClientLogos(data.logos);
      setTotalPages(data.totalPages);
      setTotalLogos(data.total);
    } catch (error) {
      toast.error('Failed to fetch client logos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedLine]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/clients?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchClientLogos();
    fetchStats();
  }, [fetchClientLogos, fetchStats]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client logo');
      }

      toast.success('Client logo deleted successfully');
      fetchClientLogos();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete client logo');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLogos.size === 0) {
      toast.error('Please select logos to delete');
      return;
    }

    try {
      const response = await fetch('/api/clients/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedLogos),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete client logos');
      }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`${result.deletedCount} logos deleted, ${result.errors.length} failed`);
        result.errors.forEach((error: BulkDeleteError) => {
          toast.error(`Error deleting ${error.id}: ${error.error}`);
        });
      } else {
        toast.success(`${result.deletedCount} logos deleted successfully`);
      }

      setSelectedLogos(new Set());
      setShowDeleteDialog(false);
      fetchClientLogos();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete client logos');
      console.error(error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogos(new Set(clientLogos.map(logo => logo._id)));
    } else {
      setSelectedLogos(new Set());
    }
  };

  const handleSelectLogo = (logoId: string, checked: boolean) => {
    const newSelected = new Set(selectedLogos);
    if (checked) {
      newSelected.add(logoId);
    } else {
      newSelected.delete(logoId);
    }
    setSelectedLogos(newSelected);
  };

  const filteredClientLogos = clientLogos.filter(logo =>
    logo.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
    logo.line.toString().includes(searchTerm)
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedLogos(new Set()); // Clear selections when changing pages
  };

  if (isLoading && currentPage === 1) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Client Logos</h2>
            {stats && (
              <p className="text-sm text-muted-foreground">
                Total: {stats.totalLogos} logos
              </p>
            )}
          </div>
          <Button onClick={() => router.push('/client/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Logo
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Logos</p>
              <p className="text-2xl font-bold">{stats.totalLogos}</p>
            </div>
            {Object.entries(stats.logosByLine).map(([line, count]) => (
              <div key={line} className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Line {line}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-1">
          <Input
            placeholder="Search logos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select
              value={selectedLine}
              onChange={(e) => {
                setSelectedLine(e.target.value as LogoLine | 'all');
                setCurrentPage(1);
              }}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="all">All Lines</option>
              <option value="1">Line 1</option>
              <option value="2">Line 2</option>
              <option value="3">Line 3</option>
              <option value="4">Line 4</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLogos.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedLogos.size} selected
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedLogos.size === filteredClientLogos.length && filteredClientLogos.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Line</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientLogos.length > 0 ? (
              filteredClientLogos.map((logo) => (
                <TableRow key={logo._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLogos.has(logo._id)}
                      onCheckedChange={(checked) => handleSelectLogo(logo._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Line {logo.line}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={logo.image}
                        alt={`Client logo line ${logo.line}`}
                        width={64}
                        height={32}
                        className="h-8 w-16 object-contain rounded border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(logo.image, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={logo.imageSource === 'upload' ? 'default' : 'secondary'}>
                      {logo.imageSource}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(logo.createdAt).toLocaleDateString()}
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
                <TableCell colSpan={6} className="text-center py-8">
                  {isLoading ? (
                    'Loading...'
                  ) : searchTerm ? (
                    'No matching logos found'
                  ) : selectedLine !== 'all' ? (
                    `No logos found for Line ${selectedLine}`
                  ) : (
                    'No client logos yet'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalLogos)} of {totalLogos} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Logos</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedLogos.size} selected logo{selectedLogos.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedLogos.size} Logo{selectedLogos.size !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}