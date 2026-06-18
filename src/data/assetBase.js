// Single source of truth for the remote asset bundle hosted on S3 (served via
// CloudFront). Everything the app shows now lives under this prefix as WebP —
// upload the local `raheja-assets/` folder to S3 under the existing
// `raheja_avana/` prefix (so it lives at `raheja_avana/raheja-assets/`) for the
// paths below to resolve. See raheja-assets/README.md for the layout + link map.
//
// Offline: these URLs are prefetched into Cache Storage on first launch (see
// data/assetManifest.js + screens/LoadingGate.jsx) and resolved to local blob
// URLs at render time via getLocalUrl()/useLocalUrl(), so the kiosk runs fully
// offline after the one-time download.

export const ASSET_BASE = "https://d1ovqzmursgzel.cloudfront.net/raheja_avana/raheja-assets";
export const IMG_BASE = `${ASSET_BASE}/images`;

// Build a full image URL from a path under images/ (extension included).
//   asset("projects/raheja-avana.webp")
//   asset("render/7.webp")
export const asset = (path) => `${IMG_BASE}/${path}`;
