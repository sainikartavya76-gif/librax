import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Book } from '../../types';
import { cn } from '../ui/Button';
import BookReaderModal from './BookReaderModal';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export default function BookCard({ book, compact = false }: BookCardProps) {
  const navigate = useNavigate();
  const [readerOpen, setReaderOpen] = useState(false);
  const available = (book.available_copies ?? 0) > 0;

  // Fallback background color based on title hash
  const colors = [
    'from-blue-950 to-slate-900',
    'from-emerald-950 to-slate-900',
    'from-amber-950 to-slate-900',
    'from-rose-950 to-slate-900',
    'from-purple-950 to-slate-900'
  ];
  const colorIdx = book.title.charCodeAt(0) % colors.length;

  return (
    <>
      <div
        onClick={() => navigate(`/app/books/${book.id}`)}
        className="card group cursor-pointer hover:border-accent hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between relative bg-surface"
      >
        {/* Cover image area */}
        <div className={cn('relative flex-shrink-0 overflow-hidden bg-surface-2', compact ? 'h-32' : 'h-44')}>
          {book.cover_url || book.cover_image_url ? (
            <img
              src={book.cover_url || book.cover_image_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={cn('w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br', colors[colorIdx])}>
              <BookOpen className="w-8 h-8 text-ink-muted/50 mb-1" />
              <p className="text-3xs text-ink-muted font-serif italic line-clamp-2 px-1">{book.title}</p>
            </div>
          )}

          {/* Status pill badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-3xs font-mono font-bold shadow-xs backdrop-blur-md',
              available ? 'bg-accent/90 text-white' : 'bg-crit/90 text-white'
            )}>
              {available ? `${book.available_copies} avail` : 'Queue only'}
            </span>
          </div>

          {/* Quick action buttons overlay on hover */}
          <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2.5 backdrop-blur-xs z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setReaderOpen(true);
              }}
              className="w-full py-1.5 px-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-transform transform translate-y-1 group-hover:translate-y-0"
            >
              <BookOpen className="w-3.5 h-3.5" /> Read Online
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/app/books/${book.id}`);
              }}
              className="w-full py-1 px-2 rounded bg-surface/90 hover:bg-surface text-ink text-3xs font-medium border border-border shadow-xs flex items-center justify-center gap-1 transition-transform transform translate-y-1 group-hover:translate-y-0"
            >
              Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Book details metadata */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
          <div>
            <span className="text-3xs font-mono uppercase tracking-wider text-accent font-semibold block mb-0.5">
              {typeof book.category === 'string' ? book.category : (book.category as any)?.name || 'General'}
            </span>
            <h3 className="text-xs font-semibold text-ink line-clamp-2 book-title leading-tight group-hover:text-accent transition-colors">
              {book.title}
            </h3>
            <p className="text-3xs text-ink-muted truncate mt-0.5">{book.author}</p>
          </div>

          {!compact && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-3xs text-ink-muted font-mono">
              <span>{book.publication_year || 'Classic'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReaderOpen(true);
                }}
                className="text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <BookOpen className="w-3 h-3" /> Read
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reader Modal */}
      <BookReaderModal
        book={book}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
      />
    </>
  );
}
