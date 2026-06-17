# Static Multi-Page Kiosk — Architecture Redesign

**Date:** 2026-06-17
**Branch:** brand-wall-update
**Status:** Design — awaiting review

## Problem

The kiosk runs on a weak TV processor. The current app is a single React 19 + Vite
SPA (`src/main.jsx` → `src/App.jsx`) where all seven pages live in one JS runtime and
page changes are driven by JS state plus heavy CSS animations. On the target hardware
this produces:

- Whole UI feels heavy/slow; first load is slow.
- About page number count-ups and background animations lag.
- Page-indicator numbers flicker, worst in fullscreen.
- Amenity/walkthrough videos stutter or fail to play.

Root causes confirmed:

1. **One shared runtime.** Every page's code, DOM, timers and animation loops coexist;
   memory and work accumulate across the session. Nothing is ever torn down.
2. **`zoom`-based scaler.** `index.html` scales the 1920px design with `html.style.zoom`,
   which repaints and causes subpixel flicker — especially in fullscreen.
3. **Per-frame JS animations.** Count-ups re-render every frame; infinite background
   animations keep the GPU busy permanently.
4. **Render-blocking fonts.** Google Fonts `@import` in `index.css` blocks first paint on
   a network round-trip.
5. **Grossly over-encoded video** (measured 2026-06-17, see Appendix): amenity films are
   1080p H.264 at **45–52 Mbps** (6–8× too high); the walkthrough is **4K @ 50 Mbps,
   796 MB**; `faststart` is OFF on every file, forcing a full download before playback.

## Goals

- Each page is a fully isolated unit; one page's execution cannot affect another.
- Smooth on a weak processor: minimal runtime work, no framework parsed per navigation.
- Preserve the cinematic look, rebuilt with cheap GPU-only transitions.
- Video that the TV can actually decode and that starts quickly.
- Keep deployment on AWS Amplify, output stays fully static.

## Non-Goals

- No new features or content changes beyond what the redesign requires.
- No redesign of the visual language — same gold/charcoal/pearl identity and layouts.
- Re-uploading transcoded video to CloudFront/S3 is out of scope for the code change
  itself (requires the owner's AWS access); this spec defines the targets and commands.

## Architecture

### One document per page (true multi-page app)

Every page becomes its own standalone HTML document. Navigation is a real browser page
load, so the browser destroys the previous page entirely — DOM, JS heap, timers,
animation frames, and video decoders — before the next page exists. Isolation is
therefore **browser-enforced**, not a convention, and memory resets on every navigation.

No React or bundler runtime ships to the TV. Pages are HTML + CSS the browser renders
with almost no work, plus a few KB of vanilla JS only where interaction is needed.

Pages (preserving the current flow):

```
index.html (standby/home) → about.html → director.html → projects.html
  → luxury.html → avana.html (+ amenities) → thanks.html
```

### Source layout and build

To avoid duplicating the header/nav/overlay markup across pages, a trivial build step
assembles static pages from partials. Its **output is pure static HTML/CSS/JS** — no
runtime framework. Vite (already present) is kept only as a build-time assembler/minifier.

```
src/
  partials/   header.html, nav.html, transition-overlay.html, page-indicator.html
  pages/      home.html, about.html, director.html, projects.html,
              luxury.html, avana.html, thanks.html   (content only)
  styles/     tokens.css (gold/charcoal/pearl, fonts), base.css, <page>.css
  scripts/    shell.js              (shared: scaler, transitions, fullscreen, inactivity)
              <page>.js             (per-page, only where interactive)
  assets/     fonts/  images/  posters/  data/ (project/amenity JSON)
build → dist/  (fully static — deploys to Amplify unchanged)
```

Project/amenity content moves to small JSON files under `assets/data/` and is inlined
at build time into the relevant page, so no data fetch happens at runtime.

### Scaler: `transform: scale()` instead of `zoom`

`shell.js` wraps page content in a fixed `1920×1080` stage and scales it with
`transform: scale(viewportWidth / 1920)`, centered. `transform` is GPU-composited, never
triggers reflow, and does not flicker. This directly fixes the fullscreen flicker and the
page-indicator numbers appearing/disappearing. Re-runs on `resize`, `orientationchange`,
and `visibilitychange` (TV wake).

### Transitions: cinematic, compositor-only

Separate documents mean the transition has two halves:

1. **Outgoing:** on a nav tap, `shell.js` fades a full-screen charcoal overlay to
   `opacity: 1` (~280–320 ms, opacity only), then sets `location.href`.
2. **Incoming:** every page's HTML loads with the overlay already at `opacity: 1`; on
   first paint `shell.js` fades it out. An optional single gold-thread line animates via
   one CSS `transform`/`opacity` keyframe — no JS, no particles.

This recreates the black-dissolve premium feel using only `opacity`/`transform`
(compositor-only, no layout or paint). Where the TV supports the cross-document View
Transitions API it is layered on as progressive enhancement, never depended upon.

### Animations

- Count-up numbers become **static values** with a single one-time CSS fade-in. No
  per-frame JS.
- Infinite/continuous background animations are replaced with static imagery or a single
  slow composited transform. Decorative effects that cost frames are dropped.
- `will-change` used sparingly and only on elements that actually transition.

### First-load

- Self-host fonts as `woff2` with `font-display: swap`; remove the Google Fonts `@import`.
- Inline critical CSS per page; defer the rest.
- Each page ships only its own CSS/JS. The standby page becomes tiny and near-instant.
- Minify + compress at build.

### Inactivity reset

`shell.js` adds a shared idle timer: after 60 s (configurable) with no touch/pointer
input on any page, navigate to `index.html` (standby). The current app never wired this
up despite the requirement.

### Video

Caching only speeds download; it does not reduce decode load, which is what stutters.
The fix is correct encoding plus `faststart`.

- **Amenity films:** re-encode to 1080p H.264 High, target ~8 Mbps (CRF ~21–23), AAC,
  `+faststart`, ~2 s keyframe interval. ≈6× smaller, ≈6× less decode work.
- **Walkthrough (`Explore_avana.mp4`):** downscale 4K→1080p, ~8–10 Mbps, `+faststart`.
  796 MB → roughly 120–150 MB.
- **Playback:** reuse a single shared `<video>` element for all amenities;
  `playsinline muted preload="none"`; fetch on tap; on close clear `src` + `load()` to
  release the decoder. With proper bitrate, streaming is smooth; the existing Cache
  Storage prefetch becomes an optional enhancement rather than a crutch.
- Posters stay as small JPGs for instant card rendering.

Reference ffmpeg commands (run by the owner, then re-upload to CloudFront/S3):

```sh
# amenity film
ffmpeg -i RL.mp4 -vf scale=1920:1080 -c:v libx264 -profile:v high -preset slow \
  -crf 22 -maxrate 9M -bufsize 18M -g 48 -c:a aac -b:a 128k \
  -movflags +faststart RL_web.mp4

# 4K walkthrough → 1080p
ffmpeg -i Explore_avana.mp4 -vf scale=1920:1080 -c:v libx264 -profile:v high \
  -preset slow -crf 21 -maxrate 11M -bufsize 22M -g 48 -c:a aac -b:a 128k \
  -movflags +faststart Explore_avana_web.mp4
```

If re-uploading is not possible immediately, a `-c copy -movflags +faststart` remux of
each existing file is a zero-quality-loss interim win for startup time.

## Isolation guarantee

Because each page is its own document, the browser tears down the previous page's DOM,
JS heap, timers, animation frames, and video decoders on navigation. "Execution of one
page cannot impact another" is structurally guaranteed — there is no shared runtime and
no cross-page state.

## Migration approach

The React SPA is replaced page by page. Suggested order (lowest risk first):

1. Scaffold `shell.js` (scaler, transitions, fullscreen, inactivity) + `tokens.css` +
   build step + partials.
2. `index.html` (standby) — simplest, validates the shell and transitions on the TV.
3. `about.html` — exercises the static count-ups and background fix.
4. `director.html`, `projects.html`, `luxury.html`, `thanks.html`.
5. `avana.html` + amenities — the video work and shared `<video>` element.
6. Remove the old React app (`src/main.jsx`, `App.jsx`, `screens/`, `components/`,
   `hooks/`, unused `.tsx` Golden Thread set) once all pages are ported and verified.

Each page is verified on the target TV (or a throttled browser proxy) before moving on.

## Risks

- **Effort:** this is a full rewrite of a working app. Mitigated by porting one page at a
  time, keeping the React app live until each page is replaced.
- **Video re-upload needs owner AWS access.** Code can point at new filenames; the asset
  swap is an owner step. Interim `+faststart` remux mitigates startup before full
  transcode.
- **TV browser capabilities unknown** (View Transitions, codec support). Design avoids
  hard dependencies; View Transitions are progressive enhancement only.

## Appendix — measured video specs (2026-06-17, ffprobe via CloudFront)

| File | Codec | Resolution | Bitrate | Duration | Size | faststart |
|------|-------|-----------|---------|----------|------|-----------|
| RL.mp4 | h264 | 1920×1080 | 46.6 Mbps | 7 s | 41 MB | off |
| SP.mp4 | h264 | 1920×1080 | 52.0 Mbps | 25 s | 153 MB | off |
| GYM.mp4 | h264 | 1920×1080 | 48.7 Mbps | 10 s | 58 MB | off |
| GH.mp4 | h264 | 1920×1080 | 49.5 Mbps | 8 s | 49 MB | off |
| SM.mp4 | h264 | 1920×1080 | 49.0 Mbps | 23 s | 132 MB | off |
| SPT.mp4 | h264 | 1920×1080 | 52.2 Mbps | 21 s | 132 MB | off |
| IG.mp4 | h264 | 1920×1080 | 51.1 Mbps | 12 s | 75 MB | off |
| GR.mp4 | h264 | 1920×1080 | 44.7 Mbps | 6 s | 32 MB | off |
| MR.mp4 | h264 | 1920×1080 | 48.4 Mbps | 14 s | 80 MB | off |
| LIFT.mp4 | h264 | 1920×1080 | 46.3 Mbps | 8 s | 43 MB | off |
| Explore_avana.mp4 | h264 | 3840×2160 | 50.1 Mbps | 133 s | 796 MB | off |
