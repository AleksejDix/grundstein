/// <reference types="vitest" />
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // @ts-ignore - Vue plugin type definition issue, works at runtime
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    name: "user",
    globals: true,
    testTimeout: 5000,
    hookTimeout: 10000,
    
    include: [
      "src/app/components/**/*.user.test.{js,ts}",
      "src/app/components/**/*.user.spec.{js,ts}",
    ],
    
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
    
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage/user",
      
      thresholds: {
        branches: 20,
        functions: 20,
        lines: 20,
        statements: 20,
      },
      
      include: ["src/app/components/**/*.vue"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.{js,ts}",
        "src/**/*.user.{test,spec}.{js,ts}",
      ],
    },
    
    reporters: ["verbose"],
  },
});