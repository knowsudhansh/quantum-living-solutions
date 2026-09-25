# Ownership migration preparation audit

Date: 2026-09-14. Scope: local code only; no remote settings, deployments, DNS, credentials, stores, database contents or Git history changed. Existing dirty worktree changes were preserved. This is an audit of the working tree, not proof of the currently deployed revision.

## Readiness

NOT READY for transfer approval. Account coupling is configuration-based, but existing store access, legacy media, dependency findings and verification gaps require resolution. No runtime/UI/auth/database/animation behavior was changed by this preparation.

## Architecture and repository inventory

Next.js 16.2.10 App Router, React/React DOM 19.2.4, TypeScript 5.9.3 (package range ^5), Prisma/client 6.2.1, Blob SDK 2.6.1. Versions checked against package-lock.json. Lockfile is retained; npm install invokes only local prisma generate, not schema deployment. Next build does not run migrations.

TypeScript: strict, noEmit, bundler resolution, ES2017 target, React JSX, @/* alias, incremental cache. ESLint flat configuration uses Next core-web-vitals and TypeScript; generated Prisma code is excluded. next.config.ts defines local Turbopack root, public Blob image host wildcard, tracing exclusion and security headers; no env injection, project ID or team ID. No vercel.json, Prisma config file, local .vercel/project.json or separate middleware file exists; src/proxy.ts is the Next 16 proxy.

Source inventory: src/app (public pages, admin and API routes), components (cinematic/mobile/navigation/forms), lib (database/security/config/storage/email/utilities), hooks, prisma (schema, three SQL migrations, two seed scripts), public (static assets), tests (unit and Playwright), docs and CI. No repository-level deploy script or account-specific webhook implementation found. TPA/F&B, booking, product, partner, careers and presentation code left unchanged.

## Environment matrix

All entries in .env.example are blank. Never copy credentials into this report.

| Variable | Requirement / environment | Boundary and timing |
|---|---|---|
| DATABASE_URL | Required for database-backed routes in production/preview/local development | Server runtime; schema references it; generation/build can use an isolated placeholder |
| DIRECT_URL | Required for Prisma direct database operations | Server/CLI only; preserve existing database target; no migration commands run |
| NEXTAUTH_SECRET | Required for admin sessions; minimum 32 characters | Server runtime; retain existing value to preserve signatures |
| NEXTAUTH_URL | Required operationally for production canonical origin and absolute email links; local origin in development | Server-rendered metadata, proxy and email; origin intentionally public |
| BLOB_READ_WRITE_TOKEN | Required for production public media upload/cleanup | Server runtime secret; nonproduction media uses local files |
| RESUME_BLOB_STORE_ID | Required if choosing OIDC for private resumes in any environment | Non-secret identifier used on server; wins over resume token |
| RESUME_BLOB_READ_WRITE_TOKEN | Alternative when resume store ID is absent | Server runtime secret for existing private store |
| VERCEL_OIDC_TOKEN | SDK-consumed requirement for store-ID auth | Server-only platform-issued token; short lived, do not migrate a captured token |
| RESEND_API_KEY | Optional to start; required for real email delivery | Server runtime/module initialization; absent value selects mock delivery |
| NEXT_PUBLIC_APP_URL | Optional local/CI Playwright URL | Test runner only; no application browser consumption; intentionally public test origin |
| NODE_ENV | Framework-managed build/runtime | Also browser-visible for rendering/development checks; not a credential |
| CI | Runner-managed test configuration | Test runner only |

No application variable is a mandatory custom browser build-time secret. NEXTAUTH_URL can affect generated metadata at build/render time. Generic SDK/runtime internals (Prisma debug, engine and terminal variables) are not application requirements. BLOB_STORE_ID is not needed: the adapter passes RESUME_BLOB_STORE_ID explicitly and public uploads require a token. BLOB_WEBHOOK_PUBLIC_KEY is unused: no client upload webhook handler is wired. Do not invent or provision either for this code.

Only .env and .env.example are present among the requested environment files; .env.local, .env.development, .env.production and .env.template are absent. .env is ignored and not tracked. No first-party dynamic/destructured environment reads or server credentials in NEXT_PUBLIC variables were found. Database and resume adapters are server-only; email imports the server-only logger. Client components reference NODE_ENV only.

## Secret and Git hygiene audit

Local credential-bearing locations: .env:1, .env:2, .env:3. Values were not printed. No exact copies of these local values were found in other scanned first-party/local text files. Broad credential candidates in unit tests are dummy test inputs; generated Prisma candidates are field names/types, not credentials. Pattern scans are not a guarantee of absence of all secrets.

.gitignore now protects every .env.* variant except the empty .env.example, .vercel, local uploads, generated Prisma client, IDE metadata and debug artifacts, preserving previous rules. Ignoring does not untrack already committed files.

src/generated/client/** is already tracked, including query_engine-windows.dll.node and generated absolute local source paths. postinstall regenerates the client on the target platform, so these paths are not account dependencies. Generated files should eventually be untracked in a separately reviewed change; this task does not alter the index or remove existing artifacts.

Three tracked public/uploads/resumes PDFs were already deleted in the starting working tree. Those deletions and new private-storage files are pre-existing work, not migration-audit changes. PDFs remain in Git history. Review retention/access before handing repository ownership to another party; this audit does not remove or rewrite historical files.

## GitHub dependencies

No runtime dependency on repository owner, origin URL, raw.githubusercontent.com, GitHub Pages, account identifiers or GitHub webhook URL found. .github/workflows/ci.yml uses actions/checkout@v4 and actions/setup-node@v4 on ubuntu-latest, Node 20, npm ci and the existing lint/type/unit/build/E2E scripts. Triggers assume main; concurrency uses github.workflow/github.ref, which are portable. No Actions secret references or deployment credentials are configured. CI was not modified.

## Vercel and Blob dependencies

/api/admin/media POST uses Node runtime. Proxy protects /api/admin paths using signed admin role cookies and origin checks; upload handler itself relies on proxy enforcement. JPEG, PNG and PDF MIME/signature checks, nonempty file validation, randomized names, sanitized original names and a 5 MiB application limit precede upload. Production requires BLOB_READ_WRITE_TOKEN and uses public Blob put; missing token gives 503, never a local-filesystem fallback. Development uses public/uploads. MediaItem is created only after upload; DB failure triggers Blob del/local cleanup. Cleanup failure is logged but has no durable retry. There is no general media deletion endpoint or storage garbage collector; deleting a partner/product does not delete its stored media.

Private resume adapter uses put/get/del with access private, a separate token or store ID/OIDC, in every environment. /api/careers validates multipart requests, 4 MiB limit and file signatures, creates Prisma metadata after upload and cleans up on DB failure. /api/admin/candidates/[id]/resume streams private files after proxy authentication with private/no-store headers. Existing /uploads references redirect to local paths; these require a separate inventory because earlier files are already deleted locally. No production upload path writes the filesystem.

Media URL strings live in database records, not configuration. Preserve existing stores and object URLs; merely supplying a new store/token does not move old objects or update records. Confirm both public media and private resume read/write permissions under the target identity. A configured stale RESUME_BLOB_STORE_ID takes precedence over RESUME_BLOB_READ_WRITE_TOKEN. Missing public token cannot be replaced by BLOB_STORE_ID without changing current behavior.

Existing issue: the 5 MiB media allowance exceeds Vercel's 4.5 MB request-body limit including multipart overhead; upper-size uploads may fail before the route. No API limit or architecture change made. Source: https://vercel.com/docs/vercel-blob/server-upload . OIDC ownership context must be revalidated: https://vercel.com/docs/oidc and https://vercel.com/changelog/vercel-blob-now-supports-oidc-authentication .

Existing issue: src/proxy.ts img-src permits only self/data, while admin product/partner previews use raw img elements pointing to Blob. next.config.ts allows public Blob through Next Image optimization, but does not authorize raw images in CSP. This can block previews on either account; broadening CSP was left outside this behavior-preserving task.

Existing logging risk: src/app/api/admin/media/route.ts describeError places raw stack text in a plain object, bypassing Error-object production redaction in src/lib/utils/logger.ts. Other raw console/error-response strings exist in DB initializer/email code. No actual credential leak was found, but raw third-party diagnostic strings are not proven secret-safe. Address through a focused logging patch with regression tests before treating secret isolation as fully verified.

## Database and authentication

prisma/schema.prisma uses PostgreSQL DATABASE_URL and DIRECT_URL; src/lib/db.ts uses standard Prisma and a development singleton. No provider-specific Neon/Supabase SDK or hardcoded database credentials found in application source. Keep the same database, schema, data and admin users. No reset, db push, migrate deploy, seed or live DB query was performed. Three migration directories are retained unchanged; deployment migration status cannot be inferred from source.

src/lib/partners/initializer.ts performs writes on public page requests; /api/book-demo/slots also creates defaults. This is existing behavior and is why build/browser checks use a loopback-only unavailable database. Source seed scripts intentionally write data and must not be invoked as migration validation.

There is no NextAuth package/configuration, OAuth callback or provider-account binding. Login validates database password hashes/admin role and signs an eight-hour HMAC-SHA256 JWT using NEXTAUTH_SECRET. Cookies are HttpOnly, Secure in production, SameSite=Lax, path /, without a fixed account domain. Proxy verifies signatures/admin role and checks mutation origins against NEXTAUTH_URL/request origin. Logout clears the cookie. Keep the same secret and public origin; no auth behavior change needed.

## Domain and URL classification

The requested production domain stays unchanged. No ownership-migration reason to add another domain variable.

| Location | Classification / decision |
|---|---|
| src/app/layout.tsx:9 | Must remain: existing NEXTAUTH_URL override and canonical fallback |
| src/app/robots.ts:15 | Must remain: canonical production sitemap |
| src/app/sitemap.ts:8 | Must remain: production canonical base |
| src/lib/config/business.ts:9-10 | Must remain: business email identities, including Resend sender |
| src/app/careers/page.tsx:84-85 | Must remain: careers email contact |
| src/lib/config/founder.ts:39 | Must remain: founder business contact |
| prisma/seed-products.mjs:220 | Must remain: domain-named demo PDF URL in manual seed data; script not run |
| docs/20-seo-content-strategy.md:10,18 | Documentation only |
| .env.example | Old value removed; variable is now empty |
| playwright.config.ts:11,25 and .github/workflows/ci.yml:41 | Development/CI localhost only |
| tests/unit/** request URLs | Test-only localhost/example URLs |
| src/app/api/admin/auth/login/route.ts:79 | Loopback fallback for audit IP, not deployment destination |

Other external URLs are business/social/Google Maps/partner links, Resend API, schema.org/SVG namespaces and dependency registry/funding metadata. No hardcoded deployment URL, Vercel account ID or storage-instance hostname found in first-party runtime code.

## Changes made by this audit

- .env.example: blank assignments, variable requirements and security/environment explanations; added existing test and SDK OIDC inputs.
- .gitignore: appended missing safe ignore rules; kept useful existing rules.
- docs/26-ownership-migration-audit.md: evidence, inventory, limitations and next-step checklist.
- task.md and walkthrough.md: audit completion and validation evidence, separate from earlier work.
- npm install may regenerate tracked Prisma artifacts and lockfile metadata; review generated differences separately from pre-existing dependency edits.

## Pre-transfer checklist

- [x] Audit source/configuration and environment names without printing credentials.
- [x] Preserve runtime behavior and existing worktree changes.
- [x] Protect local configuration and provide blank environment template.
- [ ] Verify a reviewed, reproducible revision including pre-existing storage changes.
- [ ] Establish continued access to existing public/private Blob objects under target identity; inspect legacy local URLs without changing data.
- [ ] Privately verify target environment completeness, unchanged database target, auth secret/origin and email sender access.
- [ ] Resolve/review dependency security findings and existing upload/CSP/logging gaps.
- [ ] Obtain passing required browser/accessibility/fallback evidence in an isolated environment.

Next safest step: review this local report and combined working-tree diff before authorizing any migration action.

## API route inventory

- `src/app/api/admin/auth/login/route.ts`
- `src/app/api/admin/auth/logout/route.ts`
- `src/app/api/admin/bookings/route.ts`
- `src/app/api/admin/brands/route.ts`
- `src/app/api/admin/candidates/[id]/resume/route.ts`
- `src/app/api/admin/candidates/[id]/route.ts`
- `src/app/api/admin/candidates/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/demo-bookings/route.ts`
- `src/app/api/admin/leads/route.ts`
- `src/app/api/admin/media/route.ts`
- `src/app/api/admin/newsletter/route.ts`
- `src/app/api/admin/partners/[id]/route.ts`
- `src/app/api/admin/partners/route.ts`
- `src/app/api/admin/partners/seed/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/spec-templates/route.ts`
- `src/app/api/admin/technologies/route.ts`
- `src/app/api/book-demo/route.ts`
- `src/app/api/book-demo/slots/route.ts`
- `src/app/api/careers/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/newsletter/route.ts`
- `src/app/api/partners/route.ts`
- `src/app/api/products/featured/route.ts`

## Additional scan evidence

Scanned 230 first-party/local files (excluding dependency installs, build output and Git object directory), and 376 reachable historical Git blobs. Historical credential-URL matches were confined to generic dummy database examples in earlier .env.example versions, not live credentials. No confirmed tracked secret was found. Binary historical PDFs were not text-extracted or OCR-scanned, and unreachable/deleted Git objects and external provider settings are outside this evidence.

npm audit reported 12 affected packages: 5 moderate, 6 high, 1 critical. The direct Next.js dependency is marked critical; Vitest is marked moderate. Other findings: @vitest/mocker, baseline-browser-mapping, brace-expansion, browserslist, fflate, js-yaml, nanoid, postcss, sharp, undici. Applicability to deployed routes needs assessment; no automated dependency upgrades or npm audit fix were run. Preserve this as a release-review blocker, not an assertion of demonstrated exploitation.

Additional local-only credential candidate: generate-password.ts:3 (ignored password-generation helper). Its literal was not displayed or verified against any live account. Do not include this helper in a handover archive. No confirmed credentials were found in tracked source. Ignore checks passed for environment variants, Vercel linkage, uploads, IDE metadata, coverage and logs; .env.example remains unignored.

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
