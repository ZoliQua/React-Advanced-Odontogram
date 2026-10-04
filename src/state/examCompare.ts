// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Comparing two EXAMS — the same mouth charted on two different days.
//
// The engine has always been able to diff its two charts of one exam (status
// vs plan, `getPlanChanges()`); what a recall appointment actually asks is a
// different question: what changed since last time. A host that keeps a
// timeline of exports (DentalQuoteCreator does) holds both payloads and has no
// way to ask it.
//
// This module answers the periodontal half, where the question is numeric: a
// pocket is 6 mm today and was 4 mm in March. Pure — plain serialized payloads
// in, plain data out; no DOM, no active chart, no i18n. Tolerant of malformed
// input the way every other payload reader here is: an unusable record is
// skipped, never thrown on.
import { PERIO_SITES } from "./payload";
import { ALL_TEETH } from "../anatomy/profiles";

/**
 * Millimetres of change that count as real movement rather than measurement
 * noise. Probing is reproducible to about ±1 mm between visits and examiners,
 * so 2 mm is the threshold the periodontal literature uses for attachment
 * loss/gain — and the one the 2017 classification's own progression reasoning
 * rests on. Exported so a caller can report on its own threshold instead.
 */
export const PROGRESSION_MM = 2;

/** One site, measured in both exams (or in only one of them). */
export interface PerioSiteDelta {
  toothNo: number;
  site: string;
  /** Probing depth in mm, or `null` when the site was not charted in that exam. */
  pdFrom: number | null;
  pdTo: number | null;
  /** Clinical attachment level (pd + gm) in mm, or `null` when not charted. */
  calFrom: number | null;
  calTo: number | null;
}

/** Whole-mouth figures for one exam — the subset of `getPerioSummary()` that
 *  can be derived from a payload alone. */
export interface PerioExamAggregate {
  chartedSites: number;
  bleedingSites: number;
  /** Bleeding sites ÷ charted sites, as a percentage with one decimal. */
  bopPercent: number;
  maxPd: number | null;
  worstCal: number | null;
}

export interface PerioExamComparison {
  from: PerioExamAggregate;
  to: PerioExamAggregate;
  /** Every site whose probing depth or attachment level moved at all, including
   *  sites charted in only one of the two exams. Tooth order is the clinical
   *  `ALL_TEETH` order; sites follow `PERIO_SITES`. */
  changed: PerioSiteDelta[];
  /** Sites charted in BOTH exams whose attachment worsened by at least
   *  {@link PROGRESSION_MM} — the clinically meaningful subset of `changed`. */
  attachmentLoss: PerioSiteDelta[];
  /** …and improved by at least as much. */
  attachmentGain: PerioSiteDelta[];
  /** Sites charted in both whose POCKET deepened by at least {@link PROGRESSION_MM}. */
  deepened: PerioSiteDelta[];
  /** Sites charted now but not then, and the other way round. */
  newlyCharted: number;
  noLongerCharted: number;
}

type Rec = Record<string, unknown>;

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function teethOf(payload: unknown): Record<string, Rec> {
  const p = payload as { teeth?: unknown } | null | undefined;
  return p && typeof p === "object" && p.teeth && typeof p.teeth === "object"
    ? (p.teeth as Record<string, Rec>) : {};
}

/** `pd` and `cal` per charted site of one tooth in one exam. A site missing
 *  from `pd` is NOT charted — never a zero (the engine's charting convention). */
function sitesOf(record: Rec | undefined): Map<string, { pd: number; cal: number }> {
  const out = new Map<string, { pd: number; cal: number }>();
  const perio = record?.perio as { pd?: unknown; gm?: unknown } | undefined;
  if (!perio || typeof perio !== "object") return out;
  const pd = (perio.pd && typeof perio.pd === "object" ? perio.pd : {}) as Record<string, unknown>;
  const gm = (perio.gm && typeof perio.gm === "object" ? perio.gm : {}) as Record<string, unknown>;
  for (const site of PERIO_SITES) {
    const depth = num(pd[site]);
    if (depth === null) continue;
    out.set(site, { pd: depth, cal: depth + (num(gm[site]) ?? 0) });
  }
  return out;
}

function bleedingOf(record: Rec | undefined): Set<string> {
  const bop = (record?.perio as { bop?: unknown } | undefined)?.bop;
  return new Set(Array.isArray(bop) ? bop.filter((s): s is string => typeof s === "string") : []);
}

function aggregate(teeth: Record<string, Rec>): PerioExamAggregate {
  let chartedSites = 0, bleedingSites = 0;
  let maxPd: number | null = null, worstCal: number | null = null;
  for (const toothNo of ALL_TEETH) {
    const record = teeth[String(toothNo)];
    const bop = bleedingOf(record);
    for (const [site, { pd, cal }] of sitesOf(record)) {
      chartedSites++;
      if (bop.has(site)) bleedingSites++;
      if (maxPd === null || pd > maxPd) maxPd = pd;
      if (worstCal === null || cal > worstCal) worstCal = cal;
    }
  }
  return {
    chartedSites, bleedingSites,
    bopPercent: chartedSites > 0 ? Math.round((bleedingSites / chartedSites) * 1000) / 10 : 0,
    maxPd, worstCal,
  };
}

/**
 * Compare the periodontal measurements of two exported payloads — `before` as
 * charted then, `after` as charted now.
 *
 * Only sites charted in BOTH exams can move: a site that appears or disappears
 * is reported in `changed` and counted in `newlyCharted` / `noLongerCharted`,
 * but never as attachment loss, because there is nothing to subtract from.
 */
export function comparePerioExams(before: unknown, after: unknown): PerioExamComparison {
  const beforeTeeth = teethOf(before), afterTeeth = teethOf(after);
  const changed: PerioSiteDelta[] = [];
  const attachmentLoss: PerioSiteDelta[] = [];
  const attachmentGain: PerioSiteDelta[] = [];
  const deepened: PerioSiteDelta[] = [];
  let newlyCharted = 0, noLongerCharted = 0;

  for (const toothNo of ALL_TEETH) {
    const key = String(toothNo);
    const was = sitesOf(beforeTeeth[key]);
    const now = sitesOf(afterTeeth[key]);
    for (const site of PERIO_SITES) {
      const a = was.get(site) ?? null;
      const b = now.get(site) ?? null;
      if (!a && !b) continue;
      if (!a) newlyCharted++;
      if (!b) noLongerCharted++;
      const delta: PerioSiteDelta = {
        toothNo, site,
        pdFrom: a?.pd ?? null, pdTo: b?.pd ?? null,
        calFrom: a?.cal ?? null, calTo: b?.cal ?? null,
      };
      if (!a || !b) { changed.push(delta); continue; }
      if (a.pd === b.pd && a.cal === b.cal) continue;
      changed.push(delta);
      if (b.cal - a.cal >= PROGRESSION_MM) attachmentLoss.push(delta);
      if (a.cal - b.cal >= PROGRESSION_MM) attachmentGain.push(delta);
      if (b.pd - a.pd >= PROGRESSION_MM) deepened.push(delta);
    }
  }

  return {
    from: aggregate(beforeTeeth), to: aggregate(afterTeeth),
    changed, attachmentLoss, attachmentGain, deepened, newlyCharted, noLongerCharted,
  };
}
