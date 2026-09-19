// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP5 Task 5: caries-granularity settings (modes) + the per-tooth/per-surface
// caries authoring builders and surface-write helpers. No full-DOM harness
// exists for the tooth panel, so — as prior SP tasks did — these tests target
// the pure option/collapse builders, the extracted surface-write helpers, and
// the two render/indicator gates (cariesDepthEnabled, radiographicDepthMode).
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import {
  secondaryCariesOptions,
  rootCariesOptions,
  rootCariesDisplayValue,
  radiographicDepthOptions,
  applySecondaryCariesScore,
  applyRadiographicDepth,
  setSecondaryCariesMode,
  getSecondaryCariesMode,
  setRootCariesMode,
  getRootCariesMode,
  setRadiographicDepthMode,
  getRadiographicDepthMode,
  setCariesDepthEnabled,
  getCariesDepthEnabled,
  __renderActiveLayers,
  __syncSurfaceDepthIndicatorForTest,
  VALID_ROOT_CARIES,
} from "../odontogram";

afterEach(() => {
  // All four are module-scope settings; restore defaults so tests don't leak.
  setSecondaryCariesMode("standard");
  setRootCariesMode("simple");
  setRadiographicDepthMode("off");
  setCariesDepthEnabled(true);
});

function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}
const layers = (toothNo: number, state: Record<string, unknown>) =>
  __renderActiveLayers(svgText(String(toothNo)), toothNo, state);

describe("secondaryCariesOptions — CARS score list per mode", () => {
  it("simple -> [0,3]", () => {
    expect(secondaryCariesOptions("simple").map(o => o.value)).toEqual([0, 3]);
  });
  it("standard -> [0,1,3,6]", () => {
    expect(secondaryCariesOptions("standard").map(o => o.value)).toEqual([0, 1, 3, 6]);
  });
  it("full -> [0..6]", () => {
    expect(secondaryCariesOptions("full").map(o => o.value)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it("defaults to the module mode (standard) when called with no argument", () => {
    expect(secondaryCariesOptions().map(o => o.value)).toEqual([0, 1, 3, 6]);
    setSecondaryCariesMode("full");
    expect(secondaryCariesOptions().map(o => o.value)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it("labels are non-empty strings (i18n-resolved)", () => {
    for (const o of secondaryCariesOptions("full")) {
      expect(typeof o.label).toBe("string");
      expect(o.label.length).toBeGreaterThan(0);
    }
  });
});

describe("rootCariesOptions + rootCariesDisplayValue — non-collapsing", () => {
  // SP6 Task 3: simple-mode "present" now writes the canonical "active-cavitated"
  // enum (the most-severe value, so it renders at full opacity) rather than "active".
  it("simple -> none / present (present writes the canonical 'active-cavitated' enum)", () => {
    const opts = rootCariesOptions("simple");
    expect(opts.map(o => o.value)).toEqual(["none", "active-cavitated"]);
  });
  it("severity -> the full rootCaries enum", () => {
    expect(rootCariesOptions("severity").map(o => o.value)).toEqual(Array.from(VALID_ROOT_CARIES));
  });
  it("simple mode collapses every non-none severity to 'active-cavitated' for display", () => {
    expect(rootCariesDisplayValue("simple", "none")).toBe("none");
    expect(rootCariesDisplayValue("simple", "active")).toBe("active-cavitated");
    expect(rootCariesDisplayValue("simple", "arrested")).toBe("active-cavitated");
    expect(rootCariesDisplayValue("simple", "active-cavitated")).toBe("active-cavitated");
  });
  it("severity mode shows the stored value verbatim (round-trips a value simple can't show)", () => {
    // A stored 'arrested' displays as 'active-cavitated' in simple mode but is
    // preserved, so widening to severity reveals it again — the non-collapsing guarantee.
    expect(rootCariesDisplayValue("simple", "arrested")).toBe("active-cavitated");
    expect(rootCariesDisplayValue("severity", "arrested")).toBe("arrested");
  });
});

describe("radiographicDepthOptions — per mode", () => {
  it("off -> [] (control hidden)", () => {
    expect(radiographicDepthOptions("off")).toEqual([]);
  });
  it("threeLevel -> none + superficial/middle/deep buckets (E1/D1/D3 codes)", () => {
    expect(radiographicDepthOptions("threeLevel").map(o => o.value)).toEqual(["none", "E1", "D1", "D3"]);
  });
  it("detailed -> none/E1/E2/D1/D2/D3", () => {
    expect(radiographicDepthOptions("detailed").map(o => o.value)).toEqual(["none", "E1", "E2", "D1", "D2", "D3"]);
  });
  it("defaults to the module mode (off) when called with no argument", () => {
    expect(radiographicDepthOptions()).toEqual([]);
    setRadiographicDepthMode("detailed");
    expect(radiographicDepthOptions().length).toBe(6);
  });
});

describe("surface-write helpers", () => {
  it("applySecondaryCariesScore sets a positive score and deletes on 0", () => {
    const m = new Map<string, number>();
    applySecondaryCariesScore(m, "mesial", 3);
    expect(m.get("mesial")).toBe(3);
    applySecondaryCariesScore(m, "mesial", 6);
    expect(m.get("mesial")).toBe(6);
    applySecondaryCariesScore(m, "mesial", 0);
    expect(m.has("mesial")).toBe(false);
  });
  it("applyRadiographicDepth sets a real value and clears on 'none'/empty", () => {
    const m = new Map<string, string>();
    applyRadiographicDepth(m, "occlusal", "D2");
    expect(m.get("occlusal")).toBe("D2");
    applyRadiographicDepth(m, "occlusal", "none");
    expect(m.has("occlusal")).toBe(false);
    applyRadiographicDepth(m, "occlusal", "E1");
    applyRadiographicDepth(m, "occlusal", "");
    expect(m.has("occlusal")).toBe(false);
  });
});

describe("mode accessors — round-trip + invalid coercion + non-collapsing state", () => {
  it("secondaryCariesMode defaults to standard, round-trips, coerces invalid", () => {
    expect(getSecondaryCariesMode()).toBe("standard");
    setSecondaryCariesMode("full");
    expect(getSecondaryCariesMode()).toBe("full");
    // @ts-expect-error deliberate bad input
    setSecondaryCariesMode("bogus");
    expect(getSecondaryCariesMode()).toBe("standard");
  });
  it("rootCariesMode defaults to simple, round-trips, coerces invalid", () => {
    expect(getRootCariesMode()).toBe("simple");
    setRootCariesMode("severity");
    expect(getRootCariesMode()).toBe("severity");
    // @ts-expect-error deliberate bad input
    setRootCariesMode("bogus");
    expect(getRootCariesMode()).toBe("simple");
  });
  it("radiographicDepthMode defaults to off, round-trips, coerces invalid", () => {
    expect(getRadiographicDepthMode()).toBe("off");
    setRadiographicDepthMode("threeLevel");
    expect(getRadiographicDepthMode()).toBe("threeLevel");
    // @ts-expect-error deliberate bad input
    setRadiographicDepthMode("bogus");
    expect(getRadiographicDepthMode()).toBe("off");
  });
  it("cariesDepthEnabled defaults to true and toggles", () => {
    expect(getCariesDepthEnabled()).toBe(true);
    setCariesDepthEnabled(false);
    expect(getCariesDepthEnabled()).toBe(false);
    setCariesDepthEnabled(true);
    expect(getCariesDepthEnabled()).toBe(true);
  });
});

describe("Gate: cariesDepthEnabled controls the visual caries-depth render tier", () => {
  const caried = { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } };

  it("default (ON) encodes the depth tier as opacity on the caries surface", () => {
    const l = layers(16, caried);
    const surf = l.find((x) => x.id === "caries-occlusal");
    expect(surf).toBeTruthy();
    expect(surf!.opacity).toBe("0.7"); // ICDAS 4 -> tier 2 -> 0.7
  });

  it("OFF renders the caries surface at the SVG default (no opacity tier / no caries-deep)", () => {
    setCariesDepthEnabled(false);
    const deep = { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 6 } };
    const l = layers(16, deep);
    const surf = l.find((x) => x.id === "caries-occlusal");
    expect(surf).toBeTruthy();
    expect(surf!.opacity).toBe("");
    expect(surf!.cls.split(/\s+/)).not.toContain("caries-deep");
  });

  it("the caries surface still renders (is active) when the depth tier is gated off", () => {
    setCariesDepthEnabled(false);
    const l = layers(16, caried);
    expect(l.some((x) => x.id === "caries-occlusal")).toBe(true);
  });
});

// Builds a `.surface-cell` matching the markup syncSurfaceDepthIndicator expects.
function buildSurfaceCell(surface: string): HTMLElement {
  const cell = document.createElement("div");
  cell.className = "surface-cell";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = `caries-${surface}`;
  const ind = document.createElement("div");
  ind.className = "surf-depth";
  cell.appendChild(input);
  cell.appendChild(ind);
  return cell;
}

describe("Gate: radiographicDepthMode controls the data-radio surface badge", () => {
  it("mode 'off' (default) suppresses data-radio even when a value is stored", () => {
    const cell = buildSurfaceCell("mesial");
    const state = { cariesSeverity: new Map(), radiographicDepth: new Map([["mesial", "D2"]]) };
    __syncSurfaceDepthIndicatorForTest(cell, state);
    expect(cell.querySelector(".surf-depth")!.hasAttribute("data-radio")).toBe(false);
  });
  it("a non-off mode emits data-radio for the stored value", () => {
    setRadiographicDepthMode("threeLevel");
    const cell = buildSurfaceCell("mesial");
    const state = { cariesSeverity: new Map(), radiographicDepth: new Map([["mesial", "D2"]]) };
    __syncSurfaceDepthIndicatorForTest(cell, state);
    expect(cell.querySelector(".surf-depth")!.getAttribute("data-radio")).toBe("D2");
  });
});
