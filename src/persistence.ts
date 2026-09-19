// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Opt-in localStorage persistence for the odontogram case state. Disabled by
// default; a host app explicitly calls enablePersistence() (after the
// odontogram has mounted — restore goes through importStatus(), which repaints
// the live DOM). Every localStorage/JSON failure is caught and routed to the
// optional onError callback (or console.warn) — this module never throws.

import { onStateChange, getStatusChart, importStatus } from "./odontogram";

export type PersistenceOptions = {
  /** localStorage key. Default: "react-advanced-odontogram". */
  key?: string;
  /** Persist the plan chart too (payload's `plan` field). Default: false. */
  includePlan?: boolean;
  /** Called on any storage/parse error instead of console.warn. */
  onError?: (err: Error) => void;
};

const DEFAULT_KEY = "react-advanced-odontogram";
const MAX_BYTES = 4 * 1024 * 1024;
const WRAPPER_VERSION = 1;
/** Coalesce rapid edits into one write — a burst (e.g. a Statuses preset that
 *  touches many teeth, or fast typing) fires many state-change events, but we
 *  only need to persist the settled result. */
const SAVE_DEBOUNCE_MS = 400;

let unsubscribe: (() => void) | null = null;
let activeKey = DEFAULT_KEY;
let activeOptions: PersistenceOptions = {};
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function reportError(err: unknown): void {
  const e = err instanceof Error ? err : new Error(String(err));
  const handler = activeOptions.onError;
  if (handler) {
    try { handler(e); } catch { /* an error handler must not take the app down */ }
  } else {
    console.warn("odontogram persistence:", e.message);
  }
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch { return null; } // SecurityError in locked-down iframes
}

/** Debounced entry point wired to `onStateChange` — the actual `save()` runs
 *  only after edits settle for {@link SAVE_DEBOUNCE_MS}. */
function scheduleSave(): void {
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveTimer = null; save(); }, SAVE_DEBOUNCE_MS);
}

/** Cancel a pending debounced save; when `flush` is true, run it immediately
 *  first so the last edit isn't lost (used on disablePersistence). */
function cancelPendingSave(flush: boolean): void {
  if (saveTimer === null) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  if (flush) save();
}

function save(): void {
  const storage = getStorage();
  if (!storage) { reportError(new Error("localStorage is not available")); return; }
  try {
    const payload = getStatusChart();
    if (!activeOptions.includePlan && payload && typeof payload === "object") {
      delete (payload as Record<string, unknown>).plan;
    }
    const json = JSON.stringify({ version: WRAPPER_VERSION, savedAt: new Date().toISOString(), payload });
    if (json.length > MAX_BYTES) {
      reportError(new Error(`persisted payload exceeds ${MAX_BYTES} bytes — save skipped`));
      return;
    }
    storage.setItem(activeKey, json);
  } catch (err) { reportError(err); } // QuotaExceededError et al.
}

function restore(): void {
  const storage = getStorage();
  if (!storage) return;
  let raw: string | null = null;
  try { raw = storage.getItem(activeKey); } catch (err) { reportError(err); return; }
  if (raw === null) return;
  try {
    const wrapper = JSON.parse(raw) as { version?: unknown; payload?: unknown };
    if (!wrapper || typeof wrapper !== "object" || wrapper.version !== WRAPPER_VERSION || !wrapper.payload) {
      reportError(new Error("persisted state has an unrecognized wrapper format — ignored"));
      return;
    }
    importStatus(wrapper.payload);
  } catch (err) { reportError(err); }
}

/**
 * Turn on localStorage persistence: restores a previously saved case (if any),
 * then saves on every state change. Idempotent — calling again replaces the
 * previous subscription and options. Call AFTER the odontogram has mounted.
 */
export function enablePersistence(options: PersistenceOptions = {}): void {
  disablePersistence();
  activeOptions = options;
  activeKey = options.key ?? DEFAULT_KEY;
  restore();
  unsubscribe = onStateChange(scheduleSave);
}

/** Stop persisting. The stored entry is left in place (see clearPersistedState).
 *  A pending debounced save is flushed first so the last edit isn't lost. */
export function disablePersistence(): void {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  cancelPendingSave(true);
}

/** Remove the stored entry for the active (or default) key. */
export function clearPersistedState(): void {
  const storage = getStorage();
  if (!storage) return;
  try { storage.removeItem(activeKey); } catch (err) { reportError(err); }
}

/** True while a state-change subscription is active. */
export function isPersistenceEnabled(): boolean {
  return unsubscribe !== null;
}
