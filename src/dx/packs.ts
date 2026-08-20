// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { DiagnosisKey } from "./codes";
import type { CaseConditionKey } from "./caseCodes";

/**
 * A national code overlay. `translation` packs keep the WHO codes and only
 * localize the display (cheap: BNO-10, MKCH-10, and the dental chapter of
 * ICD-10-GM/CIM-10). `modification` packs remap the code itself (US ICD-10-CM,
 * added in DX-5).
 */
export interface CodingPack {
  id: string;
  system: string;
  kind: "translation" | "modification";
  displays?: Partial<Record<DiagnosisKey, string>>;
  caseDisplays?: Partial<Record<CaseConditionKey, string>>;
  codes?: Partial<Record<DiagnosisKey, { code: string; display: string }>>;
  caseCodes?: Partial<Record<CaseConditionKey, { code: string; display: string }>>;
}

// BNO-10 (Hungarian ICD-10). The Hungarian codes are identical to WHO ICD-10
// (KSH: BNO-10 == WHO 2019); only the display language differs.
// NOTE: confirm the official BNO-10 canonical URI before release; this is a
// stable stand-in.
export const BNO10_SYSTEM = "http://ksh.hu/bno10";

export const BNO10_PACK: CodingPack = {
  id: "bno10",
  system: BNO10_SYSTEM,
  kind: "translation",
  displays: {
    caries: "Fogszuvasodás",
    gingivitis: "Idült fogínygyulladás",
    periodontitis: "Idült fogágygyulladás",
    cariesCementum: "Cementszuvasodás",
    cariesArrested: "Nyugvó (arretált) fogszuvasodás",
    pulpitis: "Fogbélgyulladás (pulpitis)",
    pulpNecrosis: "A fogbél elhalása",
    apicalPeriodontitisAcute: "Heveny gyökércsúcs körüli fogágygyulladás pulpalis eredettel",
    apicalPeriodontitisChronic: "Idült gyökércsúcs körüli fogágygyulladás",
    radicularCyst: "Gyökértömlő (radikuláris ciszta)",
    periapicalAbscess: "Gyökércsúcs körüli tályog sipoly nélkül",
    periapicalAbscessSinus: "Gyökércsúcs körüli tályog sipollyal",
    condensingOsteitis: "A fogbél és a gyökércsúcs körüli szövetek egyéb és nem meghatározott betegségei",
    resorption: "A fogak kóros felszívódása (resorptio)",
    attrition: "A fogak fokozott kopása (attritio)",
    abrasion: "A fogak koptató kopása (abrasio)",
    erosion: "A fogak eróziója",
    abfraction: "A fogak kemény szöveteinek egyéb meghatározott betegségei",
    calculus: "Lerakódások (fogkő) a fogakon",
    fluorosis: "Foltos fogzománc (fluorózis)",
    tetracyclineStain: "A fogfejlődés egyéb rendellenességei",
    postEruptiveColour: "A fog kemény szöveteinek előtörés utáni színelváltozásai",
    toothLoss: "Fogak elvesztése baleset, foghúzás vagy helyi fogágybetegség miatt",
    retainedRoot: "Visszamaradt foggyökér",
    toothFracture: "Fogtörés",
  },
  caseDisplays: {
    jawSizeAnomaly: "Az állcsontméret jelentős rendellenességei",
    jawBaseAnomaly: "Az állcsont-koponyaalap viszony rendellenességei",
    archRelationAnomaly: "A fogív viszony rendellenességei",
    toothPositionAnomaly: "A fogak helyzeti rendellenességei",
    malocclusionUnspecified: "Fogazati záródási rendellenesség (malocclusio), nem meghatározott",
    dentofacialFunctional: "Dentofacialis működési rendellenességek",
    tmjDisorder: "Az állkapocsízület rendellenességei",
    odontogenicCyst: "Fejlődési odontogen ciszták",
    nonOdontogenicCyst: "A szájüreg fejlődési (nem odontogen) cisztái",
    jawCystOther: "Az állcsont egyéb cisztái",
    oralCystOther: "A szájüreg egyéb cisztái, m.n.o.",
    salivaryAtrophy: "A nyálmirigy sorvadása (atrophia)",
    salivaryHypertrophy: "A nyálmirigy túltengése (hypertrophia)",
    sialadenitis: "Nyálmirigygyulladás (sialoadenitis)",
    salivaryAbscess: "Nyálmirigytályog",
    salivaryFistula: "Nyálmirigysipoly",
    sialolithiasis: "Nyálkövesség (sialolithiasis)",
    mucocele: "A nyálmirigy mucokéléje (nyálretenciós ciszta)",
    salivarySecretion: "A nyálelválasztás zavarai",
    recurrentAphthae: "Visszatérő szájfekélyek (aphthák)",
    stomatitisOther: "A szájnyálkahártya-gyulladás egyéb formái",
    oralCellulitis: "A száj cellulitise és tályogja",
    oralMucositis: "Szájnyálkahártya-gyulladás (fekélyes mucositis)",
    anodontia: "Foghiány (anodontia)",
    hereditaryStructure: "A fog szerkezetének öröklődő rendellenességei, m.n.o.",
    lipDisease: "Az ajak betegségei",
    leukoplakia: "Leukoplakia és a szájhám egyéb elváltozásai",
    mucosalLesionOther: "A szájnyálkahártya egyéb és nem meghatározott elváltozásai",
  },
};

// US ICD-10-CM (Clinical Modification) — a `modification`-class pack: it REMAPS
// the code, not just the display. Most K-codes the engine uses are identical
// between WHO ICD-10 and ICD-10-CM; this pack remaps the genuinely-divergent
// ones (e.g. caries -> K02.9 unspecified; the K07 dentofacial anomalies ->
// the M26 range) and uses CM display titles.
// REFERENCE / BEST-EFFORT: verify against the official ICD-10-CM tabular list
// before any US clinical/billing use. Codes are flat per-key (no data-driven
// specificity yet — see DX-5 spec §7).
export const ICD10CM_SYSTEM = "http://hl7.org/fhir/sid/icd-10-cm";

export const ICD10CM_PACK: CodingPack = {
  id: "icd10cm",
  system: ICD10CM_SYSTEM,
  kind: "modification",
  codes: {
    caries: { code: "K02.9", display: "Dental caries, unspecified" },
    gingivitis: { code: "K05.10", display: "Chronic gingivitis, plaque induced" },
    periodontitis: { code: "K05.30", display: "Chronic periodontitis, unspecified" },
    cariesCementum: { code: "K02.7", display: "Dental root caries" },
    cariesArrested: { code: "K02.3", display: "Arrested dental caries" },
    pulpitis: { code: "K04.0", display: "Pulpitis" },
    pulpNecrosis: { code: "K04.1", display: "Necrosis of pulp" },
    apicalPeriodontitisAcute: { code: "K04.4", display: "Acute apical periodontitis of pulpal origin" },
    apicalPeriodontitisChronic: { code: "K04.5", display: "Chronic apical periodontitis" },
    radicularCyst: { code: "K04.8", display: "Radicular cyst" },
    periapicalAbscess: { code: "K04.7", display: "Periapical abscess without sinus" },
    periapicalAbscessSinus: { code: "K04.6", display: "Periapical abscess with sinus" },
    condensingOsteitis: { code: "K04.99", display: "Other diseases of pulp and periapical tissues" },
    resorption: { code: "K03.3", display: "Pathological resorption of teeth" },
    attrition: { code: "K03.0", display: "Excessive attrition of teeth" },
    abrasion: { code: "K03.1", display: "Abrasion of teeth" },
    erosion: { code: "K03.2", display: "Erosion of teeth" },
    abfraction: { code: "K03.89", display: "Other specified diseases of hard tissues of teeth" },
    calculus: { code: "K03.6", display: "Deposits [accretions] on teeth" },
    fluorosis: { code: "K00.3", display: "Mottled teeth" },
    tetracyclineStain: { code: "K00.8", display: "Other disorders of tooth development" },
    postEruptiveColour: { code: "K03.7", display: "Posteruptive color changes of dental hard tissues" },
    toothLoss: { code: "K08.409", display: "Partial loss of teeth, unspecified cause, unspecified class" },
    retainedRoot: { code: "K08.3", display: "Retained dental root" },
    toothFracture: { code: "S02.5XXA", display: "Fracture of tooth (traumatic), initial encounter" },
  },
  caseCodes: {
    jawSizeAnomaly: { code: "M26.00", display: "Unspecified anomaly of jaw size" },
    jawBaseAnomaly: { code: "M26.10", display: "Unspecified anomaly of jaw-cranial base relationship" },
    archRelationAnomaly: { code: "M26.20", display: "Unspecified anomaly of dental arch relationship" },
    toothPositionAnomaly: { code: "M26.30", display: "Unspecified anomaly of tooth position of fully erupted tooth or teeth" },
    malocclusionUnspecified: { code: "M26.4", display: "Malocclusion, unspecified" },
    dentofacialFunctional: { code: "M26.50", display: "Dentofacial functional abnormalities, unspecified" },
    tmjDisorder: { code: "M26.609", display: "Unspecified temporomandibular joint disorder, unspecified side" },
    odontogenicCyst: { code: "K09.0", display: "Developmental odontogenic cysts" },
    nonOdontogenicCyst: { code: "K09.1", display: "Developmental (nonodontogenic) cysts of oral region" },
    jawCystOther: { code: "M27.40", display: "Unspecified cyst of jaw" },
    oralCystOther: { code: "K09.8", display: "Other cysts of oral region, not elsewhere classified" },
    salivaryAtrophy: { code: "K11.0", display: "Atrophy of salivary gland" },
    salivaryHypertrophy: { code: "K11.1", display: "Hypertrophy of salivary gland" },
    sialadenitis: { code: "K11.20", display: "Sialoadenitis, unspecified" },
    salivaryAbscess: { code: "K11.3", display: "Abscess of salivary gland" },
    salivaryFistula: { code: "K11.4", display: "Fistula of salivary gland" },
    sialolithiasis: { code: "K11.5", display: "Sialolithiasis" },
    mucocele: { code: "K11.6", display: "Mucocele of salivary gland" },
    salivarySecretion: { code: "K11.7", display: "Disturbances of salivary secretion" },
    recurrentAphthae: { code: "K12.0", display: "Recurrent oral aphthae" },
    stomatitisOther: { code: "K12.1", display: "Other forms of stomatitis" },
    oralCellulitis: { code: "K12.2", display: "Cellulitis and abscess of mouth" },
    oralMucositis: { code: "K12.30", display: "Oral mucositis (ulcerative), unspecified" },
    anodontia: { code: "K00.0", display: "Anodontia" },
    hereditaryStructure: { code: "K00.5", display: "Hereditary disturbances in tooth structure, not elsewhere classified" },
    lipDisease: { code: "K13.0", display: "Diseases of lips" },
    leukoplakia: { code: "K13.21", display: "Leukoplakia of oral mucosa, including tongue" },
    mucosalLesionOther: { code: "K13.79", display: "Other lesions of oral mucosa" },
  },
};

export const CODING_PACKS: Record<string, CodingPack> = {
  bno10: BNO10_PACK,
  icd10cm: ICD10CM_PACK,
};

/** Resolve a pack id to its definition. "none"/null/unknown -> undefined. */
export function resolveCodingPack(id: string | null | undefined): CodingPack | undefined {
  if (!id || id === "none") return undefined;
  return CODING_PACKS[id];
}

/**
 * The extra `coding[]` entry a pack contributes for one diagnosis, or null when
 * the pack has nothing for that key. Translation: same code, localized display.
 * Modification: the remapped code + its display.
 */
export function packCoding(
  pack: CodingPack,
  key: DiagnosisKey,
  baseCode: string,
  baseDisplay: string,
): { system: string; code: string; display: string } | null {
  if (pack.kind === "modification") {
    const m = pack.codes?.[key];
    return m ? { system: pack.system, code: m.code, display: m.display } : null;
  }
  return { system: pack.system, code: baseCode, display: pack.displays?.[key] ?? baseDisplay };
}
