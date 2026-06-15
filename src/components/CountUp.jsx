import { useEffect, useRef, useState } from "react";

// Animates the numeric part of a value from 0 up to its target while keeping
// any prefix/suffix (e.g. "5,000+", "10 Mn sq ft", "1st"). Non-numeric values
// like "Avana" render unchanged. The count starts only once the element scrolls
// into view (not on mount).
export default function CountUp({ value, duration = 2600 }) {
  const text = String(value);
  const match = text.match(/^(\D*?)([0-9][0-9,]*(?:\.[0-9]+)?)(.*)$/s);
  const [display, setDisplay] = useState(() => (match ? `${match[1]}0${match[3]}` : text));
  const ref = useRef(null);
  const rafRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    startedRef.current = false;

    if (!match) {
      setDisplay(text);
      return undefined;
    }

    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const withCommas = numStr.includes(",");
    const isFloat = numStr.includes(".");
    const decimals = isFloat ? numStr.split(".")[1].length : 0;
    const target = parseFloat(numStr.replace(/,/g, ""));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return undefined;
    }

    // Sit at zero until the element appears on screen.
    setDisplay(`${prefix}0${suffix}`);

    const format = (n) => {
      if (isFloat) return n.toFixed(decimals);
      const rounded = Math.round(n);
      return withCommas ? rounded.toLocaleString("en-US") : String(rounded);
    };

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      let start;
      const tick = (now) => {
        if (start === undefined) start = now;
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${prefix}${format(target * eased)}${suffix}`);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(rafRef.current);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, duration]);

  return <span ref={ref}>{display}</span>;
}
