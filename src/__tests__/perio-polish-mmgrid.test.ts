// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal "Dental Chart" polish, Task 2: a numbered millimetre guide grid
// drawn BEHIND the tooth artwork + curve. Faint horizontal lines every 1 mm
// below the CEJ baseline toward the root (spacing = PERIO_MM_PX), every 5th
// line emphasized + numbered ("5"/"10"/"15"); the grid is decorative
// (aria-hidden). It must ride the SAME oriented/mirrored coordinate space as
// the teeth + curve (T1 orientation) so a line at "n mm from the CEJ" lands
// exactly where an n-mm pocket's curve point lands.
//
// Structural tests only — visual alignment (lines horizontal, on the CEJ +
// curve, labels reading correctly on BOTH arches) is a browser check, see
// task-2-report.md. Same sync-core-against-a-hand-built-cache technique as
// perio-graphic-toothrow.test.ts / perio-polish-layout.test.ts (readFileSync +
// DOMParser on the real SVG asset text) — no fetch(), the live odontogram
// tiles are never touched (parity-safe by construction).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  buildMmGridLayer,
  buildBuccalArchSvg,
  buildPalatalArchSvg,
  perioCurve,
  PERIO_MM_PX,
  PERIO_MM_GRID_MAX,
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

const CEJ_Y = 40;
const MMPX = 3;
const WIDTH = 200;

describe("buildMmGridLayer (pure DOM guide grid)", () => {
  it("draws one horizontal line per mm below the CEJ, at cejY + n*mmPx", () => {
    const g = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH });
    const lines = Array.from(g.querySelectorAll("line"));
    expect(lines.length).toBe(PERIO_MM_GRID_MAX);
    for (let n = 1; n <= PERIO_MM_GRID_MAX; n++) {
      const line = g.querySelector(`line[data-mm="${n}"]`)!;
      expect(line, `mm line ${n}`).toBeTruthy();
      const y = cejForLine(line);
      expect(y).toBeCloseTo(CEJ_Y + n * MMPX, 5);
      // spans the full row width
      expect(line.getAttribute("x1")).toBe("0");
      expect(Number(line.getAttribute("x2"))).toBeCloseTo(WIDTH, 5);
    }
  });

  it("all mm lines sit on the ROOT side of the CEJ (y > cejY)", () => {
    const g = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH });
    for (const line of Array.from(g.querySelectorAll("line"))) {
      expect(cejForLine(line)).toBeGreaterThan(CEJ_Y);
    }
  });

  it("emphasizes every 5th line (major) and leaves the rest minor", () => {
    const g = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH });
    const majors = Array.from(g.querySelectorAll("line.perio-mm-line-major"));
    const minors = Array.from(g.querySelectorAll("line.perio-mm-line-minor"));
    expect(majors.map((l) => Number(l.getAttribute("data-mm"))).sort((a, b) => a - b)).toEqual([5, 10, 15]);
    expect(minors.length).toBe(PERIO_MM_GRID_MAX - majors.length);
    // no line is both
    for (const l of majors) expect(l.classList.contains("perio-mm-line-minor")).toBe(false);
  });

  it("numbers each 5-mm line with its mm value at that line's y", () => {
    const g = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH });
    const labels = Array.from(g.querySelectorAll("text.perio-mm-label"));
    expect(labels.map((t) => t.textContent).sort()).toEqual(["10", "15", "5"]);
    for (const n of [5, 10, 15]) {
      const label = g.querySelector(`text.perio-mm-label[data-mm="${n}"]`)!;
      expect(label.textContent).toBe(String(n));
    }
  });

  it("marks the whole grid group decorative (aria-hidden) so a screen reader ignores it", () => {
    const g = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH });
    expect(g.getAttribute("class") || "").toMatch(/perio-mm-grid/);
    expect(g.getAttribute("aria-hidden")).toBe("true");
  });

  it("counter-flips the numeric labels when the parent row is vertically flipped (so they read upright)", () => {
    const flat = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH, flip: false });
    for (const t of Array.from(flat.querySelectorAll("text.perio-mm-label"))) {
      expect(t.getAttribute("transform")).toBeNull();
    }
    const flipped = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH, flip: true });
    for (const t of Array.from(flipped.querySelectorAll("text.perio-mm-label"))) {
      const n = Number(t.getAttribute("data-mm"));
      // matrix(1 0 0 -1 0 2y): vertical flip about the label's own baseline y,
      // undoing the parent flip so the digits render upright.
      expect(t.getAttribute("transform") || "").toMatch(
        new RegExp(`matrix\\(1 0 0 -1 0 ${2 * (CEJ_Y + n * MMPX)}\\)`),
      );
    }
  });

  it("a line at n mm lands exactly where an n-mm (gm=0) pocket's curve point lands (shared geometry)", () => {
    const g = buildMmGridLayer({ cejY: CEJ_Y, mmPx: MMPX, width: WIDTH });
    const line5 = g.querySelector(`line[data-mm="5"]`)!;
    const curve = perioCurve([{ site: "B", pd: 5, gm: 0 }], { cejY: CEJ_Y, mmPx: MMPX, siteX: () => 10 });
    expect(cejForLine(line5)).toBeCloseTo(curve.pocketPts[0]!.y, 5);
  });
});

// UI-3a Task 2: `buildArchGraphic` (the legacy combined single-SVG builder)
// has been removed — migrated to `buildBuccalArchSvg`/`buildPalatalArchSvg`,
// asserting the new UNIFORM orientation contract (buccal always net-flipped,
// palatal never net-flipped, for BOTH arches) instead of the retired
// per-arch-conditional one.
describe("buildBuccalArchSvg / buildPalatalArchSvg: the mm grid rides the T1 oriented coordinate space", () => {
  const cache = buildCache();

  it("appends an mm grid BEHIND the teeth in BOTH the buccal and palatal SVGs", () => {
    for (const arch of [UPPER_ARCH, LOWER_ARCH]) {
      const cases: Array<[SVGSVGElement, string]> = [
        [buildBuccalArchSvg(cache, arch), ".perio-tooth-row-buccal"],
        [buildPalatalArchSvg(cache, arch), ".perio-tooth-row-palatal-inner"],
      ];
      for (const [svg, rowClass] of cases) {
        const row = svg.querySelector(rowClass)!;
        const grid = row.querySelector(":scope > .perio-mm-grid");
        expect(grid, `${rowClass} mm grid`).toBeTruthy();
        // behind: the grid is the FIRST child (drawn before the tooth groups)
        expect(row.firstElementChild).toBe(grid);
        // and it precedes every tooth group in document order
        const firstTooth = row.querySelector("[data-tooth]")!;
        expect(grid!.compareDocumentPosition(firstTooth) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    }
  });

  it("uses the shared layout baseline (ROW_BASELINE_Y) + PERIO_MM_PX, so it aligns with teeth/curve", () => {
    const svg = buildBuccalArchSvg(cache, UPPER_ARCH);
    const grid = svg.querySelector(".perio-tooth-row-buccal > .perio-mm-grid")!;
    const line5 = grid.querySelector(`line[data-mm="5"]`)!;
    expect(cejForLine(line5)).toBeCloseTo(ROW_BASELINE_Y + 5 * PERIO_MM_PX, 5);
  });

  it("flips the buccal-row labels for BOTH arches (uniform crown-down); never flips the palatal-row labels (uniform crown-up)", () => {
    for (const arch of [UPPER_ARCH, LOWER_ARCH]) {
      const buccalGrid = buildBuccalArchSvg(cache, arch).querySelector(".perio-tooth-row-buccal > .perio-mm-grid")!;
      expect(buccalGrid.querySelector("text.perio-mm-label[transform]"), `buccal ${arch === UPPER_ARCH ? "upper" : "lower"}`).toBeTruthy();
      const palatalGrid = buildPalatalArchSvg(cache, arch).querySelector(
        ".perio-tooth-row-palatal-inner > .perio-mm-grid",
      )!;
      expect(palatalGrid.querySelector("text.perio-mm-label[transform]"), `palatal ${arch === UPPER_ARCH ? "upper" : "lower"}`).toBeNull();
    }
  });
});

/** Read a horizontal line's y (y1 == y2). */
function cejForLine(line: Element): number {
  const y1 = Number(line.getAttribute("y1"));
  const y2 = Number(line.getAttribute("y2"));
  expect(y1).toBeCloseTo(y2, 5); // it is horizontal
  return y1;
}
