// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The measured artwork (~1.1 MB) is code-split and loaded on demand. Three
// things have to stay true for that to be worth anything, and none of them is
// visible in ordinary behaviour tests:
//
//  1. nothing imports `anatomy/measured` STATICALLY — one such import silently
//     pulls the SVGs back into the main chunk and the split is gone;
//  2. the chunk is not fetched until the measured profile is actually selected;
//  3. `setToothAnatomy("measured")` resolves the chunk BEFORE flipping the flag,
//     so `activeAnatomyProfile()` can stay synchronous for every render path —
//     if that ordering ever inverted, the grid would rebuild on the classic
//     profile and the bug would look like a render glitch, not a load bug.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { setToothAnatomy, getToothAnatomy, activeAnatomyProfile } from "../odontogram";
import { isMeasuredProfileLoaded } from "../anatomy/profiles";

const SRC = path.resolve(__dirname, "..");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "assets" || name === "node_modules") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

describe("measured anatomy: the code split holds", () => {
  it("no module imports anatomy/measured statically", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const src = readFileSync(file, "utf8");
      // a STATIC `import ... from ".../measured"` — `await import(...)` is fine
      if (/^\s*(?:import|export)\b[^;]*?\bfrom\s*["'][^"']*\/measured["']/m.test(src)) {
        // the type-only import inside measured.ts's own sibling is not a load
        if (!/^\s*import\s+type\b/m.test(src.split("\n").find((l) => l.includes('/measured"')) ?? "")) {
          offenders.push(path.relative(SRC, file));
        }
      }
    }
    expect(offenders, "a static import defeats the code split — use ensureMeasuredProfile()").toEqual([]);
  });

  it("the measured module is only reachable through a dynamic import", () => {
    const profiles = readFileSync(path.join(SRC, "anatomy/profiles.ts"), "utf8");
    expect(profiles).toContain('import("./measured")');
    expect(/^\s*import[^;]*from\s*["']\.\/measured["']/m.test(profiles)).toBe(false);
  });
});

describe("measured anatomy: load ordering", () => {
  beforeEach(async () => { await setToothAnatomy("classic"); });

  it("stays unloaded while the classic profile is selected", () => {
    expect(getToothAnatomy()).toBe("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
  });

  it("selecting measured loads the chunk, and the flag flips only after it resolved", async () => {
    const promise = setToothAnatomy("measured");
    // Synchronously after the call the flag must NOT have moved yet — that is
    // what keeps activeAnatomyProfile() truthful for any render in between.
    expect(getToothAnatomy()).toBe("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
    await promise;
    expect(isMeasuredProfileLoaded()).toBe(true);
    expect(getToothAnatomy()).toBe("measured");
    const p = activeAnatomyProfile();
    expect(p.layout).toBe("twoArch");
    expect(p.tplNos).toEqual([11, 12, 13, 14, 15, 16, 17, 31, 46]);
    expect(Object.keys(p.templates)).toHaveLength(9);
    expect(p.occlusalTemplate).toBeDefined();
  });

  it("switching back and forth reuses the loaded chunk", async () => {
    await setToothAnatomy("measured");
    await setToothAnatomy("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
    expect(isMeasuredProfileLoaded()).toBe(true); // cached, not discarded
    await setToothAnatomy("measured");
    expect(activeAnatomyProfile().layout).toBe("twoArch");
  });

  it("concurrent selections share one load and settle consistently", async () => {
    await Promise.all([setToothAnatomy("measured"), setToothAnatomy("measured"), setToothAnatomy("measured")]);
    expect(getToothAnatomy()).toBe("measured");
    expect(activeAnatomyProfile().layout).toBe("twoArch");
  });

  // The measured branch awaits a chunk, so a second selection can arrive while
  // the first is still in flight. Whoever asked LAST must win: without a request
  // token the in-flight "measured" applied itself on top of the newer "classic"
  // and the user's last click was silently undone.
  it("a selection issued during the load supersedes the one still in flight", async () => {
    const pending = setToothAnatomy("measured");
    await setToothAnatomy("classic");          // the user changes their mind mid-load
    await pending;
    expect(getToothAnatomy()).toBe("classic");
    expect(activeAnatomyProfile().layout).toBe("uniform16");
  });

  it("the reverse order settles on measured", async () => {
    await setToothAnatomy("measured");
    const pending = setToothAnatomy("classic");
    await setToothAnatomy("measured");
    await pending;
    expect(getToothAnatomy()).toBe("measured");
    expect(activeAnatomyProfile().layout).toBe("twoArch");
  });

  it("re-selecting the profile already on its way in is a no-op, not a second switch", async () => {
    const first = setToothAnatomy("measured");
    await setToothAnatomy("measured");         // resolves immediately: same target
    await first;
    expect(getToothAnatomy()).toBe("measured");
  });
});
