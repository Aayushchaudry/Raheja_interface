# Raheja Kiosk — Webpage → Offline Smart-TV App Conversion Plan

**Date:** 2026-06-17
**Branch:** brand-wall-update
**Status:** Plan — awaiting review (one open item: confirm TV brand/OS)

## Decisions locked in

- **Target:** built-in smart TV (Android TV / Samsung Tizen / LG webOS), 65", 16:9, weak CPU.
- **Connectivity:** online at install, then frequently offline → app must run fully
  offline after a one-time asset download.
- **Content cadence:** changes rarely → bundle small assets in the app, download heavy
  video once; updates ship as a new app build.

## Strategy in one paragraph

The app **is** the current web app, packaged into a native TV container. Because the
container renders the same HTML/CSS/JS, it looks identical and keeps every animation —
no visual rebuild. What changes: (1) all assets are served from **local storage** instead
of CloudFront at runtime, so there is no network buffering/stall; (2) a **loading screen**
downloads the heavy videos from S3 into local storage on first launch and then the app is
100% offline; (3) the layout is locked to a **16:9 scale-to-fit stage** so it is identical
on any 16:9 device.

> **Honest performance note.** Moving assets local fixes *loading, buffering and
> video-start* stutter — the biggest pains today. It does **not** by itself make
> GPU-heavy continuous CSS animations cheap; a weak smart-TV WebView has limited GPU/CPU
> regardless of where files live. So we keep the `perf-lite` toggle (already added) and
> tune which ambient animations run, tested on the real panel. "All animations, perfectly
> smooth" on the weakest TVs may need a few of the heaviest ambient loops to stay off.

---

## 1. App type (depends on the exact TV OS)

The web core is **identical** across all three; only the final packaging differs.

| TV OS | Brand | Package | How the web app is wrapped |
|-------|-------|---------|----------------------------|
| **Android TV** | Sony, TCL, Hisense, Mi, OnePlus… | `.apk` | **Capacitor** wraps the Vite build in a native WebView; Filesystem plugin for local files. |
| **Tizen** | Samsung | `.wgt` | Tizen "Web Application" — the build is packaged directly (no Capacitor); Tizen Studio. |
| **webOS** | LG | `.ipk` | webOS web app — build packaged directly; `ares-*` CLI / webOS Studio. |

**Recommended primary path: Android TV + Capacitor** (most common, best tooling, real
filesystem API). For Tizen/webOS the same `dist/` is packaged with that platform's CLI;
local storage uses Cache Storage / IndexedDB instead of a native filesystem plugin.

> **OPEN ITEM:** confirm the TV brand so we lock the packaging toolchain. Everything below
> is brand-independent except §6 (packaging) and the local-storage mechanism in §4.

---

## 2. Keep the existing web app as the engine

No rewrite. The current React/Vite app (with the optimizations already done — async fonts,
static count-ups, `perf-lite`, code-splitting, opacity transitions) becomes the app's
content. We change only how assets are referenced (§3) and add the preloader (§5) and the
16:9 stage (§7).

---

## 3. Asset strategy — what lives where

**Constraint: assets stay at full original quality — no compression or transcoding.**

Heavy assets today: videos ≈ **1.6 GB** (amenities ≈ 795 MB + `Explore_avana.mp4` 796 MB)
and the 10 architecture renders ≈ **372 MB** (18–51 MB each). At full quality these are too
large to bake into a TV app package, so **both videos and renders are downloaded to local
storage, not bundled.** Total one-time download ≈ **2 GB**.

### Bundled INSIDE the app package (ship with the build, always offline)
- All HTML / CSS / JS (the app code).
- **Fonts** — self-hosted `woff2` (stop depending on Google Fonts; offline-safe).
- **UI images already in `public/assets/images/`** — amenity **poster** frames, hero
  stills, project cards, logos, director, families (~35 MB total, already local & small).
- `render/11.jpeg` (Galleria card, 0.2 MB).
- **Data**: project list, amenity metadata, copy — as local JSON.

### Downloaded from S3 to LOCAL storage on first launch (then offline forever)
- The **10 amenity films** + the **walkthrough** video (~1.6 GB).
- The **10 architecture renders** `render/1.jpg … 10.jpg` (~372 MB).

### Stays on S3 (origin only — never hit at runtime after first download)
- Master copies of the videos + renders, served once to seed the local cache.
- A small **`manifest.json`** (list of asset URLs + sizes + a version hash) the app reads
  to know what to download and whether the local copy is current.

> **Trade-offs of keeping full quality (accepted):**
> 1. **TV storage** must have ≈ **2–2.5 GB free** for the local cache. Confirm the panel
>    has it.
> 2. **First-launch download ≈ 2 GB** — one-time, over WiFi; minutes-long depending on
>    link speed. The loading screen shows progress; the app works offline afterward.
> 3. **Decode cost is not fixed by going local.** A weak panel may still stutter on the
>    **4K 50 Mbps `Explore_avana.mp4`** and on decoding **18–51 MB JPGs**, because decode
>    load depends on the file, not where it's stored. Local storage removes *buffering*,
>    not *decode* cost. If playback/gallery still stutters on-device, the only remaining
>    levers are (a) a `+faststart` remux (no quality change, faster start only) or
>    (b) accepting the stutter. We'll measure on the real panel in workstream 7.

---

## 4. Local storage mechanism

- **Android (Capacitor):** download via `fetch`, write to the app's data dir with the
  **Filesystem** plugin; play via the resulting `file://` (or `Capacitor.convertFileSrc`)
  URL. Survives reboots, no network.
- **Tizen/webOS:** use the **Cache Storage API** (already used in
  `hooks/useAssetCache.js`) or IndexedDB blobs; play from `blob:`/cache URLs. Persistent
  and offline-capable.

A single `assetStore` module abstracts this so the rest of the app calls
`getLocalUrl(name)` regardless of platform. `useAssetCache.js` is extended to become that
module (it already does the Cache Storage half).

---

## 5. Loading-screen / preload flow

On launch:

1. **Splash** (Raheja gold mark) appears immediately from bundled assets — instant, no
   network needed.
2. Read bundled `manifest.json`; compare its version hash to what's stored locally.
3. **If all required local assets present and current** → skip straight to the app.
4. **Else (first run / update / online):** download each missing video sequentially into
   local storage, showing a real progress bar ("Preparing experience… 47%"). One file
   in flight at a time (smooth, low memory) — same pattern as the current prefetch.
5. **If offline and assets missing** → show a friendly "Connect to WiFi to finish first
   setup" message; once any required asset is present the app still opens and missing
   videos fall back to their poster image.
6. When required assets are ready, **warm the first page** and fade into standby.

After step 4 completes once, every future launch is offline and instant (step 3).

---

## 6. 16:9 scaling (works on every 16:9 device, smoothly)

Replace the current `zoom` scaler with a **fixed 1920×1080 design stage that scales to fit**:

```
#stage {
  width: 1920px; height: 1080px;
  transform-origin: top left;
  transform: scale(S);              /* S = min(vw/1920, vh/1080) */
  position: absolute; left: 50%; top: 50%;
  margin-left: -960px; margin-top: -540px;  /* center before scale */
}
body { background: #000; }          /* letterbox bars if not exactly 16:9 */
```

- All 16:9 panels share the same proportions, so `scale()` is uniform → the layout is
  **pixel-identical** at 1080p, 1440p or 4K. Non-16:9 screens get black bars (correct for
  a kiosk).
- `transform: scale()` is **GPU-composited and flicker-free** — this also removes the
  fullscreen flicker for good (the `zoom` property was the cause).
- Existing px-based CSS is reused as-is inside the stage (no mass refactor).

**Optional "pure percentage" variant** (if you specifically want % units, not a scaled
px stage): lock a 16:9 container with `aspect-ratio: 16/9` and express sizes in `cqw`/`cqh`
(container-query units) so `1cqw` = 1% of stage width everywhere. Same result, but it's a
larger CSS refactor across ~5.6k lines. **Recommendation: ship the scale-to-fit stage**
(same device-independence, far less risk); do the cqw refactor later only if desired.

---

## 7. Offline-first hardening

- Fonts bundled locally (no Google Fonts at runtime).
- No `https://…cloudfront…` URLs hit at runtime — all media resolved through
  `getLocalUrl()`; only the one-time seeding download and manifest check use the network.
- Service worker (for Tizen/webOS web build) precaches the app shell so even the HTML/JS
  load offline; Capacitor serves the shell from the bundle natively.
- Every video element keeps its **poster** so a missing/te-not-yet-downloaded film still
  shows a clean still instead of a black box.

---

## 8. Build & packaging steps (Android/Capacitor path)

1. `npm run build` → `dist/` (already works).
2. Add Capacitor: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`,
   `@capacitor/filesystem`; `npx cap init`; `webDir: dist`.
3. `npx cap add android`; configure **TV leanback** + **landscape lock** +
   **kiosk/fullscreen** in the Android manifest.
4. `npx cap sync` after each web build.
5. Open in Android Studio, build a signed `.apk`, **sideload** to the TV (adb / USB).
   (Tizen: `tizen package -t wgt`; webOS: `ares-package` → `ares-install`.)

## 9. Update process

Content rarely changes, so: update assets/code → bump `manifest.json` version → rebuild
the app → re-sideload. If you later want remote content swaps without reinstalling, the
manifest mechanism already supports it (app re-downloads changed assets on next online
launch) — no architecture change needed.

---

## 10. Workstreams (build order)

1. **Asset prep** — full quality, no compression: upload the 11 videos + 10 renders to S3;
   keep UI images/posters bundled; self-host fonts; generate `manifest.json` (urls, bytes,
   version hash) listing the downloadable assets.
2. **`assetStore` module** — extend `useAssetCache.js` into a platform-abstracted
   `getLocalUrl()` / `downloadAll(onProgress)` with Capacitor Filesystem + Cache Storage
   backends.
3. **Loading screen** — splash + manifest check + sequential download + progress +
   offline messaging + handoff to standby.
4. **Repoint media** — every image/video in the app resolves via `getLocalUrl()`; remove
   runtime CloudFront URLs; bundle fonts.
5. **16:9 stage** — replace `zoom` scaler with the scale-to-fit `#stage`.
6. **Packaging** — Capacitor (or Tizen/webOS) project, kiosk/fullscreen/landscape config,
   signed package.
7. **On-device tuning** — install on the actual panel; measure; decide final `perf-lite`
   animation set; confirm video decode is smooth (transcode if not).

---

## 11. Risks & mitigations

- **Weak WebView GPU** → keep `perf-lite`; tune ambient animations on-device. (Local
  assets alone won't fix animation cost — set expectations.)
- **TV storage** → full-quality assets need ≈2–2.5 GB free locally; confirm on the panel.
- **Video decode / image decode on weak panel** → full-quality 4K video and 18–51 MB JPGs
  may still stutter even from local; measure on-device (workstream 7). `+faststart` remux
  is the only no-quality-loss mitigation if needed.
- **First-launch needs internet (~2 GB)** → explicit, friendly preloader progress; posters
  as fallback so the app is usable even mid-download.
- **OS fragmentation** → confirm brand; web core is shared, only packaging differs.
- **Sideloading/kiosk lock** → document the per-OS install + auto-start + screen-stay-on
  settings as part of §8.

## 12. Open item

Confirm the **TV brand / OS** (Samsung = Tizen, LG = webOS, Sony/TCL/Hisense/Mi = Android
TV). This finalizes §1, §4 and §8. Everything else is ready to start.
