import { useEffect, useRef, useState } from "react";
import { allProjects } from "../data/brandWallContent.js";
import { useGoldenThread } from "../hooks/useGoldenThread.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Responsive card geometry, recomputed on resize. Each card is a full info card
// (image + copy), so its height is the image band plus a fixed copy band.
function getDims(viewW) {
  const cardWidth = clamp(viewW * 0.3, 320, 460);
  const cardGap = clamp(viewW * 0.03, 30, 60);
  const imageH = cardWidth * 0.58;
  const copyH = 250;
  return { cardWidth, cardGap, cardUnit: cardWidth + cardGap, imageH, cardHeight: imageH + copyH };
}

const statusClass = (status) => {
  if (status === "Ongoing") return "is-ongoing";
  if (status === "Future") return "is-future";
  if (status === "Pre-Launch") return "is-prelaunched";
  return "";
};

// Projects, followed by the "Enter Luxury" call-to-action card.
const LUXE_CARD = { __luxe: true, title: "__enter-luxury" };

export default function AllProjectsSection({ onNavigate }) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const thread = useGoldenThread(canvasRef);

  const [viewW, setViewW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1920));
  const [scrollX, setScrollX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef(0);
  const scrollStartRef = useRef(0);
  const dragMovedRef = useRef(false);
  const tweenRef = useRef(0);
  const lastPosRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);

  const items = [...allProjects, LUXE_CARD];
  const { cardWidth, cardUnit, imageH, cardHeight } = getDims(viewW);
  const maxScroll = (items.length - 1) * cardUnit;
  const exactCenter = -scrollX / cardUnit;
  const centeredIndex = clamp(Math.round(exactCenter), 0, items.length - 1);

  // Track the stage width so the carousel centers correctly (also under zoom).
  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      setViewW(el ? el.clientWidth : window.innerWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => () => cancelAnimationFrame(tweenRef.current), []);

  // Ease scrollX to a target with a snappier 320ms duration.
  const snapTo = (index) => {
    cancelAnimationFrame(tweenRef.current);
    const from = scrollX;
    const to = -clamp(index, 0, items.length - 1) * cardUnit;
    const duration = 320;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setScrollX(from + (to - from) * eased);
      if (p < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
  };

  const handlePointerDown = (e) => {
    cancelAnimationFrame(tweenRef.current);
    setIsDragging(true);
    dragMovedRef.current = false;
    dragStartRef.current = e.clientX;
    scrollStartRef.current = scrollX;
    lastPosRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    thread.start(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current;
    if (Math.abs(dx) > 4) dragMovedRef.current = true;

    // Track instantaneous velocity (px/ms) for momentum snapping on release.
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) velocityRef.current = (e.clientX - lastPosRef.current) / dt;
    lastPosRef.current = e.clientX;
    lastTimeRef.current = now;

    setScrollX(clamp(scrollStartRef.current + dx, -maxScroll, 0));
    thread.feed(e.clientX, e.clientY);
  };

  const handleLuxeTap = () => {
    if (!dragMovedRef.current && onNavigate) onNavigate("luxury");
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    thread.end();

    // Use swipe velocity to determine snap target so a fast flick carries
    // to the next/prev card even when the finger hasn't crossed the midpoint.
    const vel = velocityRef.current; // px/ms
    const THRESHOLD = 0.25;
    let target = Math.round(-scrollX / cardUnit);
    if (vel > THRESHOLD) target = Math.max(0, Math.floor(-scrollX / cardUnit));
    else if (vel < -THRESHOLD) target = Math.min(items.length - 1, Math.ceil(-scrollX / cardUnit));

    snapTo(target);
  };

  return (
    <section
      className="all-projects-page pjcf-page"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="pjcf-canvas" aria-hidden="true" />

      <div className="pjcf-heading">
        <h1>
          Our <span>Projects</span>
        </h1>
      </div>

      {/* Coverflow stage — each item is a full info card */}
      <div ref={stageRef} className="pjcf-stage" style={{ height: cardHeight }}>
        {items.map((item, i) => {
          const offset = i - exactCenter;
          const absOffset = Math.abs(offset);
          const centerX = viewW / 2;
          const cardX = centerX + offset * cardUnit - cardWidth / 2;
          const scale = Math.max(0.62, 1 - absOffset * 0.12);
          const opacity = Math.max(0.22, 1 - absOffset * 0.26);
          const rotateY = clamp(-offset * 32, -48, 48);
          const translateZ = absOffset < 0.3 ? 30 : -absOffset * 40;
          const isCenter = absOffset < 0.5;

          return (
            <div
              key={item.title}
              className="pjcf-card"
              style={{
                width: cardWidth,
                height: cardHeight,
                left: cardX,
                opacity,
                transform: `rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`,
                transition: isDragging ? "none" : "transform 0.4s ease-out, opacity 0.4s ease-out",
                zIndex: 100 - Math.round(absOffset * 10),
              }}
            >
              {item.__luxe ? (
                <div className="estate-card luxe-enter-card" onClick={handleLuxeTap}>
                  <span className="luxe-enter-crest" aria-hidden="true" />
                  <span className="luxe-enter-eyebrow">Raheja Luxe</span>
                  <span className="luxe-enter-title">Enter Luxury</span>
                  <span className="luxe-enter-sub">The Private Collection</span>
                  <span className="luxe-enter-go" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 5l6 7-6 7" />
                    </svg>
                  </span>
                </div>
              ) : (
                <article className={`pjcf-card-frame${isCenter ? " is-center" : ""}`}>
                  <div
                    className={`pjcf-card-img${item.image ? "" : " pjcf-card-placeholder"}`}
                    style={{
                      height: imageH,
                      ...(item.image
                        ? {
                            backgroundImage: `url("${item.image}")`,
                            filter: isCenter ? "none" : "brightness(0.55) saturate(0.85)",
                          }
                        : {}),
                    }}
                  >
                    <span className={`project-status ${statusClass(item.status)}`}>{item.status}</span>
                    {!item.image && <span className="pjcf-placeholder-label">{item.title}</span>}
                  </div>
                  <div className="pjcf-card-copy">
                    <p className="all-project-category">{item.category}</p>
                    <h2>{item.title}</h2>
                    {item.launched && (
                      <p className="all-project-launched">
                        {typeof item.launched === "number" ? `Est. ${item.launched}` : item.launched}
                      </p>
                    )}
                    <p className="project-location">{item.location}</p>
                    <p className="all-project-body">{item.body}</p>
                    {item.rera && <p className="project-rera">{item.rera}</p>}
                  </div>
                </article>
              )}
            </div>
          );
        })}
      </div>

      {/* Slide hint — stays until the last card is reached */}
      <div className={`pjcf-hint${centeredIndex >= items.length - 1 ? " is-hidden" : ""}`} aria-hidden="true">
        <span className="pjcf-hint-text">Slide to explore projects</span>
        <span className="pjcf-hint-track">
          <span className="pjcf-hint-dot" />
        </span>
      </div>

      {/* Progress dots */}
      <div className="pjcf-dots" aria-hidden="true">
        {items.map((item, i) => (
          <span key={item.title} className={`pjcf-dot${i === centeredIndex ? " is-active" : ""}`} />
        ))}
      </div>
    </section>
  );
}
