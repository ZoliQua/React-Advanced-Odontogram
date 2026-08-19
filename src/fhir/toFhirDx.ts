// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, Condition, CodeableConcept, OdontogramExportPayload, FhirExportOptions } from "./types";
import { ICD10_SYSTEM, FDI_SYSTEM } from "./codesystems";
import { PLACEHOLDER_PATIENT_FULLURL } from "./primitives";
import { DX_CODES, type DiagnosisKey } from "../dx/codes";
import { packCoding, type CodingPack } from "../dx/packs";
import { deriveDentalDiagnoses } from "../dx/derive";
import { toothBodySiteCode } from "./iso3950";

/**
 * The `Condition.code` for a diagnosis: the WHO ICD-10 base coding (always) plus,
 * when a national pack is active, the pack's coding (translation packs keep the
 * same code, modification packs remap it). Extended with a SNOMED coding in DX-6.
 */
export function buildConditionCode(key: DiagnosisKey, pack?: CodingPack): CodeableConcept {
  const base = DX_CODES[key];
  const coding: NonNullable<CodeableConcept["coding"]> = [
    { system: ICD10_SYSTEM, code: base.icd10, display: base.icd10Display },
  ];
  if (pack) {
    const extra = packCoding(pack, key, base.icd10, base.icd10Display);
    if (extra) coding.push(extra);
  }
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
    const id = `odontogram-dx-${d.key}-${d.toothNo}`;
    const rec = payload.teeth?.[d.toothNo] ?? {};
    const bodySiteCode = toothBodySiteCode(d.toothNo, rec);
    const condition: Condition = {
      resourceType: "Condition",
      id,
      code: buildConditionCode(d.key, options.codingPack),
      subject: { reference: subjectRef },
      bodySite: [{ coding: [{ system: FDI_SYSTEM, code: bodySiteCode }] }],
    };
    bundle.entry.push({ fullUrl: `urn:uuid:${id}`, resource: condition });
  }
}
