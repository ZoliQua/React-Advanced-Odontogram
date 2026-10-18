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

/** The painted fill of a layer inside tooth 11's side-view tile, as rgb(). */
async function paintedFill(page: import("@playwright/test").Page, layerId: string) {
  const el = page.locator(`.tooth-tile.side-view[data-tooth="11"] [id="${layerId}"]`).first();
  return el.evaluate((node) => {
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
    const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    const [r, g, b] = parse(getComputedStyle(node).fill);
    return { css: getComputedStyle(node).fill, lum: 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) };
  });
}

// The tooth artwork paints through CSS custom properties. jsdom does not
// resolve var(), so this is the only place the whole chain — the `.dark` rule,
// the token, the inline style on the path, the painted pixel — is exercised
// for real.
test("dark mode repaints the tooth artwork, not just the chrome", async ({ page }) => {
  await openChart(page);

  const lightEnamel = await paintedFill(page, "tooth-base");
  expect(lightEnamel.css, "light enamel should resolve to a concrete colour").toContain("rgb");

  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.getByRole("button", { name: "Light mode" })).toBeVisible();

  const darkEnamel = await paintedFill(page, "tooth-base");
  // The crown must actually darken — without the dark palette it would still
  // paint #ebebeb and glare at ~15:1 against the dark page.
  expect(darkEnamel.lum, "the crown did not darken").toBeLessThan(lightEnamel.lum / 4);
  // …and it must stay close to the page, the way it is in light mode: a tooth
  // is read from its outline and internal structure, not from background
  // contrast. Page background in dark mode is #0f172a (luminance ≈ 0.011).
  const pageLum = 0.011;
  const ratio = (Math.max(darkEnamel.lum, pageLum) + 0.05) / (Math.min(darkEnamel.lum, pageLum) + 0.05);
  expect(ratio, "the crown glares against the page").toBeLessThan(2.0);
});

/** Switch the chart to the generated `measured` anatomy and wait for it. */
async function useMeasuredAnatomy(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("tablist", { name: "Settings" }).getByRole("tab", { name: "Odontogram" }).click();
  await page.getByRole("combobox", { name: "Tooth anatomy" }).selectOption("measured");
  await page.keyboard.press("Escape");
  await expect(page.locator("#toothGrid")).toHaveAttribute("data-anatomy", "measured");
}

// The dentin core is the only layer painted through a NESTED token:
//   fill: var(--odon-tooth-dentin, var(--odon-tooth-body, #ebebeb))
// jsdom does not resolve var() at all, so the unit tests can only check the
// string. Whether a browser walks that chain — and therefore whether the core
// is invisible until it is asked for — can only be measured here.
test("the dentin core follows the crown until a theme sets it", async ({ page }) => {
  await openChart(page);
  await useMeasuredAnatomy(page);

  const body = await paintedFill(page, "tooth-base");
  const core = await paintedFill(page, "tooth-base-dentin");
  expect(core.css, "the core must take the crown's colour while unset").toBe(body.css);

  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.getByRole("button", { name: "Light mode" })).toBeVisible();

  const darkBody = await paintedFill(page, "tooth-base");
  const darkCore = await paintedFill(page, "tooth-base-dentin");
  expect(darkCore.css, "dark mode must not open a boundary light mode does not have").toBe(darkBody.css);
  expect(darkBody.lum, "the crown did not darken").toBeLessThan(body.lum / 4);

  // Ask for the boundary, and only then does it appear.
  await page.evaluate(() => document.documentElement.style.setProperty("--odon-tooth-dentin", "#8a6b45"));
  const themed = await paintedFill(page, "tooth-base-dentin");
  expect(themed.css).toBe("rgb(138, 107, 69)");
  expect((await paintedFill(page, "tooth-base")).css, "the crown must not follow the core").toBe(darkBody.css);
});
