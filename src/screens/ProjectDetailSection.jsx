import { useEffect, useRef, useState } from "react";
import { avanaDetail } from "../data/brandWallContent.js";

const WALKTHROUGH_SRC = "https://d1ovqzmursgzel.cloudfront.net/raheja_avana/Explore_avana.mp4";

const ARCH_SLIDES = [
  {
    image: "/assets/images/AVANA1.jpg",
    title: "Grand Architecture",
    body: "Designed to an international standard, Avana's architecture balances grandeur with intimacy at every scale.",
  },
  {
    image: "/assets/images/AVANA2.jpg",
    title: "Elegant Facades",
    body: "Every elevation is considered — proportioned to impress, detailed to endure, and crafted to become an icon.",
  },
  {
    image: "/assets/images/AVANA3.jpg",
    title: "Timeless Design",
    body: "Where modern luxury meets classical permanence. A residence that will stand as Raipur's finest address for generations.",
  },
];

const FEATURES = [
  {
    title: "Architecture",
    body: "Designed to an international standard — grandeur balanced with intimacy.",
    gallery: true,
  },
  {
    title: "Amenities",
    body: "Curated leisure, wellness and social spaces that elevate the everyday.",
    video: "https://d1ovqzmursgzel.cloudfront.net/raheja_avana/Amenities.mp4",
  },
];

function ArchGallery({ onClose }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState("next");
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const slide = (newIndex, direction) => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex(newIndex);
      setAnimating(false);
    }, 420);
  };

  const goNext = () => { if (index < ARCH_SLIDES.length - 1) slide(index + 1, "next"); };
  const goPrev = () => { if (index > 0) slide(index - 1, "prev"); };

  const current = ARCH_SLIDES[index];
  const isLast = index === ARCH_SLIDES.length - 1;
  const isFirst = index === 0;

  return (
    <div className="arch-gallery-overlay">
      <div
        key={index}
        className={`arch-gallery-bg arch-gallery-bg--${dir}${animating ? " arch-gallery-bg--exit" : " arch-gallery-bg--enter"}`}
        style={{ backgroundImage: `url("${current.image}")` }}
      />
      <div className="arch-gallery-dim" />
      <button className="arch-gallery-close" type="button" aria-label="Close" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="arch-gallery-counter">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="arch-gallery-counter-sep" />
        <span>{String(ARCH_SLIDES.length).padStart(2, "0")}</span>
      </div>
      <div className="arch-gallery-text">
        <p className="arch-gallery-eyebrow">Architecture · Raheja Avana</p>
        <h2 className="arch-gallery-title">{current.title}</h2>
        <p className="arch-gallery-body">{current.body}</p>
        <div className="arch-gallery-dots">
          {ARCH_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`arch-gallery-dot${i === index ? " is-active" : ""}`}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => slide(i, i > index ? "next" : "prev")}
            />
          ))}
        </div>
      </div>
      {!isFirst && (
        <button className="arch-gallery-nav arch-gallery-nav--prev" type="button" aria-label="Previous" onClick={goPrev}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {!isLast ? (
        <button className="arch-gallery-nav arch-gallery-nav--next" type="button" aria-label="Next" onClick={goNext}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ) : (
        <div className="arch-gallery-end"><span>End of Gallery</span></div>
      )}
    </div>
  );
}

export default function ProjectDetailSection({ onOpenMedia, onNavigate }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (!videoSrc) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setVideoSrc(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoSrc]);

  const handleCardClick = (feature) => {
    if (feature.gallery) { setGalleryOpen(true); return; }
    if (feature.video) { setVideoSrc(feature.video); return; }
    onOpenMedia(feature.action);
  };

  return (
    <section id="avana" className="avana-page">
      <div className="avana-bg-glow" aria-hidden="true" />

      {/* Top left header */}
      <header className="avana-header">
        <p className="avana-header-eyebrow">The First · The Finest</p>
        <h1 className="avana-header-title">Raheja <em>Avana</em></h1>
      </header>

      {/* Left-aligned hero body */}
      <div className="avana-hero-body">
        <p className="avana-hero-address">Raipur's First Luxury Address</p>
        <img className="avana-hero-logo" src="/assets/images/avanalogo-new.png" alt="Raheja Avana" />
        <div className="avana-hero-rule" aria-hidden="true" />
        <p className="avana-hero-tagline">Where legacy meets the art of living.</p>
      </div>

      {/* Bottom bar */}
      <div className="avana-bottom-row">
        {/* Two feature cards */}
        <div className="avana-feat-cards">
          <div className="avana-feat-top-rule" aria-hidden="true" />
          {FEATURES.map((feature, i) => (
            <button
              className="avana-feat-card"
              type="button"
              key={feature.title}
              onClick={() => handleCardClick(feature)}
            >
              <span className="avana-feat-left">
                <span className="avana-feat-num">0{i + 1}</span>
                <span className="avana-feat-title">{feature.title}</span>
              </span>
              <span className="avana-feat-right">
                <span className="avana-feat-body">{feature.body}</span>
                <span className="avana-feat-discover">Discover <span aria-hidden="true">→</span></span>
              </span>
            </button>
          ))}
        </div>

        {/* Right: Explore Avana on top, proceed circle below */}
        <div className="avana-right-actions">
          <button
            className="avana-explore-btn"
            type="button"
            onClick={() => setVideoSrc(WALKTHROUGH_SRC)}
          >
            Explore Avana <span aria-hidden="true">→</span>
          </button>
          <button className="avana-proceed-btn" type="button" onClick={() => onNavigate("thanks")}>
            <span className="avana-proceed-sub">Know the Curators of Avana</span>
            <div className="avana-proceed-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Video overlay */}
      {videoSrc && (
        <div className="avana-video-overlay">
          <div className="avana-video-toolbar">
            <button className="avana-video-close" type="button" aria-label="Close video" onClick={() => setVideoSrc(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <video className="avana-video-player" src={videoSrc} autoPlay controls playsInline />
        </div>
      )}

      {galleryOpen && <ArchGallery onClose={() => setGalleryOpen(false)} />}
    </section>
  );
}
