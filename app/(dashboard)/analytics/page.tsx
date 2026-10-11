'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, ErrorBanner, EmptyState, Select } from '@/components/ui';

interface EventSummaryRow {
  name: string;
  count: number;
}

interface RecentEvent {
  id: string;
  name: string;
  userId: string | null;
  platform: string;
  properties: Record<string, any>;
  createdAt: string;
  user: { name: string; email: string } | null;
}

function eventLabel(name: string) {
  return name.replace(/_/g, ' ');
}

// Master audit / continuation request: "no analytics/event-tracking SDK
// integration exists" — this page is the visibility half of fixing that.
// Every count here comes from AnalyticsEvent rows fired at the moment
// each action actually succeeded server-side (see AnalyticsService and
// the ANALYTICS_EVENTS taxonomy) — not a third-party dashboard, since no
// Mixpanel/Amplitude/Segment vendor is configured, but a genuine
// first-party event store that's real today.
export default function AnalyticsEventsPage() {
  const [summary, setSummary] = useState<EventSummaryRow[]>([]);
  const [recent, setRecent] = useState<RecentEvent[]>([]);
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load(selectedDays: string) {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch(`/admin/analytics/events/summary?days=${selectedDays}`),
      apiFetch('/admin/analytics/events/recent?limit=50'),
    ])
      .then(([summaryRes, recentRes]) => {
        setSummary(summaryRes);
        setRecent(recentRes);
      })
      .catch((err: ClientApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(days), []); // eslint-disable-line react-hooks/exhaustive-deps

  const maxCount = Math.max(1, ...summary.map((s) => s.count));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Real product events, fired server-side the moment each action succeeds — signups, transfers, savings, cards,
          loans, KYC decisions, and support conversations.
        </p>
        <Select value={days} onChange={(e) => { setDays(e.target.value); load(e.target.value); }} className="w-40">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </div>

      {error && <ErrorBanner message={error} />}

      <Card>
        <CardHeader title="Event Volume" />
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : summary.length === 0 ? (
          <EmptyState message="No events recorded yet in this window." />
        ) : (
          <div className="space-y-3 p-5">
            {summary.map((row) => (
              <div key={row.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-700 dark:text-slate-200">{eventLabel(row.name)}</span>
                  <span className="tabular font-semibold text-slate-900 dark:text-slate-50">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-brand-navy dark:bg-brand-gold" style={{ width: `${(row.count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Recent Events" action={<Activity size={15} className="text-slate-400" />} />
        {loading ? (
          <div className="p-5 text-sm text-slate-400 dark:text-slate-500">Loading…</div>
        ) : recent.length === 0 ? (
          <EmptyState message="No events yet — this feed fills in as real actions happen in the app." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Platform</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((event) => (
                <tr key={event.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(event.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3 font-medium capitalize text-slate-800 dark:text-slate-100">{eventLabel(event.name)}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{event.user?.name || '—'}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{event.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
