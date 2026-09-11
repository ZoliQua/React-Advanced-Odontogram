// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { ToothRecord } from "./types";
import { LOCAL_SYSTEM } from "./codesystems";
import { ensureTooth } from "./primitives";
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
  code?: CC;
  bodySite?: { coding?: Array<Coding | null | undefined> };
  component?: Array<Component | null | undefined>;
  valueCodeableConcept?: CC;
  valueQuantity?: { value?: unknown };
}

const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const has = (cc: CC, system: string, code: string): boolean =>
  !!cc?.coding?.some((c) => !!c && c.system === system && c.code === code);
const localOf = (cc: CC): string | undefined =>
  cc?.coding?.find((c) => !!c && c.system === LOCAL_SYSTEM && typeof c.code === "string")?.code as string | undefined;
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

export interface ImportedPerioCase { smokingStatus?: string; hba1c?: number }

/** Parse the LOINC perio panels (+ the evidence Observations) of a Bundle's
 *  entries into `teeth` (mutated) and return the case-level fields found. */
export function importPerioObservations(entries: unknown, teeth: Record<string, ToothRecord>): { case: ImportedPerioCase } {
  const out: { case: ImportedPerioCase } = { case: {} };
  if (!Array.isArray(entries)) return out;
  for (const e of entries) {
    const res = (e as { resource?: unknown } | null)?.resource as ObsLike | undefined;
    if (!res || res.resourceType !== "Observation") continue;

    // --- case evidence (patient-level) ---
    if (has(res.code, LOINC_SYSTEM, LOINC.smokingStatus.code)) {
      const v = localOf(res.valueCodeableConcept);
      if (v && v.startsWith("smoking-") && SMOKING.has(v.slice("smoking-".length))) out.case.smokingStatus = v.slice("smoking-".length);
      continue;
    }
    if (has(res.code, LOINC_SYSTEM, LOINC.hba1c.code)) {
      const v = num(res.valueQuantity?.value);
      if (v !== undefined) out.case.hba1c = v;
      continue;
    }

    // --- per-tooth periodontal panel ---
    if (!has(res.code, LOINC_SYSTEM, LOINC.panel.code)) continue;
    const rawTooth = res.bodySite?.coding?.find((c) => !!c && typeof c.code === "string")?.code as string | undefined;
    const tooth = rawTooth ? (deciduousToFdi(rawTooth) ?? rawTooth) : undefined;
    if (!tooth || !/^\d{2}$/.test(tooth)) continue;

    const pd: Record<string, number> = {}, cal: Record<string, number> = {}, rec: Record<string, number> = {};
    const bop = new Set<string>();
    const furcation: Record<string, number> = {};
    const plaque = new Set<string>();
    const pi: Record<string, number> = {}, gi: Record<string, number> = {}, mpi: Record<string, number> = {}, mbi: Record<string, number> = {};
    let kg: number | undefined;

    for (const comp of res.component ?? []) {
      if (!comp) continue;
      const q = num(comp.valueQuantity?.value);
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
    const record = ensureTooth(teeth, tooth) as Record<string, unknown>;
    if (chartedSites.length > 0) {
      const gm: Record<string, number> = {};
      for (const s of chartedSites) {
        if (s in cal) gm[s] = cal[s] - pd[s];          // exact, incl. negative (pseudopocket)
        else if (s in rec) gm[s] = rec[s];              // recession-only fallback (gm > 0)
      }
      const perio: Record<string, unknown> = { pd: Object.fromEntries(chartedSites.map((s) => [s, pd[s]])) };
      if (Object.keys(gm).length) perio.gm = gm;
      const bopSites = chartedSites.filter((s) => bop.has(s));
      if (bopSites.length) perio.bop = bopSites;
      record.perio = perio;
    }
    if (Object.keys(furcation).length) record.furcation = furcation;
    if (plaque.size) record.plaque = SURFACES.filter((s) => plaque.has(s));
    if (Object.keys(pi).length) record.pi = pi;
    if (Object.keys(gi).length) record.gi = gi;
    if (Object.keys(mpi).length) record.mpi = mpi;
    if (Object.keys(mbi).length) record.mbi = mbi;
    if (kg !== undefined) record.kg = kg;
  }
  return out;
}
