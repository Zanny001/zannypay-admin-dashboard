'use client';

import { useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import { Download } from 'lucide-react';
>>>>>>> cc343e15 (Upgrade to v8 commit)
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Badge, ErrorBanner, EmptyState, Input, Button } from '@/components/ui';

interface AuditEntry {
  id: string;
  adminId: string | null;
  actorType: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { name: string; email: string; role: string } | null;
}

export default function AuditLogsPage() {
  const [targetId, setTargetId] = useState('');
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load(id: string) {
    apiFetch(`/admin/audit-logs${id ? `?targetId=${encodeURIComponent(id)}` : ''}`)
      .then(setLogs)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(() => load(''), []);

<<<<<<< HEAD
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Filter by target ID (user, transaction, etc.)" value={targetId} onChange={(e) => setTargetId(e.target.value)} className="max-w-md" />
        <Button onClick={() => load(targetId)}>Filter</Button>
        {targetId && <Button variant="ghost" onClick={() => { setTargetId(''); load(''); }}>Clear</Button>}
=======
  const exportUrl = `/api/proxy/admin/audit-logs/export${targetId ? `?targetId=${encodeURIComponent(targetId)}` : ''}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Filter by target ID (user, transaction, etc.)" value={targetId} onChange={(e) => setTargetId(e.target.value)} className="max-w-md" />
        <Button onClick={() => load(targetId)}>Filter</Button>
        {targetId && <Button variant="ghost" onClick={() => { setTargetId(''); load(''); }}>Clear</Button>}
        <a href={exportUrl} target="_blank" rel="noreferrer" className="ml-auto">
          <Button variant="secondary">
            <Download size={14} /> Export CSV
          </Button>
        </a>
>>>>>>> cc343e15 (Upgrade to v8 commit)
      </div>

      {error && <ErrorBanner message={error} />}

      <Card>
        {logs.length === 0 ? (
          <EmptyState message="No audit log entries found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
<<<<<<< HEAD
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
=======
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
>>>>>>> cc343e15 (Upgrade to v8 commit)
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
<<<<<<< HEAD
                <tr key={l.id} className="border-b border-slate-50 last:border-0 align-top hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
=======
                <tr key={l.id} className="border-b border-slate-50 last:border-0 align-top hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                  <td className="px-5 py-3">
                    {l.actorType === 'SYSTEM' ? (
                      <Badge tone="navy">System (fraud engine)</Badge>
                    ) : (
                      <>
<<<<<<< HEAD
                        <p className="font-medium text-slate-800">{l.admin?.name || 'Unknown admin'}</p>
                        <p className="text-xs text-slate-400">{l.admin?.role}</p>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700">{l.action.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <p>{l.targetType}</p>
                    <p className="tabular text-xs text-slate-400">{l.targetId}</p>
                    {l.metadata && Object.keys(l.metadata).length > 0 && (
                      <pre className="tabular mt-1 max-w-xs overflow-x-auto text-xs text-slate-400">{JSON.stringify(l.metadata)}</pre>
                    )}
                  </td>
                  <td className="tabular px-5 py-3 text-slate-500">{l.ipAddress || '—'}</td>
=======
                        <p className="font-medium text-slate-800 dark:text-slate-100">{l.admin?.name || 'Unknown admin'}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{l.admin?.role}</p>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{l.action.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3">
                    <p className="text-slate-700 dark:text-slate-200">{l.targetType}</p>
                    <p className="tabular text-xs text-slate-400 dark:text-slate-500">{l.targetId}</p>
                    {l.metadata && Object.keys(l.metadata).length > 0 && (
                      <pre className="tabular mt-1 max-w-xs overflow-x-auto text-xs text-slate-400 dark:text-slate-500">{JSON.stringify(l.metadata)}</pre>
                    )}
                  </td>
                  <td className="tabular px-5 py-3 text-slate-500 dark:text-slate-400">{l.ipAddress || '—'}</td>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
