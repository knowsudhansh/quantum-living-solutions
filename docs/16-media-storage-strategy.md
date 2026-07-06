# Media and Storage Strategy: Quantum Living Solutions

This document establishes the media processing, optimization, and storage strategy.

---

## 1. Asset Storage Policies
- **Code Repository (Git)**:
  - **Allowed**: SVG icons, interface components, CSS stylesheets.
  - **Prohibited**: High-res images, pre-rendered videos, 3D model files (`.glb`), raw photographs, resumes, PDFs.
- **Media Storage (External)**:
  - High-res media files reside in S3-compatible object storage (e.g. Cloudflare R2 or AWS S3) coupled with an image optimization CDN (e.g. Cloudinary, Vercel Image Optimization, or imgix).
  - Career resumes and customer attachments are uploaded to isolated, non-public object storage buckets with signed-URL expiry access keys.

---

## 2. Media Delivery Decision Matrix

To optimize page loading speed and performance across all viewports, media choices must align with this decision matrix:

| Format / Strategy | Best For | Pros | Cons | Mitigation / Constraints |
| :--- | :--- | :--- | :--- | :--- |
| **Short MP4/WebM Loops** | Simple ambient animations (e.g. background curtains moving, status indicators). | Low request overhead; native browser rendering optimization; simple caching. | Large file size if duration exceeds 5s; no scrubbing compatibility. | Keep loops under 5 seconds. Target file size < 500 KB. Encode in dual formats (WebM/VP9 primary, MP4/H.264 fallback). |
| **Progressive Video** | Mid-length non-interactive cinematic introductions (< 15 seconds). | Simple server setup; browser starts playback before full download finishes. | High CPU usage on mobile screens; poor timeline scrubbing synchronization. | Do not use for scroll-controlled sequences. Compress with high-compression profiles. |
| **HLS / Adaptive Streaming** | Long cinematic sequences (> 15 seconds) or variable bandwidth environments. | Adjusts video quality dynamically to network speed; breaks video into small chunks. | High request overhead due to manifest and segment downloads; complex pipeline. | Restrict to high-end desktop mode for scenes with high duration. Segment into 2s chunks. |
| **Image Sequences** | High-fidelity scroll-controlled transitions (scrubbing frames directly). | Absolute, pixel-perfect synchronization with scroll position; zero seek latency. | Extremely high asset file count; can saturate network connection if unoptimized. | Preload adjacent images in a canvas buffer. Use highly compressed WebP format (< 80 KB per frame). |
| **Real-Time 3D (WebGL)** | Custom configurations in the interactive smart-space page (`/experience`). | Fully interactive; user can rotate, adjust colors, and configure rooms. | Highest GPU and memory overhead; crashes legacy and mobile browsers. | Disabled on devices with < 4GB RAM or when battery-saver / reduced-motion is detected. |

---

## 3. Media Formats & Target Budgets
- **Images**:
  - Format: WebP or AVIF exclusively.
  - Quality Level: 75-80% compression.
  - Target Resolution: Width responsive up to 1920px (no raw camera files).
- **3D Assets**:
  - Format: GLTF Binary (`.glb`) with Draco mesh compression.
  - Target File Size: < 1.5 MB per model asset.

---

## 4. Dynamic Optimization
- **Lazy Loading**: Native browser `loading="lazy"` on all images outside the primary viewport.
- **Preload Strategy**: Preload only the logo, primary typeface, and the first cinematic scene backdrop of the homepage.
- **Cache-Control**: Set static media headers to:
  `public, max-age=31536000, immutable`
