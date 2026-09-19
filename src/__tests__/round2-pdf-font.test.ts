// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Round 2: the PDF report embeds a bundled Unicode font (Roboto subset) so
// Hungarian ő/ű and Cyrillic render instead of the WinAnsi-only built-in
// Helvetica garbling them. This verifies the registration helper: it wires the
// VFS + all four styles on a jsPDF-like doc, is idempotent, and degrades to a
// no-op (never throwing) on a doc without the font API — the exact contract the
// pure assembler relies on so its fake test doc still works.
import { describe, it, expect } from "vitest";
import { registerRobotoFont, PDF_FONT_FAMILY } from "../fonts/roboto";

function fakeFontDoc() {
  const vfs: string[] = [];
  const fonts: { file: string; family: string; style: string }[] = [];
  return {
    vfs,
    fonts,
    addFileToVFS: (file: string, data: string) => { vfs.push(file); expect(data.length).toBeGreaterThan(1000); },
    addFont: (file: string, family: string, style: string) => { fonts.push({ file, family, style }); },
  };
}

describe("Round 2: bundled PDF Unicode font", () => {
  it("registers the Roboto family in all four styles", () => {
    const doc = fakeFontDoc();
    expect(registerRobotoFont(doc)).toBe(true);
    expect(doc.vfs).toContain("Roboto-Regular.ttf");
    expect(doc.vfs).toContain("Roboto-Bold.ttf");
    const styles = doc.fonts.filter((f) => f.family === PDF_FONT_FAMILY).map((f) => f.style).sort();
    expect(styles).toEqual(["bold", "bolditalic", "italic", "normal"]);
  });

  it("is idempotent (does not re-register on the same doc)", () => {
    const doc = fakeFontDoc();
    registerRobotoFont(doc);
    const firstCount = doc.fonts.length;
    registerRobotoFont(doc);
    expect(doc.fonts.length).toBe(firstCount);
  });

  it("is a no-op (returns false, never throws) on a doc without the font API", () => {
    const bare = { setFont: () => bare } as unknown as Parameters<typeof registerRobotoFont>[0];
    expect(registerRobotoFont(bare)).toBe(false);
  });
});
