# Database Architecture: Quantum Living Solutions

This document defines the conceptual PostgreSQL schema layout and data retention/security policies.

---

## 1. Conceptual Entity Relationship Model

### `users`
- **Purpose**: System credentials and identification for staff.
- **Fields**: `id` (UUID, PK), `email` (VARCHAR, Unique), `password_hash` (VARCHAR), `mfa_secret` (VARCHAR, Encrypted), `created_at` (TIMESTAMP).
- **Sensitive**: High (Password and MFA secrets).

### `roles` & `permissions`
- **Purpose**: Access control.
- **Fields**: `id` (PK), `name` (VARCHAR), `description` (TEXT).

### `user_roles`
- **Purpose**: Join table.
- **Fields**: `user_id` (FK), `role_id` (FK).

### `leads`
- **Purpose**: Prospect information.
- **Fields**: `id` (UUID, PK), `first_name` (VARCHAR), `last_name` (VARCHAR), `email` (VARCHAR), `phone` (VARCHAR), `source` (VARCHAR), `status` (VARCHAR), `budget_range` (VARCHAR), `created_at` (TIMESTAMP).
- **Sensitive**: Medium (PII).

### `demo_slots`
- **Purpose**: Showroom demo booking schedule slots.
- **Fields**: `id` (UUID, PK), `start_time` (TIMESTAMP, Unique index with slot), `end_time` (TIMESTAMP), `max_capacity` (INTEGER, Default 1), `current_bookings` (INTEGER, Default 0), `is_active` (BOOLEAN).

### `slot_holds`
- **Purpose**: Temporary holds placed during booking checkout flow.
- **Fields**: `id` (UUID, PK), `slot_id` (UUID, FK), `session_id` (VARCHAR), `held_until` (TIMESTAMP), `created_at` (TIMESTAMP).

### `bookings`
- **Purpose**: Completed demo slot reservation details.
- **Fields**: `id` (UUID, PK), `slot_id` (UUID, FK), `lead_id` (UUID, FK), `status` (VARCHAR), `total_amount` (NUMERIC), `paid_amount` (NUMERIC), `created_at` (TIMESTAMP).

### `payments`
- **Purpose**: Internal payment record matching gateway intents.
- **Fields**: `id` (UUID, PK), `booking_id` (UUID, FK), `gateway_payment_id` (VARCHAR, Unique), `gateway_order_id` (VARCHAR), `amount` (NUMERIC), `currency` (VARCHAR), `status` (VARCHAR), `raw_response` (JSONB).

---

## 2. Database-Enforced Concurrency Strategy

To ensure zero double-booking, the system MUST enforce concurrency limits directly within the database engine using transactions, row-level locks, and check constraints.

### Constraint Strategy
- **Capacity Lock Constraint**: `demo_slots` includes a check constraint:
  `CONSTRAINT check_capacity CHECK (current_bookings <= max_capacity)`
- **Unique Time slot Index**: Unique index on `start_time` to prevent overlapping slot creations.

### Conceptual Transaction Mechanics (SQL Simulation)
When booking checkout begins:
1. Start database transaction.
2. Select slot and lock row:
   ```sql
   SELECT id, current_bookings, max_capacity 
   FROM demo_slots 
   WHERE id = :slot_id AND is_active = true 
   FOR UPDATE;
   ```
3. Verify that `current_bookings < max_capacity` and that there is a valid unexpired hold for this session in `slot_holds`.
4. Update slot:
   ```sql
   UPDATE demo_slots 
   SET current_bookings = current_bookings + 1 
   WHERE id = :slot_id;
   ```
   *If another thread updates first, the CHECK constraint `check_capacity` will violate and abort this transaction automatically, returning a database error to the application backend.*
5. Insert row into `bookings` and `payments`.
6. Commit transaction.

---

## 3. Data Retention & Classification

| Entity | Sensitivity | Retention Period | Action Post-Retention |
| :--- | :--- | :--- | :--- |
| **User/Admin Credentials** | High (PII / Secrets) | Active session length | Immediate purge on deletion |
| **Customer PII** | High (PII) | 2 years since last activity | Anonymize fields (replace name/email with hash) |
| **Payments Ledger** | High (Financial) | 7 years (Tax compliance) | Archive to secure offsite vault |
| **Audit Logs** | Medium | 1 year | Move to compressed cold storage |
| **Webhooks/Raw Payload Logs** | Low | 30 days | Auto-truncate partition |
