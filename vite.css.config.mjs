/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

function generateInput() {
  const input = {};
  const stylesDir = path.resolve(__dirname, 'src/styles');
  const files = fs.readdirSync(stylesDir);

  const excludedFiles = [
    'lx-bt-digives.css',
    'lx-bt-eikis.css',
    'lx-bt-visvaris-social.css',
    'lx-bt-visvaris-misc.css',
  ];

  files.forEach((file) => {
    if (!excludedFiles.includes(file)) {
      const { name } = path.parse(file);
      input[name] = path.resolve(stylesDir, file);
    }
  });

  return input;
}

/** @type {import('vite').UserConfig} */
export const cssConfig = defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/styles',
    rollupOptions: {
      input: generateInput(),
      output: {
        inlineDynamicImports: false,
        assetFileNames: '[name][extname]',
        format: 'commonjs',
      },
    },
    cssCodeSplit: true,
    copyPublicDir: false,
    target: 'esnext',
  },
});

/** @type {import('vite').UserConfig} */
export const cssBundlesConfig = defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/bundles',
    rollupOptions: {
      input: {
        'lx-bt-digives': path.resolve(__dirname, 'src/styles/lx-bt-digives.css'),
        'lx-bt-eikis': path.resolve(__dirname, 'src/styles/lx-bt-eikis.css'),
        'lx-bt-visvaris-social': path.resolve(__dirname, 'src/styles/lx-bt-visvaris-social.css'),
        'lx-bt-visvaris-misc': path.resolve(__dirname, 'src/styles/lx-bt-visvaris-misc.css'),
      },
      output: {
        inlineDynamicImports: false,
        assetFileNames: '[name][extname]',
      },
    },
    cssCodeSplit: true,
    copyPublicDir: false,
  },
});
