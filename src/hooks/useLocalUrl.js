// React helpers around getLocalUrl() (see useAssetCache.js). They resolve a
// remote asset URL to its locally-cached blob URL so images render from the
// offline cache, falling back to the network URL until the cache resolves (or
// when the cache is unavailable). The network URL is shown immediately so there
// is never a blank frame; it swaps to the cached blob when ready.

import { useEffect, useRef, useState } from "react";
import { getLocalUrl } from "./useAssetCache.js";

/** Resolve a single asset URL → locally-cached blob URL (or the original). */
export function useLocalUrl(url) {
  const [resolved, setResolved] = useState(url);
  useEffect(() => {
    let alive = true;
    setResolved(url); // show the network URL right away
    if (url) getLocalUrl(url).then((u) => { if (alive) setResolved(u); });
    return () => { alive = false; };
  }, [url]);
  return resolved;
}

/**
 * Resolve a list of asset URLs → a { [originalUrl]: resolvedUrl } map. Missing
 * keys fall back to the original URL at the call site. Stable across renders
 * for the same set of URLs.
 */
export function useLocalUrls(urls) {
  const key = (urls || []).filter(Boolean).join("|");
  const [map, setMap] = useState({});
  const keyRef = useRef(key);
  keyRef.current = key;
  useEffect(() => {
    let alive = true;
    Promise.all(
      (urls || [])
        .filter(Boolean)
        .map((u) => getLocalUrl(u).then((r) => [u, r])),
    ).then((pairs) => { if (alive) setMap(Object.fromEntries(pairs)); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return map;
}
