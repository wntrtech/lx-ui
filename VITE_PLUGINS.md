# LX/UI Vite Plugins

### ESLint Configuration

Add to `.eslintrc.js`:

```js
module.exports = {
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@wntr/lx-ui/vite', './node_modules/@wntr/lx-ui/dist/vite/wntr-lx-ui-vite.es.js'],
        ],
      },
    },
  },
  // other ESLint config...
};
```

## LX Vite Secure Headers Plugin

Enhances application security by adding secure headers, focusing on Content Security Policy (CSP).

### Usage

In `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { lxViteSecureHeadersPlugin } from '@wntr/lx-ui/vite';

export default defineConfig((command) => ({
  plugins: [
    lxViteSecureHeadersPlugin({
      reportOnly: false, // default: false - Report CSP violations instead of blocking them.
      processI18n: true, // default: true - Process i18n.
      noncePlaceholder: 'NONCE_PLACEHOLDER', // default: 'NONCE_PLACEHOLDER' - Placeholder for nonce in HTML.
      xssProtection: '1; mode=block', // default: '1; mode=block' - Value for X-XSS-Protection header.
      frameOptions: 'DENY', // default: 'DENY' - Value for X-Frame-Options header.
      contentTypeOptions: 'nosniff', // default: 'nosniff' - Value for X-Content-Type-Options header.
      referrerPolicy: 'strict-origin-when-cross-origin', // default: 'strict-origin-when-cross-origin' - Value for Referrer-Policy header.
      permissionsPolicy: 'camera=(), microphone=(), geolocation=()', // default: 'camera=(), microphone=(), geolocation()' - Value for Permissions-Policy header.
      cacheControl: 'no-store, max-age=0', // default: 'no-store, max-age=0' - Value for Cache-Control header.
      scriptSrc: (nonce) => `'self' 'nonce-${nonce}'`, // default: `'self' 'nonce-${nonce}'` - Function to generate script-src directive in CSP
      styleSrc: (nonce) => `'self' 'nonce-${nonce}'`, // default: `'self' 'nonce-${nonce}'` - Function to generate style-src directive in CSP
      workerSrc: "'self'", // default: "'self'" - Value for worker-src directive in CSP.
      connectSrc: "'self'", // default: "'self'" - Value for connect-src directive in CSP.
      imgSrc: "'self' data:", // default: "'self' data:" - Value for img-src directive in CSP.
      fontSrc: "'self'", // default: "'self'" - Value for font-src directive in CSP.
      objectSrc: "'none'", // default: "'none'" - Value for object-src directive in CSP.
      baseUri: "'self'", // default: "'self'" - Value for base-uri directive in CSP.
      formAction: "'self'", // default: "'self'" - Value for form-action directive in CSP.
      frameAncestors: "'none'", // default: "'none'" - Value for frame-ancestors directive in CSP.
    }),
    // other plugins...
  ],
  // other config...
}));
```

### Notes

- Adjust CSP and other security headers according to your application's needs.
- Set any header option to `false` or an empty string to disable that specific header.
- For production, configure your server to replace the nonce placeholder and set appropriate headers.
- Use the `scriptSrc` and `styleSrc` functions to customize the `script-src` and `style-src` directives in the CSP. These functions receive the generated nonce as an argument.

### Nginx Configuration Example

```nginx
map $request_id $nonce {
    ~. $request_id;
}

server {
    sub_filter_once off;
    sub_filter_types *;
    sub_filter NONCE_PLACEHOLDER $nonce;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$nonce'; style-src 'self' 'nonce-$nonce'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; connect-src: 'self'; frame-ancestors 'none'; worker-src 'self'; upgrade-insecure-requests;";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
    add_header Cache-Control "no-store, max-age=0";

    # Other server configurations...
}
```

This configuration replaces the nonce placeholder and sets the security headers. Adjust the headers according to your plugin configuration and the `scriptSrc` and `styleSrc` functions you've defined.

### Customizing script-src and style-src

You can customize the `script-src` and `style-src` directives by providing functions in the plugin configuration. For example:

```js
lxViteSecureHeadersPlugin({
  scriptSrc: (nonce) => `'self' 'nonce-${nonce}' https://example.com`,
  styleSrc: (nonce) => `'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
  // ... other options ...
})
```

This allows for fine-grained control over your Content Security Policy while still benefiting from nonce-based security.

## LX Vite Portal Version Plugin

Generates version.json on portal build to handle version check when new portal version get deployed

### Usage

In `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { lxVitePortalVersionPlugin } from '@wntr/lx-ui/vite';

export default defineConfig((command) => ({
  plugins: [
      lxVitePortalVersionPlugin({
        outDir: 'public'     // Optional custom output directory (default: uses Vite's build.outDir or 'dist')
      }),
    // other plugins...
  ],
  // other config...
}));
```

In `MainLayout.vue`:

```js
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { lxVersionCheckUtils } from '@wntr/lx-ui';
import useNotifyStore from '@/stores/useNotifyStore';

const notify = useNotifyStore();

// Start monitoring for version changes every 10 seconds  
// Uses the default notification text and checks `version.json` in the base path `/` 
lxVersionCheckUtils.isAppVersionChanged(notify, '', true, 10000); 

onMounted(() => {
  // On mount restore route and notify the user with default text if necessary
  lxVersionCheckUtils.restoreRouteAndNotify(router, notify, '');
});
```

In `event.js`:

```js
import useAuthStore from '@/stores/useAuthStore';
import useAppStore from '@/stores/useAppStore';
import { lxFlowUtils, lxNavigationStateUtils } from '@wntr/lx-ui';

export default (router) => {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const appStore = useAppStore();
    await lxFlowUtils.beforeEach(to, from, next, appStore, authStore);

    // Track navigation state for version checking
    lxNavigationStateUtils.trackNavigationState(to);
  });
  router.afterEach(async (to, from) => {
    const appStore = useAppStore();
    await lxFlowUtils.afterEach(to, from, appStore);

    // Reset navigation tracking after route change
    lxNavigationStateUtils.resetNavigationTracking();
  });
};
```