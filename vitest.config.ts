/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    testTimeout: 5000,
    hookTimeout: 10000,
    environment: "jsdom",

    // Include only unit tests by default
    include: ["src/**/*.unit.test.{js,ts}", "src/**/*.unit.spec.{js,ts}"],
    // Explicitly exclude user tests to prevent browser import errors
    exclude: [
      "node_modules",
      "dist",
      "cypress",
      "src/**/*.user.test.{js,ts}",
      "src/**/*.user.spec.{js,ts}",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",

      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },

      include: ["src/**/*.{js,ts,vue}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.{js,ts}",
        "src/**/*.{unit,user}.{test,spec}.{js,ts}",
        "src/app.ts",
        "src/main.ts",
      ],
    },

    reporters: ["verbose"],
  },
});
