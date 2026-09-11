// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { DX_CODES, type DiagnosisKey } from "./codes";
import type { CariesDetail, CariesDepth, CariesSurfaceType } from "./refine";

export interface DerivedDiagnosis {
  toothNo: string;
  key: DiagnosisKey;
  /** DX-8: code-refinement detail — present on `caries` only (depth/surface, see
   *  {@link deriveCariesDetail}); absent on every other key. */
  detail?: CariesDetail;
}

const RADIO_DEPTH: Record<string, CariesDepth> = { E1: "enamel", E2: "enamel", D1: "dentine", D2: "dentine", D3: "dentine" };
const DEPTH_RANK: Record<CariesDepth, number> = { enamel: 1, dentine: 2 };

/**
 * DX-8 — the most severe caries involvement on a tooth, for ICD refinement.
 * Per carious surface (`caries` ids `caries-<surface>`): radiographic depth
 * first (E1/E2 → enamel, D1–D3 → dentine), else the ICDAS severity
 * (`cariesSeverity` 1–3 → enamel, 4–6 → dentine; 0/absent → unknown). The tooth
 * takes the deepest involvement (dentine > enamel > unknown); the surface type
 * is pit-and-fissure when an occlusal surface is among the deepest, else smooth
 * (mesial/distal/buccal/lingual/subcrown). One Condition per tooth, so one
 * detail per tooth. Pure; tolerant of malformed maps.
 */
export function deriveCariesDetail(rec: Record<string, unknown>): CariesDetail {
  const ids = Array.isArray(rec.caries) ? rec.caries : [];
  const radio = rec.radiographicDepth && typeof rec.radiographicDepth === "object" ? rec.radiographicDepth as Record<string, unknown> : {};
  const sev = rec.cariesSeverity && typeof rec.cariesSeverity === "object" ? rec.cariesSeverity as Record<string, unknown> : {};
  let best: CariesDepth | null = null;
  let bestSurfaces: string[] = [];
  const surfaces: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const surface = id.startsWith("caries-") ? id.slice("caries-".length) : id;
    surfaces.push(surface);
    let depth: CariesDepth | null = RADIO_DEPTH[String(radio[surface])] ?? null;
    if (!depth) {
      const s = sev[surface];
      if (typeof s === "number" && Number.isFinite(s)) depth = s >= 4 ? "dentine" : s >= 1 ? "enamel" : null;
    }
    if (!depth) continue;
    if (!best || DEPTH_RANK[depth] > DEPTH_RANK[best]) { best = depth; bestSurfaces = [surface]; }
    else if (depth === best) bestSurfaces.push(surface);
  }
  const pool = best ? bestSurfaces : surfaces;
  const surface: CariesSurfaceType | null = pool.length === 0 ? null : pool.includes("occlusal") ? "pit-fissure" : "smooth";
  return { depth: best, surface };
}

const ABSENT = new Set(["implant", "none", "tooth-under-gum", "no-tooth-after-extraction"]);
/** Whether a serialized tooth record counts as "naturally present" for
 *  diagnosis derivation (excludes implant/missing/under-gum/extraction-socket).
 *  Exported so callers (e.g. `getActiveDiagnoses` in odontogram.ts) can gate a
 *  view-model on the exact same presence rule the derivation itself uses. */
export function isNaturalPresent(rec: { toothSelection?: unknown }): boolean {
  const s = rec?.toothSelection;
  return s === undefined || s === null || !ABSENT.has(String(s));
}

// enum-value -> diagnosis key tables (hard-tissue & status axes for Task 2)
const ENUM_RULES: Record<string, Record<string, DiagnosisKey>> = {
  rootCaries: { active: "cariesCementum", "active-cavitated": "cariesCementum", arrested: "cariesArrested" },
  wearEdge: { attrition: "attrition", erosion: "erosion" },
  wearCervical: { abrasion: "abrasion", erosion: "erosion", abfraction: "abfraction" },
  resorptionType: { internal: "resorption", "external-cervical": "resorption" },
  discoloration: { fluorosis: "fluorosis", tetracycline: "tetracyclineStain", nonvital: "postEruptiveColour", extrinsic: "postEruptiveColour", other: "postEruptiveColour" },
};

// Pulp (K04.0/.1) and apical (K04.4-.9) enum-value -> diagnosis key tables (hoisted out of the per-tooth loop)
const PULP: Record<string, DiagnosisKey> = { "reversible-pulpitis": "pulpitis", "irreversible-pulpitis": "pulpitis", necrosis: "pulpNecrosis" };
const APICAL: Record<string, DiagnosisKey> = {
  "symptomatic-apical-periodontitis": "apicalPeriodontitisAcute",
  "asymptomatic-apical-periodontitis": "apicalPeriodontitisChronic",
  "acute-apical-abscess": "periapicalAbscess",
  "chronic-apical-abscess": "periapicalAbscessSinus",
  "condensing-osteitis": "condensingOsteitis",
};
// Peri-implant disease (implant-only). No WHO ICD-10 code -> surfaced uncoded (DX-3a).
const PERIIMPLANT: Record<string, DiagnosisKey> = {
  mucositis: "periImplantMucositis",
  "peri-implantitis-mild": "periImplantitis",
  "peri-implantitis-moderate": "periImplantitis",
  "peri-implantitis-severe": "periImplantitis",
};

const ALL_DX_KEYS = new Set(Object.keys(DX_CODES) as DiagnosisKey[]);

export type DxOverrideMode = "add" | "suppress";

/** Apply a tooth's dxOverrides to its derived key set: `suppress` removes a key,
 *  `add` includes a valid tooth-level key. Unknown keys / invalid modes ignored.
 *  `allowAdd` (default `true`) gates the `add` branch only -- `suppress` always
 *  applies -- so a caller can forbid injecting a tooth-level diagnosis onto a
 *  non-present tooth while still letting `suppress` un-code a derived finding
 *  (e.g. `toothLoss`) there. */
export function applyDxOverrides(keys: Set<DiagnosisKey>, overrides: Record<string, unknown> | undefined, allowAdd = true): Set<DiagnosisKey> {
  if (!overrides || typeof overrides !== "object") return keys;
  for (const [k, mode] of Object.entries(overrides)) {
    if (!ALL_DX_KEYS.has(k as DiagnosisKey)) continue;
    if (mode === "suppress") keys.delete(k as DiagnosisKey);
    else if (mode === "add" && allowAdd) keys.add(k as DiagnosisKey);
  }
  return keys;
}

/**
 * Pure derivation of coded dental diagnoses from a serialized export payload.
 * DX-0 covered caries only. DX-1 adds root caries, tooth wear, resorption,
 * calculus, discoloration, tooth loss, and retained root -- all gated by
 * `isNaturalPresent` except the tooth-status findings, which have their own
 * presence semantics. No dependency on odontogram.ts, so it is deterministic
 * and callable from either live state (via a serialized snapshot) or an
 * exported payload.
 */
export function deriveDentalDiagnoses(payload: unknown): DerivedDiagnosis[] {
  const teeth = (payload as { teeth?: Record<string, Record<string, unknown>> } | null)?.teeth;
  if (!teeth || typeof teeth !== "object") return [];
  const out: DerivedDiagnosis[] = [];
  for (const [toothNo, rec] of Object.entries(teeth)) {
    if (!rec || typeof rec !== "object") continue;
    const keys = new Set<DiagnosisKey>(); // dedup per tooth
    const add = (k: DiagnosisKey) => keys.add(k);
    const natural = isNaturalPresent(rec);

    // Tooth-status findings (their own presence semantics)
    if (rec.toothSelection === "no-tooth-after-extraction") add("toothLoss");
    if (rec.toothSubstrate === "radix" && rec.toothSelection !== "no-tooth-after-extraction") add("retainedRoot");
    // Peri-implant disease — implant-only; keys are uncoded (no WHO ICD-10)
    if (rec.toothSelection === "implant") {
      const pi = PERIIMPLANT[String(rec.periImplant)];
      if (pi) add(pi);
    }

    if (natural) {
      if (Array.isArray(rec.caries) && rec.caries.length > 0) add("caries"); // DX-0, now gated
      for (const [field, table] of Object.entries(ENUM_RULES)) {
        const key = table[String(rec[field])];
        if (key) add(key);
      }
      if (rec.calculus === true) add("calculus");
      // Pulp (K04.0/.1)
      const pulp = PULP[String(rec.pulpDx)];
      if (pulp) add(pulp);
      // Apical (K04.4-.9); a cyst lesion subtype overrides the periodontitis code
      if (rec.periapicalType === "cyst") {
        add("radicularCyst");
      } else {
        const apical = APICAL[String(rec.apicalDx)];
        if (apical) add(apical);
      }
      // Fracture (K/S02.5) — same broken-crown predicate as fractureSummaryLabel
      if (rec.brokenMesial || rec.brokenIncisal || rec.brokenDistal) add("toothFracture");
    }
    applyDxOverrides(keys, rec.dxOverrides as Record<string, unknown> | undefined, natural);
    for (const key of keys) {
      if (key === "caries") out.push({ toothNo, key, detail: deriveCariesDetail(rec) }); // DX-8 refinement detail
      else out.push({ toothNo, key });
    }
  }
  return out;
}
