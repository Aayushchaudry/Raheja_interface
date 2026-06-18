// <img> that loads from the offline cache. Drop-in replacement for a plain
// <img> whose src is a remote bundle asset: it resolves src through the local
// cache (useLocalUrl) so it works offline after the one-time prefetch, and
// falls back to the network URL otherwise. All other props pass straight
// through (className, alt, onLoad, …).

import { useLocalUrl } from "../hooks/useLocalUrl.js";

export default function CachedImg({ src, ...rest }) {
  const resolved = useLocalUrl(src);
  return <img src={resolved} {...rest} />;
}
