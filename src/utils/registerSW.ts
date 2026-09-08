export function registerServiceWorker() {
  if (typeof window !== 'undefined') {
    // Proactively clean up any stale caches from previous sessions
    if ('caches' in window) {
      window.caches.keys().then((names) => {
        names.forEach((name) => {
          if (name !== 'abhyaas-pwa-v12') {
            window.caches.delete(name);
          }
        });
      });
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Check for updates to sw immediately
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.warn('Service Worker registration failed:', err);
          });
      });
    }
  }
}
