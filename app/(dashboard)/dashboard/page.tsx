'use client';

import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { StatTile, ErrorBanner, Card, CardHeader } from '@/components/ui';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
=======
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { StatTile, ErrorBanner, Card, CardHeader } from '@/components/ui';
import { useTheme } from '@/components/theme-provider';

// Master audit / ZannyPay_Master_Audit_v2, Section 6: "the actual admin
// dashboard screenshot shows a 'Wallet Volume — Last 8 Weeks' bar chart —
// but getDashboardStats() only ever returned one 30-day aggregate total,
// nothing chartable. That bar chart's data is necessarily either
// hardcoded or randomized on the frontend today." This wires the new
// /admin/analytics/trend and /admin/analytics/category-breakdown
// endpoints in, so the chart on this page is finally real.

const CATEGORY_COLORS = ['#0A1B4D', '#D4A445', '#16307A', '#D97706', '#64748B', '#0EA5E9', '#DC2626'];

function formatNaira(value: number) {
  return `₦${Number(value).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function formatCompactNaira(value: number) {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value}`;
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<{ date: string; count: number; volume: number }[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number; volume: number }[]>([]);
>>>>>>> cc343e15 (Upgrade to v8 commit)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/admin/dashboard')
<<<<<<< HEAD
      .then((res) => {
        // If your backend wraps responses in { data: ... }, extract it. Otherwise use res directly.
        const data = res.data ? res.data : res;
        setStats(data);
      })
      .catch((err: ClientApiError) => setError(err.message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!stats) return <p className="text-sm text-slate-400">Loading…</p>;

  // Safe extractors with fallbacks to 0 to prevent toLocaleString crashes
=======
      .then((res) => setStats(res.data ? res.data : res))
      .catch((err: ClientApiError) => setError(err.message));
    apiFetch('/admin/analytics/trend?days=30')
      .then(setTrend)
      .catch(() => {}); // non-fatal — the stat tiles above still render without the chart
    apiFetch('/admin/analytics/category-breakdown?days=30')
      .then(setCategories)
      .catch(() => {});
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

>>>>>>> cc343e15 (Upgrade to v8 commit)
  const totalUsers = stats.totalUsers || 0;
  const frozenUsers = stats.frozenUsers || 0;
  const pendingKyc = stats.pendingKycReviews || 0;
  const walletFloat = stats.totalWalletFloat || 0;
  const activeLoans = stats.activeLoans || 0;
  const openDisputes = stats.openDisputes || 0;
  const flaggedTx = stats.flaggedTransactions || 0;
<<<<<<< HEAD
  
  const txCount = stats.last30Days?.transactionCount || 0;
  const txVolume = stats.last30Days?.transactionVolume || 0;

  function formatNaira(value: number) {
    return `₦${Number(value).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
  }
=======

  const txCount = stats.last30Days?.transactionCount || 0;
  const txVolume = stats.last30Days?.transactionVolume || 0;

  const axisColor = theme === 'dark' ? '#64748B' : '#94A3B8';
  const gridColor = theme === 'dark' ? '#1E293B' : '#E2E8F0';
>>>>>>> cc343e15 (Upgrade to v8 commit)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
<<<<<<< HEAD
        <StatTile label="Total users" value={totalUsers.toLocaleString()} />
        <StatTile 
          label="Frozen accounts" 
          value={frozenUsers.toLocaleString()} 
          hint={frozenUsers > 0 ? 'Review in Users' : undefined} 
        />
        <StatTile 
          label="Pending KYC reviews" 
          value={pendingKyc.toLocaleString()} 
          hint={pendingKyc > 0 ? 'Awaiting decision' : 'All caught up'} 
        />
        <StatTile 
          label="Total wallet float" 
          value={formatNaira(walletFloat)} 
          hint="Sum of all customer balances" 
        />
        <StatTile label="Active loans" value={activeLoans.toLocaleString()} />
        <StatTile label="Open disputes" value={openDisputes.toLocaleString()} />
        <StatTile 
          label="Flagged transactions" 
          value={flaggedTx.toLocaleString()} 
          hint="See Fraud & Risk" 
        />
        <StatTile 
          label="30-day volume" 
          value={formatNaira(txVolume)} 
          hint={`${txCount.toLocaleString()} completed transactions`} 
        />
=======
        {[
          { label: 'Total users', value: totalUsers.toLocaleString() },
          { label: 'Frozen accounts', value: frozenUsers.toLocaleString(), hint: frozenUsers > 0 ? 'Review in Users' : undefined, tone: frozenUsers > 0 ? 'warning' : 'neutral' },
          { label: 'Pending KYC reviews', value: pendingKyc.toLocaleString(), hint: pendingKyc > 0 ? 'Awaiting decision' : 'All caught up', tone: pendingKyc > 0 ? 'warning' : 'neutral' },
          { label: 'Total wallet float', value: formatNaira(walletFloat), hint: 'Sum of all customer balances' },
          { label: 'Active loans', value: activeLoans.toLocaleString() },
          { label: 'Open disputes', value: openDisputes.toLocaleString() },
          { label: 'Flagged transactions', value: flaggedTx.toLocaleString(), hint: flaggedTx > 0 ? 'See Fraud & Risk' : undefined, tone: flaggedTx > 0 ? 'danger' : 'neutral' },
          { label: '30-day volume', value: formatNaira(txVolume), hint: `${txCount.toLocaleString()} completed transactions` },
        ].map((tile, i) => (
          <div key={tile.label} className="animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
            <StatTile label={tile.label} value={tile.value} hint={tile.hint} tone={tile.tone as any} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Transaction Volume — Last 30 Days" />
          <div className="h-64 p-5 pt-2">
            {trend.length === 0 ? (
              <p className="pt-16 text-center text-sm text-slate-400 dark:text-slate-500">No transaction data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A445" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#D4A445" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.ceil(trend.length / 6)}
                  />
                  <YAxis tickFormatter={formatCompactNaira} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip
                    formatter={(value: number) => [formatNaira(value), 'Volume']}
                    labelFormatter={(d) => new Date(d).toLocaleDateString()}
                    contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#D4A445" strokeWidth={2} fill="url(#volumeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Spend by Category (30d)" />
          <div className="p-5">
            {categories.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">No category data yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categories} dataKey="volume" nameKey="category" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {categories.map((c, i) => (
                        <Cell key={c.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatNaira(value)} contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {categories.slice(0, 5).map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 capitalize text-slate-600 dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        {c.category}
                      </span>
                      <span className="tabular text-slate-400 dark:text-slate-500">{formatCompactNaira(c.volume)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
>>>>>>> cc343e15 (Upgrade to v8 commit)
      </div>

      <Card>
        <CardHeader title="Where to look first" />
<<<<<<< HEAD
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-800">{pendingKyc}</span> KYC submission
            {pendingKyc === 1 ? '' : 's'} waiting in the queue.
          </p>
          <p>
            <span className="font-medium text-slate-800">{flaggedTx}</span> transaction
            {flaggedTx === 1 ? '' : 's'} currently flagged for review.
          </p>
          <p>
            <span className="font-medium text-slate-800">{openDisputes}</span> dispute
=======
        <div className="grid grid-cols-1 gap-4 p-5 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-100">{pendingKyc}</span> KYC submission
            {pendingKyc === 1 ? '' : 's'} waiting in the queue.
          </p>
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-100">{flaggedTx}</span> transaction
            {flaggedTx === 1 ? '' : 's'} currently flagged for review.
          </p>
          <p>
            <span className="font-medium text-slate-800 dark:text-slate-100">{openDisputes}</span> dispute
>>>>>>> cc343e15 (Upgrade to v8 commit)
            {openDisputes === 1 ? '' : 's'} open or under review.
          </p>
        </div>
      </Card>
    </div>
  );
}
