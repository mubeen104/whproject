// Service Worker - Exclude third-party tracking scripts from caching
const CACHE_NAME = 'neh-cache-v1';
const TRACKING_DOMAINS = [
  'connect.facebook.net',
  'www.googletagmanager.com',
  'analytics.tiktok.com',
  'analytics.google.com',
  'px.ads.linkedin.com',
  'static.ads-twitter.com',
  's.pinimg.com',
  'sc-static.net',
  'bat.bing.com',
  'www.redditstatic.com',
  'qp.qss.io'
];

// Install event - skip waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - bypass caching for tracking scripts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Don't cache third-party tracking scripts - let browser handle them directly
  if (TRACKING_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return; // Important: Just return, don't call event.respondWith
  }
  
  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful GET requests
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // On network failure, try cache
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Offline', { status: 503 });
        });
      })
  );
});
