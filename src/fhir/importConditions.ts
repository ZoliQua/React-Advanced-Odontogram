// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { DX_CODES, type DiagnosisKey } from "../dx/codes";
import { CASE_DX_CODES, LATERALIZABLE_CASE_KEYS, VALID_CASE_KEY, VALID_LATERALITY, type CaseConditionKey, type Laterality } from "../dx/caseCodes";
import { deriveDentalDiagnoses } from "../dx/derive";
import { ICD10CM_PACK } from "../dx/packs";
import { ICD10_SYSTEM, LOCAL_SYSTEM, SNOMED_SYSTEM } from "./codesystems";

/** Tooth-level add/suppress catalog — MUST equal odontogram.ts `TOOTH_LEVEL_DX_KEYS`
 *  (drift-guarded by a test). Derived locally to avoid a fromFhir -> odontogram.ts
 *  back-dependency. Excludes the whole-mouth perio + uncoded peri-implant keys, so
 *  the override diff can never infer a false suppress from those. Exported so the
 *  drift-guard test can assert real equality against the odontogram.ts export. */
export const CATALOG: Set<string> = new Set(
  (Object.keys(DX_CODES) as DiagnosisKey[]).filter(
    (k) => k !== "periodontitis" && k !== "gingivitis" && k !== "periImplantMucositis" && k !== "periImplantitis"),
);

// reverse WHO ICD-10 code -> key maps (fallback when an id doesn't match our convention).
// Map (not a plain object) -- a plain-object lookup for a code like "toString"/
// "constructor" would return an inherited Object.prototype value instead of
// undefined; Map.get() has no prototype-chain hazard.
const ICD10_TO_DX_KEY = new Map<string, DiagnosisKey>();
for (const k of Object.keys(DX_CODES) as DiagnosisKey[]) { const c = DX_CODES[k].icd10; if (c) ICD10_TO_DX_KEY.set(c, k); }
const ICD10_TO_CASE_KEY = new Map<string, CaseConditionKey>();
for (const k of Object.keys(CASE_DX_CODES) as CaseConditionKey[]) ICD10_TO_CASE_KEY.set(CASE_DX_CODES[k].icd10, k);

interface CondLike {
  id?: unknown;
  code?: { coding?: Array<{ system?: string; code?: string } | null | undefined> };
  bodySite?: Array<{ coding?: Array<{ system?: string; code?: string } | null | undefined> }>;
}

const codeOf = (c: CondLike, system: string): string | undefined =>
  c.code?.coding?.find((x) => !!x && x.system === system && typeof x.code === "string")?.code;

/** Code → key: exact match first, then the 3-character category (DX-8 emits
 *  refined subcodes such as K02.1 / K02.52 for `caries`; exact keys like
 *  K02.2/K02.3 keep winning because they are looked up before the fallback). */
function lookup<K>(map: Map<string, K>, code: string | undefined): K | undefined {
  if (!code) return undefined;
  return map.get(code) ?? map.get(code.split(".")[0]);
}

// DX-9 external-bundle tolerance: reverse maps for ICD-10-CM (from the CM pack)
// and SNOMED CT (from the catalog), consulted after WHO ICD-10.
const CM_TO_DX_KEY = new Map<string, DiagnosisKey>();
for (const [k, v] of Object.entries(ICD10CM_PACK.codes ?? {})) if (v) CM_TO_DX_KEY.set(v.code, k as DiagnosisKey);
const CM_TO_CASE_KEY = new Map<string, CaseConditionKey>();
for (const [k, v] of Object.entries(ICD10CM_PACK.caseCodes ?? {})) if (v) CM_TO_CASE_KEY.set(v.code, k as CaseConditionKey);
const SNOMED_TO_DX_KEY = new Map<string, DiagnosisKey>();
for (const k of Object.keys(DX_CODES) as DiagnosisKey[]) { const s = DX_CODES[k].snomed; if (s) SNOMED_TO_DX_KEY.set(s, k); }

/** A tooth-level Condition's diagnosis key from its codings: WHO ICD-10 → ICD-10-CM → SNOMED CT. */
const dxKeyOf = (c: CondLike): DiagnosisKey | undefined =>
  lookup(ICD10_TO_DX_KEY, codeOf(c, ICD10_SYSTEM))
  ?? lookup(CM_TO_DX_KEY, codeOf(c, ICD10CM_PACK.system))
  ?? SNOMED_TO_DX_KEY.get(codeOf(c, SNOMED_SYSTEM) ?? "");
/** A case-level Condition's key from its codings: WHO ICD-10 → ICD-10-CM. */
const caseKeyOf = (c: CondLike): CaseConditionKey | undefined =>
  lookup(ICD10_TO_CASE_KEY, codeOf(c, ICD10_SYSTEM)) ?? lookup(CM_TO_CASE_KEY, codeOf(c, ICD10CM_PACK.system));

export interface ImportedDiagnoses {
  caseConditions: Record<string, Laterality>;
  dxOverridesByTooth: Record<string, Record<string, "add" | "suppress">>;
}

export function importDiagnosisConditions(entries: unknown, teeth: Record<string, unknown>): ImportedDiagnoses {
  const caseConditions: Record<string, Laterality> = {};
  const dxOverridesByTooth: Record<string, Record<string, "add" | "suppress">> = {};

  const conditions: CondLike[] = Array.isArray(entries)
    ? entries.map((e) => (e as { resource?: unknown })?.resource).filter((r): r is CondLike =>
        !!r && typeof r === "object" && (r as { resourceType?: string }).resourceType === "Condition")
    : [];
  if (conditions.length === 0) return { caseConditions, dxOverridesByTooth };

  // --- case conditions (direct read) ---
  for (const c of conditions) {
    const id = typeof c.id === "string" ? c.id : "";
    let key: string | undefined;
    const m = /^odontogram-case-([A-Za-z]+)$/.exec(id);
    if (m && VALID_CASE_KEY.has(m[1] as CaseConditionKey)) key = m[1];
    else { const mapped = caseKeyOf(c); if (mapped) key = mapped; }
    if (!key) continue;
    let lat: Laterality = "unspecified";
    const local = c.bodySite?.[0]?.coding?.find(
      (x) => !!x && x.system === LOCAL_SYSTEM && typeof x.code === "string" && x.code.startsWith("laterality:"))?.code;
    if (local) { const v = local.slice("laterality:".length); if (VALID_LATERALITY.has(v as Laterality)) lat = v as Laterality; }
    if (!LATERALIZABLE_CASE_KEYS.has(key as CaseConditionKey)) lat = "unspecified";
    caseConditions[key] = lat;
  }

  // --- dxOverrides: effective set from tooth Conditions (id first, WHO-code+FDI fallback) ---
  const effective: Record<string, Set<string>> = {};
  let sawDentalSection = false;
  for (const c of conditions) {
    const id = typeof c.id === "string" ? c.id : "";
    let key: string | undefined; let tooth: string | undefined;
    const m = /^odontogram-dx-([A-Za-z]+)-(\d+)$/.exec(id);
    if (m) { key = m[1]; tooth = m[2]; }
    else {
      const k = dxKeyOf(c);
      const fdi = c.bodySite?.[0]?.coding?.find((x) => !!x && typeof x.code === "string" && /^\d{2}$/.test(x.code))?.code;
      if (k && fdi) { key = k; tooth = fdi; }
    }
    if (!key || !tooth) continue;
    sawDentalSection = true;                 // Safeguard B: our diagnosis section is present
    if (!CATALOG.has(key)) continue;          // Safeguard A: catalog-only
    (effective[tooth] ??= new Set()).add(key);
  }
  if (!sawDentalSection) return { caseConditions, dxOverridesByTooth };

  // raw derived set from the reconstructed chart, catalog-restricted
  const raw: Record<string, Set<string>> = {};
  for (const d of deriveDentalDiagnoses({ teeth })) {
    if (!CATALOG.has(d.key)) continue;
    (raw[d.toothNo] ??= new Set()).add(d.key);
  }

  for (const t of new Set([...Object.keys(effective), ...Object.keys(raw)])) {
    const eff = effective[t] ?? new Set<string>(); const rw = raw[t] ?? new Set<string>();
    const ov: Record<string, "add" | "suppress"> = {};
    for (const k of eff) if (!rw.has(k)) ov[k] = "add";
    for (const k of rw) if (!eff.has(k)) ov[k] = "suppress";
    if (Object.keys(ov).length > 0) dxOverridesByTooth[t] = ov;
  }
  return { caseConditions, dxOverridesByTooth };
}
