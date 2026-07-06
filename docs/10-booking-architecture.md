# Booking Architecture: Quantum Living Solutions

This document describes the workflow, state logic, and protection protocols of the booking engine.

---

## 1. Booking State Machine

```
   [ DRAFT ]
       |
       v (User triggers slot reserve)
  [ SLOT_HELD ] --(Timeout / Expiry)--> [ EXPIRED ]
       |
       +------(Selects Pay-on-Visit)-------> [ CONFIRMED ]
       |
       v (Initiates Payment)
  [ PENDING_PAYMENT ] --(Failed Gateway)--> [ PAYMENT_FAILED ] --> (Retry) --+
       |                                                                      |
       v (Gateway Callback Success)                                           |
  [ PAYMENT_PROCESSING ] -----------------------------------------------------+
       |
        v (Payment Reconciled & Booking Confirmed)
  [ CONFIRMED ] --(User Cancels)----------> [ CANCELLED ]
       |
       v (No Show)
  [ NO_SHOW ]
       |
       v (Showroom Tour Completes)
  [ COMPLETED ]
```

---

## 2. Double-Booking Prevention & Hold Expiry

To guarantee transaction integrity under high concurrency:
- **Temporary Slot Hold**: When a user selects a time slot, the backend writes a row to `slot_holds` with a `held_until` timestamp calculated as `NOW() + INTERVAL '10 minutes'`.
- **SQL Concurrency Verification**: During checkouts, the application initiates an isolated database transaction using `SERIALIZABLE` or `READ COMMITTED` isolation level with `SELECT ... FOR UPDATE` (as detailed in [database-architecture.md](file:///c:/Users/SudhanshuV_Ext/Desktop/test/quantum-living-solutions/docs/08-database-architecture.md)).
- **Hold Reclamation Background Worker**: A cron-style background task checks the database every 60 seconds to release slot allocations where `slot_holds.held_until < NOW()` and the booking was never confirmed.
  ```sql
  -- Conceptual release query executed by cron
  DELETE FROM slot_holds WHERE held_until < NOW();
  ```

---

## 3. Rescheduling & Cancellation Rules
- **Rescheduling**: Permitted up to 24 hours prior to slot start. The system runs slot holding queries to verify availability on the destination slot before unlocking the current reservation.
- **Refund Eligibility**: Fully refundable booking fees are returned only if the cancellation event is recorded in the system database at least 24 hours before the booked start time. Late cancellations release the slot, but mark the payment as non-refundable.
