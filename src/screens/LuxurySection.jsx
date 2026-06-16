import { useEffect, useRef, useState } from "react";

const VIDEO_START = 15;
const VIDEO_END = 28;
const CONFESSION_START = 21.7;
const CONFESSION_END = 26;

export default function LuxurySection({ onNavigate }) {
  const [phase, setPhase] = useState("video");
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef(null);
  const confessionRef = useRef(null);

  // ── Intro video: seek to 15s, play until 28s ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let startTimer = null;

    const begin = () => {
      startTimer = setTimeout(() => {
        const onSeeked = () => {
          video.play().catch(() => setPhase("logo"));
          setVideoReady(true);
        };
        video.addEventListener("seeked", onSeeked, { once: true });
        try {
          video.currentTime = VIDEO_START;
        } catch {
          video.play().catch(() => setPhase("logo"));
          setVideoReady(true);
        }
      }, 600);
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
      if (startTimer) clearTimeout(startTimer);
    };
  }, []);

  // ── Confession video: starts at 21.7s → 26s ──
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

  // ── Avana pause: 900ms black screen before confession ──
  useEffect(() => {
    if (phase !== "avana-pause") return undefined;
    const timer = setTimeout(() => setPhase("avana-video"), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  // ── Auto-navigate to Avana after logo settles ──
  useEffect(() => {
    if (phase !== "avana-logo") return undefined;
    const timer = setTimeout(() => onNavigate("avana"), 2200);
    return () => clearTimeout(timer);
  }, [phase, onNavigate]);

  const handleBlackoutEnd = () => {
    if (phase === "fade-out") setPhase("logo");
    else if (phase === "avana-fade") setPhase("avana-logo");
  };

  const handleRuleEnd = () => {
    if (phase === "logo") setPhase("ready");
  };

  const showIntroReveal = phase === "logo" || phase === "ready";
  const isAvanaPhase = ["avana-cta", "avana-pause", "avana-video", "avana-fade", "avana-logo"].includes(phase);

  return (
    <section id="luxury" className="luxe-page">
      <div className="luxe-cinematic-hero">

        {/* Intro video — invisible until seeked to 15s */}
        <video
          ref={videoRef}
          className={`luxe-intro-video${videoReady && phase === "video" ? " is-playing" : ""}`}
          src="/luxury.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={() => { setVideoReady(false); setPhase("logo"); }}
        />

        {/* Ambient background for avana-cta */}
        {phase === "avana-cta" && (
          <div className="luxe-ambient-bg" aria-hidden="true">
            <div className="luxe-ambient-orb luxe-ambient-orb--1" />
            <div className="luxe-ambient-orb luxe-ambient-orb--2" />
            <div className="luxe-ambient-orb luxe-ambient-orb--3" />
          </div>
        )}

        {/* Confession video — preloads during avana phases */}
        {isAvanaPhase && (
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

        {/* Shared blackout overlay */}
        <div
          className={`luxe-blackout luxe-blackout--${phase}`}
          onAnimationEnd={handleBlackoutEnd}
        />

        {/* Logo reveal + scroll cue (logo → ready phases) */}
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
                  aria-label="Enter Luxury of Raheja Avana"
                  onClick={() => setPhase("avana-cta")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <p className="luxe-enter-text">Enter Luxury</p>
              </div>
            )}
          </div>
        )}

        {/* Avana CTA — big centred button */}
        {phase === "avana-cta" && (
          <button
            className="luxe-avana-btn"
            type="button"
            onClick={() => setPhase("avana-pause")}
          >
            <span className="luxe-avana-btn-eyebrow">Enter Luxury of</span>
            <em className="luxe-avana-btn-title">Raheja Avana</em>
          </button>
        )}

        {/* Avana logo after confession video */}
        {phase === "avana-logo" && (
          <img
            className="luxe-avana-logo"
            src="/assets/images/avanalogo-new.png"
            alt="Raheja Avana"
          />
        )}

      </div>
    </section>
  );
}
