# System Overview — The Golden Thread Experience

## Project Summary

An interactive 7-screen web experience for **Raheja Luxe** designed for a 65" 4K touch display (3840x2160). The experience guides visitors through the brand's legacy using a "golden thread" metaphor — a continuous golden line that connects past craftsmanship to a new luxury project.

## Target Environment

| Property | Value |
|---|---|
| Platform | Modern browser (Chrome kiosk mode recommended) |
| Resolution | 3840 x 2160 (4K) — scales down gracefully |
| Input | Touch (primary), Mouse (fallback for dev) |
| Frame Rate | 60fps target |
| Audio | Stereo output via Web Audio API |
| Orientation | Landscape only |
| Network | Offline-capable after initial load (all assets bundled) |

## Architecture Style

**Single Page Application (SPA)** — no routing, no page reloads. The entire experience is a state machine that transitions between 7 screens. Each screen is a self-contained component with its own animations, interactions, and sound triggers.

```
┌─────────────────────────────────────────────────┐
│                   App Shell                      │
│  ┌───────────────────────────────────────────┐  │
│  │          Screen State Machine             │  │
│  │                                           │  │
│  │  Standby → Timeline → Milestone →         │  │
│  │  Constellation → Trust Compact →          │  │
│  │  Luxe Reveal → CTA → (loop to Standby)   │  │
│  └───────────────────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │ Audio    │ │ Animation│ │ Asset Loader  │   │
│  │ Engine   │ │ Engine   │ │ (preload all) │   │
│  └──────────┘ └──────────┘ └───────────────┘   │
└─────────────────────────────────────────────────┘
```

## Core Principles

1. **Performance first** — Canvas/WebGL for particle effects and 3D; DOM for text overlays. No layout thrashing during animations.
2. **Preload everything** — All images, videos, 3D models, and audio loaded before Slide 1 appears. A loading screen handles this.
3. **Touch-native** — All interactions designed for finger input. No hover states. Large touch targets (min 48px).
4. **Inactivity reset** — 30 seconds of no touch on any screen returns to Slide 1 (Standby).
5. **Asset-swappable** — All placeholder images/videos/models stored in a single `/assets` folder with clear naming. Swap files, keep names, done.

## Screen Flow Summary

| # | Screen | Key Interaction | Duration |
|---|--------|----------------|----------|
| 1 | Standby (Attraction) | Touch gold point to begin | Infinite loop |
| 2 | Timeline of Trust | Drag finger along golden thread to scroll carousel | User-paced |
| 3 | Milestone Discovery | Tap photo to morph sepia → modern | ~5s per tap |
| 4 | Constellation of Families | Tap floating dots to play video testimonials | User-paced |
| 5 | Trust Compact | Drag golden line to connect past ↔ future | Single action |
| 6 | Luxe Reveal | Auto-animation: wireframe → photorealistic | ~8s |
| 7 | CTA / Transition | View, then auto-reset after 30s inactivity | 30s timeout |

## Inactivity Handling

A global inactivity timer runs across all screens:
- **Any touch** resets the timer to 30 seconds.
- **Timer expiry** triggers a fade-to-black → Standby transition.
- **Exception**: Slide 1 is already the standby state — no timer needed there.
