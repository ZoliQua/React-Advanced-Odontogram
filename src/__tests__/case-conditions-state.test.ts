// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { getCaseConditions, setCaseCondition, resetCaseMeta, __collectExportPayloadForTest as collect } from "../odontogram";

beforeEach(() => resetCaseMeta());

describe("case-level conditions (caseConditions)", () => {
  it("adds, updates laterality, and removes a case condition", () => {
    setCaseCondition("tmjDisorder", "unspecified");
    expect(getCaseConditions().map((c) => c.key)).toContain("tmjDisorder");
    setCaseCondition("tmjDisorder", "right");
    expect(getCaseConditions().find((c) => c.key === "tmjDisorder")!.laterality).toBe("right");
    setCaseCondition("tmjDisorder", null);
    expect(getCaseConditions()).toEqual([]);
  });
  it("coerces a non-lateralizable key's laterality to unspecified", () => {
    setCaseCondition("anodontia", "left");
    expect(getCaseConditions().find((c) => c.key === "anodontia")!.laterality).toBe("unspecified");
  });
  it("returns conditions sorted by ICD-10 code, not catalog order", () => {
    // anodontia (K00.0) sits AFTER jawSizeAnomaly (K07.0) in the catalog, but its
    // code is lower — added last, it must still come first when code-sorted.
    setCaseCondition("jawSizeAnomaly", "unspecified"); // K07.0
    setCaseCondition("lipDisease", "unspecified");     // K13.0
    setCaseCondition("anodontia", "unspecified");      // K00.0 (catalog-late)
    expect(getCaseConditions().map((c) => c.icd10)).toEqual(["K00.0", "K07.0", "K13.0"]);
  });
  it("ignores unknown keys and invalid laterality", () => {
    setCaseCondition("nope", "left");
    setCaseCondition("tmjDisorder", "sideways" as any);
    expect(getCaseConditions()).toEqual([]);
  });
  it("serializes omit-when-empty and bumps the payload version to 2.22", () => {
    expect(collect().version).toBe("2.22");
    expect(collect().case).toBeUndefined();       // no case data → no case block
    setCaseCondition("leukoplakia", "bilateral");
    expect((collect().case as any).caseConditions).toEqual({ leukoplakia: "bilateral" });
  });
  it("rejects inherited Object.prototype names as case-condition keys (prototype-safe guard)", () => {
    setCaseCondition("toString", "unspecified");
    setCaseCondition("constructor", "left");
    expect(getCaseConditions()).toEqual([]);
    expect(collect().case).toBeUndefined();
  });
  it("still accepts a real catalog key (sanity, unchanged behavior)", () => {
    setCaseCondition("tmjDisorder", "right");
    expect(getCaseConditions().find((c) => c.key === "tmjDisorder")!.laterality).toBe("right");
  });
});
