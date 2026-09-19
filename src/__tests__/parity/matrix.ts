// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Deterministic parity matrix: every enum value / surface / boolean in isolation,
// plus curated tricky combinations, over the 6 representative templates.
import { VALID_TOOTH_SELECTION, VALID_ENDO,
  VALID_MOBILITY, VALID_PERIAPICAL_TYPE, VALID_CARIES, VALID_FILLING_MATERIAL, VALID_FILLING_SURFACES,
  VALID_MODS } from "../../odontogram";

// Frozen legacy vocabularies (Task 4 retired the live `crownMaterial`/`bridgeUnit`
// axes + their VALID_* exports and LOCAL_VALUE_MAPS entries). hydrateState's
// input-side migration branch still accepts these exact raw string values on
// import (backward compat), so the matrix hardcodes them here — verbatim, same
// order — to keep exercising that legacy path without depending on any exported
// vocabulary set. (Mirrors the pre-Task-4 LOCAL_VALUE_MAPS.crownMaterial /
// .bridgeUnit key order exactly, so the SVG golden fingerprints are unaffected.)
const LEGACY_CROWN_MATERIAL_VALUES = [
  "natural", "broken", "crownprep", "radix", "emax", "zircon", "metal", "temporary",
  "telescope", "healing-abutment", "locator", "locator-prosthesis", "bar", "bar-prosthesis",
];
const LEGACY_BRIDGE_UNIT_VALUES = ["none", "removable", "zircon", "metal", "temporary", "bar", "bar-prosthesis"];

const TEMPLATES: { toothNo: number; template: string; view: "front"|"occlusal" }[] = [
  { toothNo: 11, template: "11", view: "front" },
  { toothNo: 13, template: "13", view: "front" },
  { toothNo: 14, template: "14", view: "front" },
  { toothNo: 16, template: "16", view: "front" },
  { toothNo: 14, template: "14_occl", view: "occlusal" },
  { toothNo: 16, template: "16_occl", view: "occlusal" },
];

// `rootResorption` and `pulpInflam` (retired booleans, SP4 Task 2 / Task 3)
// are intentionally kept here — like LEGACY_CROWN_MATERIAL_VALUES above,
// this hardcodes the legacy raw field names so the matrix keeps exercising
// hydrateState's `rootResorption` -> `resorptionType` and `pulpInflam` ->
// `pulpDx` migration branches even though the live axes are gone. The
// (byte-identical) new-model equivalents are authored directly in
// `resorptionTypeParityCases()` / `pulpDxParityCases()` below.
const BOOLEAN_FIELDS = [
  "pulpInflam","endoResection","rootResorption","fissureSealing","calculus","contactMesial","contactDistal",
  "bruxismWear","bruxismNeckWear","brokenMesial","brokenIncisal","brokenDistal","parapulpalPin","bridgePillar",
  "extractionWound","extractionPlan","crownReplace","crownNeeded","missingClosed",
];

const ENUM_FIELDS: [string, Iterable<string>][] = [
  ["toothSelection", VALID_TOOTH_SELECTION], ["crownMaterial", LEGACY_CROWN_MATERIAL_VALUES],
  ["endo", VALID_ENDO], ["bridgeUnit", LEGACY_BRIDGE_UNIT_VALUES], ["mobility", VALID_MOBILITY],
  ["periapicalType", VALID_PERIAPICAL_TYPE], ["fillingMaterial", VALID_FILLING_MATERIAL],
];

function baseState(): Record<string, unknown> { return { toothSelection: "tooth-base" }; }

// Curated tricky combinations (the 6 non-trivial render behaviors).
function trickyStates(): { label: string; state: Record<string, unknown> }[] {
  return [
    { label: "broken-mesial-incisal-distal", state: { toothSelection:"tooth-base", crownMaterial:"broken", brokenMesial:true, brokenIncisal:true, brokenDistal:true } },
    { label: "broken-mesial", state: { toothSelection:"tooth-base", crownMaterial:"broken", brokenMesial:true } },
    { label: "caries+filling-occlusal", state: { toothSelection:"tooth-base", caries:["caries-occlusal"], fillingMaterial:"amalgam", fillingSurfaces:["occlusal"], fillingSurfaceMaterials:{ occlusal:"amalgam" } } },
    { label: "periapical+inflammation", state: { toothSelection:"tooth-base", mods:["inflammation"], periapicalType:"cyst" } },
    { label: "inflammation+endo-resection", state: { toothSelection:"tooth-base", mods:["inflammation"], endoResection:true } },
    // Legacy raw field (see BOOLEAN_FIELDS comment) — migrates to resorptionType:"external-cervical".
    { label: "inflammation+root-resorption", state: { toothSelection:"tooth-base", mods:["inflammation"], rootResorption:true } },
    { label: "implant+metal-crown", state: { toothSelection:"implant", crownMaterial:"metal" } },
    { label: "removable-bridge", state: { toothSelection:"none", bridgeUnit:"removable" } },
    { label: "extraction-wound", state: { toothSelection:"none", extractionWound:true } },
    // crown-replace: gate needs crownMaterial in {emax,zircon,metal,temporary,telescope} (never active in base/enum rows)
    { label: "crown-replace-metal", state: { toothSelection:"tooth-base", crownMaterial:"metal", crownReplace:true } },
    { label: "crown-replace-emax", state: { toothSelection:"tooth-base", crownMaterial:"emax", crownReplace:true } },
    // missing-closed: gate needs toothSelection === "none"
    { label: "missing-closed", state: { toothSelection:"none", missingClosed:true } },
    // boolean appliesWhen SUPPRESSION: calculus must not render off a present tooth-base
    { label: "calculus-on-implant", state: { toothSelection:"implant", calculus:true } },
    { label: "calculus-on-extracted", state: { toothSelection:"none", extractionWound:true, calculus:true } },
  ];
}

// New-model restoration coverage: states authored DIRECTLY in the new axes
// (toothSubstrate / restorationType / restorationMaterial), bypassing the
// legacy `crownMaterial`/`bridgeUnit` hydrateState migration branch entirely
// (raw.restorationType !== undefined short-circuits it). These exercise
// materials/types the legacy `crownMaterial` enum cannot express: gold/gradia/
// metal-ceramic crowns, inlay/veneer across all their supported materials, a
// bridge on a non-legacy-enum material, and directly-authored toothSubstrate
// values. Applies to every template (front + occlusal) like the other
// per-template generators.
const NEW_MODEL_INLAY_VENEER_MATERIALS = ["emax", "gold", "gradia", "zircon", "temporary"];

function newModelRestorationCases(): { label: string; state: Record<string, unknown> }[] {
  const cases: { label: string; state: Record<string, unknown> }[] = [
    // Crown materials the legacy `crownMaterial` enum cannot name directly
    // (gold/gradia already reach "crown" via legacy migration; metal-ceramic
    // is the deliberate rename target of legacy "metal" — here authored raw).
    { label: "crown-gold-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"gold" } },
    { label: "crown-gradia-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"gradia" } },
    { label: "crown-metal-ceramic-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"metal-ceramic" } },
    // Bridge on a new (non-legacy-fixed) material.
    { label: "bridge-gold-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"bridge", restorationMaterial:"gold" } },
    { label: "bridge-gradia-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"bridge", restorationMaterial:"gradia" } },
    // toothSubstrate authored directly, with no restoration on top.
    { label: "substrate-radix-new", state: { toothSelection:"tooth-base", toothSubstrate:"radix" } },
    { label: "substrate-crownprep-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep" } },
  ];
  for (const m of NEW_MODEL_INLAY_VENEER_MATERIALS) {
    cases.push({ label: `inlay-${m}-new`, state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"inlay", restorationMaterial:m } });
    cases.push({ label: `veneer-${m}-new`, state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"veneer", restorationMaterial:m } });
  }
  return cases;
}

// Onlay is occlusalOnly (RESTORATION_MATRIX) and its SVG layers only exist on
// the `*_occl` templates — pushed only for those templates, never for front.
function newModelOcclusalOnlyCases(): { label: string; state: Record<string, unknown> }[] {
  return NEW_MODEL_INLAY_VENEER_MATERIALS.map(m => ({
    label: `onlay-${m}-new`,
    state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"onlay", restorationMaterial:m },
  }));
}

// SP4 Task 2 parity proof: `resorptionType` (enum, new-model, authored
// directly — bypasses hydrateState's `rootResorption` legacy-migration branch
// entirely) must render the identical `endo-resorption` layer set that the
// retired `rootResorption:true` boolean produced, including the
// `inflammationHome` z-order lift when it coincides with `mods.inflammation`.
// Appended at the very end of svgCases() (outside the per-template loop, one
// template only) so it cannot shift any existing case's index/golden entry —
// parity.test.ts's byte-identical assertion is a matter of the resulting
// `layers` content matching, not index position.
function resorptionTypeParityCases(): { label: string; state: Record<string, unknown> }[] {
  return [
    // Equivalent to the legacy BOOLEAN_FIELDS "rootResorption:true" case above.
    { label: "resorptionType-external-cervical-new", state: { toothSelection:"tooth-base", resorptionType:"external-cervical" } },
    // Equivalent to the legacy trickyStates() "inflammation+root-resorption" case above.
    { label: "inflammation+resorptionType-external-cervical-new", state: { toothSelection:"tooth-base", mods:["inflammation"], resorptionType:"external-cervical" } },
    // "internal" was never expressible via the old boolean — proves both
    // subtypes activate the SAME endo-resorption layer (visually identical).
    { label: "resorptionType-internal-new", state: { toothSelection:"tooth-base", resorptionType:"internal" } },
  ];
}

// SP4 Task 3 parity proof: `pulpDx` (enum, new-model, authored directly —
// bypasses hydrateState's `pulpInflam` legacy-migration branch entirely) must
// render the identical pulp layer that the retired `pulpInflam:true` boolean
// produced, on both the permanent (`tooth-inflam-pulp`) and milktooth
// (`milktooth-inflam-pulp`) branches. Appended at the very end of svgCases()
// (outside the per-template loop, one template only) so it cannot shift any
// existing case's index/golden entry — parity.test.ts's byte-identical
// assertion is a matter of the resulting `layers` content matching, not
// index position. `showHealthyPulp` on/off coverage lives in the dedicated
// pulp-parity.test.ts unit test (this matrix always captures/replays under
// the module's default `showHealthyPulp:true`, and per-case toggling isn't
// something the capture/replay harness supports).
function pulpDxParityCases(): { label: string; state: Record<string, unknown> }[] {
  return [
    // Equivalent to the legacy BOOLEAN_FIELDS "pulpInflam:true" case above.
    { label: "pulpDx-irreversible-pulpitis-new", state: { toothSelection:"tooth-base", pulpDx:"irreversible-pulpitis" } },
    // Milktooth branch — never exercised by BOOLEAN_FIELDS/ENUM_FIELDS (those
    // only ever vary toothSelection OR a single boolean flag on a "tooth-base"
    // template, never both at once) — proves `milktooth-inflam-pulp` activates
    // identically off the enum as it did off the legacy boolean.
    { label: "pulpDx-irreversible-pulpitis-milktooth-new", state: { toothSelection:"milktooth", pulpDx:"irreversible-pulpitis" } },
    // "reversible-pulpitis" and "necrosis" were never expressible via the old
    // boolean — proves every non-"normal" pulpDx value activates the SAME
    // single tooth-inflam-pulp layer (visually identical; only the data
    // distinguishes them).
    { label: "pulpDx-reversible-pulpitis-new", state: { toothSelection:"tooth-base", pulpDx:"reversible-pulpitis" } },
    { label: "pulpDx-necrosis-new", state: { toothSelection:"tooth-base", pulpDx:"necrosis" } },
  ];
}

// SP4 Task 4 parity proof: the `apicalDx` clinical axis (enum, new-model,
// authored directly — bypasses hydrateState's mods.inflammation legacy-migration
// branch) drives the periapical glyph on a PRESENT tooth. Each non-"normal"
// value must render the same `inflammation`+glyph group the retired
// `mods.inflammation` render produced (see the equivalent legacy trickyStates()
// "periapical+inflammation" / "inflammation+endo-resection" /
// "inflammation+root-resorption" cases above), including the `inflammationHome`
// z-order lift. Appended at the very end of svgCases() (outside the per-template
// loop, one template only) so it cannot shift any existing case's index/golden
// entry — see resorptionTypeParityCases() doc. The mods.inflammation-on-missing
// periodontal role + the render-path equivalence live in the dedicated
// apical-parity.test.ts unit test.
function apicalDxParityCases(): { label: string; state: Record<string, unknown> }[] {
  return [
    // Equivalent to legacy { mods:["inflammation"] } (granuloma default glyph).
    { label: "apicalDx-asymptomatic-apical-periodontitis-new", state: { toothSelection:"tooth-base", apicalDx:"asymptomatic-apical-periodontitis" } },
    // Equivalent to legacy { mods:["inflammation"], periapicalType:"cyst" } (cysta glyph).
    { label: "apicalDx-with-cyst-subtype-new", state: { toothSelection:"tooth-base", apicalDx:"asymptomatic-apical-periodontitis", periapicalType:"cyst" } },
    // Equivalent to legacy { mods:["inflammation"], periapicalType:"abscess" } (abscess glyph).
    { label: "apicalDx-acute-apical-abscess-new", state: { toothSelection:"tooth-base", apicalDx:"acute-apical-abscess", periapicalType:"abscess" } },
    // apicalDx suggests the abscess glyph even without a periapicalType subtype.
    { label: "apicalDx-chronic-apical-abscess-new", state: { toothSelection:"tooth-base", apicalDx:"chronic-apical-abscess" } },
    // Equivalent to legacy { mods:["inflammation"], endoResection:true } — z-order lift.
    { label: "apicalDx-with-endo-resection-new", state: { toothSelection:"tooth-base", apicalDx:"asymptomatic-apical-periodontitis", endoResection:true } },
    // Equivalent to legacy { mods:["inflammation"], rootResorption:true } — z-order lift.
    { label: "apicalDx-with-resorption-new", state: { toothSelection:"tooth-base", apicalDx:"asymptomatic-apical-periodontitis", resorptionType:"external-cervical" } },
  ];
}

// SP5 Task 2 parity proof: `rootCaries` (enum, new-model — this finding was
// NEVER modeled/rendered before, so there is no legacy boolean/field to be
// byte-identical with) wires the previously-dormant `caries-root` artwork
// layer. Appended at the very end of svgCases() (outside the per-template
// loop, one template only) so it cannot shift any existing case's
// index/golden entry — see resorptionTypeParityCases() doc. The
// occlusal-template non-activation (no caries-root artwork there at all) and
// missing/implant-tooth non-activation are covered directly (not against a
// frozen snapshot) in the dedicated root-caries-parity.test.ts unit test.
function rootCariesParityCases(): { label: string; state: Record<string, unknown> }[] {
  return [
    { label: "rootCaries-active-new", state: { toothSelection:"tooth-base", rootCaries:"active" } },
    { label: "rootCaries-arrested-new", state: { toothSelection:"tooth-base", rootCaries:"arrested" } },
    { label: "rootCaries-active-cavitated-new", state: { toothSelection:"tooth-base", rootCaries:"active-cavitated" } },
  ];
}

export function svgCases() {
  const cases: { toothNo:number; view:"front"|"occlusal"; template:string; state:Record<string,unknown> }[] = [];
  for (const t of TEMPLATES) {
    cases.push({ ...t, state: baseState() });
    for (const [field, values] of ENUM_FIELDS)
      for (const v of values) cases.push({ ...t, state: { toothSelection:"tooth-base", [field]: v } });
    for (const b of BOOLEAN_FIELDS) cases.push({ ...t, state: { toothSelection:"tooth-base", [b]: true } });
    for (const c of Array.from(VALID_CARIES)) cases.push({ ...t, state: { toothSelection:"tooth-base", caries:[c] } });
    // Per-surface caries severity (SP6 unified `cariesSeverity`; on a primary/
    // no-filling surface it is ICDAS: codes <=2 -> tier1 (opacity 0.45), <=4 ->
    // tier2 (opacity 0.7), else tier3 (opacity 1 + caries-deep). caries-subcrown
    // has no severity encoding (skipped before the depth block), so exclude it.
    for (const c of Array.from(VALID_CARIES)) {
      if (c === "caries-subcrown") continue;
      const surface = c.replace("caries-", "");
      for (const d of [2, 4, 6])
        cases.push({ ...t, state: { toothSelection:"tooth-base", caries:[c], cariesSeverity:{ [surface]: d } } });
    }
    for (const s of Array.from(VALID_FILLING_SURFACES)) cases.push({ ...t, state: { toothSelection:"tooth-base", fillingMaterial:"amalgam", fillingSurfaces:[s], fillingSurfaceMaterials:{ [s]:"amalgam" } } });
    for (const m of Array.from(VALID_MODS)) cases.push({ ...t, state: { toothSelection:"tooth-base", mods:[m] } });
    for (const tr of trickyStates()) cases.push({ ...t, state: tr.state });
    for (const nr of newModelRestorationCases()) cases.push({ ...t, state: nr.state });
    if (t.view === "occlusal") for (const oc of newModelOcclusalOnlyCases()) cases.push({ ...t, state: oc.state });
  }
  // Appended AFTER the per-template loop — see resorptionTypeParityCases() doc.
  for (const rc of resorptionTypeParityCases()) {
    cases.push({ toothNo: 11, view: "front", template: "11", state: rc.state });
  }
  // Appended AFTER resorptionTypeParityCases() — see pulpDxParityCases() doc.
  for (const pc of pulpDxParityCases()) {
    cases.push({ toothNo: 11, view: "front", template: "11", state: pc.state });
  }
  // Appended AFTER pulpDxParityCases() — see apicalDxParityCases() doc.
  for (const ac of apicalDxParityCases()) {
    cases.push({ toothNo: 11, view: "front", template: "11", state: ac.state });
  }
  // Appended AFTER apicalDxParityCases() — see rootCariesParityCases() doc.
  for (const rtc of rootCariesParityCases()) {
    cases.push({ toothNo: 11, view: "front", template: "11", state: rtc.state });
  }
  // Appended last (keeps existing fixture indices stable) — recurrent caries: a
  // surface that is BOTH filled AND carious renders `subcaries-{surface}`
  // (CARS-scored from cariesSeverity), not the primary `caries-{surface}`. This
  // filled+severity combo isn't exercised by the plain caries or plain filling
  // cases in the main loop.
  for (const rec of recurrentCariesParityCases()) {
    cases.push({ toothNo: 11, view: "front", template: "11", state: rec.state });
  }
  return cases;
}

/** Recurrent-caries (filled + carious + CARS severity) parity cases, per
 *  surface. See the appended-block comment in the matrix builder. */
function recurrentCariesParityCases(): { label: string; state: Record<string, unknown> }[] {
  return Array.from(VALID_FILLING_SURFACES).map((s) => ({
    label: `recurrent-${s}`,
    state: {
      toothSelection: "tooth-base",
      caries: [`caries-${s}`],
      fillingMaterial: "amalgam",
      fillingSurfaces: [s],
      fillingSurfaceMaterials: { [s]: "amalgam" },
      cariesSeverity: { [s]: 4 },
    },
  }));
}

export function payloadCases() {
  // One full-arch-ish payload built from a representative subset of svgCases states.
  const teeth: Record<string, unknown> = {};
  const sample = svgCases().filter(c => c.view === "front").slice(0, 40);
  sample.forEach((c, i) => { teeth[String(11 + i)] = c.state; });
  return [
    { name: "empty", payload: { version: "1.4", teeth: {} } },
    { name: "edentulous", payload: { version: "1.4", globals: { edentulous: true }, teeth: {} } },
    { name: "mixed", payload: { version: "1.4", teeth } },
    // Force the FHIR emit/parse branches the enum-only "mixed" sample never reaches:
    { name: "branches", payload: { version: "1.4", teeth: {
      "11": { toothSelection:"tooth-base", caries:["caries-occlusal"], cariesSeverity:{ occlusal: 4 } },            // set -> valueInteger
      "12": { toothSelection:"tooth-base", fillingMaterial:"composite", fillingSurfaces:["mesial","occlusal"],
              fillingSurfaceMaterials:{ mesial:"composite", occlusal:"amalgam" } },                                  // restoration -> component
      // `pulpInflam` here is the retired legacy raw field name (SP4 Task 3,
      // see BOOLEAN_FIELDS comment) — intentionally kept to prove
      // buildFhirBundle silently ignores a raw field with no FIELD_MAPPINGS
      // row (no Observation emitted for it); `calculus:true` still covers
      // the "boolean -> valueBoolean" case this row is annotated for.
      "13": { toothSelection:"tooth-base", pulpInflam:true, calculus:true, extractionPlan:true },                    // boolean -> valueBoolean
      "14": { toothSelection:"none", missingClosed:true },                                                           // boolean on none
      // New-model restoration coding, authored directly (not via legacy
      // crownMaterial migration): toothSubstrate + restorationType +
      // restorationMaterial each emit their own enum-valued Observation.
      "15": { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"metal-ceramic" },
    } } },
  ];
}
