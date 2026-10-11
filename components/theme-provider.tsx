'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Master audit, Section 6: this was a pure-light, hardcoded dark-navy-
// sidebar-only surface with no theme toggle anywhere — a genuine gap for
// a tool operators plausibly run at 2am during an incident. Class-based
// (not media-query-based) so an admin's choice is explicit and persists
// regardless of their OS setting — an ops tool shouldn't silently flip
// on them because their laptop's system theme changed.
type Theme = 'light' | 'dark';
const STORAGE_KEY = 'zannypay-admin-theme';

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts 'light' to match the server-rendered markup exactly (no theme
  // is knowable server-side without a cookie round-trip) — the inline
  // script in app/layout.tsx sets the real class on <html> before paint,
  // and this effect below reconciles React's own state to match on mount
  // so toggleTheme() has an accurate starting point.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as Theme | null)) || null;
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
    } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme() called outside of ThemeProvider.');
  return ctx;
}
