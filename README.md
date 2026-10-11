# ZannyPay Admin Dashboard

Internal Next.js 14 (App Router) web app that consumes the ZannyPay admin
API. Not customer-facing — deploy this behind your own access controls
(VPN, SSO in front of it, or at minimum the backend's own IP allowlist).

## Architecture — why a BFF, not a plain SPA

The browser **never** holds the Nest backend's access token. Every admin
API call goes:

```
Browser  →  Next.js route handler (/api/proxy/*)  →  Nest backend
             (reads the token from an httpOnly cookie
              and attaches it as Authorization: Bearer)
```

`app/api/auth/login`, `2fa-verify`, `logout`, and `me` handle the actual
auth handshake and are the only places that set/clear the session cookie.
`app/api/proxy/[...path]/route.ts` is a generic catch-all for everything
else. See `lib/session.ts` and `lib/api.ts` for the implementation and the
reasoning in their comments.

This means an XSS bug in this dashboard's own code can't exfiltrate a
reusable admin session — httpOnly cookies aren't readable by page
JavaScript at all, unlike a token sitting in `localStorage`.

## Setup

```bash
npm install
cp .env.example .env
# edit ADMIN_API_BASE_URL to point at your running ZannyPay backend
npm run dev
```

Open http://localhost:3001 (or whatever port `next dev` chooses) and log
in with an admin account created via the backend's
`POST /admin-auth/bootstrap` or `POST /admin/admins`.

## Netlify builds

The `build` script explicitly sets `NODE_ENV=production` before running
Next.js. This prevents an inherited development setting from mixing
development and production React/Next.js runtimes during prerendering,
which can cause both `<Html>` and `useContext` errors even without invalid
document imports or duplicate React dependencies. The setting applies
only to the build command; local development and tests are unchanged.

Use the package's `build` script for deployment rather than calling
`next build` directly. Do not set `NODE_ENV` in `.env` or `.env.local`;
Next.js normally selects the appropriate mode for each command.

## Pages

- `/dashboard` — headline platform stats
- `/users`, `/users/[id]` — search, view, freeze/unfreeze
- `/kyc` — pending KYC review queue (COMPLIANCE_OFFICER/SUPER_ADMIN)
- `/transactions` — search, flag, reverse
- `/disputes` — queue and resolution
- `/loans` — read-only oversight of the credit book
- `/fraud` — the automated fraud engine's alert queue and rule tuning
- `/admins` — admin account management (SUPER_ADMIN only)
- `/audit-logs` — full action trail (SUPER_ADMIN only)
- `/security` — your own 2FA setup, active sessions, and (SUPER_ADMIN) the
  IP allowlist

Every page also relies on the backend's own `RolesGuard` — hiding a nav
item or button here is a UX nicety, not the actual security boundary.

## What's deliberately not included

- No design system beyond the small set in `components/ui.tsx` — no
  component library dependency, to keep the install surface small.
- No client-side state library (Redux/Zustand/React Query) — each page
  fetches its own data with a plain `useEffect`. Fine at this scale; worth
  reaching for React Query if this grows a lot more shared/cached state.
- No automated tests. Given the sensitivity of what this touches, add at
  minimum integration tests around the auth flow and the fraud
  confirm/dismiss actions before relying on this in production.
- No dark mode, no i18n — internal tool, single locale assumed.
