// Manifest of the remote assets the app downloads into local storage on first
// launch (see screens/LoadingGate.jsx + hooks/useAssetCache.js). After the
// one-time download these display/play from the local cache, so the app runs
// fully offline. Fonts and code ship inside the app package and are not listed.
//
// Images live in the S3 bundle (CloudFront, see data/assetBase.js) as WebP.
// Amenity walkthrough films still stream from the original CloudFront prefix.
// Bump CACHE_VERSION to force a re-download when the asset set changes.

import { IMG_BASE } from "./assetBase.js";

export const CACHE_VERSION = "v2";

// Amenity films + the 4K project walkthrough still live under the old prefix.
const FILM_CDN = "https://d1ovqzmursgzel.cloudfront.net/raheja_avana";

// --- images ----------------------------------------------------------------
const RENDERS = Array.from({ length: 11 }, (_, i) => `${IMG_BASE}/render/${i + 1}.webp`);

const PROJECTS = [
  "raheja-tower", "raheja-residency", "raheja-arth", "raheja-greens",
  "raheja-skyscapes", "raheja-homes", "raheja-greens-phase-2", "raheja-nirwana",
  "raheja-galleria", "raheja-nirwana-2", "raheja-nirwana-3", "raheja-ambara",
  "raheja-rivera", "raheja-avana", "raheja-waterfront", "raheja-prive",
].map((s) => `${IMG_BASE}/projects/${s}.webp`);

const OPT = [
  "ambara", "arth", "greens", "homes", "nirwana-2", "residency", "skyscapes", "towers",
].map((s) => `${IMG_BASE}/opt/${s}.webp`);

const AMENITIES = [
  "banquet-hall", "guest-room", "gym", "indoor-games", "lift-section",
  "meeting-room", "reception-lobby", "sports-facility",
  "sports-multipurpose-hall", "swimming-pool",
].map((s) => `${IMG_BASE}/amenities/${s}.webp`);

const FAMILIES = [1, 2, 3, 4, 5].map((n) => `${IMG_BASE}/families/family-${n}.webp`);

const BRAND = [
  "nirwana-1", "nirwana-club-house", "nirwana-club-house-1", "raheja-ambara",
  "raheja-ambara-club-house", "raheja-skyscapes", "raheja-waterfront",
].map((s) => `${IMG_BASE}/brand/${s}.webp`);

const STANDALONE = [
  "avana", "prive", "riviera", "director", "avanalogo-new",
  "raheja-logo-navbar", "Raheja-luxe-logo-gold",
].map((s) => `${IMG_BASE}/${s}.webp`);

// Architecture renders + every UI/gallery image (~370 MB renders + ~6 MB rest).
export const IMAGE_ASSETS = [
  ...RENDERS, ...PROJECTS, ...OPT, ...AMENITIES, ...FAMILIES, ...BRAND, ...STANDALONE,
];

// Amenity walkthrough films + the 4K project walkthrough (~1.6 GB total).
export const VIDEO_ASSETS = [
  `${FILM_CDN}/RL.mp4`,
  `${FILM_CDN}/SP.mp4`,
  `${FILM_CDN}/GYM.mp4`,
  `${FILM_CDN}/GH.mp4`,
  `${FILM_CDN}/SM.mp4`,
  `${FILM_CDN}/SPT.mp4`,
  `${FILM_CDN}/IG.mp4`,
  `${FILM_CDN}/GR.mp4`,
  `${FILM_CDN}/MR.mp4`,
  `${FILM_CDN}/LIFT.mp4`,
  `${FILM_CDN}/Explore_avana.mp4`,
];

// Everything the loader must fetch, in download order (images first — smaller
// and needed for the gallery/cards; videos second).
export const REMOTE_ASSETS = [...IMAGE_ASSETS, ...VIDEO_ASSETS];
