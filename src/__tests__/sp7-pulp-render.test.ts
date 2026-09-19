// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  __renderActiveLayers,
  __setToothStateForTest,
  __getToothStateForTest,
  __parseSvgForTest,
  __renderActiveLayersOnNode,
} from "../odontogram";

// NOTE: `import.meta.url` is captured here (rather than passed inline as the
// second argument to `new URL(...)`) because Vite's transform specifically
// pattern-matches `new URL('literal', import.meta.url)` as its asset-URL
// syntax and rewrites it — which breaks fileURLToPath resolution. Capturing
// it in a variable first dodges the rewrite (see parity.test.ts).
const testFileUrl = import.meta.url;
const svgText = readFileSync(fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)), "utf8");
const render = (state: Record<string, unknown>) => __renderActiveLayers(svgText, 11, state);
const ids = (layers: { id: string }[]) => layers.map(l => l.id);

describe("SP7 Task 3: endo treatment suppresses the pulp glyph", () => {
  it("endo-filling hides tooth-inflam-pulp even if pulpDx is diseased", () => {
    const layers = render({ toothSelection: "tooth-base", endo: "endo-filling", pulpDx: "irreversible-pulpitis" });
    expect(ids(layers)).not.toContain("tooth-inflam-pulp");
    expect(ids(layers)).toContain("endo-filling");
  });
  it("endo=none keeps the diseased pulp glyph", () => {
    const layers = render({ toothSelection: "tooth-base", endo: "none", pulpDx: "irreversible-pulpitis" });
    expect(ids(layers)).toContain("tooth-inflam-pulp");
  });
});

describe("SP7 Task 3: reversible pulpitis renders a reduced glyph", () => {
  it("reversible-pulpitis activates tooth-inflam-pulp but not the flame paths", () => {
    const layers = render({ toothSelection: "tooth-base", endo: "none", pulpDx: "reversible-pulpitis" });
    expect(ids(layers)).toContain("tooth-inflam-pulp");
    expect(ids(layers)).not.toContain("pulp-inflam-path-1");
    expect(ids(layers)).not.toContain("pulp-inflam-path-11");
  });
  it("irreversible-pulpitis keeps the flame paths", () => {
    const layers = render({ toothSelection: "tooth-base", endo: "none", pulpDx: "irreversible-pulpitis" });
    expect(ids(layers)).toContain("pulp-inflam-path-1");
  });
});

describe("SP7 Task 3: hydrate normalizes pulpDx on a treated tooth", () => {
  it("endo-filling + necrosis -> pulpDx normalized to normal", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", endo: "endo-filling", pulpDx: "necrosis" });
    expect(__getToothStateForTest(11)!.pulpDx).toBe("normal");
  });
});

// FIX 1 regression: the live app reuses ONE persistent SVG DOM node per tooth
// across renders. `__renderActiveLayers` re-parses a fresh node every call, so
// it can't catch a render that fails to reset state a prior render left
// behind — these tests render onto the SAME parsed node twice, via
// `__parseSvgForTest` + `__renderActiveLayersOnNode`, to reproduce that reuse.
//
// Note on ids: 11.svg carries two disjoint flame-path id sets — the permanent
// tooth's "pulp-inflam-path-N" (N=1..8, nested under #tooth-inflam-pulp) and
// the milk tooth's "pulp-inflam-path-N1" (nested under #milktooth-inflam-pulp).
// `setPulpInflamPaths` flips data-active on both sets unconditionally, but only
// the set nested under the currently-active parent glyph is actually visible
// (collectActiveLayers hides children of an inactive ancestor) — so a
// permanent-tooth render is asserted against the plain "-1" id and a
// milktooth render against the "-11" id.
describe("SP7 review fix: sticky flame-path deactivation on a reused SVG node", () => {
  it("mild render then full-severity render on the SAME node re-activates the flame paths", () => {
    const svg = __parseSvgForTest(svgText);
    const mild = __renderActiveLayersOnNode(svg, 11, { toothSelection: "tooth-base", pulpDx: "reversible-pulpitis" });
    expect(ids(mild)).not.toContain("pulp-inflam-path-1");

    const full = __renderActiveLayersOnNode(svg, 11, { toothSelection: "tooth-base", pulpDx: "necrosis" });
    expect(ids(full)).toContain("pulp-inflam-path-1");
    expect(ids(full)).toContain("pulp-inflam-path-8");
  });

  it("full render then mild render on the SAME node deactivates the flame paths", () => {
    const svg = __parseSvgForTest(svgText);
    const full = __renderActiveLayersOnNode(svg, 11, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis" });
    expect(ids(full)).toContain("pulp-inflam-path-1");

    const mild = __renderActiveLayersOnNode(svg, 11, { toothSelection: "tooth-base", pulpDx: "reversible-pulpitis" });
    expect(ids(mild)).not.toContain("pulp-inflam-path-1");
    expect(ids(mild)).not.toContain("pulp-inflam-path-8");
  });

  it("milktooth: mild render then full-severity render on the SAME node re-activates the flame paths", () => {
    const svg = __parseSvgForTest(svgText);
    const mild = __renderActiveLayersOnNode(svg, 11, { toothSelection: "milktooth", pulpDx: "reversible-pulpitis" });
    expect(ids(mild)).toContain("milktooth-inflam-pulp");
    expect(ids(mild)).not.toContain("pulp-inflam-path-11");

    const full = __renderActiveLayersOnNode(svg, 11, { toothSelection: "milktooth", pulpDx: "necrosis" });
    expect(ids(full)).toContain("milktooth-inflam-pulp");
    expect(ids(full)).toContain("pulp-inflam-path-11");
  });
});
