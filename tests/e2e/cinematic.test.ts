import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Cinematic Canvas & Fallback E2E checks', () => {
  test('should render exactly one WebGL canvas in standard rendering mode', async ({ page }) => {
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (
        msg.type() === 'error' &&
        !text.includes('favicon.ico') &&
        !text.includes('Failed to load resource:')
      ) {
        consoleLogs.push(text);
      }
    });

    page.on('pageerror', (err) => {
      console.log(`[BROWSER UNCAUGHT EXCEPTION] ${err.message}`);
    });

    // Relative path navigation utilizing Playwright baseURL configuration
    await page.goto('/');

    // Wait for the container to render
    const container = page.locator('[data-render-state]');
    await expect(container).toBeVisible();

    // Verify exactly one canvas is present inside the container
    const canvasCount = await container.locator('canvas').count();
    expect(canvasCount).toBe(1);

    // Verify it loads with the standard high quality tier by default
    const quality = await container.getAttribute('data-quality-tier');
    expect(quality).toBe('high');

    // Run basic Axe accessibility checks on the cinematic UI state matching Phase 1 filters
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('canvas') // Exclude canvas element itself as it contains non-DOM graphics
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
    expect(consoleLogs).toEqual([]);
  });

  test('should support mount, unmount, and remount lifecycle safely without duplication', async ({ page }) => {
    // 1. Mount the home page
    await page.goto('/');
    const container1 = page.locator('[data-render-state]');
    await expect(container1).toBeVisible();
    expect(await container1.locator('canvas').count()).toBe(1);

    // 2. Unmount by navigating away
    await page.goto('/api/health');
    await expect(page.locator('body')).not.toContainText('Act 8');

    // 3. Remount by going back
    await page.goBack();
    const container2 = page.locator('[data-render-state]');
    await expect(container2).toBeVisible();
    expect(await container2.locator('canvas').count()).toBe(1);
  });

  test('should fallback to blueprint when prefers-reduced-motion reduce emulation is enabled in browser context', async ({ page }) => {
    // Force prefers-reduced-motion media emulation
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const container = page.locator('[data-testid="blueprint-fallback"]');
    await expect(container).toBeVisible();

    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBe(0);

    // Check that fallback screen is fully keyboard/axe-accessible matching Phase 1 filters
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should fallback to blueprint when WEBGL_UNAVAILABLE state is active via mocked context', async ({ page }) => {
    // Inject browser mock for unavailable WebGL context
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = function (type: string) {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return null;
        }
        return null;
      };
    });

    await page.goto('/');

    const container = page.locator('[data-testid="blueprint-fallback"]');
    await expect(container).toBeVisible();

    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBe(0);
  });

  test('should fallback to blueprint when LOW_BATTERY state is active via mocked getBattery', async ({ page }) => {
    // Inject browser mock for low discharging battery
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'getBattery', {
        value: () =>
          Promise.resolve({
            charging: false,
            level: 0.15,
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
        configurable: true,
      });
    });

    await page.goto('/');

    const container = page.locator('[data-testid="blueprint-fallback"]');
    await expect(container).toBeVisible();

    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBe(0);
  });

  test('should enforce strict CSP headers and verify Next.js nonce propagation', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response!.headers();
    const csp = headers['content-security-policy'];

    // 1. Assert strict CSP rules are in response headers
    expect(csp).not.toBeUndefined();
    expect(csp).toContain('nonce-');
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");

    // 2. Extract CSP nonce value
    const match = csp.match(/'nonce-([^']+)'/);
    const cspNonce = match ? match[1] : null;
    expect(cspNonce).not.toBeNull();

    // 3. Confirm that at least one Next.js framework script has this nonce
    const scriptNonce = await page.evaluate((expectedNonce) => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const nonceScript = scripts.find((s) => s.nonce === expectedNonce);
      return nonceScript ? nonceScript.nonce : null;
    }, cspNonce);
    expect(scriptNonce).toBe(cspNonce);

    // 4. Verify that nonces are unique per request
    const response2 = await page.goto('/');
    const csp2 = response2!.headers()['content-security-policy'];
    const nonce2 = csp2.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce2).not.toBeNull();
    expect(cspNonce).not.toEqual(nonce2);
  });
});
