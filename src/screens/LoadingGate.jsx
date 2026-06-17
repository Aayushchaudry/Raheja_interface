import { useEffect, useState } from "react";
import { prefetchAssets, allCached } from "../hooks/useAssetCache.js";
import { REMOTE_ASSETS } from "../data/assetManifest.js";

// The full preload only runs in the packaged kiosk app, NOT on the public
// website — otherwise web visitors would be forced to download ~2 GB before
// seeing anything. The kiosk app loads over file:// (webOS) or reports a webOS
// user agent; ?kiosk=1 forces it on for local testing.
function isKioskApp() {
  if (typeof window === "undefined") return false;
  return (
    window.location.protocol === "file:" ||
    /web0?s/i.test(navigator.userAgent) ||
    /[?&]kiosk=1\b/.test(window.location.search)
  );
}

// Boots the experience only after the heavy remote assets (videos + renders)
// are in the local cache, so the app then runs smoothly and offline.
//
// - Subsequent launches: everything is already cached → allCached() is true and
//   we hand off to the app immediately (instant, offline).
// - First launch (online): download each asset once with a progress bar.
// - First launch (offline): nothing to download yet; we still open the app and
//   media falls back to its poster until a connection lets the cache fill.
export default function LoadingGate({ children }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(0);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    let cancelled = false;

    // Public website (not the packaged app): don't block — media streams from
    // the CDN exactly as before.
    if (!isKioskApp()) {
      setReady(true);
      return undefined;
    }

    (async () => {
      // Fast path: already fully cached → skip straight into the app.
      if (await allCached(REMOTE_ASSETS)) {
        if (!cancelled) setReady(true);
        return;
      }

      // If offline and not yet cached, don't hang on downloads that can't
      // succeed — open the app; media will use posters until assets arrive.
      if (!navigator.onLine) {
        if (!cancelled) {
          setOffline(true);
          setReady(true);
        }
        return;
      }

      await prefetchAssets(
        REMOTE_ASSETS,
        (p) => {
          if (cancelled) return;
          setProgress(p);
          setDone(Math.round(p * REMOTE_ASSETS.length));
        },
        undefined,
        () => cancelled,
      );

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (ready) return children;

  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="loadgate">
      <div className="loadgate-bg" aria-hidden="true" />
      <div className="loadgate-inner">
        <img className="loadgate-logo" src="assets/images/raheja-logo-navbar.png" alt="Raheja Group" />
        <p className="loadgate-eyebrow">Two Decades of Trust</p>
        <h1 className="loadgate-title">Preparing the Experience</h1>

        <div className="loadgate-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span className="loadgate-fill" style={{ width: `${pct}%` }} />
        </div>

        <p className="loadgate-status">
          {offline
            ? "Connect to WiFi to finish the one-time setup."
            : `Downloading films & renders · ${pct}% · ${done} of ${REMOTE_ASSETS.length}`}
        </p>
        <p className="loadgate-note">This one-time download lets everything play smoothly, even offline.</p>
      </div>
    </div>
  );
}
