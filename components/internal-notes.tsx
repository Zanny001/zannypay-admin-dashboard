'use client';

import { useEffect, useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Button, Input } from './ui';

interface Note {
  id: string;
  body: string;
  createdAt: string;
  admin: { id: string; name: string; role: string };
}

// Master audit, Section 6/8: "the admin dashboard has no shared memory
// between admins looking at the same thing — a support agent who called a
// customer about a pending dispute has nowhere to leave 'called them,
// waiting on their bank' for the next shift, other than a Slack message
// that isn't attached to the record at all." Backend: admin-notes module.
export function InternalNotesThread({ targetType, targetId }: { targetType: 'User' | 'Dispute' | 'Transaction' | 'FraudAlert'; targetId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/admin/notes?targetType=${targetType}&targetId=${targetId}`)
      .then((data) => setNotes(data || []))
      .catch((err: ClientApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [targetType, targetId]);

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const note = await apiFetch('/admin/notes', { method: 'POST', body: JSON.stringify({ targetType, targetId, body: draft.trim() }) });
      setNotes((prev) => [...prev, note]);
      setDraft('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">No internal notes yet — leave one for the next admin who looks at this.</p>
      ) : (
        <div className="space-y-2.5">
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
              <p className="text-slate-700 dark:text-slate-200">{n.body}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {n.admin?.name || 'Admin'} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Input
          placeholder="Leave a note for the team…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
        />
        <Button variant="secondary" onClick={handlePost} disabled={posting || !draft.trim()}>
          <MessageSquarePlus size={14} />
        </Button>
      </div>
    </div>
  );
}
