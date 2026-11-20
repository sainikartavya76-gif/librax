import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Grid3X3, List, SlidersHorizontal, X, BookOpen } from 'lucide-react';
import apiClient from '../../api/client';
import { Book, PaginatedResponse } from '../../types';
import { useAuthStore } from '../../store/auth.store';
import BookCard from '../../components/books/BookCard';
import BookReaderModal from '../../components/books/BookReaderModal';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { cn } from '../../components/ui/Button';

const CATEGORIES = [
  'All', 'Fiction', 'Non-Fiction', 'Science', 'Technology',
  'History', 'Philosophy', 'Biography', 'Mathematics', 'General',
];

const SORT_OPTIONS = [
  { label: 'Title A–Z', value: 'title_asc' },
  { label: 'Title Z–A', value: 'title_desc' },
  { label: 'Newest', value: 'year_desc' },
  { label: 'Oldest', value: 'year_asc' },
  { label: 'Author A–Z', value: 'author_asc' },
];

const PAGE_SIZE = 24;

export default function BooksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [readerBook, setReaderBook] = useState<Book | null>(null);

  // Derive state from URL search params
  const searchTerm = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const availability = searchParams.get('availability') || 'all';
  const sort = searchParams.get('sort') || 'title_asc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Debounced search
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function updateParam(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value && value !== 'all' && value !== 'All' && value !== '') {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete('page');
      return next;
    });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setLocalSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam('search', val);
    }, 350);
  }

  function clearSearch() {
    setLocalSearch('');
    updateParam('search', '');
  }

  // Build query params
  const skip = (page - 1) * PAGE_SIZE;
  const queryParams = new URLSearchParams();
  if (searchTerm) queryParams.set('search', searchTerm);
  if (category !== 'All') queryParams.set('category', category);
  if (availability !== 'all') queryParams.set('available', availability === 'available' ? 'true' : 'false');
  const [sortField, sortDir] = sort.split('_');
  queryParams.set('sort_by', sortField);
  queryParams.set('sort_dir', sortDir);
  queryParams.set('skip', String(skip));
  queryParams.set('limit', String(PAGE_SIZE));

  const { data, isLoading, error } = useQuery<PaginatedResponse<Book> | Book[]>({
    queryKey: ['books', queryParams.toString()],
    queryFn: () => apiClient.get(`/books?${queryParams}`).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  const books: Book[] = Array.isArray(data) ? data : data?.items ?? [];
  const total: number = Array.isArray(data) ? data.length : data?.total ?? books.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const activeFiltersCount = [
    category !== 'All' ? 1 : 0,
    availability !== 'all' ? 1 : 0,
    searchTerm ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page">Library Catalogue</h1>
          {!isLoading && (
            <p className="text-xs text-ink-muted mt-0.5">
              {total.toLocaleString()} {total === 1 ? 'book' : 'books'}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/app/books/add')}
          className="inline-flex items-center gap-1.5 h-8 px-3 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Book
        </button>
      </div>

      {/* Search + Controls bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="search"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search by title, author, or ISBN…"
            className="input-base h-9 pl-9 pr-8"
          />
          {localSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => updateParam('sort', e.target.value)}
          className="select-base h-9 w-auto min-w-[130px] text-sm"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(p => !p)}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm transition-colors',
            showFilters || activeFiltersCount > 0
              ? 'border-accent text-accent bg-accent-bg'
              : 'border-border text-ink hover:bg-surface-2'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 bg-accent text-white text-2xs rounded-full flex items-center justify-center font-medium">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* View toggle */}
        <div className="flex border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={cn('p-2 transition-colors', view === 'grid' ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:bg-surface-2')}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('p-2 border-l border-border transition-colors', view === 'list' ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:bg-surface-2')}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4 animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <label className="label-base">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateParam('category', cat)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                    category === cat
                      ? 'bg-accent text-white'
                      : 'bg-surface-2 text-ink-2 hover:bg-border'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="label-base">Availability</label>
            <div className="flex gap-1.5">
              {[
                { label: 'All', value: 'all' },
                { label: 'Available', value: 'available' },
                { label: 'Checked out', value: 'unavailable' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateParam('availability', opt.value)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                    availability === opt.value
                      ? 'bg-accent text-white'
                      : 'bg-surface-2 text-ink-2 hover:bg-border'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-end">
              <button
                onClick={() => setSearchParams({})}
                className="text-xs text-crit hover:text-crit/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Book grid / list */}
      {error ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-crit mb-2">Failed to load books</p>
          <p className="text-xs text-ink-muted">Check that the backend server is running on port 8000</p>
        </div>
      ) : isLoading ? (
        <div className={cn(
          'grid gap-3',
          view === 'grid'
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            : 'grid-cols-1'
        )}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-ink-muted" />
          </div>
          <p className="text-sm font-medium text-ink mb-1">No books found</p>
          <p className="text-xs text-ink-muted">
            {searchTerm ? `No results for "${searchTerm}"` : 'Try adjusting your filters'}
          </p>
          {isStaff && (
            <button
              onClick={() => navigate('/app/books/add')}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors mt-4"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Book
            </button>
          )}
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="w-8" />
                    <th>Title & Author</th>
                    <th className="hidden sm:table-cell">ISBN</th>
                    <th className="hidden md:table-cell">Category</th>
                    <th>Availability</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr
                      key={book.id}
                      onClick={() => navigate(`/app/books/${book.id}`)}
                      className="cursor-pointer"
                    >
                      <td className="pl-4 pr-2">
                        <div className="w-7 h-9 bg-surface-2 rounded flex items-center justify-center">
                          <span className="text-2xs font-bold text-ink-muted">
                            {book.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-ink clamp-1 book-title text-sm">{book.title}</div>
                        <div className="text-xs text-ink-muted">{book.author}</div>
                      </td>
                      <td className="hidden sm:table-cell text-xs text-ink-muted font-mono">{book.isbn}</td>
                      <td className="hidden md:table-cell">
                        <span className="badge badge-neutral">{book.category}</span>
                      </td>
                      <td>
                        {book.available_copies > 0 ? (
                          <span className="badge badge-success">{book.available_copies} avail.</span>
                        ) : (
                          <span className="badge badge-crit">Unavailable</span>
                        )}
                      </td>
                      <td className="pr-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={e => { e.stopPropagation(); setReaderBook(book); }}
                            className="px-2 py-1 rounded text-2xs font-semibold text-accent hover:bg-accent-bg transition-colors flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" /> Read
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/app/books/${book.id}`); }}
                            className="text-ink-muted hover:text-accent transition-colors p-1"
                            title="View Book Details"
                          >
                            →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-ink-muted">
                Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set('page', String(page - 1));
                    return next;
                  })}
                  className="h-7 w-7 flex items-center justify-center rounded border border-border text-ink-2 hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        next.set('page', String(p));
                        return next;
                      })}
                      className={cn(
                        'h-7 min-w-[1.75rem] px-1.5 flex items-center justify-center rounded text-xs transition-colors',
                        p === page
                          ? 'bg-accent text-white font-medium'
                          : 'border border-border text-ink-2 hover:bg-surface-2'
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    next.set('page', String(page + 1));
                    return next;
                  })}
                  className="h-7 w-7 flex items-center justify-center rounded border border-border text-ink-2 hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Global Book Reader Modal */}
      <BookReaderModal
        book={readerBook}
        isOpen={!!readerBook}
        onClose={() => setReaderBook(null)}
      />
    </div>
  );
}
