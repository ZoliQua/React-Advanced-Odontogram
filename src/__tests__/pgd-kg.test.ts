// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-D Task 2: keratinized gingiva width (KG) — a per-tooth BUCCAL
// mm scalar (integer, clamped 0-15; null = not charted). Deliberately a
// single scalar, not per-site/per-surface, unlike PI/GI (Task 1) or the
// 6-site perio probing record. See
// .superpowers/sdd/2026-07-31-odontogram-pgd-graded-indices-mucogingival/task-2-brief.md.
//
// Pure data-model tests — NO UI, NO SVG render (no svgLayer for this axis).
// Uses the same module-state test seams as the PI/GI (Task 1) tests.
import { describe, it, expect, beforeEach } from "vitest";
import {
  setKeratinizedWidth, getKeratinizedWidth,
  __setToothStateForTest, __resetChartStateForTest,
  __collectExportPayloadForTest, __hydrateImportedChartsForTest,
} from "../odontogram";
beforeEach(() => __resetChartStateForTest());
describe("keratinized gingiva width", () => {
  it("set/get mm", () => { __setToothStateForTest(11, {}); setKeratinizedWidth(11, 3); expect(getKeratinizedWidth(11)).toBe(3); });
  it("null clears", () => { __setToothStateForTest(11, {}); setKeratinizedWidth(11, 3); setKeratinizedWidth(11, null); expect(getKeratinizedWidth(11)).toBeNull(); });
  it("clamps to 0–15, rejects non-finite", () => {
    __setToothStateForTest(11, {}); __setToothStateForTest(12, {}); __setToothStateForTest(13, {});
    setKeratinizedWidth(11, 99); expect(getKeratinizedWidth(11)).toBe(15);
    setKeratinizedWidth(12, -5); expect(getKeratinizedWidth(12)).toBe(0);
    setKeratinizedWidth(13, NaN); expect(getKeratinizedWidth(13)).toBeNull();
  });
  it("omit-when-null serialize + roundtrip", () => {
    __setToothStateForTest(11, {});
    expect(Object.prototype.hasOwnProperty.call(__collectExportPayloadForTest().teeth["11"], "kg")).toBe(false);
    setKeratinizedWidth(11, 4);
    const payload = __collectExportPayloadForTest(); expect(payload.teeth["11"].kg).toBe(4);
    const json = JSON.parse(JSON.stringify(payload));
    __resetChartStateForTest(); __hydrateImportedChartsForTest(json);
    expect(getKeratinizedWidth(11)).toBe(4);
  });
  it("hydrate clamps invalid", () => {
    __hydrateImportedChartsForTest({ version: "2.15", teeth: { "11": { kg: 99 }, "12": { kg: "x" } } });
    expect(getKeratinizedWidth(11)).toBe(15);
    expect(getKeratinizedWidth(12)).toBeNull();
  });
});
