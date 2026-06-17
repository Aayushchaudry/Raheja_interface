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
