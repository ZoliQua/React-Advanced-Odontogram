// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP6 Task 3: root-caries severity opacity. The `caries-root` layer (wired in
// SP5 Task 2, root-caries-parity.test.ts) previously rendered at the SVG
// default (fully opaque) regardless of severity. This adds severity-based
// opacity — active:0.5, arrested:0.7, active-cavitated:1 — via the same
// `element.style.opacity` mechanism the caries-surface / subcaries opacity
// paths use (odontogram.ts ~1355). Also covers the simple-mode "present"
// canonicalization: the option now writes "active-cavitated" (most severe,
// full opacity) instead of the old literal "active".
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, rootCariesOptions, rootCariesDisplayValue, setRootCariesMode, getRootCariesMode } from "../odontogram";

const testFileUrl = import.meta.url;
const readSvg = (name: string) => readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}.svg`, testFileUrl)), "utf8");
const mainSvg = readSvg("11");
const renderMain = (state: Record<string, unknown>) => __renderActiveLayers(mainSvg, 11, state);

afterEach(() => {
  setRootCariesMode("simple");
});

describe("SP6 Task 3: caries-root severity opacity", () => {
  it("rootCaries:active -> caries-root opacity 0.5", () => {
    const layer = renderMain({ toothSelection: "tooth-base", rootCaries: "active" }).find(l => l.id === "caries-root");
    expect(layer).toBeTruthy();
    expect(layer!.opacity).toBe("0.5");
  });

  it("rootCaries:arrested -> caries-root opacity 0.7", () => {
    const layer = renderMain({ toothSelection: "tooth-base", rootCaries: "arrested" }).find(l => l.id === "caries-root");
    expect(layer).toBeTruthy();
    expect(layer!.opacity).toBe("0.7");
  });

  it("rootCaries:active-cavitated -> caries-root opacity 1", () => {
    const layer = renderMain({ toothSelection: "tooth-base", rootCaries: "active-cavitated" }).find(l => l.id === "caries-root");
    expect(layer).toBeTruthy();
    expect(layer!.opacity).toBe("1");
  });

  it("rootCaries:none -> caries-root not active at all (no opacity to check, regression control)", () => {
    const layer = renderMain({ toothSelection: "tooth-base", rootCaries: "none" }).find(l => l.id === "caries-root");
    expect(layer).toBeFalsy();
  });

  it("the present + view/tooth gates are unchanged: a missing tooth still does not activate caries-root", () => {
    const layer = renderMain({ toothSelection: "none", rootCaries: "active" }).find(l => l.id === "caries-root");
    expect(layer).toBeFalsy();
  });
});

describe("SP6 Task 3: simple-mode 'present' is stored canonically as active-cavitated", () => {
  it("rootCariesOptions('simple') writes 'active-cavitated' for the present option (not the old 'active')", () => {
    const opts = rootCariesOptions("simple");
    expect(opts.map(o => o.value)).toEqual(["none", "active-cavitated"]);
    const present = opts.find(o => o.value === "active-cavitated");
    expect(present).toBeTruthy();
  });

  it("rootCariesDisplayValue('simple', ...) matches the canonical write value, so the select's selected option always exists", () => {
    expect(rootCariesDisplayValue("simple", "active-cavitated")).toBe("active-cavitated");
    // Whatever severity value is stored, simple mode's display collapses to the
    // SAME value rootCariesOptions("simple") offers as "present" — so a <select>
    // built from rootCariesOptions("simple") always has a matching option.
    const simpleValues = new Set(rootCariesOptions("simple").map(o => o.value));
    expect(simpleValues.has(rootCariesDisplayValue("simple", "active"))).toBe(true);
    expect(simpleValues.has(rootCariesDisplayValue("simple", "arrested"))).toBe(true);
    expect(simpleValues.has(rootCariesDisplayValue("simple", "active-cavitated"))).toBe(true);
  });

  it("storing the canonical simple-mode 'present' value renders caries-root at full opacity (1)", () => {
    const opts = rootCariesOptions("simple");
    const presentValue = opts.find(o => o.value !== "none")!.value;
    expect(presentValue).toBe("active-cavitated");
    const layer = renderMain({ toothSelection: "tooth-base", rootCaries: presentValue }).find(l => l.id === "caries-root");
    expect(layer).toBeTruthy();
    expect(layer!.opacity).toBe("1");
  });

  it("severity mode is unaffected by the simple-mode canonicalization (round-trips every value verbatim)", () => {
    setRootCariesMode("severity");
    expect(getRootCariesMode()).toBe("severity");
    expect(rootCariesDisplayValue("severity", "active")).toBe("active");
    expect(rootCariesDisplayValue("severity", "arrested")).toBe("arrested");
    expect(rootCariesDisplayValue("severity", "active-cavitated")).toBe("active-cavitated");
  });
});
