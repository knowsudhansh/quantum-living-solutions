# API Architecture: Quantum Living Solutions

This document details the public and administrative backend API schemas and security boundary protocols.

---

## 1. REST Endpoints & Payloads

### Public API Route Handlers

#### `POST /api/v1/bookings/hold`
- **Purpose**: Reserve a slot temporarily while filling details/paying.
- **Request Payload**:
  ```json
  {
    "slot_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "hold_id": "c9a6364b-2522-4a0b-93ff-d2e5b7cf53f1",
    "expires_at": "2026-07-06T18:25:00Z"
  }
  ```

#### `POST /api/v1/bookings/checkout`
- **Purpose**: Finalize a booking request, initiate payment workflow.
- **Request Payload**:
  ```json
  {
    "hold_id": "c9a6364b-2522-4a0b-93ff-d2e5b7cf53f1",
    "customer": {
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "phone": "+919876543210"
    },
    "payment_choice": "DEPOSIT", 
    "project_details": {
      "property_type": "VILLA",
      "budget_range": "HIGH",
      "location": "Bengaluru"
    }
  }
  ```
- **Response**: Returns the normalized checkout session ID and payment order details.

---

## 2. Webhook Schema & Verification

### `POST /api/v1/payments/webhooks/razorpay`
- **Payload Structure**:
  ```json
  {
    "entity": "event",
    "account_id": "acc_BF1234567890",
    "event": "payment.captured",
    "contains": ["payment"],
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_FN5432109876",
          "amount": 50000,
          "currency": "INR",
          "status": "captured",
          "order_id": "order_EK9876543210",
          "email": "jane@example.com"
        }
      }
    },
    "created_at": 1783362000
  }
  ```

---

## 3. Server-to-Server Security Boundaries
- **Encrypted Payloads**: Transmit payloads over TLS 1.3 exclusively.
- **Webhook Signature Validation**: Reject payloads immediately if the header signature does not match `HMAC-SHA256(webhook_secret, raw_payload_body)`.
- **Private API Gateway**: CRM dashboard interactions are proxied via server-side session authentication. No database connections are exposed to the client directly.
