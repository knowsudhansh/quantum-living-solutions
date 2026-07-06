# Error Handling & Logging Architecture: Quantum Living Solutions

This document details runtime error strategies, user-facing error formats, and strict log redaction standards.

---

## 1. Standardized Error Taxonomy
All API routes return uniform error payloads conforming to the API error contract.
- **VALIDATION_ERROR**: Form input validation failure (code 400).
- **UNAUTHORIZED**: Missing or invalid session tokens/magic links (code 401).
- **FORBIDDEN**: Insufficient RBAC clearance for action (code 403).
- **SLOT_UNAVAILABLE**: Booking request target slot is full or blocked (code 409).
- **PAYMENT_GATEWAY_ERROR**: External billing driver/API timeout (code 502).
- **INTERNAL_SERVER_ERROR**: Unexpected database failure or uncaught code error (code 500).

---

## 2. API Error Contract
Errors returned to the client must use a structured JSON schema:
```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "The selected time slot is no longer available.",
    "requestId": "req-9b1deb4d-3b7d-4bad"
  }
}
```
*Note: Internal stack traces, query parameters, or file systems are never exposed in the error response.*

---

## 3. Strict Logging Policy: Minimization & Redaction

> [!IMPORTANT]
> To comply with data privacy standards and security policies, log files must never contain credentials, secrets, or sensitive PII.

- **Data Minimization**: Only emit the minimum operational context necessary to debug an issue.
- **Strict Redaction Targets**: Filters in the logger pipeline must automatically strip or replace:
  - Text fields containing `password`, `token`, `secret`, `key`, `cvv`, `card`, `mfa`.
  - Customer personal details (emails, phone numbers).
- **Permitted Context**:
  - Request IDs, User ID, Booking ID (UUIDs only).
  - Controller Name, Method, and Standard Error Codes.
  - Duration/Latency measurements.

---

## 4. Retries, Backoffs, and Circuit Breakers
- **Database Retries**: Retry queries aborted by transaction conflicts (e.g. serialization errors) up to 3 times with small jittered backoffs.
- **External API Timeouts**: Impose a strict **5-second timeout** on payment gateway API requests.
- **Circuit Breaker**: Track client errors to external APIs. If error rates exceed 50% over a 60-second window, break the circuit for 30 seconds, returning a local fallback error immediately.
