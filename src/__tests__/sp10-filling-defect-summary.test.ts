// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, getOdontogramSummary, __setToothStateForTest } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

describe("SP10 Task 4: filling-defect in summaries", () => {
  it("tooltip lists the defect type", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", fillingSurfaceMaterials: { occlusal: "composite" }, fillingDefect: { occlusal: "fracture" } });
    expect(getToothStateSummary(16).join(" · ")).toContain(t("fillingDefect.fracture"));
  });
  it("whole-mouth folds the defect into the fillings section", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", fillingSurfaceMaterials: { distal: "gic" }, fillingDefect: { distal: "marginal" } });
    const fills = getOdontogramSummary().sections.find(s => s.key === "fillings")!;
    expect(fills.items.join(" | ")).toContain(t("fillingDefect.marginal"));
  });

  // Whole-branch-review fix: the render (applyStateToSvgSingle) suppresses
  // fillings/defects entirely under a crown/bridge (gated on !hasCrown); the
  // two summary sites must match, or a crowned tooth surfaces a bogus defect
  // that the chart never draws.
  it("tooltip suppresses the defect on a crowned tooth", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      restorationType: "crown",
      restorationMaterial: "zircon",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    expect(getToothStateSummary(16).join(" · ")).not.toContain(t("fillingDefect.fracture"));
  });

  it("whole-mouth suppresses the defect suffix on a crowned tooth", () => {
    __setToothStateForTest(26, {
      toothSelection: "tooth-base",
      restorationType: "crown",
      restorationMaterial: "zircon",
      fillingSurfaceMaterials: { distal: "gic" },
      fillingDefect: { distal: "marginal" },
    });
    const fills = getOdontogramSummary().sections.find(s => s.key === "fillings")!;
    // Base filling-presence line stays (pre-existing, out of scope), only the
    // defect suffix is suppressed.
    expect(fills.items.join(" | ")).not.toContain(t("fillingDefect.marginal"));
  });
});
