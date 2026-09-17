// Firebase Cloud Messaging Service Worker for background push notifications
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker with your project credentials
firebase.initializeApp({
  apiKey: 'AIzaSyCQ8nALQNByY0sBgNnVjQ_2idlEY82zhY8',
  appId: '1:452614748241:web:a5503b2c647a3e70a66070',
  projectId: 'gen-lang-client-0391997692',
  messagingSenderId: '452614748241',
  authDomain: 'gen-lang-client-0391997692.firebaseapp.com',
  storageBucket: 'gen-lang-client-0391997692.firebasestorage.app',
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Abhyaas - अभ्यास अलर्ट';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'नया अध्ययन सामग्री व टेस्ट अपडेट उपलब्ध है!',
    icon: payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png',
    badge: '/favicon.png',
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
      classId: payload.data?.classId || '',
      type: payload.data?.type || 'study_update',
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
