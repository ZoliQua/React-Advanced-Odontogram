// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  getPeriImplantPlaque, setPeriImplantPlaque, getPeriImplantBleeding, setPeriImplantBleeding,
  __setToothStateForTest, __resetChartStateForTest,
  __collectExportPayloadForTest, __hydrateImportedChartsForTest,
} from "../odontogram";

beforeEach(() => __resetChartStateForTest());

describe("peri-implant mPI/mBI (implant-gated per-surface graded)", () => {
  it("set/get mPI on an implant tooth", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    setPeriImplantPlaque(11, "buccal", 2);
    expect(getPeriImplantPlaque(11, "buccal")).toBe(2);
    expect(getPeriImplantPlaque(11, "mesial")).toBe(0); // absent = 0
  });
  it("mBI behaves the same on an implant tooth", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    setPeriImplantBleeding(11, "distal", 3);
    expect(getPeriImplantBleeding(11, "distal")).toBe(3);
  });
  it("grade 0 clears the surface", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    setPeriImplantPlaque(11, "buccal", 2);
    setPeriImplantPlaque(11, "buccal", 0);
    expect(getPeriImplantPlaque(11, "buccal")).toBe(0);
  });
  it("IMPLANT-GATE: setter is a no-op on a non-implant tooth", () => {
    __setToothStateForTest(21, {}); // natural tooth
    setPeriImplantPlaque(21, "buccal", 2);
    setPeriImplantBleeding(21, "buccal", 2);
    expect(getPeriImplantPlaque(21, "buccal")).toBe(0);
    expect(getPeriImplantBleeding(21, "buccal")).toBe(0);
  });
  it("invalid grade / surface is a no-op", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    setPeriImplantPlaque(11, "buccal", 9);
    setPeriImplantPlaque(11, "bogus", 2);
    expect(getPeriImplantPlaque(11, "buccal")).toBe(0);
  });
  it("serializes omit-when-empty and roundtrips at version 2.16", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    const empty = __collectExportPayloadForTest();
    expect(empty.version).toBe("2.21");
    expect(Object.prototype.hasOwnProperty.call(empty.teeth["11"], "mpi")).toBe(false);
    setPeriImplantPlaque(11, "buccal", 2);
    setPeriImplantBleeding(11, "buccal", 1);
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth["11"].mpi).toEqual({ buccal: 2 });
    expect(payload.teeth["11"].mbi).toEqual({ buccal: 1 });
    const json = JSON.parse(JSON.stringify(payload));
    __resetChartStateForTest();
    __hydrateImportedChartsForTest(json);
    expect(getPeriImplantPlaque(11, "buccal")).toBe(2);
    expect(getPeriImplantBleeding(11, "buccal")).toBe(1);
  });
  it("hydrate drops invalid surface/grade", () => {
    __hydrateImportedChartsForTest({ version: "2.16", teeth: { "11": { toothSelection: "implant", mpi: { buccal: 2, bogus: 3, mesial: 9 } } } });
    expect(getPeriImplantPlaque(11, "buccal")).toBe(2);
    expect(getPeriImplantPlaque(11, "mesial")).toBe(0);
  });
});
