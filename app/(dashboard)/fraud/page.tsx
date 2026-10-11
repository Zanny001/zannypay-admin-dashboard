'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, Button, Select, SeverityBadge, StatusBadge, ErrorBanner, EmptyState, Input } from '@/components/ui';
import { useAdmin } from '@/components/admin-context';

interface FraudAlert {
  id: string;
  userId: string;
  transactionId: string | null;
  ruleName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: Record<string, any> | null;
  status: string;
  autoFrozeAccount: boolean;
  createdAt: string;
  user: { name: string; accountNumber: string; phone: string };
}

interface FraudRule {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  severity: string;
  config: Record<string, any>;
  autoFreeze: boolean;
}

const SEVERITY_COLORS: Record<string, string> = { LOW: '#64748B', MEDIUM: '#D97706', HIGH: '#EA580C', CRITICAL: '#DC2626' };

export default function FraudPage() {
  const admin = useAdmin();
  const canManageRules = admin.role === 'SUPER_ADMIN';
  const [tab, setTab] = useState<'alerts' | 'rules'>('alerts');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit dark:bg-slate-800/60">
        <button
          onClick={() => setTab('alerts')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === 'alerts' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Alerts
        </button>
        <button
          onClick={() => setTab('rules')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium ${tab === 'rules' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-900 dark:text-slate-50' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Rules{canManageRules ? '' : ' (view only)'}
        </button>
      </div>

      {tab === 'alerts' ? <AlertsTab /> : <RulesTab canManage={canManageRules} />}
    </div>
  );
}

function AlertsTab() {
  const [status, setStatus] = useState('open');
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  function load(s: string) {
    apiFetch(`/admin/fraud/alerts${s ? `?status=${s}` : ''}`)
      .then((data) => {
        setAlerts(data.alerts);
        setTotal(data.total);
      })
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(() => load(status), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function review(id: string, decision: 'confirmed' | 'dismissed', unfreezeIfDismissed: boolean) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/admin/fraud/alerts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ decision, note: notes[id], unfreezeIfDismissed }),
      });
      load(status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const severityCounts = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => ({
    severity: s,
    count: alerts.filter((a) => a.severity === s).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            load(e.target.value);
          }}
        >
          <option value="open">Open</option>
          <option value="confirmed">Confirmed</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </Select>
        <p className="text-xs text-slate-400 dark:text-slate-500">{total} alerts</p>
      </div>

      {alerts.length > 0 && (
        <Card className="p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Severity breakdown (this view)</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={severityCounts} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="severity" width={70} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={4} barSize={16}>
                {severityCounts.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {error && <ErrorBanner message={error} />}

      {alerts.length === 0 ? (
        <Card><EmptyState message="No fraud alerts in this view." /></Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{a.ruleName.replace(/_/g, ' ')}</p>
                    <SeverityBadge severity={a.severity} />
                    <StatusBadge status={a.status} />
                    {a.autoFrozeAccount && <span className="text-xs text-red-600 dark:text-red-400">Account auto-frozen</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {a.user?.name} · {a.user?.accountNumber} · {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {a.details && (
                <pre className="tabular mt-3 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                  {JSON.stringify(a.details, null, 2)}
                </pre>
              )}
              {a.status === 'open' && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Input
                    placeholder="Review note (optional)"
                    value={notes[a.id] || ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    className="max-w-xs"
                  />
                  <Button variant="danger" disabled={busyId === a.id} onClick={() => review(a.id, 'confirmed', false)} className="text-xs">
                    Confirm fraud
                  </Button>
                  <Button variant="secondary" disabled={busyId === a.id} onClick={() => review(a.id, 'dismissed', false)} className="text-xs">
                    Dismiss
                  </Button>
                  {a.autoFrozeAccount && (
                    <Button variant="secondary" disabled={busyId === a.id} onClick={() => review(a.id, 'dismissed', true)} className="text-xs">
                      Dismiss & unfreeze account
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RulesTab({ canManage }: { canManage: boolean }) {
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    apiFetch('/admin/fraud/rules')
      .then(setRules)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, []);

  async function toggleEnabled(rule: FraudRule) {
    setBusyId(rule.id);
    setError(null);
    try {
      await apiFetch(`/admin/fraud/rules/${rule.id}`, { method: 'PATCH', body: JSON.stringify({ isEnabled: !rule.isEnabled }) });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAutoFreeze(rule: FraudRule) {
    setBusyId(rule.id);
    setError(null);
    try {
      await apiFetch(`/admin/fraud/rules/${rule.id}`, { method: 'PATCH', body: JSON.stringify({ autoFreeze: !rule.autoFreeze }) });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function saveConfig(rule: FraudRule) {
    const raw = editing[rule.id];
    if (raw === undefined) return;
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setError(`Config for ${rule.name} is not valid JSON.`);
      return;
    }
    setBusyId(rule.id);
    setError(null);
    try {
      await apiFetch(`/admin/fraud/rules/${rule.id}`, { method: 'PATCH', body: JSON.stringify({ config: parsed }) });
      setEditing((prev) => {
        const next = { ...prev };
        delete next[rule.id];
        return next;
      });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} />}
      {rules.map((r) => (
        <Card key={r.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{r.name.replace(/_/g, ' ')}</p>
                <SeverityBadge severity={r.severity} />
                {!r.isEnabled && <span className="text-xs text-slate-400 dark:text-slate-500">Disabled</span>}
                {r.autoFreeze && <span className="text-xs text-red-600 dark:text-red-400">Auto-freezes account</span>}
              </div>
              {r.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{r.description}</p>}
            </div>
            {canManage && (
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" disabled={busyId === r.id} onClick={() => toggleEnabled(r)} className="text-xs">
                  {r.isEnabled ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="secondary" disabled={busyId === r.id} onClick={() => toggleAutoFreeze(r)} className="text-xs">
                  {r.autoFreeze ? 'Turn off auto-freeze' : 'Turn on auto-freeze'}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">Config (JSON)</p>
            {canManage ? (
              <>
                <textarea
                  className="tabular w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-gold dark:focus:ring-brand-gold"
                  rows={4}
                  value={editing[r.id] ?? JSON.stringify(r.config, null, 2)}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
                <Button className="mt-2 text-xs" disabled={busyId === r.id} onClick={() => saveConfig(r)}>
                  Save config
                </Button>
              </>
            ) : (
              <pre className="tabular overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                {JSON.stringify(r.config, null, 2)}
              </pre>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
