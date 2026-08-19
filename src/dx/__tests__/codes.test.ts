import { describe, it, expect } from "vitest";
import { DX_CODES } from "../codes";
import { buildConditionCode } from "../../fhir/toFhirDx";
import { TOOTH_LEVEL_DX_KEYS } from "../../odontogram";

describe("DX_CODES base WHO ICD-10 catalog", () => {
  it("maps the DX-0 diagnoses to their WHO ICD-10 codes", () => {
    expect(DX_CODES.caries.icd10).toBe("K02");
    expect(DX_CODES.caries.icd10Display).toBe("Dental caries");
    expect(DX_CODES.gingivitis.icd10).toBe("K05.1");
    expect(DX_CODES.periodontitis.icd10).toBe("K05.3");
  });
  it("every entry has a non-empty display, and a WHO code when coded", () => {
    // toothFracture is WHO S02.5 (not a K-code, checked separately below);
    // periImplantMucositis/periImplantitis are intentionally uncoded (no icd10) —
    // the "uncoded diagnosis" capability (DX-3a).
    const uncoded = new Set(["periImplantMucositis", "periImplantitis"]);
    const nonK = new Set(["toothFracture"]);
    for (const [key, c] of Object.entries(DX_CODES)) {
      if (uncoded.has(key)) {
        expect(c.icd10, key).toBeUndefined();
      } else if (!nonK.has(key)) {
        expect(c.icd10, key).toMatch(/^K\d{2}(\.\d)?$/);
      }
      expect(c.icd10Display.length, key).toBeGreaterThan(0);
    }
  });
});

describe("DX-1 catalog additions", () => {
  const expected: Record<string, string> = {
    cariesCementum: "K02.2", cariesArrested: "K02.3",
    pulpitis: "K04.0", pulpNecrosis: "K04.1",
    apicalPeriodontitisAcute: "K04.4", apicalPeriodontitisChronic: "K04.5",
    radicularCyst: "K04.8", periapicalAbscess: "K04.7", periapicalAbscessSinus: "K04.6",
    condensingOsteitis: "K04.9",
    resorption: "K03.3", attrition: "K03.0", abrasion: "K03.1", erosion: "K03.2",
    abfraction: "K03.8", calculus: "K03.6",
    fluorosis: "K00.3", tetracyclineStain: "K00.8", postEruptiveColour: "K03.7",
    toothLoss: "K08.1", retainedRoot: "K08.3",
  };
  it("maps every DX-1 diagnosis to its WHO ICD-10 code", () => {
    for (const [key, code] of Object.entries(expected)) {
      expect(DX_CODES[key as keyof typeof DX_CODES]?.icd10, key).toBe(code);
    }
  });
});

describe("DX-3a uncoded-diagnosis capability", () => {
  it("codes toothFracture as WHO S02.5", () => {
    const cc = buildConditionCode("toothFracture");
    expect(cc?.coding?.[0]).toMatchObject({ code: "S02.5" });
  });
  it("returns null for an uncoded peri-implant diagnosis", () => {
    expect(buildConditionCode("periImplantitis")).toBeNull();
    expect(buildConditionCode("periImplantMucositis")).toBeNull();
  });
  it("peri-implant keys have a display but no icd10", () => {
    expect(DX_CODES.periImplantitis.icd10).toBeUndefined();
    expect(DX_CODES.periImplantitis.icd10Display).toBe("Peri-implantitis");
  });
  it("TOOTH_LEVEL_DX_KEYS includes fracture, excludes peri-implant, and is size 23", () => {
    expect(TOOTH_LEVEL_DX_KEYS.has("toothFracture")).toBe(true);
    expect(TOOTH_LEVEL_DX_KEYS.has("periImplantitis")).toBe(false);
    expect(TOOTH_LEVEL_DX_KEYS.has("periImplantMucositis")).toBe(false);
    expect(TOOTH_LEVEL_DX_KEYS.size).toBe(23);
  });
});
