'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GA_MEASUREMENT_ID, isAnalyticsRoute } from '../lib/config/analytics';

/**
 * Google tag (gtag.js) for GA4.
 *
 * The `nonce` comes from the per-request `x-nonce` header the proxy issues. Next.js only
 * nonces scripts it renders on the server; `afterInteractive` tags are injected into the DOM
 * after hydration, so under the strict production CSP the inline configuration snippet is
 * blocked unless the nonce is threaded through explicitly.
 *
 * Isolated from the cinematic homepage on purpose: it registers no scroll, resize, touch,
 * rAF or GSAP callbacks and never runs inside an animation timeline. The stable Script ids
 * let Next.js de-duplicate insertion across re-renders and client-side navigations, and
 * `afterInteractive` keeps the tag off the critical render path.
 *
 * Google Signals and ad personalization are switched off. That keeps collection to standard
 * page/site measurement with no cross-device or advertising identity, and it stops the
 * doubleclick/ga-audiences beacons that the CSP would otherwise have to allowlist.
 *
 * Page views are left to the standard configuration: `gtag('config', ...)` sends the first
 * one, and GA4 enhanced measurement picks up subsequent History API navigations. No manual
 * page_view is emitted here, which would double-count every route change.
 */
export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  const pathname = usePathname();

  if (!GA_MEASUREMENT_ID || !isAnalyticsRoute(pathname)) {
    return null;
  }

  return (
    <>
      <Script
        id="ga-gtag-js"
        nonce={nonce}
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`}
      />
      <Script id="ga-gtag-init" nonce={nonce} strategy="afterInteractive">
        {[
          'window.dataLayer = window.dataLayer || [];',
          'function gtag(){dataLayer.push(arguments);}',
          "gtag('js', new Date());",
          `gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)}, {`,
          "  allow_google_signals: false,",
          "  allow_ad_personalization_signals: false",
          '});',
        ].join('\n')}
      </Script>
    </>
  );
}
