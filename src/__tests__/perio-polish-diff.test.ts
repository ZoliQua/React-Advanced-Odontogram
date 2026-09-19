// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// PG-A Task 4: furcation + plaque in the status->plan diff. Furcation and
// plaque were added (SP-perio P2b) as their own sub-records on the tooth
// state (separate from `perio`'s pd/gm/bop/sup), but were NOT wired into the
// R2-B `getPlanChanges()` diff — a status->plan edit to either was silently
// invisible in the "What changes" box. This adds two SUMMARY-level DIFF_AXES
// entries (`furcation`, `plaque`), mirroring the existing summary-level
// `perio` entry: one line per tooth, never one per entrance/surface.
//
// Uses the same module-state test seams as r2b-plan-diff.test.ts /
// perio-p1-core.test.ts (__setToothStateForTest operates on the ACTIVE
// chart; setChartMode("plan") on first entry deep-clones status -> plan;
// __resetChartStateForTest clears both charts + planInitialized + mode
// before every test).
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getPlanChanges,
  setFurcation,
  setPlaque,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("DIFF_AXES furcation entry (status -> plan diff)", () => {
  it("a graded furcation entrance in the plan -> ONE summary-level furcation change entry", () => {
    // Tooth 16 (upper first molar): entrances = mesial/distal/buccal.
    __setToothStateForTest(16, {});
    setChartMode("plan");
    setFurcation(16, "buccal", 2);
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 16 && c.axis === "furcation");
    expect(changes.length).toBe(1);
    expect(changes[0]).toEqual({
      toothNo: 16,
      axis: "furcation",
      from: t("planChange.none"),
      to: t("furcation.grade.2"),
    });
  });

  it("multiple graded entrances -> reports only the HIGHEST grade (summary-level, not per-entrance)", () => {
    __setToothStateForTest(16, {});
    setChartMode("plan");
    setFurcation(16, "mesial", 1);
    setFurcation(16, "distal", 3);
    setFurcation(16, "buccal", 2);
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 16 && c.axis === "furcation");
    expect(changes.length).toBe(1);
    expect(changes[0].to).toBe(t("furcation.grade.3"));
  });

  it("no furcation change between status and plan -> no furcation diff entry", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 2);
    setChartMode("plan");
    setChartMode("status");
    expect(getPlanChanges().some((c) => c.toothNo === 16 && c.axis === "furcation")).toBe(false);
  });

  it("a furcation grade REMOVED in plan -> from grade -> to none (symmetric)", () => {
    __setToothStateForTest(16, {});
    setFurcation(16, "buccal", 2);
    setChartMode("plan");
    setFurcation(16, "buccal", null);
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 16 && c.axis === "furcation");
    expect(changes).toEqual([
      { toothNo: 16, axis: "furcation", from: t("furcation.grade.2"), to: t("planChange.none") },
    ]);
  });
});

describe("DIFF_AXES plaque entry (status -> plan diff)", () => {
  it("a plaque surface added in the plan -> ONE summary-level plaque change entry", () => {
    __setToothStateForTest(16, {});
    setChartMode("plan");
    setPlaque(16, "buccal", true);
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 16 && c.axis === "plaque");
    expect(changes.length).toBe(1);
    expect(changes[0]).toEqual({
      toothNo: 16,
      axis: "plaque",
      from: t("planChange.none"),
      to: "1/4",
    });
  });

  it("multiple plaque surfaces -> reports a compact count (summary-level, not per-surface)", () => {
    __setToothStateForTest(16, {});
    setChartMode("plan");
    setPlaque(16, "buccal", true);
    setPlaque(16, "lingual", true);
    setPlaque(16, "mesial", true);
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 16 && c.axis === "plaque");
    expect(changes.length).toBe(1);
    expect(changes[0].to).toBe("3/4");
  });

  it("no plaque change between status and plan -> no plaque diff entry", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "buccal", true);
    setChartMode("plan");
    setChartMode("status");
    expect(getPlanChanges().some((c) => c.toothNo === 16 && c.axis === "plaque")).toBe(false);
  });

  it("a plaque surface REMOVED in plan -> from count -> to none (symmetric)", () => {
    __setToothStateForTest(16, {});
    setPlaque(16, "buccal", true);
    setChartMode("plan");
    setPlaque(16, "buccal", false);
    setChartMode("status");

    const changes = getPlanChanges().filter((c) => c.toothNo === 16 && c.axis === "plaque");
    expect(changes).toEqual([
      { toothNo: 16, axis: "plaque", from: "1/4", to: t("planChange.none") },
    ]);
  });
});
