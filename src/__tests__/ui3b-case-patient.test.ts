// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, beforeEach } from "vitest";
import {
  setPatientName, setExamDate, getCaseMeta, resetCaseMeta,
  __collectExportPayloadForTest, __hydrateImportedChartsForTest,
} from "../odontogram";

describe("UI-3b T1: caseMeta patient name + exam date", () => {
  beforeEach(() => resetCaseMeta());

  it("stores and clears patient name", () => {
    setPatientName("Kovács Anna");
    expect(getCaseMeta().patientName).toBe("Kovács Anna");
    setPatientName(null);
    expect(getCaseMeta().patientName).toBeNull();
    setPatientName("   ");            // whitespace-only trims to empty → clears
    expect(getCaseMeta().patientName).toBeNull();
  });

  it("stores exam date and rejects a malformed one (no-op)", () => {
    setExamDate("2026-08-02");
    expect(getCaseMeta().examDate).toBe("2026-08-02");
    setExamDate("not-a-date");        // invalid → no-op, keeps current
    expect(getCaseMeta().examDate).toBe("2026-08-02");
    setExamDate(null);
    expect(getCaseMeta().examDate).toBeNull();
  });

  it("omit-when-empty: name/date absent from payload.case when unset, present when set; version is 2.20", () => {
    const empty = __collectExportPayloadForTest() as any;
    expect(empty.version).toBe("2.21");
    expect(empty.case).toBeUndefined();  // whole caseMeta empty → no case key
    setPatientName("X"); setExamDate("2026-01-05");
    const p = __collectExportPayloadForTest() as any;
    expect(p.case.patientName).toBe("X");
    expect(p.case.examDate).toBe("2026-01-05");
  });

  it("round-trips name/date through import", () => {
    setPatientName("Teszt Elek"); setExamDate("2026-03-09");
    const payload = JSON.parse(JSON.stringify(__collectExportPayloadForTest()));
    resetCaseMeta();
    __hydrateImportedChartsForTest(payload);
    expect(getCaseMeta().patientName).toBe("Teszt Elek");
    expect(getCaseMeta().examDate).toBe("2026-03-09");
  });
});
