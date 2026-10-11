'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, PlayCircle, DatabaseZap } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, Button, Badge, ErrorBanner, EmptyState } from '@/components/ui';

interface Discrepancy {
  userId: string;
  kind: 'wallet' | 'savings';
  cachedValue: number;
  ledgerValue: number;
  difference: number;
}

interface ReconciliationRun {
  id: string;
  runAt: string;
  accountsChecked: number;
  discrepanciesFound: number;
  details: Discrepancy[];
}

function money(v: number) {
  return `₦${Number(v).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Master audit / continuation request: "a periodic reconciliation job
// that alerts on any mismatch" needs somewhere a human actually sees the
// result — an API endpoint nobody looks at isn't really monitoring.
export default function LedgerPage() {
  const [runs, setRuns] = useState<ReconciliationRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ seeded: number; skipped: number } | null>(null);

  function load() {
    setLoading(true);
    apiFetch('/admin/ledger/reconciliation-runs')
      .then(setRuns)
      .catch((err: ClientApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function runReconciliation() {
    setReconciling(true);
    setError(null);
    try {
      await apiFetch('/admin/ledger/reconcile', { method: 'POST' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReconciling(false);
    }
  }

  async function seedOpeningBalances() {
    setSeeding(true);
    setError(null);
    try {
      const res = await apiFetch('/admin/ledger/seed-opening-balances', { method: 'POST' });
      setSeedResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeeding(false);
    }
  }

  const latestRun = runs[0];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ZannyPay&rsquo;s wallet balances are backed by an independent double-entry ledger — every money movement posts a
          balanced journal alongside the cached balance every screen reads, so the two can be checked against each
          other. This page shows that check&rsquo;s results; it never corrects a discrepancy automatically.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={runReconciliation} disabled={reconciling}>
            <PlayCircle size={14} /> {reconciling ? 'Running…' : 'Run Reconciliation Now'}
          </Button>
          <Button variant="secondary" onClick={seedOpeningBalances} disabled={seeding}>
            <DatabaseZap size={14} /> {seeding ? 'Seeding…' : 'Seed Opening Balances'}
          </Button>
        </div>
        {seedResult && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Seeded {seedResult.seeded} wallet{seedResult.seeded === 1 ? '' : 's'}, skipped {seedResult.skipped} (already
            seeded or zero balance).
          </p>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {latestRun && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            latestRun.discrepanciesFound === 0
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
              : 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
          }`}
        >
          {latestRun.discrepanciesFound === 0 ? (
            <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert size={20} className="text-red-600 dark:text-red-400" />
          )}
          <div>
            <p className={`text-sm font-medium ${latestRun.discrepanciesFound === 0 ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
              {latestRun.discrepanciesFound === 0
                ? `All clear — ${latestRun.accountsChecked} accounts checked, 0 discrepancies.`
                : `${latestRun.discrepanciesFound} discrepanc${latestRun.discrepanciesFound === 1 ? 'y' : 'ies'} found out of ${latestRun.accountsChecked} accounts checked.`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Last run: {new Date(latestRun.runAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Reconciliation History" />
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <EmptyState message="No reconciliation runs yet — click 'Run Reconciliation Now' above." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-3 font-medium">Run</th>
                <th className="px-5 py-3 font-medium">Accounts Checked</th>
                <th className="px-5 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-slate-50 align-top last:border-0 dark:border-slate-800/60">
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(run.runAt).toLocaleString()}</td>
                  <td className="tabular px-5 py-3 text-slate-700 dark:text-slate-200">{run.accountsChecked}</td>
                  <td className="px-5 py-3">
                    {run.discrepanciesFound === 0 ? (
                      <Badge tone="green">Clean</Badge>
                    ) : (
                      <div className="space-y-1.5">
                        <Badge tone="red">{run.discrepanciesFound} discrepanc{run.discrepanciesFound === 1 ? 'y' : 'ies'}</Badge>
                        {(run.details || []).map((d, i) => (
                          <p key={i} className="tabular text-xs text-slate-500 dark:text-slate-400">
                            {d.kind} · user {d.userId.slice(0, 8)}… · cached {money(d.cachedValue)} vs ledger {money(d.ledgerValue)} (diff {money(d.difference)})
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
