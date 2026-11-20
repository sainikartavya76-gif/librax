import React, { useState } from 'react';
import { useReservations, useCancelReservation } from '../hooks/useReservations';
import { DataTable } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import { Reservation } from '../types';

const ReservationsPage: React.FC = () => {
  const { data, isLoading } = useReservations();
  const reservations: Reservation[] = Array.isArray(data) ? data : (data as any)?.items || [];
  const cancel = useCancelReservation();
  
  const [cancelId, setCancelId] = useState<string | null>(null);

  const columns = [
    { 
      key: 'book', 
      header: 'Book', 
      render: (r: any) => (
        <div>
          <span className="font-medium text-ink clamp-1">{r.book?.title || r.book_title || `Book #${r.book_id}`}</span>
          <span className="text-2xs text-ink-muted font-mono">{r.book?.isbn || r.book_isbn}</span>
        </div>
      )
    },
    { 
      key: 'member', 
      header: 'Reserved By', 
      render: (r: any) => (
        <div>
          <span className="text-ink font-medium">{r.user?.full_name || r.user_name || `User #${r.user_id}`}</span>
          <div className="text-2xs text-ink-muted">{r.user_email}</div>
        </div>
      )
    },
    { 
      key: 'position', 
      header: 'FIFO Queue', 
      render: (r: any) => (
        <span className="w-6 h-6 rounded-full bg-accent-bg text-accent flex items-center justify-center text-xs font-bold font-mono">
          {r.queue_position || '1'}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (r: any) => {
        let v: any = 'neutral';
        if (r.status === 'PENDING') v = 'warning';
        if (r.status === 'FULFILLED') v = 'success';
        if (r.status === 'CANCELLED') v = 'neutral';
        return <Badge variant={v}>{r.status}</Badge>;
      }
    },
    { 
      key: 'date', 
      header: 'Reserved On', 
      render: (r: any) => (
        <span className="text-2xs text-ink-muted">
          {new Date(r.reserved_at || r.created_at).toLocaleDateString()}
        </span>
      )
    },
    { 
      key: 'actions', 
      header: 'Actions', 
      render: (r: any) => r.status === 'PENDING' && (
        <Button variant="outline" size="sm" onClick={() => setCancelId(String(r.id))}>Cancel</Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="heading-page">Reservation Queue</h1>
        <p className="text-xs text-ink-muted mt-0.5">Strict First-In-First-Out hold list for checked-out inventory.</p>
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={reservations} isLoading={isLoading} keyExtractor={r => String(r.id)} />
      </div>
      <ConfirmDialog 
        isOpen={!!cancelId} 
        onClose={() => setCancelId(null)}
        title="Cancel Reservation"
        description="Are you sure you want to release this spot in the FIFO hold queue?"
        onConfirm={() => cancelId && cancel.mutate(cancelId, { onSuccess: () => setCancelId(null) })}
      />
    </div>
  );
};

export default ReservationsPage;
