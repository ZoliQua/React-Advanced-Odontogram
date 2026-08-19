import { describe, it, expect } from "vitest";
import { DX_CODES } from "../codes";

describe("DX_CODES base WHO ICD-10 catalog", () => {
  it("maps the DX-0 diagnoses to their WHO ICD-10 codes", () => {
    expect(DX_CODES.caries.icd10).toBe("K02");
    expect(DX_CODES.caries.icd10Display).toBe("Dental caries");
    expect(DX_CODES.gingivitis.icd10).toBe("K05.1");
    expect(DX_CODES.periodontitis.icd10).toBe("K05.3");
  });
  it("every entry has a non-empty display and code", () => {
    for (const [key, c] of Object.entries(DX_CODES)) {
      expect(c.icd10, key).toMatch(/^K\d{2}(\.\d)?$/);
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
