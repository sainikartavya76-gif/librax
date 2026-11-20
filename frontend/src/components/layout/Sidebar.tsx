import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  Clock, AlertCircle, BarChart2, Cpu, Activity, Settings,
  LogOut, Bell, ChevronRight, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../ui/Button';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: number;
  staffOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Catalogue', to: '/app/books', icon: BookOpen },
  { name: 'Members', to: '/app/members', icon: Users, staffOnly: true },
  { name: 'Transactions', to: '/app/transactions', icon: ArrowLeftRight, staffOnly: true },
  { name: 'Reservations', to: '/app/reservations', icon: Clock },
  { name: 'Fines', to: '/app/fines', icon: AlertCircle },
  { name: 'Analytics', to: '/app/analytics', icon: BarChart2, staffOnly: true },
  { name: 'DSA Lab', to: '/app/dsa-lab', icon: Cpu },
  { name: 'Activity', to: '/app/activity', icon: Activity, staffOnly: true },
  { name: 'Notifications', to: '/app/notifications', icon: Bell },
];

interface SidebarContentProps {
  onClose?: () => void;
}

function SidebarContent({ onClose }: SidebarContentProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const visibleItems = navItems.filter(item => !item.staffOnly || isStaff);

  function getInitials(name?: string) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const roleColor: Record<string, string> = {
    ADMIN: 'text-warn',
    LIBRARIAN: 'text-accent',
    STUDENT: 'text-info',
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between h-13 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent rounded flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-ink">LIBRAX</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group',
                  isActive
                    ? 'bg-accent-bg text-accent font-medium'
                    : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                )}
              >
                <item.icon
                  className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-accent' : 'text-ink-muted group-hover:text-ink')}
                />
                <span className="flex-1 min-w-0 truncate">{item.name}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-accent opacity-60" />}
              </NavLink>
            );
          })}
        </div>

        {/* Settings */}
        <div className="mt-2 pt-2 border-t border-border space-y-0.5">
          <NavLink
            to="/app/settings"
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group',
              isActive
                ? 'bg-accent-bg text-accent font-medium'
                : 'text-ink-2 hover:text-ink hover:bg-surface-2'
            )}
          >
            <Settings className="w-4 h-4 flex-shrink-0 text-ink-muted group-hover:text-ink" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* User profile */}
      <div className="flex-shrink-0 p-3 border-t border-border">
        <div className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-semibold text-ink flex-shrink-0">
            {getInitials(user?.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink truncate">{user?.full_name || 'Unknown'}</p>
            <p className={cn('text-2xs font-medium truncate', roleColor[user?.role || ''] || 'text-ink-muted')}>
              {user?.role}
            </p>
          </div>
          <button
            onClick={() => { logout(); }}
            className="text-ink-muted hover:text-crit p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Desktop sidebar
export function Sidebar() {
  return (
    <div
      className="hidden md:flex md:flex-col flex-shrink-0"
      style={{ width: 'var(--sidebar-width)' }}
    >
      <SidebarContent />
    </div>
  );
}

// Mobile drawer
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 md:hidden transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onClose={onClose} />
      </div>
    </>
  );
}

export default Sidebar;
