// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI languages in a real build: which chunks are fetched, and when — plus the
// right-to-left layout, which only a real layout engine can measure.
import { test, expect } from "@playwright/test";
import { chooseLanguage, openChart, sideTiles } from "./helpers";

const LOCALE_CHUNK = /\/assets\/(pt-br|hu|de|es|it|sk|pl|ru|zh|ar|fr)-[\w-]+\.js$/;

test("only English is downloaded at start; a language is fetched when it is chosen", async ({ page }) => {
  const fetched: string[] = [];
  page.on("request", (req) => { const m = LOCALE_CHUNK.exec(new URL(req.url()).pathname); if (m) fetched.push(m[1]); });

  await openChart(page);
  expect(fetched, "a language chunk was fetched before anyone asked for it").toEqual([]);
  await expect(page.locator(".odontogram-root")).toHaveAttribute("lang", "en");

  await chooseLanguage(page, /Hungarian/);
  await expect(page.locator(".odontogram-root")).toHaveAttribute("lang", "hu");
  await expect(page.locator(".topbar .subtitle")).toContainText("Magyar nyelven.");
  expect(fetched).toEqual(["hu"]);
});

test("a switch keeps the current language on screen until the new one arrives", async ({ page }) => {
  await openChart(page);
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route(/\/assets\/de-[\w-]+\.js$/, async (route) => { await held; await route.continue(); });

  await chooseLanguage(page, /German/);
  // German is still downloading: the UI must still be English — not blank, and
  // not half-switched.
  await expect(page.locator(".odontogram-root")).toHaveAttribute("lang", "en");
  await expect(page.locator(".topbar .subtitle")).toContainText("In English.");

  release();
  await expect(page.locator(".odontogram-root")).toHaveAttribute("lang", "de");
});

test("arabic: the interface mirrors, the dental chart stays left-to-right", async ({ page }) => {
  await openChart(page);
  await chooseLanguage(page, /Arabic/);
  const root = page.locator(".odontogram-root");
  await expect(root).toHaveAttribute("dir", "rtl");
  expect(await root.evaluate((el) => getComputedStyle(el).direction)).toBe("rtl");
  expect(await page.locator("#toothGrid").evaluate((el) => getComputedStyle(el).direction)).toBe("ltr");
  const [t18, t28] = await sideTiles(page, [18, 28]);
  expect(t18.x, "18 must stay on the left even in a right-to-left UI").toBeLessThan(t28.x);
});
