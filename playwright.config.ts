import { defineConfig, devices } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split("\n")
      .filter((line) => line.includes("=") && !line.startsWith("#"))
      .map((line) => {
        const eq = line.indexOf("=");
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        return [key, val];
      })
  );
}

const testEnv = parseEnvFile(path.join(__dirname, "server/.env.test"));

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [["html", { outputFolder: "e2e/playwright-report", open: "never" }]],

  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "bun run --watch src/index.ts",
      cwd: path.join(__dirname, "server"),
      url: "http://localhost:3001/api/health",
      // Always start a fresh server so tests run against the test database,
      // not a pre-existing dev server connected to the dev database.
      reuseExistingServer: false,
      env: testEnv,
    },
    {
      command: "bun run dev",
      cwd: path.join(__dirname, "client"),
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
