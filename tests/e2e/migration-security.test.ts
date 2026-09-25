import { expect, test } from '@playwright/test';

test.describe('Migration security', () => {
  test('prefetch headers cannot bypass media or private resume authentication', async ({ request }) => {
    const headers = { 'next-router-prefetch': '1', purpose: 'prefetch' };
    const media = await request.post('/api/admin/media', { headers });
    expect(media.status()).toBe(401);
    expect(await media.json()).toEqual({ error: 'Unauthorized' });
    const resume = await request.get('/api/admin/candidates/test/resume', { headers });
    expect(resume.status()).toBe(401);
    expect(await resume.json()).toEqual({ error: 'Unauthorized' });
  });
  test('login page keeps restrictive CSP while supporting public Blob previews', async ({ page }) => {
    const response = await page.goto('/admin/login');
    expect(response?.status()).toBe(200);
    const csp = response!.headers()['content-security-policy'];
    expect(csp).toContain("img-src 'self' data: https://*.public.blob.vercel-storage.com;");
    expect(csp.match(/script-src[^;]+/)?.[0]).not.toContain('unsafe-');
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
