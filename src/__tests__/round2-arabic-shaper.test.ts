// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Round 2 (phase 2): Arabic shaping for the PDF report. jsPDF applies no
// OpenType layout, so Arabic must be pre-shaped to Presentation-Forms-B glyphs
// and RTL-reordered before rendering. These verify the contextual-form choice
// and the run reversal on a known word, plus the non-Arabic passthrough.
import { describe, it, expect } from "vitest";
import { shapeArabic, hasArabic } from "../fonts/arabicShaper";

describe("Round 2: Arabic shaper", () => {
  it("leaves non-Arabic strings untouched", () => {
    expect(shapeArabic("PD: 5 mm")).toBe("PD: 5 mm");
    expect(shapeArabic("őrült fűző")).toBe("őrült fűző");
    expect(hasArabic("PD 5")).toBe(false);
  });

  it('shapes "بيت" to initial/medial/final forms, reversed for RTL', () => {
    // beh(initial FE91) yeh(medial FEF4) teh(final FE96); logical order then the
    // single RTL run is reversed → FE96 FEF4 FE91.
    const out = shapeArabic("بيت");
    expect(Array.from(out).map((c) => c.codePointAt(0)!.toString(16).toUpperCase()))
      .toEqual(["FE96", "FEF4", "FE91"]);
  });

  it("connects a right-joining letter (alef) to a preceding dual letter as its final form", () => {
    // "با" = beh(dual) + alef(right-joining). beh takes its initial form (FE91,
    // connecting forward); alef takes its FINAL form (FE8E, connecting back) but
    // never joins the next letter. Reversed for RTL → [FE8E, FE91].
    const out = shapeArabic("با");
    expect(Array.from(out).map((c) => c.codePointAt(0)!.toString(16).toUpperCase()))
      .toEqual(["FE8E", "FE91"]);
  });

  it("keeps two dals disconnected (dal never joins the following letter)", () => {
    // Dal is right-joining: in "دد" neither connects, so both stay isolated FEA9.
    const out = shapeArabic("دد");
    expect(Array.from(out).map((c) => c.codePointAt(0)!.toString(16).toUpperCase()))
      .toEqual(["FEA9", "FEA9"]);
  });

  it("detects Arabic script", () => {
    expect(hasArabic("التشخيص")).toBe(true);
  });
});
