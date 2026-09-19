// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-D Task 1: FHIR export coverage for the Silness-Löe Plaque
// Index (PI) + Löe-Silness Gingival Index (GI) graded per-surface axes.
// Mirrors the existing furcation/plaque FHIR test structure (perio-p2b-
// furcation.test.ts / perio-p2b-plaque.test.ts) — both indices ride as
// additional integer components on the SAME periodontal-panel Observation
// (LOINC 74029-0), engine-local finding code only (no dedicated LOINC),
// reusing the existing per-surface bodySite extension mechanism.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildFhirBundle } from "../fhir/toFhir";
import { payloadCases } from "./parity/matrix";
import { FDI_SYSTEM, LOCAL_SYSTEM } from "../fhir/codesystems";
import type { OdontogramExportPayload } from "../fhir/types";

const LOINC = "http://loinc.org";

const COMPONENT_BODYSITE_EXTENSION_URL =
  "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite";

function componentBodySite(c: any): import("fhir/r4").CodeableConcept {
  return c.extension?.find((e: any) => e.url === COMPONENT_BODYSITE_EXTENSION_URL)?.valueCodeableConcept;
}

function obsOf(b: ReturnType<typeof buildFhirBundle>) {
  return (b.entry ?? []).map((e) => e.resource).filter((r): r is NonNullable<typeof r> => r?.resourceType === "Observation") as import("fhir/r4").Observation[];
}

function panelFor(b: ReturnType<typeof buildFhirBundle>, tooth: string) {
  return obsOf(b).find(
    (o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0") && o.bodySite?.coding?.[0]?.code === tooth,
  );
}

const piGiPayload: OdontogramExportPayload = {
  version: "2.15",
  teeth: {
    "16": {
      toothSelection: "tooth-base",
      pi: { mesial: 2, buccal: 3 },
      gi: { mesial: 1 },
    },
    // A perfectly clean tooth -> no perio, no furcation, no plaque, no pi/gi -> no panel at all.
    "11": { toothSelection: "tooth-base" },
  },
};

describe("PI/GI FHIR export — additional components on the periodontal panel", () => {
  it("emits a PI component (no LOINC coding) per graded surface, with tooth+surface bodySite", () => {
    const b = buildFhirBundle(piGiPayload);
    const panel = panelFor(b, "16")!;
    expect(panel).toBeDefined();
    const piComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "plaque-index-silness-loe");
    expect(piComps).toHaveLength(2);
    for (const c of piComps as any[]) {
      expect(c.code.coding[0].system).toBe(LOCAL_SYSTEM);
      expect(c.code.coding).toHaveLength(1); // no LOINC coding — engine-local only
      expect(componentBodySite(c).coding[0]).toEqual({ system: FDI_SYSTEM, code: "16" });
      expect(componentBodySite(c).coding[1].system).toBe(LOCAL_SYSTEM);
    }
    const bySite = Object.fromEntries(piComps.map((c: any) => [componentBodySite(c).coding[1].code, c.valueInteger]));
    expect(bySite["plaque-surface:mesial"]).toBe(2);
    expect(bySite["plaque-surface:buccal"]).toBe(3);
  });

  it("emits a GI component (no LOINC coding) per graded surface, with tooth+surface bodySite", () => {
    const b = buildFhirBundle(piGiPayload);
    const panel = panelFor(b, "16")!;
    const giComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "gingival-index-loe-silness");
    expect(giComps).toHaveLength(1);
    const c = giComps[0] as any;
    expect(c.code.coding[0].system).toBe(LOCAL_SYSTEM);
    expect(c.valueInteger).toBe(1);
    expect(componentBodySite(c).coding[0]).toEqual({ system: FDI_SYSTEM, code: "16" });
    expect(componentBodySite(c).coding[1]).toEqual({ system: LOCAL_SYSTEM, code: "plaque-surface:mesial", display: "Mesial" });
  });

  it("emits the panel (with only pi/gi components) for a pi/gi-only tooth (no perio sites, no furcation, no plaque)", () => {
    const b = buildFhirBundle(piGiPayload);
    const panel = panelFor(b, "16")!;
    const pdComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32910-2");
    const furcationComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "34015-8");
    const plaqueComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "plaque-surface");
    expect(pdComps).toHaveLength(0);
    expect(furcationComps).toHaveLength(0);
    expect(plaqueComps).toHaveLength(0);
  });

  it("emits NO perio/pi/gi Observation for a clean tooth (no perio, furcation, plaque, pi, gi)", () => {
    const b = buildFhirBundle(piGiPayload);
    expect(panelFor(b, "11")).toBeUndefined();
  });

  it("emits pi/gi components alongside perio-site/furcation/plaque components on the SAME panel when all are charted", () => {
    const payload: OdontogramExportPayload = {
      version: "2.15",
      teeth: {
        "26": {
          toothSelection: "tooth-base",
          perio: { pd: { MB: 4 }, gm: { MB: 0 }, bop: [], sup: [] },
          furcation: { buccal: 2 },
          plaque: ["buccal"],
          pi: { buccal: 1 },
          gi: { buccal: 2 },
        },
      },
    };
    const b = buildFhirBundle(payload);
    const panels = obsOf(b).filter((o) => o.code.coding?.some((c) => c.system === LOINC && c.code === "74029-0"));
    expect(panels).toHaveLength(1);
    const panel = panels[0];
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "32910-2")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "34015-8")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "plaque-surface")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "plaque-index-silness-loe")).toBe(true);
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "gingival-index-loe-silness")).toBe(true);
  });

  it("tolerates a malformed/foreign pi/gi shape without throwing and emits nothing for it", () => {
    const garbage: OdontogramExportPayload = {
      version: "2.15",
      teeth: {
        // @ts-expect-error intentional malformed input
        "31": { toothSelection: "tooth-base", pi: "nope" },
        "32": { toothSelection: "tooth-base", pi: {}, gi: {} },
        // Not a type error (Record<string, number>) but still runtime-invalid:
        // "bogus" isn't a valid surface, 9/0 are out-of-range grades.
        "33": { toothSelection: "tooth-base", pi: { bogus: 2, mesial: 9, distal: 0 } },
      },
    };
    expect(() => buildFhirBundle(garbage)).not.toThrow();
    const b = buildFhirBundle(garbage);
    expect(panelFor(b, "31")).toBeUndefined();
    expect(panelFor(b, "32")).toBeUndefined();
    expect(panelFor(b, "33")).toBeUndefined();
  });
});

describe("existing (no-pi/gi) FHIR golden stays byte-identical", () => {
  const testFileUrl = import.meta.url;
  const readGolden = (name: string) =>
    JSON.parse(readFileSync(fileURLToPath(new URL(`./parity/${name}`, testFileUrl)), "utf8"));

  it("matches fhir-golden.json exactly for every existing parity payload case", () => {
    const golden = readGolden("fhir-golden.json");
    payloadCases().forEach((p, i) => {
      expect(buildFhirBundle(p.payload), p.name).toEqual(golden[i].bundle);
    });
  });
});
