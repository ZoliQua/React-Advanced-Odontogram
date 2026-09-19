// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { ToothRecord } from "./types";
import { isLocalSystem } from "./codesystems";
import { ensureTooth, isToothCode } from "./primitives";
import { deciduousToFdi } from "./iso3950";
import { LOINC, LOINC_SYSTEM, COMPONENT_BODYSITE_EXTENSION_URL } from "./toFhirPerio";

/**
 * DX-9 — the inverse of `appendPerioObservations` / the perio evidence
 * Observations: rebuild each tooth's periodontal record from the LOINC 74029-0
 * periodontal-panel Observation and read the smoking-status / HbA1c evidence
 * Observations into the case block.
 *
 * Gingival margin is reconstructed from CAL (always exported, CAL = PD + GM), so
 * negative/pseudopocket values round-trip exactly; the recession component
 * (only emitted for gm > 0) is the fallback. Suppuration is not exported and
 * therefore cannot be imported. Pure, tolerant of malformed input (never
 * throws); unknown sites/entrances/surfaces and non-finite values are skipped —
 * `hydrateState` re-validates and clamps everything anyway.
 */

const SITES = ["MB", "B", "DB", "ML", "L", "DL"] as const;
const ENTRANCES = ["mesial", "distal", "buccal", "lingual"] as const;
const SURFACES = ["mesial", "distal", "buccal", "lingual"] as const;
const SMOKING = new Set(["never", "former", "current"]);
const DIABETES = new Set(["none", "present"]);

type Coding = { system?: unknown; code?: unknown };
type CC = { coding?: Array<Coding | null | undefined> } | undefined;
interface Component {
  code?: CC;
  extension?: Array<{ url?: unknown; valueCodeableConcept?: CC } | null | undefined>;
  valueQuantity?: { value?: unknown };
  valueBoolean?: unknown;
  valueInteger?: unknown;
}
interface ObsLike {
  resourceType?: unknown;
  status?: unknown;
  code?: CC;
  bodySite?: { coding?: Array<Coding | null | undefined> };
  component?: Array<Component | null | undefined>;
  valueCodeableConcept?: CC;
  valueQuantity?: { value?: unknown; unit?: unknown; code?: unknown };
}

// An Observation the chart must not read as a measurement. The engine's own
// export always emits `status: "final"`; absence is accepted (tolerance), only
// these explicit values are rejected.
const REJECTED_OBS_STATUS: ReadonlySet<string> = new Set(["entered-in-error", "cancelled"]);

/**
 * HbA1c in NGSP percent, converting the IFCC unit when the Observation says so.
 *
 * The export emits UCUM `%`. A foreign bundle may report IFCC mmol/mol instead,
 * where a perfectly normal 42 would be read as 42 % — clamped to the 20 %
 * ceiling by `hydrateCaseMeta` and silently turning a healthy patient into
 * grade C. Conversion is the standard NGSP master equation
 * (NGSP % = 0.09148 × IFCC + 2.152).
 *
 * An UNLABELLED value is accepted as percent (our own historical exports and
 * the common case) but only within the range `hydrateCaseMeta` actually
 * accepts — an unlabelled 42 is not a percentage, and clamping it to 20 would
 * invent a diabetic patient, so it is ignored instead.
 */
function hba1cPercent(q: { value?: unknown; unit?: unknown; code?: unknown } | undefined): number | undefined {
  const v = num(q?.value);
  if (v === undefined) return undefined;
  const unit = (typeof q?.code === "string" ? q.code : typeof q?.unit === "string" ? q.unit : "").trim().toLowerCase();
  if (unit === "mmol/mol") return Math.round((0.09148 * v + 2.152) * 10) / 10;
  if (unit === "%" || unit === "percent") return v;
  if (unit === "") return v >= 3 && v <= 20 ? v : undefined;
  return undefined;                      // a unit we cannot interpret: never guess
}

const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
/** A millimetre reading on the engine's integer scale (see the call site). */
const mm = (v: unknown): number | undefined => { const n = num(v); return n === undefined ? undefined : Math.round(n); };
/** A CodeableConcept's codings, or [] for anything else. `coding` is typed as an
 *  array but arrives from an UNTRUSTED bundle, where `code: { coding: {} }` is
 *  perfectly possible — calling `.some`/`.find` on that object throws, and this
 *  module's contract (and `parseFhirBundle`'s) is that it never throws. */
const codingsOf = (cc: CC): Array<{ system?: unknown; code?: unknown } | null | undefined> =>
  (Array.isArray(cc?.coding) ? cc.coding : []);
const has = (cc: CC, system: string, code: string): boolean =>
  codingsOf(cc).some((c) => !!c && c.system === system && c.code === code);
const localOf = (cc: CC): string | undefined =>
  codingsOf(cc).find((c) => !!c && isLocalSystem(c.system) && typeof c.code === "string")?.code as string | undefined;
/** The engine-local qualifier (`perio-site:MB`, …) on a component's R4 backport bodySite extension. */
function qualifier(comp: Component, prefix: string): string | undefined {
  for (const ext of comp.extension ?? []) {
    if (!ext || ext.url !== COMPONENT_BODYSITE_EXTENSION_URL) continue;
    const code = localOf(ext.valueCodeableConcept);
    if (code && code.startsWith(prefix)) return code.slice(prefix.length);
  }
  return undefined;
}
const inSet = <T extends string>(set: readonly T[], v: string | undefined): v is T => !!v && (set as readonly string[]).includes(v);

export interface ImportedPerioCase {
  smokingStatus?: string;
  cigarettesPerDay?: number;
  diabetesStatus?: string;
  hba1c?: number;
}

/** Parse the LOINC perio panels (+ the evidence Observations) of a Bundle's
 *  entries into `teeth` (mutated) and return the case-level fields found. */
export function importPerioObservations(entries: unknown, teeth: Record<string, ToothRecord>): { case: ImportedPerioCase } {
  const out: { case: ImportedPerioCase } = { case: {} };
  if (!Array.isArray(entries)) return out;
  for (const e of entries) {
    const res = (e as { resource?: unknown } | null)?.resource as ObsLike | undefined;
    if (!res || res.resourceType !== "Observation") continue;
    if (typeof res.status === "string" && REJECTED_OBS_STATUS.has(res.status)) continue;

    // --- case evidence (patient-level) ---
    if (has(res.code, LOINC_SYSTEM, LOINC.smokingStatus.code)) {
      const v = localOf(res.valueCodeableConcept);
      if (v && v.startsWith("smoking-") && SMOKING.has(v.slice("smoking-".length))) out.case.smokingStatus = v.slice("smoking-".length);
      // The daily count rides as a component on the status it qualifies.
      for (const comp of res.component ?? []) {
        if (!comp || localOf(comp.code) !== "cigarettes-per-day") continue;
        const n = comp.valueInteger;
        if (typeof n === "number" && Number.isInteger(n)) out.case.cigarettesPerDay = n;
      }
      continue;
    }
    // Diabetes status — an engine-local Observation code, so it is matched on
    // the local system rather than LOINC. `derivePerioClassification` only
    // consults HbA1c when the status is "present", so importing the HbA1c
    // without this silently degraded the grade.
    if (localOf(res.code) === "diabetes-status") {
      const v = localOf(res.valueCodeableConcept);
      if (v && DIABETES.has(v.slice("diabetes-".length))) out.case.diabetesStatus = v.slice("diabetes-".length);
      continue;
    }
    if (has(res.code, LOINC_SYSTEM, LOINC.hba1c.code)) {
      const v = hba1cPercent(res.valueQuantity);
      if (v !== undefined) out.case.hba1c = v;
      continue;
    }

    // --- per-tooth periodontal panel ---
    if (!has(res.code, LOINC_SYSTEM, LOINC.panel.code)) continue;
    const rawTooth = codingsOf(res.bodySite).find((c) => !!c && typeof c.code === "string")?.code as string | undefined;
    const tooth = rawTooth ? (deciduousToFdi(rawTooth) ?? rawTooth) : undefined;
    if (!tooth || !isToothCode(tooth)) continue;

    const pd: Record<string, number> = {}, cal: Record<string, number> = {}, rec: Record<string, number> = {};
    const bop = new Set<string>();
    const furcation: Record<string, number> = {};
    const plaque = new Set<string>();
    const pi: Record<string, number> = {}, gi: Record<string, number> = {}, mpi: Record<string, number> = {}, mbi: Record<string, number> = {};
    let kg: number | undefined;

    for (const comp of res.component ?? []) {
      if (!comp) continue;
      // Millimetre readings are ROUNDED to the engine's integer scale. A foreign
      // chart that probes in half millimetres (PD 3.5) used to be forwarded
      // verbatim, and `clampPerio` then rejected the non-integer with `null` —
      // which un-charted the site and took its GM and BOP with it (the
      // no-orphan rule). Rounding keeps the measurement; dropping it lost the
      // site silently.
      const q = mm(comp.valueQuantity?.value);
      const i = typeof comp.valueInteger === "number" && Number.isInteger(comp.valueInteger) ? comp.valueInteger : undefined;
      if (has(comp.code, LOINC_SYSTEM, LOINC.pd.code)) { const s = qualifier(comp, "perio-site:"); if (inSet(SITES, s) && q !== undefined) pd[s] = q; continue; }
      if (has(comp.code, LOINC_SYSTEM, LOINC.cal.code)) { const s = qualifier(comp, "perio-site:"); if (inSet(SITES, s) && q !== undefined) cal[s] = q; continue; }
      if (has(comp.code, LOINC_SYSTEM, LOINC.recession.code)) { const s = qualifier(comp, "perio-site:"); if (inSet(SITES, s) && q !== undefined) rec[s] = q; continue; }
      if (has(comp.code, LOINC_SYSTEM, LOINC.furcation.code)) { const en = qualifier(comp, "furcation-entrance:"); if (inSet(ENTRANCES, en) && i !== undefined) furcation[en] = i; continue; }
      const local = localOf(comp.code);
      if (!local) continue;
      if (local === "perio-bop") { const s = qualifier(comp, "perio-site:"); if (inSet(SITES, s) && comp.valueBoolean === true) bop.add(s); continue; }
      if (local === "plaque-surface") { const s = qualifier(comp, "plaque-surface:"); if (inSet(SURFACES, s) && comp.valueBoolean === true) plaque.add(s); continue; }
      if (local === "keratinized-gingiva-width") { if (q !== undefined) kg = q; continue; }
      const graded: Record<string, Record<string, number>> = {
        "plaque-index-silness-loe": pi, "gingival-index-loe-silness": gi,
        "mod-plaque-index-mombelli": mpi, "mod-bleeding-index-mombelli": mbi,
      };
      const target = Object.prototype.hasOwnProperty.call(graded, local) ? graded[local] : undefined;
      if (target) { const s = qualifier(comp, "plaque-surface:"); if (inSet(SURFACES, s) && i !== undefined) target[s] = i; }
    }

    const chartedSites = SITES.filter((s) => s in pd);
    const anything = chartedSites.length > 0 || Object.keys(furcation).length > 0 || plaque.size > 0
      || Object.keys(pi).length > 0 || Object.keys(gi).length > 0 || Object.keys(mpi).length > 0 || Object.keys(mbi).length > 0 || kg !== undefined;
    if (!anything) continue; // a panel with nothing usable creates no tooth record
    // A foreign exporter may split one tooth across SEVERAL 74029-0 panels (one
    // per site, or one per index group). Every assignment below therefore MERGES
    // into what an earlier panel already put on the record — a plain overwrite
    // kept only the last panel's sites. The engine's own export emits one panel
    // per tooth, so this path is foreign-bundle only.
    const record = ensureTooth(teeth, tooth) as Record<string, unknown>;
    const mergeInto = (key: string, values: Record<string, number>) => {
      if (Object.keys(values).length === 0) return;
      const prev = record[key];
      record[key] = { ...(prev && typeof prev === "object" ? prev as Record<string, number> : {}), ...values };
    };
    if (chartedSites.length > 0) {
      const gm: Record<string, number> = {};
      for (const s of chartedSites) {
        // CAL is exported for EVERY charted site, with gm defaulting to 0 when
        // the margin was never recorded, so a reconstructed 0 cannot be told
        // apart from a measured 0 — and the engine treats them identically
        // (`CAL = pd + (gm ?? 0)`). Omitting the zero keeps the GM input blank
        // instead of turning "not recorded" into "measured 0 mm" on every
        // round trip. Negative (pseudopocket) and positive (recession) values
        // are real readings and are always kept.
        const value = s in cal ? cal[s] - pd[s]         // exact, incl. negative (pseudopocket)
          : s in rec ? rec[s]                            // recession-only fallback (gm > 0)
          : undefined;
        if (value !== undefined && value !== 0) gm[s] = value;
      }
      const prev = (record.perio && typeof record.perio === "object" ? record.perio : {}) as Record<string, unknown>;
      const prevMap = (key: string): Record<string, number> =>
        (prev[key] && typeof prev[key] === "object" ? prev[key] as Record<string, number> : {});
      const perio: Record<string, unknown> = {
        pd: { ...prevMap("pd"), ...Object.fromEntries(chartedSites.map((s) => [s, pd[s]])) },
      };
      const mergedGm = { ...prevMap("gm"), ...gm };
      if (Object.keys(mergedGm).length) perio.gm = mergedGm;
      const prevBop = Array.isArray(prev.bop) ? prev.bop as string[] : [];
      const bopSites = [...new Set([...prevBop, ...chartedSites.filter((s) => bop.has(s))])];
      if (bopSites.length) perio.bop = bopSites;
      record.perio = perio;
    }
    mergeInto("furcation", furcation);
    if (plaque.size) {
      const prev = Array.isArray(record.plaque) ? record.plaque as string[] : [];
      const union = new Set([...prev, ...SURFACES.filter((s) => plaque.has(s))]);
      record.plaque = SURFACES.filter((s) => union.has(s));
    }
    mergeInto("pi", pi);
    mergeInto("gi", gi);
    mergeInto("mpi", mpi);
    mergeInto("mbi", mbi);
    if (kg !== undefined) record.kg = kg;
  }
  return out;
}
