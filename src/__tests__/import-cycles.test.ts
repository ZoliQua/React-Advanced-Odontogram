// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// No circular imports in src/.
//
// Splitting odontogram.ts moved several slices into their own modules, and each
// one is a chance to create a cycle back into the engine — the failure mode is
// nasty (a module reads a partially-initialized import and gets `undefined` at
// module-eval time, often only in the built bundle, not in tests). The engine
// avoids this by construction: extracted modules never import odontogram.ts,
// and the two places that genuinely need to call back into it use an injected
// hook (`setPostNotifyHook`, `setPluginIdsProvider`). This test keeps that
// property true.
//
// Dependency-free on purpose: it parses the static imports itself rather than
// pulling in a graph tool.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..");
const EXT = [".ts", ".tsx"];

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "__tests__" || name === "assets" || name === "node_modules") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (EXT.includes(path.extname(name)) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

/** Resolve a relative specifier to a real file, or null for packages/assets. */
function resolveLocal(fromFile: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec.split("?")[0]);
  for (const cand of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => path.join(base, "index" + e))]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return null;
}

/** Static import/export-from specifiers only — a dynamic `import()` cannot
 *  deadlock module initialization, and the engine uses it deliberately (fonts,
 *  jsPDF), so those are excluded. */
const SPEC = /^\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm;

function buildGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const file of sourceFiles(SRC)) {
    const src = readFileSync(file, "utf8");
    const deps: string[] = [];
    for (const m of src.matchAll(SPEC)) {
      const target = resolveLocal(file, m[1] ?? m[2]);
      if (target) deps.push(target);
    }
    graph.set(file, deps);
  }
  return graph;
}

/** Every elementary cycle, as readable src-relative paths. */
function findCycles(graph: Map<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const state = new Map<string, 0 | 1 | 2>(); // 0 unseen, 1 on stack, 2 done
  const stack: string[] = [];
  const visit = (node: string) => {
    state.set(node, 1);
    stack.push(node);
    for (const dep of graph.get(node) ?? []) {
      const s = state.get(dep) ?? 0;
      if (s === 1) cycles.push([...stack.slice(stack.indexOf(dep)), dep].map((f) => path.relative(SRC, f)));
      else if (s === 0) visit(dep);
    }
    stack.pop();
    state.set(node, 2);
  };
  for (const node of graph.keys()) if ((state.get(node) ?? 0) === 0) visit(node);
  return cycles;
}

/**
 * Cycles that PRE-DATE the odontogram.ts split. All three are runtime (value)
 * imports through the perio modules, which reach back into the engine for the
 * active anatomy profile, the index-name mode and the export entry point. They
 * work today only because none of those values is read at module-eval time —
 * fragile, but out of scope for the split. Frozen here so no NEW cycle can
 * appear; shrinking this list is a welcome separate change.
 */
const KNOWN_CYCLES = [
  "odontogram.ts -> perioExport.ts -> odontogram.ts",
  "odontogram.ts -> perioExport.ts -> perioGraphic.ts -> odontogram.ts",
  "odontogram.ts -> perioExport.ts -> perioIndexNames.ts -> odontogram.ts",
];

describe("module graph", () => {
  it("introduces no NEW circular import in src/", () => {
    const graph = buildGraph();
    expect(graph.size).toBeGreaterThan(40); // the walk actually found the tree
    const found = [...new Set(findCycles(graph).map((c) => c.join(" -> ")))].sort();
    expect(found).toEqual([...KNOWN_CYCLES].sort());
  });

  it("the modules extracted from odontogram.ts never import it back", () => {
    const engine = path.join(SRC, "odontogram.ts");
    const graph = buildGraph();
    for (const mod of ["state/notify.ts", "state/caseMeta.ts", "state/payload.ts", "state/chart.ts", "anatomy/profiles.ts"]) {
      const file = path.join(SRC, mod);
      expect(existsSync(file), `${mod} is missing`).toBe(true);
      expect(graph.get(file), `${mod} imports odontogram.ts — use an injected hook instead`).not.toContain(engine);
    }
  });
});
