/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
const vueConfig = defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib.js'),
      name: 'VueCarbonComponents',
      fileName: (format) => `wntr-lx-ui.${format}.js`,
      formats: ['esm', 'umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        minifyInternalExports: false,
        assetFileNames: '[name][extname]',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [
    vue(),
    dts({
      outputDir: 'dist/types',
      staticImport: true,
      insertTypesEntry: true,
      copyDtsFiles: true,
      exclude: [],
    }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});

export default vueConfig;
