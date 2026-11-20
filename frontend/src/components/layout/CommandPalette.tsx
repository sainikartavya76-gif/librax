import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, LayoutDashboard, Users, ArrowLeftRight, Clock,
  AlertCircle, BarChart2, Cpu, Activity, Settings, Sun,
  RotateCcw, Plus, LogOut
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { useToast } from '../ui/Toast';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeToggle: () => void;
}

export default function CommandPalette({ isOpen, onClose, onThemeToggle }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  // Navigation commands
  const basePages = [
    { title: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Book Catalogue', path: '/app/books', icon: BookOpen, category: 'Navigation' },
    ...(isStaff ? [{ title: 'Member Directory', path: '/app/members', icon: Users, category: 'Navigation' }] : []),
    ...(isStaff ? [{ title: 'Circulation & Loans', path: '/app/transactions', icon: ArrowLeftRight, category: 'Navigation' }] : []),
    { title: 'Reservation Queue', path: '/app/reservations', icon: Clock, category: 'Navigation' },
    { title: 'Fines & Penalties', path: '/app/fines', icon: AlertCircle, category: 'Navigation' },
    ...(isStaff ? [{ title: 'Operational Analytics', path: '/app/analytics', icon: BarChart2, category: 'Navigation' }] : []),
    { title: 'DSA Laboratory', path: '/app/dsa-lab', icon: Cpu, category: 'Navigation' },
    ...(isStaff ? [{ title: 'Audit Activity Log', path: '/app/activity', icon: Activity, category: 'Navigation' }] : []),
    { title: 'Profile & Settings', path: '/app/settings', icon: Settings, category: 'Navigation' },
  ];

  // Quick Action commands
  const quickActions = [
    {
      title: 'Toggle Color Theme (Dark/Light)',
      action: () => { onThemeToggle(); onClose(); },
      icon: Sun,
      category: 'Actions'
    },
    ...(isStaff ? [{
      title: 'Register New Book',
      action: () => { navigate('/app/books/add'); onClose(); },
      icon: Plus,
      category: 'Actions'
    }] : []),
    {
      title: 'Reset Demo Database to Initial State',
      action: async () => {
        try {
          await apiClient.post('/activity/reset-seed');
          toast.success('Database reset to fresh demo data.');
          window.location.reload();
        } catch {
          toast.error('Failed to reset demo data');
        }
        onClose();
      },
      icon: RotateCcw,
      category: 'Actions'
    },
    {
      title: 'Sign Out of LibraX',
      action: () => { logout(); navigate('/login'); onClose(); },
      icon: LogOut,
      category: 'Actions'
    }
  ];

  // Search books when user types query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setBookResults([]);
      setIsLoadingBooks(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingBooks(true);
      try {
        const res = await apiClient.get(`/books?search=${encodeURIComponent(query)}&limit=5`);
        const items = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setBookResults(items);
      } catch {
        setBookResults([]);
      } finally {
        setIsLoadingBooks(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined item list for keyboard navigation
  const filteredPages = basePages.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredActions = quickActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const allItems: any[] = [
    ...bookResults.map(b => ({
      type: 'book',
      title: b.title,
      subtitle: `${b.author} • ${b.category}`,
      id: b.id,
      category: 'Books Found'
    })),
    ...filteredPages.map(p => ({
      type: 'page',
      title: p.title,
      path: p.path,
      icon: p.icon,
      category: 'Navigation'
    })),
    ...filteredActions.map(a => ({
      type: 'action',
      title: a.title,
      action: a.action,
      icon: a.icon,
      category: 'Actions'
    }))
  ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected) {
          if (selected.type === 'book') {
            navigate(`/app/books/${selected.id}`);
            onClose();
          } else if (selected.type === 'page') {
            navigate(selected.path);
            onClose();
          } else if (selected.type === 'action') {
            selected.action();
          }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-slide-in flex flex-col max-h-[500px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search books…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-3xs font-mono text-ink-muted bg-surface-2 border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-border/40">
          {allItems.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink-muted">
              {isLoadingBooks ? 'Searching catalogue...' : 'No matching books or commands found.'}
            </div>
          ) : (
            allItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon || BookOpen;

              return (
                <div
                  key={`${item.category}-${item.title}-${index}`}
                  onClick={() => {
                    if (item.type === 'book') {
                      navigate(`/app/books/${item.id}`);
                      onClose();
                    } else if (item.type === 'page') {
                      navigate(item.path);
                      onClose();
                    } else if (item.type === 'action') {
                      item.action();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent text-white' : 'hover:bg-surface-2 text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-surface-2 text-ink-muted'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className={`text-3xs truncate ${isSelected ? 'text-white/80' : 'text-ink-muted'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-3xs font-mono uppercase px-1.5 py-0.5 rounded ${
                    isSelected ? 'text-white/80 bg-white/10' : 'text-ink-muted bg-surface-2'
                  }`}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-surface-2 border-t border-border flex items-center justify-between text-3xs text-ink-muted font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>LibraX Command Palette</span>
        </div>
      </div>
    </div>
  );
}
