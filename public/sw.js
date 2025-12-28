// Service worker for caching - DO NOT cache JS chunks (they have hashes)
const CACHE_NAME = 'snowhound-v2';
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/snowflake-simple.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first for JS chunks, cache for static assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isJSChunk = url.pathname.includes('/assets/') && url.pathname.endsWith('.js');
  const isCSS = url.pathname.includes('/assets/') && url.pathname.endsWith('.css');

  // For JS chunks and CSS (which have hashes), always fetch from network first
  // This ensures we get the latest version after deployment
  if (isJSChunk || isCSS) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache JS chunks - they're versioned by hash
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        // Return cached version if available
        if (cached) {
          return cached;
        }

        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

