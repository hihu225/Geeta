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
    data: {
      ...payload.data,
      url: '/notifications',
      notificationId: payload.data?.notificationId || payload.data?.id || Date.now().toString()
    },
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

// Single notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Handle different actions
  if (event.action === 'dismiss') {
    console.log('User dismissed notification');
    return;
  }

  const notificationData = event.notification.data || {};
  const notificationId = notificationData.notificationId || notificationData.id;
  const urlFromData = notificationData.url;
  const targetUrl = urlFromData || (notificationId 
    ? `/notifications?notificationId=${notificationId}`
    : '/notifications');

  console.log('Attempting to navigate to:', targetUrl);

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      console.log('Found clients:', clientList.length);
      
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          console.log('App is open, focusing and sending message');
          
          // Send message to React app for navigation
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            notificationId,
            url: targetUrl
          });

          return client.focus();
        }
      }

      // If no client is open, open a new one
      console.log('App is not open, opening new window');
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + targetUrl);
      }
    }).catch((error) => {
      console.error('Error handling notification click:', error);
      // Fallback: just open the origin
      if (clients.openWindow) {
        return clients.openWindow(self.location.origin + '/notifications');
      }
    })
  );
});

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification was closed:', event);
  // You can track notification close events here if needed
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});