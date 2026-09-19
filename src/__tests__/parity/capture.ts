// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// ONE-TIME capture of the pre-rewrite engine's behavior into frozen golden fixtures.
// Run via `npm run parity:capture`. DO NOT re-run after Stage 0 — later stages must
// MATCH these fixtures; re-capturing would make the oracle circular.
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { svgCases, payloadCases } from "./matrix";
import { __renderActiveLayers } from "../../odontogram";
import { buildFhirBundle } from "../../fhir/toFhir";
import { parseFhirBundle } from "../../fhir/fromFhir";

// NOTE: resolved via process.cwd() (the engine package root, since `npm run
// parity:capture` always runs from there), not import.meta.url — under this
// repo's vitest jsdom environment, import.meta.url for non-entry modules
// resolves to a fake http://localhost:3000/... origin rather than a real
// file:// path, which breaks fileURLToPath-based asset resolution.
const root = process.cwd();
const svgText = (name: string) => readFileSync(resolve(root, "src/assets/teeth-svgs", `${name}.svg`), "utf8");
const write = (name: string, data: unknown) => writeFileSync(resolve(root, "src/__tests__/parity", name), JSON.stringify(data, null, 2) + "\n");

export function runCapture() {
  const svgTexts: Record<string, string> = {};
  const svg = svgCases().map((c, i) => {
    svgTexts[c.template] ??= svgText(c.template);
    // __renderActiveLayers/hydrateState MUTATE the passed-in state object BY
    // REFERENCE. Clone twice: one clone is recorded as the golden `state`
    // (the INPUT, untouched), a SEPARATE clone is handed to the render seam
    // (free to be mutated) — so the recorded `state` never reflects
    // post-render mutation.
    const state = structuredClone(c.state);
    const layers = __renderActiveLayers(svgTexts[c.template], c.toothNo, structuredClone(c.state));
    return { i, template: c.template, toothNo: c.toothNo, view: c.view, state, layers };
  });
  write("svg-fingerprints.json", svg);

  const fhir = payloadCases().map(p => ({ name: p.name, bundle: buildFhirBundle(p.payload) }));
  write("fhir-golden.json", fhir);

  const roundtrip = payloadCases().map(p => ({ name: p.name, parsed: parseFhirBundle(buildFhirBundle(p.payload)) }));
  write("roundtrip-golden.json", roundtrip);

   
  console.log(`captured ${svg.length} svg fingerprints, ${fhir.length} fhir bundles, ${roundtrip.length} round-trips`);
}
