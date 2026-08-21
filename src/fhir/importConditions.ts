// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { DX_CODES, type DiagnosisKey } from "../dx/codes";
import { CASE_DX_CODES, LATERALIZABLE_CASE_KEYS, VALID_LATERALITY, type CaseConditionKey, type Laterality } from "../dx/caseCodes";
import { deriveDentalDiagnoses } from "../dx/derive";
import { ICD10_SYSTEM, LOCAL_SYSTEM } from "./codesystems";

/** Tooth-level add/suppress catalog — MUST equal odontogram.ts `TOOTH_LEVEL_DX_KEYS`
 *  (drift-guarded by a test). Derived locally to avoid a fromFhir -> odontogram.ts
 *  back-dependency. Excludes the whole-mouth perio + uncoded peri-implant keys, so
 *  the override diff can never infer a false suppress from those. */
const CATALOG: Set<string> = new Set(
  (Object.keys(DX_CODES) as DiagnosisKey[]).filter(
    (k) => k !== "periodontitis" && k !== "gingivitis" && k !== "periImplantMucositis" && k !== "periImplantitis"),
);

// reverse WHO ICD-10 code -> key maps (fallback when an id doesn't match our convention)
const ICD10_TO_DX_KEY: Record<string, DiagnosisKey> = {};
for (const k of Object.keys(DX_CODES) as DiagnosisKey[]) { const c = DX_CODES[k].icd10; if (c) ICD10_TO_DX_KEY[c] = k; }
const ICD10_TO_CASE_KEY: Record<string, CaseConditionKey> = {};
for (const k of Object.keys(CASE_DX_CODES) as CaseConditionKey[]) ICD10_TO_CASE_KEY[CASE_DX_CODES[k].icd10] = k;

interface CondLike {
  id?: unknown;
  code?: { coding?: Array<{ system?: string; code?: string }> };
  bodySite?: Array<{ coding?: Array<{ system?: string; code?: string }> }>;
}

const icd10Of = (c: CondLike): string | undefined =>
  c.code?.coding?.find((x) => x.system === ICD10_SYSTEM && typeof x.code === "string")?.code;

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
    if (m && m[1] in CASE_DX_CODES) key = m[1];
    else { const code = icd10Of(c); if (code && ICD10_TO_CASE_KEY[code]) key = ICD10_TO_CASE_KEY[code]; }
    if (!key) continue;
    let lat: Laterality = "unspecified";
    const local = c.bodySite?.[0]?.coding?.find(
      (x) => x.system === LOCAL_SYSTEM && typeof x.code === "string" && x.code.startsWith("laterality:"))?.code;
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
      const code = icd10Of(c); const k = code ? ICD10_TO_DX_KEY[code] : undefined;
      const fdi = c.bodySite?.[0]?.coding?.find((x) => typeof x.code === "string" && /^\d{2}$/.test(x.code))?.code;
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
    (raw[String(d.toothNo)] ??= new Set()).add(d.key);
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
