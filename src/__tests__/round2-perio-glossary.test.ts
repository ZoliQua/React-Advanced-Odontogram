// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Round 2: the PDF perio abbreviation glossary is DYNAMIC — it lists only the
// perio codes/indices actually charted in the case (so a report explains just
// the abbreviations it shows). Verified via the `buildPerioAbbreviations` test
// seam, since the real caller `exportPdf` can't run under jsdom (jsPDF needs
// canvas).
import { describe, it, expect, beforeEach } from "vitest";
import {
  __resetChartStateForTest,
  __buildPerioAbbreviationsForTest as glossary,
  setRootConcavity,
  setCejVisibility,
  setKeratinizedWidth,
  setPlaqueIndex,
  setPerioSite,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

const terms = () => glossary().map((e) => e.term);

describe("Round 2: dynamic perio abbreviation glossary", () => {
  it("is empty on a blank chart (no perio charted → no extra abbreviations)", () => {
    expect(glossary()).toEqual([]);
  });

  it("adds the Mi/Dp entry only when root concavity is charted", () => {
    expect(terms()).not.toContain("Mi / Dp");
    setRootConcavity(16, "mild");
    const entry = glossary().find((e) => e.term === "Mi / Dp");
    expect(entry).toBeTruthy();
    // The description explains both coded faces (localized).
    expect(entry!.desc).toMatch(/Mi:/);
    expect(entry!.desc).toMatch(/Dp:/);
  });

  it("adds CEJ, KG and PI entries when those axes are charted", () => {
    setCejVisibility(16, "detectable");
    setKeratinizedWidth(16, 3);
    setPlaqueIndex(16, "buccal", 2);
    const t = terms();
    expect(t).toContain("CEJ (D/ND)");
    expect(t).toContain("KG");
    expect(t).toContain("PI");
  });

  it("does not add pocket-only codes as extras (PD/GM/CAL/BOP come from the static legend)", () => {
    setPerioSite(16, "MB", { pd: 4 });
    const t = terms();
    expect(t).not.toContain("PD");
    expect(t).not.toContain("CAL");
  });
});
