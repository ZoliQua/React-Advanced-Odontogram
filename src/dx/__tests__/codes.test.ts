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
