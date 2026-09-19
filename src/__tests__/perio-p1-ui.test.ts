// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP-perio P1 Task 2: minimal per-site input UI for the 6-site periodontal
// data core (Task 1, committed a18731f). Adds a #perioRow block — six PD
// number inputs + six GM number inputs (buccal row MB/B/DB, then lingual row
// ML/L/DL, PERIO_SITES' own canonical order) + six BOP checkboxes + six SUP
// checkboxes, each wired to call the REAL setPerioSite(toothNo, site, patch)
// — plus a live derived read-out (per-site CAL from getToothCal, tooth %BOP
// derived from getToothPerio's bop array) synced by the (also real, forwarded)
// __syncPerioRowForTest seam. Gated hidden on missing/implant/under-gum/
// extraction-socket teeth via the new perioRowHidden predicate, exposed as
// __perioRowHiddenForTest (mirrors __mobilityRowHiddenForTest).
//
// Two harnesses, mirroring the established split in this test suite (see
// sp14-ortho-ui.test.ts / r2a-toggle-ui.test.ts): there is no full-DOM
// initOdontogram() mount harness for the tooth panel (odontogram.ts's DOM
// logic is imperative and requires a fully-wired shell with real SVG assets),
// so (1) <App/> is rendered with the heavy engine lifecycle mocked out to
// prove #perioRow's JSX placement/structure, and (2) a hand-built DOM
// fixture mirroring the production #perioRow markup is wired with the SAME
// listener contract the real buildPerioGrid()/wireControls() installs
// (setPerioSite on change, then __syncPerioRowForTest to refresh), exercising
// the REAL exported functions end-to-end against real module state
// (__setToothStateForTest / __resetChartStateForTest, the same seams
// perio-p1-core.test.ts uses).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import {
  PERIO_SITES,
  setPerioSite,
  getToothPerio,
  getToothCal,
  __syncPerioRowForTest,
  __perioRowHiddenForTest,
  __buildPerioGridForTest,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../odontogram";

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
    PERIO_SITES: actual.PERIO_SITES,
    setPerioSite: actual.setPerioSite,
    getToothPerio: actual.getToothPerio,
    getToothCal: actual.getToothCal,
    // P2 Task 2: <PerioChart/> (mounted unconditionally inside <App/>, just
    // hidden while closed) now imports these too — needed even though this
    // file never opens the overlay, since PERIO_SITES is read at PerioChart
    // module-eval time and getPerioSummary() is called on every mount's
    // initial useState (both happen regardless of `open`).
    isUpperTooth: actual.isUpperTooth,
    formatToothLabel: actual.formatToothLabel,
    getPerioChart: actual.getPerioChart,
    getPerioSummary: actual.getPerioSummary,
    getToothMobility: actual.getToothMobility,
    setToothMobility: actual.setToothMobility,
    isPerioRowHidden: actual.isPerioRowHidden,
    __syncPerioRowForTest: actual.__syncPerioRowForTest,
    __perioRowHiddenForTest: actual.__perioRowHiddenForTest,
    __buildPerioGridForTest: actual.__buildPerioGridForTest,
    __setToothStateForTest: actual.__setToothStateForTest,
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

describe("SP-perio P1 Task 2: #perioRow JSX placement/structure", () => {
  // odontogram.ts's imperative engine lifecycle (initOdontogram/wireControls)
  // is mocked out in this harness (see sp7-card-merge.test.ts's identical
  // #modsChecks precedent: JS-built dynamic content is only container-tested
  // here; the real DOM it builds is tested below via __buildPerioGridForTest).
  it("#perioRow (with its #perioGrid + #perioReadout containers) lives inside the root-periodontium card", () => {
    render(createElement(App));
    expect(document.querySelector("#rootPeriodontiumSection #perioRow")).toBeTruthy();
    expect(document.querySelector("#rootPeriodontiumSection #perioRow #perioGrid")).toBeTruthy();
    expect(document.querySelector("#rootPeriodontiumSection #perioRow #perioReadout")).toBeTruthy();
  });
});

describe("SP-perio P1 Task 2: real grid-building DOM shape (__buildPerioGridForTest, forwarding the real buildPerioGrid())", () => {
  it("builds 6 PD, 6 GM, 6 BOP and 6 SUP inputs, one per PERIO_SITES entry", () => {
    document.body.innerHTML = '<div id="perioGrid"></div>';
    __buildPerioGridForTest(document.getElementById("perioGrid") as Element);

    for (const site of PERIO_SITES) {
      const pd = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="pd"]`) as HTMLInputElement;
      const gm = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="gm"]`) as HTMLInputElement;
      const bop = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="bop"]`) as HTMLInputElement;
      const sup = document.querySelector(`#perioGrid input[data-site="${site}"][data-field="sup"]`) as HTMLInputElement;
      expect(pd, `PD input for ${site}`).toBeTruthy();
      expect(pd.type).toBe("number");
      expect(gm, `GM input for ${site}`).toBeTruthy();
      expect(gm.type).toBe("number");
      expect(bop, `BOP checkbox for ${site}`).toBeTruthy();
      expect(bop.type).toBe("checkbox");
      expect(sup, `SUP checkbox for ${site}`).toBeTruthy();
      expect(sup.type).toBe("checkbox");
    }
  });

  it("lays out the buccal sites (MB/B/DB) before the lingual sites (ML/L/DL), PERIO_SITES' own order", () => {
    document.body.innerHTML = '<div id="perioGrid"></div>';
    const grid = document.getElementById("perioGrid") as Element;
    __buildPerioGridForTest(grid);
    const cells = Array.from(grid.querySelectorAll(".perio-site-cell")).map((c) => c.getAttribute("data-site"));
    expect(cells).toEqual(["MB", "B", "DB", "ML", "L", "DL"]);
  });
});

describe("SP-perio P1 Task 2: perioRowHidden gate (reused for #perioRow visibility)", () => {
  it("hidden for a missing tooth", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "none" })).toBe(true);
  });
  it("hidden for an implant", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "implant" })).toBe(true);
  });
  it("hidden for a tooth under gum", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "tooth-under-gum" })).toBe(true);
  });
  it("hidden for an extraction socket", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "no-tooth-after-extraction" })).toBe(true);
  });
  it("NOT hidden for a natural present tooth", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "tooth-base" })).toBe(false);
  });
  it("NOT hidden for a milk tooth", () => {
    expect(__perioRowHiddenForTest({ toothSelection: "milktooth" })).toBe(false);
  });
});

describe("SP-perio P1 Task 2: real write path (hand-built #perioRow fixture, production listener contract)", () => {
  /** Mirrors App.tsx's real #perioRow/#perioGrid markup closely enough for
   *  __syncPerioRowForTest (forwarding the real, private syncPerioRow()) to
   *  find every element it queries by id/data-attribute, and reproduces the
   *  exact change-listener contract buildPerioGrid() installs in production:
   *  setPerioSite(toothNo, site, patch) on change, then re-sync (setPerioSite
   *  deliberately never touches DOM itself). */
  function mountPerioFixture(toothNo: number): { pd: HTMLInputElement; gm: HTMLInputElement; bop: HTMLInputElement; readout: HTMLElement } {
    document.body.innerHTML = `
      <div id="perioRow" class="perio-block">
        <div id="perioGrid" class="perio-grid">
          <div class="perio-site-row">
            <div class="perio-site-cell" data-site="MB">
              <input type="number" id="perio-pd-MB" data-site="MB" data-field="pd" min="1" max="15" step="1" />
              <input type="number" id="perio-gm-MB" data-site="MB" data-field="gm" min="-10" max="20" step="1" />
              <input type="checkbox" id="perio-bop-MB" data-site="MB" data-field="bop" />
              <input type="checkbox" id="perio-sup-MB" data-site="MB" data-field="sup" />
            </div>
          </div>
        </div>
        <div id="perioReadout" class="hint"></div>
      </div>
    `;
    const pd = document.getElementById("perio-pd-MB") as HTMLInputElement;
    const gm = document.getElementById("perio-gm-MB") as HTMLInputElement;
    const bop = document.getElementById("perio-bop-MB") as HTMLInputElement;
    const readout = document.getElementById("perioReadout") as HTMLElement;

    pd.addEventListener("change", () => {
      const raw = pd.value.trim();
      setPerioSite(toothNo, "MB", { pd: raw === "" ? null : Number(raw) });
      __syncPerioRowForTest({ toothSelection: "tooth-base" }, toothNo);
    });
    gm.addEventListener("change", () => {
      const raw = gm.value.trim();
      if (raw === "") return;
      setPerioSite(toothNo, "MB", { gm: Number(raw) });
      __syncPerioRowForTest({ toothSelection: "tooth-base" }, toothNo);
    });
    bop.addEventListener("change", () => {
      setPerioSite(toothNo, "MB", { bop: bop.checked });
      __syncPerioRowForTest({ toothSelection: "tooth-base" }, toothNo);
    });
    return { pd, gm, bop, readout };
  }

  it("authoring PD + GM + BOP on one site updates state (getToothPerio) and the live read-out shows derived CAL + tooth %BOP", () => {
    __setToothStateForTest(21, {});
    const { pd, gm, bop, readout } = mountPerioFixture(21);

    pd.value = "5";
    pd.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(21).pd.MB).toBe(5);

    gm.value = "2";
    gm.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(21).gm.MB).toBe(2);

    bop.checked = true;
    bop.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(21).bop).toEqual(["MB"]);

    // Derived CAL = pd + gm = 7, surfaced via the real getToothCal().
    expect(getToothCal(21).get("MB")).toBe(7);

    // Live read-out reflects both the per-site CAL and the tooth-level %BOP
    // (1 charted site, 1 bleeding -> 100%).
    expect(readout.textContent).toContain("7");
    expect(readout.textContent).toMatch(/100/);
  });

  it("clearing PD (blank) un-charts the site — state and read-out both revert to empty", () => {
    __setToothStateForTest(22, {});
    const { pd, readout } = mountPerioFixture(22);

    pd.value = "6";
    pd.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(22).pd.MB).toBe(6);

    pd.value = "";
    pd.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getToothPerio(22).pd.MB).toBeUndefined();
    expect(getToothCal(22).has("MB")).toBe(false);
    expect(readout.textContent?.length).toBeGreaterThan(0); // empty-state message, not blank
  });
});
