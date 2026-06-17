import { useEffect, useRef, useState } from "react";
import CountUp from "../components/CountUp.jsx";
import ScrollCue from "../components/ScrollCue.jsx";
import { aboutContent } from "../data/brandWallContent.js";

// Cinematic ambient layer ported from the standalone kiosk reference:
// drifting bokeh sparks, a sweeping light beam, a grain wash, and a giant
// faint "ghost" word floating behind the scene's content.
function Ambient({ ghost }) {
  const sparks = useRef(null);
  if (!sparks.current) {
    sparks.current = Array.from({ length: 26 }, () => {
      const s = 3 + Math.random() * 9;
      return {
        left: Math.random() * 100,
        top: Math.random() * 100,
        w: s,
        dur: 14 + Math.random() * 20 + "s",
        delay: -Math.random() * 30 + "s",
        dx: (Math.random() * 2 - 1) * 120 + "px",
        dy: -(60 + Math.random() * 170) + "px",
        op: 0.28 + Math.random() * 0.5,
      };
    });
  }
  return (
    <div className="abc-amb" aria-hidden="true">
      {sparks.current.map((p, i) => (
        <span
          key={i}
          className="abc-spark"
          style={{
            left: p.left + "%",
            top: p.top + "%",
            width: p.w,
            height: p.w,
            "--dx": p.dx,
            "--dy": p.dy,
            "--sdur": p.dur,
            opacity: p.op,
            animationDelay: p.delay,
          }}
        />
      ))}
      <div className="abc-beam" />
      <div className="abc-grain" />
      <div className="abc-ghost">{ghost}</div>
    </div>
  );
}

// Flips on once the section scrolls into view, driving the CSS entrance
// transitions (clip-reveal headlines, staggered reveals, underline wipes).
function useLit(ref) {
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setLit(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLit(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [ref]);
  return lit;
}

export default function AboutSection() {
  const a = aboutContent;
  const principlesRef = useRef(null);
  const numbersRef = useRef(null);
  const litP = useLit(principlesRef);
  const litN = useLit(numbersRef);

  return (
    <section id="about" className="about-cine" data-section>
      <img className="abc-logo" src="assets/images/raheja-logo-navbar.png" alt="Raheja Group" />
      <div className="abc-frame" aria-hidden="true" />
      <span className="abc-tick abc-tl" aria-hidden="true" />
      <span className="abc-tick abc-tr" aria-hidden="true" />
      <span className="abc-tick abc-bl" aria-hidden="true" />
      <span className="abc-tick abc-br" aria-hidden="true" />

      {/* Scene 1 — Principles */}
      <div ref={principlesRef} className={`abc-scene abc-stand${litP ? " is-lit" : ""}`}>
        <Ambient ghost="Principles" />
        <div className="abc-scene-inner">
          <div className="abc-stand-head">
            <div className="abc-eyebrow abc-reveal-fade" style={{ "--d": ".1s" }}>
              {a.subtitle}
            </div>
            <h2 className="abc-stand-title abc-display">
              <span className="abc-lineclip" style={{ "--d": ".2s" }}><span>Built on Principles.</span></span>
              <span className="abc-lineclip" style={{ "--d": ".34s" }}><span>Guided by Purpose.</span></span>
            </h2>
          </div>
          <div className="abc-principles">
            {a.principles.map((p, i) => (
              <article
                key={p.number}
                className="abc-principle abc-reveal"
                style={{ "--d": 0.5 + i * 0.13 + "s" }}
              >
                <div className="abc-p-idx abc-display">{p.number}</div>
                <h3 className="abc-p-title abc-display">{p.title}</h3>
                <p className="abc-p-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Scene 2 — Numbers */}
      <div ref={numbersRef} className={`abc-scene abc-numbers${litN ? " is-lit" : ""}`}>
        <Ambient ghost="Legacy" />
        <div className="abc-scene-inner">
          <div className="abc-numbers-head">
            <div className="abc-eyebrow abc-reveal-fade" style={{ "--d": ".1s" }}>
              {a.scrollEyebrow}
            </div>
            <h2 className="abc-num-title abc-display">
              <span className="abc-lineclip" style={{ "--d": ".2s" }}><span>{a.scrollTitle}</span></span>
            </h2>
            <blockquote className="abc-pullquote abc-reveal-fade" style={{ "--d": ".45s" }}>
              {a.scrollQuote}
            </blockquote>
          </div>
          <div className="abc-stat-grid" aria-label="Raheja Group legacy numbers">
            {a.stats.map((s, i) => (
              <div
                key={s.label}
                className="abc-stat abc-reveal"
                style={{ "--d": 0.35 + i * 0.1 + "s" }}
              >
                <div className="abc-stat-num abc-display">
                  <CountUp value={s.value} />
                </div>
                <div className="abc-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
