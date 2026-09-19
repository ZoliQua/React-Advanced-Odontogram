// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { composeRestorationLayers, isValidRestoration, restorationOptions } from "../restorations";

describe("restoration matrix", () => {
  it("composes {material}-{type} with bridge/telescope/onlay special cases", () => {
    expect(composeRestorationLayers("crown", "gold", "front")).toEqual(["gold-crown"]);
    expect(composeRestorationLayers("inlay", "emax", "front")).toEqual(["emax-inlay"]);
    // SP15 Task 2 (B8): a bridge tooth shows both the crown cap and the saddle
    // connector (previously only the connector, hiding the crown).
    expect(composeRestorationLayers("bridge", "metal-ceramic", "front"))
      .toEqual(["metal-ceramic-crown", "metal-ceramic-bridge-connector"]);
    expect(composeRestorationLayers("bridge", "telescope", "front"))
      .toEqual(["telescope-crown", "telescope-crown-inside", "telescope-crown-outside", "telescope-bridge-connector"]);
    expect(composeRestorationLayers("crown", "telescope", "front"))
      .toEqual(["telescope-crown", "telescope-crown-inside", "telescope-crown-outside"]);
    expect(composeRestorationLayers("onlay", "gold", "occlusal")).toEqual(["gold-onlay"]);
    // A lateral-view onlay renders the material's inlay layer (an onlay is
    // visually identical to an inlay in the lateral view), so an onlay tooth is
    // not blank laterally — only the occlusal view uses the dedicated onlay layer.
    expect(composeRestorationLayers("onlay", "gold", "front")).toEqual(["gold-inlay"]);
    expect(composeRestorationLayers("onlay", "emax", "front")).toEqual(["emax-inlay"]);
    expect(composeRestorationLayers("none", "none", "front")).toEqual([]);
  });
  it("validity follows the artwork matrix (onlay occlusal-only; metal crown/bridge-only; onlay materials incl. zircon)", () => {
    expect(isValidRestoration("onlay", "gold", "front")).toBe(false);
    expect(isValidRestoration("onlay", "gold", "occlusal")).toBe(true);
    expect(isValidRestoration("inlay", "metal", "front")).toBe(false);
    expect(isValidRestoration("crown", "metal", "front")).toBe(true);
    expect(isValidRestoration("onlay", "zircon", "occlusal")).toBe(true);
    expect(isValidRestoration("veneer", "zircon", "front")).toBe(true);
  });
  it("options list is view-filtered and prefixed", () => {
    const front = restorationOptions("front", {});
    expect(front.some(o => o.restorationType === "onlay")).toBe(false);
    expect(front[0]).toEqual({ restorationType: "none", restorationMaterial: "none", labelKey: "restoration.none" });
    const occl = restorationOptions("occlusal", {});
    expect(occl.some(o => o.restorationType === "onlay")).toBe(true);
  });

  // SP3b FIX 2: the ONE combined dropdown lists "Fix:" (restorationType×material)
  // AND "Kivehető:" (prosthesis axis) entries. The prosthesis half is context-gated.
  it("appends implant attachment prosthesis options for an implant tooth", () => {
    const opts = restorationOptions("occlusal", { isImplant: true });
    const prosth = opts.filter(o => o.prosthesis).map(o => o.prosthesis);
    expect(prosth).toEqual(["healing-abutment", "locator", "locator-denture", "bar", "bar-denture"]);
    // Prosthesis entries carry the removable prefix and keep the fixed fields "none".
    for (const o of opts.filter(x => x.prosthesis)) {
      expect(o.prefixKey).toBe("restoration.prefix.removable");
      expect(o.restorationType).toBe("none");
      expect(o.restorationMaterial).toBe("none");
    }
  });

  it("appends removable-denture prosthesis options for a gap (none) tooth", () => {
    const opts = restorationOptions("front", { toothSelection: "none" });
    expect(opts.filter(o => o.prosthesis).map(o => o.prosthesis)).toEqual(["removable-partial", "removable-full"]);
  });

  it("appends NO prosthesis options for an ordinary present tooth", () => {
    expect(restorationOptions("occlusal", { toothSelection: "tooth-base" }).some(o => o.prosthesis)).toBe(false);
    expect(restorationOptions("occlusal", {}).some(o => o.prosthesis)).toBe(false);
  });
});
