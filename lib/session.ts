import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// A single httpOnly cookie holds the admin's Nest access_token. httpOnly
// means page JavaScript can never read it — even a successful XSS
// injection on this dashboard can't exfiltrate the session, only ride
// along with it for the lifetime of a single request it can't inspect.
// This is the whole reason every backend call in this app is proxied
// through a Next.js route handler (see lib/api.ts) instead of the browser
// calling the Nest API directly with a token held in JS-accessible storage.
export const SESSION_COOKIE = 'zannypay_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8h — matches the Nest backend's own token expiry

// Prefer these two over the cookies()-based pair below in any Route
// Handler. Setting cookies via cookies().set() (next/headers) doesn't
// always reliably attach to the response in a plain Route Handler — it's
// primarily intended for Server Actions. Setting them directly on the
// NextResponse object being returned is the pattern Next.js's own docs
// recommend for Route Handlers, and the one that actually worked when
// this was debugged (see login/route.ts's history). All three auth
// routes (login, 2fa-verify, logout) should use these, not the pair below.
export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookieOnResponse(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

// Kept for any Server Action usage — NOT for Route Handlers (see above).
export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export function getSessionToken(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}
