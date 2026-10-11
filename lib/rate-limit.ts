import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter for the auth endpoints.
//
// Scope honesty: this is per-instance, in-process state. On a single
// deployment (one Node process / one container) it fully throttles login
// and 2FA brute-force attempts. On a horizontally scaled or serverless
// deployment each instance gets its own window, so the effective limit is
// multiplied by instance count — the durable fix there is a shared store
// (Redis/Upstash). The Nest backend should also enforce its own limit as
// the authoritative layer; this one exists so obviously abusive traffic
// dies at the edge of this app instead of reaching the backend at all.
// ---------------------------------------------------------------------------

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the Map can't grow unboundedly under a
// distributed spray of distinct keys.
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

function clientKey(req: NextRequest): string {
  // x-forwarded-for is set by the hosting platform's edge (Vercel/Render).
  // First entry is the original client. Fall back to a shared bucket so an
  // attacker without the header still gets limited collectively, not
  // unlimitedly.
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : 'unknown';
  return ip;
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  req: NextRequest,
  bucketName: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  sweep(windowMs);
  const key = `${bucketName}:${clientKey(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return { limited: true, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { limited: false, retryAfterSeconds: 0 };
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { message: 'Too many attempts. Please wait before trying again.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  );
}

// Same-origin guard for state-changing requests. The session cookie is
// SameSite=Lax, which already blocks cross-site POSTs carrying the cookie
// in modern browsers — but "modern browsers" is doing real work in that
// sentence. Explicitly verifying Origin/Referer on every mutating request
// closes the gap for older clients and non-browser tooling, at the cost
// of a same-host string comparison.
export function isSameOriginRequest(req: NextRequest): boolean {
  const source = req.headers.get('origin') ?? req.headers.get('referer');
  if (!source) {
    // Non-browser clients (curl, health checks) often send neither. Mutating
    // API calls in this app always come from its own pages, which send both —
    // so treat a missing source on a mutation as not-same-origin.
    return false;
  }
  try {
    return new URL(source).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

export function forbiddenOriginResponse(): NextResponse {
  return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
}
