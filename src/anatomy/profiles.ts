// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Tooth-anatomy data — the inlined tooth-template SVG text, the classic
 * template/rotation maps, the per-template CEJ anchors and the `classic` /
 * `measured` profile registry, extracted from odontogram.ts (which keeps the
 * session flag `toothAnatomy` and its accessors). A PURE module: no module
 * state, no DOM, and no dependency back on odontogram.ts.
 *
 * odontogram.ts re-exports every name that was public before the extraction
 * (`TEMPLATES`, `TOOTH_TEMPLATE`, `CLASSIC_*_CEJ_Y`, `ToothAnatomy`,
 * `AnatomyProfile`), so the public API surface is unchanged — `perioGraphic.ts`
 * and every other consumer keep importing them from odontogram.ts.
 */

// Tooth-template SVGs are imported with Vite's `?raw` suffix so their markup is
// INLINED into the JS bundle as string literals at build time — no runtime
// `fetch()` of an emitted asset URL. This is what makes the built library
// self-contained and portable to any consumer bundler (a fetched hashed asset
// URL would 404 in a downstream app). `TEMPLATES` therefore holds SVG *text*,
// not URLs.
import tooth11Svg from "../assets/teeth-svgs/11.svg?raw";
import tooth13Svg from "../assets/teeth-svgs/13.svg?raw";
import tooth14Svg from "../assets/teeth-svgs/14.svg?raw";
import tooth16Svg from "../assets/teeth-svgs/16.svg?raw";
import tooth14OcclSvg from "../assets/teeth-svgs/14_occl.svg?raw";
import tooth16OcclSvg from "../assets/teeth-svgs/16_occl.svg?raw";
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
/* Tooth SVG Test UI (v2) - vanilla JS */

// Exported (read-only use) so `perioGraphic.ts` can parse + clone the same
// tooth-base artwork for the perio "Dental Chart" tooth-row graphic without
// re-importing or duplicating this SVG text. Purely additive — no existing
// call site or behavior changes. Values are inlined SVG markup (see above).
export const TEMPLATES = {
  11: tooth11Svg,
  13: tooth13Svg,
  14: tooth14Svg,
  16: tooth16Svg,
};
export const TEMPLATES_OCCL = {
  14: tooth14OcclSvg,
  16: tooth16OcclSvg,
};

// Tooth mapping in details:
// 11: 11,12 -> no rotate, no mirror; 21,22 -> no rotate, mirror Y
//     31,32 -> rotate 180; 41,42 -> rotate 180 + mirror Y
// 13: 13 -> no rotate; 23 -> mirror Y; 33 -> rotate 180; 43 -> rotate 180 + mirror Y
// 14: 14,15 -> no rotate; 24,25 -> mirror Y; 34,35 -> rotate 180; 44,45 -> rotate 180 + mirror Y
// 16: 16,17,18 -> no rotate; 26,27,28 -> mirror Y; 36,37,38 -> rotate 180; 46,47,48 -> rotate 180 + mirror Y
export const TOOTH_TEMPLATE = new Map([
  // 11 template
  [11, {tpl:11, rot:0, mirror:false}], [12,{tpl:11,rot:0,mirror:false}],
  [21,{tpl:11,rot:0,mirror:true}], [22,{tpl:11,rot:0,mirror:true}],
  [31, {tpl:11, rot:180, mirror:false}], [32,{tpl:11,rot:180,mirror:false}],
  [41,{tpl:11,rot:180,mirror:true}], [42,{tpl:11,rot:180,mirror:true}],
  // 13 template
  [13,{tpl:13,rot:0,mirror:false}],
  [23,{tpl:13,rot:0,mirror:true}],
  [33,{tpl:13,rot:180,mirror:false}],
  [43,{tpl:13,rot:180,mirror:true}],
  // 14 template
  [14,{tpl:14,rot:0,mirror:false}],[15,{tpl:14,rot:0,mirror:false}],
  [24,{tpl:14,rot:0,mirror:true}],[25,{tpl:14,rot:0,mirror:true}],
  [34,{tpl:14,rot:180,mirror:false}],[35,{tpl:14,rot:180,mirror:false}],
  [44,{tpl:14,rot:180,mirror:true}],[45,{tpl:14,rot:180,mirror:true}],
  // 16 template
  [16,{tpl:16,rot:0,mirror:false}],[17,{tpl:16,rot:0,mirror:false}],[18,{tpl:16,rot:0,mirror:false}],
  [26,{tpl:16,rot:0,mirror:true}],[27,{tpl:16,rot:0,mirror:true}],[28,{tpl:16,rot:0,mirror:true}],
  [36,{tpl:16,rot:180,mirror:false}],[37,{tpl:16,rot:180,mirror:false}],[38,{tpl:16,rot:180,mirror:false}],
  [46,{tpl:16,rot:180,mirror:true}],[47,{tpl:16,rot:180,mirror:true}],[48,{tpl:16,rot:180,mirror:true}],
]);

// ---- Tooth-anatomy profile (Stage A: classic only) ----
// An `AnatomyProfile` bundles everything anatomy-specific — the tooth-template
// SVG text maps, the per-tooth template/orientation map, the tpl/occl id lists,
// the grid layout kind, and the perio-chart CEJ baseline anchors — so a runtime
// "tooth anatomy" switch can swap the whole set at once. Stage A ships ONLY the
// CLASSIC profile (today's artwork/layout/anchors verbatim), so behavior and all
// goldens are byte-identical; a later stage adds a "measured" profile.

/** Per-template CEJ (crown-root boundary) y-anchor for the CLASSIC anatomy — the
 *  perio-chart row-baseline anchor. Owned here (as part of the profile) and
 *  re-exported by `perioGraphic.ts` for backward compatibility. Values measured
 *  from each template's `gum-base` geometry (see `perioGraphic.ts` for the full
 *  measurement note). */
export const CLASSIC_CEJ_Y: Record<number, number> = { 11: 32.2, 13: 32.4, 14: 32.1, 16: 31.0 };
/** Per-template baseline anchor for an IMPLANT tooth (the `#implant-base`
 *  platform), CLASSIC anatomy. */
export const CLASSIC_IMPLANT_CEJ_Y: Record<number, number> = { 11: 33.0, 13: 35.4, 14: 34.6, 16: 34.3 };
/** Per-template baseline anchor for a MILKTOOTH rendering, CLASSIC anatomy —
 *  approximated as the natural `CLASSIC_CEJ_Y`. */
export const CLASSIC_MILKTOOTH_CEJ_Y: Record<number, number> = { ...CLASSIC_CEJ_Y };

/** Selectable tooth-anatomy profiles. Stage A: only `classic` is realized;
 *  `measured` is accepted but falls back to the classic profile (harmless). */
export type ToothAnatomy = "classic" | "measured";

/** Everything anatomy-specific, bundled so a runtime switch swaps it atomically.
 *  `templates`/`templatesOccl` hold inlined SVG text; `toothTemplate` maps each
 *  FDI tooth to its `{tpl,rot,mirror}`; `occlusalTemplate` is optional (only a
 *  profile that splits front/occlusal artwork populates it — classic reuses
 *  `toothTemplate`); `layout` drives the `buildGrid` branch; the three `*CejY`
 *  records are the perio-chart baseline anchors. */
export type AnatomyProfile = {
  templates: Record<number, string>;
  templatesOccl: Record<number, string>;
  toothTemplate: Map<number, { tpl: number; rot: number; mirror: boolean }>;
  occlusalTemplate?: Map<number, { tpl: number; rot: number; mirror: boolean }>;
  tplNos: number[];
  occlNos: number[];
  layout: "uniform16" | "twoArch";
  cejY: Record<number, number>;
  implantCejY: Record<number, number>;
  milktoothCejY: Record<number, number>;
};

/** The CLASSIC profile — today's exact values. Referencing the existing
 *  `TEMPLATES`/`TEMPLATES_OCCL`/`TOOTH_TEMPLATE` objects (not copies) keeps the
 *  live grid and perio chart reading the identical artwork → byte-identical. */
export const CLASSIC_PROFILE: AnatomyProfile = {
  templates: TEMPLATES,
  templatesOccl: TEMPLATES_OCCL,
  toothTemplate: TOOTH_TEMPLATE,
  tplNos: [11, 13, 14, 16],
  occlNos: [14, 16],
  layout: "uniform16",
  cejY: CLASSIC_CEJ_Y,
  implantCejY: CLASSIC_IMPLANT_CEJ_Y,
  milktoothCejY: CLASSIC_MILKTOOTH_CEJ_Y,
};

// ---- MEASURED anatomy profile (Stage B) ----
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
const MEASURED_PROFILE: AnatomyProfile = {
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

// Registry keyed by `ToothAnatomy`. A missing key falls back to
// `CLASSIC_PROFILE` via `activeAnatomyProfile()`.
export const ANATOMY_PROFILES: Partial<Record<ToothAnatomy, AnatomyProfile>> = {
  classic: CLASSIC_PROFILE,
  measured: MEASURED_PROFILE,
};

/** Every FDI tooth number in chart order (upper right -> upper left, lower
 *  right -> lower left). Pure topology, shared by the engine and the perio API. */
export const ALL_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38
];
