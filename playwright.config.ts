import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [["list"]],
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npx next start -p 3000",
    reuseExistingServer: true,
    timeout: 60_000,
    url: "http://127.0.0.1:3000"
  }
});
