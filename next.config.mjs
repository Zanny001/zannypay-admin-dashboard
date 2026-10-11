/** @type {import('next').NextConfig} */

// Security headers applied to every response. This dashboard is an
// internal money-ops surface: it renders no third-party content and
// frames nothing, so the policy can be strict.
//
// CSP note: script-src includes 'unsafe-inline' because Next.js 14 App
// Router injects inline bootstrap scripts; dropping it requires a nonce
// pipeline (middleware-generated, per-request). That is the correct
// longer-term move — tracked in the hardening roadmap — but shipping a
// broken CSP that blocks the app's own scripts is worse than a partial
// one. Everything else is as tight as the app allows today.
const securityHeaders = [
  // Never allow this app to be iframed (clickjacking protection).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers from MIME-sniffing responses into executable content.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak full URLs to third parties on navigation.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Enforce HTTPS for two years, subdomains included (production only —
  // HSTS over plain HTTP localhost breaks local dev).
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
  // No camera/mic/geolocation usage anywhere in the admin app.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'", // Tailwind + inline style attrs
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'", // browser only ever talks to same-origin /api routes
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework/version in response headers.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
