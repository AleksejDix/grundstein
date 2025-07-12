const CACHE_NAME = 'grundstein-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
];

const API_CACHE_NAME = 'grundstein-api-v1';
const PORTFOLIO_ROUTES = [
  '/portfolio',
  '/calculator',
  '/mortgage',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME)
        .then((cache) => 
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cache.match(request))
        )
    );
    return;
  }

  if (PORTFOLIO_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      caches.match('/index.html')
        .then((response) => response || fetch('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});