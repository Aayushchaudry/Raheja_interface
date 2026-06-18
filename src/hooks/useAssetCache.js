// Browser-side asset prefetch + playback cache.
//
// The kiosk plays full-quality, uncompressed amenity films. To make them play
// smoothly with zero buffering, we download each video once into the Cache
// Storage API (persistent, disk-backed — survives reloads) and then play from a
// fully-downloaded Blob. Seeking is instant because the whole file is local.
//
// Everything degrades gracefully: if Cache Storage is unavailable (e.g. an
// insecure context) playback simply falls back to streaming the original URL.

import { CACHE_VERSION } from "../data/assetManifest.js";

const CACHE_NAME = `raheja-assets-${CACHE_VERSION}`;

// Memoised blob: URLs so an asset used many times (e.g. a render shown in the
// gallery and again on a card) resolves to one stable URL for the session
// instead of creating — and leaking — a new object URL on every call. On a
// long-running kiosk these intentionally live for the whole session.
const localUrlCache = new Map();

function cacheSupported() {
  return typeof caches !== "undefined" && typeof window !== "undefined";
}

/**
 * Delete any previous-version asset caches (e.g. raheja-assets-v1) left behind
 * after CACHE_VERSION is bumped, so old data doesn't pile up on the device.
 * Safe to call on every launch; only touches our own caches.
 */
export async function purgeStaleCaches() {
  if (!cacheSupported()) return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith("raheja-assets-") && k !== CACHE_NAME)
        .map((k) => caches.delete(k)),
    );
  } catch {
    // ignore — purging is best-effort
  }
}

/**
 * Download a list of URLs into the cache, one at a time so progress is smooth
 * and we never hold more than one in-flight request.
 *
 * @param {string[]} urls
 * @param {(fraction:number)=>void} [onProgress]   0..1 overall progress
 * @param {(url:string)=>void}      [onAssetReady] fired as each url finishes
 * @param {() => boolean}           [isCancelled]  return true to stop early
 */
export async function prefetchAssets(urls, onProgress, onAssetReady, isCancelled) {
  if (!cacheSupported()) {
    onProgress?.(1);
    return;
  }

  let cache;
  try {
    cache = await caches.open(CACHE_NAME);
  } catch {
    onProgress?.(1);
    return;
  }

  let done = 0;
  for (const url of urls) {
    if (isCancelled?.()) return;
    try {
      const existing = await cache.match(url);
      if (!existing) {
        const res = await fetch(url, { cache: "force-cache" });
        if (res.ok) await cache.put(url, res.clone());
      }
      onAssetReady?.(url);
    } catch {
      // Leave it uncached — playback will stream from the network instead.
    }
    done += 1;
    onProgress?.(done / urls.length);
  }
}

/**
 * Resolve a playable URL for a video. Returns a Blob object URL when the asset
 * is cached (instant, fully-buffered playback) or the original URL otherwise.
 * Callers must revokeObjectURL() any returned blob: URL when done.
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function getCachedUrl(url) {
  if (!cacheSupported()) return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(url);
    if (res) {
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
  } catch {
    // fall through to the network URL
  }
  return url;
}

/**
 * Resolve a usable URL for an asset, preferring the local cache. Returns a
 * memoised blob: URL when cached (works fully offline), otherwise the original
 * URL (which will hit the network, or fail gracefully when offline). Safe to
 * call from render-time component state — the returned URL is stable per asset.
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function getLocalUrl(url) {
  if (localUrlCache.has(url)) return localUrlCache.get(url);
  if (!cacheSupported()) return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(url);
    if (res) {
      const blobUrl = URL.createObjectURL(await res.blob());
      localUrlCache.set(url, blobUrl);
      return blobUrl;
    }
  } catch {
    // fall through to the network URL
  }
  return url;
}

/**
 * True when every URL in the list is already in the local cache — used to tell
 * whether the app can run offline without a download.
 *
 * @param {string[]} urls
 * @returns {Promise<boolean>}
 */
export async function allCached(urls) {
  if (!cacheSupported()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      if (!(await cache.match(url))) return false;
    }
    return true;
  } catch {
    return false;
  }
}
