# Architecture Decision Records (ADRs): Quantum Living Solutions

This document logs the critical architectural choices, evaluations, and evolution triggers for the platform.

---

## 1. ADR 01: Monolithic Architecture vs. Microservices
- **Context**: The platform requires a public site, interactive scheduler, transactional checkouts, and CRM.
- **Options Considered**:
  - *Option A*: Microservices (separate booking API, separate CRM service, separate content engine).
  - *Option B*: Monolithic Deployment (consolidated application repository).
- **Decision**: **Option B (Monolithic Deployment)**.
- **Rationale**: Reduces network latency, simplifies local development and deployments, and eliminates database synchronization overhead.
- **Consequences**: Scaled as a single unit. Code bounds are enforced through folder structure rather than physical network divisions.
- **Migration/Evolution Trigger**: If lead traffic or CRM processing scales to the point where background jobs or heavy operations (e.g. video processing) block page-rendering threads, extract the queue processor to a separate worker instance.

---

## 2. ADR 02: Next.js Full Stack vs. Decoupled Backend
- **Context**: Choosing the main application framework stack.
- **Options Considered**:
  - *Option A*: Next.js full-stack App Router (combining React SSR pages and API routes).
  - *Option B*: Decoupled framework (React SPA frontend + Node.js/Fastify/Go API backend).
- **Decision**: **Option A (Next.js Full Stack)**.
- **Rationale**: Maximizes SEO performance via Server-Side Rendering (SSR) while allowing simple serverless API routes on a single hosting platform.
- **Consequences**: Server logic and client routes are in a single repository. API routes must run inside serverless environments, requiring lightweight routes.
- **Migration/Evolution Trigger**: If API execution times hit serverless timeout limits (e.g., 10s-15s), migrate complex endpoints to standalone server instances.

---

## 3. ADR 03: Real-Time 3D vs. Pre-Rendered Media Sequences
- **Context**: Developing scroll-scrubbed cinematic transitions on the homepage.
- **Options Considered**:
  - *Option A*: Full Real-Time 3D (rendering the room entirely in WebGL/Three.js on scroll).
  - *Option B*: Hybrid Pre-Rendered (scrubbing pre-rendered WebM video frames / WebP image sequences on scroll; using Three.js only for the isolated interactive space configuration page).
- **Decision**: **Option B (Hybrid Pre-Rendered)**.
- **Rationale**: Lowers CPU/GPU load, ensuring the site works smoothly on tablets and mobile screens, and keeps the initial bundle size small.
- **Consequences**: Increases static media storage requirements (requires high-res image sequences/videos), but guarantees predictable frame performance.
- **Migration/Evolution Trigger**: None. WebGL capability thresholds are hard-coded; devices fail over to image sequences automatically.

---

## 4. ADR 04: PostgreSQL Provider Selection
- **Context**: Selecting a transactional database.
- **Options Considered**:
  - *Option A*: Neon (serverless PostgreSQL with compute scaling and schema branching).
  - *Option B*: AWS RDS / GCP Cloud SQL (dedicated database instances).
  - *Option C*: Supabase (integrated database, authentication, and file storage SDK).
- **Decision**: **Option A (Neon)**.
- **Rationale**: Offers a generous free tier for development, branches DB schemas on demand for automated tests, and keeps the application decoupled from platform-specific APIs.
- **Consequences**: Requires standard PostgreSQL connection strings, ensuring easy migration to other host providers.
- **Migration/Evolution Trigger**: If database connection count spikes or traffic exceeds serverless bounds, provision a connection pooler (PgBouncer) or migrate to a provisioned instance (AWS RDS).

---

## 5. ADR 05: Database Access & ORM Strategy
- **Context**: Interfacing with the database.
- **Options Considered**:
  - *Option A*: Prisma ORM (strongly-typed query builder).
  - *Option B*: Raw SQL driver client query execution.
  - *Option C*: Kysely / Drizzle ORM (type-safe SQL builders).
- **Decision**: **Option A (Prisma ORM)**.
- **Rationale**: Accelerates schema generation, provides typed definitions, and supports transaction blocks and database constraint tracking.
- **Consequences**: Small runtime engine performance overhead compared to raw SQL clients.
- **Migration/Evolution Trigger**: If complex analytics reporting queries bottleneck, execute parameterized raw SQL via the Prisma client directly.

---

## 6. ADR 06: Customer Authentication Strategy
- **Context**: Granting access to demo details and scheduling management.
- **Options Considered**:
  - *Option A*: Traditional account registration (username and password).
  - *Option B*: Magic-link session authentication.
  - *Option C*: No customer account, using booking confirmations plus a secure, expiring booking-management link.
- **Decision**: **Option C (No Account, Secure Expiring Link)**.
- **Rationale**: Optimizes for the lowest possible friction. Standard accounts create sign-up drops. Magic links carry email delivery delay risks. Option C allows instant checkout, attaching a cryptographically secure random base64url opaque capability token (verified via SHA-256 server-side hash verification) to booking emails/SMS for management access.
- **Consequences**: Users who delete confirmation emails must request a link resend (which triggers a verified OTP confirmation to their phone/email before issuing a new token).
- **Migration/Evolution Trigger**: If the company rolls out a customer loyalty dashboard, migrate to a NextAuth-based session profile linked to the booking ledger.

---

## 7. ADR 07: Redis Timing & Introduction
- **Context**: Managing session caching and global rate limiting.
- **Options Considered**:
  - *Option A*: Introduce Redis immediately during Phase 1.
  - *Option B*: Use local in-memory caches and IP limits, deferring Redis until scaling requires it.
- **Decision**: **Option B (Deferred Redis)**.
- **Rationale**: Keeps development simple and reduces initial cost. Rate limits are handled locally by Vercel Edge middleware, and booking availability is verified directly in PostgreSQL.
- **Consequences**: Limits are tracked per serverless instance rather than globally, which is acceptable for early traffic.
- **Migration/Evolution Trigger**: Introduce serverless Redis (e.g. Upstash) when traffic grows, session sharing across server nodes is required, or database lock checks bottleneck.

---

## 8. ADR 08: Media & Object Storage Strategy
- **Context**: Hosting videos, high-res photos, 3D meshes, and resumes.
- **Options Considered**:
  - *Option A*: Cloudflare R2 (S3-compatible, zero data egress fees).
  - *Option B*: AWS S3 (standard object storage with egress charges).
- **Decision**: **Option A (Cloudflare R2)**.
- **Rationale**: Generous free-tier (10GB) and zero data egress fees, keeping operational costs low while maintaining standard S3 compatibility.
- **Consequences**: Requires S3 SDK configurations in Next.js code.
- **Migration/Evolution Trigger**: None. Easily switchable to any S3-compatible cloud bucket by updating endpoint keys in environment configuration files.

---

## 9. ADR 09: Queue Timing & Background Processing
- **Context**: Offloading heavy work (sending emails, processing webhook logs) from API routes.
- **Options Considered**:
  - *Option A*: Deploy full background task queues (e.g. BullMQ with Redis) immediately.
  - *Option B*: Execute minor tasks asynchronously in Next.js backend requests (using `waitUntil` or serverless functions).
- **Decision**: **Option B (Deferred Dedicated Queue with Database Durability)**.
- **Rationale**: Next.js App Router API handlers perform non-critical task execution post-response (Class A via `waitUntil()`). For Class B and C critical operations, we rely on database transaction log states polled by serverless cron routes, avoiding dedicated server provisioning while ensuring reliability.
- **Consequences**: All Class C tasks must log their completion to the database to ensure failures are automatically retried on the next cron cycle.
- **Migration/Evolution Trigger**: Introduce a dedicated queuing library (e.g. BullMQ on Redis / Inngest) if operations exceed 10s execution times or daily booking actions exceed 500.

---

## 10. ADR 10: Hosting Approach
- **Context**: Hosting the monolithic application.
- **Options Considered**:
  - *Option A*: Vercel (native Next.js hosting, integrated Edge functions, and free dev tier).
  - *Option B*: Dedicated virtual machines (AWS EC2 / DigitalOcean Droplets running Docker).
- **Decision**: **Option A (Vercel)**.
- **Rationale**: Minimal DevOps overhead, automated preview branches on pull requests, and integrated optimization tools.
- **Consequences**: Vendor lock-in on serverless execution limitations, which we mitigate by writing standard Node API route handlers.
- **Migration/Evolution Trigger**: Migrate to custom Docker containers deployed on AWS ECS/Fargate if monthly Vercel serverless execution fees exceed the cost of dedicated infrastructure.

---

## 11. ADR 11: Payment Adapter Boundary
- **Context**: Decoupling the platform's booking engine from the payment processor (Razorpay).
- **Options Considered**:
  - *Option A*: Integrate Razorpay API calls directly into booking controller endpoints.
  - *Option B*: Deploy a standard payment gateway interface and use adapter classes.
- **Decision**: **Option B (Adapter Interface)**.
- **Rationale**: Prevents vendor-specific API structures from leaking into the core database ledger and booking state machine.
- **Consequences**: Requires writing adapter wrappers for Razorpay, but makes the codebase modular.
- **Migration/Evolution Trigger**: Easily add adapters (e.g., Stripe, PayPal) as business operations expand into new geographical regions.
