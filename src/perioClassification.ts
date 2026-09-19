// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Pure 2017 World Workshop periodontal classification derivation core
 * (diagnosis / stage / grade / extent).
 *
 * DELIBERATELY dependency-free: this module imports NOTHING from
 * `odontogram.ts` (or anywhere else in the engine). `derivePerioClassification`
 * is a pure function of its input struct — no module-level state, no `Date`,
 * no `Math.random` — so it is fully deterministic and safe to call from a
 * serialized payload (the FHIR Condition builder feeds it exactly that way).
 * The engine-state adapter that BUILDS a {@link PerioDerivationInput} from the
 * live chart (`buildDerivationInputFromState()`) lives in `odontogram.ts`,
 * which is free to import types from here (one-directional dependency).
 */

// ---- Pure input struct -----------------------------------------------------

/** Per-tooth inputs the derivation needs — already reduced from the raw
 *  per-site CAL/PD data (the adapter in `odontogram.ts` does that reduction). */
export interface ToothDerivationInput {
  toothNo: number;
  /** Worst (max) CAL over the 4 approximal sites (MB/DB/ML/DL). 0 if none
   *  charted — the pure function cannot distinguish "charted as 0" from
   *  "never charted"; both read as "no interdental attachment loss here". */
  interdentalCal: number;
  /** Worst (max) CAL over the 2 mid sites (B/L) — the 2017 primary-case
   *  definition's buccal/oral fallback criterion. */
  buccalOralCal: number;
  /** Worst (max) raw probing depth recorded anywhere on the tooth (any of
   *  the 6 sites) — used by the stage-III complexity escalation. */
  maxPd: number;
  /** Whether this FDI position is a real, present tooth (not missing, not
   *  an implant) — mirrors `isToothPresent()` in odontogram.ts. */
  present: boolean;
}

/** Case-level metadata the derivation needs — the `CaseMeta` shape, duplicated
 *  here (not imported) to keep this module dependency-free. */
export interface PerioMetaInput {
  age: number | null;
  maxRblPercent: number | null;
  toothLossPerio: number | null;
  smokingStatus: "unknown" | "never" | "former" | "current";
  cigarettesPerDay: number | null;
  diabetesStatus: "unknown" | "none" | "present";
  hba1c: number | null;
}

/** Full pure input to {@link derivePerioClassification}. */
export interface PerioDerivationInput {
  teeth: ToothDerivationInput[];
  /** Whole-mouth %BOP (`getPerioSummary().bopPercent`) — drives the
   *  gingivitis fallback when there's no periodontitis-qualifying CAL. */
  bopPercent: number;
  /** Highest Glickman furcation grade anywhere in the mouth, or `null` when
   *  nothing is graded (`getPerioSummary().maxFurcation`) — one of the
   *  stage-III complexity escalation criteria. */
  maxFurcation: number | null;
  meta: PerioMetaInput;
}

// ---- Output shape -----------------------------------------------------

export type PerioDiagnosis = "health" | "gingivitis" | "periodontitis";
export type PerioStage = "na" | "I" | "II" | "III" | "IV" | "indeterminate";
export type PerioGrade = "A" | "B" | "C" | "indeterminate";
export type PerioExtent = "na" | "localized" | "generalized" | "molar-incisor";

export interface PerioClassification {
  diagnosis: PerioDiagnosis;
  stage: PerioStage;
  grade: PerioGrade;
  extent: PerioExtent;
  /** Provenance for the final `grade` — the three sub-grades `deriveGrade`
   *  computes internally, surfaced (not re-derived) so callers (the FHIR
   *  evidence) can cite exactly which factor(s) drove the result.
   *  `direct` is the raw %RBL÷age band, or `null` when age/RBL is missing
   *  (mirrors `grade === "indeterminate"` when no modifiers are known either).
   *  `smoking`/`diabetes` are always a concrete bucket (`"A"` when the
   *  status is unknown/none/never/former — never `null`, since those
   *  statuses are a known "does not escalate" fact, not a missing one). */
  buckets: { smoking: "A" | "B" | "C"; diabetes: "A" | "B" | "C"; direct: "A" | "B" | "C" | null };
}

// ---- Arch adjacency ---------------------------------------------------

// Same FDI sequence `ALL_TEETH` uses in odontogram.ts (duplicated locally —
// this module must not import from there). Consecutive entries within ONE
// of these two arrays are "adjacent"; the midline pairs 11/21 and 41/31 are
// each consecutive within their own arch array, so they count as adjacent.
// The 28/48 boundary (end of upper, start of lower) is NOT adjacent — the
// two arrays are never compared against each other.
const UPPER_ARCH_SEQUENCE = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ARCH_SEQUENCE = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function archAdjacent(a: number, b: number): boolean {
  for (const seq of [UPPER_ARCH_SEQUENCE, LOWER_ARCH_SEQUENCE]) {
    const ia = seq.indexOf(a);
    const ib = seq.indexOf(b);
    if (ia !== -1 && ib !== -1 && Math.abs(ia - ib) === 1) return true;
  }
  return false;
}

/** Whether two FDI tooth numbers are arch-adjacent (same-arch consecutive
 *  positions, including the 11/21 and 41/31 midline pairs). Exported for
 *  tests / potential reuse; the derivation itself only needs the local
 *  `archAdjacent` above. */
export function areAdjacent(a: number, b: number): boolean {
  return archAdjacent(a, b);
}

// ---- Position helpers (toothNo % 10) -----------------------------------

function toothPosition(toothNo: number): number {
  return toothNo % 10;
}

function isMolar(toothNo: number): boolean {
  const p = toothPosition(toothNo);
  return p === 6 || p === 7 || p === 8;
}

function isIncisor(toothNo: number): boolean {
  const p = toothPosition(toothNo);
  return p === 1 || p === 2;
}

// ---- Grade ordering -----------------------------------------------------

const GRADE_ORDER: readonly ("A" | "B" | "C")[] = ["A", "B", "C"];

function maxGrade(a: "A" | "B" | "C", b: "A" | "B" | "C"): "A" | "B" | "C" {
  return GRADE_ORDER.indexOf(a) >= GRADE_ORDER.indexOf(b) ? a : b;
}

// ---- Diagnosis ------------------------------------------------------------

/**
 * 2017 primary case definition: periodontitis requires interdental
 * attachment loss (CAL >= 1mm) detectable at >= 2 NON-adjacent teeth (a
 * single site, or CAL confined to adjacent teeth only, does not qualify —
 * that pattern is more consistent with local trauma/an isolated defect than
 * a periodontitis case). A buccal/oral-only fallback additionally qualifies
 * a case via >= 2 teeth with buccal/oral CAL >= 3mm AND PD > 3mm (covers
 * cases where interproximal papilla is intact but there's frank buccal/
 * lingual attachment loss with a true pocket).
 *
 * Both criteria are evaluated over PRESENT teeth only — a missing tooth
 * carries no periodontal attachment to lose.
 */
function deriveDiagnosis(teeth: ToothDerivationInput[], bopPercent: number): PerioDiagnosis {
  const present = teeth.filter((t) => t.present);

  const affected = present.filter((t) => t.interdentalCal >= 1);
  let hasNonAdjacentPair = false;
  outer: for (let i = 0; i < affected.length; i++) {
    for (let j = i + 1; j < affected.length; j++) {
      if (!archAdjacent(affected[i].toothNo, affected[j].toothNo)) {
        hasNonAdjacentPair = true;
        break outer;
      }
    }
  }

  const buccalOralQualifying = present.filter((t) => t.buccalOralCal >= 3 && t.maxPd > 3).length;

  if (hasNonAdjacentPair || buccalOralQualifying >= 2) return "periodontitis";
  if (bopPercent >= 10) return "gingivitis";
  return "health";
}

// ---- Stage ------------------------------------------------------------

/**
 * Stage bands (1=I, 2=II, 3=III) from worst interdental CAL, evaluated over
 * PRESENT teeth only — consistent with `deriveDiagnosis`/`deriveExtent`. A
 * tooth that was charted with perio data and later marked missing/extracted
 * carries no periodontal attachment anymore; including its stale CAL (or PD,
 * for the complexity escalation below) would inflate the stage from a tooth
 * that's no longer even there.
 */
function calBand(maxCal: number): 1 | 2 | 3 | null {
  if (maxCal >= 5) return 3;
  if (maxCal >= 3) return 2;
  if (maxCal >= 1) return 1;
  return null;
}

/** RBL bands (1=I, 2=II, 3=III) — every non-null %RBL maps to a band (the
 *  scale covers the full 0-100 range); `null` (not charted) has no band. */
function rblBand(maxRblPercent: number): 1 | 2 | 3 {
  if (maxRblPercent > 33) return 3;
  if (maxRblPercent >= 15) return 2;
  return 1;
}

const STAGE_BY_BAND: readonly PerioStage[] = ["I", "II", "III"]; // index 0..2 for band 1..3

function deriveStage(
  teeth: ToothDerivationInput[],
  meta: PerioMetaInput,
  maxFurcation: number | null,
): PerioStage {
  const present = teeth.filter((t) => t.present);
  const maxCal = present.reduce((m, t) => Math.max(m, t.interdentalCal), 0);
  const cBand = calBand(maxCal);
  const rBand = meta.maxRblPercent === null ? null : rblBand(meta.maxRblPercent);

  if (cBand === null && rBand === null) return "indeterminate";

  let band: 1 | 2 | 3 = Math.max(cBand ?? 0, rBand ?? 0) as 1 | 2 | 3;

  // Complexity escalates ONLY up to >= III — never downgrades a band already
  // there from the CAL/RBL comparison above. `maxFurcation` stays whole-mouth
  // (a case-level scalar input, not a per-tooth reduction here); the per-tooth
  // maxPd reduction is present-gated like maxCal above.
  const maxPd = present.reduce((m, t) => Math.max(m, t.maxPd), 0);
  if (maxPd >= 6 || (maxFurcation !== null && maxFurcation >= 2)) {
    band = Math.max(band, 3) as 1 | 2 | 3;
  }

  let stage: PerioStage = STAGE_BY_BAND[band - 1];

  // Tooth loss attributable to periodontitis >= 5 is the Stage IV criterion
  // — the single highest stage, so this is always a final override once a
  // real (non-indeterminate) band has been established above.
  if (meta.toothLossPerio !== null && meta.toothLossPerio >= 5) {
    stage = "IV";
  }

  return stage;
}

// ---- Grade ------------------------------------------------------------

/** `deriveGrade`'s result, bundling the final grade with the three sub-grade
 *  buckets it computed along the way — surfaced (not re-derived) as
 *  `PerioClassification.buckets` for provenance. */
interface GradeResult {
  grade: PerioGrade;
  buckets: { smoking: "A" | "B" | "C"; diabetes: "A" | "B" | "C"; direct: "A" | "B" | "C" | null };
}

function deriveGrade(meta: PerioMetaInput): GradeResult {
  let directGrade: "A" | "B" | "C" | null = null;
  if (meta.age !== null && meta.age > 0 && meta.maxRblPercent !== null) {
    const ratio = meta.maxRblPercent / meta.age;
    directGrade = ratio > 1.0 ? "C" : ratio >= 0.25 ? "B" : "A";
  }

  let smokingGrade: "A" | "B" | "C" = "A";
  if (meta.smokingStatus === "current") {
    smokingGrade = meta.cigarettesPerDay !== null && meta.cigarettesPerDay >= 10 ? "C" : "B";
  }

  let diabetesGrade: "A" | "B" | "C" = "A";
  if (meta.diabetesStatus === "present") {
    diabetesGrade = meta.hba1c !== null && meta.hba1c >= 7 ? "C" : "B";
  }

  const buckets = { smoking: smokingGrade, diabetes: diabetesGrade, direct: directGrade };

  if (directGrade === null && meta.smokingStatus === "unknown" && meta.diabetesStatus === "unknown") {
    return { grade: "indeterminate", buckets };
  }

  const baseline: "A" | "B" | "C" = directGrade ?? "B";
  return { grade: maxGrade(maxGrade(baseline, smokingGrade), diabetesGrade), buckets };
}

// ---- Extent ------------------------------------------------------------

/**
 * Molar-incisor pattern is checked FIRST, unconditionally — per the 2017
 * literature it is NOT gated by the 30% localized/generalized threshold (a
 * case can have every first molar + every incisor affected — well over 30%
 * of a full dentition by tooth count — and still be classified as the
 * distinctive molar-incisor pattern rather than "generalized", precisely
 * BECAUSE canines/premolars are spared). Only when the affected set is
 * NOT purely molars+incisors do we fall through to the percentage-based
 * localized/generalized split.
 */
function deriveExtent(teeth: ToothDerivationInput[]): PerioExtent {
  const present = teeth.filter((t) => t.present);
  const affected = present.filter((t) => t.interdentalCal >= 1);

  if (affected.length > 0) {
    const allMolarOrIncisor = affected.every((t) => isMolar(t.toothNo) || isIncisor(t.toothNo));
    const hasMolar = affected.some((t) => isMolar(t.toothNo));
    const hasIncisor = affected.some((t) => isIncisor(t.toothNo));
    if (allMolarOrIncisor && hasMolar && hasIncisor) return "molar-incisor";
  }

  if (present.length === 0) return "localized";
  const pct = affected.length / present.length;
  return pct < 0.3 ? "localized" : "generalized";
}

// ---- Entry point --------------------------------------------------------

/**
 * Pure derivation of the full 2017 World Workshop periodontal classification
 * (diagnosis/stage/grade/extent) from an already-reduced input struct. No
 * engine state, no Date/random — safe to call repeatedly with the same
 * input and always get the same output (fed from a serialized FHIR-export-time
 * snapshot, not live module state).
 */
export function derivePerioClassification(input: PerioDerivationInput): PerioClassification {
  const diagnosis = deriveDiagnosis(input.teeth, input.bopPercent);
  const { grade, buckets } = deriveGrade(input.meta);

  if (diagnosis !== "periodontitis") {
    return { diagnosis, stage: "na", grade, extent: "na", buckets };
  }

  return {
    diagnosis,
    stage: deriveStage(input.teeth, input.meta, input.maxFurcation),
    grade,
    extent: deriveExtent(input.teeth),
    buckets,
  };
}
