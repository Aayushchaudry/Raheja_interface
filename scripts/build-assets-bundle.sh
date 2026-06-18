#!/usr/bin/env bash
# Builds raheja-assets/ — the single folder to upload to S3 (CloudFront base
# https://d1ovqzmursgzel.cloudfront.net/raheja-assets/). All raster images are
# converted to WebP; videos/audio/PDFs are copied as-is. The app then fetches
# everything from this bundle and the offline loader caches it locally.
#
# Layout mirrors the current assets/images/ tree so code paths only need a base
# + extension swap. Messy space/uppercase filenames are normalised to clean
# kebab-case so every S3 link is self-describing.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/public/assets/images"
OUT="$ROOT/raheja-assets"
IMG="$OUT/images"
CDN="https://d1ovqzmursgzel.cloudfront.net/raheja_avana"   # current origin (renders)

rm -rf "$OUT"
mkdir -p "$IMG" "$OUT/videos" "$OUT/audio" "$OUT/docs"

# --- helper: convert one raster to webp -------------------------------------
# PNGs (logos/graphics, often transparent) -> lossless for crisp edges.
# JPG/JPEG (photos) -> quality 82, full resolution (no downscaling).
to_webp() {
  local in="$1" out="$2"
  local lc
  lc="$(printf '%s' "$in" | tr '[:upper:]' '[:lower:]')"
  mkdir -p "$(dirname "$out")"
  # Non-fatal: some files in the tree are tiny placeholder stubs that aren't
  # real images (e.g. projects/project-N.jpg). Skip anything cwebp can't read.
  case "$lc" in
    *.png) cwebp -quiet -lossless -exact "$in" -o "$out" 2>/dev/null || { echo "    skip (unreadable): ${in##*/}"; return 0; } ;;
    *)     cwebp -quiet -q 82 "$in" -o "$out" 2>/dev/null || { echo "    skip (unreadable): ${in##*/}"; return 0; } ;;
  esac
}

echo "==> Converting local images (preserving folder structure)…"
# Convert every raster under assets/images, keeping its relative path + name.
while IFS= read -r -d '' f; do
  rel="${f#"$SRC"/}"                      # e.g. projects/raheja-avana.jpg
  base="${rel%.*}"                        # strip extension
  to_webp "$f" "$IMG/$base.webp"
done < <(find "$SRC" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print0)

# Copy vector + small UI assets verbatim (svg has no webp equivalent).
echo "==> Copying SVGs verbatim…"
while IFS= read -r -d '' f; do
  rel="${f#"$SRC"/}"
  mkdir -p "$IMG/$(dirname "$rel")"
  cp "$f" "$IMG/$rel"
done < <(find "$SRC" -type f -iname '*.svg' -print0)

# --- normalise messy referenced filenames into clean kebab-case links -------
echo "==> Normalising messy filenames…"
norm() { [ -f "$IMG/$1" ] && mkdir -p "$(dirname "$IMG/$2")" && mv -f "$IMG/$1" "$IMG/$2"; }
norm "NIRWANA 1.webp"                 "brand/nirwana-1.webp"
norm "NIRWANA CLUB HOUSE.webp"        "brand/nirwana-club-house.webp"
norm "NIRWANA CLUB HOUSE(1).webp"     "brand/nirwana-club-house-1.webp"
norm "RAHEJA AMBARA.webp"             "brand/raheja-ambara.webp"
norm "RAHEJA AMBARA/CLUB HOUSE.webp"  "brand/raheja-ambara-club-house.webp"
norm "RAHEHA SKYSCAPES.webp"          "brand/raheja-skyscapes.webp"
norm "Raheja Waterfront.webp"         "brand/raheja-waterfront.webp"
# tidy now-empty spaced dir
rmdir "$IMG/RAHEJA AMBARA" 2>/dev/null || true

# --- download + convert the 11 CloudFront renders (full-res WebP) -----------
echo "==> Downloading + converting renders 1–11 (this is the big one ~330MB)…"
mkdir -p "$IMG/render"
for i in $(seq 1 11); do
  ext="jpg"; [ "$i" = "11" ] && ext="jpeg"
  tmp="$(mktemp)"
  curl -fsS --max-time 300 "$CDN/render/$i.$ext" -o "$tmp"
  cwebp -quiet -q 82 "$tmp" -o "$IMG/render/$i.webp"
  rm -f "$tmp"
  echo "    render $i -> render/$i.webp ($(du -h "$IMG/render/$i.webp" | cut -f1))"
done

# --- copy non-image assets as-is (already optimal formats) ------------------
echo "==> Copying videos / audio / PDFs…"
cp "$ROOT"/public/assets/videos/*.mp4 "$OUT/videos/" 2>/dev/null || true
cp "$ROOT"/public/*.mp4               "$OUT/videos/" 2>/dev/null || true
cp "$ROOT"/public/assets/audio/*.mp3  "$OUT/audio/"  2>/dev/null || true
cp "$ROOT"/public/assets/*.pdf        "$OUT/docs/"   2>/dev/null || true

echo "==> Done. Bundle at: $OUT"
du -sh "$OUT"
