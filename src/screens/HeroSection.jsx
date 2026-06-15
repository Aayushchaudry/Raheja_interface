import { useEffect, useState } from "react";
import { heroContent } from "../data/brandWallContent.js";

export default function HeroSection() {
  const slides = heroContent.slides;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((value) => (value + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="hero-page">
      <div className="hero-carousel-bg">
        {slides.map((slide, i) => (
          <div key={slide.image} className={`hero-slide${i === index ? " is-active" : ""}`}>
            <div className="hero-slide-img" style={{ backgroundImage: `url("${slide.image}")` }} />
            <div className="hero-slide-watermark">
              {slide.captionHi ? <em className="hero-watermark-hi">{slide.captionHi}</em> : null}
              <span>{slide.label}</span>
            </div>
          </div>
        ))}
        <div className="hero-bg-overlay" />
      </div>

      <div className="hero-center">
        <p className="hero-eyebrow">{heroContent.eyebrow}</p>
        <h1 className="hero-headline">
          Crafting Luxury
          <br />
          <span>Living Spaces</span>
        </h1>
        <p className="hero-tagline">{heroContent.tagline}</p>
      </div>

      <div className="hero-dots">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            className={`hero-dot${i === index ? " is-active" : ""}`}
            type="button"
            aria-label={`Show ${slide.caption}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
