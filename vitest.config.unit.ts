/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    name: "unit",
    globals: true,
    testTimeout: 5000,
    hookTimeout: 10000,
    environment: "node",

    include: [
      "src/core/**/*.unit.test.{js,ts}",
      "src/core/**/*.unit.spec.{js,ts}",
    ],
    exclude: ["src/core/**/*.user.test.{js,ts}"],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage/unit",

      thresholds: {
        branches: 50,
        functions: 50,
        lines: 50,
        statements: 50,
      },

      include: ["src/core/**/*.{js,ts}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.{js,ts}",
        "src/**/*.unit.{test,spec}.{js,ts}",
      ],
    },

    reporters: ["verbose"],
  },
});
