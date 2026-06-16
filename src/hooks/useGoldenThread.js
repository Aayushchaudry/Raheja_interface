import { useEffect, useRef } from "react";

// The "golden thread" effect, ported from the Raheja Timeline screen and tuned
// to the brand wall's gold (#c9a96e) on a dark background. It owns a full-screen
// canvas and draws three things:
//   1. ambient gold motes that always drift in the background,
//   2. a multi-layer luminous ribbon that follows the finger while dragging,
//   3. spark particles + a fingertip glow at the active point.
//
// It's deliberately self-contained and imperative so any screen can reuse it:
// pass a ref to a <canvas>, then call start()/feed()/end() from pointer handlers.
//
// Coordinates are converted to canvas-local space via getBoundingClientRect, so
// the effect stays aligned even under the kiosk's CSS `zoom` upscaling.

const GOLD = "201, 169, 110"; // brand --gold #c9a96e
const CREAM = "240, 226, 192"; // lighter highlight

export function useGoldenThread(canvasRef) {
  const trailRef = useRef([]);
  const particlesRef = useRef([]);
  const fingerRef = useRef(null);
  const bubblesRef = useRef([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed ambient motes once, relative to current size.
    if (bubblesRef.current.length === 0) {
      const { w, h } = sizeRef.current;
      for (let i = 0; i < 70; i++) {
        bubblesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          baseSize: 3 + Math.random() * 8,
          opacity: 0.025 + Math.random() * 0.05,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    const animate = () => {
      const { w, h } = sizeRef.current;
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, w, h);

      const finger = fingerRef.current;
      const trail = trailRef.current;
      const particles = particlesRef.current;

      // ---- Ambient motes ----
      for (const b of bubblesRef.current) {
        b.x += b.vx + Math.sin(time * 0.5 + b.phase) * 0.3;
        b.y += b.vy + Math.cos(time * 0.4 + b.phase * 1.3) * 0.3;

        if (finger) {
          const dx = b.x - finger.x;
          const dy = b.y - finger.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist > 0) {
            const force = ((200 - dist) / 200) * 0.12;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force;
          }
        }
        b.vx *= 0.995;
        b.vy *= 0.995;

        if (b.x < -20) b.x = w + 20;
        if (b.x > w + 20) b.x = -20;
        if (b.y < -20) b.y = h + 20;
        if (b.y > h + 20) b.y = -20;

        const size = b.baseSize + Math.sin(time * 0.8 + b.phase) * 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, ${b.opacity})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.x, b.y, size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, ${b.opacity * 0.3})`;
        ctx.fill();
      }

      // Age out the trail.
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 0.02;
        if (trail[i].age > 1) trail.splice(i, 1);
      }

      // ---- The ribbon ----
      if (trail.length > 2) {
        const drawPath = () => {
          ctx.beginPath();
          ctx.moveTo(trail[0].x, trail[0].y);
          for (let i = 1; i < trail.length - 1; i++) {
            const xc = (trail[i].x + trail[i + 1].x) / 2;
            const yc = (trail[i].y + trail[i + 1].y) / 2;
            ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
          }
        };
        const a = trail[0];
        const z = trail[trail.length - 1];
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Layer 1 — wide soft glow
        let g = ctx.createLinearGradient(a.x, a.y, z.x, z.y);
        g.addColorStop(0, `rgba(${GOLD}, 0)`);
        g.addColorStop(0.3, `rgba(${GOLD}, 0.08)`);
        g.addColorStop(1, `rgba(${GOLD}, 0.15)`);
        drawPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 28;
        ctx.stroke();

        // Layer 2 — medium glow
        g = ctx.createLinearGradient(a.x, a.y, z.x, z.y);
        g.addColorStop(0, `rgba(${GOLD}, 0)`);
        g.addColorStop(0.2, `rgba(${GOLD}, 0.15)`);
        g.addColorStop(1, `rgba(${CREAM}, 0.35)`);
        drawPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 18;
        ctx.stroke();

        // Layer 3 — core body
        g = ctx.createLinearGradient(a.x, a.y, z.x, z.y);
        g.addColorStop(0, `rgba(${GOLD}, 0.02)`);
        g.addColorStop(0.2, `rgba(${GOLD}, 0.5)`);
        g.addColorStop(0.7, `rgba(${CREAM}, 0.8)`);
        g.addColorStop(1, `rgba(255, 248, 224, 0.95)`);
        drawPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 10;
        ctx.shadowColor = `rgba(${GOLD}, 0.5)`;
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Layer 4 — bright center highlight
        g = ctx.createLinearGradient(a.x, a.y, z.x, z.y);
        g.addColorStop(0, `rgba(255, 250, 230, 0)`);
        g.addColorStop(0.3, `rgba(255, 250, 230, 0.3)`);
        g.addColorStop(1, `rgba(255, 255, 245, 0.7)`);
        drawPath();
        ctx.strokeStyle = g;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // ---- Fingertip glow ----
      if (finger) {
        let grd = ctx.createRadialGradient(finger.x, finger.y, 0, finger.x, finger.y, 35);
        grd.addColorStop(0, `rgba(${GOLD}, 0.15)`);
        grd.addColorStop(1, `rgba(${GOLD}, 0)`);
        ctx.beginPath();
        ctx.arc(finger.x, finger.y, 35, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        grd = ctx.createRadialGradient(finger.x, finger.y, 0, finger.x, finger.y, 12);
        grd.addColorStop(0, `rgba(255, 250, 230, 0.95)`);
        grd.addColorStop(0.4, `rgba(${CREAM}, 0.7)`);
        grd.addColorStop(1, `rgba(${GOLD}, 0)`);
        ctx.beginPath();
        ctx.arc(finger.x, finger.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // ---- Spark particles ----
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.03;
        p.vx *= 0.99;
        p.life -= 0.016;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const ratio = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * ratio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, ${ratio * 0.8})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);

  const toLocal = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const r = canvas.getBoundingClientRect();
    // Some Chromium TV kiosk builds return zoom-corrected visual coordinates from
    // getBoundingClientRect while pointer clientX/Y remain in CSS px. Detect the
    // discrepancy via offsetWidth (always in CSS layout px) and scale accordingly.
    const scaleX = canvas.offsetWidth ? r.width / canvas.offsetWidth : 1;
    const scaleY = canvas.offsetHeight ? r.height / canvas.offsetHeight : 1;
    return { x: clientX * scaleX - r.left, y: clientY * scaleY - r.top };
  };

  const spawn = (x, y) => {
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2.5 - 0.5,
        life: 0.8 + Math.random() * 0.7,
        maxLife: 1.5,
        size: 1.5 + Math.random() * 3,
      });
    }
  };

  const start = (clientX, clientY) => {
    const { x, y } = toLocal(clientX, clientY);
    fingerRef.current = { x, y };
    trailRef.current = [{ x, y, age: 0 }];
  };

  const feed = (clientX, clientY) => {
    const { x, y } = toLocal(clientX, clientY);
    fingerRef.current = { x, y };
    const trail = trailRef.current;
    const last = trail[trail.length - 1];
    if (!last || Math.hypot(x - last.x, y - last.y) > 6) {
      trail.push({ x, y, age: 0 });
      if (trail.length > 120) trail.shift();
    }
    spawn(x, y);
  };

  const end = () => {
    fingerRef.current = null;
  };

  return { start, feed, end };
}
