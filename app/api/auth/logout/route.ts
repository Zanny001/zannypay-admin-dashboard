import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api';
import { clearSessionCookieOnResponse } from '@/lib/session';

export async function POST() {
  // Best-effort: revoke the AdminSession row on the backend so the token
  // can't be replayed even if it leaked, then clear the cookie regardless
  // of whether that call succeeded (an already-expired/invalid token
  // shouldn't block the user from clearing their local session).
  try {
    await backendFetch('/admin-auth/logout', { method: 'POST' });
  } catch {
    // ignore — clearing the cookie below is what actually matters to the user
  }
  const response = NextResponse.json({ success: true });
  return clearSessionCookieOnResponse(response);
}
