# Cinematic Homepage Storyboard: Quantum Living Solutions

This document defines the 10-act scroll-controlled story for the homepage, along with device capability detection rules, fallbacks, and performance budgets.

---

## 1. Scene-by-Scene Storyboard

```
+-------------------------------------------------------------------------+
| Act 1: Waiting Space (Daylight)                                         |
|    |                                                                    |
|    v (Scroll Down)                                                      |
| Act 2: Morning (Curtains open, daylight enters, climate panel lights up) |
|    |                                                                    |
|    v                                                                    |
| Act 3: Intelligence (Sensors glow, presence triggers pathway lights)     |
|    |                                                                    |
|    v                                                                    |
| Act 4: Ecosystem (Devices interconnect via animated data-overlay)       |
|    |                                                                    |
|    v                                                                    |
| Act 5: Evening Transition & Security (Ambient daylight fades to night)  |
|    |                                                                    |
|    v                                                                    |
| Act 6: Entertainment (Blinds drop, system screen reveals movie preset)  |
|    |                                                                    |
|    v                                                                    |
| Act 7: Night Mode (Property enters low-energy, dark space with accents) |
|    |                                                                    |
|    v                                                                    |
| Act 8: Intelligent Grid (Isometric overview map of structural nodes)    |
|    |                                                                    |
|    v                                                                    |
| Act 9: Human Comfort (Visual shifts to quiet, distraction-free room)   |
|    |                                                                    |
|    v                                                                    |
| Act 10: Call to Action (Dynamic scheduling calendar fade-in)            |
+-------------------------------------------------------------------------+
```

### Detailed Scene Breakdown

#### Act 1: The Space is Waiting
- **Purpose**: Establish architectural luxury.
- **Emotion**: Serenity, expectation.
- **Visuals**: A clean, minimalist architectural living space lit by soft, natural daylight.
- **Camera/Scroll**: Camera slowly pans forward through the entry. Scroll maps to progress.
- **IoT Action**: System offline/dormant state.
- **Technical**: Pre-rendered optimized H.265/VP9 video background on desktop; static image with lightweight CSS translation on mobile.

#### Act 2: Morning Routine
- **Purpose**: Demonstrate automated awakening.
- **Emotion**: Energy, renewal.
- **Visuals**: Curtains glide open. Warm daylight floods the floor. The climate interface panel glows softly.
- **Camera/Scroll**: Camera pivots to face the window as the user scrolls.
- **IoT Action**: Motorized blind control, solar heat harvesting, climate stabilization.
- **Technical**: WebGL room overlay or video frame scrub controls (GSAP ScrollTrigger).

#### Act 3: Presence Intelligence
- **Purpose**: Demonstrate hands-free convenience.
- **Emotion**: Surprise, comfort.
- **Visuals**: Digital presence sensor triggers a pathway lighting pattern as a virtual avatar walks.
- **Camera/Scroll**: Camera drops to track a glowing baseboard LED run.
- **IoT Action**: Lighting automation & occupancy mapping.
- **Technical**: CSS/SVG glow path rendering on canvas.

#### Act 4: Interconnected Ecosystem
- **Purpose**: Display platform intelligence.
- **Emotion**: Control, sophistication.
- **Visuals**: Dotted line overlays connect the ceiling, wall panels, and hidden speakers.
- **Camera/Scroll**: Panning back to overview the entire living room.
- **IoT Action**: Mesh network communications.
- **Technical**: WebGL shader effects or lightweight canvas line drawing.

#### Act 5: Security Shield
- **Purpose**: Instill safety and peace of mind.
- **Emotion**: Security, protection.
- **Visuals**: External shutters descend. Virtual red/amber lidar beams scan window glass, confirming locking state.
- **Camera/Scroll**: Camera pans upward to target locks on windows.
- **IoT Action**: Surveillance, intruder detection, automated lock verification.
- **Technical**: SVGs mapped on CSS 3D planes.

#### Act 6: Cinema Transformation
- **Purpose**: Showcase the entertainment capabilities.
- **Emotion**: Excitement, escapism.
- **Visuals**: High-end projector screen drops. Accent lights shift to deep ocean blue.
- **Camera/Scroll**: Camera glides back, lowering eye-level to a luxury couch.
- **IoT Action**: A/V distribution, custom scenario lighting.
- **Technical**: Video playback nested within DOM.

#### Act 7: Night-Mode Sanctuary
- **Purpose**: Energy-saving and rest operations.
- **Emotion**: Restoration, deep sleep.
- **Visuals**: Ambient lights fade completely except for low-level floor guide paths.
- **Camera/Scroll**: Panning slowly towards a dark hallway.
- **IoT Action**: High-efficiency sleep profile execution.
- **Technical**: CSS variable-controlled luminosity overlays.

#### Act 8: Complete Structural Grid
- **Purpose**: Synthesize all features in one view.
- **Emotion**: Confidence, trust.
- **Visuals**: Structural frame of the home rendered in glowing blue wireframe blueprint line art.
- **Camera/Scroll**: Camera ascends to look down at an isometric overview of the property layout.
- **IoT Action**: Comprehensive system status reporting.
- **Technical**: Three.js/WebGL wireframe geometry, or pre-rendered SVG layout.

#### Act 9: Tech Disappears
- **Purpose**: Reassure user that tech is seamless, not obtrusive.
- **Emotion**: Calmness, relief.
- **Visuals**: Wireframes fade, returning to a warm, clean, organic interior space.
- **Camera/Scroll**: Slowly dollying out.
- **IoT Action**: Background silent operation.
- **Technical**: Transition overlay with CSS opacity.

#### Act 10: Book Your Experience
- **Purpose**: Conversion.
- **Emotion**: High intent, action-oriented.
- **Visuals**: Cinematic background stops; clean, premium scheduler form fades in over dark, subtle background.
- **Camera/Scroll**: Lock camera scroll; enable scroll within booking widgets.
- **IoT Action**: Calendar scheduling and booking process.
- **Technical**: HTML/JS form layout.

---

## 2. Measurable Performance & Media Budgets

Release builds will enforce these budgets across device profiles. Detailed KPI release gates (LCP, INP, CLS) are defined in [accessibility-performance.md](file:///c:/Users/SudhanshuV_Ext/Desktop/test/quantum-living-solutions/docs/19-accessibility-performance.md).

| Budget Metric | High-End Desktop | Average Laptop | Modern Mobile | Lower-Performance Mobile |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Main JS Bundle** | < 120 KB | < 120 KB | < 120 KB | < 120 KB |
| **Initial Load Media Payload**| < 2.0 MB | < 1.5 MB | < 800 KB | < 450 KB |
| **Deferred Cinematic Media** | < 12.0 MB | < 6.0 MB | < 3.0 MB | < 1.0 MB |
| **Max WebGL Mesh Size (Draco)**| < 1.5 MB | < 800 KB | < 350 KB | (WebGL Disabled) |
| **Max Texture Dimensions** | 2048 x 2048 | 1024 x 1024 | 512 x 512 | (WebGL Disabled) |
| **Video Bitrate (VP9 WebM)** | 5 Mbps (1080p) | 2.5 Mbps (720p) | 1.2 Mbps (480p) | (Video Disabled) |
| **Lighthouse Perf Target** | 95+ | 90+ | 85+ | 80+ |

## 3. Video Segmenting & Delivery Selection
- **Asset-Specific Selection**: Apply media selection based on the media delivery decision matrix (see [media-storage-strategy.md](file:///c:/Users/SudhanshuV_Ext/Desktop/test/quantum-living-solutions/docs/16-media-storage-strategy.md)).
- **HLS Segmenting**: Segment into 2-second HLS chunks *only* for cinematic videos longer than 15 seconds to minimize request overhead on simpler assets.
- **Short Progressive Loops**: Deliver short ambient background files (under 5 seconds, e.g., Act 1 and Act 7) as highly optimized progressive WebM/MP4 files (< 500 KB) for simple browser caching.
- **Lazy Fetching**: The player retrieves segment blocks only as scroll-depth progresses. This limits bandwidth usage if the user exits the page early.

---

## 4. Progressive Enhancement & Fallback Flowchart

```
                          [Device Enters Site]
                                    |
                       {Evaluate Performance Tier}
                       /            |            \
             [High/Mid Desktop]  [Modern Mobile]  [Low-End/Reduced Motion]
                    |               |                        |
         [Real-time 3D/WebGL]   [Opt. Video Scrub]     [Static WebP Story]
         [Full Video Assets]    [Optimized Textures]   [CSS Transitions Only]
```

- **WebGL Failures / Battery Low / Reduced-Motion Detected**: Disable canvas rendering. Inject static CSS backdrop grid. Fade in high-contrast text and utilize normal CSS opacity transitions for scroll events.
