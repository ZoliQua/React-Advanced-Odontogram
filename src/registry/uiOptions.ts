// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { AXES } from "./axes";
import type { UiOptCtx } from "./types";

/** Feature-flag state consumed by the registry (extensible key→boolean map). */
export type RegistryFlags = Record<string, boolean>;

/**
 * Resolves `ClinicalAxis.flag`. An axis with no `flag` is always active; an axis
 * carrying a `flag` is active only when that flag is set in `flags`. Currently
 * gates `pulpLatin` (`flag: "latinPulpDetail"`), satisfied iff the pulp-detail
 * setting is "latin". This governs UI authoring only — a stored value still
 * serializes / round-trips regardless.
 */
export function isAxisFlagSatisfied(axisId: string, flags: RegistryFlags = {}): boolean {
  const ax = AXES.find(a => a.id === axisId);
  if(!ax || !ax.flag) return true;
  return !!flags[ax.flag];
}

/** Ordered {value, labelKey} option list for an axis (curated UI metadata).
 *  Returns `[]` for a flag-gated axis whose flag is unsatisfied. */
export function optionsFor(axisId: string, ctx: UiOptCtx = {}, flags: RegistryFlags = {}): { value: string; labelKey: string }[] {
  if(!isAxisFlagSatisfied(axisId, flags)) return [];
  const ax = AXES.find(a => a.id === axisId);
  return (ax?.uiOptions ?? []).filter(o => (o.when ? o.when(ctx) : true)).map(o => ({ value: o.value, labelKey: o.labelKey }));
}
