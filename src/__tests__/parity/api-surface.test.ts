// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// FROZEN PUBLIC API SURFACE — the safety net for splitting the (very large)
// odontogram.ts into modules. 181 files import from it, so a re-export lost
// while moving code out would break consumers silently: `tsc` only checks the
// files in this repo, and no behavioural test enumerates the surface.
//
// This freezes EVERY runtime export (name + typeof) of the library entry point
// (`App.tsx`) and of `odontogram.ts` itself. A split must keep the golden
// byte-identical; a deliberate API addition/removal is a one-line, reviewable
// diff in the golden (re-capture with `API_SURFACE_WRITE=1 npx vitest run
// src/__tests__/parity/api-surface.test.ts`).
//
// Type-only exports are erased at runtime and therefore NOT covered here —
// `tsc -b` covers those.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as App from "../../App";
import * as Engine from "../../odontogram";

const GOLDEN = path.resolve(__dirname, "api-surface-golden.json");

/** name -> typeof, sorted by name (stable, diff-friendly). */
function surfaceOf(mod: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of Object.keys(mod).sort()) out[name] = typeof mod[name];
  return out;
}

const surface = { App: surfaceOf(App as never), odontogram: surfaceOf(Engine as never) };

describe("frozen public API surface", () => {
  it("matches the golden (re-capture with API_SURFACE_WRITE=1 after a DELIBERATE API change)", () => {
    if (process.env.API_SURFACE_WRITE) writeFileSync(GOLDEN, JSON.stringify(surface, null, 2) + "\n", "utf8");
    expect(existsSync(GOLDEN), `missing ${GOLDEN}`).toBe(true);
    expect(JSON.parse(readFileSync(GOLDEN, "utf8"))).toEqual(surface);
  });

  it("sanity: the surface is large and every entry is a real runtime value", () => {
    expect(Object.keys(surface.odontogram).length).toBeGreaterThan(300);
    expect(Object.keys(surface.App).length).toBeGreaterThan(100);
    for (const [mod, names] of Object.entries(surface)) {
      for (const [name, kind] of Object.entries(names)) {
        expect(kind, `${mod}.${name} is undefined at runtime`).not.toBe("undefined");
      }
    }
  });
});
