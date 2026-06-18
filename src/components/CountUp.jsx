// Renders a stat value statically with a single, one-time CSS fade-in.
//
// The previous version animated the number every frame with a
// requestAnimationFrame + setState loop (≈60 re-renders/sec per stat) and
// re-armed itself with an IntersectionObserver. On the kiosk's weak processor
// that was expensive and made the numbers visibly lag and "appear/disappear".
//
// Now the final value is rendered immediately and just fades in once via a CSS
// animation (see `.countup` in index.css) — zero per-frame work, and the number
// is always present even if the animation never runs. Extra props like
// `duration` are accepted and ignored so existing call sites keep working.
export default function CountUp({ value }) {
  return <span className="countup">{value}</span>;
}
