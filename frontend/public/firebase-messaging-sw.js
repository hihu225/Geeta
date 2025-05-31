// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDokjUrPcuJyPswOppbsGIT78CCqMnSmcc",
  authDomain: "geeta-app-6d0e0.firebaseapp.com",
  projectId: "geeta-app-6d0e0",
  storageBucket: "geeta-app-6d0e0.firebasestorage.app",
  messagingSenderId: "1030429675897",
  appId: "1:1030429675897:web:3f624b5083cc9eed2e1fa8",
  measurementId: "G-L83Y86K4C5"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Bhagavad Gita Wisdom';
  const notificationOptions = {
    body: payload.notification?.body || 'New spiritual guidance available',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'geeta-notification',
    requireInteraction: false,
    silent: false,
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Read Now'
      },
      {
        action: 'dismiss',
        title: 'Later'
      }
    ]
  };

  console.log('Showing notification:', notificationTitle, notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Get notification ID from payload data
    const notificationId = event.notification.data?.notificationId || event.notification.data?.id;
    const targetUrl = notificationId 
      ? `/notifications?notificationId=${notificationId}`
      : '/notifications';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it and navigate
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.postMessage({
                type: 'NOTIFICATION_CLICKED',
                notificationId: notificationId,
                url: targetUrl
              });
              return client.focus();
            }
          }
          // Otherwise open new window
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});