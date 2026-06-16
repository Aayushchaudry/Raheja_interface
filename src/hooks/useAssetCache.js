// Browser-side asset prefetch + playback cache.
//
// The kiosk plays full-quality, uncompressed amenity films. To make them play
// smoothly with zero buffering, we download each video once into the Cache
// Storage API (persistent, disk-backed — survives reloads) and then play from a
// fully-downloaded Blob. Seeking is instant because the whole file is local.
//
// Everything degrades gracefully: if Cache Storage is unavailable (e.g. an
// insecure context) playback simply falls back to streaming the original URL.

const CACHE_NAME = "avana-amenities-v1";

function cacheSupported() {
  return typeof caches !== "undefined" && typeof window !== "undefined";
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
