// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import { getOdontogramSummary, getToothStateSummary, __setToothStateForTest } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => setI18nLanguage("en"));

// SP15 Task 5 (B3): "If a filling has a defect, it should appear at the bottom
// as text the same way secondary caries does." Secondary caries is folded
// into the whole-mouth Caries line with an explicit qualifier word
// ("D - secondary"). Investigation (see task-5-report.md) showed the filling
// defect DID already surface on the whole-mouth Fillings line, but only as a
// bare "surface: defectType" suffix with no labeling word — unlike secondary
// caries, which always names itself via `toothInfo.secondary`. The fix adds
// the existing `fillingDefect.label` i18n key to the suffix so the whole-mouth
// text reads as clearly/explicitly as the secondary-caries entry.
describe("SP15 Task 5: filling defect reads like secondary caries in the bottom summary", () => {
  it("whole-mouth summary names the defect with the fillingDefect.label qualifier, alongside surface + type", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    const fills = getOdontogramSummary().sections.find((s) => s.key === "fillings")!;
    const text = fills.items.join(" | ");
    expect(text).toContain(t("fillingDefect.label"));
    expect(text).toContain(t("fillingDefect.fracture"));
    expect(text).toMatch(/O/); // surface letter present
  });

  it("reads in parallel with secondary caries: both a defect suffix and a secondary-caries qualifier appear in the same whole-mouth summary", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    __setToothStateForTest(26, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { distal: "gic" },
      caries: ["caries-distal"],
    });
    const summary = getOdontogramSummary();
    const fills = summary.sections.find((s) => s.key === "fillings")!.items.join(" | ");
    const caries = summary.sections.find((s) => s.key === "caries")!.items.join(" | ");
    expect(fills).toContain(t("fillingDefect.label"));
    expect(caries).toContain(t("toothInfo.secondary"));
  });

  it("tooltip still names the defect (unchanged baseline behavior)", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    expect(getToothStateSummary(16).join(" · ")).toContain(t("fillingDefect.label"));
    expect(getToothStateSummary(16).join(" · ")).toContain(t("fillingDefect.fracture"));
  });

  // Gate-consistency anti-regression (the SP9/10/11/12 lesson): a crowned
  // tooth's stored filling defect must never be surfaced in the whole-mouth
  // summary, because the render (applyStateToSvgSingle) suppresses
  // fillings/defects entirely under a crown/bridge.
  it("is suppressed on a crowned tooth (restorationType !== \"none\") even though a defect is stored", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      restorationType: "crown",
      restorationMaterial: "zircon",
      fillingSurfaceMaterials: { occlusal: "composite" },
      fillingDefect: { occlusal: "fracture" },
    });
    const fills = getOdontogramSummary().sections.find((s) => s.key === "fillings")!;
    const text = fills.items.join(" | ");
    expect(text).not.toContain(t("fillingDefect.label"));
    expect(text).not.toContain(t("fillingDefect.fracture"));
  });
});
