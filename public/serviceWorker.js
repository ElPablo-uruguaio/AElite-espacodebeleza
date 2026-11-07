const CACHE_NAME = 'beleza-vip-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(
      urlsToCache.map((url) => cache.add(url).catch(() => undefined))
    ))
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return undefined;
        })
      )),
      self.clients.claim()
    ])
  );
});

// Prefer the current deployment so hashed bundles do not become stale.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  // External media and the optional local image fallback must be handled by the browser.
  if (
    requestUrl.origin !== self.location.origin ||
    requestUrl.pathname === '/salon-image-fallback.svg'
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        if (response.ok) {
          const responseToCache = response.clone();
          void caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache))
            .catch(() => undefined);
        }

        return response;
      } catch (error) {
        console.warn('[PWA] Falha ao carregar recurso local; usando cache.', error);
        try {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;

          if (event.request.mode === 'navigate') {
            const cachedHome = await caches.match('/');
            if (cachedHome) return cachedHome;
          }
        } catch (cacheError) {
          console.warn('[PWA] Falha ao consultar o cache.', cacheError);
        }

        return new Response('', {
          status: 504,
          statusText: 'Recurso indisponivel'
        });
      }
    })()
  );
});

// Web Push Notification Listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Espaço Beleza VIP', body: 'Nova promoção disponível para você!' };
  const options = {
    body: data.body,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ver Promoção' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
