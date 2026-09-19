// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP15 Task 1: restoration-dropdown gating regressions from the prior
// materials/prosthetics refactor.
//   B5 — implant Restoration dropdown was hidden by hideRestorationRow (fixed:
//        isImplant removed from the hide predicate; restorationOptions() already
//        restricted an implant's fixed types to crown/bridge and appended the
//        healing-abutment/locator/locator-denture/bar/bar-denture attachments).
//   B5 — Mobility grading (Miller) doesn't apply to an implant (no periodontal
//        ligament); the #mobilityRow / #mobilitySelect are now hidden/disabled
//        for an implant tooth (stored mobility data is left untouched).
//   B7 — a radix substrate (broken root) can't carry a restoration; the row is
//        now hidden for state.toothSubstrate === "radix" (mirrors #cariesSection's
//        hideByRadix check).
//   B6 — a gap/missing tooth (toothSelection:"none") offers ONLY a bridge pontic
//        (x material) + the removable-partial/removable-full prosthesis entries,
//        not standalone crown/inlay/onlay/veneer (those need tooth substrate that
//        isn't there).
//
// Mirrors sp14-ortho-ui.test.ts's pattern: pure predicates get their own
// __*ForTest seam (mirrors __wearRowAllowedForTest); restorationOptions() is
// tested directly as it's already a pure, exported function.
import { describe, it, expect } from "vitest";
import {
  __restorationRowHiddenForTest,
  __mobilityRowHiddenForTest,
  __mobilityDisabledForTest,
} from "../odontogram";
import { restorationOptions } from "../registry/restorations";

describe("SP15 Task 1: restorationOptions() gating", () => {
  it("implant: offers crown/bridge x material plus all 5 implant attachments (locked, already correct)", () => {
    const opts = restorationOptions("front", { isImplant: true });
    // fixed crown/bridge combos present
    expect(opts.some((o) => o.restorationType === "crown" && o.restorationMaterial === "zircon")).toBe(true);
    expect(opts.some((o) => o.restorationType === "bridge" && o.restorationMaterial === "zircon")).toBe(true);
    // no natural-tooth-only types
    expect(opts.some((o) => o.restorationType === "inlay")).toBe(false);
    expect(opts.some((o) => o.restorationType === "onlay")).toBe(false);
    expect(opts.some((o) => o.restorationType === "veneer")).toBe(false);
    // all 5 implant attachment entries
    const prostheses = opts.filter((o) => o.prosthesis).map((o) => o.prosthesis);
    expect(prostheses.sort()).toEqual(
      ["bar", "bar-denture", "healing-abutment", "locator", "locator-denture"].sort(),
    );
  });

  it("gap (toothSelection:'none'): offers ONLY bridge x material + the 2 removable prosthesis entries", () => {
    const opts = restorationOptions("front", { toothSelection: "none" });
    // bridge is present, and only bridge among fixed types
    expect(opts.some((o) => o.restorationType === "bridge")).toBe(true);
    expect(opts.some((o) => o.restorationType === "crown")).toBe(false);
    expect(opts.some((o) => o.restorationType === "inlay")).toBe(false);
    expect(opts.some((o) => o.restorationType === "onlay")).toBe(false);
    expect(opts.some((o) => o.restorationType === "veneer")).toBe(false);
    const prostheses = opts.filter((o) => o.prosthesis).map((o) => o.prosthesis);
    expect(prostheses.sort()).toEqual(["removable-full", "removable-partial"].sort());
  });

  it("gap: bridge is offered across its full material set (not just one material)", () => {
    const opts = restorationOptions("front", { toothSelection: "none" });
    const bridgeMaterials = opts
      .filter((o) => o.restorationType === "bridge")
      .map((o) => o.restorationMaterial);
    expect(bridgeMaterials).toContain("zircon");
    expect(bridgeMaterials).toContain("emax");
    expect(bridgeMaterials.length).toBeGreaterThan(1);
  });

  it("plain tooth-base (no ctx): unrestricted — still offers inlay/onlay/veneer/crown/bridge (unchanged)", () => {
    const opts = restorationOptions("occlusal", {});
    expect(opts.some((o) => o.restorationType === "crown")).toBe(true);
    expect(opts.some((o) => o.restorationType === "inlay")).toBe(true);
    expect(opts.some((o) => o.restorationType === "onlay")).toBe(true);
    expect(opts.some((o) => o.restorationType === "veneer")).toBe(true);
    expect(opts.some((o) => o.restorationType === "bridge")).toBe(true);
    // no prosthesis entries on a plain present tooth
    expect(opts.some((o) => o.prosthesis)).toBe(false);
  });
});

describe("SP15 Task 1: #restorationRow visibility gate (__restorationRowHiddenForTest)", () => {
  it("implant: NOT hidden (B5 fix)", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "implant", toothSubstrate: "natural" })).toBe(false);
  });

  it("radix substrate: hidden (B7 fix) — a broken root can't carry a restoration", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "tooth-base", toothSubstrate: "radix" })).toBe(true);
  });

  it("milktooth: hidden (unchanged)", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "milktooth", toothSubstrate: "natural" })).toBe(true);
  });

  it("under-gum: hidden (unchanged)", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "tooth-under-gum", toothSubstrate: "natural" })).toBe(true);
  });

  it("extraction socket: hidden (unchanged)", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "no-tooth-after-extraction", toothSubstrate: "natural" })).toBe(true);
  });

  it("plain tooth-base: NOT hidden (unchanged)", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "tooth-base", toothSubstrate: "natural" })).toBe(false);
  });

  it("gap (toothSelection:'none', natural substrate): NOT hidden — a gap carries the bridge/removable options", () => {
    expect(__restorationRowHiddenForTest({ toothSelection: "none", toothSubstrate: "natural" })).toBe(false);
  });
});

describe("SP15 Task 1: mobility gates (__mobilityRowHiddenForTest / __mobilityDisabledForTest)", () => {
  it("implant: row hidden AND select disabled (B5 fix)", () => {
    expect(__mobilityRowHiddenForTest({ toothSelection: "implant" })).toBe(true);
    expect(__mobilityDisabledForTest({ toothSelection: "implant" })).toBe(true);
  });

  it("plain tooth-base: row shown, select enabled (unchanged)", () => {
    expect(__mobilityRowHiddenForTest({ toothSelection: "tooth-base" })).toBe(false);
    expect(__mobilityDisabledForTest({ toothSelection: "tooth-base" })).toBe(false);
  });

  it("under-gum: row hidden (unchanged); select-disabled predicate is unaffected by underGum (pre-existing, out of B5 scope)", () => {
    expect(__mobilityRowHiddenForTest({ toothSelection: "tooth-under-gum" })).toBe(true);
    expect(__mobilityDisabledForTest({ toothSelection: "tooth-under-gum" })).toBe(false);
  });

  it("extraction socket: row hidden AND select disabled (unchanged)", () => {
    expect(__mobilityRowHiddenForTest({ toothSelection: "no-tooth-after-extraction" })).toBe(true);
    expect(__mobilityDisabledForTest({ toothSelection: "no-tooth-after-extraction" })).toBe(true);
  });

  it("gap (toothSelection:'none'): select disabled (unchanged; mobility is meaningless without a tooth)", () => {
    expect(__mobilityDisabledForTest({ toothSelection: "none" })).toBe(true);
  });
});
