// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, Condition, CodeableConcept, OdontogramExportPayload, FhirExportOptions } from "./types";
import { ICD10_SYSTEM, LOCAL_SYSTEM } from "./codesystems";
import { PLACEHOLDER_PATIENT_FULLURL } from "./primitives";
import type { CodingPack } from "../dx/packs";
import { CASE_DX_CODES, LATERALIZABLE_CASE_KEYS, VALID_LATERALITY, type CaseConditionKey, type Laterality } from "../dx/caseCodes";

const LATERALITY_DISPLAY: Record<Exclude<Laterality, "unspecified">, string> = {
  left: "Left", right: "Right", bilateral: "Bilateral",
};

/** `Condition.code` for a case condition: WHO ICD-10 base + (for a translation
 *  pack, e.g. BNO-10) the same code under the pack's system, using the pack's
 *  localized case display (`pack.caseDisplays`) when available. */
export function buildCaseConditionCode(key: CaseConditionKey, pack?: CodingPack): CodeableConcept {
  const base = CASE_DX_CODES[key];
  const coding: NonNullable<CodeableConcept["coding"]> = [
    { system: ICD10_SYSTEM, code: base.icd10, display: base.icd10Display },
  ];
  if (pack) {
    if (pack.kind === "modification") {
      const m = pack.caseCodes?.[key];
      if (m) coding.push({ system: pack.system, code: m.code, display: m.display });
    } else {
      coding.push({ system: pack.system, code: base.icd10, display: pack.caseDisplays?.[key] ?? base.icd10Display });
    }
  }
  return { coding, text: base.icd10Display };
}

/** Append one patient-level `Condition` per active case condition. Iterates in
 *  `CASE_DX_CODES` order for deterministic output. Laterality (when not
 *  "unspecified") rides on a `bodySite` engine-local code (SNOMED body-structure
 *  in DX-6). No tooth/FDI bodySite — these are not tooth-linked. */
export function appendCaseConditions(bundle: Bundle, payload: OdontogramExportPayload, options: FhirExportOptions = {}): void {
  const caseRaw = (payload && typeof payload === "object" ? (payload as { case?: unknown }).case : undefined) as Record<string, unknown> | undefined;
  const conds = caseRaw?.caseConditions as Record<string, unknown> | undefined;
  if (!conds || typeof conds !== "object") return;
  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  if (!bundle.entry) bundle.entry = [];
  for (const key of Object.keys(CASE_DX_CODES) as CaseConditionKey[]) {
    const raw = conds[key];
    if (raw === undefined) continue;
    if (typeof raw !== "string" || !VALID_LATERALITY.has(raw as Laterality)) continue;
    const laterality: Laterality = LATERALIZABLE_CASE_KEYS.has(key) ? (raw as Laterality) : "unspecified";
    const id = `odontogram-case-${key}`;
    const condition: Condition = {
      resourceType: "Condition",
      id,
      code: buildCaseConditionCode(key, options.codingPack),
      subject: { reference: subjectRef },
    };
    if (laterality !== "unspecified") {
      condition.bodySite = [{ coding: [{ system: LOCAL_SYSTEM, code: `laterality:${laterality}`, display: LATERALITY_DISPLAY[laterality] }] }];
    }
    bundle.entry.push({ fullUrl: `urn:uuid:${id}`, resource: condition });
  }
}
