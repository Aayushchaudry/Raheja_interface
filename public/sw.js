// Service worker for the installable PWA. It caches the APP SHELL (HTML, JS,
// CSS, fonts, icons) so the installed app launches even with no network. The
// heavy media (CloudFront renders + videos) is cached separately by the app's
// own Cache Storage logic (see hooks/useAssetCache.js) — this SW deliberately
// ignores cross-origin requests so it never fights that.
//
// Strategy:
//   - navigations: network-first → fall back to the cached shell when offline.
//   - same-origin assets (hashed JS/CSS/fonts/icons): cache-first (immutable).

const SHELL_CACHE = "raheja-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("raheja-shell-") && k !== SHELL_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle our own origin (the app shell). Cross-origin CDN media is left
  // to the app's Cache Storage logic.
  if (url.origin !== self.location.origin) return;

  // Page navigations: try the network (fresh), fall back to the cached shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((r) => r || caches.match("/index.html", { ignoreSearch: true }))
            .then((r) => r || caches.match("/", { ignoreSearch: true })),
        ),
    );
    return;
  }

  // Same-origin static assets: serve from cache, populate on first fetch.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          return res;
        }),
    ),
  );
});
