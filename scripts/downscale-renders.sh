#!/usr/bin/env bash
# Re-generate the 11 architecture renders at a TV-friendly width (default 2560px)
# from the original high-quality JPG source. The 8000px originals decode far too
# slowly on the weak TV GPU; 2560px is visually identical on a 1080p/4K panel but
# ~10x cheaper to decode/hold in memory. Output goes to raheja-assets/images/render/
# ready to re-upload to S3 (overwrite the existing render/*.webp).
set -euo pipefail

WIDTH="${1:-2560}"          # pass 1920 for a 1080p-only TV, 3840 for 4K-max
SRC="https://d1ovqzmursgzel.cloudfront.net/raheja_avana/render"
OUT="$(cd "$(dirname "$0")/.." && pwd)/raheja-assets/images/render"
rm -rf "$OUT"; mkdir -p "$OUT"

echo "==> Downscaling renders to ${WIDTH}px wide…"
for i in $(seq 1 11); do
  ext="jpg"; [ "$i" = "11" ] && ext="jpeg"
  tmp="$(mktemp)"
  curl -fsS --max-time 300 "$SRC/$i.$ext" -o "$tmp"
  # cwebp -resize W 0 keeps aspect ratio (0 = auto height).
  cwebp -quiet -q 82 -resize "$WIDTH" 0 "$tmp" -o "$OUT/$i.webp"
  rm -f "$tmp"
  echo "    render $i -> $(du -h "$OUT/$i.webp" | cut -f1)  ($(sips -g pixelWidth "$OUT/$i.webp" 2>/dev/null | awk '/pixel/{print $2}')px)"
done
echo "==> Done: $OUT"
du -sh "$OUT"
