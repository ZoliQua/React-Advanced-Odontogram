// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * One `ClinicalAxis` per `FIELD_MAPPINGS` row (`src/fhir/fieldMappings.ts`), with
 * finding codes and value codings drawn from `LOCAL_VALUE_MAPS`
 * (`src/fhir/codesystems.ts`). `src/__tests__/parity.test.ts` enforces that this
 * catalog matches the field/value tables verbatim.
 */
import type { ClinicalAxis } from "./types";
import { LOCAL_VALUE_MAPS } from "../fhir/codesystems";

const valuesFrom = (group: string) =>
  Object.values(LOCAL_VALUE_MAPS[group]).map(e => ({ id: e.code, coding: { local: e.code, display: e.display } }));

/** Attach `svgLayer` render metadata to values whose activation is a clean id
 *  (or fixed id set) in `odontogram.ts`. Values absent from `layers` are returned
 *  unchanged (no `svgLayer`). */
const withSvgLayer = (
  values: ReturnType<typeof valuesFrom>,
  layers: Record<string, string | string[]>,
) => values.map(v => (v.id in layers ? { ...v, svgLayer: layers[v.id] } : v));

/** Maps each id in `ids` to itself — for axes whose value id equals its SVG layer id. */
const sameIdLayers = (ids: string[]): Record<string, string> =>
  Object.fromEntries(ids.map(id => [id, id]));

export const AXES: ClinicalAxis[] = [
  { id: "toothSelection", field: "toothSelection", kind: "enum", valueGroup: "toothSelection",
    skipValue: "tooth-base", finding: { local: "tooth-status", display: "Tooth status" },
    values: withSvgLayer(valuesFrom("toothSelection"), {
      "implant": "implant",
      "milktooth": "milktooth",
      "tooth-under-gum": "tooth-under-gum",
      "no-tooth-after-extraction": "no-tooth-after-extraction",
    }),
    uiOptions: [
      { value: "none", labelKey: "toothSelect.none" },
      { value: "tooth-base", labelKey: "toothSelect.permanent" },
      { value: "milktooth", labelKey: "toothSelect.milk" },
      { value: "implant", labelKey: "toothSelect.implant" },
      { value: "tooth-under-gum", labelKey: "toothSelect.underGum" },
    ] },
  { id: "endo", field: "endo", kind: "enum", valueGroup: "endo",
    skipValue: "none", finding: { local: "endodontic-status", display: "Endodontic status" },
    values: withSvgLayer(valuesFrom("endo"), {
      "endo-medical-filling": "endo-medical-filling",
      "endo-filling": "endo-filling",
      "endo-filling-incomplete": "endo-filling-incomplete",
      "endo-glass-pin": ["endo-filling", "endo-glass-pin"],
      "endo-metal-pin": ["endo-filling", "endo-metal-pin"],
    }),
    uiOptions: [
      { value: "none", labelKey: "endo.option.none" },
      { value: "endo-medical-filling", labelKey: "endo.option.medicalFilling" },
      { value: "endo-filling", labelKey: "endo.option.filling", when: (c) => !c.isMilktooth },
      { value: "endo-filling-incomplete", labelKey: "endo.option.incompleteFilling", when: (c) => !c.isMilktooth },
      { value: "endo-glass-pin", labelKey: "endo.option.glassPin", when: (c) => !c.isMilktooth },
      { value: "endo-metal-pin", labelKey: "endo.option.metalPin", when: (c) => !c.isMilktooth },
    ] },
  { id: "toothSubstrate", field: "toothSubstrate", kind: "enum", valueGroup: "toothSubstrate",
    skipValue: "natural", finding: { local: "tooth-substrate", display: "Tooth substrate" },
    values: valuesFrom("toothSubstrate") },
  { id: "restorationType", field: "restorationType", kind: "enum", valueGroup: "restorationType",
    skipValue: "none", finding: { local: "restoration-type", display: "Restoration type" },
    values: valuesFrom("restorationType") },
  { id: "restorationMaterial", field: "restorationMaterial", kind: "enum", valueGroup: "restorationMaterial",
    skipValue: "none", finding: { local: "restoration-material", display: "Restoration material" },
    values: valuesFrom("restorationMaterial") },
  { id: "prosthesis", field: "prosthesis", kind: "enum", valueGroup: "prosthesis",
    skipValue: "none", finding: { local: "prosthesis-type", display: "Prosthesis / attachment" },
    values: valuesFrom("prosthesis") },
  { id: "mobility", field: "mobility", kind: "enum", valueGroup: "mobility",
    skipValue: "none", finding: { local: "tooth-mobility", display: "Tooth mobility" },
    values: valuesFrom("mobility"),
    uiOptions: [
      { value: "none", labelKey: "mobility.none" }, { value: "m1", labelKey: "mobility.m1" },
      { value: "m2", labelKey: "mobility.m2" }, { value: "m3", labelKey: "mobility.m3" },
    ] },

  { id: "caries", field: "caries", kind: "set", valueGroup: "caries",
    finding: { local: "caries", display: "Dental caries" },
    values: withSvgLayer(valuesFrom("caries"), sameIdLayers([
      "caries-subcrown", "caries-buccal", "caries-lingual", "caries-mesial", "caries-distal", "caries-occlusal",
    ])) },
  { id: "mods", field: "mods", kind: "set", valueGroup: "mods",
    finding: { local: "tooth-modifier", display: "Tooth modifier" },
    values: withSvgLayer(valuesFrom("mods"), sameIdLayers(["inflammation", "parodontal", "mobility"])),
    uiOptions: [
      { value: "parodontal", labelKey: "mods.parodontal" },
      { value: "inflammation", labelKey: "mods.periapicalInflammation" },
    ] },
  { id: "calculus", field: "calculus", kind: "boolean",
    finding: { local: "calculus", display: "Dental calculus" },
    svgLayer: "calculus",
    appliesWhen: (c, s) => !c.isImplant && !c.underGum && !c.extraction && s.toothSelection !== "none" },
  { id: "periapicalType", field: "periapicalType", kind: "enum", valueGroup: "periapicalType",
    skipValue: "none", finding: { local: "periapical-lesion-type", display: "Periapical lesion type" },
    values: withSvgLayer(valuesFrom("periapicalType"), {
      "granuloma": "granuloma",
      "cyst": "cysta",
      "abscess": "abscess",
    }),
    uiOptions: [
      { value: "none", labelKey: "periapical.type.none" }, { value: "granuloma", labelKey: "periapical.type.granuloma" },
      { value: "cyst", labelKey: "periapical.type.cyst" },
    ] },

  { id: "fillingMaterial", field: "fillingMaterial", kind: "restoration", valueGroup: "fillingMaterial",
    skipValue: "none", surfacesField: "fillingSurfaces", finding: { local: "restoration", display: "Dental restoration" },
    values: valuesFrom("fillingMaterial") },

  { id: "endoResection", field: "endoResection", kind: "boolean",
    finding: { local: "apicoectomy", display: "Apicoectomy / root resection" },
    svgLayer: "endo-resection", appliesWhen: (c) => c.toothPresent && !c.underGum && !c.extraction },
  { id: "fissureSealing", field: "fissureSealing", kind: "boolean",
    finding: { local: "fissure-sealing", display: "Fissure sealing" },
    svgLayer: "fissure-sealing", appliesWhen: (c) => c.fissureAllowed },
  { id: "contactMesial", field: "contactMesial", kind: "boolean",
    finding: { local: "contact-mesial", display: "Mesial contact issue" },
    svgLayer: "mesial-no-contact-point", appliesWhen: (c) => c.contactAllowed },
  { id: "contactDistal", field: "contactDistal", kind: "boolean",
    finding: { local: "contact-distal", display: "Distal contact issue" },
    svgLayer: "distal-no-contact-point", appliesWhen: (c) => c.contactAllowed },
  { id: "brokenMesial", field: "brokenMesial", kind: "boolean",
    finding: { local: "broken-mesial", display: "Mesial fracture" } },
  { id: "brokenIncisal", field: "brokenIncisal", kind: "boolean",
    finding: { local: "broken-incisal", display: "Incisal fracture" } },
  { id: "brokenDistal", field: "brokenDistal", kind: "boolean",
    finding: { local: "broken-distal", display: "Distal fracture" } },
  { id: "parapulpalPin", field: "parapulpalPin", kind: "boolean",
    finding: { local: "parapulpal-pin", display: "Parapulpal pin" },
    svgLayer: "parapulpal-pin", appliesWhen: (c) => c.toothPresent && !c.underGum && !c.extraction },
  { id: "bridgePillar", field: "bridgePillar", kind: "boolean",
    finding: { local: "bridge-pillar", display: "Bridge abutment (pillar)" } },
  { id: "extractionWound", field: "extractionWound", kind: "boolean",
    finding: { local: "extraction-wound", display: "Extraction wound" } },
  { id: "extractionPlan", field: "extractionPlan", kind: "boolean",
    finding: { local: "extraction-planned", display: "Planned extraction" },
    svgLayer: "extraction-plan", appliesWhen: (c) => c.extractionPlanAllowed },
  { id: "crownReplace", field: "crownReplace", kind: "boolean",
    finding: { local: "crown-replace-planned", display: "Planned crown replacement" },
    svgLayer: "crown-replace",
    appliesWhen: (c, s) => s.toothSelection === "tooth-base" && s.restorationType !== "none" },
  { id: "crownNeeded", field: "crownNeeded", kind: "boolean",
    finding: { local: "crown-needed", display: "Crown needed" },
    svgLayer: "crown-needed",
    appliesWhen: (c, s) => s.toothSelection === "tooth-base" && s.restorationType === "none" && ["natural","broken","crownprep"].includes(s.toothSubstrate) },
  { id: "missingClosed", field: "missingClosed", kind: "boolean",
    finding: { local: "missing-gap-closed", display: "Closed gap (missing tooth)" },
    svgLayer: "missing-closed", appliesWhen: (c) => c.isNone },
  // Crown marginal-leakage toggle. Activates the `crown-leakage` SVG artwork
  // layer (see src/__tests__/svg-assets.test.ts).
  { id: "crownLeakage", field: "crownLeakage", kind: "boolean",
    finding: { local: "crown-leakage", display: "Crown marginal leakage" },
    svgLayer: "crown-leakage",
    appliesWhen: (c, s) => s.restorationType === "crown" || s.restorationType === "bridge" },

  // Pulp/apical/resorption diagnosis axes. `pulpDx` render is bespoke
  // (milktooth/permanent split in odontogram.ts), so unlike `resorptionType`
  // below it deliberately carries no `svgLayer` metadata here.
  { id: "pulpDx", field: "pulpDx", kind: "enum", valueGroup: "pulpDx",
    skipValue: "normal", finding: { local: "pulp-diagnosis", display: "Pulp diagnosis (AAE)" },
    values: valuesFrom("pulpDx") },
  { id: "pulpLatin", field: "pulpLatin", kind: "enum", valueGroup: "pulpLatin",
    skipValue: "none", flag: "latinPulpDetail",
    finding: { local: "pulp-diagnosis-latin", display: "Pulp diagnosis (Latin, practical)" },
    values: valuesFrom("pulpLatin") },
  { id: "apicalDx", field: "apicalDx", kind: "enum", valueGroup: "apicalDx",
    skipValue: "normal", finding: { local: "apical-diagnosis", display: "Apical diagnosis (AAE)" },
    values: valuesFrom("apicalDx") },
  { id: "resorptionType", field: "resorptionType", kind: "enum", valueGroup: "resorptionType",
    skipValue: "none", finding: { local: "root-resorption-type", display: "Root resorption type" },
    values: valuesFrom("resorptionType"),
    // Both `internal` and `external-cervical` render the single `endo-resorption`
    // layer (visually identical; only the data distinguishes them). The axis-level
    // svgLayer/appliesWhen is metadata only (kept for the clear-set and
    // svg-layers.test.ts coverage) — `applyFlagLayers` only auto-activates
    // boolean-kind axes, so the actual activation is explicit in
    // applyStateToSvgSingle (odontogram.ts).
    svgLayer: "endo-resorption", appliesWhen: (c) => c.toothPresent },

  // Incisal/occlusal + cervical wear type enums (mirror resorptionType above).
  { id: "wearEdge", field: "wearEdge", kind: "enum", valueGroup: "wearEdge",
    skipValue: "none", finding: { local: "tooth-wear-edge", display: "Incisal/occlusal wear" },
    values: valuesFrom("wearEdge"),
    // All types render the single `tooth-bruxism-wear` layer; the axis svgLayer is
    // metadata only (svg-layers.test coverage) — activation is explicit in
    // applyStateToSvgSingle (applyFlagLayers only auto-activates boolean axes).
    svgLayer: "tooth-bruxism-wear", appliesWhen: (c) => c.bruxismAllowed },
  { id: "wearCervical", field: "wearCervical", kind: "enum", valueGroup: "wearCervical",
    skipValue: "none", finding: { local: "tooth-wear-cervical", display: "Cervical wear" },
    values: valuesFrom("wearCervical"),
    svgLayer: "tooth-bruxism-neck-wear", appliesWhen: (c) => c.bruxismAllowed },

  { id: "discoloration", field: "discoloration", kind: "enum", valueGroup: "discoloration",
    skipValue: "none", finding: { local: "tooth-discoloration", display: "Tooth discoloration" },
    // No svgLayer: activation is explicit in applyStateToSvgSingle — it tints the
    // crown path's .style.fill (no layer toggle), so there is no layer to declare.
    values: valuesFrom("discoloration") },

  // The 3 enum ortho axes mirror wearEdge: svgLayer is metadata only (activation
  // stays explicit in applyStateToSvgSingle; applyFlagLayers only auto-activates
  // boolean-kind axes). `orthoRotation` (boolean) deliberately omits svgLayer,
  // mirroring pulpDx, so applyFlagLayers never auto-activates it — it is rendered
  // explicitly in applyStateToSvgSingle.
  { id: "orthoAppliance", field: "orthoAppliance", kind: "enum", valueGroup: "orthoAppliance",
    skipValue: "none", finding: { local: "tooth-ortho-appliance", display: "Orthodontic appliance" },
    values: valuesFrom("orthoAppliance"),
    svgLayer: "ortho-bracket", appliesWhen: (c) => c.toothPresent },
  { id: "orthoDrift", field: "orthoDrift", kind: "enum", valueGroup: "orthoDrift",
    skipValue: "none", finding: { local: "tooth-ortho-drift", display: "Orthodontic drift" },
    values: valuesFrom("orthoDrift"),
    svgLayer: "arrow-mesial", appliesWhen: (c) => c.toothPresent },
  { id: "orthoVertical", field: "orthoVertical", kind: "enum", valueGroup: "orthoVertical",
    skipValue: "none", finding: { local: "tooth-ortho-vertical", display: "Vertical malposition" },
    values: valuesFrom("orthoVertical"),
    svgLayer: "arrow-up", appliesWhen: (c) => c.toothPresent },
  { id: "orthoRotation", field: "orthoRotation", kind: "boolean",
    finding: { local: "tooth-ortho-rotation", display: "Tooth rotation" } },

  // `rootCaries` is a normal enum axis. `secondaryCaries` (per-surface CARS 0-6)
  // and `radiographicDepth` (per-surface none/E1/E2/D1/D2/D3) are scalar-map fields
  // special-cased outside AXES/FIELD_MAPPINGS entirely (see registry/fhir.ts and
  // registry/fromFhir.ts), so they deliberately have no row here.
  { id: "rootCaries", field: "rootCaries", kind: "enum", valueGroup: "rootCaries",
    skipValue: "none", finding: { local: "root-caries", display: "Root caries" },
    values: valuesFrom("rootCaries"),
    svgLayer: "caries-root", appliesWhen: (c) => c.toothPresent },

  // `cejVisibility` and `rootConcavity` are per-tooth categorical data axes. No
  // svgLayer: neither renders on the odontogram (SVG-fingerprint parity), and both
  // serialize declaratively via FIELD_MAPPINGS.
  { id: "cejVisibility", field: "cejVisibility", kind: "enum", valueGroup: "cejVisibility",
    skipValue: "none", finding: { local: "cej-visibility", display: "CEJ visibility" },
    values: valuesFrom("cejVisibility") },
  { id: "rootConcavity", field: "rootConcavity", kind: "enum", valueGroup: "rootConcavity",
    skipValue: "none", finding: { local: "root-concavity", display: "Root concavity" },
    values: valuesFrom("rootConcavity") },

  // Gingival thickness (GT) + Miller recession class — two per-tooth categorical
  // data axes. No svgLayer: neither renders on the odontogram (SVG-fingerprint
  // parity), mirroring the cejVisibility/rootConcavity axes above.
  { id: "gingivalThickness", field: "gingivalThickness", kind: "enum", valueGroup: "gingivalThickness",
    skipValue: "unknown", finding: { local: "gingival-thickness", display: "Gingival thickness" },
    values: valuesFrom("gingivalThickness") },
  { id: "millerClass", field: "millerClass", kind: "enum", valueGroup: "millerClass",
    skipValue: "none", finding: { local: "miller-recession-class", display: "Miller recession class" },
    values: valuesFrom("millerClass") },

  { id: "periImplant", field: "periImplant", kind: "enum", valueGroup: "periImplant",
    skipValue: "none", finding: { local: "peri-implant-status", display: "Peri-implant status" },
    // No svgLayer: activation is explicit in applyStateToSvgSingle (mucositis reuses
    // the `parodontal` glyph; peri-implantitis adds `peri-implant-bone-loss` at
    // severity-scaled opacity). The bone-loss layer exists only on the 4 implant
    // SVGs, so it must NOT be declared as an axis svgLayer (which svg-layers.test.ts
    // would expect on every tooth). Mirrors the apicalDx axis.
    values: valuesFrom("periImplant") },
];
