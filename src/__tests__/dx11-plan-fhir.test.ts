// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// DX-11 — the plan chart as FHIR. The export was status-only: what the mouth
// IS. What is going to be DONE to it never left the engine, which is the half a
// receiving system most wants.
import { describe, it, expect, beforeEach } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { PLAN_SERVICE_AXES } from "../fhir/toFhirPlan";
import { LOCAL_SYSTEM, FDI_SYSTEM } from "../fhir/codesystems";
import {
  __resetChartStateForTest, importStatus, exportFhir, setChartMode,
  setToothSelectionForSelection, __setSelectionForTest,
} from "../odontogram";

type Any = Record<string, unknown>;
const payload = (teeth: Any, plan?: Any) => ({ version: "2.22", globals: {}, teeth, ...(plan ? { plan } : {}) });

const requests = (bundle: unknown): Any[] =>
  (((bundle as Any)?.entry as Any[]) ?? []).map((e) => e.resource as Any).filter((r) => r?.resourceType === "ServiceRequest");

const localCode = (r: Any): string | undefined =>
  ((r.code as Any)?.coding as Any[])?.find((c) => c.system === LOCAL_SYSTEM)?.code as string | undefined;

describe("DX-11: a status-only export is unchanged", () => {
  it("emits no ServiceRequest when there is no plan", () => {
    const b = buildFhirBundle(payload({ "16": { toothSelection: "tooth-base", caries: ["caries-occlusal"] } }));
    expect(requests(b)).toEqual([]);
  });

  it("emits none when the plan matches the status chart", () => {
    const teeth = { "16": { toothSelection: "tooth-base" } };
    expect(requests(buildFhirBundle(payload(teeth, structuredClone(teeth))))).toEqual([]);
  });
});

describe("DX-11: a planned intervention becomes a ServiceRequest", () => {
  it("a planned extraction, coded as the intended state with the tooth as body site", () => {
    const b = buildFhirBundle(payload(
      { "16": { toothSelection: "tooth-base" } },
      { "16": { toothSelection: "no-tooth-after-extraction" } },
    ));
    const [sr] = requests(b);
    expect(sr).toMatchObject({ resourceType: "ServiceRequest", status: "active", intent: "plan" });
    expect(localCode(sr)).toBe("no-tooth-after-extraction");
    expect(((sr.bodySite as Any[])[0].coding as Any[])[0]).toMatchObject({ system: FDI_SYSTEM, code: "16" });
    expect((sr.note as Any[])[0].text).toMatch(/→/);
    expect(sr.subject).toBeTruthy();
  });

  it("a crown to be made emits both what and what of", () => {
    const b = buildFhirBundle(payload(
      { "16": { toothSelection: "tooth-base" } },
      { "16": { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" } },
    ));
    expect(requests(b).map(localCode).sort()).toEqual(["crown", "zircon"]);
  });

  it("a plan flag that is raised is a request; one that is withdrawn is not", () => {
    const raised = buildFhirBundle(payload(
      { "16": { toothSelection: "tooth-base" } },
      { "16": { toothSelection: "tooth-base", crownNeeded: true } },
    ));
    expect(requests(raised).map(localCode)).toEqual(["crown-needed"]);

    const withdrawn = buildFhirBundle(payload(
      { "16": { toothSelection: "tooth-base", crownNeeded: true } },
      { "16": { toothSelection: "tooth-base" } },
    ));
    expect(requests(withdrawn)).toEqual([]);
  });

  it("a milk tooth is requested under its ISO 3950 code, like every other body site", () => {
    const b = buildFhirBundle(payload(
      { "55": { toothSelection: "milktooth" }, "15": { toothSelection: "milktooth" } },
      { "15": { toothSelection: "milktooth", restorationType: "crown" } },
    ));
    const [sr] = requests(b);
    expect(((sr.bodySite as Any[])[0].coding as Any[])[0].code).toBe("55");
  });

  it("ids and fullUrls are deterministic and unique", () => {
    const p = payload(
      { "16": { toothSelection: "tooth-base" }, "26": { toothSelection: "tooth-base" } },
      { "16": { toothSelection: "implant" }, "26": { toothSelection: "tooth-base", restorationType: "crown" } },
    );
    const a = buildFhirBundle(p), b = buildFhirBundle(structuredClone(p));
    expect(JSON.stringify(requests(a))).toBe(JSON.stringify(requests(b)));
    const ids = requests(a).map((r) => r.id as string);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("odontogram-plan-toothSelection-16");
  });
});

describe("DX-11: findings and outcomes are NOT services", () => {
  it("a planned difference outside the intervention axes emits nothing", () => {
    // The pulp being normal again, or a pocket that shrank, is an OUTCOME of
    // treatment — a ServiceRequest asking for "pulp: normal" would be nonsense.
    const b = buildFhirBundle(payload(
      { "16": { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis", mobility: "m2" } },
      { "16": { toothSelection: "tooth-base", pulpDx: "normal", mobility: "none" } },
    ));
    expect(requests(b)).toEqual([]);
    expect(PLAN_SERVICE_AXES).not.toContain("pulpDx");
    expect(PLAN_SERVICE_AXES).not.toContain("mobility");
  });

  it("every listed axis is a real registry axis", async () => {
    const { AXES } = await import("../registry/axes");
    const ids = new Set(AXES.map((a) => a.id));
    expect(PLAN_SERVICE_AXES.filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe("DX-11: through the live engine", () => {
  beforeEach(() => __resetChartStateForTest());

  it("planning an extraction in Plan mode reaches the exported bundle", () => {
    importStatus(payload({ "16": { toothSelection: "tooth-base" } }));
    setChartMode("plan");
    __setSelectionForTest([16]);
    setToothSelectionForSelection("no-tooth-after-extraction");
    const bundle = exportFhir();
    const codes = requests(bundle).map(localCode);
    expect(codes).toContain("no-tooth-after-extraction");
  });

  it("no plan, no ServiceRequests — the status export is untouched", () => {
    importStatus(payload({ "16": { toothSelection: "tooth-base" } }));
    expect(requests(exportFhir())).toEqual([]);
  });
});
