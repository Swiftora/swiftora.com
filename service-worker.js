// Swiftora SW v2025-08-09-16 — network only (no app cache)
// Goal: avoid stale HTML/JS; still give us SW lifecycle control.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Claim clients and let pages know we activated
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED' }));
  })());
});

// Network passthrough (headers on the server handle HTML no-store)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
