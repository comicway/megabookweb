// Service Worker: Recibe los eventos de push desde el servidor y los muestra como notificación nativa

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png', // Añade tu icono en public/icons/
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: self.location.origin, // Al tocar la notif, abre la app
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Al hacer clic en la notificación, enfocar o abrir la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data.url);
    })
  );
});
