import { useEffect, useRef, useState } from "react";
import { luxuryContent } from "../data/brandWallContent.js";

const VIDEO_START = 15;
const VIDEO_END = 28;
const CONFESSION_START = 21.7;
const CONFESSION_END = 26;

export default function LuxurySection({ onNavigate }) {
  const [phase, setPhase] = useState("video");
  // videoReady: true only after intro video has seeked to 15s — prevents showing frame 0
  const [videoReady, setVideoReady] = useState(false);
  // principle carousel state
  const [principleIndex, setPrincipleIndex] = useState(0);
  const [principleAnim, setPrincipleAnim] = useState("entering");

  const videoRef = useRef(null);
  const confessionRef = useRef(null);

  // ── Intro video: hide until seeked to 15s, then fade in ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let startTimer = null;

    const begin = () => {
      startTimer = setTimeout(() => {
        const onSeeked = () => {
          video.play().catch(() => setPhase("logo"));
          setVideoReady(true); // reveal only after correct frame is ready
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

  // ── Confession video: 21s → 26s ──
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

  // ── Avana pause: hold black screen 900ms before revealing confession ──
  useEffect(() => {
    if (phase !== "avana-pause") return undefined;
    const timer = setTimeout(() => setPhase("avana-video"), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  // ── Principles carousel: entering → (2.4s) → exiting → (650ms) → next ──
  useEffect(() => {
    if (phase !== "principles") return undefined;

    if (principleAnim === "entering") {
      const timer = setTimeout(() => setPrincipleAnim("exiting"), 2400);
      return () => clearTimeout(timer);
    }

    if (principleAnim === "exiting") {
      const timer = setTimeout(() => {
        if (principleIndex < 2) {
          setPrincipleIndex(i => i + 1);
          setPrincipleAnim("entering");
        } else {
          setPhase("avana-cta");
        }
      }, 650);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [phase, principleAnim, principleIndex]);

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

  // Skip to next principle (or advance) on tap
  const handleCardTap = () => {
    if (principleAnim === "exiting") return;
    if (principleIndex < 2) {
      setPrincipleAnim("exiting");
    } else {
      setPhase("avana-cta");
    }
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

        {/* Ambient background for principles + avana-cta phases */}
        {(phase === "principles" || phase === "avana-cta") && (
          <div className="luxe-ambient-bg" aria-hidden="true">
            <div className="luxe-ambient-orb luxe-ambient-orb--1" />
            <div className="luxe-ambient-orb luxe-ambient-orb--2" />
            <div className="luxe-ambient-orb luxe-ambient-orb--3" />
          </div>
        )}

        {/* Confession video — preloads during principles + avana phases */}
        {(phase === "principles" || isAvanaPhase) && (
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

        {/* Shared blackout */}
        <div
          className={`luxe-blackout luxe-blackout--${phase}`}
          onAnimationEnd={handleBlackoutEnd}
        />

        {/* Intro reveal */}
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
                  onClick={() => setPhase("principles")}
                  aria-label="Explore principles"
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

        {/* Single principles card — one principle at a time */}
        {phase === "principles" && (
          <div className="luxe-single-card" onClick={handleCardTap} role="button" tabIndex={0} aria-label="Next">
            {/* Top gold rule */}
            <div className="luxe-card-rule" aria-hidden="true" />

            {/* Principle content */}
            <div key={principleIndex} className={`luxe-card-principle luxe-card-principle--${principleAnim}`}>
              <p className="luxe-principle-eyebrow">{luxuryContent.principles[principleIndex].eyebrow}</p>
              <h2 className="luxe-principle-title">{luxuryContent.principles[principleIndex].title}</h2>
            </div>

            {/* Footer: principle name nav + progress dots */}
            <div className="luxe-card-footer">
              <nav className="luxe-card-nav" aria-hidden="true">
                {luxuryContent.principles.map((p, i) => (
                  <span
                    key={i}
                    className={`luxe-card-nav-item${i === principleIndex ? " is-active" : i < principleIndex ? " is-past" : ""}`}
                  >
                    {p.eyebrow}
                  </span>
                ))}
              </nav>
              <div className="luxe-card-dots" aria-hidden="true">
                {luxuryContent.principles.map((_, i) => (
                  <div key={i} className={`luxe-card-dot${i === principleIndex ? " is-active" : i < principleIndex ? " is-done" : ""}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Avana CTA */}
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

        {/* Avana logo */}
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
