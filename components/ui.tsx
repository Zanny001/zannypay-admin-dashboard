import { ReactNode } from 'react';
<<<<<<< HEAD

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
=======
import { Loader2 } from 'lucide-react';

// Master audit, Section 6: no dark mode existed anywhere. Every primitive
// below now carries a dark: variant — since every page in this app is
// built from these (Card, Badge, Button, StatTile, etc.), making the
// primitives dark-aware gives every page real dark-mode coverage without
// having to hand-edit each page's one-off className strings individually.
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${className}`}>
      {children}
    </div>
  );
>>>>>>> cc343e15 (Upgrade to v8 commit)
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
<<<<<<< HEAD
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
=======
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <h2 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>
>>>>>>> cc343e15 (Upgrade to v8 commit)
      {action}
    </div>
  );
}

const badgeTones: Record<string, string> = {
<<<<<<< HEAD
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  gold: 'bg-brand-gold/10 text-brand-gold ring-1 ring-brand-gold/30',
  navy: 'bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/20',
=======
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
  gold: 'bg-brand-gold/10 text-brand-gold ring-1 ring-brand-gold/30',
  navy: 'bg-brand-navy/10 text-brand-navy ring-1 ring-brand-navy/20 dark:bg-brand-gold/10 dark:text-brand-gold dark:ring-brand-gold/20',
>>>>>>> cc343e15 (Upgrade to v8 commit)
};

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

const severityToneMap: Record<string, keyof typeof badgeTones> = {
  LOW: 'slate',
  MEDIUM: 'amber',
  HIGH: 'gold',
  CRITICAL: 'red',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return <Badge tone={severityToneMap[severity] || 'slate'}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone: keyof typeof badgeTones =
    ['completed', 'approved', 'confirmed', 'active', 'resolved'].includes(normalized)
      ? 'green'
      : ['pending', 'open', 'review'].includes(normalized)
      ? 'amber'
      : ['failed', 'rejected', 'dismissed', 'frozen'].includes(normalized)
      ? 'red'
      : 'slate';
  return <Badge tone={tone}>{status}</Badge>;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
<<<<<<< HEAD
=======
  loading = false,
>>>>>>> cc343e15 (Upgrade to v8 commit)
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
<<<<<<< HEAD
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-brand-navy text-white hover:bg-brand-navyLight',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
=======
  loading?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-b from-brand-navyLight to-brand-navy text-white shadow-[0_4px_14px_-4px_rgba(10,27,77,0.5)] hover:brightness-110 dark:from-brand-gold dark:to-[#B98F35] dark:text-brand-navyDeep dark:shadow-glowGold dark:hover:brightness-105',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };
  // Disabled during loading too — a second click while a request is
  // already in flight is exactly the "resubmit before the first one
  // resolved" bug class a loading state exists to prevent in the first
  // place, so making it visible without also blocking clicks would
  // defeat the point.
>>>>>>> cc343e15 (Upgrade to v8 commit)
  return (
    <button
      type={type}
      onClick={onClick}
<<<<<<< HEAD
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
=======
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
>>>>>>> cc343e15 (Upgrade to v8 commit)
      {children}
    </button>
  );
}

<<<<<<< HEAD
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy ${props.className || ''}`}
    />
  );
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy ${props.className || ''}`}
    >
      {children}
    </select>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="px-5 py-10 text-center text-sm text-slate-400">{message}</div>;
}

export function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{message}</div>;
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="tabular mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
=======
export function Input({
  error,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <input
        {...props}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/60 dark:focus:border-red-400 dark:focus:ring-red-400/30'
            : 'border-slate-300 focus:border-brand-navy focus:ring-brand-navy/20 dark:border-slate-700 dark:focus:border-brand-gold dark:focus:ring-brand-gold/20'
        } ${className}`}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </>
  );
}

export function Select({
  children,
  error,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <>
      <select
        {...props}
        aria-invalid={!!error}
        className={`rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/60 dark:focus:border-red-400 dark:focus:ring-red-400/30'
            : 'border-slate-300 focus:border-brand-navy focus:ring-brand-navy/20 dark:border-slate-700 dark:focus:border-brand-gold dark:focus:ring-brand-gold/20'
        } ${className}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      {icon && <div className="text-slate-300 dark:text-slate-700">{icon}</div>}
      <p className="text-sm text-slate-400 dark:text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30">
      {message}
    </div>
  );
}

// `tone` is new — most tiles are neutral, but a few (frozen accounts,
// pending KYC, flagged transactions) are meant to draw the eye when
// they're non-zero. Previously every StatTile looked identical regardless
// of whether the number behind it was good news or something to act on —
// the dashboard read as a flat wall of numbers with no visual hierarchy
// telling you which ones to look at first.
export function StatTile({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'warning' | 'danger';
}) {
  const toneClasses: Record<string, string> = {
    neutral: '',
    warning: 'ring-1 ring-amber-200 dark:ring-amber-500/30',
    danger: 'ring-1 ring-red-200 dark:ring-red-500/30',
  };
  const hintClasses: Record<string, string> = {
    neutral: 'text-slate-400 dark:text-slate-500',
    warning: 'text-amber-700 dark:text-amber-400',
    danger: 'text-red-700 dark:text-red-400',
  };
  return (
    <Card className={`p-5 transition-shadow hover:shadow-lift ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      <p className="tabular mt-2 text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
      {hint && <p className={`mt-1 text-xs ${hintClasses[tone]}`}>{hint}</p>}
>>>>>>> cc343e15 (Upgrade to v8 commit)
    </Card>
  );
}
