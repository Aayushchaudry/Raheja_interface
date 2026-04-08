# Codebase File Structure

```
/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
│
├── public/
│   └── assets/                    # All static assets (see asset-requirements.md)
│       ├── images/
│       ├── videos/
│       ├── models/
│       ├── audio/
│       └── fonts/
│
├── src/
│   ├── main.tsx                   # Entry point — renders <App />
│   ├── App.tsx                    # Screen state machine + global providers
│   ├── index.css                  # Tailwind imports + global styles + CSS variables
│   │
│   ├── store/
│   │   └── useAppStore.ts         # Zustand store: currentScreen, isLoading, isMuted, inactivityTimer
│   │
│   ├── screens/
│   │   ├── LoadingScreen.tsx      # Asset preloader with progress bar
│   │   ├── Screen1_Standby.tsx    # Breathing orb, golden lines, touch to begin
│   │   ├── Screen2_Timeline.tsx   # Golden thread carousel, drag interaction
│   │   ├── Screen3_Milestone.tsx  # Sepia → modern photo morph, ripple effect
│   │   ├── Screen4_Constellation.tsx  # Dot field, video testimonials
│   │   ├── Screen5_TrustCompact.tsx   # Drag-to-connect validation game
│   │   ├── Screen6_LuxeReveal.tsx     # 3D wireframe → textured model
│   │   └── Screen7_CTA.tsx        # Call to action, auto-reset
│   │
│   ├── components/
│   │   ├── GoldenThread.tsx       # Reusable golden line renderer (SVG/Canvas)
│   │   ├── ParticleSystem.tsx     # R3F gold particle system (used in Screens 2, 5, 6)
│   │   ├── RippleEffect.tsx       # Canvas overlay for Screen 3 tap ripple
│   │   ├── DotField.tsx           # Canvas dot constellation for Screen 4
│   │   ├── VideoCircle.tsx        # Circular video player for Screen 4 testimonials
│   │   ├── CompassRose.tsx        # SVG compass for Screen 5
│   │   ├── SkyscraperModel.tsx    # R3F component loading .glb, wireframe + textured modes
│   │   ├── TransitionWipe.tsx     # Full-screen transition animations between screens
│   │   └── InactivityOverlay.tsx  # Fade-to-black overlay triggered by inactivity
│   │
│   ├── canvas/
│   │   ├── Scene3D.tsx            # R3F <Canvas> wrapper — shared 3D context for Screens 6–7
│   │   └── shaders/
│   │       ├── goldParticle.vert  # Vertex shader for particle system
│   │       ├── goldParticle.frag  # Fragment shader — gold color, fade by age
│   │       └── textureReveal.frag # Fragment shader — wireframe → textured transition
│   │
│   ├── hooks/
│   │   ├── useInactivityTimer.ts  # Global 30s inactivity → reset to Screen 1
│   │   ├── useDragInteraction.ts  # Pointer/touch drag tracking with velocity
│   │   ├── useAssetPreloader.ts   # Preload images, videos, audio, 3D models
│   │   └── useAudio.ts            # Howler.js wrapper — play, stop, fade, mute
│   │
│   ├── audio/
│   │   └── AudioManager.ts        # Singleton managing all Howl instances, preloading, crossfade
│   │
│   ├── data/
│   │   ├── milestones.ts          # Carousel data: year, name, images, description
│   │   ├── families.ts            # Testimonial data: name, quote, video path
│   │   └── legacyItems.ts         # Screen 5 legacy vault icons data
│   │
│   ├── utils/
│   │   ├── math.ts                # Lerp, clamp, distance, random range
│   │   └── constants.ts           # Colors (#D4AF37, #1A1A1B, #F8F9F9), timing values, screen IDs
│   │
│   └── types/
│       └── index.ts               # Shared TypeScript types/interfaces
│
├── docs/                          # This documentation folder
│   ├── system-overview.md
│   ├── tech-stack.md
│   ├── screen-specs.md
│   ├── animation-guide.md
│   ├── asset-requirements.md
│   ├── file-structure.md          # (this file)
│   └── implementation-plan.md
│
└── images/                        # Reference images (requirement visual)
    └── requirement.jpeg
```

## Key Architecture Decisions

### One screen = one file
Each screen is a self-contained component. It manages its own:
- Local state (animation progress, interaction state)
- Lifecycle (enter animation, idle state, exit animation)
- Audio triggers

Global state (which screen is active, loading, mute) lives in Zustand.

### Shared components for reuse
- `GoldenThread` is used in Screens 1, 2, 5 with different configs.
- `ParticleSystem` is used in Screens 2, 5, 6 with different spawn rules.
- `TransitionWipe` handles all screen-to-screen animations.

### Data separated from UI
`/data` files are plain TypeScript arrays/objects. Easy to swap placeholder content for real content — just update the data files.

### Shaders in separate files
GLSL shaders are `.vert` / `.frag` files imported as strings via Vite's `?raw` import. Keeps shader code readable and syntax-highlightable.

### Audio as a singleton
`AudioManager.ts` initializes all Howl instances once during preload. Screens call `AudioManager.play('cello-swell')` — they don't manage Howl instances directly.
