# Observability: Quantum Living Solutions

This document outlines metrics tracking, structured logs, and dashboard setup parameters.

---

## 1. Structured Logging Schema
Logs are generated as single-line JSON objects, permitting simple analysis in cloud storage engines (e.g. Datadog, Axiom, or Vercel Logs).

```json
{
  "timestamp": "2026-07-06T18:13:38Z",
  "level": "INFO",
  "requestId": "req-9b1deb4d-3b7d-4bad",
  "context": "booking_service",
  "message": "Demo slot booking hold created",
  "data": {
    "slotId": "slot-2b0d7b3dcb6d",
    "holdId": "hold-d2e5b7cf53f1",
    "expiresAt": "2026-07-06T18:25:00Z"
  }
}
```
*Note: Any log entries matching PII or credentials are automatically filtered out (see [error-handling.md](file:///c:/Users/SudhanshuV_Ext/Desktop/test/quantum-living-solutions/docs/14-error-handling.md)).*

---

## 2. Platform Core Metrics
The operational health is validated using these key parameters:

- **Performance & Latency**:
  - Request Latency (p50, p95, p99 limits).
  - WebGL Canvas initialization rate.
- **Conversion & Funnel**:
  - Hold-to-Booking confirmation rate.
  - Payment failure distribution.
- **System Stability**:
  - Webhook delivery signature validation failure rate.
  - Slot capacity conflict warnings.
  - Database connection pool utilization rate.

---

## 3. Alerts and Threshold Rules
- **Critical Alert**: Trigger SMS/Slack alerts if the Stripe/Razorpay Webhook API endpoints return 5xx errors for > 3 consecutive requests.
- **Security Alert**: Trigger immediate admin alerts if login failure rate exceeds 15 attempts within a 5-minute interval.
