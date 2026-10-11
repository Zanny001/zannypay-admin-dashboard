'use client';

<<<<<<< HEAD
import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Button, Select, Input, Badge, StatusBadge, ErrorBanner, EmptyState } from '@/components/ui';
import { useAdmin } from '@/components/admin-context';
=======
import { useEffect, useState, FormEvent, useCallback, useMemo } from 'react';
import { Download, Search, X, ArrowUpDown } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Button, Select, Input, Badge, StatusBadge, ErrorBanner, EmptyState } from '@/components/ui';
import { useAdmin } from '@/components/admin-context';
import { StepUpModal } from '@/components/step-up-modal';
import { TransactionDrawer } from '@/components/transaction-drawer';
>>>>>>> cc343e15 (Upgrade to v8 commit)

interface TxnRow {
  id: string;
  type: string;
  category: string;
  title: string;
  amount: string | number;
  status: string;
  flagged: boolean;
  reference: string;
  createdAt: string;
<<<<<<< HEAD
  user: { name: string; accountNumber: string; phone: string };
}

=======
  reversedTransactionId?: string | null;
  user: { name: string; accountNumber: string; phone: string };
}

// Master audit, Section 6 (Transactions): "No search, no date range, no
// pagination (every matching row loads in one shot), no sort, no export,
// no drill-down, no bulk actions, no keyboard shortcuts, no chart." This
// rewrite adds search, a date range, pagination, sort, CSV export (via
// the backend's new /admin/transactions/export), a detail drawer, and
// bulk flagging — all against the same /admin/transactions endpoint,
// which already supported most of these filters server-side; this page
// simply wasn't using them.
const PAGE_SIZE = 20;

>>>>>>> cc343e15 (Upgrade to v8 commit)
export default function TransactionsPage() {
  const admin = useAdmin();
  const canManage = admin.role === 'SUPER_ADMIN' || admin.role === 'FINANCE_OFFICER';
  const canFlag = canManage || admin.role === 'COMPLIANCE_OFFICER';

  const [status, setStatus] = useState('');
  const [flagged, setFlagged] = useState('');
  const [type, setType] = useState('');
<<<<<<< HEAD
  const [txns, setTxns] = useState<TxnRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reversingId, setReversingId] = useState<string | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  function load() {
=======
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const [txns, setTxns] = useState<TxnRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reversingId, setReversingId] = useState<string | null>(null);
  const [reverseReason, setReverseReason] = useState('');
  const [pendingReversal, setPendingReversal] = useState<string | null>(null); // txnId awaiting step-up confirmation
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerTxnId, setDrawerTxnId] = useState<string | null>(null);

  const buildParams = useCallback(() => {
>>>>>>> cc343e15 (Upgrade to v8 commit)
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (flagged) params.set('flagged', flagged);
    if (type) params.set('type', type);
<<<<<<< HEAD
    apiFetch(`/admin/transactions?${params.toString()}`)
      .then((data) => {
        setTxns(data.transactions);
        setTotal(data.total);
      })
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
=======
    return params;
  }, [status, flagged, type]);

  const load = useCallback(() => {
    setLoading(true);
    const params = buildParams();
    apiFetch(`/admin/transactions?${params.toString()}`)
      .then((data) => {
        let rows: TxnRow[] = data.transactions || [];
        // Search, date range, and sort are applied client-side against the
        // already-fetched page — the backend's /admin/transactions search
        // covers status/flagged/type server-side (see AdminService.
        // searchTransactions); a real high-volume deployment should push
        // search/date filtering server-side too once transaction counts
        // outgrow a single fetched batch, but for the scale this admin
        // console operates at today this keeps the page responsive
        // without a network round-trip on every keystroke.
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          rows = rows.filter(
            (t) =>
              t.title?.toLowerCase().includes(q) ||
              t.reference?.toLowerCase().includes(q) ||
              t.user?.name?.toLowerCase().includes(q) ||
              t.user?.accountNumber?.includes(q)
          );
        }
        if (dateFrom) rows = rows.filter((t) => new Date(t.createdAt) >= new Date(dateFrom));
        if (dateTo) rows = rows.filter((t) => new Date(t.createdAt) <= new Date(dateTo + 'T23:59:59'));
        rows = [...rows].sort((a, b) =>
          sortDesc ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)
        );
        setTxns(rows);
        setTotal(rows.length);
        setPage(1);
      })
      .catch((err: ClientApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [buildParams, search, dateFrom, dateTo, sortDesc]);

  useEffect(load, [status, flagged, type]); // eslint-disable-line react-hooks/exhaustive-deps
>>>>>>> cc343e15 (Upgrade to v8 commit)

  function handleFilter(e: FormEvent) {
    e.preventDefault();
    load();
  }

<<<<<<< HEAD
=======
  const pagedTxns = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return txns.slice(start, start + PAGE_SIZE);
  }, [txns, page]);
  const pageCount = Math.max(1, Math.ceil(txns.length / PAGE_SIZE));

>>>>>>> cc343e15 (Upgrade to v8 commit)
  async function toggleFlag(txn: TxnRow) {
    setBusyId(txn.id);
    setError(null);
    try {
      await apiFetch(`/admin/transactions/${txn.id}/flag`, { method: 'PATCH', body: JSON.stringify({ flagged: !txn.flagged }) });
      setTxns((prev) => prev.map((t) => (t.id === txn.id ? { ...t, flagged: !t.flagged } : t)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

<<<<<<< HEAD
  async function submitReversal(txnId: string) {
    if (reverseReason.trim().length < 5) {
      setError('A reversal reason of at least 5 characters is required.');
      return;
    }
    setBusyId(txnId);
    setError(null);
    try {
      await apiFetch(`/admin/transactions/${txnId}/reverse`, { method: 'POST', body: JSON.stringify({ reason: reverseReason }) });
      setReversingId(null);
      setReverseReason('');
      load();
    } catch (err: any) {
      setError(err.message);
=======
  async function bulkFlag(nextFlagged: boolean) {
    setError(null);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await apiFetch(`/admin/transactions/${id}/flag`, { method: 'PATCH', body: JSON.stringify({ flagged: nextFlagged }) });
      } catch (err: any) {
        setError(err.message);
        break;
      }
    }
    setTxns((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, flagged: nextFlagged } : t)));
    setSelectedIds(new Set());
  }

  async function submitReversal(txnId: string, stepUp: { stepUpCode?: string; stepUpPassword?: string }) {
    if (reverseReason.trim().length < 5) {
      throw new Error('A reversal reason of at least 5 characters is required.');
    }
    setBusyId(txnId);
    try {
      await apiFetch(`/admin/transactions/${txnId}/reverse`, {
        method: 'POST',
        body: JSON.stringify({ reason: reverseReason, ...stepUp }),
      });
      setReversingId(null);
      setReverseReason('');
      setPendingReversal(null);
      load();
>>>>>>> cc343e15 (Upgrade to v8 commit)
    } finally {
      setBusyId(null);
    }
  }

<<<<<<< HEAD
  return (
    <div className="space-y-4">
      <form onSubmit={handleFilter} className="flex flex-wrap gap-2">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </Select>
        <Select value={flagged} onChange={(e) => setFlagged(e.target.value)}>
          <option value="">Flagged: any</option>
          <option value="true">Flagged only</option>
          <option value="false">Not flagged</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Any type</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </Select>
        <Button type="submit">Filter</Button>
      </form>

      {error && <ErrorBanner message={error} />}

      <Card>
        {txns.length === 0 ? (
=======
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const exportUrl = `/api/proxy/admin/transactions/export?${buildParams().toString()}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search name, account, reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="w-64 pl-8"
          />
        </div>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-auto" title="From date" />
        <span className="text-xs text-slate-400 dark:text-slate-500">to</span>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-auto" title="To date" />

        <form onSubmit={handleFilter} className="flex flex-wrap gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Any status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </Select>
          <Select value={flagged} onChange={(e) => setFlagged(e.target.value)}>
            <option value="">Flagged: any</option>
            <option value="true">Flagged only</option>
            <option value="false">Not flagged</option>
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any type</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </Select>
          <Button type="submit">Filter</Button>
        </form>

        <Button variant="secondary" onClick={() => setSortDesc((s) => !s)} className="ml-auto">
          <ArrowUpDown size={14} />
          {sortDesc ? 'Newest first' : 'Oldest first'}
        </Button>
        <a href={exportUrl} target="_blank" rel="noreferrer">
          <Button variant="secondary">
            <Download size={14} />
            Export CSV
          </Button>
        </a>
      </div>

      {error && <ErrorBanner message={error} />}

      {selectedIds.size > 0 && canFlag && (
        <div className="flex items-center gap-3 rounded-lg bg-brand-navy/5 px-4 py-2.5 text-sm dark:bg-brand-gold/5">
          <span className="font-medium text-slate-700 dark:text-slate-200">{selectedIds.size} selected</span>
          <Button variant="secondary" className="text-xs" onClick={() => bulkFlag(true)}>Flag all</Button>
          <Button variant="secondary" className="text-xs" onClick={() => bulkFlag(false)}>Unflag all</Button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Clear selection">
            <X size={16} />
          </button>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : pagedTxns.length === 0 ? (
>>>>>>> cc343e15 (Upgrade to v8 commit)
          <EmptyState message="No transactions match these filters." />
        ) : (
          <table className="w-full text-sm">
            <thead>
<<<<<<< HEAD
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
=======
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                {canFlag && <th className="w-10 px-5 py-3" />}
>>>>>>> cc343e15 (Upgrade to v8 commit)
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {txns.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0 align-top hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{t.user?.name || '—'}</p>
                    <p className="tabular text-xs text-slate-400">{t.user?.accountNumber}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p>{t.title} {t.flagged && <Badge tone="red">Flagged</Badge>}</p>
                    <p className="tabular text-xs text-slate-400">{t.reference} · {new Date(t.createdAt).toLocaleString()}</p>
                  </td>
                  <td className={`tabular px-5 py-3 font-medium ${t.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'credit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3">
=======
              {pagedTxns.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer border-b border-slate-50 align-top last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  onClick={() => setDrawerTxnId(t.id)}
                >
                  {canFlag && (
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)} className="rounded" />
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{t.user?.name || '—'}</p>
                    <p className="tabular text-xs text-slate-400 dark:text-slate-500">{t.user?.accountNumber}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-700 dark:text-slate-200">{t.title} {t.flagged && <Badge tone="red">Flagged</Badge>}</p>
                    <p className="tabular text-xs text-slate-400 dark:text-slate-500">{t.reference} · {new Date(t.createdAt).toLocaleString()}</p>
                  </td>
                  <td className={`tabular px-5 py-3 font-medium ${t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {t.type === 'credit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                    <div className="flex flex-col gap-2">
                      {canFlag && (
                        <Button variant="secondary" disabled={busyId === t.id} onClick={() => toggleFlag(t)} className="text-xs">
                          {t.flagged ? 'Unflag' : 'Flag'}
                        </Button>
                      )}
                      {canManage && t.status !== 'reversed' && (
                        reversingId === t.id ? (
                          <div className="w-48 space-y-1.5">
                            <Input placeholder="Reversal reason" value={reverseReason} onChange={(e) => setReverseReason(e.target.value)} />
                            <div className="flex gap-1.5">
<<<<<<< HEAD
                              <Button className="flex-1 text-xs" disabled={busyId === t.id} onClick={() => submitReversal(t.id)}>Confirm</Button>
=======
                              <Button
                                className="flex-1 text-xs"
                                disabled={busyId === t.id}
                                onClick={() => {
                                  if (reverseReason.trim().length < 5) {
                                    setError('A reversal reason of at least 5 characters is required.');
                                    return;
                                  }
                                  setPendingReversal(t.id);
                                }}
                              >
                                Confirm
                              </Button>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                              <Button variant="ghost" className="text-xs" onClick={() => setReversingId(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button variant="danger" className="text-xs" onClick={() => { setReversingId(t.id); setReverseReason(''); }}>
                            Reverse
                          </Button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
<<<<<<< HEAD
      <p className="text-xs text-slate-400">{total} matching transactions.</p>
=======

      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <p>{total} matching transaction{total === 1 ? '' : 's'}{search || dateFrom || dateTo ? ' (filtered)' : ''}.</p>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span>Page {page} of {pageCount}</span>
            <Button variant="ghost" className="text-xs" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>

      {pendingReversal && (
        <StepUpModal
          title="Confirm Transaction Reversal"
          description="This moves money and can't be undone with another click — please re-verify it's you."
          confirmLabel="Reverse Transaction"
          danger
          onCancel={() => setPendingReversal(null)}
          onConfirm={(stepUp) => submitReversal(pendingReversal, stepUp)}
        />
      )}

      {drawerTxnId && <TransactionDrawer txnId={drawerTxnId} onClose={() => setDrawerTxnId(null)} />}
>>>>>>> cc343e15 (Upgrade to v8 commit)
    </div>
  );
}
