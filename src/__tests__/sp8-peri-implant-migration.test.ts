// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { __setToothStateForTest, __getToothStateForTest } from "../odontogram";

describe("SP8 Task 4: implant mods → periImplant:mucositis migration", () => {
  it("implant + mods.inflammation → mucositis, inflammation removed", () => {
    __setToothStateForTest(11, { toothSelection: "implant", mods: ["inflammation"] });
    const s = __getToothStateForTest(11)!;
    expect(s.periImplant).toBe("mucositis");
    expect(s.mods).not.toContain("inflammation");
  });
  it("implant + mods.parodontal → mucositis, parodontal removed", () => {
    __setToothStateForTest(13, { toothSelection: "implant", mods: ["parodontal"] });
    const s = __getToothStateForTest(13)!;
    expect(s.periImplant).toBe("mucositis");
    expect(s.mods).not.toContain("parodontal");
  });
  it("non-implant + mods.parodontal → mods preserved, periImplant none", () => {
    __setToothStateForTest(21, { toothSelection: "tooth-base", mods: ["parodontal"] });
    const s = __getToothStateForTest(21)!;
    expect(s.mods).toContain("parodontal");
    expect(s.periImplant).toBe("none");
  });
  it("a payload's own periImplant wins over migration", () => {
    __setToothStateForTest(14, { toothSelection: "implant", mods: ["inflammation"], periImplant: "peri-implantitis-severe" });
    expect(__getToothStateForTest(14)!.periImplant).toBe("peri-implantitis-severe");
  });
  it("implant + mods.inflammation AND mods.parodontal → mucositis, BOTH stray mods removed", () => {
    __setToothStateForTest(16, { toothSelection: "implant", mods: ["inflammation", "parodontal"] });
    const s = __getToothStateForTest(16)!;
    expect(s.periImplant).toBe("mucositis");
    expect(s.mods).not.toContain("inflammation");
    expect(s.mods).not.toContain("parodontal");
  });
});
