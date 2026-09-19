// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP15 wholebranch review fix — two visibility-gate-without-render/state-clear
// findings (same bug class as SP15 Task 1's B5/B7 gates):
//
//   FINDING 1 (critical) — a radix substrate hides #restorationRow
//   (restorationRowHidden() already returns true for it, B7), but a
//   crown/bridge set BEFORE the substrate changed to radix stayed in state
//   with no control left to clear it: it kept rendering (e.g. emax-crown
//   over tooth-radix) and kept appearing in the summary alongside "Radix".
//   Fixed by clearing restorationType/restorationMaterial whenever
//   toothSubstrate === "radix" — both in hydrateState() (so a
//   crafted/imported/directly-hydrated payload self-heals, mirroring FIX 4's
//   crown-vs-prosthesis coherence guard) and in syncControlsFromState()'s
//   existing milktooth/underGum/extraction reset block (so a LIVE substrate
//   change reconciles the same way).
//
//   FINDING 2 (important) — mobilityRowHidden() hides #mobilityRow on an
//   implant (B5; no periodontal ligament), and the stored value is
//   deliberately left untouched. But the render and the two summaries
//   (per-tooth tooltip + whole-mouth panel) were not gated on implant, so a
//   tooth that HAD mobility set before becoming an implant kept showing the
//   mobility glyph/summary line — contradicting the now-hidden control.
//   Fixed by gating render + both summaries on `toothSelection !== "implant"`,
//   without touching the stored value (same tooth-base-with-mobility case
//   still renders — regression guard below).
//
// Mirrors sp14-ortho-render.test.ts's render seam (__parseSvgForTest /
// __renderActiveLayersOnNode) and sp14-ortho-summary.test.ts's summary seam
// (__setToothStateForTest / getToothStateSummary / getOdontogramSummary).
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  __parseSvgForTest,
  __renderActiveLayersOnNode,
  __setToothStateForTest,
  __getToothStateForTest,
  getToothStateSummary,
  getOdontogramSummary,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

const testFileUrl = import.meta.url;
const svg11Text = readFileSync(fileURLToPath(new URL("../assets/teeth-svgs/11.svg", testFileUrl)), "utf8");

const ids = (layers: { id: string }[]) => layers.map(l => l.id);
const render = (state: Record<string, unknown>) => {
  const node = __parseSvgForTest(svg11Text);
  return __renderActiveLayersOnNode(node, 11, state);
};

beforeEach(() => setI18nLanguage("en"));

describe("SP15 wholebranch fix — Finding 1: stale crown on a radix substrate", () => {
  it("hydrate: a crown+radix payload self-heals to restorationType 'none'", () => {
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      toothSubstrate: "radix",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    const s = __getToothStateForTest(11)!;
    expect(s.restorationType).toBe("none");
    expect(s.restorationMaterial).toBe("none");
  });

  it("render: no emax-crown activates over a radix substrate even with crown fields set", () => {
    const l = render({
      toothSelection: "tooth-base",
      toothSubstrate: "radix",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    expect(ids(l)).not.toContain("emax-crown");
    expect(ids(l)).toContain("tooth-radix");
  });

  it("regression guard: the SAME crown on a natural substrate still renders emax-crown", () => {
    const l = render({
      toothSelection: "tooth-base",
      toothSubstrate: "natural",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    expect(ids(l)).toContain("emax-crown");
    expect(ids(l)).not.toContain("tooth-radix");
  });

  it("tooltip summary: does not list a crown alongside 'Radix'", () => {
    __setToothStateForTest(11, {
      toothSelection: "tooth-base",
      toothSubstrate: "radix",
      restorationType: "crown",
      restorationMaterial: "emax",
    });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).toContain(t("substrate.radix"));
    expect(summary).not.toContain(t("restoration.type.crown"));
  });
});

describe("SP15 wholebranch fix — Finding 2: stale mobility glyph on an implant", () => {
  it("render: no mobility glyph activates on an implant even with mobility set", () => {
    const l = render({ toothSelection: "implant", mobility: "m2" });
    expect(ids(l)).not.toContain("mobility");
  });

  it("regression guard: the SAME mobility on a tooth-base still renders the mobility glyph", () => {
    const l = render({ toothSelection: "tooth-base", mobility: "m2" });
    expect(ids(l)).toContain("mobility");
  });

  it("stored value is left untouched by hydrate (T1's preserve-value choice)", () => {
    __setToothStateForTest(11, { toothSelection: "implant", mobility: "m2" });
    const s = __getToothStateForTest(11)!;
    expect(s.mobility).toBe("m2");
  });

  it("tooltip summary: does not list mobility on an implant", () => {
    __setToothStateForTest(11, { toothSelection: "implant", mobility: "m2" });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).not.toContain(t("inflammation.mobilityLabel"));
  });

  it("tooltip summary: the SAME mobility on a tooth-base still lists it (regression guard)", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", mobility: "m2" });
    const summary = getToothStateSummary(11).join(" · ");
    expect(summary).toContain(t("inflammation.mobilityLabel"));
  });

  it("whole-mouth summary: does not list mobility for an implant tooth (periodontalText)", () => {
    // Distinct, otherwise-untouched tooth numbers (46) — the module-level
    // toothState map persists across tests in this file, so reusing tooth 11
    // (given mobility in earlier tests above) would leak into the
    // whole-mouth periodontalText string and produce a false positive/negative.
    __setToothStateForTest(46, { toothSelection: "implant", mobility: "m3" });
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).not.toContain("46 (");
  });

  it("whole-mouth summary: the SAME mobility on a tooth-base still lists it (regression guard)", () => {
    __setToothStateForTest(47, { toothSelection: "tooth-base", mobility: "m3" });
    const { periodontalText } = getOdontogramSummary();
    expect(periodontalText).toContain("47 (");
    expect(periodontalText).toContain(t("inflammation.mobilityLabel"));
  });
});
