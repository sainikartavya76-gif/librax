import React from 'react';
import { Book } from '../../types';
import BookCard from './BookCard';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';
import { BookOpen } from 'lucide-react';

interface BookGridProps {
  books?: Book[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, isLoading, error, onRetry }) => {
  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-4 h-[220px] animate-pulse flex flex-col">
            <div className="flex gap-4 mb-4">
              <div className="w-20 h-28 bg-gray-200 rounded-md"></div>
              <div className="flex flex-col flex-1 gap-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-full flex-1"></div>
              <div className="h-8 bg-gray-200 rounded w-full flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No books found"
        description="Try adjusting your filters or search terms."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookGrid;
