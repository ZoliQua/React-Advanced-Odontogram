// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { svgCases, payloadCases } from "./parity/matrix";
import { __renderActiveLayers } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import { AXES } from "../registry/axes";
import { FIELD_MAPPINGS } from "../fhir/fieldMappings";
import { LOCAL_VALUE_MAPS } from "../fhir/codesystems";

// NOTE: `import.meta.url` is captured here (rather than passed inline as the
// second argument to `new URL(...)`) because Vite statically pattern-matches
// `new URL('literal', import.meta.url)` as its asset-URL syntax and rewrites
// it to a root-relative public path in this jsdom/SSR test context, which
// breaks fileURLToPath resolution. Capturing it in a variable first dodges
// that static rewrite while still resolving to the real file: URL at runtime.
const testFileUrl = import.meta.url;
const read = (name: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`./parity/${name}`, testFileUrl)), "utf8"));
const svgText = (name: string) => readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}.svg`, testFileUrl)), "utf8");

describe("SP2 parity oracle (current engine must match frozen goldens)", () => {
  // Generous timeout: rendering 500+ SVG fingerprints via jsdom parsing exceeds
  // vitest's default 5000ms in this environment (see parity/capture.test.ts).
  // Slow CI runners (GitHub Actions) can take ~50s where a dev machine takes
  // ~25s, so keep this well above the observed CI wall-clock.
  it("SVG fingerprints match", () => {
    const golden = read("svg-fingerprints.json");
    const cases = svgCases();
    expect(cases.length).toBe(golden.length);
    const texts: Record<string,string> = {};
    cases.forEach((c, i) => {
      texts[c.template] ??= svgText(c.template);
      const layers = __renderActiveLayers(texts[c.template], c.toothNo, c.state);
      expect(layers, `${golden[i].template} #${i}`).toEqual(golden[i].layers);
    });
  }, 120000);
  it("FHIR bundles match", () => {
    const golden = read("fhir-golden.json");
    payloadCases().forEach((p, i) => expect(buildFhirBundle(p.payload), p.name).toEqual(golden[i].bundle));
  });
  it("round-trips match", () => {
    const golden = read("roundtrip-golden.json");
    payloadCases().forEach((p, i) => expect(parseFhirBundle(buildFhirBundle(p.payload)), p.name).toEqual(golden[i].parsed));
  });
});

describe("registry catalog matches today's tables", () => {
  it("one axis per FIELD_MAPPINGS row with identical finding code + value group + skipValue", () => {
    expect(AXES.length).toBe(FIELD_MAPPINGS.length);
    for (const m of FIELD_MAPPINGS) {
      const ax = AXES.find(a => a.field === m.field);
      expect(ax, m.field).toBeTruthy();
      expect(ax!.finding.local).toBe(m.findingCode);
      expect(ax!.finding.display).toBe(m.findingDisplay);
      expect(ax!.kind).toBe(m.kind);
      if ("valueGroup" in m) expect(ax!.valueGroup).toBe((m as any).valueGroup);
      if ("skipValue" in m) expect(ax!.skipValue).toBe((m as any).skipValue);
      if ("surfacesField" in m) expect(ax!.surfacesField).toBe((m as any).surfacesField);
    }
  });
  it("enum/set/restoration axis values equal their LOCAL_VALUE_MAPS group exactly", () => {
    for (const ax of AXES) {
      if (!ax.valueGroup) continue;
      const expected = Object.values(LOCAL_VALUE_MAPS[ax.valueGroup]).map(e => e.code).sort();
      expect((ax.values ?? []).map(v => v.id).sort(), ax.id).toEqual(expected);
    }
  });
});
