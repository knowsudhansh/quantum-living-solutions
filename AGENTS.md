# Permanent Instructions for AI Development Agents

Welcome. You are an autonomous AI coding agent tasked with executing development phases for **Quantum Living Solutions**. 
You must read and adhere to the guidelines, architectural directives, and constraints outlined below before making any changes.

---

## 1. Project Vision
Quantum Living Solutions provides luxury home automation systems. The interface is a cinematic, scroll-controlled visual journey. All elements must maintain high performance, usability, and accessibility, separating rich visuals from core transaction paths.

---

## 2. Anti-Vibe-Coding Policy
- **No Random Neon Gradients**: Do not use purple-to-pink/blue gradients or abstract neon drop-shadows.
- **No Excessive Glassmorphism**: Limit glass blur filters strictly to header elements. Use whitespace and clean structural layouts for card lists.
- **No Meaningless Particles**: Do not add floating dots, rotating shapes, or background grid lines that serve no narrative purpose.
- **No AI Hype Copy**: Do not use marketing buzzwords. Keep language clear, practical, and technically accurate.

---

## 3. Core Architectural Principles
- **Monolithic Setup**: Build exclusively within the full-stack Next.js structure. Do not introduce microservices.
- **Decoupled Visuals**: The cinematic WebGL layers must be fully isolated from critical business flows. A failure in WebGL, GSAP, or canvas elements must never prevent access to checkouts, contact, booking, or legal pages.
- **Database Portability**: Write vanilla SQL or use standard Prisma query clients. Do not couple logic to provider-specific tables (e.g. Supabase auth/storage SDK calls).

---

## 4. Strict Secret Management Rules

> [!CAUTION]
> Under no circumstances may private credentials or keys be exposed.

- **Secrets Isolation**: Secrets, private credentials, database URLs, private API keys, signing keys, webhook secrets, privileged storage credentials, and sensitive internal configuration must never be exposed through `NEXT_PUBLIC_*` prefixes, client components (`"use client"`), browser bundles, source maps, logs, test fixtures, screenshots, or error responses.
- **Intentionally Public Configuration**: Intentionally public configurations (e.g. public client identifiers, analytics tracker configurations, dynamic theme toggles) may be browser-visible only after explicit architectural review and documentation.
- **No Secret Treatment for Public IDs**: Public identifiers (e.g., Google Analytics tracking IDs, public gateway client keys) must never be treated as secrets or hardcoded into secure vaults.
- **Server-Only Execution**: All key authorizations and integrations must run strictly inside server-side environments (Next.js server actions, API route handlers).

---

## 5. Booking & Payment Safety Rules
- **Db Concurrency Protection**: Do not rely on cache, Redis, or frontend locks to manage slot booking concurrency. Use database row-level locking (`SELECT ... FOR UPDATE`) and constraints.
- **Never Trust Client Prices**: Read official costs from the database on every transaction request.
- **Server-Side Webhook Verification**: Confirm booking state modifications only after validating the signature of the incoming server-to-server webhook (not via browser redirect parameters).
- **Payment Adapter Boundary**: Keep transaction schemas independent of Razorpay. Always code to the normalized `PaymentOrderRequest` and response interfaces.

---

## 6. Testing & Quality Requirements
- **Baselines**: Maintain a test suite with unit, integration (mock webhooks), visual regression (Playwright), and accessibility (axe) validations.
- **Fallback Verification**: You must test the non-WebGL and reduced-motion fallback rendering configurations.
- **Coverage**: Maintain a coverage threshold of **85%+** on new utility code.

---

## 7. Performance & Accessibility
- **Performance Budget**: Target Bundle < 150 KB. Verify page loads under 2.5s LCP on mid-range mobiles.
- **Accessibility**: Verify all pages conform to WCAG 2.2 AA. Include focus indicators, contrast values, and keyboard-friendly configurations.

---

## 8. Definition of Done (DoD)
A phase is complete only when:
1. All linting and TypeScript compile checks pass.
2. The code builds without warnings.
3. Every new logic function is unit-tested.
4. Secrets scan verifies zero leaked keys.
5. `walkthrough.md` is updated with visual recordings or test output logs.
6. The corresponding `task.md` checkboxes are checked.
