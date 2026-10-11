'use client';

// Used from client components. Every call goes through /api/proxy/*,
// this app's own route handler — the browser never sees the Nest access
// token, and never talks to the Nest backend's origin directly. See
// app/api/proxy/[...path]/route.ts.
export class ClientApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body?.message === 'string' ? body.message : `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string> | undefined) },
    cache: 'no-store',
  });

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ClientApiError(res.status, body);
  }
  return body;
}
