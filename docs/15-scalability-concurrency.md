# Scalability and Concurrency: Quantum Living Solutions

This document details scalability architectures, connection pooling, and background job reliability classifications.

---

## 1. Concurrency Management
- **Concurrent Bookings**: Addressed via database constraint locks (refer to [database-architecture.md](file:///c:/Users/SudhanshuV_Ext/Desktop/test/quantum-living-solutions/docs/08-database-architecture.md)).
- **Duplicate Webhook Processing**: We check if the incoming webhook transaction ID already exists in the database `payments` table. If yes, the database returns a duplicate key violation, and the API handler returns `200 OK` without performing further mutations.

---

## 2. Infrastructure Scaling Stages

```
[ Stage 1: Dev ]      [ Stage 2: Launch ]      [ Stage 3: Growth ]      [ Stage 4: Scale ]
  - Local Env           - Serverless/Edge        - Dedicated Pooler       - Multi-Region App
  - SQLite/Neon         - Neon (Free DB)         - Neon (Paid Tier)       - Replica DB Read
  - In-Memory Cache     - Edge Caching           - Redis Cache Cluster    - Redis Clusters
```

- **Stage 1 (Development)**: SQLite or Neon Free Tier database. Single local development servers.
- **Stage 2 (Launch / Initial Traffic)**: Serverless Next.js deployment. Managed serverless database (Neon) to handle auto-scaling of compute resources, dynamic pricing rules cached at Edge.
- **Stage 3 (Growing Traffic)**: Integrate PgBouncer/connection pooler, allocate a dedicated Redis instance for shared rate limiting and metadata caching.
- **Stage 4 (High Traffic / Enterprise)**: Multi-region Next.js deployment. Read replicas for PostgreSQL reporting tasks. Upgrades to high-availability clusters.

---

## 3. Background Job Reliability & Classification

To ensure reliability, background operations are segregated by criticality. Best-effort execution (e.g. Next.js `waitUntil`) must **never** be used for financial or scheduling transactions.

### Background Work Classifications

| Work Class | Operations Included | Reliability Standard | Primary Execution Mechanism |
| :--- | :--- | :--- | :--- |
| **Class A: Best-Effort / Non-Critical** | UI telemetry logs, traffic analytics, newsletter subscription syncing. | Minimal: logged on error; drop failures. | Asynchronous client-side calls or serverless `waitUntil()` functions. |
| **Class B: Retryable Business Operations** | Booking confirmations, rescheduled reminder emails, SMS notifications. | Medium: guaranteed delivery. Retry up to 5 times. | Database status queue tables (mark `pending_send`, process via cron). |
| **Class C: Critical Financial & Booking** | Payment reconciliation, slot hold expiry cleanups, refunds, audits. | Maximum: transactional durability; zero drop tolerance. | SQL transactions combined with recoverable database polling crons. |

### Low-Budget Polling Durability Mechanics
During Phase 1 and 2, we defer dedicating a Redis-based queue runner (to avoid hosting costs). However, Class C operations remain durable through **Database State Tracking**:
- **Slot Hold Expirations**: When a slot is held, the database writes the hold expiry timestamp. A cron function polls `/api/v1/cron/release-holds` every 60 seconds to purge expired holds. If a serverless function fails midway, the database records preserve state, and the next run picks up the remaining expired holds.
- **Payment Reconciliation Polling**: Transactions in `PENDING_PAYMENT` are scanned by a scheduled task. If a payment record has been pending for > 30 minutes, the worker calls the Razorpay adapter directly, reconciles the state, and commits the outcome.

### Queue Adoption Triggers
We will migrate from database-based cron polling to a dedicated queuing system (e.g., BullMQ on Upstash Redis / Inngest) when:
1. Daily transaction volume exceeds **500 completed bookings**.
2. Polling database queries take > **15 seconds** to complete, impacting database connection pools.
3. Third-party API webhook latency results in locks on database tables.
