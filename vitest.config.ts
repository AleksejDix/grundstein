/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Enable jsdom environment for Vue component testing
    environment: "jsdom",

    // Test file patterns
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "cypress", "e2e"],

    // Global test setup
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",

      // Coverage thresholds - aim high for financial software!
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // Stricter thresholds for critical domain logic
        "src/domain/**": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },

      // Include/exclude patterns
      include: ["src/**/*.{js,jsx,ts,tsx,vue}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{js,jsx,ts,tsx}",
        "src/**/*.spec.{js,jsx,ts,tsx}",
        "src/main.ts",
        "src/App.vue",
        "src/assets/**",
      ],

      // Clean coverage directory before running
      clean: true,

      // Report uncovered lines
      reportOnFailure: true,
    },

    // Test timeouts
    testTimeout: 5000,
    hookTimeout: 10000,

    // Watch mode configuration
    watch: {
      exclude: ["node_modules/**", "dist/**", "coverage/**"],
    },

    // Reporter configuration
    reporter: ["verbose"],

    // Mock configuration for Vue testing
    deps: {
      inline: ["@vue/test-utils"],
    },
  },

  // Vue-specific configuration
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
});
