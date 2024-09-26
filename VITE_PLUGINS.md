# LX/UI Vite Plugins

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
      allowInlineScripts: false, // default: false - Allow inline scripts in CSP.
      allowInlineStyles: false, // default: false - Allow inline styles in CSP.
      allowEval: false, // default: false - Allow eval() in CSP.
      processI18n: true, // default: true - Process i18n.
      noncePlaceholder: 'NONCE_PLACEHOLDER', // default: 'NONCE_PLACEHOLDER' - Placeholder for nonce in HTML.
      xssProtection: '1; mode=block', // default: '1; mode=block' - Value for X-XSS-Protection header.
      frameOptions: 'DENY', // default: 'DENY' - Value for X-Frame-Options header.
      contentTypeOptions: 'nosniff', // default: 'nosniff' - Value for X-Content-Type-Options header.
      referrerPolicy: 'strict-origin-when-cross-origin', // default: 'strict-origin-when-cross-origin' - Value for Referrer-Policy header.
      permissionsPolicy: 'camera=(), microphone=(), geolocation=()', // default: 'camera=(), microphone=(), geolocation()' - Value for Permissions-Policy header.
      cacheControl: 'no-store, max-age=0', // default: 'no-store, max-age=0' - Value for Cache-Control header.
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

### Notes

- Adjust CSP and other security headers according to your application's needs.
- Set any header option to `false` or an empty string to disable that specific header.
- For production, configure your server to replace the nonce placeholder and set appropriate headers.

### Nginx Configuration Example

```nginx
map $request_id $nonce {
    ~. $request_id;
}

server {
    sub_filter_once off;
    sub_filter_types *;
    sub_filter NONCE_PLACEHOLDER $nonce;

    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$nonce'; style-src 'self' 'nonce-$nonce'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
    add_header Cache-Control "no-store, max-age=0";

    # Other server configurations...
}
```

This configuration replaces the nonce placeholder and sets the security headers. Adjust the headers according to your plugin configuration.
