// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { appendCaseConditions } from "../fhir/toFhirCase";

const bundle = () => ({ resourceType: "Bundle", type: "collection", entry: [] }) as any;
const find = (b: any, id: string) => b.entry.find((e: any) => e.resource.id === id)?.resource;

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
});
