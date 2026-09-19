// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Declarative description of how each serialized tooth field becomes one or
 * more FHIR Observations. The generic emitter in toFhir.ts reads this table,
 * so adding coverage means adding a row here.
 */
export type FieldKind =
  | "enum"        // single coded value; emit if value present and not skipValue
  | "boolean"     // flag; emit when true
  | "set"         // string[]; one Observation, one component per member
  | "restoration"; // fillingMaterial + fillingSurfaces combined

interface BaseMapping {
  /** Key in the ToothRecord. */
  field: string;
  /** Local code for the finding TYPE (Observation.code). */
  findingCode: string;
  findingDisplay: string;
}

/**
 * Discriminated by `kind`. enum/set/restoration require a `valueGroup`, so the
 * emitter in toFhir.ts never needs a non-null assertion. `restoration` also
 * requires `surfacesField`; `boolean` carries no value decoding.
 */
export type FieldMapping =
  | (BaseMapping & { kind: "enum"; valueGroup: string; skipValue?: string })
  | (BaseMapping & { kind: "set"; valueGroup: string })
  | (BaseMapping & { kind: "restoration"; valueGroup: string; surfacesField: string; skipValue?: string })
  | (BaseMapping & { kind: "boolean" });

export const FIELD_MAPPINGS: FieldMapping[] = [
  { field: "toothSelection", kind: "enum", valueGroup: "toothSelection", skipValue: "tooth-base", findingCode: "tooth-status", findingDisplay: "Tooth status" },
  { field: "endo", kind: "enum", valueGroup: "endo", skipValue: "none", findingCode: "endodontic-status", findingDisplay: "Endodontic status" },
  { field: "toothSubstrate", kind: "enum", valueGroup: "toothSubstrate", skipValue: "natural", findingCode: "tooth-substrate", findingDisplay: "Tooth substrate" },
  { field: "restorationType", kind: "enum", valueGroup: "restorationType", skipValue: "none", findingCode: "restoration-type", findingDisplay: "Restoration type" },
  { field: "restorationMaterial", kind: "enum", valueGroup: "restorationMaterial", skipValue: "none", findingCode: "restoration-material", findingDisplay: "Restoration material" },
  { field: "prosthesis", kind: "enum", valueGroup: "prosthesis", skipValue: "none", findingCode: "prosthesis-type", findingDisplay: "Prosthesis / attachment" },
  { field: "mobility", kind: "enum", valueGroup: "mobility", skipValue: "none", findingCode: "tooth-mobility", findingDisplay: "Tooth mobility" },

  { field: "caries", kind: "set", valueGroup: "caries", findingCode: "caries", findingDisplay: "Dental caries" },
  { field: "mods", kind: "set", valueGroup: "mods", findingCode: "tooth-modifier", findingDisplay: "Tooth modifier" },
  { field: "calculus", kind: "boolean", findingCode: "calculus", findingDisplay: "Dental calculus" },
  { field: "periapicalType", kind: "enum", valueGroup: "periapicalType", skipValue: "none", findingCode: "periapical-lesion-type", findingDisplay: "Periapical lesion type" },

  { field: "fillingMaterial", kind: "restoration", valueGroup: "fillingMaterial", skipValue: "none", surfacesField: "fillingSurfaces", findingCode: "restoration", findingDisplay: "Dental restoration" },

  { field: "endoResection", kind: "boolean", findingCode: "apicoectomy", findingDisplay: "Apicoectomy / root resection" },
  { field: "fissureSealing", kind: "boolean", findingCode: "fissure-sealing", findingDisplay: "Fissure sealing" },
  { field: "contactMesial", kind: "boolean", findingCode: "contact-mesial", findingDisplay: "Mesial contact issue" },
  { field: "contactDistal", kind: "boolean", findingCode: "contact-distal", findingDisplay: "Distal contact issue" },
  { field: "brokenMesial", kind: "boolean", findingCode: "broken-mesial", findingDisplay: "Mesial fracture" },
  { field: "brokenIncisal", kind: "boolean", findingCode: "broken-incisal", findingDisplay: "Incisal fracture" },
  { field: "brokenDistal", kind: "boolean", findingCode: "broken-distal", findingDisplay: "Distal fracture" },
  { field: "parapulpalPin", kind: "boolean", findingCode: "parapulpal-pin", findingDisplay: "Parapulpal pin" },
  { field: "bridgePillar", kind: "boolean", findingCode: "bridge-pillar", findingDisplay: "Bridge abutment (pillar)" },
  { field: "extractionWound", kind: "boolean", findingCode: "extraction-wound", findingDisplay: "Extraction wound" },
  { field: "extractionPlan", kind: "boolean", findingCode: "extraction-planned", findingDisplay: "Planned extraction" },
  { field: "crownReplace", kind: "boolean", findingCode: "crown-replace-planned", findingDisplay: "Planned crown replacement" },
  { field: "crownNeeded", kind: "boolean", findingCode: "crown-needed", findingDisplay: "Crown needed" },
  { field: "missingClosed", kind: "boolean", findingCode: "missing-gap-closed", findingDisplay: "Closed gap (missing tooth)" },
  { field: "crownLeakage", kind: "boolean", findingCode: "crown-leakage", findingDisplay: "Crown marginal leakage" },

  // Pulp/apical/resorption diagnosis axes (see axes.ts).
  { field: "pulpDx", kind: "enum", valueGroup: "pulpDx", skipValue: "normal", findingCode: "pulp-diagnosis", findingDisplay: "Pulp diagnosis (AAE)" },
  { field: "pulpLatin", kind: "enum", valueGroup: "pulpLatin", skipValue: "none", findingCode: "pulp-diagnosis-latin", findingDisplay: "Pulp diagnosis (Latin, practical)" },
  { field: "apicalDx", kind: "enum", valueGroup: "apicalDx", skipValue: "normal", findingCode: "apical-diagnosis", findingDisplay: "Apical diagnosis (AAE)" },
  { field: "resorptionType", kind: "enum", valueGroup: "resorptionType", skipValue: "none", findingCode: "root-resorption-type", findingDisplay: "Root resorption type" },
  { field: "wearEdge", kind: "enum", valueGroup: "wearEdge", skipValue: "none", findingCode: "tooth-wear-edge", findingDisplay: "Incisal/occlusal wear" },
  { field: "wearCervical", kind: "enum", valueGroup: "wearCervical", skipValue: "none", findingCode: "tooth-wear-cervical", findingDisplay: "Cervical wear" },
  { field: "discoloration", kind: "enum", valueGroup: "discoloration", skipValue: "none", findingCode: "tooth-discoloration", findingDisplay: "Tooth discoloration" },

  // Orthodontic axes (see axes.ts).
  { field: "orthoAppliance", kind: "enum", valueGroup: "orthoAppliance", skipValue: "none", findingCode: "tooth-ortho-appliance", findingDisplay: "Orthodontic appliance" },
  { field: "orthoDrift", kind: "enum", valueGroup: "orthoDrift", skipValue: "none", findingCode: "tooth-ortho-drift", findingDisplay: "Orthodontic drift" },
  { field: "orthoVertical", kind: "enum", valueGroup: "orthoVertical", skipValue: "none", findingCode: "tooth-ortho-vertical", findingDisplay: "Vertical malposition" },
  { field: "orthoRotation", kind: "boolean", findingCode: "tooth-ortho-rotation", findingDisplay: "Tooth rotation" },

  // Caries fields (see axes.ts). `secondaryCaries`/`radiographicDepth` are
  // per-surface scalar maps, special-cased outside this table exactly like
  // `cariesDepths` — no row here for them by design.
  { field: "rootCaries", kind: "enum", valueGroup: "rootCaries", skipValue: "none", findingCode: "root-caries", findingDisplay: "Root caries" },

  // Peri-implantitis (see axes.ts).
  { field: "periImplant", kind: "enum", valueGroup: "periImplant", skipValue: "none", findingCode: "peri-implant-status", findingDisplay: "Peri-implant status" },

  // cejVisibility + rootConcavity data axes (see axes.ts). Declarative enum path
  // — a set tooth emits the axis coding, a `none` tooth emits none.
  { field: "cejVisibility", kind: "enum", valueGroup: "cejVisibility", skipValue: "none", findingCode: "cej-visibility", findingDisplay: "CEJ visibility" },
  { field: "rootConcavity", kind: "enum", valueGroup: "rootConcavity", skipValue: "none", findingCode: "root-concavity", findingDisplay: "Root concavity" },

  // gingivalThickness + millerClass data axes (see axes.ts). Declarative enum
  // path — a set tooth emits the axis coding, a skip-value tooth emits none.
  { field: "gingivalThickness", kind: "enum", valueGroup: "gingivalThickness", skipValue: "unknown", findingCode: "gingival-thickness", findingDisplay: "Gingival thickness" },
  { field: "millerClass", kind: "enum", valueGroup: "millerClass", skipValue: "none", findingCode: "miller-recession-class", findingDisplay: "Miller recession class" },
];
