// No-op service worker placeholder.
// Some browsers may still request /sw.js after older local sessions.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
