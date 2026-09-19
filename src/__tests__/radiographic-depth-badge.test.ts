// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP5 Task 4: `radiographicDepth` surfaces as (1) a `data-radio` attribute on
// the existing per-surface indicator element (alongside the ICDAS `data-depth`/
// `data-icdas` attributes, added by SP5 Task 1 as a plain data field), and
// (2) its own `radiographic-caries-depth` FHIR Observation (wired by Task 1,
// reconfirmed here). This is a SEPARATE, independent scale from the visual
// ICDAS `cariesDepths` — no crosswalk between them (constitution) — so this
// suite's central proof is that setting `radiographicDepth` does NOT change
// the SVG-fingerprint render at all (it has no `__renderActiveLayers` path).
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import {
  __renderActiveLayers,
  __setToothStateForTest,
  __getToothStateForTest,
  __syncSurfaceDepthIndicatorForTest,
  setRadiographicDepthMode,
  VALID_RADIOGRAPHIC_DEPTH,
} from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import type { OdontogramExportPayload } from "../fhir/types";

function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}
const layers = (toothNo: number, state: Record<string, unknown>) =>
  __renderActiveLayers(svgText(String(toothNo)), toothNo, state);

describe("SP5 Task 4: radiographicDepth has NO effect on the SVG-fingerprint render", () => {
  it("an occlusal caries surface renders identically with and without a radiographicDepth value", () => {
    const withoutRadio = layers(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesDepths: { occlusal: 4 } });
    const withRadio = layers(16, {
      toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesDepths: { occlusal: 4 },
      radiographicDepth: { occlusal: "D2" },
    });
    expect(withRadio).toEqual(withoutRadio);
  });

  it("a bare tooth (no caries at all) renders identically with and without a radiographicDepth value", () => {
    const withoutRadio = layers(11, { toothSelection: "tooth-base" });
    const withRadio = layers(11, { toothSelection: "tooth-base", radiographicDepth: { mesial: "E1" } });
    expect(withRadio).toEqual(withoutRadio);
  });

  it("every VALID_RADIOGRAPHIC_DEPTH value leaves the render unchanged", () => {
    const base = layers(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    for (const v of VALID_RADIOGRAPHIC_DEPTH) {
      const withRadio = layers(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"], radiographicDepth: { occlusal: v } });
      expect(withRadio, v).toEqual(base);
    }
  });
});

// Builds a single `.surface-cell` matching the markup `syncControlsFromState`
// expects (checkbox value `caries-{surface}` + a `.surf-depth` indicator div).
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

describe("SP5 Task 4: data-radio surface-indicator badge attribute", () => {
  // SP5 Task 5: the badge is emitted only when the radiographic-depth mode is on
  // (default "off"). Enable a non-off mode for this block, reset afterwards.
  beforeEach(() => setRadiographicDepthMode("detailed"));
  afterEach(() => setRadiographicDepthMode("off"));

  it("sets data-radio to the surface's radiographicDepth value, without touching data-depth/data-icdas", () => {
    const cell = buildSurfaceCell("occlusal");
    const state = { cariesSeverity: new Map([["occlusal", 4]]), radiographicDepth: new Map([["occlusal", "D2"]]) };
    __syncSurfaceDepthIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-depth")!;
    expect(ind.getAttribute("data-radio")).toBe("D2");
    // ICDAS/3-bar attributes are untouched by the radiographic value.
    expect(ind.getAttribute("data-icdas")).toBe("4");
    expect(ind.getAttribute("data-depth")).toBe("dentin");
  });

  it("does not set data-radio when the surface has no radiographicDepth entry", () => {
    const cell = buildSurfaceCell("mesial");
    const state = { cariesSeverity: new Map(), radiographicDepth: new Map() };
    __syncSurfaceDepthIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-depth")!;
    expect(ind.hasAttribute("data-radio")).toBe(false);
  });

  it("does not set data-radio when the surface's radiographicDepth is explicitly 'none'", () => {
    const cell = buildSurfaceCell("distal");
    const state = { cariesSeverity: new Map(), radiographicDepth: new Map([["distal", "none"]]) };
    __syncSurfaceDepthIndicatorForTest(cell, state);
    const ind = cell.querySelector(".surf-depth")!;
    expect(ind.hasAttribute("data-radio")).toBe(false);
  });

  it("tolerates a state with no radiographicDepth map at all (defensive optional-chaining)", () => {
    const cell = buildSurfaceCell("buccal");
    const state = { cariesSeverity: new Map() };
    expect(() => __syncSurfaceDepthIndicatorForTest(cell, state)).not.toThrow();
    const ind = cell.querySelector(".surf-depth")!;
    expect(ind.hasAttribute("data-radio")).toBe(false);
  });

  it("clears a stale data-radio attribute on re-sync once the value is unset", () => {
    const cell = buildSurfaceCell("lingual");
    const withValue = { cariesSeverity: new Map(), radiographicDepth: new Map([["lingual", "E2"]]) };
    __syncSurfaceDepthIndicatorForTest(cell, withValue);
    expect(cell.querySelector(".surf-depth")!.getAttribute("data-radio")).toBe("E2");

    const cleared = { cariesSeverity: new Map(), radiographicDepth: new Map() };
    __syncSurfaceDepthIndicatorForTest(cell, cleared);
    expect(cell.querySelector(".surf-depth")!.hasAttribute("data-radio")).toBe(false);
  });
});

describe("SP5 Task 4: state hydration + JSON round-trip (registry Task 1 behavior, reconfirmed)", () => {
  it("hydrateState persists radiographicDepth and __getToothStateForTest reads it back as a Map", () => {
    __setToothStateForTest(31, { toothSelection: "tooth-base", radiographicDepth: { distal: "D2", buccal: "E1" } });
    const s = __getToothStateForTest(31) as unknown as { radiographicDepth: Map<string, string> };
    expect(s.radiographicDepth.get("distal")).toBe("D2");
    expect(s.radiographicDepth.get("buccal")).toBe("E1");
  });

  it("an invalid stored radiographicDepth value is dropped (validated against VALID_RADIOGRAPHIC_DEPTH)", () => {
    __setToothStateForTest(32, { toothSelection: "tooth-base", radiographicDepth: { distal: "not-a-real-depth" } });
    const s = __getToothStateForTest(32) as unknown as { radiographicDepth: Map<string, string> };
    expect(s.radiographicDepth.has("distal")).toBe(false);
  });
});

describe("SP5 Task 4: FHIR round-trip (registry Task 1 behavior, reconfirmed)", () => {
  it("radiographicDepth emits its own radiographic-caries-depth Observation, one component per set surface", () => {
    const payload: OdontogramExportPayload = {
      version: "2.2",
      teeth: { "26": { radiographicDepth: { distal: "D2", buccal: "E1" } } },
    };
    const bundle = buildFhirBundle(payload);
    const obs = bundle.entry
      ?.map((e) => e.resource as any)
      .find((r) => r?.code?.coding?.[0]?.code === "radiographic-caries-depth");
    expect(obs).toBeTruthy();
    const bySurface = Object.fromEntries((obs.component ?? []).map((c: any) => [c.code?.coding?.[0]?.code, c.valueCodeableConcept?.coding?.[0]?.code]));
    expect(bySurface).toEqual({ distal: "D2", buccal: "E1" });
    // Only the two set surfaces get a component — not every VALID_FILLING_SURFACES entry.
    expect(obs.component.length).toBe(2);

    const out = parseFhirBundle(bundle);
    expect(out.teeth["26"].radiographicDepth).toEqual({ distal: "D2", buccal: "E1" });
  });

  it("no radiographicDepth set -> no radiographic-caries-depth Observation emitted", () => {
    const payload: OdontogramExportPayload = { version: "2.2", teeth: { "11": { toothSelection: "tooth-base" } } };
    const bundle = buildFhirBundle(payload);
    const found = bundle.entry?.some((e) => (e.resource as any)?.code?.coding?.[0]?.code === "radiographic-caries-depth");
    expect(found).toBe(false);
    expect(parseFhirBundle(bundle).teeth["11"]?.radiographicDepth).toBeUndefined();
  });

  it("a tooth's cariesSeverity (unified visual) and radiographicDepth round-trip independently, side by side", () => {
    const payload: OdontogramExportPayload = {
      version: "2.4",
      teeth: { "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 6 }, radiographicDepth: { occlusal: "D3" } } },
    };
    const bundle = buildFhirBundle(payload);
    const out = parseFhirBundle(bundle);
    // SP6 Task 1: severity rides on the caries component; radiographic depth is
    // its own separate finding — the two round-trip independently.
    expect(out.teeth["16"].cariesSeverity).toEqual({ occlusal: 6 });
    expect(out.teeth["16"].radiographicDepth).toEqual({ occlusal: "D3" });
  });
});
