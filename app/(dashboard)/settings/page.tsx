'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Monitor, Trash2 } from 'lucide-react';
import { apiFetch, ClientApiError } from '@/lib/client-api';
import { Card, CardHeader, Button, Input, ErrorBanner, Badge } from '@/components/ui';
import { useAdmin } from '@/components/admin-context';

// Master audit, Section 6: "An admin's own identity has no representation
// anywhere in this product. There's no photo, no editable name/phone/bio,
// no self-service password change." This page is that surface — backed
// by admin-auth's new /profile, /password, and the pre-existing (but
// previously unreachable from the UI) 2FA and session endpoints.
export default function SettingsPage() {
  const admin = useAdmin();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ProfileSection />
      <PasswordSection />
      <TwoFactorSection enabled={!!admin.twoFactorEnabled} />
      <SessionsSection />
    </div>
  );
}

function ProfileSection() {
  const admin = useAdmin();
  const [name, setName] = useState(admin.name);
  const [phone, setPhone] = useState(admin.phone || '');
  const [bio, setBio] = useState(admin.bio || '');
  const [photoPreview, setPhotoPreview] = useState(admin.photoUrl || '');
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setPhotoPreview(dataUri);
      setPhotoDataUri(dataUri);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch('/admin-auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, bio, ...(photoDataUri && { photo: photoDataUri }) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Profile" />
      <div className="space-y-4 p-5">
        {error && <ErrorBanner message={error} />}
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <img src={photoPreview} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy/10 text-lg font-semibold text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <label className="cursor-pointer rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Not set" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="e.g. Compliance team lead, based in Lagos"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Saved</span>}
        </div>
      </div>
    </Card>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch('/admin-auth/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Password" />
      <div className="space-y-3 p-5">
        {error && <ErrorBanner message={error} />}
        {saved && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Password updated. Your other active sessions have been signed out — this one hasn&rsquo;t.
          </p>
        )}
        <Input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input type="password" placeholder="New password (min 10 characters)" minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <Button onClick={handleSave} disabled={saving || !currentPassword || !newPassword}>
          {saving ? 'Updating…' : 'Update Password'}
        </Button>
      </div>
    </Card>
  );
}

function TwoFactorSection({ enabled: initiallyEnabled }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSetup() {
    setError(null);
    setBusy(true);
    try {
      const res = await apiFetch('/admin-auth/2fa/setup', { method: 'POST' });
      setSetupData(res);
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
      const res = await apiFetch('/admin-auth/2fa/enable', { method: 'POST', body: JSON.stringify({ code }) });
      setRecoveryCodes(res.recoveryCodes);
      setEnabled(true);
      setSetupData(null);
      setCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable() {
    setError(null);
    setBusy(true);
    try {
      await apiFetch('/admin-auth/2fa/disable', { method: 'POST', body: JSON.stringify({ password: disablePassword, code: disableCode }) });
      setEnabled(false);
      setShowDisableForm(false);
      setDisablePassword('');
      setDisableCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Two-Factor Authentication"
        action={enabled ? <Badge tone="green">Enabled</Badge> : <Badge tone="amber">Not enabled</Badge>}
      />
      <div className="space-y-4 p-5">
        {error && <ErrorBanner message={error} />}

        {recoveryCodes && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-400">
              Save these recovery codes — shown only once
            </p>
            <div className="tabular grid grid-cols-2 gap-1.5 text-sm text-amber-900 dark:text-amber-300">
              {recoveryCodes.map((c) => <span key={c}>{c}</span>)}
            </div>
          </div>
        )}

        {!enabled && !setupData && (
          <div className="flex items-center gap-3">
            <ShieldOff size={18} className="text-slate-400" />
            <p className="flex-1 text-sm text-slate-500 dark:text-slate-400">
              Two-factor authentication isn&rsquo;t enabled on your account yet.
            </p>
            <Button onClick={startSetup} disabled={busy}>Set Up 2FA</Button>
          </div>
        )}

        {setupData && (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-50 p-5 dark:bg-slate-800/50">
            <img src={setupData.qrCodeDataUrl} alt="2FA QR code" className="h-40 w-40 rounded-lg bg-white p-2" />
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Scan with your authenticator app, or enter this code manually:
              <br /><span className="tabular font-medium text-slate-700 dark:text-slate-200">{setupData.secret}</span>
            </p>
            <div className="flex w-full max-w-xs gap-2">
              <Input placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
              <Button onClick={confirmEnable} disabled={busy || code.length < 6}>Verify</Button>
            </div>
          </div>
        )}

        {enabled && !showDisableForm && (
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            <p className="flex-1 text-sm text-slate-500 dark:text-slate-400">Two-factor authentication is protecting your account.</p>
            <Button variant="ghost" onClick={() => setShowDisableForm(true)}>Disable</Button>
          </div>
        )}

        {showDisableForm && (
          <div className="space-y-2">
            <Input type="password" placeholder="Current password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
            <Input placeholder="6-digit code or recovery code" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="danger" onClick={confirmDisable} disabled={busy}>Confirm Disable</Button>
              <Button variant="ghost" onClick={() => setShowDisableForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

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
    apiFetch('/admin-auth/sessions').then(setSessions).catch((err: ClientApiError) => setError(err.message));
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
      <CardHeader title="Active Sessions" />
      <div className="p-5">
        {error && <ErrorBanner message={error} />}
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">No other active sessions.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{s.ipAddress || 'Unknown IP'}</p>
                    <p className="max-w-xs truncate text-xs text-slate-400 dark:text-slate-500">
                      {s.userAgent || 'Unknown device'} · since {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" className="text-xs text-red-600 dark:text-red-400" disabled={busyId === s.id} onClick={() => revoke(s.id)}>
                  <Trash2 size={13} /> Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
