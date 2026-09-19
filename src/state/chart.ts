// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The dual-chart core: the two per-case tooth-state Maps (`status` / `plan`),
 * the active-chart alias, the current mode and the lazy plan clone — extracted
 * from odontogram.ts.
 *
 * `toothState` is exported as an ES module LIVE BINDING: importers always read
 * the currently active chart, so the ~140 read sites need no change. Only this
 * module rebinds it, and only through {@link setActiveChartMode} — never assign
 * to the imported name. The invariants that guarantees are pinned by
 * `chart-core-invariants.test.ts`.
 *
 * Deliberately NOT here: `setChartMode()`, which repaints every tooth and syncs
 * the controls, so it stays with the DOM code in odontogram.ts and calls the
 * setters below.
 */

import { serializeState, hydrateState } from "./payload";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors the engine-wide `Any` alias
type Any = any;

export const charts: Record<"status" | "plan", Map<Any, Any>> = {
  status: new Map(),
  plan: new Map(),
};

export let toothState = charts.status; // active-chart ALIAS — reassigned by setChartMode()
export type ChartMode = "status" | "plan";
export let chartMode: ChartMode = "status";

// Plan chart is lazily deep-cloned from status the FIRST time plan mode is
// entered; subsequent entries reuse whatever is already in charts.plan (so
// plan edits are never silently overwritten by re-cloning from status).
export let planInitialized = false;

/** Current active chart mode ("status" | "plan"). */
export function getChartMode(): ChartMode { return chartMode; }

/** Switch the active chart: the mode AND the `toothState` alias move together,
 *  which is the whole point of routing every write through one function. */
export function setActiveChartMode(mode: ChartMode): void {
  chartMode = mode;
  toothState = charts[mode];
}

/** Mark the plan chart as (un)initialized — see the lazy-clone note above. */
export function setPlanInitialized(value: boolean): void {
  planInitialized = value;
}

/** Deep-copy every tooth from `src` into `dst` via the proven
 *  serializeState/hydrateState round-trip, so the two charts never share
 *  Sets/Maps/objects (mutating one tooth's state can never leak into the
 *  other chart's copy).
 *
 *  `inferLegacySecondaryCaries` is OFF: the source is a LIVE state that has
 *  already been hydrated, so every severity it carries is deliberate. Leaving
 *  the inference on (the hydrate default, meant for pre-2.3 payloads) made the
 *  first switch to Plan mode invent a recurrent score on any caried+filled
 *  surface the clinician had left unscored — the plan chart then silently
 *  diverged from status, with `getPlanChanges()` reporting nothing.
 *  `mirrorStatusToPlan()` in odontogram.ts passes `false` for the same reason. */
export function cloneChart(src: Map<Any, Any>, dst: Map<Any, Any>): void {
  dst.clear();
  for(const [n, s] of src) dst.set(n, hydrateState(serializeState(s), false));
}
