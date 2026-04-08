# Animation & Interaction Guide

## The Golden Thread System

The "golden thread" is the central visual motif. It appears in every screen and connects the entire experience. This doc defines how it works technically.

### Thread Visual Properties

```
Color:        #D4AF37 (base) → linear-gradient to #F5E6A3 (highlight)
Width:        3px (idle) → 5px (active/dragging)
Glow:         box-shadow: 0 0 12px rgba(212,175,55,0.6)
Particle trail: 150–200 particles, gold, 2–6px, lifetime 1.5s
```

### Thread Rendering Approach

| Screen | Method | Reason |
|---|---|---|
| 1 (Standby) | SVG `<path>` with `stroke-dashoffset` | Simple draw/retract animation, no interaction |
| 2 (Timeline) | Canvas 2D or SVG | Real-time drawing following finger, particle overlay via WebGL |
| 5 (Trust Compact) | Canvas 2D | Dynamic path from touch origin → compass → target |
| 6 (Reveal) | Three.js `Line2` | 3D lines converging in 3D space toward model |

### Particle System Specs

Used in Screens 2, 5, and 6.

```typescript
interface GoldParticle {
  x: number;
  y: number;
  vx: number;        // velocity
  vy: number;
  size: number;       // 2–6px
  opacity: number;    // starts 1.0, fades to 0
  lifetime: number;   // 1.0–2.0 seconds
  age: number;        // current age
  color: string;      // #D4AF37 or #F5E6A3 (random)
}
```

**Rendering**: WebGL instanced points via `THREE.Points` with custom shader material. This keeps 500+ particles at 60fps easily.

**Spawn rule**: Emit 5–10 particles per frame at the current interaction point. Each particle gets a random upward + outward velocity.

**Death rule**: When `age >= lifetime`, remove from pool. Use object pooling — pre-allocate 500 particles, recycle dead ones.

---

## Per-Screen Animation Breakdown

### Screen 1: Breathing Orb

```
Animation:    GSAP timeline, infinite yoyo
Properties:   scale (0.8 → 1.2), box-shadow spread (20px → 40px)
Duration:     3s per cycle
Easing:       sine.inOut
```

**Golden lines pattern**: 12 SVG paths radiating from center. Each has a unique `stroke-dasharray` and `stroke-dashoffset` animation. Stagger: 200ms between lines. They draw in (1.5s) then retract (1.5s), looping.

### Screen 2: Thread Ignition + Carousel

**Carousel physics**:
```
Drag sensitivity:   1:1 with finger movement
Inertia on release: GSAP InertiaPlugin, decayRate: 0.95
Snap points:        Center of each milestone card
Snap strength:      GSAP snap with 0.3s duration, power2.out
```

**Thread ignition**:
- As user drags, a gold line draws from left edge to finger X position.
- Behind the finger, particles emit continuously.
- Ahead of the finger, the line is a dashed/dimmed preview.

**Card animations**:
```
Centered card:    scale 1.0, opacity 1.0, z-index 2
Adjacent cards:   scale 0.85, opacity 0.7, z-index 1
Far cards:        scale 0.7, opacity 0.4, z-index 0
Transition:       GSAP 0.4s, power2.out
```

### Screen 3: Ripple Morph

**Ripple shader** (Canvas 2D or WebGL):
```glsl
// Simplified ripple concept
float dist = distance(uv, tapPoint);
float ripple = sin((dist - time * speed) * frequency) * amplitude;
ripple *= smoothstep(radius, radius - feather, dist); // fade at edges
// Displace UV by ripple for distortion
vec2 displaced = uv + normalize(uv - tapPoint) * ripple * 0.02;
```

**Morph timeline**:
```
0ms:    Tap registered. Ripple starts at tap point.
0–300ms: Ripple expands. Inside the ripple ring, image crossfades to modern.
300–600ms: Ripple reaches edges. Entire image is now modern.
600ms+: Ripple fades. Modern image fully visible.
```

### Screen 4: Constellation

**Dot field simulation**:
```
Total dots:       2000 (canvas points, not DOM elements)
Active dots:      5–8 (have video content, pulse animation)
Update per frame: position += velocity; wrap at edges
Repulsion radius: 150px from touch point
Repulsion force:  inversely proportional to distance
Spring-back:      dots return to base velocity over 0.5s after touch lifts
```

**Dot expansion** (active dot tapped):
```
0ms:      Dot position noted
0–500ms:  Circle scales from dot size to 300px (GSAP elastic.out)
500ms:    Video element positioned inside circle, play()
500ms+:   Golden quote text fades in below circle
```

### Screen 5: Drag-to-Connect

**Line behavior**:
- Line is a Bezier curve with 3 control points: `[touchOrigin, compassCenter, fingerPosition]`.
- As finger moves, the curve updates in real-time.
- The compass rose acts as a magnetic waypoint — the line is always routed through it.

**Validation sequence**:
```
0ms:      Drop detected on valid target
0–200ms:  Line locks into place (straightens to final path)
200ms:    Gold particle burst (50 particles, explosive velocity)
200–500ms: Target icon and source image pulse gold border
500ms:    "VALIDATED" text fades in, centered
500–3000ms: Text holds, background warms
3000ms:   Transition to Screen 6 begins
```

### Screen 6: Wireframe → Textured Reveal

**Line convergence**:
```
50 lines, each with:
  - Random start position on viewport edge
  - Random speed (1.5–3.0 seconds to reach center)
  - Slight curve (quadratic bezier with random control point)
  - Stagger: lines start over a 1s window
```

**Wireframe assembly**:
```
Method:   THREE.WireframeGeometry from loaded GLB model
Material: LineBasicMaterial({ color: 0xD4AF37 })
Reveal:   Animate line segments from bottom to top using clipping plane
Duration: 1.5s
```

**Texture reveal shader**:
```glsl
uniform float progress; // 0.0 → 1.0 over 2 seconds
uniform float edgeWidth; // transition softness

float mask = smoothstep(progress - edgeWidth, progress, worldPosition.y);
// mask = 0 → wireframe, mask = 1 → textured
vec3 color = mix(wireframeColor, texturedColor, mask);
```

### Screen 7: Arrow + Reset

```
Arrow pulse:     scale 1.0 → 1.1, opacity 0.8 → 1.0, yoyo, 1.5s cycle
Light bar:       CSS keyframe, translateY(-100%) → translateY(100%), 3s, linear, infinite
Background blur: THREE.js EffectComposer + BokehPass, focus distance = 100
Fade out:        opacity 1 → 0 over 2s on timer expiry
```

---

## 60fps Strategy

1. **Separate render layers**: DOM for text/UI, Canvas/WebGL for animations. Never animate DOM layout properties (width, height, top, left). Only animate `transform` and `opacity`.
2. **RequestAnimationFrame**: All custom animations use `rAF`. GSAP handles this internally.
3. **Object pooling**: Particles are pre-allocated. No garbage collection spikes.
4. **Texture compression**: All textures loaded as compressed formats. 3D model uses Draco compression.
5. **Will-change hints**: Apply `will-change: transform` to animated DOM elements. Remove after animation completes.
6. **Offscreen canvas**: Dot field simulation (Screen 4) runs on OffscreenCanvas in a Web Worker if supported.
7. **Resolution scaling**: If frame rate drops below 50fps, reduce particle count by 50% and canvas resolution to 0.75x.

---

## Easing Reference

| Use Case | Easing | GSAP Name |
|---|---|---|
| Breathing / pulsing | Sine in-out | `sine.inOut` |
| Entry animations | Smooth deceleration | `power2.out` |
| Exit animations | Smooth acceleration | `power2.in` |
| Snap / magnetic | Elastic | `elastic.out(1, 0.5)` |
| Dramatic reveal | Expo | `expo.out` |
| Line retract | Back | `back.in(1.7)` |

---

## Touch Interaction Standards

- **Min touch target**: 48x48px (96x96px at 4K)
- **Touch feedback**: All touchable elements scale to 0.95x on `touchstart`, back to 1.0x on `touchend` (50ms)
- **Drag threshold**: 10px movement before drag is registered (prevents accidental drags from taps)
- **Multi-touch**: Ignored — only single-touch interactions
- **Touch events**: Use `PointerEvents` API as primary, `TouchEvents` as fallback
