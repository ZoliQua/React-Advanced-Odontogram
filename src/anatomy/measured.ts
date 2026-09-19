// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The MEASURED ("candidate anatomy") tooth-template set — 13 inlined SVGs and
 * the maps that arrange them into the two-arch profile.
 *
 * It lives in its OWN module, loaded on demand by `ensureMeasuredProfile()` in
 * `./profiles`, because the artwork is ~1.1 MB and the profile is opt-in: an app
 * that never leaves the classic anatomy should not pay for it. Nothing may
 * import this module STATICALLY — that would defeat the code split and pull the
 * SVGs back into the main chunk.
 *
 * The type import below is erased at compile time, so it creates no runtime
 * dependency back on `./profiles`.
 */

import type { AnatomyProfile } from "./profiles";

// Measured ("candidate anatomy") tooth-template set — coexists with the classic
// set above (never overwrites it), inlined the same `?raw` way so both ship in
// the bundle. Consumed only by the `measured` AnatomyProfile below; the classic
// profile keeps reading the classic imports, so classic output is byte-identical.
import measuredTooth11Svg from "../assets/teeth-svgs/measured/11.svg?raw";
import measuredTooth12Svg from "../assets/teeth-svgs/measured/12.svg?raw";
import measuredTooth13Svg from "../assets/teeth-svgs/measured/13.svg?raw";
import measuredTooth14Svg from "../assets/teeth-svgs/measured/14.svg?raw";
import measuredTooth15Svg from "../assets/teeth-svgs/measured/15.svg?raw";
import measuredTooth16Svg from "../assets/teeth-svgs/measured/16.svg?raw";
import measuredTooth17Svg from "../assets/teeth-svgs/measured/17.svg?raw";
import measuredTooth31Svg from "../assets/teeth-svgs/measured/31.svg?raw";
import measuredTooth46Svg from "../assets/teeth-svgs/measured/46.svg?raw";
import measuredTooth14OcclSvg from "../assets/teeth-svgs/measured/14_occl.svg?raw";
import measuredTooth34OcclSvg from "../assets/teeth-svgs/measured/34_occl.svg?raw";
import measuredTooth16OcclSvg from "../assets/teeth-svgs/measured/16_occl.svg?raw";
import measuredTooth46OcclSvg from "../assets/teeth-svgs/measured/46_occl.svg?raw";

// The "candidate anatomy" — nine measured front templates + four measured
// occlusal templates, arranged as a two-arch, per-tooth-width grid. The SVGs
// carry the SAME semantic layer ids as the classic set (only their gradient
// `defs` are `toothgen-N-` namespaced), so `applyStateToSvg` works unchanged.
// Measured 17/46 legitimately lack a handful of milktooth / pulp-inflammation
// ids — those layers simply no-op on those two molar positions.

/** Measured front (side-view) template SVG text, keyed by template tooth. */
const MEASURED_TEMPLATES: Record<number, string> = {
  11: measuredTooth11Svg,
  12: measuredTooth12Svg,
  13: measuredTooth13Svg,
  14: measuredTooth14Svg,
  15: measuredTooth15Svg,
  16: measuredTooth16Svg,
  17: measuredTooth17Svg,
  31: measuredTooth31Svg,
  46: measuredTooth46Svg,
};
/** Measured occlusal template SVG text. A lower molar/premolar occlusal is NOT
 *  an upper one rotated, so 34/46 are their own drawings (not 14/16 flipped). */
const MEASURED_TEMPLATES_OCCL: Record<number, string> = {
  14: measuredTooth14OcclSvg,
  34: measuredTooth34OcclSvg,
  16: measuredTooth16OcclSvg,
  46: measuredTooth46OcclSvg,
};

/** Measured front-view per-tooth template/orientation map (nine templates). */
const MEASURED_TOOTH_TEMPLATE = new Map<number, { tpl: number; rot: number; mirror: boolean }>([
  // upper central incisor
  [11,{tpl:11,rot:0,mirror:false}],
  [21,{tpl:11,rot:0,mirror:true}],
  // upper lateral incisor
  [12,{tpl:12,rot:0,mirror:false}],
  [22,{tpl:12,rot:0,mirror:true}],
  // lower incisors
  [31,{tpl:31,rot:180,mirror:false}],[32,{tpl:31,rot:180,mirror:false}],
  [41,{tpl:31,rot:180,mirror:true}],[42,{tpl:31,rot:180,mirror:true}],
  // canines
  [13,{tpl:13,rot:0,mirror:false}],
  [23,{tpl:13,rot:0,mirror:true}],
  [33,{tpl:13,rot:180,mirror:false}],
  [43,{tpl:13,rot:180,mirror:true}],
  // upper 1st premolar - two roots
  [14,{tpl:14,rot:0,mirror:false}],
  [24,{tpl:14,rot:0,mirror:true}],
  // single-rooted premolars
  [15,{tpl:15,rot:0,mirror:false}],
  [25,{tpl:15,rot:0,mirror:true}],
  [34,{tpl:15,rot:180,mirror:false}],[35,{tpl:15,rot:180,mirror:false}],
  [44,{tpl:15,rot:180,mirror:true}],[45,{tpl:15,rot:180,mirror:true}],
  // upper molars - three roots
  [16,{tpl:16,rot:0,mirror:false}],
  [26,{tpl:16,rot:0,mirror:true}],
  [17,{tpl:17,rot:0,mirror:false}],[18,{tpl:17,rot:0,mirror:false}],
  [27,{tpl:17,rot:0,mirror:true}],[28,{tpl:17,rot:0,mirror:true}],
  // lower molars - two roots
  [36,{tpl:46,rot:180,mirror:false}],[37,{tpl:46,rot:180,mirror:false}],[38,{tpl:46,rot:180,mirror:false}],
  [46,{tpl:46,rot:180,mirror:true}],[47,{tpl:46,rot:180,mirror:true}],[48,{tpl:46,rot:180,mirror:true}],
]);

/** Measured occlusal-view per-tooth template/orientation map — its own mapping,
 *  distinct from the front map (a lower posterior is a separate drawing). */
const MEASURED_OCCLUSAL_TEMPLATE = new Map<number, { tpl: number; rot: number; mirror: boolean }>([
  [14,{tpl:14,rot:0,mirror:false}],[15,{tpl:14,rot:0,mirror:false}],
  [16,{tpl:16,rot:0,mirror:false}],[17,{tpl:16,rot:0,mirror:false}],[18,{tpl:16,rot:0,mirror:false}],
  [24,{tpl:14,rot:0,mirror:true}],[25,{tpl:14,rot:0,mirror:true}],
  [26,{tpl:16,rot:0,mirror:true}],[27,{tpl:16,rot:0,mirror:true}],[28,{tpl:16,rot:0,mirror:true}],
  [34,{tpl:34,rot:180,mirror:false}],[35,{tpl:34,rot:180,mirror:false}],
  [36,{tpl:46,rot:180,mirror:false}],[37,{tpl:46,rot:180,mirror:false}],[38,{tpl:46,rot:180,mirror:false}],
  [44,{tpl:34,rot:180,mirror:true}],[45,{tpl:34,rot:180,mirror:true}],
  [46,{tpl:46,rot:180,mirror:true}],[47,{tpl:46,rot:180,mirror:true}],[48,{tpl:46,rot:180,mirror:true}],
]);

/** Measured per-template CEJ baseline anchors (perio chart), measured from each
 *  measured template's geometry (values from the candidate-anatomy work). */
const MEASURED_CEJ_Y: Record<number, number> = {
  11: 40.8, 12: 37.8, 13: 38.1, 14: 37.2, 15: 34.6, 16: 37.7, 17: 38.3, 31: 35.6, 46: 32.9,
};
/** Measured per-template implant-platform baseline anchor. */
const MEASURED_IMPLANT_CEJ_Y: Record<number, number> = {
  11: 35.0, 12: 32.5, 13: 35.2, 14: 33.2, 15: 31.0, 16: 32.9, 17: 33.4, 31: 30.7, 46: 28.9,
};
/** Measured per-template milktooth baseline anchor (approximated as CEJ_Y). */
const MEASURED_MILKTOOTH_CEJ_Y: Record<number, number> = { ...MEASURED_CEJ_Y };

/** The MEASURED profile — two-arch layout, split front/occlusal artwork. */
export const MEASURED_PROFILE: AnatomyProfile = {
  templates: MEASURED_TEMPLATES,
  templatesOccl: MEASURED_TEMPLATES_OCCL,
  toothTemplate: MEASURED_TOOTH_TEMPLATE,
  occlusalTemplate: MEASURED_OCCLUSAL_TEMPLATE,
  tplNos: [11, 12, 13, 14, 15, 16, 17, 31, 46],
  occlNos: [14, 16, 34, 46],
  layout: "twoArch",
  cejY: MEASURED_CEJ_Y,
  implantCejY: MEASURED_IMPLANT_CEJ_Y,
  milktoothCejY: MEASURED_MILKTOOTH_CEJ_Y,
};
