import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookForm from '../../components/books/BookForm';
import { useCreateBook } from '../../hooks/useBooks';
import { ArrowLeft } from 'lucide-react';

const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateBook();

  const handleSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (newBook) => {
        navigate(`/app/books/${newBook.id}`);
      }
    });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <button
          onClick={() => navigate('/app/books')}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
        </button>
        <h1 className="heading-page">Add New Book</h1>
        <p className="text-xs text-ink-muted mt-0.5">Register a new title into the permanent collection.</p>
      </div>
      <BookForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  );
};

export default AddBookPage;
