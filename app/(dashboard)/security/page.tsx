'use client';

import { useEffect, useState } from 'react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, Button, Input, Badge, ErrorBanner, EmptyState } from '@/components/ui';
import { useAdmin } from '@/components/admin-context';

export default function SecurityPage() {
  const admin = useAdmin();
  return (
    <div className="space-y-6">
      <TwoFactorSection />
      <SessionsSection />
      {admin.role === 'SUPER_ADMIN' && <IpAllowlistSection />}
    </div>
  );
}

// ==========================================
// 2FA
// ==========================================
function TwoFactorSection() {
  const [step, setStep] = useState<'idle' | 'setup' | 'confirm'>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [password, setPassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function beginSetup() {
    setError(null);
    setBusy(true);
    try {
      const data = await apiFetch('/admin-auth/2fa/setup', { method: 'POST' });
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setSecret(data.secret);
      setStep('confirm');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmEnable() {
    setError(null);
    setBusy(true);
    try {
      const data = await apiFetch('/admin-auth/2fa/enable', { method: 'POST', body: JSON.stringify({ code }) });
      setRecoveryCodes(data.recoveryCodes);
      setStep('idle');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setError(null);
    setBusy(true);
    try {
      await apiFetch('/admin-auth/2fa/disable', { method: 'POST', body: JSON.stringify({ password, code: disableCode }) });
      setShowDisable(false);
      setPassword('');
      setDisableCode('');
      setRecoveryCodes(null);
      window.location.reload(); // simplest way to refresh 2FA-enabled state cleanly
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Two-factor authentication" />
      <div className="p-5 space-y-4">
        {error && <ErrorBanner message={error} />}

        {recoveryCodes ? (
          <div className="space-y-3">
<<<<<<< HEAD
            <p className="text-sm font-medium text-emerald-700">
              Two-factor authentication is now enabled. Save these recovery codes somewhere safe — each one works once, and they are shown only this one time.
            </p>
            <div className="tabular grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
=======
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Two-factor authentication is now enabled. Save these recovery codes somewhere safe — each one works once, and they are shown only this one time.
            </p>
            <div className="tabular grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3 dark:bg-slate-800/50">
>>>>>>> cc343e15 (Upgrade to v8 commit)
              {recoveryCodes.map((c) => <span key={c}>{c}</span>)}
            </div>
            <Button variant="secondary" onClick={() => setRecoveryCodes(null)}>Done</Button>
          </div>
        ) : step === 'idle' ? (
          <div className="flex items-center justify-between">
<<<<<<< HEAD
            <p className="text-sm text-slate-600">
=======
            <p className="text-sm text-slate-600 dark:text-slate-300">
>>>>>>> cc343e15 (Upgrade to v8 commit)
              Protect your account with an authenticator app (Google Authenticator, Authy, 1Password, etc.).
            </p>
            <div className="flex gap-2">
              <Button onClick={beginSetup} disabled={busy}>Set up 2FA</Button>
              <Button variant="danger" onClick={() => setShowDisable((s) => !s)}>Disable 2FA</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
<<<<<<< HEAD
            <p className="text-sm text-slate-600">Scan this QR code in your authenticator app, then enter the 6-digit code it shows.</p>
            {qrCodeDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeDataUrl} alt="2FA QR code" className="h-40 w-40 rounded-lg border border-slate-200" />
            )}
            {secret && <p className="tabular text-xs text-slate-400">Manual entry key: {secret}</p>}
=======
            <p className="text-sm text-slate-600 dark:text-slate-300">Scan this QR code in your authenticator app, then enter the 6-digit code it shows.</p>
            {qrCodeDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCodeDataUrl} alt="2FA QR code" className="h-40 w-40 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700" />
            )}
            {secret && <p className="tabular text-xs text-slate-400 dark:text-slate-500">Manual entry key: {secret}</p>}
>>>>>>> cc343e15 (Upgrade to v8 commit)
            <div className="flex max-w-xs gap-2">
              <Input placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
              <Button onClick={confirmEnable} disabled={busy}>Confirm</Button>
            </div>
          </div>
        )}

        {showDisable && step === 'idle' && !recoveryCodes && (
<<<<<<< HEAD
          <div className="max-w-sm space-y-2 border-t border-slate-100 pt-4">
=======
          <div className="max-w-sm space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
>>>>>>> cc343e15 (Upgrade to v8 commit)
            <Input type="password" placeholder="Current password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input placeholder="Authenticator code or recovery code" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} />
            <Button variant="danger" onClick={disable} disabled={busy}>Confirm disable</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// Sessions
// ==========================================
interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

function SessionsSection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    apiFetch('/admin-auth/sessions')
      .then(setSessions)
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, []);

  async function revoke(id: string) {
    setBusyId(id);
    try {
      await apiFetch(`/admin-auth/sessions/${id}`, { method: 'DELETE' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader title="Active sessions" />
      <div className="p-5">
        {error && <ErrorBanner message={error} />}
        {sessions.length === 0 ? (
          <EmptyState message="No other active sessions." />
        ) : (
<<<<<<< HEAD
          <div className="divide-y divide-slate-50">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-slate-700">{s.ipAddress || 'Unknown IP'}</p>
                  <p className="text-xs text-slate-400">{s.userAgent || 'Unknown device'} · since {new Date(s.createdAt).toLocaleString()}</p>
=======
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-slate-700 dark:text-slate-200">{s.ipAddress || 'Unknown IP'}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{s.userAgent || 'Unknown device'} · since {new Date(s.createdAt).toLocaleString()}</p>
>>>>>>> cc343e15 (Upgrade to v8 commit)
                </div>
                <Button variant="secondary" disabled={busyId === s.id} onClick={() => revoke(s.id)} className="text-xs">
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ==========================================
// IP allowlist (SUPER_ADMIN only)
// ==========================================
function IpAllowlistSection() {
  const [enforced, setEnforced] = useState(false);
  const [dbEntries, setDbEntries] = useState<{ id: string; cidr: string; label: string | null }[]>([]);
  const [envEntries, setEnvEntries] = useState<string[]>([]);
  const [cidr, setCidr] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch('/admin/security/ip-allowlist')
      .then((data) => {
        setEnforced(data.enforced);
        setDbEntries(data.dbEntries);
        setEnvEntries(data.envEntries);
      })
      .catch((err: ClientApiError) => setError(err.message));
  }

  useEffect(load, []);

  async function addEntry() {
    if (!cidr.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch('/admin/security/ip-allowlist', { method: 'POST', body: JSON.stringify({ cidr, label }) });
      setCidr('');
      setLabel('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/admin/security/ip-allowlist/${id}`, { method: 'DELETE' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Admin IP allowlist"
        action={enforced ? <Badge tone="green">Enforced</Badge> : <Badge tone="amber">Not enforced</Badge>}
      />
      <div className="p-5 space-y-4">
        {!enforced && (
<<<<<<< HEAD
          <p className="text-xs text-slate-400">
=======
          <p className="text-xs text-slate-400 dark:text-slate-500">
>>>>>>> cc343e15 (Upgrade to v8 commit)
            Set ADMIN_IP_ALLOWLIST_ENFORCE=true on the backend to start enforcing this list. Keep at least one trusted
            range here before doing so — enforcing with an empty list blocks everyone, including you.
          </p>
        )}
        {error && <ErrorBanner message={error} />}

        {envEntries.length > 0 && (
          <div>
<<<<<<< HEAD
            <p className="mb-1 text-xs font-medium text-slate-400">From ADMIN_IP_ALLOWLIST (env — edit via redeploy)</p>
=======
            <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">From ADMIN_IP_ALLOWLIST (env — edit via redeploy)</p>
>>>>>>> cc343e15 (Upgrade to v8 commit)
            <div className="flex flex-wrap gap-2">
              {envEntries.map((e) => <Badge key={e} tone="slate">{e}</Badge>)}
            </div>
          </div>
        )}

        <div>
<<<<<<< HEAD
          <p className="mb-1 text-xs font-medium text-slate-400">Managed entries</p>
          {dbEntries.length === 0 ? (
            <EmptyState message="No managed entries yet." />
          ) : (
            <div className="divide-y divide-slate-50">
              {dbEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="tabular">{e.cidr} {e.label && <span className="text-slate-400">— {e.label}</span>}</span>
                  <Button variant="ghost" disabled={busy} onClick={() => removeEntry(e.id)} className="text-xs text-red-600">
=======
          <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">Managed entries</p>
          {dbEntries.length === 0 ? (
            <EmptyState message="No managed entries yet." />
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {dbEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="tabular text-slate-700 dark:text-slate-200">{e.cidr} {e.label && <span className="text-slate-400 dark:text-slate-500">— {e.label}</span>}</span>
                  <Button variant="ghost" disabled={busy} onClick={() => removeEntry(e.id)} className="text-xs text-red-600 dark:text-red-400">
>>>>>>> cc343e15 (Upgrade to v8 commit)
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

<<<<<<< HEAD
        <div className="flex gap-2 border-t border-slate-100 pt-4">
=======
        <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
>>>>>>> cc343e15 (Upgrade to v8 commit)
          <Input placeholder="203.0.113.10/32" value={cidr} onChange={(e) => setCidr(e.target.value)} className="max-w-[200px]" />
          <Input placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} className="max-w-[200px]" />
          <Button onClick={addEntry} disabled={busy}>Add</Button>
        </div>
      </div>
    </Card>
  );
}
