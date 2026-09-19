// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { appendCaseConditions, buildCaseConditionCode } from "../fhir/toFhirCase";
import { BNO10_PACK } from "../dx/packs";
import type { CodingPack } from "../dx/packs";

const bundle = () => ({ resourceType: "Bundle", type: "collection", entry: [] }) as any;
const find = (b: any, id: string) => b.entry.find((e: any) => e.resource.id === id)?.resource;

const FAKE_MOD: CodingPack = {
  id: "fake", system: "http://example.org/fake", kind: "modification",
  caseCodes: { tmjDisorder: { code: "M26.609", display: "TMJ disorder (fake)" } },
};

describe("appendCaseConditions", () => {
  it("emits a patient-level Condition with a laterality bodySite for a lateralized condition", () => {
    const b = bundle();
    appendCaseConditions(b, { case: { caseConditions: { tmjDisorder: "right" } } } as any);
    const c = find(b, "odontogram-case-tmjDisorder");
    expect(c.code.coding[0].code).toBe("K07.6");
    expect(c.subject.reference).toBeTruthy();
    expect(c.bodySite[0].coding[0].code).toBe("laterality:right");
    expect(c.bodySite[0].coding[0].system).toBeTruthy();
  });
  it("emits no bodySite for a non-lateralized (unspecified) condition", () => {
    const b = bundle();
    appendCaseConditions(b, { case: { caseConditions: { anodontia: "unspecified" } } } as any);
    expect(find(b, "odontogram-case-anodontia").bodySite).toBeUndefined();
  });
  it("emits nothing when there are no case conditions", () => {
    const b = bundle();
    appendCaseConditions(b, { case: {} } as any);
    appendCaseConditions(b, {} as any);
    expect(b.entry.length).toBe(0);
  });
  it("uses the BNO-10 Hungarian case display under the pack system", () => {
    const b: any = { resourceType: "Bundle", type: "collection", entry: [] };
    appendCaseConditions(b, { case: { caseConditions: { tmjDisorder: "right" } } } as any, { codingPack: BNO10_PACK } as any);
    const c = b.entry.find((e: any) => e.resource.id === "odontogram-case-tmjDisorder").resource;
    // WHO coding first (English), then the BNO coding with the Hungarian display.
    // BNO-10 shares the standard ICD-10 system URI (same codes, localized display).
    expect(c.code.coding[0]).toMatchObject({ code: "K07.6", display: "Temporomandibular joint disorder" });
    expect(c.code.coding[1]).toMatchObject({ system: "http://hl7.org/fhir/sid/icd-10", code: "K07.6", display: "A temporomandibularis ízület betegségei" });
  });
  it("a modification pack remaps a case condition code", () => {
    const cc = buildCaseConditionCode("tmjDisorder", FAKE_MOD);
    expect(cc.coding[0]).toMatchObject({ code: "K07.6", display: "Temporomandibular joint disorder" }); // WHO base first
    expect(cc.coding[1]).toEqual({ system: "http://example.org/fake", code: "M26.609", display: "TMJ disorder (fake)" });
  });
  it("a modification pack with no caseCode for a key adds no second coding", () => {
    const cc = buildCaseConditionCode("anodontia", FAKE_MOD);
    expect(cc.coding.length).toBe(1); // WHO base only
  });
  it("a translation pack (BNO-10) still localizes the display, same code (unchanged)", () => {
    const cc = buildCaseConditionCode("tmjDisorder", BNO10_PACK);
    expect(cc.coding[1]).toMatchObject({ code: "K07.6", display: "A temporomandibularis ízület betegségei" });
  });
  it("adds the SNOMED laterality qualifier to the bodySite only when snomed is on", () => {
    const on: any = { resourceType: "Bundle", type: "collection", entry: [] };
    appendCaseConditions(on, { case: { caseConditions: { tmjDisorder: "right" } } } as any, { snomed: true } as any);
    const bs = on.entry[0].resource.bodySite[0].coding;
    expect(bs.some((c: any) => c.system === "http://snomed.info/sct" && c.code === "24028007")).toBe(true);
    expect(bs.some((c: any) => String(c.code).startsWith("laterality:"))).toBe(true); // local kept
    const off: any = { resourceType: "Bundle", type: "collection", entry: [] };
    appendCaseConditions(off, { case: { caseConditions: { tmjDisorder: "right" } } } as any);
    expect(off.entry[0].resource.bodySite[0].coding.every((c: any) => c.system !== "http://snomed.info/sct")).toBe(true);
  });
});
