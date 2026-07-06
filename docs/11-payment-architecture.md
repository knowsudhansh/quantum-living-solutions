# Payment Architecture: Quantum Living Solutions

This document establishes the transaction security protocols, gateway-agnostic orchestration engine, and payment verification validation boundaries.

---

## 1. Abstract Payment Adapter Boundary

We enforce strict separation between core business booking states and the gateway provider (Razorpay). Core logic must never bind directly to Razorpay-specific parameters, classes, or network structures.

```
+--------------------------+
|  Core Booking Engine     |
|  - Booking State Machine |
|  - Pricing Calculator    |
+--------------------------+
             |
             v (Uses normalized interfaces)
+--------------------------+
|  Payment Adapter Interface|
|  - createOrder()         |
|  - verifySignature()     |
|  - processRefund()       |
+--------------------------+
             |
             +-------------------------+
             |                         |
             v                         v
      [ Razorpay Adapter ]      [ Stripe Adapter ]
```

### Normalized Adapter Contracts
```typescript
interface PaymentOrderRequest {
  bookingId: string;
  amountInCents: number;
  currency: string;
}

interface PaymentOrderResponse {
  gatewayOrderId: string;
  amount: number;
  currency: string;
  checkoutPayload: Record<string, any>; // Provider-specific data for the browser
}

interface WebhookVerificationResult {
  isValid: boolean;
  gatewayTransactionId: string;
  gatewayOrderId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  rawResponse: Record<string, any>;
}
```

---

## 2. Core Payment & Verification Principles

> [!CAUTION]
> Failure to follow these rules exposes the platform to financial fraud. A valid cryptographic webhook signature proves payload authenticity, not that the business transaction is valid.

### Webhook Validation Protocol
On receiving a payment event, the backend must verify the following properties:
1. **Cryptographic Authenticity**: Verify webhook payload signature using the provider secret.
2. **Recognized Provider**: Verify source headers/metadata match allowed billing gateway adapters.
3. **Expected Event Type**: Process only target execution status events (e.g. `payment.captured`). Ignore irrelevant statuses.
4. **Internal Entity Mapping**: Confirm payload `order_id` / metadata matches an active pending payment record in the internal database.
5. **Expected Amount & Currency**: Assert payload payment amount matches the database payment record. Reject if there is any mismatch (amount/currency).
6. **Allowed State Transition**: Enforce state transition rules (e.g., transition `PENDING_PAYMENT` -> `PAID`, prevent illegal transitions such as `FAILED` -> `PAID` without reset).
7. **Duplicate / Replay Check**: Check if the transaction ID already exists in the `payments` ledger. Reject duplicates immediately to ensure idempotency.
8. **Internal Business Rules**: Assert the slot capacity checks are still respected before finalizing.

### Terminology & State Definitions

- **Authentic Webhook**: The incoming webhook signature successfully passes SHA-256 HMAC cryptographic checks against the gateway signature key.
- **Accepted Payment Event**: Webhook payload structure passes validation and matches target status (e.g., `payment.captured`).
- **Reconciled Payment**: Internal ledger amounts and gateway payload counts match, and the payment status changes to `PAID` within database transaction locks.
- **Booking Confirmation**: All business logic checks pass, database capacity allocations are secured, and the booking state changes to `CONFIRMED`.

---

## 3. Discrepancy & Recovery Logic
If a webhook delivery fails or database checks return an ambiguous state (e.g. database indicates payment failed but webhooks report success):
- **Provider API Reconciliation**: Before executing any irreversible business action (e.g. confirming a booking, canceling a reservation, or releasing a hold), the system must query the provider's REST API directly using the payment identifier to obtain the authoritative gateway status.
- **Polling Fallback**: If the browser session expires before webhook processing completes, a background worker reconciles unresolved slot holds against the payment gateway logs before releasing the slots back to the public pool.

---

## 4. Webhook/Callback Race Mitigation

```
[User Completes Checkout Page]               [Razorpay Server]
             |                                       |
     (Browser Redirects)                     (Webhook Triggered)
             |                                       |
             v                                       v
      [Frontend Endpoint]                    [Backend Endpoint]
             |                                       |
    {Checks Status in DB}                   {Verifies Webhook Checks}
    - If Webhook arrived first:             - Reconcile Payment
      Displays confirmation immediately.     - Update Booking State to CONFIRMED
    - If Webhook is delayed:                 - Commit Transaction
      Show spinning loading state.
```

- **Mitigation Protocol**: If the browser redirect arrives before the webhook: the client polls `/api/v1/bookings/status` up to 5 times (exponential backoff). If the webhook still hasn't completed reconciliation, the backend shows a "Payment Processing" view to the user and releases the page thread.
