// Basic offline cache for core pages/assets
const CACHE_NAME = 'swiftora-cache-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/privacy.html',
  '/demo.html',
  '/style.css',
  '/manifest.webmanifest',
  '/swiftora_logo_transparent v2.png',
  '/swiftora_icon_192x192.png',
  '/swiftora_icon_512x512.png',
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
  const req = e.request;
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
