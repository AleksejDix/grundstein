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
    // Browser testing with Playwright
    browser: {
      enabled: false, // Set to true when ready for browser testing
      name: 'chromium',
      provider: 'playwright',
    },

    // Test file patterns
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],

    // No globals, no mocking setup
    globals: false,
    
    // No coverage for now - will use real browser testing
    coverage: {
      enabled: false,
    },

    // Test timeouts
    testTimeout: 30000, // Longer timeout for browser tests
    hookTimeout: 30000,
  },
});