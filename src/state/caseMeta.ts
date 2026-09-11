// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Case-level metadata — the engine's one case-scoped (NOT per-tooth, NOT
 * dual-state) object: patient identity and context, the periodontal risk
 * factors, the 2017-classification overrides and the case/regional diagnoses,
 * with their validating setters, the payload serialize/hydrate pair and the
 * summary fragments. Extracted from odontogram.ts; it reaches the rest of the
 * engine only through `notifyStateChange`, so there is no cycle.
 *
 * `caseMeta` is exported as a live binding: odontogram.ts READS it (and mutates
 * its properties through the setters here); only `resetCaseMeta()` rebinds it,
 * and an ES module live binding propagates that to every importer.
 *
 * odontogram.ts re-exports every previously public name, so the public API
 * surface is unchanged.
 */

import { t } from "../i18n/useI18n";
import { notifyStateChange } from "./notify";
import { CASE_DX_CODES, LATERALIZABLE_CASE_KEYS, VALID_CASE_KEY, VALID_LATERALITY, type CaseConditionKey, type Laterality } from "../dx/caseCodes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors the engine-wide `Any` alias
type Any = any;

// ---- Case-level metadata object -------------------------------------------
// A single SHARED module-level record
// (NOT per-tooth, NOT part of the status/plan dual-state) for chart-independent
// case context — patient age, smoking, diabetes/HbA1c, and perio summary stats
// (tooth loss attributable to periodontitis, max radiographic bone loss %).
// Mirrors the existing top-level `globals` payload key: one shared block,
// serialized once into the payload's top-level `case` key (omit-when-empty),
// hydrated in the shared `hydrateImportedCharts` data-path used by both
// `importStatus()` and `__hydrateImportedChartsForTest()`.
type CaseMeta = {
  age: number | null;
  smokingStatus: "unknown" | "never" | "former" | "current";
  cigarettesPerDay: number | null;
  diabetesStatus: "unknown" | "none" | "present";
  hba1c: number | null;
  toothLossPerio: number | null;
  maxRblPercent: number | null;
  /** Per-axis clinician overrides for the 2017 World Workshop periodontal
   *  classification (`getPerioClassification()`). Each is either a valid enum
   *  value for that axis or `null` (not overridden — the derived value from
   *  `derivePerioClassification` wins). Shared caseMeta fields, not gated. */
  diagnosisOverride: string | null;
  stageOverride: string | null;
  gradeOverride: string | null;
  extentOverride: string | null;
  /** PDF-report identity — patient display name + exam date (ISO
   *  `YYYY-MM-DD`). caseMeta fields; NOT emitted to FHIR. */
  patientName: string | null;
  /** Patient date of birth (ISO `YYYY-MM-DD`). PDF-report identity only, like
   *  patientName/examDate; NOT emitted to FHIR. */
  patientDob: string | null;
  examDate: string | null;
  /** Case-level regional conditions (K07/K09/K11/K12/K00/K13), each with an
   *  optional laterality. Manually authored, not derived. */
  caseConditions: Map<string, Laterality>;
};
function defaultCaseMeta(): CaseMeta {
  return { age: null, smokingStatus: "unknown", cigarettesPerDay: null,
    diabetesStatus: "unknown", hba1c: null, toothLossPerio: null, maxRblPercent: null,
    diagnosisOverride: null, stageOverride: null, gradeOverride: null, extentOverride: null,
    patientName: null, patientDob: null, examDate: null,
    caseConditions: new Map() };
}
export let caseMeta: CaseMeta = defaultCaseMeta();
const VALID_SMOKING = new Set(["unknown", "never", "former", "current"]);
const VALID_DIABETES = new Set(["unknown", "none", "present"]);
/** Valid enum values for the four classification override axes — mirrors
 *  `PerioDiagnosis`/`PerioStage`/`PerioGrade`/`PerioExtent` in
 *  `perioClassification.ts` MINUS their non-authorable derived-only values
 *  (`"na"`, `"indeterminate"`) — an override always names a concrete clinical
 *  value, never one of those computed placeholders. */
const VALID_DIAGNOSIS = new Set(["health", "gingivitis", "periodontitis"]);
const VALID_STAGE = new Set(["I", "II", "III", "IV"]);
const VALID_GRADE = new Set(["A", "B", "C"]);
const VALID_EXTENT = new Set(["localized", "generalized", "molar-incisor"]);
function clampInt(v: unknown, lo: number, hi: number): number | null {
  const n = Number(v);
  if(!Number.isFinite(n)) return null;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}
function setNumField(cur: number | null, v: unknown, lo: number, hi: number): number | null {
  // non-finite (bad keystroke) is a no-op: keep current; explicit null clears.
  if(v === null) return null;
  const c = clampInt(v, lo, hi);
  return c === null ? cur : c;
}
/** Current shared case-level metadata (age/smoking/diabetes/HbA1c/perio
 *  summary stats). Not part of the status/plan dual-state — chart-independent. */
export function getCaseMeta(): CaseMeta { return { ...caseMeta }; }
export function setCaseAge(v: number | null): void { const n = setNumField(caseMeta.age, v, 0, 120); if(n !== caseMeta.age){ caseMeta.age = n; notifyStateChange(); } }
export function setCigarettesPerDay(v: number | null): void { const n = setNumField(caseMeta.cigarettesPerDay, v, 0, 99); if(n !== caseMeta.cigarettesPerDay){ caseMeta.cigarettesPerDay = n; notifyStateChange(); } }
export function setToothLossPerio(v: number | null): void { const n = setNumField(caseMeta.toothLossPerio, v, 0, 32); if(n !== caseMeta.toothLossPerio){ caseMeta.toothLossPerio = n; notifyStateChange(); } }
export function setMaxRblPercent(v: number | null): void { const n = setNumField(caseMeta.maxRblPercent, v, 0, 100); if(n !== caseMeta.maxRblPercent){ caseMeta.maxRblPercent = n; notifyStateChange(); } }
export function setHba1c(v: number | null): void {
  // one-decimal % in 3.0–20.0; non-finite no-op, null clears.
  if(v === null){ if(caseMeta.hba1c !== null){ caseMeta.hba1c = null; notifyStateChange(); } return; }
  const n = Number(v);
  if(!Number.isFinite(n)) return;
  const clamped = Math.max(3, Math.min(20, Math.round(n * 10) / 10));
  if(clamped !== caseMeta.hba1c){ caseMeta.hba1c = clamped; notifyStateChange(); }
}
export function setSmokingStatus(v: string): void { if(VALID_SMOKING.has(v) && v !== caseMeta.smokingStatus){ caseMeta.smokingStatus = v as CaseMeta["smokingStatus"]; notifyStateChange(); } }
export function setDiabetesStatus(v: string): void { if(VALID_DIABETES.has(v) && v !== caseMeta.diabetesStatus){ caseMeta.diabetesStatus = v as CaseMeta["diabetesStatus"]; notifyStateChange(); } }
/** Per-axis classification override setters. Each accepts either a valid enum
 *  value for that axis (see `VALID_DIAGNOSIS`/`VALID_STAGE`/`VALID_GRADE`/
 *  `VALID_EXTENT`) OR `null` (clears the override, reverting that axis to the
 *  derived value). An invalid non-null value is a silent no-op. Shared caseMeta
 *  fields, not gated. */
export function setDiagnosisOverride(v: string | null): void {
  if(v === null){ if(caseMeta.diagnosisOverride !== null){ caseMeta.diagnosisOverride = null; notifyStateChange(); } return; }
  if(VALID_DIAGNOSIS.has(v) && v !== caseMeta.diagnosisOverride){ caseMeta.diagnosisOverride = v; notifyStateChange(); }
}
export function setStageOverride(v: string | null): void {
  if(v === null){ if(caseMeta.stageOverride !== null){ caseMeta.stageOverride = null; notifyStateChange(); } return; }
  if(VALID_STAGE.has(v) && v !== caseMeta.stageOverride){ caseMeta.stageOverride = v; notifyStateChange(); }
}
export function setGradeOverride(v: string | null): void {
  if(v === null){ if(caseMeta.gradeOverride !== null){ caseMeta.gradeOverride = null; notifyStateChange(); } return; }
  if(VALID_GRADE.has(v) && v !== caseMeta.gradeOverride){ caseMeta.gradeOverride = v; notifyStateChange(); }
}
export function setExtentOverride(v: string | null): void {
  if(v === null){ if(caseMeta.extentOverride !== null){ caseMeta.extentOverride = null; notifyStateChange(); } return; }
  if(VALID_EXTENT.has(v) && v !== caseMeta.extentOverride){ caseMeta.extentOverride = v; notifyStateChange(); }
}
/** Patient display name + exam date setters. Follow the caseMeta setter
 *  pattern — trim, `null` clears, malformed exam-date values are a silent
 *  no-op. */
export function setPatientName(v: string | null): void {
  const next = (v === null) ? null : (v.trim() === "" ? null : v.trim());
  if(next !== caseMeta.patientName){ caseMeta.patientName = next; notifyStateChange(); }
}
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export function setExamDate(v: string | null): void {
  if(v === null){ if(caseMeta.examDate !== null){ caseMeta.examDate = null; notifyStateChange(); } return; }
  if(v.trim() === ""){ if(caseMeta.examDate !== null){ caseMeta.examDate = null; notifyStateChange(); } return; }
  if(!ISO_DATE.test(v.trim())) return;  // malformed → no-op (mirrors setSmokingStatus)
  const next = v.trim();
  if(next !== caseMeta.examDate){ caseMeta.examDate = next; notifyStateChange(); }
}
/** Patient date-of-birth setter — same ISO-validate/null-clear contract as
 *  {@link setExamDate}; malformed values are a silent no-op. */
export function setPatientDob(v: string | null): void {
  if(v === null){ if(caseMeta.patientDob !== null){ caseMeta.patientDob = null; notifyStateChange(); } return; }
  if(v.trim() === ""){ if(caseMeta.patientDob !== null){ caseMeta.patientDob = null; notifyStateChange(); } return; }
  if(!ISO_DATE.test(v.trim())) return;  // malformed → no-op
  const next = v.trim();
  if(next !== caseMeta.patientDob){ caseMeta.patientDob = next; notifyStateChange(); }
}
export function resetCaseMeta(): void { caseMeta = defaultCaseMeta(); }
/** Active case conditions in catalog order, for the UI + summary. */
export function getCaseConditions(): { key: CaseConditionKey; icd10: string; laterality: Laterality; lateralizable: boolean }[] {
  const out: { key: CaseConditionKey; icd10: string; laterality: Laterality; lateralizable: boolean }[] = [];
  for(const key of Object.keys(CASE_DX_CODES) as CaseConditionKey[]){
    const lat = caseMeta.caseConditions.get(key);
    if(lat === undefined) continue;
    out.push({ key, icd10: CASE_DX_CODES[key].icd10, laterality: lat, lateralizable: CASE_DX_CODES[key].lateralizable });
  }
  // Code-sorted (catalog order jumps chapters — e.g. K00.x sits after K12.x),
  // matching the Diagnoses card + the case-diagnoses list/summary.
  out.sort((a, b) => a.icd10.localeCompare(b.icd10));
  return out;
}
/** Add/update-laterality/remove one case condition. `null` removes; a
 *  non-lateralizable key is forced to "unspecified"; invalid key/laterality is
 *  a silent no-op. Case-level (not DS-1 gated), like the rest of CaseMeta. */
export function setCaseCondition(key: string, laterality: Laterality | null): void {
  if(!VALID_CASE_KEY.has(key as CaseConditionKey)) return;
  if(laterality === null){ if(caseMeta.caseConditions.delete(key)) notifyStateChange(); return; }
  if(!VALID_LATERALITY.has(laterality)) return;
  const lat: Laterality = LATERALIZABLE_CASE_KEYS.has(key as CaseConditionKey) ? laterality : "unspecified";
  if(caseMeta.caseConditions.get(key) !== lat){ caseMeta.caseConditions.set(key, lat); notifyStateChange(); }
}
export function caseMetaIsEmpty(c: CaseMeta): boolean {
  return c.age === null && c.smokingStatus === "unknown" && c.cigarettesPerDay === null
    && c.diabetesStatus === "unknown" && c.hba1c === null && c.toothLossPerio === null && c.maxRblPercent === null
    && c.diagnosisOverride === null && c.stageOverride === null && c.gradeOverride === null && c.extentOverride === null
    && c.patientName === null && c.patientDob === null && c.examDate === null
    && c.caseConditions.size === 0;
}
export function serializeCaseMeta(c: CaseMeta): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  if(c.age !== null) o.age = c.age;
  if(c.smokingStatus !== "unknown") o.smokingStatus = c.smokingStatus;
  if(c.cigarettesPerDay !== null) o.cigarettesPerDay = c.cigarettesPerDay;
  if(c.diabetesStatus !== "unknown") o.diabetesStatus = c.diabetesStatus;
  if(c.hba1c !== null) o.hba1c = c.hba1c;
  if(c.toothLossPerio !== null) o.toothLossPerio = c.toothLossPerio;
  if(c.maxRblPercent !== null) o.maxRblPercent = c.maxRblPercent;
  if(c.diagnosisOverride !== null) o.diagnosisOverride = c.diagnosisOverride;
  if(c.stageOverride !== null) o.stageOverride = c.stageOverride;
  if(c.gradeOverride !== null) o.gradeOverride = c.gradeOverride;
  if(c.extentOverride !== null) o.extentOverride = c.extentOverride;
  if(c.patientName !== null) o.patientName = c.patientName;
  if(c.patientDob !== null) o.patientDob = c.patientDob;
  if(c.examDate !== null) o.examDate = c.examDate;
  if(c.caseConditions.size > 0) o.caseConditions = Object.fromEntries(c.caseConditions);
  return o;
}
export function hydrateCaseMeta(raw: Any): void {
  caseMeta = defaultCaseMeta();
  if(!raw || typeof raw !== "object") return;
  caseMeta.age = clampInt(raw.age, 0, 120);
  if(VALID_SMOKING.has(raw.smokingStatus)) caseMeta.smokingStatus = raw.smokingStatus;
  caseMeta.cigarettesPerDay = clampInt(raw.cigarettesPerDay, 0, 99);
  if(VALID_DIABETES.has(raw.diabetesStatus)) caseMeta.diabetesStatus = raw.diabetesStatus;
  { const n = Number(raw.hba1c); caseMeta.hba1c = Number.isFinite(n) ? Math.max(3, Math.min(20, Math.round(n * 10) / 10)) : null; }
  caseMeta.toothLossPerio = clampInt(raw.toothLossPerio, 0, 32);
  caseMeta.maxRblPercent = clampInt(raw.maxRblPercent, 0, 100);
  caseMeta.diagnosisOverride = VALID_DIAGNOSIS.has(raw.diagnosisOverride) ? raw.diagnosisOverride : null;
  caseMeta.stageOverride = VALID_STAGE.has(raw.stageOverride) ? raw.stageOverride : null;
  caseMeta.gradeOverride = VALID_GRADE.has(raw.gradeOverride) ? raw.gradeOverride : null;
  caseMeta.extentOverride = VALID_EXTENT.has(raw.extentOverride) ? raw.extentOverride : null;
  caseMeta.patientName = (typeof raw.patientName === "string" && raw.patientName.trim() !== "") ? raw.patientName.trim() : null;
  caseMeta.patientDob = (typeof raw.patientDob === "string" && ISO_DATE.test(raw.patientDob.trim())) ? raw.patientDob.trim() : null;
  caseMeta.examDate = (typeof raw.examDate === "string" && ISO_DATE.test(raw.examDate.trim())) ? raw.examDate.trim() : null;
  caseMeta.caseConditions = new Map();
  if(raw.caseConditions && typeof raw.caseConditions === "object"){
    for(const [k, v] of Object.entries(raw.caseConditions)){
      if(!VALID_CASE_KEY.has(k as CaseConditionKey)) continue;
      if(typeof v !== "string" || !VALID_LATERALITY.has(v as Laterality)) continue;
      caseMeta.caseConditions.set(k, LATERALIZABLE_CASE_KEYS.has(k as CaseConditionKey) ? (v as Laterality) : "unspecified");
    }
  }
}
/** Builds the compact, labelled case-context fragment
 *  (e.g. "Age 54 · current smoker (12/day) · diabetic (HbA1c 7.8%) · max
 *  RBL 45% · 3 teeth lost to perio") appended to {@link getOdontogramSummary}'s
 *  `periodontalText` whenever `!caseMetaIsEmpty(caseMeta)`. Skips any field
 *  still at its default (age null, smoking/diabetes "unknown") — never claims
 *  a case fact that wasn't actually charted. */
export function caseContextSummaryFragment(c: CaseMeta): string {
  const parts: string[] = [];
  if(c.age !== null) parts.push(t("case.summary.age", { age: c.age }));
  if(c.smokingStatus === "never") parts.push(t("case.summary.smokingNever"));
  else if(c.smokingStatus === "former") parts.push(t("case.summary.smokingFormer"));
  else if(c.smokingStatus === "current"){
    parts.push(c.cigarettesPerDay !== null
      ? t("case.summary.smokingCurrentCigs", { n: c.cigarettesPerDay })
      : t("case.summary.smokingCurrent"));
  }
  if(c.diabetesStatus === "none") parts.push(t("case.summary.diabetesNone"));
  else if(c.diabetesStatus === "present"){
    parts.push(c.hba1c !== null
      ? t("case.summary.diabetesPresentHba1c", { value: c.hba1c })
      : t("case.summary.diabetesPresent"));
  }
  if(c.maxRblPercent !== null) parts.push(t("case.summary.rbl", { value: c.maxRblPercent }));
  if(c.toothLossPerio !== null){
    parts.push(t(`case.summary.toothLoss${c.toothLossPerio === 1 ? "One" : "Other"}`, { n: c.toothLossPerio }));
  }
  return parts.join(" · ");
}
/** Builds the labelled whole-mouth case/regional-diagnoses fragment (e.g.
 *  "Case / regional diagnoses: Temporomandibular joint disorder (K07.6) [Right];
 *  Recurrent oral aphthae (K12.0)") appended to {@link getOdontogramSummary}'s
 *  `periodontalText` whenever at least one case condition is active. Returns
 *  `null` when there are none — independent of {@link caseMetaIsEmpty}, since a
 *  case can carry conditions with no other case metadata charted. */
export function caseDiagnosesSummaryFragment(): string | null {
  const conds = getCaseConditions();
  if(conds.length === 0) return null;
  const parts = conds.map((c) => {
    const lat = (c.lateralizable && c.laterality !== "unspecified") ? ` [${t(`caseDx.laterality.${c.laterality}`)}]` : "";
    // Code-first, matching the Diagnoses card + the case-diagnoses list rows.
    return `${c.icd10 ? c.icd10 + " " : ""}${t(`dx.case.${c.key}`)}${lat}`;
  });
  return `${t("case.diagnoses.section")}: ${parts.join("; ")}`;
}
