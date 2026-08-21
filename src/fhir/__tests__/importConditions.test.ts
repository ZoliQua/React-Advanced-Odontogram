// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { importDiagnosisConditions, CATALOG } from "../importConditions";
import { LOCAL_SYSTEM } from "../codesystems";
import { TOOTH_LEVEL_DX_KEYS } from "../../odontogram"; // test-only import (drift guard)

const cond = (o: any) => ({ resource: { resourceType: "Condition", ...o } });
const obs = () => ({ resource: { resourceType: "Observation" } });

describe("importDiagnosisConditions", () => {
  it("imports a case condition with laterality from the bodySite", () => {
    const { caseConditions } = importDiagnosisConditions([
      cond({ id: "odontogram-case-tmjDisorder", bodySite: [{ coding: [{ system: LOCAL_SYSTEM, code: "laterality:right" }] }] }),
    ], {});
    expect(caseConditions.tmjDisorder).toBe("right");
  });

  it("coerces a non-lateralizable case condition to unspecified", () => {
    const { caseConditions } = importDiagnosisConditions([
      cond({ id: "odontogram-case-anodontia", bodySite: [{ coding: [{ system: LOCAL_SYSTEM, code: "laterality:left" }] }] }),
    ], {});
    expect(caseConditions.anodontia).toBe("unspecified");
  });

  it("recognizes a case condition by WHO code when the id doesn't match", () => {
    const { caseConditions } = importDiagnosisConditions([
      cond({ id: "external-1", code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "K07.6" }] } }),
    ], {});
    expect(caseConditions.tmjDisorder).toBe("unspecified");
  });

  it("reconstructs an 'add' override: a dental Condition with no matching derived finding", () => {
    // tooth 11 has no chart findings, but a calculus Condition is present
    const { dxOverridesByTooth } = importDiagnosisConditions([
      cond({ id: "odontogram-dx-calculus-11" }),
    ], { "11": { toothSelection: "tooth-base" } });
    expect(dxOverridesByTooth["11"]).toEqual({ calculus: "add" });
  });

  it("reconstructs a 'suppress' override: derived finding whose Condition is absent (section present)", () => {
    // tooth 11 derives caries (from the chart) AND another dental Condition exists (section present),
    // but no caries Condition for 11 -> caries suppressed
    const { dxOverridesByTooth } = importDiagnosisConditions([
      cond({ id: "odontogram-dx-calculus-11" }),
    ], { "11": { toothSelection: "tooth-base", caries: ["occlusal"], calculus: true } });
    expect(dxOverridesByTooth["11"]).toEqual({ caries: "suppress" });
  });

  it("SAFEGUARD B: a chart-only bundle (no Conditions) produces NO overrides", () => {
    const { dxOverridesByTooth } = importDiagnosisConditions([obs()], { "11": { toothSelection: "tooth-base", caries: ["occlusal"] } });
    expect(dxOverridesByTooth).toEqual({});
  });

  it("SAFEGUARD A: the local catalog equals the real TOOTH_LEVEL_DX_KEYS (drift guard)", async () => {
    // no peri-implant override is ever produced even if a peri-implant Condition appears
    const { dxOverridesByTooth } = importDiagnosisConditions([
      cond({ id: "odontogram-dx-periImplantitis-36" }),
    ], { "36": { toothSelection: "implant", periImplant: "peri-implantitis-severe" } });
    expect(dxOverridesByTooth["36"]).toBeUndefined();
    // and the local CATALOG the importer uses is exactly the real exported catalog (no drift)
    expect([...CATALOG].sort()).toEqual([...TOOTH_LEVEL_DX_KEYS].sort());
  });

  it("rejects an Object.prototype-name case id without creating a spurious entry", () => {
    const { caseConditions } = importDiagnosisConditions([
      cond({ id: "odontogram-case-toString" }),
    ], {});
    expect(caseConditions).toEqual({});
    expect(Object.prototype.hasOwnProperty.call(caseConditions, "toString")).toBe(false);
  });

  it("rejects an Object.prototype-name WHO code fallback without creating a spurious entry", () => {
    const { caseConditions } = importDiagnosisConditions([
      cond({ id: "external-2", code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "constructor" }] } }),
    ], {});
    expect(caseConditions).toEqual({});
  });
});
