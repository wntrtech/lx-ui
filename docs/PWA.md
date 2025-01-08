# Step-by-Step Guide: Turning Your Project into a Progressive Web App (PWA)

This guide explains how to manually configure your project to become a PWA.

## Step 1: Create the `manifest.json` file

The `manifest.json` file defines your app's metadata, such as name, icons, and colors.

  1. Create a `public` folder (if it doesn't already exist).
  2. Inside the `public` folder, create a file named `manifest.json` with the following content: 

```js
{
  "name": "Your App Name",
  "short_name": "App Name",
  "description": "Your app description",
  "theme_color": "#222222",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "imgs/pwa-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "imgs/pwa-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "imgs/pwa-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```
  3. Replace the placeholders (e.g., `Your App Name`) with your actual app details.

## Step 2: Add the required project icons

  Place the `pwa-192.png` and `pwa-512.png` icons inside the `public/imgs` folder. 
  These icons are essential for the PWA to display correctly on the home screen and in app launchers.

## Step 3: Create the pwa-sw.js file (Service Worker)

The service worker handles caching and offline functionality.

  1. Inside the `public` folder, create a file named `pwa-sw.js` with the following content:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('pwa-cache')
      .then((cache) => cache.addAll(['/', '/index.html', '/imgs/pwa-192.png', '/imgs/pwa-512.png']))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

## Step 4: Register the Service Worker

You need to register the service worker in your app's main entry point (e.g., `main.js` or `main.ts`).

  1. Open your main.js (or equivalent) file.
  2. Add the following code

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/pwa-sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

## Step 5: Add the `<link>` for the Manifest in `index.html`

  1. Open your index.html file (in the public folder or root directory).
  2. Add the following <link> tag inside the <head> section:

```js
<link rel="manifest" href="<%= BASE_URL %>manifest.json">
```

## Step 6: Test Your PWA

  1. Build and serve your project:

  `npm run build`
  `npm run preview`

  2. Open the app in a browser and use Chrome DevTools: 

    - Go to Application > Manifest.
    - Check if your PWA is correctly recognized.
  
  
This manual setup will transform your project into a fully functional PWA.