import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useDeleteBook } from '../../hooks/useBooks';
import { useBookQueue, useCreateReservation } from '../../hooks/useReservations';
import { useIssueBook } from '../../hooks/useTransactions';
import { useAuthStore } from '../../store/auth.store';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import IssueBookForm from '../../components/transactions/IssueBookForm';
import BookReaderModal from '../../components/books/BookReaderModal';
import ErrorState from '../../components/ui/ErrorState';
import { 
  BookOpen, ArrowLeft, Calendar, BookCheck, Edit, Trash2, 
  Sparkles, Zap
} from 'lucide-react';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: book, isLoading, error } = useBook(id!);
  const { data: queue } = useBookQueue(id!);
  const deleteMutation = useDeleteBook();
  const reserveMutation = useCreateReservation();
  const issueMutation = useIssueBook();
  
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'reader_preview'>('overview');

  if (isLoading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-40" />
      <div className="skeleton h-80 rounded-lg" />
    </div>
  );
  if (error || !book) return <ErrorState message="Failed to load book catalogue details." />;

  const isAvailable = (book.available_copies ?? 0) > 0;
  const categoryStr = typeof book.category === 'string' ? book.category : (book.category as any)?.name || 'General';

  // 1-Click Instant Borrow for current user
  const handleInstantBorrow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const due = new Date();
    due.setDate(due.getDate() + 14);

    issueMutation.mutate({
      book_id: book.id,
      user_id: user.id,
      due_date: due.toISOString(),
      notes: `Self-checkout borrow by ${user.full_name}`
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/books')}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
        </button>

        <span className="text-3xs font-mono text-ink-muted">
          Catalogue ID: #{book.id} • ISBN: {book.isbn}
        </span>
      </div>

      {/* Main card */}
      <div className="card p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden">
        {/* Book cover visual */}
        <div className="w-full md:w-56 shrink-0 flex flex-col items-center">
          <div className="relative group cursor-pointer w-full" onClick={() => setShowReaderModal(true)}>
            {book.cover_url || book.cover_image_url ? (
              <img 
                src={book.cover_url || book.cover_image_url} 
                alt={book.title} 
                className="w-full h-72 object-cover rounded-md shadow-md border border-border group-hover:scale-102 transition-transform duration-300" 
              />
            ) : (
              <div className="w-full h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-md border border-border flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="w-12 h-12 text-accent mb-2" />
                <p className="text-xs text-ink-muted font-serif italic line-clamp-3">{book.title}</p>
              </div>
            )}

            {/* Hover overlay inviting reader */}
            <div className="absolute inset-0 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center backdrop-blur-xs">
              <span className="p-2.5 rounded-full bg-accent text-white shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-transform">
                <BookOpen className="w-6 h-6" />
              </span>
              <span className="text-xs font-semibold text-white">Click to Read Online</span>
              <span className="text-3xs text-slate-300">With audio narration & chapters</span>
            </div>
          </div>

          {/* Quick Reader Button beneath cover */}
          <button
            onClick={() => setShowReaderModal(true)}
            className="w-full mt-3 py-2 px-3 rounded-md bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Open & Read Book
          </button>
        </div>
        
        {/* Book metadata & interactive actions */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="badge badge-neutral font-semibold">{categoryStr}</span>
              <span className={`badge ${isAvailable ? 'badge-success' : 'badge-crit'} font-medium`}>
                {isAvailable ? `${book.available_copies} of ${book.total_copies} Available in Stock` : 'All Copies Borrowed'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink mt-2 mb-1 leading-tight">
              {book.title}
            </h1>
            <p className="text-sm text-ink-2 font-medium">By {book.author || 'Unknown Author'}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-border text-xs">
            <div>
              <span className="text-ink-muted block text-3xs uppercase tracking-wider">ISBN</span>
              <span className="font-mono text-ink font-medium">{book.isbn}</span>
            </div>
            <div>
              <span className="text-ink-muted block text-3xs uppercase tracking-wider">Publisher</span>
              <span className="text-ink truncate block">{book.publisher || 'Classic Edition'}</span>
            </div>
            <div>
              <span className="text-ink-muted block text-3xs uppercase tracking-wider">Year</span>
              <span className="text-ink">{book.publication_year || 'Classic'}</span>
            </div>
            <div>
              <span className="text-ink-muted block text-3xs uppercase tracking-wider">Shelf Location</span>
              <span className="text-ink font-mono">{book.shelf_location || 'Main Floor A-1'}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Overview</h3>
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">
              {book.description || 'A comprehensive, well-regarded work in the collection. Readers may borrow physical copies or read excerpt chapters directly using the built-in LibraX reader.'}
            </p>
          </div>

          {/* ALL FUNCTIONS UNLOCKED & ACCESSIBLE */}
          <div className="pt-3 border-t border-border/80">
            <span className="text-3xs uppercase tracking-wider font-semibold text-ink-muted block mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" /> Available Operations
            </span>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Open Reader */}
              <Button 
                variant="primary"
                leftIcon={<BookOpen className="w-4 h-4" />}
                onClick={() => setShowReaderModal(true)}
              >
                Read Book
              </Button>

              {/* 2. Instant 1-Click Borrow */}
              {isAvailable ? (
                <Button 
                  variant="secondary"
                  leftIcon={<Zap className="w-4 h-4 text-accent" />}
                  onClick={handleInstantBorrow}
                  isLoading={issueMutation.isPending}
                  disabled={issueMutation.isPending}
                >
                  ⚡ Borrow Now (1-Click)
                </Button>
              ) : (
                <Button 
                  variant="primary"
                  leftIcon={<Calendar className="w-4 h-4" />}
                  onClick={() => reserveMutation.mutate(String(book.id))}
                  isLoading={reserveMutation.isPending}
                  disabled={reserveMutation.isPending}
                >
                  Join Reservation Queue
                </Button>
              )}

              {/* 3. Issue to another Member (Staff / Demo) */}
              <Button 
                variant="outline"
                leftIcon={<BookCheck className="w-4 h-4" />}
                onClick={() => setShowIssueModal(true)} 
                disabled={!isAvailable}
              >
                Issue to Member
              </Button>

              {/* 4. Edit Details */}
              <Button 
                variant="outline" 
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => navigate(`/app/books/${id}/edit`)}
              >
                Edit Book
              </Button>

              {/* 5. Delete Book */}
              <Button 
                variant="ghost" 
                className="text-crit hover:bg-crit/10"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border bg-surface-2 px-2">
          <button 
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}`} 
            onClick={() => setActiveTab('overview')}
          >
            Specification
          </button>
          <button 
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${activeTab === 'reader_preview' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}`} 
            onClick={() => setActiveTab('reader_preview')}
          >
            📖 Digital Reader Preview
          </button>
          <button 
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${activeTab === 'queue' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink'}`} 
            onClick={() => setActiveTab('queue')}
          >
            Reservation Queue {queue?.length ? `(${queue.length})` : ''}
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="card-2 p-3">
                <span className="text-ink-muted block text-2xs">Total Pages</span>
                <span className="text-sm font-semibold text-ink">{book.pages || '284 pages'}</span>
              </div>
              <div className="card-2 p-3">
                <span className="text-ink-muted block text-2xs">Language</span>
                <span className="text-sm font-semibold text-ink">{book.language || 'English'}</span>
              </div>
              <div className="card-2 p-3">
                <span className="text-ink-muted block text-2xs">Holdings</span>
                <span className="text-sm font-semibold text-ink">{book.total_copies} Copies ({book.available_copies} free)</span>
              </div>
              <div className="card-2 p-3">
                <span className="text-ink-muted block text-2xs">Shelf Location</span>
                <span className="text-sm font-semibold text-ink font-mono">{book.shelf_location || 'Main Floor'}</span>
              </div>
            </div>
          )}

          {activeTab === 'reader_preview' && (
            <div className="card-2 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" /> Full E-Book Reader Engine
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Includes chapter selection, text size toggles (A- / A+), warm sepia & slate dark modes, and browser Text-to-Speech narration.
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                  onClick={() => setShowReaderModal(true)}
                >
                  Launch Reader Now
                </Button>
              </div>

              <div className="p-4 rounded-md bg-surface border border-border text-xs text-ink-2 leading-relaxed italic font-serif">
                "{book.description || `Opening excerpt: In this seminal work, author ${book.author} delves into the core principles of ${categoryStr}...`}"
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-2">
              {queue?.length ? (
                <div className="divide-y divide-border">
                  {queue.map((r: any, i: number) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-accent-bg text-accent flex items-center justify-center font-bold text-2xs">
                          {i + 1}
                        </span>
                        <span className="font-medium text-ink">{r.user?.full_name || r.user_name || 'Member'}</span>
                      </div>
                      <span className="text-ink-muted text-2xs">
                        Reserved on {new Date(r.created_at || r.reserved_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-ink-muted">
                  No active reservations. Copies are available immediately or upon return.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Reader Modal */}
      <BookReaderModal 
        book={book} 
        isOpen={showReaderModal} 
        onClose={() => setShowReaderModal(false)}
        onBorrow={handleInstantBorrow}
      />

      {/* Issue Modal with book preselected */}
      <IssueBookForm 
        isOpen={showIssueModal} 
        onClose={() => setShowIssueModal(false)} 
        initialBook={book}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Book"
        description="Are you sure you want to delete this book record? All associated borrowing transactions will remain in audit history."
        isDangerous
        onConfirm={() => deleteMutation.mutate(id!, { onSuccess: () => navigate('/app/books') })}
      />
    </div>
  );
};

export default BookDetailPage;
