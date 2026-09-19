// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-E Task 3: whole-mouth summary + per-tooth tooltip surfacing for
// the peri-implant Mombelli indices — mPI (modified plaque index) and mBI
// (modified sulcus bleeding index). Mirrors pgd-summary.test.ts's
// piScore/giScore whole-mouth mean tests and PI/GI tooltip/periodontalText
// surfacing tests, but implant-gated (only implant teeth can carry mpi/mbi
// data at all — see .superpowers/sdd/2026-07-31-odontogram-pge-peri-implant-indices/task-3-brief.md).
import { describe, it, expect, beforeEach } from "vitest";
import {
  setPeriImplantPlaque, setPeriImplantBleeding,
  getPerioSummary,
  getToothStateSummary, getOdontogramSummary,
  __setToothStateForTest, __resetChartStateForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("getPerioSummary(): PG-E whole-mouth mPI/mBI metrics", () => {
  it("mpiScore/mbiScore are null when nothing is charted anywhere", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    const summary = getPerioSummary();
    expect(summary.mpiScore).toBeNull();
    expect(summary.mbiScore).toBeNull();
  });

  it("mpiScore is the mean of all charted mPI surface grades across implant teeth, 1 decimal", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setToothStateForTest(12, { toothSelection: "implant" });
    setPeriImplantPlaque(11, "buccal", 2);
    setPeriImplantPlaque(11, "mesial", 1);
    setPeriImplantPlaque(12, "distal", 3);
    // (2 + 1 + 3) / 3 = 2.0
    expect(getPerioSummary().mpiScore).toBe(2);
  });

  it("mpiScore ignores un-charted (grade 0) surfaces, not counted as 0", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    setPeriImplantPlaque(11, "buccal", 1);
    setPeriImplantPlaque(11, "mesial", 2);
    // mean of {1,2} = 1.5, NOT diluted by the other 2 uncharted surfaces.
    expect(getPerioSummary().mpiScore).toBe(1.5);
  });

  it("mbiScore is the mean of all charted mBI surface grades across implant teeth, 1 decimal", () => {
    __setToothStateForTest(21, { toothSelection: "implant" });
    setPeriImplantBleeding(21, "buccal", 3);
    setPeriImplantBleeding(21, "lingual", 2);
    setPeriImplantBleeding(21, "mesial", 2);
    // (3+2+2)/3 = 2.333... -> 2.3
    expect(getPerioSummary().mbiScore).toBe(2.3);
  });

  it("a non-implant tooth cannot contribute (setter is a no-op), so it never dilutes the mean", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setToothStateForTest(21, {}); // natural tooth
    setPeriImplantPlaque(11, "buccal", 2);
    setPeriImplantPlaque(21, "buccal", 3); // no-op: not an implant
    expect(getPerioSummary().mpiScore).toBe(2);
  });

  it("returns null (never NaN) when nothing charted anywhere", () => {
    const summary = getPerioSummary();
    expect(summary.mpiScore).toBeNull();
    expect(summary.mbiScore).toBeNull();
  });
});

describe("getToothStateSummary(): PG-E per-tooth tooltip lines", () => {
  it("includes charted mPI surfaces, omits when none charted", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    expect(getToothStateSummary(16).some((l) => l.includes(t("perio.mpi.row")))).toBe(false);
    setPeriImplantPlaque(16, "buccal", 2);
    const lines = getToothStateSummary(16);
    const mpiLine = lines.find((l) => l.includes(t("perio.mpi.row")));
    expect(mpiLine).toBeTruthy();
    expect(mpiLine).toContain("2");
  });

  it("includes charted mBI surfaces, omits when none charted", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    expect(getToothStateSummary(16).some((l) => l.includes(t("perio.mbi.row")))).toBe(false);
    setPeriImplantBleeding(16, "mesial", 3);
    const lines = getToothStateSummary(16);
    const mbiLine = lines.find((l) => l.includes(t("perio.mbi.row")));
    expect(mbiLine).toBeTruthy();
    expect(mbiLine).toContain("3");
  });
});

describe("getOdontogramSummary(): PG-E per-tooth lines join the periodontal grouping", () => {
  it("periodontalText surfaces mPI/mBI alongside other periodontal findings", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    setPeriImplantPlaque(16, "buccal", 1);
    setPeriImplantBleeding(16, "buccal", 1);
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toContain(t("perio.mpi.row"));
    expect(summary.periodontalText).toContain(t("perio.mbi.row"));
  });

  it("periodontalText stays healthy when no mPI/mBI is set anywhere", () => {
    __setToothStateForTest(16, { toothSelection: "implant" });
    const summary = getOdontogramSummary();
    expect(summary.periodontalText).toBe(t("toothInfo.periodontalHealthy"));
  });
});
