import { it, expect } from "vitest";
import { CASE_DX_CODES, LATERALIZABLE_CASE_KEYS, VALID_LATERALITY, type CaseConditionKey } from "../caseCodes";

it("has 28 conditions, each with a valid ICD-10 code and non-empty display", () => {
  const keys = Object.keys(CASE_DX_CODES) as CaseConditionKey[];
  expect(keys.length).toBe(28);
  for (const k of keys) {
    expect(CASE_DX_CODES[k].icd10).toMatch(/^K\d{2}(\.\d)?$/);
    expect(CASE_DX_CODES[k].icd10Display.length).toBeGreaterThan(0);
  }
});
it("marks exactly 14 lateralizable keys, all in the catalog", () => {
  expect(LATERALIZABLE_CASE_KEYS.size).toBe(14);
  for (const k of LATERALIZABLE_CASE_KEYS) expect(k in CASE_DX_CODES).toBe(true);
  // and the flag agrees with the set
  for (const k of Object.keys(CASE_DX_CODES) as CaseConditionKey[])
    expect(CASE_DX_CODES[k].lateralizable).toBe(LATERALIZABLE_CASE_KEYS.has(k));
});
it("VALID_LATERALITY is the four values", () => {
  expect([...VALID_LATERALITY].sort()).toEqual(["bilateral", "left", "right", "unspecified"]);
});
