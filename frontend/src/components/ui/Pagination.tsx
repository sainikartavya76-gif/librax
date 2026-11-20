import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  total: number;
  skip: number;
  limit: number;
  onPageChange: (newSkip: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ total, skip, limit, onPageChange }) => {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const start = skip + 1;
  const end = Math.min(skip + limit, total);

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (skip >= limit) onPageChange(skip - limit);
  };

  const handleNext = () => {
    if (skip + limit < total) onPageChange(skip + limit);
  };

  const handlePageClick = (page: number) => {
    onPageChange((page - 1) * limit);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-textSecondary">
            Showing <span className="font-medium text-textPrimary">{start}</span> to <span className="font-medium text-textPrimary">{end}</span> of <span className="font-medium text-textPrimary">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="rounded-l-md rounded-r-none border-r-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                  ${page === currentPage
                    ? 'z-10 bg-accent text-white border-accent'
                    : 'bg-surface border-border text-textSecondary hover:bg-background'
                  }`}
              >
                {page}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="rounded-r-md rounded-l-none border-l-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
