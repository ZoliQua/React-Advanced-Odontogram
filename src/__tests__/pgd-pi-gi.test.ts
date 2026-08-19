// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio PG-D Task 1: Silness-Löe Plaque Index (PI) + Löe-Silness Gingival
// Index (GI) — per-surface GRADED (1-3) axes, deliberately separate from the
// O'Leary `plaque` boolean axis. Data + serialize + hydrate only (FHIR export
// is covered in pgd-pi-gi-fhir.test.ts; the UI row is a later PG-D task). See
// .superpowers/sdd/2026-07-31-odontogram-pgd-graded-indices-mucogingival/task-1-brief.md.
//
// Pure data-model tests — NO UI, NO SVG render (neither axis has a chart
// layer). Uses the same module-state test seams as the P1 perio core /
// P2b furcation/plaque tests (__setToothStateForTest operates on the ACTIVE
// chart; __resetChartStateForTest clears both charts + planInitialized +
// mode before every test so module state never leaks).
import { describe, it, expect, beforeEach } from "vitest";
import {
  setPlaqueIndex, getPlaqueIndex, setGingivalIndex, getGingivalIndex,
  __setToothStateForTest, __resetChartStateForTest,
  __collectExportPayloadForTest, __hydrateImportedChartsForTest,
} from "../odontogram";

beforeEach(() => __resetChartStateForTest());

describe("PI/GI per-surface graded axes", () => {
  it("set/get a PI grade on a surface", () => {
    __setToothStateForTest(11, {});
    setPlaqueIndex(11, "buccal", 2);
    expect(getPlaqueIndex(11, "buccal")).toBe(2);
    expect(getPlaqueIndex(11, "mesial")).toBe(0); // absent = 0
  });
  it("grade 0 clears the surface", () => {
    __setToothStateForTest(11, {});
    setPlaqueIndex(11, "buccal", 3);
    setPlaqueIndex(11, "buccal", 0);
    expect(getPlaqueIndex(11, "buccal")).toBe(0);
  });
  it("invalid grade / surface is a no-op", () => {
    __setToothStateForTest(11, {});
    setPlaqueIndex(11, "buccal", 9);
    setPlaqueIndex(11, "bogus", 2);
    expect(getPlaqueIndex(11, "buccal")).toBe(0);
  });
  it("GI behaves the same", () => {
    __setToothStateForTest(21, {});
    setGingivalIndex(21, "mesial", 1);
    expect(getGingivalIndex(21, "mesial")).toBe(1);
  });
  it("serializes omit-when-empty and roundtrips at version 2.16", () => {
    __setToothStateForTest(11, {});
    const empty = __collectExportPayloadForTest();
    expect(empty.version).toBe("2.21");
    expect(Object.prototype.hasOwnProperty.call(empty.teeth["11"], "pi")).toBe(false);
    setPlaqueIndex(11, "buccal", 2);
    setGingivalIndex(11, "buccal", 1);
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth["11"].pi).toEqual({ buccal: 2 });
    const json = JSON.parse(JSON.stringify(payload));
    __resetChartStateForTest();
    __hydrateImportedChartsForTest(json);
    expect(getPlaqueIndex(11, "buccal")).toBe(2);
    expect(getGingivalIndex(11, "buccal")).toBe(1);
  });
  it("hydrate drops invalid surface/grade", () => {
    __hydrateImportedChartsForTest({ version: "2.16", teeth: { "11": { pi: { buccal: 2, bogus: 3, mesial: 9 } } } });
    expect(getPlaqueIndex(11, "buccal")).toBe(2);
    expect(getPlaqueIndex(11, "mesial")).toBe(0);
  });
});
