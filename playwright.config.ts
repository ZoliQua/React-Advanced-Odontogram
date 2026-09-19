// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Browser-level tests: what jsdom cannot see — real CSS layout, real chunk
// loading, real right-to-left rendering.
//
// They run against the PRODUCTION demo build served by `vite preview`, not the
// dev server: the code-split chunks (the measured anatomy, each UI language)
// only exist, and only load, the way they do for users in a real build.
//
// The assertions are geometric and structural — positions, attributes, network
// requests — never pixel snapshots. Screenshots differ between macOS and the
// Linux CI runner (fonts, antialiasing) and would make the suite flaky for
// reasons that have nothing to do with the chart.
import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      // Wide enough that the classic 16-column grid is not squeezed.
      use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 1000 } },
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
