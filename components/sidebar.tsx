'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  MessageSquareWarning,
  Landmark,
  ShieldAlert,
  UserCog,
  ScrollText,
  KeyRound,
  MessageCircle,
<<<<<<< HEAD
} from 'lucide-react';
import type { AdminRole } from '@/lib/types';
=======
  Scale,
  Activity,
} from 'lucide-react';
import type { AdminRole } from '@/lib/types';
import { useDashboardCounts } from '@/lib/use-dashboard-counts';
>>>>>>> cc343e15 (Upgrade to v8 commit)

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: AdminRole[]; // omitted = visible to every role
<<<<<<< HEAD
=======
  badgeKey?: 'pendingKycReviews' | 'flaggedTransactions' | 'openDisputes';
>>>>>>> cc343e15 (Upgrade to v8 commit)
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
<<<<<<< HEAD
  { href: '/kyc', label: 'KYC Queue', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'] },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/disputes', label: 'Disputes', icon: MessageSquareWarning },
  { href: '/support', label: 'Support', icon: MessageCircle },
  { href: '/loans', label: 'Loans', icon: Landmark, roles: ['SUPER_ADMIN', 'FINANCE_OFFICER'] },
  { href: '/fraud', label: 'Fraud & Risk', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_OFFICER'] },
=======
  { href: '/kyc', label: 'KYC Queue', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'], badgeKey: 'pendingKycReviews' },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/disputes', label: 'Disputes', icon: MessageSquareWarning, badgeKey: 'openDisputes' },
  { href: '/support', label: 'Support', icon: MessageCircle },
  { href: '/loans', label: 'Loans', icon: Landmark, roles: ['SUPER_ADMIN', 'FINANCE_OFFICER'] },
  { href: '/ledger', label: 'Ledger', icon: Scale, roles: ['SUPER_ADMIN', 'FINANCE_OFFICER'] },
  { href: '/analytics', label: 'Analytics', icon: Activity },
  { href: '/fraud', label: 'Fraud & Risk', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_OFFICER'], badgeKey: 'flaggedTransactions' },
>>>>>>> cc343e15 (Upgrade to v8 commit)
  { href: '/admins', label: 'Admins', icon: UserCog, roles: ['SUPER_ADMIN'] },
  { href: '/audit-logs', label: 'Audit Log', icon: ScrollText, roles: ['SUPER_ADMIN'] },
  { href: '/security', label: 'Security', icon: KeyRound },
];

export function Sidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname() || '';
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
<<<<<<< HEAD

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-brand-navy text-white">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold text-sm font-bold text-brand-navy">
          Z
        </div>
        <span className="text-lg font-semibold tracking-tight">ZannyPay</span>
=======
  // Master audit, Section 6: previously the only way to know something
  // needed attention was to click into each page individually. Polled via
  // the same /admin/dashboard call the Dashboard page itself makes.
  const counts = useDashboardCounts();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-gradient-to-b from-brand-navy to-brand-navyDeep text-white dark:bg-slate-950 dark:bg-none dark:ring-1 dark:ring-white/5">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-goldLight to-brand-gold text-sm font-bold text-brand-navyDeep shadow-glowGold">
          Z
        </div>
        <div>
          <span className="block text-lg font-semibold leading-tight tracking-tight">ZannyPay</span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-white/35">Admin Console</span>
        </div>
>>>>>>> cc343e15 (Upgrade to v8 commit)
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const active = pathname === item.href || (pathname !== '/' && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;
<<<<<<< HEAD
=======
          const badgeCount = item.badgeKey && counts ? counts[item.badgeKey] : 0;
>>>>>>> cc343e15 (Upgrade to v8 commit)
          return (
            <Link
              key={item.href}
              href={item.href}
<<<<<<< HEAD
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                active ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && <span className="absolute -ml-3 h-4 w-0.5 rounded-full bg-brand-gold" />}
              <Icon size={17} strokeWidth={2} />
              {item.label}
=======
              className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                active ? 'bg-white/10 font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && <span className="absolute -ml-3 h-4 w-[3px] rounded-full bg-brand-gold" />}
              <Icon size={17} strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-gold px-1.5 text-[10px] font-bold text-brand-navyDeep">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
>>>>>>> cc343e15 (Upgrade to v8 commit)
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-white/40">
        Admin Console · Internal use only
        <br />© {new Date().getFullYear()} ZannyPay. All rights reserved.
      </div>
    </aside>
  );
}
