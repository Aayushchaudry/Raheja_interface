import { useEffect } from "react";
import { thanksContent } from "../data/brandWallContent.js";

export default function ThanksSection({ onNavigate, onBack }) {
  // Auto-reset after 30s of stillness.
  useEffect(() => {
    const id = window.setTimeout(() => onNavigate("standby"), 30000);
    return () => window.clearTimeout(id);
  }, [onNavigate]);

  return (
    <section className="cta-page">
      <div className="cta-ripple" aria-hidden="true" />

      <button className="cta-side cta-back" type="button" aria-label="Back" onClick={onBack}>
        <span className="cta-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 19l-6-7 6-7" />
          </svg>
        </span>
        <span className="cta-side-label">Back</span>
      </button>

      <div className="cta-content">
        <h2 className="cta-headline">
          {thanksContent.headingLead}
          <em>{thanksContent.headingAccent}</em>.
        </h2>
        <p className="cta-sub">{thanksContent.sub}</p>

        <button
          className="cta-restart-btn"
          type="button"
          onClick={() => onNavigate("standby")}
        >
          <span className="cta-restart-icon" aria-hidden="true">↺</span>
          Restart Experience
        </button>
      </div>

      {/* Decorative guiding arrow — no functionality */}
      <div className="cta-side cta-forward cta-forward--guide" aria-hidden="true">
        <span className="cta-circle cta-circle--lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l6 7-6 7" />
          </svg>
        </span>
      </div>

      <p className="cta-reset">{thanksContent.resetNote}</p>
    </section>
  );
}
