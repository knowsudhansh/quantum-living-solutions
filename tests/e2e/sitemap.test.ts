import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Stage 3A Navigation & Sitemap E2E checks', () => {
  const routes = [
    { path: '/solutions', title: 'Automation Solutions' },
    { path: '/about', title: 'Our Philosophy' },
    { path: '/projects', title: 'Featured Projects' },
    { path: '/experience', title: 'Interactive Experience' },
    { path: '/book-demo', title: 'Book an Experience' },
    { path: '/contact', title: 'Contact' },
    { path: '/careers', title: 'Careers' },
  ];

  test('every Stage 3A route returns 200 and renders the correct title', async ({ page }) => {
    for (const r of routes) {
      const response = await page.goto(r.path);
      expect(response?.status()).toBe(200);
      
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(r.title);
    }
  });

  test('desktop navigation links contain correct paths and reflect active state', async ({ page }) => {
    await page.goto('/about');
    
    // Check main navigation links exist
    const nav = page.locator('nav[aria-label="Main Navigation"]');
    await expect(nav).toBeVisible();

    const solutionsLink = nav.locator('a[href="/solutions"]');
    await expect(solutionsLink).toBeVisible();

    const activeLink = nav.locator('a[href="/about"]');
    await expect(activeLink).toBeVisible();
    
    // Active link has specific styling class (active classes include text-[HSL(40,30%,95%)] and border-b border-[HSL(35,30%,45%)])
    const activeClass = await activeLink.getAttribute('class');
    expect(activeClass).toContain('text-[HSL(40,30%,95%)]');
  });

  test('skip-link is focusable and targets main content element', async ({ page }) => {
    await page.goto('/solutions');
    
    // Press Tab once to focus skip-link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();

    // Verify it targets main element
    const mainElement = page.locator('main#main-content');
    await expect(mainElement).toBeVisible();
  });

  test('footer contains only valid Stage 3A links and correct copyright year', async ({ page }) => {
    await page.goto('/solutions');
    
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    const sitemapLinks = footer.locator('a');
    const count = await sitemapLinks.count();
    
    // Assert all links point to the valid sitemap links (not empty legal pages or unapproved external URLs)
    const allowedHrefs = [
      '/solutions',
      '/experience',
      '/projects',
      '/about',
      '/book-demo',
      '/contact',
      '/careers'
    ];

    for (let i = 0; i < count; i++) {
      const href = await sitemapLinks.nth(i).getAttribute('href');
      expect(allowedHrefs).toContain(href);
    }

    const currentYear = new Date().getFullYear().toString();
    await expect(footer).toContainText(currentYear);
  });

  test('mobile hamburger menu toggle, focus trap, and Escape key functionality', async ({ page }) => {
    // Set mobile viewport width
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/about');

    const trigger = page.locator('button[aria-label="Toggle menu"]');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // 1. Open mobile menu drawer
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const drawer = page.locator('#mobile-menu');
    await expect(drawer).toBeVisible();

    // 2. Focus moves into the first link inside menu automatically
    const firstMenuLink = drawer.locator('a').first();
    await expect(firstMenuLink).toBeFocused();

    // 3. Tab focus remains trapped inside drawer
    // Press Tab continuously and assert focus stays trapped within the drawer link elements
    // Solutions -> Experience -> Projects -> About -> Book Demo -> Contact -> Careers -> back to Solutions
    const linksCount = await drawer.locator('a').count();
    for (let i = 0; i < linksCount; i++) {
      await page.keyboard.press('Tab');
    }
    // Still focused on one of the drawer elements
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBe('A');

    // 4. Pressing Escape closes mobile menu and restores focus to trigger button
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('representative pages pass basic Axe accessibility validation', async ({ page }) => {
    await page.goto('/solutions');
    const accessibilityResultsDesktop = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityResultsDesktop.violations).toEqual([]);

    // Audit mobile drawer state
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/solutions');
    const trigger = page.locator('button[aria-label="Toggle menu"]');
    await trigger.click();
    
    const accessibilityResultsMobile = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(accessibilityResultsMobile.violations).toEqual([]);
  });
});
