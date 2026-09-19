// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect, vi } from "vitest";
import { buildFlagCtx, applyFlagLayers } from "../svgActivate";

const deps = {
  setActive: vi.fn(), svgGetById: (_: any, id: string) => id,
  isToothPresent: (s: string) => ["tooth-base","milktooth","implant","tooth-under-gum"].includes(s),
  isUnderGum: (s: string) => s === "tooth-under-gum", isExtraction: (s: string) => s === "no-tooth-after-extraction",
  fissureAllowedTeeth: new Set([16]), brokenVariants: new Set<string>(),
};
const active = (state: any, toothNo = 11) => {
  const calls: string[] = []; deps.setActive.mockImplementation((id: any, on: boolean) => on && calls.push(id));
  applyFlagLayers({}, state, buildFlagCtx(state, toothNo, deps as any), deps as any); return calls;
};

describe("applyFlagLayers", () => {
  it("activates a gated-on flag and its gated-off siblings stay off", () => {
    expect(active({ toothSelection: "tooth-base", crownMaterial: "natural", parapulpalPin: true }, 11)).toContain("parapulpal-pin");
    expect(active({ toothSelection: "tooth-base", crownMaterial: "natural", fissureSealing: true }, 11)).not.toContain("fissure-sealing"); // 11 not molar
    expect(active({ toothSelection: "tooth-base", crownMaterial: "natural", fissureSealing: true }, 16)).toContain("fissure-sealing");
  });
  it("activates mods members", () => {
    expect(active({ toothSelection: "tooth-base", crownMaterial: "natural", mods: new Set(["inflammation","parodontal"]) })).toEqual(
      expect.arrayContaining(["inflammation","parodontal"]));
  });
});
