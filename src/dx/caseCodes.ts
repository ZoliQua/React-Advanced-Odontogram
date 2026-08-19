// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/** Case-level (whole-mouth / regional) dental diagnosis identifiers — authored
 *  on the case, not derived from a tooth. Separate from the tooth-level
 *  `DiagnosisKey`/`DX_CODES`. */
export type CaseConditionKey =
  | "jawSizeAnomaly" | "jawBaseAnomaly" | "archRelationAnomaly" | "toothPositionAnomaly"
  | "malocclusionUnspecified" | "dentofacialFunctional" | "tmjDisorder"
  | "odontogenicCyst" | "nonOdontogenicCyst" | "jawCystOther" | "oralCystOther"
  | "salivaryAtrophy" | "salivaryHypertrophy" | "sialadenitis" | "salivaryAbscess"
  | "salivaryFistula" | "sialolithiasis" | "mucocele" | "salivarySecretion"
  | "recurrentAphthae" | "stomatitisOther" | "oralCellulitis" | "oralMucositis"
  | "anodontia" | "hereditaryStructure"
  | "lipDisease" | "leukoplakia" | "mucosalLesionOther";

export interface CaseConditionCode { icd10: string; icd10Display: string; lateralizable: boolean; }

/** WHO ICD-10 catalog for case/regional conditions. `lateralizable` gates the
 *  left/right/bilateral qualifier. Displays are the WHO ICD-10 titles. */
export const CASE_DX_CODES: Record<CaseConditionKey, CaseConditionCode> = {
  jawSizeAnomaly:          { icd10: "K07.0", icd10Display: "Major anomalies of jaw size", lateralizable: false },
  jawBaseAnomaly:          { icd10: "K07.1", icd10Display: "Anomalies of jaw-cranial base relationship", lateralizable: false },
  archRelationAnomaly:     { icd10: "K07.2", icd10Display: "Anomalies of dental arch relationship", lateralizable: false },
  toothPositionAnomaly:    { icd10: "K07.3", icd10Display: "Anomalies of tooth position", lateralizable: false },
  malocclusionUnspecified: { icd10: "K07.4", icd10Display: "Malocclusion, unspecified", lateralizable: false },
  dentofacialFunctional:   { icd10: "K07.5", icd10Display: "Dentofacial functional abnormalities", lateralizable: false },
  tmjDisorder:             { icd10: "K07.6", icd10Display: "Temporomandibular joint disorder", lateralizable: true },
  odontogenicCyst:         { icd10: "K09.0", icd10Display: "Developmental odontogenic cyst", lateralizable: true },
  nonOdontogenicCyst:      { icd10: "K09.1", icd10Display: "Developmental nonodontogenic cyst of oral region", lateralizable: true },
  jawCystOther:            { icd10: "K09.2", icd10Display: "Other cysts of jaw", lateralizable: true },
  oralCystOther:           { icd10: "K09.8", icd10Display: "Other cysts of oral region, NEC", lateralizable: true },
  salivaryAtrophy:         { icd10: "K11.0", icd10Display: "Atrophy of salivary gland", lateralizable: true },
  salivaryHypertrophy:     { icd10: "K11.1", icd10Display: "Hypertrophy of salivary gland", lateralizable: true },
  sialadenitis:            { icd10: "K11.2", icd10Display: "Sialoadenitis", lateralizable: true },
  salivaryAbscess:         { icd10: "K11.3", icd10Display: "Abscess of salivary gland", lateralizable: true },
  salivaryFistula:         { icd10: "K11.4", icd10Display: "Fistula of salivary gland", lateralizable: true },
  sialolithiasis:          { icd10: "K11.5", icd10Display: "Sialolithiasis", lateralizable: true },
  mucocele:                { icd10: "K11.6", icd10Display: "Mucocele of salivary gland", lateralizable: true },
  salivarySecretion:       { icd10: "K11.7", icd10Display: "Disturbances of salivary secretion", lateralizable: false },
  recurrentAphthae:        { icd10: "K12.0", icd10Display: "Recurrent oral aphthae", lateralizable: false },
  stomatitisOther:         { icd10: "K12.1", icd10Display: "Other forms of stomatitis", lateralizable: false },
  oralCellulitis:          { icd10: "K12.2", icd10Display: "Cellulitis and abscess of mouth", lateralizable: false },
  oralMucositis:           { icd10: "K12.3", icd10Display: "Oral mucositis (ulcerative)", lateralizable: false },
  anodontia:               { icd10: "K00.0", icd10Display: "Anodontia", lateralizable: false },
  hereditaryStructure:     { icd10: "K00.5", icd10Display: "Hereditary disturbances in tooth structure, NEC", lateralizable: false },
  lipDisease:              { icd10: "K13.0", icd10Display: "Diseases of lips", lateralizable: false },
  leukoplakia:             { icd10: "K13.2", icd10Display: "Leukoplakia and other disturbances of oral epithelium", lateralizable: true },
  mucosalLesionOther:      { icd10: "K13.7", icd10Display: "Other and unspecified lesions of oral mucosa", lateralizable: true },
};

export type Laterality = "unspecified" | "left" | "right" | "bilateral";
export const VALID_LATERALITY = new Set<Laterality>(["unspecified", "left", "right", "bilateral"]);

/** The lateralizable subset (14 keys), derived from the `lateralizable` flag. */
export const LATERALIZABLE_CASE_KEYS = new Set(
  (Object.keys(CASE_DX_CODES) as CaseConditionKey[]).filter((k) => CASE_DX_CODES[k].lateralizable),
);
