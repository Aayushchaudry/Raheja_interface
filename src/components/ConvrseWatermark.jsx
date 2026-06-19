// Persistent "Powered by convrse Tech" watermark, fixed to the bottom-right
// corner and shown on every page (mounted once in App's app-shell, above all
// content including fullscreen video). Non-interactive so it never intercepts
// taps on the kiosk. All text is white in one font; the "o" in convrse is the
// exact swirl/lens mark from the convrse.ai logo. Whole mark at 60% opacity.
export default function ConvrseWatermark() {
  return (
    <div className="convrse-watermark" aria-label="Powered by convrse Tech" role="img">
      <span className="cw-prefix">Powered by</span>
      <span className="cw-brand">
        c<img className="cw-o" src="/convrse-o-white.png" alt="" aria-hidden="true" />nvrse
      </span>
      <span className="cw-tech">Tech</span>
    </div>
  );
}
