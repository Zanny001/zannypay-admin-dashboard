'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Sun, Moon, Settings, ChevronDown } from 'lucide-react';
import { ROLE_LABELS, type AdminProfile } from '@/lib/types';
import { useTheme } from './theme-provider';
import { GlobalSearch } from './global-search';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/kyc': 'KYC Queue',
  '/transactions': 'Transactions',
  '/disputes': 'Disputes',
  '/support': 'Support',
  '/loans': 'Loans',
  '/ledger': 'Ledger',
  '/analytics': 'Analytics',
  '/fraud': 'Fraud & Risk',
  '/admins': 'Admins',
  '/audit-logs': 'Audit Log',
  '/security': 'Security',
  '/settings': 'Settings',
};

function titleFor(pathname: string | null): string {
  if (!pathname) return 'Admin Console';
  const topLevel = '/' + (pathname.split('/')[1] || '');
  return TITLES[topLevel] || 'Admin Console';
}

// Master audit, Section 6: "An admin's own identity has no representation
// anywhere in this product... The only way to know who's logged in is the
// name/email printed next to the logout link." This replaces that static
// text with a real profile surface — avatar, dropdown to Settings — and
// adds the dark-mode toggle that previously didn't exist anywhere either.
export function Topbar({ admin }: { admin: AdminProfile }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">{titleFor(pathname)}</h1>
      <div className="flex items-center gap-3">
        <GlobalSearch />
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-lg py-1 pl-1.5 pr-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {admin.photoUrl ? (
              <img src={admin.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-semibold text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold">
                {admin.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium leading-tight text-slate-800 dark:text-slate-100">{admin.name}</p>
              <p className="text-xs leading-tight text-slate-400 dark:text-slate-500">{ROLE_LABELS[admin.role]}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lift dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{admin.name}</p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">{admin.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Settings size={15} /> Profile & Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
