// Service worker for NAM-Core PWA & Offline Resilience
const CACHE_NAME = "nam-apmc-cache-v1";
const STATIC_ASSETS = ["/", "/mandi", "/favicon.ico", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for offline rate cards with background revalidate
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/mandi")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return (
              cached ||
              new Response(
                JSON.stringify({
                  source: "offline-pwa-cache",
                  message: "Operating in offline mode. Displaying last cached APMC rates.",
                }),
                { headers: { "Content-Type": "application/json" } }
              )
            );
          });
        })
    );
  }
});
