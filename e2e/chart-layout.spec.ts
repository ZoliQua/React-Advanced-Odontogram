// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The dental chart's layout under real CSS — the one thing jsdom cannot check.
import { test, expect } from "@playwright/test";
import { LOWER, UPPER, expectOneRow, openChart, sideTiles } from "./helpers";

test.beforeEach(async ({ page }) => { await openChart(page); });

test("classic: each arch is one row, 18→11 21→28 above 48→41 31→38", async ({ page }) => {
  const upper = await sideTiles(page, UPPER);
  const lower = await sideTiles(page, LOWER);
  expectOneRow(upper, "upper arch");
  expectOneRow(lower, "lower arch");
  expect(Math.max(...upper.map((b) => b.y + b.height))).toBeLessThanOrEqual(Math.min(...lower.map((b) => b.y)) + 1);
});

test("measured: switching lays the chart out as two arches — and never collapses on the way", async ({ page }) => {
  // Hold the measured artwork chunk back, so the moment BETWEEN choosing the
  // profile and its arrival is observable. That window is where the chart used
  // to collapse: the measured two-arch CSS was applied to the still-classic grid
  // for the whole download, stacking every tile into one column.
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route(/\/assets\/measured-[\w-]+\.js$/, async (route) => { await held; await route.continue(); });

  await page.getByRole("button", { name: "Settings" }).click();
  // Scoped to the Settings tablist: the main view toggle has an "Odontogram" tab too.
  await page.getByRole("tablist", { name: "Settings" }).getByRole("tab", { name: "Odontogram" }).click();
  await page.getByRole("combobox", { name: "Tooth anatomy" }).selectOption("measured");
  await page.keyboard.press("Escape");

  // Mid-download: still the intact classic chart.
  await expect(page.locator("#toothGrid")).not.toHaveAttribute("data-anatomy", "measured");
  expectOneRow(await sideTiles(page, UPPER), "upper arch while the artwork downloads");

  release();
  await expect(page.locator("#toothGrid")).toHaveAttribute("data-anatomy", "measured");
  await expect(page.locator("#toothGrid .upper-arch")).toBeVisible();
  const upper = await sideTiles(page, UPPER);
  const lower = await sideTiles(page, LOWER);
  expectOneRow(upper, "measured upper arch");
  expectOneRow(lower, "measured lower arch");
  expect(Math.max(...upper.map((b) => b.y + b.height))).toBeLessThanOrEqual(Math.min(...lower.map((b) => b.y)) + 1);
});
