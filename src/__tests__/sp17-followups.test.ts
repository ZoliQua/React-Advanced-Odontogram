// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP17 Task 1: three tracked follow-up fixes.
//
// Fix #1 — setPulpDetailLevel must live-refresh the whole-mouth summary panel
// and per-tooth tooltips (same bug class as the SP16 setSurfaceNotation fix):
// it must call notifyStateChange() (proven here via the onStateChange hook)
// after updating the level, mirroring setSurfaceNotation exactly.
//
// Fix #2 — the crown-leakage "Marginal leakage" summary line (both the
// per-tooth tooltip getStateSummary/getToothStateSummary and the whole-mouth
// getOdontogramSummary prosthetics section) must be gated on the SAME FULL
// predicate the #crownLeakageRow control uses — !restorationRowHidden(state)
// AND (restorationType === "crown" || restorationType === "bridge") —
// otherwise a tooth whose restoration was cleared to "none" (crownLeakage
// boolean left stale) shows a summary line contradicting the chart/control.
//
// Gate-parity follow-up (this file): checking crown/bridge alone is not
// enough — a tooth reachable via import/hydrate with a stale restorationType
// of "crown"/"bridge" but a HIDDEN restoration row (milktooth, under-gum,
// extraction socket, or radix substrate — restorationRowHidden()) must also
// suppress the line, since the control itself is hidden for it. hydrateState
// only self-heals the radix case (forces restorationType back to "none"), so
// a milktooth/extraction-socket tooth with a stale crown+leakage is the case
// that actually reaches the summary gates.
//
// Fix #3 — SADDLE_Y_FRACTION_LOWER (lower-arch bridge saddle bar vertical
// position) must be the recon-measured 0.19, not the old 1 - SADDLE_Y_FRACTION
// (0.28) mirrored guess.
import { describe, it, expect, afterEach } from "vitest";
import {
  setPulpDetailLevel,
  getPulpDetailLevel,
  onStateChange,
  getToothStateSummary,
  getOdontogramSummary,
  __setToothStateForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";
import { SADDLE_Y_FRACTION_LOWER, SADDLE_Y_FRACTION } from "../bridgeOverlay";

setI18nLanguage("en");

describe("Fix #1: setPulpDetailLevel live-refresh", () => {
  afterEach(() => {
    setPulpDetailLevel("aae");
  });

  it("calls notifyStateChange() (onStateChange listener fires)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setPulpDetailLevel("latin");
      expect(fired).toBe(true);
      expect(getPulpDetailLevel()).toBe("latin");
    } finally {
      unsub();
    }
  });

  it("does NOT fire notifyStateChange when the level is already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setPulpDetailLevel("aae");
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });
});

describe("Fix #2: crown-leakage summary line gated on restorationType crown/bridge", () => {
  afterEach(() => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none", crownLeakage: false });
  });

  it("getToothStateSummary (tooltip) shows the leakage line when restorationType is crown", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const s = getToothStateSummary(21).join(" · ");
    expect(s).toContain(t("crownLeakage.label"));
  });

  it("getToothStateSummary (tooltip) HIDES the leakage line once restorationType is cleared to none, even though crownLeakage stays true", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none", crownLeakage: true });
    const s = getToothStateSummary(21).join(" · ");
    expect(s).not.toContain(t("crownLeakage.label"));
  });

  it("getOdontogramSummary (whole-mouth) shows the leakage line when restorationType is bridge", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "bridge", restorationMaterial: "gold", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).toContain(t("crownLeakage.label"));
  });

  it("getOdontogramSummary (whole-mouth) HIDES the leakage line once restorationType is cleared to none, even though crownLeakage stays true", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", restorationType: "none", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).not.toContain(t("crownLeakage.label"));
  });

  // Gate-parity follow-up: a stale crown + hidden restoration row (milktooth)
  // must suppress the line in BOTH summaries too, not just the cleared-to-
  // "none" case above — this is the contradiction the control's full gate
  // (!restorationRowHidden(state) && crown/bridge) was meant to close, but the
  // summary gates initially dropped the !restorationRowHidden() half.
  it("getToothStateSummary (tooltip) HIDES the leakage line on a milktooth carrying a stale crown restorationType (restoration row is hidden for milk teeth)", () => {
    __setToothStateForTest(21, { toothSelection: "milktooth", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const s = getToothStateSummary(21).join(" · ");
    expect(s).not.toContain(t("crownLeakage.label"));
  });

  it("getOdontogramSummary (whole-mouth) HIDES the leakage line on a milktooth carrying a stale crown restorationType (restoration row is hidden for milk teeth)", () => {
    __setToothStateForTest(21, { toothSelection: "milktooth", restorationType: "crown", restorationMaterial: "zircon", crownLeakage: true });
    const pr = getOdontogramSummary().sections.find((sec) => sec.key === "prosthetics")!;
    expect(pr.items.join(" | ")).not.toContain(t("crownLeakage.label"));
  });
});

describe("Fix #3: lower-arch bridge saddle Y fraction", () => {
  // 2.2.1: the recon-measured 0.19 sat too high on the lower abutment vs the
  // well-fitting upper saddle, so the lower fraction is re-anchored to the TRUE
  // geometric mirror of the proven upper value (`1 - SADDLE_Y_FRACTION`).
  it("SADDLE_Y_FRACTION_LOWER mirrors the upper fraction (1 - SADDLE_Y_FRACTION)", () => {
    expect(SADDLE_Y_FRACTION_LOWER).toBe(1 - SADDLE_Y_FRACTION);
  });
});
