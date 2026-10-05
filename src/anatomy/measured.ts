// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The MEASURED ("candidate anatomy") tooth-template set — the generated SVGs and
 * the maps that arrange them into the two-arch profile.
 *
 * It lives in its OWN module, loaded on demand by `ensureMeasuredProfile()` in
 * `./profiles`, because the artwork is ~2.3 MB and the profile is opt-in: an app
 * that never leaves the classic anatomy should not pay for it. Nothing may
 * import this module STATICALLY — that would defeat the code split and pull the
 * SVGs back into the main chunk.
 *
 * The type import below is erased at compile time, so it creates no runtime
 * dependency back on `./profiles`.
 */

import type { AnatomyProfile } from "./profiles";

// Measured ("candidate anatomy") tooth-template set — coexists with the classic
// set (never overwrites it), inlined the same `?raw` way so both ship in the
// bundle. Consumed only by the `measured` AnatomyProfile below; the classic
// profile keeps reading the classic imports, so classic output is byte-identical.
//
// The set is produced by `tools/toothgen` (`python3 tools/toothgen/build.py`)
// from six hand-drawn sources, and it is REGENERABLE: the committed files here
// are byte-for-byte what the generator emits. Never hand-edit one — change the
// spec in `tools/toothgen/spec.py` and regenerate, or the next run silently
// reverts the edit.
import measuredTooth11Svg from "../assets/teeth-svgs/measured/11.svg?raw";
import measuredTooth12Svg from "../assets/teeth-svgs/measured/12.svg?raw";
import measuredTooth13Svg from "../assets/teeth-svgs/measured/13.svg?raw";
import measuredTooth14Svg from "../assets/teeth-svgs/measured/14.svg?raw";
import measuredTooth15Svg from "../assets/teeth-svgs/measured/15.svg?raw";
import measuredTooth16Svg from "../assets/teeth-svgs/measured/16.svg?raw";
import measuredTooth17Svg from "../assets/teeth-svgs/measured/17.svg?raw";
import measuredTooth18Svg from "../assets/teeth-svgs/measured/18.svg?raw";
import measuredTooth31Svg from "../assets/teeth-svgs/measured/31.svg?raw";
import measuredTooth32Svg from "../assets/teeth-svgs/measured/32.svg?raw";
import measuredTooth33Svg from "../assets/teeth-svgs/measured/33.svg?raw";
import measuredTooth34Svg from "../assets/teeth-svgs/measured/34.svg?raw";
import measuredTooth35Svg from "../assets/teeth-svgs/measured/35.svg?raw";
import measuredTooth36Svg from "../assets/teeth-svgs/measured/36.svg?raw";
import measuredTooth37Svg from "../assets/teeth-svgs/measured/37.svg?raw";
import measuredTooth38Svg from "../assets/teeth-svgs/measured/38.svg?raw";
import measuredTooth14OcclSvg from "../assets/teeth-svgs/measured/14_occl.svg?raw";
import measuredTooth15OcclSvg from "../assets/teeth-svgs/measured/15_occl.svg?raw";
import measuredTooth16OcclSvg from "../assets/teeth-svgs/measured/16_occl.svg?raw";
import measuredTooth17OcclSvg from "../assets/teeth-svgs/measured/17_occl.svg?raw";
import measuredTooth18OcclSvg from "../assets/teeth-svgs/measured/18_occl.svg?raw";
import measuredTooth34OcclSvg from "../assets/teeth-svgs/measured/34_occl.svg?raw";
import measuredTooth35OcclSvg from "../assets/teeth-svgs/measured/35_occl.svg?raw";
import measuredTooth36OcclSvg from "../assets/teeth-svgs/measured/36_occl.svg?raw";
import measuredTooth37OcclSvg from "../assets/teeth-svgs/measured/37_occl.svg?raw";
import measuredTooth38OcclSvg from "../assets/teeth-svgs/measured/38_occl.svg?raw";

/** Measured front (side-view) template SVG text, keyed by template tooth.
 *
 *  One template per clinically distinct position: the generator draws a single
 *  quadrant per arch — maxillary right (11-18) and mandibular left (31-38) —
 *  and every other position is one of these mirrored across the midline. A
 *  molar is therefore no longer drawn with its neighbour's artwork (the earlier
 *  nine-template set reused 17 for 18 and one lower molar for all six), so the
 *  second and third molars now carry their own crown outline and root count. */
const MEASURED_TEMPLATES: Record<number, string> = {
  11: measuredTooth11Svg,
  12: measuredTooth12Svg,
  13: measuredTooth13Svg,
  14: measuredTooth14Svg,
  15: measuredTooth15Svg,
  16: measuredTooth16Svg,
  17: measuredTooth17Svg,
  18: measuredTooth18Svg,
  31: measuredTooth31Svg,
  32: measuredTooth32Svg,
  33: measuredTooth33Svg,
  34: measuredTooth34Svg,
  35: measuredTooth35Svg,
  36: measuredTooth36Svg,
  37: measuredTooth37Svg,
  38: measuredTooth38Svg,
};

/** Measured occlusal template SVG text, for the posterior positions that have
 *  an occlusal tile (premolars and molars). A lower occlusal is NOT an upper
 *  one rotated, so the mandibular templates are their own drawings. */
const MEASURED_TEMPLATES_OCCL: Record<number, string> = {
  14: measuredTooth14OcclSvg,
  15: measuredTooth15OcclSvg,
  16: measuredTooth16OcclSvg,
  17: measuredTooth17OcclSvg,
  18: measuredTooth18OcclSvg,
  34: measuredTooth34OcclSvg,
  35: measuredTooth35OcclSvg,
  36: measuredTooth36OcclSvg,
  37: measuredTooth37OcclSvg,
  38: measuredTooth38OcclSvg,
};

/** The opposite-side quadrant for each quadrant the generator draws. The
 *  measured set mirrors ONLY across the midline — never between arches — so a
 *  mandibular drawing is never reused for a maxillary tooth. */
const MIRROR_QUADRANT: Record<number, number> = { 1: 2, 3: 4, 5: 6, 7: 8 };

/** Quadrants whose teeth render rotated 180° in the grid (the lower arch:
 *  permanent 3/4 and deciduous 7/8). */
const LOWER_QUADRANTS = new Set([3, 4, 7, 8]);

type TileMap = { tpl: number; rot: number; mirror: boolean };

/**
 * Build a per-tooth template map from a set of quadrant templates.
 *
 * Every template key IS a tooth number, and it serves exactly two teeth: itself
 * (unmirrored) and the same position in the mirror quadrant of the SAME arch.
 * Deriving the map instead of listing 32 entries by hand is what makes the
 * "one drawing per position, mirrored only across the midline" invariant
 * structural — a template added to `MEASURED_TEMPLATES` cannot be forgotten
 * here, and a pair cannot be mistyped.
 *
 * Throws on a template whose quadrant the mirror table does not know, rather
 * than silently dropping the position from the grid.
 */
function buildTemplateMap(tplNos: readonly number[]): Map<number, TileMap> {
  const map = new Map<number, TileMap>();
  for (const tpl of tplNos) {
    const quadrant = Math.floor(tpl / 10);
    const partnerQuadrant = MIRROR_QUADRANT[quadrant];
    if (partnerQuadrant === undefined) {
      throw new Error(`measured anatomy: template ${tpl} is not in a drawn quadrant (1/3/5/7)`);
    }
    const rot = LOWER_QUADRANTS.has(quadrant) ? 180 : 0;
    const partner = partnerQuadrant * 10 + (tpl % 10);
    map.set(tpl, { tpl, rot, mirror: false });
    map.set(partner, { tpl, rot, mirror: true });
  }
  return map;
}

/** Measured front-view per-tooth template/orientation map (16 templates,
 *  32 teeth). */
const MEASURED_TOOTH_TEMPLATE = buildTemplateMap(Object.keys(MEASURED_TEMPLATES).map(Number));

/** Measured occlusal-view per-tooth template/orientation map — its own mapping,
 *  distinct from the front map (a lower posterior is a separate drawing), and
 *  covering only the posterior positions that have an occlusal tile. */
const MEASURED_OCCLUSAL_TEMPLATE = buildTemplateMap(Object.keys(MEASURED_TEMPLATES_OCCL).map(Number));

/**
 * Read one registration anchor off a measured template, in perio-chart row
 * coordinates.
 *
 * The generator publishes each template's measured registration points as
 * root-element `data-*` attributes (`data-cej-y`, `data-implant-platform-y`,
 * …), in the SVG's own coordinate system — root-up, crown-down. The perio chart
 * flips that artwork vertically (`y' = h - y`, see `buildPerioTooth` in
 * `perioGraphic.ts`) and reads the anchors in the flipped space, so the profile
 * stores `viewBoxHeight - raw`.
 *
 * Deriving the anchors from the artwork rather than restating them as literals
 * means regenerating the templates cannot leave the perio baseline behind on
 * the previous geometry — the failure mode this replaces was silent and only
 * visible as a slightly misplaced CEJ line.
 *
 * Throws (naming the template and the attribute) when the metadata is missing
 * or unparseable: a measured chart drawn against a guessed baseline is worse
 * than a load error the caller can report.
 */
function rowAnchor(svgText: string, attribute: string, tplNo: number): number {
  const viewBox = /\sviewBox="\s*([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s*"/.exec(svgText);
  if (!viewBox) throw new Error(`measured anatomy: template ${tplNo} has no parseable viewBox`);
  const height = Number(viewBox[4]);
  const raw = new RegExp(`\\s${attribute}="([-\\d.eE+]+)"`).exec(svgText);
  if (!raw) throw new Error(`measured anatomy: template ${tplNo} is missing ${attribute}`);
  const value = Number(raw[1]);
  if (!Number.isFinite(height) || !Number.isFinite(value)) {
    throw new Error(`measured anatomy: template ${tplNo} has a non-numeric ${attribute} or viewBox height`);
  }
  // Trim float noise so the stored anchors read like the measured values they
  // are (39.812 -> 40.488, not 40.48800000000001).
  return Number((height - value).toFixed(3));
}

/** Build one anchor record over every side template. */
function anchorsFrom(attribute: string): Record<number, number> {
  const out: Record<number, number> = {};
  for (const [key, svgText] of Object.entries(MEASURED_TEMPLATES)) {
    const tplNo = Number(key);
    out[tplNo] = rowAnchor(svgText, attribute, tplNo);
  }
  return out;
}

/** Measured per-template CEJ baseline anchors (perio chart), read from each
 *  template's published `data-cej-y` registration point. */
const MEASURED_CEJ_Y: Record<number, number> = anchorsFrom("data-cej-y");
/** Measured per-template implant-platform baseline anchor. */
const MEASURED_IMPLANT_CEJ_Y: Record<number, number> = anchorsFrom("data-implant-platform-y");
/** Measured per-template milktooth baseline anchor. The permanent templates
 *  carry no separate deciduous registration point, so this stays approximated
 *  as the natural CEJ — the deciduous templates the generator also emits
 *  (51-55, 71-75) are not wired into this profile yet. */
const MEASURED_MILKTOOTH_CEJ_Y: Record<number, number> = { ...MEASURED_CEJ_Y };

/** The MEASURED profile — two-arch layout, split front/occlusal artwork. */
export const MEASURED_PROFILE: AnatomyProfile = {
  templates: MEASURED_TEMPLATES,
  templatesOccl: MEASURED_TEMPLATES_OCCL,
  toothTemplate: MEASURED_TOOTH_TEMPLATE,
  occlusalTemplate: MEASURED_OCCLUSAL_TEMPLATE,
  tplNos: Object.keys(MEASURED_TEMPLATES).map(Number),
  occlNos: Object.keys(MEASURED_TEMPLATES_OCCL).map(Number),
  layout: "twoArch",
  cejY: MEASURED_CEJ_Y,
  implantCejY: MEASURED_IMPLANT_CEJ_Y,
  milktoothCejY: MEASURED_MILKTOOTH_CEJ_Y,
};
