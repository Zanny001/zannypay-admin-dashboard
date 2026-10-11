'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/client-api';

// Master audit, Section 6 (nice-to-have): the sidebar had no sense of
// "something needs attention" anywhere — an admin had to click into KYC
// Queue, Fraud & Risk, and Disputes individually just to see if anything
// was waiting. Reuses the same /admin/dashboard call the Dashboard page
// itself makes (no new backend endpoint needed) — polled here so the
// sidebar counts remain roughly live across a whole session, not just at
// the moment the page loaded.
const POLL_INTERVAL_MS = 45_000;

interface DashboardCounts {
  pendingKycReviews: number;
  flaggedTransactions: number;
  openDisputes: number;
}

export function useDashboardCounts(): DashboardCounts | null {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);

  useEffect(() => {
    let cancelled = false;

    function poll() {
      apiFetch('/admin/dashboard')
        .then((data) => {
          if (cancelled) return;
          setCounts({
            pendingKycReviews: data.pendingKycReviews || 0,
            flaggedTransactions: data.flaggedTransactions || 0,
            openDisputes: data.openDisputes || 0,
          });
        })
        .catch(() => {
          // Silent — a failed poll just means the badges stay at their
          // last-known value until the next tick; not worth surfacing an
          // error banner for a background refresh.
        });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return counts;
}
