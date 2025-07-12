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
    // Global configuration
    globals: true,

    // Core tests in Node environment
    include: ["src/core/**/*.{test,spec}.{js,ts}"],
    environment: "node",
    testTimeout: 5000,
    hookTimeout: 10000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",

      // Different thresholds for different parts
      thresholds: {
        // Domain logic should have high coverage
        "src/core/domain/**": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        // UI components can have lower thresholds
        "src/app/**": {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },

      include: ["src/**/*.{js,jsx,ts,tsx,vue}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.{js,jsx,ts,tsx}",
        "src/main.ts",
        "src/App.vue",
        "src/assets/**",
      ],
    },

    // Reporter configuration
    reporters: ["verbose"],
  },
});
