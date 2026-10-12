import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: ".",
  testMatch: "flow.pw.ts",
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3103", trace: "retain-on-failure" },
  webServer: {
    command: "npm run prototype:feedback",
    cwd: path.resolve(__dirname, "../.."),
    env: { FEEDBACK_PROTOTYPE_PORT: "3103" },
    url: "http://127.0.0.1:3103",
    reuseExistingServer: false,
    timeout: 20_000,
  },
  projects: [
    { name: "desktop-no-js", use: { ...devices["Desktop Chrome"], javaScriptEnabled: false } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
});
