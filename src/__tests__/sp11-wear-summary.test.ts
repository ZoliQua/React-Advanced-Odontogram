// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, getOdontogramSummary, __setToothStateForTest } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";
beforeEach(() => setI18nLanguage("en"));
describe("SP11: wear in summaries", () => {
  it("tooltip shows type per location", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", wearEdge: "attrition", wearCervical: "abrasion" });
    const j = getToothStateSummary(16).join(" · ");
    expect(j).toContain(t("wearType.attrition"));
    expect(j).toContain(t("wearType.abrasion"));
  });
  it("whole-mouth has a wear section listing the tooth", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", wearCervical: "abfraction" });
    const w = getOdontogramSummary().sections.find(s => s.key === "wear")!;
    expect(w).toBeTruthy();
    expect(w.items.join(" | ")).toContain(t("wearType.abfraction"));
  });

  // Review fix (post-SP11): the render/UI wear row gate on
  // wearRowAllowed (tooth-base + restorationType none + substrate natural).
  // A crowned or non-natural-substrate tooth must not surface stored
  // wearEdge/wearCervical values in either summary site, mirroring the SP10
  // fillingDefect gating.
  it("tooltip suppresses wear on a crowned tooth", () => {
    __setToothStateForTest(17, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep",
      restorationType: "crown", restorationMaterial: "emax", wearEdge: "attrition",
    });
    const j = getToothStateSummary(17).join(" · ");
    expect(j).not.toContain(t("wearType.attrition"));
    const w = getOdontogramSummary().sections.find(s => s.key === "wear")!;
    // Other tests in this file leave their own teeth in the wear section (module
    // state persists across `it` blocks), so assert tooth 17 specifically is
    // absent rather than asserting the whole section is empty.
    expect(w.items.some(item => item.startsWith("17 ("))).toBe(false);
  });

  it("tooltip suppresses wear on a non-natural substrate (radix)", () => {
    __setToothStateForTest(27, { toothSelection: "tooth-base", toothSubstrate: "radix", wearCervical: "abrasion" });
    const j = getToothStateSummary(27).join(" · ");
    expect(j).not.toContain(t("wearType.abrasion"));
    const w = getOdontogramSummary().sections.find(s => s.key === "wear")!;
    expect(w.items.some(item => item.startsWith("27 ("))).toBe(false);
  });
});
