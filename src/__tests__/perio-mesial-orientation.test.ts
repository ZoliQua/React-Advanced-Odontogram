// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The periodontal chart must draw every tooth with its MESIAL side toward the
// midline — the same orientation the odontogram itself uses, since both lay the
// arch out in the same order (18→11 21→28 / 48→41 31→38).
//
// The assertion is anatomical rather than a restatement of the transform code:
// teeth of the patient's right (quadrants 1 and 4, the viewer's left half) keep
// the template's own orientation, and teeth of the patient's left (quadrants 2
// and 3) are drawn mirrored. It used to fail for the whole lower arch — the perio
// view read only `mirror` and ignored the 180° rotation every lower tooth carries,
// so both lower quadrants were reversed. Each tooth looked plausible on its own;
// only the pair read as swapped. A fix reported and made in a downstream fork
// (saegerdirk-star/React-Odontogram-Modul, 2.29.2).
import { describe, it, expect, afterEach } from "vitest";
import { getToothBaseGroupFromCache, loadTemplateCache } from "../perioGraphic";
import { setToothAnatomy } from "../odontogram";

const ALL_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

/** The patient's LEFT side (quadrants 2 and 3) is drawn mirrored. */
const shouldBeMirrored = (toothNo: number) => {
  const q = Math.floor(toothNo / 10);
  return q === 2 || q === 3;
};

const isMirrored = (group: Element) => group.querySelector('[data-perio-mirror="1"]') !== null;

afterEach(async () => { await setToothAnatomy("classic"); });

describe.each(["classic", "measured"] as const)("perio chart (%s anatomy): mesial faces the midline", (anatomy) => {
  it("in all four quadrants", async () => {
    await setToothAnatomy(anatomy);
    const cache = await loadTemplateCache();
    const wrong: string[] = [];
    for (const toothNo of ALL_TEETH) {
      const mirrored = isMirrored(getToothBaseGroupFromCache(cache, toothNo));
      if (mirrored !== shouldBeMirrored(toothNo)) {
        wrong.push(`${toothNo} (${mirrored ? "mirrored" : "unmirrored"})`);
      }
    }
    expect(wrong, "teeth whose mesial side points away from the midline").toEqual([]);
  });
});
