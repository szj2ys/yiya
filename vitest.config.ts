import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
    },
  },
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    // Use jsdom by default so @testing-library/react works.
    environment: "jsdom",
    include: [
      "__tests__/**/*.{test,spec}.{ts,tsx}",
      "app/**/__tests__/**/*.{test,spec}.tsx",
      "app/**/*.{test,spec}.ts",
      "app/**/*.{test,spec}.tsx",
    ],
  },
});
