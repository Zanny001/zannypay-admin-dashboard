/** @jest-environment node */

import { NextRequest } from 'next/server';
import { checkRateLimit, isSameOriginRequest } from './rate-limit';

describe('admin BFF request security', () => {
  it('accepts an exact same-origin Origin header', () => {
    const request = new NextRequest('https://admin.example.com/api/proxy/users', {
      headers: { origin: 'https://admin.example.com' },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });

  it('accepts a same-origin Referer when Origin is absent', () => {
    const request = new NextRequest('https://admin.example.com/api/proxy/users', {
      headers: { referer: 'https://admin.example.com/dashboard' },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });

  it.each([
    ['cross-origin host', { origin: 'https://attacker.example' }],
    ['cross-origin port', { origin: 'https://admin.example.com:444' }],
    ['cross-origin scheme', { origin: 'http://admin.example.com' }],
    ['malformed origin', { origin: 'not a url' }],
    ['missing origin and referer', {}],
  ])('rejects %s', (_label, headers) => {
    const request = new NextRequest('https://admin.example.com/api/proxy/users', {
      headers,
    });
    expect(isSameOriginRequest(request)).toBe(false);
  });

  it('limits repeated login attempts for the same client key', () => {
    const request = new NextRequest('https://admin.example.com/api/auth/login', {
      headers: { 'x-forwarded-for': '198.51.100.77' },
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(checkRateLimit(request, 'security-test-login', 5, 300_000).limited).toBe(false);
    }

    const blocked = checkRateLimit(request, 'security-test-login', 5, 300_000);
    expect(blocked.limited).toBe(true);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
