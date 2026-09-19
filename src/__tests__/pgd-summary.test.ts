// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-D Task 5: whole-mouth summary + per-tooth tooltip surfacing for
// the five PG-D axes — PI (Silness-Löe Plaque Index), GI (Löe-Silness
// Gingival Index), KG (keratinized gingiva width), GT (gingival thickness/
// biotype), Miller recession class. Data + summary-surfacing only — no SVG/
// FHIR/registry change (none of these axes carries a chart layer), so
// parity is unaffected. Mirrors pgc-rows.test.ts / pgc-cairo.test.ts's
// tooltip + getOdontogramSummary surfacing tests, and extends
// getPerioSummary() the same way maxFurcation/plaquePercent were added
// (P2b) — see .superpowers/sdd/2026-07-31-odontogram-pgd-graded-indices-mucogingival/task-5-brief.md.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setPlaqueIndex, setGingivalIndex,
  setKeratinizedWidth, setGingivalThickness, setMillerClass,
  getPerioSummary,
  getToothStateSummary, getOdontogramSummary,
  __setToothStateForTest, __resetChartStateForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("getPerioSummary(): PG-D whole-mouth metrics", () => {
  it("piScore/giScore are null when nothing is charted anywhere", () => {
    __setToothStateForTest(11, {});
    const summary = getPerioSummary();
    expect(summary.piScore).toBeNull();
    expect(summary.giScore).toBeNull();
  });

  it("piScore is the mean of all charted PI surface grades, 1 decimal", () => {
    __setToothStateForTest(11, {});
    __setToothStateForTest(12, {});
    setPlaqueIndex(11, "buccal", 2);
    setPlaqueIndex(11, "mesial", 1);
    setPlaqueIndex(12, "distal", 3);
    // (2 + 1 + 3) / 3 = 2.0
    expect(getPerioSummary().piScore).toBe(2);
  });

  it("piScore ignores un-charted (grade 0) surfaces, not counted as 0", () => {
    __setToothStateForTest(11, {});
    setPlaqueIndex(11, "buccal", 1);
    setPlaqueIndex(11, "mesial", 2);
    // mean of {1,2} = 1.5, NOT diluted by the other 2 uncharted surfaces on
    // this tooth or any other tooth in the mouth.
    expect(getPerioSummary().piScore).toBe(1.5);
  });

  it("giScore is the mean of all charted GI surface grades, 1 decimal", () => {
    __setToothStateForTest(21, {});
    setGingivalIndex(21, "buccal", 3);
    setGingivalIndex(21, "lingual", 2);
    setGingivalIndex(21, "mesial", 2);
    // (3+2+2)/3 = 2.333... -> 2.3
    expect(getPerioSummary().giScore).toBe(2.3);
  });

  it("kgDeficientTeeth counts teeth with kg != null && kg < 2, never uncharted teeth", () => {
    __setToothStateForTest(11, {});
    __setToothStateForTest(12, {});
    __setToothStateForTest(13, {});
    setKeratinizedWidth(11, 1); // deficient
    setKeratinizedWidth(12, 2); // NOT deficient (>=2)
    setKeratinizedWidth(13, 0); // deficient (0 < 2)
    // tooth 14 never touched -> not charted -> not counted
    expect(getPerioSummary().kgDeficientTeeth).toBe(2);
  });

  it("gtDistribution counts thin/medium/thick, excludes unknown", () => {
    __setToothStateForTest(11, {});
    __setToothStateForTest(12, {});
    __setToothStateForTest(13, {});
    __setToothStateForTest(14, {});
    setGingivalThickness(11, "thin");
    setGingivalThickness(12, "thin");
    setGingivalThickness(13, "medium");
    setGingivalThickness(14, "thick");
    // tooth 15 never touched -> "unknown" default -> not counted
    expect(getPerioSummary().gtDistribution).toEqual({ thin: 2, medium: 1, thick: 1 });
  });

  it("millerDistribution counts i/ii/iii/iv, excludes none", () => {
    __setToothStateForTest(11, {});
    __setToothStateForTest(12, {});
    setMillerClass(11, "i");
    setMillerClass(12, "iii");
    expect(getPerioSummary().millerDistribution).toEqual({ i: 1, ii: 0, iii: 1, iv: 0 });
  });

  it("returns zeros/null (never NaN) when nothing charted anywhere", () => {
    const summary = getPerioSummary();
    expect(summary.piScore).toBeNull();
    expect(summary.giScore).toBeNull();
    expect(summary.kgDeficientTeeth).toBe(0);
    expect(summary.gtDistribution).toEqual({ thin: 0, medium: 0, thick: 0 });
    expect(summary.millerDistribution).toEqual({ i: 0, ii: 0, iii: 0, iv: 0 });
  });
});

describe("getToothStateSummary(): PG-D per-tooth tooltip lines", () => {
  it("includes charted PI surfaces, omits when none charted", () => {
    __setToothStateForTest(16, {});
    expect(getToothStateSummary(16).some((l) => l.includes(t("perio.pi.row")))).toBe(false);
    setPlaqueIndex(16, "buccal", 2);
    const lines = getToothStateSummary(16);
    const piLine = lines.find((l) => l.includes(t("perio.pi.row")));
    expect(piLine).toBeTruthy();
    expect(piLine).toContain("2");
  });

  it("includes charted GI surfaces, omits when none charted", () => {
    __setToothStateForTest(16, {});
    expect(getToothStateSummary(16).some((l) => l.includes(t("perio.gi.row")))).toBe(false);
    setGingivalIndex(16, "mesial", 3);
    const lines = getToothStateSummary(16);
    const giLine = lines.find((l) => l.includes(t("perio.gi.row")));
    expect(giLine).toBeTruthy();
    expect(giLine).toContain("3");
  });

  it("includes the KG mm value, omits when not charted", () => {
    __setToothStateForTest(16, {});
    expect(getToothStateSummary(16).some((l) => l.includes(t("perio.kg.row")))).toBe(false);
    setKeratinizedWidth(16, 4);
    const lines = getToothStateSummary(16);
    expect(lines.some((l) => l.includes(t("perio.kg.row")) && l.includes("4"))).toBe(true);
  });

  it("includes the GT phenotype label, omits when unknown", () => {
    __setToothStateForTest(16, {});
    expect(getToothStateSummary(16)).not.toContain(t("perio.gt.thin"));
    setGingivalThickness(16, "thin");
    expect(getToothStateSummary(16)).toContain(t("perio.gt.thin"));
  });

  it("includes the Miller class label, omits when none", () => {
    __setToothStateForTest(16, {});
    expect(getToothStateSummary(16)).not.toContain(t("perio.miller.ii"));
    setMillerClass(16, "ii");
    expect(getToothStateSummary(16)).toContain(t("perio.miller.ii"));
  });
});

describe("getOdontogramSummary(): PG-D per-tooth lines join the periodontal grouping", () => {
  it("periodontalText surfaces GT and Miller alongside other periodontal findings", () => {
    __setToothStateForTest(16, {});
    setGingivalThickness(16, "thin");
    setMillerClass(16, "iv");
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toContain(t("perio.gt.thin"));
    expect(summary.periodontalText).toContain(t("perio.miller.iv"));
  });

  it("periodontalText surfaces PI/GI/KG alongside other periodontal findings", () => {
    __setToothStateForTest(16, {});
    setPlaqueIndex(16, "buccal", 1);
    setGingivalIndex(16, "buccal", 1);
    setKeratinizedWidth(16, 5);
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toContain(t("perio.pi.row"));
    expect(summary.periodontalText).toContain(t("perio.gi.row"));
    expect(summary.periodontalText).toContain(t("perio.kg.row"));
  });

  it("periodontalText stays healthy when no PG-D axis is set anywhere", () => {
    __setToothStateForTest(16, {});
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toBe(t("toothInfo.periodontalHealthy"));
  });
});
