// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc "Dental Chart" graphical redesign, Task 2: the tooth-row
// graphic — reuse the existing `tooth-base` artwork (read-only, structural
// tests only; visual correctness is confirmed in a browser, see
// .superpowers/sdd/task-2-report.md).
//
// These tests exercise the SYNC core (`getToothBaseGroupFromCache` /
// `buildBuccalArchSvg`/`buildPalatalArchSvg`) directly against a hand-built template-doc cache
// parsed from the real SVG asset text via DOMParser — the exact same
// `readFileSync` + `DOMParser().parseFromString(..., "image/svg+xml")`
// technique `parity.test.ts` already uses (see its `svgText` helper) — so no
// `fetch()` is needed and the live odontogram's `toothSvgRoot` tiles /
// `buildGrid()` fetch path is never touched (parity-safe by construction:
// this module only ever READS the template asset text into its OWN new DOM,
// same as `__renderActiveLayers` does).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  getToothBaseGroupFromCache,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  CEJ_Y,
  EXCLUDED_TOOTH_BASE_IDS,
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

describe("getToothBaseGroupFromCache", () => {
  const cache = buildCache();
  const sample = [11, 12, 13, 14, 16, 21, 22, 31, 33, 46];

  it("returns a group containing the tooth-base geometry and none of the excluded layers", () => {
    for (const toothNo of sample) {
      const group = getToothBaseGroupFromCache(cache, toothNo);
      const ids = Array.from(group.querySelectorAll("[id]")).map((el) => el.getAttribute("id"));
      expect(ids, `tooth ${toothNo}`).toContain("tooth-base");
      for (const excluded of EXCLUDED_TOOTH_BASE_IDS) {
        expect(ids, `tooth ${toothNo} must not include ${excluded}`).not.toContain(excluded);
      }
    }
  });

  it("clones any gradient <defs> the tooth-base subtree references (never renders black)", () => {
    for (const toothNo of sample) {
      const group = getToothBaseGroupFromCache(cache, toothNo);
      const toothBaseEl = group.querySelector("#tooth-base")!;
      expect(toothBaseEl).toBeTruthy();
      const fillSrc = `${toothBaseEl.getAttribute("fill") || ""} ${toothBaseEl.getAttribute("style") || ""}`;
      const ref = fillSrc.match(/url\(#([^)]+)\)/);
      if (ref) {
        const defsIds = Array.from(group.querySelectorAll("defs [id]")).map((el) => el.getAttribute("id"));
        expect(defsIds, `tooth ${toothNo} gradient ${ref[1]}`).toContain(ref[1]);
      }
      // else: this template's #tooth-base uses a flat fill (no gradient ref) —
      // nothing to clone; not a failure (verified true for all 4 current
      // templates, see task-2-report.md).
    }
  });

  it("a position-2 tooth (12) carries the 0.8 width transform", () => {
    const group = getToothBaseGroupFromCache(cache, 12);
    const sizeNode = group.querySelector('[data-perio-size^="position-2"]');
    expect(sizeNode).toBeTruthy();
    expect(sizeNode!.getAttribute("transform") || "").toMatch(/matrix\(0\.8 0 0 1 /);
  });

  it("a position-1 tooth (11, same template as 12) carries no size transform", () => {
    const group = getToothBaseGroupFromCache(cache, 11);
    expect(group.querySelector("[data-perio-size]")).toBeNull();
  });

  it("a position-3 tooth (13) carries the taller (root-elongation) transform, anchored (not shifting the CEJ)", () => {
    const group = getToothBaseGroupFromCache(cache, 13);
    const sizeNode = group.querySelector('[data-perio-size^="position-3"]');
    expect(sizeNode).toBeTruthy();
    const transform = sizeNode!.getAttribute("transform") || "";
    const m = transform.match(/matrix\(1 0 0 ([0-9.]+) 0 (-?[0-9.]+)\)/);
    expect(m, transform).toBeTruthy();
    const k = Number(m![1]);
    expect(k).toBeGreaterThan(1);
    // Anchored scale about CEJ_Y[13]: f = cejY*(1-k) must match exactly (the
    // fixed point of the transform stays at the CEJ, so row-baseline
    // alignment via CEJ_Y remains correct after this scale is applied).
    const f = Number(m![2]);
    expect(f).toBeCloseTo(CEJ_Y[13] * (1 - k), 5);
  });

  it("positions 4-8 (premolars/molars) carry no size transform", () => {
    for (const toothNo of [14, 15, 16, 17, 18]) {
      const group = getToothBaseGroupFromCache(cache, toothNo);
      expect(group.querySelector("[data-perio-size]"), `tooth ${toothNo}`).toBeNull();
    }
  });

  it("mirrors horizontally only for the mirrored side of the arch (21 vs 11)", () => {
    const left = getToothBaseGroupFromCache(cache, 11); // mirror:false
    const right = getToothBaseGroupFromCache(cache, 21); // mirror:true, same tpl(11)
    expect(left.querySelector('[data-perio-mirror="1"]')).toBeNull();
    const rightMirror = right.querySelector('[data-perio-mirror="1"]');
    expect(rightMirror).toBeTruthy();
    expect(rightMirror!.getAttribute("transform") || "").toMatch(/matrix\(-1 0 0 1 /);
  });

  it("throws for a tooth number absent from TOOTH_TEMPLATE", () => {
    expect(() => getToothBaseGroupFromCache(cache, 99)).toThrow();
  });

  it("throws if the requested template was not loaded into the cache", () => {
    const partial: TemplateDocCache = new Map([[11, cache.get(11)!]]);
    expect(() => getToothBaseGroupFromCache(partial, 13)).toThrow();
  });
});

describe("CEJ_Y anchors", () => {
  it("defines a positive numeric anchor for every template", () => {
    for (const tpl of TEMPLATE_NOS) {
      expect(typeof CEJ_Y[tpl], String(tpl)).toBe("number");
      expect(CEJ_Y[tpl], String(tpl)).toBeGreaterThan(0);
    }
  });
});

// UI-3a Task 2: `buildArchGraphic` (the legacy combined single-SVG builder)
// has been removed — `buildBuccalArchSvg`/`buildPalatalArchSvg` are now the
// only arch-artwork API (each independently viewBoxed, uniformly oriented
// across both arches). Full coverage of the uniform-orientation contract
// lives in `ui3a-arch-split.test.ts`; this suite keeps a few targeted
// regression checks migrated from the old `buildArchGraphic` describe block.
describe("buildBuccalArchSvg / buildPalatalArchSvg", () => {
  const cache = buildCache();

  it("renders all 16 upper teeth, in FDI order 18->11,21->28, in the buccal row", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    const buccal = svg.querySelector(".perio-tooth-row-buccal");
    expect(buccal).toBeTruthy();
    const toothEls = Array.from(buccal!.querySelectorAll("[data-tooth]"));
    expect(toothEls.map((el) => el.getAttribute("data-tooth"))).toEqual(UPPER_ARCH.map(String));
  });

  it("every rendered tooth carries the tooth-base geometry (buccal + palatal)", () => {
    const buccalSvg = buildBuccalArchSvg(cache, UPPER_ARCH);
    const buccal = buccalSvg.querySelector(".perio-tooth-row-buccal")!;
    const palatalSvg = buildPalatalArchSvg(cache, UPPER_ARCH);
    const palatal = palatalSvg.querySelector(".perio-tooth-row-palatal-inner")!;
    for (const row of [buccal, palatal]) {
      for (const toothNo of UPPER_ARCH) {
        const toothEl = row.querySelector(`[data-tooth="${toothNo}"]`);
        expect(toothEl, `tooth ${toothNo}`).toBeTruthy();
        const ids = Array.from(toothEl!.querySelectorAll("[id]")).map((el) => el.getAttribute("id"));
        expect(ids, `tooth ${toothNo}`).toContain("tooth-base");
      }
    }
  });

  it("the palatal SVG's teeth are the SAME teeth, same order, as the buccal SVG's (independent bands, same tooth set)", () => {
    const buccal = buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    const palatal = buildPalatalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-palatal-inner")!;
    const buccalTeeth = Array.from(buccal.querySelectorAll("[data-tooth]")).map((el) => el.getAttribute("data-tooth"));
    const palatalTeeth = Array.from(palatal.querySelectorAll("[data-tooth]")).map((el) => el.getAttribute("data-tooth"));
    expect(palatalTeeth).toEqual(buccalTeeth);
  });

  it("also renders the lower arch buccal row in FDI order 48->41,31->38", () => {
    const LOWER_ARCH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    const svg = buildBuccalArchSvg(cache, LOWER_ARCH);
    const buccal = svg.querySelector(".perio-tooth-row-buccal")!;
    const toothEls = Array.from(buccal.querySelectorAll("[data-tooth]"));
    expect(toothEls.map((el) => el.getAttribute("data-tooth"))).toEqual(LOWER_ARCH.map(String));
  });

  it("both SVGs are marked aria-hidden — purely decorative, the accessible data lives in the number cells/summary", () => {
    for (const svg of [buildBuccalArchSvg(cache, UPPER_ARCH), buildPalatalArchSvg(cache, UPPER_ARCH)]) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
      // No nameless role="img" left for axe-core to flag either.
      expect(svg.getAttribute("role")).toBeNull();
    }
  });
});
