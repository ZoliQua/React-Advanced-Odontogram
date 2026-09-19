// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Review hardening of the DX-8/9 FHIR import path. Each block pins ONE defect
// that a behaviour test could not see, because the wrong answer and the
// "nothing to do" answer look identical from the outside: an unrecognised code
// and a recognised one both yield `{}` for the tooth that carries it. Every
// assertion here is therefore written on a SECOND tooth, whose overrides only
// move when the first Condition was actually understood.
import { describe, it, expect } from "vitest";
import { importDiagnosisConditions } from "../fhir/importConditions";
import { importPerioObservations } from "../fhir/importPerio";
import { parseFhirBundle } from "../fhir/fromFhir";
import { ICD10_SYSTEM, FDI_SYSTEM, SNOMED_SYSTEM, LOCAL_SYSTEM } from "../fhir/codesystems";
import { ICD10CM_PACK } from "../dx/packs";
import { LOINC, LOINC_SYSTEM } from "../fhir/toFhirPerio";

const CM = ICD10CM_PACK.system;
const fdi = (t: string) => ({ bodySite: [{ coding: [{ system: FDI_SYSTEM, code: t }] }] });
const cond = (system: string, code: string, extra: Record<string, unknown> = {}) =>
  ({ resource: { resourceType: "Condition", code: { coding: [{ system, code }] }, ...extra } });
const status = (element: "clinicalStatus" | "verificationStatus", code: string) =>
  ({ [element]: { coding: [{ code }] } });

/** Two caried teeth. Any Condition the importer UNDERSTANDS turns the other
 *  tooth's derived caries into a `suppress`; one it ignores leaves both alone. */
const twoCariedTeeth = {
  "11": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } },
  "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } },
};

describe("import: the engine recognises its own DX-8 refined codes", () => {
  // The flat reverse map holds K02.9 / K05.30 only, and `lookup()`'s 3-character
  // fallback cannot reach a CM subcode (there is no "K02" key in the CM map), so
  // every refined code the exporter can emit needs its own reverse entry.
  it.each(["K02.51", "K02.52", "K02.61", "K02.62"])("ICD-10-CM %s reads as caries", (code) => {
    const r = importDiagnosisConditions([cond(CM, code, fdi("11"))], twoCariedTeeth);
    expect(r.dxOverridesByTooth["11"] ?? {}).toEqual({});     // understood: no override on its own tooth
    expect(r.dxOverridesByTooth["16"]).toEqual({ caries: "suppress" }); // …and the section engaged
  });

  it.each(["K02.0", "K02.1"])("WHO %s reads as caries", (code) => {
    const r = importDiagnosisConditions([cond(ICD10_SYSTEM, code, fdi("11"))], twoCariedTeeth);
    expect(r.dxOverridesByTooth["11"] ?? {}).toEqual({});
    expect(r.dxOverridesByTooth["16"]).toEqual({ caries: "suppress" });
  });

  it("an unknown code is still ignored, and ignoring it engages nothing", () => {
    const r = importDiagnosisConditions([cond(CM, "Z99.99", fdi("11"))], twoCariedTeeth);
    expect(r.dxOverridesByTooth).toEqual({});
  });
});

describe("import: a non-catalog Condition never engages the override diff", () => {
  // `sawDentalSection` used to be set for ANY recognised key, so one foreign
  // gingivitis/periodontitis/peri-implant Condition on ONE tooth silently
  // suppressed every rule-derived diagnosis on every OTHER tooth.
  it.each([
    ["WHO gingivitis", ICD10_SYSTEM, "K05.1"],
    ["CM gingivitis", CM, "K05.10"],
    ["SNOMED gingivitis", SNOMED_SYSTEM, "66383009"],
    ["SNOMED periodontitis", SNOMED_SYSTEM, "5689008"],
    ["CM chronic periodontitis", CM, "K05.312"],
  ])("%s on 16 leaves tooth 11's findings alone", (_label, system, code) => {
    const r = importDiagnosisConditions([cond(system, code, fdi("16"))], twoCariedTeeth);
    expect(r.dxOverridesByTooth).toEqual({});
  });

  it("our own export still restores a suppression even when only a non-catalog Condition remains", () => {
    // Both teeth's caries were suppressed by the clinician, so the bundle holds
    // no catalog Condition at all — only our own id convention proves the
    // diagnosis section is present and the suppressions must come back.
    const r = importDiagnosisConditions(
      [{ resource: { resourceType: "Condition", id: "odontogram-dx-gingivitis-16", ...fdi("16") } }],
      twoCariedTeeth,
    );
    expect(r.dxOverridesByTooth["11"]).toEqual({ caries: "suppress" });
    expect(r.dxOverridesByTooth["16"]).toEqual({ caries: "suppress" });
  });
});

describe("import: tooth identity", () => {
  it("a deciduous bodySite maps to the permanent FDI storage key", () => {
    const teeth = {
      "15": { toothSelection: "milktooth", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } },
      "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 4 } },
    };
    // Tooth 15 is exported as ISO 3950 "55"; its caries Condition must land on 15.
    const r = importDiagnosisConditions([cond(ICD10_SYSTEM, "K02", fdi("55"))], teeth);
    expect(r.dxOverridesByTooth["55"]).toBeUndefined();          // no phantom record
    expect(r.dxOverridesByTooth["15"] ?? {}).toEqual({});        // understood on the real tooth
    expect(r.dxOverridesByTooth["16"]).toEqual({ caries: "suppress" });
  });

  it("an id whose tooth part is not a two-digit code creates no record", () => {
    const r = importDiagnosisConditions(
      [{ resource: { resourceType: "Condition", id: "odontogram-dx-caries-999" } }],
      twoCariedTeeth,
    );
    expect(Object.keys(r.dxOverridesByTooth)).not.toContain("999");
  });

  it("a prototype-polluting bodySite code is rejected", () => {
    const r = importDiagnosisConditions(
      [cond(ICD10_SYSTEM, "K02", { bodySite: [{ coding: [{ system: FDI_SYSTEM, code: "__proto__" }] }] })],
      twoCariedTeeth,
    );
    expect(r.dxOverridesByTooth).toEqual({});
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, "caries")).toBe(false);
  });
});

describe("import: a Condition that asserts absence is not a finding", () => {
  it.each([
    ["verificationStatus refuted", status("verificationStatus", "refuted")],
    ["verificationStatus entered-in-error", status("verificationStatus", "entered-in-error")],
    ["clinicalStatus resolved", status("clinicalStatus", "resolved")],
  ])("%s is ignored", (_label, st) => {
    const r = importDiagnosisConditions([cond(ICD10_SYSTEM, "K04.0", { ...fdi("11"), ...st })], twoCariedTeeth);
    expect(r.dxOverridesByTooth).toEqual({});     // no `pulpitis: add`, and the section never engaged
  });

  it("a confirmed/active Condition is still imported", () => {
    const st = { ...status("verificationStatus", "confirmed"), ...status("clinicalStatus", "active") };
    const r = importDiagnosisConditions([cond(ICD10_SYSTEM, "K04.0", { ...fdi("11"), ...st })], twoCariedTeeth);
    expect(r.dxOverridesByTooth["11"]).toMatchObject({ pulpitis: "add" });
  });

  it("a refuted CASE Condition is ignored too", () => {
    const r = importDiagnosisConditions(
      [cond(ICD10_SYSTEM, "K07.6", status("verificationStatus", "refuted"))],
      twoCariedTeeth,
    );
    expect(r.caseConditions).toEqual({});
  });
});

describe("perio import: foreign-bundle robustness", () => {
  const panel = (extra: Record<string, unknown>) => ({
    resource: {
      resourceType: "Observation", code: { coding: [{ system: LOINC_SYSTEM, code: LOINC.panel.code }] },
      bodySite: { coding: [{ system: FDI_SYSTEM, code: "11" }] }, ...extra,
    },
  });
  const pdComponent = (site: string, value: number) => ({
    code: { coding: [{ system: LOINC_SYSTEM, code: LOINC.pd.code }] },
    extension: [{
      url: "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite",
      valueCodeableConcept: { coding: [{ system: LOCAL_SYSTEM, code: `perio-site:${site}` }] },
    }],
    valueQuantity: { value },
  });

  it("a non-array `coding` does not throw", () => {
    // `parseFhirBundle`'s contract is that it never throws on malformed input.
    const bundle = { resourceType: "Bundle", entry: [
      { resource: { resourceType: "Observation", code: { coding: {} } } },
      { resource: { resourceType: "Observation", code: { coding: [{ system: LOINC_SYSTEM, code: LOINC.panel.code }] }, bodySite: { coding: {} } } },
    ] };
    expect(() => parseFhirBundle(bundle)).not.toThrow();
    const teeth: Record<string, never> = {};
    expect(() => importPerioObservations(bundle.entry, teeth)).not.toThrow();
  });

  it.each(["entered-in-error", "cancelled"])("an Observation with status %s is skipped", (st) => {
    const teeth: Record<string, unknown> = {};
    importPerioObservations([panel({ status: st, component: [pdComponent("MB", 5)] })], teeth as never);
    expect(teeth["11"]).toBeUndefined();
  });

  it("a final Observation is still imported", () => {
    const teeth: Record<string, unknown> = {};
    importPerioObservations([panel({ status: "final", component: [pdComponent("MB", 5)] })], teeth as never);
    expect((teeth["11"] as { perio?: { pd?: Record<string, number> } })?.perio?.pd).toEqual({ MB: 5 });
  });
});

describe("perio import: HbA1c carries a unit", () => {
  const hba1c = (valueQuantity: Record<string, unknown>) => ([{
    resource: {
      resourceType: "Observation",
      code: { coding: [{ system: LOINC_SYSTEM, code: LOINC.hba1c.code }] },
      valueQuantity,
    },
  }]);
  const read = (valueQuantity: Record<string, unknown>) =>
    importPerioObservations(hba1c(valueQuantity), {}).case.hba1c;

  it("an explicit percent value is taken as-is", () => {
    expect(read({ value: 7.8, unit: "%", code: "%" })).toBe(7.8);
  });

  it("IFCC mmol/mol is converted to NGSP percent, not read as a percentage", () => {
    // 42 mmol/mol is a NORMAL result; read as 42 % it clamped to the 20 % ceiling
    // and turned a healthy patient into grade C.
    expect(read({ value: 42, unit: "mmol/mol", code: "mmol/mol" })).toBe(6);
    expect(read({ value: 53, code: "mmol/mol" })).toBe(7);
  });

  it("an unlabelled value is accepted only where a percentage is plausible", () => {
    expect(read({ value: 7.8 })).toBe(7.8);
    expect(read({ value: 42 })).toBeUndefined();
  });

  it("an uninterpretable unit is ignored rather than guessed", () => {
    expect(read({ value: 7.8, code: "mg/dL" })).toBeUndefined();
  });
});
