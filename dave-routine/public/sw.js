// Service Worker for Dave's Routine PWA ("Dagboog")
const CACHE_NAME = 'dagboog-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Some assets may not exist yet, ignore errors
      });
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notifications — toont wat de afzender meestuurt. Er is momenteel geen server die hier
// iets naartoe stuurt (zie NotificationScheduler.tsx voor wat wél al werkt); deze handler is
// alvast klaar voor zodra dat er is, en toont ondertussen ook lokale showNotification()-aanroepen
// op dezelfde, kalme manier.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = {}; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Dagboog', {
      body: data.body || 'Een rustig moment voor je.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'dagboog',
      data: { url: data.url || '/' },
      renotify: true,
    })
  );
});

// Tik op een melding -> open de app (of breng het bestaande tabblad naar voren) i.p.v. niets
// te doen. Zonder dit blijft een tik op een melding op de meeste platformen zonder effect.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c);
      if (existing) { existing.navigate(url); return existing.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
