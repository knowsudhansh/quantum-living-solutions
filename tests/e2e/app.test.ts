import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('E2E Verification & Shell Accessibility', () => {
  test('health status API should return 200 and healthy JSON', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    // Check cache headers
    const cacheControl = response.headers()['cache-control'];
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('no-cache');
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeUndefined(); // Excludes timestamps in API health checks
  });

  test('homepage response should include expected static security headers', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    const headers = response!.headers();
    
    // Verify CSP matches the strict baseline
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).not.toContain('unsafe-eval');
    
    // Verify standard safety headers
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('same-origin');
    expect(headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
  });

  test('homepage layout renders semantic elements, skip-link, and target content', async ({ page }) => {
    await page.goto('/');
    
    // Checks semantic landmark markers exist
    const header = page.locator('header');
    await expect(header).toBeVisible();
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Verifies skip link is in the DOM and binds to the main landmark target
    const skipLink = page.locator('a:has-text("Skip to content")');
    await expect(skipLink).toBeAttached();
    
    const skipHref = await skipLink.getAttribute('href');
    expect(skipHref).toBe('#main-content');

    // Verify keyboard focus reaching the skip link and showing it
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible(); // Skip link becomes visible on focus
  });

  test('homepage passes basic axe automated accessibility checks', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
      
    // Assert no WCAG 2.2 AA violations
    expect(results.violations).toEqual([]);
  });
});
