import { useEffect, useRef, useState } from "react";
import ScrollCue from "../components/ScrollCue.jsx";
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
    body: "Designed to an international standard, Avana's architecture balances grandeur with intimacy at every scale.",
    gallery: true,
  },
  {
    title: "Amenities",
    body: "Curated leisure, wellness, and social spaces that elevate everyday living into an ongoing experience.",
    video: "https://d1ovqzmursgzel.cloudfront.net/raheja_avana/Amenities.mp4",
  },
];

function ArchGallery({ onClose }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState("next"); // "next" | "prev"
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

  const goNext = () => {
    if (index < ARCH_SLIDES.length - 1) slide(index + 1, "next");
  };
  const goPrev = () => {
    if (index > 0) slide(index - 1, "prev");
  };

  const current = ARCH_SLIDES[index];
  const isLast = index === ARCH_SLIDES.length - 1;
  const isFirst = index === 0;

  return (
    <div className="arch-gallery-overlay">
      {/* Background image with slide animation */}
      <div
        key={index}
        className={`arch-gallery-bg arch-gallery-bg--${dir}${animating ? " arch-gallery-bg--exit" : " arch-gallery-bg--enter"}`}
        style={{ backgroundImage: `url("${current.image}")` }}
      />
      <div className="arch-gallery-dim" />

      {/* Close */}
      <button className="arch-gallery-close" type="button" aria-label="Close" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Slide counter */}
      <div className="arch-gallery-counter">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="arch-gallery-counter-sep" />
        <span>{String(ARCH_SLIDES.length).padStart(2, "0")}</span>
      </div>

      {/* Text — always visible, updates with each slide */}
      <div className="arch-gallery-text">
        <p className="arch-gallery-eyebrow">Architecture · Raheja Avana</p>
        <h2 className="arch-gallery-title">{current.title}</h2>
        <p className="arch-gallery-body">{current.body}</p>

        {/* Dot indicators */}
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

      {/* Prev arrow */}
      {!isFirst && (
        <button className="arch-gallery-nav arch-gallery-nav--prev" type="button" aria-label="Previous" onClick={goPrev}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Next arrow */}
      {!isLast ? (
        <button className="arch-gallery-nav arch-gallery-nav--next" type="button" aria-label="Next" onClick={goNext}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ) : (
        <div className="arch-gallery-end">
          <span>End of Gallery</span>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailSection({ onOpenMedia, onNavigate }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (!videoSrc) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setVideoSrc(null);
    };
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
      <header className="avana-top">
        <p className="avana-eyebrow">The First. The Finest.</p>
        <h1 className="avana-name">{avanaDetail.title}</h1>
      </header>

      <div className="avana-hero" style={{ backgroundImage: `url("/assets/images/avana.jpg")` }}>
        <div className="avana-hero-brand">
          <p className="avana-hero-eyebrow">Raipur's First Luxury Address</p>
          <img className="avana-hero-logo" src="/assets/images/avanalogo.png" alt="Avana" />
          <p className="avana-hero-tag">Where legacy meets the art of living</p>
        </div>
      </div>

      <div className="avana-grid">
        {FEATURES.map((feature) => (
          <button
            className="avana-card"
            type="button"
            key={feature.title}
            onClick={() => handleCardClick(feature)}
          >
            <span className="avana-card-icon" aria-hidden="true">◇</span>
            <span className="avana-card-text">
              <span className="avana-card-title">{feature.title}</span>
              <span className="avana-card-body">{feature.body}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="avana-cta">
        <div className="avana-cta-copy">
          <p className="avana-eyebrow">Begin Your Journey</p>
          <p className="avana-cta-title">
            Experience Raheja Avana
            <br />
            in its full grandeur
          </p>
        </div>
        <button className="avana-explore" type="button" onClick={() => setVideoSrc(WALKTHROUGH_SRC)}>
          Explore Avana <span aria-hidden="true">→</span>
        </button>
      </div>

      <button className="avana-proceed" type="button" onClick={() => onNavigate("thanks")}>
        <span>Know the Curators of Avana, proceed to Wall 2</span>
        <span className="avana-proceed-arrow" aria-hidden="true">→</span>
      </button>

      {videoSrc ? (
        <div className="avana-video-overlay">
          <button
            className="avana-video-close"
            type="button"
            aria-label="Close video"
            onClick={() => setVideoSrc(null)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <video className="avana-video-player" src={videoSrc} autoPlay controls playsInline />
        </div>
      ) : null}

      {galleryOpen ? <ArchGallery onClose={() => setGalleryOpen(false)} /> : null}

      <ScrollCue />
    </section>
  );
}
