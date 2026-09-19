// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

describe("parseFhirBundle (FHIR import)", () => {
  it("round-trips meaningful per-tooth fields from a self-produced bundle", () => {
    const payload = {
      version: "2.0",
      globals: { edentulous: false, wisdomVisible: true, showBase: false, occlusalVisible: false, showHealthyPulp: false },
      teeth: {
        "11": { toothSelection: "implant", restorationType: "crown", restorationMaterial: "zircon" },
        "21": { caries: ["caries-mesial", "caries-occlusal"], note: "watch" },
        "36": { fillingSurfaceMaterials: { buccal: "amalgam", distal: "composite" } },
        "46": { mobility: "m2", extractionPlan: true },
        "16": { mods: ["inflammation"], periapicalType: "cyst" },
        "26": { calculus: true, resorptionType: "external-cervical" },
        "37": { caries: ["caries-mesial"], cariesSeverity: { mesial: 5 } },
        "45": { pulpDx: "irreversible-pulpitis" },
      },
    };
    const bundle = buildFhirBundle(payload as never);
    const out = parseFhirBundle(bundle);
    expect(out.teeth["11"].toothSelection).toBe("implant");
    expect(out.teeth["11"].restorationType).toBe("crown");
    expect(out.teeth["11"].restorationMaterial).toBe("zircon");
    expect((out.teeth["21"].caries ?? []).sort()).toEqual(["caries-mesial", "caries-occlusal"]);
    expect(out.teeth["21"].note).toBe("watch");
    expect(out.teeth["36"].fillingSurfaceMaterials).toEqual({ buccal: "amalgam", distal: "composite" });
    expect(out.teeth["46"].mobility).toBe("m2");
    expect(out.teeth["46"].extractionPlan).toBe(true);
    expect(out.teeth["16"].periapicalType).toBe("cyst");
    expect(out.teeth["26"].calculus).toBe(true);
    expect(out.teeth["26"].resorptionType).toBe("external-cervical");
    expect(out.teeth["37"].cariesSeverity).toEqual({ mesial: 5 });
    expect(out.teeth["45"].pulpDx).toBe("irreversible-pulpitis");
  });

  it("reads chart-level edentulous", () => {
    const bundle = buildFhirBundle({ version: "1.4", globals: { edentulous: true }, teeth: {} } as never);
    expect(parseFhirBundle(bundle).globals?.edentulous).toBe(true);
  });

  it("never throws on malformed/foreign input", () => {
    expect(() => parseFhirBundle(null as never)).not.toThrow();
    expect(() => parseFhirBundle({ resourceType: "Bundle" } as never)).not.toThrow();
    expect(parseFhirBundle({ resourceType: "Bundle", entry: "nope" } as never).teeth).toEqual({});
    // foreign bundle with only SNOMED codes → no recognized local findings
    const foreign = { resourceType: "Bundle", type: "collection", entry: [
      { resource: { resourceType: "Observation", status: "final", code: { coding: [{ system: "http://snomed.info/sct", code: "80967001" }] }, bodySite: { coding: [{ system: "urn:iso:std:iso:3950", code: "11" }] } } },
    ]};
    expect(parseFhirBundle(foreign as never).teeth).toEqual({});
  });
});

// SP4 Task 6: the four diagnosis axes (`pulpDx`, `pulpLatin`, `apicalDx`,
// `resorptionType`) are auto-emitted by the registry (AXES in
// src/registry/axes.ts, byte-identical to FIELD_MAPPINGS in
// src/fhir/fieldMappings.ts) exactly like every other enum axis — no
// bespoke wiring was needed. This test proves the full set survives an
// export(2.2) -> import round-trip losslessly, including `pulpLatin`
// (only emitted when set — LOCAL codes, per the payload-2.2 release brief).
describe("SP4 Task 6: diagnosis axes FHIR round-trip (export 2.2 -> import lossless)", () => {
  it("pulpDx, pulpLatin, apicalDx, resorptionType, periapicalType all survive export->import losslessly", () => {
    const payload = {
      version: "2.2",
      teeth: {
        "16": {
          toothSelection: "tooth-base",
          pulpDx: "irreversible-pulpitis",
          pulpLatin: "pulpitis-acuta-purulenta",
          apicalDx: "asymptomatic-apical-periodontitis",
          periapicalType: "cyst",
          resorptionType: "external-cervical",
        },
      },
    };
    const bundle = buildFhirBundle(payload as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).toEqual(expect.arrayContaining([
      "pulp-diagnosis", "pulp-diagnosis-latin", "apical-diagnosis", "root-resorption-type",
    ]));

    const out = parseFhirBundle(bundle);
    const t = out.teeth["16"];
    expect(t.pulpDx).toBe("irreversible-pulpitis");
    expect(t.pulpLatin).toBe("pulpitis-acuta-purulenta");
    expect(t.apicalDx).toBe("asymptomatic-apical-periodontitis");
    expect(t.periapicalType).toBe("cyst");
    expect(t.resorptionType).toBe("external-cervical");
  });

  it("pulpLatin is omitted from the FHIR bundle when absent/'none' (only emitted when set) and does not round-trip a stray value", () => {
    const payload = { version: "2.2", teeth: { "21": { pulpDx: "necrosis" } } };
    const bundle = buildFhirBundle(payload as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).toContain("pulp-diagnosis");
    expect(codes).not.toContain("pulp-diagnosis-latin");

    const out = parseFhirBundle(bundle);
    expect(out.teeth["21"].pulpDx).toBe("necrosis");
    expect(out.teeth["21"].pulpLatin).toBeUndefined();
  });
});
