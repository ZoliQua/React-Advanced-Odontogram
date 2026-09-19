// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Interop arc part C — ValueSets + the `fhir/` FHIR NPM package. Guards: every
// explicit ValueSet concept is a CodeSystem concept whose display matches the
// concept display or one of its designations; the group ValueSets together cover
// exactly the value-map codes; the finding-type ValueSet covers every registry
// finding; the package manifest and index are consistent and versioned with the
// library; and the committed files stay in step with the generators
// (`FHIR_CODESYSTEM_WRITE=1` — `npm run fhir:codesystem` — rewrites them).
import { describe, it, expect } from "vitest";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildFhirPackageFiles, buildGroupValueSets, buildFindingTypesValueSet, buildAllCodesValueSet, PACKAGE_NAME } from "../fhir/valueSetResources";
import { buildOdontogramCodeSystem } from "../fhir/codeSystemResource";
import { LOCAL_SYSTEM, LOCAL_VALUE_MAPS } from "../fhir/codesystems";
import { FHIR_BASE } from "../fhir/primitives";
import { AXES } from "../registry/axes";

const DIR = path.resolve(__dirname, "../../fhir");
const cs = buildOdontogramCodeSystem();
const byCode = new Map((cs.concept ?? []).map((c) => [c.code, c]));
const displaysOf = (code: string) => { const c = byCode.get(code)!; return new Set([c.display, ...(c.designation ?? []).map((d) => d.value)]); };

describe("ValueSets — content", () => {
  it("group ValueSets: every concept exists in the CodeSystem with a matching display/designation; together they cover the value maps exactly", () => {
    const groups = buildGroupValueSets();
    expect(groups.map((v) => v.id)).toEqual(Object.keys(LOCAL_VALUE_MAPS).map((g) => `odontogram-${g}`));
    const covered = new Set<string>();
    for (const vs of groups) {
      const inc = vs.compose!.include[0];
      expect(inc.system).toBe(LOCAL_SYSTEM);
      for (const c of inc.concept ?? []) {
        expect(byCode.has(c.code), `${vs.id}: ${c.code} not in CodeSystem`).toBe(true);
        expect(displaysOf(c.code).has(c.display!), `${vs.id}: display "${c.display}" of ${c.code} is neither the concept display nor a designation`).toBe(true);
        covered.add(c.code);
      }
      expect(vs.url).toBe(`${FHIR_BASE}/ValueSet/${vs.id}`);
      expect(vs.version).toBe(__APP_VERSION__);
    }
    const expected = new Set(Object.values(LOCAL_VALUE_MAPS).flatMap((g) => Object.values(g).map((e) => e.code)));
    expect(covered).toEqual(expected);
  });
  it("finding-types ValueSet covers every registry finding code and only CodeSystem concepts", () => {
    const vs = buildFindingTypesValueSet();
    const codes = new Set((vs.compose!.include[0].concept ?? []).map((c) => c.code));
    for (const a of AXES) expect(codes.has(a.finding.local), a.finding.local).toBe(true);
    for (const c of codes) expect(byCode.has(c), c).toBe(true);
    for (const c of ["edentulous", "radiographic-caries-depth", "filling-defect", "tooth-note"]) expect(codes.has(c)).toBe(true);
    expect(codes.size).toBe((vs.compose!.include[0].concept ?? []).length); // no duplicates
  });
  it("the all-codes ValueSet is an intensional include of the whole CodeSystem", () => {
    const vs = buildAllCodesValueSet();
    expect(vs.compose!.include).toEqual([{ system: LOCAL_SYSTEM }]);
    expect(vs.id).toBe("odontogram-all");
  });
});

describe("FHIR package — manifest, index, freshness of fhir/", () => {
  const files = JSON.parse(JSON.stringify(buildFhirPackageFiles())) as Record<string, any>;

  it("package.json and .index.json are consistent and versioned with the library", () => {
    const pkg = files["package.json"], idx = files[".index.json"];
    expect(pkg.name).toBe(PACKAGE_NAME);
    expect(pkg.version).toBe(__APP_VERSION__);
    expect(pkg.fhirVersions).toEqual(["4.0.1"]);
    expect(pkg.canonical).toBe(FHIR_BASE);
    expect(idx["index-version"]).toBe(1);
    const resourceFiles = Object.keys(files).filter((f) => f !== "package.json" && f !== ".index.json").sort();
    expect(idx.files.map((f: any) => f.filename).sort()).toEqual(resourceFiles);
    for (const f of idx.files) {
      const res = files[f.filename];
      expect(res.resourceType).toBe(f.resourceType);
      expect(res.id).toBe(f.id);
      expect(res.url).toBe(f.url);
      expect(res.version).toBe(__APP_VERSION__);
    }
    expect(idx.files.filter((f: any) => f.resourceType === "CodeSystem")).toHaveLength(1);
  });

  it("every committed fhir/ file matches the generators (run `npm run fhir:codesystem` to refresh)", () => {
    if (process.env.FHIR_CODESYSTEM_WRITE) {
      mkdirSync(DIR, { recursive: true });
      for (const [name, json] of Object.entries(files)) writeFileSync(path.join(DIR, name), JSON.stringify(json, null, 2) + "\n", "utf8");
    }
    for (const [name, json] of Object.entries(files)) {
      const p = path.join(DIR, name);
      expect(existsSync(p), `missing ${p} — run: npm run fhir:codesystem`).toBe(true);
      expect(JSON.parse(readFileSync(p, "utf8")), name).toEqual(json);
    }
  });
});
