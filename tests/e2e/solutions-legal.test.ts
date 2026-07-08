import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Stage 3B Solutions & Legal Routes E2E checks', () => {
  const solutionSlugs = [
    'residential-automation',
    'commercial-automation',
    'lighting-automation',
    'curtains-and-blinds',
    'climate-control',
    'security-and-surveillance',
    'audio-video-entertainment',
    'energy-management'
  ];

  const legalSlugs = [
    'privacy-policy',
    'terms-of-service',
    'refund-policy',
    'payment-disclaimer'
  ];

  test('solutions hub page lists all categories with working links', async ({ page }) => {
    await page.goto('/solutions');
    
    // Check main navigation links exist
    const container = page.locator('main#main-content');
    await expect(container).toBeVisible();

    for (const slug of solutionSlugs) {
      const link = container.locator(`a[href="/solutions/${slug}"]`).first();
      await expect(link).toBeVisible();
    }
  });

  test('every solution detail route loads successfully and displays structured sections', async ({ page }) => {
    for (const slug of solutionSlugs) {
      await page.goto(`/solutions/${slug}`);
      
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      const overviewHeader = page.locator('h2', { hasText: 'Overview' });
      await expect(overviewHeader).toBeVisible();
      
      const capabilitiesHeader = page.locator('h2', { hasText: 'System Capabilities' });
      await expect(capabilitiesHeader).toBeVisible();

      const integrationHeader = page.locator('h2', { hasText: 'Integration Notes' });
      await expect(integrationHeader).toBeVisible();
    }
  });

  test('every legal route loads successfully and displays AAA text layouts', async ({ page }) => {
    for (const slug of legalSlugs) {
      await page.goto(`/legal/${slug}`);
      
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // AAA layouts should be readable in the default viewport
      const article = page.locator('article');
      await expect(article).toBeVisible();
    }
  });

  test('invalid solution and legal slugs return 404 not found status codes', async ({ page }) => {
    // Playwright page.goto throws or returns status 404
    const solResponse = await page.goto('/solutions/non-existent-solution-slug');
    expect(solResponse?.status()).toBe(404);

    const legalResponse = await page.goto('/legal/non-existent-legal-slug');
    expect(legalResponse?.status()).toBe(404);
  });

  test('footer legal links navigate correctly to valid legal routes', async ({ page }) => {
    await page.goto('/solutions');
    
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    for (const slug of legalSlugs) {
      const link = footer.locator(`a[href="/legal/${slug}"]`);
      await expect(link).toBeVisible();
      
      // Click link and assert title updates correctly
      await link.click();
      await expect(page).toHaveURL(`/legal/${slug}`);
      
      // Go back to restore context
      await page.goto('/solutions');
    }
  });

  test('representative solutions and legal pages pass Axe automated accessibility checks', async ({ page }) => {
    await page.goto('/solutions/residential-automation');
    const accessibilityResultsSolution = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityResultsSolution.violations).toEqual([]);

    await page.goto('/legal/privacy-policy');
    const accessibilityResultsLegal = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityResultsLegal.violations).toEqual([]);
  });
});
