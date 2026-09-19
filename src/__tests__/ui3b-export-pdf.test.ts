// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 6 / 2.2.2: `assemblePdf()` — pure section-gating + tabular
// assembler behind `exportPdf()`. Verified with an injectable fake jsPDF-like
// doc (see `PdfDocLike` in `../perioPdf`) rather than a real jsPDF instance,
// since jsPDF may not instantiate cleanly under jsdom — this suite asserts WHICH
// sections/rows get added (headings/images/table text/save), never pixel output.
import { describe, it, expect } from "vitest";
import { assemblePdf, PDF_PALETTES } from "../perioPdf";

function fakeDoc() {
  const calls: string[] = [];
  // `doc` is declared up-front (not hoisted after `return`) so the chaining
  // methods can safely reference it — a `let doc` after the return would be in
  // the temporal dead zone when a method runs.
  const doc: any = {
    calls,
    text: (...a: any[]) => { calls.push("text:" + String(a[0]).slice(0, 80)); return doc; },
    addImage: () => { calls.push("addImage"); return doc; },
    addPage: () => { calls.push("addPage"); return doc; },
    setFontSize: () => doc, setFont: () => doc,
    // 2.2.2 colored-table surface — no-ops that keep the chain + record draws.
    setTextColor: () => doc, setFillColor: () => doc, setDrawColor: () => doc, setLineWidth: () => doc,
    rect: () => { calls.push("rect"); return doc; },
    line: () => { calls.push("line"); return doc; },
    save: () => { calls.push("save"); },
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  };
  return doc;
}

const baseData = {
  hasPerio: true,
  reportTitle: "Odontogram Report",
  footer: {
    disclaimer: "Not a certified medical diagnostic device.",
    generated: "Generated on 2026-08-08 09:00 with React Advanced Odontogram v2.2.1",
    repoUrl: "https://github.com/ZoliQua/React-Advanced-Odontogram",
    doi: "https://doi.org/10.5281/zenodo.21156787",
  },
  palette: PDF_PALETTES.blue,
  patient: [
    { label: "Name", value: "X" },
    { label: "Date of birth", value: "1980-05-05 (45)" },
    { label: "Exam date", value: "2026-01-01" },
  ],
  odontogramPng: "data:image/png;base64,AAA",
  odontogramCaption: "Odonto overview sentence",
  odontogramFindings: [{ label: "Caries", value: "18 O" }],
  individualNotes: [] as { label: string; value: string }[],
  perioPng: "data:image/png;base64,BBB",
  perioMetrics: [{ label: "Max PD", value: "5" }],
  abbreviations: [{ term: "PD", desc: "probing depth" }],
};

const ALL_ON = {
  patientData: true, odontogramChart: true, odontogramDescription: true,
  individualNotes: true, perioStatus: true, perioDescription: true,
};

describe("UI-3b T6 / 2.2.2: assemblePdf section gating + tabular layout", () => {
  it("includes perio when opts.perioStatus and data exist", () => {
    const doc = fakeDoc();
    assemblePdf(ALL_ON, baseData, () => doc);
    expect(doc.calls).toContain("addImage");            // both charts
    expect(doc.calls.filter((c: string) => c === "addImage").length).toBe(2);
    expect(doc.calls).toContain("save");
  });

  it("auto-skips perio when hasPerio is false, even if opts ask for it", () => {
    const doc = fakeDoc();
    assemblePdf(ALL_ON, { ...baseData, hasPerio: false }, () => doc);
    expect(doc.calls.filter((c: string) => c === "addImage").length).toBe(1); // odontogram only
  });

  it("omits the odontogram chart image when opts.odontogramChart is false", () => {
    const doc = fakeDoc();
    assemblePdf({ ...ALL_ON, odontogramChart: false }, baseData, () => doc);
    expect(doc.calls.filter((c: string) => c === "addImage").length).toBe(1); // perio only
  });

  it("chart image and description are independently selectable", () => {
    // Description only (no chart image): the odontogram caption/findings render
    // but no odontogram image — so addImage counts perio only (also off here).
    const doc = fakeDoc();
    assemblePdf({ ...ALL_ON, odontogramChart: false, perioStatus: false, perioDescription: false },
      baseData, () => doc);
    expect(doc.calls.filter((c: string) => c === "addImage").length).toBe(0);
    expect(doc.calls.some((c: string) => c.includes("Odonto overview"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("Caries"))).toBe(true); // findings table row
  });

  it("2.2.2: renders colored tables (rect draws) for the tabular layout", () => {
    const doc = fakeDoc();
    assemblePdf({ patientData: true, odontogramChart: false, odontogramDescription: false,
      individualNotes: false, perioStatus: false, perioDescription: false }, baseData, () => doc);
    // Patient table alone draws several cell/border rects.
    expect(doc.calls.filter((c: string) => c === "rect").length).toBeGreaterThan(0);
  });

  it("2.2.3 (round 2): renders the grouped dentition table (tooth numbers + legend) when provided", () => {
    const doc = fakeDoc();
    const toothTable = {
      columns: [
        { key: "permanent", label: "Permanent teeth" },
        { key: "missing", label: "Missing teeth" },
      ],
      rows: [
        {
          key: "upper",
          label: "Upper jaw",
          cells: {
            permanent: [{ toothNo: 16, label: "16", status: "problem" as const }],
            missing: [{ toothNo: 18, label: "18", status: "empty" as const }],
          },
        },
      ],
      legend: "Bold blue: has content. Bold italic red: has a problem.",
    };
    assemblePdf({ ...ALL_ON, perioStatus: false, perioDescription: false },
      { ...baseData, toothTable }, () => doc);
    // Column header, group-row label, a tooth number, and the legend all render.
    expect(doc.calls.some((c: string) => c.includes("Permanent teeth"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("Upper jaw"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("16"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("has a problem"))).toBe(true);
  });

  it("2.2.3 (round 2): omits the dentition table when toothTable is null", () => {
    const doc = fakeDoc();
    assemblePdf({ ...ALL_ON, perioStatus: false, perioDescription: false },
      { ...baseData, toothTable: null }, () => doc);
    // The unique legend phrasing must not appear when there is no table.
    expect(doc.calls.some((c: string) => c.includes("has a problem"))).toBe(false);
  });

  it("individual-notes section is added only when at least one note exists", () => {
    const withNotes = fakeDoc();
    assemblePdf(ALL_ON, { ...baseData, individualNotes: [{ label: "18", value: "watch this tooth" }] }, () => withNotes);
    expect(withNotes.calls.some((c: string) => c.includes("watch this tooth"))).toBe(true);

    // No notes → no notes section even when opts.individualNotes is on.
    const noNotes = fakeDoc();
    assemblePdf(ALL_ON, { ...baseData, individualNotes: [] }, () => noNotes);
    expect(noNotes.calls.some((c: string) => c.includes("watch this tooth"))).toBe(false);
  });

  it("2.2.2: perio description renders the metrics table + abbreviation glossary", () => {
    const doc = fakeDoc();
    assemblePdf(ALL_ON, baseData, () => doc);
    expect(doc.calls.some((c: string) => c.includes("Max PD"))).toBe(true);       // metrics row
    expect(doc.calls.some((c: string) => c.includes("probing depth"))).toBe(true); // abbreviation desc
    expect(doc.calls.some((c: string) => c.startsWith("text:PD"))).toBe(true);      // abbreviation term
  });

  it("patient DOB row shows the DOB (with age) in the header table", () => {
    const doc = fakeDoc();
    assemblePdf(ALL_ON, baseData, () => doc);
    // DOB 1980-05-05, exam 2026-01-01 → age 45, rendered as "1980-05-05 (45)".
    expect(doc.calls.some((c: string) => c.includes("1980-05-05 (45)"))).toBe(true);
  });

  it("2.2.2: renders the document title at the top and the footer (disclaimer + stamp + links)", () => {
    const doc = fakeDoc();
    assemblePdf(ALL_ON, baseData, () => doc);
    expect(doc.calls.some((c: string) => c.includes("Odontogram Report"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("certified medical diagnostic device"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("React Advanced Odontogram v2.2.1"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("github.com/ZoliQua"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("doi.org"))).toBe(true);
  });

  it("2.2.3: renders the pre-built patient identity rows as given", () => {
    // Placeholder/age/date-format resolution now happens in exportPdf; the
    // assembler simply lays out the rows it is handed.
    const doc = fakeDoc();
    assemblePdf({ ...ALL_ON, perioStatus: false, perioDescription: false },
      { ...baseData, patient: [
        { label: "Name", value: "John Doe" },
        { label: "Date of birth", value: "01-01-1980" },
        { label: "Exam date", value: "15-08-2026" },
      ] }, () => doc);
    expect(doc.calls.some((c: string) => c.includes("John Doe"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("01-01-1980"))).toBe(true);
    expect(doc.calls.some((c: string) => c.includes("15-08-2026"))).toBe(true);
  });
});
