import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-7 h-7 bg-accent rounded flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">LIBRAX</span>
        </div>

        <div className="mb-6">
          <span className="text-6xl font-semibold text-surface-2 tabular select-none">404</span>
        </div>
        <h1 className="text-lg font-semibold text-ink mb-2">Page not found</h1>
        <p className="text-sm text-ink-2 mb-8">
          The page you're looking for has been moved, deleted, or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/app/dashboard"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 border border-border text-ink text-sm rounded-md hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
