import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

const FineChart: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'charts', 'fines'],
    queryFn: () => apiClient.get('/analytics/charts/fines').then(r => r.data),
  });

  if (isLoading) {
    return <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md" />;
  }
  if (error || !data || data.length === 0) {
    return <div className="h-64 w-full flex items-center justify-center text-textMuted border border-border rounded-md">No data available</div>;
  }

  return (
    <div className="bg-surface p-4 border border-border rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold text-textPrimary mb-4">Fine Collection (Last 30 Days)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E4E0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B6B67' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 12, fill: '#6B6B67' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E4E0' }}
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
            />
            <Line type="stepAfter" dataKey="amount" stroke="#DC2626" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default FineChart;
