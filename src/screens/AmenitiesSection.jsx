import { useEffect, useRef, useState } from "react";
import { getCachedUrl } from "../hooks/useAssetCache.js";

// Full-screen amenities experience for Raheja Avana. Opens from the Avana page's
// "Amenities" card: a luxe grid of every amenity, each playing its full-quality
// walkthrough film (served from the browser cache for instant playback).
export default function AmenitiesSection({ amenities, progress = 0, readySet, onClose }) {
  const [active, setActive] = useState(null); // the amenity whose film is playing
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const objectUrlRef = useRef(null);

  const revoke = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const closePlayer = () => {
    revoke();
    setActive(null);
    setResolvedSrc(null);
  };

  const openPlayer = async (item) => {
    revoke();
    setActive(item);
    setResolvedSrc(null);
    const url = await getCachedUrl(item.video);
    if (url.startsWith("blob:")) objectUrlRef.current = url;
    setResolvedSrc(url);
  };

  // Esc closes the player first, then the amenities page.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (active) closePlayer();
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Revoke any outstanding blob URL on unmount.
  useEffect(() => revoke, []);

  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div className="amenities-overlay">
      <div className="amenities-overlay-bg" aria-hidden="true" />
      <div className="amenities-overlay-dim" aria-hidden="true" />

      <header className="amenities-head">
        <div className="amenities-head-text">
          <p className="amenities-eyebrow">Curated Living · Raheja Avana</p>
          <h2 className="amenities-title">The <em>Amenities</em></h2>
          <p className="amenities-sub">A world of leisure, wellness and gathering — tap any space to step inside.</p>
        </div>

        <button
          className="amenities-close"
          type="button"
          aria-label="Back to Avana"
          onClick={onClose}
          onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      {pct < 100 && (
        <div className="amenities-prep" role="status">
          <span className="amenities-prep-text">Preparing films for smooth playback · {pct}%</span>
          <span className="amenities-prep-bar"><span className="amenities-prep-fill" style={{ width: `${pct}%` }} /></span>
        </div>
      )}

      <div className="amenities-grid">
        {amenities.map((item, i) => {
          const ready = !readySet || readySet.has(item.video);
          return (
            <button
              className="amenity-card"
              type="button"
              key={item.slug}
              style={{ backgroundImage: `url("${item.poster}")` }}
              onClick={() => openPlayer(item)}
            >
              <span className="amenity-card-scrim" aria-hidden="true" />
              <span className="amenity-card-index">{String(i + 1).padStart(2, "0")}</span>
              <span className="amenity-card-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="amenity-card-meta">
                <span className="amenity-card-name">{item.name}</span>
                <span className="amenity-card-desc">{item.desc}</span>
                <span className={`amenity-card-status${ready ? " is-ready" : ""}`}>
                  Play film →
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="avana-video-overlay">
          {resolvedSrc ? (
            <video
              key={active.slug}
              className="avana-video-player"
              src={resolvedSrc}
              autoPlay
              controls
              playsInline
            />
          ) : (
            <div className="amenities-player-loading">
              <span className="amenities-spinner" aria-hidden="true" />
              <p>Loading {active.name}…</p>
            </div>
          )}
          <button
            className="avana-video-close"
            type="button"
            aria-label="Close film"
            onClick={closePlayer}
            onTouchEnd={(e) => { e.preventDefault(); closePlayer(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
