// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Tooth-anatomy data — the inlined tooth-template SVG text, the classic
 * template/rotation maps, the per-template CEJ anchors and the `classic` /
 * `measured` profile registry, extracted from odontogram.ts (which keeps the
 * public `setToothAnatomy()`, which needs the DOM side). A PURE module: no module
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

// The measured artwork (~1.1 MB) is code-split into ./measured and loaded on
// demand, so an app that stays on the classic anatomy never downloads it.
// `ensureMeasuredProfile()` must resolve BEFORE the flag flips to "measured";
// `setToothAnatomy()` in odontogram.ts is what guarantees that ordering.
let measuredProfile: AnatomyProfile | null = null;
let measuredLoad: Promise<AnatomyProfile> | null = null;

/** Load the measured profile — once; concurrent calls share the same promise.
 *  A FAILED load (offline, a chunk missing from the deploy) releases the cached
 *  promise so the next selection retries: caching the rejection would make the
 *  measured profile permanently unusable until a page reload. */
export function ensureMeasuredProfile(): Promise<AnatomyProfile> {
  if(measuredProfile) return Promise.resolve(measuredProfile);
  measuredLoad ??= import("./measured")
    .then((m) => (measuredProfile = m.MEASURED_PROFILE))
    .catch((err) => { measuredLoad = null; throw err; });
  return measuredLoad;
}

/** Whether the measured artwork has been loaded (test/diagnostic seam). */
export function isMeasuredProfileLoaded(): boolean { return measuredProfile !== null; }

/** Every FDI tooth number in chart order (upper right -> upper left, lower
 *  right -> lower left). Pure topology, shared by the engine and the perio API. */
export const ALL_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38
];

// Session-only selected anatomy (mirrors `perioViewMode`): a module `let` +
// getter/setter that notifies on change. NOT part of the export payload — never
// referenced by `collectExportPayload`/`getPlanChart`/hydrate.
let toothAnatomy: ToothAnatomy = "classic";

/** Current tooth-anatomy profile selector. Defaults to `"classic"`. */
export function getToothAnatomy(): ToothAnatomy {
  return toothAnatomy;
}


/** Set the selected anatomy, reporting whether it actually changed. The public
 *  `setToothAnatomy()` in odontogram.ts calls this and then does what cannot
 *  live here: invalidating the perio-chart template cache and notifying. Keeping
 *  the flag WITH the profiles is what lets `perioGraphic.ts` read the active
 *  profile without importing the engine back — it breaks a real import cycle. */
export function applyToothAnatomy(v: ToothAnatomy): boolean {
  if(v === toothAnatomy) return false;
  toothAnatomy = v;
  return true;
}

/** The active `AnatomyProfile` per the current flag; falls back to classic for
 *  any profile not (yet) realized in the registry. */
export function activeAnatomyProfile(): AnatomyProfile {
  // Falls back to classic when "measured" is selected but its chunk has not
  // resolved yet — a state setToothAnatomy() prevents, and a safe default.
  return toothAnatomy === "measured" ? (measuredProfile ?? CLASSIC_PROFILE) : CLASSIC_PROFILE;
}

// Arch helper (upper vs. lower jaw) — quadrants 1/2 (permanent upper) and 5/6
// (milk upper) are "upper"; 3/4 (permanent lower) and 7/8 (milk lower) are
// "lower". Drives the full-mode lingual->palatal swap.
export function isUpperTooth(toothNo: number): boolean {
  const q = Math.floor(toothNo / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
}
