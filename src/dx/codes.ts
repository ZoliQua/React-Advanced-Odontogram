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
  // SNOMED CT concept IDs (DX-6 overlay). Every key is filled (interop arc part C,
  // 2026-09-11): each concept was chosen from an Ontoserver search and then
  // verified via $lookup to be ACTIVE and in the SNOMED CT International core
  // module, with a matching FSN; the test suite re-checks the Verhoeff check digit
  // and the International partition of every id. A consuming system should still
  // confirm each concept against its own edition/release before clinical use.
  caries: { icd10: "K02", icd10Display: "Dental caries", snomed: "80967001" },
  gingivitis: { icd10: "K05.1", icd10Display: "Chronic gingivitis", snomed: "66383009" },
  periodontitis: { icd10: "K05.3", icd10Display: "Chronic periodontitis", snomed: "5689008" },
  cariesCementum: { icd10: "K02.2", icd10Display: "Caries of cementum", snomed: "30512007" },
  cariesArrested: { icd10: "K02.3", icd10Display: "Arrested dental caries", snomed: "80753001" },
  pulpitis: { icd10: "K04.0", icd10Display: "Pulpitis", snomed: "32620007" },
  pulpNecrosis: { icd10: "K04.1", icd10Display: "Necrosis of pulp", snomed: "42711005" },
  apicalPeriodontitisAcute: { icd10: "K04.4", icd10Display: "Acute apical periodontitis of pulpal origin", snomed: "718053009" },
  apicalPeriodontitisChronic: { icd10: "K04.5", icd10Display: "Chronic apical periodontitis", snomed: "718052004" },
  radicularCyst: { icd10: "K04.8", icd10Display: "Radicular cyst", snomed: "89988002" },
  periapicalAbscess: { icd10: "K04.7", icd10Display: "Periapical abscess without sinus", snomed: "109602002" },
  periapicalAbscessSinus: { icd10: "K04.6", icd10Display: "Periapical abscess with sinus", snomed: "74598008" },
  condensingOsteitis: { icd10: "K04.9", icd10Display: "Other and unspecified diseases of pulp and periapical tissues", snomed: "55413008" },
  resorption: { icd10: "K03.3", icd10Display: "Pathological resorption of teeth", snomed: "70931000" },
  attrition: { icd10: "K03.0", icd10Display: "Excessive attrition of teeth", snomed: "53963006" },
  abrasion: { icd10: "K03.1", icd10Display: "Abrasion of teeth", snomed: "47222000" },
  erosion: { icd10: "K03.2", icd10Display: "Erosion of teeth", snomed: "82212003" },
  abfraction: { icd10: "K03.8", icd10Display: "Other specified diseases of hard tissues of teeth", snomed: "109750005" },
  calculus: { icd10: "K03.6", icd10Display: "Deposits [accretions] on teeth", snomed: "17552000" },
  fluorosis: { icd10: "K00.3", icd10Display: "Mottled teeth", snomed: "30265004" },
  tetracyclineStain: { icd10: "K00.8", icd10Display: "Other disorders of tooth development", snomed: "61704003" },
  postEruptiveColour: { icd10: "K03.7", icd10Display: "Posteruptive colour changes of dental hard tissues", snomed: "4654002" },
  toothLoss: { icd10: "K08.1", icd10Display: "Loss of teeth due to accident, extraction or local periodontal disease", snomed: "109674000" },
  retainedRoot: { icd10: "K08.3", icd10Display: "Retained dental root", snomed: "66569006" },
  toothFracture: { icd10: "S02.5", icd10Display: "Fracture of tooth", snomed: "36202009" },
  periImplantMucositis: { icd10Display: "Peri-implant mucositis", snomed: "699684005" },
  periImplantitis: { icd10Display: "Peri-implantitis", snomed: "699422003" },
};
