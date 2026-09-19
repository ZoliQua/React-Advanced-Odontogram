// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Perio graphical polish (PG-A), Task 3: an IMPLANT tooth in the graphical
// Dental Chart renders the template's implant fixture artwork (`#implant-base`)
// instead of the natural `#tooth-base`, aligned on the SAME row baseline as its
// natural neighbours (the implant neck/platform sits on the CEJ line).
//
// Structural / read-only tests only (visual correctness is confirmed in a
// browser — see .superpowers/sdd/task-3-implant-report.md). Same sync-core
// approach as perio-graphic-toothrow.test.ts: build a template-doc cache from
// the real SVG asset text via `readFileSync` + `DOMParser` (no `fetch`, never
// touches the live odontogram tiles — parity-safe by construction).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  getToothBaseGroupFromCache,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  CEJ_Y,
  IMPLANT_CEJ_Y,
  ROW_BASELINE_Y,
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

// tooth -> its FDI template number, for the sample teeth exercised below.
const TPL_OF: Record<number, TemplateNo> = { 11: 11, 13: 13, 14: 14, 15: 14, 16: 16, 21: 11, 23: 13, 26: 16, 45: 14, 46: 16 };

function ids(group: Element): (string | null)[] {
  return Array.from(group.querySelectorAll("[id]")).map((el) => el.getAttribute("id"));
}

describe("getToothBaseGroupFromCache — implant tooth", () => {
  const cache = buildCache();
  const sample = [11, 13, 14, 16, 21, 23, 26, 46];

  it("an implant renders #implant-base and NOT #tooth-base", () => {
    for (const toothNo of sample) {
      const group = getToothBaseGroupFromCache(cache, toothNo, { implant: true });
      const gIds = ids(group);
      expect(gIds, `implant tooth ${toothNo}`).toContain("implant-base");
      expect(gIds, `implant tooth ${toothNo} must not carry tooth-base`).not.toContain("tooth-base");
      expect(group.getAttribute("data-implant"), `implant tooth ${toothNo}`).toBe("1");
    }
  });

  it("a natural tooth still renders #tooth-base and NOT #implant-base (unchanged)", () => {
    for (const toothNo of sample) {
      const group = getToothBaseGroupFromCache(cache, toothNo);
      const gIds = ids(group);
      expect(gIds, `natural tooth ${toothNo}`).toContain("tooth-base");
      expect(gIds, `natural tooth ${toothNo} must not carry implant-base`).not.toContain("implant-base");
      expect(group.getAttribute("data-implant"), `natural tooth ${toothNo}`).toBeNull();
    }
  });

  it("the default (2-arg) call is byte-identical to an explicit non-implant call", () => {
    for (const toothNo of sample) {
      const dflt = getToothBaseGroupFromCache(cache, toothNo);
      const explicitNat = getToothBaseGroupFromCache(cache, toothNo, { implant: false });
      expect(explicitNat.outerHTML, `tooth ${toothNo}`).toBe(dflt.outerHTML);
    }
  });

  it("the implant fixture's fills clone cleanly — every referenced gradient is present in defs (never renders black)", () => {
    for (const toothNo of sample) {
      const group = getToothBaseGroupFromCache(cache, toothNo, { implant: true });
      const defsIds = new Set(
        Array.from(group.querySelectorAll("defs [id]")).map((el) => el.getAttribute("id")),
      );
      // Scan every element's fill/style for a url(#id) reference and require the
      // referenced gradient to have been cloned into this group's own <defs>.
      for (const el of Array.from(group.querySelectorAll("*"))) {
        const src = `${el.getAttribute("fill") || ""} ${el.getAttribute("style") || ""}`;
        const m = src.match(/url\(#([^)]+)\)/);
        if (m) {
          expect(defsIds, `implant tooth ${toothNo} gradient ${m[1]}`).toContain(m[1]);
        }
      }
    }
  });

  it("a position-3 implant (13) anchors its size transform at the IMPLANT platform anchor, not the natural CEJ", () => {
    const group = getToothBaseGroupFromCache(cache, 13, { implant: true });
    const sizeNode = group.querySelector('[data-perio-size^="position-3"]');
    expect(sizeNode).toBeTruthy();
    const m = (sizeNode!.getAttribute("transform") || "").match(/matrix\(1 0 0 ([0-9.]+) 0 (-?[0-9.]+)\)/);
    expect(m).toBeTruthy();
    const k = Number(m![1]);
    const f = Number(m![2]);
    // Fixed point of the anchored scale is the implant platform anchor.
    expect(f).toBeCloseTo(IMPLANT_CEJ_Y[13] * (1 - k), 5);
  });
});

// Parse the `translate(x y)` a tooth group carries in the buccal row.
function translateOf(group: Element): { x: number; y: number } {
  const m = (group.getAttribute("transform") || "").match(/translate\((-?[0-9.]+) (-?[0-9.]+)\)/);
  if (!m) throw new Error(`no translate on ${group.getAttribute("data-tooth")}`);
  return { x: Number(m[1]), y: Number(m[2]) };
}

// UI-3a Task 2: `buildArchGraphic` (the legacy combined single-SVG builder)
// has been removed — migrated to `buildBuccalArchSvg`/`buildPalatalArchSvg`.
describe("buildBuccalArchSvg / buildPalatalArchSvg — implant teeth align on the common CEJ baseline", () => {
  const cache = buildCache();
  // Make tooth 16 (upper) and 46 (lower) implants; everything else natural.
  const implantSet = new Set([16, 46]);
  const isImplant = (n: number) => implantSet.has(n);

  it("marks only the implant teeth with #implant-base; natural neighbours keep #tooth-base", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH, isImplant);
    const buccal = svg.querySelector(".perio-tooth-row-buccal")!;
    const implant16 = buccal.querySelector('[data-tooth="16"]')!;
    const natural15 = buccal.querySelector('[data-tooth="15"]')!;
    expect(ids(implant16)).toContain("implant-base");
    expect(ids(implant16)).not.toContain("tooth-base");
    expect(implant16.getAttribute("data-implant")).toBe("1");
    expect(ids(natural15)).toContain("tooth-base");
    expect(ids(natural15)).not.toContain("implant-base");
    expect(natural15.getAttribute("data-implant")).toBeNull();
  });

  it("the palatal SVG carries the implant fixture too (independently built, same implant predicate)", () => {
    const svg = buildPalatalArchSvg(cache, UPPER_ARCH, isImplant);
    const palatal = svg.querySelector(".perio-tooth-row-palatal-inner")!;
    const implant16 = palatal.querySelector('[data-tooth="16"]')!;
    expect(ids(implant16)).toContain("implant-base");
    expect(implant16.getAttribute("data-implant")).toBe("1");
  });

  it("an implant's platform and a natural tooth's CEJ both land on the SAME ROW_BASELINE_Y", () => {
    for (const [arch, implantTooth, naturalTooth] of [
      [UPPER_ARCH, 16, 15],
      [LOWER_ARCH, 46, 45],
    ] as const) {
      const svg = buildBuccalArchSvg(cache, arch, isImplant);
      const buccal = svg.querySelector(".perio-tooth-row-buccal")!;

      const implantGroup = buccal.querySelector(`[data-tooth="${implantTooth}"]`)!;
      const implantY = translateOf(implantGroup).y;
      // translateY moves the local anchor onto ROW_BASELINE_Y, so translateY +
      // anchor === ROW_BASELINE_Y for the implant (anchor = IMPLANT_CEJ_Y).
      expect(implantY + IMPLANT_CEJ_Y[TPL_OF[implantTooth]], `implant ${implantTooth}`).toBeCloseTo(
        ROW_BASELINE_Y,
        5,
      );

      const naturalGroup = buccal.querySelector(`[data-tooth="${naturalTooth}"]`)!;
      const naturalY = translateOf(naturalGroup).y;
      expect(naturalY + CEJ_Y[TPL_OF[naturalTooth]], `natural ${naturalTooth}`).toBeCloseTo(
        ROW_BASELINE_Y,
        5,
      );
    }
  });

  it("with the default predicate (no implants) the arch is byte-identical to the pre-implant build (no #implant-base, no data-implant)", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    expect(svg.querySelectorAll("[data-implant]").length).toBe(0);
    expect(ids(svg)).not.toContain("implant-base");
    // every tooth group carries the natural tooth-base
    const buccal = svg.querySelector(".perio-tooth-row-buccal")!;
    for (const toothNo of UPPER_ARCH) {
      const g = buccal.querySelector(`[data-tooth="${toothNo}"]`);
      if (g) expect(ids(g), `tooth ${toothNo}`).toContain("tooth-base");
    }
  });
});
