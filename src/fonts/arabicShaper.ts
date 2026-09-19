// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Arabic text shaping for the PDF report. jsPDF applies no
// OpenType layout (GSUB/GPOS), so it draws Arabic base letters in their
// disconnected ISOLATED forms, left-to-right — unreadable. `shapeArabic()`
// pre-processes a string into what jsPDF must be handed directly:
//   1. contextual joining — map each Arabic letter to its isolated/initial/
//      medial/final Presentation-Forms-B glyph based on its neighbours, and
//   2. a SIMPLIFIED bidi reorder — reverse RTL runs (and the run order) so a
//      left-drawn line reads right-to-left, while Latin/digit runs keep order.
//
// This is a pragmatic shaper for the report's mostly-pure-Arabic labels, NOT a
// full Unicode Bidirectional Algorithm: complex mixed-direction lines (Arabic
// interleaved with Latin abbreviations/numbers) may not be perfectly ordered.
// Lam-alef ligatures and tashkeel (combining marks) are not composed.

/** base Arabic codepoint -> its Presentation-Forms-B glyphs.
 *  length 4 = dual-joining [isolated, final, initial, medial];
 *  length 2 = right-joining [isolated, final] (never connects to the NEXT letter);
 *  length 1 = non-joining [isolated]. */
const FORMS: Record<number, number[]> = {
  0x0621: [0xFE80],
  0x0622: [0xFE81, 0xFE82],
  0x0623: [0xFE83, 0xFE84],
  0x0624: [0xFE85, 0xFE86],
  0x0625: [0xFE87, 0xFE88],
  0x0626: [0xFE89, 0xFE8A, 0xFE8B, 0xFE8C],
  0x0627: [0xFE8D, 0xFE8E],
  0x0628: [0xFE8F, 0xFE90, 0xFE91, 0xFE92],
  0x0629: [0xFE93, 0xFE94],
  0x062A: [0xFE95, 0xFE96, 0xFE97, 0xFE98],
  0x062B: [0xFE99, 0xFE9A, 0xFE9B, 0xFE9C],
  0x062C: [0xFE9D, 0xFE9E, 0xFE9F, 0xFEA0],
  0x062D: [0xFEA1, 0xFEA2, 0xFEA3, 0xFEA4],
  0x062E: [0xFEA5, 0xFEA6, 0xFEA7, 0xFEA8],
  0x062F: [0xFEA9, 0xFEAA],
  0x0630: [0xFEAB, 0xFEAC],
  0x0631: [0xFEAD, 0xFEAE],
  0x0632: [0xFEAF, 0xFEB0],
  0x0633: [0xFEB1, 0xFEB2, 0xFEB3, 0xFEB4],
  0x0634: [0xFEB5, 0xFEB6, 0xFEB7, 0xFEB8],
  0x0635: [0xFEB9, 0xFEBA, 0xFEBB, 0xFEBC],
  0x0636: [0xFEBD, 0xFEBE, 0xFEBF, 0xFEC0],
  0x0637: [0xFEC1, 0xFEC2, 0xFEC3, 0xFEC4],
  0x0638: [0xFEC5, 0xFEC6, 0xFEC7, 0xFEC8],
  0x0639: [0xFEC9, 0xFECA, 0xFECB, 0xFECC],
  0x063A: [0xFECD, 0xFECE, 0xFECF, 0xFED0],
  0x0641: [0xFED1, 0xFED2, 0xFED3, 0xFED4],
  0x0642: [0xFED5, 0xFED6, 0xFED7, 0xFED8],
  0x0643: [0xFED9, 0xFEDA, 0xFEDB, 0xFEDC],
  0x0644: [0xFEDD, 0xFEDE, 0xFEDF, 0xFEE0],
  0x0645: [0xFEE1, 0xFEE2, 0xFEE3, 0xFEE4],
  0x0646: [0xFEE5, 0xFEE6, 0xFEE7, 0xFEE8],
  0x0647: [0xFEE9, 0xFEEA, 0xFEEB, 0xFEEC],
  0x0648: [0xFEED, 0xFEEE],
  0x0649: [0xFEEF, 0xFEF0],
  0x064A: [0xFEF1, 0xFEF2, 0xFEF3, 0xFEF4],
};

const isArabicLetter = (cp: number) => cp in FORMS;
/** Any RTL-script codepoint (base Arabic block or a Presentation-Forms glyph). */
const isRtl = (cp: number) =>
  (cp >= 0x0600 && cp <= 0x06FF) || (cp >= 0xFB50 && cp <= 0xFDFF) || (cp >= 0xFE70 && cp <= 0xFEFF);

/** True if the string contains any Arabic-script character worth shaping. */
export function hasArabic(s: string): boolean {
  for (const ch of s) if (isRtl(ch.codePointAt(0)!)) return true;
  return false;
}

/** Step 1: contextual joining — replace each Arabic letter with its correct
 *  positional Presentation-Forms-B glyph. Non-Arabic characters pass through. */
function joinForms(chars: string[]): string[] {
  const cps = chars.map((c) => c.codePointAt(0)!);
  const dual = (cp: number) => (FORMS[cp]?.length ?? 0) === 4; // can join to the NEXT letter
  const canBack = (cp: number) => (FORMS[cp]?.length ?? 0) >= 2; // can take a final/medial form
  return chars.map((ch, i) => {
    const cp = cps[i];
    const f = FORMS[cp];
    if (!f) return ch;
    const prevCp = i > 0 ? cps[i - 1] : 0;
    const nextCp = i < cps.length - 1 ? cps[i + 1] : 0;
    const joinPrev = isArabicLetter(prevCp) && dual(prevCp) && canBack(cp);
    const joinNext = dual(cp) && isArabicLetter(nextCp) && canBack(nextCp);
    let idx = 0; // isolated
    if (joinPrev && joinNext) idx = 3; // medial
    else if (joinPrev) idx = 1; // final
    else if (joinNext) idx = 2; // initial
    const glyph = f[idx] ?? f[0];
    return String.fromCodePoint(glyph);
  });
}

/** Step 2: simplified bidi — reverse the sequence of runs, and reverse the
 *  characters WITHIN each RTL run, while Latin/digit runs keep their order. */
function bidiReorder(shaped: string[]): string {
  type Run = { rtl: boolean; chars: string[] };
  const runs: Run[] = [];
  for (const ch of shaped) {
    const rtl = isRtl(ch.codePointAt(0)!);
    const last = runs[runs.length - 1];
    if (!last || last.rtl !== rtl) runs.push({ rtl, chars: [ch] });
    else last.chars.push(ch);
  }
  return runs
    .reverse()
    .map((r) => (r.rtl ? r.chars.reverse().join("") : r.chars.join("")))
    .join("");
}

/**
 * Shape + reorder an Arabic string for direct rendering by jsPDF's `doc.text`.
 * Returns the input unchanged when it contains no Arabic script, so it is safe
 * to apply to every string (Latin/Cyrillic/CJK/numbers pass through untouched).
 */
export function shapeArabic(input: string): string {
  if (!input || !hasArabic(input)) return input;
  const chars = Array.from(input);
  return bidiReorder(joinForms(chars));
}
