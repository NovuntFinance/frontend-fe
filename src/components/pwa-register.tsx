'use client';

import { useEffect } from 'react';

const SW_PATH = '/sw.js';

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const register = () => {
    navigator.serviceWorker
      .register(SW_PATH)
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              // new content is available; notify app or auto refresh
              console.info('[Novunt::PWA] A new version is ready.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('[Novunt::PWA] Registration failed', error);
      });
  };

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}

export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Allow manual testing, but skip registration automatically in dev to avoid SW caching confusion
      console.info('[Novunt::PWA] Skipping service worker registration in development mode');
      return;
    }

    registerServiceWorker();
  }, []);

  return null;
}
