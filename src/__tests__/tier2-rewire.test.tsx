// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Composable-UI Tier 2: control wiring is re-runnable / idempotent, so a surface
// can UNMOUNT and REMOUNT (the three former hide-instead-of-unmount workarounds
// are gone). These tests exercise the REAL engine wiring — initOdontogram /
// destroyOdontogram / buildGrid are NOT mocked (buildGrid runs under jsdom; the
// SVG templates are `?raw`-inlined and parsed via DOMParser), because verifying
// that re-wiring binds fresh nodes exactly once, without double-binding
// still-mounted nodes, IS the point of the tier.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, waitFor, act } from "@testing-library/react";
import App, {
  OdontogramProvider,
  OdontogramChartSurface,
  ToothControlsSurface,
  useOdontogramUi,
  type OdontogramUiContextValue,
} from "../App";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  setPerioViewMode,
  onStateChange,
  getStatusChart,
  getChartMode,
  initOdontogram,
  destroyOdontogram,
} from "../odontogram";

// Real initOdontogram()/buildGrid() runs are heavy under jsdom, and several
// cases build the grid two or three times (round-trips / re-init); give the
// whole file generous headroom over the 5s default.
vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

// jsdom lacks matchMedia (isTouchDevice) and ResizeObserver (bridge-overlay /
// perio fill-scale); stub both so a REAL initOdontogram()/buildGrid() runs
// cleanly without unhandled rejections.
function installDomStubs() {
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  })) as unknown as typeof window.matchMedia;
  if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === "undefined") {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
}

beforeEach(() => {
  installDomStubs();
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setPerioViewMode("toggle");
  setNumberingSystem("FDI");
});

afterEach(() => {
  cleanup();
});

/** Wait until the SVG tooth grid has been (re)built into #toothGrid. */
async function waitForGrid() {
  await waitFor(() => {
    const grid = document.getElementById("toothGrid");
    expect(grid && grid.childElementCount).toBeGreaterThan(0);
  });
}

/** Side-view clickable tile for a given FDI tooth. */
function tile(toothNo: number): HTMLElement {
  return document.querySelector(`.tooth-tile.side-view[data-tooth="${toothNo}"]`) as HTMLElement;
}

/** Round-trip the perio (Dental Chart) view toggle and back, awaiting the
 *  odontogram column's remount + grid rebuild. */
async function perioRoundTrip() {
  fireEvent.click(document.getElementById("appViewDentalChart")!);
  await waitFor(() => expect(document.getElementById("caseMetaPanel")).toBeTruthy());
  fireEvent.click(document.getElementById("appViewOdontogram")!);
  await waitForGrid();
}

/** Count state-change notifications fired synchronously by `action`. A
 *  double-bound handler runs twice → doubles the count. */
function notifiesFor(action: () => void): number {
  const spy = vi.fn();
  const unsub = onStateChange(spy);
  action();
  unsub();
  return spy.mock.calls.length;
}

describe("Tier 2: re-runnable wiring survives a perio round-trip", () => {
  it("a #toothSelect change still applies after flipping to Periodontal and back", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    await perioRoundTrip();

    // Select a tooth on the freshly-remounted grid and edit it.
    fireEvent.click(tile(16));
    const toothSelect = document.getElementById("toothSelect") as HTMLSelectElement;
    expect(toothSelect).toBeTruthy();
    toothSelect.value = "implant";
    fireEvent.change(toothSelect);

    expect(getStatusChart().teeth[16].toothSelection).toBe("implant");
  });

  it("does not double-bind #toothSelect across a round-trip (relative-count probe)", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    fireEvent.click(tile(16));
    const before = document.getElementById("toothSelect") as HTMLSelectElement;
    before.value = "implant";
    const baseline = notifiesFor(() => fireEvent.change(before));
    expect(baseline).toBeGreaterThan(0);

    await perioRoundTrip();

    // Selection is preserved across the rebuild; the select is a fresh node.
    const after = document.getElementById("toothSelect") as HTMLSelectElement;
    after.value = "implant";
    const afterCount = notifiesFor(() => fireEvent.change(after));

    // A handler double-bound onto a fresh node would fire twice → 2×baseline.
    expect(afterCount).toBe(baseline);
  });

  it("swaps the odontogram controls for the perio sidebar and back; #restorationSelect still applies", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    // Odontogram view: controls present, perio sidebar absent.
    expect(document.querySelector(".panel-odontogram-controls")).toBeTruthy();
    expect(document.getElementById("caseMetaPanel")).toBeNull();

    fireEvent.click(document.getElementById("appViewDentalChart")!);
    await waitFor(() => expect(document.getElementById("caseMetaPanel")).toBeTruthy());
    // Perio view: sidebar present, odontogram controls unmounted.
    expect(document.querySelector(".panel-odontogram-controls")).toBeNull();

    fireEvent.click(document.getElementById("appViewOdontogram")!);
    await waitForGrid();
    expect(document.querySelector(".panel-odontogram-controls")).toBeTruthy();
    expect(document.getElementById("caseMetaPanel")).toBeNull();

    // The remounted restoration control still writes state.
    fireEvent.click(tile(16));
    const restoration = document.getElementById("restorationSelect") as HTMLSelectElement;
    const crownOpt = Array.from(restoration.options).find((o) => o.value.startsWith("crown|"));
    expect(crownOpt).toBeTruthy();
    restoration.value = crownOpt!.value;
    fireEvent.change(restoration);

    expect(getStatusChart().teeth[16].restorationType).toBe("crown");
  });

  it("rebuilds the grid on the chart-column remount, preserving the active selection", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    fireEvent.click(tile(16));
    expect(tile(16).classList.contains("active")).toBe(true);

    await perioRoundTrip();

    // Grid rebuilt with children; pre-toggle selection preserved.
    expect(document.getElementById("toothGrid")!.childElementCount).toBeGreaterThan(0);
    expect(tile(16).classList.contains("active")).toBe(true);

    // A fresh tooth click still selects on the rebuilt grid.
    fireEvent.click(tile(13));
    expect(tile(13).classList.contains("active")).toBe(true);
    expect(tile(16).classList.contains("active")).toBe(false);
  });
});

describe("Tier 2: #chartModeToggle remount (planModeAvailable flip)", () => {
  // A tiny composition that captures the provider context so the test can flip
  // `planModeAvailable` the same way Settings does, driving the conditional
  // mount of #chartModeToggle inside OdontogramChartSurface.
  let ctx: OdontogramUiContextValue | null = null;
  function Capture() {
    ctx = useOdontogramUi();
    return null;
  }
  function Harness() {
    return createElement(
      OdontogramProvider,
      { language: "en" },
      createElement(OdontogramChartSurface),
      createElement(ToothControlsSurface),
      createElement(Capture),
    );
  }

  it("unmounts then remounts the Status|Plan toggle, and its buttons re-wire", async () => {
    ctx = null;
    render(createElement(Harness));
    await waitForGrid();

    expect(document.getElementById("chartModeToggle")).toBeTruthy();

    act(() => ctx!.settingsState.onPlanModeAvailable(false));
    expect(document.getElementById("chartModeToggle")).toBeNull();

    act(() => ctx!.settingsState.onPlanModeAvailable(true));
    expect(document.getElementById("chartModeToggle")).toBeTruthy();

    // The remounted (fresh) Plan button is wired: clicking it switches mode.
    fireEvent.click(document.getElementById("chartModePlan")!);
    expect(getChartMode()).toBe("plan");
  });
});

describe("Tier 2: module-level init -> destroy -> init over persistent DOM", () => {
  it("a persistent control node's handler applies exactly once (no stale double-bind)", async () => {
    render(createElement(App, { language: "en" }));
    await waitForGrid();

    // Baseline on the original wiring.
    fireEvent.click(tile(16));
    const sel = document.getElementById("toothSelect") as HTMLSelectElement;
    sel.value = "implant";
    const baseline = notifiesFor(() => fireEvent.change(sel));
    expect(baseline).toBeGreaterThan(0);

    // Tear the engine down and re-init while the JSX control nodes persist in
    // the DOM (React never unmounted them). bindOnce's per-element marks survive,
    // so wireControls() must NOT re-bind the already-wired persistent nodes.
    act(() => {
      destroyOdontogram();
    });
    await act(async () => {
      await initOdontogram();
    });
    await waitForGrid();

    fireEvent.click(tile(16));
    const sel2 = document.getElementById("toothSelect") as HTMLSelectElement;
    sel2.value = "implant";
    const afterCount = notifiesFor(() => fireEvent.change(sel2));

    expect(afterCount).toBe(baseline);
    expect(getStatusChart().teeth[16].toothSelection).toBe("implant");
  });
});
