// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, getOdontogramSummary, __setToothStateForTest } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";
beforeEach(() => setI18nLanguage("en"));
describe("SP12 Task 4: discoloration in summaries", () => {
  it("tooltip shows the cause", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", discoloration: "tetracycline" });
    expect(getToothStateSummary(11).join(" · ")).toContain(t("discoloration.tetracycline"));
  });
  it("whole-mouth has a discoloration section listing the tooth", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", discoloration: "fluorosis" });
    const d = getOdontogramSummary().sections.find(s => s.key === "discoloration")!;
    expect(d).toBeTruthy();
    expect(d.items.join(" | ")).toContain(t("discoloration.fluorosis"));
  });
  it("suppressed under a crown (gate consistency)", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon", discoloration: "tetracycline" });
    expect(getToothStateSummary(16).join(" · ")).not.toContain(t("discoloration.tetracycline"));
    const d = getOdontogramSummary().sections.find(s => s.key === "discoloration")!;
    expect(d.items.join(" | ")).not.toContain("16 (");
  });
});
