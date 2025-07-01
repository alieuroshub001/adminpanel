'use client';

import { Expertise, ExpertiseCategory } from '@/types/expertise';
import { Edit, Plus, Star, Trash, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';

interface ExpertiseManagementProps {
  initialExpertise: Expertise[];
}

export default function ExpertiseManagement({ 
  initialExpertise 
}: ExpertiseManagementProps) {
  const [expertise, setExpertise] = useState<Expertise[]>(initialExpertise);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpertiseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  useEffect(() => {
    setExpertise(initialExpertise);
  }, [initialExpertise]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this expertise?')) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/expertise/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expertise');
      setExpertise((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to delete expertise');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleFeatured = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/expertise/${id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to toggle featured status');
      setExpertise((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, isFeatured: !currentStatus } : e
        )
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to toggle featured status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredExpertise = useMemo(() => {
    return expertise.filter(e => {
      const matchesFilter = filter === 'all' ? true : e.isFeatured;
      const matchesCategory = categoryFilter === 'all' ? true : e.category === categoryFilter;
      const matchesSearch = debouncedSearchQuery === '' || 
                          e.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
                          e.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchesFilter && matchesCategory && matchesSearch;
    });
  }, [expertise, filter, categoryFilter, debouncedSearchQuery]);

  const renderFilterButton = (label: string, value: 'all' | 'featured') => {
    const isActive = filter === value;
    return (
      <button
        onClick={() => setFilter(value)}
        className={`px-3 py-1 rounded transition ${
          isActive
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
        }`}
      >
        {label}
      </button>
    );
  };

  const renderCategoryFilterButton = (label: string, value: ExpertiseCategory | 'all') => {
    const isActive = categoryFilter === value;
    return (
      <button
        onClick={() => setCategoryFilter(value)}
        className={`px-3 py-1 rounded transition ${
          isActive
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--secondary)]/20 text-[var(--foreground)] hover:bg-[var(--secondary)]/30'
        }`}
      >
        {label}
      </button>
    );
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Manage Expertise</h1>
          <p className="text-[var(--foreground)]/70">
            {filteredExpertise.length} expertise items found
          </p>
        </div>
        <Link
          href="/expertise/new"
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-[var(--primary)]/90 transition w-full md:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Expertise
        </Link>
      </div>

      <div className="mb-6 bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--secondary)]/20 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex space-x-2">
            {renderFilterButton('All', 'all')}
            {renderFilterButton('Featured', 'featured')}
          </div>
          <div className="flex space-x-2">
            {renderCategoryFilterButton('All', 'all')}
            {renderCategoryFilterButton('Tech', 'tech')}
            {renderCategoryFilterButton('Business', 'business')}
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--foreground)]/50" />
              </div>
              <input
                type="text"
                placeholder="Search expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-[var(--background)] border border-[var(--secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--secondary)]/20 overflow-hidden">
        {filteredExpertise.length === 0 ? (
          <div className="p-8 text-center text-[var(--foreground)]/70">
            No expertise found matching your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--secondary)]/20">
              <thead className="bg-[var(--secondary)]/10">
                <tr>
                  {['Title', 'Category', 'Slug', 'Featured', 'Actions'].map((head) => (
                    <th
                      key={head}
                      className={`${
                        head === 'Actions' ? 'text-right' : 'text-left'
                      } px-6 py-3 text-xs font-medium text-[var(--foreground)]/70 uppercase tracking-wider`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--secondary)]/20">
                {filteredExpertise.map((expertiseItem) => (
                  <tr
                    key={String(expertiseItem._id)}
                    className="hover:bg-[var(--secondary)]/10 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <div className="flex items-center">
                        {expertiseItem.image && (
                          <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                            <Image
                              src={expertiseItem.image}
                              alt={expertiseItem.title}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{expertiseItem.title}</div>
                          {expertiseItem.description && (
                            <div className="text-sm text-[var(--foreground)]/70 line-clamp-1">
                              {expertiseItem.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-[var(--secondary)]/20">
                        {expertiseItem.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-[var(--secondary)]/10 px-2 py-1 rounded">
                        {expertiseItem.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeatured(String(expertiseItem._id), expertiseItem.isFeatured || false)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm transition ${
                          expertiseItem.isFeatured
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                            : 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200'
                        }`}
                        disabled={isLoading}
                      >
                        {expertiseItem.isFeatured ? (
                          <>
                            <Star className="w-4 h-4 fill-current" />
                            Featured
                          </>
                        ) : 'Regular'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/expertise/edit/${expertiseItem._id}`}
                          className="text-[var(--primary)] hover:text-[var(--primary)]/80 p-1 rounded transition"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(String(expertiseItem._id))}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded transition"
                          disabled={isLoading}
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}