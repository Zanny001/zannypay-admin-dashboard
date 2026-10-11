'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
=======
import { User as UserIcon } from 'lucide-react';
>>>>>>> cc343e15 (Upgrade to v8 commit)
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Input, Button, Badge, ErrorBanner, EmptyState } from '@/components/ui';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  kycTier: number;
  kycStatus: string;
  isFrozen: boolean;
  createdAt: string;
<<<<<<< HEAD
=======
  profileImage?: string | null;
>>>>>>> cc343e15 (Upgrade to v8 commit)
  wallet: { balance: string | number } | null;
}

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 25;

  function load(q: string, p: number) {
    setLoading(true);
    setError(null);
    apiFetch(`/admin/users?q=${encodeURIComponent(q)}&page=${p}&pageSize=${pageSize}`)
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setPage(data.page);
      })
      .catch((err: ClientApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load('', 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    load(query, 1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search by name, email, phone, or account number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit">Search</Button>
      </form>

      {error && <ErrorBanner message={error} />}

      <Card>
        {loading ? (
<<<<<<< HEAD
          <EmptyState message="Loading…" />
=======
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
>>>>>>> cc343e15 (Upgrade to v8 commit)
        ) : users.length === 0 ? (
          <EmptyState message="No users match that search." />
        ) : (
          <table className="w-full text-sm">
            <thead>
<<<<<<< HEAD
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
=======
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
>>>>>>> cc343e15 (Upgrade to v8 commit)
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium">KYC</th>
                <th className="px-5 py-3 font-medium">Balance</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
<<<<<<< HEAD
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link href={`/users/${u.id}`} className="font-medium text-brand-navy hover:underline">
                      {u.name}
                    </Link>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="tabular px-5 py-3 text-slate-600">{u.accountNumber}</td>
=======
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <Link href={`/users/${u.id}`} className="flex items-center gap-2.5 group">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                          <UserIcon size={14} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-brand-navy group-hover:underline dark:text-brand-gold">{u.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="tabular px-5 py-3 text-slate-600 dark:text-slate-300">{u.accountNumber}</td>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                  <td className="px-5 py-3">
                    <Badge tone={u.kycStatus === 'approved' ? 'green' : u.kycStatus === 'pending' ? 'amber' : 'red'}>
                      Tier {u.kycTier} · {u.kycStatus}
                    </Badge>
                  </td>
<<<<<<< HEAD
                  <td className="tabular px-5 py-3">₦{Number(u.wallet?.balance || 0).toLocaleString()}</td>
=======
                  <td className="tabular px-5 py-3 text-slate-700 dark:text-slate-200">₦{Number(u.wallet?.balance || 0).toLocaleString()}</td>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                  <td className="px-5 py-3">
                    {u.isFrozen ? <Badge tone="red">Frozen</Badge> : <Badge tone="green">Active</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {total > pageSize && (
<<<<<<< HEAD
        <div className="flex items-center justify-between text-sm text-slate-500">
=======
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
>>>>>>> cc343e15 (Upgrade to v8 commit)
          <span>
            Page {page} of {totalPages} · {total} users
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => load(query, page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" disabled={page >= totalPages} onClick={() => load(query, page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
