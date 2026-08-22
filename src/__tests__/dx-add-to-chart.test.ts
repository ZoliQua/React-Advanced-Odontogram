// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Diagnoses card v2, Task 1 — `addDiagnosisToSelection` writes the underlying
// chart axis for a reverse-mappable diagnosis key, through the same DS-1-gated,
// repainting `applyToSelected` path the clinical controls use, so the finding
// becomes real (glyph + derived + exported) instead of a `dxOverride`-only
// annotation. `caries` is intentionally excluded (per-surface, authored in the
// Caries UI) — adding it via this API is a silent no-op.
import { describe, it, expect, beforeEach } from "vitest";
import {
  addDiagnosisToSelection, getToothDiagnoses, REVERSE_MAPPABLE_KEYS, TOOTH_LEVEL_DX_KEYS,
  __resetChartStateForTest, __setSelectionForTest, __getToothStateForTest,
} from "../odontogram";

describe("DX add-to-chart: addDiagnosisToSelection writes the chart axis", () => {
  beforeEach(() => __resetChartStateForTest());

  it("writes the underlying axis for each reverse-mappable diagnosis and the finding becomes derived", () => {
    __setSelectionForTest([11]); // present tooth (defaultState -> tooth-base)

    addDiagnosisToSelection("pulpitis");
    expect(__getToothStateForTest(11)?.pulpDx).toBe("irreversible-pulpitis");
    expect(getToothDiagnoses(11).map((d) => d.key)).toContain("pulpitis");

    addDiagnosisToSelection("toothLoss");
    expect(__getToothStateForTest(11)?.toothSelection).toBe("no-tooth-after-extraction");

    addDiagnosisToSelection("radicularCyst"); // compound: apicalDx + periapicalType
    expect(__getToothStateForTest(11)?.apicalDx).toBe("asymptomatic-apical-periodontitis");
    expect(__getToothStateForTest(11)?.periapicalType).toBe("cyst");

    addDiagnosisToSelection("erosion");
    expect(__getToothStateForTest(11)?.wearEdge).toBe("erosion");

    addDiagnosisToSelection("caries"); // excluded -- no-op on the chart
    expect(__getToothStateForTest(11)?.caries).toEqual([]);
  });

  it("is a silent no-op with no active selection", () => {
    expect(() => addDiagnosisToSelection("pulpitis")).not.toThrow();
  });

  it("is a silent no-op for an unknown / non-reverse-mappable key", () => {
    __setSelectionForTest([12]);
    addDiagnosisToSelection("not-a-real-key");
    expect(__getToothStateForTest(12)?.pulpDx).toBe("normal");
  });

  it("reverse map covers every tooth-level key except caries", () => {
    for (const k of REVERSE_MAPPABLE_KEYS) expect(TOOTH_LEVEL_DX_KEYS.has(k)).toBe(true);
    for (const k of TOOTH_LEVEL_DX_KEYS) if (k !== "caries") expect(REVERSE_MAPPABLE_KEYS.has(k)).toBe(true);
    expect(REVERSE_MAPPABLE_KEYS.has("caries")).toBe(false);
  });
});
