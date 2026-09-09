// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Issue #23 follow-up — the engine's own FHIR CodeSystem.
//
// Two-sided coverage guarantee:
//  * SOUNDNESS — a MAXIMAL export (every clinical axis/value from the registry,
//    the per-surface scalar findings, notes, a plugin custom state, a full
//    periodontal record with every index, a diseased case with smoking/HbA1c
//    evidence, lateralised case conditions, dx overrides, plus a separate
//    edentulous export) is walked deeply and EVERY `{system: LOCAL_SYSTEM, code}`
//    it emits must be a CodeSystem concept (only the documented open-ended
//    `custom-state:<pluginId>` is exempt).
//  * COMPLETENESS — every finding code in the axis registry, every value-map
//    code and every hand-emitted extra is present, codes are unique and sorted,
//    merged duplicates carry their alternative displays as designations.
// Plus: Bundle placement (after the Patient / first with a host subject), the
// `includeCodeSystem: false` opt-out, import neutrality (the importer ignores
// the CodeSystem entry), and freshness of the published
// `fhir/CodeSystem-odontogram.json` (`FHIR_CODESYSTEM_WRITE=1` (re)writes it —
// `npm run fhir:codesystem`).
import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  __resetChartStateForTest, importStatus, exportFhir, PERIO_SITES,
  setPerioSite, setFurcation, setPlaque, setPlaqueIndex, setGingivalIndex, setKeratinizedWidth,
  setGingivalThickness, setMillerClass, setCejVisibility, setRootConcavity,
  setPeriImplantPlaque, setPeriImplantBleeding,
  setCaseAge, setSmokingStatus, setHba1c, setMaxRblPercent, setToothLossPerio, setDiabetesStatus, setCaseCondition,
} from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";
import { buildOdontogramCodeSystem, buildOdontogramConcepts, EXTRA_LOCAL_CODES } from "../fhir/codeSystemResource";
import { LOCAL_SYSTEM, LOCAL_VALUE_MAPS } from "../fhir/codesystems";
import { AXES } from "../registry/axes";

const FILE = path.resolve(__dirname, "../../fhir/CodeSystem-odontogram.json");
/** FHIR `code` datatype: non-empty, no leading/trailing whitespace, no internal runs
 *  of whitespace. Colons are legal — the engine's qualifier codes (`perio-site:MB`,
 *  `laterality:left`, `custom-state:<id>`) have always used them. */
const validFhirCode = (c: string) => c.length > 0 && c.trim() === c && !/\s{2,}/.test(c);

/** Every `{system: LOCAL_SYSTEM, code}` anywhere in a value. */
function localCodes(x: unknown, acc = new Set<string>()): Set<string> {
  if (Array.isArray(x)) { for (const i of x) localCodes(i, acc); return acc; }
  if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (o.system === LOCAL_SYSTEM && typeof o.code === "string") acc.add(o.code);
    for (const v of Object.values(o)) localCodes(v, acc);
  }
  return acc;
}

const ALL_TEETH = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

/** A payload that spreads EVERY registry axis value over the 32 teeth (round-
 *  robin with a per-axis offset), plus the hand-shaped extras. Some values may
 *  not emit on a given tooth because of clinical gating — harmless for a
 *  soundness (⊆) check; completeness is asserted separately from the registry. */
function maximalPayload(): Record<string, unknown> {
  const teeth: Record<string, Record<string, unknown>> = {};
  for (const n of ALL_TEETH) teeth[String(n)] = {};
  AXES.forEach((axis, k) => {
    const vals = axis.values?.map((v) => v.id) ?? (axis.valueGroup ? Object.keys(LOCAL_VALUE_MAPS[axis.valueGroup] ?? {}) : []);
    ALL_TEETH.forEach((n, i) => {
      const rec = teeth[String(n)];
      if (axis.kind === "enum") { if (vals.length) rec[axis.field] = vals[(i + k) % vals.length]; }
      else if (axis.kind === "boolean") rec[axis.field] = true;
      else if (axis.kind === "set" || axis.kind === "surfaceSet") { if (vals.length) rec[axis.field] = vals; }
      // "restoration" / "derived" / "global" are shaped by hand below.
    });
  });
  // Anchor teeth: present + natural so tooth-level findings / perio setters apply.
  for (const n of [11, 16, 31, 41, 46]) { teeth[String(n)].toothSelection = "tooth-base"; teeth[String(n)].toothSubstrate = "natural"; }
  teeth["21"].toothSelection = "implant";
  const t11 = teeth["11"];
  t11.fillingSurfaceMaterials = { occlusal: "composite", mesial: "amalgam" }; // restoration axis
  t11.caries = ["caries-occlusal", "caries-mesial", "caries-distal"];
  t11.cariesSeverity = { occlusal: 3, mesial: 2, distal: 4 };               // occlusal/mesial filled -> CARS, distal -> ICDAS
  t11.radiographicDepth = { occlusal: "D1", mesial: "E2" };
  t11.fillingDefect = { occlusal: "marginal" };
  t11.note = "Maximal-export note";
  t11.customStates = { myPlugin: "x" };
  t11.dxOverrides = { pulpitis: "suppress", calculus: "add" };
  return {
    version: "2.22",
    globals: { edentulous: false },
    teeth,
    case: { caseConditions: { tmjDisorder: "right", odontogenicCyst: "bilateral", leukoplakia: "left", anodontia: "unspecified" } },
  };
}

/** Drive the live engine: import the maximal payload, then chart perio/index/case
 *  data through the REAL setters (their serialised shapes are then guaranteed). */
function maximalExport() {
  __resetChartStateForTest();
  importStatus(maximalPayload());
  for (const site of PERIO_SITES) setPerioSite(11, site, { pd: 5, gm: 2, bop: true, sup: true });
  for (const site of PERIO_SITES) setPerioSite(46, site, { pd: 6, gm: 1, bop: true, sup: false });
  setFurcation(16, "mesial", 2);
  setFurcation(46, "buccal", 3);
  setPlaque(11, "buccal", true);
  setPlaqueIndex(11, "mesial", 2);
  setGingivalIndex(11, "distal", 1);
  setKeratinizedWidth(11, 3);
  setGingivalThickness(11, "thin");
  setMillerClass(11, "ii");
  setCejVisibility(11, "detectable");
  setRootConcavity(11, "mild");
  setPeriImplantPlaque(21, "buccal", 2);
  setPeriImplantBleeding(21, "lingual", 1);
  setCaseAge(50); setSmokingStatus("current"); setDiabetesStatus("present"); setHba1c(7.8);
  setMaxRblPercent(40); setToothLossPerio(3);
  setCaseCondition("tmjDisorder", "right");
  return exportFhir() as unknown as { entry: { fullUrl?: string; resource: Record<string, unknown> }[] };
}

const CONCEPTS = buildOdontogramConcepts();
const CODES = new Set(CONCEPTS.map((c) => c.code));

describe("CodeSystem — completeness (registry / value maps / extras)", () => {
  it("contains every finding code of the clinical-axis registry", () => {
    for (const a of AXES) expect(CODES.has(a.finding.local), a.finding.local).toBe(true);
  });
  it("contains every LOCAL_VALUE_MAPS value code and every hand-emitted extra", () => {
    for (const entries of Object.values(LOCAL_VALUE_MAPS)) for (const e of Object.values(entries)) expect(CODES.has(e.code), e.code).toBe(true);
    for (const x of EXTRA_LOCAL_CODES) expect(CODES.has(x.code), x.code).toBe(true);
  });
  it("codes are unique, valid FHIR codes, and sorted; merged duplicates keep alternative displays as designations", () => {
    expect(new Set(CONCEPTS.map((c) => c.code)).size).toBe(CONCEPTS.length);
    for (const c of CONCEPTS) expect(validFhirCode(c.code), c.code).toBe(true);
    const sorted = [...CONCEPTS.map((c) => c.code)].sort((a, b) => a.localeCompare(b));
    expect(CONCEPTS.map((c) => c.code)).toEqual(sorted);
    // "temporary": fillingMaterial "Temporary filling" vs restorationMaterial "Temporary"
    const temporary = CONCEPTS.find((c) => c.code === "temporary")!;
    expect(temporary.designation?.length).toBeGreaterThanOrEqual(1);
    // "mesial": fillingSurfaces "Mesial surface" vs orthoDrift "Mesial drift"
    const mesial = CONCEPTS.find((c) => c.code === "mesial")!;
    expect(mesial.designation?.map((d) => d.value)).toContain("Mesial drift");
    // every display / designation is non-empty
    for (const c of CONCEPTS) { expect(c.display && c.display.length > 0).toBe(true); for (const d of c.designation ?? []) expect(d.value.length > 0).toBe(true); }
  });
  it("resource metadata: canonical url, complete content, count, version from the library", () => {
    const cs = buildOdontogramCodeSystem();
    expect(cs.resourceType).toBe("CodeSystem");
    expect(cs.id).toBe("odontogram");
    expect(cs.url).toBe(LOCAL_SYSTEM);
    expect(cs.status).toBe("active");
    expect(cs.content).toBe("complete");
    expect(cs.caseSensitive).toBe(true);
    expect(cs.count).toBe(cs.concept?.length);
    expect(cs.version).toBe(__APP_VERSION__);
    expect(cs.description).toContain("custom-state:<pluginId>");
  });
});

describe("CodeSystem — soundness against a MAXIMAL real export", () => {
  beforeEach(() => __resetChartStateForTest());

  it("every LOCAL_SYSTEM code the export emits is a CodeSystem concept (custom-state:* exempt)", () => {
    const bundle = maximalExport();
    const emitted = localCodes(bundle);
    // The export must have exercised a broad surface of the engine.
    expect(emitted.size).toBeGreaterThanOrEqual(30);
    // (`custom-state:<pluginId>` is the one documented, open-ended exemption — the
    // importer only keeps registered plugins, so it is not forced to appear here.)
    const missing = [...emitted].filter((c) => !c.startsWith("custom-state:") && !CODES.has(c));
    expect(missing, `emitted LOCAL_SYSTEM codes missing from the CodeSystem: ${missing.join(", ")}`).toEqual([]);
    // The diseased case really produced the periodontal Condition machinery.
    expect(emitted.has("periodontal-diagnosis:periodontitis")).toBe(true);
    expect([...emitted].some((c) => c.startsWith("stage-"))).toBe(true);
    expect([...emitted].some((c) => c.startsWith("perio-site:"))).toBe(true);
    expect([...emitted].some((c) => c.startsWith("furcation-entrance:"))).toBe(true);
    expect([...emitted].some((c) => c.startsWith("laterality:"))).toBe(true);
    expect(emitted.has("smoking-current")).toBe(true);
  });

  it("the whole-mouth edentulous code is covered too", () => {
    const b = buildFhirBundle({ version: "2.22", globals: { edentulous: true }, teeth: {} } as never);
    const emitted = localCodes(b);
    expect(emitted.has("edentulous")).toBe(true);
    for (const c of emitted) expect(CODES.has(c), c).toBe(true);
  });
});

describe("CodeSystem — Bundle embedding", () => {
  const payload = { version: "2.22", globals: {}, teeth: { "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] } } } as never;

  it("is embedded once, right after the placeholder Patient, with the canonical url as fullUrl", () => {
    const b: any = buildFhirBundle(payload);
    const idx = b.entry.map((e: any) => e.resource.resourceType).indexOf("CodeSystem");
    expect(idx).toBe(1);
    expect(b.entry[0].resource.resourceType).toBe("Patient");
    expect(b.entry.filter((e: any) => e.resource.resourceType === "CodeSystem")).toHaveLength(1);
    expect(b.entry[1].fullUrl).toBe(LOCAL_SYSTEM);
    expect(b.entry[1].resource.id).toBe("odontogram");
    expect(b.entry[1].resource.url).toBe(LOCAL_SYSTEM);
  });
  it("comes first when the host supplies its own subject (no placeholder Patient)", () => {
    const b: any = buildFhirBundle(payload, { subject: "Patient/abc" });
    expect(b.entry[0].resource.resourceType).toBe("CodeSystem");
  });
  it("is omitted with includeCodeSystem: false", () => {
    const b: any = buildFhirBundle(payload, { includeCodeSystem: false });
    expect(b.entry.some((e: any) => e.resource.resourceType === "CodeSystem")).toBe(false);
    expect(JSON.stringify(b)).not.toContain('"resourceType":"CodeSystem"');
  });
  it("the importer ignores it (same parsed payload with or without the CodeSystem)", () => {
    const withCs = buildFhirBundle(payload);
    const without = buildFhirBundle(payload, { includeCodeSystem: false });
    expect(parseFhirBundle(withCs)).toEqual(parseFhirBundle(without));
  });
});

describe("CodeSystem — published fhir/CodeSystem-odontogram.json stays in step", () => {
  it("matches the generator (run `npm run fhir:codesystem` to refresh)", () => {
    const generated = JSON.parse(JSON.stringify(buildOdontogramCodeSystem()));
    if (process.env.FHIR_CODESYSTEM_WRITE) {
      mkdirSync(path.dirname(FILE), { recursive: true });
      writeFileSync(FILE, JSON.stringify(generated, null, 2) + "\n", "utf8");
    }
    expect(existsSync(FILE), `missing ${FILE} — run: npm run fhir:codesystem`).toBe(true);
    const onDisk = JSON.parse(readFileSync(FILE, "utf8"));
    expect(onDisk).toEqual(generated);
  });
});
