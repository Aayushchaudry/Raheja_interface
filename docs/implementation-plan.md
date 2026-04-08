# Implementation Plan

## Phased Approach

The build is split into 5 phases. Each phase produces a working, demoable state.

---

## Phase 0: Project Scaffolding (Foundation)

**Goal**: Empty app running with all tooling configured.

### Tasks
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install all dependencies (Three.js, R3F, GSAP, Howler, Zustand, Tailwind)
- [ ] Configure Tailwind with custom colors (`gold`, `charcoal`, `pearl`)
- [ ] Set up Zustand store with screen state machine
- [ ] Create `App.tsx` with screen switcher (renders correct screen component based on state)
- [ ] Create placeholder files for all 7 screen components (empty shells)
- [ ] Set up `/public/assets/` directory structure
- [ ] Download/create placeholder images (8 architectural photos from Unsplash)
- [ ] Download placeholder audio files (ambient drone, chime, cello note)
- [ ] Download/create a placeholder 3D skyscraper model (.glb)
- [ ] Download 5 short stock video clips for testimonials
- [ ] Self-host fonts (Playfair Display + Inter)
- [ ] Create `constants.ts` with color values, timing, screen enum
- [ ] Build `LoadingScreen.tsx` with gold progress bar

### Deliverable
App loads, shows loading screen, then renders a blank screen component. All assets accessible.

---

## Phase 1: Screens 1 & 7 — Bookends (Standby + Reset)

**Goal**: The start and end states work, including the inactivity auto-reset loop.

### Tasks
- [ ] **Screen 1 — Standby**
  - [ ] Charcoal background, centered breathing orb (GSAP scale animation)
  - [ ] Radial glow effect (CSS radial-gradient + blur)
  - [ ] Golden lines SVG pattern with stroke-dashoffset animation
  - [ ] Raheja Luxe logo (top-left, gold gradient text placeholder)
  - [ ] Center text with pulsing opacity
  - [ ] Touch handler → expanding white circle transition
  - [ ] Ambient drone audio (looping)
  - [ ] Cello swell on touch

- [ ] **Screen 7 — CTA**
  - [ ] Background with blurred 3D model (or static image placeholder initially)
  - [ ] Golden arrow with pulse animation
  - [ ] Right-edge light bar CSS animation
  - [ ] CTA text
  - [ ] Auto-fade to black after 30s

- [ ] **Inactivity System**
  - [ ] `useInactivityTimer` hook — resets on any pointer event
  - [ ] `InactivityOverlay` — fade-to-black overlay component
  - [ ] Global: Screen 7 timeout → Screen 1 transition

- [ ] **Transition System**
  - [ ] `TransitionWipe` component — supports: expanding circle, fade-to-black, slide
  - [ ] Wire up Screen 1 → Screen 2 transition (expanding circle)
  - [ ] Wire up Screen 7 → Screen 1 transition (fade to black)

### Deliverable
Full loop: Standby → (touch) → placeholder Screen 2 → ... → CTA → (30s) → Standby. The experience can run forever unattended.

---

## Phase 2: Screens 2 & 3 — The Timeline (Core Interaction)

**Goal**: The drag-to-scroll golden thread carousel and milestone detail view.

### Tasks
- [ ] **Screen 2 — Timeline Carousel**
  - [ ] Soft-focus background image
  - [ ] Horizontal carousel of milestone cards (data-driven from `milestones.ts`)
  - [ ] Golden thread line rendering (Canvas/SVG)
  - [ ] Drag interaction: finger drags thread → carousel scrolls
  - [ ] Particle trail following finger (WebGL particles via R3F)
  - [ ] Inertia + magnetic snap on release (GSAP)
  - [ ] Card scale/opacity based on distance from center
  - [ ] Prompt text with fade-out on first interaction
  - [ ] Progress dots at bottom
  - [ ] Metallic shimmer audio on drag
  - [ ] Chime audio on snap

- [ ] **Screen 3 — Milestone Discovery**
  - [ ] Large photo frame with sepia image
  - [ ] Stat overlay bar with counting number animation
  - [ ] Narrative text
  - [ ] Tap → ripple effect (Canvas overlay)
  - [ ] Ripple reveals modern photo underneath
  - [ ] Toggle back on second tap
  - [ ] Swipe left/right to navigate milestones
  - [ ] Back button to return to carousel
  - [ ] Water-ping audio on tap
  - [ ] Cello sustain on morph complete
  - [ ] Transition to Screen 4 after last milestone

### Deliverable
Full Act 1 experience: drag the golden thread, browse milestones, tap to reveal modern buildings.

---

## Phase 3: Screen 4 — Constellation (Emotional Peak)

**Goal**: Starfield of family dots with video testimonials.

### Tasks
- [ ] **Dot Field**
  - [ ] Canvas rendering of 2000 drifting dots
  - [ ] Different sizes, colors (pearl + gold), opacity/blur for depth
  - [ ] Touch repulsion physics
  - [ ] 5 "active" dots with subtle pulse glow

- [ ] **Video Testimonials**
  - [ ] Tap active dot → expands to circular frame (GSAP elastic)
  - [ ] HTML5 video plays inside circle (CSS `clip-path: circle()`)
  - [ ] Gold quote text below
  - [ ] Tap outside to close
  - [ ] Tap another active dot → swap

- [ ] **UI + Flow**
  - [ ] Entry text with 3s fade-out
  - [ ] "10,000+ Happy Families" legend
  - [ ] "Continue" button appears after 1+ video watched
  - [ ] Transition: dots converge → flash → Screen 5

- [ ] **Audio**
  - [ ] Ethereal ambient pad
  - [ ] Bell chime on dot tap
  - [ ] Video audio crossfade with ambient

### Deliverable
Fully interactive constellation. Tap dots, watch videos, feel the emotional weight.

---

## Phase 4: Screens 5 & 6 — The Finale (Game + 3D Reveal)

**Goal**: The validation game and the showstopper 3D reveal.

### Tasks
- [ ] **Screen 5 — Trust Compact**
  - [ ] Split-screen layout (luxury detail right, legacy vault left)
  - [ ] Compass rose SVG (center, rotating)
  - [ ] Touch luxury image → golden line starts
  - [ ] Line follows finger, routes through compass rose (Bezier curve)
  - [ ] Drop on legacy icon → validation burst
  - [ ] Drop on empty → line retracts
  - [ ] "VALIDATED" text + background color shift
  - [ ] String-pull audio, harmonic chime, validation click + swell
  - [ ] Transition: gold lines rush to center → Screen 6

- [ ] **Screen 6 — Luxe Reveal**
  - [ ] R3F Canvas with loaded .glb model
  - [ ] Animated golden lines converging from edges (Canvas overlay or R3F lines)
  - [ ] Lines form wireframe geometry
  - [ ] Custom shader: wireframe → textured morph (bottom-to-top progress)
  - [ ] Slow auto-rotation
  - [ ] Ambient gold particles post-reveal
  - [ ] Headline + sub-text fade-in
  - [ ] Building orchestral audio sequence
  - [ ] Auto-transition to Screen 7 after 5 seconds

### Deliverable
Complete end-to-end experience from Standby through the full 3D reveal and CTA.

---

## Phase 5: Polish & Optimization

**Goal**: 60fps everywhere, smooth audio, pixel-perfect visuals, kiosk-ready.

### Tasks
- [ ] Performance profiling on target hardware
- [ ] Frame rate optimization (reduce particles, simplify shaders if needed)
- [ ] Audio crossfading between screens (no abrupt cuts)
- [ ] Transition timing polish (ease curves, durations)
- [ ] Touch feedback on all interactive elements (scale bounce)
- [ ] Loading screen design polish
- [ ] 4K resolution testing
- [ ] Edge cases: rapid tapping, multi-touch rejection, mid-transition touches
- [ ] Memory leak audit (dispose Three.js geometries/materials on screen exit)
- [ ] Production build + asset compression
- [ ] Browser kiosk mode testing (Chrome `--kiosk` flag)
- [ ] Sound design balance pass (relative volumes)

### Deliverable
Production-ready experience for the 65" 4K kiosk.

---

## Phase Summary

| Phase | Screens | Effort Estimate | Key Risk |
|---|---|---|---|
| 0 | Setup | Foundation | Missing/incompatible packages |
| 1 | 1, 7 | Bookends | Transition system complexity |
| 2 | 2, 3 | Core interaction | Drag + particle performance |
| 3 | 4 | Constellation | 2000 dots + video at 60fps |
| 4 | 5, 6 | Finale | 3D shader + model loading |
| 5 | All | Polish | Device-specific perf issues |

## Execution Order Rationale

- **Phase 0 first**: Can't build anything without scaffolding.
- **Phase 1 (bookends)**: Establishes the loop. Every future screen slots in between.
- **Phase 2 (timeline)**: The most interaction-heavy screens. Proving drag + particles early de-risks the whole project.
- **Phase 3 (constellation)**: Independent module. Canvas dot field is a contained challenge.
- **Phase 4 (finale)**: 3D is the most complex rendering. Left later because the placeholder model may change.
- **Phase 5 (polish)**: Never polish before features are complete.
