// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-A Task 3: the `Status | Plan` chart-mode toggle UI. Tasks 1-2 (committed)
// added the dual-chart core (charts.status/charts.plan, chartMode,
// getChartMode()/setChartMode()) and a private no-op syncChartModeUi() seam
// that setChartMode() already calls. This task builds the actual toggle
// control in the chart card's own header (App.tsx) — separate from BOTH the
// topbar and the right Controls panel — wires #chartModeStatus/#chartModePlan
// via wireControls() (odontogram.ts), and implements syncChartModeUi() for
// real: `.is-active` on the two buttons, `.plan-mode` on the chart card
// (`.chart`), and the "TERV/PLAN" badge's `.hidden` class.
//
// Two harnesses, mirroring the established split in this test suite (see
// sp14-ortho-ui.test.ts):
//   1. JSX-structure placement — no full-DOM initOdontogram() mount harness
//      exists for the tooth panel (odontogram.ts's DOM logic is imperative
//      and requires a fully-wired shell with real SVG assets), so <App/> is
//      rendered with the heavy engine lifecycle (initOdontogram et al.)
//      mocked out, same list as sp14-ortho-ui.test.ts, to prove #chartModeToggle
//      lives inside .chart-header and NOT inside .topbar or the right
//      aside.panel Controls panel.
//   2. Real click-wiring behavior — setChartMode/getChartMode/
//      __resetChartStateForTest are forwarded from the REAL module (not
//      re-implemented), so calling them exercises the actual private
//      syncChartModeUi() the production wireControls() click handlers invoke.
//      This runs against a hand-built DOM fixture mirroring App.tsx's real
//      markup (#chartModeStatus/#chartModePlan buttons, a `.chart` card,
//      `#chartModePlanBadge`) with the SAME click-listener contract
//      wireControls() installs (mirrors the "reproduces the production
//      change-listener contract" pattern in sp13-tooth-details.test.ts).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { setChartMode, getChartMode, __resetChartStateForTest } from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
    rewireControls: vi.fn(),
    // Composable-UI Tier 3: OrthodonticsCard reads these engine exports.
    getActiveOrtho: actual.getActiveOrtho,
    getActiveCaries: actual.getActiveCaries,
    getCariesDepthOptions: actual.getCariesDepthOptions,
    rootCariesOptions: actual.rootCariesOptions,
    setCariesSurfaceForSelection: actual.setCariesSurfaceForSelection,
    setCariesActiveDepthForSelection: actual.setCariesActiveDepthForSelection,
    setRootCariesForSelection: actual.setRootCariesForSelection,
    openCariesDepthPopup: actual.openCariesDepthPopup,
    getActiveFillings: actual.getActiveFillings,
    setFillingMaterialForSelection: actual.setFillingMaterialForSelection,
    setFillingSurfaceForSelection: actual.setFillingSurfaceForSelection,
    setFillingSimpleToggleForSelection: actual.setFillingSimpleToggleForSelection,
    setFillingSimpleDefectForSelection: actual.setFillingSimpleDefectForSelection,
    setFissureSealingForSelection: actual.setFissureSealingForSelection,
    openFillingDefectPopup: actual.openFillingDefectPopup,
    getActiveRootPerio: actual.getActiveRootPerio,
    setPulpEndoForSelection: actual.setPulpEndoForSelection,
    setApicalDxForSelection: actual.setApicalDxForSelection,
    setPeriapicalTypeForSelection: actual.setPeriapicalTypeForSelection,
    setResorptionForSelection: actual.setResorptionForSelection,
    setEndoResectionForSelection: actual.setEndoResectionForSelection,
    setParapulpalPinForSelection: actual.setParapulpalPinForSelection,
    setMobilityForSelection: actual.setMobilityForSelection,
    setModForSelection: actual.setModForSelection,
    setCalculusForSelection: actual.setCalculusForSelection,
    setPeriImplantForSelection: actual.setPeriImplantForSelection,
    getActiveToothDetails: actual.getActiveToothDetails,
    setToothSelectionForSelection: actual.setToothSelectionForSelection,
    setSubstrateForSelection: actual.setSubstrateForSelection,
    setRestorationForSelection: actual.setRestorationForSelection,
    setExtractionWoundForSelection: actual.setExtractionWoundForSelection,
    setExtractionPlanForSelection: actual.setExtractionPlanForSelection,
    setMissingClosedForSelection: actual.setMissingClosedForSelection,
    setCrownLeakageForSelection: actual.setCrownLeakageForSelection,
    setBrokenMesialForSelection: actual.setBrokenMesialForSelection,
    setBrokenIncisalForSelection: actual.setBrokenIncisalForSelection,
    setBrokenDistalForSelection: actual.setBrokenDistalForSelection,
    setContactMesialForSelection: actual.setContactMesialForSelection,
    setContactDistalForSelection: actual.setContactDistalForSelection,
    setWearEdgeForSelection: actual.setWearEdgeForSelection,
    setWearCervicalForSelection: actual.setWearCervicalForSelection,
    setWearEdgeToggleForSelection: actual.setWearEdgeToggleForSelection,
    setWearCervicalToggleForSelection: actual.setWearCervicalToggleForSelection,
    setDiscolorationForSelection: actual.setDiscolorationForSelection,
    setDiscolorationToggleForSelection: actual.setDiscolorationToggleForSelection,
    setBridgePillarForSelection: actual.setBridgePillarForSelection,
    setCrownReplaceForSelection: actual.setCrownReplaceForSelection,
    setCrownNeededForSelection: actual.setCrownNeededForSelection,
    resetTooth: actual.resetTooth,
    getEdentulous: actual.getEdentulous,
    setEdentulous: actual.setEdentulous,
    resetMouth: actual.resetMouth,
    applyPrimaryDentition: actual.applyPrimaryDentition,
    applyMixedDentition: actual.applyMixedDentition,
    getStatusExtras: actual.getStatusExtras,
    applyStatusExtra: actual.applyStatusExtra,
    getOrthoApplianceOptions: actual.getOrthoApplianceOptions,
    getOrthoDriftOptions: actual.getOrthoDriftOptions,
    getOrthoVerticalOptions: actual.getOrthoVerticalOptions,
    setOrthoApplianceForSelection: actual.setOrthoApplianceForSelection,
    setOrthoDriftForSelection: actual.setOrthoDriftForSelection,
    setOrthoVerticalForSelection: actual.setOrthoVerticalForSelection,
    setOrthoRotationForSelection: actual.setOrthoRotationForSelection,
    rebuildGrid: vi.fn().mockResolvedValue(undefined),
    setNumberingSystem: vi.fn(),
    clearSelection: vi.fn(),
    setOcclusalVisible: vi.fn(),
    setWisdomVisible: vi.fn(),
    setShowBase: vi.fn(),
    setHealthyPulpVisible: vi.fn(),
    registerPlugins: vi.fn(),
    setPluginState: vi.fn(),
    getPluginState: vi.fn(),
    getToothStateSummary: vi.fn().mockReturnValue([]),
    setReadOnly: vi.fn(),
    getReadOnly: vi.fn().mockReturnValue(false),
    setNotesEnabled: vi.fn(),
    getNotesEnabled: vi.fn().mockReturnValue(false),
    setIcdasEnabled: vi.fn(),
    getIcdasEnabled: vi.fn().mockReturnValue(false),
    setPulpDetailLevel: vi.fn(),
    getPulpDetailLevel: vi.fn().mockReturnValue("aae"),
    setSecondaryCariesMode: vi.fn(),
    getSecondaryCariesMode: vi.fn().mockReturnValue("standard"),
    setRootCariesMode: vi.fn(),
    getRootCariesMode: vi.fn().mockReturnValue("simple"),
    setRadiographicDepthMode: vi.fn(),
    getRadiographicDepthMode: vi.fn().mockReturnValue("off"),
    setCariesDepthEnabled: vi.fn(),
    getCariesDepthEnabled: vi.fn().mockReturnValue(true),
    setWearDetailLevel: vi.fn(),
    getWearDetailLevel: vi.fn().mockReturnValue("complex"),
    setDiscolorationDetailLevel: vi.fn(),
    getDiscolorationDetailLevel: vi.fn().mockReturnValue("complex"),
    setSurfaceNotation: vi.fn(),
    getSurfaceNotation: vi.fn().mockReturnValue("full"),
    hasAnyPerioData: vi.fn().mockReturnValue(false),
    getCaseMeta: actual.getCaseMeta,
    setPatientName: actual.setPatientName,
    setExamDate: actual.setExamDate,
    exportPdf: vi.fn().mockResolvedValue(undefined),
    getOdontogramSummary: vi.fn().mockReturnValue({
      overview: "", permanentList: null, missingList: null,
      sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: "", periodontalText: "",
    }),
    onStateChange: vi.fn().mockReturnValue(() => {}),
    openPerioOverlay: vi.fn(),
    closePerioOverlay: vi.fn(),
    isPerioOverlayOpen: vi.fn().mockReturnValue(false),
    getPerioViewMode: vi.fn().mockReturnValue("toggle"),
    getDiagnosisCodingPack: vi.fn().mockReturnValue("none"),
    getFillingDefectEnabled: vi.fn().mockReturnValue(true),
    setFillingDefectEnabled: vi.fn(),
    getFillingComplexity: vi.fn().mockReturnValue("complex"),
    setFillingComplexity: vi.fn(),
    getFissureSealingEnabled: vi.fn().mockReturnValue(true),
    setFissureSealingEnabled: vi.fn(),
    getFillingMaterialAvailability: vi.fn().mockReturnValue({ amalgam: true, composite: true, gic: true, temporary: true }),
    setFillingMaterialAvailability: vi.fn(),
    setPerioViewMode: vi.fn(),
    setDiagnosisCodingPack: vi.fn(),
    getToothAnatomy: vi.fn().mockReturnValue("classic"),
    setToothAnatomy: vi.fn(),
    getPerioRowVisibility: vi.fn().mockReturnValue({
      plaque: true, bop: true, cal: true, gm: true, pd: true, furcation: true,
      mobility: true, cej: true, rootConcavity: true, pi: true, gi: true,
      mpi: true, mbi: true, kg: true, gt: true, miller: true,
    }),
    setPerioRowVisibility: vi.fn(),
    getPerioIndexNameMode: vi.fn().mockReturnValue("translated"),
    setPerioIndexNameMode: vi.fn(),
    getPdfSettings: vi.fn().mockReturnValue({ defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true }),
    setPdfSettings: vi.fn(),
    isDualStateConfirmPending: vi.fn().mockReturnValue(false),
    acceptDualStateConfirm: vi.fn(),
    cancelDualStateConfirm: vi.fn(),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    setChartMode: actual.setChartMode,
    getChartMode: actual.getChartMode,
    __resetChartStateForTest: actual.__resetChartStateForTest,
  };
});

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
});

describe("R2-A Task 3: #chartModeToggle placement (chart-header, not topbar, not the Controls panel)", () => {
  it("#chartModeToggle exists inside .chart-header with a Status and a Plan segment", () => {
    render(createElement(App));
    const toggle = document.querySelector(".chart-header #chartModeToggle");
    expect(toggle).toBeTruthy();
    const statusBtn = document.querySelector(".chart-header #chartModeToggle #chartModeStatus");
    const planBtn = document.querySelector(".chart-header #chartModeToggle #chartModePlan");
    expect(statusBtn).toBeTruthy();
    expect(planBtn).toBeTruthy();
  });

  it("is NOT inside the topbar", () => {
    render(createElement(App));
    expect(document.querySelector(".topbar #chartModeToggle")).toBeFalsy();
  });

  it("is NOT inside the right Controls panel (aside.panel)", () => {
    render(createElement(App));
    expect(document.querySelector("aside.panel #chartModeToggle")).toBeFalsy();
  });

  it("is distinct from the existing chart-actions (tooth-type icon buttons)", () => {
    render(createElement(App));
    expect(document.querySelector(".chart-actions #chartModeToggle")).toBeFalsy();
    expect(document.querySelector(".chart-actions #chartModeStatus")).toBeFalsy();
  });

  it("Status starts as the active segment (initial mode)", () => {
    render(createElement(App));
    const statusBtn = document.querySelector("#chartModeStatus") as HTMLElement;
    const planBtn = document.querySelector("#chartModePlan") as HTMLElement;
    expect(statusBtn.classList.contains("is-active")).toBe(true);
    expect(planBtn.classList.contains("is-active")).toBe(false);
  });
});

describe("R2-A Task 3: real click wiring (setChartMode + syncChartModeUi via a production-shaped DOM fixture)", () => {
  /** Mirrors App.tsx's real chart-header/chart-card markup closely enough for
   *  the REAL, private syncChartModeUi() (invoked inside the real, forwarded
   *  setChartMode()) to find every element it queries by id/class. */
  function mountChartModeFixture(): { chartCard: HTMLElement; statusBtn: HTMLButtonElement; planBtn: HTMLButtonElement; badge: HTMLElement } {
    document.body.innerHTML = `
      <section class="chart">
        <div class="chart-header">
          <div id="chartModeToggle" class="chart-mode-toggle" role="tablist">
            <button id="chartModeStatus" type="button" class="chart-mode-btn is-active" role="tab" aria-selected="true">Status</button>
            <button id="chartModePlan" type="button" class="chart-mode-btn" role="tab" aria-selected="false">Plan</button>
            <span id="chartModePlanBadge" class="plan-badge hidden">PLAN</span>
          </div>
        </div>
      </section>
    `;
    const chartCard = document.querySelector(".chart") as HTMLElement;
    const statusBtn = document.getElementById("chartModeStatus") as HTMLButtonElement;
    const planBtn = document.getElementById("chartModePlan") as HTMLButtonElement;
    const badge = document.getElementById("chartModePlanBadge") as HTMLElement;
    // Reproduces the exact click-listener contract wireControls() installs
    // (`$("#chartModeStatus").addEventListener("click", ()=>setChartMode("status"))`
    // + the Plan counterpart).
    statusBtn.addEventListener("click", () => setChartMode("status"));
    planBtn.addEventListener("click", () => setChartMode("plan"));
    return { chartCard, statusBtn, planBtn, badge };
  }

  it("clicking Plan switches mode, activates the Plan segment, and cues the chart card", () => {
    const { chartCard, statusBtn, planBtn, badge } = mountChartModeFixture();
    expect(getChartMode()).toBe("status");

    planBtn.click();

    expect(getChartMode()).toBe("plan");
    expect(planBtn.classList.contains("is-active")).toBe(true);
    expect(statusBtn.classList.contains("is-active")).toBe(false);
    expect(chartCard.classList.contains("plan-mode")).toBe(true);
    expect(badge.classList.contains("hidden")).toBe(false);
  });

  it("clicking Status reverts mode, re-activates Status, and clears the cue", () => {
    const { chartCard, statusBtn, planBtn, badge } = mountChartModeFixture();
    planBtn.click();
    expect(getChartMode()).toBe("plan");

    statusBtn.click();

    expect(getChartMode()).toBe("status");
    expect(statusBtn.classList.contains("is-active")).toBe(true);
    expect(planBtn.classList.contains("is-active")).toBe(false);
    expect(chartCard.classList.contains("plan-mode")).toBe(false);
    expect(badge.classList.contains("hidden")).toBe(true);
  });

  it("clicking the already-active segment is a no-op (mode/classes unchanged)", () => {
    const { chartCard, statusBtn, badge } = mountChartModeFixture();
    statusBtn.click();
    expect(getChartMode()).toBe("status");
    expect(statusBtn.classList.contains("is-active")).toBe(true);
    expect(chartCard.classList.contains("plan-mode")).toBe(false);
    expect(badge.classList.contains("hidden")).toBe(true);
  });

  it("setChartMode() with no chart-mode DOM mounted at all does not throw (null-safe syncChartModeUi)", () => {
    document.body.innerHTML = "";
    expect(() => setChartMode("plan")).not.toThrow();
    expect(getChartMode()).toBe("plan");
    setChartMode("status");
  });
});
