import { apiFetch, ClientApiError } from './client-api';

describe('apiFetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  function mockFetchOnce(status: number, body: any, contentType = 'application/json') {
    global.fetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      headers: { get: (name: string) => (name === 'content-type' ? contentType : null) },
      json: async () => body,
    }) as any;
  }

  it('routes every call through /api/proxy, never the backend origin directly', async () => {
    mockFetchOnce(200, { ok: true });
    await apiFetch('/admin/kyc');
    expect(global.fetch).toHaveBeenCalledWith('/api/proxy/admin/kyc', expect.any(Object));
  });

  it('always disables caching — stale admin data (KYC queue, fraud alerts) is a real risk, not just staleness', async () => {
    mockFetchOnce(200, { ok: true });
    await apiFetch('/admin/kyc');
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.cache).toBe('no-store');
  });

  it('returns the parsed JSON body on success', async () => {
    mockFetchOnce(200, { id: '1', name: 'Test User' });
    const result = await apiFetch('/admin/users/1');
    expect(result).toEqual({ id: '1', name: 'Test User' });
  });

  it('throws a ClientApiError carrying the status and backend message on failure', async () => {
    mockFetchOnce(403, { message: 'Insufficient role for this action.' });
    await expect(apiFetch('/admin/fraud/rules')).rejects.toMatchObject({
      status: 403,
      message: 'Insufficient role for this action.',
    });
  });

  it('falls back to a generic message when the error body has no message field', async () => {
    mockFetchOnce(500, { error: 'Internal Server Error' });
    await expect(apiFetch('/admin/kyc')).rejects.toThrow('Request failed (500)');
  });

  it('handles a non-JSON error response (e.g. a proxy/gateway failure page) without crashing', async () => {
    mockFetchOnce(502, null, 'text/html');
    await expect(apiFetch('/admin/kyc')).rejects.toBeInstanceOf(ClientApiError);
    await expect(apiFetch('/admin/kyc')).rejects.toThrow('Request failed (502)');
  });
});
