// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The PDF report must never invent who the patient is.
//
// The identity placeholders used to default to "John Doe" and "1980-01-01", and
// the report printed them — together with an age computed from the invented
// date — exactly like real data. A report that looks complete while carrying a
// made-up date of birth is not an incomplete record but a wrong one: whoever
// holds it has no way to tell. "John Doe" at least stands out; a date does not.
// Reported and fixed in a downstream fork (saegerdirk-star, 2.29.1).
import { describe, it, expect, beforeEach, vi } from "vitest";
import { __pdfPatientRowsForTest as rows, getPdfSettings, setPdfSettings } from "../odontogram";
import { t } from "../i18n/useI18n";

const TODAY = "2026-09-18";
const empty = { patientName: null, patientDob: null, examDate: null };
const value = (r: Array<{ label: string; value: string }>, key: string) =>
  r.find((x) => x.label === t(key))?.value;

describe("PDF patient identity", () => {
  beforeEach(() => setPdfSettings({ defaultName: "", defaultDob: "" }));

  it("the library ships with no placeholder identity", async () => {
    // A FRESH module instance: `beforeEach` has already written these fields on
    // the shared one, so reading that would prove nothing about the defaults.
    vi.resetModules();
    const fresh = (await import("../odontogram")).getPdfSettings();
    expect(fresh.defaultName).toBe("");
    expect(fresh.defaultDob).toBe("");
  });

  it("an empty case prints 'not specified', never an invented name, date or age", () => {
    const r = rows(empty, getPdfSettings(), TODAY);
    expect(value(r, "pdf.field.patientName")).toBe(t("pdf.field.notSpecified"));
    expect(value(r, "pdf.field.patientDob")).toBe(t("pdf.field.notSpecified"));
    const all = r.map((x) => x.value).join(" ");
    expect(all).not.toMatch(/John Doe|1980/);
    expect(all).not.toMatch(/\(\d+\)/);           // no age in parentheses
  });

  it("keeps every row, so a missing value reads as 'not recorded'", () => {
    expect(rows(empty, getPdfSettings(), TODAY).map((x) => x.label)).toEqual([
      t("pdf.field.patientName"), t("pdf.field.patientDob"), t("pdf.field.examDate"),
    ]);
  });

  it("the exam date still falls back to today — that invents nothing about the patient", () => {
    expect(value(rows(empty, getPdfSettings(), TODAY), "pdf.field.examDate")).toBe(TODAY);
  });

  it("real case data is printed, with the age derived from it", () => {
    const r = rows({ patientName: "Kovács Anna", patientDob: "1990-03-10", examDate: "2026-09-18" }, getPdfSettings(), TODAY);
    expect(value(r, "pdf.field.patientName")).toBe("Kovács Anna");
    expect(value(r, "pdf.field.patientDob")).toBe("1990-03-10 (36)");
  });

  it("a placeholder a host configures deliberately is honoured — but never aged", () => {
    setPdfSettings({ defaultName: "Anonymous", defaultDob: "2000-01-01" });
    const r = rows(empty, getPdfSettings(), TODAY);
    expect(value(r, "pdf.field.patientName")).toBe("Anonymous");
    expect(value(r, "pdf.field.patientDob")).toBe("2000-01-01");   // no "(26)": not the patient's age
  });

  it("a blank name is treated as missing, not printed as an empty string", () => {
    const r = rows({ ...empty, patientName: "   " }, getPdfSettings(), TODAY);
    expect(value(r, "pdf.field.patientName")).toBe(t("pdf.field.notSpecified"));
  });
});
