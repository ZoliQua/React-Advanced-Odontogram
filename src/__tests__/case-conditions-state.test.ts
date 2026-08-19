// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
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
