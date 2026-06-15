import { useEffect, useState } from "react";

// A right-side "Scroll" hint with an animated gold line. Hides once the page
// is scrolled to (near) the bottom. Used on the tall About and Luxe pages.
export default function ScrollCue({ label = "Scroll" }) {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setAtBottom(window.innerHeight + window.scrollY >= doc.scrollHeight - 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className={`scroll-cue${atBottom ? " is-hidden" : ""}`} aria-hidden="true">
      <span className="scroll-cue-text">{label}</span>
      <span className="scroll-cue-line" />
    </div>
  );
}
