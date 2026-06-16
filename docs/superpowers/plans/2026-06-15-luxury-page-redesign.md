# Luxury Page Cinematic Hero — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the LuxurySection hero with a 4-phase cinematic intro (video 15–28s → black fade → logo rise → scroll cue) and strip all stats/principles from the page, keeping only the crown-card collection below.

**Architecture:** A `phase` state variable (`"video" | "fade-out" | "logo" | "ready"`) drives what is rendered and which CSS animation classes are active. Transitions advance automatically via a `timeupdate` event listener (video → fade-out) and `onAnimationEnd` callbacks (fade-out → logo, logo → ready). No timers needed.

**Tech Stack:** React 18, Vite, plain CSS keyframe animations, `luxury.mp4` served from `public/` as a static asset.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `luxury.mp4` (project root) | Move → `public/luxury.mp4` | Static asset accessible at `/luxury.mp4` |
| `src/screens/LuxurySection.jsx` | Rewrite | New 4-state cinematic hero; remove stats/principles JSX; remove `CountUp` import |
| `src/index.css` | Edit | Add 6 new keyframes + 7 new CSS classes; remove old hero/stats/principles rules |

---

## Task 1: Move luxury.mp4 into public/

**Files:**
- Move: `luxury.mp4` (project root) → `public/luxury.mp4`

- [ ] **Step 1: Copy the file**

```bash
cp "/Users/vivekprajapati/raheja group/luxury.mp4" "/Users/vivekprajapati/raheja group/public/luxury.mp4"
```

- [ ] **Step 2: Verify the file is in place**

```bash
ls -lh "/Users/vivekprajapati/raheja group/public/"
```

Expected: `luxury.mp4` appears in the listing.

- [ ] **Step 3: Start dev server and verify URL resolves**

```bash
cd "/Users/vivekprajapati/raheja group" && npm run dev
```

Open `http://localhost:5173/luxury.mp4` in a browser — the video should play or download. Stop the server after verifying.

- [ ] **Step 4: Commit**

```bash
cd "/Users/vivekprajapati/raheja group" && git add public/luxury.mp4 && git commit -m "feat: add luxury.mp4 to public for static serving"
```

---

## Task 2: Rewrite LuxurySection.jsx

**Files:**
- Modify: `src/screens/LuxurySection.jsx` (full rewrite)

- [ ] **Step 1: Replace the entire file with the new component**

Write `src/screens/LuxurySection.jsx`:

```jsx
import { useEffect, useRef, useState } from "react";
import { luxuryContent } from "../data/brandWallContent.js";

const VIDEO_START = 15;
const VIDEO_END = 28;

export default function LuxurySection({ onNavigate }) {
  const [phase, setPhase] = useState("video");
  const [activeCrown, setActiveCrown] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const begin = () => {
      try { video.currentTime = VIDEO_START; } catch { /* seeking before ready */ }
      video.play().catch(() => {});
    };

    const onTime = () => {
      if (video.currentTime >= VIDEO_END) {
        video.pause();
        setPhase("fade-out");
      }
    };

    video.addEventListener("loadedmetadata", begin);
    video.addEventListener("timeupdate", onTime);
    if (video.readyState >= 1) begin();

    return () => {
      video.removeEventListener("loadedmetadata", begin);
      video.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const handleBlackoutEnd = () => {
    if (phase === "fade-out") setPhase("logo");
  };

  const handleRuleEnd = () => {
    if (phase === "logo") setPhase("ready");
  };

  const scrollToCollection = () => {
    document.querySelector(".luxe-collection")?.scrollIntoView({ behavior: "smooth" });
  };

  const showReveal = phase === "logo" || phase === "ready";

  return (
    <section id="luxury" className="luxe-page">
      <div className="luxe-cinematic-hero">
        <video
          ref={videoRef}
          className={`luxe-intro-video${phase === "video" ? " is-playing" : ""}`}
          src="/luxury.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        <div
          className={`luxe-blackout luxe-blackout--${phase}`}
          onAnimationEnd={handleBlackoutEnd}
        />

        {showReveal && (
          <div className="luxe-reveal">
            <img
              className="luxe-logo-reveal"
              src="/assets/images/Raheja-luxe-logo-gold.png"
              alt="Raheja Luxe"
            />
            <div
              className="luxe-gold-rule"
              onAnimationEnd={handleRuleEnd}
            />
            {phase === "ready" && (
              <button
                className="luxe-scroll-cue"
                type="button"
                onClick={scrollToCollection}
                aria-label="Scroll to collection"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="luxe-collection">
        <div className="luxe-section-heading">
          <p className="eyebrow">Our Curations</p>
          <h2>The Private Collection</h2>
          <p>Three extraordinary residences, each conceived as a distinct expression of luxury, place, and the Raheja promise.</p>
        </div>

        <div className="crown-collection">
          {luxuryContent.collections.map((item, index) => {
            const [first, ...rest] = item.title.split(" ");
            return (
              <article
                className={`crown-card crown-card--${index + 1}${activeCrown === index ? " is-active" : ""}`}
                key={item.title}
                onMouseEnter={() => setActiveCrown(index)}
                onPointerDown={() => setActiveCrown(index)}
              >
                <div className="crown-content">
                  {item.image ? (
                    <div
                      className="crown-photo"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    >
                      {item.badge ? <span className="crown-badge">{item.badge}</span> : null}
                    </div>
                  ) : null}
                  <p className="crown-eyebrow">
                    <span className="crown-dash" aria-hidden="true" />
                    {item.eyebrow}
                  </p>
                  <h3 className="crown-title">
                    {first} {rest.length ? <em>{rest.join(" ")}</em> : null}
                  </h3>
                  <p className="crown-tagline">{item.location}</p>
                  <div className="crown-reveal">
                    <p className="crown-body">{item.body}</p>
                  </div>
                  {item.title === "Raheja Avana" ? (
                    <button
                      className="crown-explore"
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("avana");
                      }}
                    >
                      Explore Avana <span aria-hidden="true">→</span>
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the file saved correctly**

```bash
grep -n "phase\|VIDEO_START\|VIDEO_END\|luxe-cinematic-hero" "/Users/vivekprajapati/raheja group/src/screens/LuxurySection.jsx"
```

Expected: lines for `const VIDEO_START = 15`, `const VIDEO_END = 28`, `luxe-cinematic-hero` class, `phase` state.

- [ ] **Step 3: Commit**

```bash
cd "/Users/vivekprajapati/raheja group" && git add src/screens/LuxurySection.jsx && git commit -m "feat: rewrite LuxurySection with 4-phase cinematic hero"
```

---

## Task 3: Remove old luxury hero CSS from index.css

These blocks are no longer used and must be deleted. The line numbers below reflect the file **before** edits in this task.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Remove `.luxe-hero` block (lines 1709–1716)**

Find and delete:
```css
.luxe-hero {
  position: relative;
  display: grid;
  min-height: var(--screen-h);
  align-items: end;
  padding: clamp(110px, 12vw, 180px) clamp(28px, 8vw, 150px) clamp(46px, 7vw, 90px);
  overflow: hidden;
}
```

- [ ] **Step 2: Remove `.luxe-carousel` and its children (lines 1718–1798)**

Delete the entire block from `.luxe-carousel {` through the closing `}` of `@keyframes luxeCarousel`.

The block to remove starts with:
```css
.luxe-carousel {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
```
and ends with:
```css
@keyframes luxeCarousel {
  0%, 28% {
    opacity: 1;
    transform: scale(1);
  }
  34%, 100% {
    opacity: 0;
    transform: scale(1.04);
  }
}
```

- [ ] **Step 3: Remove `.luxe-video-bg` and `.luxe-video-overlay` (lines 1724–1743)**

Delete:
```css
/* Background walkthrough video (replaces the image carousel). */
.luxe-video-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Same legibility wash the carousel used to bake into its slides. */
.luxe-video-overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(5, 4, 2, 0.94) 0%, rgba(5, 4, 2, 0.62) 38%, rgba(5, 4, 2, 0.34) 100%),
    linear-gradient(180deg, rgba(5, 4, 2, 0.34), rgba(5, 4, 2, 0.92));
}
```

- [ ] **Step 4: Remove `.luxe-lockup-logo` (lines 1745–1749)**

Delete:
```css
.luxe-lockup-logo {
  display: block;
  width: auto;
  height: clamp(64px, 8vw, 120px);
}
```

- [ ] **Step 5: Remove `.luxe-hero-content`, `.luxe-lockup` and all child rules (lines 1801–1838)**

Delete the block from `.luxe-hero-content {` through `.luxe-lockup small { ... }`:

```css
.luxe-hero-content {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
  animation: royalSlideLeft 1000ms cubic-bezier(0.2, 0.8, 0.2, 1) 180ms both;
}

.luxe-lockup {
  display: grid;
  justify-items: start;
  gap: 8px;
  margin-bottom: 34px;
}

.luxe-lockup span {
  display: inline-block;
  padding: 2px 8px;
  background: var(--gold);
  color: var(--ink);
  font-weight: 800;
}

.luxe-lockup strong {
  color: var(--gold);
  font-family: "Playfair Display", Georgia, serif;
  font-size: 58px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 0.86;
  animation: goldBreath 4.5s ease-in-out 1s infinite;
}

.luxe-lockup small {
  color: var(--gold);
  font-weight: 800;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}
```

- [ ] **Step 6: Remove `.luxe-hero h1` and `@keyframes goldShimmer` (lines 1840–1862)**

Delete:
```css
.luxe-hero h1 {
  font-size: clamp(72px, 9vw, 142px);
  line-height: 0.92;
}

.luxe-hero h1 span {
  background: linear-gradient(100deg, #c9a96e 0%, #f6e6bd 24%, #c9a96e 48%, #f6e6bd 72%, #c9a96e 100%);
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: goldShimmer 6s linear infinite;
}

@keyframes goldShimmer {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 220% center;
  }
}
```

- [ ] **Step 7: Remove `.luxe-hero::after` and `@keyframes luxeAura` (lines 1864–1889)**

Delete:
```css
/* --- Luxe page premium enhancements --- */
.luxe-hero::after {
  content: "";
  position: absolute;
  z-index: 0;
  top: -10%;
  left: 18%;
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.16), transparent 60%);
  pointer-events: none;
  filter: blur(20px);
  animation: luxeAura 12s ease-in-out infinite;
}

@keyframes luxeAura {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(4%, 6%) scale(1.12);
    opacity: 1;
  }
}
```

- [ ] **Step 8: Remove `.luxe-lockup::after` and `@keyframes luxeRule` (lines 1891–1904)**

Delete:
```css
.luxe-lockup::after {
  content: "";
  width: 0;
  height: 2px;
  margin-top: 6px;
  background: linear-gradient(90deg, var(--gold), transparent);
  animation: luxeRule 1100ms ease 600ms forwards;
}

@keyframes luxeRule {
  to {
    width: 188px;
  }
}
```

- [ ] **Step 9: Remove `.luxe-hero-content > p` and `.luxe-actions` (lines 1990–2002)**

Delete:
```css
.luxe-hero-content > p {
  width: min(560px, 100%);
  margin: 34px 0 0;
  color: rgba(255, 255, 255, 0.74);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.45;
}

.luxe-actions {
  display: flex;
  margin-top: 42px;
}
```

- [ ] **Step 10: Remove `.luxe-stats` block entirely (lines 2004–2059)**

Delete everything from `.luxe-stats {` through `.luxe-stats span { ... }`:

```css
.luxe-stats {
  position: absolute;
  right: clamp(16px, 2vw, 44px);
  bottom: clamp(46px, 7vw, 90px);
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 14px;
  width: min(500px, 40vw);
}
```
...through to and including:
```css
.luxe-stats span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 700;
}
```

Also delete the two standalone `.luxe-stats strong` rules (one at line ~1906 with `text-shadow`, one at ~2038 with `display: block`).

- [ ] **Step 11: Fix the shared border rule (lines 2015–2022)**

The current rule groups three selectors together. Remove the first two, keep only `.luxe-residence-copy`:

Replace:
```css
.luxe-stats div,
.luxe-principles article,
.luxe-residence-copy {
  border: 1px solid var(--royal-line);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025), 0 22px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(16px);
}
```

With:
```css
.luxe-residence-copy {
  border: 1px solid var(--royal-line);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025), 0 22px 70px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(16px);
}
```

- [ ] **Step 12: Remove `.luxe-principles` block entirely (lines 2061–2101)**

Delete everything from `.luxe-principles {` through `.luxe-principles article > p:not(.eyebrow) { ... }`.

- [ ] **Step 13: Commit**

```bash
cd "/Users/vivekprajapati/raheja group" && git add src/index.css && git commit -m "style: remove old luxury hero/stats/principles CSS"
```

---

## Task 4: Add new cinematic hero CSS to index.css

Add all new rules **after** the `.luxe-page` block (around line 1707 in the original file, which by now has had content removed above it — insert after `.luxe-page { ... }`).

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Insert new cinematic hero rules after `.luxe-page { ... }`**

After the closing `}` of `.luxe-page`, insert:

```css
/* ── Cinematic luxury intro hero ────────────────────────────── */

.luxe-cinematic-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--screen-h);
  background: #060503;
  overflow: hidden;
}

.luxe-intro-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
}

.luxe-intro-video.is-playing {
  animation: luxeVideoFadeIn 800ms ease forwards;
}

@keyframes luxeVideoFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.luxe-blackout {
  position: absolute;
  inset: 0;
  background: #060503;
  opacity: 0;
  pointer-events: none;
}

.luxe-blackout--fade-out {
  animation: luxeBlackoutIn 600ms ease forwards;
}

.luxe-blackout--logo,
.luxe-blackout--ready {
  opacity: 1;
}

@keyframes luxeBlackoutIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.luxe-reveal {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(20px, 2.5vw, 36px);
}

.luxe-logo-reveal {
  height: clamp(80px, 10vw, 150px);
  width: auto;
  animation: luxeLogoRise 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  filter: drop-shadow(0 0 48px rgba(201, 169, 110, 0.45));
}

@keyframes luxeLogoRise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.luxe-gold-rule {
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  animation: luxeRuleGrow 400ms ease 600ms forwards;
}

@keyframes luxeRuleGrow {
  from { width: 0; }
  to   { width: clamp(120px, 14vw, 220px); }
}

.luxe-scroll-cue {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: none;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 50%;
  color: var(--gold);
  cursor: pointer;
  animation: luxeChevronFadeIn 600ms ease forwards, luxeChevronBob 1.8s ease-in-out 700ms infinite;
  transition: border-color 200ms ease, background 200ms ease;
}

.luxe-scroll-cue:hover,
.luxe-scroll-cue:focus-visible {
  border-color: var(--gold);
  background: rgba(201, 169, 110, 0.08);
  outline: none;
}

.luxe-scroll-cue svg {
  width: clamp(28px, 3vw, 40px);
  height: clamp(28px, 3vw, 40px);
}

@keyframes luxeChevronFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes luxeChevronBob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(10px); }
}
```

- [ ] **Step 2: Verify the rules are in place**

```bash
grep -n "luxe-cinematic-hero\|luxeLogoRise\|luxeChevronBob\|luxe-scroll-cue" "/Users/vivekprajapati/raheja group/src/index.css"
```

Expected: 4+ matching lines.

- [ ] **Step 3: Commit**

```bash
cd "/Users/vivekprajapati/raheja group" && git add src/index.css && git commit -m "style: add cinematic hero CSS for luxury intro sequence"
```

---

## Task 5: Visual verification in browser

- [ ] **Step 1: Start the dev server**

```bash
cd "/Users/vivekprajapati/raheja group" && npm run dev
```

- [ ] **Step 2: Navigate to the luxury page and verify the sequence**

Open `http://localhost:5173` in the browser. Navigate to the luxury page (via nav or page flow).

Verify in order:
1. Black screen, then `luxury.mp4` fades in playing from ~15s
2. At the 28s mark the video stops and a black fade covers the screen
3. The Raheja Luxe gold logo rises from below center with a glow
4. A thin gold rule draws under the logo
5. A circular gold chevron `↓` button bobs gently below the rule
6. Clicking the chevron scrolls down to the crown-card collection (Avana, Privé, Waterfront)
7. No stats, no h1, no principles text appears above the collection

- [ ] **Step 3: Stop the dev server and commit verification note**

```bash
cd "/Users/vivekprajapati/raheja group" && git commit --allow-empty -m "chore: luxury cinematic hero verified in browser"
```
