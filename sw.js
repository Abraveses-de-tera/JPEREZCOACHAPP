// =============================================================================
// JPEREZCOACH APP · SERVICE WORKER (OFFLINE PWA CACHE V4.1)
// =============================================================================

const CACHE_NAME = 'jperezcoach-v4.1.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './favicon.ico',
  './favicon-32.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './icon.svg',
  './coach.png',
  './banner.jpg',
  './og-image.jpg',
  './lib/pdf.min.js',
  './lib/pdf.worker.min.js',
  './js/state.js',
  './js/onboarding.js',
  './js/db-ejercicios.js',
  './js/rutinas-oficiales.js',
  './js/pdf-importer.js',
  './js/auth.js',
  './js/workout-engine.js',
  './js/routine-builder.js',
  './js/chat-engine.js',
  './js/analytics.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Algunos archivos no se pudieron precachear:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
