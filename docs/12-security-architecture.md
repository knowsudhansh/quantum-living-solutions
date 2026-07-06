# Security Architecture: Quantum Living Solutions

This document presents a defense-in-depth security model for the platform. No system can be described as 100% secure or impossible to compromise; our goal is to minimize attack surfaces and mitigate exposure systematically.

---

## 1. Browser & Edge Security Headers

The edge router/CDN and Next.js server-response headers must enforce the following strict profiles:

- **Content Security Policy (CSP)**:
  `default-src 'self'; script-src 'self' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com; connect-src 'self' https://api.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;`
- **HSTS (HTTP Strict Transport Security)**:
  `max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options**: `DENY` (prevents clickjacking).
- **X-Content-Type-Options**: `nosniff` (mitigates MIME-sniffing exploits).
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=(), interest-cohort=()`.

---

## 2. Mitigation of Top Risks (OWASP Top 10 & API Security)

- **SQL Injection**: Enforce PostgreSQL parametrized queries and leverage Prisma ORM's typed queries. RAW SQL execution is prohibited.
- **Cross-Site Scripting (XSS)**: Next.js renders values safely by default. Any dynamic rendering of html must be heavily sanitized using DOMPurify.
- **CSRF (Cross-Site Request Forgery)**: Implement double-submit cookie patterns or custom request header tokens on administrative mutations. Session cookies must use `SameSite=Lax` or `SameSite=Strict`.
- **Insecure Direct Object Reference (IDOR)**: Booking queries and data views verify matching owner ID/session details inside the database lookup scope:
  `WHERE id = :booking_id AND lead_id = :authenticated_user_id`
- **Mass Assignment**: Sanitize incoming user JSON structures prior to ORM insertion. Do not pass client payloads directly into database setters.

---

## 3. Webhook Authentication
Razorpay webhooks must pass signature verification against a securely stored server-side HMAC-SHA256 signing secret. Payload contents are verified before database status alterations.
