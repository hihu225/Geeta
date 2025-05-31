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
  console.log('Background Message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/notification-icon.png' // Use a relative path from the public directory
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});