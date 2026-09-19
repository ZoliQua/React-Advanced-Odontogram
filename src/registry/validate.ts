// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { AXES } from "./axes";
import { LOCAL_VALUE_MAPS } from "../fhir/codesystems";

/** The allowed enum/set values for an axis, sourced from the registry catalog. */
export function validValues(axisId: string): Set<string> {
  const ax = AXES.find(a => a.id === axisId);
  return new Set((ax?.values ?? []).map(v => v.id));
}

/** The allowed tooth-surface ids (a value group used by caries/filling, not an axis). */
export function validSurfaces(): Set<string> {
  return new Set(Object.keys(LOCAL_VALUE_MAPS.fillingSurfaces));
}
