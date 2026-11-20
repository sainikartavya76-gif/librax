import React, { useState } from 'react';
import { useFines, usePayFine } from '../hooks/useFines';
import { DataTable } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Fine } from '../types';
import { CheckCircle2 } from 'lucide-react';

const FinesPage: React.FC = () => {
  const [filter, setFilter] = useState<string>(''); // '', 'UNPAID', 'PAID'
  
  const { data, isLoading } = useFines(filter ? { status: filter } : {});
  const fines: Fine[] = Array.isArray(data) ? data : (data as any)?.items || [];
  const payMutation = usePayFine();

  const totalUnpaid = fines
    .filter((f: any) => !f.paid && f.status !== 'PAID')
    .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);

  const columns = [
    { 
      key: 'member', 
      header: 'Member', 
      render: (f: any) => (
        <div>
          <span className="font-medium text-ink">{f.user?.full_name || f.user_name || `User #${f.user_id}`}</span>
          <div className="text-2xs text-ink-muted">{f.user_email}</div>
        </div>
      )
    },
    { 
      key: 'book', 
      header: 'Book / Transaction', 
      render: (f: any) => (
        <div>
          <span className="text-xs font-medium text-ink clamp-1">{f.book_title || f.transaction?.book?.title || `Tx #${f.transaction_id}`}</span>
          {f.overdue_days ? (
            <span className="text-2xs text-crit font-medium">{f.overdue_days} days overdue</span>
          ) : null}
        </div>
      )
    },
    { 
      key: 'amount', 
      header: 'Fine Amount', 
      render: (f: any) => (
        <span className="font-semibold text-xs font-mono text-crit">
          ${Number(f.amount || 0).toFixed(2)}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Settlement Status', 
      render: (f: any) => {
        const isPaid = f.paid === 1 || f.paid === true || f.status === 'PAID';
        return <Badge variant={isPaid ? 'success' : 'danger'}>{isPaid ? 'Settled' : 'Outstanding'}</Badge>;
      }
    },
    { 
      key: 'date', 
      header: 'Assessed On', 
      render: (f: any) => (
        <span className="text-2xs text-ink-muted">
          {new Date(f.created_at).toLocaleDateString()}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (f: any) => {
        const isPaid = f.paid === 1 || f.paid === true || f.status === 'PAID';
        return !isPaid ? (
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={() => payMutation.mutate(String(f.id))} 
            isLoading={payMutation.isPending}
          >
            Settle Fine
          </Button>
        ) : (
          <span className="text-2xs text-accent font-mono">Paid</span>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">Fines & Penalties</h1>
          <p className="text-xs text-ink-muted mt-0.5">Automated overdue fee tracking calculated at $2.00/day.</p>
        </div>
        <div className="card px-3.5 py-2 flex items-center gap-3">
          <span className="text-2xs uppercase text-ink-muted font-medium">Outstanding Balance</span>
          <span className="text-base font-bold tabular text-crit">${totalUnpaid.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-1.5 border-b border-border pb-2">
        {[{l: 'All Assessments', v: ''}, {l: 'Outstanding', v: 'UNPAID'}, {l: 'Settled', v: 'PAID'}].map(tab => (
          <button
            key={tab.v}
            onClick={() => setFilter(tab.v)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              filter === tab.v
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            {tab.l}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <DataTable columns={columns} data={fines} isLoading={isLoading} keyExtractor={f => String(f.id)} />
      </div>
    </div>
  );
};

export default FinesPage;
