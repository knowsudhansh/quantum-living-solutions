# Motion and 3D Architecture: Quantum Living Solutions

This document establishes the animation engine rules and technological boundaries for the platform.

---

## 1. Decision Matrix for Tech Stack

We select the leanest tool for the required user action to minimize overhead.

| Technology | Appropriate Use Cases | Prohibited Use Cases |
| :--- | :--- | :--- |
| **GSAP / ScrollTrigger** | Continuous scroll scrubbing, timeline synchronization of complex multi-element sequences. | Simple hover states, standard page routing transitions. |
| **Framer Motion** | React-component level entrance animations, layout shifts, modals, CRM sidebar toggles. | Scroll scrubbing of heavy multimedia scenes. |
| **Three.js / WebGL** | Real-time interactive 3D model configuration (e.g. custom layout nodes). | Simple product listings or architectural photographs. |
| **Image Sequences** | High-fidelity photorealistic room renders Scrubbed over scroll where WebGL cannot match lighting quality. | Simple UI transitions or long non-interactive loops. |
| **Pre-rendered Video** | Background loops that play autonomously without user interaction (e.g. ambient wind in curtains). | Interactive controls where the frame must align instantly with scroll. |
| **CSS Animation** | UI feedback loops, micro-interactions, loading spinners, button hover dynamics. | Page-wide complex sequence timing. |

---

## 2. WebGL & Animation Optimization Rules
- **GSAP ScrollTrigger**: Run with `scrub: true` or custom ease factors (e.g., `scrub: 0.5`). Always implement `will-change: transform` on animated elements.
- **Three.js Assets**: Use `.glb` format compressed via Draco compression.
- **Draw Calls**: Keep draw calls below **40** per scene for laptop compatibility.
- **Texture Resolutions**: Use compressed textures (Basis Universal / KTX2). Limit dimensions strictly based on device profile.

---

## 3. Fallbacks & Battery Saving
- **Network Check**: If connection speed is < 1.5 Mbps, do not load WebGL resources or pre-rendered videos. Immediately inject fallback WebP images.
- **Battery Status API**: Check `navigator.getBattery()`. If `charging === false` and `level < 0.2` (battery under 20%), disable all non-essential GSAP timelines and animations.
- **Reduced Motion**: Respect `prefers-reduced-motion` media queries by bypassing all scroll-scrub timelines and jumping directly to final target states.
