'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button, Input } from './ui';
import { useAdmin } from './admin-context';

// Backend counterpart: admin-auth/step-up.guard.ts. Master audit, Section
// 8: "a session token, once stolen, is then sufficient on its own to move
// money or lock a customer out... nothing re-checks who's actually at the
// keyboard right before the irreversible step." StepUpGuard now requires
// a fresh TOTP/recovery code (or password, for an admin without 2FA
// enabled) in the request body for reversing a transaction, freezing an
// account, and deactivating another admin — this modal is what actually
// collects that, and is a hard requirement for those three flows now to
// work at all, not an optional polish item.
export function StepUpModal({
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: (stepUpFields: { stepUpCode?: string; stepUpPassword?: string }) => Promise<void> | void;
  onCancel: () => void;
}) {
  const admin = useAdmin();
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usesTotp = !!admin.twoFactorEnabled;

  async function handleConfirm() {
    if (!value.trim()) {
      setError(usesTotp ? 'Enter your 6-digit authenticator code.' : 'Enter your password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(usesTotp ? { stepUpCode: value.trim() } : { stepUpPassword: value });
    } catch (err: any) {
      setError(err?.message || 'Could not verify — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${danger ? 'bg-red-50 dark:bg-red-500/10' : 'bg-brand-navy/10 dark:bg-brand-gold/10'}`}>
          <ShieldCheck size={22} className={danger ? 'text-red-600 dark:text-red-400' : 'text-brand-navy dark:text-brand-gold'} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
            {usesTotp ? 'Authenticator code' : 'Your password'}
          </label>
          <Input
            autoFocus
            type={usesTotp ? 'text' : 'password'}
            inputMode={usesTotp ? 'numeric' : undefined}
            placeholder={usesTotp ? '123456' : 'Enter your password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
          {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Verifying…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
