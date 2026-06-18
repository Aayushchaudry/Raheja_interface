import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base: "./"  — emit RELATIVE asset URLs so the build runs from the app root
// inside a packaged LG webOS app (loaded over file://), as well as on the web.
// Absolute "/..." URLs would resolve to the device root on the TV and break.
//
// build.target — webOS ships an older Chromium than desktop Chrome, so the
// output is pinned to the engine of the target webOS version so React 19 and
// modern JS actually run on the panel:
//   webOS 4.x ≈ chrome53 | 5.x ≈ chrome68 | 6.x ≈ chrome79 | 22/23/24 ≈ chrome87+
// chrome63 is a safe floor for webOS 5 and up. Lower it (e.g. "chrome53") if the
// target TV is older — confirm the panel's webOS version (Settings → About).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "chrome63",
  },
  server: {
    allowedHosts: true,
  },
});
