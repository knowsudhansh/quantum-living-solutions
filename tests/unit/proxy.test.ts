import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config, proxy } from '../../src/proxy';
import { signToken } from '../../src/lib/security/auth';
import { ADMIN_SESSION_COOKIE } from '../../src/lib/security/session';
const secret = 'dummy-proxy-test-secret-at-least-32-characters';
describe('admin proxy and Blob CSP', () => {
  beforeEach(() => { vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('NEXTAUTH_SECRET', secret); vi.stubEnv('NEXTAUTH_URL', 'https://example.com'); });
  afterEach(() => vi.unstubAllEnvs());
  it.each(['/api/admin/media', '/api/admin/candidates/id/resume', '/admin/dashboard'])('does not exclude prefetch headers from authentication: %s', async (url) => {
    const headers = { 'next-router-prefetch': '1', purpose: 'prefetch' };
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url, headers })).toBe(true);
    const response = await proxy(new NextRequest(`https://example.com${url}`, { headers }));
    expect(response.status).toBe(url.startsWith('/api/') ? 401 : 307);
  });
  it('preserves admin access and origin protection across deployment origins', async () => {
    const token = await signToken({ role: 'admin' }, secret);
    const headers = { cookie: `${ADMIN_SESSION_COOKIE}=${token}`, origin: 'https://preview.example.com' };
    const allowed = await proxy(new NextRequest('https://preview.example.com/api/admin/media', { method: 'POST', headers }));
    expect(allowed.status).toBe(200);
    const denied = await proxy(new NextRequest('https://preview.example.com/api/admin/media', { method: 'POST', headers: { ...headers, origin: 'https://untrusted.example' } }));
    expect(denied.status).toBe(403);
  });
  it('allows public Blob images without broadening scripts, frames or connections', async () => {
    const response = await proxy(new NextRequest('https://example.com/'));
    const csp = response.headers.get('content-security-policy')!;
    expect(csp).toContain("img-src 'self' data: https://*.public.blob.vercel-storage.com;");
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain("object-src 'none';");
    expect(csp).not.toContain('private.blob');
    expect(csp.match(/script-src[^;]+/)?.[0]).not.toContain('unsafe-');
  });
});
