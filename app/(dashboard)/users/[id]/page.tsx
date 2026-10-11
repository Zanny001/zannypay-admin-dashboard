'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User as UserIcon, FileDown } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, Badge, StatusBadge, Button, ErrorBanner, EmptyState, Input } from '@/components/ui';
import { useAdmin } from '@/components/admin-context';
import { StepUpModal } from '@/components/step-up-modal';
import { InternalNotesThread } from '@/components/internal-notes';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  kycTier: number;
  kycStatus: string;
  isFrozen: boolean;
  dateOfBirth: string | null;
  nationality: string | null;
  occupation: string | null;
  profileImage?: string | null;
  wallet: { balance: string | number } | null;
  savingsGoals: { id: string; name: string; target: string | number; saved: string | number }[];
  loans: { id: string; principal: string | number; totalOwed: string | number; amountRepaid: string | number; repaid: boolean; dueDate: string }[];
  cards: { id: string; cardNumber: string | null; last4: string | null; network: string; type: string; isFrozen: boolean; isDefault: boolean; isLinkedExternal: boolean }[];
  disputes: { id: string; reason: string; status: string; createdAt: string }[];
  transactions: { id: string; type: string; category: string; title: string; amount: string | number; status: string; flagged: boolean; createdAt: string; reference: string }[];
}

function money(v: string | number) {
  return `₦${Number(v).toLocaleString()}`;
}

const TABS = ['Overview', 'Loans', 'Disputes', 'Transactions'] as const;
type Tab = (typeof TABS)[number];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const admin = useAdmin();
  const canFreeze = admin.role === 'SUPER_ADMIN' || admin.role === 'COMPLIANCE_OFFICER';

  const [user, setUser] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingFreeze, setPendingFreeze] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');

  function load() {
    apiFetch(`/admin/users/${id}`)
      .then(setUser)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, [id]);

  function requestToggleFreeze() {
    if (!user) return;
    if (!user.isFrozen && !reason.trim()) {
      setError('A reason is required to freeze this account.');
      return;
    }
    setError(null);
    setPendingFreeze(true);
  }

  async function confirmToggleFreeze(stepUp: { stepUpCode?: string; stepUpPassword?: string }) {
    if (!user) return;
    setSubmitting(true);
    try {
      await apiFetch(`/admin/users/${id}/freeze`, {
        method: 'PATCH',
        body: JSON.stringify({ isFrozen: !user.isFrozen, reason: reason || 'Reactivated by admin', ...stepUp }),
      });
      setReason('');
      setPendingFreeze(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !user) return <ErrorBanner message={error} />;
  if (!user) return <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
        <ArrowLeft size={15} /> Back to users
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold">
                <UserIcon size={20} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{user.name}</h2>
              </div>
              {user.isFrozen ? <Badge tone="red">Frozen</Badge> : <Badge tone="green">Active</Badge>}
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Email</dt><dd className="text-slate-700 dark:text-slate-200">{user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Phone</dt><dd className="text-slate-700 dark:text-slate-200">{user.phone}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Account No.</dt><dd className="tabular text-slate-700 dark:text-slate-200">{user.accountNumber}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">KYC</dt><dd className="text-slate-700 dark:text-slate-200">Tier {user.kycTier} · {user.kycStatus}</dd></div>
            {canFreeze && (
              <div className="pt-1">
                <a
                  href={`/api/proxy/admin/compliance-export/users/${user.id}/kyc-record.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-navy hover:underline dark:text-brand-gold"
                >
                  <FileDown size={13} /> Download KYC decision record (PDF)
                </a>
              </div>
            )}
            <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Nationality</dt><dd className="text-slate-700 dark:text-slate-200">{user.nationality || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400 dark:text-slate-500">Occupation</dt><dd className="text-slate-700 dark:text-slate-200">{user.occupation || '—'}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-medium dark:border-slate-800">
              <dt className="text-slate-500 dark:text-slate-400">Wallet balance</dt>
              <dd className="tabular text-slate-900 dark:text-slate-50">{money(user.wallet?.balance || 0)}</dd>
            </div>
          </dl>

          {canFreeze && (
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {!user.isFrozen && (
                <Input placeholder="Reason for freezing (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
              )}
              {error && <ErrorBanner message={error} />}
              <Button variant={user.isFrozen ? 'secondary' : 'danger'} disabled={submitting} onClick={requestToggleFreeze} className="w-full">
                {submitting ? 'Working…' : user.isFrozen ? 'Reactivate account' : 'Freeze account'}
              </Button>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Internal Notes</h4>
            <InternalNotesThread targetType="User" targetId={user.id} />
          </div>
        </Card>

        <div className="lg:col-span-2">
          <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  tab === t ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {tab === 'Overview' && (
              <>
                <Card>
                  <CardHeader title="Savings goals" />
                  {user.savingsGoals.length === 0 ? (
                    <EmptyState message="No savings goals." />
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {user.savingsGoals.map((g) => (
                        <div key={g.id} className="flex justify-between px-5 py-3 text-sm text-slate-700 dark:text-slate-200">
                          <span>{g.name}</span>
                          <span className="tabular">{money(g.saved)} / {money(g.target)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <CardHeader title="Cards" />
                  {user.cards.length === 0 ? (
                    <EmptyState message="No cards issued." />
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {user.cards.map((c) => (
                        <div key={c.id} className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 dark:text-slate-200">
                          <span className="tabular">
                            •••• {c.last4 || '····'} · {c.network} {c.isLinkedExternal ? '(linked)' : ''}
                          </span>
                          <div className="flex gap-1.5">
                            {c.isDefault && <Badge tone="navy">Default</Badge>}
                            {c.isFrozen && <Badge tone="red">Frozen</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}

            {tab === 'Loans' && (
              <Card>
                <CardHeader title="Loans" />
                {user.loans.length === 0 ? (
                  <EmptyState message="No loan history." />
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {user.loans.map((l) => (
                      <div key={l.id} className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 dark:text-slate-200">
                        <span className="tabular">{money(l.principal)} principal · owed {money(l.totalOwed)}</span>
                        <Badge tone={l.repaid ? 'green' : 'amber'}>{l.repaid ? 'Repaid' : 'Active'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {tab === 'Disputes' && (
              <Card>
                <CardHeader title="Disputes" />
                {user.disputes.length === 0 ? (
                  <EmptyState message="No disputes." />
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {user.disputes.map((d) => (
                      <div key={d.id} className="flex items-center justify-between px-5 py-3 text-sm text-slate-700 dark:text-slate-200">
                        <span>{d.reason}</span>
                        <StatusBadge status={d.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {tab === 'Transactions' && (
              <Card>
                <CardHeader title="Recent transactions" />
                {user.transactions.length === 0 ? (
                  <EmptyState message="No transactions yet." />
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {user.transactions.slice(0, 15).map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-5 py-3 text-sm">
                        <div>
                          <p className="text-slate-700 dark:text-slate-200">{t.title} {t.flagged && <Badge tone="red">Flagged</Badge>}</p>
                          <p className="tabular text-xs text-slate-400 dark:text-slate-500">{t.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className={`tabular font-medium ${t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {t.type === 'credit' ? '+' : '-'}{money(t.amount)}
                          </p>
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {pendingFreeze && (
        <StepUpModal
          title={user.isFrozen ? 'Confirm Reactivation' : 'Confirm Account Freeze'}
          description="This directly affects a customer's access to their money — please re-verify it's you."
          confirmLabel={user.isFrozen ? 'Reactivate Account' : 'Freeze Account'}
          danger={!user.isFrozen}
          onCancel={() => setPendingFreeze(false)}
          onConfirm={confirmToggleFreeze}
        />
      )}
    </div>
  );
}
