// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Round 2 (phase 2): the language-aware PDF font loader picks the right embedded
// font per UI language (Latin/Cyrillic for European, Arabic, CJK) and returns a
// descriptor with the jsPDF family, a registrar, and a text transform. Fonts are
// dynamically imported, so this also exercises that the chunks resolve.
import { describe, it, expect } from "vitest";
import { loadPdfFont } from "../fonts/loader";

function fakeDoc() {
  const fonts: string[] = [];
  return {
    fonts,
    addFileToVFS: () => {},
    addFont: (_f: string, family: string) => { fonts.push(family); },
  };
}

describe("Round 2: PDF font loader", () => {
  it("selects the Arabic font + shaping transform for ar", async () => {
    const f = await loadPdfFont("ar");
    expect(f.family).toBe("NotoArabic");
    // The transform shapes Arabic (changes the string), unlike the identity ones.
    expect(f.transform("بيت")).not.toBe("بيت");
    const doc = fakeDoc();
    expect(f.register(doc)).toBe(true);
    expect(doc.fonts).toContain("NotoArabic");
  });

  it("selects the CJK font + identity transform for zh", async () => {
    const f = await loadPdfFont("zh");
    expect(f.family).toBe("NotoSC");
    expect(f.transform("牙齿")).toBe("牙齿");
    const doc = fakeDoc();
    expect(f.register(doc)).toBe(true);
    expect(doc.fonts).toContain("NotoSC");
  });

  it("selects the Japanese font + identity transform for ja", async () => {
    const f = await loadPdfFont("ja");
    expect(f.family).toBe("NotoJP");
    // Kana and kanji both pass through untouched: Japanese is LTR and needs
    // glyphs, not shaping.
    expect(f.transform("歯科のレポート")).toBe("歯科のレポート");
    const doc = fakeDoc();
    expect(f.register(doc)).toBe(true);
    expect(doc.fonts).toContain("NotoJP");
  });

  it("selects the Korean font + identity transform for ko", async () => {
    const f = await loadPdfFont("ko");
    expect(f.family).toBe("NotoKR");
    expect(f.transform("치과 보고서")).toBe("치과 보고서");
    const doc = fakeDoc();
    expect(f.register(doc)).toBe(true);
    expect(doc.fonts).toContain("NotoKR");
  });

  it("gives each script its OWN font, never another script's", async () => {
    // A copy-paste in the loader's if-chain would quietly send Japanese to the
    // Chinese font, which has no kana at all — and the chain's own tests would
    // still pass, because each only checks its own branch.
    const families = await Promise.all(
      ["ar", "zh", "ja", "ko", "hu"].map(async (l) => (await loadPdfFont(l)).family),
    );
    expect(families).toEqual(["NotoArabic", "NotoSC", "NotoJP", "NotoKR", "Roboto"]);
    expect(new Set(families).size).toBe(families.length);
  });

  it("falls back to Roboto (Latin/Cyrillic) + identity for European locales", async () => {
    for (const lang of ["hu", "en", "ru", "pt-br"]) {
      const f = await loadPdfFont(lang);
      expect(f.family).toBe("Roboto");
      expect(f.transform("őrült")).toBe("őrült");
    }
  });
});
