import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, AlertTriangle, RefreshCcw, Users,
  Plus, RotateCcw, Clock, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { DashboardStats } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';
import { SkeletonRow } from '../components/ui/Skeleton';
import IssueBookForm from '../components/transactions/IssueBookForm';
import ReturnBookForm from '../components/transactions/ReturnBookForm';
import { useToast } from '../components/ui/Toast';
import { cn } from '../components/ui/Button';

function StatTile({
  label,
  value,
  icon: Icon,
  variant = 'default',
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  variant?: 'default' | 'warn' | 'crit' | 'accent';
  sub?: string;
}) {
  const colors = {
    default: 'text-ink-2 bg-surface-2',
    warn: 'text-warn bg-warn-bg',
    crit: 'text-crit bg-crit-bg',
    accent: 'text-accent bg-accent-bg',
  };

  return (
    <div className="card p-4 flex items-start gap-3">
      <div className={cn('w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5', colors[variant])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold tabular text-ink leading-none">{value}</div>
        <div className="text-xs text-ink-muted mt-1">{label}</div>
        {sub && <div className="text-2xs text-ink-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function OverdueRow({ tx, onReturn }: { tx: any; onReturn: (tx: any) => void }) {
  const daysLate = Math.max(1, Math.floor(
    (Date.now() - new Date(tx.due_date).getTime()) / 86400000
  ));
  return (
    <tr className="hover:bg-surface-2 transition-colors">
      <td className="px-4 py-2.5 border-b border-border">
        <div className="text-sm font-medium text-ink clamp-1 book-title">{tx.book_title || tx.book?.title || `Book #${tx.book_id}`}</div>
        <div className="text-xs text-ink-muted">{tx.user_name || tx.user?.full_name || `User #${tx.user_id}`}</div>
      </td>
      <td className="px-4 py-2.5 border-b border-border text-xs text-ink-muted whitespace-nowrap">
        {format(new Date(tx.due_date), 'dd MMM yyyy')}
      </td>
      <td className="px-4 py-2.5 border-b border-border">
        <span className="badge badge-crit">{daysLate}d overdue</span>
      </td>
      <td className="px-4 py-2.5 border-b border-border text-right">
        <button
          onClick={() => onReturn(tx)}
          className="text-xs font-medium text-accent hover:underline px-2 py-1 rounded bg-accent-bg"
        >
          Return
        </button>
      </td>
    </tr>
  );
}

function ActivityItem({ act }: { act: any }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm text-ink">
          <span className="font-semibold text-xs font-mono uppercase text-accent">{act.action}</span>
          {act.description && <span className="text-ink-2 text-xs ml-1.5">{act.description}</span>}
        </div>
        <div className="text-2xs text-ink-muted mt-0.5">
          {act.created_at
            ? formatDistanceToNow(new Date(act.created_at), { addSuffix: true })
            : 'Recently'}
        </div>
      </div>
    </div>
  );
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);
  const qc = useQueryClient();

  const { data: dash, isLoading } = useQuery<DashboardStats>({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboard').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: studentLoans } = useQuery({
    queryKey: ['student-loans'],
    queryFn: () => apiClient.get('/transactions').then(r => Array.isArray(r.data) ? r.data : r.data?.items || []),
    enabled: user?.role === 'STUDENT',
  });

  const isStaff = user?.role === 'LIBRARIAN' || user?.role === 'ADMIN';
  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      await apiClient.post('/activity/reset-seed');
      qc.invalidateQueries();
      toast.success('Database reset to fresh demo dataset!');
    } catch {
      toast.error('Failed to reset demo dataset');
    } finally {
      setIsResetting(false);
    }
  };

  const handleQuickReturn = (tx: any) => {
    setSelectedTx(tx);
    setReturnOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Page header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
        <div>
          <p className="text-xs text-ink-muted mb-1">{today}</p>
          <div className="flex items-center gap-2">
            <h1 className="heading-page">
              {isStaff ? 'Operations Hub' : `Welcome, ${user?.full_name?.split(' ')[0] || 'Member'}`}
            </h1>
            <span className="badge badge-accent text-3xs font-mono">{user?.role}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <button
            onClick={handleResetDemoData}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 border border-border text-ink-2 text-xs font-medium rounded-md hover:bg-surface-2 transition-colors"
            title="Reset to pristine sample data"
          >
            <RotateCcw className={cn("w-3.5 h-3.5", isResetting && "animate-spin")} />
            Reset Demo Data
          </button>

          {isStaff ? (
            <>
              <button
                onClick={() => { setSelectedTx(null); setReturnOpen(true); }}
                className="inline-flex items-center gap-1.5 h-8 px-3 border border-border text-ink text-xs font-medium rounded-md hover:bg-surface-2 transition-colors"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Return Book
              </button>
              <button
                onClick={() => setIssueOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-accent text-white text-xs font-medium rounded-md hover:bg-accent-hover transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue Book
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/app/books')}
              className="inline-flex items-center gap-1.5 h-8 px-3 bg-accent text-white text-xs font-medium rounded-md hover:bg-accent-hover transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Browse Catalogue
            </button>
          )}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Active Loans"
          value={dash?.active_issues ?? 0}
          icon={RefreshCcw}
          variant={(dash?.active_issues ?? 0) > 0 ? 'accent' : 'default'}
          sub={`${dash?.books_issued_today ?? 0} issued today`}
        />
        <StatTile
          label="Overdue Returns"
          value={dash?.overdue_count ?? 0}
          icon={AlertTriangle}
          variant={(dash?.overdue_count ?? 0) > 0 ? 'crit' : 'default'}
          sub="Requires follow-up"
        />
        <StatTile
          label="Holdings on Shelf"
          value={dash?.available_books ?? 0}
          icon={BookOpen}
          variant="default"
          sub={`of ${dash?.total_books ?? 0} total copies`}
        />
        <StatTile
          label="Registered Members"
          value={dash?.total_members ?? 0}
          icon={Users}
          variant="default"
          sub="Active campus accounts"
        />
      </div>

      {/* Student View: Personal Active Loans */}
      {!isStaff && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-card">My Active Borrowed Books</h2>
            <span className="text-2xs text-ink-muted">Limit: 3 concurrent loans</span>
          </div>
          {studentLoans && studentLoans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {studentLoans.filter((l: any) => l.status === 'ACTIVE' || l.status === 'OVERDUE').map((l: any) => {
                const isOverdue = l.status === 'OVERDUE';
                return (
                  <div key={l.id} className="card-2 p-3 flex flex-col justify-between">
                    <div>
                      <span className={`badge ${isOverdue ? 'badge-crit' : 'badge-success'} mb-1.5`}>
                        {isOverdue ? 'Overdue' : 'Active Loan'}
                      </span>
                      <h4 className="font-semibold text-xs text-ink book-title">{l.book_title || l.book?.title}</h4>
                      <p className="text-2xs text-ink-muted mt-0.5">Due: {new Date(l.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border flex justify-between items-center text-2xs">
                      <span className="font-mono text-ink-muted">Tx #{l.id}</span>
                      <span className="text-accent font-medium">Return at front desk</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-ink-muted border border-dashed border-border rounded-lg">
              You currently have no active borrowed books. Visit the catalogue to check out titles!
            </div>
          )}
        </div>
      )}

      {/* Operations Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity timeline */}
        <div className="card overflow-hidden flex flex-col">
          <div className="card-header flex items-center justify-between">
            <h2 className="heading-card">Recent Activity Log</h2>
            <button
              onClick={() => navigate('/app/activity')}
              className="text-2xs text-accent hover:underline flex items-center gap-1 font-medium"
            >
              Full log <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border flex-1 overflow-auto">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3"><div className="skeleton w-full h-8" /></div>
              ))
            ) : dash?.recent_activity?.length ? (
              dash.recent_activity.map((act, i) => <ActivityItem key={i} act={act} />)
            ) : (
              <div className="py-12 text-center text-xs text-ink-muted">No activity recorded yet</div>
            )}
          </div>
        </div>

        {/* Overdue books with 1-click Return action */}
        <div className="card overflow-hidden flex flex-col">
          <div className="card-header flex items-center justify-between">
            <h2 className="heading-card">Overdue Returns & Follow-up</h2>
            {(dash?.overdue_count ?? 0) > 0 && (
              <span className="badge badge-crit">{dash?.overdue_count} Overdue</span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <table className="table-base">
                <tbody>
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)}
                </tbody>
              </table>
            ) : dash?.overdue_books?.length ? (
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Title & Borrower</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dash.overdue_books.slice(0, 8).map((tx, i) => (
                    <OverdueRow key={i} tx={tx as any} onReturn={handleQuickReturn} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xs text-ink-muted">All active loans are in good standing.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick shortcuts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Browse Catalogue', icon: BookOpen, to: '/app/books', desc: 'Search & holds' },
          { label: 'Circulation History', icon: RefreshCcw, to: '/app/transactions', desc: 'All loan records' },
          { label: 'Reservation Queue', icon: Clock, to: '/app/reservations', desc: 'FIFO hold lines' },
          { label: 'Interactive DSA Lab', icon: Zap, to: '/app/dsa-lab', desc: '10 algorithms live' },
        ].map(link => (
          <button
            key={link.label}
            onClick={() => navigate(link.to)}
            className="card p-3 flex items-center gap-3 hover:border-accent transition-all text-left group"
          >
            <div className="w-8 h-8 bg-surface-2 rounded-md flex items-center justify-center flex-shrink-0 group-hover:bg-accent-bg group-hover:text-accent transition-colors">
              <link.icon className="w-4 h-4 text-ink-2 group-hover:text-accent" />
            </div>
            <div>
              <span className="text-xs font-semibold text-ink block leading-tight">{link.label}</span>
              <span className="text-3xs text-ink-muted block mt-0.5">{link.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Modals */}
      <IssueBookForm
        isOpen={issueOpen}
        onClose={() => {
          setIssueOpen(false);
          qc.invalidateQueries();
        }}
      />
      <ReturnBookForm
        isOpen={returnOpen}
        transaction={selectedTx}
        onClose={() => {
          setReturnOpen(false);
          setSelectedTx(null);
          qc.invalidateQueries();
        }}
      />
    </div>
  );
};

export default DashboardPage;
