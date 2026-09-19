// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { OdontogramExportPayload } from "./types";
import { parseFhirBundleFromRegistry } from "../registry/fromFhir";

/**
 * Invert buildFhirBundle: parse a FHIR R4 collection Bundle back into the
 * {version, globals, teeth, case} payload importStatus expects. Tooth-status
 * Observations are read by their engine-local codes (no standard codes exist
 * for them); the periodontal panels by LOINC (DX-9); Conditions by our ids or,
 * failing that, their WHO ICD-10, ICD-10-CM or SNOMED CT codes (DX-7/DX-9) —
 * so a self-produced Bundle round-trips fully and a foreign, standards-coded
 * Bundle imports what it can. Tolerant of bad input (never throws).
 */
export function parseFhirBundle(bundle: unknown): OdontogramExportPayload {
  return parseFhirBundleFromRegistry(bundle);
}
