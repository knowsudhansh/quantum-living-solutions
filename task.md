# Project Implementation Tasks: Quantum Living Solutions

- [x] **PHASE 0 — Blueprint**
  - [x] Create project charter and vision statement (`docs/00-project-charter.md`)
  - [x] Define product requirements and lead lifecycles (`docs/01-product-requirements.md`)
  - [x] Outline website structure and trust/legal compliance pages (`docs/02-information-architecture.md`)
  - [x] Map end-to-end paths for 17 target personas (`docs/03-user-journeys.md`)
  - [x] Create cinematic storyboard with device performance budgets (`docs/04-cinematic-storyboard.md`)
  - [x] Define design palettes and the Anti-Vibe-Coding Policy (`docs/05-design-system.md`)
  - [x] Formulate motion rules and low-battery/reduced-motion fallbacks (`docs/06-motion-3d-architecture.md`)
  - [x] Outline monolithic framework and cinematic decoupling policies (`docs/07-technical-architecture.md`)
  - [x] Document PostgreSQL database ER model and concurrency locks (`docs/08-database-architecture.md`)
  - [x] Establish public and administrative API endpoint layouts (`docs/09-api-architecture.md`)
  - [x] Detail booking state machine and hold expiration cron routines (`docs/10-booking-architecture.md`)
  - [x] Create payment adapter interface and webhook race mitigation policies (`docs/11-payment-architecture.md`)
  - [x] Plan security headers and OWASP vulnerability mitigations (`docs/12-security-architecture.md`)
  - [x] Establish admin MFA rules and client session profiles (`docs/13-auth-authorization.md`)
  - [x] Configure standard error codes and strict log redaction rules (`docs/14-error-handling.md`)
  - [x] Design connection pooling, scaling stages, and queues (`docs/15-scalability-concurrency.md`)
  - [x] Outline video formats, 3D asset compression, and lazy preloads (`docs/16-media-storage-strategy.md`)
  - [x] Define test pyramid, visual regression, and payment failure cases (`docs/17-testing-strategy.md`)
  - [x] Define structured log formats and key alert thresholds (`docs/18-observability.md`)
  - [x] Standardize WCAG 2.2 AA guidelines and font rendering targets (`docs/19-accessibility-performance.md`)
  - [x] Detail SEO meta configurations and copy standard voice rules (`docs/20-seo-content-strategy.md`)
  - [x] Segregate services and estimate cost tiers (`docs/21-infrastructure-cost-plan.md`)
  - [x] Establish AI development loops and governance rules (`docs/22-ai-development-governance.md`)
  - [x] Compile project risk registers and mitigation profiles (`docs/23-risk-register.md`)
  - [x] Log architectural decisions (ADRs) (`docs/24-architecture-decisions.md`)
  - [x] Map out phase-based timelines (`docs/25-implementation-roadmap.md`)
  - [x] Build root README index, AGENTS guidelines, and task lists.

- [x] **PHASE 1 — Engineering Foundation**
  - [x] Initialize code repo dependencies (zero package additions during Phase 0)
  - [x] Configure typescript and compiler parameters
  - [x] Configure ESLint and quality gates
  - [x] Configure unit, E2E, accessibility, and CI verification

- [x] **PHASE 2 — Cinematic Proof of Concept**
  - [x] Establish canvas container and mount Three.js scenes
  - [x] Bind GSAP ScrollTrigger timeline to canvas camera pan
  - [x] Write battery status and prefers-reduced-motion hooks

- [x] **PHASE 3 — Public Website**
  - [x] Stage 3A: Implement navigation header/footer shell & mock route layouts
  - [x] Stage 3B: Implement solutions grids dynamic pages & AAA legal pages
  - [x] Stage 3C: Implement homepage storyboard scroll journey overlays & canvas link
  - [x] Resolve image-sequence scroll playback requirement — superseded by the approved Stage 3C Three.js and capability-fallback architecture; no image-sequence driver was implemented.
  - [x] Integrate legal disclaimer, refund policy, and terms pages

- [x] **PHASE 4 — Backend and Database**
  - [x] Deploy Neon PostgreSQL instance
  - [x] Establish Prisma client and connection pool pools
  - [x] Define dynamic slot models and indexes

- [ ] **PHASE 5 — Authentication and Security**
  - [ ] Integrate NextAuth session routes
  - [ ] Setup credentials hashing and MFA validator
  - [ ] Implement booking-management token signature verifiers and recovery routes

- [ ] **PHASE 6 — Booking Engine**
  - [ ] Write slot hold transaction controller (`SELECT ... FOR UPDATE`)
  - [ ] Deploy automatic hold expiry background cron job
  - [ ] Create booking calendar admin dashboard interface

- [ ] **PHASE 7 — Payment Integration**
  - [ ] Implement normalized payment gateway adapter interface
  - [ ] Code Razorpay order creator and signature check handlers
  - [ ] Write checkout page redirect UI and status polling loops

- [ ] **PHASE 8 — CRM Admin Platform**
  - [ ] Build lead profiles viewer and status transitions dashboard
  - [ ] Implement payment audit ledger search screens
  - [ ] Code applicant resume uploader and parser endpoints
  - [x] Move career resumes to private Blob storage with authenticated admin preview/download

- [ ] **PHASE 9 — Notifications and Operations**
  - [ ] Configure Resend email gateway integration
  - [ ] Deploy email validation triggers on slot allocations

- [ ] **PHASE 10 — Complete QA**
  - [ ] Deploy unit test runs and code coverage measurements
  - [ ] Configure Playwright visual regression suite
  - [ ] Run automated WCAG accessibility audits

- [ ] **PHASE 11 — Performance and Load Engineering**
  - [ ] Simulate concurrent booking holds and database locks
  - [ ] Optimize 3D models and textures compression
  - [ ] Audit Core Web Vitals targets

- [ ] **PHASE 12 — Security Review**
  - [ ] Run dependency vulnerability audits
  - [ ] Perform static key scanners on builds
  - [ ] Validate log files redactions

- [ ] **PHASE 13 — Production Deployment**
  - [ ] Configure Vercel dashboard variables
  - [ ] Setup production database replica policies

- [ ] **PHASE 14 — Existing Website Replacement**
  - [ ] Set 301 redirects
  - [ ] Verify search engines indexing paths


## Ownership migration: code-level preparation (2026-09-14)

- [x] Audit repository, account coupling, environment usage, authentication, database and uploads.
- [x] Scan local/source files and reachable history without disclosing credentials.
- [x] Update blank environment template and preserve/extend ignore rules.
- [x] Record evidence and unresolved migration conditions in docs/26-ownership-migration-audit.md.
- [x] Run npm install, lint, typecheck, production build and unit suite with production data isolated.
- [ ] Satisfy full validation/transfer readiness: database integration, fallback checks and security/operational review remain gates.
- [ ] Transfer accounts/projects/stores/domains (not authorized in this phase).


## Google Analytics 4 integration (2026-09-25)

- [x] Inspect layout, routes, metadata, existing Script usage, CSP and prior analytics before changing anything.
- [x] Implement GA4 via `next/script` `afterInteractive`; no Google Tag Manager, no raw script tags.
- [x] Keep the Measurement ID environment-configurable and no-op when absent; document it in `.env.example`.
- [x] Rely on the standard configuration plus GA4 enhanced measurement for page views; add no duplicate manual `page_view`.
- [x] Keep analytics out of the cinematic timeline, GSAP callbacks, scroll, touch, resize and animation frames.
- [x] Widen CSP to the minimum Google measurement origins, public routes only, with no `unsafe-*` and no wildcard hosts.
- [x] Disable analytics on `/admin/*` and `/api/*`; verified no tag, no dataLayer and no beacon on admin.
- [x] Collect standard page/site measurement only; no `user_id`, no identifying parameters, ad personalisation off.
- [x] Unit-test the CSP gating and route policy (`tests/unit/analytics-csp.test.ts`).
- [x] Browser-verify the tag, nonce, beacon and SPA navigation against a production build (`tests/e2e/analytics.test.ts`).
- [x] Run lint, typecheck, production build (with and without the Measurement ID) and the unit suite.
- [x] Secret scan for leaked keys across the analytics change.
- [x] Record evidence in `walkthrough.md`.
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel and redeploy (deployment not authorized in this phase).
- [ ] Review cookie consent / Google Consent Mode before broad production rollout.
- [ ] Repair the 14 pre-existing Playwright failures (stale cinematic selectors, WCAG contrast); not caused by this change.
