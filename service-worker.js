const CACHE_VERSION = "swiftora-v2025-08-09-14";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_VERSION ? caches.delete(k) : null));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach(c => c.postMessage({ type: "SW_ACTIVATED", cache: CACHE_VERSION }));
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const wantsHTML = req.mode === "navigate" || req.headers.get("accept")?.includes("text/html");

  if (wantsHTML) {
    event.respondWith(
      fetch(req).then(r => {
        caches.open(CACHE_VERSION).then(c => c.put(req, r.clone()));
        return r;
      }).catch(() => caches.match(req) || caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      caches.open(CACHE_VERSION).then(c => c.put(req, r.clone()));
      return r;
    }))
  );
});
