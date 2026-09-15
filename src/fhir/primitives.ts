// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, CodeableConcept, Coding, Observation, ToothRecord } from "./types";
import {
  LOCAL_SYSTEM,
  FDI_SYSTEM,
  SNOMED_SYSTEM,
  SNOMED_CODES,
  LOCAL_VALUE_MAPS,
  type CodeEntry,
} from "./codesystems";

/** Base of the engine's own absolute FHIR resource URLs (sibling of LOCAL_SYSTEM's
 *  `.../fhir/CodeSystem/odontogram`). Every Bundle entry gets an absolute
 *  `fullUrl` under it: bdl-15 requires `fullUrl` on every entry of a
 *  `collection` Bundle, and the `urn:uuid:` scheme may only carry a real RFC 4122
 *  UUID (HL7 validator, issue #23) — so a readable, DETERMINISTIC https URL
 *  replaces the former `urn:uuid:<logical-id>` convention. Deterministic matters:
 *  the FHIR export is golden-tested, so no random UUIDs. */
export const FHIR_BASE = "https://github.com/ZoliQua/React-Odontogram-Modul/fhir";
/** Absolute, deterministic `fullUrl` for a resource: `${FHIR_BASE}/${type}/${id}`. */
export function fhirFullUrl(resourceType: string, id: string): string {
  return `${FHIR_BASE}/${resourceType}/${id}`;
}

export const PLACEHOLDER_PATIENT_ID = "odontogram-subject";
export const PLACEHOLDER_PATIENT_FULLURL = fhirFullUrl("Patient", PLACEHOLDER_PATIENT_ID);

/** Build a CodeableConcept: always a local coding, plus SNOMED when verified. */
export function concept(system: string, entry: CodeEntry, snomedKey?: string): CodeableConcept {
  const codings: Coding[] = [{ system, code: entry.code, display: entry.display }];
  const sct = entry.snomed ?? (snomedKey ? SNOMED_CODES[snomedKey] : undefined);
  if (sct) codings.push({ system: SNOMED_SYSTEM, code: sct, display: entry.display });
  return { coding: codings, text: entry.display };
}

/** Decode an enum value via a value-map group, tolerating unknown values. */
export function valueConcept(group: string, value: string): CodeableConcept {
  const entry = LOCAL_VALUE_MAPS[group]?.[value] ?? { code: value, display: value };
  return concept(LOCAL_SYSTEM, entry, `${group}:${value}`);
}

/** The Observation.code identifying a finding TYPE (engine-local). */
export function findingConcept(code: string, display: string): CodeableConcept {
  return concept(LOCAL_SYSTEM, { code, display }, `finding:${code}`);
}

/** FDI/ISO 3950 tooth bodySite. The internal key is already an FDI number. */
export function toothBodySite(fdi: string): CodeableConcept {
  return { coding: [{ system: FDI_SYSTEM, code: fdi }], text: `Tooth ${fdi}` };
}

export const EXAM_CATEGORY: CodeableConcept[] = [
  {
    coding: [
      { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "exam", display: "Exam" },
    ],
  },
];

export const baseObservation = (subjectRef: string, tooth: string, code: CodeableConcept): Observation => ({
  resourceType: "Observation",
  status: "final",
  category: EXAM_CATEGORY,
  code,
  subject: { reference: subjectRef },
  bodySite: toothBodySite(tooth),
});

export function localCode(cc: unknown): string | undefined {
  const coding = (cc as { coding?: Array<{ system?: string; code?: string }> } | undefined)?.coding;
  if (!Array.isArray(coding)) return undefined;
  const hit = coding.find((c) => c?.system === LOCAL_SYSTEM && typeof c.code === "string");
  return hit?.code;
}

/** A syntactically valid tooth code: exactly two digits. Tooth codes (FDI
 *  permanent 11-48, ISO 3950 deciduous, and the odd synthetic key) are always
 *  numeric, so this stays lenient on the numeric range while REJECTING the
 *  prototype-polluting keys an untrusted `bodySite` could carry — `"__proto__"`,
 *  `"constructor"`, `"prototype"` are non-numeric and would otherwise reach
 *  {@link ensureTooth} and pollute `Object.prototype`.
 *
 *  Lives here, next to {@link ensureTooth}, because EVERY importer that turns an
 *  untrusted code into a `teeth` key needs the same guard — the registry path,
 *  the periodontal panels and the diagnosis Conditions. */
export function isToothCode(id: string): boolean {
  return /^\d{2}$/.test(id);
}

export function ensureTooth(teeth: Record<string, ToothRecord>, id: string): ToothRecord {
  // Own-property check, NOT `!teeth[id]`: for a plain object `teeth["__proto__"]`
  // resolves to Object.prototype (truthy), so the naive guard would skip the
  // assignment and hand back Object.prototype, letting later writes leak onto it
  // (prototype pollution). hasOwnProperty guarantees we create/return a real own
  // slot. Callers additionally validate the id (see isToothCode in fromFhir).
  if (!Object.prototype.hasOwnProperty.call(teeth, id)) teeth[id] = {};
  return teeth[id];
}

/** FHIR `id` charset is `[A-Za-z0-9.-]`, max 64 chars. Base ids are capped at 60
 *  so an ordinal `-N` suffix can never push a truncated id into a collision. */
function sanitizeFhirId(raw: string, max = 60): string {
  const clean = raw.replace(/[^A-Za-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "");
  return (clean || "x").slice(0, max);
}

/**
 * Give EVERY Bundle entry a deterministic `id` + absolute `fullUrl` (issue #23,
 * HL7 validator: bdl-15 + "UUIDs must be valid"). Entries already identified at
 * their source (the Patient, the Conditions, the perio evidence Observations)
 * are left untouched. The rest — the registry- and perio-driven per-tooth
 * Observations, which used to ship with neither `id` nor `fullUrl` — derive an
 * id from their own content: resource type, the FDI tooth in `bodySite` (or
 * `case` for a whole-mouth finding such as `edentulous`) and the engine-local
 * finding code (falling back to the first coding, e.g. the LOINC perio-panel
 * code), plus an ordinal suffix when the same key repeats (per-surface findings).
 * Deterministic because the entry order is deterministic for a given payload —
 * which keeps the FHIR export golden-testable. Runs LAST in `buildFhirBundle`.
 */
export function assignEntryIdentities(bundle: Bundle): void {
  if (!Array.isArray(bundle.entry)) return;
  const seen = new Map<string, number>();
  for (const entry of bundle.entry) {
    const res = entry?.resource as (Record<string, unknown> & { resourceType?: string; id?: string }) | undefined;
    if (!res || typeof res.resourceType !== "string") continue;
    if (typeof entry.fullUrl === "string" && entry.fullUrl !== "") continue; // identified at source
    let id = typeof res.id === "string" && res.id !== "" ? res.id : undefined;
    if (!id) {
      const tooth = (res.bodySite as { coding?: Array<{ code?: string }> } | undefined)?.coding?.[0]?.code;
      const firstCode = (res.code as { coding?: Array<{ code?: string }> } | undefined)?.coding?.[0]?.code;
      const code = localCode(res.code) ?? firstCode ?? "finding";
      const base = sanitizeFhirId(`odontogram-${res.resourceType.toLowerCase()}-${tooth || "case"}-${code}`);
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      id = n === 1 ? base : `${base}-${n}`;
      res.id = id;
    }
    entry.fullUrl = fhirFullUrl(res.resourceType, id);
  }
}
