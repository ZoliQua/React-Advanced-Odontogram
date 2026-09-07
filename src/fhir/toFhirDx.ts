// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, Condition, CodeableConcept, OdontogramExportPayload, FhirExportOptions } from "./types";
import { ICD10_SYSTEM, FDI_SYSTEM, SNOMED_SYSTEM } from "./codesystems";
import { PLACEHOLDER_PATIENT_FULLURL, fhirFullUrl } from "./primitives";
import { DX_CODES, type DiagnosisKey } from "../dx/codes";
import { packCoding, type CodingPack } from "../dx/packs";
import { deriveDentalDiagnoses } from "../dx/derive";
import { toothBodySiteCode } from "./iso3950";

/**
 * The `Condition.code` for a diagnosis: the WHO ICD-10 base coding (always) plus,
 * when a national pack is active, the pack's coding (translation packs keep the
 * same code, modification packs remap it). Extended with a SNOMED coding in DX-6.
 */
export function buildConditionCode(key: DiagnosisKey, pack?: CodingPack, snomed = false): CodeableConcept | null {
  const base = DX_CODES[key];
  const coding: NonNullable<CodeableConcept["coding"]> = [];
  if (base.icd10) {
    coding.push({ system: ICD10_SYSTEM, code: base.icd10, display: base.icd10Display });
    if (pack) {
      const extra = packCoding(pack, key, base.icd10, base.icd10Display);
      if (extra) coding.push(extra);
    }
  }
  if (snomed && base.snomed) coding.push({ system: SNOMED_SYSTEM, code: base.snomed, display: base.icd10Display });
  if (coding.length === 0) return null; // uncoded diagnosis (no WHO code, no pack code)
  return { coding, text: base.icd10Display };
}

/**
 * Append a FHIR `Condition` for each derived dental diagnosis. DX-0 emits caries
 * (K02) conditions, tooth-linked via `bodySite` (FDI). The active coding pack (if
 * any) rides on `options.codingPack`.
 */
export function appendDentalConditions(
  bundle: Bundle,
  payload: OdontogramExportPayload,
  options: FhirExportOptions = {},
): void {
  const derived = deriveDentalDiagnoses(payload);
  if (derived.length === 0) return;
  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  if (!bundle.entry) bundle.entry = [];
  for (const d of derived) {
    const code = buildConditionCode(d.key, options.codingPack, options.snomed);
    if (!code) continue; // uncoded diagnosis (e.g. peri-implant at WHO base) — nothing to emit
    const id = `odontogram-dx-${d.key}-${d.toothNo}`;
    const rec = payload.teeth?.[d.toothNo] ?? {};
    const bodySiteCode = toothBodySiteCode(d.toothNo, rec);
    const condition: Condition = {
      resourceType: "Condition",
      id,
      code,
      subject: { reference: subjectRef },
      bodySite: [{ coding: [{ system: FDI_SYSTEM, code: bodySiteCode }] }],
    };
    bundle.entry.push({ fullUrl: fhirFullUrl("Condition", id), resource: condition });
  }
}
