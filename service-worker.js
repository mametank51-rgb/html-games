const CACHE_NAME = 'kato-games-pwa-v1';

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './GRAVITY SHIFT.html',
  './crash_core.html',
  './void_striker_dx.html',
  './戦国十二州_天下争覇録_極・完成版.html',
  './星使いと魔物の王国.html',
  './月影一閃.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isDocument =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    requestUrl.pathname.endsWith('.html');

  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (
            await caches.match(event.request) ||
            await caches.match('./index.html') ||
            await caches.match('./offline.html')
          );
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
