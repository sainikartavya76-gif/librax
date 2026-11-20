import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

const IssuanceChart: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', 'charts', 'issuance'],
    queryFn: () => apiClient.get('/analytics/charts/issuance').then(r => r.data),
  });

  if (isLoading) {
    return <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md" />;
  }
  if (error || !data || data.length === 0) {
    return <div className="h-64 w-full flex items-center justify-center text-textMuted border border-border rounded-md">No data available</div>;
  }

  return (
    <div className="bg-surface p-4 border border-border rounded-lg shadow-sm">
      <h3 className="text-sm font-semibold text-textPrimary mb-4">Daily Book Issuances (Last 30 Days)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E4E0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B6B67' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B6B67' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E4E0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value} books issued`, 'Count']}
              labelStyle={{ color: '#1A1A18', fontWeight: 500 }}
            />
            <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#2563EB' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default IssuanceChart;
