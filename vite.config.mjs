/* eslint-disable no-restricted-imports */
/* eslint-disable import/extensions */
import { defineConfig } from 'vite';
import pluginConfig from './vite.plugin.config.mjs';
import vueConfig from './vite.vue.config.mjs';
import { cssBundlesConfig, cssConfig } from './vite.css.config.mjs';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return vueConfig;
  }
  if (mode === 'css') {
    return cssConfig;
  }
  if (mode === 'bundles') {
    return cssBundlesConfig;
  }
  if (mode === 'vite') {
    return pluginConfig;
  }
  throw new Error('Unknown mode!');
});
