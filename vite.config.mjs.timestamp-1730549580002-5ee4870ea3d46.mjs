// vite.config.mjs
import { defineConfig as defineConfig4 } from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/vite@5.0.13/node_modules/vite/dist/node/index.js";

// vite.plugin.config.mjs
import { defineConfig } from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/vite@5.0.13/node_modules/vite/dist/node/index.js";
import path from "path";
import dts from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/vite-plugin-dts@3.7.1_typescript@5.5.4_vite@5.0.13/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/aleksandrsbarkancevs/Documents/Projects/ui";
var pluginConfig = defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src")
    }
  },
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/vite/index.js"),
      name: "WntrLxUiVite",
      fileName: (format) => `wntr-lx-ui-vite.${format}.js`,
      formats: ["es"]
    },
    rollupOptions: {
      external: ["vite", "crypto"],
      output: {
        exports: "named",
        format: "module",
        globals: {
          vite: "vite",
          crypto: "crypto"
        }
      }
    },
    outDir: "dist/vite",
    target: "esnext",
    sourcemap: true
  },
  plugins: [
    dts({
      outputDir: "dist/vite/types",
      staticImport: true,
      insertTypesEntry: true,
      copyDtsFiles: true
    })
  ]
});
var vite_plugin_config_default = pluginConfig;

// vite.vue.config.mjs
import { defineConfig as defineConfig2 } from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/vite@5.0.13/node_modules/vite/dist/node/index.js";
import path2 from "path";
import vue from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/@vitejs+plugin-vue@5.0.3_vite@5.0.13_vue@3.4.15/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import dts2 from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/vite-plugin-dts@3.7.1_typescript@5.5.4_vite@5.0.13/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname2 = "/Users/aleksandrsbarkancevs/Documents/Projects/ui";
var vueConfig = defineConfig2({
  base: "./",
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname2, "src")
    }
  },
  build: {
    lib: {
      entry: path2.resolve(__vite_injected_original_dirname2, "src/lib.js"),
      name: "VueCarbonComponents",
      fileName: (format) => `wntr-lx-ui.${format}.js`,
      formats: ["esm", "umd"]
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        minifyInternalExports: false,
        assetFileNames: "[name][extname]",
        globals: {
          vue: "Vue"
        }
      }
    }
  },
  plugins: [
    vue(),
    dts2({
      outputDir: "dist/types",
      staticImport: true,
      insertTypesEntry: true,
      copyDtsFiles: true,
      exclude: []
    })
  ],
  test: {
    globals: true,
    environment: "happy-dom"
  }
});
var vite_vue_config_default = vueConfig;

// vite.css.config.mjs
import { defineConfig as defineConfig3 } from "file:///Users/aleksandrsbarkancevs/Documents/Projects/ui/node_modules/.pnpm/vite@5.0.13/node_modules/vite/dist/node/index.js";
import path3 from "path";
import fs from "fs";
var __vite_injected_original_dirname3 = "/Users/aleksandrsbarkancevs/Documents/Projects/ui";
function generateInput() {
  const input = {};
  const stylesDir = path3.resolve(__vite_injected_original_dirname3, "src/styles");
  const files = fs.readdirSync(stylesDir);
  const excludedFiles = [
    "lx-bt-digives.css",
    "lx-bt-eikis.css",
    "lx-bt-visvaris-social.css",
    "lx-bt-visvaris-misc.css",
    "lx-bt-visvaris-client.css",
    "lx-bt-visvaris-data.css",
    "lx-bt-visvaris-filing.css",
    "lx-bt-visvaris-finance.css",
    "lx-bt-visvaris-personnel.css",
    "lx-bt-visvaris-property.css"
  ];
  files.forEach((file) => {
    if (!excludedFiles.includes(file)) {
      const { name } = path3.parse(file);
      input[name] = path3.resolve(stylesDir, file);
    }
  });
  return input;
}
var cssConfig = defineConfig3({
  base: "./",
  resolve: {
    alias: {
      "@": path3.resolve(__vite_injected_original_dirname3, "src")
    }
  },
  build: {
    outDir: "dist/styles",
    rollupOptions: {
      input: generateInput(),
      output: {
        inlineDynamicImports: false,
        assetFileNames: "[name][extname]",
        format: "commonjs"
      }
    },
    cssCodeSplit: true,
    copyPublicDir: false,
    target: "esnext"
  }
});
var cssBundlesConfig = defineConfig3({
  base: "./",
  resolve: {
    alias: {
      "@": path3.resolve(__vite_injected_original_dirname3, "src")
    }
  },
  build: {
    outDir: "dist/bundles",
    rollupOptions: {
      input: {
        "lx-bt-digives": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-digives.css"),
        "lx-bt-eikis": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-eikis.css"),
        "lx-bt-visvaris-social": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-visvaris-social.css"),
        "lx-bt-visvaris-misc": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-visvaris-misc.css"),
        "lx-bt-visvaris-client": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-visvaris-client.css"),
        "lx-bt-visvaris-data": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-visvaris-data.css"),
        "lx-bt-visvaris-filing": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-visvaris-filing.css"),
        "lx-bt-visvaris-finance": path3.resolve(__vite_injected_original_dirname3, "src/styles/lx-bt-visvaris-finance.css"),
        "lx-bt-visvaris-personnel": path3.resolve(
          __vite_injected_original_dirname3,
          "src/styles/lx-bt-visvaris-personnel.css"
        ),
        "lx-bt-visvaris-property": path3.resolve(
          __vite_injected_original_dirname3,
          "src/styles/lx-bt-visvaris-property.css"
        )
      },
      output: {
        inlineDynamicImports: false,
        assetFileNames: "[name][extname]"
      }
    },
    cssCodeSplit: true,
    copyPublicDir: false
  }
});

// vite.config.mjs
var vite_config_default = defineConfig4(({ mode }) => {
  if (mode === "lib") {
    return vite_vue_config_default;
  }
  if (mode === "css") {
    return cssConfig;
  }
  if (mode === "bundles") {
    return cssBundlesConfig;
  }
  if (mode === "vite") {
    return vite_plugin_config_default;
  }
  throw new Error("Unknown mode!");
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIiwgInZpdGUucGx1Z2luLmNvbmZpZy5tanMiLCAidml0ZS52dWUuY29uZmlnLm1qcyIsICJ2aXRlLmNzcy5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FsZWtzYW5kcnNiYXJrYW5jZXZzL0RvY3VtZW50cy9Qcm9qZWN0cy91aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZWtzYW5kcnNiYXJrYW5jZXZzL0RvY3VtZW50cy9Qcm9qZWN0cy91aS92aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FsZWtzYW5kcnNiYXJrYW5jZXZzL0RvY3VtZW50cy9Qcm9qZWN0cy91aS92aXRlLmNvbmZpZy5tanNcIjsvKiBlc2xpbnQtZGlzYWJsZSBuby1yZXN0cmljdGVkLWltcG9ydHMgKi9cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9leHRlbnNpb25zICovXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBwbHVnaW5Db25maWcgZnJvbSAnLi92aXRlLnBsdWdpbi5jb25maWcubWpzJztcbmltcG9ydCB2dWVDb25maWcgZnJvbSAnLi92aXRlLnZ1ZS5jb25maWcubWpzJztcbmltcG9ydCB7IGNzc0J1bmRsZXNDb25maWcsIGNzc0NvbmZpZyB9IGZyb20gJy4vdml0ZS5jc3MuY29uZmlnLm1qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgaWYgKG1vZGUgPT09ICdsaWInKSB7XG4gICAgcmV0dXJuIHZ1ZUNvbmZpZztcbiAgfVxuICBpZiAobW9kZSA9PT0gJ2NzcycpIHtcbiAgICByZXR1cm4gY3NzQ29uZmlnO1xuICB9XG4gIGlmIChtb2RlID09PSAnYnVuZGxlcycpIHtcbiAgICByZXR1cm4gY3NzQnVuZGxlc0NvbmZpZztcbiAgfVxuICBpZiAobW9kZSA9PT0gJ3ZpdGUnKSB7XG4gICAgcmV0dXJuIHBsdWdpbkNvbmZpZztcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gbW9kZSEnKTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWxla3NhbmRyc2JhcmthbmNldnMvRG9jdW1lbnRzL1Byb2plY3RzL3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWxla3NhbmRyc2JhcmthbmNldnMvRG9jdW1lbnRzL1Byb2plY3RzL3VpL3ZpdGUucGx1Z2luLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FsZWtzYW5kcnNiYXJrYW5jZXZzL0RvY3VtZW50cy9Qcm9qZWN0cy91aS92aXRlLnBsdWdpbi5jb25maWcubWpzXCI7LyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzICovXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5jb25zdCBwbHVnaW5Db25maWcgPSBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLi8nLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy92aXRlL2luZGV4LmpzJyksXG4gICAgICBuYW1lOiAnV250ckx4VWlWaXRlJyxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgd250ci1seC11aS12aXRlLiR7Zm9ybWF0fS5qc2AsXG4gICAgICBmb3JtYXRzOiBbJ2VzJ10sXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWyd2aXRlJywgJ2NyeXB0byddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGV4cG9ydHM6ICduYW1lZCcsXG4gICAgICAgIGZvcm1hdDogJ21vZHVsZScsXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICB2aXRlOiAndml0ZScsXG4gICAgICAgICAgY3J5cHRvOiAnY3J5cHRvJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBvdXREaXI6ICdkaXN0L3ZpdGUnLFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgZHRzKHtcbiAgICAgIG91dHB1dERpcjogJ2Rpc3Qvdml0ZS90eXBlcycsXG4gICAgICBzdGF0aWNJbXBvcnQ6IHRydWUsXG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgICAgY29weUR0c0ZpbGVzOiB0cnVlLFxuICAgIH0pLFxuICBdLFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHBsdWdpbkNvbmZpZztcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2FsZWtzYW5kcnNiYXJrYW5jZXZzL0RvY3VtZW50cy9Qcm9qZWN0cy91aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZWtzYW5kcnNiYXJrYW5jZXZzL0RvY3VtZW50cy9Qcm9qZWN0cy91aS92aXRlLnZ1ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hbGVrc2FuZHJzYmFya2FuY2V2cy9Eb2N1bWVudHMvUHJvamVjdHMvdWkvdml0ZS52dWUuY29uZmlnLm1qc1wiOy8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyAqL1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbi8qKiBAdHlwZSB7aW1wb3J0KCd2aXRlJykuVXNlckNvbmZpZ30gKi9cbmNvbnN0IHZ1ZUNvbmZpZyA9IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcuLycsXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2xpYi5qcycpLFxuICAgICAgbmFtZTogJ1Z1ZUNhcmJvbkNvbXBvbmVudHMnLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGB3bnRyLWx4LXVpLiR7Zm9ybWF0fS5qc2AsXG4gICAgICBmb3JtYXRzOiBbJ2VzbScsICd1bWQnXSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3Z1ZSddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1pbmlmeUludGVybmFsRXhwb3J0czogZmFsc2UsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnW25hbWVdW2V4dG5hbWVdJyxcbiAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgIHZ1ZTogJ1Z1ZScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBkdHMoe1xuICAgICAgb3V0cHV0RGlyOiAnZGlzdC90eXBlcycsXG4gICAgICBzdGF0aWNJbXBvcnQ6IHRydWUsXG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgICAgY29weUR0c0ZpbGVzOiB0cnVlLFxuICAgICAgZXhjbHVkZTogW10sXG4gICAgfSksXG4gIF0sXG4gIHRlc3Q6IHtcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGVudmlyb25tZW50OiAnaGFwcHktZG9tJyxcbiAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCB2dWVDb25maWc7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9hbGVrc2FuZHJzYmFya2FuY2V2cy9Eb2N1bWVudHMvUHJvamVjdHMvdWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9hbGVrc2FuZHJzYmFya2FuY2V2cy9Eb2N1bWVudHMvUHJvamVjdHMvdWkvdml0ZS5jc3MuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYWxla3NhbmRyc2JhcmthbmNldnMvRG9jdW1lbnRzL1Byb2plY3RzL3VpL3ZpdGUuY3NzLmNvbmZpZy5tanNcIjsvKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMgKi9cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUlucHV0KCkge1xuICBjb25zdCBpbnB1dCA9IHt9O1xuICBjb25zdCBzdHlsZXNEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3N0eWxlcycpO1xuICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHN0eWxlc0Rpcik7XG5cbiAgY29uc3QgZXhjbHVkZWRGaWxlcyA9IFtcbiAgICAnbHgtYnQtZGlnaXZlcy5jc3MnLFxuICAgICdseC1idC1laWtpcy5jc3MnLFxuICAgICdseC1idC12aXN2YXJpcy1zb2NpYWwuY3NzJyxcbiAgICAnbHgtYnQtdmlzdmFyaXMtbWlzYy5jc3MnLFxuICAgICdseC1idC12aXN2YXJpcy1jbGllbnQuY3NzJyxcbiAgICAnbHgtYnQtdmlzdmFyaXMtZGF0YS5jc3MnLFxuICAgICdseC1idC12aXN2YXJpcy1maWxpbmcuY3NzJyxcbiAgICAnbHgtYnQtdmlzdmFyaXMtZmluYW5jZS5jc3MnLFxuICAgICdseC1idC12aXN2YXJpcy1wZXJzb25uZWwuY3NzJyxcbiAgICAnbHgtYnQtdmlzdmFyaXMtcHJvcGVydHkuY3NzJyxcbiAgXTtcblxuICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgaWYgKCFleGNsdWRlZEZpbGVzLmluY2x1ZGVzKGZpbGUpKSB7XG4gICAgICBjb25zdCB7IG5hbWUgfSA9IHBhdGgucGFyc2UoZmlsZSk7XG4gICAgICBpbnB1dFtuYW1lXSA9IHBhdGgucmVzb2x2ZShzdHlsZXNEaXIsIGZpbGUpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGlucHV0O1xufVxuXG4vKiogQHR5cGUge2ltcG9ydCgndml0ZScpLlVzZXJDb25maWd9ICovXG5leHBvcnQgY29uc3QgY3NzQ29uZmlnID0gZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJy4vJyxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3Qvc3R5bGVzJyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDogZ2VuZXJhdGVJbnB1dCgpLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGlubGluZUR5bmFtaWNJbXBvcnRzOiBmYWxzZSxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdbbmFtZV1bZXh0bmFtZV0nLFxuICAgICAgICBmb3JtYXQ6ICdjb21tb25qcycsXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIGNvcHlQdWJsaWNEaXI6IGZhbHNlLFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gIH0sXG59KTtcblxuLyoqIEB0eXBlIHtpbXBvcnQoJ3ZpdGUnKS5Vc2VyQ29uZmlnfSAqL1xuZXhwb3J0IGNvbnN0IGNzc0J1bmRsZXNDb25maWcgPSBkZWZpbmVDb25maWcoe1xuICBiYXNlOiAnLi8nLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdC9idW5kbGVzJyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICAnbHgtYnQtZGlnaXZlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc3R5bGVzL2x4LWJ0LWRpZ2l2ZXMuY3NzJyksXG4gICAgICAgICdseC1idC1laWtpcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc3R5bGVzL2x4LWJ0LWVpa2lzLmNzcycpLFxuICAgICAgICAnbHgtYnQtdmlzdmFyaXMtc29jaWFsJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zdHlsZXMvbHgtYnQtdmlzdmFyaXMtc29jaWFsLmNzcycpLFxuICAgICAgICAnbHgtYnQtdmlzdmFyaXMtbWlzYyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc3R5bGVzL2x4LWJ0LXZpc3ZhcmlzLW1pc2MuY3NzJyksXG4gICAgICAgICdseC1idC12aXN2YXJpcy1jbGllbnQnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3N0eWxlcy9seC1idC12aXN2YXJpcy1jbGllbnQuY3NzJyksXG4gICAgICAgICdseC1idC12aXN2YXJpcy1kYXRhJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zdHlsZXMvbHgtYnQtdmlzdmFyaXMtZGF0YS5jc3MnKSxcbiAgICAgICAgJ2x4LWJ0LXZpc3ZhcmlzLWZpbGluZyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc3R5bGVzL2x4LWJ0LXZpc3ZhcmlzLWZpbGluZy5jc3MnKSxcbiAgICAgICAgJ2x4LWJ0LXZpc3ZhcmlzLWZpbmFuY2UnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3N0eWxlcy9seC1idC12aXN2YXJpcy1maW5hbmNlLmNzcycpLFxuICAgICAgICAnbHgtYnQtdmlzdmFyaXMtcGVyc29ubmVsJzogcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICAnc3JjL3N0eWxlcy9seC1idC12aXN2YXJpcy1wZXJzb25uZWwuY3NzJ1xuICAgICAgICApLFxuICAgICAgICAnbHgtYnQtdmlzdmFyaXMtcHJvcGVydHknOiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICdzcmMvc3R5bGVzL2x4LWJ0LXZpc3ZhcmlzLXByb3BlcnR5LmNzcydcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgaW5saW5lRHluYW1pY0ltcG9ydHM6IGZhbHNlLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ1tuYW1lXVtleHRuYW1lXScsXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIGNvcHlQdWJsaWNEaXI6IGZhbHNlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FB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UUMsbUNBQVcsb0NBQW9DO0FBQUEsUUFDbkYseUJBQXlCRCxNQUFLLFFBQVFDLG1DQUFXLHNDQUFzQztBQUFBLFFBQ3ZGLHVCQUF1QkQsTUFBSyxRQUFRQyxtQ0FBVyxvQ0FBb0M7QUFBQSxRQUNuRix5QkFBeUJELE1BQUssUUFBUUMsbUNBQVcsc0NBQXNDO0FBQUEsUUFDdkYsMEJBQTBCRCxNQUFLLFFBQVFDLG1DQUFXLHVDQUF1QztBQUFBLFFBQ3pGLDRCQUE0QkQsTUFBSztBQUFBLFVBQy9CQztBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsUUFDQSwyQkFBMkJELE1BQUs7QUFBQSxVQUM5QkM7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLHNCQUFzQjtBQUFBLFFBQ3RCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLEVBQ2pCO0FBQ0YsQ0FBQzs7O0FIdkZELElBQU8sc0JBQVFFLGNBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxNQUFJLFNBQVMsT0FBTztBQUNsQixXQUFPO0FBQUEsRUFDVDtBQUNBLE1BQUksU0FBUyxPQUFPO0FBQ2xCLFdBQU87QUFBQSxFQUNUO0FBQ0EsTUFBSSxTQUFTLFdBQVc7QUFDdEIsV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLFNBQVMsUUFBUTtBQUNuQixXQUFPO0FBQUEsRUFDVDtBQUNBLFFBQU0sSUFBSSxNQUFNLGVBQWU7QUFDakMsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyIsICJwYXRoIiwgImR0cyIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJkZWZpbmVDb25maWciLCAicGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJkdHMiLCAiZGVmaW5lQ29uZmlnIiwgInBhdGgiLCAiX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUiLCAicGF0aCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSIsICJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIl0KfQo=
