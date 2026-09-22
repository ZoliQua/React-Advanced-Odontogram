// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The remaining session-setting setters must follow the same convention as
// setPulpDetailLevel/setSurfaceNotation and the fillings setters
// (filling-settings-setters.test.ts): idempotent (early-return when the value
// is unchanged) AND call notifyStateChange(), so a host that persists the
// doctor's preferences through onStateChange sees a toggle made in the
// settings modal even when no tooth is edited afterwards.
import { describe, it, expect, afterEach } from "vitest";
import {
  setNotesEnabled,
  getNotesEnabled,
  setIcdasEnabled,
  getIcdasEnabled,
  setCariesDepthEnabled,
  getCariesDepthEnabled,
  setSecondaryCariesMode,
  getSecondaryCariesMode,
  setRootCariesMode,
  getRootCariesMode,
  setRadiographicDepthMode,
  getRadiographicDepthMode,
  setWearDetailLevel,
  getWearDetailLevel,
  setDiscolorationDetailLevel,
  getDiscolorationDetailLevel,
  setNumberingSystem,
  onStateChange,
} from "../odontogram";
import { numberingSystem } from "../state/numbering";

const resetDefaults = () => {
  setNotesEnabled(false);
  setIcdasEnabled(false);
  setCariesDepthEnabled(true);
  setSecondaryCariesMode("standard");
  setRootCariesMode("simple");
  setRadiographicDepthMode("off");
  setWearDetailLevel("complex");
  setDiscolorationDetailLevel("complex");
  setNumberingSystem("FDI");
};

/** Runs `fn` with a subscriber attached and reports whether it fired. */
function fires(fn: () => void): boolean {
  let fired = false;
  const unsub = onStateChange(() => { fired = true; });
  try { fn(); } finally { unsub(); }
  return fired;
}

describe("session-setting setters: idempotent + notifyStateChange", () => {
  afterEach(resetDefaults);

  it("setNotesEnabled", () => {
    expect(fires(() => setNotesEnabled(true))).toBe(true);
    expect(getNotesEnabled()).toBe(true);
    expect(fires(() => setNotesEnabled(true))).toBe(false);
    // Truthy coercion: a truthy non-boolean is sanitized to true.
    expect(fires(() => setNotesEnabled(1 as unknown as boolean))).toBe(false);
  });

  it("setIcdasEnabled", () => {
    expect(fires(() => setIcdasEnabled(true))).toBe(true);
    expect(getIcdasEnabled()).toBe(true);
    expect(fires(() => setIcdasEnabled(true))).toBe(false);
  });

  it("setCariesDepthEnabled", () => {
    expect(fires(() => setCariesDepthEnabled(false))).toBe(true);
    expect(getCariesDepthEnabled()).toBe(false);
    expect(fires(() => setCariesDepthEnabled(false))).toBe(false);
  });

  it("setSecondaryCariesMode", () => {
    expect(fires(() => setSecondaryCariesMode("full"))).toBe(true);
    expect(getSecondaryCariesMode()).toBe("full");
    expect(fires(() => setSecondaryCariesMode("full"))).toBe(false);
    // An invalid value sanitizes to "standard" — a real change from "full".
    expect(fires(() => setSecondaryCariesMode("bogus" as "simple"))).toBe(true);
    expect(getSecondaryCariesMode()).toBe("standard");
  });

  it("setRootCariesMode", () => {
    expect(fires(() => setRootCariesMode("severity"))).toBe(true);
    expect(getRootCariesMode()).toBe("severity");
    expect(fires(() => setRootCariesMode("severity"))).toBe(false);
  });

  it("setRadiographicDepthMode", () => {
    expect(fires(() => setRadiographicDepthMode("detailed"))).toBe(true);
    expect(getRadiographicDepthMode()).toBe("detailed");
    expect(fires(() => setRadiographicDepthMode("detailed"))).toBe(false);
  });

  it("setWearDetailLevel", () => {
    expect(fires(() => setWearDetailLevel("simple"))).toBe(true);
    expect(getWearDetailLevel()).toBe("simple");
    expect(fires(() => setWearDetailLevel("simple"))).toBe(false);
  });

  it("setDiscolorationDetailLevel", () => {
    expect(fires(() => setDiscolorationDetailLevel("simple"))).toBe(true);
    expect(getDiscolorationDetailLevel()).toBe("simple");
    expect(fires(() => setDiscolorationDetailLevel("simple"))).toBe(false);
  });

  it("setNumberingSystem", () => {
    expect(fires(() => setNumberingSystem("UNIVERSAL"))).toBe(true);
    expect(numberingSystem).toBe("UNIVERSAL");
    expect(fires(() => setNumberingSystem("UNIVERSAL"))).toBe(false);
  });
});
