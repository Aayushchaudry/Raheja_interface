import { useEffect, useRef, useState } from "react";

const VIDEO_START = 15;
const VIDEO_END = 28;
const CONFESSION_START = 21;
const CONFESSION_END = 26;

export default function LuxurySection({ onNavigate }) {
  const [phase, setPhase] = useState("video");
  const videoRef = useRef(null);
  const confessionRef = useRef(null);

  // Intro video: 15s → 28s, one time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const begin = () => {
      try { video.currentTime = VIDEO_START; } catch { /* seek before ready */ }
      video.play().catch(() => setPhase("logo"));
    };
    const onTime = () => {
      if (video.currentTime >= VIDEO_END) {
        video.pause();
        setPhase("fade-out");
      }
    };

    video.addEventListener("loadedmetadata", begin);
    video.addEventListener("timeupdate", onTime);
    if (video.readyState >= 1) begin();

    return () => {
      video.removeEventListener("loadedmetadata", begin);
      video.removeEventListener("timeupdate", onTime);
    };
  }, []);

  // Confession video: 21s → 26s, triggered when phase becomes avana-video
  useEffect(() => {
    if (phase !== "avana-video") return undefined;
    const video = confessionRef.current;
    if (!video) return undefined;

    const begin = () => {
      try { video.currentTime = CONFESSION_START; } catch {}
      video.play().catch(() => setPhase("avana-logo"));
    };
    const onTime = () => {
      if (video.currentTime >= CONFESSION_END) {
        video.pause();
        setPhase("avana-fade");
      }
    };

    video.addEventListener("loadedmetadata", begin);
    video.addEventListener("timeupdate", onTime);
    if (video.readyState >= 1) begin();

    return () => {
      video.removeEventListener("loadedmetadata", begin);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [phase]);

  // Auto-navigate to Avana once the logo has settled
  useEffect(() => {
    if (phase !== "avana-logo") return undefined;
    const timer = setTimeout(() => onNavigate("avana"), 2200);
    return () => clearTimeout(timer);
  }, [phase, onNavigate]);

  const handleBlackoutEnd = () => {
    if (phase === "fade-out") setPhase("logo");
    else if (phase === "avana-fade") setPhase("avana-logo");
    // avana-video: blackout just faded out revealing the video — nothing to do
  };

  const handleRuleEnd = () => {
    if (phase === "logo") setPhase("ready");
  };

  const showIntroReveal = phase === "logo" || phase === "ready";
  const isAvanaPhase = ["avana-cta", "avana-video", "avana-fade", "avana-logo"].includes(phase);

  return (
    <section id="luxury" className="luxe-page">
      <div className="luxe-cinematic-hero">

        {/* Intro video */}
        <video
          ref={videoRef}
          className={`luxe-intro-video${phase === "video" ? " is-playing" : ""}`}
          src="/luxury.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={() => setPhase("logo")}
        />

        {/* Confession video — preloads during ready phase, plays during avana-video */}
        {(phase === "ready" || isAvanaPhase) && (
          <video
            ref={confessionRef}
            className={`luxe-confession-video${phase === "avana-video" ? " is-playing" : ""}`}
            src="/confession.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onError={() => setPhase("avana-logo")}
          />
        )}

        {/* Shared blackout — handles both intro and avana fade transitions */}
        <div
          className={`luxe-blackout luxe-blackout--${phase}`}
          onAnimationEnd={handleBlackoutEnd}
        />

        {/* Intro reveal: Raheja Luxe logo + gold rule + scroll cue */}
        {showIntroReveal && (
          <div className="luxe-reveal">
            <img
              className="luxe-logo-reveal"
              src="/assets/images/Raheja-luxe-logo-gold.png"
              alt="Raheja Luxe"
            />
            <div className="luxe-gold-rule" onAnimationEnd={handleRuleEnd} />
            {phase === "ready" && (
              <div className="luxe-cta-group">
                <button
                  className="luxe-scroll-cue"
                  type="button"
                  onClick={() => setPhase("avana-cta")}
                  aria-label="Enter Avana"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <p className="luxe-enter-text">Enter Luxury</p>
              </div>
            )}
          </div>
        )}

        {/* Avana CTA — full-screen royal button */}
        {phase === "avana-cta" && (
          <button
            className="luxe-avana-btn"
            type="button"
            onClick={() => setPhase("avana-video")}
          >
            <span className="luxe-avana-btn-eyebrow">Enter Luxury of</span>
            <em className="luxe-avana-btn-title">Raheja Avana</em>
          </button>
        )}

        {/* Avana logo — appears after confession video, then auto-navigates */}
        {phase === "avana-logo" && (
          <img
            className="luxe-avana-logo"
            src="/assets/images/avanalogo.png"
            alt="Raheja Avana"
          />
        )}

      </div>
    </section>
  );
}
