// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Does the PDF actually render each language, or does it render boxes?
//
// The PDF report embeds one subset font per script (src/fonts/noto*.ts). A
// subset is generated from the locale's strings, so it stays correct only as
// long as someone regenerates it when the strings change — and nobody had.
// Two real defects were shipped this way:
//
//   1. The Chinese subset predated the case-diagnoses strings, so 84 Han
//      characters the zh UI displays had NO glyph: 唾 (saliva), 腺 (gland),
//      瘘 (fistula), 颞 (temporal) and the rest came out as missing glyphs in
//      every Chinese PDF.
//   2. The Chinese subset was cut from a VARIABLE font without instancing it,
//      so fvar/gvar survived into the embedded TTF, and its fvar default was
//      wght=100. jsPDF has no variable-font support — it renders the default
//      instance — so Chinese PDF text came out hairline Thin. (The Arabic
//      subset also shipped its variation tables, but ITS fvar default was
//      already 400, so Arabic was never hairline; dropping the tables there
//      only made the file 20% smaller.)
//
// Both are invisible to a type check and to every other test in this suite,
// and both are mechanically checkable from the embedded bytes. So: parse the
// base64 the module actually ships, walk its cmap, and compare against the
// locale it serves.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import zh from "../i18n/locales/zh";
import ja from "../i18n/locales/ja";
import ko from "../i18n/locales/ko";
import ar from "../i18n/locales/ar";

const FONT_DIR = path.join(__dirname, "..", "fonts");

/**
 * EVERY base64 face a font module ships, decoded, by constant name.
 *
 * Plural on purpose. A module can embed more than one weight — `notoArabic.ts`
 * ships a Regular and a Bold — and a first-match lookup checked only the
 * Regular. `AR_BOLD_B64` was a variable face whose fvar default was 400, so
 * Arabic "bold" rendered at regular weight and nothing noticed.
 */
function embeddedFaces(module: string): Map<string, DataView> {
  const src = fs.readFileSync(path.join(FONT_DIR, module), "utf8");
  const faces = new Map<string, DataView>();
  for (const match of src.matchAll(/([A-Z0-9_]*B64)\s*=\s*"([^"]+)"/g)) {
    const bytes = Buffer.from(match[2], "base64");
    faces.set(match[1], new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  }
  if (faces.size === 0) throw new Error(`${module}: no base64 font constant found`);
  return faces;
}

/** The face a module uses for body text, which is the one the locale must cover. */
function regularFace(module: string): DataView {
  const faces = embeddedFaces(module);
  for (const [name, face] of faces) {
    if (name.includes("REGULAR")) return face;
  }
  return [...faces.values()][0];
}

/** The sfnt table directory: tag -> { offset, length }. */
function tables(v: DataView): Map<string, { offset: number; length: number }> {
  const out = new Map<string, { offset: number; length: number }>();
  const numTables = v.getUint16(4);
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    const tag = String.fromCharCode(
      v.getUint8(rec), v.getUint8(rec + 1), v.getUint8(rec + 2), v.getUint8(rec + 3),
    );
    out.set(tag, { offset: v.getUint32(rec + 8), length: v.getUint32(rec + 12) });
  }
  return out;
}

/**
 * Every codepoint the font maps to a REAL glyph.
 *
 * Glyph ids are computed rather than assumed: a cmap segment is allowed to map
 * a range onto glyph 0 (.notdef), and counting those as covered is exactly the
 * false pass this test exists to avoid. Formats 4 and 12 are the two the Noto
 * subsets emit.
 */
function mappedCodepoints(v: DataView): Set<number> {
  const cmap = tables(v).get("cmap");
  if (!cmap) throw new Error("font has no cmap table");
  const base = cmap.offset;
  const covered = new Set<number>();
  const numSubtables = v.getUint16(base + 2);

  for (let i = 0; i < numSubtables; i += 1) {
    const sub = base + v.getUint32(base + 4 + i * 8 + 4);
    const format = v.getUint16(sub);

    if (format === 4) {
      const segCount = v.getUint16(sub + 6) / 2;
      const endAt = sub + 14;
      const startAt = endAt + segCount * 2 + 2;
      const deltaAt = startAt + segCount * 2;
      const rangeAt = deltaAt + segCount * 2;
      for (let s = 0; s < segCount; s += 1) {
        const end = v.getUint16(endAt + s * 2);
        const start = v.getUint16(startAt + s * 2);
        const delta = v.getInt16(deltaAt + s * 2);
        const rangeOffset = v.getUint16(rangeAt + s * 2);
        if (start === 0xffff) continue;
        for (let c = start; c <= end && c !== 0xffff; c += 1) {
          let glyph: number;
          if (rangeOffset === 0) {
            glyph = (c + delta) & 0xffff;
          } else {
            const at = rangeAt + s * 2 + rangeOffset + (c - start) * 2;
            if (at + 1 >= v.byteLength) continue;
            glyph = v.getUint16(at);
            if (glyph !== 0) glyph = (glyph + delta) & 0xffff;
          }
          if (glyph !== 0) covered.add(c);
        }
      }
    } else if (format === 12) {
      const nGroups = v.getUint32(sub + 12);
      for (let g = 0; g < nGroups; g += 1) {
        const at = sub + 16 + g * 12;
        const start = v.getUint32(at);
        const end = v.getUint32(at + 4);
        const startGlyph = v.getUint32(at + 8);
        for (let c = start; c <= end; c += 1) {
          if (startGlyph + (c - start) !== 0) covered.add(c);
        }
      }
    }
  }
  return covered;
}

/**
 * Every codepoint a locale's VALUES need drawn, minus the ones no text font can
 * supply. Keys are ASCII identifiers, so only values matter.
 *
 * The excluded set is the regional-indicator flag emoji in the `language.*`
 * labels ("🇭🇺 Magyar"). No text font contains them — they need a colour emoji
 * font — and the PDF never prints a language picker, so demanding them would
 * make this test unsatisfiable for a reason that has nothing to do with the
 * report.
 */
function neededCodepoints(table: Record<string, string>): Set<number> {
  const out = new Set<number>();
  for (const value of Object.values(table)) {
    for (const ch of value) {
      const cp = ch.codePointAt(0)!;
      if (cp >= 0x1f000) continue; // emoji planes — see above
      out.add(cp);
    }
  }
  return out;
}

/**
 * Characters a font is KNOWN not to carry, with the reason. Deliberately
 * enumerated rather than tolerated by a count, so a new gap still fails.
 *
 * The Arabic subset is the one embedded font `tools/fonts/build_fonts.py` does
 * not cut from a pristine Noto source — it only re-instances the bytes already
 * shipped, because the Arabic shaping in `src/fonts/arabicShaper.ts` depends on
 * exactly the presentation forms that subset carries. Its two gaps are the
 * maths comparison signs, which appear only in on-screen strings (the overlay
 * switcher's "≥5mm" and two settings descriptions) and in no PDF label. Giving
 * Arabic the three generated fonts' full symbol coverage means fetching and
 * re-subsetting Noto Naskh Arabic, and re-verifying shaping against it.
 */
const KNOWN_GAPS: Partial<Record<string, number[]>> = {
  ar: [0x2264, 0x2265], // ≤ ≥
};

const CASES = [
  { lang: "zh", module: "notoSC.ts", table: zh },
  { lang: "ja", module: "notoJP.ts", table: ja },
  { lang: "ko", module: "notoKR.ts", table: ko },
  { lang: "ar", module: "notoArabic.ts", table: ar },
] as const;

describe("embedded PDF fonts cover the locale they serve", () => {
  for (const { lang, module, table } of CASES) {
    it(`${lang}: every character in ${lang}.ts has a glyph in ${module}`, () => {
      const covered = mappedCodepoints(regularFace(module));
      const needed = neededCodepoints(table);
      const allowed = new Set(KNOWN_GAPS[lang] ?? []);
      const missing = [...needed].filter((c) => !covered.has(c) && !allowed.has(c));
      // Name the characters, not just the count: a regenerated font that drops
      // one glyph should say WHICH, so the fix is obvious.
      const shown = missing.slice(0, 40).map((c) => `${String.fromCodePoint(c)} (U+${c.toString(16).toUpperCase()})`);
      expect(shown, `${missing.length} character(s) would render as a missing glyph`).toEqual([]);
    });
  }
});

describe("embedded PDF fonts are static, not variable", () => {
  for (const { lang, module } of CASES) {
    it(`${lang}: every face in ${module} is static, and weighted as its name says`, () => {
      // jsPDF renders a variable font's DEFAULT instance, whatever that is.
      // Noto Sans SC's default is wght=100, which is how Chinese PDFs came out
      // hairline. Rather than check each font's default — a font whose default
      // happens to be 400 today is one edit from not being — require every
      // embedded face to be static, so the question cannot arise.
      // tools/fonts/build_fonts.py instances to wght=400; this is the guard
      // that it stays done — for every embedded weight, not just the first.
      for (const [name, face] of embeddedFaces(module)) {
        const present = [...tables(face).keys()];
        expect(present, `${module}:${name} is a variable face`).not.toContain("fvar");
        expect(present, `${module}:${name} is a variable face`).not.toContain("gvar");

        // A face named BOLD that reports weight 400 is a face that renders
        // regular. That is how Arabic bold shipped: a variable Bold subset
        // whose fvar default was 400.
        const os2 = tables(face).get("OS/2");
        if (os2) {
          const weight = face.getUint16(os2.offset + 4);
          if (name.includes("BOLD")) {
            expect(weight, `${module}:${name} is named bold but weighs ${weight}`).toBeGreaterThanOrEqual(600);
          } else {
            expect(weight, `${module}:${name} should be a regular weight`).toBeLessThan(600);
          }
        }
      }
    });
  }
});

describe("the known-gap allowances are still needed", () => {
  // An allowance nobody removes is how a list like this turns into a blanket
  // exemption. If a font gains a character it was excused from, say so.
  for (const { lang, module, table } of CASES) {
    const allowed = KNOWN_GAPS[lang] ?? [];
    if (allowed.length === 0) continue;
    it(`${lang}: every allowance in KNOWN_GAPS is genuinely absent and genuinely used`, () => {
      const covered = mappedCodepoints(regularFace(module));
      const needed = neededCodepoints(table);
      for (const cp of allowed) {
        const ch = `${String.fromCodePoint(cp)} (U+${cp.toString(16).toUpperCase()})`;
        expect(covered.has(cp), `${module} now covers ${ch} — drop it from KNOWN_GAPS`).toBe(false);
        expect(needed.has(cp), `${lang}.ts no longer uses ${ch} — drop it from KNOWN_GAPS`).toBe(true);
      }
    });
  }
});

describe("embedded PDF fonts are well-formed", () => {
  for (const { lang, module } of CASES) {
    it(`${lang}: ${module} decodes to an sfnt with glyf, cmap, head and hmtx`, () => {
      const present = tables(regularFace(module));
      for (const required of ["glyf", "cmap", "head", "hmtx", "loca", "maxp"]) {
        expect([...present.keys()], `${module} is missing ${required}`).toContain(required);
      }
    });
  }
});
