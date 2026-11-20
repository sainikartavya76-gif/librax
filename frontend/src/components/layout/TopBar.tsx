import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUnreadCount } from '../../hooks/useNotifications';
import { authApi } from '../../api/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../ui/Toast';
import { Bell, Menu, Search, LogOut, User, Sun, Moon, Shield, BookMarked, GraduationCap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../ui/Button';

interface TopBarProps {
  onMenuClick?: () => void;
  onThemeToggle?: () => void;
  onOpenCommandPalette?: () => void;
  isDark?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  onThemeToggle,
  onOpenCommandPalette,
  isDark = true
}) => {
  const { user, login, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const unreadCount = useUnreadCount();
  const [profileOpen, setProfileOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function getInitials(name?: string) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Quick switch role function
  const handleSwitchRole = async (targetRole: 'ADMIN' | 'LIBRARIAN' | 'STUDENT') => {
    const creds = {
      ADMIN: { email: 'admin@librax.com', pass: 'Admin@123' },
      LIBRARIAN: { email: 'librarian@librax.com', pass: 'Lib@123' },
      STUDENT: { email: 'student@librax.com', pass: 'Student@123' },
    }[targetRole];

    try {
      setSwitchingRole(true);
      const res = await authApi.login(creds.email, creds.pass);
      login(res.access_token, res.user || {
        id: targetRole === 'ADMIN' ? 1 : targetRole === 'LIBRARIAN' ? 2 : 3,
        email: creds.email,
        full_name: targetRole === 'ADMIN' ? 'Administrator' : targetRole === 'LIBRARIAN' ? 'Jane Smith' : 'Alex Johnson',
        role: targetRole,
        is_active: true
      });
      queryClient.invalidateQueries();
      toast.success(`Active role switched to ${targetRole}`);
      setProfileOpen(false);
    } catch {
      toast.error(`Failed to switch to ${targetRole}`);
    } finally {
      setSwitchingRole(false);
    }
  };

  const roleColor: Record<string, string> = {
    ADMIN: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    LIBRARIAN: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    STUDENT: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  };

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-4 border-b border-border bg-surface z-20 flex-shrink-0 gap-2"
      style={{ height: 'var(--topbar-height)' }}
    >
      {/* Left: Mobile menu + Command Palette Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-md transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global interactive search bar triggering Command Palette */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full max-w-xs md:max-w-sm h-8 px-2.5 sm:px-3 rounded-md bg-surface-2 hover:bg-surface-2/80 border border-border text-xs text-ink-muted transition-colors cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent transition-colors shrink-0" />
            <span className="truncate">Search catalogue or type command…</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-3xs opacity-80 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">Ctrl</kbd>
            <kbd className="px-1 py-0.5 rounded bg-surface border border-border">K</kbd>
          </div>
        </button>
      </div>

      {/* Center/Right: 1-Click Role Switcher Quick Bar */}
      <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-md bg-surface-2 border border-border text-3xs font-medium">
        <button
          onClick={() => handleSwitchRole('ADMIN')}
          disabled={switchingRole}
          className={cn(
            'px-2 py-1 rounded transition-colors flex items-center gap-1',
            user?.role === 'ADMIN'
              ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-surface'
          )}
          title="Switch to Administrator session"
        >
          <Shield className="w-3 h-3 text-amber-400" /> Admin
        </button>
        <button
          onClick={() => handleSwitchRole('LIBRARIAN')}
          disabled={switchingRole}
          className={cn(
            'px-2 py-1 rounded transition-colors flex items-center gap-1',
            user?.role === 'LIBRARIAN'
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-surface'
          )}
          title="Switch to Librarian session"
        >
          <BookMarked className="w-3 h-3 text-emerald-400" /> Librarian
        </button>
        <button
          onClick={() => handleSwitchRole('STUDENT')}
          disabled={switchingRole}
          className={cn(
            'px-2 py-1 rounded transition-colors flex items-center gap-1',
            user?.role === 'STUDENT'
              ? 'bg-blue-500/20 text-blue-300 font-semibold shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-surface'
          )}
          title="Switch to Student member session"
        >
          <GraduationCap className="w-3 h-3 text-blue-400" /> Student
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-md transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-info" />}
        </button>

        {/* Notifications */}
        <Link
          to="/app/notifications"
          className="relative p-1.5 text-ink-muted hover:text-ink hover:bg-surface-2 rounded-md transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-crit rounded-full" />
          )}
        </Link>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors',
              profileOpen ? 'bg-surface-2' : 'hover:bg-surface-2'
            )}
          >
            <div className="w-6 h-6 rounded-full bg-accent-bg border border-border flex items-center justify-center text-2xs font-semibold text-accent flex-shrink-0">
              {getInitials(user?.full_name)}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-xs font-medium text-ink max-w-[90px] truncate">
                {user?.full_name?.split(' ')[0] || 'User'}
              </span>
              <span className={cn('text-3xs font-mono mt-0.5', roleColor[user?.role || '']?.split(' ')[0] || 'text-ink-muted')}>
                {user?.role}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-surface border border-border rounded-lg shadow-dark-md z-50 overflow-hidden animate-fade-in">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-xs font-semibold text-ink truncate">{user?.full_name}</p>
                <p className="text-2xs text-ink-muted truncate mt-0.5">{user?.email}</p>
                <div className="mt-1.5">
                  <span className={cn('px-1.5 py-0.5 rounded text-3xs font-mono font-bold border', roleColor[user?.role || ''] || 'text-ink-muted border-border')}>
                    ROLE: {user?.role}
                  </span>
                </div>
              </div>

              {/* Role Switcher options inside dropdown */}
              <div className="p-1 border-b border-border bg-surface-2/40">
                <span className="text-3xs uppercase tracking-wider font-semibold text-ink-muted px-2 py-1 block">
                  Switch Active Role:
                </span>
                <div className="grid grid-cols-3 gap-1 px-1 pb-1">
                  <button
                    onClick={() => handleSwitchRole('ADMIN')}
                    className={cn(
                      'py-1 text-3xs rounded text-center font-medium transition-colors',
                      user?.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'hover:bg-surface text-ink-2'
                    )}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleSwitchRole('LIBRARIAN')}
                    className={cn(
                      'py-1 text-3xs rounded text-center font-medium transition-colors',
                      user?.role === 'LIBRARIAN' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:bg-surface text-ink-2'
                    )}
                  >
                    Librarian
                  </button>
                  <button
                    onClick={() => handleSwitchRole('STUDENT')}
                    className={cn(
                      'py-1 text-3xs rounded text-center font-medium transition-colors',
                      user?.role === 'STUDENT' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'hover:bg-surface text-ink-2'
                    )}
                  >
                    Student
                  </button>
                </div>
              </div>

              <div className="p-1">
                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-ink hover:bg-surface-2 rounded transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-ink-muted" />
                  Profile & Settings
                </Link>
                <button
                  onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-crit hover:bg-crit-bg rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
