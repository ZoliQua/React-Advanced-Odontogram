// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Dark mode, measured on the computed colours the browser actually paints.
import { test, expect, type Locator } from "@playwright/test";
import { openChart } from "./helpers";

/** WCAG relative luminance of the effective background behind an element, and
 *  of its text colour, plus their contrast ratio. The background is resolved by
 *  walking up to the first ancestor that paints one. */
async function colours(el: Locator) {
  return el.evaluate((node) => {
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? ["0", "0", "0", "0"]).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let bg: number[] = [255, 255, 255];
    for (let n: Element | null = node; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c.length < 4 || c[3] > 0.5) { bg = c; break; }
    }
    const fg = parse(getComputedStyle(node).color);
    const [lb, lf] = [lum(bg), lum(fg)];
    return { bg: lb, contrast: (Math.max(lb, lf) + 0.05) / (Math.min(lb, lf) + 0.05) };
  });
}

test("dark mode darkens the page and keeps the text readable", async ({ page }) => {
  await openChart(page);
  const title = page.locator(".topbar .title");
  const light = await colours(title);
  expect(light.contrast, "light mode text contrast").toBeGreaterThanOrEqual(4.5);

  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.getByRole("button", { name: "Light mode" })).toBeVisible();
  const dark = await colours(title);
  expect(dark.bg, "the background did not get darker").toBeLessThan(light.bg / 2);
  expect(dark.contrast, "dark mode text contrast").toBeGreaterThanOrEqual(4.5);
});
