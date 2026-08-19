// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/** Internal dental-diagnosis identifiers. Extended per DX sub-project. */
export type DiagnosisKey =
  | "caries" | "periodontitis" | "gingivitis"
  | "cariesCementum" | "cariesArrested"
  | "pulpitis" | "pulpNecrosis"
  | "apicalPeriodontitisAcute" | "apicalPeriodontitisChronic" | "radicularCyst"
  | "periapicalAbscess" | "periapicalAbscessSinus" | "condensingOsteitis"
  | "resorption" | "attrition" | "abrasion" | "erosion" | "abfraction" | "calculus"
  | "fluorosis" | "tetracyclineStain" | "postEruptiveColour"
  | "toothLoss" | "retainedRoot"
  | "toothFracture" | "periImplantMucositis" | "periImplantitis";

/** A diagnosis's base coding: WHO ICD-10 (usually) + an optional SNOMED slot
 *  (filled in DX-6). National codes live in coding packs, not here. */
export interface DiagnosisCode {
  icd10?: string;          // optional: an "uncoded" diagnosis (e.g. peri-implant) has no WHO code
  icd10Display: string;
  snomed?: string;
}

/** The base WHO ICD-10 catalog. Displays are the WHO ICD-10 titles. */
export const DX_CODES: Record<DiagnosisKey, DiagnosisCode> = {
  caries: { icd10: "K02", icd10Display: "Dental caries" },
  gingivitis: { icd10: "K05.1", icd10Display: "Chronic gingivitis" },
  periodontitis: { icd10: "K05.3", icd10Display: "Chronic periodontitis" },
  cariesCementum: { icd10: "K02.2", icd10Display: "Caries of cementum" },
  cariesArrested: { icd10: "K02.3", icd10Display: "Arrested dental caries" },
  pulpitis: { icd10: "K04.0", icd10Display: "Pulpitis" },
  pulpNecrosis: { icd10: "K04.1", icd10Display: "Necrosis of pulp" },
  apicalPeriodontitisAcute: { icd10: "K04.4", icd10Display: "Acute apical periodontitis of pulpal origin" },
  apicalPeriodontitisChronic: { icd10: "K04.5", icd10Display: "Chronic apical periodontitis" },
  radicularCyst: { icd10: "K04.8", icd10Display: "Radicular cyst" },
  periapicalAbscess: { icd10: "K04.7", icd10Display: "Periapical abscess without sinus" },
  periapicalAbscessSinus: { icd10: "K04.6", icd10Display: "Periapical abscess with sinus" },
  condensingOsteitis: { icd10: "K04.9", icd10Display: "Other and unspecified diseases of pulp and periapical tissues" },
  resorption: { icd10: "K03.3", icd10Display: "Pathological resorption of teeth" },
  attrition: { icd10: "K03.0", icd10Display: "Excessive attrition of teeth" },
  abrasion: { icd10: "K03.1", icd10Display: "Abrasion of teeth" },
  erosion: { icd10: "K03.2", icd10Display: "Erosion of teeth" },
  abfraction: { icd10: "K03.8", icd10Display: "Other specified diseases of hard tissues of teeth" },
  calculus: { icd10: "K03.6", icd10Display: "Deposits [accretions] on teeth" },
  fluorosis: { icd10: "K00.3", icd10Display: "Mottled teeth" },
  tetracyclineStain: { icd10: "K00.8", icd10Display: "Other disorders of tooth development" },
  postEruptiveColour: { icd10: "K03.7", icd10Display: "Posteruptive colour changes of dental hard tissues" },
  toothLoss: { icd10: "K08.1", icd10Display: "Loss of teeth due to accident, extraction or local periodontal disease" },
  retainedRoot: { icd10: "K08.3", icd10Display: "Retained dental root" },
  toothFracture: { icd10: "S02.5", icd10Display: "Fracture of tooth" },
  periImplantMucositis: { icd10Display: "Peri-implant mucositis" },
  periImplantitis: { icd10Display: "Peri-implantitis" },
};
