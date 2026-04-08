# Screen Specifications

Detailed spec for each of the 7 screens. Each section covers: visual layout, UI elements, interactions, animations, audio, and transition to next screen.

---

## Screen 1: Standby (Attraction State)

### Purpose
Attract passing visitors. Runs indefinitely until touch.

### Visual Layout
- **Background**: Solid charcoal `#1A1A1B` filling entire viewport.
- **Center**: A pearl-white `#F8F9F9` glowing orb that "breathes" — scales between 0.8x and 1.2x with a 3-second ease-in-out loop.
- **Golden lines**: Thin golden `#D4AF37` lines extend from screen edges toward center, forming an incomplete geometric pattern (like cracked gold leaf). These lines subtly pulse in sync with the breathing orb.
- **Top-left**: Raheja Luxe logo in gold foil texture. Fixed position, ~120px height at 4K.

### UI Elements
- **Center text** (below orb): *"The legacy is in the details. Touch to begin."* — Pearl white, serif font, opacity pulses 0.6 → 1.0 in sync with breathing.
- **No other UI** — clean, minimal, magnetic.

### Interaction
| Input | Response |
|---|---|
| Touch the gold orb (or anywhere on screen) | Trigger transition to Screen 2 |

### Animation Detail
- **Breathing orb**: `scale` oscillation via GSAP timeline, looping. Uses a radial gradient with blur for glow effect.
- **Golden lines**: SVG paths with `stroke-dashoffset` animation — lines slowly draw and retract.
- **On touch**: The orb rapidly expands (scale → 20x) with opacity fade to white, covering the entire screen. Duration: 800ms, ease: `power2.in`. This acts as the wipe transition into Screen 2.

### Audio
- **Ambient**: Low, continuous deep hum/drone (looping, volume 0.15).
- **On touch**: A single resonant cello note, swelling. Duration ~2s.

### Transition Out
Expanding white circle wipe → fade into Screen 2.

---

## Screen 2: Act 1 — The Timeline of Trust (Tracing)

### Purpose
Visitor drags finger along a golden thread, pulling a horizontal carousel of Raheja project milestones.

### Visual Layout
- **Background**: Soft-focus architectural photo (blurred, desaturated), covering full viewport.
- **Golden thread**: A thick golden line (`#D4AF37`, ~4px) running horizontally across the screen at vertical center. It starts from the left edge.
- **Carousel**: A horizontal strip of project cards behind/along the thread. Cards are circular or rounded-square frames containing project images.

### UI Elements
- **Top prompt**: *"Trace the thread to prove our promise."* — Gold text, fades out after first interaction.
- **Progress indicator**: Subtle dots at bottom showing how many milestones exist vs. how far the user has scrolled.
- **Each card**: Project image + year label + project name below.

### Carousel Content (Placeholder)
| # | Year | Project Name | Image |
|---|------|-------------|-------|
| 1 | 1990 | Raheja Residency | placeholder-1.jpg |
| 2 | 1995 | Raheja Heights | placeholder-2.jpg |
| 3 | 2000 | Raheja Gardens | placeholder-3.jpg |
| 4 | 2005 | Raheja Towers | placeholder-4.jpg |
| 5 | 2010 | Raheja Enclave | placeholder-5.jpg |
| 6 | 2015 | Raheja Pinnacle | placeholder-6.jpg |
| 7 | 2020 | Raheja Crown | placeholder-7.jpg |
| 8 | 2024 | Raheja Luxe | placeholder-8.jpg |

### Interaction
| Input | Response |
|---|---|
| Drag finger horizontally along the thread | Thread "ignites" with gold particle trail. Carousel scrolls in sync with finger position |
| Release finger | Carousel snaps to nearest milestone card with spring physics |
| Tap a milestone card | Transition to Screen 3 with that milestone's data |

### Animation Detail
- **Thread ignition**: As finger moves, gold particles spawn along the thread behind the finger. Particles: GPU instanced points via R3F shader, ~200 particles, lifetime 1.5s, fade out + float upward.
- **Carousel motion**: Cards have parallax — front card at 1x speed, background elements at 0.5x. Cards scale up when centered.
- **Magnetic snap**: On release, GSAP `snap` with `inertia` plugin — carousel decelerates naturally and locks to nearest card.

### Audio
- **Thread drag**: Continuous metallic shimmer sound, pitch increases with drag speed.
- **Snap to card**: Soft chime on each snap.

### Transition Out
Tapping a milestone card → card scales up to fill viewport → crossfade into Screen 3.

---

## Screen 3: Act 1 — Milestone Discovery (The Era of Reliability)

### Purpose
Show a single milestone in detail. Visitor taps an archival photo to see it transform into a modern shot — proving the building's longevity.

### Visual Layout
- **Background**: Soft warm gradient (charcoal → sepia tint).
- **Center**: Large photo frame (16:9, ~60% viewport width). Initially shows a sepia-toned archival photo.
- **Overlay stats**: A translucent bar across the bottom of the photo with the stat text.

### UI Elements
- **Stat overlay**: *"Built to Last: 30 Years of Structural Integrity."* — Gold text on dark translucent bar.
- **Narrative text** (below photo): *"Craftsmanship is our oldest habit."* — Pearl white, italic serif.
- **Instruction hint** (first visit only): *"Tap the photo"* — small, fades after 3s.
- **Back button**: Top-left arrow to return to Screen 2 carousel.

### Interaction
| Input | Response |
|---|---|
| Tap the photo | Ripple effect at tap point → photo morphs from sepia archival to 4K modern shot |
| Tap again | Morphs back to sepia |
| Tap back arrow | Return to Screen 2 carousel |
| Swipe left/right | Navigate to prev/next milestone without going back to carousel |
| Wait / continue swiping to last milestone | Auto-transition to Screen 4 |

### Animation Detail
- **Ripple effect**: Canvas overlay on the photo. On tap, a circular wave distortion (like water) expands from the tap point. Duration: 600ms.
- **Photo morph**: During the ripple, the underlying image crossfades from sepia to modern. The ripple acts as a reveal mask — modern image appears inside the ripple ring as it expands.
- **Stat text**: Counts up numerically (e.g., "30 Years" counts from 0 to 30 over 1.5s).

### Audio
- **Tap/ripple**: Water-like resonant ping.
- **Morph complete**: Warm cello sustain note.

### Transition Out
Swipe past last milestone → golden thread extends from right edge → pulls Screen 4 in from right.

---

## Screen 4: Act 2 — The Constellation of Families

### Purpose
Emotional impact — thousands of dots represent happy families. Tapping a dot reveals a video testimonial.

### Visual Layout
- **Background**: Deep dark navy/charcoal `#0D0D1A` — a "night sky" effect.
- **Dots**: Thousands of floating dots in pearl-white `#F8F9F9` and gold `#D4AF37`. They drift slowly in random directions, like stars. Different sizes (2px–8px at 4K).
- **Depth of field**: Some dots are blurred (far), some are sharp (near). Parallax on device tilt or touch position.

### UI Elements
- **Center text** (appears on entry, fades after 3s): *"A legacy of life, measured in trust."* — Large serif, pearl white.
- **Legend** (bottom-right, persistent): *"10,000+ Happy Families"* — Small, gold.
- **Video frame**: Hidden initially. Appears as a circular frame when a dot is tapped.

### Dot Content (Placeholder)
5–8 dots are "active" (have video content). The rest are decorative. Active dots pulse slightly brighter.

| # | Family | Quote | Video |
|---|--------|-------|-------|
| 1 | The Sharmas | "Raheja built our future, not just our walls." | family-1.mp4 |
| 2 | The Patels | "Every detail speaks of care." | family-2.mp4 |
| 3 | The Mehtas | "Our home, our sanctuary." | family-3.mp4 |
| 4 | The Kapoors | "Trust is built brick by brick." | family-4.mp4 |
| 5 | The Desais | "A legacy we live in every day." | family-5.mp4 |

### Interaction
| Input | Response |
|---|---|
| Touch/move anywhere | Dots near touch point drift away gently (repulsion), parallax shifts |
| Tap an active dot | Dot expands into circular video frame. 15s testimonial plays. Quote appears below |
| Tap outside video | Video closes, dot returns to field |
| Tap another active dot | Previous video closes, new one opens |
| Tap "Continue" button (appears after 1+ video watched) | Transition to Screen 5 |

### Animation Detail
- **Dot field**: Canvas 2D or WebGL points. Each dot has: position (x, y), velocity (vx, vy), size, opacity, color. Updated every frame.
- **Dot expansion**: On tap, the dot scales from its current size to a 300px circle over 500ms (GSAP elastic ease). Video fades in inside the circle.
- **Touch repulsion**: Dots within 150px of touch point receive a force vector pushing them away. Spring-back when touch lifts.
- **Ambient drift**: All dots have a tiny random velocity, wrapping around screen edges.

### Audio
- **Ambient**: Soft, high-register pad sound (ethereal). Volume 0.1.
- **Dot tap**: Gentle bell chime.
- **Video plays**: Video audio fades in, ambient fades to 0.05.

### Transition Out
"Continue" button appears bottom-center after at least 1 video is viewed. On tap → dots accelerate toward center, forming a bright point → flash → Screen 5.

---

## Screen 5: Act 3 — The Trust Compact (Validation Game)

### Purpose
Interactive "connect the dots" game. Visitor drags a golden line from a new luxury detail to a historic project, validating that craftsmanship is a legacy.

### Visual Layout
- **Split screen**: 
  - **Right half**: Macro 4K image of a luxury detail (Italian marble veins, brass fitting, etc.)
  - **Left half**: "Legacy Vault" — a grid of 3–4 circular icons showing historic Raheja projects.
- **Center**: Gold compass rose icon, acting as the anchor point.
- **Background**: Charcoal with subtle radial gradient from the compass rose.

### UI Elements
- **Prompt** (top center): *"Connect the Past to the Future."* — Gold, medium serif.
- **Right image label**: *"Raheja Luxe — Italian Carrara Marble"*
- **Left icons**: Each labeled with project name + year.
- **Compass rose**: Decorative, but also the visual anchor where the golden line bends through.

### Interaction
| Input | Response |
|---|---|
| Touch the luxury detail image (right) | A golden line starts drawing from the touch point. Line follows finger |
| Drag toward left side | The golden line bends through the compass rose (magnetic snap to center) |
| Drop on a legacy icon (left) | "Connection validated" — burst animation + sound |
| Drop on empty space | Line retracts back with elastic animation |

### Animation Detail
- **Line drawing**: Real-time SVG or Canvas path from touch origin → compass rose → finger position. The line has a gold gradient, slight glow (drop-shadow filter), and subtle particle trail.
- **Compass rose**: Rotates slowly. When the line passes through it, it spins faster and glows brighter.
- **Validation burst**: On successful drop — gold particles explode from the connection point. The icon and the image pulse with gold border. Text appears: *"VALIDATED: Craftsmanship is our legacy, refined."*
- **Background shift**: On validation, background slowly brightens from charcoal to warm gold tint.

### Audio
- **Line drawing**: Metallic string being pulled — pitch rises as line gets longer.
- **Compass rose pass-through**: Resonant harmonic chime.
- **Validation**: Satisfying deep "click" + orchestral swell (cello + strings, 3s).
- **Failed drop**: Soft descending tone.

### Transition Out
After validation text displays for 3 seconds → all gold lines on screen rush toward center → transition to Screen 6.

---

## Screen 6: The Climax — Luxe Reveal

### Purpose
The payoff. All golden threads converge to form a 3D wireframe of the Raheja Luxe skyscraper, which then textures into a photorealistic render.

### Visual Layout
- **Background**: Deep charcoal `#1A1A1B`.
- **Center**: 3D model of the skyscraper, filling ~70% of viewport height.
- **Gold lines**: Animated lines rushing in from all edges, converging on the model position.

### UI Elements
- **Headline** (appears after model is textured): *"PROVEN TRUST. REFINED."* — Large, gold, all-caps, tracking wide.
- **Sub-text**: *"Step into your first true sanctuary of vision."* — Pearl white, smaller, italic.
- **No interactive elements** — this is a "sit back and watch" moment.

### Animation Sequence (Auto-Play, ~8 seconds)
| Time | Event |
|---|---|
| 0.0s | Gold lines rush from edges toward center point |
| 1.5s | Lines converge and begin forming wireframe edges of the 3D model |
| 3.0s | Wireframe complete. Model slowly rotates. Lines glow |
| 4.0s | Texture "paints" onto wireframe — spreading from base to top like liquid gold becoming concrete/glass |
| 6.0s | Model fully textured, photorealistic. Subtle environment reflections |
| 6.5s | Headline text fades in from below |
| 7.5s | Sub-text fades in |
| 8.0s | Model continues slow rotation. Ambient gold particles float |

### Animation Detail
- **Line convergence**: 50+ golden lines with varying speeds, all targeting the center. Implemented as animated SVG paths or Canvas lines.
- **Wireframe**: Three.js `WireframeGeometry` with custom `LineBasicMaterial` (gold color, emissive glow).
- **Texture reveal**: Custom shader that blends between wireframe material and PBR textured material based on a `progress` uniform that sweeps bottom-to-top.
- **Slow rotation**: `autoRotate` on OrbitControls (no user interaction, just gentle spin).

### Audio
- **Lines converging**: Building orchestral tension — low strings crescendo.
- **Wireframe forming**: Metallic construction sounds, layered.
- **Texture reveal**: Grand cello + piano chord, swelling to peak at full texture.
- **Ambient (post-reveal)**: Warm, luxurious pad. Volume 0.2.

### Transition Out
After 5 seconds of ambient state → auto-transition to Screen 7 (or on touch).

---

## Screen 7: CTA / Transition

### Purpose
Direct the visitor to the next physical wall in the showroom. Then reset for the next guest.

### Visual Layout
- **Background**: 3D model from Screen 6 moves to background (smaller, still rotating, blurred).
- **Center-right**: Large golden arrow icon, pointing right, gently pulsing.
- **Highlight strip**: A subtle golden light bar along the right edge of the screen, mimicking a physical light guiding to Wall 2.

### UI Elements
- **Text**: *"Your journey continues with the Master Architects."* — Pearl white, centered-left.
- **Arrow**: Animated gold arrow, pointing right. Pulses scale 1.0 → 1.1.
- **Physical cue text** (small, bottom): *"Proceed to Wall 2 — Coterie of Curators"*

### Interaction
| Input | Response |
|---|---|
| No interaction needed | Screen auto-resets after 30 seconds of inactivity |
| Touch anywhere | Resets inactivity timer |

### Animation Detail
- **Arrow pulse**: GSAP `yoyo` repeat animation on scale + opacity.
- **Light bar**: CSS gradient animation — a bright gold band moves top-to-bottom along the right edge in a 3s loop.
- **Background model**: Three.js scene continues from Screen 6 but with depth-of-field blur applied (post-processing).

### Audio
- **Ambient**: Continuation of Screen 6 pad, slowly fading out over 30 seconds.
- **On reset**: Soft exhale/fade sound.

### Transition Out
30-second inactivity timer expires → screen fades to black over 2 seconds → Screen 1 (Standby) breathing animation begins.
