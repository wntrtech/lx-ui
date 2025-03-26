/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

/** @type {import('vite').UserConfig} */
const pluginConfig = defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/vite/index.js'),
      name: 'WntrLxUiVite',
      fileName: (format) => `wntr-lx-ui-vite.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vite', 'crypto', 'fs', 'path'],
      output: {
        exports: 'named',
        format: 'module',
        globals: {
          vite: 'vite',
          crypto: 'crypto',
        },
      },
    },
    outDir: 'dist/vite',
    target: 'esnext',
    sourcemap: true,
  },
  plugins: [
    dts({
      outputDir: 'dist/vite/types',
      staticImport: true,
      insertTypesEntry: true,
      copyDtsFiles: true,
    }),
  ],
});

export default pluginConfig;
