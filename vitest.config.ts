/// <reference types="vitest" />
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

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
    testTimeout: 5000,
    hookTimeout: 10000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",

      // Different thresholds for different parts
      thresholds: {
        // Domain logic should have high coverage (temporarily lowered)
        "src/core/domain/**": {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
        },
        // UI components can have lower thresholds
        "src/app/**": {
          branches: 20,
          functions: 20,
          lines: 20,
          statements: 20,
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

    // Projects configuration
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/core/**/*.{test,spec}.{js,ts}"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/app/**/*.user.{test,spec}.{js,ts}"],
          setupFiles: ["vitest-browser-vue"],
          browser: {
            enabled: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
                headless: true,
              },
            ],
          },
        },
        plugins: [vue()],
      },
    ],
  },
});
