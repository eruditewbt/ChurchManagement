self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: "/path/to/icon.png", // Optional
    badge: "/path/to/badge.png", // Optional
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Handle notification click event
  // For example, open a URL
  clients.openWindow("https://example.com");
});
