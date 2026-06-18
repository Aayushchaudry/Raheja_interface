import { useEffect, useRef, useState } from "react";
import { heroContent } from "../data/brandWallContent.js";
import { useLocalUrls } from "../hooks/useLocalUrl.js";

// Faint drifting light particles ported from the Ambara hero reference.
function Dust() {
  const motes = useRef(null);
  if (!motes.current) {
    motes.current = Array.from({ length: 14 }, () => ({
      left: Math.random() * 100,
      top: 40 + Math.random() * 60,
      w: 2 + Math.random() * 5,
      dur: 13 + Math.random() * 16 + "s",
      delay: -Math.random() * 22 + "s",
    }));
  }
  return (
    <div className="hero-dust" aria-hidden="true">
      {motes.current.map((m, k) => (
        <span
          key={k}
          className="hero-mote"
          style={{
            left: m.left + "%",
            top: m.top + "%",
            width: m.w,
            height: m.w,
            animationDuration: m.dur,
            animationDelay: m.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  const slides = heroContent.slides;
  const localSlides = useLocalUrls(slides.map((s) => s.image));
  const [index, setIndex] = useState(0);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Flip the entrance transitions on shortly after mount.
  useEffect(() => {
    const t = setTimeout(() => setLit(true), 90);
    return () => clearTimeout(t);
  }, []);

  const active = slides[index];

  return (
    <section className="hero-page" data-lit={lit ? "" : undefined}>
      <div className="hero-carousel" aria-hidden="true">
        {slides.map((slide, i) => (
          <div key={slide.image} className={`hero-slide${i === index ? " is-active" : ""}`}>
            <div className="hero-ken" style={{ backgroundImage: `url("${localSlides[slide.image] || slide.image}")` }} />
          </div>
        ))}
      </div>
      <div className="hero-scrim" aria-hidden="true" />
      <Dust />

      {/* Devanagari watermark — tied to the active background image + its label */}
      <div className="hero-mark hero-reveal-fade" style={{ "--d": ".9s" }} aria-hidden="true">
        {active.captionHi ? <div className="hero-deva">{active.captionHi}</div> : null}
        <div className="hero-mark-label">{active.label}</div>
      </div>

      {/* bottom-anchored content */}
      <div className="hero-content">
        <p className="hero-eyebrow hero-reveal-fade" style={{ "--d": ".12s" }}>
          {heroContent.eyebrow}
        </p>
        <h1 className="hero-headline">
          <span className="hero-lineclip" style={{ "--d": ".26s" }}>
            <span>Crafting the Legacy</span>
          </span>
          <span className="hero-lineclip" style={{ "--d": ".42s" }}>
            <span>
              <em>Raipur Deserves</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub hero-reveal-fade" style={{ "--d": ".58s" }}>
          {heroContent.tagline}
        </p>
      </div>
    </section>
  );
}
