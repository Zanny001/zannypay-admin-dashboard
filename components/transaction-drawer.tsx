'use client';

import { useEffect, useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, CornerUpLeft } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { StatusBadge, Badge, ErrorBanner } from './ui';
import { InternalNotesThread } from './internal-notes';

interface TxnDetail {
  transaction: any;
  reversalOf: any | null;
  reversedBy: any | null;
}

// Master audit, Section 6: previously a transaction row's two action
// buttons (Flag/Reverse) WERE the entire investigative surface — no
// detail view, no visibility into a reversal chain, nowhere to leave a
// note for the next admin who looks at the same transaction.
export function TransactionDrawer({ txnId, onClose }: { txnId: string; onClose: () => void }) {
  const [data, setData] = useState<TxnDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/admin/transactions/${txnId}`)
      .then(setData)
      .catch((err: ClientApiError) => setError(err.message));
  }, [txnId]);

  const t = data?.transaction;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Transaction Detail</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {error && <ErrorBanner message={error} />}

          {!t ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {t.type === 'credit' ? (
                      <ArrowDownLeft size={16} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ArrowUpRight size={16} className="text-slate-500 dark:text-slate-400" />
                    )}
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {t.type === 'credit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t.title}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-slate-50 p-4 text-xs dark:bg-slate-800/50">
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Customer</dt>
                  <dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{t.user?.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Account</dt>
                  <dd className="tabular mt-0.5 text-slate-800 dark:text-slate-200">{t.user?.accountNumber}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Reference</dt>
                  <dd className="tabular mt-0.5 text-slate-800 dark:text-slate-200">{t.reference}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Category</dt>
                  <dd className="mt-0.5 capitalize text-slate-800 dark:text-slate-200">{t.category}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Date</dt>
                  <dd className="mt-0.5 text-slate-800 dark:text-slate-200">{new Date(t.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 dark:text-slate-500">Flagged</dt>
                  <dd className="mt-0.5">{t.flagged ? <Badge tone="red">Yes</Badge> : <span className="text-slate-800 dark:text-slate-200">No</span>}</dd>
                </div>
              </dl>

              {(data?.reversalOf || data?.reversedBy) && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="mb-2 flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-400">
                    <CornerUpLeft size={13} /> Reversal Chain
                  </p>
                  {data?.reversalOf && (
                    <p className="text-amber-700 dark:text-amber-300">
                      This is a reversal of <span className="tabular">{data.reversalOf.reference}</span> ({data.reversalOf.title}).
                      {t.reversalReason && <> Reason: {t.reversalReason}</>}
                    </p>
                  )}
                  {data?.reversedBy && (
                    <p className="text-amber-700 dark:text-amber-300">
                      This transaction was reversed by <span className="tabular">{data.reversedBy.reference}</span>.
                      {data.reversedBy.reversalReason && <> Reason: {data.reversedBy.reversalReason}</>}
                    </p>
                  )}
                </div>
              )}

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Internal Notes</h4>
                <InternalNotesThread targetType="Transaction" targetId={t.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
