# Technical Architecture: Quantum Living Solutions

## 1. Monolith vs. Microservice Decision
To maintain low operational costs and simplicity during development and initial launch phases, we utilize a **Monolithic Next.js Full-Stack Architecture**. This combines server-rendered React components, API routes, and background jobs within a single, deployable unit. We explicitly avoid microservices to prevent network overhead and complex orchestration costs during Stage 1 and Stage 2.

---

## 2. Framework & Layout Structure
- **Framework**: Next.js (App Router).
- **Hosting**: Vercel (Initial stage, scalable to multi-region).
- **Backend API Routes**: Implemented under `/app/api/*` utilizing Next.js serverless route handlers.
- **Client State**: Minimal client state (Zustand for modal and filter state, React Query for server cache).

---

## 3. Strict Architectural Separation of Concerns

```
+-----------------------------------------------------------------------+
|                         DOM Layer (Standard HTML)                     |
|  - Navigation Links    - Booking Calendar Forms  - Legal Text         |
|  - Contact Details     - Payment Button Widgets  - Error Messages     |
+-----------------------------------------------------------------------+
                                  |
               (Layers run in parallel, isolated)
                                  |
+-----------------------------------------------------------------------+
|                    Cinematic Overlay / WebGL Layer                    |
|  - Three.js Canvas     - GSAP Scroll Engine      - High-Res Video     |
+-----------------------------------------------------------------------+
```

### Cinematic Decoupling Policy
To protect conversion and accessibility:
- **Zero Blockers**: The WebGL/3D Canvas and GSAP scroll timelines must sit in a separate z-index layer behind or beside standard HTML markup.
- **Independent Mount Lifecycle**: The critical DOM (booking form, navigation, legal disclosures) must render and function immediately on page load, even if the cinematic engine is still downloading, processing, or has thrown a runtime WebGL/driver error.
- **Fail-Safe Mechanism**: The UI wrapper script must wrap WebGL initialization in a `try/catch` block. If initialization fails:
  1. The canvas container is hidden (`display: none`).
  2. A clean, static architectural WebP background image is display-mounted.
  3. A console warning is logged, but the page does not crash, and all inputs remain fully interactive.
- **No Heavy Scripts in Main Bundle**: Three.js, GSAP, and associated assets must be dynamically imported with `next/dynamic` (`ssr: false`) to prevent inflating the initial JavaScript bundle of critical business pages (e.g., booking confirmation, payment callback, checkout, CRM).
