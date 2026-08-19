// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { destroyOdontogram, initOdontogram, setNumberingSystem, clearSelection, setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible, registerPlugins, setPluginState, getPluginState, getToothStateSummary, getOdontogramSummary, formatToothLabel, onStateChange, setReadOnly, getReadOnly, setNotesEnabled, getNotesEnabled, setIcdasEnabled, getIcdasEnabled, setPulpDetailLevel, getPulpDetailLevel, setSecondaryCariesMode, getSecondaryCariesMode, setRootCariesMode, getRootCariesMode, setRadiographicDepthMode, getRadiographicDepthMode, setCariesDepthEnabled, getCariesDepthEnabled, setWearDetailLevel, getWearDetailLevel, setDiscolorationDetailLevel, getDiscolorationDetailLevel, setSurfaceNotation, getSurfaceNotation, exportFhir, exportImage, exportSvg, setImportFormat, openPerioOverlay, closePerioOverlay, isPerioOverlayOpen, getPerioViewMode, setPerioViewMode, getDiagnosisCodingPack, setDiagnosisCodingPack, getPerioRowVisibility, setPerioRowVisibility, getPerioIndexNameMode, setPerioIndexNameMode, getPdfSettings, setPdfSettings, isDualStateConfirmPending, acceptDualStateConfirm, cancelDualStateConfirm, hasAnyPerioData, getChartMode, setChartMode, getStatusChart, getPlanChart, setPlanChart, getPlanChanges, exportStatus, importStatus, exportPdf, exportPerioImage, exportPerioSvg, getFillingDefectEnabled, setFillingDefectEnabled, getFillingComplexity, setFillingComplexity, getFissureSealingEnabled, setFissureSealingEnabled, getFillingMaterialAvailability, setFillingMaterialAvailability, rewireControls, rebuildGrid, getToothAnatomy, setToothAnatomy } from "./odontogram";
export { clearSelection, setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible, registerPlugins, setPluginState, getPluginState, getToothStateSummary, getOdontogramSummary, formatToothLabel, onStateChange, setReadOnly, getReadOnly, setNotesEnabled, getNotesEnabled, setIcdasEnabled, getIcdasEnabled, setPulpDetailLevel, getPulpDetailLevel, setSecondaryCariesMode, getSecondaryCariesMode, setRootCariesMode, getRootCariesMode, setRadiographicDepthMode, getRadiographicDepthMode, setCariesDepthEnabled, getCariesDepthEnabled, setWearDetailLevel, getWearDetailLevel, setDiscolorationDetailLevel, getDiscolorationDetailLevel, setSurfaceNotation, getSurfaceNotation, exportFhir, exportImage, exportSvg, setImportFormat, getPerioViewMode, setPerioViewMode, getDiagnosisCodingPack, setDiagnosisCodingPack, getPerioRowVisibility, setPerioRowVisibility, getPerioIndexNameMode, setPerioIndexNameMode, getPdfSettings, setPdfSettings, isDualStateConfirmPending, acceptDualStateConfirm, cancelDualStateConfirm, initOdontogram, destroyOdontogram, setNumberingSystem, getChartMode, setChartMode, getStatusChart, getPlanChart, setPlanChart, getPlanChanges, openPerioOverlay, closePerioOverlay, isPerioOverlayOpen, hasAnyPerioData, exportStatus, importStatus, exportPdf, exportPerioImage, exportPerioSvg, getFillingDefectEnabled, setFillingDefectEnabled, getFillingComplexity, setFillingComplexity, getFissureSealingEnabled, setFissureSealingEnabled, getFillingMaterialAvailability, setFillingMaterialAvailability, rewireControls, rebuildGrid, getToothAnatomy, setToothAnatomy };
export { default as PerioChart } from "./PerioChart";
export type { PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel, SurfaceNotation, PerioViewMode, PerioRowId, PerioIndexNameMode, ToothAnatomy } from "./odontogram";
export type { OdontogramSummary, OdontogramSummarySection } from "./odontogram";
export type { FhirExportOptions } from "./fhir/types";
export { startIntroTour } from "./tour";
export {
  enablePersistence, disablePersistence, clearPersistedState, isPersistenceEnabled,
} from "./persistence";
export type { PersistenceOptions } from "./persistence";
import SettingsModal from "./SettingsModal";
export type { FillingComplexity } from "./SettingsModal";
import PerioChart from "./PerioChart";
import PerioSidebar from "./PerioSidebar";
import DualStateConfirm from "./DualStateConfirm";
import ExportOptionsModal from "./ExportOptionsModal";
import CreditsModal from "./CreditsModal";
import { type OdontogramThemeConfig } from "./theme";
export type { OdontogramThemeConfig };
import type { OdontogramPlugin, PluginLayer } from "./plugin";
export type { OdontogramPlugin, PluginLayer };

// Composable-UI foundation: the provider owns all state/effects, the four
// surfaces render the shell's JSX regions, and the hook + context-value type let
// hosts build their own surfaces. `App` (below) is now a thin composition of
// these under `OdontogramProvider`.
import { OdontogramProvider, useOdontogramUi, type OdontogramProviderProps } from "./OdontogramContext";
export { OdontogramProvider, useOdontogramUi } from "./OdontogramContext";
export type { OdontogramUiContextValue } from "./OdontogramContext";
import OdontogramTopbar from "./surfaces/OdontogramTopbar";
import OdontogramChartSurface from "./surfaces/OdontogramChartSurface";
import ToothInfoSurface from "./surfaces/ToothInfoSurface";
import ToothControlsSurface from "./surfaces/ToothControlsSurface";
export { default as OdontogramTopbar } from "./surfaces/OdontogramTopbar";
export { default as OdontogramChartSurface } from "./surfaces/OdontogramChartSurface";
export { default as ToothInfoSurface } from "./surfaces/ToothInfoSurface";
export { default as ToothControlsSurface } from "./surfaces/ToothControlsSurface";
// Composable-UI Tier 3: declarative control cards + the shared subscription hook
// and the per-card engine API they use (additive public surface).
export { default as OrthodonticsCard } from "./surfaces/cards/OrthodonticsCard";
export { default as StatusesCard } from "./surfaces/cards/StatusesCard";
export { default as ToothDetailsCard } from "./surfaces/cards/ToothDetailsCard";
export { default as CariesCard } from "./surfaces/cards/CariesCard";
export { default as FillingsCard } from "./surfaces/cards/FillingsCard";
export { default as RootPeriodontiumCard } from "./surfaces/cards/RootPeriodontiumCard";
export { default as DiagnosesCard } from "./surfaces/cards/DiagnosesCard";
export { default as SurfaceCross } from "./surfaces/cards/SurfaceCross";
export { useEngineState } from "./surfaces/useEngineState";
export {
  getActiveOrtho,
  setOrthoApplianceForSelection,
  setOrthoDriftForSelection,
  setOrthoVerticalForSelection,
  setOrthoRotationForSelection,
  getEdentulous,
  setEdentulous,
  resetMouth,
  applyPrimaryDentition,
  applyMixedDentition,
  getStatusExtras,
  applyStatusExtra,
  getActiveCaries,
  getCariesDepthOptions,
  rootCariesOptions,
  setCariesSurfaceForSelection,
  setCariesActiveDepthForSelection,
  setRootCariesForSelection,
  openCariesDepthPopup,
  getActiveFillings,
  setFillingMaterialForSelection,
  setFillingSurfaceForSelection,
  setFillingSimpleToggleForSelection,
  setFillingSimpleDefectForSelection,
  setFissureSealingForSelection,
  openFillingDefectPopup,
  getActiveRootPerio,
  setPulpEndoForSelection,
  setApicalDxForSelection,
  setPeriapicalTypeForSelection,
  setResorptionForSelection,
  setEndoResectionForSelection,
  setParapulpalPinForSelection,
  setMobilityForSelection,
  setModForSelection,
  setCalculusForSelection,
  setPeriImplantForSelection,
  getActiveToothDetails,
  setToothSelectionForSelection,
  setSubstrateForSelection,
  setRestorationForSelection,
  setExtractionWoundForSelection,
  setExtractionPlanForSelection,
  setMissingClosedForSelection,
  setCrownLeakageForSelection,
  setBrokenMesialForSelection,
  setBrokenIncisalForSelection,
  setBrokenDistalForSelection,
  setContactMesialForSelection,
  setContactDistalForSelection,
  setWearEdgeForSelection,
  setWearCervicalForSelection,
  setWearEdgeToggleForSelection,
  setWearCervicalToggleForSelection,
  setDiscolorationForSelection,
  setDiscolorationToggleForSelection,
  setBridgePillarForSelection,
  setCrownReplaceForSelection,
  setCrownNeededForSelection,
  resetTooth,
  getToothDiagnoses,
  getActiveDiagnoses,
  setDxOverrideForSelection,
} from "./odontogram";
export type { ActiveOrtho, ActiveCaries, ActiveCariesSurface, ActiveFillings, ActiveFillingSurface, ActiveRootPerio, ActiveRootPerioMod, RootPerioOption, RootPerioOptGroup, ActiveToothDetails, ToothDetailsOption, ExtractionPlanParent, ToothDiagnosis, ActiveDiagnoses, ActiveDiagnosisRow } from "./odontogram";
export type { SurfaceCell, SurfaceIndicator } from "./surfaces/cards/SurfaceCross";

/**
 * Root React component for the Odontogram Editor (aka `OdontogramShell`).
 *
 * Renders the full dental chart UI: top bar with language/numbering/dark-mode
 * controls, the SVG tooth grid, and the right-hand control panel for setting
 * tooth states (caries, fillings, crowns, endo, inflammation, etc.).
 *
 * Since the composable-UI refactor (design/composable-ui.md, Tier 1) this is a
 * THIN composition: it mounts {@link OdontogramProvider} (which owns all state,
 * effects and handlers) and lays out the four surface components + the
 * shell-managed perio bits and modals in the default arrangement. The default
 * composition renders byte-identical DOM to the pre-refactor shell (frozen by
 * `src/__tests__/parity/shell-dom.test.tsx`). A host can instead compose the
 * exported surfaces under its own wrappers inside an `OdontogramProvider`.
 *
 * @example
 * ```tsx
 * // Standalone usage
 * <App />
 *
 * // Controlled by a host application
 * <App
 *   language="en"
 *   onLanguageChange={setLang}
 *   numberingSystem="FDI"
 *   onNumberingChange={setNumbering}
 *   darkMode={isDark}
 *   onDarkModeChange={setDark}
 * />
 * ```
 */
export default function App(props: Omit<OdontogramProviderProps, "children">){
  return (
    <OdontogramProvider {...props}>
      <ShellLayout />
    </OdontogramProvider>
  );
}

/**
 * The default shell layout: the four surfaces plus the shell-managed layout
 * wrappers, perio bits, and modals. Reads everything from the provider via
 * {@link useOdontogramUi}; holds no state of its own.
 */
function ShellLayout(){
  const {
    t,
    viewMode,
    activeView,
    setActiveView,
    isPerioView,
    perioChartAvailable,
    perioOpen,
    confirmOpen,
    settingsState,
    settingsOpen,
    setSettingsOpen,
    pdfOpen,
    setPdfOpen,
    creditsOpen,
    setCreditsOpen,
  } = useOdontogramUi();

  return (
    <>
      <OdontogramTopbar />

      <main className="layout">
        {/* Hide the perio entry point (view toggle / open button) entirely when
            the Periodontal chart is turned off in Settings. */}
        <div className={"perio-launch-bar" + (perioChartAvailable ? "" : " hidden")}>
          {viewMode === "toggle" ? (
            <div id="appViewToggle" className="chart-mode-toggle" role="tablist">
              <button
                id="appViewOdontogram"
                type="button"
                className={"chart-mode-btn" + (activeView === "odontogram" ? " is-active" : "")}
                role="tab"
                aria-selected={activeView === "odontogram"}
                onClick={() => setActiveView("odontogram")}
              >
                {t("view.odontogram")}
              </button>
              <button
                id="appViewDentalChart"
                type="button"
                className={"chart-mode-btn" + (activeView === "dentalChart" ? " is-active" : "")}
                role="tab"
                aria-selected={activeView === "dentalChart"}
                onClick={() => setActiveView("dentalChart")}
              >
                {t("view.dentalChart")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="openPerioOverlayBtn"
              className="btn btn-ghost"
              onClick={() => openPerioOverlay()}
              title={t("perio.open")}
              aria-label={t("perio.open")}
            >
              {t("perio.open")}
            </button>
          )}
        </div>
        {/* Unmount the odontogram column while the perio (Dental Chart) view is
            active. Composable-UI Tier 2 made control wiring re-runnable, so the
            column can remount cleanly (OdontogramChartSurface re-runs
            rewireControls()/rebuildGrid() on mount) instead of being hidden. */}
        {!isPerioView && (
          <div className="chart-column">
            <OdontogramChartSurface />
            <ToothInfoSurface />
          </div>
        )}
        {isPerioView && (
          <div className="dental-chart-column" dir="ltr">
            <PerioChart inline />
          </div>
        )}
        <aside className="panel">
          {/* One region, two mutually-exclusive contents: the perio-context
              sidebar in the perio view, the odontogram control panel otherwise.
              ToothControlsSurface can now unmount/remount safely — it re-runs
              rewireControls() on mount (Tier 2) — so it is a plain conditional. */}
          {isPerioView ? <PerioSidebar /> : <ToothControlsSurface />}
        </aside>
      </main>

      {viewMode === "popup" && <PerioChart open={perioOpen} onClose={closePerioOverlay} />}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        t={t}
        settings={settingsState}
      />

      <DualStateConfirm
        open={confirmOpen}
        t={t}
        onAccept={acceptDualStateConfirm}
        onCancel={cancelDualStateConfirm}
      />

      <ExportOptionsModal
        open={pdfOpen}
        t={t}
        onClose={() => setPdfOpen(false)}
      />
      <CreditsModal
        open={creditsOpen}
        t={t}
        onClose={() => setCreditsOpen(false)}
      />
    </>
  );
}
