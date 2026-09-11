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

export interface CaseConditionCode { icd10: string; icd10Display: string; lateralizable: boolean; snomed?: string; }

/** WHO ICD-10 catalog for case/regional conditions. `lateralizable` gates the
 *  left/right/bilateral qualifier. Displays are the WHO ICD-10 titles. */
// SNOMED CT slots (interop arc part C, 2026-09-11): chosen from Ontoserver searches
// and verified via $lookup (active, SNOMED CT International core module, FSN).
// Two keys stay deliberately UNSET because SNOMED International has no umbrella
// concept for them (only US-extension or narrower inclusion concepts):
//   jawSizeAnomaly (K07.0 — only "Maxillary/Mandibular jaw size anomaly" children),
//   dentofacialFunctional (K07.5 — only "Abnormal jaw closure" / "Malocclusion due to
//   mouth breathing"). Two picks are documented as slightly broader than the ICD
// title: odontogenicCyst -> 235110008 Odontogenic cyst (K09.0 is the developmental
// subset), hereditaryStructure -> 1148766007 Hereditary disorder of tooth (K00.5 is
// the structural subset).
export const CASE_DX_CODES: Record<CaseConditionKey, CaseConditionCode> = {
  jawSizeAnomaly:          { icd10: "K07.0", icd10Display: "Major anomalies of jaw size", lateralizable: false },
  jawBaseAnomaly:          { icd10: "K07.1", icd10Display: "Anomalies of jaw-cranial base relationship", lateralizable: false, snomed: "266420009" },
  archRelationAnomaly:     { icd10: "K07.2", icd10Display: "Anomalies of dental arch relationship", lateralizable: false, snomed: "266421008" },
  toothPositionAnomaly:    { icd10: "K07.3", icd10Display: "Anomalies of tooth position", lateralizable: false, snomed: "81256000" },
  malocclusionUnspecified: { icd10: "K07.4", icd10Display: "Malocclusion, unspecified", lateralizable: false, snomed: "47944004" },
  dentofacialFunctional:   { icd10: "K07.5", icd10Display: "Dentofacial functional abnormalities", lateralizable: false },
  tmjDisorder:             { icd10: "K07.6", icd10Display: "Temporomandibular joint disorder", lateralizable: true, snomed: "41888000" },
  odontogenicCyst:         { icd10: "K09.0", icd10Display: "Developmental odontogenic cyst", lateralizable: true, snomed: "235110008" },
  nonOdontogenicCyst:      { icd10: "K09.1", icd10Display: "Developmental nonodontogenic cyst of oral region", lateralizable: true, snomed: "196452003" },
  jawCystOther:            { icd10: "K09.2", icd10Display: "Other cysts of jaw", lateralizable: true, snomed: "43144004" },
  oralCystOther:           { icd10: "K09.8", icd10Display: "Other cysts of oral region, NEC", lateralizable: true, snomed: "196546001" },
  salivaryAtrophy:         { icd10: "K11.0", icd10Display: "Atrophy of salivary gland", lateralizable: true, snomed: "48128006" },
  salivaryHypertrophy:     { icd10: "K11.1", icd10Display: "Hypertrophy of salivary gland", lateralizable: true, snomed: "45338009" },
  sialadenitis:            { icd10: "K11.2", icd10Display: "Sialoadenitis", lateralizable: true, snomed: "42982001" },
  salivaryAbscess:         { icd10: "K11.3", icd10Display: "Abscess of salivary gland", lateralizable: true, snomed: "80483009" },
  salivaryFistula:         { icd10: "K11.4", icd10Display: "Fistula of salivary gland", lateralizable: true, snomed: "75260002" },
  sialolithiasis:          { icd10: "K11.5", icd10Display: "Sialolithiasis", lateralizable: true, snomed: "28826002" },
  mucocele:                { icd10: "K11.6", icd10Display: "Mucocele of salivary gland", lateralizable: true, snomed: "69825009" },
  salivarySecretion:       { icd10: "K11.7", icd10Display: "Disturbances of salivary secretion", lateralizable: false, snomed: "78948009" },
  recurrentAphthae:        { icd10: "K12.0", icd10Display: "Recurrent oral aphthae", lateralizable: false, snomed: "722781002" },
  stomatitisOther:         { icd10: "K12.1", icd10Display: "Other forms of stomatitis", lateralizable: false, snomed: "61170000" },
  oralCellulitis:          { icd10: "K12.2", icd10Display: "Cellulitis and abscess of mouth", lateralizable: false, snomed: "8771003" },
  oralMucositis:           { icd10: "K12.3", icd10Display: "Oral mucositis (ulcerative)", lateralizable: false, snomed: "450005" },
  anodontia:               { icd10: "K00.0", icd10Display: "Anodontia", lateralizable: false, snomed: "26624006" },
  hereditaryStructure:     { icd10: "K00.5", icd10Display: "Hereditary disturbances in tooth structure, NEC", lateralizable: false, snomed: "1148766007" },
  lipDisease:              { icd10: "K13.0", icd10Display: "Diseases of lips", lateralizable: false, snomed: "90678009" },
  leukoplakia:             { icd10: "K13.2", icd10Display: "Leukoplakia and other disturbances of oral epithelium", lateralizable: true, snomed: "414603003" },
  mucosalLesionOther:      { icd10: "K13.7", icd10Display: "Other and unspecified lesions of oral mucosa", lateralizable: true, snomed: "128046007" },
};

export type Laterality = "unspecified" | "left" | "right" | "bilateral";
export const VALID_LATERALITY = new Set<Laterality>(["unspecified", "left", "right", "bilateral"]);

/** The lateralizable subset (14 keys), derived from the `lateralizable` flag. */
export const LATERALIZABLE_CASE_KEYS = new Set(
  (Object.keys(CASE_DX_CODES) as CaseConditionKey[]).filter((k) => CASE_DX_CODES[k].lateralizable),
);

/** The catalog keys as a Set — prototype-safe membership guard for setters /
 *  hydrate (the `in` operator would also match inherited Object.prototype names). */
export const VALID_CASE_KEY = new Set<CaseConditionKey>(Object.keys(CASE_DX_CODES) as CaseConditionKey[]);
