// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { CodeSystem, CodeSystemConcept } from "fhir/r4";
import type { Bundle, FhirExportOptions } from "./types";
import { LOCAL_SYSTEM, LOCAL_VALUE_MAPS } from "./codesystems";
import { AXES } from "../registry/axes";

/**
 * The engine's own FHIR `CodeSystem` (issue #23 follow-up). Every code the export
 * can emit under {@link LOCAL_SYSTEM} is enumerated here so a validator can
 * resolve them: without it the HL7 validator can only report
 * `validate-code: timeout` for an unknown, unpublished system. The resource is
 * embedded in every exported Bundle (see {@link appendCodeSystem}; opt out with
 * `includeCodeSystem: false`) and published in the repository as
 * `fhir/CodeSystem-odontogram.json` (`npm run fhir:codesystem` regenerates it;
 * a test keeps the committed file in step with this generator).
 *
 * Three code families, merged into ONE concept list keyed by code:
 *  1. finding-type codes (`Observation.code`) — taken programmatically from the
 *     clinical-axis registry (`AXES[].finding.local`), so a new axis is covered
 *     automatically;
 *  2. value codes (`valueCodeableConcept` / component codes) — every entry of
 *     `LOCAL_VALUE_MAPS`. Bare value codes repeat across groups (`none`,
 *     `mesial`, `temporary`…) while a CodeSystem concept code must be unique, so
 *     duplicates are merged: the first display becomes `concept.display`, every
 *     other distinct display becomes a `designation` — a validator accepts the
 *     display of ANY designation, so every emitted display stays valid;
 *  3. the remaining hand-emitted codes (whole-mouth `edentulous`, the per-surface
 *     scalar findings, CARS scores, the periodontal panel/index/qualifier codes,
 *     smoking values, the K05 stage/grade/extent summaries, laterality) — an
 *     explicit list, guarded by `fhir-codesystem.test.ts`, which drives a
 *     maximal export through the real setters and asserts every emitted
 *     LOCAL_SYSTEM code is present here.
 *
 * Deliberately NOT enumerated: `custom-state:<pluginId>` — plugin-defined codes
 * are open-ended by design (documented in `description`).
 *
 * Displays are copied VERBATIM from the emitters (language-neutral English), so
 * `Coding.display` in the export always matches the CodeSystem. The concept list
 * is sorted by code, so the output is deterministic and golden-testable.
 */

type Extra = { code: string; display: string; definition: string };

// Mirrors of small value lists that live module-private next to their emitters
// (toFhirPerio.ts / toFhirCase.ts). Kept in step by the maximal-export test.
const PERIO_SITE_DISPLAY: Record<string, string> = {
  MB: "Mesio-buccal", B: "Buccal", DB: "Disto-buccal", ML: "Mesio-lingual", L: "Lingual/palatal", DL: "Disto-lingual",
};
const FURCATION_ENTRANCE_DISPLAY: Record<string, string> = { mesial: "Mesial", distal: "Distal", buccal: "Buccal", lingual: "Lingual" };
const OLEARY_SURFACE_DISPLAY: Record<string, string> = { mesial: "Mesial", distal: "Distal", buccal: "Buccal", lingual: "Lingual" };
const STAGE_DISPLAY: Record<string, string> = { I: "Stage I", II: "Stage II", III: "Stage III", IV: "Stage IV" };
const GRADE_DISPLAY: Record<string, string> = { A: "Grade A", B: "Grade B", C: "Grade C" };
const EXTENT_DISPLAY: Record<string, string> = { localized: "Localized", generalized: "Generalized", "molar-incisor": "Molar-incisor pattern" };
const LATERALITY_DISPLAY: Record<string, string> = { unspecified: "Unspecified laterality", left: "Left", right: "Right", bilateral: "Bilateral" };

const QUALIFIER = "Qualifier / component code";
const FINDING = "Finding type (Observation.code)";

/** Hand-emitted LOCAL_SYSTEM codes outside the axis registry and the value maps. */
export const EXTRA_LOCAL_CODES: readonly Extra[] = [
  { code: "edentulous", display: "Edentulous (whole mouth)", definition: "Whole-mouth finding (Observation.code)" },
  { code: "radiographic-caries-depth", display: "Radiographic caries depth", definition: FINDING },
  { code: "filling-defect", display: "Filling defect", definition: FINDING },
  { code: "tooth-note", display: "Tooth note", definition: FINDING },
  ...[0, 1, 2, 3, 4, 5, 6].map((n) => ({ code: `cars-${n}`, display: `CARS score ${n}`, definition: "Recurrent-caries (CARS) score on a filled surface — caries component scoring coding" })),
  { code: "perio-bop", display: "Bleeding on probing", definition: "Periodontal-panel component code" },
  { code: "plaque-surface", display: "Dental plaque present", definition: "Periodontal-panel component code (O'Leary surface)" },
  { code: "plaque-index-silness-loe", display: "Plaque index (Silness-Löe)", definition: "Periodontal-panel component code" },
  { code: "gingival-index-loe-silness", display: "Gingival index (Löe-Silness)", definition: "Periodontal-panel component code" },
  { code: "mod-plaque-index-mombelli", display: "Modified plaque index (Mombelli)", definition: "Periodontal-panel component code (implants)" },
  { code: "mod-bleeding-index-mombelli", display: "Modified sulcus bleeding index (Mombelli)", definition: "Periodontal-panel component code (implants)" },
  { code: "keratinized-gingiva-width", display: "Keratinized gingiva width", definition: "Periodontal-panel component code" },
  { code: "smoking-never", display: "Never smoker", definition: "Tobacco smoking status value (evidence Observation)" },
  { code: "smoking-former", display: "Former smoker", definition: "Tobacco smoking status value (evidence Observation)" },
  { code: "smoking-current", display: "Current smoker", definition: "Tobacco smoking status value (evidence Observation)" },
  { code: "cigarettes-per-day", display: "Cigarettes per day", definition: "Tobacco smoking status component code (evidence Observation)" },
  { code: "diabetes-status", display: "Diabetes mellitus status", definition: "Diabetes status evidence Observation code" },
  { code: "diabetes-none", display: "No diabetes mellitus", definition: "Diabetes mellitus status value (evidence Observation)" },
  { code: "diabetes-present", display: "Diabetes mellitus present", definition: "Diabetes mellitus status value (evidence Observation)" },
  ...["health", "gingivitis", "periodontitis"].map((d) => ({ code: `periodontal-diagnosis:${d}`, display: d, definition: "2017-classification periodontal diagnosis (Condition.code local coding)" })),
  { code: "periodontal-stage", display: "Periodontal stage", definition: "Condition.stage.type" },
  { code: "periodontal-grade", display: "Periodontal grade", definition: "Condition.stage.type" },
  { code: "periodontal-extent", display: "Periodontal extent", definition: "Condition.stage.type" },
  ...Object.entries(STAGE_DISPLAY).map(([k, d]) => ({ code: `stage-${k}`, display: d, definition: "Condition.stage.summary (2017 periodontitis stage)" })),
  ...Object.entries(GRADE_DISPLAY).map(([k, d]) => ({ code: `grade-${k}`, display: d, definition: "Condition.stage.summary (2017 periodontitis grade)" })),
  ...Object.entries(EXTENT_DISPLAY).map(([k, d]) => ({ code: `extent-${k}`, display: d, definition: "Condition.stage.summary (2017 periodontitis extent)" })),
  ...Object.entries(PERIO_SITE_DISPLAY).map(([k, d]) => ({ code: `perio-site:${k}`, display: d, definition: `${QUALIFIER} — probing site (component bodySite qualifier)` })),
  ...Object.entries(FURCATION_ENTRANCE_DISPLAY).map(([k, d]) => ({ code: `furcation-entrance:${k}`, display: d, definition: `${QUALIFIER} — furcation entrance (component bodySite qualifier)` })),
  // The 4 O'Leary surfaces — bodySite qualifier shared by the plaque, PI, GI, mPI and mBI components.
  ...Object.entries(OLEARY_SURFACE_DISPLAY).map(([k, d]) => ({ code: `plaque-surface:${k}`, display: d, definition: `${QUALIFIER} — O'Leary surface of a plaque / PI / GI / mPI / mBI component (bodySite qualifier)` })),
  { code: "site:buccal", display: "Buccal", definition: `${QUALIFIER} — keratinized-gingiva width is a single buccal measurement (component bodySite qualifier)` },
  ...Object.entries(LATERALITY_DISPLAY).map(([k, d]) => ({ code: `laterality:${k}`, display: d, definition: `${QUALIFIER} — case-condition laterality (Condition.bodySite)` })),
];

interface Acc { display: string; designations: string[]; definitions: string[] }

function add(acc: Map<string, Acc>, code: string, display: string, definition: string): void {
  const cur = acc.get(code);
  if (!cur) { acc.set(code, { display, designations: [], definitions: [definition] }); return; }
  if (display !== cur.display && !cur.designations.includes(display)) cur.designations.push(display);
  if (!cur.definitions.includes(definition)) cur.definitions.push(definition);
}

/** Every LOCAL_SYSTEM concept the export can emit, sorted by code. */
export function buildOdontogramConcepts(): CodeSystemConcept[] {
  const acc = new Map<string, Acc>();
  for (const axis of AXES) add(acc, axis.finding.local, axis.finding.display, `${FINDING} — axis "${axis.id}"`);
  for (const [group, entries] of Object.entries(LOCAL_VALUE_MAPS)) {
    for (const entry of Object.values(entries)) add(acc, entry.code, entry.display, `Value of axis group "${group}"`);
  }
  for (const x of EXTRA_LOCAL_CODES) add(acc, x.code, x.display, x.definition);
  return [...acc.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, v]) => {
      const c: CodeSystemConcept = { code, display: v.display, definition: v.definitions.join("; ") };
      if (v.designations.length) c.designation = v.designations.map((value) => ({ value }));
      return c;
    });
}

/**
 * The engine's CodeSystem resource. `version` defaults to the library version
 * (`__APP_VERSION__`, injected from package.json by Vite at build/test time), so
 * the published `fhir/CodeSystem-odontogram.json` is regenerated per release.
 */
export function buildOdontogramCodeSystem(version: string = __APP_VERSION__): CodeSystem {
  const concept = buildOdontogramConcepts();
  return {
    resourceType: "CodeSystem",
    id: "odontogram",
    url: LOCAL_SYSTEM,
    version,
    name: "ReactAdvancedOdontogramLocalCodes",
    title: "React Advanced Odontogram — engine-local codes",
    status: "active",
    experimental: false,
    publisher: "Zoltán Dul",
    description:
      "Engine-local codes emitted by the React Advanced Odontogram FHIR export: finding types (Observation.code), enum values (valueCodeableConcept / component codes), periodontal-panel component and qualifier codes, 2017-classification stage summaries and case-condition laterality. Displays are language-neutral English and match the export verbatim; a repeated value code carries its alternative displays as designations. Plugin-defined `custom-state:<pluginId>` codes are open-ended and intentionally not enumerated.",
    caseSensitive: true,
    content: "complete",
    count: concept.length,
    concept,
  };
}

/**
 * Embed the CodeSystem in the Bundle so validators resolve the local codes
 * from the Bundle itself. Placed right after the placeholder Patient (or first,
 * when a host supplies its own subject). Its `fullUrl` is the canonical URL — the
 * identity of a CodeSystem — so `assignEntryIdentities` leaves it untouched.
 * Skipped when `options.includeCodeSystem === false`.
 */
export function appendCodeSystem(bundle: Bundle, options: FhirExportOptions = {}): void {
  if (options.includeCodeSystem === false) return;
  if (!bundle.entry) bundle.entry = [];
  const at = bundle.entry[0]?.resource?.resourceType === "Patient" ? 1 : 0;
  bundle.entry.splice(at, 0, { fullUrl: LOCAL_SYSTEM, resource: buildOdontogramCodeSystem() });
}
