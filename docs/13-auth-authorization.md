# Authentication & Authorization: Quantum Living Solutions

This document details user authentication pathways, secure booking-access capability tokens, and the Role-Based Access Control (RBAC) permission matrix.

---

## 1. Secure Booking Access: Hashed Capability Tokens

To minimize friction, customer accounts are not required. Access to view or manage individual booking details is governed by a secure, revocable, and rotatable **Opaque Capability Token** system.

```
[ Customer Submits Booking ] 
            |
            v
 { Generate Cryptographically Secure 32-Byte Opaque Token }
            |
            +------> [ Send raw token in link to email/SMS ] 
            |
            v
 { Hash token with SHA-256 }
            |
            v
 [ Store hashed token, booking ID, scope, and expiry in DB ]
```

### Access Token Specification
1. **Opaque Token Generation**: The server generates a cryptographically random, high-entropy 32-byte token (base64url encoded). The raw booking UUID is never used for authorization.
2. **Server-Side Hashing**: The server hashes the token using `SHA-256` and stores only this hash in the database, bound to the `booking_id` and the specific allowed scope (e.g., `scope: "manage_booking"`).
3. **Lifespan**: Token default lifespan is 7 days from creation, expiring immediately 24 hours after the scheduled slot start.
4. **Instant Invalidation**: If any sensitive booking state changes (e.g., date rescheduled, client email/phone updated, booking cancelled), the current token hash is deleted from the database. A new random token is generated and emailed to the user, invalidating the old link immediately.
5. **No Token Payload**: The token is completely opaque; it contains no database IDs, booking details, or payment payloads.

### Leakage Risks & Mitigations

URLs containing tokens are vulnerable to leakage. We enforce these strict mitigations:

| Leakage Risk Vector | Mitigation Mechanics |
| :--- | :--- |
| **Referrer Headers** | Enforce a strict `Referrer-Policy: no-referrer` or `same-origin` on routes processing the token, preventing external sites from reading the URL parameter. |
| **Browser History & Logs** | **URL Token Exchange**: The initial route `/book-demo/manage?token=...` is a server-side route handler. It verifies the hashed token against the database, sets a short-lived (15 min), secure, `HttpOnly`, `SameSite=Lax` session cookie, and immediately redirects the user to a clean URL (e.g. `/book-demo/details` with all query parameters stripped). |
| **Telemetry & Analytics** | Third-party script trackers (Google Analytics, Meta Pixel) are **forbidden** on routes that handle/verify access tokens. |
| **Log Leakage** | Logger pipelines automatically redact raw query string tokens (SHA-256 prefixes or correlation IDs are logged instead). |

---

## 2. Recovery & Abuse Prevention
If a user loses their confirmation link:
- **Generic Acknowledgment**: The recovery input form (`/book-demo/recover`) accepts email or phone. To prevent **existence enumeration**, the system returns a uniform success response: *"If a matching active booking is found, a new access link has been sent."*
- **Verification OTP**: The server generates a new random token and dispatches it.
- **Rate Limiting**: Recovery submissions are rate-limited to a maximum of **3 attempts per email/IP per hour** to prevent brute-force probing.

---

## 3. Internal Staff Authentication & Authorization
Administrative dashboard users authenticate via credentials combined with mandatory Multi-Factor Authentication (MFA).
- **Credentials**: Email and high-entropy password (hashed with Argon2id).
- **MFA Requirement**: Google Authenticator/TOTP validation code is verified during the second step of login.
- **Session Security**: Session tokens are stored in `HttpOnly`, `Secure`, and `SameSite=Strict` cookies.

---

## 4. RBAC Permission Matrix

| Role | Read Leads | Edit Leads | Manage Bookings | Process Refunds | System Config | Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | Yes | Yes | Yes | Yes | Yes | Yes |
| **ADMIN** | Yes | Yes | Yes | Yes | No | Yes |
| **SALES** | Yes | Yes | Yes | No | No | No |
| **DEMO_MANAGER** | Yes | No | Yes | No | No | No |
| **FINANCE** | Yes | No | No | Yes | No | No |
| **SUPPORT** | Yes | Yes | No | No | No | No |
| **READ_ONLY** | Yes | No | No | No | No | No |
