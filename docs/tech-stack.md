# Tech Stack

## Core Framework

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React 18 + Vite | Fast HMR during dev, optimized production builds, component model fits screen-per-component architecture |
| **Language** | TypeScript | Type safety for state machine, animation configs, asset manifests |
| **Styling** | Tailwind CSS + CSS Modules | Tailwind for layout/typography, CSS Modules for complex per-screen styles |

## Animation & Graphics

| Layer | Choice | Why |
|---|---|---|
| **3D / WebGL** | Three.js + React Three Fiber (R3F) | 3D skyscraper model (Slide 6), particle systems (Slides 1, 2, 5), golden thread rendering |
| **2D Animation** | GSAP (GreenSock) | Timeline-based animations, scroll-linked motion, morphing, easing. Industry standard for 60fps DOM animation |
| **Particles** | Custom shaders via R3F | GPU-accelerated gold particles for thread ignition (Slide 2) and burst effects (Slide 5) |
| **Canvas 2D** | HTML Canvas API | Ripple effect on image tap (Slide 3), constellation dot field (Slide 4) |

## Audio

| Layer | Choice | Why |
|---|---|---|
| **Audio Engine** | Howler.js | Cross-browser Web Audio API wrapper. Handles preloading, sprite sheets, spatial audio. Lightweight |
| **Sound Types** | Pre-rendered files | Cello tones (.mp3), metallic chimes (.mp3), ambient hum (.mp3), click/validation (.mp3) |

## Media

| Layer | Choice | Why |
|---|---|---|
| **Video** | HTML5 `<video>` element | Testimonial videos in Slide 4. Inline playback, no controls shown |
| **Images** | Optimized WebP + fallback JPG | 4K source images, lazy-decoded |
| **3D Models** | `.glb` (glTF Binary) | Standard format for Three.js. Compressed with Draco |
| **Fonts** | Self-hosted WOFF2 | No external font loading. Preloaded in `<head>` |

## State Management

| Layer | Choice | Why |
|---|---|---|
| **Global State** | Zustand | Lightweight, no boilerplate. Manages: current screen, inactivity timer, loading state, audio mute toggle |
| **Screen State** | Local React state + useReducer | Each screen manages its own interaction state internally |

## Build & Dev

| Tool | Purpose |
|---|---|
| **Vite** | Dev server + production bundler |
| **ESLint + Prettier** | Code quality |
| **vite-plugin-compression** | Gzip/Brotli for production |

## Browser Requirements

- Chrome 90+ (primary — kiosk deployment)
- Safari 15+ (secondary — demo on iPad)
- Touch Events API + Pointer Events API
- Web Audio API
- WebGL 2.0

## Performance Budget

| Metric | Target |
|---|---|
| Initial bundle (JS) | < 500KB gzipped |
| Total assets (images, video, 3D) | < 150MB (preloaded) |
| Time to interactive | < 3 seconds on kiosk hardware |
| Animation frame rate | 60fps sustained |
| Largest Contentful Paint | < 2 seconds |

## Package List (Estimated)

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.165",
    "gsap": "^3.12",
    "howler": "^2.2",
    "zustand": "^4.5"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "vite": "^5.x",
    "@types/react": "^18.x",
    "@types/three": "^0.165",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```
