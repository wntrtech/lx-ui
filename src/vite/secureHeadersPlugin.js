import { createHash } from 'crypto';

/**
 * @typedef {Object} Options
 * @property {boolean} [reportOnly=false] - Whether to use Content-Security-Policy-Report-Only header instead of Content-Security-Policy header. For development purposes.
 * @property {boolean} [processI18n=true] - Whether to process i18n
 * @property {string} [noncePlaceholder='NONCE_PLACEHOLDER'] - The placeholder for nonce in the HTML
 * @property {string} [xssProtection='1; mode=block'] - Value for X-XSS-Protection header
 * @property {string} [frameOptions='DENY'] - Value for X-Frame-Options header
 * @property {string} [contentTypeOptions='nosniff'] - Value for X-Content-Type-Options header
 * @property {string} [referrerPolicy='strict-origin-when-cross-origin'] - Value for Referrer-Policy header
 * @property {string} [permissionsPolicy='camera=(), microphone=(), geolocation=()'] - Value for Permissions-Policy header
 * @property {string} [cacheControl='no-store, max-age=0'] - Value for Cache-Control header
 * @property {(nonce: string) => string} [scriptSrc] - Function to generate script-src directive in CSP
 * @property {(nonce: string) => string} [styleSrc] - Function to generate style-src directive in CSP
 * @property {string} [imgSrc="'self' data:"] - Value for img-src directive in CSP
 * @property {string} [fontSrc="'self'"] - Value for font-src directive in CSP
 * @property {string} [objectSrc="'none'"] - Value for object-src directive in CSP
 * @property {string} [baseUri="'self'"] - Value for base-uri directive in CSP
 * @property {string} [formAction="'self'"] - Value for form-action directive in CSP
 * @property {string} [frameAncestors="'none'"] - Value for frame-ancestors directive in CSP
 * @property {string} [workerSrc="'self'"] - Value for worker-src directive in CSP
 * @property {string} [connectSrc="'self'"] - Value for connect-src directive in CSP
 */

/**
 * Generates a nonce value if serve
 * @returns {string} The generated nonce
 */
const createNonce = () => createHash('sha256').update(Date.now().toString()).digest('base64');

/**
 * Creates a Vite plugin for handling Content Security Policy with nonce and i18n processing
 * @param {Options} [options={}]
 * @returns {import('vite').Plugin}
 */
export function lxViteSecureHeadersPlugin(/** @type {Options} */ options = {}) {
  const {
    reportOnly = false,
    processI18n = true,
    noncePlaceholder = 'NONCE_PLACEHOLDER',
    xssProtection = '1; mode=block',
    frameOptions = 'DENY',
    contentTypeOptions = 'nosniff',
    referrerPolicy = 'strict-origin-when-cross-origin',
    permissionsPolicy = 'camera=(), microphone=(), geolocation=()',
    cacheControl = 'no-store, max-age=0',
    scriptSrc,
    styleSrc,
    imgSrc = "'self' data:",
    fontSrc = "'self'",
    objectSrc = "'none'",
    baseUri = "'self'",
    formAction = "'self'",
    frameAncestors = "'none'",
    workerSrc = "'self'",
    connectSrc = "'self'",
  } = options;

  let sharedNonce;

  return {
    name: 'vite-plugin-csp-nonce',
    enforce: 'post',
    config(config, configEnv) {
      // eslint-disable-next-line no-param-reassign
      config.resolve = config.resolve || {};
      // eslint-disable-next-line no-param-reassign
      config.resolve.alias = config.resolve.alias || {};
      if (processI18n) {
        // eslint-disable-next-line no-param-reassign
        config.plugins = config.plugins || [];
        const isServing = configEnv.command === 'serve';
        let vueI18nPath = 'vue-i18n/dist/vue-i18n.esm-browser.prod.js';
        if (isServing) {
          vueI18nPath = 'vue-i18n/dist/vue-i18n.esm-browser.js';
        }
        // eslint-disable-next-line no-param-reassign
        config.resolve.alias['vue-i18n'] = vueI18nPath;
      }
      return config;
    },
    configResolved(config) {
      const isServing = config.command === 'serve';
      sharedNonce = isServing ? createNonce() : noncePlaceholder;
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      config.html = config.html || {};
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      config.html.cspNonce = sharedNonce;
    },
    /**
     * @param {import('vite').ViteDevServer} server
     */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const nonce = sharedNonce;

        const scriptSrcValue = scriptSrc ? scriptSrc(nonce) : `'self' 'nonce-${nonce}'`;
        const styleSrcValue = styleSrc ? styleSrc(nonce) : `'self' 'nonce-${nonce}'`;

        const csp = [
          "default-src 'self'",
          `script-src ${scriptSrcValue}`,
          `style-src ${styleSrcValue}`,
          `img-src ${imgSrc}`,
          `font-src ${fontSrc}`,
          `object-src ${objectSrc}`,
          `base-uri ${baseUri}`,
          `form-action ${formAction}`,
          `frame-ancestors ${frameAncestors}`,
          `worker-src ${workerSrc}`,
          `connect-src ${connectSrc}`,
          'upgrade-insecure-requests',
        ].join('; ');

        const cspHeaderName = reportOnly
          ? 'Content-Security-Policy-Report-Only'
          : 'Content-Security-Policy';
        res.setHeader(cspHeaderName, csp);

        if (xssProtection) res.setHeader('X-XSS-Protection', xssProtection);
        if (frameOptions) res.setHeader('X-Frame-Options', frameOptions);
        if (contentTypeOptions) res.setHeader('X-Content-Type-Options', contentTypeOptions);
        if (referrerPolicy) res.setHeader('Referrer-Policy', referrerPolicy);
        if (permissionsPolicy) res.setHeader('Permissions-Policy', permissionsPolicy);
        if (cacheControl) res.setHeader('Cache-Control', cacheControl);

        next();
      });
    },
    /**
     * @param {string} html
     * @param {import('vite').IndexHtmlTransformContext} _ctx
     */
    // eslint-disable-next-line no-unused-vars
    transformIndexHtml(html, _ctx) {
      const nonce = sharedNonce;

      const injectNonceScript = `
        <script nonce="${nonce}">
          (function() {
            const originalCreateElement = document.createElement;
            document.createElement = function() {
              const element = originalCreateElement.apply(document, arguments);
              if (arguments[0].toLowerCase() === 'style' || arguments[0].toLowerCase() === 'script') {
                element.nonce = "${nonce}";
              }
              return element;
            };
            // Override insertBefore to add nonce to dynamically inserted style tags
            const originalInsertBefore = Element.prototype.insertBefore;
            Element.prototype.insertBefore = function(newNode, referenceNode) {
              if (newNode.tagName && newNode.tagName.toLowerCase() === 'style' && !newNode.nonce) {
                newNode.nonce = "${nonce}";
              }
              return originalInsertBefore.call(this, newNode, referenceNode);
            };
            // Override appendChild to add nonce to dynamically inserted style tags
            const originalAppendChild = Element.prototype.appendChild;
            Element.prototype.appendChild = function(newNode) {
              if (newNode.tagName && newNode.tagName.toLowerCase() === 'style' && !newNode.nonce) {
                newNode.nonce = "${nonce}";
              }
              return originalAppendChild.call(this, newNode);
            };
          })();
        </script>
      `;

      const linkRegex = /<link\s+([^>]*)>/g;

      return html
        .replace(/<script/g, `<script nonce="${nonce}"`)
        .replace(/<style/g, `<style nonce="${nonce}"`)
        .replace(linkRegex, (match, attributes) => {
          let newAttributes = attributes.replace(/\s*\/\s*$/, '');
          if (!newAttributes.includes('nonce=')) {
            newAttributes += ` nonce="${nonce}"`;
          }
          return `<link ${newAttributes.trim()}>`;
        })
        .replace(/style="/g, `style="nonce="${nonce}" `)
        .replace('</head>', `${injectNonceScript}</head>`);
    },
    /**
    //@param {import('rollup').OutputOptions} buildOptions
    //@param {import('rollup').OutputBundle} bundle
     */
    // @ts-ignore
    generateBundle(buildOptions, bundle) {
      const nonce = sharedNonce;
      const linkRegex = /<link\s+([^>]*?)(\/?\s*>)/g;

      return Object.keys(bundle).reduce((acc, fileName) => {
        const chunk = bundle[fileName];
        if (chunk.type === 'asset' && chunk.fileName.endsWith('.html')) {
          return {
            ...acc,
            [fileName]: {
              ...chunk,
              source: chunk.source
                // @ts-ignore
                .replace(/<script/g, `<script nonce="${nonce}"`)
                .replace(/<style/g, `<style nonce="${nonce}"`)
                // @ts-ignore
                .replace(linkRegex, (match, attributes) => {
                  let newAttributes = attributes.replace(/\s*\/\s*$/, '');
                  if (!newAttributes.includes('nonce=')) {
                    newAttributes += ` nonce="${nonce}"`;
                  }
                  return `<link ${newAttributes.trim()}>`;
                })
                .replace(/style="/g, `style="nonce="${nonce}" `),
            },
          };
        }
        return {
          ...acc,
          [fileName]: chunk,
        };
      }, {});
    },
  };
}
