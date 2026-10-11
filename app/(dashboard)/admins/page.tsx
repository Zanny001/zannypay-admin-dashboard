'use client';

import { useEffect, useState, FormEvent } from 'react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, Button, Input, Select, Badge, ErrorBanner, EmptyState } from '@/components/ui';
import { ROLE_LABELS, type AdminRole } from '@/lib/types';
import { StepUpModal } from '@/components/step-up-modal';

interface AdminRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLES: AdminRole[] = ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_OFFICER', 'SUPPORT_AGENT'];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SUPPORT_AGENT' as AdminRole });
  const [creating, setCreating] = useState(false);

  function load() {
    apiFetch('/admin/admins')
      .then(setAdmins)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', password: '', role: 'SUPPORT_AGENT' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // Master audit, Section 8 — deactivating another admin's access now
  // requires step-up re-authentication on the backend (StepUpGuard); the
  // request body must include stepUpCode/stepUpPassword or the backend
  // rejects it with a 403.
  async function confirmDeactivate(stepUp: { stepUpCode?: string; stepUpPassword?: string }) {
    if (!pendingDeactivateId) return;
    setBusyId(pendingDeactivateId);
    try {
      await apiFetch(`/admin/admins/${pendingDeactivateId}/deactivate`, { method: 'PATCH', body: JSON.stringify(stepUp) });
      setPendingDeactivateId(null);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Add a new admin" />
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div>
            <Input
              type="password"
              placeholder="Temporary password (min 10 chars)"
              required
              minLength={10}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={form.password.length > 0 && form.password.length < 10 ? 'Must be at least 10 characters' : undefined}
            />
          </div>
          <div className="flex gap-2">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })} className="flex-1">
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </Select>
            <Button type="submit" loading={creating}>Add</Button>
          </div>
        </form>
      </Card>

      {error && <ErrorBanner message={error} />}

      <Card>
        {admins.length === 0 ? (
          <EmptyState message="No admins found." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Last login</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{a.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{a.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{ROLE_LABELS[a.role]}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td className="px-5 py-3">
                    {a.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    {a.isActive && (
                      <Button variant="danger" disabled={busyId === a.id} onClick={() => setPendingDeactivateId(a.id)} className="text-xs">
                        Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {pendingDeactivateId && (
        <StepUpModal
          title="Confirm Admin Deactivation"
          description="This immediately revokes another admin's access — please re-verify it's you."
          confirmLabel="Deactivate Admin"
          danger
          onCancel={() => setPendingDeactivateId(null)}
          onConfirm={confirmDeactivate}
        />
      )}
    </div>
  );
}
