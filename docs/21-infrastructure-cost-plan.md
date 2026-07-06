# Infrastructure Cost Plan: Quantum Living Solutions

This document details hosting, database, security, and integration service selections for development, launch, and growth tiers.

---

## 1. Gateway-Agnostic Infrastructure Segregation

To maintain application portability and avoid vendor lock-in (e.g. Supabase-specific functions or query patterns), core application modules interface with drivers through standard library layers (e.g. standard Node `pg` client, standard Redis drivers).

```
+--------------------------------------------------------------------+
|                      Next.js Portability Layer                     |
+--------------------------------------------------------------------+
    |            |            |              |             |
    v            v            v              v             v
 [ Auth ]     [ DB ]      [ Storage ]    [ Redis ]      [ Email ]
  - JWT        - PG         - S3-API      - standard     - SMTP
  - NextAuth   - Neon/RDS   - R2/S3       - Upstash/Elast - Resend
```

### Infrastructure Portability Principles
1. **Standard PostgreSQL**: Implement database communication using an ORM like Prisma or standard query builders. Do not use provider-specific client SDK libraries (e.g. `@supabase/supabase-js` database calls).
2. **S3-Compatible Storage**: Upload media utilizing standard AWS S3 SDK endpoints, making storage easily switchable between Cloudflare R2, AWS S3, or Backblaze B2.
3. **Decoupled Auth**: Implement authentication using standard JSON Web Tokens (JWT) or next-auth rather than coupling user databases to proprietary provider auth tables.

---

## 2. Infrastructure Provider Evaluations

### Database (PostgreSQL)
- **Neon**: Serverless Postgres. Excellent free tier with auto-suspend compute resources, branching features during development, and low entry costs.
- **AWS RDS PostgreSQL / GCP Cloud SQL**: High-reliability managed systems. Highly secure, but lack free-tier instances and add latency if the application runs outside their host networks.
- **Render / Railway Postgres**: Affordable managed PG options, but lack serverless scaling and connection autoscaling.
- *Phase 0 Decision*: **Neon** for development and launch. Simple PostgreSQL connection strings ensure high portability if migration to AWS/RDS becomes necessary.

### Hosting (Application)
- **Vercel**: Optimized for Next.js, free dev tier, global CDN integration.
- **AWS Amplify / Cloudflare Pages**: Alternative hosting routes.

### Redis & Rate Limiting
- **Upstash**: Serverless Redis with a generous free tier. Access is via standard Redis client connections or HTTP API.
- **Self-Hosted Redis**: Optional on Railway/Render, but requires hosting overhead.

### Authentication
- **NextAuth.js / Auth.js**: Free, open-source, runs directly inside the serverless Next.js API thread. No external provider cost.
- **Clerk / Auth0**: Premium managed platforms, but introduce user count billing limits.

### Media & Object Storage
- **Cloudflare R2**: Zero egress fees, standard S3-compatible API, free tier up to 10GB.
- **AWS S3**: Industry standard, but carries data egress costs.

### Transactional Email
- **Resend**: Free up to 3,000 emails per month, high inbox deliverability.
- **Amazon SES**: Extremely low volume costs, but complex initialization rules.

### Monitoring & Observability
- **Axiom / Better Stack**: Lightweight, free-first structured log search and uptime check engines.
- **Datadog**: Powerful enterprise APM, but expensive for early stages.

---

## 3. Cost-Tier Lifecycle Summary

| Category | Free Development Tier | Likely Launch Cost | Scale Growth Tier |
| :--- | :--- | :--- | :--- |
| **Hosting** | Vercel (Free) | Vercel Pro ($20/mo) | Vercel Enterprise / Custom AWS |
| **PostgreSQL** | Neon (Free) | Neon Shared ($19/mo) | Neon Scale / AWS RDS ($100+/mo) |
| **Object Storage**| Cloudflare R2 (Free <10GB) | Cloudflare R2 ($0.015/GB/mo) | Cloudflare R2 ($50+/mo) |
| **Redis** | Upstash (Free) | Upstash ($10/mo) | Managed AWS ElastiCache |
| **Auth** | NextAuth (Free) | NextAuth (Free) | NextAuth (Free) |
| **Email** | Resend (Free) | Resend ($20/mo) | Resend Pro / Amazon SES |
| **Observability** | Axiom (Free) | Axiom ($15/mo) | Axiom Pro / Datadog |
| **Gateway** | Razorpay (Test Mode) | Razorpay (~2.3% per txn) | Razorpay / Stripe (Negotiated) |
| **Total Est. Cost**| **$0.00 / month** | **~$64.00 / month** | **$300.00+ / month** |
