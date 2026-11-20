import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { DataTable } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import IssueBookForm from '../components/transactions/IssueBookForm';
import ReturnBookForm from '../components/transactions/ReturnBookForm';
import { Transaction } from '../types';
import { Plus, RotateCcw } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useTransactions(statusFilter ? { status: statusFilter } : {});
  const transactions: Transaction[] = Array.isArray(data) ? data : (data as any)?.items || [];

  const [issueOpen, setIssueOpen] = useState(false);
  const [returnTransaction, setReturnTransaction] = useState<any>(null);

  const columns = [
    {
      key: 'book',
      header: 'Book',
      render: (t: Transaction) => (
        <div>
          <div className="font-medium text-ink clamp-1">{t.book?.title || (t as any).book_title || `Book #${t.book_id}`}</div>
          <div className="text-2xs text-ink-muted font-mono">{t.book?.isbn || (t as any).book_isbn}</div>
        </div>
      )
    },
    {
      key: 'member',
      header: 'Borrower',
      render: (t: Transaction) => (
        <div>
          <div className="font-medium text-ink">{t.user?.full_name || (t as any).user_name || `User #${t.user_id}`}</div>
          <div className="text-2xs text-ink-muted">{(t as any).user_email || t.user?.email}</div>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Issue / Due Date',
      render: (t: Transaction) => (
        <div className="text-xs">
          <div className="text-ink">{new Date(t.issue_date).toLocaleDateString()}</div>
          <div className="text-ink-muted text-2xs">Due: {new Date(t.due_date).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (t: Transaction) => {
        let variant: any = 'neutral';
        if (t.status === 'ACTIVE') variant = 'blue';
        if (t.status === 'RETURNED') variant = 'success';
        if (t.status === 'OVERDUE') variant = 'danger';
        return <Badge variant={variant}>{t.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: Transaction) => t.status !== 'RETURNED' ? (
        <Button 
          size="sm" 
          variant="outline" 
          leftIcon={<RotateCcw className="w-3.5 h-3.5 text-accent" />}
          onClick={() => setReturnTransaction(t)}
        >
          Return Book
        </Button>
      ) : (
        <span className="text-2xs text-ink-muted font-mono">Completed</span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">Circulation & Loans</h1>
          <p className="text-xs text-ink-muted mt-0.5">Active borrow records, returns, and overdue loan management.</p>
        </div>
        <Button leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIssueOpen(true)}>
          Issue Book
        </Button>
      </div>
      
      <div className="flex gap-1.5 border-b border-border pb-2">
        {['', 'ACTIVE', 'RETURNED', 'OVERDUE'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              statusFilter === status 
                ? 'bg-accent text-white' 
                : 'bg-surface-2 text-ink-2 hover:text-ink'
            }`}
          >
            {status || 'All Loans'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <DataTable columns={columns} data={transactions} isLoading={isLoading} keyExtractor={t => String(t.id)} />
      </div>
      
      <IssueBookForm isOpen={issueOpen} onClose={() => setIssueOpen(false)} />
      <ReturnBookForm isOpen={!!returnTransaction} onClose={() => setReturnTransaction(null)} transaction={returnTransaction} />
    </div>
  );
};

export default TransactionsPage;
