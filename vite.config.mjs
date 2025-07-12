import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import VueRouter from "unplugin-vue-router/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: "src/app/pages",
      dts: true,
    }),
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
  build: {
    // Target modern browsers for smaller bundles
    target: "esnext",

    // Source maps for production debugging
    sourcemap: true,

    // Bundle size optimization
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks(id) {
          // Vendor dependencies
          if (id.includes("node_modules")) {
            if (
              id.includes("vue") ||
              id.includes("pinia") ||
              id.includes("router")
            ) {
              return "vendor";
            }
            if (id.includes("chart.js") || id.includes("vue-chartjs")) {
              return "charts";
            }
            if (
              id.includes("@vueuse") ||
              id.includes("date-fns") ||
              id.includes("decimal.js") ||
              id.includes("zod")
            ) {
              return "utils";
            }
            return "vendor";
          }

          // Domain layer gets its own chunk (critical business logic)
          if (id.includes("/src/domain/")) {
            return "domain";
          }

          // Views are split by feature
          if (id.includes("/views/Portfolio")) {
            return "portfolio-views";
          }
          if (id.includes("/views/Mortgage")) {
            return "mortgage-views";
          }
          if (id.includes("/views/CashFlow")) {
            return "dashboard-views";
          }
        },

        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        chunkFileNames: `assets/js/[name]-[hash].js`,
        entryFileNames: `assets/js/[name]-[hash].js`,
      },
    },

    // Chunk size warning limit (500KB)
    chunkSizeWarningLimit: 500,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Enable preload for critical assets
    modulePreload: {
      polyfill: false,
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "pinia",
      "@vueuse/core",
      "chart.js",
      "vue-chartjs",
    ],
  },
});
