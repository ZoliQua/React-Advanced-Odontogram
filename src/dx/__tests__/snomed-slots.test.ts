// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Interop arc part C — the SNOMED CT slots of the diagnosis catalogs. Every id
// must be a syntactically valid SCTID (Verhoeff check digit) in the International
// concept partition ("00" before the check digit — the extension partition "10"
// would mean a national-extension concept), ids must be unique across keys, and
// exactly the two documented keys stay unset. The export test proves a filled
// slot lights up as a SNOMED coding only when the overlay is enabled.
import { describe, it, expect } from "vitest";
import { DX_CODES, type DiagnosisKey } from "../codes";
import { CASE_DX_CODES, type CaseConditionKey } from "../caseCodes";
import { buildConditionCode } from "../../fhir/toFhirDx";
import { buildCaseConditionCode } from "../../fhir/toFhirCase";
import { SNOMED_SYSTEM } from "../../fhir/codesystems";

// Verhoeff (SCTID check digit)
const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
function verhoeffValid(id: string): boolean {
  let c = 0;
  const digits = id.split("").reverse().map(Number);
  for (let i = 0; i < digits.length; i++) c = D[c][P[i % 8][digits[i]]];
  return c === 0;
}
const isIntlConceptId = (id: string) => /^\d{6,18}$/.test(id) && id.slice(-3, -1) === "00" && verhoeffValid(id);

const UNSET_CASE: CaseConditionKey[] = ["jawSizeAnomaly", "dentofacialFunctional"];

describe("SNOMED slots — validity", () => {
  it("every DX_CODES key has a valid International concept id", () => {
    for (const k of Object.keys(DX_CODES) as DiagnosisKey[]) {
      const s = DX_CODES[k].snomed;
      expect(typeof s === "string" && s.length > 0, `${k} has no snomed`).toBe(true);
      expect(isIntlConceptId(s!), `${k}: ${s} is not a valid International SCTID`).toBe(true);
    }
  });
  it("every CASE_DX_CODES key except the two documented gaps has a valid International concept id", () => {
    for (const k of Object.keys(CASE_DX_CODES) as CaseConditionKey[]) {
      const s = CASE_DX_CODES[k].snomed;
      if (UNSET_CASE.includes(k)) { expect(s, `${k} must stay unset (documented)`).toBeUndefined(); continue; }
      expect(typeof s === "string" && s.length > 0, `${k} has no snomed`).toBe(true);
      expect(isIntlConceptId(s!), `${k}: ${s} is not a valid International SCTID`).toBe(true);
    }
  });
  it("ids are unique across both catalogs (no copy-paste duplicates)", () => {
    const all = [
      ...Object.values(DX_CODES).map((c) => c.snomed),
      ...Object.values(CASE_DX_CODES).map((c) => c.snomed),
    ].filter((s): s is string => !!s);
    expect(new Set(all).size).toBe(all.length);
  });
  it("the Verhoeff helper itself is sound", () => {
    expect(verhoeffValid("80967001")).toBe(true);   // Dental caries
    expect(verhoeffValid("80967002")).toBe(false);  // one digit off
    expect(isIntlConceptId("323351000119108")).toBe(false); // US-extension partition "10"
  });
});

describe("SNOMED slots — export", () => {
  it("a newly filled tooth key and a case key emit the SNOMED coding only with the overlay on", () => {
    const on = buildConditionCode("calculus", undefined, true)!;
    expect(on.coding!.find((c) => c.system === SNOMED_SYSTEM)).toMatchObject({ code: "17552000", display: "Deposits [accretions] on teeth" });
    const off = buildConditionCode("calculus", undefined, false)!;
    expect(off.coding!.some((c) => c.system === SNOMED_SYSTEM)).toBe(false);
    const kase = buildCaseConditionCode("sialolithiasis", undefined, true);
    expect(kase.coding.find((c) => c.system === SNOMED_SYSTEM)).toMatchObject({ code: "28826002" });
    const gap = buildCaseConditionCode("jawSizeAnomaly", undefined, true);
    expect(gap.coding.some((c) => c.system === SNOMED_SYSTEM)).toBe(false); // documented gap
  });
});
