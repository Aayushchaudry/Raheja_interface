import CachedImg from "./CachedImg.jsx";
import { asset } from "../data/assetBase.js";

export default function LogoMark() {
  return (
    <span className="logo-plate">
      <CachedImg src={asset("raheja-logo-navbar.webp")} alt="Raheja Group" />
    </span>
  );
}
