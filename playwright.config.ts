import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: "apps/backend/.dev.vars" });
process.env.VERIFY_USER_EMAIL ??= "verification@example.test";
process.env.VERIFY_USER_PASSWORD ??= "verify-records-delete-password";

export default defineConfig({
  testDir: "./verification",
  outputDir: "test-results/playwright",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    viewport: { width: 393, height: 852 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter backend exec wrangler dev --port 8787",
      name: "backend",
      url: "http://localhost:8787",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter web exec vite --host localhost --port 5173",
      name: "web",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
