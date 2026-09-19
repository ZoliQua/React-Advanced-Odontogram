// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The per-tooth payload contract — `defaultState`, `serializeState`,
 * `hydrateState`, every `VALID_*` value set and the validation/clamping
 * helpers, extracted from odontogram.ts. This is the single place that decides
 * what a tooth record looks like on the wire and how a foreign or legacy
 * payload is coerced back into one, so it can be read and reviewed on its own.
 *
 * PURE with respect to the engine: it takes a tooth-state object in and hands
 * data back; it never touches the active chart, the selection or the DOM. Its
 * one link to the running engine is the registered-plugin id list used to drop
 * unknown `customStates` on hydrate, injected via {@link setPluginIdsProvider}
 * (odontogram.ts installs it), mirroring the notify hook.
 *
 * odontogram.ts re-exports every previously public name, so the public API
 * surface is unchanged.
 */

import { DX_CODES } from "../dx/codes";
import { validValues, validSurfaces } from "../registry/validate";
import { isValidRestoration, RESTORATION_MATRIX, type RestorationType, type RestorationMaterial } from "../registry/restorations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors the engine-wide `Any` alias
type Any = any;

/** Ids of the currently registered plugins; installed by odontogram.ts so
 *  `hydrateState` can drop `customStates` belonging to unknown plugins. */
let pluginIdsProvider: () => string[] = () => [];
export function setPluginIdsProvider(fn: () => string[]): void { pluginIdsProvider = fn; }

export function furcationEntrances(toothNo: number): string[] {
  const position = toothNo % 10;
  const quadrant = Math.floor(toothNo / 10);
  const isUpperQuadrant = quadrant === 1 || quadrant === 2;
  const isLowerQuadrant = quadrant === 3 || quadrant === 4;
  const isMolarPosition = position === 6 || position === 7 || position === 8;
  if (isMolarPosition && isUpperQuadrant) return ["mesial", "distal", "buccal"];
  if (isMolarPosition && isLowerQuadrant) return ["buccal", "lingual"];
  if (position === 4 && isUpperQuadrant) return ["mesial", "distal"]; // 14/24 only
  return [];
}

export const PERIO_SITES = ["MB", "B", "DB", "ML", "L", "DL"] as const;

export function defaultState(){
  return {
    toothSelection: "tooth-base", // none | tooth-base | milktooth | implant | variants
    endoResection: false,
    mods: new Set(),
    periapicalType: "none", // none | granuloma | cyst | abscess (qualifies mods "inflammation")
    endo: "none", // none | endo-medical-filling | endo-filling | endo-glass-pin | endo-metal-pin
    caries: new Set(),
    cariesActiveDepth: 2, // canonical ICDAS code (2 = superficial representative)
    // The single unified per-surface caries severity (0..6). Read as ICDAS on a
    // primary-caries surface (no filling → drives `caries-{surface}`
    // opacity/`caries-deep`) and as CARS on a recurrent surface (filling present
    // → drives `subcaries-{surface}` opacity).
    cariesSeverity: new Map(), // surface -> unified severity 0..6
    fillingMaterial: "none", // active material chosen in the dropdown (applied on surface tap)
    fillingSurfaces: new Set(), // buccal/mesial/distal/occlusal (= keys of fillingSurfaceMaterials)
    fillingSurfaceMaterials: new Map(), // surface -> amalgam|composite|gic|temporary
    fissureSealing: false,
    calculus: false,
    contactMesial: false,
    contactDistal: false,
    wearEdge: "none", // none | attrition | erosion  (incisal/occlusal)
    wearCervical: "none", // none | abrasion | abfraction | erosion  (cervical)
    discoloration: "none", // none | tetracycline | fluorosis | nonvital | extrinsic | other
    // Orthodontic charting axes.
    orthoAppliance: "none", // none | bracket | band
    orthoDrift: "none", // none | mesial | distal
    orthoVertical: "none", // none | extrusion | intrusion
    orthoRotation: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    extractionWound: false,
    extractionPlan: false,
    parapulpalPin: false,
    crownReplace: false,
    crownNeeded: false,
    missingClosed: false,
    bridgePillar: false,
    prosthesis: "none", // none | healing-abutment | locator | locator-denture | bar | bar-denture | removable-partial | removable-full
    mobility: "none", // none | m1 | m2 | m3
    toothSubstrate: "natural",  // natural | radix | broken | crownprep
    restorationType: "none",    // none | crown | inlay | onlay | veneer | bridge
    restorationMaterial: "none", // none | emax | gold | gradia | zircon | metal | metal-ceramic | telescope | temporary
    crownLeakage: false, // marginal leakage on a crown/bridge restoration
    // Pulp / apical / resorption diagnosis axes.
    pulpDx: "normal", // normal | reversible-pulpitis | irreversible-pulpitis | necrosis (replaces the legacy `pulpInflam` boolean)
    pulpLatin: "none", // none | pulpa-sana | hyperaemia-pulpae | pulpitis-acuta-serosa | pulpitis-acuta-purulenta | pulpitis-chronica-clausa | pulpitis-chronica-ulcerosa | pulpitis-chronica-hyperplastica | necrosis-pulpae | gangraena-pulpae
    apicalDx: "normal", // normal | symptomatic-apical-periodontitis | asymptomatic-apical-periodontitis | acute-apical-abscess | chronic-apical-abscess | condensing-osteitis
    resorptionType: "none", // none | internal | external-cervical (replaces the legacy `rootResorption` boolean)
    // `rootCaries` is a normal enum axis. `radiographicDepth` is a per-surface
    // scalar map, independent of the visual severity (the radiographic-vs-visual
    // split).
    rootCaries: "none", // none | active | arrested | active-cavitated
    radiographicDepth: new Map(), // surface -> none | E1 | E2 | D1 | D2 | D3
    fillingDefect: new Map(), // surface -> none | marginal | fracture | wear (on a filled surface)
    dxOverrides: new Map(), // DiagnosisKey -> add | suppress (per-tooth ICD-10 diagnosis override)
    // Implant-only peri-implant disease axis. none | mucositis |
    // peri-implantitis-mild | peri-implantitis-moderate | peri-implantitis-severe.
    periImplant: "none",
    // Two per-tooth categorical data axes (registry/FHIR/payload only). Both
    // default "none" and are omitted when "none" on serialize; NO svgLayer, so
    // neither renders.
    cejVisibility: "none", // none | detectable | not-detectable
    rootConcavity: "none", // none | mild | deep
    // Two per-tooth categorical data axes (registry/FHIR/payload only). Both are
    // omitted on serialize when at default; NO svgLayer, so neither renders.
    gingivalThickness: "unknown", // unknown | thin | medium | thick
    millerClass: "none", // none | i | ii | iii | iv
    // Per-tooth, per-site periodontal probing data — deliberately a SEPARATE
    // sub-record from the 5-surface caries maps above (perio sites are a
    // different geometry: 6 fixed probing points, not tooth surfaces). `pd`
    // (probing depth, mm) is the CHARTING key: a
    // site exists in this record iff `pd` has an entry for it — "absence
    // means not charted", never zero. `gm` (gingival margin offset, mm;
    // signed — positive = recession, negative = coronal/pseudopocket)
    // defaults to 0 when unset. Clinical attachment level (CAL = pd + gm) is
    // ALWAYS derived (see getToothCal()) — never stored. `bop`/`sup`
    // (bleeding/suppuration on probing) are membership-only Sets, and are
    // only ever meaningful for a charted site (see setPerioSite()).
    perio: { pd: new Map(), gm: new Map(), bop: new Set(), sup: new Set() },
    // Per-entrance Glickman furcation involvement grade (I-IV, stored as
    // integer 1-4). Keyed by entrance ("mesial"/"distal"/
    // "buccal"/"lingual" — see furcationEntrances()); an entrance absent
    // from this map is "not recorded", never grade 0. Separate sub-record
    // from `perio` (different geometry: furcation entrances, not the 6
    // fixed probing sites) but follows the exact same omit-when-empty /
    // dual-state conventions.
    furcation: new Map(), // entrance -> grade 1-4
    // Per-surface O'Leary plaque-index presence — a plain 4-surface membership
    // Set (surface in the set = plaque present on
    // it; absence = clean/not recorded — NOT "known absent", same
    // "absence means not charted" convention `perio`/`furcation` use). The
    // 4 surfaces (VALID_PLAQUE_SURFACE below) are the SAME fixed set for
    // EVERY tooth — deliberately distinct from both the 6-site perio-probing
    // geometry and the 5-surface caries/filling geometry, and unlike
    // furcation's position-gated entrance set, no per-tooth gating function
    // is needed here.
    plaque: new Set(), // Set<"mesial"|"distal"|"buccal"|"lingual">
    // Silness-Löe Plaque Index (`pi`) and Löe-Silness Gingival Index (`gi`) —
    // per-surface GRADED indices (1-3), over the
    // SAME 4 fixed surfaces as the O'Leary `plaque` boolean above but
    // DELIBERATELY SEPARATE from it (different clinical instrument; a tooth
    // can carry both). Grade 0 (healthy/absent) is never stored — a surface
    // absent from the map means grade 0, same "absence means not charted"
    // convention `perio`/`furcation`/`plaque` all use.
    pi: new Map(), // surface -> Silness-Löe plaque grade 1-3 (absent = 0)
    gi: new Map(), // surface -> Löe-Silness gingival grade 1-3 (absent = 0)
    mpi: new Map(), // implant-only: Mombelli modified plaque index, surface -> grade 1-3 (absent = 0)
    mbi: new Map(), // implant-only: Mombelli modified sulcus bleeding index, surface -> grade 1-3
    // Keratinized gingiva width — a single per-tooth BUCCAL mm scalar (integer,
    // clamped 0-15), deliberately NOT per-site/
    // per-surface unlike pi/gi/perio above. `null` = not charted (never a
    // stored 0 vs "uncharted" ambiguity — see clampKg()/setKeratinizedWidth()).
    kg: null as number | null,
    customStates: {} as Record<string, unknown>,
    note: "",
  };
}

export function isToothPresent(sel: Any){
  return sel !== "none" && sel !== "implant";
}

const VALID_ICDAS = new Set([1,2,3,4,5,6]);

export function threeLevelToIcdas(level: string): number { return level === "deep" ? 6 : level === "dentin" ? 4 : 2; }

export function serializeState(s: Any){
  return {
    toothSelection: s.toothSelection,
    pulpDx: s.pulpDx,
    // pulpLatin (practical-Latin subtype) and apicalDx (apical AAE diagnosis) are
    // authorable in the diagnosis UI and join the serialized payload — this also
    // feeds the FHIR export (both are mapped in FIELD_MAPPINGS). Both round-trip
    // via fromRaw below.
    pulpLatin: s.pulpLatin,
    apicalDx: s.apicalDx,
    endoResection: !!s.endoResection,
    resorptionType: s.resorptionType,
    // Peri-implant status (mucositis / peri-implantitis staging) — serialized
    // alongside the other enum-axis fields so it round-trips on export/import.
    periImplant: s.periImplant,
    mods: Array.from(s.mods || []),
    periapicalType: s.periapicalType,
    endo: s.endo,
    caries: Array.from(s.caries || []),
    cariesActiveDepth: s.cariesActiveDepth,
    // The unified per-surface severity, serialized as Record<surface,number>.
    cariesSeverity: Object.fromEntries(s.cariesSeverity || new Map()),
    fillingMaterial: s.fillingMaterial,
    fillingSurfaces: Array.from(s.fillingSurfaces || []),
    fillingSurfaceMaterials: Object.fromEntries(s.fillingSurfaceMaterials || new Map()),
    fissureSealing: !!s.fissureSealing,
    calculus: !!s.calculus,
    contactMesial: !!s.contactMesial,
    contactDistal: !!s.contactDistal,
    wearEdge: s.wearEdge,
    wearCervical: s.wearCervical,
    discoloration: s.discoloration,
    orthoAppliance: s.orthoAppliance,
    orthoDrift: s.orthoDrift,
    orthoVertical: s.orthoVertical,
    orthoRotation: !!s.orthoRotation,
    brokenMesial: !!s.brokenMesial,
    brokenIncisal: !!s.brokenIncisal,
    brokenDistal: !!s.brokenDistal,
    extractionWound: !!s.extractionWound,
    extractionPlan: !!s.extractionPlan,
    parapulpalPin: !!s.parapulpalPin,
    crownReplace: !!s.crownReplace,
    crownNeeded: !!s.crownNeeded,
    missingClosed: !!s.missingClosed,
    bridgePillar: !!s.bridgePillar,
    prosthesis: s.prosthesis,
    mobility: s.mobility,
    toothSubstrate: s.toothSubstrate,
    restorationType: s.restorationType,
    restorationMaterial: s.restorationMaterial,
    crownLeakage: !!s.crownLeakage,
    rootCaries: s.rootCaries,
    radiographicDepth: Object.fromEntries(s.radiographicDepth || new Map()),
    fillingDefect: Object.fromEntries(s.fillingDefect || new Map()),
    // Omitted ENTIRELY when no site is charted (mirrors the customStates/note
    // pattern below).
    ...((s.perio?.pd?.size ?? 0) > 0 ? { perio: {
      pd: Object.fromEntries(s.perio.pd),
      gm: Object.fromEntries(s.perio.gm),
      bop: Array.from(s.perio.bop),
      sup: Array.from(s.perio.sup),
    } } : {}),
    // Omitted ENTIRELY when no entrance is graded, same convention as `perio`
    // above.
    ...((s.furcation?.size ?? 0) > 0 ? { furcation: Object.fromEntries(s.furcation) } : {}),
    // Omitted ENTIRELY when no surface has plaque, same convention as
    // `perio`/`furcation` above.
    ...((s.plaque?.size ?? 0) > 0 ? { plaque: Array.from(s.plaque) } : {}),
    // pi/gi are emitted ONLY when at least one surface is graded, same
    // omit-when-empty convention as perio/furcation/plaque above.
    ...((s.pi?.size ?? 0) > 0 ? { pi: Object.fromEntries(s.pi) } : {}),
    ...((s.gi?.size ?? 0) > 0 ? { gi: Object.fromEntries(s.gi) } : {}),
    ...((s.mpi?.size ?? 0) > 0 ? { mpi: Object.fromEntries(s.mpi) } : {}),
    ...((s.mbi?.size ?? 0) > 0 ? { mbi: Object.fromEntries(s.mbi) } : {}),
    // Keratinized gingiva width — omitted ENTIRELY when not charted (null), same
    // omit-when-empty convention as pi/gi above.
    ...(s.kg != null ? { kg: s.kg } : {}),
    // cejVisibility/rootConcavity are emitted ONLY when set (!== "none"), like the
    // omit-when-empty perio fields above. Both round-trip via validateEnum in
    // hydrateState (default "none").
    ...(s.cejVisibility && s.cejVisibility !== "none" ? { cejVisibility: s.cejVisibility } : {}),
    ...(s.rootConcavity && s.rootConcavity !== "none" ? { rootConcavity: s.rootConcavity } : {}),
    // gingivalThickness/millerClass are emitted ONLY when set (!== their skip
    // value), like cejVisibility/rootConcavity above. Both round-trip via
    // validateEnum in hydrateState.
    ...(s.gingivalThickness && s.gingivalThickness !== "unknown" ? { gingivalThickness: s.gingivalThickness } : {}),
    ...(s.millerClass && s.millerClass !== "none" ? { millerClass: s.millerClass } : {}),
    ...(Object.keys(s.customStates || {}).length > 0 ? { customStates: s.customStates } : {}),
    ...(s.note ? { note: s.note } : {}),
    // Per-tooth diagnosis add/suppress overrides — omitted ENTIRELY when empty,
    // same convention as perio/furcation/plaque above.
    ...((s.dxOverrides?.size ?? 0) > 0 ? { dxOverrides: Object.fromEntries(s.dxOverrides) } : {}),
  };
}

// Allowed values for imported state fields
export const VALID_TOOTH_SELECTION = validValues("toothSelection");
export const VALID_ENDO = validValues("endo");
export const VALID_FILLING_MATERIAL = validValues("fillingMaterial");
export const VALID_PROSTHESIS = validValues("prosthesis");
export const VALID_MOBILITY = validValues("mobility");
export const VALID_TOOTH_SUBSTRATE = validValues("toothSubstrate");
export const VALID_RESTORATION_TYPE = validValues("restorationType");
export const VALID_RESTORATION_MATERIAL = validValues("restorationMaterial");
export const VALID_MODS = validValues("mods");
export const VALID_PERIAPICAL_TYPE = validValues("periapicalType");
export const VALID_CARIES = validValues("caries");
// Pulp/apical/resorption diagnosis axes.
export const VALID_PULP_DX = validValues("pulpDx");
export const VALID_PULP_LATIN = validValues("pulpLatin");
export const VALID_APICAL_DX = validValues("apicalDx");
export const VALID_RESORPTION_TYPE = validValues("resorptionType");
export const VALID_WEAR_EDGE = validValues("wearEdge");
export const VALID_WEAR_CERVICAL = validValues("wearCervical");
export const VALID_DISCOLORATION = validValues("discoloration");
// Orthodontic axes.
export const VALID_ORTHO_APPLIANCE = validValues("orthoAppliance");
export const VALID_ORTHO_DRIFT = validValues("orthoDrift");
export const VALID_ORTHO_VERTICAL = validValues("orthoVertical");
export const VALID_FILLING_SURFACES = validSurfaces();
// Caries fields. `rootCaries` is a registered axis, so it reads from AXES like
// every other enum. `cariesSeverity` (unified 0..6 visual severity) and
// `radiographicDepth` are per-surface scalar-map fields with no axis of their
// own, so their valid sets are literal here. `VALID_CARS` is retained for
// reading the legacy `secondaryCaries` map off legacy raw payloads during
// migration (see hydrateState).
export const VALID_ROOT_CARIES = validValues("rootCaries");
// Peri-implantitis axis.
export const VALID_PERI_IMPLANT = validValues("periImplant");
// Two categorical data axes (registry axes; read from AXES like every other enum).
export const VALID_CEJ_VISIBILITY = validValues("cejVisibility");
export const VALID_ROOT_CONCAVITY = validValues("rootConcavity");
// Two categorical data axes (registry axes; read from AXES like every other enum).
export const VALID_GINGIVAL_THICKNESS = validValues("gingivalThickness");
export const VALID_MILLER_CLASS = validValues("millerClass");
export const VALID_CARS = new Set([0, 1, 2, 3, 4, 5, 6]);
export const VALID_CARIES_SEVERITY = new Set([0, 1, 2, 3, 4, 5, 6]);
export const VALID_RADIOGRAPHIC_DEPTH = new Set(["none", "E1", "E2", "D1", "D2", "D3"]);
export const VALID_FILLING_DEFECT = new Set(["none", "marginal", "fracture", "wear"]);
export const VALID_FILLING_DEFECT_SET = new Set(["marginal", "fracture", "wear"]); // non-none, valid stored values
// The union of every entrance value furcationEntrances() can ever return,
// across all tooth positions — used by hydrateState to
// validate a raw payload's `furcation` keys generically (hydrateState has no
// tooth-position context to call furcationEntrances(toothNo) itself, exactly
// like VALID_FILLING_SURFACES/VALID_RADIOGRAPHIC_DEPTH above are validated
// against a tooth-independent set, not a per-tooth one). setFurcation(), by
// contrast, DOES know the tooth and validates against the exact per-tooth set.
export const VALID_FURCATION_ENTRANCE = new Set(["mesial", "distal", "buccal", "lingual"]);
export const VALID_FURCATION_GRADE = new Set([1, 2, 3, 4]); // Glickman I-IV
// The 4 fixed O'Leary plaque-index surfaces — the SAME
// set for every tooth (unlike VALID_FURCATION_ENTRANCE, which is filtered
// per-tooth-position by furcationEntrances()), so both setPlaque() and
// hydrateState() validate directly against this one constant.
export const VALID_PLAQUE_SURFACE = new Set(["mesial", "distal", "buccal", "lingual"]);
// Per-tooth diagnosis add/suppress overrides. "add" forces a diagnosis on
// despite no matching clinical finding; "suppress" forces it off despite one.
export const VALID_DX_OVERRIDE_VALUE = new Set(["add", "suppress"]);
// Tooth-level diagnosis keys = every DX_CODES catalog key except the two
// whole-mouth periodontal ones (periodontitis/gingivitis are derived from the
// case-level perio classification, not authored per tooth).
export const TOOTH_LEVEL_DX_KEYS = new Set(Object.keys(DX_CODES).filter((k) =>
  k !== "periodontitis" && k !== "gingivitis" && k !== "periImplantMucositis" && k !== "periImplantitis"));

function filterSet(arr: Any, allowed: Set<string>): Set<string>{
  if(!Array.isArray(arr)) return new Set();
  return new Set(arr.filter((v: Any) => typeof v === "string" && allowed.has(v)));
}

function validateEnum(value: Any, allowed: Set<string>, fallback: string): string{
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

// Clinical ranges for the two perio scalar fields.
type PerioField = "pd" | "gm";
const PERIO_RANGES: Record<PerioField, [number, number]> = { pd: [1, 15], gm: [-10, 20] };

/**
 * Validate + clamp a perio `pd`/`gm` value. Returns the clamped integer
 * within the field's clinical range, or `null` for a value the field can't
 * represent at all: a non-integer/non-finite `v` (reject signal — the caller
 * must leave state untouched), or — for `pd` specifically — a value below the
 * minimum (0, negative), which doubles as the "un-chart this site" signal
 * `setPerioSite`/`hydrateState` rely on (a probing depth of 0 isn't a
 * clinical reading, it's "not probed"). `gm` has no such floor signal: it
 * clamps to its minimum like its maximum, since a coronal/pseudopocket
 * reading past -10mm is still a valid (if extreme) reading, not an absence.
 * Shared verbatim by setPerioSite (live edits) and hydrateState (payload
 * import), so both paths enforce identical bounds.
 */
export function clampPerio(field: PerioField, v: unknown): number | null {
  if(typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v)) return null;
  const [min, max] = PERIO_RANGES[field];
  if(field === "pd" && v < min) return null;
  return Math.min(max, Math.max(min, v));
}

/**
 * Is a payload version older than 2.3?
 *
 * Payloads before 2.3 never stored an explicit per-surface `secondaryCaries`
 * CARS score — recurrent/secondary caries was DERIVED at render/summary time
 * from `caries ∩ fillingSurfaceMaterials`. So for a legacy payload we must
 * re-infer that intersection into an explicit score 3 on hydrate. A native 2.3+
 * payload, by contrast, stores the score deliberately: a caried surface with a
 * filling and NO recurrent score means the clinician left it primary, and we
 * must NOT flip it to recurrent on export→reimport.
 *
 * A missing/blank/non-string version is treated as legacy (pre-versioned or
 * pre-2.3 payloads had no version tag). Comparison is dotted-numeric so 1.4 <
 * 2.2 < 2.3 < 2.10 order correctly (not string-lexicographic).
 */
export function isLegacyPayloadVersion(version: unknown): boolean {
  if(typeof version !== "string" || version.trim() === "") return true;
  const parse = (v: string) => v.split(".").map((p) => { const n = parseInt(p, 10); return Number.isFinite(n) ? n : 0; });
  const a = parse(version);
  const b = [2, 3, 0]; // threshold: 2.3.0
  for(let i = 0; i < Math.max(a.length, b.length); i++){
    const x = a[i] ?? 0, y = b[i] ?? 0;
    if(x !== y) return x < y;
  }
  return false; // exactly 2.3.0 → not legacy
}

/**
 * @param inferLegacySecondaryCaries When true (the DEFAULT — preserves every
 *   internal seam/preset/version-less caller and the existing SVG goldens), a
 *   surface present in BOTH `caries` and `fillingSurfaceMaterials` with no
 *   stored severity is given the canonical recurrent `cariesSeverity` value 3
 *   (the surface is recurrent regardless — this only fixes its CARS
 *   opacity). The JSON/FHIR import path passes `false` for native ≥2.3 payloads
 *   so a caried+filled surface with no stored value keeps the render default.
 */
export function hydrateState(raw: Any, inferLegacySecondaryCaries = true){
  const s = defaultState();
  if(!raw || typeof raw !== "object") return s;
  // Legacy migration (payload < 2.0): the flat `crownMaterial` enum and the
  // FIXED `bridgeUnit` values split into `toothSubstrate` +
  // `restorationType`×`restorationMaterial`. Detected by the absence of the new
  // `restorationType` field (mirrors the fillingSurfaceMaterials v1.3 fallback).
  // Unknown/absent values fall through to defaults; never throws.
  const legacyFixedBridge = raw.bridgeUnit === "zircon" || raw.bridgeUnit === "metal" || raw.bridgeUnit === "temporary";
  if(raw.restorationType === undefined && (raw.crownMaterial !== undefined || legacyFixedBridge)){
    const cm = typeof raw.crownMaterial === "string" ? raw.crownMaterial : "natural";
    if(cm === "natural" || cm === "radix" || cm === "broken" || cm === "crownprep"){
      raw.toothSubstrate = cm;
      raw.restorationType = "none";
      raw.restorationMaterial = "none";
      raw.crownMaterial = "natural";
    }else if(cm === "metal"){
      // Legacy "metal" crown = PFM → metal-ceramic (deliberate rename).
      raw.toothSubstrate = "crownprep";
      raw.restorationType = "crown";
      raw.restorationMaterial = "metal-ceramic";
      raw.crownMaterial = "natural";
    }else if(["emax","zircon","temporary","telescope","gold","gradia"].includes(cm)){
      raw.toothSubstrate = "crownprep";
      raw.restorationType = "crown";
      raw.restorationMaterial = cm;
      raw.crownMaterial = "natural";
    }else{
      // Implant attachments (healing-abutment/locator/bar…): preserved in
      // `crownMaterial`, migrated onto the `prosthesis` axis below.
      raw.restorationType = "none";
      raw.restorationMaterial = "none";
    }
    // Fixed bridge values fold into restorationType:bridge × material; removable/
    // bar values stay on `bridgeUnit` (migrated onto `prosthesis` below).
    if(raw.bridgeUnit === "zircon" || raw.bridgeUnit === "metal" || raw.bridgeUnit === "temporary"){
      raw.restorationType = "bridge";
      raw.restorationMaterial = raw.bridgeUnit === "metal" ? "metal-ceramic" : raw.bridgeUnit;
      raw.bridgeUnit = "none";
    }
  }
  // A legacy (payload 2.0) implant FIXED crown was serialized as
  // {toothSelection:"implant", restorationType:"none", restorationMaterial:"none",
  // crownMaterial:<fixed material>}. The legacy block above is gated on
  // restorationType===undefined so it skips this (restorationType is "none", not
  // absent), and the prosthesis-migration below only maps ATTACHMENT crownMaterial
  // values — so the crown would silently vanish. Fold a fixed-crown crownMaterial
  // on an implant (restorationType absent OR "none") into restorationType:"crown"
  // × material, with the metal→metal-ceramic rename. Attachment crownMaterial
  // values (healing-abutment/locator/bar…) are not in this set, so they fall
  // through to the prosthesis migration untouched.
  const FIXED_CROWN_MATERIALS = ["emax", "zircon", "gold", "gradia", "metal", "telescope", "temporary"];
  if(raw.toothSelection === "implant"
     && (raw.restorationType === undefined || raw.restorationType === "none")
     && typeof raw.crownMaterial === "string"
     && FIXED_CROWN_MATERIALS.includes(raw.crownMaterial)){
    raw.restorationType = "crown";
    raw.restorationMaterial = raw.crownMaterial === "metal" ? "metal-ceramic" : raw.crownMaterial;
    raw.crownMaterial = "natural";
  }
  // Migrate the legacy implant-attachment (`crownMaterial` on an implant tooth)
  // and removable/bar-denture (`bridgeUnit` on a gap tooth) values onto the
  // `prosthesis` axis when no explicit `prosthesis` was supplied — whether this
  // payload is old-format (migrated above) or was written by an engine that
  // defined restorationType but never serialized `prosthesis`. Gated by the SAME
  // context
  // the legacy render branches required (isImplant / isNone): an attachment value
  // sitting on an unrelated toothSelection (only reachable via crafted/imported
  // payloads, never the UI) must not gain a `prosthesis` value it never rendered.
  if(raw.prosthesis === undefined){
    const CROWN_MATERIAL_TO_PROSTHESIS: Record<string, string> = {
      "healing-abutment": "healing-abutment",
      "locator": "locator",
      "locator-prosthesis": "locator-denture",
      "bar": "bar",
      "bar-prosthesis": "bar-denture",
    };
    const BRIDGE_UNIT_TO_PROSTHESIS: Record<string, string> = {
      "removable": "removable-partial",
      "bar": "bar",
      "bar-prosthesis": "bar-denture",
    };
    if(raw.toothSelection === "implant" && typeof raw.crownMaterial === "string" && CROWN_MATERIAL_TO_PROSTHESIS[raw.crownMaterial]){
      raw.prosthesis = CROWN_MATERIAL_TO_PROSTHESIS[raw.crownMaterial];
    }else if(raw.toothSelection === "none" && typeof raw.bridgeUnit === "string" && BRIDGE_UNIT_TO_PROSTHESIS[raw.bridgeUnit]){
      raw.prosthesis = BRIDGE_UNIT_TO_PROSTHESIS[raw.bridgeUnit];
    }
  }
  s.toothSelection = validateEnum(raw.toothSelection, VALID_TOOTH_SELECTION, s.toothSelection);
  // Migrate the legacy `pulpInflam` boolean to `pulpDx`: true ->
  // "irreversible-pulpitis" (the only condition state the old boolean could
  // represent); false/absent -> "normal". A modern payload's own pulpDx (if
  // present and valid) wins over the migrated legacy value.
  const migratedPulpDx = raw.pulpInflam ? "irreversible-pulpitis" : "normal";
  s.pulpDx = validateEnum(raw.pulpDx, VALID_PULP_DX, migratedPulpDx);
  // pulpLatin (practical-Latin subtype) round-trips independently of the
  // pulp-detail level. It has no legacy predecessor, so absent/invalid -> "none".
  s.pulpLatin = validateEnum(raw.pulpLatin, VALID_PULP_LATIN, "none");
  s.endoResection = !!raw.endoResection;
  // Migrate the legacy `rootResorption` boolean to `resorptionType`: true ->
  // "external-cervical" (the only subtype the old boolean could represent);
  // false/absent -> "none". A modern payload's own resorptionType (if present and
  // valid) wins over the migrated legacy value.
  const migratedResorptionType = raw.rootResorption ? "external-cervical" : "none";
  s.resorptionType = validateEnum(raw.resorptionType, VALID_RESORPTION_TYPE, migratedResorptionType);
  s.mods = filterSet(raw.mods, VALID_MODS);
  s.periapicalType = validateEnum(raw.periapicalType, VALID_PERIAPICAL_TYPE, "none");
  // `apicalDx` (enum) drives the periapical glyph on a PRESENT tooth, decoupled
  // from `mods.inflammation`. Derive it from the legacy
  // pairing of mods.inflammation + periapicalType: on a present tooth, a set
  // `inflammation` mod meant an apical lesion — the "abscess" subtype maps to
  // acute-apical-abscess, every other subtype (granuloma / cyst / unset) to
  // asymptomatic-apical-periodontitis. The `inflammation` mod is then REMOVED
  // from a present tooth's mods (the lesion is fully represented by apicalDx;
  // keeping it would double-encode and re-fire the retired render path). On a
  // NON-present tooth (missing / implant) `inflammation` keeps its SECOND role
  // — periodontal inflammation — so it is LEFT untouched and apicalDx stays
  // "normal". periapicalType is preserved as the histological lesion subtype.
  // A modern payload's own apicalDx (if present and valid) wins over the derived value.
  let migratedApicalDx = "normal";
  if(s.mods.has("inflammation") && isToothPresent(s.toothSelection)){
    migratedApicalDx = s.periapicalType === "abscess" ? "acute-apical-abscess" : "asymptomatic-apical-periodontitis";
    s.mods.delete("inflammation");
  }
  s.apicalDx = validateEnum(raw.apicalDx, VALID_APICAL_DX, migratedApicalDx);
  // Enforce the lesion-subtype invariant on read. On a PRESENT tooth the
  // granuloma/cyst subtype (including the legacy `abscess` subtype) is valid
  // only under symptomatic/asymptomatic apical periodontitis; otherwise it is
  // cleared to "none". Non-present teeth are left untouched (their stored
  // subtype still feeds the unchanged non-present render path). Never throws.
  if(isToothPresent(s.toothSelection)){
    if(s.apicalDx !== "symptomatic-apical-periodontitis"
        && s.apicalDx !== "asymptomatic-apical-periodontitis"){
      s.periapicalType = "none";
    }
  }
  s.endo = validateEnum(raw.endo, VALID_ENDO, s.endo);
  // Enforce the endo/pulp mutual-exclusion invariant on read. A tooth with
  // any endodontic treatment (endo !== "none") has no vital pulp, so it cannot
  // carry a pulpitis/necrosis diagnosis. Normalize to "normal" (also clears any
  // Latin subtype). Runs unconditionally — a conformant payload never violates
  // this, so it is a no-op except on contradictory legacy/hand-edited data.
  // NOTE: placed here (after s.endo is assigned from `raw`, not immediately
  // after the s.pulpDx assignment above) because s.endo is not populated from
  // `raw.endo` until this line — checking it any earlier would only ever see
  // defaultState()'s "none" placeholder and never normalize a real payload.
  if(s.endo && s.endo !== "none" && (s.pulpDx !== "normal" || s.pulpLatin !== "none")){
    s.pulpDx = "normal";
    s.pulpLatin = "none";
  }
  s.caries = filterSet(raw.caries, VALID_CARIES);
  const toIcdas = (v: Any): number | null => {
    if(typeof v === "number" && VALID_ICDAS.has(v)) return v;
    if(typeof v === "string"){
      if(v === "surface" || v === "dentin" || v === "deep") return threeLevelToIcdas(v);
      const n = Number(v); if(VALID_ICDAS.has(n)) return n;
    }
    return null;
  };
  s.cariesActiveDepth = toIcdas(raw.cariesActiveDepth) ?? 2;
  // Caries-severity migration inputs. The unified `cariesSeverity` is built AFTER
  // `fillingSurfaceMaterials` (below), merging three raw sources per surface:
  //   - `raw.cariesSeverity` (native unified field)    — always wins,
  //   - `raw.cariesDepths`   (legacy ICDAS map)        — primary fallback,
  //   - `raw.secondaryCaries` (legacy CARS map)        — recurrent fallback.
  // These are parsed into locals here; only `cariesSeverity` survives on state.
  const rawSeverity = new Map<string, number>();
  if(raw.cariesSeverity && typeof raw.cariesSeverity === "object"){
    for(const [surf, val] of Object.entries(raw.cariesSeverity)){
      const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
      if(VALID_FILLING_SURFACES.has(surf) && VALID_CARIES_SEVERITY.has(num)) rawSeverity.set(surf, num);
    }
  }
  const rawDepths = new Map<string, number>();
  if(raw.cariesDepths && typeof raw.cariesDepths === "object"){
    for(const [surf, val] of Object.entries(raw.cariesDepths)){
      const code = toIcdas(val);
      if(VALID_FILLING_SURFACES.has(surf) && code !== null) rawDepths.set(surf, code);
    }
  }
  const rawSecondary = new Map<string, number>();
  if(raw.secondaryCaries && typeof raw.secondaryCaries === "object"){
    for(const [surf, val] of Object.entries(raw.secondaryCaries)){
      const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
      if(VALID_FILLING_SURFACES.has(surf) && VALID_CARS.has(num)) rawSecondary.set(surf, num);
    }
  }
  // `rootCaries` is a normal enum. `radiographicDepth` is a per-surface scalar
  // map, independent of the unified visual severity.
  s.rootCaries = validateEnum(raw.rootCaries, VALID_ROOT_CARIES, "none");
  // Peri-implant disease (enum, implant-only). Absent/invalid -> "none".
  s.periImplant = validateEnum(raw.periImplant, VALID_PERI_IMPLANT, "none");
  // Migrate legacy implant signals. An implant tooth that carried
  // mods.inflammation or mods.parodontal recorded soft-tissue inflammation with
  // no bone-loss grade, so it becomes peri-implant mucositis and the mod is
  // removed (non-implant teeth keep their mods). Runs unconditionally — a modern
  // payload never has those mods on an implant, so it's a no-op there.
  if(s.toothSelection === "implant" && s.periImplant === "none"){
    if(s.mods.has("inflammation")){ s.periImplant = "mucositis"; s.mods.delete("inflammation"); }
    if(s.mods.has("parodontal")){ s.periImplant = "mucositis"; s.mods.delete("parodontal"); }
  }
  // cejVisibility/rootConcavity enum axes. Absent/legacy payloads have no key ->
  // "none". No migration needed.
  s.cejVisibility = validateEnum(raw.cejVisibility, VALID_CEJ_VISIBILITY, "none");
  s.rootConcavity = validateEnum(raw.rootConcavity, VALID_ROOT_CONCAVITY, "none");
  // gingivalThickness/millerClass enum axes. Absent/legacy payloads have no key
  // -> the default (no throw); an unrecognized value self-heals to the default,
  // same tolerant-hydrate policy as every other axis above.
  s.gingivalThickness = validateEnum(raw.gingivalThickness, VALID_GINGIVAL_THICKNESS, "unknown");
  s.millerClass = validateEnum(raw.millerClass, VALID_MILLER_CLASS, "none");
  s.radiographicDepth = new Map();
  if(raw.radiographicDepth && typeof raw.radiographicDepth === "object"){
    for(const [surf, val] of Object.entries(raw.radiographicDepth)){
      if(VALID_FILLING_SURFACES.has(surf) && typeof val === "string" && VALID_RADIOGRAPHIC_DEPTH.has(val)) s.radiographicDepth.set(surf, val);
    }
  }
  // Per-surface filling defect (legacy payloads have none).
  s.fillingDefect = new Map();
  if(raw.fillingDefect && typeof raw.fillingDefect === "object"){
    for(const [surf, val] of Object.entries(raw.fillingDefect)){
      if(VALID_FILLING_SURFACES.has(surf) && typeof val === "string" && VALID_FILLING_DEFECT_SET.has(val)) s.fillingDefect.set(surf, val);
    }
  }
  // Per-tooth diagnosis add/suppress overrides (legacy payloads have none).
  s.dxOverrides = new Map();
  if(raw.dxOverrides && typeof raw.dxOverrides === "object"){
    for(const [k, v] of Object.entries(raw.dxOverrides)){
      if(TOOTH_LEVEL_DX_KEYS.has(k) && typeof v === "string" && VALID_DX_OVERRIDE_VALUE.has(v)) s.dxOverrides.set(k, v);
    }
  }
  s.fillingMaterial = validateEnum(raw.fillingMaterial, VALID_FILLING_MATERIAL, s.fillingMaterial);
  s.fillingSurfaces = filterSet(raw.fillingSurfaces, VALID_FILLING_SURFACES);
  s.fillingSurfaceMaterials = new Map();
  const rawFSM = raw.fillingSurfaceMaterials;
  if(rawFSM && typeof rawFSM === "object"){
    // v1.4 format
    for(const [surf, mat] of Object.entries(rawFSM)){
      if(VALID_FILLING_SURFACES.has(surf) && typeof mat === "string" && VALID_FILLING_MATERIAL.has(mat) && mat !== "none"){
        s.fillingSurfaceMaterials.set(surf, mat);
      }
    }
  }else if(s.fillingMaterial !== "none" && s.fillingSurfaces.size > 0){
    // legacy v1.3: one material applied to all filled surfaces
    for(const surf of s.fillingSurfaces){
      s.fillingSurfaceMaterials.set(surf, s.fillingMaterial);
    }
  }
  // keep fillingSurfaces in sync with the map keys
  s.fillingSurfaces = new Set(s.fillingSurfaceMaterials.keys());
  // Build the unified per-surface `cariesSeverity` from the three raw sources
  // (parsed above), now that `caries` and
  // `fillingSurfaceMaterials` are finalized. Per surface the value is resolved
  // by the state machine:
  //   - a native `raw.cariesSeverity` value ALWAYS wins (round-trips 2.4),
  //   - otherwise a RECURRENT surface (has a filling) prefers the retired CARS
  //     score, then the retired ICDAS depth, then a representative default,
  //   - a PRIMARY surface (no filling) takes the retired ICDAS depth.
  // Only surfaces with an explicit source value get an entry — a caried surface
  // with no source resolves to the render/summary default (2) via `?? 2`, so
  // omitting it is render-identical and preserves byte-compat.
  //
  // The legacy caries∩filling → score inference (there is no stored recurrent
  // value on a <2.3 payload) fires ONLY
  // for legacy callers. `inferLegacySecondaryCaries` defaults to `true`
  // (internal seams/presets/version-less callers, preserving goldens), while the
  // JSON/FHIR import path passes `false` for native ≥2.3 payloads where a caried
  // + filled surface with no recurrent score is a deliberate primary lesion.
  s.cariesSeverity = new Map();
  const severitySurfaces = new Set<string>([
    ...rawSeverity.keys(), ...rawDepths.keys(), ...rawSecondary.keys(),
  ]);
  for(const surf of s.fillingSurfaceMaterials.keys()){
    if(inferLegacySecondaryCaries && s.caries.has("caries-" + surf)) severitySurfaces.add(surf);
  }
  for(const surf of severitySurfaces){
    if(rawSeverity.has(surf)){ s.cariesSeverity.set(surf, rawSeverity.get(surf)!); continue; }
    const hasFilling = s.fillingSurfaceMaterials.has(surf);
    if(hasFilling){
      // Recurrent: prefer the stored CARS score, then the ICDAS depth, then the
      // legacy caries∩filling inference (default recurrent score 3).
      if(rawSecondary.has(surf)){ s.cariesSeverity.set(surf, rawSecondary.get(surf)!); }
      else if(rawDepths.has(surf)){ s.cariesSeverity.set(surf, rawDepths.get(surf)!); }
      else if(inferLegacySecondaryCaries && s.caries.has("caries-" + surf)){ s.cariesSeverity.set(surf, 3); }
    }else{
      // Primary: the ICDAS depth.
      if(rawDepths.has(surf)){ s.cariesSeverity.set(surf, rawDepths.get(surf)!); }
    }
  }
  // Normalize a contradictory legacy input — a surface that's both in `caries`
  // and filled (i.e. recurrent) but whose
  // resolved severity is an explicit CARS 0 (Sound). That combination is only
  // reachable via a raw payload (the popup can't produce it — picking CARS 0
  // there already removes the caries via `applyRecurrentCariesScore`), and
  // left as-is it renders `subcaries-{surface}` at the SVG's default opacity,
  // silently keeping a caries indicator that should have been cleared.
  // Resolve it the same way the popup does (score 0 removes the surface from
  // `caries` and clears its severity — same transition as
  // `applyRecurrentCariesScore`, inlined here to avoid a `Set<unknown>` vs
  // `Set<string>` type mismatch against `defaultState()`'s untyped `caries`).
  // Input-side only — does not touch render/state-machine/popup logic.
  for(const surf of s.fillingSurfaceMaterials.keys()){
    if(s.caries.has("caries-" + surf) && s.cariesSeverity.get(surf) === 0){
      s.caries.delete("caries-" + surf);
      s.cariesSeverity.delete(surf);
    }
  }
  s.fissureSealing = !!raw.fissureSealing;
  s.calculus = !!raw.calculus;
  s.contactMesial = !!raw.contactMesial;
  s.contactDistal = !!raw.contactDistal;
  // Migrate the legacy bruxismWear/bruxismNeckWear booleans to the
  // wearEdge/wearCervical type enums. Edge boolean -> attrition (dominant bruxism
  // edge wear); cervical boolean -> abrasion (generic cervical wear);
  // false/absent -> none. A modern payload's own valid value wins.
  const migratedWearEdge = raw.bruxismWear ? "attrition" : "none";
  s.wearEdge = validateEnum(raw.wearEdge, VALID_WEAR_EDGE, migratedWearEdge);
  const migratedWearCervical = raw.bruxismNeckWear ? "abrasion" : "none";
  s.wearCervical = validateEnum(raw.wearCervical, VALID_WEAR_CERVICAL, migratedWearCervical);
  s.discoloration = validateEnum(raw.discoloration, VALID_DISCOLORATION, "none");
  // Orthodontic axes (no legacy fields to migrate).
  s.orthoAppliance = validateEnum(raw.orthoAppliance, VALID_ORTHO_APPLIANCE, "none");
  s.orthoDrift = validateEnum(raw.orthoDrift, VALID_ORTHO_DRIFT, "none");
  s.orthoVertical = validateEnum(raw.orthoVertical, VALID_ORTHO_VERTICAL, "none");
  s.orthoRotation = raw.orthoRotation === true;
  s.brokenMesial = !!raw.brokenMesial;
  s.brokenIncisal = !!raw.brokenIncisal;
  s.brokenDistal = !!raw.brokenDistal;
  s.extractionWound = !!raw.extractionWound;
  s.extractionPlan = !!raw.extractionPlan;
  s.parapulpalPin = !!raw.parapulpalPin;
  s.crownReplace = !!raw.crownReplace;
  s.crownNeeded = !!raw.crownNeeded;
  s.missingClosed = !!raw.missingClosed;
  s.bridgePillar = !!raw.bridgePillar;
  s.prosthesis = validateEnum(raw.prosthesis, VALID_PROSTHESIS, "none");
  s.mobility = validateEnum(raw.mobility, VALID_MOBILITY, s.mobility);
  s.toothSubstrate = validateEnum(raw.toothSubstrate, VALID_TOOTH_SUBSTRATE, s.toothSubstrate);
  s.restorationType = validateEnum(raw.restorationType, VALID_RESTORATION_TYPE, s.restorationType);
  s.restorationMaterial = validateEnum(raw.restorationMaterial, VALID_RESTORATION_MATERIAL, s.restorationMaterial);
  // A radix substrate (broken root remnant) can't carry a fixed restoration —
  // restorationRowHidden() hides the restoration control for it, and
  // syncControlsFromState's reset block clears a LIVE crown/bridge when the
  // substrate select changes to radix. Mirror that guard here so a
  // crafted/imported/directly-hydrated radix+crown payload self-heals on hydrate,
  // the same way the crown+prosthesis coherence guard below does — a stale crown
  // must never render over a tooth-radix layer nor appear alongside "Radix" in
  // the summary.
  if(s.toothSubstrate === "radix" && s.restorationType !== "none"){
    s.restorationType = "none";
    s.restorationMaterial = "none";
  }
  // The two fields above are validated independently against their own enums, so
  // a hand-edited/imported payload can still pair a
  // legal type with a material that type never supports (e.g. inlay+metal — the
  // matrix only allows inlay in emax/gold/gradia/zircon/temporary). Guard the
  // (type, material) PAIR here so an invalid combo never reaches state/render —
  // composeRestorationLayers() already no-ops on one, but a "sane-looking but
  // impossible" state is still worth correcting rather than leaving in place.
  // isValidRestoration() also takes a `view` (onlay is occlusal-only), but view
  // is a render/UI concern, not a data-validity one: a stored/imported state has
  // no notion of which template will eventually draw it, so validate here with
  // "occlusal" (the permissive superset of front) so a valid onlay+material pair
  // is never rejected just because we don't yet know the view.
  if(!isValidRestoration(s.restorationType as RestorationType, s.restorationMaterial as RestorationMaterial, "occlusal")){
    const spec = RESTORATION_MATRIX[s.restorationType as Exclude<RestorationType, "none">];
    if(spec && spec.materials.length > 0){
      // Type is legitimate, material is not: keep the type, fall back to its
      // first valid material (deterministic — RESTORATION_MATRIX order).
      s.restorationMaterial = spec.materials[0];
    }else{
      // No type (or a type with no valid materials at all, which today's
      // matrix never produces) — drop both to "none" rather than guess.
      s.restorationType = "none";
      s.restorationMaterial = "none";
    }
  }
  // Cross-field coherence — a tooth has EITHER a fixed restoration OR a
  // prosthesis, never both. A crafted/imported payload can pair both; keep the
  // restoration and clear the prosthesis (restoration wins, matching render
  // precedence). Never throws.
  if((s.restorationType === "crown" || s.restorationType === "bridge") && s.prosthesis !== "none"){
    s.prosthesis = "none";
  }
  s.crownLeakage = !!raw.crownLeakage;
  // Restore the per-site perio sub-record. Absent/legacy payloads have no `perio`
  // key at all -> stays the empty default
  // (no throw). Every raw value is independently validated: `pd` is charted
  // only through clampPerio's own rules (out-of-range/non-integer/unknown
  // site dropped, never orphaning a bad entry); `gm`/`bop`/`sup` are ONLY
  // ever kept for a site that resolved a valid `pd` above — a crafted/foreign
  // payload can never sneak in an orphaned gm/bop/sup on an un-charted site.
  const rawPerio = raw.perio;
  if(rawPerio && typeof rawPerio === "object"){
    if(rawPerio.pd && typeof rawPerio.pd === "object"){
      for(const [site, val] of Object.entries(rawPerio.pd)){
        if(!(PERIO_SITES as readonly string[]).includes(site)) continue;
        const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
        const clamped = clampPerio("pd", num);
        if(clamped !== null) s.perio.pd.set(site, clamped);
      }
    }
    if(rawPerio.gm && typeof rawPerio.gm === "object"){
      for(const [site, val] of Object.entries(rawPerio.gm)){
        if(!s.perio.pd.has(site)) continue; // no orphan gm without a charted pd
        const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
        const clamped = clampPerio("gm", num);
        if(clamped !== null) s.perio.gm.set(site, clamped);
      }
    }
    if(Array.isArray(rawPerio.bop)){
      for(const site of rawPerio.bop){
        if(typeof site === "string" && s.perio.pd.has(site)) s.perio.bop.add(site);
      }
    }
    if(Array.isArray(rawPerio.sup)){
      for(const site of rawPerio.sup){
        if(typeof site === "string" && s.perio.pd.has(site)) s.perio.sup.add(site);
      }
    }
  }
  // Restore the per-entrance furcation grade map. Absent/legacy payloads have no
  // `furcation` key -> stays the empty default (no throw). Validated against the
  // tooth-independent
  // VALID_FURCATION_ENTRANCE/VALID_FURCATION_GRADE sets (see their doc
  // comment above) — hydrateState has no toothNo to call
  // furcationEntrances(toothNo) itself; a crafted/foreign entrance for a
  // tooth position that doesn't actually offer it is harmless dead data,
  // exactly like an out-of-position radiographicDepth/fillingDefect surface.
  const rawFurcation = raw.furcation;
  if(rawFurcation && typeof rawFurcation === "object"){
    for(const [entrance, val] of Object.entries(rawFurcation)){
      if(!VALID_FURCATION_ENTRANCE.has(entrance)) continue;
      const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
      if(Number.isInteger(num) && VALID_FURCATION_GRADE.has(num)) s.furcation.set(entrance, num);
    }
  }
  // Restore the O'Leary plaque-surface presence set. Absent/legacy payloads have
  // no `plaque` key -> stays the empty default
  // (no throw). Validated against VALID_PLAQUE_SURFACE — an unrecognized
  // entry (foreign/crafted string) is silently dropped, never throws.
  const rawPlaque = raw.plaque;
  if(Array.isArray(rawPlaque)){
    for(const surface of rawPlaque){
      if(typeof surface === "string" && VALID_PLAQUE_SURFACE.has(surface)) s.plaque.add(surface);
    }
  }
  // Restore the graded PI/GI surface maps. Absent/legacy payloads have no
  // `pi`/`gi` key -> stays the empty default (no throw). Validated against
  // VALID_PLAQUE_SURFACE (same fixed 4-surface set
  // `plaque` uses) + grade in {1,2,3} — an unrecognized surface or an
  // out-of-range/non-integer grade (including a stored 0, which should never
  // happen but is tolerated as "drop it") is silently dropped, never throws.
  if(raw.pi && typeof raw.pi === "object"){
    for(const [surface, g] of Object.entries(raw.pi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.pi.set(surface, g);
    }
  }
  if(raw.gi && typeof raw.gi === "object"){
    for(const [surface, g] of Object.entries(raw.gi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.gi.set(surface, g);
    }
  }
  // Restore the peri-implant mPI/mBI graded surface maps, same tolerant parsing
  // as pi/gi above. Hydrate is a non-interactive
  // path (not gated) — the implant-only restriction is enforced only by the
  // SETTER, not by hydrate/import, matching every other axis's hydrate
  // tolerance policy in this file.
  if(raw.mpi && typeof raw.mpi === "object"){
    for(const [surface, g] of Object.entries(raw.mpi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.mpi.set(surface, g);
    }
  }
  if(raw.mbi && typeof raw.mbi === "object"){
    for(const [surface, g] of Object.entries(raw.mbi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.mbi.set(surface, g);
    }
  }
  // Restore keratinized gingiva width. Absent/legacy
  // payloads have no `kg` key -> stays the default null (no throw).
  // `clampKg` tolerates any input (non-numeric/out-of-range) and returns
  // null for it, same tolerant-hydrate policy as every other axis above.
  s.kg = clampKg(raw.kg);
  // Restore note
  if(typeof raw.note === "string") s.note = raw.note;
  // Restore plugin custom states (only for registered plugin IDs)
  if(raw.customStates && typeof raw.customStates === "object"){
    const validIds = new Set(pluginIdsProvider());
    for(const [key, val] of Object.entries(raw.customStates)){
      if(validIds.has(key)){
        // Deep-copy object values: charts are cloned via serializeState ->
        // hydrateState (cloneChart), and serializeState passes customStates by
        // reference, so without a copy an object-valued plugin state would be
        // SHARED between the status and plan charts, breaking their isolation.
        s.customStates[key] = (val !== null && typeof val === "object")
          ? (typeof structuredClone === "function" ? structuredClone(val) : JSON.parse(JSON.stringify(val)))
          : val;
      }
    }
  }
  return s;
}

export function clampKg(mm: unknown): number | null {
  if(mm === null || mm === undefined) return null;
  const n = Number(mm);
  if(!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(15, Math.round(n)));
}

// ---- Pure tooth-state predicates (shared by the engine and the perio API) ----
export function isUnderGum(sel: Any){
  return sel === "tooth-under-gum";
}

export function isExtraction(sel: Any){
  return sel === "no-tooth-after-extraction";
}

// #perioRow gate. Periodontal probing applies only to a tooth actually present
// in the mouth chairside — missing/implant/under-gum/
// extraction-socket teeth have no probing site to chart at all, so (unlike
// mobilityRowHidden, which stays visible-but-disabled for some of those) this
// hides the whole row outright. `!isToothPresent(sel)` covers BOTH "none"
// (missing) and "implant" in one check; isUnderGum/isExtraction carve out the
// remaining two non-present-but-not-"none" selections.
export function perioRowHidden(s: Any): boolean {
  const sel = s?.toothSelection;
  return !isToothPresent(sel) || isUnderGum(sel) || isExtraction(sel);
}

// Canonical 6-site periodontal probing order — buccal row (mesio-buccal,
// buccal, disto-buccal), then lingual/palatal row (mesio-lingual,
// lingual/palatal, disto-lingual). Shared verbatim by the data core, the UI
// charting grid, and FHIR mapping, which key their per-site controls to this
// exact array order.
export type PerioSite = typeof PERIO_SITES[number];
