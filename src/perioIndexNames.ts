// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { t } from "./i18n/useI18n";
import { getPerioIndexNameMode, type PerioRowId } from "./state/perioSettings";

/**
 * Translated-vs-canonical periodontal index NAMES.
 *
 * `getPerioIndexNameMode()` (Settings -> Periodontal tab) toggles how every
 * perio-chart index row label is rendered:
 *   - "translated" (default): the localized `t(...)` string for that row.
 *   - "canonical": a FIXED English/Latin standard scientific name, regardless
 *     of the active UI language. That is the entire point of canonical mode, so
 *     `CANONICAL_INDEX_NAMES` below is intentionally NOT routed through `t()` —
 *     it is the same text in every language.
 *
 * PD/GM/CAL/BOP are already rendered as a fixed, non-localized abbreviation in
 * every language (see `"perio.pd": "PD"` etc. in translations.ts) — there is
 * nothing left to canonicalize for those four, so their canonical value equals
 * the translated one by design (both are just "PD" etc.).
 *
 * IMPORTANT: tooltips (`perio.info.*`, the "i" info-button popovers) are
 * COMPLETELY UNRELATED to this mode. Every call site keeps passing a plain
 * `t("perio.info.<field>")` `infoKey` to `mkRowLabelCell` — never
 * `indexName()` — so tooltip text stays localized in BOTH modes.
 */
export const CANONICAL_INDEX_NAMES: Record<PerioRowId, string> = {
  pd: "PD",
  gm: "GM",
  cal: "CAL",
  bop: "BOP",
  plaque: "Plaque (O'Leary)",
  furcation: "Furcation",
  mobility: "Mobility",
  cej: "CEJ Visibility",
  rootConcavity: "Root Concavity",
  pi: "Plaque Index (PI)",
  gi: "Gingival Index (GI)",
  mpi: "Modified Plaque Index (mPI)",
  mbi: "Modified Sulcus Bleeding Index (mBI)",
  kg: "Keratinized Gingiva (KG)",
  gt: "Gingival Thickness (GT)",
  miller: "Miller Class",
};

/** The translated-mode `t(...)` key for each row — NOT a uniform
 *  `perio.<id>.row` template, since several rows use a differently-shaped
 *  key (plaque/furcation use `<x>.label`, pd/gm/cal/bop use the bare
 *  `perio.<x>` abbreviation key, the rest use `perio.<x>.row`). */
const TRANSLATED_INDEX_KEYS: Record<PerioRowId, string> = {
  plaque: "plaque.label",
  bop: "perio.bop",
  cal: "perio.cal",
  gm: "perio.gm",
  pd: "perio.pd",
  furcation: "furcation.label",
  mobility: "perio.mobility",
  cej: "perio.cej.label",
  rootConcavity: "perio.rootConcavity.label",
  pi: "perio.pi.row",
  gi: "perio.gi.row",
  mpi: "perio.mpi.row",
  mbi: "perio.mbi.row",
  kg: "perio.kg.row",
  gt: "perio.gt.row",
  miller: "perio.miller.row",
};

/** The display name for a perio-chart index row, honoring the current
 *  `getPerioIndexNameMode()`. NEVER use this for tooltip/info-popover text —
 *  those must keep calling `t("perio.info.<field>")` directly regardless of
 *  this function's result (see the module doc comment above). */
export function indexName(rowKey: PerioRowId): string {
  return getPerioIndexNameMode() === "canonical"
    ? CANONICAL_INDEX_NAMES[rowKey]
    : t(TRANSLATED_INDEX_KEYS[rowKey]);
}
