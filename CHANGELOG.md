# Changelog — ZannyPay Admin Dashboard v8

## Security (critical)
- **Next.js 14.2.5 → 14.2.35.** Fixes CVE-2025-29927 (CVSS 9.1): the
  `x-middleware-subrequest` header could skip middleware entirely — and
  this app's admin auth gate lives in middleware. 14.2.35 carries every
  later 14.2.x security backport as well.
- **CSRF backstop on the BFF proxy**: mutating requests to /api/proxy/*
  now require a same-origin Origin/Referer header, on top of the existing
  SameSite=Lax session cookie.
- **Rate limiting** on /api/auth/login and /api/auth/2fa-verify:
  5 attempts per 5 minutes per IP with Retry-After. Per-instance,
  in-memory — move to Redis/Upstash if horizontally scaled.
- **Security headers** on every response: CSP, X-Frame-Options: DENY,
  nosniff, Referrer-Policy, Permissions-Policy, HSTS (prod), and
  poweredByHeader removed. CSP note: script-src keeps 'unsafe-inline'
  until a nonce pipeline lands — documented in next.config.mjs.
- **Pinned @testing-library/jest-dom@6.6.3** (6.10 requires Node 22).

## Quality
- Fixed pre-existing typecheck failure (jest-dom matcher types now reach
  tsc via jest-dom.d.ts).
- Fixed pre-existing ESLint errors (unescaped entities).
- **GitHub Actions CI**: install → lint → typecheck → tests → build.
- **Dependabot**: weekly dependency update PRs; security updates always.
