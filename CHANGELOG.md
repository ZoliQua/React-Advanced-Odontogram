# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Dental diagnosis coding (DX-0 foundation).** Charted findings now export as
  FHIR `Condition` resources with a WHO ICD-10 base coding, plus an optional
  pluggable national code pack (Settings → General → Diagnosis coding system;
  ships WHO-only + BNO-10). DX-0 covers caries (K02) and refactors the perio
  (K05) Condition to share the coding builder (default output unchanged). More
  findings, the diagnosis picker, and further packs (US ICD-10-CM, SNOMED) follow
  in later sub-projects.
- **Dental diagnosis coding: charted findings (DX-1).** Beyond caries, the FHIR
  export now derives WHO ICD-10 `Condition`s for pulp (K04.0/.1), apical
  (K04.4-.9, radicular cyst K04.8), root caries (K02.2/.3), tooth wear (K03.0-.2,
  .8), resorption (K03.3), calculus (K03.6), discoloration (K00.3/.8, K03.7),
  tooth loss (K08.1) and retained root (K08.3) — one Condition per finding per
  tooth, presence-gated. Fractures and peri-implant disease are not yet coded
  (no WHO ICD-10 code). The active national pack (e.g. BNO-10) still overlays.
- **Dental diagnosis coding: per-tooth picker + overrides (DX-2).** A new
  Diagnoses card lists a tooth's chart-derived ICD-10 diagnoses and lets the
  clinician suppress one or add a tooth-level diagnosis the chart does not
  represent; the effective coded set (derived − suppressed + added) drives the
  FHIR export and the coded-diagnoses summary/tooltip. Payload 2.21 (additive
  `dxOverrides`); the visual chart is unaffected.
- **Guided intro tour, reworked and extended.** The tour now steps with the left
  and right arrow keys (a teardown bug used to unbind the keyboard handler after
  the first step), targets the real restoration control instead of a control that
  no longer exists, points the numbering step at Settings (where numbering now
  lives) and the language step at the language menu, and grows from 12 to 16 steps
  with new steps for root canal treatment and the periodontal view (it switches
  into the periodontal view and back, and skips those steps when the periodontal
  chart is turned off). The Intro toolbar icon is now a play in a circle.
- **About and credits popup.** A new toolbar button after Import opens an About
  and credits dialog with a short program description, a contributor list that
  links each person to their GitHub profile, the external libraries the app is
  built with, an invitation to open a pull request, and a Star on GitHub badge. A
  GitHub link is also added to the toolbar. Translated into all 12 UI languages.
- **Community health files.** Added `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` and
  `SECURITY.md`, and a Credits section to every language README in `lang/`.
- **Selectable tooth-anatomy profile (Settings → Odontogram → Tooth anatomy;
  #18/#22).** A new session-level setting chooses the tooth-anatomy profile:
  **classic** (the default, unchanged) or **measured**. The measured profile
  renders nine literature-measured tooth templates in a two-arch, per-tooth-width
  layout (from the cognovis "candidate anatomy" work), switchable at runtime via
  the shared session. The `tools/toothgen` Python generator (dev-only, out of the
  npm package) regenerates the measured drawings from their hand-authored source
  SVGs. No payload/render change for the classic profile; goldens byte-identical.
  **Known limitation:** the measured molar templates 17/46 omit ~16 milktooth /
  pulp-inflammation layers, so those specific findings do not draw on those
  positions in the measured profile.
- **Composable UI: declarative control cards (issue #20, Tier 3).** The control
  cards are being converted from imperative id-bound wiring to self-contained
  declarative React components (following `PerioSidebar`), one per release step,
  each reading engine state via a new `useEngineState()` hook and writing through
  new getters/selection-setters. Converted so far: the **Orthodontics** card
  (`OrthodonticsCard`; `getActiveOrtho()`, `setOrtho{Appliance,Drift,Vertical,Rotation}ForSelection`)
  the **Statuses** card body (`StatusesCard`; `getEdentulous()`, `resetMouth()`,
  reusing `setEdentulous`/`applyPrimaryDentition`/`applyMixedDentition`/`getStatusExtras`/`applyStatusExtra`)
  — also fully declarativizing the Edentulous toggle (its `aria-pressed` now derives
  from state, replacing the delegated handler + imperative syncs) — and the
  **Caries** card body (`CariesCard` + a reusable `SurfaceCross` per-surface grid
  component; `getActiveCaries()` + its selection setters), and the **Fillings** card
  body (`FillingsCard`, reusing `SurfaceCross` with the recurrent-caries + defect
  indicators and the simple/complex mode swap; `getActiveFillings()` + its setters),
  and the **Root / periodontium** card body (`RootPeriodontiumCard`;
  `getActiveRootPerio()` + its setters — pulp/endo optgroups with the endo↔pulpDx
  exclusion, apical/resorption/mobility/peri-implant/calculus/mods; the 6-site
  probing grid stays imperative for now), and the **Tooth details** card body
  (`ToothDetailsCard`; `getActiveToothDetails()` + its setters + `resetTooth()` —
  base/substrate/restoration with per-tooth option lists and `${type}|${material}`
  encode/decode, wear/discoloration, and the full row-visibility sweep incl. the
  `#extractionPlanRow` reparenting). With this, **all six control cards are
  declarative**: `wireControls()`/`syncControlsFromState()` no longer build or sync
  any control card, and the imperative `buildSelect` machinery is removed (only the
  carved-out 6-site perio probing grid remains imperative). Behavior and rendered
  DOM are unchanged. No payload/FHIR/render change; all goldens byte-identical;
  payload version unchanged.
- **Composable UI: on-demand surfaces (issue #20, Tier 2).** Control wiring is now
  re-runnable / idempotent, so a surface can **unmount and remount** (e.g. mount on
  demand in a drawer or tab) — the Tier 1 "mount every surface before init / hide
  with CSS rather than unmount" constraint is lifted. New exported `rewireControls()`
  and `rebuildGrid()` let a remounting surface rebind its fresh DOM (surfaces do this
  automatically on mount). Internally, per-element binding is deduplicated via a
  `WeakMap` marker (replacing the one-shot `controlsWired` guard), and the three
  former hide-instead-of-unmount workarounds (the control panel across the perio
  view, the chart column in the Dental Chart segment, and the Status|Plan toggle) are
  now real conditional mounts. `OdontogramShell`'s default composition is unchanged
  and still renders byte-identical DOM. No payload/FHIR/render change; all goldens
  byte-identical; payload version unchanged.
- **Composable UI surfaces (issue #20, Tier 1).** The shell's four UI regions are
  now exported as standalone components — `OdontogramTopbar`,
  `OdontogramChartSurface`, `ToothInfoSurface`, `ToothControlsSurface` — that a
  host can place in its own layout regions, together with a new
  `OdontogramProvider` and a `useOdontogramUi()` hook (plus the
  `OdontogramUiContextValue` type) for building custom surfaces. All surfaces
  share one package-owned session through the provider. `OdontogramShell` is
  unchanged and remains the supported all-in-one component — it is now a thin
  composition of these surfaces under the provider, and its rendered DOM is
  byte-identical to before (frozen by a new shell DOM-parity test). Tier 1
  keeps two documented constraints (one provider per document; surfaces mounted
  before `initOdontogram()` and hidden with CSS rather than unmounted); later
  tiers lift them. Session/composition only — no payload/FHIR/render change;
  SVG-fingerprint, FHIR-golden, and roundtrip fixtures byte-identical; payload
  version unchanged.
- **Fillings settings as controlled props (issue #17).** `<OdontogramShell>`
  now accepts the four fillings-tab settings as optional props —
  `fillingComplexity?: "complex" | "simple"`,
  `fillingDefectEnabled?: boolean`,
  `fillingMaterialAvailability?: Record<string, boolean>` (over
  `"amalgam" | "composite" | "gic" | "temporary"`, unknown keys ignored), and
  `fissureSealingEnabled?: boolean` — plus their write-back callbacks
  `onFillingComplexityChange(v)`, `onFillingDefectEnabledChange(v)`,
  `onFillingMaterialAvailabilityChange(material, enabled)` (per-material,
  mirroring the engine setter) and `onFissureSealingEnabledChange(v)`, fired
  from the Settings → Fillings tab. Unlike the `pulpDetailLevel`-style props,
  the sync is **defined-gated**: an omitted prop never writes the engine, so
  an imperative `setFillingComplexity()` call before mount is preserved and
  standalone mode is unchanged; a provided prop writes the engine and the
  React state together, so the Settings modal never shows a stale value. The
  `fillingMaterialAvailability` prop is dependency-keyed on a canonical
  serialized form (sorted keys) with a diff against the last applied record —
  an inline literal with identical content does not re-fire the engine writes.
  `FillingComplexity` is re-exported from the shell. Session-only state: no
  payload/FHIR/render change (SVG-fingerprint, FHIR-golden, and roundtrip
  fixtures byte-identical; payload version unchanged).
- **Fillings session-flag setters notify + are idempotent.** The four
  fillings setters (`setFillingDefectEnabled`, `setFillingComplexity`,
  `setFissureSealingEnabled`, `setFillingMaterialAvailability`) now follow the
  same convention as `setPulpDetailLevel`/`setSurfaceNotation`: an early
  return when the value is unchanged (no redundant
  `notifyStateChange()`/re-render), and a `notifyStateChange()` on every real
  change so `onStateChange` subscribers (e.g. hosts persisting preferences)
  observe fillings-setting changes. `setFillingMaterialAvailability` also
  ignores unknown materials without notifying.
- **Dental diagnosis coding: tooth fracture + peri-implant (DX-3a).** A broken
  tooth now codes to WHO ICD-10 **S02.5** (Fracture of tooth). Peri-implant
  mucositis and peri-implantitis are recognized as diagnoses but have no WHO
  ICD-10 code, so they are surfaced as "no WHO code" in the tooltip and summary
  and emit no FHIR Condition — a coding follows when SNOMED CT is activated.
  Payload unchanged (2.21); the visual chart is unaffected.
- **Dental diagnosis coding: case/regional conditions (DX-3b).** A new
  "Case / regional diagnoses" picker in the perio case panel authors whole-mouth /
  regional conditions (malocclusion & TMJ K07, oral cysts K09, salivary disease K11,
  stomatitis & oral mucosa K12/K13, arch-level developmental K00 — ~28 conditions),
  each optionally lateralized (left/right/bilateral). They export as patient-level
  FHIR Conditions and appear in the whole-mouth summary. Payload 2.22 (additive
  `caseConditions`); the visual chart and per-tooth data are unaffected.
- **Dental diagnosis coding: complete BNO-10 (Hungarian) pack (DX-4).** The BNO-10
  coding pack now carries Hungarian displays for every coded tooth-level and
  case-level diagnosis (selectable in Settings → diagnosis coding); case Conditions
  localize under the BNO system too. A new `CODING_PACKS.md` guide documents how to
  add another country's pack. No payload change (2.22).
- **Dental diagnosis coding: US ICD-10-CM pack (DX-5).** A selectable ICD-10-CM
  (Clinical Modification) coding pack — the first `modification`-class pack — that
  remaps the diagnosis code (not just the display) on tooth AND case Conditions
  (e.g. caries → K02.9, the K07 dentofacial anomalies → the M26 range), on top of the
  always-on WHO ICD-10 base. Reference/best-effort — verify against the official
  ICD-10-CM tabular list before US clinical use. No payload change (2.22).
- **Dental diagnosis coding: SNOMED CT overlay (DX-6).** An opt-in Settings toggle
  (SNOMED CT, default off) adds a SNOMED CT coding to each FHIR Condition alongside
  the WHO ICD-10 (and any national pack) coding. It codes the peri-implant findings
  (which have no WHO ICD-10 code) as SNOMED-only Conditions and adds a SNOMED
  laterality qualifier to case-condition bodySites. The seeded concept IDs are
  provisional — verify against the official SNOMED CT browser before clinical use.
  No payload change (2.22).
- **Dental diagnosis coding: FHIR import round-trip (DX-7).** `parseFhirBundle` now
  reconstructs the diagnosis layer from Condition resources — case/regional conditions
  (with laterality) and per-tooth diagnosis overrides (add/suppress, diffed against the
  re-derived chart) — completing the FHIR round-trip for our own exports. Chart-only
  bundles are unaffected. No payload change (2.22).

### Fixed

- **FHIR Condition ICD-10 code for the molar-incisor pattern.** A molar-incisor
  periodontitis emitted `K05.2` with a "Acute periodontitis" display, which is
  the WHO ICD-10 meaning of K05.2 (an unrelated diagnosis; the ICD-10-CM
  "aggressive periodontitis" meaning does not belong on an R4/WHO bundle). It now
  emits `K05.3` (Chronic periodontitis) like every other periodontitis; the
  molar-incisor pattern is still carried by the periodontal-extent stage entry.
- **Plugin `customStates` isolation between the status and plan charts.** An
  object-valued plugin state was shared by reference across the two charts (they
  are cloned via `serializeState` -> `hydrateState`, which passed `customStates`
  by reference), so mutating it in one leaked into the other. Object values are
  now deep-copied on hydrate.

### Security

- **Prototype pollution on FHIR import.** A crafted bundle whose `bodySite`
  carried a non-numeric tooth code (e.g. `"__proto__"`) reached `ensureTooth`,
  where the naive `if (!teeth[id])` guard returned `Object.prototype` and later
  writes leaked onto it. The importer now accepts only two-digit numeric tooth
  codes (rejecting `__proto__`/`constructor`/`prototype`) and `ensureTooth` uses
  an own-property check. Regression-tested.

### CI

- Run ESLint as a required CI step alongside type-check, test and build.

## [2.4.0] - 2026-08-11

### Added

- **Opt-in localStorage persistence.** `enablePersistence(options?)` /
  `disablePersistence()` / `clearPersistedState()` / `isPersistenceEnabled()`
  (new `src/persistence.ts`, re-exported from `src/App.tsx`) auto-save the
  status chart (and, optionally, the plan chart via `includePlan`) to
  `localStorage` on every state change and restore it on the next mount.
  Disabled by default — nothing is read from or written to storage unless a
  host app calls `enablePersistence()`, and it must be called **after** the
  odontogram has mounted (restore repaints the live DOM via `importStatus()`).
  A 4 MB size guard skips an oversized save instead of throwing; every
  storage/JSON failure is caught and routed to an optional `onError` callback
  (or `console.warn`) — this module never throws.
- **FHIR: deciduous ISO 3950 tooth codes.** Milk teeth now export the correct
  ISO 3950 deciduous bodySite codes (51-55/61-65/71-75/81-85 for FDI
  11-15/21-25/31-35/41-45) instead of the permanent-tooth code; import maps
  them back losslessly. A permanent-molar position incorrectly flagged
  `milktooth` (no deciduous equivalent) still exports its permanent code, with
  a console warning.
- **FHIR: ICDAS/CARS scoring coding on caries components.** A caries component
  with a charted severity now also carries a scoring-system coding alongside
  the surface coding — ICDAS (`https://www.icdas.org`, code `ICDAS-<n>`) on a
  primary (unfilled) surface, CARS (local code system, code `cars-<n>`) on a
  recurrent (filled) one. `valueInteger` is unchanged; round-trip import is
  unaffected.
- **CSP for the demo production build.** The Vite build now injects a
  `Content-Security-Policy` meta tag (`default-src 'self'; script-src 'self';
  style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src
  'self'; connect-src 'self'; object-src 'none'; base-uri 'self'`) into the
  built `index.html`; the dev server is unaffected. Host apps embedding the
  component should set their own CSP.

- **Settings panel reorganization.** The Settings dialog was restructured into
  General / Odontogram / Periodontal Chart / Tooth details / Caries / Fillings /
  Export Settings tabs (Panels→Odontogram, Periodontal→Periodontal Chart moved
  up, PDF Settings→Export Settings; the Pulp and Notes tabs were folded into
  Tooth details; a new Fillings tab was added). All additions are app-level
  session config with no payload/FHIR impact.
- **Export/import availability controls (General tab).** Per-format export
  (PNG/JPG/SVG/PDF) and per-source import (Status JSON / FHIR JSON) toggles — a
  disabled format/source is hidden from the export/import menu, and turning PDF
  off also disables the Export Settings tab.
- **On-screen odontogram controls (Odontogram tab).** A Plan-mode availability
  toggle (hides the Status|Plan switch), plus on-screen tooth spacing and
  tooth-number size (distinct from the export/PDF equivalents).
- **Periodontal Chart availability toggle** — hides the perio entry point and
  disables the rest of the tab when off.
- **Adjustable tooth-selection colour + border style** (Tooth details tab).
- **Fillings tab (new).** Filling-defect availability, filling complexity
  (complex per-surface / simple whole-tooth toggle with an all-surfaces defect
  select), per-material availability (amalgam/composite/glass-ionomer/temporary),
  and fissure-sealing availability.
- **Collapsible panel state + API.** The five side-panel cards (Controls,
  Statuses, Caries, Fillings, Root/Periodontium) track their collapsed/expanded
  state, exposed via `getCollapsedCards()` / `isCardCollapsed(id)` /
  `setCollapsedCard(id, collapsed)` / `toggleCollapsedCard(id)`. This is
  session-only UI-layout state — **not** serialized to the export payload (the
  payload version is unchanged), the same convention as `perioViewMode`.

### Changed

- **Idempotent session-flag setters.** `setPulpDetailLevel`, `setSurfaceNotation`,
  `setPerioViewMode`, `setPerioRowVisibility`, `setPerioIndexNameMode`, and
  `setPerioOverlayLayer` now return early when the new value equals the current
  one, avoiding a redundant `notifyStateChange()` and re-render.
- **Debounced persistence.** localStorage saves are debounced so a burst of
  edits coalesces into a single write; `disablePersistence()` flushes any pending
  save so the last edit is never lost.

- **Export Settings apply to the image exports too.** Show bone / show healthy
  pulp / tooth spacing / tooth-number size / chart border (+ the perio settings)
  now affect the PNG/JPG/SVG exports, not only the PDF report — via shared
  `buildOdontogramSvgForExport` / `buildPerioSvgForExport` helpers.
- **Fissure sealing** is now offered on premolars as well as first/second molars
  (previously molars only). The parity goldens were regenerated accordingly.

### Fixed

- The grouped dentition-summary table is now theme-aware (legible in dark mode).

### Security

- **Plugin SVG sanitization.** A plugin's `renderSvg()` return value is now
  passed through [DOMPurify](https://github.com/cure53/DOMPurify) (SVG
  profile + `svgFilters`, with `script`/`iframe`/`object`/`embed`/
  `foreignObject` forbidden outright) before it is inserted into the live
  chart via `innerHTML`; wholly-malicious output is dropped rather than
  partially rendered. Unwrapping the sanitized fragment is done structurally
  (DOM tree walk + `XMLSerializer`), not via regex, closing a theoretical
  `</svg>`-breakout gap. `dompurify` is a new bundled runtime dependency.
  Plugins still run as trusted code — only load plugins from sources you
  trust.
- **SNOMED dev server hardened** (loopback-only bind, input validation, 1 MB
  request body cap, rate limiting). This is an untracked local dev tool, not
  part of the published npm package.
- **npm audit:** fixed 16 vulnerabilities in dev dependencies (1 low, 3
  moderate, 11 high, 1 critical) → 0 remaining; lockfile-only change, no
  runtime dependency affected.

### Note

- The FHIR golden fixture (`src/__tests__/parity/fhir-golden.json`) was
  regenerated to reflect the two intentional export changes above (deciduous
  tooth codes, ICDAS/CARS coding). The SVG parity goldens
  (`src/__tests__/parity/svg-fingerprints.json`) were regenerated only for the
  fissure-sealant-on-premolars addition; all other tooth renders are unchanged.

### Docs

- **Codebase-wide comment cleanup.** Removed phase/task bookkeeping tags and
  removed-feature archaeology across all source files and rewrote the lasting
  comments into plain present-tense English (comment-only — no code changed).
- **README re-translations.** The Brazilian Portuguese and French READMEs were
  fully re-translated from the current English source; citation version, badges,
  and the UI-language list were corrected across every language README.

### Chore

- Added test coverage: `importStatus` fully-replaces-state isolation tests,
  no-op guard tests for the idempotent setters, and a recurrent-caries parity
  case (appended after the per-template loop to keep fixture indices stable).

## [2.3.0] - 2026-08-09

### Added

- **Multilingual PDF fonts.** The PDF report now embeds a bundled Unicode font
  so text renders correctly in every UI language instead of the built-in
  WinAnsi Helvetica (which garbled Hungarian `ő`/`ű` and could not draw
  Cyrillic/Arabic/CJK). A Roboto subset (Latin + Latin Extended-A + Cyrillic)
  covers `hu, en, de, es, it, sk, pl, ru, pt-br, fr`; Arabic (`ar`, Noto Naskh
  Arabic + a contextual-joining/bidi shaper, since jsPDF applies no OpenType
  shaping) and Simplified Chinese (`zh`, Noto Sans SC subset) are each
  lazy-loaded on demand. All fonts are bundled (offline, never fetched) and
  code-split so they stay out of the main bundle and load only for the language
  actually exported.
- **Grouped dentition summary table.** The whole-mouth Tooth-information panel
  and the PDF report replace the flat "permanent/missing teeth" lists with a
  table: one column per category (primary / permanent / implants / missing,
  non-empty only), one row per anatomical group, tooth numbers coloured by
  status — bold blue = has content, bold-italic red = has a problem — with an
  explanatory legend. A new PDF setting controls the grouping (whole mouth /
  jaw / quadrant / sextant).
- **PDF Settings tab** (General / Odontogram / Periodontal / Footer): colour
  theme, tooth spacing, chart border + thickness, tooth-number and perio font
  sizes, empty-row toggle, dentition-summary grouping, medical disclaimer and
  generator/attribution stamp.
- **PDF report polish.** Document title, medical/tabular section styling
  (Patient data, Dental chart, Diagnostics and findings, Periodontal
  description), computed patient age, and an end-of-document footer with
  disclaimer, generation/version stamp, and GitHub/DOI links.
- **Dynamic perio abbreviation glossary** in the PDF: only the codes/indices
  actually charted in the case are listed (PI, GI, mPI, mBI, KG, GT, CEJ, root
  concavity, furcation, Miller, mobility), in addition to the base PD/GM/CAL/BOP.
- **Odontogram-markable periodontal findings always summarised.** Inflammation
  and mobility now always appear in the odontogram summary/description (and the
  PDF) even when no periodontal module is charted.
- **Brand logo** in the component header.

### Changed

- **PDF tooth spacing.** Odontogram spacing options were re-scaled (the old
  "wide" was dropped; the default is now the tighter "medium", with a new,
  closer "close"). The periodontal chart's tooth spacing now packs the arch
  artwork with the same geometry as the number rows.
- **Chart border colour** is now theme-driven (the colour picker was removed);
  border thickness is disabled when the border toggle is off.
- **Findings layout.** Per-axis findings (caries, endo, diagnoses, wear, …) get
  their own titled "Diagnostics and findings" section; implants are shown only
  in the dentition table (no longer duplicated as a findings row); the flat
  permanent/missing prose lists were removed in favour of the table.
- **"Show empty rows"** (perio PDF) now defaults to off.

### Fixed

- **Periodontal chart now stays in sync with the odontogram.** A tooth marked
  missing (or an extraction socket) draws no crown in the perio chart (its
  column is kept so the number rows stay aligned), and a primary tooth renders
  the deciduous artwork — on screen and in the PDF export.
- **Periodontal "tooth spacing" no longer distorts the chart.** The arch
  artwork previously ignored the spacing setting while the number rows re-spaced,
  drifting teeth, curves and labels out of alignment; both now share one geometry.
- **First-column overflow** in the dentition summary table (long group labels no
  longer overlap the first data column — the label column is wider and wraps).
- **Classification no longer duplicated** in the perio chart image (it lives only
  in the "Periodontal description" table).

### Chore

- **ESLint is usable again.** The flat config now ignores `dist/`, `docs/`,
  `coverage/` and build metadata (previously it linted the build output,
  producing thousands of spurious errors). Dead code and unused imports were
  removed, intentional `_`-prefixed args are allowed, and `no-explicit-any` is a
  warning (the engine deliberately uses `any` at DOM/SVG boundaries).

## [2.2.1] - 2026-08-06

### Added

- **Per-tooth notes surfaced in the Tooth-information panel and the PDF report.**
  A new "Individual notes" row (above Caries, one line per tooth that carries a
  note) appears in the whole-mouth summary and, as its own section, in the PDF
  export — both gated on the notes-enabled setting and hidden when no tooth has
  a note. `getOdontogramSummary()` gains an `individualNotes` field;
  `hasAnyToothNote()` is exported.
- **PDF export dialog: patient date of birth.** New `patientDob` case-identity
  field (`setPatientDob`, ISO `YYYY-MM-DD`), shown 2nd in the header (after
  name, before exam date). Payload version **2.19 → 2.20** (additive,
  omit-when-empty).

### Changed

- **PDF export options split.** The former combined "Odontogram + description"
  checkbox is now two independently-selectable options (chart image /
  description), plus a third for the individual-notes section (disabled when no
  tooth has a note). The exam date now defaults to today (still editable), and
  the report renders with placeholder identity ("John Doe" / "1980-01-01") when
  fields are left empty, so export always succeeds.
- **Plan mode shows only plannable treatment.** Clinically status-only findings
  are hidden while the Plan chart is active: the base picker offers only
  Missing / Permanent / Implant; the Caries section, tooth wear, discoloration,
  and the whole periodontal block (mobility, 6-site probing grid,
  inflammation/parodontal mods, calculus, peri-implant status) are hidden; the
  pulp/endo picker keeps endodontic TREATMENT (root canal / post / apicoectomy /
  parapulpal pin) but hides pulp-diagnosis, apical-diagnosis, periapical-lesion,
  and root-resorption. Restoration, prosthesis, orthodontics, crown-need/replace
  and extraction-plan remain plannable.
- **Lower-arch bridge saddle geometry** re-anchored to the true geometric mirror
  of the (well-fitting) upper value (`1 - SADDLE_Y_FRACTION`) so both arches are
  consistent by construction.
- Module brand name is now **React Advanced Odontogram** (npm package name and
  GitHub repository unchanged).

### Fixed

- **Periodontal Status → Odontogram view no longer becomes unresponsive.** The
  odontogram control panel is kept mounted (CSS-hidden) while the Periodontal
  Status view is active, instead of being unmounted and re-mounted, so its
  one-shot event wiring survives the round-trip.
- **PDF export patient-name field now accepts spaces** (the input is buffered
  locally and committed on blur/export instead of being trimmed per keystroke).
- **Periodontal Status band labels** are centered — "▲ Buccal ▲" above the
  central index band and a new "▼ Lingual / Palatal ▼" below it, on both arches.

## [2.2.0] - 2026-08-06

### Added

- **French (`fr`) UI language** — 12 UI languages total (machine-translated,
  native-speaker review pending). Contributed via PR #13.
- Export `initOdontogram` and `destroyOdontogram` from public API
- Export `getStatusChart`, `getPlanChart`, and `setPlanChart` for programmatic state
  hydration
- Export `getChartMode` and `setChartMode` for chart-mode lifecycle control
- Export `setNumberingSystem` from public API
- Export `getPlanChanges` for status-vs-plan diff
- Export `openPerioOverlay`, `closePerioOverlay`, `isPerioOverlayOpen` for
  programmatic perio-chart control
- Export `hasAnyPerioData` for perio data presence check
- Export `exportStatus` and `importStatus` for JSON export/import
- Export `exportPdf`, `exportPerioImage`, `exportPerioSvg` for periodontal export
  formats

### Fixed

- `exportStatus` and `importStatus` were module-private despite being fully
  implemented — added missing `export` keyword

### Security

- Upgraded `jspdf` 4.1.0 → 4.2.1, resolving 3 high-severity advisories
  (SNYK-JS-JSPDF-15322679 / -15322681 / -15322684). Based on Snyk PR #11.

### Changed

- README restructured for npm: the per-language documentation links moved to the
  top of the root README; fixed the demo URL (`react-odontogram-modul.vercel.app`);
  French added across every language switcher and enumeration.

## [2.1.0] - 2026-08-04
### Changed
- **Slimmer install (dependency diet).** Removed three unused runtime
  dependencies (`react-router-dom`, `react-hook-form`, `nanoid`) — they were
  never imported by the library (verified against the built bundle). The only
  remaining runtime dependency is `jspdf`.
- **`jspdf` is now lazy-loaded.** `exportPdf()` loads jspdf via a dynamic
  `import("jspdf")` on the PDF-export path instead of a static top-level import,
  so consumers who never export a PDF no longer pull jspdf (and its
  html2canvas/dompurify deps) into their main bundle.
- **Single bundled type declaration.** The build now emits one
  `dist/index.d.ts` (via `vite-plugin-dts` + `@microsoft/api-extractor`)
  instead of a tree of per-file `.d.ts` — hides internal `__*ForTest`
  declarations and resolves cleanly under `node16`/`nodenext` module
  resolution (no more extensionless-relative-import warnings from
  are-the-types-wrong).
- **README restructured for npm.** The root `README.md` is now a concise,
  npm-friendly landing page with **absolute image URLs** (so screenshots and
  the DOI badge render on npmjs.com, which does not ship the repo's relative
  image paths). The full English and Spanish documentation moved to
  `lang/README-en.md` / `lang/README-es.md`; every language switcher was
  updated accordingly.
### Notes
- No runtime behavior, API, or payload change — full test suite green, SVG
  parity byte-identical. `jspdf` remains a regular dependency (still installed);
  only its loading is deferred.

## [2.0.2] - 2026-08-03
### Changed
- **npm package renamed** from `react-odontogram-modul` to
  **`react-advanced-odontogram`** — the previous name was too close to the
  unrelated `react-odontogram` package. Same version (2.0.2), same code; only
  the published package name changes. The old `react-odontogram-modul` name is
  deprecated on npm and points here. The display name ("React Odontogram
  Modul/Module"), the GitHub repository, and the demo URL are unchanged.
- **Docs:** every language README now shows a language-specific Overview
  screenshot (`lang/screenshot_<lang>_odontogram.png`) in place of the shared
  preview image, and a periodontal-chart screenshot
  (`lang/screenshot_<lang>_perio.png`) above the periodontal-charting feature.
  Version aligned to 2.0.2 across package.json, CITATION, README badges and the
  regenerated TypeDoc docs. No code, API, behavior, or payload change.

## [2.0.1] - 2026-08-03
### Changed
- **Docs:** added a live npm version badge (shields.io, links to
  npmjs.com/package/react-odontogram-modul) to every language README, placed
  just before the MIT license badge. Regenerated the TypeDoc API docs. No code,
  API, behavior, or payload change.

## [2.0.0] - 2026-08-03

First release published to npm as a consumable React component library
(`react-odontogram-modul`). This is a **major** version bump because the
distribution model changes — React becomes a peer dependency and the package
ships ESM-only — even though the component's runtime behavior, data model and
FHIR output are unchanged.

### Added
- **Publishable npm package.** The module can now be built and published as a
  consumable library, not only run as a demo app:
  - `npm run build:lib` (new `vite.lib.config.ts` + `tsconfig.build.json`)
    emits `dist/odontogram.js` (ESM), a single `dist/style.css`, and `.d.ts`
    types. The existing `npm run build` (demo/GitHub-Pages site) is unchanged.
  - `package.json` gains `exports` (`.` → types + `import`; `./style.css`),
    `main`/`module`/`types`, `files`, `sideEffects`, `engines`, and package
    metadata; `private: true` was removed.
  - New public entry `src/index.ts` exports `OdontogramShell` (default **and**
    named) plus everything `App.tsx` already surfaced.
  - React/ReactDOM moved to `peerDependencies` (`^18 || ^19`) to avoid a
    duplicate React in consumer bundles.
  - CI (`.github/workflows/ci.yml`) and tag-triggered npm publish
    (`.github/workflows/publish.yml`) with provenance; `.nvmrc`.
### Changed (BREAKING)
- **React / ReactDOM are now `peerDependencies`** (`^18 || ^19`) instead of
  regular dependencies — a consuming app must install `react` and `react-dom`
  itself. This prevents a duplicate React copy / "Invalid hook call" errors.
- **The package is ESM-only** — there is no CommonJS build. Consume it from a
  bundler that supports the `exports` field (Vite, webpack 5, Next.js, Rollup,
  esbuild, Parcel).
- **The stylesheet must be imported separately** —
  `import "react-odontogram-modul/style.css"`. It is no longer implied by
  importing the component.
### Changed
- **Tooth-template and inline-icon SVGs are now inlined into the JS bundle**
  (`?raw` imports) and parsed directly instead of being fetched at runtime from
  emitted asset URLs. This makes the built library self-contained and portable
  to any consumer bundler (previously the fetched hashed asset URLs would 404
  in a downstream app). Rendering is byte-identical — SVG-fingerprint parity is
  green.
### Notes
- Consumers must import the stylesheet once:
  `import "react-odontogram-modul/style.css"`. The package is
  **ESM-only** and targets bundler module resolution (Vite/webpack/Next/esbuild).
- **Known limitation:** engine state is a module-level singleton, so only one
  `<OdontogramShell>` instance per page is supported in this release.
- Behavior/derivation/serialization/FHIR are unchanged; payload version stays
  **2.19**.

## [1.50.0] - 2026-08-03
### Added
- **Arabic (`ar`) and Simplified Chinese (`zh`) UI languages** — 11 UI languages total (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH). Both ship the full 749-key translation block (matching Hungarian's key set, enforced by `translations.test.ts`), a `language.*` self-label, and an entry in the language switcher and `Language` union (`src/i18n/translations.ts`).
- **RTL layout for Arabic.** The app root mirrors to right-to-left whenever `ar` is active (`dir` reactive to the language, `RTL_LANGUAGES`/`isRtl()` in `src/App.tsx`), while the dental chart (`#toothGrid`) and the periodontal charts (`.dental-chart-column`, `.perio-fullgrid-scroll`, `[data-perio-arch]`) stay pinned `dir="ltr"` — both via the JSX `dir="ltr"` attribute and a defensive CSS `direction: ltr` rule — so tooth geometry, numbering, and mesial/distal orientation never flip.
- **Per-language READMEs** — `lang/README-ar.md` and `lang/README-zh.md`, added to every README language switcher.
- Both new languages are **machine-translated**; native-speaker review is pending.
### Notes
- UI/i18n/CSS-only — no change to `odontogram.ts` derivation/serialization, any `fhir/*` builder, or the SVG render itself. SVG-fingerprint, FHIR-golden, and roundtrip-golden parity fixtures are byte-identical to 1.49.0. Payload version stays **2.19**.

## [1.49.0] - 2026-08-03
### Added
- **Standalone periodontal chart export (SVG/PNG/JPG).** `buildPerioSvg()` (`src/perioExport.ts`) renders the FULL perio chart — tooth graphics, numeric rows, and the 2017 classification block — as one standalone vector SVG, built headlessly from the active chart's state (not from the mounted `PerioChart` DOM). `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` download it, wired to three new export-menu items ("Perio SVG/PNG/JPG"); all three are disabled whenever `hasAnyPerioData()` is false.
- **`hasAnyPerioData()`** — true iff any periodontal axis is charted anywhere in the mouth. Drives the perio export auto-skip and disables the perio export-menu items on a blank chart.
- **PDF report export.** `exportPdf(opts)` (`src/perioPdf.ts`) assembles a jsPDF-native report — vector text via `.text()`, raster odontogram/perio-chart images via `.addImage()` — with **no svg2pdf.js dependency** (jsPDF was already a dependency; this is its first use). Sections are individually optional (`{patientData, odontogram, perioStatus, perioDescription}`); the two perio sections auto-skip whenever `hasAnyPerioData()` is false regardless of the requested options. A shared `rasterizeSvgToPng`/`rasterizeSvgToCanvas` helper (extracted from `exportImage`) is reused by `exportPerioImage` and `exportPdf`.
- **`ExportOptionsModal`** — the "PDF report…" export-settings dialog (mirrors `DualStateConfirm`'s focus-trapped dialog contract). Four section checkboxes (patient data, odontogram, perio status, perio description — default all ON; the two perio checkboxes are disabled with a "no perio data" hint when `hasAnyPerioData()` is false), plus patient-name and exam-date inputs wired straight to the case metadata.
- **Case metadata: patient name + exam date.** `caseMeta` gains `patientName` (trimmed string or `null`) and `examDate` (`YYYY-MM-DD` or `null`) — identity-only fields feeding the PDF report header, via `setPatientName`/`setExamDate`. Payload version **2.18 → 2.19** (additive). **Not** part of the FHIR export.
- **mPI/mBI implant-gating.** The peri-implant Mombelli indices (mPI/mBI) now render as rows only in an arch that contains at least one implant tooth, on both the live perio chart and the new SVG/PDF exports — an arch with no implants no longer shows two empty index rows.
- Disabled export-menu items get a dedicated CSS style (greyed out, matching the new `hasAnyPerioData()`-gated menu entries).
### Notes
- SVG-fingerprint and FHIR-golden parity fixtures are byte-identical to 1.48.0 (the new exports are additive, non-rendering paths; `patientName`/`examDate` are not FHIR fields). The roundtrip-golden fixture changes only by its version string (`2.18` → `2.19`).

## [1.48.0] - 2026-08-01
### Changed
- **Perio chart layout: central index band, split buccal/palatal graphics (UI-3a).** Each arch's tooth graphic is now drawn as **two separate SVGs** — a buccal aspect above, a palatal/lingual aspect below — instead of one continuous occlusal-to-occlusal arch, both sharing a **uniform crowns-to-band orientation** so the crowns of both aspects face the new **central perio index band** between them and the roots face outward toward the tooth-number rows. That band carries the indices shared across the whole tooth rather than split by aspect: **Miller recession class** moved to the very top of the arch (near the buccal aspect, replacing its previous per-tooth-row placement), and **Plaque/PI/GI/mPI/mBI** now render as a single **anatomical diamond tile** per tooth (buccal tip up, lingual tip down, mesial/distal on the middle row — swapped per side of the arch so mesial always points toward the midline) instead of four separate cross-shaped buttons. A `▲ Buccal … Lingual/Palatal ▼` label orients the band. The legacy single-arch builder (`buildArchGraphic`/`archOrientTransform`/`isUpperArch`) is retired in favor of the new split builders (`buildBuccalArchSvg`/`buildPalatalArchSvg`).
- Purely presentational, client-generated chart geometry — no change to `odontogram.ts` derivation/serialization, `perioClassification.ts`, or any `fhir/*` builder; the perio chart is not part of the golden fixtures. SVG-fingerprint, FHIR-golden, and roundtrip-golden fixtures are byte-identical to 1.47.0; payload version stays **2.18**.

## [1.47.0] - 2026-08-01
### Added
- **Settings → "Periodontal" tab.** A new Settings tab with 16 per-index show/hide toggles for the perio-chart rows — grouped **Pocket** (PD/GM/CAL/BOP), **Hygiene** (Plaque/PI/GI), **Mucogingival** (CEJ visibility/Root concavity/KG/GT), **Support** (Furcation/Mobility/Miller class), and **Peri-implant** (mPI/mBI) — each row with its own description, defaulting all-visible; deselecting a row hides it from the perio-chart grid. A second option lets index row labels display **translated** (the existing localized text, default) or **canonical** — a fixed English/Latin standard scientific name (e.g. "Modified Sulcus Bleeding Index (mBI)") shown identically regardless of the active UI language; the "i" info-button tooltips always stay localized in either mode.
- Both `perioRowVisibility` and `perioIndexNameMode` are session-level app preferences, following the same pattern as the existing `perioViewMode` setting — a module-level flag with a getter/setter that calls `notifyStateChange()` on change, wired into `SettingsModal.tsx`'s declarative tab registry.
- App-preferences only — neither flag is part of a tooth's state or the case-level metadata, so neither is ever serialized. `collectExportPayload`/`getPlanChart`/hydrate are unchanged, no `svgLayer` axis is touched by the flags themselves (only which existing rows/labels render), and no FHIR builder is touched. SVG-fingerprint, FHIR-golden, and roundtrip-golden fixtures are byte-identical; payload version stays **2.18**.

## [1.46.0] - 2026-08-01
### Changed
- **Periodontal view redesign, renamed "Periodontal Status".** The `Odontogram | Dental Chart` view toggle and the chart header now both read **"Periodontal Status"**. While that view is active, the right panel is no longer the odontogram's Controls panel — it's repurposed into a dedicated **perio-context sidebar** (`PerioSidebar`) carrying Patient data, the 2017 classification panel, and the whole-mouth periodontal summary, extracted out of the chart body and view-gated so it only shows in the periodontal view. The perio index rows (PD/GM/CAL/BOP + mobility + furcation + plaque) now show their **full names** instead of abbreviations, in **larger, more touch-friendly cells**. The arch chart itself now **dynamically scales to fill the available width** (a `ResizeObserver`-driven fill-scale through the shared `archToothLayout` geometry) instead of a fixed size, so it's responsive at any window size.
- Purely presentational — no change to `odontogram.ts` derivation/serialization, `perioClassification.ts`, or any `fhir/*` builder. SVG-fingerprint, FHIR-golden, and roundtrip-golden fixtures are byte-identical to 1.45.0; payload version stays **2.18**.

## [1.45.0] - 2026-08-01
### Added
- **2017 World Workshop periodontal classification (diagnosis/stage/grade/extent), derived-with-override.** A pure derivation core (`src/perioClassification.ts`) computes `diagnosis` (health/gingivitis/periodontitis, from interdental CAL ≥1mm at ≥2 non-adjacent teeth or the buccal/oral fallback, else %BOP-gated gingivitis), `stage` (I-IV, from worst interdental CAL / max radiographic bone loss %, escalated by PD ≥6mm or furcation ≥II, overridden to IV by ≥5 teeth lost to periodontitis), `grade` (A-C, from the %RBL÷age ratio modified by smoking/HbA1c risk buckets), and `extent` (localized/generalized/molar-incisor pattern) from the charted per-tooth perio data and the P4a case metadata. Four per-axis clinician overrides — `setDiagnosisOverride`/`setStageOverride`/`setGradeOverride`/`setExtentOverride` (each a valid enum value or `null` to clear/revert to derived) — let a clinician correct any single axis without touching the others; `getPerioClassification()` returns the final (override ?? derived) value per axis alongside the untouched `derived` result and an `overridden` flag per axis. Surfaced as a classification panel on the Dental Chart and a compact fragment on the whole-mouth periodontal summary line.
- **The engine's first FHIR `Condition`** — the 2017 World Workshop periodontitis/gingivitis diagnosis, BNO/ICD-10 K05.3 (chronic periodontitis) / K05.2 (molar-incisor-pattern periodontitis) / K05.1 (chronic gingivitis), emitted only when the final diagnosis is gingivitis or periodontitis (a "health" diagnosis emits nothing). `Condition.stage[]` carries one type-differentiated entry per applicable axis — periodontal stage (periodontitis + a concrete stage only), grade (whenever not indeterminate), extent (whenever applicable) — each an engine-local `type`/`summary` CodeableConcept pair (SNOMED deferred). `Condition.evidence[]` references smoking-status and HbA1c Observations, emitted only when those case-metadata fields are actually charted. Deterministic (fixed ids, no Date/random) — the four parity fixtures all derive `health` (no perio/case data charted), so they emit no Condition and the FHIR golden stays byte-identical; a diseased case does emit one (covered by `p4b-condition-fhir.test.ts`).
- Neither the classification derivation nor its overrides have an `svgLayer` → the odontogram render is unchanged, SVG-fingerprint parity byte-identical. Payload version **2.18** (additive — four new omit-when-default `caseMeta` override fields).

## [1.44.0] - 2026-07-31
### Added
- **Case-level metadata object.** The engine's first case-level object — a single shared block (not per-tooth, not dual-state, mirrors the top-level `globals` payload key), carrying patient **age**, **smoking status** (never/former/current, + cigarettes/day), **diabetes status** (none/present, + HbA1c %), and two perio summary stats: **teeth lost to periodontitis** and **max radiographic bone loss %**. Surfaced as a collapsible panel on the Dental Chart (7 controls, live-updating, read-only-aware) and as a compact fragment appended to the whole-mouth periodontal summary line (e.g. "Age 54 · current smoker (12/day) · diabetic (HbA1c 7.8%) · max RBL 45% · 3 teeth lost to perio") — only the fields actually charted are shown. Public API: `getCaseMeta()`, `setCaseAge`/`setSmokingStatus`/`setCigarettesPerDay`/`setDiabetesStatus`/`setHba1c`/`setToothLossPerio`/`setMaxRblPercent`, `resetCaseMeta()`. Both charts (status + plan) carry the same shared case block; cleared on Reset All.
- No FHIR representation yet — this is pure case-context data feeding the periodontal staging/grading classification that follows in the next sub-project. SVG-fingerprint parity byte-identical (no `svgLayer`, nothing renders on the odontogram). Payload version **2.17** (additive).

## [1.43.0] - 2026-07-31
### Added
- **Mombelli modified Plaque Index (mPI)** and **Mombelli modified Sulcus Bleeding Index (mBI)** — implant-only, per-surface graded findings (0-3, mesial/distal/buccal/lingual), each surfaced as a Dental Chart row with an info popup, in the tooth tooltip, and in the whole-mouth summary. Both are gated to implant teeth end-to-end — the setter no-ops on a non-implant tooth, and the Dental Chart cell is active only on an implant. Exported to FHIR as additional per-surface graded components on the per-tooth periodontal Observation (engine-local codes; no dedicated LOINC yet).
- Consolidated the Dental Chart's overlay whole-mouth read-out (`#perioOverlayReadout`) to also cover `pi`/`gi`/`kg` (previously only `bop`/`plaque` had one), closing a gap left over from the earlier graded-indices release.
- Neither axis has an `svgLayer` → the odontogram render is unchanged, SVG-fingerprint parity byte-identical. Payload version **2.16** (additive).

## [1.42.0] - 2026-07-31
### Added
- **Silness-Löe Plaque Index (PI)** and **Löe-Silness Gingival Index (GI)** — per-surface graded findings (0-3, mesial/distal/buccal/lingual), each surfaced as a heat-bucketed Dental Chart row, in the tooth tooltip, and in the whole-mouth summary. Exported to FHIR as additional per-surface graded components.
- **Keratinized gingiva width (KG)** — a per-tooth buccal measurement in mm (0-15), charted like the other mm-based perio findings, shown as a Dental Chart row, in the tooltip, and in the summary. Exported to FHIR.
- **Gingival thickness phenotype (GT)** — a per-tooth categorical finding (unknown / thin / medium / thick) and **Miller recession class** — a per-tooth categorical finding (none / i / ii / iii / iv), each as a Dental Chart row with an info popup, surfaced in the tooltip/summary, and exported to FHIR.
- All five axes are pure per-tooth data (no `svgLayer` → the odontogram render is unchanged, SVG-fingerprint parity byte-identical). Payload version **2.15** (additive).

## [1.41.0] - 2026-07-11
### Added
- **Cairo recession type** (RT1–RT3) — computed from the attachment levels already recorded (interproximal vs buccal CAL on a tooth with buccal recession) and shown as a Dental Chart overlay layer + in the tooth tooltip / whole-mouth summary. Derived, no new data.
- Two per-tooth findings: **CEJ visibility** (none / detectable / not-detectable — affects CAL/recession accuracy) and **root concavity** (none / mild / deep), each as a Dental Chart row with an info popup, surfaced in the summary, and exported to FHIR. Payload 2.14 (additive).

## [1.40.0] - 2026-07-11
### Added
- **Index switcher on the Dental Chart.** A toggle row highlights the teeth by a chosen periodontal measure — probing depth, CAL, recession, plaque, bleeding, or ≥5 mm/≥6 mm deep-pocket heat — repainting the same tooth diagram (one canvas, swappable layer). All layers are computed from the data you already entered (no new measurements); API `getPerioOverlayLayer()` / `setPerioOverlayLayer()`.
- **Info popups on the perio rows.** A small "i" icon on each row label (PD, GM, CAL, BOP, plaque, furcation, mobility) opens a short explanation of that index. No payload/FHIR change.

## [1.39.0] - 2026-07-11
### Changed
- **Smarter Status ↔ Plan editing.** After a plan exists, editing a tooth's **status** now updates the **plan** too — *as long as you haven't planned anything on that tooth yet* — so correcting the current reality no longer shows up as a planned change in the "What changes" box. If you edit the status of a tooth that **does** have planned changes, a **confirmation** appears first; on confirm the status change applies (and the plan stays as planned, so the difference is shown). Whole-mouth actions (Statuses presets, Edentulous, dentition presets) follow the same rule atomically — one confirmation, applied all-or-nothing. No payload/FHIR change.

## [1.38.0] - 2026-07-11
### Changed
- **Graphical Dental Chart polish.** The tooth arches now face **occlusal-to-occlusal** (upper crowns down, lower crowns up, like the odontogram); a **numbered millimeter guide grid** is drawn behind the teeth (a pocket's depth reads directly against the mm lines); the diagram is **larger and scales with the window**, with tighter tooth spacing; and an **implant graphic** is shown for implant teeth (instead of the natural tooth shape). No payload/FHIR change (the graphic reads template artwork into its own DOM — SVG-fingerprint parity byte-identical).
### Added
- Furcation and plaque status→plan changes now surface in the **"What changes"** box.

## [1.37.0] - 2026-07-11
### Added
- **Furcation** charting (Glickman I–IV, per entrance) on the teeth that have furcations — maxillary molars (3 entrances), mandibular molars (2), maxillary first premolars (2) — and **plaque** charting (O'Leary, per-surface presence → whole-mouth **plaque index PI%**), both as rows in the periodontal grid and the graphical Dental Chart, with a summary showing max furcation + PI%. Furcation is exported to FHIR (LOINC `34015-8`, per entrance). Public API: `setFurcation`/`getToothFurcation`/`furcationEntrances`, `setPlaque`/`getToothPlaque`. Payload version **2.13** (additive).
### Fixed
- Probing depths **10–15 mm** are now enterable via the keyboard (type `1` then a second digit; single digits `2`–`9` still auto-advance), so deep pockets no longer require the spinner.
- Toggling **read-only** while the periodontal chart is open now locks it live (previously the lock only applied to the main panel).

## [1.36.0] - 2026-07-11
### Added
- **Graphical periodontal chart ("Dental Chart" view).** The periodontal chart is now drawn like a real perio chart — the teeth rendered in a continuous arch (reusing the existing tooth artwork), with a red **CEJ reference line** and a **gingival-margin / pocket-depth curve** (a filled band) plotted over the teeth from the per-site data, the number rows (probing depth, gingival margin, CAL, bleeding, mobility) aligned in columns above/below the teeth, and a summary (avg PD, avg CAL, %BOP). Deep pockets visibly dip toward the root; recession shows the margin below the CEJ.
- **Presentation is switchable:** an `Odontogram | Dental Chart` **view toggle** (default) swaps the main chart area, and a **Settings option (`perioViewMode`)** can switch it back to the previous **popup** overlay. New API `getPerioViewMode()` / `setPerioViewMode()`. The perio chart remains a separately-invocable component (`PerioChart` export + `openPerioOverlay`/…) for host integration. The base odontogram is never re-rendered (hidden but mounted) — SVG parity byte-identical; no payload/FHIR change.

## [1.35.0] - 2026-07-11
### Added
- **Periodontal charting grid** — a full-mouth clinician-style perio chart: all teeth × 6 sites, with probing depth, gingival margin, bleeding-on-probing, derived CAL, and mobility, plus a whole-mouth summary (charted sites, %BOP, worst CAL, max PD). **Keyboard auto-advance** entry (type a probing-depth digit → focus jumps to the next site in charting order; arrows navigate; space toggles BOP; a leading `-` primes a negative gingival margin; clearing a depth un-charts the site).
- The perio chart is a **separately-invocable overlay** so a host application can call up the periodontal chart independently of the base odontogram: `PerioChart` is a named export, and `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` drive it programmatically. It shares the same loaded case as the base chart (one case, two surfaces) and is dual-state aware. Render of the base odontogram is byte-identical (the overlay layers over it; no payload/FHIR change). Second sub-project of the periodontal arc; furcation + plaque follow in P2b.

## [1.34.0] - 2026-07-11
### Added
- **Periodontal charting — data core (6 sites/tooth).** Each tooth now carries a `perio` record with per-site **probing depth (PD)**, **gingival-margin position** (signed vs the CEJ), **bleeding on probing (BOP)**, and suppuration, over the six standard sites (MB/B/DB buccal, ML/L/DL lingual). **Clinical attachment level (CAL = PD + gingival margin)**, recession, and whole-mouth **%BOP** are derived (never stored). A minimal per-site input on the selected-tooth panel authors the data with a live CAL/%BOP read-out; the polished perio-chart grid follows in a later release. First sub-project of the periodontal-parameters arc.
- **Per-site FHIR export** for periodontal data — one periodontal-panel `Observation` (LOINC `74029-0`) per charted tooth, with per-site components for PD (`32910-2`), recession (`32911-0`), CAL (`32912-8`), and BOP; the tooth+probe-site qualifier is carried R4-conformantly via HL7's `component.bodySite` backport extension. SNOMED coding for periodontal findings is deferred (LOINC-primary for now); FHIR *import* of perio is deferred (it round-trips through the JSON payload).
- Public API: `setPerioSite()`, `getToothPerio()`, `getToothCal()`, `getPerioSummary()`, `getPerioChart()`. Payload version **2.12** (additive — a case with no perio data is byte-identical apart from the version bump). Dual-state aware: perio participates in the status/plan charts and the status→plan diff.

## [1.33.0] - 2026-07-11
### Added
- **Proposed styling** in Plan mode: any finding the plan *adds* relative to the current status (a planned crown, extraction, orthodontic movement, prosthesis, etc.) now renders with a distinct **dashed, tinted "proposed" outline**, so the plan chart reads as intent rather than fact. Findings unchanged from the status render solid as usual; a finding the plan *removes* simply doesn't appear. A small **"dashed = proposed" legend** shows in the chart card while Plan mode is active. Completes the round-2 Status/Plan split (after 1.31.0's dual-state core and 1.32.0's diff box).
- Render in **Status mode is byte-identical** to before — the proposed treatment runs only in Plan mode, through a non-fingerprinted style channel, and is fully reset when switching back to Status. No payload/FHIR change.

## [1.32.0] - 2026-07-11
### Added
- Status → Plan **diff** and a **"What changes"** box under the Tooth-information panel. When a plan differs from the current status, the box lists every difference per tooth and per treatment axis (presence, tooth substrate, restoration, prosthesis, planned crown, orthodontics, pulp/endo, apical) as a `tooth: axis  from → to` line, reusing the same human-readable labels the tooltip and whole-mouth summary already use. The box is hidden whenever no plan exists or the plan is identical to the status, and refreshes live as either chart is edited.
- New `getPlanChanges()` public API returning the structured status→plan diff (`{ toothNo, axis, from, to }[]`); the same list is now exposed on `getOdontogramSummary()` as `plannedChanges`. Render is byte-identical — the diff is a pure read-only comparison of the two charts. Second sub-project of the Status/Plan split (after 1.31.0's dual-state core).

## [1.31.0] - 2026-07-11
### Added
- Status ↔ Plan chart split: the chart now holds a separate current-**status** and a **plan** (intended post-treatment) state, switched by a `Status | Plan` toggle in the chart header (`#chartModeToggle`, with a `.plan-mode` visual cue on the chart card). The plan chart is lazily initialized as a deep copy of the status chart the first time plan mode is entered; later switches reuse whatever is already in the plan chart. Render is byte-identical to the single-chart render — the toggle only changes which chart is drawn.
- Per-state public API: `getChartMode()` / `setChartMode(mode)` to read/switch the active chart, and `getStatusChart()` / `getPlanChart()` / `setPlanChart(payload)` to read or write either chart's payload independently of which one is currently active. The existing single-state export (`exportStatus`/`exportFhir`) and import stay status-primary — they always target `charts.status`, not the active chart.
- The JSON export gains an additive `plan` section, emitted only when the plan chart has been initialized and differs from the status chart; payload version bumped to **2.11** (imports still accept legacy 1.4 through 2.10 and migrate automatically). A status-only case (the overwhelming majority) stays byte-identical apart from the version bump.
- Note: a diff / "what changes" summary between status and plan, and plan-specific rendering (e.g. planned orthodontic movement), are not part of this release and follow in later releases.

## [1.30.0] - 2026-07-11
### Fixed
- Peri-implant status (mucositis / peri-implantitis mild / moderate / severe) is now written to the exported chart. It was authored, rendered, summarized, and read back on import, but was omitted from `serializeState()`, so it was silently lost on JSON and FHIR export → import. It now round-trips like every other clinical axis (no payload-version change — additive and backward-compatible within 2.10).
### Changed
- Comprehensive documentation refresh. The README (English + all supported UI languages) now covers every clinical axis and setting added since v1.13 — pulp / apical diagnosis (with practical-Latin subtypes), root resorption, peri-implant status, the caries state-machine (ICDAS depth, CARS secondary caries, root caries, radiographic depth), per-surface filling defects, typed tooth wear, discoloration, per-tooth orthodontics, position-aware surface notation, the two-axis restoration model with removable prosthetics and multi-tooth bridge spans, and the tabbed Settings modal. The Status Export/Import field reference and payload version (2.10) are brought current, and the generated API reference (TypeDoc) is regenerated.

## [1.29.0] - 2026-07-11
### Fixed
- Changing the pulp-detail level (Settings) now live-refreshes the whole-mouth summary and per-tooth tooltips (previously stayed stale, showing the old Latin/AAE wording until the next tooth edit).
- Crown-leakage ("Marginal leakage") no longer shows in the tooltip or whole-mouth summary once a tooth's restoration control is hidden (radix/milktooth/extraction/under-gum) or its restoration is cleared — the summary gate now matches the `#crownLeakageRow` control's own visibility gate (`!restorationRowHidden(state)` AND `restorationType` crown/bridge) exactly, including for stale crown/bridge payloads reached via import/hydrate.
- Lower-arch bridge connector saddle bar position corrected (`SADDLE_Y_FRACTION_LOWER` 0.28 → 0.19).

## [1.28.0] - 2026-07-11
### Added
- Position-aware surface notation: caries/filling surface letters and labels now read incisal/labial/palatal on the relevant tooth positions (occlusal → incisal on anteriors; buccal → labial on anteriors; lingual → palatal on upper teeth, lingual on lower teeth), controlled by a new Settings → Tooth details "Surface notation" setting (simple / full, default full). Applies to the whole-mouth summary and to both the caries and filling-defect surface pickers (letter + caption).
- A filling-defect hint note on the Fillings card (e.g. "36 has a filling defect recorded."), parallel to the existing subcaries hint note.
### Changed
- The filling-defect popup's option list now stacks vertically (previously horizontal), matching the caries-depth popup layout.
- Summary and surface-picker letters now default to the anatomically-specific ("full") notation instead of the generic B/O/L set.

## [1.27.0] - 2026-07-11
### Fixed
- Implants and missing/gap teeth once again offer their full restoration/attachment picker: crown/bridge + healing-abutment/locator/locator-denture/bar/bar-denture on an implant; bridge-pontic + removable-partial/removable-full on a missing/gap tooth.
- Restoration row is now hidden on a `radix` substrate tooth (no restoration can be authored on a root remnant).
- Mobility control is now hidden on implant teeth.
- Bridge teeth render both the crown cap AND the saddle connector (previously the connector only).
- Bridge overlay connectors are now arch-aware, fixing a lower-arch misalignment (mirrored saddle-Y geometry for the lower arch).
- Adding a bridge via a Statuses preset now triggers the overlay recompute, so the connector renders immediately instead of requiring a follow-up edit.
- The periapical-inflammation modifier toggle now shows only on missing/extraction-socket teeth (hidden on present teeth and on implants, where `apicalDx`/`periImplant` already drive the periapical/peri-implant glyph).
- Filling defects are now explicitly labeled in the whole-mouth Fillings summary line, matching how secondary caries is labeled on the Caries line.
### Added
- Settings → new "Panels" tab: independently toggle the Statuses and Orthodontics whole-mouth panel visibility.
- The Caries and Secondary-caries settings tabs are merged into one "Caries" tab, with the CARS (secondary-caries) control moved above Radiographic depth.
### Note
- The tooth SVG assets were refreshed alongside this release (unified front dimensions + occlusal ortho-bracket/ring, SVG version 2.5.0) — byte-identical render, no functional change.

## [1.26.0] - 2026-07-11
### Added
- Per-tooth orthodontic charting: appliance (bracket/band), drift (mesial/distal), vertical movement (extrusion/intrusion), and rotation, reusing the dormant v2.5.0 ortho artwork (no new SVG). Shown on the chart, in the tooltip, and a new whole-mouth "Orthodontics" summary section.
### Migration
- Payload version 2.10 (imports 1.4–2.9 accepted). Additive — legacy charts carry no orthodontic findings.

## [1.25.0] - 2026-07-11
### Changed
- Tooth wear controls now sit on separate rows with the "Planned extraction" toggle below them (previously overflowed the panel).
### Added
- Settings → new "Tooth details" tab: a simple/complex detail level for tooth wear and for discoloration. Simple mode shows a yes/no toggle per finding (wear on → attrition/abrasion, discoloration on → other); complex mode (default) keeps the type/cause dropdowns. The stored value is preserved when switching levels.

## [1.24.0] - 2026-07-11
### Added
- Tooth discoloration: record a discolored natural crown by cause (tetracycline, fluorosis, non-vital darkening, extrinsic staining, or other/unknown) on permanent and milk teeth. The chart tints the crown a representative colour; shown in the tooltip and a new whole-mouth "Discoloration" summary section. Completes the surface & structural conditions set (filling defect, wear, discoloration).
### Migration
- Payload version 2.9 (imports 1.4–2.8 accepted). Additive — legacy charts carry no discoloration.

## [1.23.0] - 2026-07-11
### Changed
- Tooth wear is now recorded by clinical type per location: an incisal/occlusal wear type (attrition / erosion) and a cervical wear type (abrasion / abfraction / erosion), replacing the two on/off wear flags. Shown in the tooltip and a new whole-mouth "Wear" summary section.
### Migration
- Payload version 2.8 (imports 1.4–2.7 accepted). A legacy edge-wear flag becomes attrition; a legacy cervical-wear flag becomes abrasion. The chart rendering is unchanged for migrated data.

## [1.22.0] - 2026-07-11
### Added
- Per-surface filling defects for direct restorations: mark a filled surface as having a marginal defect, fracture/chip, or wear (independent of recurrent caries). Authored via a per-surface indicator on the Fillings card; shown in the tooltip and the whole-mouth summary; rendered on the chart.
### Migration
- Payload version 2.7 (imports 1.4–2.6 accepted). Additive — legacy charts carry no filling defects.

## [1.21.0] - 2026-07-11
### Added
- The per-tooth tooltip and the whole-mouth summary panel now surface the full set of clinical findings added since v1.16: pulp diagnosis, apical diagnosis (+ lesion subtype), root resorption, peri-implant status, graded root caries, calculus, crown marginal leakage, fracture, contact loss, and bruxism wear. A new "Diagnoses" section groups the pulp/apical/resorption/peri-implant findings; caries carries a coarse severity qualifier (superficial/moderate/deep).

## [1.20.0] - 2026-07-11
### Added
- Peri-implant status axis for implants: peri-implant health / mucositis / peri-implantitis with graded (mild/moderate/severe) crestal bone loss, shown as a dedicated selector on implants.
### Changed
- Implants no longer render the (clinically incorrect) periapical lesion glyph; their inflammation is expressed through the new peri-implant axis. Missing/extraction-socket teeth are unaffected.
- Removed the ad-hoc "Peri-implantitis" relabel of the periodontal-modifier checkbox (superseded by the dedicated axis).
### Migration
- Payload version 2.6 (imports 1.4–2.5 accepted). On import, an implant that carried the inflammation or periodontal modifier becomes peri-implant mucositis (no bone-loss grade is invented).

## [1.19.0] - 2026-07-11

### Changed
- **Merged Pulp/Endo status selector**: the endodontic-treatment (`endo`) and pulp-diagnosis (`pulpDx`) pickers are now one control; a root-treated tooth (`endo != none`) no longer carries a vital pulp diagnosis — the two fields are mutually exclusive, and on such a tooth `pulpDx` is normalized to `normal` with the diseased-pulp glyph suppressed.
- **Merged "Root and periodontium" card**: the separate "Root" and "Periodontium and inflammations" panels are consolidated into a single card.
- **Periapical lesion subtype reduced to granuloma/cyst**: the redundant "abscess" subtype is dropped (it is already covered by the apical diagnosis); the subtype selector (`none` / `granuloma` / `cyst`) is now shown only under symptomatic or asymptomatic apical periodontitis.
- **Reversible pulpitis** now renders a reduced pulp glyph.
- **Retired the duplicate "periapical inflammation" toggle** on present teeth; the apical diagnosis alone drives the periapical glyph.

### Migration
- JSON/FHIR export payload version bumped to **2.5**; imports still accept legacy 1.4–2.4 payloads and migrate them automatically. On import, a treated tooth's pulp diagnosis is normalized to `normal`, and a legacy `abscess` periapical-lesion subtype is dropped — folded into the apical diagnosis when the tooth carries the inflammation modifier, otherwise cleared, since the apical diagnosis already covers abscess.

## [1.18.0] - 2026-07-11

### Added
- **CARS 0–6 score names**: the secondary-caries picker now shows descriptive ICDAS-based names (Sound, First visual change in enamel, Distinct visual change in enamel, Localized enamel breakdown, Underlying dentin shadow, Distinct cavity, Extensive cavity) instead of raw numbers.
- **Root-caries severity opacity**: the `caries-root` artwork layer now renders at an opacity driven by `rootCaries` (`active` 0.5 / `arrested` 0.7 / `active-cavitated` full), instead of a flat opacity regardless of severity.
- **Fillings-panel subcaries summary line**: a line below the filling controls lists any selected tooth with recurrent (subcaries) caries and its surfaces, e.g. "36 (O) has subcaries set on its filling."
- **Anterior "incisal" surface label**: incisors and canines now label their occlusal surface "incisal" throughout the UI (picker, popup, summaries/tooltips); the stored surface key is unchanged (`occlusal`).
- **Contextual per-surface caries popup**: the surface-depth popup now shows only the severity group relevant to the surface's current state (the primary ICDAS-depth group on an unfilled surface, the CARS group on a filled one), instead of always showing both.

### Changed
- **Unified caries severity field**: the separate SP5 ICDAS-depth (`cariesDepths`) and CARS (`secondaryCaries`) fields are replaced by a single per-surface `cariesSeverity` (0–6), read as ICDAS depth on a primary (unfilled) surface and as a CARS score on a recurrent (filled) one. JSON/FHIR export payload version bumped to **2.4**; imports still accept legacy 1.4, 2.0, 2.1, 2.2, and 2.3 payloads and migrate them automatically.

### Fixed
- **Caries/subcaries is now a proper per-surface state machine**: recurrent caries renders the `subcaries-{surface}` layer at the surface's CARS severity and is no longer settable alongside primary caries on the same surface — a surface is always exactly one of primary caries, recurrent (subcaries), or sound, eliminating the previous ambiguity where both a `caries-{surface}` and a derived recurrent state could coexist.

## [1.17.0] - 2026-07-11

### Added
- **Root caries** clinical axis (`rootCaries`): none / active / arrested / active-cavitated — wires the previously dormant `caries-root` artwork layer on a present tooth's main-view templates.
- **Stored secondary (recurrent) caries score** (`secondaryCaries`): a per-surface CARS 0–6 score, rendered as the `subcaries-{surface}` layer's opacity (`0.30 + (score-1)/5 × 0.70`) — replaces the old render-time derivation from `caries ∩ fillingSurfaceMaterials`.
- **Radiographic caries depth** (`radiographicDepth`): a per-surface none / E1 / E2 / D1 / D2 / D3 finding, independent of the visual ICDAS depth scale — surfaced as a `data-radio` badge attribute on the surface indicator, and round-trips through FHIR via its own `radiographic-caries-depth` Observation.
- **Three caries granularity settings** (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus `cariesDepthEnabled`, letting the picker UI collapse each scale to a simpler view without losing the underlying stored value.
- **Tabbed Settings modal** (General / Caries / Secondary caries / Pulpa / Notes), replacing the previous flat settings dropdown.

### Changed
- JSON export payload bumped to **version 2.3**; imports still accept legacy 1.4, 2.0, 2.1, and 2.2 payloads and migrate them automatically (a migrated `caries ∩ fillingSurfaceMaterials` surface is promoted to the canonical "moderate" `secondaryCaries` score of 3, unless a stored score is already present).
- Secondary (recurrent) caries is now a **stored, scored** clinical finding (`secondaryCaries`), not derived at render/summary time from `caries ∩ fillingSurfaceMaterials`.

## [1.16.0] - 2026-07-11

### Added
- **AAE pulp diagnosis** clinical axis (`pulpDx`): normal / reversible pulpitis / irreversible pulpitis / necrosis — replaces the retired `pulpInflam` boolean, with a byte-identical SVG render for the migrated "inflamed pulp" case (on both permanent and milk-tooth branches).
- **Practical-Latin pulp subtypes** (`pulpLatin`): pulpa sana, hyperaemia pulpae, pulpitis acuta serosa/purulenta, pulpitis chronica clausa/ulcerosa/hyperplastica, necrosis pulpae, gangraena pulpae — surfaced through a new 3-level **pulp detail setting** (`pulpDetailLevel`: `simple` / `aae` / `latin`, default `aae`) that collapses the pulp picker to the appropriate vocabulary; `getPulpDetailLevel()`/`setPulpDetailLevel()` public API.
- **Apical diagnosis** clinical axis (`apicalDx`): normal / symptomatic apical periodontitis / asymptomatic apical periodontitis / acute apical abscess / chronic apical abscess / condensing osteitis — now drives the periapical glyph directly on a present tooth.
- **Root resorption type** (`resorptionType`): internal / external-cervical — replaces the retired `rootResorption` boolean, with a byte-identical SVG render (including the `inflammationHome` z-order lift when combined with an apical diagnosis).

### Changed
- JSON export payload bumped to **version 2.2**; imports still accept legacy 1.4, 2.0, and 2.1 payloads and migrate them automatically (`pulpInflam` → `pulpDx`, `rootResorption` → `resorptionType`, `mods.inflammation`/`periapicalType` → `apicalDx`).
- The periapical glyph is now driven by the `apicalDx` diagnosis axis, decoupled from the `mods.inflammation` modifier (existing `mods.inflammation` payloads still migrate to an equivalent `apicalDx` value; render is byte-identical for migrated states).
- The legacy `pulpInflam` and `rootResorption` boolean clinical axes are retired from the live state model (kept only as a read-only input-side migration path for legacy payloads).

## [1.15.0] - 2026-07-11

### Added
- New **`prosthesis`** clinical axis (healing-abutment / locator / locator-denture / bar / bar-denture / removable-partial / removable-full), orthogonal to `restorationType`×`restorationMaterial`, surfaced with a "Kivehető:" prefix in the combined restoration dropdown. Covers implant attachments (healing abutment, locator, bar, with or without an overdenture) and tooth-supported removable partial/full dentures — replacing the legacy `crownMaterial`/`bridgeUnit` attachment and removable values field-for-field (byte-identical render).
- **Implant fixed crowns** now join the `restorationType`×`restorationMaterial` model: implants are no longer gated away from crown/bridge restoration options, and render via composition (`{material}-{type}` layers) plus an implant connector layer, with `metal` migrating to `metal-ceramic` for implants too.
- Multi-tooth **bridge-span overlay**: consecutive bridge teeth (`restorationType: "bridge"` or `bridgePillar`) within one arch now render a single continuous gum-line saddle across the inter-tooth gaps, drawn as an engine-owned `<svg>` over the tooth grid. The overlay is purely presentational (derives spans from existing tooth state; no new state field), repositions on resize, and is included in SVG/PNG/JPG export.
- **Crown marginal-leakage toggle**: a new `crownLeakage` boolean clinical axis + tooth-editor checkbox, shown only for a crown or bridge restoration, activating the previously dormant `crown-leakage` artwork layer. Round-trips through FHIR export/import (`crown-leakage` finding) like any other boolean axis.

### Changed
- JSON export payload bumped to **version 2.1** (adds `prosthesis`, drops `crownMaterial`/`bridgeUnit`); imports still accept legacy 1.4 and 2.0 payloads and migrate them automatically (implant `crownMaterial` fixed crowns → `restorationType`+material; attachment/removable `crownMaterial`/`bridgeUnit` values → `prosthesis`).
- FHIR export now emits a `prosthesis` coding in place of the dropped attachment/removable `crown-material`/`bridge-unit` codings, restoring round-trip fidelity for implant attachments (locator/bar/healing-abutment) that SP3a had dropped from FHIR; implant crowns round-trip via the existing `restoration-type`/`restoration-material` codings.
- The legacy `crownMaterial`/`bridgeUnit` fields are fully retired from state, serialization, and the value-map registry (kept only as a read-only input-side migration path for legacy payloads).

### Fixed
- **Invalid restoration type/material combinations are now corrected on import**: a hand-edited or imported payload that pairs a restoration type with a material it doesn't support (e.g. an inlay in metal) is coerced to that type's first valid material (or dropped to no restoration if the type itself carries none), and a warning is surfaced — instead of silently persisting a combination the renderer would have drawn nothing for.
- **Implant fixed crowns from 2.0-format payloads are no longer silently dropped on import**: an implant crown serialized by an intermediate build as `{restorationType:"none", crownMaterial:<material>}` now correctly folds into `restorationType:"crown"` + that material (with `metal` → `metal-ceramic`), instead of vanishing.
- The combined restoration dropdown now actually lists the **"Kivehető:" (removable) `prosthesis` entries** (implant attachments for an implant tooth; removable partial/full dentures for a gap) and writes the `prosthesis` axis when one is chosen — previously only the "Fix:" half was wired and the removable prefix was unused.
- Selecting a "Kivehető:" prosthesis or a fixed restoration now keeps the two axes mutually exclusive (a tooth has **either** a fixed restoration **or** a prosthesis); import also enforces this coherence (restoration wins if a crafted payload sets both).
- **Stale `crownLeakage` is now cleared** when a restoration changes away from crown/bridge, preventing an orphaned `crown-leakage` finding on a non-crown tooth.

## [1.14.0] - 2026-07-11

### Added
- Two-dimensional restoration model: `restorationType` (crown/inlay/onlay/veneer/bridge) × `restorationMaterial` (e.max/gold/gradia/zirconia/metal/metal-ceramic/telescope/temporary), replacing the flat `crownMaterial` enum as the clinical axis.
- New `toothSubstrate` axis (natural/radix/broken/crownprep) describing the tooth's underlying structure, independent of any restoration placed on it.
- Gold, Gradia, and metal-ceramic (PFM) restoration materials, and inlay/onlay/veneer restoration types, wired from the previously dormant v2.5 artwork into charting.
- Combined, low-click restoration dropdown (type × material in a single control) in the tooth editor.
- Groundwork for crown-marginal-leakage findings (new axis values only; UI is not wired yet — deferred to a later stage).

### Changed
- Legacy `metal` crowns and bridges now migrate to `metal-ceramic` (PFM) on load; the pre-existing full-cast look is now the distinct `metal` restoration material.
- JSON export payload bumped to **version 2.0**; imports still accept legacy 1.4 payloads and migrate them automatically.
- FHIR export now emits `restoration-type` / `restoration-material` / `tooth-substrate` codings in place of the old `crown-material` coding.

### Removed
- The flat `crownMaterial` enum as a clinical axis (a legacy field of the same name is retained internally only to drive implant-attachment rendering, per the migration plan).

## [1.13.0] - 2026-07-11

### Changed
- Internal architecture: FHIR export/import, value validation, SVG clear-set + boolean-flag layer activation, and the stable UI option lists are now generated from a single declarative clinical-axis registry (`src/registry/`) instead of scattered ad-hoc maps. Behavior-preserving — the JSON payload (version 1.4) and FHIR output are byte-identical to 1.12.0, guarded by frozen parity goldens.

### Removed
- Dead code orphaned by the registry migration (unused SVG-group helpers, duplicated dependency literals, superseded `GROUPS` layer lists).

## [1.12.0] - 2026-07-11

### Changed
- Updated tooth SVG assets to artwork version 2.5.0 (new dental-material, orthodontic, planning, root-fracture, filling-defect and root-caries layers added as dormant layers; not yet wired into charting — see the architecture-constitution spec).

### Fixed
- Corrected the `inicisal` → `incisal` broken-crown layer-id typo across the engine and SVG assets.
- Fixed the `prosthesis-bridge-connector` → `prosthesis-connector` id in `16_occl.svg` so the removable-prosthesis connector renders in the occlusal view.

## [1.11.1] - 2026-07-10

Documentation accuracy and FHIR value-map consistency.

### Fixed
- Corrected the HL7 FHIR export claim in every README language variant (including
  the new pt-BR) and the CHANGELOG: the export emits local + ISO 3950 (permanent
  dentition) codings — SNOMED CT is not yet emitted (mapping planned). Aligned the
  `src/fhir/codesystems.ts` comments accordingly.

### Changed
- FHIR export: added the `crownprep` ("Prepared for crown") crown material to the
  local value map so it exports with a proper display; removed the obsolete
  `tooth-crownprep` tooth-selection value (it is now a crown material, not a base type).
- Extended the FHIR value-map test to cover `periapicalType`.
- `package.json` — version 1.11.0 → 1.11.1.

## [1.11.0] - 2026-07-10

Brazilian Portuguese (pt-BR) UI language.

### Added
- **Brazilian Portuguese (`pt-br`)** as a 9th UI language: full translation of every i18n key in `src/i18n/translations.ts`, added to the topbar language switcher (`LANGUAGE_OPTIONS` in `src/App.tsx`) and to the `Language` type. Localized `language.pt-br` display name added to all existing languages.
- New `lang/README-pt-br.md` (translated from the English README); the 🇧🇷 Português (BR) entry added to every README language switcher.

### Changed
- `package.json` — version 1.10.0 → 1.11.0.
- README language lists and API docs updated from `HU/EN/DE/ES/IT/SK/PL/RU` to include `PT-BR` across all languages.

## [1.10.0] - 2026-07-03

Tooth-information panel, dynamic subtitle, crown-prep type, SVG/z-order fixes, and a multilingual README overhaul.

### Added
- **Tooth information panel** — live textual summary of the whole chart: tooth counts, present/missing lists, and Caries (incl. secondary) / Fillings / Root canals / Prosthetics / Implants (only when present) / periodontal status. Shown by default; toggleable in the Settings menu. Plural-aware phrasing per language; refreshes live.
- New public API: `getOdontogramSummary()` (structured, localized summary) and `onStateChange(callback)` (subscribe to state changes; returns an unsubscribe function).
- Dynamic topbar subtitle reflecting the current language, numbering system, and light/dark mode.
- `crownprep` ("Prepared for crown") as a permanent-tooth crown material — moved from the Base dropdown into the Crown dropdown; mirrors the "broken" crown behavior and renders the crown-prep layer. Crown list reordered with `radix` first; default stays `natural` (Full crown).
- Standalone per-language README files under `lang/` (de, hu, it, sk, pl, ru); `README.md` keeps English + Spanish with a language switcher.
- ~40 new i18n keys × 8 languages (tooth-info panel, dynamic subtitle, implants, crown-prep label reuse).

### Changed
- Renamed the app to **React Advanced Odontogram** (from "…Editor Modul") across all languages.
- Re-normalized the tooth 14 SVG to the current layer format (typed periapical glyphs, calculus, subcaries, resorption, fissure sealing).
- Refined the Hungarian endodontic wording to precise clinical terms.
- CHANGELOG brought up to date (1.5.0–1.10.0); README rigorously reviewed to match current behavior.
- `package.json` — version 1.9.0 → 1.10.0.

### Fixed
- Global visibility toggles (wisdom/occlusal/bone/pulp/edentulous) and card collapse now use delegated listeners, so they survive React StrictMode's double mount instead of cancelling themselves out — this also restored the periodontal/periapical inflammation buttons.
- Inflammation glyph z-order: when `endo-resection` and/or `endo-resorption` is active together with an inflammation glyph, the inflammation group is lifted above the tooth group (keeping the lower-tooth mirror transform) so the glyph stays visible.
- Calculus row spacing in its default state; no tooth-base gloss on broken/radix crowns.

## [1.9.0] - 2026-07-01

Unified topbar icon row and optional ICDAS II caries scoring.

### Added
- Unified topbar icon row with a Settings menu (numbering, notes, ICDAS, tooth information).
- Optional **ICDAS II** per-surface caries scoring (0–6) via the `enableIcdas` prop / Settings toggle, with a numeric badge on scored surfaces; included in FHIR export.

### Changed
- Consolidated the topbar controls (intro, language, dark mode, settings, export, import) into a single icon row.

## [1.8.0] - 2026-06-30

Clinical marking layers, native SVG export, and per-surface caries depth.

### Added
- Clinical marking layers (v2.1.4 tooth SVGs): calculus, root resorption, secondary (recurrent) caries, and typed periapical lesions (granuloma / cyst / abscess).
- Per-surface caries depth (superficial / dentin / deep) with a depth selector and popup.
- Native SVG export of the chart; PNG/JPG now rasterize from the vector SVG.

### Fixed
- Lesion type options and filling cross size; clearer note icon; persistent note icon after tooth-number refresh; calculus toggle id collision.

## [1.7.0] - 2026-06-23

Export/Import dropdowns, FHIR import, progress overlay, intro tour, and periapical lesion types.

### Added
- Consolidated Export dropdown (Status JSON / FHIR / PNG / JPG) and an Import dropdown with status/FHIR routing.
- HL7 FHIR R4 import — parse self-produced FHIR Bundles back into chart state (round-trip).
- Phased progress overlay during image export.
- 12-step interactive intro tour.
- Periapical lesion entity type (granuloma / cyst / abscess).

## [1.6.0] - 2026-06-20

Cross-surface selection UI, mixed fillings, and PNG/JPG export.

### Added
- Cross/plus surface selection UI (B/M/O/D/L) for caries and fillings.
- Per-surface restoration materials (mixed fillings, e.g. buccal amalgam + distal composite); JSON schema 1.4 + FHIR support.
- Engine PNG/JPG export of the odontogram.

### Fixed
- Molar filters now include all molars; hide `tooth-base-beauty` gloss on implants.

## [1.5.0] - 2026-06-14

HL7 FHIR R4 export, MIT license, and English default language.

### Added
- **HL7 FHIR R4 export** — a collection Bundle of per-tooth Observations, ISO 3950 tooth coding for permanent dentition, and a local code system (SNOMED CT mapping planned).
- MIT LICENSE file (resolves #7).

### Changed
- Default UI language set to English.
- README completed with FHIR export documentation.

## [1.4.2] - 2026-03-22

Per-tooth notes with double-click editor, label icons, and JSON export/import.

### Added
- **Per-tooth notes system**
  - `note` field added to tooth state model (string, empty by default)
  - Double-click a tooth tile to open the note editor popover
  - Note editor positioned near the tooth tile with viewport clamping
  - Save and Delete buttons in the popover
  - Note icon (📝) displayed next to the tooth number in label cells
  - Note text included in hover tooltips with 📝 prefix
  - Notes included in JSON export/import (optional field, only when non-empty)
  - Touch support: "Note" button added to the zoom popover on touch devices
  - Read-only mode guard: note editor does not open in read-only mode
- New `enableNotes` prop on the `App` component (default `false` — opt-in)
- New `setNotesEnabled(value)` / `getNotesEnabled()` exported API functions
- 4 new i18n keys (`note.title`, `note.save`, `note.delete`, `note.placeholder`) × 8 languages = 32 new translations
- 2 new tests in `a11y.test.ts` for note i18n validation — total 163 tests across 9 files

### Changed
- JSON export/import version bumped from 1.2 to 1.3 (backward compatible — `note` field is optional)
- `src/odontogram.ts` — `note` in `defaultState()`/`serializeState()`/`hydrateState()`, `showNoteEditor()`/`hideNoteEditor()` functions, `dblclick` handler in `addTile()`, note button in zoom popover, `updateToothLabelNoteIcon()`, label icon refresh on import
- `src/App.tsx` — `enableNotes` prop, `setNotesEnabled`/`getNotesEnabled` imports and exports, sync useEffect
- `src/index.css` — note editor popover styles (`.odon-note-popover`, `.odon-note-backdrop`, `.odon-note-textarea`), note icon in label cells (`.tooth-note-icon`), dark mode overrides
- `src/i18n/translations.ts` — 32 new translation entries (4 keys × 8 languages)
- `src/__tests__/App.test.tsx` — mock updates for `setNotesEnabled`/`getNotesEnabled`
- `package.json` — version 1.4.1 → 1.4.2

## [1.4.1] - 2026-03-12

Keyboard accessibility (WCAG), read-only mode, and selection animations.

### Added
- **Keyboard accessibility (WCAG compliance)**
  - ARIA `listbox`/`option` roles on tooth grid and tiles
  - `aria-selected` attribute synced with selection state
  - `aria-multiselectable="true"` on the grid container
  - `aria-hidden="true"` and `tabindex="-1"` on decorative label rows
  - Enter/Space to toggle tooth selection
  - Arrow key navigation (Left/Right within row, Up/Down between upper/lower arches)
  - Escape to clear selection
  - `:focus-visible` outline styles in both light and dark mode
  - Wisdom teeth get `tabindex="-1"` and `aria-hidden` when hidden
- **Read-only mode**
  - New `readOnly` prop on the `App` component
  - New `setReadOnly(value)` / `getReadOnly()` exported API functions
  - When active: all click, touch, and keyboard interactions are disabled
  - Control panel is dimmed (`opacity: 0.5`, `pointer-events: none`)
  - Tooth tiles become non-interactive with `pointer-events: none`
  - All tiles get `tabindex="-1"` to remove from tab order
  - Useful for print, report, and view-only use cases
- **Selection animations**
  - Pulsing dashed border via `::after` pseudo-element (`odon-dash-pulse` keyframes)
  - Glowing `drop-shadow` effect on selected tooth SVGs (`odon-glow-pulse` keyframes)
  - Smooth `.25s ease` transitions for selection/deselection
  - Full dark mode support with separate keyframes (`odon-dash-pulse-dark`, `odon-glow-pulse-dark`)
  - `prefers-reduced-motion: reduce` support — static styles for motion-sensitive users
- New `readOnly.label` i18n key in all 8 languages (HU/EN/DE/ES/IT/SK/PL/RU)
- 7 new tests in `a11y.test.ts` — total 161 tests across 9 files

### Changed
- `src/odontogram.ts` — added `readOnly` state, `onToothKeydown()` handler, `navigateToTooth()` navigation, ARIA attributes in `addTile()`/`addLabelRow()`/`buildGrid()`/`updateSelectionUI()`/`updateToothTileVisibility()`, read-only guards in event handlers
- `src/App.tsx` — new `readOnly` prop, `setReadOnly`/`getReadOnly` imports and exports, sync useEffect
- `src/index.css` — selection animation keyframes and styles, focus-visible styles, read-only mode styles, dark mode overrides, prefers-reduced-motion media query
- `src/i18n/translations.ts` — 1 new key × 8 languages = 8 new translations
- `src/__tests__/App.test.tsx` — mock updates for `setReadOnly`/`getReadOnly`
- `package.json` — version 1.4.0 → 1.4.1

## [1.4.0] - 2026-03-10

Mobile touch UX interactions and custom SVG plugin system.

### Added
- **Mobile touch UX** (touch interactions)
  - Tap-to-zoom — touching a tooth displays a magnified SVG popover
  - Long-press (500ms) — context menu with tooth status summary
  - Pinch-to-zoom — two-finger zoom gesture on the tooth chart
  - Arch toggle navigation — switch between upper/lower arches on screens ≤600px
  - WCAG 44px touch targets via `@media (pointer: coarse)` media query
  - `touch-action: none` for precise gesture handling
  - 14 new i18n keys × 8 languages = 112 new translations (touch.zoom.*, touch.ctx.*, touch.arch.*, chart.hint.touch)
- **Custom SVG Plugin system** (`OdontogramPlugin`)
  - `OdontogramPlugin` type: `id`, `label`, `layer`, `renderSvg()`, optional `panelSection`
  - 3 layer priorities: `base` (z=0), `restoration` (z=3), `overlay` (z=6)
  - Plugin SVG injection into tooth `<g>` elements with z-index ordering
  - Per-tooth `customStates: Record<string, unknown>` for plugin data storage
  - State tooltip: displays all active statuses on tooth tiles
  - State validation with 5 rules — localized warnings for incompatible state combinations
  - JSON export/import version 1.1 → 1.2, with `customStates` support
  - 5 new warning keys × 8 languages = 40 new translations (warn.endoOnMissing, warn.fillingOnMissing, warn.crownReplaceNoCrown, warn.cariesOnMissing, warn.pillarNoCrown)
- 4 new public API functions: `registerPlugins()`, `setPluginState()`, `getPluginState()`, `getToothStateSummary()`
- New `plugins` prop on the `App` component
- `src/plugin.ts` — plugin type definitions (`OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, `LAYER_Z`)
- 26 new tests in 2 files — total 154 tests in 8 files
  - `touch.test.ts` — 10 tests: touch i18n keys, placeholders, consistency
  - `plugin.test.ts` — 16 tests: `getQuadrant()`, `LAYER_Z`, plugin type, warning i18n keys
- `.warning-item` CSS styles (light + dark mode) for state validation warnings

### Changed
- `src/odontogram.ts` — touch event handlers, plugin overlay system, state tooltip, validation, JSON version 1.2
- `src/App.tsx` — `plugins` prop, plugin API exports (`registerPlugins`, `setPluginState`, `getPluginState`, `getToothStateSummary`)
- `src/i18n/translations.ts` — 152 new translation entries (14 touch + 5 warning keys × 8 languages), total 190+ keys per language
- `src/index.css` — touch UI styles (zoom popover, context menu, pinch zoom, arch toggle, WCAG targets) and warning styles
- `src/__tests__/App.test.tsx` — mock updates for new API exports
- `package.json` — version 1.3.0 → 1.4.0
- README.md — all 4 languages (EN/DE/ES/HU) updated with mobile UX and plugin system documentation

## [1.3.0] - 2026-03-09

Automated testing, API documentation, and custom theme configuration.

### Added
- **Vitest testing framework** — 128 tests in 6 files, full coverage of the public API
  - `numbering.test.ts` — FDI/Universal/Palmer conversion for all 32 adult + 20 deciduous teeth, edge cases
  - `translations.test.ts` — key consistency across all 8 languages, empty value checks, placeholder validation
  - `status_extras.test.ts` — 21 preset structure validations (arches, materials, teeth, overlaps)
  - `useI18n.test.ts` — `t()` translation function, language switching, listener system
  - `App.test.tsx` — rendering, controlled/standalone mode, dark mode, dropdowns
  - `theme.test.ts` — CSS custom property application, null/undefined handling
- **TypeDoc API documentation** — JSDoc comments on all exported types and functions
  - `typedoc.json` configuration with GitHub Pages support
  - `npm run docs` script to generate `docs/` directory
- **Theme configuration system** (`OdontogramThemeConfig`)
  - 8 color properties: `background`, `panel`, `card`, `text`, `muted`, `line`, `accent`, `accent2`
  - CSS custom properties (`--odon-*`) with fallback system — works with both Tailwind and vanilla CSS projects
  - New `themeConfig` prop on the `App` component
  - `applyThemeConfig()` utility function for runtime color overrides
  - Dark mode and theme config are fully compatible
- New npm scripts: `test`, `test:watch`, `test:coverage`, `docs`

### Changed
- `src/App.tsx` — new `themeConfig` prop, `OdontogramThemeConfig` export, `.odontogram-root` wrapper div for CSS custom properties
- `src/index.css` — CSS variables rewritten to `var(--odon-*, fallback)` format, new `.odontogram-root` and `.dark .odontogram-root` selectors
- `src/theme.ts` — new file: `OdontogramThemeConfig` type and `applyThemeConfig()` function
- `src/odontogram.ts` — JSDoc comments for public API functions (`initOdontogram`, `destroyOdontogram`, `setNumberingSystem`, `clearSelection`, `setWisdomVisible`, `setShowBase`, `setOcclusalVisible`, `setHealthyPulpVisible`)
- `src/i18n/translations.ts` — JSDoc comments for `Language` type and `translations` object
- `src/i18n/useI18n.ts` — JSDoc comments: `t()`, `getI18nLanguage()`, `setI18nLanguage()`, `onI18nChange()`, `useI18n()`
- `src/utils/numbering.ts` — JSDoc comments: `NumberingSystem` type, `toLabel()` function with examples
- `src/status_extras.ts` — JSDoc comment for `STATUS_EXTRAS` object
- `vitest.config.ts` — new file: Vitest configuration with jsdom environment
- `package.json` — version 1.2.0 → 1.3.0, new dev dependencies (vitest, @testing-library/react, @testing-library/jest-dom, jsdom, typedoc)

## [1.2.0] - 2026-03-06

Dark mode support with standalone and controlled integration modes.

### Added
- **Dark mode** — full light/dark theme switching with comprehensive CSS overrides for all UI elements
  - New toggle button in the topbar (sun/moon icon) placed between the language selector and numbering system selector
  - **Standalone mode**: omit `darkMode` prop — the component manages its own theme state, toggling the `.dark` class on `<html>`
  - **Controlled mode**: pass `darkMode` and `onDarkModeChange` props to let the parent application control the theme
- New component props: `darkMode?: boolean`, `onDarkModeChange?: (dark: boolean) => void`
- Dark mode i18n labels (`theme.light` / `theme.dark`) for all 8 supported languages (HU/EN/DE/ES/IT/SK/PL/RU)
- 40+ dark theme CSS overrides: topbar, chart header, panel, cards, buttons, inputs, selects, tooltips, scrollbars, tooth labels, selection filters, status presets, and all interactive elements
- `.btn-theme` CSS class for the dark mode toggle button styling

### Changed
- `src/App.tsx` — added dark mode state management (internal + controlled), toggle button rendering with sun/moon SVG icons, `.dark` class lifecycle management
- `src/index.css` — added `.dark` block with comprehensive CSS overrides for all color-sensitive selectors
- `src/i18n/translations.ts` — added `theme.light` and `theme.dark` translation keys for all 8 languages
- README.md updated with dark mode integration instructions, component props table, and topbar description in all 4 documentation languages (EN/DE/ES/HU)

## [1.1.0] - 2026-03-03

Multi-language expansion and README overhaul.

### Added
- 5 new UI languages: Spanish (ES), Italian (IT), Slovak (SK), Polish (PL), Russian (RU) — total: 8 languages
- Flag emojis (🇭🇺🇬🇧🇩🇪🇪🇸🇮🇹🇸🇰🇵🇱🇷🇺) in language switcher for each language
- 162 translation keys per language (previously 157, extended with `language.es/it/sk/pl/ru`)
- README sections in 4 languages: English, German, Spanish, Hungarian
- Download, version, license, React, and TypeScript badges in README
- Emoji-enhanced section headers throughout README
- CHANGELOG.md version tracking

### Fixed
- Dropdown localization bug: crown, bridge unit, endo, filling, and mobility select elements now properly update their labels when switching languages (previously only `toothSelect` and `statusExtraSelect` were refreshed)

### Changed
- `Language` type extended from `"hu" | "en" | "de"` to `"hu" | "en" | "de" | "es" | "it" | "sk" | "pl" | "ru"`
- `LANGUAGE_OPTIONS` in App.tsx extended from 3 to 8 entries
- README.md fully rewritten (was EN+HU, now EN/DE/ES/HU with badges and emojis)
- I18n references updated from "HU/EN/DE" to "HU/EN/DE/ES/IT/SK/PL/RU" across all documentation

## [1.0.0] - 2026-02-21

First stable release of the React Advanced Odontogram — an interactive, SVG-based dental chart editor.

### Added

#### Core
- Interactive SVG-based odontogram with per-tooth visualization
- Multi-tooth annotation and selection system
- Topbar toggle controls for layer visibility
- Exposed selection controls API (start unselected by default)

#### Visual Layers
- Crown replace, crown needed, missing closed
- Radix, endo-filling-incomplete, parapulpal pin
- SVG assets moved to src with asset-import based build

#### Integration
- Submodule-ready architecture for embedding in parent projects
- Vite + React + TypeScript build pipeline
- Stable TypeScript build config with resolved type errors

#### Documentation
- English README with usage instructions
- ISO dental notation reference PDFs
- GitHub Pages support

### Fixed
- Odontogram init lifecycle and import handling
- Topbar toggle buttons duplicate click bindings

[1.11.1]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.11.0...v1.11.1
[1.11.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.10.0...v1.11.0
[1.10.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZoliQua/React-Odontogram-Modul/releases/tag/v1.0.0
