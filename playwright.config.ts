import { defineConfig, devices } from "@playwright/test";

// Smoke-tests the DEPLOYED app (docs/TESTING.md): APP_URL=https://<app> pnpm test:e2e
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 1,
  use: { baseURL: process.env.APP_URL ?? "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
