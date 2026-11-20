import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookForm from '../../components/books/BookForm';
import { useBook, useUpdateBook } from '../../hooks/useBooks';
import { ArrowLeft } from 'lucide-react';

const EditBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: book, isLoading } = useBook(id!);
  const updateMutation = useUpdateBook();

  const handleSubmit = (data: any) => {
    updateMutation.mutate({ id: id!, data }, {
      onSuccess: () => {
        navigate(`/app/books/${id}`);
      }
    });
  };

  if (isLoading) return <div className="skeleton h-96 rounded-lg" />;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <button
          onClick={() => navigate(`/app/books/${id}`)}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Book Details
        </button>
        <h1 className="heading-page">Edit Book</h1>
        <p className="text-xs text-ink-muted mt-0.5">Modify information for <span className="font-serif italic text-ink">{book?.title}</span></p>
      </div>
      {book && (
        <BookForm defaultValues={book} onSubmit={handleSubmit} isLoading={updateMutation.isPending} />
      )}
    </div>
  );
};

export default EditBookPage;
