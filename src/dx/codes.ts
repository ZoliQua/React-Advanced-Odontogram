// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/** Internal dental-diagnosis identifiers. Extended per DX sub-project. */
export type DiagnosisKey = "caries" | "periodontitis" | "gingivitis";

/** A diagnosis's base coding: WHO ICD-10 (always) + an optional SNOMED slot
 *  (filled in DX-6). National codes live in coding packs, not here. */
export interface DiagnosisCode {
  icd10: string;
  icd10Display: string;
  snomed?: string;
}

/** The base WHO ICD-10 catalog. Displays are the WHO ICD-10 titles. */
export const DX_CODES: Record<DiagnosisKey, DiagnosisCode> = {
  caries: { icd10: "K02", icd10Display: "Dental caries" },
  gingivitis: { icd10: "K05.1", icd10Display: "Chronic gingivitis" },
  periodontitis: { icd10: "K05.3", icd10Display: "Chronic periodontitis" },
};
