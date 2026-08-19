// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  importStatus, getToothDiagnoses, getActiveDiagnoses, setDxOverrideForSelection,
  __resetChartStateForTest, __collectExportPayloadForTest, __setSelectionForTest, clearSelection,
} from "../odontogram";

describe("DX-2 active diagnoses API", () => {
  beforeEach(() => __resetChartStateForTest());

  it("getToothDiagnoses returns effective coded diagnoses with source", () => {
    importStatus({ version: "2.20", globals: {}, teeth: { "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] } } });
    const dx = getToothDiagnoses(16);
    expect(dx.map((d) => d.key)).toEqual(["caries"]);
    expect(dx[0].icd10).toBe("K02");
    expect(dx[0].source).toBe("derived");
  });

  it("getToothDiagnoses returns [] for a tooth with no state", () => {
    expect(getToothDiagnoses(47)).toEqual([]);
  });

  it("setDxOverrideForSelection persists through export and getActiveDiagnoses reflects a suppress", () => {
    importStatus({ version: "2.20", globals: {}, teeth: { "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] } } });
    __setSelectionForTest([16]);
    setDxOverrideForSelection("caries", "suppress");

    const active = getActiveDiagnoses();
    expect(active.visible).toBe(true);
    const cariesRow = active.rows.find((r) => r.key === "caries");
    expect(cariesRow).toBeTruthy();
    expect(cariesRow!.suppressed).toBe(true);
    expect(cariesRow!.source).toBe("derived");

    // effective diagnoses no longer include the suppressed key
    expect(getToothDiagnoses(16).map((d) => d.key)).toEqual([]);

    // round-trips via export
    const payload = __collectExportPayloadForTest();
    expect((payload.teeth["16"] as any).dxOverrides).toEqual({ caries: "suppress" });
  });

  it("setDxOverrideForSelection with add surfaces a new row with source added", () => {
    importStatus({ version: "2.20", globals: {}, teeth: { "16": { toothSelection: "tooth-base" } } });
    __setSelectionForTest([16]);
    setDxOverrideForSelection("calculus", "add");

    const active = getActiveDiagnoses();
    const addedRow = active.rows.find((r) => r.key === "calculus");
    expect(addedRow).toBeTruthy();
    expect(addedRow!.source).toBe("added");
    expect(addedRow!.suppressed).toBe(false);

    expect(getToothDiagnoses(16).map((d) => d.key)).toContain("calculus");
    expect(getToothDiagnoses(16).find((d) => d.key === "calculus")!.source).toBe("added");

    const payload = __collectExportPayloadForTest();
    expect((payload.teeth["16"] as any).dxOverrides).toEqual({ calculus: "add" });
  });

  it("getActiveDiagnoses with no active tooth returns not visible", () => {
    clearSelection();
    const active = getActiveDiagnoses();
    expect(active.visible).toBe(false);
    expect(active.rows).toEqual([]);
    expect(active.addableKeys).toEqual([]);
  });
});
