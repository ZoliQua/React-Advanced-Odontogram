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

/** The painted fill of a layer inside a tooth's tile, as rgb(). */
async function paintedFill(
  page: import("@playwright/test").Page,
  layerId: string,
  tile = '.tooth-tile.side-view[data-tooth="11"]',
) {
  const el = page.locator(`${tile} [id="${layerId}"]`).first();
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

// A gradient stop carries its colour as a presentation attribute rather than a
// style declaration, which is how the occlusal crown escaped the first
// tokenization pass: every occlusal tile kept a near-white field in dark mode
// while the side views darkened. The unit tests can read the asset and the CSS
// block, but only a browser resolves a gradient stop's token and paints it.
test("dark mode darkens the occlusal crown too, not only the side views", async ({ page }) => {
  await openChart(page);
  await useMeasuredAnatomy(page);
  const OCCL = '.tooth-tile.occl-view[data-tooth="16"]';

  const light = await paintedFill(page, "background-cusp", OCCL);
  await page.getByRole("button", { name: "Dark mode" }).click();
  await expect(page.getByRole("button", { name: "Light mode" })).toBeVisible();
  const dark = await paintedFill(page, "background-cusp", OCCL);

  // A gradient fill reports as url(#…), so the fill string cannot be measured
  // the way a flat one can. Follow the reference the crown itself carries
  // rather than taking the tile's first <stop> — a tile holds the restoration
  // and implant gradients too, and any of those could come first.
  const stop = await page.locator(`${OCCL} [id="background-cusp"]`).first().evaluate((node) => {
    const id = /url\(["']?#([^"')]+)/.exec(getComputedStyle(node).fill)?.[1];
    const root = node.closest("svg");
    const first = id && root ? root.querySelector(`#${CSS.escape(id)} stop`) : null;
    if (!first) return "";
    return getComputedStyle(first).getPropertyValue("stop-color").trim()
      || first.getAttribute("stop-color") || "";
  });
  expect(stop, "the crown's own stop resolves to a concrete colour").toMatch(/rgb|#/);
  const [r, g, b] = (stop.match(/[\d.]+/g) ?? ["255", "255", "255"]).map(Number);
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const lum = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  const pageLum = 0.011;
  const ratio = (Math.max(lum, pageLum) + 0.05) / (Math.min(lum, pageLum) + 0.05);
  expect(ratio, "the occlusal crown glares against the dark page").toBeLessThan(2.0);
  // Still the same gradient reference in both modes — the colour moved, the
  // artwork did not.
  expect(light.css, "the occlusal crown is gradient-filled in both modes").toBe(dark.css);
  expect(light.css).toMatch(/^url\(/);
});

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

// The two tokens added for issues #39 and #40 both make a claim jsdom cannot
// check. `--odon-tooth-outline-width` drives a NON-colour property through a
// custom property, and `--odon-implant-fill` relies on each shape falling back
// to its OWN literal — so unset, the fixture must still be shaded, and set, it
// must go flat in one step. Only a browser resolves either.

/** The computed value of one property on a layer inside a tooth's tile. */
async function painted(
  page: import("@playwright/test").Page,
  layerId: string,
  prop: string,
  tile = '.tooth-tile.side-view[data-tooth="11"]',
) {
  return page.locator(`${tile} [id="${layerId}"]`).first()
    .evaluate((node, p) => getComputedStyle(node).getPropertyValue(p), prop);
}

test("the contour width is one width across every state of the silhouette", async ({ page }) => {
  await openChart(page);
  await useMeasuredAnatomy(page);

  // The drawings declare no stroke-width, so the browser strokes at the SVG
  // initial value — which it reports normalised, as `1px`.
  expect(await painted(page, "tooth-base", "stroke-width"), "an unthemed contour is not the SVG default")
    .toBe("1px");

  await page.evaluate(() => document.documentElement.style.setProperty("--odon-tooth-outline-width", "1.4"));

  // Every silhouette state follows, which is the whole point: the contour must
  // not change thickness when the tooth is charted as a radix or a fracture.
  for (const layer of ["tooth-base", "tooth-radix", "tooth-crownprep", "tooth-under-gum",
                       "tooth-broken-mesial", "tooth-broken-distal"]) {
    expect(await painted(page, layer, "stroke-width"), `#${layer} did not follow the token`).toBe("1.4px");
  }

  // The occlusal projection follows too. Its silhouette is drawn as
  // `background-cusp`, and the occlusal tiles sit in the same grid as the side
  // views — so if it did not, one row of the chart would stay a hairline
  // beside the other.
  const occl = '.tooth-tile.occl-view[data-tooth="16"]';
  const cusp = page.locator(`${occl} [id="background-cusp"]`).first();
  expect(await cusp.evaluate((n) => getComputedStyle(n).strokeWidth),
    "the occlusal silhouette stayed a hairline beside the side views").toBe("1.4px");

  // …and the decoration deliberately left out of it does not. The groove is
  // INSIDE that silhouette, so this is also the proof that the width did not
  // land on the group and inherit down. Neither locator is guarded by a
  // `count()` check: a guard would turn a missing layer into a silent pass,
  // and that is the whole thing being asserted.
  const fissure = page.locator(`${occl} [id="fissure"]`).first();
  expect(await fissure.evaluate((n) => getComputedStyle(n).strokeWidth),
    "a groove followed the contour width").toBe("1px");
});

test("the implant fixture is shaded until one token flattens it", async ({ page }) => {
  await openChart(page);
  await useMeasuredAnatomy(page);

  /** Every painted fill inside the fixture of tooth 11's tile. */
  const fixtureFills = () => page.locator('.tooth-tile.side-view[data-tooth="11"] [id="implant-base"]')
    .first()
    .evaluate((base) => Array.from(base.querySelectorAll("*"))
      .map((el) => getComputedStyle(el).fill)
      .filter((f) => f && f !== "none"));

  // Unset: each shape falls back to the grey it is drawn in, so the shading
  // survives. A shared default would have collapsed this to one value.
  const shaded = await fixtureFills();
  expect(shaded.length, "no fixture shapes found to measure").toBeGreaterThan(10);
  expect(new Set(shaded).size, "the fixture lost its shading with the token unset").toBeGreaterThan(10);

  // Set: the whole fixture goes flat in one step.
  await page.evaluate(() => document.documentElement.style.setProperty("--odon-implant-fill", "#8fa6b8"));
  const flat = await fixtureFills();
  expect(new Set(flat), "the fixture did not flatten to the one colour")
    .toEqual(new Set(["rgb(143, 166, 184)"]));
});
