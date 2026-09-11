// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { ValueSet } from "fhir/r4";
import { LOCAL_SYSTEM, LOCAL_VALUE_MAPS } from "./codesystems";
import { FHIR_BASE } from "./primitives";
import { AXES } from "../registry/axes";
import { buildOdontogramCodeSystem, EXTRA_LOCAL_CODES } from "./codeSystemResource";

/**
 * Interop arc part C — ValueSets over the engine CodeSystem, and the manifest
 * that makes the repository's `fhir/` folder a loadable FHIR NPM package
 * (`validator -ig ./fhir`, or `npm pack` of that folder).
 *
 * Why explicit (extensional) ValueSets per axis group: the value codes are BARE
 * enum values (`none`, `mesial`, `temporary`…) shared across several groups, so
 * a group cannot be expressed as a filter over the CodeSystem — each group
 * ValueSet lists its own codes, with the display that group uses (which may be
 * a designation on the merged concept). A finding-type ValueSet enumerates the
 * `Observation.code` concepts (registry axes + the hand-emitted finding types),
 * and one intensional ValueSet covers the whole CodeSystem for generic bindings.
 * Everything is deterministic and versioned with the library, like the CodeSystem.
 */

export const PACKAGE_NAME = "react-advanced-odontogram.fhir";
const REPO = "https://github.com/ZoliQua/React-Odontogram-Modul";

const vsUrl = (id: string) => `${FHIR_BASE}/ValueSet/${id}`;
const pascal = (s: string) => s.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());

function base(id: string, title: string, description: string, version: string): ValueSet {
  return {
    resourceType: "ValueSet",
    id,
    url: vsUrl(id),
    version,
    name: `Odontogram${pascal(id.replace(/^odontogram-/, ""))}`,
    title,
    status: "active",
    experimental: false,
    publisher: "Zoltán Dul",
    description,
  };
}

/** One ValueSet per `LOCAL_VALUE_MAPS` group (explicit concept lists). */
export function buildGroupValueSets(version: string = __APP_VERSION__): ValueSet[] {
  return Object.entries(LOCAL_VALUE_MAPS).map(([group, entries]) => {
    const vs = base(`odontogram-${group}`, `Odontogram — ${group} values`,
      `The allowed values of the engine's "${group}" axis (engine-local codes; the display is the one this axis uses).`, version);
    vs.compose = { include: [{ system: LOCAL_SYSTEM, concept: Object.values(entries).map((e) => ({ code: e.code, display: e.display })) }] };
    return vs;
  });
}

/** Finding-type codes: every `Observation.code` the export emits under the local system. */
export function buildFindingTypesValueSet(version: string = __APP_VERSION__): ValueSet {
  const vs = base("odontogram-finding-types", "Odontogram — finding types",
    "The Observation.code concepts of the engine's FHIR export: one per clinical-axis registry entry plus the hand-emitted whole-mouth and per-surface finding types.", version);
  const concept = [
    ...AXES.map((a) => ({ code: a.finding.local, display: a.finding.display })),
    ...EXTRA_LOCAL_CODES.filter((x) => /Finding type|Whole-mouth finding/.test(x.definition)).map((x) => ({ code: x.code, display: x.display })),
  ];
  vs.compose = { include: [{ system: LOCAL_SYSTEM, concept }] };
  return vs;
}

/** Every concept of the CodeSystem (intensional — no enumeration). */
export function buildAllCodesValueSet(version: string = __APP_VERSION__): ValueSet {
  const vs = base("odontogram-all", "Odontogram — all engine-local codes",
    "Every concept of the React Advanced Odontogram CodeSystem (intensional include of the whole code system).", version);
  vs.compose = { include: [{ system: LOCAL_SYSTEM }] };
  return vs;
}

export function buildOdontogramValueSets(version: string = __APP_VERSION__): ValueSet[] {
  return [...buildGroupValueSets(version), buildFindingTypesValueSet(version), buildAllCodesValueSet(version)];
}

/** `filename -> JSON` for every file of the `fhir/` package, CodeSystem included. */
export function buildFhirPackageFiles(version: string = __APP_VERSION__): Record<string, unknown> {
  const cs = buildOdontogramCodeSystem(version);
  const valueSets = buildOdontogramValueSets(version);
  const files: Record<string, unknown> = { "CodeSystem-odontogram.json": cs };
  for (const vs of valueSets) files[`ValueSet-${vs.id}.json`] = vs;
  const index = {
    "index-version": 1,
    files: [
      { filename: "CodeSystem-odontogram.json", resourceType: "CodeSystem", id: cs.id, url: cs.url, version },
      ...valueSets.map((vs) => ({ filename: `ValueSet-${vs.id}.json`, resourceType: "ValueSet", id: vs.id, url: vs.url, version })),
    ],
  };
  files[".index.json"] = index;
  files["package.json"] = {
    name: PACKAGE_NAME,
    version,
    type: "Conformance",
    fhirVersions: ["4.0.1"],
    canonical: FHIR_BASE,
    title: "React Advanced Odontogram — FHIR terminology",
    description: "Engine-local CodeSystem and ValueSets of the React Advanced Odontogram FHIR export (dental charting: tooth status, restorations, caries, periodontal indices, diagnoses).",
    author: "Zoltán Dul",
    license: "MIT",
    url: REPO,
    dependencies: { "hl7.fhir.r4.core": "4.0.1" },
  };
  return files;
}
