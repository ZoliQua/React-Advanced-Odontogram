// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3a Task 1: split the single composite perio-arch SVG into two
// INDEPENDENT SVGs (buccal aspect, palatal/lingual aspect), each uniformly
// oriented across BOTH arches — the #1 fix over the legacy `buildArchGraphic`
// (whose `archOrientTransform` flips ONLY the upper arch's buccal row
// crown-down, leaving the lower arch crown-up: two DIFFERENT transforms for
// the same "buccal" aspect).
//
// Same sync-core-against-a-hand-built-cache technique as
// perio-graphic-toothrow.test.ts (readFileSync + DOMParser on the real SVG
// asset text) — no fetch(), the live odontogram tiles are never touched
// (parity-safe by construction). Structural tests only — visual correctness
// is a browser check (see task-1-report.md).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  archToothLayout,
  type TemplateDocCache,
  type TemplateNo,
} from "../perioGraphic";

const testFileUrl = import.meta.url;
const svgText = (tplNo: TemplateNo) =>
  readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${tplNo}.svg`, testFileUrl)), "utf8");

const TEMPLATE_NOS: readonly TemplateNo[] = [11, 13, 14, 16];

function buildCache(): TemplateDocCache {
  const cache: TemplateDocCache = new Map();
  for (const tplNo of TEMPLATE_NOS) {
    cache.set(tplNo, new DOMParser().parseFromString(svgText(tplNo), "image/svg+xml"));
  }
  return cache;
}

const UPPER_ARCH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

describe("buildBuccalArchSvg", () => {
  const cache = buildCache();

  it("returns a standalone <svg> with a tooth <g> for every tooth, in FDI order", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    expect(svg.tagName.toLowerCase()).toBe("svg");
    const row = svg.querySelector(".perio-tooth-row-buccal")!;
    expect(row).toBeTruthy();
    const toothEls = Array.from(row.querySelectorAll("[data-tooth]"));
    expect(toothEls.map((el) => el.getAttribute("data-tooth"))).toEqual(UPPER_ARCH.map(String));
  });

  it("every rendered tooth carries the tooth-base geometry", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    const row = svg.querySelector(".perio-tooth-row-buccal")!;
    for (const toothNo of UPPER_ARCH) {
      const toothEl = row.querySelector(`[data-tooth="${toothNo}"]`);
      expect(toothEl, `tooth ${toothNo}`).toBeTruthy();
      const ids = Array.from(toothEl!.querySelectorAll("[id]")).map((el) => el.getAttribute("id"));
      expect(ids, `tooth ${toothNo}`).toContain("tooth-base");
    }
  });

  it("places each tooth <g> at the SAME x as archToothLayout (shared columns)", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    const row = svg.querySelector(".perio-tooth-row-buccal")!;
    const layout = archToothLayout(cache, UPPER_ARCH);
    for (const { toothNo, x } of layout.teeth) {
      const toothEl = row.querySelector(`[data-tooth="${toothNo}"]`)!;
      const transform = toothEl.getAttribute("transform") || "";
      const m = transform.match(/translate\(([-0-9.]+) /);
      expect(m, `tooth ${toothNo} transform: ${transform}`).toBeTruthy();
      expect(Number(m![1])).toBeCloseTo(x, 5);
    }
  });

  it("KEY #1 FIX: the orientation transform is IDENTICAL for an upper-arch teeth array and a lower-arch teeth array", () => {
    const upperRow = buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    const lowerRow = buildBuccalArchSvg(cache, LOWER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    const upperTransform = upperRow.getAttribute("transform") || "";
    const lowerTransform = lowerRow.getAttribute("transform") || "";
    expect(upperTransform).toBeTruthy();
    expect(upperTransform).toBe(lowerTransform);
  });

  it("orients crown-DOWN: a vertical flip about the CEJ baseline (matrix(1 0 0 -1 0 80))", () => {
    const row = buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    expect(row.getAttribute("transform") || "").toMatch(/matrix\(1 0 0 -1 0 80\)/);
  });

  it("is marked aria-hidden — purely decorative", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("sets NO fixed width/height (responsive, fills its container)", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    expect(svg.getAttribute("width")).toBeNull();
    expect(svg.getAttribute("height")).toBeNull();
    expect(svg.getAttribute("viewBox")).toBeTruthy();
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMinYMid meet");
  });

  it("carries its own mm-grid, counter-flipped so labels read upright", () => {
    const row = buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    const grid = row.querySelector(":scope > .perio-mm-grid");
    expect(grid).toBeTruthy();
    expect(row.firstElementChild).toBe(grid);
    expect(grid!.querySelector("text.perio-mm-label[transform]")).toBeTruthy();
  });
});

describe("buildPalatalArchSvg", () => {
  const cache = buildCache();

  it("returns a standalone <svg> with a tooth <g> for every tooth, in FDI order", () => {
    const svg = buildPalatalArchSvg(cache, UPPER_ARCH);
    expect(svg.tagName.toLowerCase()).toBe("svg");
    const row = svg.querySelector(".perio-tooth-row-palatal-inner")!;
    expect(row).toBeTruthy();
    const toothEls = Array.from(row.querySelectorAll("[data-tooth]"));
    expect(toothEls.map((el) => el.getAttribute("data-tooth"))).toEqual(UPPER_ARCH.map(String));
  });

  it("places each tooth <g> at the SAME x as archToothLayout (shared columns)", () => {
    const svg = buildPalatalArchSvg(cache, UPPER_ARCH);
    const row = svg.querySelector(".perio-tooth-row-palatal-inner")!;
    const layout = archToothLayout(cache, UPPER_ARCH);
    for (const { toothNo, x } of layout.teeth) {
      const toothEl = row.querySelector(`[data-tooth="${toothNo}"]`)!;
      const transform = toothEl.getAttribute("transform") || "";
      const m = transform.match(/translate\(([-0-9.]+) /);
      expect(m, `tooth ${toothNo} transform: ${transform}`).toBeTruthy();
      expect(Number(m![1])).toBeCloseTo(x, 5);
    }
  });

  it("KEY #1 FIX (ditto palatal): the orientation is IDENTICAL for an upper-arch teeth array and a lower-arch teeth array", () => {
    const upperRow = buildPalatalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-palatal-inner")!;
    const lowerRow = buildPalatalArchSvg(cache, LOWER_ARCH).querySelector(".perio-tooth-row-palatal-inner")!;
    expect(upperRow.getAttribute("transform")).toBe(lowerRow.getAttribute("transform"));
  });

  it("orients crown-UP: NO orientation transform (the mirror of buccal's flip about the same axis cancels to identity)", () => {
    const row = buildPalatalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-palatal-inner")!;
    expect(row.getAttribute("transform")).toBeNull();
  });

  it("is marked aria-hidden — purely decorative", () => {
    const svg = buildPalatalArchSvg(cache, UPPER_ARCH);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("sets NO fixed width/height (responsive, fills its container)", () => {
    const svg = buildPalatalArchSvg(cache, UPPER_ARCH);
    expect(svg.getAttribute("width")).toBeNull();
    expect(svg.getAttribute("height")).toBeNull();
    expect(svg.getAttribute("viewBox")).toBeTruthy();
  });

  it("carries its own mm-grid, NOT counter-flipped (this row is never net-flipped)", () => {
    const row = buildPalatalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-palatal-inner")!;
    const grid = row.querySelector(":scope > .perio-mm-grid");
    expect(grid).toBeTruthy();
    expect(row.firstElementChild).toBe(grid);
    expect(grid!.querySelector("text.perio-mm-label[transform]")).toBeNull();
  });
});

describe("buccal + palatal SVGs share the SAME per-tooth x-columns", () => {
  const cache = buildCache();

  it("both arches: buccal and palatal x-columns match each other and archToothLayout", () => {
    for (const teeth of [UPPER_ARCH, LOWER_ARCH]) {
      const layout = archToothLayout(cache, teeth);
      const buccalRow = buildBuccalArchSvg(cache, teeth).querySelector(".perio-tooth-row-buccal")!;
      const palatalRow = buildPalatalArchSvg(cache, teeth).querySelector(".perio-tooth-row-palatal-inner")!;
      for (const { toothNo, x } of layout.teeth) {
        const bx = Number(
          (buccalRow.querySelector(`[data-tooth="${toothNo}"]`)!.getAttribute("transform") || "").match(
            /translate\(([-0-9.]+) /,
          )![1],
        );
        const px = Number(
          (palatalRow.querySelector(`[data-tooth="${toothNo}"]`)!.getAttribute("transform") || "").match(
            /translate\(([-0-9.]+) /,
          )![1],
        );
        expect(bx, `tooth ${toothNo} buccal x`).toBeCloseTo(x, 5);
        expect(px, `tooth ${toothNo} palatal x`).toBeCloseTo(x, 5);
        expect(bx).toBeCloseTo(px, 5);
      }
    }
  });
});
