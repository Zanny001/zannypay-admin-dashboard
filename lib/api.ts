import { getSessionToken } from './session';

// ADMIN_API_BASE_URL is server-side only (no NEXT_PUBLIC_ prefix) — it
// never reaches the browser bundle. Point this at wherever the ZannyPay
// Nest backend is deployed, e.g. https://api.zannypay.com or
// http://localhost:3000 in development.
const BACKEND_BASE_URL = process.env.ADMIN_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1'; // matches the Nest app's setGlobalPrefix('api') + URI versioning

export class BackendError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body?.message === 'string' ? body.message : `Backend request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

// Only for use inside Next.js server code (route handlers, server
// components, server actions) — never import this into a 'use client'
// file, since it reads the httpOnly cookie directly via next/headers.
export async function backendFetch(path: string, init?: RequestInit & { asAdmin?: boolean }) {
  const res = await rawBackendFetch(path, init);
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    throw new BackendError(res.status, body);
  }
  return body;
}

// Used by the proxy route for endpoints whose response isn't JSON — the
// CSV exports (AdminController's /transactions/export, /audit-logs/export)
// being the concrete case today. backendFetch() above always parses (or
// stringifies) the body, which would take a CSV response and hand back a
// JSON-quoted string instead of a real downloadable file; this variant
// hands back the raw Response so the proxy can forward its content-type
// and content-disposition headers unchanged.
export async function rawBackendFetch(path: string, init?: RequestInit) {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${BACKEND_BASE_URL}${API_PREFIX}${path}`, {
    ...init,
    headers,
    cache: 'no-store', // admin data is never safe to cache — always the current state
  });
}
