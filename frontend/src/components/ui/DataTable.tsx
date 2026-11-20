import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  error,
  emptyMessage = 'No data available',
  keyExtractor,
  onSort
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (isLoading) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-background border-b border-border"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-border flex items-center px-6 gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No results found" description={emptyMessage} />;
  }

  return (
    <div className="w-full bg-white border border-[#eaeaea] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#eaeaea]">
          <thead className="bg-[#fafafa]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3.5 text-left text-[12px] font-semibold text-[#888888] uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:text-[#171717] hover:bg-[#f0f0f0] transition-colors select-none' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {column.header}
                    {column.sortable && (
                      <span className={sortConfig?.key === column.key ? 'text-[#171717]' : 'text-[#d4d4d4]'}>
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#eaeaea]">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-[#fafafa] transition-colors group">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-[#171717]">
                    {column.render ? column.render(row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
