import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, BackendError } from '@/lib/api';
import { attachSessionCookie } from '@/lib/session';
<<<<<<< HEAD

export async function POST(req: NextRequest) {
=======
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // 5 attempts per 5 minutes per IP — tight enough to make credential
  // stuffing pointless, loose enough to never catch a human mistyping.
  const rl = checkRateLimit(req, 'admin-login', 5, 5 * 60 * 1000);
  if (rl.limited) return rateLimitResponse(rl.retryAfterSeconds);

>>>>>>> cc343e15 (Upgrade to v8 commit)
  const { email, password } = await req.json();

  try {
    const result = await backendFetch('/admin-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.twoFactorRequired) {
      return NextResponse.json({ twoFactorRequired: true, mfaToken: result.mfaToken });
    }

    const response = NextResponse.json({ twoFactorRequired: false, admin: result.admin });
    return attachSessionCookie(response, result.access_token);
  } catch (error: any) {
    if (error instanceof BackendError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Could not reach the ZannyPay admin API.' }, { status: 502 });
  }
}
