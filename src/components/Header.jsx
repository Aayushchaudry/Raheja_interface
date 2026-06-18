import LogoMark from "./LogoMark.jsx";
import CachedImg from "./CachedImg.jsx";
import { asset } from "../data/assetBase.js";

export default function Header({ activePage, onHome, onLuxe }) {
  if (activePage !== "standby") return null;

  return (
    <header className="topbar">
      <div className="topbar-spacer">
        <button className="brand-lockup brand-lockup-button home-group-logo" type="button" aria-label="Raheja Group home" onClick={onHome}>
          <LogoMark />
        </button>
      </div>
      <div className="topbar-actions">
        <button className="luxe-btn luxe-btn--logo" type="button" aria-label="Enter Raheja Luxury" onClick={onLuxe}>
          <CachedImg className="luxe-logo-img" src={asset("Raheja-luxe-logo-gold.webp")} alt="Raheja Luxury" />
        </button>
      </div>
    </header>
  );
}
