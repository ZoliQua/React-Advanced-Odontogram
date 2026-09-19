// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-B Task 1: getPlanChanges() — a PURE, read-only diff engine that compares
// the "status" chart to the "plan" chart, axis by axis, and reports what
// changed. This is the data layer only — the "what changes" UI box lands in
// Task 2 and is out of scope here.
//
// Uses the same module-state test seams as r2a-dual-state.test.ts
// (__setToothStateForTest operates on the ACTIVE chart; setChartMode("plan")
// on first entry deep-clones status -> plan; __resetChartStateForTest clears
// both charts + planInitialized + mode before every test so module state
// never leaks between tests).
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getPlanChanges,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("getPlanChanges() — status vs. plan diff engine", () => {
  it("returns [] when the plan chart was never initialized", () => {
    __setToothStateForTest(16, { restorationType: "crown", restorationMaterial: "zircon" });
    expect(getPlanChanges()).toEqual([]);
  });

  it("returns [] when plan equals status (no edits since the plan was cloned)", () => {
    __setToothStateForTest(16, { restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("plan"); // first entry -> deep clone, no edits after
    setChartMode("status");
    expect(getPlanChanges()).toEqual([]);
  });

  it("status sound + plan crown(zircon) -> a single restoration change", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("status");

    const changes = getPlanChanges();
    const restorationChanges = changes.filter((c) => c.toothNo === 16 && c.axis === "restoration");
    expect(restorationChanges).toEqual([
      {
        toothNo: 16,
        axis: "restoration",
        from: t("planChange.none"),
        to: `${t("restoration.type.crown")} – ${t("restoration.material.zircon")}`,
      },
    ]);
  });

  it("status present + plan extraction-planned -> a presence change (extractionPlan suffix)", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", extractionPlan: false });
    setChartMode("plan");
    __setToothStateForTest(26, { toothSelection: "tooth-base", extractionPlan: true });
    setChartMode("status");

    const changes = getPlanChanges();
    const presenceChanges = changes.filter((c) => c.toothNo === 26 && c.axis === "presence");
    expect(presenceChanges).toEqual([
      {
        toothNo: 26,
        axis: "presence",
        from: t("toothSelect.permanent"),
        to: `${t("toothSelect.permanent")} (${t("tooth.extractionPlan")})`,
      },
    ]);
  });

  it("status no ortho + plan orthoDrift mesial -> an ortho change (planned movement)", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "none" });
    setChartMode("plan");
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "mesial" });
    setChartMode("status");

    const changes = getPlanChanges();
    const orthoChanges = changes.filter((c) => c.toothNo === 11 && c.axis === "ortho");
    expect(orthoChanges).toEqual([
      {
        toothNo: 11,
        axis: "ortho",
        from: t("planChange.none"),
        to: t("ortho.drift.mesial"),
      },
    ]);
  });

  it("multiple axes on one tooth -> multiple entries; multiple teeth -> grouped/ordered by tooth number", () => {
    // Tooth 36: two axes change (restoration + substrate).
    __setToothStateForTest(36, { toothSelection: "tooth-base", toothSubstrate: "natural", restorationType: "none" });
    // Tooth 15: one axis changes (prosthesis).
    __setToothStateForTest(15, { toothSelection: "tooth-base", prosthesis: "none" });
    setChartMode("plan");
    __setToothStateForTest(36, { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "emax" });
    __setToothStateForTest(15, { toothSelection: "tooth-base", prosthesis: "locator" });
    setChartMode("status");

    const changes = getPlanChanges();
    const relevant = changes.filter((c) => c.toothNo === 36 || c.toothNo === 15);

    // Ordered by tooth number ascending: 15 before 36.
    expect(relevant.map((c) => c.toothNo)).toEqual([15, 36, 36]);

    expect(relevant).toEqual([
      { toothNo: 15, axis: "prosthesis", from: t("planChange.none"), to: t("prosthesis.type.locator") },
      { toothNo: 36, axis: "substrate", from: t("substrate.natural"), to: t("substrate.crownprep") },
      { toothNo: 36, axis: "restoration", from: t("planChange.none"), to: `${t("restoration.type.crown")} – ${t("restoration.material.emax")}` },
    ]);
  });

  it("symmetric: a field REMOVED in plan (status had a crown, plan sound) -> from crown -> to sound", () => {
    __setToothStateForTest(46, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("plan");
    __setToothStateForTest(46, { toothSelection: "tooth-base", restorationType: "none", restorationMaterial: "none" });
    setChartMode("status");

    const changes = getPlanChanges();
    const restorationChanges = changes.filter((c) => c.toothNo === 46 && c.axis === "restoration");
    expect(restorationChanges).toEqual([
      {
        toothNo: 46,
        axis: "restoration",
        from: `${t("restoration.type.crown")} – ${t("restoration.material.zircon")}`,
        to: t("planChange.none"),
      },
    ]);
  });

  it("a tooth with no changes at all contributes no entries", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "emax" });
    setChartMode("plan");
    setChartMode("status");
    // Some other tooth changes, but 21 must stay silent.
    __setToothStateForTest(22, { toothSelection: "tooth-base" });
    setChartMode("plan");
    __setToothStateForTest(22, { toothSelection: "tooth-base", crownNeeded: true });
    setChartMode("status");

    const changes = getPlanChanges();
    expect(changes.some((c) => c.toothNo === 21)).toBe(false);
  });
});
