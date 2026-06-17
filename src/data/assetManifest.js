// Manifest of the heavy remote assets the app downloads into local storage on
// first launch (see screens/LoadingGate.jsx + hooks/useAssetCache.js). After the
// one-time download these play/display from the local cache, so the app runs
// fully offline. Small UI images, fonts and code ship inside the app package and
// are never listed here.
//
// Origin is the existing CloudFront distribution (S3-backed). Bump CACHE_VERSION
// to force a re-download when the asset set changes.

export const CACHE_VERSION = "v1";

const CDN = "https://d1ovqzmursgzel.cloudfront.net/raheja_avana";

// Amenity walkthrough films + the 4K project walkthrough (~1.6 GB total).
export const VIDEO_ASSETS = [
  `${CDN}/RL.mp4`,
  `${CDN}/SP.mp4`,
  `${CDN}/GYM.mp4`,
  `${CDN}/GH.mp4`,
  `${CDN}/SM.mp4`,
  `${CDN}/SPT.mp4`,
  `${CDN}/IG.mp4`,
  `${CDN}/GR.mp4`,
  `${CDN}/MR.mp4`,
  `${CDN}/LIFT.mp4`,
  `${CDN}/Explore_avana.mp4`,
];

// Architecture renders shown in the Avana gallery + the Galleria project card
// (~372 MB total — full quality, no compression).
export const IMAGE_ASSETS = [
  `${CDN}/render/1.jpg`,
  `${CDN}/render/2.jpg`,
  `${CDN}/render/3.jpg`,
  `${CDN}/render/4.jpg`,
  `${CDN}/render/5.jpg`,
  `${CDN}/render/6.jpg`,
  `${CDN}/render/7.jpg`,
  `${CDN}/render/8.jpg`,
  `${CDN}/render/9.jpg`,
  `${CDN}/render/10.jpg`,
  `${CDN}/render/11.jpeg`,
];

// Everything the loader must fetch, in download order (images first — they are
// smaller and needed for the gallery/cards; videos second).
export const REMOTE_ASSETS = [...IMAGE_ASSETS, ...VIDEO_ASSETS];
