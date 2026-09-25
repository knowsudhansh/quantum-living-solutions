# Ownership migration Phase 2: code remediation

Date: 2026-09-14. Status: NOT READY for GitHub transfer approval while isolated database/browser validation and handover review remain outstanding.

## Scope and safety

Read the Phase 1 audit, task and walkthrough and reviewed tracked/untracked working-tree changes before editing. All legitimate starting changes are preserved. No GitHub/Vercel settings, DNS, domain, store, database contents, admin credentials or secrets were changed. No push, seed, migration, reset, history rewrite, upload deletion or remote transfer was performed. Tests use a deliberately unavailable loopback database; mocked tests cannot reach stores or send email.

## Dependency decision

Before: npm audit reported 12 affected packages (5 moderate, 6 high, 1 critical). After targeted upgrades: zero reported vulnerabilities. Exact advisory IDs and affected ranges are listed below. Audit counts affected packages, not unique advisories; transitive findings can overlap.

Selected Next.js 16.3.5 (same major, current patched npm recommendation) and matching eslint-config-next. Next 16.3.3 fixes the critical Next advisories; 16.3.5 includes patched PostCSS 8.5.23 and Sharp ^0.35.4 without overrides. Its Node >=20.9 and React ^19 peers accept the installed Node 24.19.0 and React/React DOM 19.2.4; CI Node 20 remains within Next's supported range. No major migration or codemod required. Vitest 4.1.11 patches its mocker advisory. Updated only named vulnerable transitive package families within parent constraints; framework/test-tool dependencies resolved along with their parents. No npm audit fix --force or blanket major upgrades.

React, React DOM, Prisma, @prisma/client, GSAP, Three.js, @react-three/fiber, @react-three/drei and @vercel/blob were explicitly reviewed and retained. No audit entries directly target these installed packages. Their fflate/undici transitive issues were patched separately. next-auth is absent; authentication is custom Web Crypto and Node password hashing. Absence of an npm advisory is not proof of complete security.

Primary references:
- https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36
- https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4
- https://github.com/vercel/next.js/security/advisories/GHSA-6gpp-xcg3-4w24
- https://nextjs.org/docs/app/guides/upgrading/version-16

### Security package versions

| Package | Before | After | Reason |
|---|---|---|---|
| @vitest/mocker | 4.1.10 | 4.1.11 | moderate advisory remediation |
| baseline-browser-mapping | 2.10.42 | 2.11.23 | moderate advisory remediation |
| brace-expansion | 1.1.15, 5.0.7 | 1.1.18, 5.0.9 | high advisory remediation |
| browserslist | 4.28.5 | 4.28.9 | high advisory remediation |
| fflate | 0.6.10, 0.8.3 | 0.6.11, 0.8.3 | moderate advisory remediation |
| js-yaml | 4.3.0 | 4.3.2 | high advisory remediation |
| nanoid | 3.3.15 | 3.3.19 | high advisory remediation |
| next | 16.2.10 | 16.3.5 | critical advisory remediation |
| postcss | 8.4.31, 8.5.16 | 8.5.23, 8.5.28 | high advisory remediation |
| sharp | 0.34.5 | 0.35.4 | high advisory remediation |
| undici | 6.27.0 | 6.28.1 | moderate advisory remediation |
| vitest | 4.1.10 | 4.1.11 | moderate advisory remediation |
| eslint-config-next | 16.2.10 | 16.3.5 | Match patched framework |

### Advisory applicability

Next image optimization is enabled and reachable; AVIF uploads are disallowed by the admin uploader, but that alone does not establish immunity for all existing/remote image URLs. Windows-hosted RCE applies to exposed Windows servers, including local Windows hosting, not the Linux Vercel runtime. Proxy/cache issues are framework-level concerns in this App Router/Turbopack project. No custom server, destination rewrites, i18n configuration, Edge Server Actions or first-party use-server actions were found; advisories requiring those features lack a demonstrated trigger here. They were still removed by the framework security update.

PostCSS/Sharp are used by Next's build/image stack. Browserslist/baseline-browser-mapping/brace-expansion/js-yaml are primarily build/lint tooling, without a first-party endpoint accepting their configuration from users. nanoid is transitive and no first-party arbitrary-size generator is used. Vitest/mocker is test tooling, not a production server. fflate is present through three-stdlib; no untrusted ZIP loader feature was found. undici is used transitively by Blob; no application use of the affected cookie/retry helpers was found. These are source-based exposure assessments, not exploit tests.

| Package | Advisory | Vulnerable range | Issue |
|---|---|---|---|
| @vitest/mocker | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | `>=2.1.0 <4.1.11` | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock |
| baseline-browser-mapping | [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) | `>=2.0.0 <2.11.0` | baseline-browser-mapping process termination on invalid input causes denial of service |
| brace-expansion | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | `<1.1.16` | brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups |
| brace-expansion | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | `<1.1.17` | brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash |
| brace-expansion | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | `>=4.0.0 <5.0.8` | brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash |
| brace-expansion | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | `>=4.0.0 <5.0.9` | brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation |
| brace-expansion | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | `<1.1.18` | brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation |
| browserslist | [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | `<=4.28.6` | Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM |
| browserslist | [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | `<=4.28.6` | Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats) |
| fflate | [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98) | `>=0.6.0 <0.6.11` | fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives |
| js-yaml | [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | `>=4.0.0 <4.3.1` | JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) â€” CVE-2026-59870 fix not backported |
| js-yaml | [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh) | `>=4.0.0 <4.3.2` | js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources |
| nanoid | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | `<3.3.16` | nanoid: non-secure generators can loop indefinitely with negative size |
| nanoid | [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | `<3.3.18` | nanoid: custom generators can loop indefinitely when size is zero |
| next | [GHSA-6gpp-xcg3-4w24](https://github.com/advisories/GHSA-6gpp-xcg3-4w24) | `>=16.0.0 <16.2.11` | Next.js: Middleware / Proxy bypass in App Router applications using Turbopack and single locale |
| next | [GHSA-m99w-x7hq-7vfj](https://github.com/advisories/GHSA-m99w-x7hq-7vfj) | `>=16.0.0 <16.2.11` | Next.js: Denial of Service in App Router using Server Actions |
| next | [GHSA-89xv-2m56-2m9x](https://github.com/advisories/GHSA-89xv-2m56-2m9x) | `>=16.0.0 <16.2.11` | Next.js: Server-Side Request Forgery in Server Actions on custom servers |
| next | [GHSA-68g3-v927-f742](https://github.com/advisories/GHSA-68g3-v927-f742) | `>=16.0.0 <16.2.11` | Next.js: Cache confusion of response bodies for requests with bodies |
| next | [GHSA-4633-3j49-mh5q](https://github.com/advisories/GHSA-4633-3j49-mh5q) | `>=16.0.0 <16.2.11` | Next.js: Cache confusion of response bodies for requests with bodies containing invalid UTF-8 byte sequences |
| next | [GHSA-4c39-4ccg-62r3](https://github.com/advisories/GHSA-4c39-4ccg-62r3) | `>=16.0.0 <16.2.11` | Next.js: Unbounded Server Action payload in Edge runtime |
| next | [GHSA-p9j2-gv94-2wf4](https://github.com/advisories/GHSA-p9j2-gv94-2wf4) | `>=16.0.0 <16.2.11` | Next.js: Server-Side Request Forgery in rewrites via attacker-controlled destination hostname |
| next | [GHSA-q8wf-6r8g-63ch](https://github.com/advisories/GHSA-q8wf-6r8g-63ch) | `>=16.0.0 <16.2.11` | Next.js: Denial of Service in the Image Optimization API using SVGs |
| next | [GHSA-955p-x3mx-jcvp](https://github.com/advisories/GHSA-955p-x3mx-jcvp) | `>=16.0.0 <16.2.11` | Next.js: Unauthenticated disclosure of internal Server Function endpoints |
| next | [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36) | `>=16.0.0 <16.3.3` | Next.js: Unauthenticated Remote Code Execution on windows-hosted servers |
| next | [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) | `>=16.0.0 <16.3.3` | Next.js: Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used |
| postcss | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | `<8.5.10` | PostCSS has XSS via Unescaped </style> in its CSS Stringify Output |
| postcss | [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | `<=8.5.11` | PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments |
| postcss | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | `<=8.5.22` | PostCSS: incomplete fix of GHSA-6g55-p6wh-862q â€” attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset |
| postcss | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | `<=8.5.17` | PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure |
| sharp | [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) | `<0.35.0` | sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 |
| sharp | [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) | `<0.35.4` | sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 |
| undici | [GHSA-8xcm-r25x-g524](https://github.com/advisories/GHSA-8xcm-r25x-g524) | `<6.28.0` | undici vulnerable to downstream response desynchronization via retry interceptor |
| undici | [GHSA-m8rv-5g2x-5cg5](https://github.com/advisories/GHSA-m8rv-5g2x-5cg5) | `<6.28.0` | undici vulnerable to CRLF Injection via blob-like body 'type' property |
| undici | [GHSA-v3r7-h72x-cjcm](https://github.com/advisories/GHSA-v3r7-h72x-cjcm) | `<6.28.0` | undici vulnerable to cookie attribute injection via unsanitized domain and unparsed setCookie fields |
| vitest | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) | `>=2.1.0 <4.1.11` | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock |

## Upload remediation

Previous limit: 5 * 1024 * 1024 = 5,242,880 bytes. New limit: 4 * 1024 * 1024 = 4,194,304 bytes (4 MiB), leaving 305,696 bytes below a conservative 4,500,000-byte platform cap for multipart overhead. Source: https://vercel.com/docs/vercel-blob/server-upload .

Shared public constants are imported by the media route and all eight admin upload handlers (product cover/gallery/PDF create/edit, partner logo create/edit). The browser rejects oversized files before sending; the server independently enforces the same size. Labels and validation messages reflect 4 MiB. Normal browser multipart payload at the boundary is tested below 4.5 MB. Arbitrarily oversized/malicious HTTP requests can still be rejected by Vercel before application code; no server validation can prevent the platform's earlier rejection. No client-upload redesign.

MIME/signature checks, empty-file rejection, UUID names, original filename sanitation, public Blob access, Prisma metadata creation and cleanup semantics are intact. Tests cover boundary acceptance, one byte over, invalid MIME/signatures, storage absence, Blob failure, database failure, cleanup failure and development filesystem behavior with filesystem/Blob/DB mocked.

## Blob and authentication review

Public media store is the store authorized by BLOB_READ_WRITE_TOKEN. Private resume store is RESUME_BLOB_STORE_ID with SDK OIDC, or RESUME_BLOB_READ_WRITE_TOKEN if no store ID is configured. Exact deployed store identities cannot be established from local source; no provider settings or tokens were queried. Public media metadata stores MediaItem.fileUrl; resumes store CareerApplication.resumeUrl. These records point to existing objects and must remain valid. A new credential does not copy objects. A stale resume store ID takes precedence over a token; no risky fallback or URL rewrite was introduced.

Private downloads are authenticated by the proxy, then streamed through /api/admin/candidates/[id]/resume with private/no-store caching. Legacy /uploads resume references redirect locally and can break when files are absent. Existing source deletions make a private legacy-file inventory essential before transfer. This phase did not read/change database records or storage objects.

NEXTAUTH_SECRET remains environment-supplied with minimum 32-character validation. Existing eight-hour HS256 admin sessions, password checks, role verification, cookie name and HttpOnly/Secure/SameSite=Lax/path=/ flags remain unchanged. No host/domain cookie binding exists. NEXTAUTH_URL and request origin support canonical and preview origins; no Vercel account identity is involved. Keep the secret unchanged to preserve signatures.

Security fix: removed proxy matcher prefetch exclusions. Previously an attacker could supply next-router-prefetch or purpose headers to avoid the proxy that guards admin routes. Tests now verify both matcher execution and authorization for media, resume and admin paths, including valid signed admin access and rejected foreign-origin mutations. No authentication was disabled or replaced.

## CSP and diagnostics

img-src now permits HTTPS *.public.blob.vercel-storage.com, matching existing Next Image host support and raw admin previews. Scripts remain nonce-protected; connections/frames/private Blob hosts were not broadened. No store IDs or credentials are present in CSP.

Removed media describeError stack copying; actual Error objects reach the central redactor. Production structured diagnostic message/stack/cause fields and credential-bearing keys are redacted; Prisma Pxxxx codes, error class, operation, request ID and status remain useful. Booking errors no longer interpolate raw messages into top-level log messages. Resend failures log HTTP status/operation without raw provider bodies. Partner initialization routes errors through the same logger. Prisma's automatic raw stdout error logging is disabled outside development because route-level structured logging handles failures safely. Database queries and initialization behavior are unchanged. Validation errors remain intentional fixed public messages; unexpected production API failures remain generic.

## Environment review

.env.example remains blank and was clarified; no local .env values were modified. No variables invented for deployment.

| Variable | Requirement | Boundary / timing |
|---|---|---|
| DATABASE_URL | Production and development database-backed features | Server runtime; build/generation can use isolated placeholder |
| DIRECT_URL | Prisma schema/CLI database operations | Server tooling, not browser; no live DB needed merely to compile |
| NEXTAUTH_SECRET | Production/development admin authentication | Server runtime secret |
| NEXTAUTH_URL | Operationally required for absolute production email links; optional startup fallback | Server build/render metadata, runtime email/origin; origin is intentionally public |
| BLOB_READ_WRITE_TOKEN | Production public uploads | Server runtime secret; local media does not require it |
| RESUME_BLOB_STORE_ID | Conditional: private resume OIDC strategy, all environments | Non-secret identifier consumed server-side |
| RESUME_BLOB_READ_WRITE_TOKEN | Conditional alternative: private resumes without store ID | Server runtime secret |
| VERCEL_OIDC_TOKEN | Conditional SDK requirement when store-ID strategy selected | Server-only platform-managed short-lived credential |
| RESEND_API_KEY | Optional startup; required for actual mail delivery | Server runtime/module initialization |
| NEXT_PUBLIC_APP_URL | Optional development/CI Playwright origin | Public-safe test runner configuration, unused by application clients |

NODE_ENV/CI are framework/runner inputs. No new browser build secrets. BLOB_STORE_ID/BLOB_WEBHOOK_PUBLIC_KEY are unnecessary for these explicit adapter paths. SDK and first-party variable usage was traced; changing accounts does not rename these variables automatically.

## Domain review

No domain reference changed. layout.tsx uses NEXTAUTH_URL with canonical fallback (runtime/build metadata); robots.ts and sitemap.ts intentionally publish the unchanged canonical domain. careers/page.tsx, config/business.ts and config/founder.ts contain business contact content. prisma/seed-products.mjs contains seed data; docs/20-seo-content-strategy.md is documentation. None depends on a GitHub/Vercel owner. No new domain variable needed.

## Database-dependent failures (all remain BLOCKED)

| Test file / case | Root cause in isolated run | Classification |
|---|---|---|
| admin_api.test.ts: dashboard | lead.count / other aggregate queries cannot connect | A/B/E |
| admin_api.test.ts: leads | lead.findMany cannot connect | A/B/E |
| admin_api.test.ts: demo bookings | booking.findMany cannot connect | A/B/E |
| admin_api.test.ts: candidates | careerApplication queries cannot connect | A/B/E |
| admin_api.test.ts: newsletter | newsletterSubscriber.findMany cannot connect | A/B/E |
| api.test.ts: contact | lead.create cannot connect | A/B/E |
| api.test.ts: newsletter | subscriber lookup/create cannot connect | A/B/E |
| api.test.ts: careers | careerApplication.create cannot connect (Blob is mocked) | A/B/E |
| api.test.ts: slot booking | demoSlot.findMany fails before booking transaction runs | A/B/E |
| security_db.test.ts: model connectivity | first demoSlot.findMany cannot connect | A/B/E |

A = test environment configuration; B = no dedicated test database; E = connectivity. No migration-specific regression demonstrated. Do not interpret these as proven healthy behavior against a real schema. The booking test can silently skip booking when slots are empty and accepts capacity-conflict responses; it is not complete concurrency proof. Existing integration test cleanup performs deletes/updates, so these tests must never run on production. No tests were deleted, skipped or mocked merely to turn these failures green.

## Browser fallback blocker

Homepage rendering calls ensureDefaultPartners (which can write), followed by a required partner query. With no isolated database, that query errors before the cinematic UI can be assessed. Production database use, automatic DB creation, disabling queries or returning fake application data would violate scope. Playwright readiness now checks the existing /api/health endpoint rather than /, so server startup and database/page readiness are distinct. This does not bypass the homepage's real database behavior. Required fallback tests must be rerun with an explicitly approved dedicated test environment.

## Tracked/local/history review

- src/generated/client/** (22 files): generated Prisma runtime, schema, declarations and Windows engine. Historical reason for committing is not documented; app imports this output, and postinstall regenerates it. Recommend a separate approved untracking-only change after clean-clone generation is verified. Removing without generation would break imports. Nothing untracked/deleted here.
- public/uploads/resumes/316aefb8-2931-4535-a3cd-7339465fc303.pdf, 9d9fb20d-d000-4faf-af5f-b8e02f76741e.pdf, bf56fb79-2ce2-436f-961f-d29d8e1926c3.pdf: previously tracked user uploads, already missing in the starting worktree. They remain in history. Retention/access and legacy DB references require owner review. This phase neither removed nor restored them.
- .next, .vercel, local .env, generate-password.ts, IDE metadata and diagnostics: ignored, not tracked. Keep out of handover archives. Existing .gitignore already covers them; no additional rule needed.
- Local credential-bearing files/cache locations remain as reported in Phase 1; no secret values displayed or rotated. History assessment is read-only; no rewriting.

## Phase 2 files changed

- `.env.example`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `src/lib/config/uploads.ts`
- `src/app/api/admin/media/route.ts`
- `src/app/admin/products/create/page.tsx`
- `src/app/admin/products/edit/[id]/page.tsx`
- `src/app/admin/partners/create/page.tsx`
- `src/app/admin/partners/edit/[id]/page.tsx`
- `src/proxy.ts`
- `src/lib/utils/logger.ts`
- `src/lib/db.ts`
- `src/lib/partners/initializer.ts`
- `src/lib/email.ts`
- `src/app/api/book-demo/route.ts`
- `tests/unit/media-api.test.ts`
- `tests/unit/proxy.test.ts`
- `tests/unit/logger.test.ts`
- `tests/unit/error-boundaries.test.ts`
- `tests/e2e/migration-security.test.ts`
- `docs/26-ownership-migration-audit.md`
- `docs/27-ownership-migration-remediation.md`
- `task.md`
- `walkthrough.md`

## Full resolved version delta

Includes platform-specific optional binaries and required transitive updates. Existing unrelated application package versions are retained.

| Lockfile package | Before | After |
|---|---|---|
| node_modules/@emnapi/runtime | 1.11.2 | 1.11.3 |
| node_modules/@img/sharp-darwin-arm64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-darwin-x64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-freebsd-wasm32 | not present | 0.35.4 |
| node_modules/@img/sharp-libvips-darwin-arm64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-darwin-x64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linux-arm | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linux-arm64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linux-ppc64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linux-riscv64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linux-s390x | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linux-x64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linuxmusl-arm64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-libvips-linuxmusl-x64 | 1.2.4 | 1.3.3 |
| node_modules/@img/sharp-linux-arm | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linux-arm64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linux-ppc64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linux-riscv64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linux-s390x | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linux-x64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linuxmusl-arm64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-linuxmusl-x64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-wasm32 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-webcontainers-wasm32 | not present | 0.35.4 |
| node_modules/@img/sharp-win32-arm64 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-win32-ia32 | 0.34.5 | 0.35.4 |
| node_modules/@img/sharp-win32-x64 | 0.34.5 | 0.35.4 |
| node_modules/@next/env | 16.2.10 | 16.3.5 |
| node_modules/@next/eslint-plugin-next | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-darwin-arm64 | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-darwin-x64 | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-linux-arm64-gnu | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-linux-arm64-musl | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-linux-x64-gnu | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-linux-x64-musl | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-win32-arm64-msvc | 16.2.10 | 16.3.5 |
| node_modules/@next/swc-win32-x64-msvc | 16.2.10 | 16.3.5 |
| node_modules/@oxc-project/types | 0.138.0 | 0.149.0 |
| node_modules/@rolldown/binding-android-arm-eabi | not present | 1.2.8 |
| node_modules/@rolldown/binding-android-arm64 | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-darwin-arm64 | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-darwin-x64 | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-freebsd-x64 | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-arm-gnueabihf | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-arm64-gnu | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-arm64-musl | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-ppc64-gnu | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-s390x-gnu | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-x64-gnu | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-linux-x64-musl | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-openharmony-arm64 | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-wasm32-wasi | 1.1.4 | deduplicated/not present |
| node_modules/@rolldown/binding-wasm32-wasi/node_modules/@emnapi/core | 1.11.1 | deduplicated/not present |
| node_modules/@rolldown/binding-wasm32-wasi/node_modules/@emnapi/runtime | 1.11.1 | deduplicated/not present |
| node_modules/@rolldown/binding-wasm32-wasi/node_modules/@emnapi/wasi-threads | 1.2.2 | deduplicated/not present |
| node_modules/@rolldown/binding-win32-arm64-msvc | 1.1.4 | 1.2.8 |
| node_modules/@rolldown/binding-win32-x64-msvc | 1.1.4 | 1.2.8 |
| node_modules/@swc/helpers | 0.5.15 | 0.5.23 |
| node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion | 5.0.7 | 5.0.9 |
| node_modules/@vitest/expect | 4.1.10 | 4.1.11 |
| node_modules/@vitest/mocker | 4.1.10 | 4.1.11 |
| node_modules/@vitest/pretty-format | 4.1.10 | 4.1.11 |
| node_modules/@vitest/runner | 4.1.10 | 4.1.11 |
| node_modules/@vitest/snapshot | 4.1.10 | 4.1.11 |
| node_modules/@vitest/spy | 4.1.10 | 4.1.11 |
| node_modules/@vitest/utils | 4.1.10 | 4.1.11 |
| node_modules/baseline-browser-mapping | 2.10.42 | 2.11.23 |
| node_modules/brace-expansion | 1.1.15 | 1.1.18 |
| node_modules/browserslist | 4.28.5 | 4.28.9 |
| node_modules/caniuse-lite | 1.0.30001802 | 1.0.30001810 |
| node_modules/electron-to-chromium | 1.5.387 | 1.5.427 |
| node_modules/eslint-config-next | 16.2.10 | 16.3.5 |
| node_modules/fastq | 1.20.1 | 1.20.3 |
| node_modules/js-yaml | 4.3.0 | 4.3.2 |
| node_modules/nanoid | 3.3.15 | 3.3.19 |
| node_modules/next | 16.2.10 | 16.3.5 |
| node_modules/next/node_modules/postcss | 8.4.31 | deduplicated/not present |
| node_modules/node-releases | 2.0.50 | 2.0.55 |
| node_modules/postcss | 8.5.16 | 8.5.23 |
| node_modules/rolldown | 1.1.4 | 1.2.8 |
| node_modules/sharp | 0.34.5 | 0.35.4 |
| node_modules/three-stdlib/node_modules/fflate | 0.6.10 | 0.6.11 |
| node_modules/tinyrainbow | 3.1.0 | 3.1.1 |
| node_modules/undici | 6.27.0 | 6.28.1 |
| node_modules/update-browserslist-db | 1.2.3 | 1.3.3 |
| node_modules/vite | 8.1.3 | 8.3.0 |
| node_modules/vite/node_modules/lightningcss | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-android-arm64 | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-darwin-arm64 | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-darwin-x64 | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-freebsd-x64 | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-linux-arm-gnueabihf | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-linux-arm64-gnu | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-linux-arm64-musl | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-linux-x64-gnu | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-linux-x64-musl | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-win32-arm64-msvc | not present | 1.33.0 |
| node_modules/vite/node_modules/lightningcss-win32-x64-msvc | not present | 1.33.0 |
| node_modules/vite/node_modules/picomatch | 4.0.5 | 4.0.7 |
| node_modules/vite/node_modules/postcss | not present | 8.5.28 |
| node_modules/vitest | 4.1.10 | 4.1.11 |


## Build packaging remediation discovered during validation

Next 16.3.5 Turbopack compiled successfully but warned that Prisma 6.2.1's generated dynamic filesystem lookups traced the whole workspace. Inspection confirmed .env and generate-password.ts entries in server .nft.json manifests. This was local build output only; nothing was deployed and no values were printed.

The production build script now uses the documented Next.js Webpack option for compatibility with the existing generated client. next.config.ts also explicitly excludes local environment variants, password helper, Git/Vercel metadata, development caches, diagnostics and IDE files from server tracing. This is a packaging/security fix; development still uses its existing bundler, and Prisma generation, schema, SQL and query behavior are unchanged. Do not edit generated Prisma code to suppress tracing warnings. See https://nextjs.org/docs/app/guides/upgrading/version-16 .

Additional Phase 2 file changed: next.config.ts. Final build and artifact checks below supersede the initial Turbopack attempt.

## History reassessment

396 reachable historical blobs scanned. The only high-confidence credential-pattern candidates were generic user/password/host examples in .env.example:8-9 (blob 649de2586541, history commits 278ef27/8ed2278) and .env.example:8 (blob eca319989296, history commits 8ed2278/021beea). These were confirmed placeholders, not discovered live credentials. No rotation or history remediation is warranted from these matches. Scans do not establish absence in encrypted/binary/OCR content or unreachable objects. Existing local secret/cache findings from Phase 1 remain excluded from Git and handover archives.


## Route typing correction

Webpack's generated route checks exposed the existing optional Request argument in src/app/api/admin/candidates/route.ts. Next always supplies Request for HTTP calls. Changed GET(request?: Request) to GET(request: Request), removed the unused localhost fallback and updated tests/unit/admin_api.test.ts to pass a Request. No HTTP/API filtering behavior changed. These two paths are additional Phase 2 edits. The original database failure for that test still requires a test database.

## React review

Applied the React best-practices checklist to the four touched admin forms: the size checks run in existing event handlers before network requests/state transitions, no hooks or component structure changed, and error feedback uses the existing message UI. The shared constants contain no environment values or server imports.
