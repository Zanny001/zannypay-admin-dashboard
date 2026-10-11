'use client';

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Paperclip, X } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Badge, Button, ErrorBanner, Input } from '@/components/ui';

interface Message {
  id: string;
  senderType: 'CUSTOMER' | 'ADMIN' | 'AUTO';
  body: string | null;
  attachmentData?: string | null;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  status: string;
  user: { name: string; phone: string; email: string; accountNumber: string };
  messages: Message[];
}

// Polls while this specific thread is open — same "only while actively
// viewed" principle as the mobile chat screen on the other end of this
// conversation.
const POLL_INTERVAL_MS = 6000;
const MAX_ATTACHMENT_BYTES = 2_800_000; // matches the backend's SendMessageDto cap

export default function SupportConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [reply, setReply] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    apiFetch(`/admin/support/conversations/${id}`)
      .then(setConversation)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image attachments are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      if (dataUri.length > MAX_ATTACHMENT_BYTES) {
        setError('That image is too large to send — please choose a smaller one.');
        return;
      }
      setError(null);
      setPendingAttachment(dataUri);
    };
    reader.readAsDataURL(file);
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() && !pendingAttachment) return;
    setSending(true);
    setError(null);
    try {
      await apiFetch(`/admin/support/conversations/${id}/reply`, {
        method: 'PATCH',
        body: JSON.stringify({
          body: reply.trim() || undefined,
          attachmentData: pendingAttachment || undefined,
        }),
      });
      setReply('');
      setPendingAttachment(null);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleResolve() {
    try {
      await apiFetch(`/admin/support/conversations/${id}/resolve`, { method: 'PATCH', body: JSON.stringify({}) });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !conversation) return <ErrorBanner message={error} />;
  if (!conversation) return <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
        ← Back to conversations
      </button>

      <Card className="flex items-center justify-between p-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-50">{conversation.user?.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{conversation.user?.phone} · {conversation.user?.accountNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={conversation.status === 'open' ? 'green' : 'slate'}>{conversation.status}</Badge>
          {conversation.status === 'open' && (
            <Button variant="secondary" onClick={handleResolve}>Mark resolved</Button>
          )}
        </div>
      </Card>

      <Card className="flex h-[55vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {conversation.messages.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No messages yet.</p>
          ) : (
            conversation.messages.map((m) =>
              // The automatic first-message acknowledgment renders as a
              // centered, neutral pill — never on the customer's side
              // (didn't say it) or the admin's side (no human sent it) of
              // the conversation, so it can't be mistaken for either.
              m.senderType === 'AUTO' ? (
                <div key={m.id} className="flex justify-center">
                  <p className="max-w-[80%] rounded-full bg-slate-100 px-3.5 py-1.5 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    {m.body}
                  </p>
                </div>
              ) : (
                <div key={m.id} className={`flex ${m.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      m.senderType === 'ADMIN' ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    } ${m.attachmentData ? 'p-1.5' : ''}`}
                  >
                    {m.attachmentData && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.attachmentData}
                        alt="Attachment"
                        className="max-h-48 cursor-pointer rounded-xl"
                        onClick={() => setPreviewSrc(m.attachmentData!)}
                      />
                    )}
                    {!!m.body && <p className={m.attachmentData ? 'mt-2 px-2' : ''}>{m.body}</p>}
                    <p className={`mt-1 text-[10px] ${m.attachmentData ? 'px-2' : ''} ${m.senderType === 'ADMIN' ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ),
            )
          )}
          <div ref={bottomRef} />
        </div>

        {error && <div className="px-5"><ErrorBanner message={error} /></div>}

        {pendingAttachment && (
          <div className="flex items-center gap-3 border-t border-slate-100 px-4 pt-3 dark:border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingAttachment} alt="Pending attachment" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Image ready to send</span>
            <button type="button" onClick={() => setPendingAttachment(null)} className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Remove attachment">
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleReply} className="flex gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button
            type="button"
            variant="secondary"
            disabled={conversation.status === 'resolved'}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={16} />
          </Button>
          <Input
            placeholder={conversation.status === 'resolved' ? 'Conversation resolved' : 'Type a reply…'}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={conversation.status === 'resolved'}
          />
          <Button type="submit" disabled={sending || (!reply.trim() && !pendingAttachment) || conversation.status === 'resolved'}>
            Send
          </Button>
        </form>
      </Card>

      {previewSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-8" onClick={() => setPreviewSrc(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Full size attachment" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
