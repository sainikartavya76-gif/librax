import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, BarChart2, Users, ArrowRight, Shield, Cpu, Clock,
  Sparkles, Search, Zap
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth';
import { useToast } from '../components/ui/Toast';

const PREVIEW_BOOKS = [
  {
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest',
    category: 'Technology',
    cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    title: 'Clean Code: Handbook of Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Technology',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Fiction',
    cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    cover_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    available: true
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    cover_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
    available: false
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [catalogueFilter, setCatalogueFilter] = useState('All');
  const [catalogueSearch, setCatalogueSearch] = useState('');

  // 1-Click Instant Demo Login
  const handleQuickLogin = async (role: 'ADMIN' | 'LIBRARIAN' | 'STUDENT') => {
    setIsLoggingIn(true);
    const creds = {
      ADMIN: { email: 'admin@librax.com', pwd: 'Admin@123', label: 'Administrator' },
      LIBRARIAN: { email: 'librarian@librax.com', pwd: 'Lib@123', label: 'Librarian' },
      STUDENT: { email: 'student@librax.com', pwd: 'Student@123', label: 'Student' }
    }[role];

    try {
      const data = await authApi.login(creds.email, creds.pwd);
      useAuthStore.getState().login(data.access_token, {} as any);
      const userProfile = await authApi.me();
      login(data.access_token, userProfile);
      toast.success(`Authenticated as ${creds.label}. Welcome to LibraX.`);
      navigate('/app/dashboard');
    } catch {
      toast.error('Failed to log in. Ensure backend is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredPreviewBooks = PREVIEW_BOOKS.filter(b => {
    const matchesCat = catalogueFilter === 'All' || b.category === catalogueFilter;
    const matchesSearch = !catalogueSearch || b.title.toLowerCase().includes(catalogueSearch.toLowerCase()) || b.author.toLowerCase().includes(catalogueSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-accent/20">
      {/* Top Navbar */}
      <nav className="border-b border-border sticky top-0 z-30 bg-bg/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">LIBRAX</span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-3xs font-mono bg-accent-bg text-accent font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              154 C DSA Tests Verified
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="text-xs text-ink-2 hover:text-ink transition-colors px-3 py-1.5 font-medium"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              Instant Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-surface border border-border mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-2xs font-semibold text-ink uppercase tracking-wider">
              Institutional Library Operating System
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-medium text-ink leading-[1.1] tracking-tight mb-6 text-balance">
            Every book, every member,<br />
            every loan — in perfect order.
          </h1>

          <p className="text-base text-ink-2 leading-relaxed max-w-2xl mb-8">
            LibraX is an engineering-first library platform built for universities and institutions.
            Featuring an editorial design system, real-time inventory locking, and an educational
            C99 algorithm engine with 154 passing unit tests.
          </p>

          {/* ⚡ One-Click Instant Demo Launcher */}
          <div className="card p-5 bg-surface-2/60 border-accent/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold font-mono uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Launch Live Demo in 1-Click
              </span>
              <span className="text-3xs text-ink-muted">No password typing needed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleQuickLogin('ADMIN')}
                disabled={isLoggingIn}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent hover:bg-accent-bg text-left transition-all group flex flex-col justify-between h-20"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-ink group-hover:text-accent">👑 Administrator</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-3xs text-ink-muted">Full catalog, member permissions, audit log</span>
              </button>

              <button
                onClick={() => handleQuickLogin('LIBRARIAN')}
                disabled={isLoggingIn}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent hover:bg-accent-bg text-left transition-all group flex flex-col justify-between h-20"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-ink group-hover:text-accent">📖 Librarian</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-3xs text-ink-muted">Issue/return books, FIFO queues, holds</span>
              </button>

              <button
                onClick={() => handleQuickLogin('STUDENT')}
                disabled={isLoggingIn}
                className="p-3 rounded-lg border border-border bg-surface hover:border-accent hover:bg-accent-bg text-left transition-all group flex flex-col justify-between h-20"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-ink group-hover:text-accent">🎓 Student Member</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-3xs text-ink-muted">Personal borrow status, reservation requests</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-8 max-w-3xl">
          {[
            { label: 'C DSA Algorithms', value: '10 Engines' },
            { label: 'Unit Tests Passing', value: '154 / 154 PASS' },
            { label: 'Active Pages', value: '20 Pages' },
            { label: 'Database Integrity', value: 'SQLite WAL Mode' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-lg font-bold tabular text-ink font-mono">{stat.value}</div>
              <div className="text-xs text-ink-muted mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Live Catalogue Explorer */}
      <section className="border-t border-border bg-surface py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-accent">Live Catalogue Preview</span>
              <h2 className="text-xl font-semibold text-ink mt-1">Explore Institutional Holdings</h2>
            </div>

            {/* Live Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Technology', 'Science', 'Fiction', 'History', 'Philosophy'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatalogueFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    catalogueFilter === cat
                      ? 'bg-accent text-white'
                      : 'bg-surface-2 text-ink-2 hover:text-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              value={catalogueSearch}
              onChange={e => setCatalogueSearch(e.target.value)}
              placeholder="Search sample books by title or author…"
              className="input-base pl-9 text-xs h-9"
            />
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {filteredPreviewBooks.map(book => (
              <div
                key={book.title}
                onClick={() => handleQuickLogin('STUDENT')}
                className="card overflow-hidden group cursor-pointer hover:border-accent transition-all flex flex-col justify-between"
              >
                <div className="h-40 overflow-hidden relative bg-surface-2">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-3xs font-bold ${
                    book.available ? 'bg-accent text-white' : 'bg-crit text-white'
                  }`}>
                    {book.available ? 'Available' : 'Reserved'}
                  </span>
                </div>
                <div className="p-2.5 space-y-1">
                  <span className="text-3xs text-accent font-semibold uppercase">{book.category}</span>
                  <h3 className="text-xs font-semibold text-ink book-title clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-3xs text-ink-muted truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => handleQuickLogin('STUDENT')}
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
            >
              Log in to view complete 40+ holdings catalogue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Breakdown */}
      <section className="border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xs font-semibold uppercase tracking-widest text-ink-muted mb-8">
            Complete Operations Platform
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BookOpen,
                title: 'Live Catalog & Holdings',
                desc: 'Atomic copy inventory locks, shelf location mapping, and multi-field debounced queries.'
              },
              {
                icon: Clock,
                title: 'FIFO Reservation Holds',
                desc: 'Guaranteed First-In-First-Out reservation queues automatically notified when inventory returns.'
              },
              {
                icon: BarChart2,
                title: 'Operational Analytics',
                desc: 'Real SQL-computed metrics for loan durations, return velocity, and overdue fines.'
              },
              {
                icon: Cpu,
                title: 'Interactive DSA Lab',
                desc: '7 live visualizers for sorts, searches, stacks, queues, BSTs, hash tables, and recommendation graphs.'
              },
              {
                icon: Shield,
                title: 'Role-Based Permissions',
                desc: 'JWT authentication with granular roles for Administrators, Librarians, and Students.'
              },
              {
                icon: Users,
                title: 'Audit & Accountability',
                desc: 'Immutable audit logs recording every borrowing, fine settlement, and metadata mutation.'
              }
            ].map(f => (
              <div key={f.title} className="card p-5 space-y-3 bg-surface">
                <div className="w-8 h-8 rounded-md bg-accent-bg flex items-center justify-center text-accent">
                  <f.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
                <p className="text-xs text-ink-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-ink">LIBRAX</span>
            <span>— Library Operations Platform</span>
          </div>
          <div>
            Built with React 18, Node.js, SQLite, and C99 DSA Engine.
          </div>
        </div>
      </footer>
    </div>
  );
}
