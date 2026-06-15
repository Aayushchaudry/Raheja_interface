# Luxury Page Redesign — Cinematic Hero

**Date:** 2026-06-15
**Branch:** brand-wall-update

## Overview

Redesign the `LuxurySection` hero into a four-phase cinematic intro sequence followed by the existing collection. The entry experience is: black screen → video clip → black fade → logo reveal → scroll cue. All stats, numbers, body text, and principles are removed from the hero. Only the crown-card collection (Avana, Privé, Waterfront) remains below the fold.

## Video

- File: `luxury.mp4` (root of project → must be moved to `public/` so Vite serves it as a static asset)
- Play from **15s to 28s** (13-second clip), one time only — no loop
- Video fades in over 800ms on mount; when `currentTime >= 28` the fade-to-black phase begins

## State Machine

```
video → fade-out → logo → ready
```

| State | Duration | What renders |
|---|---|---|
| `video` | ~13s | Full-screen video, fade-in 800ms |
| `fade-out` | 600ms | Black overlay animates to full opacity |
| `logo` | 900ms | Logo rises + gold glow; gold rule draws under |
| `ready` | 600ms | Scroll chevron fades + bounces in |

State advances automatically via `onTimeUpdate` (video → fade-out) then CSS animation `onAnimationEnd` callbacks.

## Components Changed

- **`LuxurySection.jsx`** — complete hero rewrite; collection section kept, principles section and stats removed
- **`index.css`** — add new keyframe animations: `luxeVideoFadeIn`, `luxeLogoRise`, `luxeRuleGrow`, `luxeChevronPulse`; remove unused stat/principle rules

## Layout

```
<section.luxe-page>
  <div.luxe-cinematic-hero>          ← full viewport, black bg
    <video.luxe-intro-video />       ← muted, playsInline
    <div.luxe-blackout />            ← fade-to-black overlay
    <div.luxe-reveal>                ← centered, shown in logo+ready states
      <img.luxe-logo />              ← /assets/images/Raheja-luxe-logo-gold.png
      <div.luxe-rule />              ← thin gold horizontal rule
      <button.luxe-scroll-cue />     ← gold chevron ↓, ready state only
    </div>
  </div>
  <div.luxe-collection>             ← crown cards (unchanged)
    ...
  </div>
</section>
```

## Animation Keyframes

- `luxeVideoFadeIn` — opacity 0→1 over 800ms ease
- `luxeLogoRise` — opacity 0→1 + translateY(20px→0) over 900ms cubic-bezier(0.22,1,0.36,1)
- `luxeRuleGrow` — scaleX(0→1) from left, 400ms ease, delay 600ms
- `luxeChevronPulse` — fade in 600ms then infinite vertical bob 8px over 1.8s ease-in-out

## Scroll Behaviour

Clicking the scroll cue calls `document.querySelector('.luxe-collection')?.scrollIntoView({ behavior: 'smooth' })`.

## What Is Removed

- `luxuryContent.stats` (CountUp numbers)
- `luxuryContent.principles` section
- Hero `<h1>`, `<p>` body copy, `<small>The Private Collection</small>`
- `<div.luxe-stats>` block
- `CountUp` import (no longer needed in this file)

## File to Move

`luxury.mp4` (project root) → `public/luxury.mp4` so it is accessible at `/luxury.mp4` in the browser.
