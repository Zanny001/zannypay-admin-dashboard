'use client';

import { useState, type FormEvent } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { useAdmin } from '@/components/admin-context';
import { Button, ErrorBanner } from '@/components/ui';

type ApprovalResult = {
  success?: boolean;
  status?: string;
  message?: string;
};

export function PaystackOtpApprovalModal({
  reference,
  onClose,
  onComplete,
}: {
  reference: string;
  onClose: () => void;
  onComplete: (result: ApprovalResult) => void;
}) {
  const admin = useAdmin();
  const [otp, setOtp] = useState('');
  const [stepUp, setStepUp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{4,8}$/.test(otp)) {
      setError('Enter the 4–8 digit Paystack business approval code.');
      return;
    }
    if (!admin.twoFactorEnabled) {
      setError('Enable admin two-factor authentication before approving Paystack payouts.');
      return;
    }
    if (!stepUp.trim()) {
      setError('Enter your fresh authenticator code or recovery code.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await apiFetch(`/admin/paystack/transfers/${encodeURIComponent(reference)}/finalize`, {
        method: 'POST',
        body: JSON.stringify({
          otp,
          stepUpCode: stepUp.trim(),
        }),
      }) as ApprovalResult;
      setOtp('');
      setStepUp('');
      onComplete(result);
    } catch (err) {
      // Do not retain merchant OTP or admin step-up credentials after any
      // failed or uncertain request. The operator must enter fresh codes.
      setOtp('');
      setStepUp('');
      const message = err instanceof ClientApiError ? err.message : 'Approval could not be confirmed. Check the transfer status before trying again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="paystack-otp-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 id="paystack-otp-title" className="text-base font-semibold text-slate-900 dark:text-slate-50">Approve Paystack bank payout</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">This is a business-owner approval step. Never ask a customer for this code.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Transfer reference</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-800 dark:text-slate-200">{reference}</p>
        </div>

        {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="paystack-business-otp" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Paystack business approval code</label>
            <input
              id="paystack-business-otp"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm tracking-[0.25em] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Enter code"
            />
          </div>

          <div>
            <label htmlFor="paystack-step-up" className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Fresh authenticator code / recovery code</label>
            <input
              id="paystack-step-up"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={stepUp}
              onChange={(event) => setStepUp(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Authenticator or recovery code"
            />
          </div>

          <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">Both codes are sent only for this protected approval request. They are not saved in this dashboard or included in audit records.</p>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" disabled={submitting} onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting || !otp || !stepUp}>
              {submitting ? 'Checking with Paystack…' : 'Submit approval'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
