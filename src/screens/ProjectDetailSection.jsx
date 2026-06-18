import { useEffect, useRef, useState } from "react";
import { avanaDetail } from "../data/brandWallContent.js";
import { avanaAmenities } from "../data/amenities.js";
import { prefetchAssets, getLocalUrl } from "../hooks/useAssetCache.js";
import { IMG_BASE, asset } from "../data/assetBase.js";
import CachedImg from "../components/CachedImg.jsx";
import AmenitiesSection from "./AmenitiesSection.jsx";

const WALKTHROUGH_SRC = "https://d1ovqzmursgzel.cloudfront.net/raheja_avana/Raheja%20Avana.mp4";

const RENDER_BASE = `${IMG_BASE}/render-2560`;

const ARCH_SLIDES = [
  {
    image: `${RENDER_BASE}/1.webp`,
    title: "The Grand Arrival",
    body: "A stately, screened gateway announces Avana — Raipur's first address, where every homecoming feels like an occasion.",
  },
  {
    image: `${RENDER_BASE}/2.webp`,
    title: "The Clubhouse",
    body: "A sculptural clubhouse crowns the community, its floating roofline and terraced gardens setting a new benchmark for leisure in the city.",
  },
  {
    image: `${RENDER_BASE}/3.webp`,
    title: "The Waterscape",
    body: "An expansive resort-style pool mirrors the dusk sky — a private oasis framed by cascading green terraces.",
  },
  {
    image: `${RENDER_BASE}/4.webp`,
    title: "The Garden Promenade",
    body: "Residences open onto lush, flower-lined walks, where landscaped greens turn every stroll home into a walk through a garden.",
  },
  {
    image: `${RENDER_BASE}/5.webp`,
    title: "Twilight Residences",
    body: "As evening falls, glass-fronted homes glow with warmth — architecture and light composed for a life lived beautifully.",
  },
  {
    image: `${RENDER_BASE}/6.webp`,
    title: "The Central Green",
    body: "Flowering Gulmohars canopy a central commons — a gathering place designed for community, calm and unhurried evenings.",
  },
  {
    image: `${RENDER_BASE}/7.webp`,
    title: "Gardens of Wellbeing",
    body: "Jacaranda blooms and open play lawns weave wellness into daily life, crafted for families to grow, move and unwind.",
  },
  {
    image: `${RENDER_BASE}/8.webp`,
    title: "The Residences",
    body: "Tree-lined avenues frame a procession of refined villa façades — proportioned, private and unmistakably Avana.",
  },
  {
    image: `${RENDER_BASE}/9.webp`,
    title: "The Leisure Lawn",
    body: "Generous open lawns and shaded pergolas invite pause and play — luxury measured in space, light and greenery.",
  },
  {
    image: `${RENDER_BASE}/10.webp`,
    title: "The Masterplan",
    body: "Seen from above, Avana unfolds as a meticulously master-planned sanctuary — a green township destined to define Raipur's tomorrow.",
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
    amenities: true,
  },
];

function ArchGallery({ onClose }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState("next");
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef(null);

  // Resolve every render to its locally-cached copy (offline-safe). Until a
  // resolution lands the network URL is used, so it always shows something.
  const [localImages, setLocalImages] = useState({});
  useEffect(() => {
    let alive = true;
    Promise.all(ARCH_SLIDES.map((s) => getLocalUrl(s.image).then((u) => [s.image, u]))).then(
      (pairs) => { if (alive) setLocalImages(Object.fromEntries(pairs)); },
    );
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Warm the adjacent renders so navigating the gallery feels instant despite
  // the large, full-resolution image files.
  useEffect(() => {
    const warm = (i) => {
      if (i < 0 || i >= ARCH_SLIDES.length) return;
      const img = new Image();
      img.src = ARCH_SLIDES[i].image;
    };
    warm(index + 1);
    warm(index - 1);
  }, [index]);

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
        style={{ backgroundImage: `url("${localImages[current.image] || current.image}")` }}
      />
      <div className="arch-gallery-dim" />
      <button
        className="arch-gallery-close"
        type="button"
        aria-label="Close"
        onClick={onClose}
        onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
      >
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
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [prefetch, setPrefetch] = useState({ progress: 0, ready: new Set() });

  useEffect(() => {
    if (!videoSrc) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setVideoSrc(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [videoSrc]);

  // The moment the Avana page is reached, begin downloading the amenity films
  // into the browser cache so they play instantly when the visitor opens them.
  useEffect(() => {
    let cancelled = false;
    prefetchAssets(
      avanaAmenities.map((a) => a.video),
      (p) => { if (!cancelled) setPrefetch((s) => ({ ...s, progress: p })); },
      (url) => {
        if (cancelled) return;
        setPrefetch((s) => {
          const ready = new Set(s.ready);
          ready.add(url);
          return { ...s, ready };
        });
      },
      () => cancelled,
    );
    return () => { cancelled = true; };
  }, []);

  // Resolve to the locally-cached copy (offline-safe) before playing; falls back
  // to the network URL if it isn't cached.
  const openVideo = (url) => { getLocalUrl(url).then(setVideoSrc); };

  const handleCardClick = (feature) => {
    if (feature.gallery) { setGalleryOpen(true); return; }
    if (feature.amenities) { setAmenitiesOpen(true); return; }
    if (feature.video) { openVideo(feature.video); return; }
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
        <CachedImg className="avana-hero-logo" src={asset("avanalogo-new.webp")} alt="Raheja Avana" />
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
            onClick={() => openVideo(WALKTHROUGH_SRC)}
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
          <video className="avana-video-player" src={videoSrc} autoPlay controls playsInline />
          <button
            className="avana-video-close"
            type="button"
            aria-label="Close video"
            onClick={() => setVideoSrc(null)}
            onTouchEnd={(e) => { e.preventDefault(); setVideoSrc(null); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {galleryOpen && <ArchGallery onClose={() => setGalleryOpen(false)} />}

      {amenitiesOpen && (
        <AmenitiesSection
          amenities={avanaAmenities}
          progress={prefetch.progress}
          readySet={prefetch.ready}
          onClose={() => setAmenitiesOpen(false)}
        />
      )}
    </section>
  );
}
