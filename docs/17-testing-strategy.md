# Testing Strategy: Quantum Living Solutions

This document details the quality assurance verification plan and testing matrices.

---

## 1. Test Pyramid & Execution Levels

```
                     [ End-to-End Tests (Playwright) ] -> Checkout, Admin Flow
                  [ Integration / API / Contract Tests ] -> Payment signature, Webhooks
               [ Component / visual Regression (Storybook) ] -> UI states, Canvas
            [ Unit Tests (Vitest) ] -> Pricing calculators, Adapter transformations
```

- **Unit Testing**: 100% logic coverage on core adapters, pricing utilities, database locks.
- **Integration Testing**: Validate webhook routes with mock payload signatures.
- **E2E Testing**: Verify full checkout flows, slot booking holds, cancellation pages.

---

## 2. Visual Regression & Motion Testing Rules

### Visual Regression (Playwright / Storybook Visual Tests)
- Capture screenshots of critical storyboard scenes during scroll increments (0%, 25%, 50%, 75%, 100%).
- Match screenshots against baseline images. Tolerance threshold: **diff < 0.5%**.

### Motion-Heavy UI Testing
- Enforce deterministic animation durations during testing runs by setting the testing clock or overriding `requestAnimationFrame` within the test runner.
- Disable GSAP ease smoothing during automated integration tests to avoid flaky element coordinates.

---

## 3. Fallbacks and Accessibility Auditing
- **WebGL Disabling Test**: Test browser engine with WebGL driver blocked. Verify canvas wrapper catches error, removes container, and mounts static image successfully.
- **Reduced Motion Test**: Execute tests with browser emulation flag `prefers-reduced-motion: reduce`. Validate that all element positions transition immediately without delays.
- **Accessibility Verification**: Playwright-axe checks run on booking forms, navigation links, and administrative dashboard pages, asserting compliance with WCAG 2.2 AA.

---

## 4. Payment & Webhook Failures Matrix

| Test Scenario | Action / Input | Expected Database & UI State |
| :--- | :--- | :--- |
| **Signature Manipulation** | Send webhook with malformed `X-Razorpay-Signature`. | Reject 400. Booking state remains `PENDING_PAYMENT`. |
| **Duplicate Webhook** | Send webhook event ID `evt_123` twice. | Process first time. Second webhook returns 200, skips db write. |
| **Delayed Webhook** | User redirects to dashboard before webhook arrives. | UI shows loader state, polling API. Booking confirmed when webhook is written. |
| **User Abandons / Close** | Payment successful, but user closes tab before redirect. | Webhook processes transaction independently. DB marks booking `CONFIRMED`. |
| **Refund Processing** | CRM administrator clicks "Process Refund". | Database writes refund entry, Payment Adapter requests gateway. |
