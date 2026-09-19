// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DS-1 Task 1: status->plan edit GATE + propagation (no confirm modal yet).
//
// The gate (`gateToothEdit`/`gateToothEditBatch`) is the single choke point
// through which every INTERACTIVE per-tooth edit is routed. Its job:
//   - Plan mode  -> apply, and REMEMBER the tooth was plan-edited
//     (`planEditedTeeth`).
//   - Status mode, plan not yet initialized -> pure passthrough (the
//     pre-dual-state behavior; nothing about the plan is touched).
//   - Status mode, plan initialized, tooth NOT plan-edited -> apply, then
//     MIRROR status->plan for that tooth (so an un-planned tooth's plan keeps
//     tracking status -> no spurious `getPlanChanges()` entry).
//   - Status mode, plan initialized, tooth IS plan-edited -> T1: just apply
//     (the status edit DIVERGES from the plan). T2 will add a blocking
//     confirm here.
//
// `planEditedTeeth` is runtime-only (never serialized) and is cleared whenever
// the plan is (re)initialized, reset, or replaced by an import.
//
// These tests exercise the gate through the real public perio mutator
// (`setPerioSite`, an axis that participates in `getPlanChanges()`), plus the
// dedicated DS-1 test seams. No live DOM/SVG grid is required.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getPlanChanges,
  setPerioSite,
  getToothPerio,
  __getPlanStateForTest,
  __resetChartStateForTest,
  __hydrateImportedChartsForTest,
  __planEditedTeethForTest,
  __mirrorStatusToPlanForTest,
  __applyStatusExtraForTest,
  __setEdentulousForTest,
  acceptDualStateConfirm,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("gate — passthrough when plan is uninitialized", () => {
  it("a status edit runs, but nothing about the plan is touched", () => {
    setPerioSite(16, "MB", { pd: 5 });

    // The status edit took effect on the active (status) chart.
    expect(getToothPerio(16).pd.MB).toBe(5);

    // Plan never got initialized, marked, or mirrored.
    expect(getPlanChanges()).toEqual([]);
    expect(__planEditedTeethForTest()).not.toContain(16);
    expect(__getPlanStateForTest(16)).toBeUndefined();
  });
});

describe("gate — plan-mode edit marks the tooth", () => {
  it("entering plan mode starts with an empty plan-edited set; editing marks it", () => {
    setChartMode("plan"); // first entry: clone status->plan, clear plan-edited
    expect(__planEditedTeethForTest()).toEqual([]);

    setPerioSite(16, "MB", { pd: 4 });
    expect(__planEditedTeethForTest()).toContain(16);

    setChartMode("status");
  });
});

describe("gate — status edit on an un-planned tooth mirrors to plan", () => {
  it("status[26] updates AND plan[26] mirrors it, so getPlanChanges has no entry for 26", () => {
    // Initialize the plan (enter plan once, then return to status).
    setChartMode("plan");
    setChartMode("status");

    // Tooth 26 was never plan-edited -> status edit mirrors into plan.
    setPerioSite(26, "MB", { pd: 4 });

    expect(getToothPerio(26).pd.MB).toBe(4); // status updated
    // Mirror keeps the perio summary identical -> no diff entry for 26.
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
  });
});

describe("gate — status edit on a plan-edited tooth diverges (T2: confirm, then apply)", () => {
  it("status[16] applies without mirroring; getPlanChanges shows the perio divergence", () => {
    // Plan-edit tooth 16 in plan mode.
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    expect(__planEditedTeethForTest()).toContain(16);

    // Back in status, edit the SAME (plan-edited) tooth -> T2 defers behind the
    // confirm; accepting applies the divergent edit (status only, no mirror).
    setChartMode("status");
    setPerioSite(16, "MB", { pd: 3 });
    acceptDualStateConfirm();

    expect(getToothPerio(16).pd.MB).toBe(3); // status diverged to 3
    const changes = getPlanChanges();
    expect(changes.some((c) => c.toothNo === 16 && c.axis === "perio")).toBe(true);

    // Plan still holds the plan-edited value (untouched by the status edit).
    setChartMode("plan");
    expect(getToothPerio(16).pd.MB).toBe(6);
    setChartMode("status");
  });
});

describe("mirrorStatusToPlan — deep copy (independent Maps/Sets)", () => {
  it("editing status after a mirror does not leak into the mirrored plan copy", () => {
    setPerioSite(26, "MB", { pd: 4 }); // status (plan uninitialized)
    __mirrorStatusToPlanForTest(26); // plan[26] = deep copy of status[26]

    // Change status again; plan is uninitialized so the gate is a pure
    // passthrough and never re-mirrors — plan[26] must be untouched.
    setPerioSite(26, "MB", { pd: 7 });

    expect(getToothPerio(26).pd.MB).toBe(7); // status changed
    const plan = __getPlanStateForTest(26) as any;
    expect(plan.perio.pd.get("MB")).toBe(4); // mirrored copy is independent
  });
});

describe("applyStatusExtra — no-op signaling (skipped teeth are not marked/mirrored)", () => {
  it("arch-bridge in Plan mode marks the crowned teeth but NOT the skipped wisdom teeth (18/28)", () => {
    setChartMode("plan"); // init plan, clear plan-edited marks

    // Apply a whole-arch bridge. Non-wisdom upper teeth default to tooth-base
    // and get crowned; 18/28 are deliberately skipped by the preset.
    __applyStatusExtraForTest({ type: "arch-bridge", arch: "upper", material: "zircon" });

    // A crowned tooth was actually mutated -> marked plan-edited.
    expect(__planEditedTeethForTest()).toContain(16);
    // The skipped wisdom teeth were NOT mutated -> must NOT be marked.
    expect(__planEditedTeethForTest()).not.toContain(18);
    expect(__planEditedTeethForTest()).not.toContain(28);

    // Back in status: because 18 was never plan-edited, a status edit on it
    // auto-mirrors into the plan -> no spurious getPlanChanges entry for 18.
    setChartMode("status");
    setPerioSite(18, "MB", { pd: 4 });

    expect(getToothPerio(18).pd.MB).toBe(4);
    expect(getPlanChanges().some((c) => c.toothNo === 18)).toBe(false);
  });
});

describe("setEdentulous — routed through the batch gate (structural edit)", () => {
  it("in status mode mirrors un-planned teeth (no diff) and diverges a plan-edited tooth", () => {
    // Plan-edit tooth 16.
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    expect(__planEditedTeethForTest()).toContain(16);
    setChartMode("status");

    // Whole-mouth edentulous in status mode is a gated structural edit; because
    // it touches the plan-edited tooth 16, T2 confirms ONCE before applying.
    __setEdentulousForTest(true);
    acceptDualStateConfirm();

    // Tooth 26 was never plan-edited -> mirrored (plan tracks status) -> no diff.
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
    // Tooth 16 IS plan-edited -> the status edit (now missing) diverges from the
    // plan (still present, perio-charted) -> it surfaces in getPlanChanges.
    expect(getPlanChanges().some((c) => c.toothNo === 16)).toBe(true);
  });
});

describe("planEditedTeeth — cleared on (re)init / reset / import; not populated by import", () => {
  it("reset (via __resetChartStateForTest) clears the plan-edited set", () => {
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 5 });
    expect(__planEditedTeethForTest()).toContain(16);

    __resetChartStateForTest();
    expect(__planEditedTeethForTest()).toEqual([]);
  });

  it("re-initializing the plan (first plan entry) clears any prior marks", () => {
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 5 });
    expect(__planEditedTeethForTest()).toContain(16);

    // Fresh case, fresh plan.
    __resetChartStateForTest();
    setChartMode("plan"); // clone -> clear
    expect(__planEditedTeethForTest()).toEqual([]);
    setChartMode("status");
  });

  it("import clears plan-edited marks and does NOT populate them", () => {
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 5 });
    expect(__planEditedTeethForTest()).toContain(16);

    // An import replaces the whole case; a freshly imported plan has no
    // plan-edits, even when it carries a `plan` section.
    __hydrateImportedChartsForTest({ version: "2.13", teeth: {}, plan: {} });
    expect(__planEditedTeethForTest()).toEqual([]);
  });
});
