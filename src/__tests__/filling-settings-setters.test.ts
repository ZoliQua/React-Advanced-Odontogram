// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Issue #17 follow-up: the four fillings session-flag setters must follow the
// same convention as setPulpDetailLevel/setSurfaceNotation — idempotent
// (early-return when the value is unchanged) AND call notifyStateChange() so
// onStateChange subscribers (hosts persisting preferences) observe the change.
// Fix #1 in sp17-followups.test.ts is the template; this file covers the
// fillings setters: setFillingDefectEnabled, setFillingComplexity,
// setFissureSealingEnabled, setFillingMaterialAvailability.
import { describe, it, expect, afterEach } from "vitest";
import {
  setFillingDefectEnabled,
  getFillingDefectEnabled,
  setFillingComplexity,
  getFillingComplexity,
  setFissureSealingEnabled,
  getFissureSealingEnabled,
  setFillingMaterialAvailability,
  getFillingMaterialAvailability,
  onStateChange,
} from "../odontogram";

const resetDefaults = () => {
  setFillingDefectEnabled(true);
  setFillingComplexity("complex");
  setFissureSealingEnabled(true);
  setFillingMaterialAvailability("amalgam", true);
  setFillingMaterialAvailability("composite", true);
  setFillingMaterialAvailability("gic", true);
  setFillingMaterialAvailability("temporary", true);
};

describe("fillings session-flag setters: idempotent + notifyStateChange", () => {
  afterEach(resetDefaults);

  it("setFillingDefectEnabled fires notifyStateChange on a real change", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingDefectEnabled(false);
      expect(fired).toBe(true);
      expect(getFillingDefectEnabled()).toBe(false);
      // Truthy coercion: a truthy non-boolean is sanitized to true.
      setFillingDefectEnabled(1 as unknown as boolean);
      expect(getFillingDefectEnabled()).toBe(true);
    } finally {
      unsub();
    }
  });

  it("setFillingDefectEnabled does NOT fire when already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingDefectEnabled(true);
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("setFillingComplexity fires notifyStateChange on a real change", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingComplexity("simple");
      expect(fired).toBe(true);
      expect(getFillingComplexity()).toBe("simple");
    } finally {
      unsub();
    }
  });

  it("setFillingComplexity does NOT fire when already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingComplexity("complex");
      expect(fired).toBe(false);
      // An invalid value sanitizes to "complex" — already the current value,
      // so still no notification.
      setFillingComplexity("bogus" as "complex" | "simple");
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("setFissureSealingEnabled fires notifyStateChange on a real change", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFissureSealingEnabled(false);
      expect(fired).toBe(true);
      expect(getFissureSealingEnabled()).toBe(false);
    } finally {
      unsub();
    }
  });

  it("setFissureSealingEnabled does NOT fire when already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFissureSealingEnabled(true);
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("setFillingMaterialAvailability fires notifyStateChange on a per-material change", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingMaterialAvailability("amalgam", false);
      expect(fired).toBe(true);
      expect(getFillingMaterialAvailability().amalgam).toBe(false);
      // Other materials untouched.
      expect(getFillingMaterialAvailability().composite).toBe(true);
    } finally {
      unsub();
    }
  });

  it("setFillingMaterialAvailability does NOT fire when the material is already the same (idempotent)", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingMaterialAvailability("composite", true);
      expect(fired).toBe(false);
    } finally {
      unsub();
    }
  });

  it("setFillingMaterialAvailability ignores unknown materials without notifying", () => {
    let fired = false;
    const unsub = onStateChange(() => { fired = true; });
    try {
      setFillingMaterialAvailability("platinum", true);
      expect(fired).toBe(false);
      expect(Object.keys(getFillingMaterialAvailability()).sort())
        .toEqual(["amalgam", "composite", "gic", "temporary"]);
    } finally {
      unsub();
    }
  });
});