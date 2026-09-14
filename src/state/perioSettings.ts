// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Settings -> Periodontal: the app-level display preferences of the perio chart
 * — which index rows are visible, and whether index names are shown translated
 * or in their canonical form. Session-only, never part of the export payload.
 *
 * They live in their own module so `perioIndexNames.ts` and `perioExport.ts` can
 * read them without importing odontogram.ts back (that was a real import cycle).
 */

import { notifyStateChange } from "./notify";

// ---- Settings -> Periodontal tab app-level preferences ----
// Two session-level UI preferences (no payload/FHIR change), mirroring the
// `perioViewMode` precedent immediately above: a module `let` + getter +
// setter that calls `notifyStateChange()`. Neither is part of the tooth
// state, so neither is ever serialized (`collectExportPayload`/
// `getPlanChart`/hydrate never reference these). `perioRowVisibility` drives
// which perio-chart index rows the Dental Chart renders; `perioIndexNameMode`
// drives whether index row labels show the localized name or a static
// English/Latin canonical name. Both are wired into the Settings -> Periodontal
// tab via `SettingsState` in `SettingsModal.tsx`.

/** The 16 toggleable periodontal index rows the Dental Chart can show/hide. */
export type PerioRowId =
  | "plaque"
  | "bop"
  | "cal"
  | "gm"
  | "pd"
  | "furcation"
  | "mobility"
  | "cej"
  | "rootConcavity"
  | "pi"
  | "gi"
  | "mpi"
  | "mbi"
  | "kg"
  | "gt"
  | "miller";

const PERIO_ROW_IDS: readonly PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

function defaultPerioRowVisibility(): Record<PerioRowId, boolean> {
  const record = {} as Record<PerioRowId, boolean>;
  for (const id of PERIO_ROW_IDS) record[id] = true;
  return record;
}

let perioRowVisibility: Record<PerioRowId, boolean> = defaultPerioRowVisibility();

/** Current per-index perio-chart row visibility. Defaults to all-visible. */
export function getPerioRowVisibility(): Record<PerioRowId, boolean> {
  return perioRowVisibility;
}

/** Show/hide one perio-chart index row. No-op (does not notify) if unchanged. */
export function setPerioRowVisibility(id: PerioRowId, visible: boolean): void {
  if(perioRowVisibility[id] === visible) return;
  perioRowVisibility = { ...perioRowVisibility, [id]: visible };
  notifyStateChange();
}

/** How perio-chart index row labels are rendered. */
export type PerioIndexNameMode = "translated" | "canonical";
let perioIndexNameMode: PerioIndexNameMode = "translated";

/** Current perio index-name display mode. Defaults to `"translated"`. */
export function getPerioIndexNameMode(): PerioIndexNameMode {
  return perioIndexNameMode;
}

/** Switch the perio index-name display mode. No-op (does not notify) if unchanged. */
export function setPerioIndexNameMode(mode: PerioIndexNameMode): void {
  if(mode === perioIndexNameMode) return;
  perioIndexNameMode = mode;
  notifyStateChange();
}

