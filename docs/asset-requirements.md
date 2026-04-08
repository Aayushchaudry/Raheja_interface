# Asset Requirements

All assets use placeholders during development. This doc lists every asset needed, its specs, and placeholder strategy.

---

## Directory Structure

```
/public/assets/
├── images/
│   ├── logo-raheja-luxe.png          # Gold foil logo, transparent BG
│   ├── bg-architectural-blur.webp     # Screen 2 background
│   ├── projects/                      # Screen 2 carousel + Screen 3
│   │   ├── project-1990-sepia.webp
│   │   ├── project-1990-modern.webp
│   │   ├── project-1995-sepia.webp
│   │   ├── project-1995-modern.webp
│   │   ├── project-2000-sepia.webp
│   │   ├── project-2000-modern.webp
│   │   ├── project-2005-sepia.webp
│   │   ├── project-2005-modern.webp
│   │   ├── project-2010-sepia.webp
│   │   ├── project-2010-modern.webp
│   │   ├── project-2015-sepia.webp
│   │   ├── project-2015-modern.webp
│   │   ├── project-2020-sepia.webp
│   │   ├── project-2020-modern.webp
│   │   └── project-2024-sepia.webp
│   ├── luxury-detail/                 # Screen 5
│   │   └── marble-macro.webp
│   ├── legacy-icons/                  # Screen 5 left panel
│   │   ├── legacy-1.webp
│   │   ├── legacy-2.webp
│   │   ├── legacy-3.webp
│   │   └── legacy-4.webp
│   └── compass-rose.svg              # Screen 5 center icon
├── videos/
│   ├── family-1.mp4
│   ├── family-2.mp4
│   ├── family-3.mp4
│   ├── family-4.mp4
│   └── family-5.mp4
├── models/
│   └── skyscraper.glb                # Screen 6 3D model
├── audio/
│   ├── ambient-drone.mp3             # Screen 1 ambient
│   ├── cello-swell.mp3               # Screen 1 touch
│   ├── metallic-shimmer.mp3          # Screen 2 thread drag
│   ├── chime-soft.mp3                # Screen 2 snap, Screen 4 dot tap
│   ├── water-ping.mp3                # Screen 3 ripple tap
│   ├── cello-sustain.mp3             # Screen 3 morph complete
│   ├── ethereal-pad.mp3              # Screen 4 ambient
│   ├── string-pull.mp3               # Screen 5 line drawing
│   ├── harmonic-chime.mp3            # Screen 5 compass pass
│   ├── validation-click.mp3          # Screen 5 successful connection
│   ├── orchestral-swell.mp3          # Screen 5 validation + Screen 6
│   ├── descending-tone.mp3           # Screen 5 failed drop
│   ├── construction-layers.mp3       # Screen 6 wireframe forming
│   ├── grand-reveal.mp3              # Screen 6 texture reveal
│   ├── luxe-ambient.mp3              # Screen 6–7 ambient pad
│   └── fade-exhale.mp3              # Screen 7 reset
│   └── fonts/
│       ├── serif-display.woff2       # Headlines (e.g., Playfair Display)
│       └── sans-body.woff2           # Body text (e.g., Inter or Montserrat)
```

---

## Image Specs

| Asset | Resolution | Format | Notes |
|---|---|---|---|
| Logo | 480x120 | PNG (transparent) | Gold foil texture, crisp at 4K |
| Background (Screen 2) | 3840x2160 | WebP, quality 80 | Gaussian blur applied in-image |
| Project photos (carousel) | 1200x800 | WebP, quality 85 | 8 pairs: sepia + modern versions |
| Luxury macro detail | 1920x1080 | WebP, quality 90 | Close-up texture shot |
| Legacy icons | 400x400 | WebP, quality 80 | Circular crop, 4 icons |
| Compass rose | Vector | SVG | Gold stroke, no fill, ~200x200 viewport |

### Placeholder Strategy (Images)
- Use royalty-free architectural photos from Unsplash/Pexels.
- Apply sepia CSS filter for "archival" versions — no need for separate files during dev.
- Generate logo as gold-gradient text in SVG during dev.

---

## Video Specs

| Asset | Resolution | Format | Duration | Notes |
|---|---|---|---|---|
| Family testimonials (x5) | 720x720 (square) | MP4, H.264 | 15s each | Displayed in circular frame, so square source works |

### Placeholder Strategy (Videos)
- Use royalty-free stock video clips of families/people smiling.
- Or generate simple color-gradient loops with overlaid text as ultra-light placeholders.
- Keep under 5MB each for fast loading during dev.

---

## 3D Model Specs

| Asset | Format | Poly Count | Notes |
|---|---|---|---|
| Skyscraper | `.glb` (glTF Binary) | 50k–100k tris | Draco compressed. Needs both wireframe-friendly geometry and PBR textures |

### Placeholder Strategy (3D Model)
- Use a free skyscraper model from Sketchfab (CC license) or generate a simple parametric tower in Blender.
- Key requirement: the model must look good as both wireframe AND textured.
- A simple extruded floor-plate tower with glass material works well.

---

## Audio Specs

| Property | Value |
|---|---|
| Format | MP3, 128kbps (sufficient for ambient/FX) |
| Sample Rate | 44.1kHz |
| Channels | Stereo |
| Max file size | 500KB per effect, 2MB per ambient loop |

### Placeholder Strategy (Audio)
- Use royalty-free sound effects from freesound.org or mixkit.co.
- Cello/strings samples from free orchestral sample packs.
- Generate ambient drones using free synth tools (e.g., Ambient Mixer).
- Critical: all placeholder audio must be **royalty-free** and cleared for commercial use.

---

## Font Specs

| Font | Usage | Weight | Source |
|---|---|---|---|
| Display serif (e.g., Playfair Display) | Headlines, quotes, narrative text | 400, 700 | Google Fonts → self-hosted WOFF2 |
| Clean sans (e.g., Inter) | UI labels, stats, small text | 400, 500, 600 | Google Fonts → self-hosted WOFF2 |

---

## Asset Loading Strategy

All assets are preloaded before Screen 1 appears:

1. **Critical** (loaded first): Logo, fonts, Screen 1 audio, Screen 1 SVG patterns.
2. **High priority**: Screen 2–3 images, carousel photos, Screen 2–3 audio.
3. **Medium priority**: Screen 4 videos (only thumbnails/first frame initially, full video on demand).
4. **Low priority**: 3D model (loaded in background, needed only at Screen 6), Screen 5–7 audio.

A loading screen with a simple gold progress bar shows asset loading progress.
