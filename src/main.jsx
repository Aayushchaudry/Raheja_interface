import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import LoadingGate from "./screens/LoadingGate.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoadingGate>
      <App />
    </LoadingGate>
  </React.StrictMode>,
);

// Register the PWA service worker so the installed app launches offline (caches
// the app shell). Only meaningful over http(s); silently no-ops on file:// (the
// webOS packaged app) and where unsupported.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
