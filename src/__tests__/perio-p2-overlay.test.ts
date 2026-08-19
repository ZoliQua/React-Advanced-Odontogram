// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc sub-project P2, Task 1: the separately-invocable perio-chart
// OVERLAY shell + its open/close imperative API. P1 (v1.34.0, committed)
// shipped the perio data core (setPerioSite/getToothPerio/getPerioSummary/
// getPerioChart) — no UI. This task builds ONLY the overlay shell + API; the
// grid content is T2, keyboard entry is T3.
//
// Two harnesses, mirroring the established split in this test suite (see
// r2a-toggle-ui.test.ts / sp14-ortho-ui.test.ts):
//   1. JSX-structure + imperative-API behavior — <App/> is rendered with the
//      heavy engine lifecycle (initOdontogram et al.) mocked out, same list as
//      the two files above, EXCEPT initOdontogram's mock synchronously injects
//      a fake tooth <svg> into #toothGrid (simulating what the real init does
//      to the DOM) so we can prove the odontogram SVG root is never unmounted
//      while the overlay is open. openPerioOverlay/closePerioOverlay/
//      isPerioOverlayOpen/onStateChange are forwarded from the REAL module
//      (not re-implemented), so calling them exercises the actual production
//      wiring App.tsx installs via its onStateChange subscription.
//   2. Named-export resolution — `PerioChart` resolves as a function from
//      "../App" (the engine entry host software imports via @odontogram-shell).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
import App, { PerioChart } from "../App";
import { openPerioOverlay, closePerioOverlay, isPerioOverlayOpen } from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    // DX-2 Task 4: DiagnosesCard (mounted unconditionally as part of ToothControlsSurface) reads/writes these.
    getActiveDiagnoses: actual.getActiveDiagnoses,
    setDxOverrideForSelection: actual.setDxOverrideForSelection,
    initOdontogram: vi.fn().mockImplementation(() => {
      // Simulate the real engine populating #toothGrid with tooth SVGs, so
      // tests can prove the overlay never unmounts the odontogram.
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
    // "Dental Chart" graphical redesign, Task 1: this whole suite exercises
    // P2's classic popup housing (launch button + modal), which now only
    // renders while `perioViewMode === "popup"` — stubbed (not forwarded from
    // the real, session-level, default-"toggle" module) so this file's App
    // mounts stay in popup housing regardless of what any other test file
    // did to the shared module state.
    getPerioViewMode: vi.fn().mockReturnValue("popup"),
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
    // PG-B Task 2: PerioChart now reads/sets the overlay-layer flag — forward
    // the real implementations so its switcher/overlay effects work here.
    getPerioOverlayLayer: actual.getPerioOverlayLayer,
    setPerioOverlayLayer: actual.setPerioOverlayLayer,
    isDualStateConfirmPending: vi.fn().mockReturnValue(false),
    acceptDualStateConfirm: vi.fn(),
    cancelDualStateConfirm: vi.fn(),
    // P2 Task 2: <PerioChart/>'s grid + summary bar need the full perio data
    // core + these small read helpers, not just the open/close flag.
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
    // DX-3b Task 5: Case/regional diagnoses picker — <PerioSidebar/> reads/
    // writes these unconditionally on every mount.
    getCaseConditions: actual.getCaseConditions,
    setCaseCondition: actual.setCaseCondition,
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
});

describe("P2 Task 1: PerioChart named export", () => {
  it("PerioChart is exported as a named export from ../App and is a function", () => {
    expect(typeof PerioChart).toBe("function");
  });
});

describe("P2 Task 1: openPerioOverlay/closePerioOverlay/isPerioOverlayOpen imperative API", () => {
  it("isPerioOverlayOpen() starts false", () => {
    expect(isPerioOverlayOpen()).toBe(false);
  });

  it("openPerioOverlay() flips the flag true; closePerioOverlay() flips it back false", () => {
    openPerioOverlay();
    expect(isPerioOverlayOpen()).toBe(true);
    closePerioOverlay();
    expect(isPerioOverlayOpen()).toBe(false);
  });
});

describe("P2 Task 1: <App/> mount — overlay shell over the (never-unmounted) odontogram", () => {
  it("the overlay is not shown initially", async () => {
    render(createElement(App));
    await Promise.resolve();
    expect(document.getElementById("perioOverlay")).toBeNull();
  });

  it("openPerioOverlay() shows #perioOverlay (role=dialog) while the tooth SVG root stays mounted", async () => {
    render(createElement(App));
    await Promise.resolve();
    const toothSvgBefore = document.querySelector("#toothGrid [data-fake-tooth-svg]");
    expect(toothSvgBefore).toBeTruthy();

    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);

    const overlay = document.getElementById("perioOverlay");
    expect(overlay).toBeTruthy();
    expect(overlay!.getAttribute("role")).toBe("dialog");
    expect(overlay!.getAttribute("aria-modal")).toBe("true");
    // Scoped WITHIN the dialog and by its own unique id, so this actually
    // proves the OVERLAY body mounted — not the P1 tooth-info panel's
    // always-present #perioGrid (which lives outside #perioOverlay and
    // would otherwise satisfy a bare document.getElementById lookup
    // vacuously, even if the overlay body never rendered).
    const overlayGrid = overlay!.querySelector("#perioOverlayGrid");
    expect(overlayGrid).toBeTruthy();
    expect(document.getElementById("perioOverlayGrid")).toBe(overlayGrid);
    // No duplicate DOM id: the P1 panel keeps #perioGrid, the overlay uses
    // #perioOverlayGrid — the two must be distinct elements.
    expect(document.getElementById("perioGrid")).not.toBe(overlayGrid);

    // The odontogram SVG root must still be in the DOM — the overlay layers
    // OVER it, it never unmounts.
    expect(document.querySelector("#toothGrid [data-fake-tooth-svg]")).toBe(toothSvgBefore);
    expect(isPerioOverlayOpen()).toBe(true);
  });

  it("the close button hides the overlay and keeps the odontogram mounted", async () => {
    render(createElement(App));
    await Promise.resolve();
    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);
    expect(document.getElementById("perioOverlay")).toBeTruthy();

    const dialog = document.getElementById("perioOverlay")!;
    const closeBtn = dialog.querySelector("button[aria-label], button[title]") as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn);

    expect(document.getElementById("perioOverlay")).toBeNull();
    expect(isPerioOverlayOpen()).toBe(false);
    expect(document.querySelector("#toothGrid [data-fake-tooth-svg]")).toBeTruthy();
  });

  it("Esc closes the overlay", async () => {
    render(createElement(App));
    await Promise.resolve();
    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);
    const dialog = document.getElementById("perioOverlay")!;
    expect(dialog).toBeTruthy();

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(document.getElementById("perioOverlay")).toBeNull();
    expect(isPerioOverlayOpen()).toBe(false);
  });

  it("backdrop click (on the overlay root itself, not its inner panel) closes the overlay", async () => {
    render(createElement(App));
    await Promise.resolve();
    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);
    const dialog = document.getElementById("perioOverlay")!;
    expect(dialog).toBeTruthy();

    fireEvent.mouseDown(dialog);

    expect(document.getElementById("perioOverlay")).toBeNull();
  });

  it("closePerioOverlay() called directly (module API) also hides an App-rendered overlay", async () => {
    render(createElement(App));
    await Promise.resolve();
    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);
    expect(document.getElementById("perioOverlay")).toBeTruthy();

    act(() => {
      closePerioOverlay();
    });
    // The demo's onStateChange subscription must re-render the overlay closed.
    expect(document.getElementById("perioOverlay")).toBeNull();
  });

  it("#openPerioOverlayBtn exists in a slim bar at the top of <main class=\"layout\">, not the topbar", () => {
    render(createElement(App));
    const btn = document.getElementById("openPerioOverlayBtn");
    expect(btn).toBeTruthy();
    expect(document.querySelector(".topbar #openPerioOverlayBtn")).toBeFalsy();
    expect(document.querySelector("main.layout #openPerioOverlayBtn")).toBeTruthy();
  });

  it("#openPerioOverlayBtn calls openPerioOverlay()", async () => {
    render(createElement(App));
    await Promise.resolve();
    expect(isPerioOverlayOpen()).toBe(false);
    fireEvent.click(document.getElementById("openPerioOverlayBtn")!);
    expect(isPerioOverlayOpen()).toBe(true);
  });
});
