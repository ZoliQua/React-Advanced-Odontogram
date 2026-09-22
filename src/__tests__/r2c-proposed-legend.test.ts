// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-C Task 2: plan-mode "dashed = proposed" legend. Task 1 (committed)
// dashes+tints plan-only-added SVG layers when Plan mode is active. This task
// adds a small `#proposedLegend` hint in the chart card explaining the dashed
// convention, shown ONLY while Plan mode is active.
//
// Per the task brief, the legend reuses the EXISTING `.plan-mode` cue on the
// chart card (`.chart`) — already toggled by the real, unchanged
// `syncChartModeUi()` in odontogram.ts every time `setChartMode()` runs — as
// its single visibility source of truth. No new React state and no new call
// into the engine is introduced for this: visibility is pure CSS, scoped by
// the `.chart.plan-mode #proposedLegend` descendant selector (see
// src/index.css), exactly mirroring how `.chart.plan-mode` itself already
// drives the chart card's border/tint cue.
//
// Two harnesses, mirroring the established split in r2a-toggle-ui.test.ts:
//   1. JSX-structure placement — <App/> rendered with the heavy engine
//      lifecycle mocked out (same list as r2a-toggle-ui.test.ts), to prove
//      #proposedLegend lives inside .chart, carries the i18n copy, and is
//      NOT reachable via the `.chart.plan-mode` selector in App's default
//      (status-mode) markup.
//   2. Real toggle-wiring behavior — setChartMode/getChartMode/
//      __resetChartStateForTest are forwarded from the REAL module, exercised
//      against a hand-built DOM fixture mirroring App.tsx's real markup
//      (chart-header + #proposedLegend), with the SAME click-listener
//      contract wireControls() installs. Proves the legend becomes reachable
//      via `.chart.plan-mode #proposedLegend` only after switching to Plan,
//      and unreachable again after switching back to Status.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { setChartMode, getChartMode, __resetChartStateForTest } from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    // DX-2 Task 4: DiagnosesCard (mounted unconditionally as part of ToothControlsSurface) reads/writes these.
    getActiveDiagnoses: actual.getActiveDiagnoses,
    setDxOverrideForSelection: actual.setDxOverrideForSelection,
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
    getSnomedEnabled: vi.fn().mockReturnValue(false),
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
    setSnomedEnabled: vi.fn(),
    getToothAnatomy: vi.fn().mockReturnValue("classic"),
    getScreenToothSpacing: vi.fn().mockReturnValue("normal"),
    setScreenToothSpacing: vi.fn(),
    getScreenToothNumberSize: vi.fn().mockReturnValue("normal"),
    setScreenToothNumberSize: vi.fn(),
    getSelectionColor: vi.fn().mockReturnValue("#3b7bff"),
    setSelectionColor: vi.fn(),
    getSelectionBorderStyle: vi.fn().mockReturnValue("dashed"),
    setSelectionBorderStyle: vi.fn(),
    getToothInfoVisible: vi.fn().mockReturnValue(true),
    setToothInfoVisible: vi.fn(),
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

describe("R2-C Task 2: #proposedLegend placement + copy", () => {
  it("#proposedLegend exists inside .chart and carries the chart.proposedLegend copy", () => {
    render(createElement(App));
    const legend = document.querySelector(".chart #proposedLegend");
    expect(legend).toBeTruthy();
    // Default test language is "en" (see src/i18n/useI18n.ts FALLBACK_LANGUAGE).
    expect(legend?.textContent).toContain("dashed = proposed");
  });

  it("is NOT reachable via the .chart.plan-mode selector on App's default (status-mode) markup", () => {
    render(createElement(App));
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeFalsy();
  });
});

describe("R2-C Task 2: real toggle wiring — legend reachable only under .chart.plan-mode", () => {
  /** Mirrors App.tsx's real chart-header/chart-card/#proposedLegend markup
   *  closely enough for the REAL, private syncChartModeUi() (invoked inside
   *  the real, forwarded setChartMode()) to find every element it queries. */
  function mountChartModeFixture(): { chartCard: HTMLElement; statusBtn: HTMLButtonElement; planBtn: HTMLButtonElement } {
    document.body.innerHTML = `
      <section class="chart">
        <div class="chart-header">
          <div id="chartModeToggle" class="chart-mode-toggle" role="tablist">
            <button id="chartModeStatus" type="button" class="chart-mode-btn is-active" role="tab" aria-selected="true">Status</button>
            <button id="chartModePlan" type="button" class="chart-mode-btn" role="tab" aria-selected="false">Plan</button>
            <span id="chartModePlanBadge" class="plan-badge hidden">PLAN</span>
          </div>
          <div id="proposedLegend" class="proposed-legend">
            <span class="proposed-legend-swatch" aria-hidden="true"></span>
            dashed = proposed
          </div>
        </div>
      </section>
    `;
    const chartCard = document.querySelector(".chart") as HTMLElement;
    const statusBtn = document.getElementById("chartModeStatus") as HTMLButtonElement;
    const planBtn = document.getElementById("chartModePlan") as HTMLButtonElement;
    statusBtn.addEventListener("click", () => setChartMode("status"));
    planBtn.addEventListener("click", () => setChartMode("plan"));
    return { chartCard, statusBtn, planBtn };
  }

  it("clicking Plan makes the legend reachable via .chart.plan-mode #proposedLegend", () => {
    mountChartModeFixture();
    expect(getChartMode()).toBe("status");
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeFalsy();

    (document.getElementById("chartModePlan") as HTMLButtonElement).click();

    expect(getChartMode()).toBe("plan");
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeTruthy();
  });

  it("clicking Status makes the legend unreachable via .chart.plan-mode #proposedLegend again", () => {
    mountChartModeFixture();
    (document.getElementById("chartModePlan") as HTMLButtonElement).click();
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeTruthy();

    (document.getElementById("chartModeStatus") as HTMLButtonElement).click();

    expect(getChartMode()).toBe("status");
    expect(document.querySelector(".chart.plan-mode #proposedLegend")).toBeFalsy();
  });

  it("the legend element itself is never removed from the DOM — only its reachability via the plan-mode selector changes", () => {
    mountChartModeFixture();
    expect(document.getElementById("proposedLegend")).toBeTruthy();

    (document.getElementById("chartModePlan") as HTMLButtonElement).click();
    expect(document.getElementById("proposedLegend")).toBeTruthy();

    (document.getElementById("chartModeStatus") as HTMLButtonElement).click();
    expect(document.getElementById("proposedLegend")).toBeTruthy();
  });
});
