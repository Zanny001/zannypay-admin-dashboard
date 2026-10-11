import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

// A cheap, edge-level check (cookie presence only — the Nest backend is
// still the real authority on whether the token is valid/unrevoked/
// unexpired; this just avoids rendering a protected page's shell for an
// obviously-logged-out visitor before redirecting them to /login).
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login';
  const isPublicApiRoute = pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/2fa-verify');

  if (!hasSession && !isAuthRoute && !isPublicApiRoute) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
