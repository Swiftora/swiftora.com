// Simple PWA cache with offline fallback
const CACHE_NAME = 'swiftora-cache-v3';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/privacy.html',
  '/demo.html',
  '/style.css',
  '/demo.css',
  '/manifest.webmanifest',
  '/swiftora_logo_transparent v2.png',
  '/swiftora_icon_192x192.png',
  '/swiftora_icon_512x512.png',
  '/offline.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        // If navigation fails (offline), show fallback
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
