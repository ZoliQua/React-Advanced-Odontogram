// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP3b final-review fixes:
//  FIX 1 — a v1.14.0 (payload 2.0) implant FIXED crown (serialized by the SP3a
//          interim defer as restorationType:"none" + crownMaterial:<material>)
//          must NOT be silently dropped on import.
//  FIX 2 — the combined restoration dropdown writes the `prosthesis` axis for
//          "Kivehető:" entries (tested here via __applyRestorationSelectionForTest,
//          the exact mutation the #restorationSelect change handler runs).
//  FIX 3 — crownLeakage clears when the restoration leaves crown/bridge.
//  FIX 4 — hydrateState coherence: never BOTH a fixed restoration and a prosthesis.
import { describe, it, expect } from "vitest";
import {
  __setToothStateForTest,
  __getToothStateForTest,
  __applyRestorationSelectionForTest,
} from "../odontogram";

describe("FIX 1: 2.0-format implant fixed crown survives import (no silent drop)", () => {
  it("implant + restorationType:none + crownMaterial:zircon -> restorationType:crown, material:zircon, prosthesis:none", () => {
    __setToothStateForTest(14, {
      toothSelection: "implant",
      restorationType: "none",
      restorationMaterial: "none",
      crownMaterial: "zircon",
    });
    const s = __getToothStateForTest(14)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("zircon");
    expect(s.prosthesis).toBe("none");
  });

  it("crownMaterial:metal folds to metal-ceramic (deliberate PFM rename)", () => {
    __setToothStateForTest(15, {
      toothSelection: "implant",
      restorationType: "none",
      restorationMaterial: "none",
      crownMaterial: "metal",
    });
    const s = __getToothStateForTest(15)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("metal-ceramic");
    expect(s.prosthesis).toBe("none");
  });

  it("does NOT hijack an implant attachment crownMaterial (locator still migrates to prosthesis)", () => {
    __setToothStateForTest(16, { toothSelection: "implant", crownMaterial: "locator" });
    const s = __getToothStateForTest(16)!;
    expect(s.prosthesis).toBe("locator");
    expect(s.restorationType).toBe("none");
  });

  it("does NOT touch a fixed-crown material on a NON-implant tooth via this path (1.4 fold owns that)", () => {
    // A genuine 1.4 payload (restorationType absent) on a natural tooth still folds
    // via the first legacy block; the FIX 1 block is implant-gated and no-ops here.
    __setToothStateForTest(17, { toothSelection: "tooth-base", crownMaterial: "zircon" });
    const s = __getToothStateForTest(17)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("zircon");
  });
});

describe("FIX 4: import coherence — never both a fixed restoration and a prosthesis", () => {
  it("crown + prosthesis:healing-abutment -> restoration wins, prosthesis cleared", () => {
    __setToothStateForTest(24, {
      toothSelection: "implant",
      restorationType: "crown",
      restorationMaterial: "zircon",
      prosthesis: "healing-abutment",
    });
    const s = __getToothStateForTest(24)!;
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("zircon");
    expect(s.prosthesis).toBe("none");
  });

  it("bridge + prosthesis:bar -> prosthesis cleared", () => {
    __setToothStateForTest(25, {
      toothSelection: "implant",
      restorationType: "bridge",
      restorationMaterial: "gold",
      prosthesis: "bar",
    });
    expect(__getToothStateForTest(25)!.prosthesis).toBe("none");
  });

  it("a prosthesis with NO fixed restoration is preserved", () => {
    __setToothStateForTest(26, { toothSelection: "implant", prosthesis: "locator" });
    const s = __getToothStateForTest(26)!;
    expect(s.prosthesis).toBe("locator");
    expect(s.restorationType).toBe("none");
  });
});

describe("FIX 2: combined-dropdown selection writes the prosthesis axis", () => {
  it("selecting a 'Kivehető:' (prosthesis|<value>) entry sets prosthesis and clears the fixed restoration", () => {
    const s: Record<string, unknown> = {
      restorationType: "crown", restorationMaterial: "zircon",
      prosthesis: "none", bridgePillar: true, crownReplace: true, crownLeakage: true,
    };
    __applyRestorationSelectionForTest(s, "prosthesis|locator");
    expect(s.prosthesis).toBe("locator");
    expect(s.restorationType).toBe("none");
    expect(s.restorationMaterial).toBe("none");
    expect(s.bridgePillar).toBe(false);
    expect(s.crownReplace).toBe(false);
    expect(s.crownLeakage).toBe(false); // no longer crown/bridge (FIX 3)
  });

  it("selecting a fixed 'Fix:' entry clears any existing prosthesis", () => {
    const s: Record<string, unknown> = { restorationType: "none", restorationMaterial: "none", prosthesis: "locator" };
    __applyRestorationSelectionForTest(s, "crown|emax");
    expect(s.restorationType).toBe("crown");
    expect(s.restorationMaterial).toBe("emax");
    expect(s.prosthesis).toBe("none");
  });

  it("selecting 'none|none' clears both axes", () => {
    const s: Record<string, unknown> = { restorationType: "crown", restorationMaterial: "emax", prosthesis: "none" };
    __applyRestorationSelectionForTest(s, "none|none");
    expect(s.restorationType).toBe("none");
    expect(s.prosthesis).toBe("none");
  });
});

describe("FIX 3: crownLeakage clears when the restoration leaves crown/bridge", () => {
  it("changing crown -> inlay clears a stale crownLeakage flag", () => {
    const s: Record<string, unknown> = { restorationType: "crown", restorationMaterial: "zircon", prosthesis: "none", crownLeakage: true };
    __applyRestorationSelectionForTest(s, "inlay|gold");
    expect(s.restorationType).toBe("inlay");
    expect(s.crownLeakage).toBe(false);
  });

  it("changing crown -> none clears crownLeakage", () => {
    const s: Record<string, unknown> = { restorationType: "crown", restorationMaterial: "zircon", prosthesis: "none", crownLeakage: true };
    __applyRestorationSelectionForTest(s, "none|none");
    expect(s.crownLeakage).toBe(false);
  });

  it("staying on crown keeps crownLeakage untouched", () => {
    const s: Record<string, unknown> = { restorationType: "crown", restorationMaterial: "zircon", prosthesis: "none", crownLeakage: true };
    __applyRestorationSelectionForTest(s, "crown|emax");
    expect(s.crownLeakage).toBe(true);
  });

  it("switching to a bridge keeps crownLeakage", () => {
    const s: Record<string, unknown> = { restorationType: "crown", restorationMaterial: "zircon", prosthesis: "none", crownLeakage: true };
    __applyRestorationSelectionForTest(s, "bridge|gold");
    expect(s.crownLeakage).toBe(true);
  });
});
