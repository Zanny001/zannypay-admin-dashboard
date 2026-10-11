'use client';

import { useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import { ShieldAlert, Image as ImageIcon } from 'lucide-react';
>>>>>>> cc343e15 (Upgrade to v8 commit)
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Button, ErrorBanner, EmptyState, Input, Badge } from '@/components/ui';
import { formatAge } from '@/lib/format-age';

interface KycSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  bvnLast4: string | null;
  ninLast4: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  createdAt: string;
}

<<<<<<< HEAD
=======
interface KycDocument {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
}

>>>>>>> cc343e15 (Upgrade to v8 commit)
// The backend now only ever sends the last 4 digits (bvnLast4/ninLast4) —
// the full BVN/NIN are encrypted at rest and never leave the server in
// admin responses at all, so there's no masking math to do here anymore,
// just a display prefix.
function maskedId(last4: string | null) {
  return last4 ? `•••••••${last4}` : '—';
}

<<<<<<< HEAD
=======
// Master audit: the only KYC surface before this pass was biodata fields
// (BVN/NIN last-4, next of kin) — no ID photo or selfie anywhere, despite
// a real KYC decision needing to see the document. Documents load lazily
// per-card (not in the queue's initial list fetch) since they're the one
// part of this page with real payload weight.
function DocumentThumbnails({ userId }: { userId: string }) {
  const [docs, setDocs] = useState<KycDocument[] | null>(null);

  useEffect(() => {
    apiFetch(`/kyc-documents/admin/${userId}`)
      .then(setDocs)
      .catch(() => setDocs([]));
  }, [userId]);

  if (docs === null) return <p className="text-xs text-slate-400 dark:text-slate-500">Loading documents…</p>;
  if (docs.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <ImageIcon size={13} /> No ID documents submitted yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {docs.map((d) => (
        <a key={d.id} href={d.fileUrl} target="_blank" rel="noreferrer" className="group relative">
          <img src={d.fileUrl} alt={d.type} className="h-16 w-16 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
          <span className="absolute inset-x-0 bottom-0 truncate rounded-b-lg bg-black/60 px-1 py-0.5 text-center text-[9px] uppercase text-white">
            {d.type.replace('_', ' ')}
          </span>
        </a>
      ))}
    </div>
  );
}

>>>>>>> cc343e15 (Upgrade to v8 commit)
export default function KycQueuePage() {
  const [queue, setQueue] = useState<KycSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [sanctionsWarning, setSanctionsWarning] = useState<string | null>(null);
>>>>>>> cc343e15 (Upgrade to v8 commit)

  function load() {
    apiFetch('/admin/kyc/queue')
      .then(setQueue)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, []);

<<<<<<< HEAD
  async function decide(userId: string, decision: 'approve' | 'reject') {
=======
  async function decide(userId: string, name: string, decision: 'approve' | 'reject') {
>>>>>>> cc343e15 (Upgrade to v8 commit)
    const reason = rejectReasons[userId]?.trim();
    if (decision === 'reject' && !reason) {
      setError('A reason is required to reject a KYC submission.');
      return;
    }
    setBusyId(userId);
    setError(null);
    try {
<<<<<<< HEAD
      await apiFetch(`/admin/kyc/${userId}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason }),
      });
=======
      const res = await apiFetch(`/admin/kyc/${userId}/decide`, {
        method: 'POST',
        body: JSON.stringify({ decision, reason }),
      });
      // Master audit: sanctions/PEP screening now runs at the moment of
      // decision (see AdminService.decideKyc) — surfaced here rather than
      // silently logged, since a match on an approval an officer just
      // made is exactly the kind of thing that shouldn't be easy to miss.
      if (res?.sanctionsScreening?.isMatch) {
        setSanctionsWarning(`${name} matched the sanctions/PEP screening — this was recorded in the audit log regardless of the decision made.`);
      }
>>>>>>> cc343e15 (Upgrade to v8 commit)
      setQueue((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
<<<<<<< HEAD
=======
      {sanctionsWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <p className="flex-1">{sanctionsWarning}</p>
          <button onClick={() => setSanctionsWarning(null)} className="text-red-400 hover:text-red-600" aria-label="Dismiss">×</button>
        </div>
      )}
>>>>>>> cc343e15 (Upgrade to v8 commit)
      {queue.length === 0 ? (
        <Card><EmptyState message="No pending KYC submissions — all caught up." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {queue.map((u) => {
            const age = formatAge(u.createdAt, 24);
            return (
            <Card key={u.id} className="p-5">
              <div className="flex items-center justify-between">
<<<<<<< HEAD
                <h3 className="font-semibold text-slate-900">{u.name}</h3>
=======
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{u.name}</h3>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                <Badge tone={age.isOverdue ? 'red' : 'slate'}>
                  {age.isOverdue ? `Overdue · ${age.label}` : `Submitted ${age.label}`}
                </Badge>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
<<<<<<< HEAD
                <div className="flex justify-between"><dt className="text-slate-400">Phone</dt><dd>{u.phone}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Email</dt><dd>{u.email}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">BVN</dt><dd className="tabular">{maskedId(u.bvnLast4)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">NIN</dt><dd className="tabular">{maskedId(u.ninLast4)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Nationality</dt><dd>{u.nationality || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Next of kin</dt><dd>{u.nextOfKinName || '—'} {u.nextOfKinPhone ? `(${u.nextOfKinPhone})` : ''}</dd></div>
              </dl>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
=======
                <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Phone</dt><dd className="text-slate-700 dark:text-slate-200">{u.phone}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Email</dt><dd className="text-slate-700 dark:text-slate-200">{u.email}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">BVN</dt><dd className="tabular text-slate-700 dark:text-slate-200">{maskedId(u.bvnLast4)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">NIN</dt><dd className="tabular text-slate-700 dark:text-slate-200">{maskedId(u.ninLast4)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Nationality</dt><dd className="text-slate-700 dark:text-slate-200">{u.nationality || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Next of kin</dt><dd className="text-slate-700 dark:text-slate-200">{u.nextOfKinName || '—'} {u.nextOfKinPhone ? `(${u.nextOfKinPhone})` : ''}</dd></div>
              </dl>

              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">ID Documents</p>
                <DocumentThumbnails userId={u.id} />
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
>>>>>>> cc343e15 (Upgrade to v8 commit)
                <Input
                  placeholder="Rejection reason (required if rejecting)"
                  value={rejectReasons[u.id] || ''}
                  onChange={(e) => setRejectReasons((prev) => ({ ...prev, [u.id]: e.target.value }))}
                />
                <div className="flex gap-2">
<<<<<<< HEAD
                  <Button className="flex-1" disabled={busyId === u.id} onClick={() => decide(u.id, 'approve')}>
                    Approve
                  </Button>
                  <Button variant="danger" className="flex-1" disabled={busyId === u.id} onClick={() => decide(u.id, 'reject')}>
=======
                  <Button className="flex-1" disabled={busyId === u.id} onClick={() => decide(u.id, u.name, 'approve')}>
                    Approve
                  </Button>
                  <Button variant="danger" className="flex-1" disabled={busyId === u.id} onClick={() => decide(u.id, u.name, 'reject')}>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
