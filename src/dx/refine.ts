// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { DX_CODES, type DiagnosisKey } from "./codes";
import type { PerioStage, PerioExtent } from "../perioClassification";

/**
 * DX-8 — data-driven ICD code specificity. The derivation keys stay flat
 * (`caries`, `periodontitis`); this module refines the CODE from the data the
 * chart already holds, in the export, the national packs and the UI:
 *
 *  - caries depth (radiographic depth first, ICDAS severity as fallback) and the
 *    surface type (pit-and-fissure = occlusal, smooth = every other surface),
 *    carried on `DerivedDiagnosis.detail` by `deriveDentalDiagnoses`;
 *  - periodontitis severity (2017 stage) and extent, supplied by the perio
 *    Condition builder from the final classification.
 *
 * WHO ICD-10 refines caries only (K02.0 / K02.1 — WHO K05.3 has no depth/extent
 * subcodes; neither has BNO-10, per the NEAK törzs). ICD-10-CM refines both
 * (K02.5x/6x surface×depth, K05.3xx extent×severity). No pulp-exposure codes
 * (WHO K02.5, CM K02.x3) — the chart has no per-surface pulp-exposure evidence.
 * Titles are verbatim: WHO from icd.who.int (2019), ICD-10-CM from the NLM
 * Clinical Tables ICD-10-CM service.
 */

export type CariesDepth = "enamel" | "dentine";
export type CariesSurfaceType = "pit-fissure" | "smooth";
/** Most-severe caries involvement on a tooth (one Condition per tooth). */
export interface CariesDetail { depth: CariesDepth | null; surface: CariesSurfaceType | null }
/** 2017-classification severity/extent of the whole-mouth periodontitis Condition. */
export interface PerioDetail { stage: PerioStage; extent: PerioExtent }
export type DxDetail = CariesDetail | PerioDetail;

const isCariesDetail = (d: DxDetail | undefined): d is CariesDetail => !!d && "depth" in d;
const isPerioDetail = (d: DxDetail | undefined): d is PerioDetail => !!d && "stage" in d;

// WHO ICD-10 2019 (icd.who.int/browse10/2019)
const WHO_CARIES: Record<CariesDepth, { code: string; display: string }> = {
  enamel: { code: "K02.0", display: "Caries limited to enamel" },
  dentine: { code: "K02.1", display: "Caries of dentine" },
};

// ICD-10-CM (NLM Clinical Tables) — surface × depth
const CM_CARIES: Record<CariesSurfaceType, Record<CariesDepth, { code: string; display: string }>> = {
  "pit-fissure": {
    enamel: { code: "K02.51", display: "Dental caries on pit and fissure surface limited to enamel" },
    dentine: { code: "K02.52", display: "Dental caries on pit and fissure surface penetrating into dentin" },
  },
  smooth: {
    enamel: { code: "K02.61", display: "Dental caries on smooth surface limited to enamel" },
    dentine: { code: "K02.62", display: "Dental caries on smooth surface penetrating into dentin" },
  },
};

// ICD-10-CM chronic periodontitis: K05.3<extent><severity>
const CM_PERIO_UNSPECIFIED = { code: "K05.30", display: "Chronic periodontitis, unspecified" };
const CM_PERIO: Record<string, string> = {
  "K05.311": "Chronic periodontitis, localized, slight",
  "K05.312": "Chronic periodontitis, localized, moderate",
  "K05.313": "Chronic periodontitis, localized, severe",
  "K05.319": "Chronic periodontitis, localized, unspecified severity",
  "K05.321": "Chronic periodontitis, generalized, slight",
  "K05.322": "Chronic periodontitis, generalized, moderate",
  "K05.323": "Chronic periodontitis, generalized, severe",
  "K05.329": "Chronic periodontitis, generalized, unspecified severity",
};

/** The WHO ICD-10 coding for a diagnosis, refined by its detail when WHO has a
 *  matching subcode; otherwise the flat catalog entry. `icd10` is null for an
 *  uncoded diagnosis (peri-implant keys). */
export function refineWho(key: DiagnosisKey, detail?: DxDetail): { icd10: string | null; display: string } {
  const base = DX_CODES[key];
  if (key === "caries" && isCariesDetail(detail) && detail.depth) {
    const r = WHO_CARIES[detail.depth];
    return { icd10: r.code, display: r.display };
  }
  return { icd10: base.icd10 ?? null, display: base.icd10Display };
}

/** The ICD-10-CM coding a modification pack should emit for a diagnosis given
 *  its detail, or `null` when nothing can be refined (the caller falls back to
 *  the pack's flat code, e.g. K02.9 / K05.30). */
export function refineCm(key: DiagnosisKey, detail?: DxDetail): { code: string; display: string } | null {
  if (key === "caries" && isCariesDetail(detail)) {
    if (!detail.depth || !detail.surface) return null;
    return CM_CARIES[detail.surface][detail.depth];
  }
  if (key === "periodontitis" && isPerioDetail(detail)) {
    const ext = detail.extent === "localized" || detail.extent === "molar-incisor" ? "1"
      : detail.extent === "generalized" ? "2" : null;
    if (!ext) return CM_PERIO_UNSPECIFIED;
    const sev = detail.stage === "I" ? "1" : detail.stage === "II" ? "2"
      : detail.stage === "III" || detail.stage === "IV" ? "3" : "9";
    const code = `K05.3${ext}${sev}`;
    return { code, display: CM_PERIO[code] };
  }
  return null;
}

/**
 * The INVERSE of the refinement above: every refined code this module can emit,
 * mapped back to its diagnosis key.
 *
 * `refineWho`/`refineCm` are one-way — key + detail produce a code — but an
 * importer sees only the code. The flat reverse maps an importer can build from
 * `DX_CODES` / a pack's `codes` contain the UNREFINED codes only (`K02`,
 * `K02.9`, `K05.30`), so without this table the engine cannot recognise its own
 * DX-8 output on the way back in: a bundle we exported as `K02.52` would be read
 * as "not one of ours" and, with another recognised Condition present, turn the
 * tooth's real caries into a false `suppress`.
 *
 * Kept HERE, beside the tables it inverts, so a new refined code cannot be added
 * without its reverse entry appearing with it.
 */
export const REFINED_WHO_TO_KEY: ReadonlyMap<string, DiagnosisKey> = new Map<string, DiagnosisKey>(
  Object.values(WHO_CARIES).map((r) => [r.code, "caries"]),
);
export const REFINED_CM_TO_KEY: ReadonlyMap<string, DiagnosisKey> = new Map<string, DiagnosisKey>([
  ...Object.values(CM_CARIES).flatMap(
    (byDepth) => Object.values(byDepth).map((r): [string, DiagnosisKey] => [r.code, "caries"]),
  ),
  [CM_PERIO_UNSPECIFIED.code, "periodontitis"] as [string, DiagnosisKey],
  ...Object.keys(CM_PERIO).map((code): [string, DiagnosisKey] => [code, "periodontitis"]),
]);
