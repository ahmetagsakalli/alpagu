import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "cms.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node scripts/test-server.mjs",
    url: "http://127.0.0.1:3100/admin",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
