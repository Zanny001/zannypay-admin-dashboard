'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Select, StatusBadge, ErrorBanner, EmptyState, Input, Button, Badge } from '@/components/ui';
import { formatAge } from '@/lib/format-age';
import { InternalNotesThread } from '@/components/internal-notes';

interface DisputeRow {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  resolutionNote: string | null;
  createdAt: string;
  user: { name: string; accountNumber: string; phone: string };
}

const STATUSES = ['open', 'under_review', 'resolved', 'rejected'];

export default function DisputesPage() {
  const [status, setStatus] = useState('');
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openNotesId, setOpenNotesId] = useState<string | null>(null);

  function load(s: string) {
    apiFetch(`/admin/disputes${s ? `?status=${s}` : ''}`)
      .then(setDisputes)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(() => load(''), []);

  async function updateStatus(id: string, newStatus: string) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/admin/disputes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, resolutionNote: notes[id] }),
      });
      load(status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <Select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          load(e.target.value);
        }}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
      </Select>

      {error && <ErrorBanner message={error} />}

      {disputes.length === 0 ? (
        <Card><EmptyState message="No disputes found." /></Card>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => {
            const age = formatAge(d.createdAt, 48);
            const stillOpen = d.status === 'open' || d.status === 'under_review';
            const notesOpen = openNotesId === d.id;
            return (
            <Card key={d.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{d.reason}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{d.user?.name} · {d.user?.accountNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  {stillOpen && age.isOverdue && <Badge tone="red">Overdue · {age.label}</Badge>}
                  {stillOpen && !age.isOverdue && <Badge tone="slate">{age.label}</Badge>}
                  <StatusBadge status={d.status} />
                </div>
              </div>
              {d.details && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{d.details}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Input
                  placeholder="Resolution note"
                  value={notes[d.id] ?? d.resolutionNote ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  className="max-w-xs"
                />
                {STATUSES.filter((s) => s !== d.status).map((s) => (
                  <Button key={s} variant="secondary" disabled={busyId === d.id} onClick={() => updateStatus(d.id, s)} className="text-xs">
                    Mark {s.replace('_', ' ')}
                  </Button>
                ))}
                <Button variant="ghost" className="ml-auto text-xs" onClick={() => setOpenNotesId(notesOpen ? null : d.id)}>
                  <MessageSquare size={13} /> {notesOpen ? 'Hide notes' : 'Internal notes'}
                </Button>
              </div>
              {notesOpen && (
                <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <InternalNotesThread targetType="Dispute" targetId={d.id} />
                </div>
              )}
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
