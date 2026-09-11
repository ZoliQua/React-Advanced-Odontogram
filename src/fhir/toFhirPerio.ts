// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, Observation, Condition, CodeableConcept, ToothRecord, OdontogramExportPayload, FhirExportOptions } from "./types";
import { LOCAL_SYSTEM, FDI_SYSTEM } from "./codesystems";
import { PLACEHOLDER_PATIENT_FULLURL, baseObservation, fhirFullUrl } from "./primitives";
import { toothBodySiteCode } from "./iso3950";
import { buildConditionCode } from "./toFhirDx";
import {
  derivePerioClassification,
  type PerioDerivationInput,
  type ToothDerivationInput,
  type PerioMetaInput,
  type PerioDiagnosis,
  type PerioStage,
  type PerioGrade,
  type PerioExtent,
} from "../perioClassification";

/**
 * Per-site periodontal probing (`ToothRecord.perio`, see types.ts) is per-site
 * NUMERIC data (6 fixed probing points per tooth, each carrying PD/GM/BOP/SUP),
 * not the one-enum/boolean-field-per-tooth shape the axis registry
 * (registry/axes.ts + registry/fhir.ts) assumes. It is therefore deliberately
 * NOT routed through AXES/fieldMappings.ts or the axis parity oracle — this is a
 * bespoke builder, called once from buildFhirBundle() (toFhir.ts) after the
 * registry-driven per-tooth Observations, reusing `baseObservation()`
 * (fhir/primitives.ts) for the panel Observation's
 * resourceType/status/category/subject/bodySite so it matches every other
 * Observation's conventions exactly.
 *
 * SNOMED CT is not included anywhere in this module (same policy as
 * `SNOMED_CODES` in codesystems.ts) — LOINC-primary only.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

/** LOINC (Logical Observation Identifiers Names and Codes) system URL.
 *  Local to this module: perio is the only export currently using LOINC —
 *  every other finding in this engine uses the engine-local LOCAL_SYSTEM only. */
export const LOINC_SYSTEM = "http://loinc.org"; // exported: shared by importPerio.ts (DX-9)

/** Verified LOINC codes, used exactly as specified. */
export const LOINC = {
  panel: { code: "74029-0", display: "Periodontal panel" },
  pd: { code: "32910-2", display: "Probing depth" },
  recession: { code: "32911-0", display: "Gingival recession" },
  cal: { code: "32912-8", display: "Clinical attachment level (calculated)" },
  furcation: { code: "34015-8", display: "Furcation involvement" },
  // Condition evidence Observations.
  smokingStatus: { code: "72166-2", display: "Tobacco smoking status" },
  hba1c: { code: "4548-4", display: "Hemoglobin A1c/Hemoglobin.total in Blood" },
} as const;

// Furcation entrance labels — the union across every tooth position
// furcationEntrances() (odontogram.ts) can return. Mirrored here rather than
// imported, same policy PERIO_SITES/SITE_DISPLAY below follow (fhir/ stays
// independent of the large odontogram.ts module).
const FURCATION_ENTRANCES = ["mesial", "distal", "buccal", "lingual"] as const;
type FurcationEntrance = typeof FURCATION_ENTRANCES[number];

const FURCATION_ENTRANCE_DISPLAY: Record<FurcationEntrance, string> = {
  mesial: "Mesial",
  distal: "Distal",
  buccal: "Buccal",
  lingual: "Lingual",
};

// The 4 fixed O'Leary plaque-index surfaces — the SAME value set/labels as
// FURCATION_ENTRANCES above, but kept as an independent constant (own bodySite
// local-code prefix, own gating) since plaque and furcation are unrelated axes
// that only happen to share a surface vocabulary.
const PLAQUE_SURFACES = ["mesial", "distal", "buccal", "lingual"] as const;
type PlaqueSurface = typeof PLAQUE_SURFACES[number];

const PLAQUE_SURFACE_DISPLAY: Record<PlaqueSurface, string> = {
  mesial: "Mesial",
  distal: "Distal",
  buccal: "Buccal",
  lingual: "Lingual",
};

// Mirrors PERIO_SITES in odontogram.ts (buccal MB/B/DB, then lingual/palatal
// ML/L/DL). Duplicated here — rather than importing from the (very large)
// odontogram.ts — so the fhir/ module tree stays independent of it, the same
// way codesystems.ts independently duplicates its own English display text
// instead of importing from i18n/translations.ts.
const PERIO_SITES = ["MB", "B", "DB", "ML", "L", "DL"] as const;
type PerioSite = typeof PERIO_SITES[number];

// English display names per site (FHIR display text is language-neutral,
// same policy LOCAL_VALUE_MAPS uses in codesystems.ts) — mirrors the EN
// `perio.site.*` strings in i18n/translations.ts.
const SITE_DISPLAY: Record<PerioSite, string> = {
  MB: "Mesio-buccal",
  B: "Buccal",
  DB: "Disto-buccal",
  ML: "Mesio-lingual",
  L: "Lingual/palatal",
  DL: "Disto-lingual",
};

function loincConcept(entry: { code: string; display: string }): CodeableConcept {
  return { coding: [{ system: LOINC_SYSTEM, code: entry.code, display: entry.display }], text: entry.display };
}

/**
 * Engine-local finding CodeableConcept (no LOINC/SNOMED coding at all) — the
 * same no-dedicated-standard-code treatment `perio-bop`/`plaque-surface` above
 * already get. PI/GI have no dedicated LOINC (LOINC only defines whole-mouth
 * plaque/gingival indices, not per-surface graded ones), so both ride on
 * LOCAL_SYSTEM only, mirroring {@link loincConcept}.
 */
function localConcept(code: string, display: string): CodeableConcept {
  return { coding: [{ system: LOCAL_SYSTEM, code, display }], text: display };
}

/**
 * HL7-published R4 backport extension URL for `Observation.component.bodySite`
 * (an R5-only field — see below). Using this extension keeps the export
 * strictly R4-legal: R4 BackboneElements are `additionalProperties: false`,
 * so a bare `component.bodySite` would be rejected by a schema-strict R4
 * validator, whereas `component.extension` is legal on any R4 BackboneElement
 * and this specific URL is HL7's official backport of the exact same field.
 */
export const COMPONENT_BODYSITE_EXTENSION_URL =
  "http://hl7.org/fhir/5.0/StructureDefinition/extension-Observation.component.bodySite";

/**
 * Generic tooth+qualifier bodySite CodeableConcept, carried via the R4
 * backport extension (see COMPONENT_BODYSITE_EXTENSION_URL above) rather
 * than the R5-only `component.bodySite` field. `localCode`/`display` supply
 * the engine-local qualifier half (e.g. `perio-site:MB` or
 * `furcation-entrance:mesial`) — no standard SNOMED/LOINC code exists for
 * either qualifier, so both ride on LOCAL_SYSTEM like every other
 * engine-local code.
 */
function bodySiteCC(tooth: string, localCode: string, display: string): CodeableConcept {
  return {
    coding: [
      { system: FDI_SYSTEM, code: tooth },
      { system: LOCAL_SYSTEM, code: localCode, display },
    ],
    text: `Tooth ${tooth} – ${display}`,
  };
}

/** Attach a generic tooth+qualifier bodySite to a component (see
 *  {@link bodySiteCC}). */
function attachBodySite(component: Any, tooth: string, localCode: string, display: string): void {
  component.extension = [
    { url: COMPONENT_BODYSITE_EXTENSION_URL, valueCodeableConcept: bodySiteCC(tooth, localCode, display) },
  ];
}

/** Site qualifier for one probing component: tooth (FDI) + probe site.
 *  Thin wrapper over {@link attachBodySite} preserving the exact
 *  `perio-site:${site}` local-code format every existing perio FHIR test
 *  asserts against. NOTE: FHIR R4's Observation.component has no standard
 *  `bodySite` element (it was added in R5) — this engine's FHIR export is not a
 *  strict-conformance profile anyway (see the LOCAL_SYSTEM-based finding codes
 *  throughout), so one is emitted regardless. */
function attachSiteBodySite(component: Any, tooth: string, site: PerioSite): void {
  attachBodySite(component, tooth, `perio-site:${site}`, SITE_DISPLAY[site]);
}

/** Furcation-entrance qualifier for one furcation component: tooth (FDI) +
 *  entrance, via the same R4 backport extension mechanism (see
 *  {@link attachBodySite}). */
function attachFurcationBodySite(component: Any, tooth: string, entrance: FurcationEntrance): void {
  attachBodySite(component, tooth, `furcation-entrance:${entrance}`, FURCATION_ENTRANCE_DISPLAY[entrance]);
}

/** Plaque-surface qualifier for one plaque component: tooth (FDI) + surface,
 *  via the same R4 backport extension mechanism (see {@link attachBodySite}). */
function attachPlaqueBodySite(component: Any, tooth: string, surface: PlaqueSurface): void {
  attachBodySite(component, tooth, `plaque-surface:${surface}`, PLAQUE_SURFACE_DISPLAY[surface]);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Build the periodontal-panel Observation for one tooth, or `undefined` when
 * the tooth has no charted perio sites AND no graded furcation entrance AND no
 * plaque/PI/GI/KG/mPI/mBI data. Pure; tolerant of malformed
 * `rec.perio`/`rec.furcation`/etc. (never throws) — unrecognized site/entrance
 * keys and non-numeric/out-of-range values are silently skipped rather than
 * propagated.
 *
 * `sup` (suppuration on probing) is intentionally NOT emitted here (only
 * PD/recession/CAL/BOP are charted per site). Adding it would face the same
 * no-dedicated-LOINC situation as per-site BOP below.
 *
 * Furcation involvement, O'Leary plaque presence, Silness-Löe PI, Löe-Silness
 * GI, keratinized-gingiva width, and the peri-implant Mombelli mPI/mBI indices
 * all ride on the SAME panel Observation as additional components — a tooth with
 * only one of those axes still gets the panel (built with only that axis's
 * components). None of PI/GI/plaque/KG/mPI/mBI has a dedicated LOINC (LOINC
 * defines only whole-mouth plaque/gingival indices), so each carries an
 * engine-local finding code only, the same treatment per-site BOP gets.
 * Keratinized gingiva width is a single per-tooth buccal mm scalar (not
 * per-site/per-surface) on a fixed buccal bodySite.
 */
function buildToothPerioObservation(subjectRef: string, tooth: string, rec: ToothRecord): Observation | undefined {
  const perio = rec.perio;
  const pd = perio && typeof perio.pd === "object" ? (perio.pd as Record<string, unknown>) : undefined;
  const gm = perio && typeof perio.gm === "object" ? (perio.gm as Record<string, unknown>) : {};
  const bop = Array.isArray(perio?.bop) ? (perio!.bop as unknown[]).filter((v): v is string => typeof v === "string") : [];
  const chartedSites = pd ? PERIO_SITES.filter((s) => Object.prototype.hasOwnProperty.call(pd, s) && isFiniteNumber(pd[s])) : [];

  const furcationRaw =
    rec.furcation && typeof rec.furcation === "object" ? (rec.furcation as Record<string, unknown>) : undefined;
  const gradedEntrances = furcationRaw
    ? FURCATION_ENTRANCES.filter((e) => {
        const v = furcationRaw[e];
        return isFiniteNumber(v) && Number.isInteger(v) && v >= 1 && v <= 4;
      })
    : [];

  const plaqueRaw = Array.isArray(rec.plaque) ? (rec.plaque as unknown[]).filter((v): v is string => typeof v === "string") : [];
  const plaqueSurfaces = PLAQUE_SURFACES.filter((s) => plaqueRaw.includes(s));

  // PI/GI graded surfaces — same tolerant parsing as furcation above
  // (unrecognized surface or out-of-range/non-integer grade silently dropped,
  // never throws).
  const piRaw = rec.pi && typeof rec.pi === "object" ? (rec.pi as Record<string, unknown>) : undefined;
  const piEntries: [PlaqueSurface, number][] = piRaw
    ? (PLAQUE_SURFACES.filter((s) => {
        const v = piRaw[s];
        return isFiniteNumber(v) && Number.isInteger(v) && v >= 1 && v <= 3;
      }).map((s) => [s, piRaw[s] as number]))
    : [];
  const giRaw = rec.gi && typeof rec.gi === "object" ? (rec.gi as Record<string, unknown>) : undefined;
  const giEntries: [PlaqueSurface, number][] = giRaw
    ? (PLAQUE_SURFACES.filter((s) => {
        const v = giRaw[s];
        return isFiniteNumber(v) && Number.isInteger(v) && v >= 1 && v <= 3;
      }).map((s) => [s, giRaw[s] as number]))
    : [];

  // Peri-implant Mombelli mPI/mBI graded surfaces — same tolerant parsing as
  // PI/GI above (implant-only enforcement lives at the odontogram.ts setter
  // layer, not here — FHIR export is unconditional on whatever is in the
  // payload, same as every other axis).
  const mpiRaw = rec.mpi && typeof rec.mpi === "object" ? (rec.mpi as Record<string, unknown>) : undefined;
  const mpiEntries: [PlaqueSurface, number][] = mpiRaw
    ? (PLAQUE_SURFACES.filter((s) => {
        const v = mpiRaw[s];
        return isFiniteNumber(v) && Number.isInteger(v) && v >= 1 && v <= 3;
      }).map((s) => [s, mpiRaw[s] as number]))
    : [];
  const mbiRaw = rec.mbi && typeof rec.mbi === "object" ? (rec.mbi as Record<string, unknown>) : undefined;
  const mbiEntries: [PlaqueSurface, number][] = mbiRaw
    ? (PLAQUE_SURFACES.filter((s) => {
        const v = mbiRaw[s];
        return isFiniteNumber(v) && Number.isInteger(v) && v >= 1 && v <= 3;
      }).map((s) => [s, mbiRaw[s] as number]))
    : [];

  // Keratinized gingiva width — a single per-tooth BUCCAL mm scalar (integer
  // 0-15). Tolerant of malformed/foreign input (non-numeric, out-of-range,
  // null): treated as "not charted", same as every other axis above.
  const kgRaw = rec.kg;
  const kgValue = isFiniteNumber(kgRaw) && Number.isInteger(kgRaw) && kgRaw >= 0 && kgRaw <= 15 ? kgRaw : undefined;

  if (
    chartedSites.length === 0 && gradedEntrances.length === 0 && plaqueSurfaces.length === 0 &&
    piEntries.length === 0 && giEntries.length === 0 && kgValue === undefined &&
    mpiEntries.length === 0 && mbiEntries.length === 0
  ) return undefined;

  const components: Any[] = [];
  for (const site of chartedSites) {
    const pdValue = pd[site] as number;
    const gmRaw = gm[site];
    const gmValue = isFiniteNumber(gmRaw) ? gmRaw : 0;
    // Derived here — a stored CAL never exists (see ToothRecord.perio doc comment).
    const calValue = pdValue + gmValue;

    const pdComponent: Any = {
      code: loincConcept(LOINC.pd),
      valueQuantity: { value: pdValue, unit: "mm" },
    };
    attachSiteBodySite(pdComponent, tooth, site);
    components.push(pdComponent);

    // Recession is emitted ONLY when there is actual recession to report
    // (gm > 0); gm <= 0 (gingiva at or coronal to CEJ) has nothing to state
    // under this LOINC code.
    if (gmValue > 0) {
      const recComponent: Any = {
        code: loincConcept(LOINC.recession),
        valueQuantity: { value: gmValue, unit: "mm" },
      };
      attachSiteBodySite(recComponent, tooth, site);
      components.push(recComponent);
    }

    const calComponent: Any = {
      code: loincConcept(LOINC.cal),
      valueQuantity: { value: calValue, unit: "mm" },
    };
    attachSiteBodySite(calComponent, tooth, site);
    components.push(calComponent);

    // Per-site bleeding-on-probing has NO dedicated LOINC code — LOINC only
    // defines a whole-mouth BOP index (32951-6). Emitted as a plain boolean
    // component under the engine-local system instead, for EVERY charted
    // site (explicit true/false), so "not charted" (no component at all)
    // stays distinguishable from "charted, did not bleed" (valueBoolean: false).
    const bopComponent: Any = {
      code: { coding: [{ system: LOCAL_SYSTEM, code: "perio-bop", display: "Bleeding on probing" }], text: "Bleeding on probing" },
      valueBoolean: bop.includes(site),
    };
    attachSiteBodySite(bopComponent, tooth, site);
    components.push(bopComponent);
  }

  // One component per graded furcation entrance, LOINC 34015-8, the Glickman
  // grade (1-4) as a plain integer value.
  for (const entrance of gradedEntrances) {
    const grade = furcationRaw![entrance] as number;
    const furcationComponent: Any = {
      code: loincConcept(LOINC.furcation),
      valueInteger: grade,
    };
    attachFurcationBodySite(furcationComponent, tooth, entrance);
    components.push(furcationComponent);
  }

  // One boolean component per O'Leary plaque-index surface WITH plaque present.
  // No LOINC coding (see doc comment above) — engine-local code only, always
  // `valueBoolean: true` (a clean/not-recorded surface simply has no component
  // at all, mirroring how `plaque` itself stores presence-only membership rather
  // than an explicit false).
  for (const surface of plaqueSurfaces) {
    const plaqueComponent: Any = {
      code: { coding: [{ system: LOCAL_SYSTEM, code: "plaque-surface", display: "Dental plaque present" }], text: "Dental plaque present" },
      valueBoolean: true,
    };
    attachPlaqueBodySite(plaqueComponent, tooth, surface);
    components.push(plaqueComponent);
  }

  // One integer component per graded PI surface — Silness-Löe Plaque Index, no
  // dedicated LOINC, engine-local finding code.
  for (const [surface, grade] of piEntries) {
    const piComponent: Any = {
      code: localConcept("plaque-index-silness-loe", "Plaque index (Silness-Löe)"),
      valueInteger: grade,
    };
    attachPlaqueBodySite(piComponent, tooth, surface);
    components.push(piComponent);
  }

  // One integer component per graded GI surface — Löe-Silness Gingival Index,
  // same no-dedicated-LOINC treatment as PI above.
  for (const [surface, grade] of giEntries) {
    const giComponent: Any = {
      code: localConcept("gingival-index-loe-silness", "Gingival index (Löe-Silness)"),
      valueInteger: grade,
    };
    attachPlaqueBodySite(giComponent, tooth, surface);
    components.push(giComponent);
  }

  // One integer component per graded mPI/mBI surface — Mombelli modified
  // plaque/sulcus bleeding indices (peri-implant), same no-dedicated-LOINC
  // treatment as PI/GI above.
  for (const [surface, grade] of mpiEntries) {
    const c: Any = { code: localConcept("mod-plaque-index-mombelli", "Modified plaque index (Mombelli)"), valueInteger: grade };
    attachPlaqueBodySite(c, tooth, surface);
    components.push(c);
  }
  for (const [surface, grade] of mbiEntries) {
    const c: Any = { code: localConcept("mod-bleeding-index-mombelli", "Modified sulcus bleeding index (Mombelli)"), valueInteger: grade };
    attachPlaqueBodySite(c, tooth, surface);
    components.push(c);
  }

  // One valueQuantity (mm) component for keratinized gingiva width, when charted
  // — no dedicated LOINC, engine-local finding code, fixed buccal bodySite (this
  // axis is a single scalar, not per-site/per-surface, so there is nothing to
  // loop over).
  if (kgValue !== undefined) {
    const kgComponent: Any = {
      code: localConcept("keratinized-gingiva-width", "Keratinized gingiva width"),
      valueQuantity: { value: kgValue, unit: "mm", system: "http://unitsofmeasure.org", code: "mm" },
    };
    attachBodySite(kgComponent, tooth, "site:buccal", "Buccal");
    components.push(kgComponent);
  }

  const obs = baseObservation(subjectRef, tooth, loincConcept(LOINC.panel));
  obs.component = components as Observation["component"];
  return obs;
}

/**
 * Append one periodontal-panel Observation per tooth with charted perio data to
 * `bundle.entry`, mutating it in place. Called from `buildFhirBundle`
 * (toFhir.ts) AFTER the registry-driven per-tooth Observations. A tooth with no
 * charted perio data (the common case — `rec.perio` is omitted entirely by
 * serializeState() unless at least one site is charted) contributes NO entry.
 *
 * Pure aside from the `bundle.entry` mutation; tolerant of malformed `payload`
 * (never throws), matching `buildFhirBundle`'s own contract.
 */
export function appendPerioObservations(bundle: Bundle, payload: OdontogramExportPayload, options: FhirExportOptions = {}): void {
  const teeth =
    payload && typeof payload === "object" && payload.teeth && typeof payload.teeth === "object" ? payload.teeth : {};
  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  if (!bundle.entry) bundle.entry = [];
  for (const [tooth, recRaw] of Object.entries(teeth)) {
    const rec = (recRaw && typeof recRaw === "object" ? recRaw : {}) as ToothRecord;
    const siteTooth = toothBodySiteCode(tooth, rec);
    const obs = buildToothPerioObservation(subjectRef, siteTooth, rec);
    if (obs) bundle.entry.push({ resource: obs });
  }
}

// ---------------------------------------------------------------------------
// The engine's FHIR Condition: 2017 World Workshop periodontitis/gingivitis
// diagnosis (ICD-10/BNO K05), with type-differentiated stage/grade/extent +
// evidence Observations.
//
// ARCHITECTURE: `derivePerioClassification` (perioClassification.ts) is pure —
// it takes an already-reduced `PerioDerivationInput`, never engine state.
// `buildDerivationInputFromPayload` below is the PAYLOAD-side adapter (mirrors
// `buildDerivationInputFromState` in odontogram.ts, the STATE-side adapter the
// UI/summary path uses) — this module deliberately never imports odontogram.ts
// (see the module doc comment at the top of this file), so every constant it
// needs (the FDI arch sequence, the interdental/buccal-oral site groupings, the
// override valid-value sets) is duplicated locally, the same policy
// PERIO_SITES/FURCATION_ENTRANCES above already follow.
// ---------------------------------------------------------------------------

// Mirrors ALL_TEETH in odontogram.ts (upper 18->28, then lower 48->38).
const ALL_TEETH_FDI = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
] as const;

// Mirrors the two site groupings `buildDerivationInputFromState` reduces
// CAL over: the 4 approximal ("interdental") sites and the 2 mid
// ("buccal/oral") sites.
const INTERDENTAL_SITES: readonly PerioSite[] = ["MB", "DB", "ML", "DL"];
const BUCCAL_ORAL_SITES: readonly PerioSite[] = ["B", "L"];

// Mirrors the `VALID_SMOKING`/`VALID_DIABETES` sets in odontogram.ts —
// duplicated (not imported) for the same dependency-independence reason.
const VALID_SMOKING_STATUS = new Set(["unknown", "never", "former", "current"]);
const VALID_DIABETES_STATUS = new Set(["unknown", "none", "present"]);

// Mirrors the `VALID_DIAGNOSIS`/`VALID_STAGE`/`VALID_GRADE`/`VALID_EXTENT`
// override sets in odontogram.ts — deliberately excludes the derivation's
// non-authorable placeholder values ("na"/"indeterminate"), an override always
// names a concrete clinical value.
const VALID_DIAGNOSIS_OVERRIDE = new Set(["health", "gingivitis", "periodontitis"]);
const VALID_STAGE_OVERRIDE = new Set(["I", "II", "III", "IV"]);
const VALID_GRADE_OVERRIDE = new Set(["A", "B", "C"]);
const VALID_EXTENT_OVERRIDE = new Set(["localized", "generalized", "molar-incisor"]);

/** Whether a tooth counts as "present" for classification purposes, from its
 *  serialized `toothSelection`. An absent/malformed `toothSelection` defaults
 *  to "tooth-base" (present), mirroring how a tooth never touched at all
 *  reads on the live-state adapter. */
function presentFromSelection(sel: unknown): boolean {
  const s = typeof sel === "string" && sel ? sel : "tooth-base";
  // mirror isToothPresent() in odontogram.ts — a present natural tooth is anything
  // that is not missing ("none") and not an implant. (Extraction sockets / under-gum
  // keep the same treatment isToothPresent gives them, so the FHIR-derived
  // classification matches the on-screen classification for the same case.)
  return s !== "none" && s !== "implant";
}

/**
 * Payload-side adapter for {@link derivePerioClassification} — reduces a
 * SERIALIZED `OdontogramExportPayload` (not live module state) into the pure
 * {@link PerioDerivationInput} struct. Mirrors `buildDerivationInputFromState`
 * in odontogram.ts field-for-field: per tooth, `interdentalCal`/
 * `buccalOralCal` are the worst (max) derived CAL (`pd + gm`) over the
 * approximal/mid site groups; `maxPd` is the worst raw PD over any of the 6
 * sites; `present` via {@link presentFromSelection}. `bopPercent` is the
 * whole-payload %BOP over every charted site across every tooth;
 * `maxFurcation` the highest graded furcation entrance anywhere. `meta`
 * comes straight from `payload.case` (the SAME shape `CaseMeta` serializes
 * to), defaulting exactly like `defaultCaseMeta()` when a field is absent.
 *
 * Pure; tolerant of malformed/missing `payload`/`payload.teeth`/`payload.case`
 * (never throws) — unrecognized sites, non-numeric values, and foreign enum
 * strings are silently treated as "not charted"/"unknown", the same
 * tolerance policy {@link buildToothPerioObservation} follows.
 */
export function buildDerivationInputFromPayload(payload: OdontogramExportPayload): PerioDerivationInput {
  const teethPayload: Record<string, ToothRecord> =
    payload && typeof payload === "object" && payload.teeth && typeof payload.teeth === "object"
      ? (payload.teeth as Record<string, ToothRecord>)
      : {};

  let chartedSites = 0;
  let bleedingSites = 0;
  let maxFurcation: number | null = null;

  const teeth: ToothDerivationInput[] = ALL_TEETH_FDI.map((toothNo) => {
    const rec = (teethPayload[String(toothNo)] ?? {}) as ToothRecord;
    const present = presentFromSelection(rec.toothSelection);

    const pd = rec.perio && typeof rec.perio.pd === "object" ? (rec.perio.pd as Record<string, unknown>) : undefined;
    const gm = rec.perio && typeof rec.perio.gm === "object" ? (rec.perio.gm as Record<string, unknown>) : {};
    const bop = Array.isArray(rec.perio?.bop) ? (rec.perio!.bop as unknown[]).filter((v): v is string => typeof v === "string") : [];

    let interdentalCal = 0;
    let buccalOralCal = 0;
    let maxPd = 0;
    if (pd) {
      for (const site of PERIO_SITES) {
        const pdRaw = pd[site];
        if (!isFiniteNumber(pdRaw)) continue;
        chartedSites++;
        if (bop.includes(site)) bleedingSites++;
        if (pdRaw > maxPd) maxPd = pdRaw;
        const gmRaw = gm[site];
        const cal = pdRaw + (isFiniteNumber(gmRaw) ? gmRaw : 0);
        if (INTERDENTAL_SITES.includes(site) && cal > interdentalCal) interdentalCal = cal;
        if (BUCCAL_ORAL_SITES.includes(site) && cal > buccalOralCal) buccalOralCal = cal;
      }
    }

    const furcationRaw = rec.furcation && typeof rec.furcation === "object" ? (rec.furcation as Record<string, unknown>) : undefined;
    if (furcationRaw) {
      for (const v of Object.values(furcationRaw)) {
        if (isFiniteNumber(v) && (maxFurcation === null || v > maxFurcation)) maxFurcation = v;
      }
    }

    return { toothNo, interdentalCal, buccalOralCal, maxPd, present };
  });

  const bopPercent = chartedSites > 0 ? Math.round((bleedingSites / chartedSites) * 1000) / 10 : 0;

  const caseRaw = (payload && typeof payload === "object" ? payload.case : undefined) as
    | Record<string, unknown>
    | undefined;
  const meta: PerioMetaInput = {
    age: isFiniteNumber(caseRaw?.age) ? (caseRaw!.age as number) : null,
    maxRblPercent: isFiniteNumber(caseRaw?.maxRblPercent) ? (caseRaw!.maxRblPercent as number) : null,
    toothLossPerio: isFiniteNumber(caseRaw?.toothLossPerio) ? (caseRaw!.toothLossPerio as number) : null,
    smokingStatus: VALID_SMOKING_STATUS.has(caseRaw?.smokingStatus as string)
      ? (caseRaw!.smokingStatus as PerioMetaInput["smokingStatus"])
      : "unknown",
    cigarettesPerDay: isFiniteNumber(caseRaw?.cigarettesPerDay) ? (caseRaw!.cigarettesPerDay as number) : null,
    diabetesStatus: VALID_DIABETES_STATUS.has(caseRaw?.diabetesStatus as string)
      ? (caseRaw!.diabetesStatus as PerioMetaInput["diabetesStatus"])
      : "unknown",
    hba1c: isFiniteNumber(caseRaw?.hba1c) ? (caseRaw!.hba1c as number) : null,
  };

  return { teeth, bopPercent, maxFurcation, meta };
}

/** The final (override ?? derived) classification for one axis each — see
 *  `getPerioClassification()` in odontogram.ts for the live-state
 *  equivalent this mirrors. */
interface FinalPerioClassification {
  diagnosis: PerioDiagnosis;
  stage: PerioStage;
  grade: PerioGrade;
  extent: PerioExtent;
}

/**
 * Compute the FINAL periodontal classification for a serialized payload:
 * `derivePerioClassification` (pure) fed by {@link buildDerivationInputFromPayload}
 * above, then each axis overridden by `payload.case.<axis>Override` when it is a
 * valid concrete value for that axis (mirrors `getPerioClassification()`'s
 * override ?? derived rule in odontogram.ts exactly — same valid-value sets,
 * same "invalid/missing override -> derived wins" fallback).
 *
 * CAVEAT (binding on every caller): `derived.grade` can read `"indeterminate"`
 * while `derived.buckets` still reads concrete values (e.g. smoking "A",
 * diabetes "A", direct null) — `buckets` is provenance ONLY, never re-derive
 * `grade` from it. This function (and {@link appendPerioCondition} below) always
 * branches on the final `grade`/`stage`/`extent` STRING values themselves, never
 * on `buckets`.
 */
function computeFinalClassification(payload: OdontogramExportPayload): FinalPerioClassification {
  const derived = derivePerioClassification(buildDerivationInputFromPayload(payload));
  const caseRaw = (payload && typeof payload === "object" ? payload.case : undefined) as
    | Record<string, unknown>
    | undefined;
  return {
    diagnosis: (VALID_DIAGNOSIS_OVERRIDE.has(caseRaw?.diagnosisOverride as string)
      ? (caseRaw!.diagnosisOverride as PerioDiagnosis)
      : derived.diagnosis),
    stage: (VALID_STAGE_OVERRIDE.has(caseRaw?.stageOverride as string)
      ? (caseRaw!.stageOverride as PerioStage)
      : derived.stage),
    grade: (VALID_GRADE_OVERRIDE.has(caseRaw?.gradeOverride as string)
      ? (caseRaw!.gradeOverride as PerioGrade)
      : derived.grade),
    extent: (VALID_EXTENT_OVERRIDE.has(caseRaw?.extentOverride as string)
      ? (caseRaw!.extentOverride as PerioExtent)
      : derived.extent),
  };
}

// Fixed, deterministic id/fullUrl scheme for the (at most one per bundle)
// Condition + its two evidence Observations — mirrors the placeholder
// Patient's own fixed `urn:uuid:odontogram-subject` id/fullUrl convention in
// primitives.ts (PLACEHOLDER_PATIENT_ID/PLACEHOLDER_PATIENT_FULLURL). No
// Date/random anywhere — same bundle in, byte-identical bundle out, always.
const CONDITION_ID = "odontogram-perio-condition";
const CONDITION_FULLURL = fhirFullUrl("Condition", CONDITION_ID);
const SMOKING_OBS_ID = "odontogram-perio-smoking-observation";
const SMOKING_OBS_FULLURL = fhirFullUrl("Observation", SMOKING_OBS_ID);
const HBA1C_OBS_ID = "odontogram-perio-hba1c-observation";
const HBA1C_OBS_FULLURL = fhirFullUrl("Observation", HBA1C_OBS_ID);

const SMOKING_STATUS_CONCEPT: Record<"never" | "former" | "current", { code: string; display: string }> = {
  never: { code: "smoking-never", display: "Never smoker" },
  former: { code: "smoking-former", display: "Former smoker" },
  current: { code: "smoking-current", display: "Current smoker" },
};

/** Whole-case (not tooth-specific) smoking-status evidence Observation,
 *  LOINC 72166-2. `baseObservation` sets a per-tooth `bodySite` (FDI) that
 *  doesn't apply to a case-level finding, so it's stripped afterward. */
function buildSmokingObservation(subjectRef: string, status: "never" | "former" | "current"): Observation {
  const obs = baseObservation(subjectRef, "", loincConcept(LOINC.smokingStatus));
  delete obs.bodySite;
  obs.id = SMOKING_OBS_ID;
  const entry = SMOKING_STATUS_CONCEPT[status];
  obs.valueCodeableConcept = localConcept(entry.code, entry.display);
  return obs;
}

/** Whole-case HbA1c evidence Observation, LOINC 4548-4, valueQuantity %. See
 *  {@link buildSmokingObservation} re: the stripped `bodySite`. */
function buildHba1cObservation(subjectRef: string, hba1c: number): Observation {
  const obs = baseObservation(subjectRef, "", loincConcept(LOINC.hba1c));
  delete obs.bodySite;
  obs.id = HBA1C_OBS_ID;
  obs.valueQuantity = { value: hba1c, unit: "%", system: "http://unitsofmeasure.org", code: "%" };
  return obs;
}

const K05_STAGE_DISPLAY: Record<Exclude<PerioStage, "na" | "indeterminate">, string> = {
  I: "Stage I", II: "Stage II", III: "Stage III", IV: "Stage IV",
};
const K05_GRADE_DISPLAY: Record<Exclude<PerioGrade, "indeterminate">, string> = {
  A: "Grade A", B: "Grade B", C: "Grade C",
};
const K05_EXTENT_DISPLAY: Record<Exclude<PerioExtent, "na">, string> = {
  localized: "Localized", generalized: "Generalized", "molar-incisor": "Molar-incisor pattern",
};

/**
 * Append the engine's FHIR Condition — the 2017 World Workshop
 * periodontitis/gingivitis diagnosis (ICD-10/BNO K05) — to `bundle.entry` when
 * the FINAL classification (override ?? derived, see
 * {@link computeFinalClassification}) is gingivitis or periodontitis. Emits
 * NOTHING (no Condition, no evidence Observations) for a "health" diagnosis.
 * Called from `buildFhirBundle` (toFhir.ts) AFTER `appendPerioObservations`.
 *
 * `code`: K05.3 for periodontitis (any extent — the molar-incisor pattern is
 * carried by the periodontal-extent stage entry, not a distinct WHO ICD-10
 * code), K05.1 for gingivitis.
 *
 * `stage[]`: one type-differentiated entry per APPLICABLE axis only — a stage
 * entry iff diagnosis is periodontitis AND `stage` is neither "na" nor
 * "indeterminate"; a grade entry iff `grade` is not "indeterminate" (evaluated
 * regardless of diagnosis, since `derivePerioClassification` itself computes
 * grade independently of diagnosis); an extent entry iff `extent` is not "na".
 * Each entry's `type`/`summary` are engine-local CodeableConcepts
 * (`periodontal-stage`/`-grade`/`-extent` type codes,
 * `stage-<I..IV>`/`grade-<A..C>`/`extent-<value>` summary codes) — SNOMED is
 * deferred.
 *
 * `evidence[]`: references the smoking-status Observation (emitted only when
 * `payload.case.smokingStatus` is a concrete non-"unknown" value) and the HbA1c
 * Observation (emitted only when `payload.case.hba1c` is set) — both pushed to
 * `bundle.entry` alongside the Condition, never on their own.
 *
 * Pure aside from the `bundle.entry` mutation; tolerant of malformed `payload`
 * (never throws, via {@link buildDerivationInputFromPayload}'s own tolerance);
 * deterministic (fixed ids, no Date/random) — the same payload always produces a
 * byte-identical Condition/evidence block.
 */
export function appendPerioCondition(bundle: Bundle, payload: OdontogramExportPayload, options: FhirExportOptions = {}): void {
  const final = computeFinalClassification(payload);
  if (final.diagnosis === "health") return;

  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  if (!bundle.entry) bundle.entry = [];

  // All periodontitis diagnoses use K05.3 (Chronic periodontitis). The
  // molar-incisor PATTERN is not a distinct WHO ICD-10 code: K05.2 is
  // "Acute periodontitis" (an unrelated diagnosis), and the ICD-10-CM meaning of
  // K05.2 ("aggressive periodontitis") does not belong on an R4/WHO ICD-10
  // bundle. The pattern is carried by the periodontal-extent stage entry instead.
  const dxKey = final.diagnosis === "gingivitis" ? "gingivitis" : "periodontitis";
  // DX-8: the 2017 stage/extent refine the ICD-10-CM code (K05.3xx); WHO/BNO stay K05.3.
  const code = buildConditionCode(dxKey, options.codingPack, options.snomed,
    dxKey === "periodontitis" ? { stage: final.stage, extent: final.extent } : undefined);
  if (!code) return; // gingivitis/periodontitis are always coded; defensive guard for the nullable return

  const condition: Condition = {
    resourceType: "Condition",
    id: CONDITION_ID,
    code: {
      coding: [
        ...(code.coding ?? []),
        { system: LOCAL_SYSTEM, code: `periodontal-diagnosis:${final.diagnosis}`, display: final.diagnosis },
      ],
      text: code.text,
    },
    subject: { reference: subjectRef },
  };

  const stage: NonNullable<Condition["stage"]> = [];
  if (final.diagnosis === "periodontitis" && final.stage !== "na" && final.stage !== "indeterminate") {
    stage.push({
      type: localConcept("periodontal-stage", "Periodontal stage"),
      summary: localConcept(`stage-${final.stage}`, K05_STAGE_DISPLAY[final.stage]),
    });
  }
  if (final.grade !== "indeterminate") {
    stage.push({
      type: localConcept("periodontal-grade", "Periodontal grade"),
      summary: localConcept(`grade-${final.grade}`, K05_GRADE_DISPLAY[final.grade]),
    });
  }
  if (final.extent !== "na") {
    stage.push({
      type: localConcept("periodontal-extent", "Periodontal extent"),
      summary: localConcept(`extent-${final.extent}`, K05_EXTENT_DISPLAY[final.extent]),
    });
  }
  if (stage.length > 0) condition.stage = stage;

  const caseRaw = (payload && typeof payload === "object" ? payload.case : undefined) as
    | Record<string, unknown>
    | undefined;

  // Build the evidence Observations (if applicable) BEFORE pushing anything,
  // so `condition.evidence` can be set before the Condition itself is pushed
  // — entry order in the bundle is then Condition, smoking, HbA1c (readable,
  // and stable/deterministic regardless).
  const smokingEvidence =
    VALID_SMOKING_STATUS.has(caseRaw?.smokingStatus as string) && caseRaw?.smokingStatus !== "unknown"
      ? buildSmokingObservation(subjectRef, caseRaw!.smokingStatus as "never" | "former" | "current")
      : undefined;
  const hba1cEvidence = isFiniteNumber(caseRaw?.hba1c) ? buildHba1cObservation(subjectRef, caseRaw!.hba1c as number) : undefined;

  const evidenceRefs: string[] = [];
  if (smokingEvidence) evidenceRefs.push(SMOKING_OBS_FULLURL);
  if (hba1cEvidence) evidenceRefs.push(HBA1C_OBS_FULLURL);
  if (evidenceRefs.length > 0) {
    condition.evidence = [{ detail: evidenceRefs.map((reference) => ({ reference })) }];
  }

  bundle.entry.push({ fullUrl: CONDITION_FULLURL, resource: condition });
  if (smokingEvidence) bundle.entry.push({ fullUrl: SMOKING_OBS_FULLURL, resource: smokingEvidence });
  if (hba1cEvidence) bundle.entry.push({ fullUrl: HBA1C_OBS_FULLURL, resource: hba1cEvidence });
}
