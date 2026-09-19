// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-D Task 2: FHIR export coverage for keratinized gingiva width
// (KG) — a per-tooth BUCCAL mm scalar. Mirrors the PI/GI FHIR test structure
// (pgd-pi-gi-fhir.test.ts): rides as one additional component on the SAME
// periodontal-panel Observation (LOINC 74029-0), engine-local finding code
// only (no dedicated LOINC), but unlike PI/GI/plaque/furcation this is a
// valueQuantity (mm) component with a fixed buccal bodySite (not per-surface).
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

const kgPayload: OdontogramExportPayload = {
  version: "2.15",
  teeth: {
    "16": { toothSelection: "tooth-base", kg: 3 },
    // A perfectly clean tooth -> no perio, no furcation, no plaque, no pi/gi, no kg -> no panel at all.
    "11": { toothSelection: "tooth-base" },
  },
};

describe("KG FHIR export — additional component on the periodontal panel", () => {
  it("emits a valueQuantity KG component (mm, no LOINC coding) with a buccal bodySite", () => {
    const b = buildFhirBundle(kgPayload);
    const panel = panelFor(b, "16")!;
    expect(panel).toBeDefined();
    const kgComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "keratinized-gingiva-width");
    expect(kgComps).toHaveLength(1);
    const c = kgComps[0] as any;
    expect(c.code.coding[0].system).toBe(LOCAL_SYSTEM);
    expect(c.code.coding).toHaveLength(1); // no LOINC coding — engine-local only
    expect(c.valueQuantity).toEqual({ value: 3, unit: "mm", system: "http://unitsofmeasure.org", code: "mm" });
    expect(componentBodySite(c).coding[0]).toEqual({ system: FDI_SYSTEM, code: "16" });
    expect(componentBodySite(c).coding[1]).toEqual({ system: LOCAL_SYSTEM, code: "site:buccal", display: "Buccal" });
  });

  it("emits NO KG component for a tooth without kg", () => {
    const b = buildFhirBundle(kgPayload);
    // "11" has no perio/furcation/plaque/pi/gi/kg data at all -> no panel.
    expect(panelFor(b, "11")).toBeUndefined();
  });

  it("emits the panel (with only the KG component) for a kg-only tooth", () => {
    const b = buildFhirBundle(kgPayload);
    const panel = panelFor(b, "16")!;
    const pdComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "32910-2");
    const furcationComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "34015-8");
    const plaqueComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "plaque-surface");
    const piComps = (panel.component ?? []).filter((c: any) => c.code.coding?.[0]?.code === "plaque-index-silness-loe");
    expect(pdComps).toHaveLength(0);
    expect(furcationComps).toHaveLength(0);
    expect(plaqueComps).toHaveLength(0);
    expect(piComps).toHaveLength(0);
  });

  it("emits the KG component alongside perio-site/furcation/plaque/pi/gi components on the SAME panel when all are charted", () => {
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
          kg: 5,
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
    expect((panel.component ?? []).some((c: any) => c.code.coding?.[0]?.code === "keratinized-gingiva-width")).toBe(true);
  });

  it("tolerates a malformed/foreign kg shape without throwing and emits nothing for it", () => {
    const garbage: OdontogramExportPayload = {
      version: "2.15",
      teeth: {
        // @ts-expect-error intentional malformed input
        "31": { toothSelection: "tooth-base", kg: "nope" },
        // `kg: null` is runtime-only malformed (ToothRecord.kg is a plain
        // `number`, not `number | null` — the odontogram module's OWN
        // never-serializes-null convention keeps it out of the payload type;
        // null only ever appears here as "foreign JSON", not a TS-legal value).
        "32": { toothSelection: "tooth-base", kg: null as unknown as number },
      },
    };
    expect(() => buildFhirBundle(garbage)).not.toThrow();
    const b = buildFhirBundle(garbage);
    expect(panelFor(b, "31")).toBeUndefined();
    expect(panelFor(b, "32")).toBeUndefined();
  });
});

describe("existing (no-kg) FHIR golden stays byte-identical", () => {
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
