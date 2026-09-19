// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal "Dental Chart" polish, Task 1: occlusal-to-occlusal arch
// orientation + browser-responsive sizing + tighter/bigger teeth. Structural
// tests only — visual correctness (arches face occlusal-to-occlusal, the
// diagram resizes with the window, the curve tracks the teeth with deep
// pockets toward the root) is a browser check, see task-1-report.md.
//
// Same sync-core-against-a-hand-built-cache technique as
// perio-graphic-toothrow.test.ts (readFileSync + DOMParser on the real SVG
// asset text) — no fetch(), the live odontogram tiles are never touched.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  TOOTH_GAP,
  PERIO_DISPLAY_SCALE,
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

// UI-3a Task 2: `buildArchGraphic`'s old per-arch-CONDITIONAL orientation
// (upper flips crown-down, lower stays crown-up — "arch-aware") was
// literally the opposite of what UI-3a Task 1 introduced: `buildBuccalArchSvg`/
// `buildPalatalArchSvg` orient UNIFORMLY across BOTH arches (buccal always
// crown-down, palatal always crown-up). Migrated to assert the new uniform
// contract instead of the retired per-arch one; full coverage of the split
// builders lives in `ui3a-arch-split.test.ts`.
describe("Task 1 (superseded by UI-3a): occlusal-to-occlusal orientation is now UNIFORM across arches", () => {
  const cache = buildCache();

  it("the buccal row renders crown-DOWN (flipped about the CEJ baseline) for BOTH arches", () => {
    for (const arch of [UPPER_ARCH, LOWER_ARCH]) {
      const svg = buildBuccalArchSvg(cache, arch);
      const buccal = svg.querySelector(".perio-tooth-row-buccal")!;
      // matrix(1 0 0 -1 0 80) == scale(1,-1) about y = ROW_BASELINE_Y (40): the
      // buccal row flips crown-down while the CEJ baseline stays put, so both
      // arches' occlusal edges face the mid-line between them.
      expect(buccal.getAttribute("transform") || "").toMatch(/matrix\(1 0 0 -1 0 80\)/);
    }
  });

  it("the palatal row renders crown-UP (no orientation flip) for BOTH arches", () => {
    for (const arch of [UPPER_ARCH, LOWER_ARCH]) {
      const svg = buildPalatalArchSvg(cache, arch);
      const palatal = svg.querySelector(".perio-tooth-row-palatal-inner")!;
      expect(palatal.getAttribute("transform")).toBeNull();
    }
  });

  it("the two arches carry the SAME buccal-row orientation transform (uniform, not arch-aware)", () => {
    const upper = buildBuccalArchSvg(cache, UPPER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    const lower = buildBuccalArchSvg(cache, LOWER_ARCH).querySelector(".perio-tooth-row-buccal")!;
    expect(upper.getAttribute("transform")).toBe(lower.getAttribute("transform"));
  });
});

describe("Task 1: browser-responsive SVG (no pinned intrinsic size)", () => {
  const cache = buildCache();

  it("neither arch SVG sets a fixed width/height (so CSS width:100% can scale it)", () => {
    for (const svg of [buildBuccalArchSvg(cache, UPPER_ARCH), buildPalatalArchSvg(cache, UPPER_ARCH)]) {
      expect(svg.getAttribute("width")).toBeNull();
      expect(svg.getAttribute("height")).toBeNull();
    }
  });

  it("keeps the viewBox + preserveAspectRatio so the aspect ratio is preserved when scaled", () => {
    for (const svg of [buildBuccalArchSvg(cache, UPPER_ARCH), buildPalatalArchSvg(cache, UPPER_ARCH)]) {
      expect(svg.getAttribute("viewBox")).toBeTruthy();
      expect(svg.getAttribute("preserveAspectRatio")).toBe("xMinYMid meet");
    }
  });
});

describe("Task 1: tighter + bigger teeth", () => {
  it("TOOTH_GAP is tightened to 2 (denser row)", () => {
    expect(TOOTH_GAP).toBe(2);
  });

  it("PERIO_DISPLAY_SCALE bumps the per-unit display scale above 1 (bigger teeth)", () => {
    expect(PERIO_DISPLAY_SCALE).toBeGreaterThan(1);
  });
});
