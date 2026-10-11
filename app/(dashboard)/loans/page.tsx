'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, Select, Badge, ErrorBanner, EmptyState } from '@/components/ui';

interface LoanRow {
  id: string;
  principal: string | number;
  totalOwed: string | number;
  amountRepaid: string | number;
  repaid: boolean;
  dueDate: string;
  issuedAt: string;
  user: { name: string; accountNumber: string; phone: string };
}

export default function LoansPage() {
  const [status, setStatus] = useState('');
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/admin/loans${status ? `?status=${status}` : ''}`)
      .then(setLoans)
      .catch((err: ClientApiError) => setError(err.message));
  }, [status]);

  return (
    <div className="space-y-4">
      <Select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All loans</option>
        <option value="active">Active</option>
        <option value="repaid">Repaid</option>
      </Select>

      {error && <ErrorBanner message={error} />}

      <Card>
        {loans.length === 0 ? (
          <EmptyState message="No loans found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-3 font-medium">Borrower</th>
                <th className="px-5 py-3 font-medium">Principal</th>
                <th className="px-5 py-3 font-medium">Owed</th>
                <th className="px-5 py-3 font-medium">Repaid</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{l.user?.name}</p>
                    <p className="tabular text-xs text-slate-400 dark:text-slate-500">{l.user?.accountNumber}</p>
                  </td>
                  <td className="tabular px-5 py-3 text-slate-700 dark:text-slate-200">₦{Number(l.principal).toLocaleString()}</td>
                  <td className="tabular px-5 py-3 text-slate-700 dark:text-slate-200">₦{Number(l.totalOwed).toLocaleString()}</td>
                  <td className="tabular px-5 py-3 text-slate-700 dark:text-slate-200">₦{Number(l.amountRepaid).toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(l.dueDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Badge tone={l.repaid ? 'green' : 'amber'}>{l.repaid ? 'Repaid' : 'Active'}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
