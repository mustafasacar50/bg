/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || "Bulgarca Sınav Modülü";
      const options = {
        body: data.body || "Soru vakti geldi! Hadi pratik yapalım.",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        vibrate: [100, 50, 100],
        data: data.data || { url: "/training/flash" },
        actions: [
          {
            action: "start",
            title: "Hemen Çöz",
          },
        ],
      };
      
      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      // Fallback for plain text
      event.waitUntil(
        self.registration.showNotification("Bulgarca Pratik Zamanı", {
          body: event.data.text(),
          icon: "/icon-192x192.png",
        })
      );
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          // client.navigate(urlToOpen); // Navigate if needed
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
