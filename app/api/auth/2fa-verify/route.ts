import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, BackendError } from '@/lib/api';
import { attachSessionCookie } from '@/lib/session';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // TOTP codes are 6 digits — brute-forceable without a limit. 5 attempts
  // per 5 minutes per IP, same as login.
  const rl = checkRateLimit(req, 'admin-2fa', 5, 5 * 60 * 1000);
  if (rl.limited) return rateLimitResponse(rl.retryAfterSeconds);

  const { mfaToken, code } = await req.json();

  try {
    const result = await backendFetch('/admin-auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ mfaToken, code }),
    });

    // Previously used setSessionCookie() (the cookies()-from-next/headers
    // pattern), which didn't reliably attach in a plain Route Handler —
    // the same bug login/route.ts was fixed for, just never carried over
    // here. Any admin with 2FA enabled could pass their code and still
    // land back at /login with no session. Now uses the same
    // response.cookies.set() pattern as login/route.ts.
    const response = NextResponse.json({ admin: result.admin });
    return attachSessionCookie(response, result.access_token);
  } catch (error: any) {
    if (error instanceof BackendError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Could not reach the ZannyPay admin API.' }, { status: 502 });
  }
}
