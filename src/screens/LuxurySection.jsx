import { useEffect, useRef, useState } from "react";
import { luxuryContent } from "../data/brandWallContent.js";

const VIDEO_START = 15;
const VIDEO_END = 28;

export default function LuxurySection({ onNavigate }) {
  const [phase, setPhase] = useState("video");
  const [activeCrown, setActiveCrown] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const begin = () => {
      try { video.currentTime = VIDEO_START; } catch { /* seeking before ready */ }
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

  const handleBlackoutEnd = () => {
    if (phase === "fade-out") setPhase("logo");
  };

  const handleRuleEnd = () => {
    if (phase === "logo") setPhase("ready");
  };

  const scrollToCollection = () => {
    document.querySelector(".luxe-collection")?.scrollIntoView({ behavior: "smooth" });
  };

  const showReveal = phase === "logo" || phase === "ready";

  return (
    <section id="luxury" className="luxe-page">
      <div className="luxe-cinematic-hero">
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

        <div
          className={`luxe-blackout luxe-blackout--${phase}`}
          onAnimationEnd={handleBlackoutEnd}
        />

        {showReveal && (
          <div className="luxe-reveal">
            <img
              className="luxe-logo-reveal"
              src="/assets/images/Raheja-luxe-logo-gold.png"
              alt="Raheja Luxe"
            />
            <div
              className="luxe-gold-rule"
              onAnimationEnd={handleRuleEnd}
            />
            {phase === "ready" && (
              <button
                className="luxe-scroll-cue"
                type="button"
                onClick={scrollToCollection}
                aria-label="Scroll to collection"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="luxe-collection">
        <div className="luxe-section-heading">
          <p className="eyebrow">Our Curations</p>
          <h2>The Private Collection</h2>
          <p>Three extraordinary residences, each conceived as a distinct expression of luxury, place, and the Raheja promise.</p>
        </div>

        <div className="crown-collection">
          {luxuryContent.collections.map((item, index) => {
            const [first, ...rest] = item.title.split(" ");
            return (
              <article
                className={`crown-card crown-card--${index + 1}${activeCrown === index ? " is-active" : ""}`}
                key={item.title}
                onMouseEnter={() => setActiveCrown(index)}
                onMouseLeave={() => setActiveCrown(null)}
                onPointerDown={() => setActiveCrown(index)}
              >
                <div className="crown-content">
                  {item.image ? (
                    <div
                      className="crown-photo"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    >
                      {item.badge ? <span className="crown-badge">{item.badge}</span> : null}
                    </div>
                  ) : null}
                  <p className="crown-eyebrow">
                    <span className="crown-dash" aria-hidden="true" />
                    {item.eyebrow}
                  </p>
                  <h3 className="crown-title">
                    {first} {rest.length ? <em>{rest.join(" ")}</em> : null}
                  </h3>
                  <p className="crown-tagline">{item.location}</p>
                  <div className="crown-reveal">
                    <p className="crown-body">{item.body}</p>
                  </div>
                  {item.title === "Raheja Avana" ? (
                    <button
                      className="crown-explore"
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("avana");
                      }}
                    >
                      Explore Avana <span aria-hidden="true">→</span>
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
