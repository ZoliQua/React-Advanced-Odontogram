// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Composable-UI foundation (design/composable-ui.md, Tier 1).
//
// `OdontogramProvider` owns the ENTIRE former `App.tsx` component body — all
// state/refs/memos, the `useI18n` call, every `useEffect` (init/destroy first,
// then the configure effects, then the five `onStateChange` mirrors), the
// `settingsState` bundle, and all handlers — and exposes everything the
// surface components + shell modals need through `OdontogramUiContext`. It
// renders the existing root wrapper `<div className="odontogram-root">` and NO
// extra DOM node, so the default shell composition stays byte-identical (proven
// by `src/__tests__/parity/shell-dom.test.tsx`).
//
// Keeping all effects in one component preserves the effect ordering and the
// mount-before-init guarantee the shell relied on: React commits the whole child
// tree to the DOM before the provider's `initOdontogram()` effect runs, so
// `wireControls()` still finds every `#id`. In Tier 1 the surfaces are purely
// presentational — they read this context and hold only strictly region-local UI
// state; they add NO `onStateChange` subscriptions of their own (that is a later
// tier). The header dropdown open flags + outside-click effect are the sole
// region-local state, and live inside `OdontogramTopbar`.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  destroyOdontogram,
  initOdontogram,
  setNumberingSystem,
  registerPlugins,
  getOdontogramSummary,
  onStateChange,
  setReadOnly,
  setNotesEnabled,
  setIcdasEnabled,
  setPulpDetailLevel,
  setSecondaryCariesMode,
  setRootCariesMode,
  setRadiographicDepthMode,
  setCariesDepthEnabled,
  setWearDetailLevel,
  setDiscolorationDetailLevel,
  setSurfaceNotation,
  getPerioViewMode,
  setPerioViewMode,
  getPerioRowVisibility,
  setPerioRowVisibility,
  getPerioIndexNameMode,
  setPerioIndexNameMode,
  getDiagnosisCodingPack,
  setDiagnosisCodingPack,
  getSnomedEnabled,
  setSnomedEnabled,
  getPdfSettings,
  setPdfSettings,
  isDualStateConfirmPending,
  hasAnyPerioData,
  isPerioOverlayOpen,
  closePerioOverlay,
  getChartMode,
  setChartMode,
  getFillingDefectEnabled,
  setFillingDefectEnabled,
  getFillingComplexity,
  setFillingComplexity,
  getFissureSealingEnabled,
  setFissureSealingEnabled,
  getFillingMaterialAvailability,
  setFillingMaterialAvailability,
  getToothAnatomy,
  setToothAnatomy,
} from "./odontogram";
import type {
  OdontogramSummary,
  PulpDetailLevel,
  SecondaryCariesMode,
  RootCariesMode,
  RadiographicDepthMode,
  ToothDetailLevel,
  SurfaceNotation,
  PerioViewMode,
  PerioRowId,
  PerioIndexNameMode,
  ToothAnatomy,
} from "./odontogram";
import { useI18n } from "./i18n/useI18n";
import { isLanguageLoaded, loadLanguage } from "./i18n/loader";
import type { SettingsState, ScreenToothSpacing, ScreenToothNumberSize, SelectionBorderStyle, FillingComplexity } from "./SettingsModal";
import type { Language } from "./i18n/languages";
import type { NumberingSystem } from "./utils/numbering";
import { applyThemeConfig, type OdontogramThemeConfig } from "./theme";
import type { OdontogramPlugin } from "./plugin";

// Languages whose native reading direction is right-to-left (only Arabic today).
// The shell root's `dir` reacts to the active `lang` and never mutates
// `document.documentElement` — an embedding host page's direction is not ours to
// change. The dental/perio charts stay pinned `dir="ltr"` (see `#toothGrid` in
// the chart surface plus the CSS rule in `src/index.css`) since they are diagrams
// read left-to-right in every locale.
const RTL_LANGUAGES: ReadonlySet<Language> = new Set(["ar"]);
function isRtl(lang: Language): boolean {
  return RTL_LANGUAGES.has(lang);
}

/**
 * Props for {@link OdontogramProvider} — the full former `OdontogramShell`
 * (`App`) props surface plus the composed `children`. All state/behavior props
 * are optional: when omitted the provider operates in **standalone** mode with
 * internal state; when provided it operates in **controlled** mode and delegates
 * state to the parent.
 */
export type OdontogramProviderProps = {
  /** Override the UI language (controlled mode). */
  language?: Language;
  /** Callback when the user changes the language. */
  onLanguageChange?: (lang: Language) => void;
  /** Override the tooth numbering system (controlled mode). */
  numberingSystem?: NumberingSystem;
  /** Callback when the user changes the numbering system. */
  onNumberingChange?: (system: NumberingSystem) => void;
  /** Override dark mode state (controlled mode). */
  darkMode?: boolean;
  /** Callback when the user toggles dark mode. */
  onDarkModeChange?: (dark: boolean) => void;
  /**
   * Custom theme configuration. Overrides the default color palette via
   * CSS custom properties (`--odon-*`). See {@link OdontogramThemeConfig}.
   */
  themeConfig?: OdontogramThemeConfig;
  /**
   * Custom SVG plugins for extending the odontogram with additional visual
   * overlays and per-tooth custom state. See {@link OdontogramPlugin}.
   */
  plugins?: OdontogramPlugin[];
  /**
   * When true, disables all interactions (click, touch, keyboard).
   * Useful for print/report/view modes.
   */
  readOnly?: boolean;
  /**
   * When true, enables per-tooth notes. Double-click a tooth to add/edit a note.
   * Notes are shown in hover tooltips and included in JSON export/import.
   */
  enableNotes?: boolean;
  /**
   * Enable ICDAS II per-surface caries scoring (0–6). When enabled, the depth
   * selector/popup expose ICDAS codes 1–6 and the surface indicator shows a
   * numeric badge; otherwise the 3-level scale is used.
   */
  enableIcdas?: boolean;
  /**
   * Pulp-diagnosis detail level for the pulp control:
   * `"simple"` (healthy / pulpitis), `"aae"` (4 AAE pulp diagnoses, default) or
   * `"latin"` (9 practical-Latin subtypes). A stored value round-trips at every
   * level; the level only governs how the pulp control presents it.
   */
  pulpDetailLevel?: PulpDetailLevel;
  /**
   * Secondary-caries (CARS) granularity for the per-surface score picker:
   * `"simple"` ([0,3]), `"standard"` ([0,1,3,6], default) or `"full"` ([0..6]).
   * A stored score round-trips at every mode; the mode only governs the offered
   * option list. (The mode UI lives in the Settings modal; this prop is the
   * controlled entry point.)
   */
  secondaryCariesMode?: SecondaryCariesMode;
  /**
   * Root-caries granularity for the per-tooth picker: `"simple"` (none /
   * present, default) or `"severity"` (the full none/active/arrested/
   * active-cavitated enum). Non-collapsing across modes.
   */
  rootCariesMode?: RootCariesMode;
  /**
   * Radiographic-depth granularity for the per-surface picker: `"off"`
   * (hidden, default), `"threeLevel"` (superficial/middle/deep) or `"detailed"`
   * (E1..D3). When off, the per-surface radiographic badge is not shown.
   */
  radiographicDepthMode?: RadiographicDepthMode;
  /**
   * Whether the visual caries-depth encoding (per-surface depth picker + the
   * opacity/contour depth tier in the render) is active. Default `true`; set
   * `false` to render caried surfaces at the SVG default with no depth tier.
   */
  cariesDepthEnabled?: boolean;
  /**
   * Detail level for the per-tooth wear control: `"simple"` (yes/no toggle for
   * attrition) or `"complex"` (wear type per edge and cervix, default).
   */
  wearDetailLevel?: ToothDetailLevel;
  /**
   * Detail level for the per-tooth discoloration control: `"simple"` (yes/no
   * toggle) or `"complex"` (choose the discoloration cause, default).
   */
  discolorationDetailLevel?: ToothDetailLevel;
  /**
   * Surface-notation mode for caries/filling surface letters + captions:
   * `"full"` (default) makes them position-aware (incisal on an anterior
   * tooth, labial on an anterior buccal surface, palatal on an upper lingual
   * surface) or `"simple"` (always the tooth-independent B/O/L set).
   */
  surfaceNotation?: SurfaceNotation;
  /**
   * Whether the Statuses panel (`#statusCard`) is shown. Default `true`. The
   * panel visibility is a settings-driven wrapper around the section — the
   * section's own imperative collapse/expand behavior is unaffected.
   */
  showStatusCard?: boolean;
  /**
   * Whether the Orthodontics panel (`#orthoCard`) is shown. Default `true`.
   * Composes with the panel's own imperative ortho-eligibility gate (hidden
   * when no selected tooth is ortho-eligible) — both must be satisfied for
   * the panel to render.
   */
  showOrthoCard?: boolean;
  /**
   * Filling-complexity level for the Fillings card: `"simple"` (one material
   * per tooth, no per-surface picker) or `"complex"` (per-surface materials,
   * default). Contrast with {@link settings.panels} — this one mirrors the
   * `fillingComplexity` engine flag (Settings → Fillings). When provided, the
   * value overrides the engine/UI default; when omitted, whatever the engine
   * holds (module default or a prior `setFillingComplexity` call) stays put.
   */
  fillingComplexity?: FillingComplexity;
  /**
   * Called after the user changes the filling-complexity level in the
   * Settings modal: `(value: FillingComplexity) => void`. Not fired for
   * prop-driven restores. The write-back counterpart of {@link fillingComplexity}.
   */
  onFillingComplexityChange?: (value: FillingComplexity) => void;
  /**
   * Whether filling-defect findings are enabled on the Fillings card. Default
   * `true`. Mirrors the `fillingDefectEnabled` engine flag (Settings →
   * Fillings); same controlled/standalone contract as {@link fillingComplexity}.
   */
  fillingDefectEnabled?: boolean;
  /** See {@link onFillingComplexityChange} — the defect toggle's counterpart. */
  onFillingDefectEnabledChange?: (enabled: boolean) => void;
  /**
   * Available filling materials as a `Record<material, boolean>` over
   * `"amalgam" | "composite" | "gic" | "temporary"` (unknown keys are
   * ignored). Default: all four available. Mirrors the `fillingMaterialAvail`
   * engine map (Settings → Fillings). Hosts may pass an inline literal — the
   * sync effect keys on a canonical serialized form, so re-renders with
   * identical content do not re-fire.
   */
  fillingMaterialAvailability?: Record<string, boolean>;
  /**
   * Called after the user toggles a material in the Settings modal:
   * `(material: string, enabled: boolean) => void` — per-material, mirroring
   * the engine's `setFillingMaterialAvailability` setter (no whole-record
   * change ever happens). Not fired for prop-driven restores.
   */
  onFillingMaterialAvailabilityChange?: (material: string, enabled: boolean) => void;
  /**
   * Whether fissure-sealing is offered on the Fillings card. Default `true`.
   * Mirrors the `fissureSealingEnabled` engine flag (Settings → Fillings);
   * same controlled/standalone contract as {@link fillingComplexity}.
   */
  fissureSealingEnabled?: boolean;
  /** See {@link onFillingComplexityChange} — the fissure-sealing toggle's counterpart. */
  onFissureSealingEnabledChange?: (enabled: boolean) => void;
  /** The composed UI (surfaces + shell layout). */
  children?: ReactNode;
};

/** The translate function surfaced by {@link useI18n}. */
type TranslateFn = ReturnType<typeof useI18n>["t"];

/**
 * Everything the surface components and shell-managed modals consume. Cross-cutting
 * state read across ≥2 regions/modals lives here; strictly region-local state
 * (the header dropdown open flags + outside-click effect) stays inside its surface.
 */
export type OdontogramUiContextValue = {
  t: TranslateFn;
  lang: Language;
  setLang: (lang: Language) => void;
  isDark: boolean;
  toggleDark: () => void;
  currentNumbering: NumberingSystem;
  setNumbering: (next: NumberingSystem) => void;
  // Perio-view / layout flags.
  viewMode: PerioViewMode;
  activeView: "odontogram" | "dentalChart";
  setActiveView: (view: "odontogram" | "dentalChart") => void;
  isPerioView: boolean;
  perioChartAvailable: boolean;
  perioOpen: boolean;
  confirmOpen: boolean;
  // Export / import gates.
  hasPerio: boolean;
  exportPngOn: boolean;
  exportJpgOn: boolean;
  exportSvgOn: boolean;
  exportPdfOn: boolean;
  importStatusOn: boolean;
  importFhirOn: boolean;
  // Tooth-information panel.
  summary: OdontogramSummary | null;
  toothInfoOn: boolean;
  // Chart styling (shared between the chart surface and the Settings modal).
  screenSpacing: ScreenToothSpacing;
  screenNumberSize: ScreenToothNumberSize;
  selectionColor: string;
  selectionBorderStyle: SelectionBorderStyle;
  // Active tooth-anatomy profile (drives the chart surface's `data-anatomy`).
  toothAnatomy: ToothAnatomy;
  planModeAvailable: boolean;
  // Right-panel card gates.
  showStatusCard: boolean;
  showOrthoCard: boolean;
  // Modal plumbing.
  settingsState: SettingsState;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  pdfOpen: boolean;
  setPdfOpen: (open: boolean) => void;
  creditsOpen: boolean;
  setCreditsOpen: (open: boolean) => void;
  caseDxOpen: boolean;
  setCaseDxOpen: (open: boolean) => void;
};

const OdontogramUiContext = createContext<OdontogramUiContextValue | null>(null);

/**
 * Read the shared odontogram UI context. Throws when used outside an
 * {@link OdontogramProvider}, so a misplaced surface fails loudly at mount.
 */
export function useOdontogramUi(): OdontogramUiContextValue {
  const ctx = useContext(OdontogramUiContext);
  if (ctx === null) {
    throw new Error("useOdontogramUi must be used within an <OdontogramProvider>.");
  }
  return ctx;
}

/**
 * Owns all odontogram shell state, effects, and handlers and provides them to
 * composed surfaces + modals. Renders only the `.odontogram-root` wrapper around
 * `children` — no extra DOM node.
 *
 * Holds its first render until the requested `language` has loaded: every UI
 * language but English is a lazily fetched chunk, and mounting before it
 * arrives would paint the whole chart in the English fallback and then repaint
 * it — a visible flash of the wrong language on every page load. English (and
 * any language already loaded) renders on the very first pass, as before.
 */
export function OdontogramProvider(props: OdontogramProviderProps) {
  const ready = useLanguageReady(props.language);
  if(!ready) return null;
  return <OdontogramProviderInner {...props} />;
}

/** Whether the provider may render yet. Gates the FIRST render only: once it
 *  has been true it stays true, because returning `null` later would unmount
 *  the whole chart — engine, selection and all — just to switch language. A
 *  switch after mount is handled by `useI18n`, which keeps the previous
 *  language on screen until the new one arrives.
 *
 *  A load that FAILS still opens the gate: rendering in the English fallback
 *  beats rendering nothing forever, and `setI18nLanguage()` reports the error. */
function useLanguageReady(language: Language | undefined): boolean {
  const [ready, setReady] = useState(() => language === undefined || isLanguageLoaded(language));
  useEffect(() => {
    if(ready) return;
    if(language === undefined || isLanguageLoaded(language)){ setReady(true); return; }
    let cancelled = false;
    const open = () => { if(!cancelled) setReady(true); };
    loadLanguage(language).then(open, open);
    return () => { cancelled = true; };
  }, [language, ready]);
  return ready;
}

function OdontogramProviderInner({
  children,
  language,
  onLanguageChange,
  numberingSystem,
  onNumberingChange,
  darkMode,
  onDarkModeChange,
  themeConfig,
  plugins,
  readOnly: readOnlyProp,
  enableNotes,
  enableIcdas,
  pulpDetailLevel,
  secondaryCariesMode,
  rootCariesMode,
  radiographicDepthMode,
  cariesDepthEnabled,
  wearDetailLevel,
  discolorationDetailLevel,
  surfaceNotation,
  showStatusCard: showStatusCardProp,
  showOrthoCard: showOrthoCardProp,
  fillingComplexity,
  onFillingComplexityChange,
  fillingDefectEnabled: fillingDefectEnabledProp,
  onFillingDefectEnabledChange,
  fillingMaterialAvailability,
  onFillingMaterialAvailabilityChange,
  fissureSealingEnabled: fissureSealingEnabledProp,
  onFissureSealingEnabledChange,
}: OdontogramProviderProps) {
  const { lang, setLang, t } = useI18n({ language, onLanguageChange });
  const [internalNumbering, setInternalNumbering] = useState<NumberingSystem>(numberingSystem ?? "FDI");
  const themeRootRef = useRef<HTMLDivElement | null>(null);
  const currentNumbering = numberingSystem ?? internalNumbering;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesOn, setNotesOn] = useState<boolean>(enableNotes ?? false);
  const [icdasOn, setIcdasOn] = useState<boolean>(enableIcdas ?? false);
  const [pulpLevel, setPulpLevel] = useState<PulpDetailLevel>(pulpDetailLevel ?? "aae");
  const [secondaryMode, setSecondaryMode] = useState<SecondaryCariesMode>(secondaryCariesMode ?? "standard");
  const [rootMode, setRootMode] = useState<RootCariesMode>(rootCariesMode ?? "simple");
  const [radiographicMode, setRadiographicMode] = useState<RadiographicDepthMode>(radiographicDepthMode ?? "off");
  const [cariesDepthOn, setCariesDepthOn] = useState<boolean>(cariesDepthEnabled ?? true);
  const [wearLevel, setWearLevel] = useState<ToothDetailLevel>(wearDetailLevel ?? "complex");
  const [discoLevel, setDiscoLevel] = useState<ToothDetailLevel>(discolorationDetailLevel ?? "complex");
  const [notation, setNotation] = useState<SurfaceNotation>(surfaceNotation ?? "full");
  const [toothInfoOn, setToothInfoOn] = useState<boolean>(true);
  // Per-format export + per-source import availability (session-only UI config).
  // All default ON. A disabled format/source hides its export/import menu item;
  // disabling PDF also disables the Export Settings tab.
  const [exportPngOn, setExportPngOn] = useState<boolean>(true);
  const [exportJpgOn, setExportJpgOn] = useState<boolean>(true);
  const [exportSvgOn, setExportSvgOn] = useState<boolean>(true);
  const [exportPdfOn, setExportPdfOn] = useState<boolean>(true);
  const [importStatusOn, setImportStatusOn] = useState<boolean>(true);
  const [importFhirOn, setImportFhirOn] = useState<boolean>(true);
  // Odontogram-tab on-screen controls (session-only).
  const [planModeAvailable, setPlanModeAvailable] = useState<boolean>(true);
  const [perioChartAvailable, setPerioChartAvailable] = useState<boolean>(true);
  const [screenSpacing, setScreenSpacing] = useState<ScreenToothSpacing>("normal");
  const [screenNumberSize, setScreenNumberSize] = useState<ScreenToothNumberSize>("normal");
  // Adjustable tooth-selection colour + border style.
  const [selectionColor, setSelectionColor] = useState<string>("#3b7bff");
  const [selectionBorderStyle, setSelectionBorderStyle] = useState<SelectionBorderStyle>("dashed");
  // Fillings-tab config (mirrors odontogram.ts module flags). The initializers
  // prefer a provided prop, falling back to the engine's current module value —
  // an imperative setX call before mount is never clobbered by a plain default.
  const [fillingDefectOn, setFillingDefectOn] = useState<boolean>(() => fillingDefectEnabledProp ?? getFillingDefectEnabled());
  const [fillingComplexityState, setFillingComplexityState] = useState<FillingComplexity>(() => fillingComplexity ?? getFillingComplexity());
  const [fissureSealingOn, setFissureSealingOn] = useState<boolean>(() => fissureSealingEnabledProp ?? getFissureSealingEnabled());
  const [fillingMaterialsState, setFillingMaterialsState] = useState<Record<string, boolean>>(() => fillingMaterialAvailability ?? getFillingMaterialAvailability());
  const [showStatusCard, setShowStatusCard] = useState<boolean>(showStatusCardProp ?? true);
  const [showOrthoCard, setShowOrthoCard] = useState<boolean>(showOrthoCardProp ?? true);
  const [summary, setSummary] = useState<OdontogramSummary | null>(null);
  const [hasPerio, setHasPerio] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [caseDxOpen, setCaseDxOpen] = useState(false);
  // Mirror the module-level perio-overlay flag into React state, kept in sync via
  // the onStateChange subscription below so a host that calls openPerioOverlay()/
  // closePerioOverlay() directly (bypassing this button) still re-renders <PerioChart/>.
  const [perioOpen, setPerioOpen] = useState(false);
  // Mirror the module-level perioViewMode flag into React state, kept in sync via
  // onStateChange so a host calling setPerioViewMode() directly (e.g. from the
  // Settings modal) re-renders the housing without a dedicated local setter.
  // `activeView` is purely local UI state (never exposed to a host) — which of the
  // toggle's two segments is showing, only meaningful while `viewMode === "toggle"`.
  const [viewMode, setViewMode] = useState<PerioViewMode>(() => getPerioViewMode());
  const [activeView, setActiveView] = useState<"odontogram" | "dentalChart">("odontogram");
  // Mirror the module-level tooth-anatomy profile into React state, kept in sync
  // via onStateChange (setToothAnatomy notifies) so a host calling it directly
  // re-renders both the Settings select and the chart surface's data-anatomy.
  const [toothAnatomy, setToothAnatomyState] = useState<ToothAnatomy>(() => getToothAnatomy());
  // Mirror the two Settings -> Periodontal tab module flags into React state,
  // kept in sync via the shared `onStateChange` subscription so a host calling
  // the setters directly still re-renders the Settings modal.
  const [perioRowVisibility, setPerioRowVisibilityState] = useState<Record<PerioRowId, boolean>>(
    () => getPerioRowVisibility(),
  );
  const [perioIndexNameMode, setPerioIndexNameModeState] = useState<PerioIndexNameMode>(
    () => getPerioIndexNameMode(),
  );
  // Mirror the module-level diagnosis coding-pack flag into React state, kept
  // in sync via onStateChange the same way perioViewMode is mirrored above.
  const [codingPack, setCodingPackState] = useState<string>(() => getDiagnosisCodingPack());
  // Mirror the module-level SNOMED CT overlay flag into React state, kept in
  // sync via onStateChange the same way codingPack is mirrored above.
  const [snomedEnabled, setSnomedEnabledState] = useState<boolean>(() => getSnomedEnabled());
  // PDF export settings mirror (session-only module state).
  const [pdfSettings, setPdfSettingsState] = useState(() => getPdfSettings());
  // Whether the perio (Dental Chart) view is the one currently showing — ONLY
  // true in toggle-mode dentalChart; popup mode never gates the shared right
  // panel this way (the popup renders <PerioSidebar/> in its own body, see
  // PerioChart.tsx). Drives which content the shared right `<aside
  // className="panel">` below renders.
  const isPerioView = viewMode === "toggle" && activeView === "dentalChart";
  // Mirror the module-level "a status edit on a planned tooth is awaiting
  // confirmation" flag into React state via the onStateChange subscription
  // (requestDualStateConfirm / accept / cancel all notify), so the blocking
  // confirm dialog opens/closes regardless of which gated edit raised it.
  // Starts false — a confirm can only be requested by a post-mount edit, so
  // there is never a pending confirm at mount.
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dark mode: controlled via prop or standalone via internal state
  const [internalDark, setInternalDark] = useState<boolean>(() => {
    if (darkMode !== undefined) return darkMode;
    if (typeof document !== "undefined") return document.documentElement.classList.contains("dark");
    return false;
  });
  const isDark = darkMode !== undefined ? darkMode : internalDark;

  // Only manage the .dark class when standalone (no darkMode prop from parent)
  useEffect(() => {
    if (darkMode === undefined) {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark, darkMode]);

  const toggleDark = () => {
    const next = !isDark;
    if (darkMode !== undefined) {
      onDarkModeChange?.(next);
    } else {
      setInternalDark(next);
      onDarkModeChange?.(next);
    }
  };

  const setNumbering = (next: NumberingSystem) => {
    if(numberingSystem){
      onNumberingChange?.(next);
      return;
    }
    setInternalNumbering(next);
    onNumberingChange?.(next);
  };

  useEffect(() => {
    initOdontogram();
    return () => {
      destroyOdontogram();
    };
  }, []);

  useEffect(() => {
    setNumberingSystem(currentNumbering);
  }, [currentNumbering]);

  // Apply custom theme config as CSS custom properties
  useEffect(() => {
    applyThemeConfig(themeRootRef.current, themeConfig);
  }, [themeConfig]);

  // Register plugins when provided or changed
  useEffect(() => {
    registerPlugins(plugins ?? []);
  }, [plugins]);

  // Sync read-only mode
  useEffect(() => {
    setReadOnly(readOnlyProp ?? false);
  }, [readOnlyProp]);

  // Sync notes enabled
  useEffect(() => {
    setNotesEnabled(enableNotes ?? false);
    setNotesOn(enableNotes ?? false);
  }, [enableNotes]);

  // Sync ICDAS mode enabled
  useEffect(() => {
    setIcdasEnabled(enableIcdas ?? false);
    setIcdasOn(enableIcdas ?? false);
  }, [enableIcdas]);

  // Sync pulp-detail level (controlled prop -> engine + local segmented control)
  useEffect(() => {
    setPulpDetailLevel(pulpDetailLevel ?? "aae");
    setPulpLevel(pulpDetailLevel ?? "aae");
  }, [pulpDetailLevel]);

  // Sync the caries-granularity settings (controlled props -> engine). The
  // mode-picker UI lives in the Settings modal; these props are the controlled
  // entry point so hosts (and tests) can drive the modes.
  useEffect(() => {
    const v = secondaryCariesMode ?? "standard";
    setSecondaryCariesMode(v);
    setSecondaryMode(v);
  }, [secondaryCariesMode]);
  useEffect(() => {
    const v = rootCariesMode ?? "simple";
    setRootCariesMode(v);
    setRootMode(v);
  }, [rootCariesMode]);
  useEffect(() => {
    const v = radiographicDepthMode ?? "off";
    setRadiographicDepthMode(v);
    setRadiographicMode(v);
  }, [radiographicDepthMode]);
  useEffect(() => {
    const v = cariesDepthEnabled ?? true;
    setCariesDepthEnabled(v);
    setCariesDepthOn(v);
  }, [cariesDepthEnabled]);
  useEffect(() => { const v = wearDetailLevel ?? "complex"; setWearDetailLevel(v); setWearLevel(v); }, [wearDetailLevel]);
  useEffect(() => { const v = discolorationDetailLevel ?? "complex"; setDiscolorationDetailLevel(v); setDiscoLevel(v); }, [discolorationDetailLevel]);
  useEffect(() => { const v = surfaceNotation ?? "full"; setSurfaceNotation(v); setNotation(v); }, [surfaceNotation]);
  useEffect(() => { setShowStatusCard(showStatusCardProp ?? true); }, [showStatusCardProp]);
  useEffect(() => { setShowOrthoCard(showOrthoCardProp ?? true); }, [showOrthoCardProp]);

  // Fillings-tab controlled props (Settings → Fillings). Unlike the settings
  // above, these sync DEFINED-GATED: an omitted prop must never write the
  // engine, because the fillings flags genuinely live in module state (a host
  // may call setFillingComplexity() etc. before mounting and the initializers
  // above read that value). Provided prop → engine + local React state are
  // written together, so the Settings modal never shows a stale value.
  useEffect(() => {
    if (fillingComplexity !== undefined) { setFillingComplexity(fillingComplexity); setFillingComplexityState(fillingComplexity); }
  }, [fillingComplexity]);
  useEffect(() => {
    if (fillingDefectEnabledProp !== undefined) { setFillingDefectEnabled(fillingDefectEnabledProp); setFillingDefectOn(fillingDefectEnabledProp); }
  }, [fillingDefectEnabledProp]);
  useEffect(() => {
    if (fissureSealingEnabledProp !== undefined) { setFissureSealingEnabled(fissureSealingEnabledProp); setFissureSealingOn(fissureSealingEnabledProp); }
  }, [fissureSealingEnabledProp]);
  // Canonical serialized key over the material record — an inline-literal prop
  // re-renders every time, but the effect below only fires when the CONTENT
  // changes (sorted keys, so key order never matters). `null` = prop absent.
  const fillingMaterialsKey = useMemo(() => {
    if (fillingMaterialAvailability === undefined) return null;
    const entries = Object.keys(fillingMaterialAvailability).sort().map((m) => [m, !!fillingMaterialAvailability[m]]);
    return JSON.stringify(entries);
  }, [fillingMaterialAvailability]);
  // The engine's setters are idempotent; diff against the last applied record
  // so only materials whose availability actually changed are written.
  const prevMaterialsRef = useRef<Record<string, boolean> | null>(null);
  useEffect(() => {
    if (fillingMaterialsKey === null) { prevMaterialsRef.current = null; return; }
    const entries = JSON.parse(fillingMaterialsKey) as [string, boolean][];
    const next = Object.fromEntries(entries);
    const prev = prevMaterialsRef.current ?? {};
    for (const [m, on] of entries) {
      if (prev[m] !== on) setFillingMaterialAvailability(m, on);
    }
    prevMaterialsRef.current = next;
    setFillingMaterialsState({ ...next });
  }, [fillingMaterialsKey]);

  // Refresh the tooth-information summary while its panel is open. Recomputes on
  // every state change, and when language/numbering change (which affect labels).
  useEffect(() => {
    if(!toothInfoOn) return;
    const refresh = () => {
      setSummary(getOdontogramSummary());
    };
    refresh();
    return onStateChange(refresh);
  }, [toothInfoOn, lang, currentNumbering]);

  // Mirror perio-data presence into React state so the perio export menu items'
  // `disabled` gate stays live. Deliberately its OWN effect, subscribed
  // UNCONDITIONALLY (not gated by `toothInfoOn` like the summary effect above) —
  // the export gate must track charted perio data even when the Tooth-info panel
  // is turned off.
  useEffect(() => {
    const refresh = () => setHasPerio(hasAnyPerioData());
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the module-level perio-overlay flag into React state via the
  // onStateChange subscription (openPerioOverlay/closePerioOverlay both call
  // notifyStateChange()), so <PerioChart/> re-renders whether it was opened/closed
  // via this button or a host calling the imperative API directly.
  useEffect(() => {
    const refresh = () => setPerioOpen(isPerioOverlayOpen());
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the module-level perioViewMode flag into React state the same way
  // perioOpen mirrors isPerioOverlayOpen() above.
  useEffect(() => {
    const refresh = () => setViewMode(getPerioViewMode());
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the module-level tooth-anatomy profile the same way perioViewMode is
  // mirrored above.
  useEffect(() => {
    const refresh = () => setToothAnatomyState(getToothAnatomy());
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the module-level perioRowVisibility/perioIndexNameMode flags into
  // React state the same way perioViewMode is mirrored above.
  useEffect(() => {
    const refresh = () => {
      setPerioRowVisibilityState(getPerioRowVisibility());
      setPerioIndexNameModeState(getPerioIndexNameMode());
    };
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the module-level diagnosis coding-pack flag into React state the
  // same way perioViewMode is mirrored above.
  useEffect(() => {
    const refresh = () => setCodingPackState(getDiagnosisCodingPack());
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the module-level SNOMED CT overlay flag into React state the same
  // way codingPack is mirrored above.
  useEffect(() => {
    const refresh = () => setSnomedEnabledState(getSnomedEnabled());
    refresh();
    return onStateChange(refresh);
  }, []);

  // Mirror the pending-confirm flag into React state. Subscribe only (no initial
  // read) — a confirm is only ever requested by a post-mount edit, so
  // `confirmOpen` starts false and this never calls the module during initial render.
  useEffect(() => {
    return onStateChange(() => setConfirmOpen(isDualStateConfirmPending()));
  }, []);

  // Live settings surface for the tabbed Settings modal. Each handler updates
  // local React state and calls the matching module accessor.
  const settingsState: SettingsState = {
    numbering: currentNumbering,
    onNumbering: setNumbering,
    language: lang,
    onLanguage: setLang,
    isDark,
    onToggleDark: toggleDark,
    toothInfo: toothInfoOn,
    onToothInfo: (v) => setToothInfoOn(v),
    exportPng: exportPngOn,
    onExportPng: (v) => setExportPngOn(v),
    exportJpg: exportJpgOn,
    onExportJpg: (v) => setExportJpgOn(v),
    exportSvg: exportSvgOn,
    onExportSvg: (v) => setExportSvgOn(v),
    exportPdf: exportPdfOn,
    onExportPdf: (v) => setExportPdfOn(v),
    importStatus: importStatusOn,
    onImportStatus: (v) => setImportStatusOn(v),
    importFhir: importFhirOn,
    onImportFhir: (v) => setImportFhirOn(v),
    secondaryCariesMode: secondaryMode,
    onSecondaryCariesMode: (v) => { setSecondaryMode(v); setSecondaryCariesMode(v); },
    icdas: icdasOn,
    onIcdas: (v) => { setIcdasOn(v); setIcdasEnabled(v); },
    cariesDepth: cariesDepthOn,
    onCariesDepth: (v) => { setCariesDepthOn(v); setCariesDepthEnabled(v); },
    rootCariesMode: rootMode,
    onRootCariesMode: (v) => { setRootMode(v); setRootCariesMode(v); },
    radiographicDepthMode: radiographicMode,
    onRadiographicDepthMode: (v) => { setRadiographicMode(v); setRadiographicDepthMode(v); },
    pulpLevel,
    onPulpLevel: (v) => { setPulpLevel(v); setPulpDetailLevel(v); },
    wearDetailLevel: wearLevel,
    onWearDetailLevel: (v) => { setWearLevel(v); setWearDetailLevel(v); },
    discolorationDetailLevel: discoLevel,
    onDiscolorationDetailLevel: (v) => { setDiscoLevel(v); setDiscolorationDetailLevel(v); },
    surfaceNotation: notation,
    onSurfaceNotation: (v) => { setNotation(v); setSurfaceNotation(v); },
    notes: notesOn,
    onNotes: (v) => { setNotesOn(v); setNotesEnabled(v); },
    planModeAvailable,
    onPlanModeAvailable: (v) => {
      setPlanModeAvailable(v);
      // Leaving plan unavailable must not strand the chart in plan mode.
      if (!v && getChartMode() === "plan") setChartMode("status");
    },
    screenToothSpacing: screenSpacing,
    onScreenToothSpacing: (v) => setScreenSpacing(v),
    screenToothNumberSize: screenNumberSize,
    onScreenToothNumberSize: (v) => setScreenNumberSize(v),
    toothAnatomy,
    onToothAnatomy: (v) => {
      // React state is deliberately NOT set optimistically here, and the grid is
      // NOT rebuilt here. setToothAnatomy is async since 2.6.0 (the measured
      // artwork is a lazily loaded chunk); it rebuilds the grid itself and only
      // then notifies, and the `onStateChange` mirror above is what flips
      // `toothAnatomy`. Setting the state up front instead put `data-anatomy=
      // "measured"` (and its two-arch CSS) on a grid still drawn on the classic
      // profile for the whole download, collapsing the layout — and left the UI
      // permanently out of step with the engine if the chunk never arrived.
      void setToothAnatomy(v);
    },
    selectionColor,
    onSelectionColor: (v) => setSelectionColor(v),
    selectionBorderStyle,
    onSelectionBorderStyle: (v) => setSelectionBorderStyle(v),
    perioChartAvailable,
    onPerioChartAvailable: (v) => {
      setPerioChartAvailable(v);
      // Turning perio off must leave the user on the odontogram, not stranded on
      // a now-hidden perio view / open overlay.
      if (!v) { setActiveView("odontogram"); closePerioOverlay(); }
    },
    showStatusCard,
    onShowStatusCard: (v) => setShowStatusCard(v),
    showOrthoCard,
    onShowOrthoCard: (v) => setShowOrthoCard(v),
    perioViewMode: viewMode,
    onPerioViewMode: (v) => setPerioViewMode(v),
    perioRowVisibility,
    onPerioRowVisibility: (id, v) => setPerioRowVisibility(id, v),
    perioIndexNameMode,
    onPerioIndexNameMode: (v) => setPerioIndexNameMode(v),
    codingPack,
    onDiagnosisCodingPack: (v) => setDiagnosisCodingPack(v),
    snomedEnabled,
    onSnomedEnabled: (v: boolean) => setSnomedEnabled(v),
    fillingDefectEnabled: fillingDefectOn,
    onFillingDefectEnabled: (v) => { setFillingDefectOn(v); setFillingDefectEnabled(v); onFillingDefectEnabledChange?.(v); },
    fillingComplexity: fillingComplexityState,
    onFillingComplexity: (v) => { setFillingComplexityState(v); setFillingComplexity(v); onFillingComplexityChange?.(v); },
    fillingMaterials: fillingMaterialsState,
    onFillingMaterial: (m, v) => { setFillingMaterialsState((prev) => ({ ...prev, [m]: v })); setFillingMaterialAvailability(m, v); onFillingMaterialAvailabilityChange?.(m, v); },
    fissureSealingEnabled: fissureSealingOn,
    onFissureSealingEnabled: (v) => { setFissureSealingOn(v); setFissureSealingEnabled(v); onFissureSealingEnabledChange?.(v); },
    pdfSettings,
    onPdfSettings: (patch) => { setPdfSettings(patch); setPdfSettingsState(getPdfSettings()); },
  };

  const value: OdontogramUiContextValue = {
    t,
    lang,
    setLang,
    isDark,
    toggleDark,
    currentNumbering,
    setNumbering,
    viewMode,
    activeView,
    setActiveView,
    isPerioView,
    perioChartAvailable,
    perioOpen,
    confirmOpen,
    hasPerio,
    exportPngOn,
    exportJpgOn,
    exportSvgOn,
    exportPdfOn,
    importStatusOn,
    importFhirOn,
    summary,
    toothInfoOn,
    screenSpacing,
    screenNumberSize,
    selectionColor,
    selectionBorderStyle,
    toothAnatomy,
    planModeAvailable,
    showStatusCard,
    showOrthoCard,
    settingsState,
    settingsOpen,
    setSettingsOpen,
    pdfOpen,
    setPdfOpen,
    creditsOpen,
    setCreditsOpen,
    caseDxOpen,
    setCaseDxOpen,
  };

  return (
    <OdontogramUiContext.Provider value={value}>
      <div ref={themeRootRef} className="odontogram-root" dir={isRtl(lang) ? "rtl" : "ltr"} lang={lang}>
        {children}
      </div>
    </OdontogramUiContext.Provider>
  );
}
