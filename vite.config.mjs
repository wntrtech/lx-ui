import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import dts from 'vite-plugin-dts';
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

/** @type {import('vite').UserConfig} */
const cssConfig = defineConfig({
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
      },
    },
    cssCodeSplit: true,
    copyPublicDir: false,
  },
});

/** @type {import('vite').UserConfig} */
const bundlesConfig = defineConfig({
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

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return vueConfig;
  }
  if (mode === 'css') {
    return cssConfig;
  }
  if (mode === 'bundles') {
    return bundlesConfig;
  }
  throw new Error('Unknown mode!');
});
