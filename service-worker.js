// --- Swiftora SW: network-first for HTML, cache-first for assets ---
// BUMP THIS on every deploy
const CACHE_VERSION = "swiftora-v2025-08-09-5";

const CORE_ASSETS = [
  "/", "/index.html",
  "/style.css?v=v2025-08-09-5",
  "/demo.html",
  "/demo.js?v=v2025-08-09-2", // keep your current demo version here
  "/swiftora_logo_transparent v2.png",
  "/swiftora_icon_192x192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(CORE_ASSETS)));
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_VERSION ? caches.delete(k) : null)))
    )
  );
  self.clients.claim(); // control all pages now
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const acceptsHTML = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");

  // NETWORK-FIRST for HTML so you always get the newest page
  if (acceptsHTML) {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req) || caches.match("/index.html"))
    );
    return;
  }

  // CACHE-FIRST for static assets (CSS/JS/images)
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
      return resp;
    }))
  );
});
