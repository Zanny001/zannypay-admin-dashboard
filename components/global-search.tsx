'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User as UserIcon, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/client-api';

interface UserResult {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  profileImage?: string | null;
}

// A lightweight global search — scoped to users for now (the highest-
// frequency "find this person" lookup an admin does), reusing the same
// /admin/users search every admin role already has access to rather than
// standing up a separate search endpoint. Previously there was no way to
// jump to a specific user from anywhere except the Users page's own
// search box.
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiFetch(`/admin/users?q=${encodeURIComponent(q)}&pageSize=5`)
      .then((data) => setResults(data.users || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 250);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToUser(id: string) {
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(`/users/${id}`);
  }

  return (
    <div className="relative w-64" ref={containerRef}>
      <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => query && setOpen(true)}
        placeholder="Search users…"
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-navy dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-brand-gold dark:focus:bg-slate-900 dark:focus:ring-brand-gold"
      />

      {open && query && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 dark:text-slate-500">
              <Loader2 size={14} className="animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No users match &ldquo;{query}&rdquo;.</p>
          ) : (
            <ul>
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => goToUser(u.id)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    {u.profileImage ? (
                      <img src={u.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <UserIcon size={13} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{u.name}</p>
                      <p className="tabular truncate text-xs text-slate-400 dark:text-slate-500">{u.accountNumber} · {u.email}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
