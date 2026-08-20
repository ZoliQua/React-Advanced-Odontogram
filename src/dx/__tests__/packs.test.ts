import { describe, it, expect } from "vitest";
import { BNO10_PACK, BNO10_SYSTEM, ICD10CM_PACK, ICD10CM_SYSTEM, resolveCodingPack, packCoding } from "../packs";
import { DX_CODES, type DiagnosisKey } from "../codes";
import { CASE_DX_CODES, type CaseConditionKey } from "../caseCodes";
import { buildConditionCode } from "../../fhir/toFhirDx";
import { buildCaseConditionCode } from "../../fhir/toFhirCase";

describe("coding packs", () => {
  it("resolves a pack id, or undefined for none/unknown", () => {
    expect(resolveCodingPack("bno10")).toBe(BNO10_PACK);
    expect(resolveCodingPack("none")).toBeUndefined();
    expect(resolveCodingPack(null)).toBeUndefined();
    expect(resolveCodingPack("nope")).toBeUndefined();
  });
  it("a translation pack keeps the SAME code and only localizes the display", () => {
    const c = packCoding(BNO10_PACK, "caries", "K02", "Dental caries");
    expect(c).toEqual({ system: BNO10_SYSTEM, code: "K02", display: "Fogszuvasodás" });
  });
  it("has a Hungarian display for every CODED tooth-level diagnosis", () => {
    for (const key of Object.keys(DX_CODES) as DiagnosisKey[]) {
      if (!DX_CODES[key].icd10) continue; // uncoded (peri-implant) — no display needed
      const d = BNO10_PACK.displays?.[key];
      expect(typeof d === "string" && d.length > 0).toBe(true);
    }
  });
  it("localizes a newly-added tooth key display under the BNO system, same code", () => {
    const c = packCoding(BNO10_PACK, "pulpitis", "K04.0", "Pulpitis");
    expect(c).toEqual({ system: BNO10_SYSTEM, code: "K04.0", display: "Fogbélgyulladás (pulpitis)" });
  });
  it("has a Hungarian display for every case-level diagnosis", () => {
    for (const key of Object.keys(CASE_DX_CODES) as CaseConditionKey[]) {
      const d = BNO10_PACK.caseDisplays?.[key];
      expect(typeof d === "string" && d.length > 0).toBe(true);
    }
  });
});

describe("ICD-10-CM modification pack", () => {
  it("registers the ICD-10-CM modification pack", () => {
    expect(resolveCodingPack("icd10cm")).toBe(ICD10CM_PACK);
    expect(ICD10CM_PACK.kind).toBe("modification");
  });
  it("has a CM code for every coded tooth key and every case key (drift-proof)", () => {
    for (const key of Object.keys(DX_CODES) as DiagnosisKey[]) {
      if (!DX_CODES[key].icd10) continue;
      const m = ICD10CM_PACK.codes?.[key];
      expect(typeof m?.code === "string" && m.code.length > 0 && m.display.length > 0).toBe(true);
    }
    for (const key of Object.keys(CASE_DX_CODES) as CaseConditionKey[]) {
      const m = ICD10CM_PACK.caseCodes?.[key];
      expect(typeof m?.code === "string" && m.code.length > 0 && m.display.length > 0).toBe(true);
    }
  });
  it("remaps caries to K02.9 (tooth) and the K07.6 TMJ disorder to M26.609 (case)", () => {
    const tooth = buildConditionCode("caries", ICD10CM_PACK);
    expect(tooth?.coding?.[1]).toEqual({ system: ICD10CM_SYSTEM, code: "K02.9", display: "Dental caries, unspecified" });
    const kase = buildCaseConditionCode("tmjDisorder", ICD10CM_PACK);
    expect(kase.coding[1]).toEqual({ system: ICD10CM_SYSTEM, code: "M26.609", display: "Unspecified temporomandibular joint disorder, unspecified side" });
  });
});
