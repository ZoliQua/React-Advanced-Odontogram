// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * The engine's state-change subscription — extracted from odontogram.ts as the
 * gateway that lets STATEFUL slices move out next: every setter calls
 * `notifyStateChange()`, so a module extracted from odontogram.ts would
 * otherwise have to import back from it (a cycle). This module depends on
 * nothing.
 *
 * odontogram.ts installs its bridge-overlay redraw through
 * {@link setPostNotifyHook}, preserving the original order: every listener
 * first, the overlay redraw last.
 */

const stateChangeListeners = new Set<() => void>();

/** Runs after every listener — odontogram.ts installs its bridge-overlay redraw. */
let postNotifyHook: (() => void) | null = null;

/** Install the after-listeners hook. Called once by odontogram.ts. */
export function setPostNotifyHook(fn: (() => void) | null): void {
  postNotifyHook = fn;
}

/**
 * Subscribe to odontogram state changes. The callback runs after any tooth
 * state edit, the edentulous toggle, an import, or a change to a session
 * setting (numbering system, notes, ICDAS, caries/pulp/wear/discoloration
 * detail, surface notation, fillings, perio display) — so a host that
 * persists the doctor's preferences can react to the settings modal too.
 *
 * @param cb - Callback invoked on each change.
 * @returns An unsubscribe function.
 */
export function onStateChange(cb: () => void): () => void {
  stateChangeListeners.add(cb);
  return () => { stateChangeListeners.delete(cb); };
}

export function notifyStateChange(){
  for(const cb of stateChangeListeners){
    try{ cb(); }
    catch(e){ console.error("odontogram state-change listener failed", e); }
  }
  // Redraw the multi-tooth bridge overlay after per-tooth renders settle.
  // notifyStateChange() is synchronous and is always invoked at the END of a
  // mutation batch (single edit, edentulous toggle, import, init), so tile
  // geometry is current by this point. The hook is internally guarded, but wrap
  // defensively so a geometry hiccup can never break state notification.
  try{ postNotifyHook?.(); }
  catch(e){ console.error("odontogram bridge overlay render failed", e); }
}
