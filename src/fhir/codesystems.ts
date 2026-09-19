// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Canonical system URLs and coding maps for the FHIR export.
 *
 * - Local codes mirror the engine's own enum values and are ALWAYS emitted,
 *   guaranteeing round-trip fidelity even where no standard code exists. The
 *   local system is currently the ONLY coding emitted for clinical states.
 * - SNOMED CT is not yet active: `SNOMED_CODES` is currently empty and no
 *   `CodeEntry` sets `snomed`, so no SNOMED coding is emitted. When populated
 *   (with codes verified against the official SNOMED CT browser), entries are
 *   emitted as additional codings in the export; they are additive, never required.
 */

/** Local CodeSystem canonical URL (engine-owned codes). Every export uses it. */
export const LOCAL_SYSTEM =
  "https://github.com/ZoliQua/React-Advanced-Odontogram/fhir/CodeSystem/odontogram";

/**
 * Every canonical URL the engine's local codes have ever been EXPORTED under —
 * the current one first. The project was renamed from React-Odontogram-Modul to
 * React Advanced Odontogram in 2.6.0, which moved the canonical URL with it; a
 * bundle exported before the rename carries the old one, and must keep
 * importing exactly as it did. Readers match with {@link isLocalSystem}, never
 * `=== LOCAL_SYSTEM`; the export side only ever writes `LOCAL_SYSTEM`.
 */
export const LOCAL_SYSTEMS: ReadonlySet<string> = new Set([
  LOCAL_SYSTEM,
  "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",   // before 2.6.0
]);

/** Whether a coding's `system` is the engine's local code system, under any of
 *  the canonical URLs it has had. */
export function isLocalSystem(system: unknown): boolean {
  return typeof system === "string" && LOCAL_SYSTEMS.has(system);
}

/** ISO 3950 / FDI tooth designation system. */
export const FDI_SYSTEM = "urn:iso:std:iso:3950";

/** SNOMED CT system URL. */
export const SNOMED_SYSTEM = "http://snomed.info/sct";

/**
 * ICD-10 (WHO) system URL, per HL7's registered identifier for it. Used by the
 * periodontitis/gingivitis Condition (K05.*). BNO-10 (the Hungarian national
 * ICD-10 clinical modification) mirrors the WHO K05.* codes 1:1 for this code
 * range, so no separate BNO coding is emitted.
 */
export const ICD10_SYSTEM = "http://hl7.org/fhir/sid/icd-10";

/**
 * ICDAS II (International Caries Detection and Assessment System) reference URL.
 * Documentation constant: per-surface caries codes (1–6) are emitted as the
 * caries component's `valueInteger`; this URL identifies the scoring system.
 */
export const ICDAS_SYSTEM = "https://www.icdas.org";

/** Standard ICDAS II code descriptions, keyed by the 0-6 score. */
export const ICDAS_DISPLAYS: Record<number, string> = {
  0: "ICDAS 0 — Sound tooth surface",
  1: "ICDAS 1 — First visual change in enamel",
  2: "ICDAS 2 — Distinct visual change in enamel",
  3: "ICDAS 3 — Localized enamel breakdown",
  4: "ICDAS 4 — Underlying dark shadow from dentine",
  5: "ICDAS 5 — Distinct cavity with visible dentine",
  6: "ICDAS 6 — Extensive distinct cavity with visible dentine",
};

/** A single coded value: required local code, optional verified SNOMED code. */
export interface CodeEntry {
  code: string;
  display: string;
  snomed?: string;
}

/**
 * Local value maps, keyed by enum group then by enum value.
 * `display` strings are English (the export is language-neutral data).
 */
export const LOCAL_VALUE_MAPS: Record<string, Record<string, CodeEntry>> = {
  toothSelection: {
    "none": { code: "none", display: "No tooth status" },
    "tooth-base": { code: "tooth-base", display: "Present tooth" },
    "milktooth": { code: "milktooth", display: "Primary (deciduous) tooth" },
    "implant": { code: "implant", display: "Dental implant" },
    "tooth-under-gum": { code: "tooth-under-gum", display: "Tooth under gum" },
    "no-tooth-after-extraction": { code: "no-tooth-after-extraction", display: "Missing after extraction" },
  },
  endo: {
    "none": { code: "none", display: "No endodontic treatment" },
    "endo-medical-filling": { code: "endo-medical-filling", display: "Endodontic medical filling" },
    "endo-filling": { code: "endo-filling", display: "Root canal filling" },
    "endo-filling-incomplete": { code: "endo-filling-incomplete", display: "Incomplete root canal filling" },
    "endo-glass-pin": { code: "endo-glass-pin", display: "Glass fiber post" },
    "endo-metal-pin": { code: "endo-metal-pin", display: "Metal post" },
  },
  fillingMaterial: {
    "none": { code: "none", display: "No filling" },
    "amalgam": { code: "amalgam", display: "Amalgam filling" },
    "composite": { code: "composite", display: "Composite filling" },
    "gic": { code: "gic", display: "Glass ionomer cement filling" },
    "temporary": { code: "temporary", display: "Temporary filling" },
  },
  prosthesis: {
    "none":              { code: "none",              display: "No prosthesis" },
    "healing-abutment":  { code: "healing-abutment",  display: "Healing abutment" },
    "locator":           { code: "locator",           display: "Locator attachment" },
    "locator-denture":   { code: "locator-denture",   display: "Locator overdenture" },
    "bar":               { code: "bar",               display: "Bar attachment" },
    "bar-denture":       { code: "bar-denture",       display: "Bar overdenture" },
    "removable-partial": { code: "removable-partial", display: "Partial removable denture" },
    "removable-full":    { code: "removable-full",    display: "Full removable denture" },
  },
  mobility: {
    "none": { code: "none", display: "No mobility" },
    "m1": { code: "m1", display: "Mobility grade 1" },
    "m2": { code: "m2", display: "Mobility grade 2" },
    "m3": { code: "m3", display: "Mobility grade 3" },
  },
  mods: {
    "inflammation": { code: "inflammation", display: "Inflammation" },
    "parodontal": { code: "parodontal", display: "Periodontal involvement" },
    "mobility": { code: "mobility", display: "Mobility" },
  },
  periapicalType: {
    "none": { code: "none", display: "No periapical lesion" },
    "granuloma": { code: "granuloma", display: "Periapical granuloma" },
    "cyst": { code: "cyst", display: "Radicular cyst" },
    "abscess": { code: "abscess", display: "Periapical abscess" },
  },
  caries: {
    "caries-subcrown": { code: "caries-subcrown", display: "Subcrown caries" },
    "caries-buccal": { code: "caries-buccal", display: "Buccal caries" },
    "caries-lingual": { code: "caries-lingual", display: "Lingual caries" },
    "caries-mesial": { code: "caries-mesial", display: "Mesial caries" },
    "caries-distal": { code: "caries-distal", display: "Distal caries" },
    "caries-occlusal": { code: "caries-occlusal", display: "Occlusal caries" },
  },
  fillingSurfaces: {
    "buccal": { code: "buccal", display: "Buccal surface" },
    "lingual": { code: "lingual", display: "Lingual surface" },
    "mesial": { code: "mesial", display: "Mesial surface" },
    "distal": { code: "distal", display: "Distal surface" },
    "occlusal": { code: "occlusal", display: "Occlusal surface" },
  },
  toothSubstrate: {
    "natural": { code: "natural", display: "Natural substrate" },
    "radix": { code: "radix", display: "Root remnant (radix)" },
    "broken": { code: "broken", display: "Broken tooth" },
    "crownprep": { code: "crownprep", display: "Prepared for crown" },
  },
  restorationType: {
    "none": { code: "none", display: "No restoration" },
    "crown": { code: "crown", display: "Crown" },
    "inlay": { code: "inlay", display: "Inlay" },
    "onlay": { code: "onlay", display: "Onlay" },
    "veneer": { code: "veneer", display: "Veneer" },
    "bridge": { code: "bridge", display: "Bridge unit" },
  },
  restorationMaterial: {
    "none": { code: "none", display: "No material" },
    "emax": { code: "emax", display: "Lithium disilicate (e.max)" },
    "gold": { code: "gold", display: "Gold" },
    "gradia": { code: "gradia", display: "Indirect composite (Gradia)" },
    "zircon": { code: "zircon", display: "Zirconia" },
    "metal": { code: "metal", display: "Full-cast metal" },
    "metal-ceramic": { code: "metal-ceramic", display: "Metal-ceramic (PFM)" },
    "telescope": { code: "telescope", display: "Telescopic crown" },
    "temporary": { code: "temporary", display: "Temporary" },
  },
  // Pulp/apical/resorption diagnosis axes.
  pulpDx: {
    "normal": { code: "normal", display: "Normal pulp" },
    "reversible-pulpitis": { code: "reversible-pulpitis", display: "Reversible pulpitis" },
    "irreversible-pulpitis": { code: "irreversible-pulpitis", display: "Irreversible pulpitis" },
    "necrosis": { code: "necrosis", display: "Pulp necrosis" },
  },
  // Practical clinical Latin pulp subtypes; `display` is the Latin label itself
  // (language-neutral, identical across UI languages).
  pulpLatin: {
    "none": { code: "none", display: "No Latin pulp subtype" },
    "pulpa-sana": { code: "pulpa-sana", display: "Pulpa sana" },
    "hyperaemia-pulpae": { code: "hyperaemia-pulpae", display: "Hyperaemia pulpae" },
    "pulpitis-acuta-serosa": { code: "pulpitis-acuta-serosa", display: "Pulpitis acuta serosa" },
    "pulpitis-acuta-purulenta": { code: "pulpitis-acuta-purulenta", display: "Pulpitis acuta purulenta" },
    "pulpitis-chronica-clausa": { code: "pulpitis-chronica-clausa", display: "Pulpitis chronica clausa" },
    "pulpitis-chronica-ulcerosa": { code: "pulpitis-chronica-ulcerosa", display: "Pulpitis chronica ulcerosa (aperta)" },
    "pulpitis-chronica-hyperplastica": { code: "pulpitis-chronica-hyperplastica", display: "Pulpitis chronica hyperplastica (pulpa-polyp)" },
    "necrosis-pulpae": { code: "necrosis-pulpae", display: "Necrosis pulpae" },
    "gangraena-pulpae": { code: "gangraena-pulpae", display: "Gangraena pulpae" },
  },
  apicalDx: {
    "normal": { code: "normal", display: "No apical pathology" },
    "symptomatic-apical-periodontitis": { code: "symptomatic-apical-periodontitis", display: "Symptomatic apical periodontitis" },
    "asymptomatic-apical-periodontitis": { code: "asymptomatic-apical-periodontitis", display: "Asymptomatic apical periodontitis" },
    "acute-apical-abscess": { code: "acute-apical-abscess", display: "Acute apical abscess" },
    "chronic-apical-abscess": { code: "chronic-apical-abscess", display: "Chronic apical abscess" },
    "condensing-osteitis": { code: "condensing-osteitis", display: "Condensing osteitis" },
  },
  resorptionType: {
    "none": { code: "none", display: "No root resorption" },
    "internal": { code: "internal", display: "Internal root resorption" },
    "external-cervical": { code: "external-cervical", display: "External cervical root resorption" },
  },
  wearEdge: {
    "none": { code: "none", display: "No incisal/occlusal wear" },
    "attrition": { code: "attrition", display: "Attrition (tooth-to-tooth wear)" },
    "erosion": { code: "erosion", display: "Erosion (chemical/acid wear)" },
  },
  wearCervical: {
    "none": { code: "none", display: "No cervical wear" },
    "abrasion": { code: "abrasion", display: "Abrasion (mechanical cervical wear)" },
    "abfraction": { code: "abfraction", display: "Abfraction (cervical stress lesion)" },
    "erosion": { code: "erosion", display: "Erosion (chemical/acid wear)" },
  },
  discoloration: {
    "none": { code: "none", display: "No discoloration" },
    "tetracycline": { code: "tetracycline", display: "Tetracycline staining" },
    "fluorosis": { code: "fluorosis", display: "Dental fluorosis" },
    "nonvital": { code: "nonvital", display: "Non-vital (pulp-death) darkening" },
    "extrinsic": { code: "extrinsic", display: "Extrinsic staining" },
    "other": { code: "other", display: "Other / unknown discoloration" },
  },
  // Orthodontic axes. `orthoRotation` is a boolean axis (no value map).
  orthoAppliance: {
    "none": { code: "none", display: "No orthodontic appliance" },
    "bracket": { code: "bracket", display: "Fixed bracket" },
    "band": { code: "band", display: "Orthodontic band" },
  },
  orthoDrift: {
    "none": { code: "none", display: "No drift" },
    "mesial": { code: "mesial", display: "Mesial drift" },
    "distal": { code: "distal", display: "Distal drift" },
  },
  orthoVertical: {
    "none": { code: "none", display: "No vertical malposition" },
    "extrusion": { code: "extrusion", display: "Extrusion" },
    "intrusion": { code: "intrusion", display: "Intrusion" },
  },
  // `rootCaries` is a normal enum axis (registered in axes.ts/fieldMappings.ts).
  // `secondaryCaries` (CARS 0-6) and `radiographicDepth` are per-surface scalar
  // maps handled the same way `cariesDepths` is (special-cased outside AXES) —
  // `secondaryCaries` has no value-map group (a raw integer score, like ICDAS),
  // `radiographicDepth` does.
  rootCaries: {
    "none": { code: "none", display: "No root caries" },
    "active": { code: "active", display: "Active root caries" },
    "arrested": { code: "arrested", display: "Arrested root caries" },
    "active-cavitated": { code: "active-cavitated", display: "Active cavitated root caries" },
  },
  // Two per-tooth categorical DATA axes. NO svgLayer — neither renders. Local
  // codes only (no verified SNOMED/LOINC).
  cejVisibility: {
    "none": { code: "none", display: "CEJ visibility not assessed" },
    "detectable": { code: "detectable", display: "CEJ detectable" },
    "not-detectable": { code: "not-detectable", display: "CEJ not detectable" },
  },
  rootConcavity: {
    "none": { code: "none", display: "No root concavity" },
    "mild": { code: "mild", display: "Mild root concavity" },
    "deep": { code: "deep", display: "Deep root concavity" },
  },
  // Two per-tooth categorical DATA axes. NO svgLayer — neither renders. Local
  // codes only (no verified SNOMED/LOINC).
  gingivalThickness: {
    "unknown": { code: "unknown", display: "Gingival thickness not assessed" },
    "thin": { code: "thin", display: "Thin gingival phenotype" },
    "medium": { code: "medium", display: "Medium gingival phenotype" },
    "thick": { code: "thick", display: "Thick gingival phenotype" },
  },
  millerClass: {
    "none": { code: "none", display: "No recession class assigned" },
    "i": { code: "i", display: "Miller Class I" },
    "ii": { code: "ii", display: "Miller Class II" },
    "iii": { code: "iii", display: "Miller Class III" },
    "iv": { code: "iv", display: "Miller Class IV" },
  },
  periImplant: {
    "none": { code: "none", display: "Peri-implant health" },
    "mucositis": { code: "mucositis", display: "Peri-implant mucositis" },
    "peri-implantitis-mild": { code: "peri-implantitis-mild", display: "Peri-implantitis, mild bone loss" },
    "peri-implantitis-moderate": { code: "peri-implantitis-moderate", display: "Peri-implantitis, moderate bone loss" },
    "peri-implantitis-severe": { code: "peri-implantitis-severe", display: "Peri-implantitis, severe bone loss" },
  },
  radiographicDepth: {
    "none": { code: "none", display: "No radiographic caries depth recorded" },
    "E1": { code: "E1", display: "Enamel, outer half (E1)" },
    "E2": { code: "E2", display: "Enamel, inner half (E2)" },
    "D1": { code: "D1", display: "Dentin, outer third (D1)" },
    "D2": { code: "D2", display: "Dentin, middle third (D2)" },
    "D3": { code: "D3", display: "Dentin, inner third (D3)" },
  },
  fillingDefect: {
    "none": { code: "none", display: "No filling defect" },
    "marginal": { code: "marginal", display: "Marginal defect (overhang / deficient margin)" },
    "fracture": { code: "fracture", display: "Fractured / chipped filling" },
    "wear": { code: "wear", display: "Worn / deficient filling material" },
  },
};

/**
 * Verified SNOMED CT codes, keyed by "<group>:<value>".
 * CURRENTLY EMPTY — so no SNOMED coding is emitted by the export; the local
 * system is the only coding produced for clinical states. When entries are
 * added here (codes verified against the official SNOMED CT browser), they are
 * emitted as additional codings in the export. The mapper works with or without
 * entries — they are purely additive.
 */
export const SNOMED_CODES: Record<string, string> = {};
