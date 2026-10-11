'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Select, Badge, ErrorBanner, EmptyState } from '@/components/ui';
import { formatAge } from '@/lib/format-age';

interface ConversationRow {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  user: { name: string; phone: string; accountNumber: string };
  messages: { body: string | null; attachmentData?: string | null; senderType: string; createdAt: string }[];
}

export default function SupportPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [status, setStatus] = useState('open');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/admin/support/conversations${status ? `?status=${status}` : ''}`)
      .then(setConversations)
      .catch((err: ClientApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="">All</option>
        </Select>
      </div>

      {error && <ErrorBanner message={error} />}

      <Card>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : conversations.length === 0 ? (
          <EmptyState message="No conversations here — the queue is clear." />
        ) : (
<<<<<<< HEAD
          <div className="divide-y divide-slate-50">
            {conversations.map((c) => {
              const latest = c.messages[0];
              const age = formatAge(c.updatedAt, 24);
              const awaitingReply = latest?.senderType === 'CUSTOMER' && c.status === 'open';
              return (
                <Link key={c.id} href={`/support/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{c.user?.name || 'Unknown user'}</p>
                      {awaitingReply && <Badge tone="amber">Awaiting reply</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {latest?.body || (latest?.attachmentData ? '📷 Image' : 'No messages yet')}
=======
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {conversations.map((c) => {
              const latest = c.messages[0];
              // The backend fetches the latest 2 messages specifically so
              // this can skip past an AUTO acknowledgment and preview the
              // customer's actual message instead — c.messages[0] is
              // still used for the "awaiting reply" and timestamp logic
              // below, since that needs the true latest message, not the
              // preview text.
              const previewMessage = c.messages.find((m) => m.senderType !== 'AUTO') || latest;
              const age = formatAge(c.updatedAt, 24);
              // 'AUTO' (the automatic first-message acknowledgment) is
              // NOT a human response — a conversation whose latest
              // message is either CUSTOMER or AUTO still needs a real
              // agent, exactly as if AUTO had never been sent at all.
              const awaitingReply = (latest?.senderType === 'CUSTOMER' || latest?.senderType === 'AUTO') && c.status === 'open';
              return (
                <Link key={c.id} href={`/support/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-slate-50">{c.user?.name || 'Unknown user'}</p>
                      {awaitingReply && <Badge tone="amber">Awaiting reply</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                      {previewMessage?.body || (previewMessage?.attachmentData ? '📷 Image' : 'No messages yet')}
>>>>>>> cc343e15 (Upgrade to v8 commit)
                    </p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <Badge tone={c.status === 'open' ? 'green' : 'slate'}>{c.status}</Badge>
<<<<<<< HEAD
                    <p className="mt-1 text-xs text-slate-400">{age.label}</p>
=======
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{age.label}</p>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
