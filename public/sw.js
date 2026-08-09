self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests to network
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Yeni Bildirim", body: event.data.text() };
    }
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: '/dashboard'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
