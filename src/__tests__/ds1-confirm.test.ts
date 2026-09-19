// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DS-1 Task 2: blocking confirm modal for a status edit on a plan-edited tooth.
//
// T1 shipped the gate + propagation; the status-mode-on-a-plan-edited-tooth
// branch just diverged silently. T2 makes that branch (and its batch sibling)
// CONFIRM before applying: the mutation is DEFERRED behind
// `isDualStateConfirmPending()`; `acceptDualStateConfirm()` applies it (status
// diverges, plan unchanged), `cancelDualStateConfirm()` discards it and re-syncs
// the active tooth's controls (the control-revert is verified end-to-end, with a
// real active tooth + control DOM, in ds1-confirm-revert.test.tsx).
//
// These tests drive the REAL module through its public perio mutator
// (`setPerioSite`, a `getPlanChanges()` axis) + the DS-1 test seams — no live
// DOM/SVG grid — plus a direct render of the <DualStateConfirm> component.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createElement } from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DualStateConfirm from "../DualStateConfirm";
import {
  setChartMode,
  getPlanChanges,
  setPerioSite,
  getToothPerio,
  isDualStateConfirmPending,
  acceptDualStateConfirm,
  cancelDualStateConfirm,
  onStateChange,
  getStatusChart,
  __resetChartStateForTest,
  __getStatusStateForTest,
  __getPlanStateForTest,
  __planEditedTeethForTest,
  __setEdentulousForTest,
  __setToothStateForTest,
  __applyStatusExtraForTest,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

// ---------------------------------------------------------------------------
// Gate → confirm (single-tooth)
// ---------------------------------------------------------------------------
describe("single-tooth status edit on a plan-edited tooth", () => {
  /** Plan-edit tooth 16 (status pd=5, plan pd=6), then return to status. */
  function planEditTooth16() {
    setPerioSite(16, "MB", { pd: 5 }); // status (plan uninitialized)
    setChartMode("plan"); // clone status->plan
    setPerioSite(16, "MB", { pd: 6 }); // plan-edit 16
    expect(__planEditedTeethForTest()).toContain(16);
    setChartMode("status");
  }

  it("does NOT apply immediately — it opens a pending confirm", () => {
    planEditTooth16();

    setPerioSite(16, "MB", { pd: 3 }); // status edit on the plan-edited tooth

    expect(isDualStateConfirmPending()).toBe(true);
    // Deferred: status is still the pre-edit value, plan is still the planned one.
    expect(getToothPerio(16).pd.MB).toBe(5);
    expect((__getPlanStateForTest(16) as any).perio.pd.get("MB")).toBe(6);
  });

  it("accept applies the edit (status diverges; plan stays as planned)", () => {
    planEditTooth16();
    setPerioSite(16, "MB", { pd: 3 });

    acceptDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(3); // status diverged
    expect(getPlanChanges().some((c) => c.toothNo === 16 && c.axis === "perio")).toBe(true);
    // Plan untouched by the status edit.
    setChartMode("plan");
    expect(getToothPerio(16).pd.MB).toBe(6);
    setChartMode("status");
  });

  it("cancel leaves state unchanged and clears the pending confirm", () => {
    planEditTooth16();
    setPerioSite(16, "MB", { pd: 3 });

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(5); // unchanged
    setChartMode("plan");
    expect(getToothPerio(16).pd.MB).toBe(6); // plan unchanged too
    setChartMode("status");
  });

  it("cancel notifies listeners (so the UI re-syncs to stored state)", () => {
    planEditTooth16();
    setPerioSite(16, "MB", { pd: 3 });
    const spy = vi.fn();
    const off = onStateChange(spy);

    cancelDualStateConfirm();
    off();

    expect(spy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Gate → confirm (batch)
// ---------------------------------------------------------------------------
describe("batch edit touching a plan-edited tooth", () => {
  /** Status 16 pd=5; plan-edit 16 (pd=6); back to status. */
  function planEditTooth16() {
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");
  }

  it("confirms ONCE before applying the whole batch", () => {
    planEditTooth16();

    __setEdentulousForTest(true); // whole-mouth batch touching planned 16

    expect(isDualStateConfirmPending()).toBe(true);
    // Deferred — nothing applied yet.
    expect(getToothPerio(16).pd.MB).toBe(5);
  });

  it("accept applies all: the planned tooth diverges, un-planned teeth mirror", () => {
    planEditTooth16();
    __setEdentulousForTest(true);

    acceptDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false); // one confirm covered the batch
    // 16 (planned) now missing in status -> diverges from the still-planned plan.
    expect(getPlanChanges().some((c) => c.toothNo === 16)).toBe(true);
    // 26 (never planned) mirrored status->plan -> no diff.
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
  });

  it("cancel applies none of the batch", () => {
    planEditTooth16();
    __setEdentulousForTest(true);

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(16).pd.MB).toBe(5); // untouched
  });
});

// ---------------------------------------------------------------------------
// No dialog when the tooth was never planned
// ---------------------------------------------------------------------------
describe("status edit on an un-planned tooth mirrors silently (no dialog)", () => {
  it("does not open the confirm; applies + mirrors so there is no diff", () => {
    setChartMode("plan"); // initialize the plan
    setChartMode("status");

    setPerioSite(26, "MB", { pd: 4 }); // 26 was never plan-edited

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getToothPerio(26).pd.MB).toBe(4);
    expect(getPlanChanges().some((c) => c.toothNo === 26)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Statuses preset (applyStatusExtra) must use the ATOMIC batch gate
// (DS-1 review Fix 1+2). A per-tooth gate loop either dropped the 2nd+
// plan-edited tooth (single-slot confirm guard) or applied an un-planned
// tooth immediately, before the user answered — both are data-loss bugs.
// ---------------------------------------------------------------------------
describe("Statuses preset over plan-edited teeth (atomic batch gate)", () => {
  /** status: 12 & 13 tooth-base; plan-edit BOTH; return to status. */
  function planEditTeeth1213() {
    __setToothStateForTest(12, { toothSelection: "tooth-base" });
    __setToothStateForTest(13, { toothSelection: "tooth-base" });
    setChartMode("plan"); // clone status->plan
    setPerioSite(12, "MB", { pd: 6 }); // plan-edit 12
    setPerioSite(13, "MB", { pd: 6 }); // plan-edit 13
    expect(__planEditedTeethForTest()).toContain(12);
    expect(__planEditedTeethForTest()).toContain(13);
    setChartMode("status");
  }

  it("(a) a span over TWO plan-edited teeth confirms ONCE; accept applies to BOTH (no dropped edit)", () => {
    planEditTeeth1213();

    __applyStatusExtraForTest({ type: "span", teeth: [12, 13], material: "zircon" });

    // ONE confirm for the whole preset; nothing applied yet.
    expect(isDualStateConfirmPending()).toBe(true);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("none");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("none");

    acceptDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    // BOTH teeth changed — the 2nd was NOT dropped by the single-slot guard.
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("crown");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("crown");
  });

  /** status: 12 tooth-base (plan-edited), 13 tooth-base (NEVER planned). */
  function planEdit12Only() {
    __setToothStateForTest(12, { toothSelection: "tooth-base" });
    __setToothStateForTest(13, { toothSelection: "tooth-base" });
    setChartMode("plan");
    setPerioSite(12, "MB", { pd: 6 }); // plan-edit 12 only
    setChartMode("status");
    expect(__planEditedTeethForTest()).toContain(12);
    expect(__planEditedTeethForTest()).not.toContain(13);
  }

  it("(b) a span over a planned + an unplanned tooth: while pending NEITHER applied; cancel leaves BOTH untouched", () => {
    planEdit12Only();

    __applyStatusExtraForTest({ type: "span", teeth: [12, 13], material: "zircon" });

    // While the dialog is open, NEITHER tooth is applied (no partial pre-apply).
    expect(isDualStateConfirmPending()).toBe(true);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("none");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("none");

    cancelDualStateConfirm();

    // Cancel fully reverts — both untouched.
    expect(isDualStateConfirmPending()).toBe(false);
    expect((__getStatusStateForTest(12) as any).restorationType).toBe("none");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("none");
  });

  it("(b) accept applies both; the un-planned tooth mirrors (no diff), the planned one diverges", () => {
    planEdit12Only();

    __applyStatusExtraForTest({ type: "span", teeth: [12, 13], material: "zircon" });
    acceptDualStateConfirm();

    expect((__getStatusStateForTest(12) as any).restorationType).toBe("crown");
    expect((__getStatusStateForTest(13) as any).restorationType).toBe("crown");
    // 13 (never planned) mirrored status->plan -> no diff; 12 diverges.
    expect(getPlanChanges().some((c) => c.toothNo === 13)).toBe(false);
    expect(getPlanChanges().some((c) => c.toothNo === 12)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setEdentulous must not set the global before the gated batch resolves
// (DS-1 review Fix 3): on cancel the `edentulous` global must stay false.
// ---------------------------------------------------------------------------
describe("setEdentulous global revert on cancel", () => {
  it("(c) cancel leaves globals.edentulous NOT true (global reverted)", () => {
    __setEdentulousForTest(false); // clean baseline (global not reset by __resetChartStateForTest)
    setPerioSite(16, "MB", { pd: 5 }); // status
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 }); // plan-edit 16
    setChartMode("status");

    __setEdentulousForTest(true); // whole-mouth batch touching planned 16
    expect(isDualStateConfirmPending()).toBe(true);

    cancelDualStateConfirm();

    expect(isDualStateConfirmPending()).toBe(false);
    expect(getStatusChart().globals.edentulous).not.toBe(true);
  });

  it("(c) accept sets globals.edentulous true", () => {
    __setEdentulousForTest(false); // clean baseline
    setPerioSite(16, "MB", { pd: 5 });
    setChartMode("plan");
    setPerioSite(16, "MB", { pd: 6 });
    setChartMode("status");

    __setEdentulousForTest(true);
    acceptDualStateConfirm();

    expect(getStatusChart().globals.edentulous).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// <DualStateConfirm> component contract (mirrors SettingsModal's dialog)
// ---------------------------------------------------------------------------
describe("<DualStateConfirm> component", () => {
  const t = (key: string) => {
    const map: Record<string, string> = {
      "dualState.confirmPlannedStatusEdit": "Diverge from the plan?",
      "dualState.accept": "Igen",
      "dualState.cancel": "Mégse",
    };
    return map[key] ?? key;
  };

  afterEach(() => cleanup());

  it("renders nothing when closed", () => {
    render(createElement(DualStateConfirm, { open: false, t, onAccept: () => {}, onCancel: () => {} }));
    expect(document.querySelector("#dualStateConfirm")).toBeNull();
  });

  it("renders #dualStateConfirm role=dialog with the message + Igen/Mégse when open", () => {
    render(createElement(DualStateConfirm, { open: true, t, onAccept: () => {}, onCancel: () => {} }));
    const dialog = document.querySelector("#dualStateConfirm");
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("role")).toBe("dialog");
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("Diverge from the plan?")).toBeTruthy();
    expect(screen.getByText("Igen")).toBeTruthy();
    expect(screen.getByText("Mégse")).toBeTruthy();
  });

  it("Igen calls onAccept; Mégse calls onCancel", () => {
    const onAccept = vi.fn();
    const onCancel = vi.fn();
    render(createElement(DualStateConfirm, { open: true, t, onAccept, onCancel }));
    fireEvent.click(screen.getByText("Igen"));
    expect(onAccept).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Mégse"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Esc cancels; backdrop click cancels", () => {
    const onCancel = vi.fn();
    render(createElement(DualStateConfirm, { open: true, t, onAccept: () => {}, onCancel }));
    fireEvent.keyDown(document.querySelector("#dualStateConfirm")!, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.mouseDown(document.querySelector(".odon-confirm-backdrop")!);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
