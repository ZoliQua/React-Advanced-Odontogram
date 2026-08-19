import { describe, it, expect } from "vitest";
import { buildConditionCode, appendDentalConditions } from "../fhir/toFhirDx";
import { BNO10_PACK, BNO10_SYSTEM } from "../dx/packs";
import { ICD10_SYSTEM } from "../fhir/codesystems";
import type { Bundle, Condition, OdontogramExportPayload } from "../fhir/types";

const payload = { version: "2.20", globals: {}, teeth: { "16": { caries: ["occlusal"] } } } as unknown as OdontogramExportPayload;

describe("dental Condition emission (DX-0)", () => {
  it("buildConditionCode emits the WHO base coding by default", () => {
    const cc = buildConditionCode("caries");
    expect(cc.coding).toEqual([{ system: ICD10_SYSTEM, code: "K02", display: "Dental caries" }]);
    expect(cc.text).toBe("Dental caries");
  });
  it("buildConditionCode adds the pack coding (same code) for a translation pack", () => {
    const cc = buildConditionCode("caries", BNO10_PACK);
    expect(cc.coding).toEqual([
      { system: ICD10_SYSTEM, code: "K02", display: "Dental caries" },
      { system: BNO10_SYSTEM, code: "K02", display: "Fogszuvasodás" },
    ]);
  });
  it("appendDentalConditions emits one K02 Condition per carious tooth", () => {
    const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, payload);
    const conditions = (bundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is Condition => r?.resourceType === "Condition");
    expect(conditions).toHaveLength(1);
    expect(conditions[0]?.code?.coding?.[0]).toEqual({ system: ICD10_SYSTEM, code: "K02", display: "Dental caries" });
    expect(conditions[0]?.bodySite?.[0]?.coding?.[0]?.code).toBe("16");
  });
  it("appendDentalConditions adds the BNO coding when the pack is passed", () => {
    const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, payload, { codingPack: BNO10_PACK });
    const cond = (bundle.entry ?? [])
      .map((e) => e.resource)
      .find((r): r is Condition => r?.resourceType === "Condition");
    expect(cond?.code?.coding?.some((c) => c.system === BNO10_SYSTEM && c.code === "K02")).toBe(true);
  });
  it("appendDentalConditions emits the DECIDUOUS ISO code as bodySite for a milk tooth with an equivalent", () => {
    // "14" (permanent upper-right 1st premolar position) -> deciduous "54" per FDI_TO_DECIDUOUS.
    const milkPayload = {
      version: "2.20",
      globals: {},
      teeth: { "14": { toothSelection: "milktooth", caries: ["occlusal"] } },
    } as unknown as OdontogramExportPayload;
    const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, milkPayload);
    const conditions = (bundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is Condition => r?.resourceType === "Condition");
    expect(conditions).toHaveLength(1);
    expect(conditions[0]?.bodySite?.[0]?.coding?.[0]?.code).toBe("54");
  });
  it("appendDentalConditions still emits the permanent FDI code as bodySite for a non-milk tooth", () => {
    const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, payload);
    const conditions = (bundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is Condition => r?.resourceType === "Condition");
    expect(conditions[0]?.bodySite?.[0]?.coding?.[0]?.code).toBe("16");
  });
  it("emits the hard-tissue Conditions with their WHO codes", () => {
    const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, { version: "2.20", globals: {}, teeth: {
      "16": { toothSelection: "tooth-base", wearEdge: "attrition", calculus: true, resorptionType: "internal" },
    } } as unknown as OdontogramExportPayload);
    const codes = (bundle.entry ?? []).map((e) => e.resource).filter((r): r is import("../fhir/types").Condition => r?.resourceType === "Condition")
      .map((c) => c.code?.coding?.[0]?.code).sort();
    expect(codes).toEqual(["K03.0", "K03.3", "K03.6"]);
  });
  it("emits pulp + apical Conditions, cyst overriding the periodontitis code", () => {
    const bundle: Bundle = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, { version: "2.20", globals: {}, teeth: {
      "16": { toothSelection: "tooth-base", pulpDx: "necrosis", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "cyst" },
    } } as unknown as OdontogramExportPayload);
    const codes = (bundle.entry ?? []).map((e) => e.resource).filter((r): r is import("../fhir/types").Condition => r?.resourceType === "Condition")
      .map((c) => c.code?.coding?.[0]?.code).sort();
    expect(codes).toEqual(["K04.1", "K04.8"]); // necrosis + radicular cyst (not K04.5)
  });
  it("emits an S02.5 Condition for a broken tooth", () => {
    const bundle: any = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, { teeth: { "11": { toothSelection: "tooth-base", brokenIncisal: true } } } as any);
    const dx = bundle.entry.find((e: any) => e.resource.id === "odontogram-dx-toothFracture-11");
    expect(dx.resource.code.coding[0].code).toBe("S02.5");
    expect(dx.resource.bodySite[0].coding[0].code).toBe("11");
  });
  it("emits no Condition for uncoded peri-implant disease", () => {
    const bundle: any = { resourceType: "Bundle", type: "collection", entry: [] };
    appendDentalConditions(bundle, { teeth: { "36": { toothSelection: "implant", periImplant: "peri-implantitis-severe" } } } as any);
    expect(bundle.entry.some((e: any) => String(e.resource.id).includes("periImplant"))).toBe(false);
  });
});
