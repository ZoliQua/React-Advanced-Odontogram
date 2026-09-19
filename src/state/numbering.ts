// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Tooth numbering: the selected notation (FDI / Universal / Palmer) and the two
 * readers that turn a tooth number into what the user sees — a milk tooth is
 * displayed in its deciduous range, then formatted in the active notation.
 *
 * The flag lives here rather than in odontogram.ts so `perioExport.ts` can label
 * its teeth without importing the engine back; that was the last of the three
 * import cycles. odontogram.ts keeps the public `setNumberingSystem()`, which
 * calls {@link applyNumberingSystem} and then repaints the tiles and the active
 * label.
 */

import { toLabel, type NumberingSystem } from "../utils/numbering";
import { toothState } from "./chart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors the engine-wide `Any` alias
type Any = any;

export let numberingSystem: NumberingSystem = "FDI";

/** Set the notation, reporting whether it actually changed. odontogram.ts's
 *  public `setNumberingSystem()` uses that to decide whether to repaint. */
export function applyNumberingSystem(system: NumberingSystem): boolean {
  if(system === numberingSystem) return false;
  numberingSystem = system;
  return true;
}

// A milk tooth is stored under its permanent FDI number but DISPLAYED with the
// deciduous quadrant digit (1->5, 2->6, 3->7, 4->8), so e.g. permanent 11 shows
// as 51. Non-milk teeth display their own number unchanged.
export function getDisplayedToothNumber(toothNo: Any){
  const s = toothState.get(toothNo);
  if(!s || s.toothSelection !== "milktooth") return toothNo;
  const firstDigit = Math.floor(toothNo / 10);
  const secondDigit = toothNo % 10;
  const mappedFirst = firstDigit === 1 ? 5 : firstDigit === 2 ? 6 : firstDigit === 3 ? 7 : 8;
  return mappedFirst * 10 + secondDigit;
}

/** Formats a tooth number for display using the active numbering system AND
 *  the milktooth display-remap ({@link getDisplayedToothNumber}) — the exact
 *  same formatting {@link getOdontogramSummary} uses for every tooth number
 *  it prints (permanent/missing lists, per-section entries, implants). Exported
 *  so the "What changes" box in App.tsx can label a {@link PlanChange.toothNo}
 *  identically, without duplicating the numbering/milktooth logic. */
export function formatToothLabel(toothNo: number): string {
  return toLabel(getDisplayedToothNumber(toothNo), numberingSystem);
}
