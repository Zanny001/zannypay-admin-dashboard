import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { backendFetch, BackendError } from '@/lib/api';
=======
import { backendFetch, rawBackendFetch, BackendError } from '@/lib/api';
import { isSameOriginRequest, forbiddenOriginResponse } from '@/lib/rate-limit';
>>>>>>> cc343e15 (Upgrade to v8 commit)

// Every admin page's data calls go through here: browser -> this route
// (same-origin, cookie sent automatically) -> Nest backend (Authorization
// header attached server-side from the httpOnly cookie). The browser
// never holds or sends the access token itself.
async function handle(req: NextRequest, params: { path: string[] }) {
  const path = '/' + params.path.join('/');
  const search = req.nextUrl.search; // includes the leading "?" or is ""
  const method = req.method;

<<<<<<< HEAD
=======
  // CSRF backstop on top of SameSite=Lax: state-changing requests must
  // provably originate from this app's own pages (Origin/Referer host
  // match). GET/HEAD stay exempt — they're read-only and include health
  // checks and direct-link exports.
  if (method !== 'GET' && method !== 'HEAD' && !isSameOriginRequest(req)) {
    return forbiddenOriginResponse();
  }

>>>>>>> cc343e15 (Upgrade to v8 commit)
  let body: string | undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    const text = await req.text();
    body = text.length > 0 ? text : undefined;
  }

<<<<<<< HEAD
=======
  // File downloads — CSV exports (AdminController's /transactions/export,
  // /audit-logs/export) and the KYC decision PDF
  // (ComplianceExportController's /kyc-record.pdf) — return a raw
  // text/csv or application/pdf body, not JSON. backendFetch()'s always-
  // parse-or-stringify behavior would mangle either into a JSON-quoted
  // string (CSV) or silently corrupt binary data (PDF) and lose the
  // filename either way. Detected by path shape rather than sniffing
  // content-type before the request is made, since that's the one signal
  // available up front — matches any path ending in "/export" or a file
  // extension, which covers every download route this backend exposes
  // today without needing this proxy updated every time a new one is added.
  const isFileDownload = method === 'GET' && (path.endsWith('/export') || /\.\w{2,4}$/.test(path));

  if (isFileDownload) {
    try {
      const res = await rawBackendFetch(`${path}${search}`, { method });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: 'Download failed.' }));
        return NextResponse.json(errBody, { status: res.status });
      }
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
          'Content-Disposition': res.headers.get('content-disposition') || 'attachment',
        },
      });
    } catch (error) {
      return NextResponse.json({ message: 'Could not reach the ZannyPay admin API.' }, { status: 502 });
    }
  }

>>>>>>> cc343e15 (Upgrade to v8 commit)
  try {
    const result = await backendFetch(`${path}${search}`, { method, body });
    return NextResponse.json(result ?? { success: true });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(error.body ?? { message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Could not reach the ZannyPay admin API.' }, { status: 502 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
