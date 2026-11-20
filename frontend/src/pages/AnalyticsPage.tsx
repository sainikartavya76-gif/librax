import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { BookOpen, RefreshCw, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

const CHART_COLORS = ['#3d8b6a', '#4aa07c', '#d97706', '#ef4444', '#60a5fa', '#a78bfa', '#f472b6', '#34d399'];

const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState(14);

  const { data: dashboard } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboard').then(r => r.data)
  });

  const { data: issuance, isLoading: issuanceLoading } = useQuery({
    queryKey: ['analytics', 'issuance', days],
    queryFn: () => apiClient.get(`/analytics/issuance?days=${days}`).then(r => r.data)
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: () => apiClient.get('/analytics/categories').then(r => r.data)
  });

  const { data: popular, isLoading: popLoading } = useQuery({
    queryKey: ['analytics', 'popular'],
    queryFn: () => apiClient.get('/analytics/popular').then(r => r.data)
  });

  const { data: overdueRate } = useQuery({
    queryKey: ['analytics', 'overdue-rate'],
    queryFn: () => apiClient.get('/analytics/overdue-rate').then(r => r.data)
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">Operational Analytics</h1>
          <p className="text-xs text-ink-muted mt-0.5">Authoritative performance metrics derived directly from SQL transaction records.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-md border border-border">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                days === d ? 'bg-accent text-white' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="card p-3.5">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-2xs uppercase tracking-wider font-medium">Total Books</span>
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-ink tabular">{dashboard?.total_books ?? 0}</div>
          <p className="text-2xs text-ink-muted mt-0.5">{dashboard?.available_books ?? 0} copies currently on shelves</p>
        </div>

        <div className="card p-3.5">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-2xs uppercase tracking-wider font-medium">Active Loans</span>
            <RefreshCw className="w-4 h-4 text-info" />
          </div>
          <div className="text-2xl font-bold text-ink tabular">{dashboard?.active_issues ?? 0}</div>
          <p className="text-2xs text-ink-muted mt-0.5">Checked out across campus</p>
        </div>

        <div className="card p-3.5">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-2xs uppercase tracking-wider font-medium">Overdue Rate</span>
            <AlertTriangle className="w-4 h-4 text-warn" />
          </div>
          <div className="text-2xl font-bold text-ink tabular">{overdueRate?.overdue_rate ?? 0}%</div>
          <p className="text-2xs text-ink-muted mt-0.5">{dashboard?.overdue_count ?? 0} loans currently overdue</p>
        </div>

        <div className="card p-3.5">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-2xs uppercase tracking-wider font-medium">Avg Duration</span>
            <Clock className="w-4 h-4 text-ink-2" />
          </div>
          <div className="text-2xl font-bold text-ink tabular">{overdueRate?.avg_duration_days ?? 0} <span className="text-xs font-normal">days</span></div>
          <p className="text-2xs text-ink-muted mt-0.5">Average time before return</p>
        </div>

        <div className="card p-3.5">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-2xs uppercase tracking-wider font-medium">Total Fines</span>
            <TrendingUp className="w-4 h-4 text-crit" />
          </div>
          <div className="text-2xl font-bold text-crit tabular">${(overdueRate?.total_fines_amount ?? 0).toFixed(2)}</div>
          <p className="text-2xs text-ink-muted mt-0.5">Cumulative fee assessments</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Issuance & Returns Timeline */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="heading-card">Circulation Activity ({days} Days)</h2>
              <p className="text-2xs text-ink-muted">Daily volume of loans issued vs. returned inventory</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {issuanceLoading ? (
              <div className="skeleton h-full w-full rounded" />
            ) : issuance?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={issuance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252a38" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8f9ab0' }} tickFormatter={d => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#8f9ab0' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141720', borderColor: '#252a38', fontSize: 12, borderRadius: 6, color: '#e8e4dc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="issued" name="Issued" stroke="#3d8b6a" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="returned" name="Returned" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-muted">No circulation records for this timeframe.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-4">
          <div className="mb-4">
            <h2 className="heading-card">Collection by Category</h2>
            <p className="text-2xs text-ink-muted">Catalog holdings distribution</p>
          </div>
          <div className="h-64 w-full">
            {catLoading ? (
              <div className="skeleton h-full w-full rounded" />
            ) : categories?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141720', borderColor: '#252a38', fontSize: 12, borderRadius: 6, color: '#e8e4dc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink-muted">No categories recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Borrowed Books Table */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="heading-card">Most Popular Titles</h2>
            <p className="text-2xs text-ink-muted">Top books ranked by total borrowing frequency</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10">Rank</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th className="text-right pr-6">Borrow Count</th>
              </tr>
            </thead>
            <tbody>
              {popLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-3"><div className="skeleton h-4 w-full" /></td>
                  </tr>
                ))
              ) : popular?.length ? (
                popular.map((b: any, index: number) => (
                  <tr key={b.id}>
                    <td className="font-mono text-2xs text-ink-muted">#{index + 1}</td>
                    <td className="font-medium text-ink book-title">{b.title}</td>
                    <td className="text-xs text-ink-muted">{b.author}</td>
                    <td><span className="badge badge-neutral">{b.category}</span></td>
                    <td className="text-right pr-6 font-mono font-semibold text-accent tabular">
                      {b.borrow_count}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-xs text-ink-muted">No loans recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
