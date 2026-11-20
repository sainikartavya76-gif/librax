import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { activityApi } from '../api/activity';
import Pagination from '../components/ui/Pagination';

const ActivityPage: React.FC = () => {
  const [skip, setSkip] = useState(0);
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ['activity', skip],
    queryFn: () => activityApi.getActivity({ skip, limit })
  });

  const items = Array.isArray(data) ? data : data?.items || [];
  const total = Array.isArray(data) ? data.length : data?.total || items.length;

  const columns = [
    { key: 'user', header: 'Actor', render: (row: any) => <span className="font-medium text-ink">{row.user_name || row.user?.full_name || 'System'}</span> },
    { key: 'action', header: 'Action', render: (row: any) => (
      <Badge variant={row.action.includes('ISSUE') ? 'blue' : row.action.includes('RETURN') ? 'success' : 'neutral'}>
        {row.action}
      </Badge>
    )},
    { key: 'entity', header: 'Scope', render: (row: any) => <span className="text-2xs text-ink-muted uppercase font-mono">{row.entity_type}</span> },
    { key: 'desc', header: 'Details', render: (row: any) => <span className="text-xs text-ink-2">{row.description}</span> },
    { key: 'time', header: 'Time', render: (row: any) => (
      <span className="text-2xs text-ink-muted whitespace-nowrap">
        {row.created_at ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true }) : 'Recently'}
      </span>
    )}
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="heading-page">Audit & Activity Log</h1>
        <p className="text-xs text-ink-muted mt-0.5">Chronological record of privileged library operations and state mutations.</p>
      </div>
      <div className="card overflow-hidden">
        <DataTable columns={columns} data={items} isLoading={isLoading} keyExtractor={(r: any) => r.id} />
      </div>
      {total > limit && (
        <Pagination total={total} skip={skip} limit={limit} onPageChange={setSkip} />
      )}
    </div>
  );
};

export default ActivityPage;
