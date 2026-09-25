import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const secret = 'dummy-proxy-test-secret-at-least-32-characters';
const MEASUREMENT_ID = 'G-TESTID0001';

async function cspFor(url: string, measurementId?: string) {
  vi.resetModules();
  if (measurementId === undefined) {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
  } else {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', measurementId);
  }
  const { proxy } = await import('../../src/proxy');
  const response = await proxy(new NextRequest(`https://example.com${url}`));
  return response.headers.get('content-security-policy') ?? '';
}

describe('Google Analytics CSP allowlist', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXTAUTH_SECRET', secret);
    vi.stubEnv('NEXTAUTH_URL', 'https://example.com');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('leaves the policy untouched when no Measurement ID is configured', async () => {
    const csp = await cspFor('/');
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("connect-src 'self';");
    expect(csp).toContain("img-src 'self' data: https://*.public.blob.vercel-storage.com;");
    expect(csp).not.toContain('googletagmanager');
    expect(csp).not.toContain('google-analytics');
  });

  it('allows only the Google tag and collection origins on public routes', async () => {
    const csp = await cspFor('/products', MEASUREMENT_ID);
    expect(csp.match(/script-src[^;]+/)?.[0]).toContain('https://www.googletagmanager.com');
    expect(csp.match(/connect-src[^;]+/)?.[0]).toBe(
      "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com" +
        ' https://analytics.google.com https://*.analytics.google.com',
    );
    expect(csp.match(/img-src[^;]+/)?.[0]).toContain('https://*.google-analytics.com');
    // Advertising endpoints stay blocked; the tag disables the features that request them.
    expect(csp).not.toContain('doubleclick');
    expect(csp.match(/connect-src[^;]+/)?.[0]).not.toContain('https://www.google.com');
  });

  it('never weakens the policy with unsafe directives or a bare wildcard', async () => {
    const csp = await cspFor('/', MEASUREMENT_ID);
    expect(csp.match(/script-src[^;]+/)?.[0]).not.toContain('unsafe-');
    expect(csp).toContain("object-src 'none';");
    expect(csp).toContain("frame-ancestors 'none';");
    expect(csp).not.toMatch(/(^|[\s:])\*($|[\s;])/);
  });

  it('does not open Google origins for admin or API traffic', async () => {
    for (const url of ['/admin/login', '/api/health']) {
      expect(await cspFor(url, MEASUREMENT_ID)).not.toContain('google-analytics.com');
    }
  });
});

describe('analytics route policy', () => {
  it('measures public pages only', async () => {
    vi.resetModules();
    const { isAnalyticsRoute } = await import('../../src/lib/config/analytics');
    expect(['/', '/products/foo', '/careers', '/legal/privacy'].every(isAnalyticsRoute)).toBe(true);
    expect(['/admin', '/admin/dashboard', '/api/contact'].some(isAnalyticsRoute)).toBe(false);
  });
});
