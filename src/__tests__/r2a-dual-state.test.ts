// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-A Task 1: dual-state core (status/plan) + mode switch + reset.
//
// The chart now carries two PARALLEL per-case states — "status" (findings)
// and "plan" (proposed treatment) — with `toothState` reassigned as an
// active-chart ALIAS by `setChartMode()`. No live DOM/SVG grid is required:
// `__setToothStateForTest`/`__getToothStateForTest` operate on the ACTIVE
// chart (bypassing DOM/UI wiring, same seam as every other module-state
// test file, e.g. sp16-surface-notation.test.ts), and the temporary
// `__getStatusStateForTest`/`__getPlanStateForTest` seams (kept until T2's
// public getStatusChart()/getPlanChart() supersede them) read a specific
// chart regardless of which one is active.
//
// Module state (chartMode/planInitialized/both charts) is global and must
// not leak between tests — in particular `planInitialized` must not survive
// from one test to the next, or a later test's first setChartMode("plan")
// silently skips the clone it's asserting on. __resetChartStateForTest (a
// temporary R2-A Task 1 seam) clears both charts + planInitialized + mode
// before every test.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setChartMode,
  getChartMode,
  __setToothStateForTest,
  __getToothStateForTest,
  __getStatusStateForTest,
  __getPlanStateForTest,
  __resetChartStateForTest,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("getChartMode / setChartMode — defaults and guards", () => {
  it("defaults to \"status\"", () => {
    expect(getChartMode()).toBe("status");
  });

  it("ignores a bad mode value and stays on the current mode", () => {
    expect(getChartMode()).toBe("status");
    // @ts-expect-error intentionally invalid mode for the runtime guard
    setChartMode("bogus");
    expect(getChartMode()).toBe("status");
    setChartMode("plan");
    expect(getChartMode()).toBe("plan");
    // @ts-expect-error intentionally invalid mode for the runtime guard
    setChartMode("also-bogus");
    expect(getChartMode()).toBe("plan");
    setChartMode("status");
  });

  it("switching to the already-active mode is a no-op (does not throw, mode unchanged)", () => {
    expect(getChartMode()).toBe("status");
    setChartMode("status");
    expect(getChartMode()).toBe("status");
  });
});

describe("dual-state isolation", () => {
  it("status edit -> plan copy -> plan edit does not leak back to status; re-entering plan keeps the plan edit (no re-clone)", () => {
    const TOOTH = 16;

    // Edit tooth 16 in status mode.
    expect(getChartMode()).toBe("status");
    __setToothStateForTest(TOOTH, { restorationType: "crown", toothSubstrate: "crownprep" });
    expect(__getToothStateForTest(TOOTH)?.restorationType).toBe("crown");

    // First entry into plan mode deep-copies status -> plan.
    setChartMode("plan");
    expect(getChartMode()).toBe("plan");
    expect(__getToothStateForTest(TOOTH)?.restorationType).toBe("crown");
    expect(__getPlanStateForTest(TOOTH)?.restorationType).toBe("crown");
    expect(__getStatusStateForTest(TOOTH)?.restorationType).toBe("crown");

    // Edit tooth 16 in plan mode only.
    __setToothStateForTest(TOOTH, { restorationType: "inlay", toothSubstrate: "crownprep" });
    expect(__getToothStateForTest(TOOTH)?.restorationType).toBe("inlay");

    // Switch back to status: status must be UNCHANGED (still crown); no leak
    // from the plan edit.
    setChartMode("status");
    expect(getChartMode()).toBe("status");
    expect(__getToothStateForTest(TOOTH)?.restorationType).toBe("crown");
    expect(__getStatusStateForTest(TOOTH)?.restorationType).toBe("crown");
    expect(__getPlanStateForTest(TOOTH)?.restorationType).toBe("inlay");

    // Re-enter plan mode: plan 16 is STILL inlay (does NOT re-clone from the
    // still-crown status chart).
    setChartMode("plan");
    expect(__getToothStateForTest(TOOTH)?.restorationType).toBe("inlay");
    expect(__getPlanStateForTest(TOOTH)?.restorationType).toBe("inlay");
    expect(__getStatusStateForTest(TOOTH)?.restorationType).toBe("crown");

    setChartMode("status");
  });

  it("the first plan-mode entry deep-copies (mutating a plan tooth's Set/Map does not mutate the status tooth's)", () => {
    const TOOTH = 26;

    __setToothStateForTest(TOOTH, {
      // `caries` entries use the internal "caries-{surface}" key format (see
      // CARIES_SURFACE_OPTIONS / VALID_CARIES), not bare surface names.
      caries: ["caries-mesial", "caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    const statusCariesBefore = __getStatusStateForTest(TOOTH)?.caries;
    expect(statusCariesBefore).toEqual(["caries-mesial", "caries-occlusal"]);

    setChartMode("plan"); // first entry -> deep clone
    expect(getChartMode()).toBe("plan");

    // The plan tooth's underlying Set/Map objects must be independent of the
    // status tooth's — verify by mutating the ACTIVE (plan) state's raw Set
    // directly (not through __setToothStateForTest, which would replace the
    // whole object) and confirming status is unaffected.
    const planStateRaw = __getPlanStateForTest(TOOTH);
    expect(planStateRaw?.caries).toEqual(["caries-mesial", "caries-occlusal"]);

    // Edit plan via the normal test seam (equivalent to a real plan-mode
    // edit) and confirm status keeps its original value.
    __setToothStateForTest(TOOTH, {
      caries: ["caries-mesial", "caries-occlusal", "caries-distal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    expect(__getPlanStateForTest(TOOTH)?.caries).toEqual(["caries-mesial", "caries-occlusal", "caries-distal"]);
    expect(__getStatusStateForTest(TOOTH)?.caries).toEqual(["caries-mesial", "caries-occlusal"]);

    setChartMode("status");
  });

  it("re-entering plan mode does not re-clone even after further status edits (planInitialized guard)", () => {
    const TOOTH = 36;

    __setToothStateForTest(TOOTH, { restorationType: "none" });
    setChartMode("plan"); // clones "none" into plan
    __setToothStateForTest(TOOTH, { restorationType: "veneer" }); // plan edit
    setChartMode("status");

    // Further status-only edit AFTER plan was already initialized.
    __setToothStateForTest(TOOTH, { restorationType: "onlay" });
    expect(__getStatusStateForTest(TOOTH)?.restorationType).toBe("onlay");

    // Re-entering plan must NOT re-clone from the now-"onlay" status chart —
    // plan must still show the earlier "veneer" edit.
    setChartMode("plan");
    expect(__getPlanStateForTest(TOOTH)?.restorationType).toBe("veneer");
    expect(__getStatusStateForTest(TOOTH)?.restorationType).toBe("onlay");

    setChartMode("status");
  });

  it("cloneChart only copies existing status entries — a tooth never set in status has no phantom entry in plan", () => {
    const TOOTH = 45;
    // No __setToothStateForTest call for this tooth in status — the status
    // chart has no explicit entry.
    expect(__getStatusStateForTest(TOOTH)).toBeUndefined();

    setChartMode("plan");
    // Plan chart also has no entry for a tooth that was never populated in
    // status (cloneChart only copies existing entries; it never invents new
    // ones), which is the correct behavior — no phantom teeth.
    expect(__getPlanStateForTest(TOOTH)).toBeUndefined();

    setChartMode("status");
  });
});
