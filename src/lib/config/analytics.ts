/**
 * Google Analytics 4 (gtag.js) configuration.
 *
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is inlined into the client bundle and is visible in page
 * source. That is expected: a GA4 Measurement ID is a public property identifier, not a
 * credential. No other Google value belongs in a NEXT_PUBLIC_ variable.
 *
 * Shared by the client component that renders the tag and by the proxy that widens the
 * Content-Security-Policy, so the allowlist and the script can never drift apart.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

/** Measurement is limited to the public marketing site; admin and API traffic stay untracked. */
export function isAnalyticsRoute(pathname: string): boolean {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api");
}

/** True only when a Measurement ID is configured and the route is publicly measurable. */
export function isAnalyticsEnabledFor(pathname: string): boolean {
  return GA_MEASUREMENT_ID !== "" && isAnalyticsRoute(pathname);
}

/**
 * Origins gtag.js loads from, and the measurement endpoints it beacons to.
 *
 * Both the apex hosts and their wildcards are listed: GA4 picks a regional collector at
 * runtime (region1.google-analytics.com and similar), and `*.` never matches an apex label,
 * so analytics.google.com would otherwise be refused and the page_view lost.
 *
 * Advertising endpoints (stats.g.doubleclick.net, google.<tld>/ads/ga-audiences,
 * www.google.com/g/collect) are deliberately absent. The tag disables Google Signals and ad
 * personalization instead, so those beacons are never attempted.
 */
export const GA_TAG_ORIGIN = "https://www.googletagmanager.com";
export const GA_COLLECT_ORIGINS =
  "https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com";
