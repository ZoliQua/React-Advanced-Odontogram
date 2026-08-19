// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc "Dental Chart" graphical redesign, Task 1: PRESENTATION only.
// The perio CONTENT is still P2's existing <PerioChart/> body (grid + summary
// bar) — this task only changes how it's HOUSED: an `Odontogram | Dental
// Chart` view toggle (default, `#appViewToggle`) that shows the perio content
// INLINE in the chart area (odontogram hidden via CSS, NEVER unmounted), plus
// a Settings option (`perioViewMode`) to fall back to P2's classic popup.
//
// Two harnesses, mirroring the established split in this test suite (see
// r2a-toggle-ui.test.ts / perio-p2-overlay.test.ts):
//   1. <App/> is rendered with the heavy engine lifecycle (initOdontogram et
//      al.) mocked out, same list as perio-p2-overlay.test.ts, EXCEPT
//      initOdontogram's mock synchronously injects a fake tooth <svg> into
//      #toothGrid so we can prove the odontogram SVG root is never unmounted
//      while the Dental Chart view is active. getPerioViewMode/
//      setPerioViewMode/onStateChange/openPerioOverlay/closePerioOverlay/
//      isPerioOverlayOpen + the full P1/P2 perio data-core surface PerioChart
//      needs to actually build its grid are forwarded from the REAL module.
//   2. Named-export resolution — `PerioChart` still resolves as a function
//      from "../App".
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import App, { PerioChart } from "../App";
import {
  getPerioViewMode,
  setPerioViewMode,
  closePerioOverlay,
  isPerioOverlayOpen,
} from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    initOdontogram: vi.fn().mockImplementation(() => {
      // Simulate the real engine populating #toothGrid with tooth SVGs, so
      // tests can prove the Dental Chart view never unmounts the odontogram.
      const grid = document.getElementById("toothGrid");
      if (grid && !grid.querySelector('[data-fake-tooth-svg]')) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("data-fake-tooth-svg", "11");
        grid.appendChild(svg);
      }
      return Promise.resolve(undefined);
    }),
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
    setPatientName: actual.setPatientName,
    setExamDate: actual.setExamDate,
    exportPdf: vi.fn().mockResolvedValue(undefined),
    getOdontogramSummary: vi.fn().mockReturnValue({
      overview: "", permanentList: null, missingList: null,
      sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: "", periodontalText: "",
    }),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    onStateChange: actual.onStateChange,
    openPerioOverlay: actual.openPerioOverlay,
    closePerioOverlay: actual.closePerioOverlay,
    isPerioOverlayOpen: actual.isPerioOverlayOpen,
    getPerioViewMode: actual.getPerioViewMode,
    getDiagnosisCodingPack: actual.getDiagnosisCodingPack,
    getFillingDefectEnabled: actual.getFillingDefectEnabled,
    setFillingDefectEnabled: actual.setFillingDefectEnabled,
    getFillingComplexity: actual.getFillingComplexity,
    setFillingComplexity: actual.setFillingComplexity,
    getFissureSealingEnabled: actual.getFissureSealingEnabled,
    setFissureSealingEnabled: actual.setFissureSealingEnabled,
    getFillingMaterialAvailability: actual.getFillingMaterialAvailability,
    setFillingMaterialAvailability: actual.setFillingMaterialAvailability,
    setPerioViewMode: actual.setPerioViewMode,
    setDiagnosisCodingPack: actual.setDiagnosisCodingPack,
    getToothAnatomy: vi.fn().mockReturnValue("classic"),
    setToothAnatomy: vi.fn(),
    getPerioRowVisibility: actual.getPerioRowVisibility,
    setPerioRowVisibility: actual.setPerioRowVisibility,
    getPerioIndexNameMode: actual.getPerioIndexNameMode,
    setPerioIndexNameMode: actual.setPerioIndexNameMode,
    getPdfSettings: actual.getPdfSettings,
    setPdfSettings: actual.setPdfSettings,
    // PG-B Task 2: PerioChart now reads/sets the overlay-layer flag — forward
    // the real implementations so its switcher/overlay effects work here.
    getPerioOverlayLayer: actual.getPerioOverlayLayer,
    setPerioOverlayLayer: actual.setPerioOverlayLayer,
    isDualStateConfirmPending: actual.isDualStateConfirmPending,
    acceptDualStateConfirm: actual.acceptDualStateConfirm,
    cancelDualStateConfirm: actual.cancelDualStateConfirm,
    // The full P1/P2 perio data-core surface <PerioChart/> needs to build its
    // grid + summary bar (same list as perio-p2-overlay.test.ts).
    PERIO_SITES: actual.PERIO_SITES,
    isUpperTooth: actual.isUpperTooth,
    formatToothLabel: actual.formatToothLabel,
    getPerioChart: actual.getPerioChart,
    getToothPerio: actual.getToothPerio,
    getToothCal: actual.getToothCal,
    getPerioSummary: actual.getPerioSummary,
    setPerioSite: actual.setPerioSite,
    getToothMobility: actual.getToothMobility,
    setToothMobility: actual.setToothMobility,
    // SP-perio P2b Task 4: furcation + plaque rows <PerioChart/>'s grid now
    // needs at mount/render (buildFurcationCell/buildPlaqueCell).
    furcationEntrances: actual.furcationEntrances,
    getToothFurcation: actual.getToothFurcation,
    setFurcation: actual.setFurcation,
    getToothPlaque: actual.getToothPlaque,
    setPlaque: actual.setPlaque,
    isPerioRowHidden: actual.isPerioRowHidden,
    // SP-perio PG-C Task 3: cejVisibility/rootConcavity rows <PerioChart/>'s
    // grid now needs at mount/render (buildCejVisibilityCell/buildRootConcavityCell).
    getToothRecessionType: actual.getToothRecessionType,
    getCejVisibility: actual.getCejVisibility,
    setCejVisibility: actual.setCejVisibility,
    getRootConcavity: actual.getRootConcavity,
    setRootConcavity: actual.setRootConcavity,
    nextPerioCell: actual.nextPerioCell,
    prevPerioCell: actual.prevPerioCell,
    // SP-perio PG-D Task 4: PI/GI/KG/GT/Miller rows <PerioChart/>'s grid now
    // needs at mount/render (buildGradeCell/buildKgCell/
    // buildGingivalThicknessCell/buildMillerClassCell).
    getPlaqueIndex: actual.getPlaqueIndex,
    setPlaqueIndex: actual.setPlaqueIndex,
    getGingivalIndex: actual.getGingivalIndex,
    setGingivalIndex: actual.setGingivalIndex,
    getKeratinizedWidth: actual.getKeratinizedWidth,
    setKeratinizedWidth: actual.setKeratinizedWidth,
    getGingivalThickness: actual.getGingivalThickness,
    setGingivalThickness: actual.setGingivalThickness,
    getMillerClass: actual.getMillerClass,
    setMillerClass: actual.setMillerClass,
    // SP-perio PG-E Task 2: mPI/mBI rows <PerioChart/>'s grid now needs at
    // mount/render (buildGradeCell("mpi"/"mbi")), plus the implant-gate read
    // syncToothCells now performs on EVERY tooth (isToothImplant).
    isToothImplant: actual.isToothImplant,
    getPeriImplantPlaque: actual.getPeriImplantPlaque,
    setPeriImplantPlaque: actual.setPeriImplantPlaque,
    getPeriImplantBleeding: actual.getPeriImplantBleeding,
    setPeriImplantBleeding: actual.setPeriImplantBleeding,
    // P4a Task 2: case-metadata panel — <PerioChart/> now reads/writes the
    // shared case-level metadata object at mount/render.
    getCaseMeta: actual.getCaseMeta,
    setCaseAge: actual.setCaseAge,
    setSmokingStatus: actual.setSmokingStatus,
    setCigarettesPerDay: actual.setCigarettesPerDay,
    setDiabetesStatus: actual.setDiabetesStatus,
    setHba1c: actual.setHba1c,
    setToothLossPerio: actual.setToothLossPerio,
    setMaxRblPercent: actual.setMaxRblPercent,
    resetCaseMeta: actual.resetCaseMeta,
    // P4b Task 4: classification panel — <PerioChart/> now reads the final
    // classification + writes the 4 per-axis overrides at mount/render.
    getPerioClassification: actual.getPerioClassification,
    setDiagnosisOverride: actual.setDiagnosisOverride,
    setStageOverride: actual.setStageOverride,
    setGradeOverride: actual.setGradeOverride,
    setExtentOverride: actual.setExtentOverride,
  };
});

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
  closePerioOverlay();
  setPerioViewMode("toggle");
});

describe("Task 1: perioViewMode state (odontogram.ts)", () => {
  it("defaults to \"toggle\"", () => {
    expect(getPerioViewMode()).toBe("toggle");
  });

  it("setPerioViewMode changes the mode", () => {
    setPerioViewMode("popup");
    expect(getPerioViewMode()).toBe("popup");
    setPerioViewMode("toggle");
    expect(getPerioViewMode()).toBe("toggle");
  });
});

describe("Task 1: PerioChart named export", () => {
  it("PerioChart is exported as a named export from ../App and is a function", () => {
    expect(typeof PerioChart).toBe("function");
  });
});

describe("Task 1: toggle mode housing (default)", () => {
  it("renders #appViewToggle with Odontogram + Dental Chart segments, Odontogram active by default", async () => {
    render(createElement(App));
    await Promise.resolve();
    const toggle = document.getElementById("appViewToggle");
    expect(toggle).toBeTruthy();
    const odontogramBtn = document.getElementById("appViewOdontogram") as HTMLButtonElement;
    const dentalChartBtn = document.getElementById("appViewDentalChart") as HTMLButtonElement;
    expect(odontogramBtn).toBeTruthy();
    expect(dentalChartBtn).toBeTruthy();
    expect(odontogramBtn.classList.contains("is-active")).toBe(true);
    expect(dentalChartBtn.classList.contains("is-active")).toBe(false);
  });

  it("no popup launch button while in toggle mode", async () => {
    render(createElement(App));
    await Promise.resolve();
    expect(document.getElementById("openPerioOverlayBtn")).toBeNull();
  });

  it("selecting \"Dental Chart\" unmounts .chart-column and shows the perio content inline", async () => {
    render(createElement(App));
    await Promise.resolve();
    expect(document.querySelector("#toothGrid [data-fake-tooth-svg]")).toBeTruthy();

    fireEvent.click(document.getElementById("appViewDentalChart")!);

    // Composable-UI Tier 2: the odontogram column is now UNMOUNTED in the perio
    // view (control wiring is re-runnable, so a remount re-wires cleanly via
    // rewireControls()/rebuildGrid()) rather than hidden with display:none.
    expect(document.querySelector(".chart-column")).toBeNull();

    // Perio content shown inline (no modal dialog chrome).
    expect(document.getElementById("perioOverlay")).toBeNull();
    expect(document.getElementById("perioInlineGrid")).toBeTruthy();

    const dentalChartBtn = document.getElementById("appViewDentalChart") as HTMLButtonElement;
    const odontogramBtn = document.getElementById("appViewOdontogram") as HTMLButtonElement;
    expect(dentalChartBtn.classList.contains("is-active")).toBe(true);
    expect(odontogramBtn.classList.contains("is-active")).toBe(false);
  });

  it("selecting \"Odontogram\" again reverses it: .chart-column remounts, inline perio content gone", async () => {
    render(createElement(App));
    await Promise.resolve();

    fireEvent.click(document.getElementById("appViewDentalChart")!);
    expect(document.querySelector(".chart-column")).toBeNull();
    expect(document.getElementById("perioInlineGrid")).toBeTruthy();

    fireEvent.click(document.getElementById("appViewOdontogram")!);

    expect(document.querySelector(".chart-column")).toBeTruthy();
    expect(document.getElementById("perioInlineGrid")).toBeNull();
  });
});

describe("Task 1: popup mode housing (perioViewMode === \"popup\")", () => {
  it("no #appViewToggle in popup mode", async () => {
    setPerioViewMode("popup");
    render(createElement(App));
    await Promise.resolve();
    expect(document.getElementById("appViewToggle")).toBeNull();
  });

  it("P2's launch button is present and openPerioOverlay() still opens the modal", async () => {
    setPerioViewMode("popup");
    render(createElement(App));
    await Promise.resolve();

    const btn = document.getElementById("openPerioOverlayBtn");
    expect(btn).toBeTruthy();
    expect(isPerioOverlayOpen()).toBe(false);

    fireEvent.click(btn!);

    const overlay = document.getElementById("perioOverlay");
    expect(overlay).toBeTruthy();
    expect(overlay!.getAttribute("role")).toBe("dialog");
    expect(isPerioOverlayOpen()).toBe(true);

    // The odontogram SVG root must still be in the DOM behind the modal.
    expect(document.querySelector("#toothGrid [data-fake-tooth-svg]")).toBeTruthy();

    // .chart-column stays visible in popup mode (only toggle mode hides it).
    expect((document.querySelector(".chart-column") as HTMLElement).style.display).not.toBe("none");
  });

  it("closePerioOverlay() closes the popup modal", async () => {
    setPerioViewMode("popup");
    render(createElement(App));
    await Promise.resolve();
    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);
    expect(document.getElementById("perioOverlay")).toBeTruthy();

    // module-level onStateChange subscription re-renders the overlay closed
    act(() => {
      closePerioOverlay();
    });
    expect(document.getElementById("perioOverlay")).toBeNull();
  });
});
