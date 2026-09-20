// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Settings -> Odontogram: the on-screen chart styling and the tooth-information
 * panel toggle. Session-only, never part of the export payload — pure CSS via
 * data-attributes / custom properties on the chart surface.
 *
 * They used to be React state private to the provider, which meant a host
 * persisting the doctor's preferences could neither read nor restore them.
 * Now they follow the `perioViewMode` precedent: a module `let` + getter +
 * setter that sanitizes, early-returns when unchanged and calls
 * `notifyStateChange()`; the provider mirrors them through `onStateChange`.
 */

import { notifyStateChange } from "./notify";

/** Inter-tooth gap in the live grid. */
export type ScreenToothSpacing = "wide" | "normal" | "close";
/** Tooth-number font size in the live grid. */
export type ScreenToothNumberSize = "small" | "normal" | "xlarge";
/** Selection-ring border style (default dashed). */
export type SelectionBorderStyle = "solid" | "dashed" | "dotted";

let screenToothSpacing: ScreenToothSpacing = "normal";
let screenToothNumberSize: ScreenToothNumberSize = "normal";
let selectionColor = "#3b7bff";
let selectionBorderStyle: SelectionBorderStyle = "dashed";
let toothInfoVisible = true;

/** Current inter-tooth spacing. Defaults to `"normal"`. */
export function getScreenToothSpacing(): ScreenToothSpacing { return screenToothSpacing; }
/** Set the inter-tooth spacing. Sanitizes to the literal set; no-op (does not notify) if unchanged. */
export function setScreenToothSpacing(value: ScreenToothSpacing): void {
  const next = value === "wide" || value === "close" ? value : "normal";
  if(next === screenToothSpacing) return;
  screenToothSpacing = next;
  notifyStateChange();
}

/** Current tooth-number size. Defaults to `"normal"`. */
export function getScreenToothNumberSize(): ScreenToothNumberSize { return screenToothNumberSize; }
/** Set the tooth-number size. Sanitizes to the literal set; no-op (does not notify) if unchanged. */
export function setScreenToothNumberSize(value: ScreenToothNumberSize): void {
  const next = value === "small" || value === "xlarge" ? value : "normal";
  if(next === screenToothNumberSize) return;
  screenToothNumberSize = next;
  notifyStateChange();
}

/** Current selection-ring colour as `#rrggbb`. Defaults to `"#3b7bff"`. */
export function getSelectionColor(): string { return selectionColor; }
/** Set the selection-ring colour. Anything but a `#rrggbb` hex is ignored; no-op (does not notify) if unchanged. */
export function setSelectionColor(value: string): void {
  if(typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) return;
  const next = value.toLowerCase();
  if(next === selectionColor) return;
  selectionColor = next;
  notifyStateChange();
}

/** Current selection-ring border style. Defaults to `"dashed"`. */
export function getSelectionBorderStyle(): SelectionBorderStyle { return selectionBorderStyle; }
/** Set the selection-ring border style. Sanitizes to the literal set; no-op (does not notify) if unchanged. */
export function setSelectionBorderStyle(value: SelectionBorderStyle): void {
  const next = value === "solid" || value === "dotted" ? value : "dashed";
  if(next === selectionBorderStyle) return;
  selectionBorderStyle = next;
  notifyStateChange();
}

/** Whether the tooth-information panel is shown. Defaults to `true`. */
export function getToothInfoVisible(): boolean { return toothInfoVisible; }
/** Show or hide the tooth-information panel. No-op (does not notify) if unchanged. */
export function setToothInfoVisible(value: boolean): void {
  const next = !!value;
  if(next === toothInfoVisible) return;
  toothInfoVisible = next;
  notifyStateChange();
}
