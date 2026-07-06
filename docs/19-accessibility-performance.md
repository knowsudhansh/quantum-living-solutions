# Accessibility & Performance Guidelines: Quantum Living Solutions

This document establishes the user interface accessibility criteria and frontend rendering budgets.

---

## 1. Accessibility Baseline: WCAG 2.2 AA
To ensure inclusion without compromising creative cinematic presentation:
- **Baseline Requirement**: The entire public site, booking engine, and administrative CRM must pass WCAG 2.2 Level AA guidelines.
- **Key Baseline Targets**:
  - Focus Indicator: All links, forms, and interactive inputs must have a distinct, visible outline on focus.
  - Text Contrast: Minimum contrast ratio of **4.5:1** for body text and **3:1** for large heading components.
  - Form Fields: Explicit labels linked to form inputs via `htmlFor`. No placeholder-only labels.
- **Selective WCAG Level AAA Targets**:
  - Apply AAA standard (7:1 contrast ratio) selectively to non-cinematic static informational views, such as legal pages, documentation lists, and pricing sheets.
  - Booking fields are keyboard navigatable with no keyboard traps (user can enter, fill, and exit via TAB key).

---

## 2. Accessibility with Cinematic Content
- **Text Over Video**: Any text positioned over a video backdrop must have a high-contrast backing layer, such as a subtle dark overlay gradient (minimum opacity 0.5) to keep contrast ratios AA-compliant.
- **No Autoplay Audio**: Soundscapes or ambient audio on cinematic pages must be muted by default. They can only play after explicit, conscious user interaction (click of sound control toggle).
- **Reduced Motion**: If a user has `prefers-reduced-motion: reduce` configured in their browser:
  - Disable all GSAP scroll scrubbing.
  - Disable the canvas/WebGL background frames.
  - Deliver text contents instantly in standard stack configurations.

---

## 3. Measurable Web Performance Budgets

To keep pages fast and responsive, we define strict performance limits. Release builds will fail validation tests if these budgets are violated.

### Page Performance KPIs

| Metric | Target (Ideal) | Release Gate (Hard Limit) |
| :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | < 1.8 seconds | < 2.5 seconds |
| **INP (Interaction to Next Paint)** | < 100 milliseconds | < 200 milliseconds |
| **CLS (Cumulative Layout Shift)** | < 0.05 | < 0.1 |
| **FID (First Input Delay)** | < 50 milliseconds | < 100 milliseconds |

### Initial & Deferred JavaScript Size Budgets

- **Initial Main JS Bundle**: < **120 KB** (gzipped). Includes only React, Next.js hydration logic, and layout utilities.
- **Deferred JS Libraries**: < **300 KB** (gzipped). Includes GSAP, Three.js, and Draco compression loaders. These must be dynamically imported only on views requiring animations.

### Media & Asset Budgets (By Device Profile)

| Asset Class | High-End Desktop | Average Laptop | Modern Mobile | Lower-Performance Mobile |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Load Payload** | < 2.0 MB | < 1.5 MB | < 800 KB | < 450 KB |
| **Deferred Media Size** | < 12.0 MB | < 6.0 MB | < 3.0 MB | < 1.0 MB |
| **3D Mesh Size (Draco GLB)**| < 1.5 MB | < 800 KB | < 350 KB | (Disabled) |
| **Max Texture Dimensions** | 2048 x 2048 | 1024 x 1024 | 512 x 512 | (Disabled) |
| **Video Bitrate** | 5 Mbps (1080p WebM)| 2.5 Mbps (720p WebM) | 1.2 Mbps (480p WebM) | (Disabled) |

---

## 4. Video & Fallback Segment Strategy
- **Video Segmenting**: Videos longer than 15 seconds are divided into 2-second chunks (`HLS` or `DASH` structures) and streamed progressively. Short background elements under 5 seconds are delivered as static loops (WebM/MP4) to optimize caching.
- **Mobile & Low-Performance Fallbacks**:
  - If WebGL initialization fails or is disabled (devices with < 4GB RAM), the canvas element is unmounted.
  - The backdrop is replaced with responsive CSS background grids using optimized, compressed static WebP images (< 80KB each).
  - All scroll scrubbing transitions default to basic CSS opacity fades.
