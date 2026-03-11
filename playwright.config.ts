import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load .env.local so CLERK_E2E_USER_EMAIL / PASSWORD are available
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  timeout: 30_000,
  expect: { timeout: 10_000 },

  // Clerk testing token setup
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3999",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: /auth\.setup\.ts/,
    },
  ],

  webServer: {
    command: process.env.E2E_DEV_CMD || "npm run dev:e2e",
    url: process.env.E2E_BASE_URL || "http://localhost:3999",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NODE_ENV: "development",
    },
  },
});
