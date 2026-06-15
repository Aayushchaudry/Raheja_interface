import { useEffect, useRef, useState } from "react";
import CountUp from "../components/CountUp.jsx";
import ScrollCue from "../components/ScrollCue.jsx";
import { luxuryContent } from "../data/brandWallContent.js";

// Background video plays full length at normal speed, then loops.
const VIDEO_START = 0;
const VIDEO_TAIL = 0;
const VIDEO_RATE = 1;

export default function LuxurySection({ onNavigate, onOpenMedia }) {
  const [activeCrown, setActiveCrown] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let end = Infinity;

    const begin = () => {
      end = Math.max(VIDEO_START + 0.1, (video.duration || 0) - VIDEO_TAIL);
      video.playbackRate = VIDEO_RATE;
      try {
        video.currentTime = VIDEO_START;
      } catch {
        /* seeking before ready is a no-op */
      }
      video.play().catch(() => {});
    };

    const onTime = () => {
      if (video.currentTime >= end) {
        try {
          video.currentTime = VIDEO_START;
        } catch {
          /* ignore */
        }
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

  const scrollToCollection = () => {
    document.querySelector(".luxe-collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="luxury" className="luxe-page">
      <div className="luxe-hero">
        <video
          ref={videoRef}
          className="luxe-video-bg"
          src="/assets/raheja-walkthrough.mp4"
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="luxe-video-overlay" aria-hidden="true" />

        <div className="luxe-hero-content">
          <div className="luxe-lockup">
            <img className="luxe-lockup-logo" src="/assets/Raheja-luxe-logo-gold.png" alt="Raheja Luxe" />
            <small>The Private Collection</small>
          </div>
          <h1>
            Curated
            <br />
            <span>Luxury</span>
          </h1>
          <p>{luxuryContent.body}</p>
          <div className="luxe-actions">
            <button className="primary-action" type="button" onClick={scrollToCollection}>
              Enter the Collection <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="luxe-stats" aria-label="Raheja Luxe highlights">
          {luxuryContent.stats.map((stat) => (
            <div key={stat.label}>
              <strong><CountUp value={stat.value} /></strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="luxe-principles">
        {luxuryContent.principles.map((principle) => (
          <article key={principle.title}>
            <p className="eyebrow">{principle.eyebrow}</p>
            <h2>{principle.title}</h2>
            <p>{principle.body}</p>
          </article>
        ))}
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
      <ScrollCue />
    </section>
  );
}
