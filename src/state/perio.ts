// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The periodontal public API — the whole perio domain in one place: the 6-site
 * probing record, furcation, O'Leary plaque, the Silness-Löe / Löe-Silness
 * indices, the peri-implant Mombelli indices, keratinized-gingiva width, the
 * CEJ/root-concavity and gingival-thickness/Miller axes, the whole-mouth
 * summary and the 2017-classification read model. Extracted from odontogram.ts,
 * where it was ~900 lines spread over eight banner sections.
 *
 * It reads the active chart through the `toothState` live binding and notifies
 * through `notifyStateChange`, so it never imports odontogram.ts back. Its one
 * genuine tie to the engine is the DS-1 status->plan edit gate, injected via
 * {@link setToothEditGate} (odontogram.ts installs it next to the gate's own
 * definition) — the same hook pattern the notify and plugin-id links use.
 */

import { t } from "../i18n/useI18n";
import { derivePerioClassification, type PerioClassification, type PerioDerivationInput, type ToothDerivationInput } from "../perioClassification";
import { caseMeta, getCaseMeta } from "./caseMeta";
import { toothState } from "./chart";
import { notifyStateChange } from "./notify";
import {
  PERIO_SITES, VALID_CEJ_VISIBILITY, VALID_FURCATION_GRADE, VALID_GINGIVAL_THICKNESS,
  VALID_MILLER_CLASS, VALID_PLAQUE_SURFACE, VALID_ROOT_CONCAVITY,
  clampKg, clampPerio, defaultState, furcationEntrances, isToothPresent,
} from "./payload";
import { ALL_TEETH } from "../anatomy/profiles";

/**
 * The DS-1 status->plan edit gate. Defaults to a pass-through so this module is
 * usable stand-alone; odontogram.ts installs the real gate at module-eval time,
 * which is what makes a perio edit on a plan-edited tooth raise the dual-state
 * confirm exactly like every other tooth edit.
 */
let toothEditGate: (toothNo: number, applyFn: () => boolean | void) => void = (_toothNo, applyFn) => { applyFn(); };

/** Install the engine's DS-1 edit gate. Called once by odontogram.ts. */
export function setToothEditGate(fn: (toothNo: number, applyFn: () => boolean | void) => void): void {
  toothEditGate = fn;
}

// ---- Periodontal data-core public API ----
// All five functions below operate on the ACTIVE-chart `toothState` alias
// (not `charts.status` directly), like every other per-tooth getter/setter in
// this file — so they transparently participate in the Status/Plan dual-state
// model: called while `chartMode === "plan"` they read/write the plan chart, and
// vice versa. Pure data — no SVG/DOM touched, no render triggered.

type PerioSitePatch = { pd?: number | null; gm?: number; bop?: boolean; sup?: boolean };
type PlainPerio = { pd: Record<string, number>; gm: Record<string, number>; bop: string[]; sup: string[] };

/**
 * Set/clear one perio site's reading(s) on the active chart's tooth.
 *
 * - `pd` is the CHARTING key. `null`/`undefined`/any value `< 1` UN-CHARTS
 *   the site — it is removed from `pd`, `gm`, `bop`, AND `sup` in one atomic
 *   step (never leaves an orphaned gm/bop/sup behind). A non-integer `pd`
 *   (e.g. 6.5) is instead REJECTED outright: the whole call is a no-op and
 *   state stays unchanged (no partial write). A valid integer `pd` is
 *   clamped to 1–15.
 * - `gm`/`bop`/`sup` only ever apply to an ALREADY-charted site (this call's
 *   own `pd`, or a previously-charted one) — supplying them for a site with
 *   no charted `pd` is a silent no-op, preserving the "absence = not
 *   charted" invariant. `gm` is clamped to −10…+20; a non-integer `gm` is
 *   rejected (that one field is left unset/unchanged, the rest of the patch
 *   still applies).
 * - An unrecognized `site` (not one of {@link PERIO_SITES}) is a silent no-op.
 *
 * Fires {@link onStateChange} listeners (via `notifyStateChange()`) whenever
 * it actually mutates state; never on a rejected/no-op call.
 */
export function setPerioSite(toothNo: number, site: string, patch: PerioSitePatch): void {
  if(!(PERIO_SITES as readonly string[]).includes(site)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // Route the actual mutation through the status->plan gate. The closure returns
  // whether it changed state so a rejected/no-op edit neither marks the tooth
  // plan-edited nor mirrors it (preserving the "notify only on change" contract).
  // The lazy vivify above stays OUTSIDE the gate (not a user edit).
  toothEditGate(toothNo, () => {
    const perio = s.perio;
    let changed = false;

    if("pd" in patch){
      const pd = patch.pd;
      if(pd === null || pd === undefined || (typeof pd === "number" && pd < 1)){
        if(perio.pd.has(site) || perio.gm.has(site) || perio.bop.has(site) || perio.sup.has(site)){
          perio.pd.delete(site);
          perio.gm.delete(site);
          perio.bop.delete(site);
          perio.sup.delete(site);
          changed = true;
        }
        if(changed) notifyStateChange();
        return changed;
      }
      const clampedPd = clampPerio("pd", pd);
      if(clampedPd === null) return false; // non-integer pd -> reject the WHOLE call
      if(perio.pd.get(site) !== clampedPd){ perio.pd.set(site, clampedPd); changed = true; }
    }

    if(!perio.pd.has(site)){
      if(changed) notifyStateChange();
      return changed; // never orphan gm/bop/sup onto an un-charted site
    }

    if(patch.gm !== undefined){
      const clampedGm = clampPerio("gm", patch.gm);
      if(clampedGm !== null && perio.gm.get(site) !== clampedGm){ perio.gm.set(site, clampedGm); changed = true; }
    }
    if(patch.bop !== undefined){
      if(patch.bop){ if(!perio.bop.has(site)){ perio.bop.add(site); changed = true; } }
      else if(perio.bop.has(site)){ perio.bop.delete(site); changed = true; }
    }
    if(patch.sup !== undefined){
      if(patch.sup){ if(!perio.sup.has(site)){ perio.sup.add(site); changed = true; } }
      else if(perio.sup.has(site)){ perio.sup.delete(site); changed = true; }
    }
    if(changed) notifyStateChange();
    return changed;
  });
}

/** Read a tooth's perio sub-record from the active chart as a PLAIN object
 *  (Maps/Sets converted to a fresh Record/Array each call — safe to mutate,
 *  never aliases live state). A tooth with no charted sites (or never
 *  touched at all) returns the empty-but-defined shape, never `undefined`. */
export function getToothPerio(toothNo: number): PlainPerio {
  const s = toothState.get(toothNo);
  const perio = s?.perio;
  if(!perio || perio.pd.size === 0) return { pd: {}, gm: {}, bop: [], sup: [] };
  return {
    pd: Object.fromEntries(perio.pd),
    gm: Object.fromEntries(perio.gm),
    bop: Array.from(perio.bop),
    sup: Array.from(perio.sup),
  };
}

// ---- Furcation involvement (Glickman I-IV, per entrance) public API ----
// Operates on the ACTIVE-chart `toothState` alias, like the perio-site API
// above — transparently Status/Plan dual-state aware. Pure data — no SVG/DOM
// touched, no render triggered.

/**
 * Set/clear one furcation entrance's Glickman grade on the active chart's
 * tooth.
 *
 * - `entrance` must be one of {@link furcationEntrances}(toothNo) for THIS
 *   tooth (position-gated — e.g. "lingual" is rejected on an upper molar,
 *   which only ever offers mesial/distal/buccal). Any other entrance,
 *   including one valid for a different tooth position, is a silent no-op.
 * - `grade` must be an integer 1-4 (Glickman I-IV) to set/overwrite the
 *   entrance; `null`/`undefined` clears it; anything else (non-integer,
 *   out-of-range) is a silent no-op — state stays unchanged.
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call.
 */
export function setFurcation(toothNo: number, entrance: string, grade: number | null | undefined): void {
  if(!furcationEntrances(toothNo).includes(entrance)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // Gate the mutation (see setPerioSite). Returns whether it changed so a
  // rejected/no-op edit is neither marked plan-edited nor mirrored.
  toothEditGate(toothNo, () => {
    const furcation = s.furcation as Map<string, number>;

    if(grade === null || grade === undefined){
      if(furcation.has(entrance)){ furcation.delete(entrance); notifyStateChange(); return true; }
      return false;
    }
    if(!Number.isInteger(grade) || !VALID_FURCATION_GRADE.has(grade)) return false;
    if(furcation.get(entrance) !== grade){ furcation.set(entrance, grade); notifyStateChange(); return true; }
    return false;
  });
}

/** Read a tooth's furcation sub-record from the active chart as a PLAIN
 *  object (entrance -> grade), safe to mutate, never aliases live state. A
 *  tooth with no graded entrance (or never touched at all) returns `{}`. */
export function getToothFurcation(toothNo: number): Record<string, number> {
  const s = toothState.get(toothNo);
  const furcation = s?.furcation as Map<string, number> | undefined;
  if(!furcation || furcation.size === 0) return {};
  return Object.fromEntries(furcation);
}

// ---- O'Leary plaque-index (per-surface presence) public API ----
// Operates on the ACTIVE-chart `toothState` alias, like the perio-site/furcation
// APIs above — transparently Status/Plan dual-state aware. Pure data — no
// SVG/DOM touched, no render triggered.

/**
 * Set/clear one O'Leary plaque-index surface's presence on the active
 * chart's tooth.
 *
 * - `surface` must be one of {@link VALID_PLAQUE_SURFACE} (mesial/distal/
 *   buccal/lingual — the SAME fixed set for every tooth, no per-tooth-
 *   position gating like furcation's entrances). Any other value is a
 *   silent no-op.
 * - `present` truthy adds the surface to the set (plaque present); falsy
 *   removes it (clean/not recorded).
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call.
 */
export function setPlaque(toothNo: number, surface: string, present: boolean): void {
  if(!VALID_PLAQUE_SURFACE.has(surface)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // Gate the mutation (see setPerioSite). Returns whether it changed so a
  // no-op edit is neither marked plan-edited nor mirrored.
  toothEditGate(toothNo, () => {
    const plaque = s.plaque as Set<string>;
    if(present){
      if(!plaque.has(surface)){ plaque.add(surface); notifyStateChange(); return true; }
    }else{
      if(plaque.has(surface)){ plaque.delete(surface); notifyStateChange(); return true; }
    }
    return false;
  });
}

/** Read a tooth's plaque sub-record from the active chart as a PLAIN array
 *  of present surfaces, safe to mutate, never aliases live state. A tooth
 *  with no plaque surface (or never touched at all) returns `[]`. */
export function getToothPlaque(toothNo: number): string[] {
  const s = toothState.get(toothNo);
  const plaque = s?.plaque as Set<string> | undefined;
  if(!plaque || plaque.size === 0) return [];
  return Array.from(plaque);
}

// ---- Silness-Löe Plaque Index (PI) + Löe-Silness Gingival Index (GI) public API ----
// Both are per-surface GRADED (1-3) axes over the SAME fixed 4-surface set as
// O'Leary `plaque` above, but a separate sub-record — this coexists
// intentionally with `plaque` (different clinical instrument), never merged with
// it. Operates on the ACTIVE-chart `toothState` alias, like the
// perio-site/furcation/plaque APIs above — transparently Status/Plan dual-state
// aware. Pure data — no SVG/DOM touched, no render triggered.

/** Read one graded surface off a Map, defaulting an absent/invalid entry to 0. */
function getSurfaceGrade(map: Map<string, number>, surface: string): 0|1|2|3 {
  const g = map.get(surface);
  return (g === 1 || g === 2 || g === 3) ? g : 0;
}

/**
 * Set/clear one graded surface (PI or GI, selected by `mapKey`) on the
 * active chart's tooth, through the edit gate.
 *
 * - `surface` must be one of {@link VALID_PLAQUE_SURFACE}; any other value
 *   is a silent no-op.
 * - `grade` 0 clears the surface (absence = healthy); 1/2/3 sets it; any
 *   other value (non-integer, out of range) is a silent no-op.
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call — `toothEditGate`'s `applyFn` returns `false` for
 * a no-op so the gate protocol never marks/mirrors a tooth that didn't change.
 */
function setSurfaceGrade(toothNo: number, mapKey: "pi"|"gi"|"mpi"|"mbi", surface: string, grade: number): void {
  if(!VALID_PLAQUE_SURFACE.has(surface)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // mPI/mBI are peri-implant indices — only settable on implant teeth.
  if((mapKey === "mpi" || mapKey === "mbi") && s.toothSelection !== "implant") return;
  toothEditGate(toothNo, () => {
    const map = s[mapKey] as Map<string, number>;
    if(grade === 0){
      if(map.has(surface)){ map.delete(surface); notifyStateChange(); return true; }
      return false;
    }
    if(grade === 1 || grade === 2 || grade === 3){
      if(map.get(surface) !== grade){ map.set(surface, grade); notifyStateChange(); return true; }
    }
    return false;
  });
}

/** Read a tooth's Silness-Löe Plaque Index grade on one surface from the
 *  active chart. Grade 0 (default) means healthy/absent — never distinct
 *  from "never charted". */
export function getPlaqueIndex(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.pi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Silness-Löe Plaque Index grade on one surface on the
 *  active chart. See {@link setSurfaceGrade} for validation/no-op semantics. */
export function setPlaqueIndex(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "pi", surface, grade);
}

/** Read a tooth's Löe-Silness Gingival Index grade on one surface from the
 *  active chart. Grade 0 (default) means healthy/absent — never distinct
 *  from "never charted". */
export function getGingivalIndex(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.gi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Löe-Silness Gingival Index grade on one surface on the
 *  active chart. See {@link setSurfaceGrade} for validation/no-op semantics. */
export function setGingivalIndex(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "gi", surface, grade);
}

// ---- Peri-implant Mombelli indices (mPI/mBI) public API ----
// Reuse the exact same per-surface graded machinery as PI/GI above
// (`setSurfaceGrade`), with one additional guard: mPI/mBI are implant-only —
// the setter is a silent no-op on any tooth that isn't `toothSelection ===
// "implant"` (including a never-touched tooth number, which lazily vivifies
// as a non-implant default and therefore also no-ops). See `setSurfaceGrade`
// for full validation/no-op semantics (invalid surface/grade).

/** Read a tooth's Mombelli modified Plaque Index grade on one surface from
 *  the active chart. Grade 0 (default) means healthy/absent — never distinct
 *  from "never charted". Implant-only in practice (see setter), but the
 *  getter itself is unconditional (mirrors PI/GI/every other graded axis). */
export function getPeriImplantPlaque(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.mpi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Mombelli modified Plaque Index grade on one surface on
 *  the active chart. Silent no-op unless the tooth is an implant
 *  (`toothSelection === "implant"`) — see `setSurfaceGrade` for the guard. */
export function setPeriImplantPlaque(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "mpi", surface, grade);
}

/** Read a tooth's Mombelli modified sulcus Bleeding Index grade on one
 *  surface from the active chart. Grade 0 (default) means healthy/absent —
 *  never distinct from "never charted". */
export function getPeriImplantBleeding(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.mbi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Mombelli modified sulcus Bleeding Index grade on one
 *  surface on the active chart. Silent no-op unless the tooth is an implant
 *  (`toothSelection === "implant"`) — see `setSurfaceGrade` for the guard. */
export function setPeriImplantBleeding(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "mbi", surface, grade);
}

// ---- Keratinized gingiva width (KG) public API ----
// A single per-tooth BUCCAL mm scalar (integer, clamped 0-15) — deliberately
// NOT per-site/per-surface, unlike pi/gi above or the 6-site perio-probing
// record. `null` = not charted, never a stored 0 (mirrors every other
// "absence means not charted" axis in this file). Operates on the ACTIVE-chart
// `toothState` alias, transparently Status/Plan dual-state aware. Interactive
// edits route through the edit gate `toothEditGate`. Pure data — no SVG/DOM
// touched, no render triggered (no svgLayer for this axis).

/** Clamp an arbitrary input to an integer 0-15, or `null` for anything that
 *  isn't a finite number (including `null`/`undefined`) — used by both the
 *  setter (rejecting a non-finite EDIT as a no-op) and hydrate (tolerating a
 *  malformed/out-of-range STORED value by dropping it to null). */

/** Read a tooth's keratinized gingiva width (mm) from the active chart.
 *  `null` means not charted. */
export function getKeratinizedWidth(toothNo: number): number | null {
  const v = toothState.get(toothNo)?.kg;
  return typeof v === "number" ? v : null;
}

/**
 * Set/clear a tooth's keratinized gingiva width (mm) on the active chart.
 *
 * - `mm === null` explicitly clears it (not charted).
 * - Any other value is clamped to an integer 0-15 via {@link clampKg}.
 * - A non-finite number (e.g. `NaN` from a bad keystroke) is a silent no-op
 *   — it must NOT clear an existing value, unlike an explicit `null`.
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call — `toothEditGate`'s `applyFn` returns `false` for
 * a no-op so the gate protocol never marks/mirrors a tooth that didn't change.
 */
export function setKeratinizedWidth(toothNo: number, mm: number | null): void {
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  const next = mm === null ? null : clampKg(mm);
  // non-finite number → no-op (do not clear an existing value on a bad keystroke)
  if(mm !== null && next === null) return;
  toothEditGate(toothNo, () => {
    if(s.kg === next) return false;
    s.kg = next; notifyStateChange(); return true;
  });
}

// ---- cejVisibility + rootConcavity public API ----
// Two per-tooth categorical DATA axes (data + registry + FHIR + payload only).
// Both operate on the ACTIVE-chart `toothState` alias like the
// perio/furcation/plaque APIs above — transparently Status/Plan dual-state
// aware. Interactive per-tooth edits, so they route through the edit gate
// `toothEditGate` like setFurcation/setPlaque. Pure data — no SVG/DOM touched,
// no render triggered (neither axis has an svgLayer).

/**
 * Set a tooth's CEJ-visibility on the active chart. `value` must be one of
 * {@link VALID_CEJ_VISIBILITY} (none | detectable | not-detectable); anything
 * else is a silent no-op (state unchanged). Fires {@link notifyStateChange}
 * only when it actually changes state; never on a rejected/no-op call.
 */
export function setCejVisibility(toothNo: number, value: string): void {
  if(!VALID_CEJ_VISIBILITY.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // Gate the mutation (see setFurcation/setPlaque). Returns whether it changed so
  // a no-op edit is neither marked plan-edited nor mirrored.
  toothEditGate(toothNo, () => {
    if(s.cejVisibility === value) return false;
    s.cejVisibility = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's CEJ-visibility from the active chart. A tooth never touched
 *  (or with the default) returns "none". */
export function getCejVisibility(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.cejVisibility as string) ?? "none";
}

/**
 * Set a tooth's root-concavity on the active chart. `value` must be one of
 * {@link VALID_ROOT_CONCAVITY} (none | mild | deep); anything else is a silent
 * no-op (state unchanged). Fires {@link notifyStateChange} only when it
 * actually changes state; never on a rejected/no-op call.
 */
export function setRootConcavity(toothNo: number, value: string): void {
  if(!VALID_ROOT_CONCAVITY.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  toothEditGate(toothNo, () => {
    if(s.rootConcavity === value) return false;
    s.rootConcavity = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's root-concavity from the active chart. A tooth never touched
 *  (or with the default) returns "none". */
export function getRootConcavity(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.rootConcavity as string) ?? "none";
}

// ---- gingivalThickness + millerClass public API ----
// Two per-tooth categorical DATA axes (data + registry + FHIR + payload only).
// Both operate on the ACTIVE-chart `toothState` alias like the
// cejVisibility/rootConcavity APIs above — transparently Status/Plan dual-state
// aware. Interactive per-tooth edits, so they route through the edit gate
// `toothEditGate`. Pure data — no SVG/DOM touched, no render triggered (neither
// axis has an svgLayer).

/**
 * Set a tooth's gingival-thickness on the active chart. `value` must be one
 * of {@link VALID_GINGIVAL_THICKNESS} (unknown | thin | medium | thick);
 * anything else is a silent no-op (state unchanged). Fires
 * {@link notifyStateChange} only when it actually changes state; never on a
 * rejected/no-op call.
 */
export function setGingivalThickness(toothNo: number, value: string): void {
  if(!VALID_GINGIVAL_THICKNESS.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  toothEditGate(toothNo, () => {
    if(s.gingivalThickness === value) return false;
    s.gingivalThickness = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's gingival-thickness from the active chart. A tooth never
 *  touched (or with the default) returns "unknown". */
export function getGingivalThickness(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.gingivalThickness as string) ?? "unknown";
}

/**
 * Set a tooth's Miller recession class on the active chart. `value` must be
 * one of {@link VALID_MILLER_CLASS} (none | i | ii | iii | iv); anything else
 * is a silent no-op (state unchanged). Fires {@link notifyStateChange} only
 * when it actually changes state; never on a rejected/no-op call.
 */
export function setMillerClass(toothNo: number, value: string): void {
  if(!VALID_MILLER_CLASS.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  toothEditGate(toothNo, () => {
    if(s.millerClass === value) return false;
    s.millerClass = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's Miller recession class from the active chart. A tooth never
 *  touched (or with the default) returns "none". */
export function getMillerClass(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.millerClass as string) ?? "none";
}

/** Derive Clinical Attachment Level (CAL = pd + gm, gm signed and defaulting
 *  to 0) for every CHARTED site of a tooth on the active chart. CAL is never
 *  stored — this is the single source of truth for it. A site absent from
 *  `pd` (not charted) has NO entry in the returned Map (not a 0). */
export function getToothCal(toothNo: number): Map<string, number> {
  const cal = new Map<string, number>();
  const s = toothState.get(toothNo);
  if(!s || !s.perio) return cal;
  for(const [site, pd] of s.perio.pd as Map<string, number>){
    cal.set(site, pd + ((s.perio.gm as Map<string, number>).get(site) ?? 0));
  }
  return cal;
}

/** Cairo RT1 interproximal-CAL "approximately zero" threshold, in mm (see
 *  {@link getToothRecessionType}). Below this the
 *  interproximal papilla is considered clinically intact (no measurable
 *  attachment loss). Small, explicit, and tunable by a maintainer — Cairo
 *  2011 does not itself prescribe a numeric epsilon for "zero". */
const CAIRO_RT1_INTERPROX_THRESHOLD_MM = 1;

/** Cairo (2011) gingival-recession TYPE — RT1/RT2/RT3 — or `"none"`. */
export type RecessionType = "none" | "rt1" | "rt2" | "rt3";

/**
 * The Cairo 2011 recession-TYPE classification, DERIVED purely from the
 * already-charted per-site CAL ({@link getToothCal})
 * plus the buccal gingival margin (`perio.gm.get("B")`) — never stored, no
 * new state/payload/FHIR axis (parity byte-identical). Pure + read-only:
 * this is the single source of truth for a tooth's RT, mirroring how
 * {@link getToothCal} is the single source of truth for CAL.
 *
 * Cairo classifies BUCCAL recession by comparing it to the WORSE (deeper) of
 * the two adjacent interproximal (mesio-/disto-buccal) attachment losses:
 *   - `"none"`: no buccal recession — `gm.B` is <= 0 (the margin is at/
 *     coronal to the CEJ, i.e. a pseudopocket, not recession) OR the buccal
 *     site simply isn't charted (`gm.B` undefined). Absence is treated the
 *     same as "no recession", not "unknown", since RT is a display-only
 *     derivation with no "uncharted" state of its own to represent.
 *   - `"rt1"`: buccal recession present, but the interproximal CAL
 *     (`max(CAL[MB], CAL[DB])`) is below {@link CAIRO_RT1_INTERPROX_THRESHOLD_MM}
 *     — essentially no interproximal attachment/papilla loss. An uncharted
 *     MB/DB site contributes `0` to that max (the most conservative/least
 *     severe reading), so "buccal recession + nothing charted
 *     interproximally" also reads as RT1.
 *   - `"rt2"`: interproximal CAL loss is <= the buccal CAL loss — the
 *     papilla still reaches (or nearly reaches) the contact point.
 *   - `"rt3"`: interproximal CAL loss EXCEEDS the buccal CAL loss — severe
 *     papilla loss, apical to the buccal margin.
 */
export function getToothRecessionType(toothNo: number): RecessionType {
  const s = toothState.get(toothNo);
  if(!s || !s.perio) return "none";
  const gmB = (s.perio.gm as Map<string, number>).get("B");
  if(gmB === undefined || gmB <= 0) return "none";
  const cal = getToothCal(toothNo);
  const buccal = cal.get("B") ?? 0;
  const interprox = Math.max(cal.get("MB") ?? 0, cal.get("DB") ?? 0);
  if(interprox < CAIRO_RT1_INTERPROX_THRESHOLD_MM) return "rt1";
  if(interprox <= buccal) return "rt2";
  return "rt3";
}

/**
 * Whole-mouth periodontal summary over the active chart: total charted
 * sites, how many bled on probing, the derived %BOP, and the single worst
 * (deepest) CAL reading with the tooth it's on, plus the deepest raw pocket
 * depth recorded anywhere. `%BOP = bleedingSites / chartedSites` — a site
 * flagged `bop` without ever being charted can't exist (see setPerioSite()),
 * so this ratio can never exceed 100%. Returns zeros/nulls (never `NaN`)
 * when nothing has been charted anywhere.
 *
 * `maxFurcation`: the single highest Glickman grade
 * (1-4) recorded on ANY furcation entrance anywhere in the mouth, `null`
 * when nothing has been graded. Deliberately its own pass over `ALL_TEETH`
 * (not folded into the pd-site loop above) since a tooth can carry furcation
 * data independently of whether it has any charted perio site.
 *
 * `plaquePercent`: whole-mouth O'Leary Plaque Index —
 * `(total plaque surfaces charted across present teeth) / (present-teeth *
 * 4) * 100`, one decimal (same rounding as `bopPercent` above), `0` when
 * there are no present teeth (NOT `null` — matches `bopPercent`'s
 * zero-not-null convention, unlike `avgPd`/`avgCal`). "Present" here means a
 * REAL tooth in the mouth — `toothSelection` is neither `"none"` (missing)
 * nor `"implant"` — deliberately the SAME predicate `isToothPresent()` uses
 * (O'Leary is a tooth-focused index: a missing tooth has no surfaces to
 * chart, an implant has no natural tooth surface). This is intentionally
 * looser than `perioRowHidden()` (which additionally excludes under-gum/
 * extraction-socket teeth, since THOSE have no probeable periodontal
 * pocket) — an under-gum or extraction-socket "tooth" still occupies a slot
 * in the arch and can carry visible/recorded plaque on the socket/gum
 * surface, so it still counts toward the denominator here. Deliberately its
 * own pass over `ALL_TEETH` (not folded into the pd-site loop above) since a
 * tooth can carry plaque data independently of whether it has any charted
 * perio site, mirroring `maxFurcation` above. A tooth never touched at all
 * (no entry in the active chart map) is skipped entirely, same convention
 * `maxFurcation`'s loop and `getOdontogramSummary()` use.
 *
 * Additional graded-index stats (own pass over `ALL_TEETH`, same "absence =
 * not charted" convention as `maxFurcation`/`plaquePercent` above):
 *   - `piScore`/`giScore`: mean of ALL charted PI/GI surface grades across
 *     the whole mouth (sum of grades / number of CHARTED surfaces, one
 *     decimal) — `null` when nothing is charted anywhere (mirrors
 *     `avgPd`/`avgCal`'s null-when-none, NOT `bopPercent`/`plaquePercent`'s
 *     zero-when-none, since a 0 mean would misleadingly read as "all
 *     surfaces charted healthy").
 *   - `kgDeficientTeeth`: count of teeth with a charted `kg` narrower than
 *     2mm (`kg != null && kg < 2`) — an uncharted tooth (`kg === null`) is
 *     never counted.
 *   - `gtDistribution`/`millerDistribution`: per-value counts across the
 *     whole mouth, excluding the "not charted" skip value (`unknown`/
 *     `none` respectively) — mirrors how `maxFurcation`'s loop only counts
 *     graded entrances.
 *
 * Peri-implant additions (own pass, same convention):
 *   - `mpiScore`/`mbiScore`: mean of ALL charted mPI/mBI surface grades
 *     across implant teeth (sum of grades / number of CHARTED surfaces, one
 *     decimal) — `null` when nothing is charted anywhere, mirrors
 *     `piScore`/`giScore` exactly. mPI/mBI are implant-only axes (the setter
 *     is a no-op on a non-implant tooth), so guarding the accumulator on
 *     `s.toothSelection === "implant"` is belt-and-suspenders — a
 *     non-implant tooth's `mpi`/`mbi` maps can never be non-empty — but
 *     makes the implant-only intent explicit at the read site too.
 */
export function getPerioSummary(): {
  chartedSites: number; bleedingSites: number; bopPercent: number;
  worstCal: number | null; worstCalTooth: number | null; maxPd: number | null;
  avgPd: number | null; avgCal: number | null; maxFurcation: number | null;
  plaquePercent: number;
  piScore: number | null; giScore: number | null; kgDeficientTeeth: number;
  gtDistribution: { thin: number; medium: number; thick: number };
  millerDistribution: { i: number; ii: number; iii: number; iv: number };
  // mPI/mBI whole-mouth mean, implant-only — mirrors piScore/giScore's
  // mean-of-charted-grades definition above.
  mpiScore: number | null; mbiScore: number | null;
} {
  let chartedSites = 0, bleedingSites = 0;
  let worstCal: number | null = null, worstCalTooth: number | null = null, maxPd: number | null = null;
  let sumPd = 0, sumCal = 0;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s || !s.perio) continue;
    const pdMap = s.perio.pd as Map<string, number>;
    const gmMap = s.perio.gm as Map<string, number>;
    const bopSet = s.perio.bop as Set<string>;
    for(const [site, pd] of pdMap){
      chartedSites++;
      if(bopSet.has(site)) bleedingSites++;
      const cal = pd + (gmMap.get(site) ?? 0);
      sumPd += pd;
      sumCal += cal;
      if(worstCal === null || cal > worstCal){ worstCal = cal; worstCalTooth = toothNo; }
      if(maxPd === null || pd > maxPd) maxPd = pd;
    }
  }
  const bopPercent = chartedSites > 0 ? Math.round((bleedingSites / chartedSites) * 1000) / 10 : 0;
  // Averages over all charted sites, one decimal — null (not 0/NaN) when
  // nothing is charted, mirroring worstCal/maxPd's "absence = not charted".
  const avgPd = chartedSites > 0 ? Math.round((sumPd / chartedSites) * 10) / 10 : null;
  const avgCal = chartedSites > 0 ? Math.round((sumCal / chartedSites) * 10) / 10 : null;

  let maxFurcation: number | null = null;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s || !s.furcation) continue;
    for(const grade of (s.furcation as Map<string, number>).values()){
      if(maxFurcation === null || grade > maxFurcation) maxFurcation = grade;
    }
  }

  // O'Leary whole-mouth Plaque Index (see doc comment above for the
  // present-tooth definition/rationale).
  let presentTeeth = 0, plaqueSurfaces = 0;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    if(!isToothPresent(s.toothSelection)) continue;
    presentTeeth++;
    plaqueSurfaces += (s.plaque as Set<string> | undefined)?.size ?? 0;
  }
  const plaquePercent = presentTeeth > 0 ? Math.round((plaqueSurfaces / (presentTeeth * 4)) * 1000) / 10 : 0;

  // PI/GI whole-mouth mean, KG-deficient tooth count, GT/Miller distributions —
  // deliberately their own pass over `ALL_TEETH`
  // (not folded into the pd-site loop above), same reasoning as
  // `maxFurcation`/`plaquePercent`: these axes are charted independently of
  // whether a tooth has any charted perio site.
  let piSum = 0, piCount = 0, giSum = 0, giCount = 0;
  let kgDeficientTeeth = 0;
  const gtDistribution = { thin: 0, medium: 0, thick: 0 };
  const millerDistribution = { i: 0, ii: 0, iii: 0, iv: 0 };
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    if(s.pi) for(const grade of (s.pi as Map<string, number>).values()){ piSum += grade; piCount++; }
    if(s.gi) for(const grade of (s.gi as Map<string, number>).values()){ giSum += grade; giCount++; }
    if(typeof s.kg === "number" && s.kg < 2) kgDeficientTeeth++;
    if(s.gingivalThickness === "thin") gtDistribution.thin++;
    else if(s.gingivalThickness === "medium") gtDistribution.medium++;
    else if(s.gingivalThickness === "thick") gtDistribution.thick++;
    if(s.millerClass === "i") millerDistribution.i++;
    else if(s.millerClass === "ii") millerDistribution.ii++;
    else if(s.millerClass === "iii") millerDistribution.iii++;
    else if(s.millerClass === "iv") millerDistribution.iv++;
  }
  const piScore = piCount > 0 ? Math.round((piSum / piCount) * 10) / 10 : null;
  const giScore = giCount > 0 ? Math.round((giSum / giCount) * 10) / 10 : null;

  // mPI/mBI whole-mouth mean, implant-only — own pass over ALL_TEETH, same
  // reasoning as the PI/GI pass above, just gated to implant teeth.
  let mpiSum = 0, mpiCount = 0, mbiSum = 0, mbiCount = 0;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    if(s.toothSelection !== "implant") continue;
    if(s.mpi) for(const grade of (s.mpi as Map<string, number>).values()){ mpiSum += grade; mpiCount++; }
    if(s.mbi) for(const grade of (s.mbi as Map<string, number>).values()){ mbiSum += grade; mbiCount++; }
  }
  const mpiScore = mpiCount > 0 ? Math.round((mpiSum / mpiCount) * 10) / 10 : null;
  const mbiScore = mbiCount > 0 ? Math.round((mbiSum / mbiCount) * 10) / 10 : null;

  return {
    chartedSites, bleedingSites, bopPercent, worstCal, worstCalTooth, maxPd, avgPd, avgCal, maxFurcation, plaquePercent,
    piScore, giScore, kgDeficientTeeth, gtDistribution, millerDistribution,
    mpiScore, mbiScore,
  };
}

/** True iff ANY periodontal axis has been charted anywhere in the mouth. Used
 *  to auto-skip the perio section of an export and to disable the
 *  perio image-export menu items on a blank chart. Derived entirely from
 *  `getPerioSummary()` — no new traversal. */
export function hasAnyPerioData(): boolean {
  const s = getPerioSummary();
  if(s.chartedSites > 0
    || s.maxFurcation !== null
    || s.plaquePercent > 0
    || s.piScore !== null
    || s.giScore !== null
    || s.kgDeficientTeeth > 0
    || s.gtDistribution.thin > 0 || s.gtDistribution.medium > 0 || s.gtDistribution.thick > 0
    || s.millerDistribution.i > 0 || s.millerDistribution.ii > 0
    || s.millerDistribution.iii > 0 || s.millerDistribution.iv > 0
    || s.mpiScore !== null
    || s.mbiScore !== null) return true;
  // `getPerioSummary()` doesn't surface three independently-chartable perio
  // axes, so scan for them directly (else a chart with ONLY such a finding is
  // wrongly treated as "no perio data" and its export section auto-skipped):
  //   - cejVisibility / rootConcavity: registry enum axes ("none" default),
  //     charted with no dependency on any PD site;
  //   - a NON-deficient KG measurement: the summary only counts kg<2
  //     (`kgDeficientTeeth`), so a healthy charted width (e.g. 5 mm) is invisible
  //     to the checks above but is still charted perio data.
  for(const toothNo of ALL_TEETH){
    if(getKeratinizedWidth(toothNo) !== null) return true;
    if(getCejVisibility(toothNo) !== "none") return true;
    if(getRootConcavity(toothNo) !== "none") return true;
  }
  return false;
}

/** Per-tooth perio for every tooth on the active chart that has at least one
 *  charted site (an uncharted tooth is OMITTED, not present with empty
 *  maps — mirrors the same "absence = not charted" convention the payload's
 *  `perio` key follows). Keyed by tooth number (FDI), stringified (plain
 *  object keys are always strings), each value shaped like
 *  {@link getToothPerio}'s return. */
export function getPerioChart(): Record<string, PlainPerio> {
  const out: Record<string, PlainPerio> = {};
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s || !s.perio || s.perio.pd.size === 0) continue;
    out[String(toothNo)] = {
      pd: Object.fromEntries(s.perio.pd),
      gm: Object.fromEntries(s.perio.gm),
      bop: Array.from(s.perio.bop),
      sup: Array.from(s.perio.sup),
    };
  }
  return out;
}

/**
 * State adapter for the pure 2017 periodontal classification derivation core
 * (`derivePerioClassification` in `perioClassification.ts`). Reduces the active
 * chart's per-tooth CAL/PD + the case metadata into the pure
 * {@link PerioDerivationInput} struct —
 * this is the ONLY place engine state is read for classification purposes;
 * `derivePerioClassification` itself never touches `toothState`/`caseMeta`
 * directly, so it stays callable from an arbitrary serialized snapshot (the
 * later FHIR Condition builder feeds it that way, not live module state).
 *
 * Per tooth: `interdentalCal` = worst (max) CAL over the 4 approximal sites
 * (MB/DB/ML/DL); `buccalOralCal` = worst (max) CAL over the 2 mid sites
 * (B/L); `maxPd` = worst (max) raw PD over any of the 6 sites (from
 * `s.perio.pd` directly, NOT derived CAL); `present` mirrors
 * `isToothPresent()`. A tooth never touched at all (no chart entry) reads
 * as present with all-zero perio fields — the same "never touched -> default
 * state" convention every other per-tooth read in this file uses.
 */
export function buildDerivationInputFromState(): PerioDerivationInput {
  const INTERDENTAL_SITES = ["MB", "DB", "ML", "DL"] as const;
  const BUCCAL_ORAL_SITES = ["B", "L"] as const;

  const teeth: ToothDerivationInput[] = ALL_TEETH.map((toothNo) => {
    const s = toothState.get(toothNo);
    const present = isToothPresent((s ?? defaultState()).toothSelection);

    const cal = getToothCal(toothNo);
    let interdentalCal = 0;
    for (const site of INTERDENTAL_SITES) {
      const v = cal.get(site);
      if (v !== undefined && v > interdentalCal) interdentalCal = v;
    }
    let buccalOralCal = 0;
    for (const site of BUCCAL_ORAL_SITES) {
      const v = cal.get(site);
      if (v !== undefined && v > buccalOralCal) buccalOralCal = v;
    }

    let maxPd = 0;
    if (s && s.perio) {
      for (const pd of (s.perio.pd as Map<string, number>).values()) {
        if (pd > maxPd) maxPd = pd;
      }
    }

    return { toothNo, interdentalCal, buccalOralCal, maxPd, present };
  });

  const summary = getPerioSummary();
  const meta = getCaseMeta();

  return {
    teeth,
    bopPercent: summary.bopPercent,
    maxFurcation: summary.maxFurcation,
    meta: {
      age: meta.age,
      maxRblPercent: meta.maxRblPercent,
      toothLossPerio: meta.toothLossPerio,
      smokingStatus: meta.smokingStatus,
      cigarettesPerDay: meta.cigarettesPerDay,
      diabetesStatus: meta.diabetesStatus,
      hba1c: meta.hba1c,
    },
  };
}

/** Final result of {@link getPerioClassification} — one axis result per axis,
 *  each either the clinician's override (when set) or the pure-derived value,
 *  plus the raw derivation and an `overridden` flag per axis so callers (FHIR
 *  evidence, UI) can tell which. */
export interface PerioClassificationResult {
  diagnosis: string;
  stage: string;
  grade: string;
  extent: string;
  derived: PerioClassification;
  overridden: { diagnosis: boolean; stage: boolean; grade: boolean; extent: boolean };
}

/**
 * The final periodontal classification — per-axis clinician override
 * (`caseMeta.<axis>Override`) when set, else the pure
 * `derivePerioClassification` result (fed via `buildDerivationInputFromState`).
 * Overrides never feed back into the
 * derivation itself — `derived` is always the untouched computed value, so
 * callers can always see both what the engine computed and what the
 * clinician actually chose.
 */
export function getPerioClassification(): PerioClassificationResult {
  const derived = derivePerioClassification(buildDerivationInputFromState());
  return {
    diagnosis: caseMeta.diagnosisOverride ?? derived.diagnosis,
    stage: caseMeta.stageOverride ?? derived.stage,
    grade: caseMeta.gradeOverride ?? derived.grade,
    extent: caseMeta.extentOverride ?? derived.extent,
    derived,
    overridden: {
      diagnosis: caseMeta.diagnosisOverride !== null,
      stage: caseMeta.stageOverride !== null,
      grade: caseMeta.gradeOverride !== null,
      extent: caseMeta.extentOverride !== null,
    },
  };
}

/** `"molar-incisor"` (the derived/override enum value, hyphenated)
 *  maps to the camelCase `perio.class.extent.molarIncisor` i18n key segment;
 *  every other extent value is used as-is. */
function extentI18nSegment(extent: string): string {
  return extent === "molar-incisor" ? "molarIncisor" : extent;
}

/**
 * Builds the FINAL (override-aware) periodontal classification fragment
 * appended to `getOdontogramSummary()`'s `periodontalText` — e.g.
 * "Dx: periodontitis · Stage III · Grade B · generalized" for periodontitis,
 * "Dx: gingivitis" for gingivitis (2017 stage/grade/extent only apply once
 * periodontitis is the diagnosis), or "Dx: periodontally healthy" whenever a
 * clinician has explicitly overridden ANY axis — even to arrive back at
 * health — so their choice stays visible rather than silently reverting to
 * the plain base text.
 *
 * Returns `""` (nothing appended) for the ordinary untouched case — final
 * diagnosis health AND no override on any axis — leaving `periodontalText`
 * byte-identical to its "healthy" wording for every existing fixture/test that
 * never touches perio data or the classification axes.
 */
export function classificationSummaryFragment(cls: PerioClassificationResult): string {
  const anyOverride = cls.overridden.diagnosis || cls.overridden.stage || cls.overridden.grade || cls.overridden.extent;
  if(cls.diagnosis === "health" && !anyOverride) return "";
  const parts = [t("perio.class.summary.dx", { dx: t(`perio.class.dx.${cls.diagnosis}`) })];
  // Stage/grade/extent are periodontitis-staging concepts, so they're normally
  // shown only for a periodontitis diagnosis. But an EXPLICIT per-axis override
  // must never be silently dropped from the summary — surface it even when the
  // diagnosis isn't periodontitis (the clinician deliberately set it).
  const showStaging = cls.diagnosis === "periodontitis";
  if((showStaging || cls.overridden.stage) && cls.stage !== "na" && cls.stage !== "indeterminate") parts.push(t("perio.class.summary.stage", { stage: cls.stage }));
  if((showStaging || cls.overridden.grade) && cls.grade !== "indeterminate") parts.push(t("perio.class.summary.grade", { grade: cls.grade }));
  if((showStaging || cls.overridden.extent) && cls.extent !== "na") parts.push(t(`perio.class.extent.${extentI18nSegment(cls.extent)}`));
  return parts.join(" · ");
}

