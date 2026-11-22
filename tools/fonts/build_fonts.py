#!/usr/bin/env python3
"""Generate the engine's embedded PDF font modules (src/fonts/noto*.ts).

The PDF report embeds one font per script, base64 in a TypeScript module, so an
export works fully offline and the font is never fetched. Each module is
GENERATED: change this script and re-run it, never hand-edit a src/fonts/noto*.ts
file. (Same discipline as tools/toothgen.)

Pipeline, per language:

  1. INSTANCE the Noto variable font to wght=400.
     jsPDF has no variable-font support — it reads the glyf outlines as they
     stand, which for a Noto variable font is the default instance, wght=100
     (Thin). A subset that skips this step produces hairline PDF text. This was
     a real bug in the Chinese font before this script existed.
  2. SUBSET to the codepoints that language needs, read from the locale file
     itself (src/i18n/locales/<lang>.ts) plus ASCII/Latin-1, CJK/fullwidth
     punctuation and a few typographic symbols the report uses.
  3. EMIT the base64 module.

Coverage per language is a deliberate, measured trade-off:

  ja   every kana + the kanji in the ja UI strings      284 KB
       Japanese has a phonetic fallback: any name can be written in kana, so
       complete kana matters more than complete kanji. All 20,992 CJK
       ideographs measured 5.65 MB — 20x this file for the same fixed labels.
  ko   ALL 11,172 precomposed hangul syllables + jamo   3.2 MB
       Korean has NO fallback. A PDF does no OpenType composition here, so a
       syllable is one glyph: one missing from the subset cannot be drawn at
       all. The UI uses 429 syllables; a patient name uses whichever it likes.
  zh   the Han characters in the zh UI strings          287 KB
       Same documented limit as before: a Han character outside the UI set
       shows a missing glyph.

Usage:

    # one-off: fetch the OFL source fonts (not committed — ~20 MB)
    mkdir -p /tmp/noto && cd /tmp/noto
    curl -LO 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf'
    curl -LO 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'
    curl -LO 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf'

    python3 tools/fonts/build_fonts.py /tmp/noto

Requires fontTools (`pip install fonttools`); `pyftsubset` must be on PATH.
Both fonts are SIL Open Font License 1.1, like the rest of the Noto family
already bundled here.
"""
import base64
import os
import re
import subprocess
import sys
import tempfile

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ENGINE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ASCII + Latin-1 (patient names, numbers, FDI tooth numbers, units) and the
# typographic characters the report's own labels use.
BASE = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2032, 0x2033,
       0x00B0, 0x00D7, 0x2264, 0x2265, 0x2212, 0x25CB]
)
CJK_PUNCT = list(range(0x3000, 0x3040)) + list(range(0xFF01, 0xFF61)) + [0xFFE5]
KANA = list(range(0x3040, 0x3100))
HANGUL = list(range(0xAC00, 0xD7A4))
JAMO = list(range(0x1100, 0x1200)) + list(range(0x3130, 0x3190))

CREDIT = (
    "// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram\n"
    "// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026\n//"
)

GENERATED = "// GENERATED — see tools/fonts/build_fonts.py. Do not hand-edit."

INSTANCED_NOTE = """//
// Instanced to wght=400 before subsetting. jsPDF has no variable-font support:
// it renders the default instance, which in Noto's variable fonts is wght=100
// (Thin), so an un-instanced subset produces hairline text.
//
// Regular only; bold/italic map to the regular face."""


def locale_codepoints(lang):
    """Every codepoint appearing in a locale file's VALUES.

    The keys are ASCII and already covered by BASE, so only values matter.
    """
    path = os.path.join(ENGINE_ROOT, "src", "i18n", "locales", f"{lang}.ts")
    text = open(path, encoding="utf-8").read()
    values = re.findall(r'^\s*"[^"]+":\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$', text, re.M)
    if not values:
        raise SystemExit(f"{path}: no translation values matched — has the file shape changed?")
    cps = set()
    for v in values:
        for ch in v:
            cps.add(ord(ch))
    return sorted(cps)


def instance_regular(src, dst):
    font = TTFont(src)
    if "fvar" in font:
        instantiateVariableFont(font, {"wght": 400}, inplace=True, updateFontNames=True)
        for table in ("fvar", "gvar", "avar", "HVAR", "VVAR", "MVAR", "STAT"):
            if table in font:
                del font[table]
    font.save(dst)
    return dst


def subset(src, codepoints, dst):
    spec = ",".join(f"U+{c:04X}" for c in sorted(set(codepoints)))
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as handle:
        handle.write(spec)
        spec_path = handle.name
    subprocess.run(
        ["pyftsubset", src, f"--unicodes-file={spec_path}", "--output-file=" + dst,
         # The PDF path draws glyphs directly; no shaping tables are consulted.
         "--layout-features=", "--no-hinting", "--desubroutinize",
         "--drop-tables+=DSIG,GSUB,GPOS,BASE,vhea,vmtx",
         "--name-IDs=1,2,3,4,6", "--notdef-outline"],
        check=True, capture_output=True, text=True,
    )
    return dst


def emit(ttf, module, const_name, family, register_fn, header):
    b64 = base64.b64encode(open(ttf, "rb").read()).decode("ascii")
    vfs = f"{family}-Regular.ttf"
    out = os.path.join(ENGINE_ROOT, "src", "fonts", module)
    open(out, "w", encoding="utf-8").write(f'''{header}

import type {{ FontRegistrable }} from "./roboto";

export const {const_name} = "{family}";
const REGULAR_B64 = "{b64}";
const registered = new WeakSet<object>();

export function {register_fn}(doc: FontRegistrable): boolean {{
  if (typeof doc.addFileToVFS !== "function" || typeof doc.addFont !== "function") return false;
  if (registered.has(doc as object)) return true;
  doc.addFileToVFS("{vfs}", REGULAR_B64);
  for (const style of ["normal", "bold", "italic", "bolditalic"]) {{
    doc.addFont("{vfs}", {const_name}, style);
  }}
  registered.add(doc as object);
  return true;
}}
''')
    font = TTFont(ttf)
    covered = set()
    for table in font["cmap"].tables:
        covered |= set(table.cmap.keys())
    print(f"  {module:<14} {os.path.getsize(out) / 1024:8.1f} KB  {len(covered):6d} codepoints  "
          f"{font['name'].getDebugName(1)} / {font['name'].getDebugName(2)}")


def build(source_dir):
    work = tempfile.mkdtemp(prefix="notobuild-")

    jobs = [
        ("NotoSansJP[wght].ttf", "ja", BASE + CJK_PUNCT + KANA, "notoJP.ts",
         "PDF_FONT_JP", "NotoJP", "registerJapaneseFont",
         """// Bundled Japanese font for the PDF report (ja locale). A subset of Noto Sans
// JP (OFL) covering EVERY kana plus the kanji used in the ja UI strings, ASCII
// and Latin-1, and CJK/fullwidth punctuation. Japanese needs no shaping (LTR),
// just the glyphs. Lazy-loaded (dynamic import) so it never enters the main
// bundle or a non-Japanese export.
//
// Kana coverage is COMPLETE on purpose: any Japanese word or name can be
// written phonetically, so a name outside the kanji subset still renders when
// given in kana, as medical records commonly do. A kanji outside the UI-string
// set shows a missing glyph — full arbitrary-kanji coverage measured 5.65 MB
// against this file's 284 KB, a 20x cost for the same fixed report labels."""),

        ("NotoSansKR[wght].ttf", "ko", BASE + CJK_PUNCT + JAMO + HANGUL, "notoKR.ts",
         "PDF_FONT_KR", "NotoKR", "registerKoreanFont",
         """// Bundled Korean font for the PDF report (ko locale). A subset of Noto Sans KR
// (OFL) covering ALL 11,172 modern precomposed hangul syllables, the jamo
// blocks, ASCII and Latin-1, and CJK/fullwidth punctuation. Korean needs no
// shaping (LTR), just the glyphs. Lazy-loaded (dynamic import) so it never
// enters the main bundle or a non-Korean export.
//
// The full syllable block is deliberate, and for a different reason than the
// Japanese and Chinese subsets. A PDF does no OpenType composition here, so a
// hangul syllable is ONE glyph: a syllable missing from the subset cannot be
// drawn at all, and Korean — unlike Japanese — has no phonetic script to fall
// back to. The UI strings use 429 syllables; a patient name uses whichever of
// the 11,172 it likes, and a dental report naming the patient in empty boxes is
// not a report. Hence 3.2 MB, as a lazy chunk loaded only when a Korean PDF is
// actually exported — the trade-off the measured tooth anatomy already makes at
// 3.8 MB."""),

        ("NotoSansSC[wght].ttf", "zh", BASE + CJK_PUNCT, "notoSC.ts",
         "PDF_FONT_CJK", "NotoSC", "registerCjkFont",
         """// Bundled Simplified-Chinese font for the PDF report (zh locale). A subset of
// Noto Sans SC (OFL) covering every Han glyph used in the zh UI strings, ASCII
// and Latin-1, and CJK/fullwidth punctuation. CJK needs no shaping (LTR), just
// the glyphs. Lazy-loaded (dynamic import) so it never enters the main bundle
// or a non-Chinese export.
//
// The subset covers the report's fixed labels and structure. A patient name or
// free-text note containing a Han character outside the UI-string set shows a
// missing glyph — full arbitrary-name coverage would need the multi-MB full
// font."""),
    ]

    for src_name, lang, extra, module, const_name, family, register_fn, note in jobs:
        src = os.path.join(source_dir, src_name)
        if not os.path.exists(src):
            raise SystemExit(f"missing source font: {src}\n(see the usage block at the top of this file)")
        regular = instance_regular(src, os.path.join(work, f"{lang}-regular.ttf"))
        final = subset(regular, locale_codepoints(lang) + extra, os.path.join(work, f"{lang}-subset.ttf"))
        emit(final, module, const_name, family, register_fn,
             f"{CREDIT}\n{note}\n{INSTANCED_NOTE}\n{GENERATED}")

    # The Arabic subset has no pristine source fetched here; fix only its weight.
    reinstance_embedded("notoArabic.ts", "AR_REGULAR_B64")


def reinstance_embedded(module, const_name):
    """Pin an ALREADY-EMBEDDED subset to wght=400, in place.

    `build()` regenerates a module from its pristine Noto source. Not every
    embedded font has one fetched here: `notoArabic.ts` is a subset whose source
    this script does not download, and whose coverage must not change (the
    Arabic shaping in src/fonts/arabicShaper.ts maps to the presentation forms
    that subset carries).

    So for that case, do the one thing that was wrong: instance the bytes the
    module already ships to Regular and drop the variation tables. The cmap is
    untouched, so coverage is bit-for-bit the same set — only the outlines move
    from wght=100 to wght=400.
    """
    path = os.path.join(ENGINE_ROOT, "src", "fonts", module)
    text = open(path, encoding="utf-8").read()
    match = re.search(rf'{const_name}\s*=\s*"([^"]+)"', text)
    if not match:
        raise SystemExit(f"{module}: no {const_name} constant found")

    work = tempfile.mkdtemp(prefix="reinstance-")
    raw = os.path.join(work, "in.ttf")
    open(raw, "wb").write(base64.b64decode(match.group(1)))

    before = TTFont(raw)
    if "fvar" not in before:
        print(f"  {module:<14} already static — unchanged")
        return
    covered_before = set()
    for t in before["cmap"].tables:
        covered_before |= set(t.cmap.keys())

    out = instance_regular(raw, os.path.join(work, "out.ttf"))
    after = TTFont(out)
    covered_after = set()
    for t in after["cmap"].tables:
        covered_after |= set(t.cmap.keys())
    if covered_after != covered_before:
        raise SystemExit(f"{module}: instancing changed coverage "
                         f"({len(covered_before)} -> {len(covered_after)}); refusing to write")

    new_b64 = base64.b64encode(open(out, "rb").read()).decode("ascii")
    open(path, "w", encoding="utf-8").write(
        text[:match.start(1)] + new_b64 + text[match.end(1):]
    )
    print(f"  {module:<14} {os.path.getsize(path)/1024:8.1f} KB  {len(covered_after):6d} codepoints  "
          f"re-instanced to Regular, coverage unchanged")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    build(sys.argv[1])
