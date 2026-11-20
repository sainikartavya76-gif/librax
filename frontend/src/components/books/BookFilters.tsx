import React from 'react';
import Select from '../ui/Select';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

export interface BookFiltersState {
  category_id?: string;
  available?: string;
  language?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface BookFiltersProps {
  filters: BookFiltersState;
  onChange: (newFilters: BookFiltersState) => void;
}

const BookFilters: React.FC<BookFiltersProps> = ({ filters, onChange }) => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/categories').then(r => r.data),
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categories?.map((c: any) => ({ value: c.id, label: c.name })) || []),
  ];

  const handleFilterChange = (key: keyof BookFiltersState, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface border border-border rounded-lg mb-6">
      <Select
        options={categoryOptions}
        value={filters.category_id || ''}
        onChange={(e) => handleFilterChange('category_id', e.target.value)}
        className="min-w-[150px]"
      />
      <Select
        options={[
          { value: '', label: 'All Status' },
          { value: 'true', label: 'Available' },
          { value: 'false', label: 'Unavailable' }
        ]}
        value={filters.available || ''}
        onChange={(e) => handleFilterChange('available', e.target.value)}
        className="min-w-[150px]"
      />
      <Select
        options={[
          { value: '', label: 'All Languages' },
          { value: 'English', label: 'English' },
          { value: 'Hindi', label: 'Hindi' },
          { value: 'Spanish', label: 'Spanish' },
          { value: 'French', label: 'French' },
        ]}
        value={filters.language || ''}
        onChange={(e) => handleFilterChange('language', e.target.value)}
        className="min-w-[150px]"
      />
      <div className="ml-auto flex gap-2">
        <Select
          options={[
            { value: 'title_asc', label: 'Title (A-Z)' },
            { value: 'title_desc', label: 'Title (Z-A)' },
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'popularity_desc', label: 'Most Popular' },
          ]}
          value={`${filters.sort_by}_${filters.sort_order}`}
          onChange={(e) => {
            const [sort_by, sort_order] = e.target.value.split('_');
            onChange({ ...filters, sort_by, sort_order: sort_order as any });
          }}
          className="min-w-[180px]"
        />
      </div>
    </div>
  );
};

export default BookFilters;
