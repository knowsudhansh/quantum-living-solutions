import { test, expect, type Page } from '@playwright/test';

/**
 * Google Analytics 4 (gtag.js) integration checks.
 *
 * The Measurement ID is inlined at build time, so these assertions describe the build under
 * test: run `npm run build` with NEXT_PUBLIC_GA_MEASUREMENT_ID set to exercise the enabled
 * path, or without it to confirm the integration disappears completely.
 *
 * Collection beacons are intercepted and answered locally so the suite never writes test
 * traffic into the real Analytics property. Interception happens after the browser applies
 * the Content Security Policy, so a beacon the CSP refuses never reaches the handler - which
 * is precisely the regression these tests exist to catch.
 */

/** The globals the Google tag installs; not declared by the app, which only emits them as script text. */
type GaWindow = Window & { dataLayer?: unknown[]; gtag?: unknown };

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
const gaConfigured = /^G-[A-Z0-9]+$/i.test(MEASUREMENT_ID);

const isCollectEndpoint = (url: URL) =>
  /(^|\.)(google-analytics\.com|analytics\.google\.com)$/.test(url.hostname) &&
  url.pathname.includes('collect');

async function captureBeacons(page: Page) {
  const beacons: URL[] = [];
  await page.route(
    (url) => isCollectEndpoint(url),
    async (route) => {
      beacons.push(new URL(route.request().url()));
      await route.fulfill({ status: 204, body: '' });
    },
  );
  return beacons;
}

/**
 * Records CSP refusals structurally, so the blocked URL is matched rather than the policy
 * text quoted back inside the console message.
 *
 * Only measurement hosts are asserted on. The advertising beacons (stats.g.doubleclick.net
 * and google.<tld>/ads/ga-audiences) are blocked on purpose: the tag disables Google Signals
 * and ad personalisation, and allowlisting them would mean wildcarding Google's country
 * domains and re-admitting advertising identity traffic.
 */
const MEASUREMENT_HOSTS = /^(.*\.)?(googletagmanager\.com|google-analytics\.com|analytics\.google\.com)$/;

async function captureCspViolations(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as unknown as { __csp: string[] }).__csp.push(event.blockedURI);
    });
  });
  return async () => {
    const blocked = await page.evaluate(
      () => (window as unknown as { __csp?: string[] }).__csp ?? [],
    );
    return blocked.filter((uri) => {
      try {
        return MEASUREMENT_HOSTS.test(new URL(uri).hostname);
      } catch {
        return false;
      }
    });
  };
}

const countTags = (page: Page) =>
  page.evaluate(() => ({
    external: document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').length,
    inline: [...document.querySelectorAll('script')].filter((s) =>
      (s.textContent ?? '').includes("gtag('config'"),
    ).length,
  }));

const pageViews = (beacons: URL[]) =>
  beacons.filter((b) => b.searchParams.get('en') === 'page_view');

test.describe('Google Analytics 4', () => {
  test.describe('with a Measurement ID configured', () => {
    test.skip(!gaConfigured, 'Build under test has no NEXT_PUBLIC_GA_MEASUREMENT_ID.');

    test('loads exactly one nonced Google tag and initialises gtag', async ({ page }) => {
      const measurementCspViolations = await captureCspViolations(page);
      await captureBeacons(page);
      await page.goto('/');

      await expect
        .poll(() => page.evaluate(() => typeof (window as GaWindow).gtag), {
          timeout: 15_000,
          message: 'gtag never became callable - the inline snippet was likely CSP-blocked',
        })
        .toBe('function');

      expect(await countTags(page)).toEqual({ external: 1, inline: 1 });

      // Both injected tags must carry the per-request nonce issued by the proxy.
      const nonced = await page.evaluate(() =>
        ['ga-gtag-js', 'ga-gtag-init'].map((id) =>
          (document.getElementById(id)?.getAttributeNames() ?? []).includes('nonce'),
        ),
      );
      expect(nonced).toEqual([true, true]);
      expect(await page.evaluate(() => Array.isArray((window as GaWindow).dataLayer))).toBe(true);
      expect(await measurementCspViolations()).toEqual([]);
    });

    test('dispatches a page_view carrying no identifying parameters', async ({ page }) => {
      const beacons = await captureBeacons(page);
      await page.goto('/');

      await expect
        .poll(() => pageViews(beacons).length, {
          timeout: 20_000,
          message: 'No page_view beacon reached the network - check the CSP connect-src hosts',
        })
        .toBeGreaterThan(0);

      const pageView = pageViews(beacons)[0];
      expect(pageView.searchParams.get('tid')).toBe(MEASUREMENT_ID);

      // Requirement: standard site measurement only, never user identification.
      for (const forbidden of ['uid', 'up.email', 'up.user_id', 'upn.user_id']) {
        expect(pageView.searchParams.get(forbidden)).toBeNull();
      }
      const query = pageView.search.toLowerCase();
      for (const marker of ['@', 'email', 'resume', 'candidate', 'password']) {
        expect(query).not.toContain(marker);
      }
      // Ad personalisation is disabled at the tag, so the beacon declares non-personalised.
      expect(pageView.searchParams.get('npa')).toBe('1');
    });

    test('records client-side navigation without duplicating tags or page views', async ({
      page,
    }) => {
      // The cinematic homepage loads WebGL, video and GSAP timelines; allow it to settle
      // before driving the header, otherwise the click waits on element stability.
      test.setTimeout(90_000);
      const beacons = await captureBeacons(page);
      await page.goto('/');
      await expect.poll(() => pageViews(beacons).length, { timeout: 20_000 }).toBe(1);
      await page.waitForLoadState('networkidle').catch(() => {});

      await page.locator('header a[href="/solutions"]').first().click({ timeout: 20_000 });
      await page.waitForURL('**/solutions', { timeout: 20_000 });

      await expect
        .poll(() => pageViews(beacons).length, {
          timeout: 20_000,
          message: 'SPA navigation produced no page_view - GA4 enhanced measurement may be off',
        })
        .toBe(2);

      const paths = pageViews(beacons).map((b) => new URL(b.searchParams.get('dl')!).pathname);
      expect(paths).toEqual(['/', '/solutions']);

      // The tag is inserted once for the lifetime of the SPA session.
      expect(await countTags(page)).toEqual({ external: 1, inline: 1 });
    });

    test('exposes Google origins in the CSP only on public routes', async ({ page }) => {
      const publicCsp = (await page.goto('/'))!.headers()['content-security-policy'];
      expect(publicCsp).toContain('https://www.googletagmanager.com');
      expect(publicCsp).toContain('https://analytics.google.com');
      expect(publicCsp).not.toContain('doubleclick');
      expect(publicCsp).not.toContain('unsafe-eval');

      const adminCsp = (await page.goto('/admin/login'))!.headers()['content-security-policy'];
      expect(adminCsp).not.toContain('googletagmanager');
      expect(adminCsp).not.toContain('google-analytics');
    });
  });

  test('never measures the admin area', async ({ page }) => {
    const beacons = await captureBeacons(page);
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    expect(
      await page.evaluate(() => ({
        tags: document.querySelectorAll('script[src*="googletagmanager"]').length,
        preloads: document.querySelectorAll('link[href*="googletagmanager"]').length,
        dataLayer: typeof (window as GaWindow).dataLayer,
        gtag: typeof (window as GaWindow).gtag,
      })),
    ).toEqual({ tags: 0, preloads: 0, dataLayer: 'undefined', gtag: 'undefined' });
    expect(beacons).toEqual([]);
  });

  test('matches the configured state on public pages', async ({ page }) => {
    const response = await page.goto('/');
    const html = await response!.text();
    expect(html.includes('googletagmanager.com/gtag/js')).toBe(gaConfigured);
  });
});
