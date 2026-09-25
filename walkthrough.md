# Implementation Walkthrough

## 2026-08-21 — Production Career Résumé Upload Repair

### Result

- Replaced runtime writes to `public/uploads/resumes` with a dedicated private Vercel Blob adapter.
- Kept Neon PostgreSQL as the system of record for applicant metadata and the private Blob reference.
- Added authenticated admin streaming for résumé preview and download.
- Added pre-upload validation, storage cleanup after database failures, request IDs, and operation-aware error logs.
- Rejected URL-only JSON submissions so callers cannot inject arbitrary résumé links.
- Removed three résumé PDFs from the public working tree and ignored that directory going forward.

### Verification output

```text
npx vitest run tests/unit/resume-storage.test.ts tests/unit/careers-api.test.ts tests/unit/admin-resume-api.test.ts
Test Files  3 passed (3)
Tests       10 passed (10)
```

```text
npm run typecheck
Exit code: 0
```

```text
npm run lint
Exit code: 0
```

```text
npm run build
Compiled successfully
TypeScript finished
Static pages generated: 10/10
Exit code: 0
```

```text
Read-only Neon verification
career_applications query succeeded; rows=2
career resume metadata columns query succeeded
```

```text
Secret-pattern scan
No matching credentials found
```

### Deployment dependency

Create and connect a dedicated private Vercel Blob store so Vercel supplies `RESUME_BLOB_STORE_ID` and OIDC authentication, then redeploy. A legacy `RESUME_BLOB_READ_WRITE_TOKEN` connection is also supported. The API intentionally returns HTTP 503 until private storage is configured.


## 2026-09-14 ? Ownership migration code preparation

Preserved pre-existing working-tree changes. Updated only .env.example, .gitignore, docs/26-ownership-migration-audit.md, task.md and this walkthrough. npm install regenerated Prisma locally without additional tracked generated-client or lockfile changes beyond the starting dependency diff. No runtime code, remote, deployment, domain, database data or secrets changed.

Validation used an unreachable loopback database and placeholder session configuration; no production data access. Existing integration tests write records and cannot safely be pointed at production.

```text
npm install: exit 0; Prisma Client generated; 12 audit findings (5 moderate, 6 high, 1 critical).
Install warnings: six dependency lifecycle scripts lack npm allowScripts decisions.
npm run lint: exit 0; no diagnostics.
npm run typecheck: exit 0; no diagnostics.
npm run build: exit 0; compiled successfully; 10/10 static pages; no build warnings.
npm run test:unit: exit 1; 48 passed, 10 failed; 9 files passed, 3 failed.
Failures are in database-dependent api.test.ts, admin_api.test.ts and security_db.test.ts with the deliberately unreachable database.
Secret scan: no confirmed tracked credentials; local-only locations recorded without values in audit report.
Reachable history: 376 blobs checked; credential URL candidates were generic examples.
```

No new runtime utility functions were introduced, so new-utility coverage is not applicable. This is not a certification of full WCAG 2.2 AA, production LCP/bundle budgets or live storage/DB connectivity. Those remain existing release requirements.

Build artifact scan: 4,238 files checked for exact local credential values. No matches in the newly produced production artifacts. Four matches were found in pre-existing ignored development cache files:
- .next/dev/cache/turbopack/v16.2.10/00005505.sst
- .next/dev/cache/turbopack/v16.2.10/00005519.sst
- .next/dev/cache/turbopack/v16.2.10/00005563.sst
- .next/dev/cache/turbopack/v16.2.10/00005570.sst

These caches are not tracked and are not production browser bundles. They were preserved. Handover must use reviewed Git source, not a full working-directory archive containing .env, local password helpers or .next caches.

## Final validation results

| Command | Result |
|---|---|
| npm install | PASS; dependency audit/lifecycle warnings documented above |
| npm run lint | PASS, exit 0 |
| npm run typecheck | PASS, exit 0 |
| npm run build | PASS, exit 0, no build warnings |
| npm run test:unit | 48 passed / 10 failed; database-dependent cases blocked by isolated configuration |
| npm run test:e2e -- --grep 'prefers-reduced-motion\|WEBGL_UNAVAILABLE' --retries=0 | BLOCKED, exit 1: webServer readiness timed out after 120000ms; homepage depends on unavailable database; browser assertions did not execute |
| git diff --check | PASS (Git emitted line-ending notices for pre-existing files) |

No full browser/accessibility or production performance certification is claimed. No new utility code was introduced. The task remains NOT READY for transfer approval; source-only documentation/hygiene preparation is complete.


## 2026-09-25 - Google Analytics 4 (gtag.js) integration

### Result

GA4 is integrated through `next/script` with `strategy="afterInteractive"`, gated on
`NEXT_PUBLIC_GA_MEASUREMENT_ID`, restricted to public routes, and verified end to end in a real
Chromium browser against a production build. No Google Tag Manager. No manual `page_view`.

Files: `src/components/GoogleAnalytics.tsx` (new), `src/lib/config/analytics.ts` (new),
`src/app/layout.tsx`, `src/proxy.ts`, `.env.example`, `tests/unit/analytics-csp.test.ts` (new),
`tests/e2e/analytics.test.ts` (new).

Two defects were found by browser verification and fixed; both produced a silently dead tag:

1. The inline configuration snippet was refused by the strict production CSP. Next.js applies the
   nonce to scripts it renders on the server, but `afterInteractive` tags are injected after
   hydration and receive none. Fixed by reading the proxy's `x-nonce` header in the root layout and
   passing it to both `<Script>` components, which matches the current Next.js CSP guidance.
2. The `page_view` beacon was refused. GA4 collects on the apex host `analytics.google.com`, and a
   `*.` source never matches an apex label. Fixed by listing the apex host alongside the wildcard.

Google Signals and ad personalisation are disabled at the tag, so the advertising beacons are never
attempted and no advertising domain enters the CSP.

### Verification output

```
npm run lint                         exit 0, clean
npm run typecheck                    exit 0, clean
npm run build (GA configured)        exit 0, compiled successfully in 68s, no warnings
npm run build (GA absent)            exit 0, compiled successfully in 41s, no warnings
npm run test:unit                    16 files passed, 81 tests passed, 0 failed

Playwright, production build, GA configured, tests/e2e/analytics.test.ts:
  ok 1 loads exactly one nonced Google tag and initialises gtag (5.4s)
  ok 2 dispatches a page_view carrying no identifying parameters (1.5s)
  ok 3 records client-side navigation without duplicating tags or page views (14.9s)
  ok 4 exposes Google origins in the CSP only on public routes (2.0s)
  ok 5 never measures the admin area (1.8s)
  ok 6 matches the configured state on public pages (899ms)
  6 passed (54.8s)
```

Collection beacons are intercepted and answered locally by the suite, so test traffic never reaches
the live Analytics property. Interception happens after the browser applies the CSP, so a beacon the
policy refuses never reaches the handler; that is how regression 2 above is caught.

Observed CSP header on a public route with GA configured:

```
script-src  'self' 'nonce-<per-request>' https://www.googletagmanager.com
connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com
            https://analytics.google.com https://*.analytics.google.com
img-src     'self' data: https://*.public.blob.vercel-storage.com
            https://www.googletagmanager.com https://*.google-analytics.com
```

On `/admin/*` and `/api/*`, and in any build without a Measurement ID, the policy is byte-identical
to the pre-integration policy. Verified by curl and by unit test.

Secret scan: `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_APP_URL` are the only `NEXT_PUBLIC_`
variables in `src/`, both intentionally public. No Google credential added. The Measurement ID is
not hardcoded anywhere in `src/`. Only `.env.example` is tracked; no real `.env` is in Git.

### Pre-existing failures, not caused by this change

The full Playwright suite reports 14 failures. The identical 14 fail in a build with Google
Analytics entirely absent, which isolates them from this work:

```
GA configured:  18 passed, 14 failed
GA absent:      14 passed,  4 skipped, 14 failed   (same 14)
```

- 8 in `tests/e2e/cinematic.test.ts` target `[data-render-state]`, rendered by
  `components/cinematic/structural-canvas.tsx`. The homepage now renders
  `components/home/cinematic-home-experience`, so these assert against a superseded component and
  the current homepage is effectively uncovered.
- 4 axe checks report WCAG 2.2 AA colour-contrast violations (`wcag143`) on the homepage, solutions
  and legal routes.
- 2 route/footer checks in `tests/e2e/sitemap.test.ts` and `tests/e2e/solutions-legal.test.ts`.

`cinematic.test.ts` also asserts the CSP contains no `'unsafe-inline'`, which the pre-existing
`style-src` has always carried for Framer Motion runtime transforms.

### Outstanding

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` must be set in the Vercel dashboard and the project redeployed;
  the value is inlined at build time. Not performed here.
- No cookie consent, consent manager or Google Consent Mode exists on the site. Analytics cookies
  are set on first paint with no opt-in. DPDP Act 2023 and GDPR/ePrivacy exposure needs legal review
  before broad rollout. No compliance claim is made.
- `www.google.<tld>/ads/ga-audiences` stays CSP-blocked by design and logs one console refusal per
  page load. Clear it in GA4 Admin by unlinking Google Ads / disabling Google signals.
- SPA page views depend on GA4 Enhanced Measurement "Page changes based on browser history events"
  remaining enabled in the property.
