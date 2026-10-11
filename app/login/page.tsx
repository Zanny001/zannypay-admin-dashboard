'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Button, ErrorBanner, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      // Safely parse JSON to prevent crashes if the server body is empty
      let data: any = {};
      const text = await res.text();
      if (text) {
        try { data = JSON.parse(text); } catch (e) {}
      }

      if (!res.ok) throw new Error(data.message || 'Login failed.');

      if (data.twoFactorRequired) {
        setMfaToken(data.mfaToken);
      } else {
        // Force a hard browser redirect to guarantee cookies are registered
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, code }),
      });
      
      let data: any = {};
      const text = await res.text();
      if (text) {
        try { data = JSON.parse(text); } catch (e) {}
      }

      if (!res.ok) throw new Error(data.message || 'Verification failed.');

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-brand-navy to-brand-navyDeep px-4">
      {/* Ambient radial glow — previously this was a flat solid navy
          background with zero depth or motion, indistinguishable from a
          wireframe. A subtle, slow-drifting gold glow behind the card is a
          small touch that makes the very first screen an admin sees feel
          considered rather than default. */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-gold/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-brand-gold/10 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="relative w-full max-w-sm animate-fadeIn">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-goldLight to-brand-gold text-lg font-bold text-brand-navyDeep shadow-glowGold">
            Z
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">ZannyPay Admin Console</h1>
          <p className="mt-1 text-xs text-white/40">Internal use only — access is logged and IP-restricted</p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10">
          {!mfaToken ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
                <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <ErrorBanner message={error} />}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck size={18} className="text-brand-navy" />
                Enter the 6-digit code from your authenticator app
              </div>
              <div>
                <Input
                  inputMode="numeric"
                  autoFocus
                  required
                  placeholder="123456 or a recovery code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              {error && <ErrorBanner message={error} />}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Verifying…' : 'Verify'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMfaToken(null);
                  setCode('');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
              >
                Back to password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
