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
    'lx-bt-visvaris-client.css',
    'lx-bt-visvaris-data.css',
    'lx-bt-visvaris-filing.css',
    'lx-bt-visvaris-finance.css',
    'lx-bt-visvaris-personnel.css',
    'lx-bt-visvaris-property.css',
    'lx-bt-lvas.css',
    // add new bundle names here to exclude them from styles folder
  ];

  files.forEach((file) => {
    if (!excludedFiles.includes(file)) {
      const { name } = path.parse(file);
      input[name] = path.resolve(stylesDir, file);
    }
  });

  return input;
}

function generateRollupInput(baseDir, extension = '.css') {
  const cssBundles = [
    'lx-bt-digives',
    'lx-bt-eikis',
    'lx-bt-visvaris-social',
    'lx-bt-visvaris-misc',
    'lx-bt-visvaris-client',
    'lx-bt-visvaris-data',
    'lx-bt-visvaris-filing',
    'lx-bt-visvaris-finance',
    'lx-bt-visvaris-personnel',
    'lx-bt-visvaris-property',
    'lx-bt-lvas',
    'lx-bt-oots',
    // add new bundle names here
  ];

  return cssBundles.reduce((input, fileName) => {
    input[fileName] = path.resolve(baseDir, `${fileName}${extension}`);
    return input;
  }, {});
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
      input: generateRollupInput(path.resolve(__dirname, 'src/styles')),
      output: {
        inlineDynamicImports: false,
        assetFileNames: '[name][extname]',
      },
    },
    cssCodeSplit: true,
    copyPublicDir: false,
  },
});
