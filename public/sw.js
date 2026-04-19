/**
 * Minimal offline-friendly service worker (Part 7 Phase 5).
 * Caches successful same-origin GET responses; serves cache on network failure.
 * Bump CACHE_VERSION when shipping breaking asset changes.
 */
const CACHE_VERSION = 'sravanam-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone()
          void caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy))
        }
        return res
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached
          if (req.mode === 'navigate' || req.destination === 'document') {
            return caches.match('/').then((shell) => shell ?? Response.error())
          }
          return Response.error()
        }),
      ),
  )
})
