import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface BookFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CATEGORIES = [
  { value: 'Fiction', label: 'Fiction' },
  { value: 'Non-Fiction', label: 'Non-Fiction' },
  { value: 'Science', label: 'Science' },
  { value: 'Technology', label: 'Technology' },
  { value: 'History', label: 'History' },
  { value: 'Philosophy', label: 'Philosophy' },
  { value: 'Biography', label: 'Biography' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'General', label: 'General' },
];

const BookForm: React.FC<BookFormProps> = ({ defaultValues = {}, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: defaultValues.title || '',
    author: defaultValues.author || '',
    isbn: defaultValues.isbn || '',
    category: defaultValues.category || 'General',
    description: defaultValues.description || '',
    language: defaultValues.language || 'English',
    pages: defaultValues.pages || '',
    publication_year: defaultValues.publication_year || new Date().getFullYear(),
    total_copies: defaultValues.total_copies || 1,
    shelf_location: defaultValues.shelf_location || '',
    cover_url: defaultValues.cover_url || defaultValues.cover_image_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      pages: formData.pages ? Number(formData.pages) : undefined,
      publication_year: Number(formData.publication_year),
      total_copies: Number(formData.total_copies),
      available_copies: Number(formData.total_copies),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Title *" name="title" value={formData.title} onChange={handleChange} required />
        <Input label="Author *" name="author" value={formData.author} onChange={handleChange} required />
        <Input label="ISBN *" name="isbn" value={formData.isbn} onChange={handleChange} required />
        <Select 
          label="Category *" 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          required
          options={CATEGORIES}
        />
        <Select 
          label="Language" 
          name="language" 
          value={formData.language} 
          onChange={handleChange}
          options={[
            { value: 'English', label: 'English' },
            { value: 'Hindi', label: 'Hindi' },
            { value: 'French', label: 'French' },
            { value: 'German', label: 'German' },
            { value: 'Spanish', label: 'Spanish' },
          ]}
        />
        <Input type="number" label="Pages" name="pages" value={formData.pages} onChange={handleChange} />
        <Input type="number" label="Publication Year" name="publication_year" value={formData.publication_year} onChange={handleChange} />
        <Input type="number" label="Total Copies *" name="total_copies" value={formData.total_copies} onChange={handleChange} required min="1" />
        <Input label="Shelf Location" name="shelf_location" value={formData.shelf_location} onChange={handleChange} placeholder="e.g. A3-Shelf-2" />
        <Input label="Cover Image URL" name="cover_url" value={formData.cover_url} onChange={handleChange} placeholder="https://..." className="md:col-span-2" />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-ink mb-1">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            rows={4}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Synopsis or book overview..."
          />
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          {defaultValues.id ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;
