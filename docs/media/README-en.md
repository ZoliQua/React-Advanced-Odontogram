<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/src/assets/react-module-logo.png" alt="React Advanced Odontogram logo" width="160" />
</p>

# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-2.6.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md)

---

## 📑 Contents

- [📋 Overview](#-overview)
- [📦 Use as an npm package](#-use-as-an-npm-package)
- [✨ Key Features](#-key-features)
- [📦 Modules](#-modules)
- [🛠️ UI Controls](#-ui-controls)
- [🦷 Tooth Types and States](#-tooth-types-and-states)
- [⚙️ Settings](#-settings)
- [🖼️ SVG Template System](#-svg-template-system)
- [🔢 Numbering Systems](#-numbering-systems)
- [🚀 Usage](#-usage)
- [🔗 Integration](#-integration)
- [🧪 Testing](#-testing)
- [📖 API Documentation](#-api-documentation)
- [📡 Public API](#-public-api)
- [💾 State persistence (localStorage)](#-state-persistence-localstorage)
- [💾 Status Export/Import Format](#-status-exportimport-format)
- [🖨️ Export](#-export)
- [📁 Folder Structure](#-folder-structure)
- [⚙️ Tech Stack](#-tech-stack)
- [📝 Notes](#-notes)
- [🔒 Security notes](#-security-notes)
- [📖 How to cite](#-how-to-cite)

## 🇬🇧 English

### 📋 Overview
This project is an interactive, browser-based odontogram editor that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

---
![Odontogram editor — English preview](screenshot_en_odontogram.png)

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### 📦 Use as an npm package

The odontogram ships as a self-contained React component library on npm:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Requirements
- **React 18 or 19** (declared as a peer dependency — provided by your app).
- A **bundler** that understands the `exports` field and ESM: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. The package is **ESM-only**.
- Node **≥ 18** for tooling.

#### Installation

```bash
npm install react-advanced-odontogram react react-dom
```

#### Basic usage

Render `OdontogramShell` and import the stylesheet **once** anywhere in your app:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="en"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Component props

`OdontogramShell` is a controlled component. The most common props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI language (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Tooth numbering system. |
| `darkMode` | `boolean` | `false` | Dark theme toggle. |
| `readOnly` | `boolean` | `false` | Disable all editing (view-only). |
| `themeConfig` | `OdontogramThemeConfig` | — | Override theme CSS variables (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Register custom state plugins / extra layers. |
| `enableNotes` | `boolean` | `false` | Enable per-tooth notes. |
| `enableIcdas` | `boolean` | `false` | Enable ICDAS II caries scoring. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Filling-card complexity: `"simple"` (one material per tooth) or `"complex"` (per-surface materials). |
| `fillingDefectEnabled` | `boolean` | `true` | Enable filling-defect findings on the Fillings card. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | all available | Available filling materials as a boolean map over `amalgam`/`composite`/`gic`/`temporary` (unknown keys ignored). |
| `fissureSealingEnabled` | `boolean` | `true` | Enable fissure sealing on the Fillings card. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Fire when the user changes the matching setting from Settings → Fillings. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Fire when the user changes the setting from the UI. |

Finer-grained detail-level props (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) are also accepted — see the shipped `.d.ts` types for the full, typed list.

The four fillings props above are **restore-only**: an omitted prop never writes the engine (an imperative `setFillingComplexity()` call before mount is preserved and standalone mode is unchanged), while a provided prop writes the engine and the Settings-modal state together, so the modal never shows a stale value. `fillingMaterialAvailability` is applied diff-wise against a canonical serialized key, so re-rendering with an inline literal of identical content never re-writes the engine. The matching `on*Change` callbacks fire from Settings → Fillings — the write-back path for hosts persisting preferences.

#### Public API (named exports)

`OdontogramShell` is both the default export and a named export. The imperative state API, the standalone `PerioChart` component, the guided tour, and all public types are named exports from the same entry point:

```ts
import {
  OdontogramShell,           // also the default export
  PerioChart,                // standalone periodontal chart component
  // read state
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // subscribe to state changes
  // export / import
  exportFhir,                // HL7 FHIR R4 bundle
  exportSvg, exportImage,    // vector / raster chart export
  setImportFormat,
  // control
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // launch the onboarding tour
  // …and many more setX/getX settings functions
} from "react-advanced-odontogram";
```

The full surface (≈ 44 functions + types such as `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) is fully typed in the bundled declarations.

#### Composable surfaces (advanced)

`OdontogramShell` is the supported all-in-one component and needs no extra setup. If you need to place the odontogram's regions in different areas of your own layout, the shell's four UI surfaces are also exported and can be composed under a single `OdontogramProvider`, all sharing one package-owned session:

```tsx
import {
  OdontogramProvider,
  OdontogramTopbar,
  OdontogramChartSurface,
  ToothInfoSurface,
  ToothControlsSurface,
} from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

function Workspace() {
  return (
    <OdontogramProvider language="en" numberingSystem="FDI">
      <MyHeaderArea><OdontogramTopbar /></MyHeaderArea>
      <MyMainArea>
        <OdontogramChartSurface />
        <ToothInfoSurface />
      </MyMainArea>
      <MySidePanel><ToothControlsSurface /></MySidePanel>
    </OdontogramProvider>
  );
}
```

`OdontogramProvider` takes the same props as `OdontogramShell`. A `useOdontogramUi()` hook (and the `OdontogramUiContextValue` type) is available for building your own surfaces. Current constraint: use one provider per page. Surfaces can be mounted and unmounted on demand — they rebind automatically on remount. `OdontogramShell` itself is unchanged — it is exactly this composition in the default arrangement.

For even finer composition, the individual control cards are exported as well — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard`, and `ToothDetailsCard` — each a self-contained declarative component that reads and writes the shared session through the engine API (a `useEngineState()` hook is exported for building your own). Mount only the cards a given layout needs, in any arrangement, under one `OdontogramProvider`.

#### Using it with Next.js (App Router)

The component is client-only, so render it from a Client Component:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="en" numberingSystem="FDI" />;
}
```

Or load it with a client-only dynamic import: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Important notes & current limitations
- **ESM-only** — the package publishes a single ES module (`dist/odontogram.js`) plus a type-declaration entry (`dist/index.d.ts`). It targets bundler module resolution; there is no CommonJS build.
- **The stylesheet is separate** — you **must** import `react-advanced-odontogram/style.css` once; it is not injected automatically. Styling is global CSS scoped under `.odontogram-root` and driven by `--odon-*` CSS variables.
- **SSR / client-only** — the component reads the DOM on mount (`document`), so it must run in the browser. In SSR frameworks, render it in a Client Component (`"use client"`) or via a client-only dynamic import.
- **Assets are self-contained** — the tooth and icon SVGs are inlined into the JavaScript bundle at build time; there is **no runtime asset fetch** to configure and nothing extra to copy to your public folder.
- **One instance per page** — engine state is currently a module-level singleton, so rendering two `<OdontogramShell>` instances on the same page would make them share a single chart's state. Multi-instance support is planned for a future release.

---

### ✨ Key Features
- 🖱️ Fast selection and multi-select (CMD/CTRL + click)
- 🦷 Tooth types: permanent, primary (milk), implant, subgingival, missing
- 🦷 Tooth substrate (orthogonal to any restoration): natural, radix (root remnant), broken, prepared for crown
- 👑 Restorations by type × material: crown / inlay / onlay / veneer / bridge in e.max, gold, gradia, zirconia, metal, metal-ceramic, telescope or temporary (onlay is occlusal-view only) — chosen from one combined low-click "Fix: Crown – …" picker; legacy `metal` crowns migrate to `metal-ceramic` (PFM); implants use the same type × material model, composed with an implant connector layer. The picker is scoped by tooth kind: an implant offers only crown/bridge (plus its five attachment options, below); a missing/gap tooth offers only a bridge pontic (plus removable-partial/-full); a `radix` substrate hides the restoration control entirely (no restoration can be authored on a root remnant)
- 🦿 Removable/attachment prosthetics on the dedicated `prosthesis` axis ("Kivehető:" entries in the combined picker): implant healing abutment, locator, locator with overdenture, bar, bar with overdenture; tooth-supported removable partial or full denture
- 🌉 Bridge teeth render both the crown cap and the saddle connector; a multi-tooth bridge-span overlay renders one continuous, arch-aware connector across consecutive bridge teeth (pontics + abutments) and the inter-tooth gaps between them (upper vs. lower arch use mirrored saddle geometry, keeping the connector aligned on both arches), included in PNG/JPG/SVG export; applying a bridge via a Statuses preset recomputes the overlay immediately
- 🔍 Caries charting on 6 surfaces: mesial, distal, buccal, lingual, occlusal, subcrown
- 🪥 Filling materials per surface: amalgam, composite, GIC, temporary
- 🏥 One merged "Pulp / Endo status" selector (grouped: vital pulp vs. treated/endo): endodontic states (medicinal filling, root canal filling, incomplete root filling, glass fiber post, metal post) and AAE pulp diagnosis (`pulpDx`: normal / reversible / irreversible pulpitis / necrosis) are mutually exclusive — a root-treated tooth (`endo` set) cannot also carry a vital pulp diagnosis; on treatment, `pulpDx` is normalized to `normal` and the diseased-pulp glyph is suppressed. Reversible pulpitis renders a reduced pulp glyph. An optional 3-level pulp detail setting (`pulpDetailLevel`: simple / AAE / practical-Latin) surfaces 9 practical-Latin pulp subtypes (pulpa sana … gangraena pulpae) via `pulpLatin`; resection and parapulpal pin remain separate special indicators
- 🦴 Apical diagnosis (`apicalDx`: symptomatic/asymptomatic apical periodontitis, acute/chronic apical abscess, condensing osteitis) drives the periapical glyph directly; a granuloma/cyst lesion-subtype qualifier is shown only under symptomatic/asymptomatic apical periodontitis (the redundant "abscess" subtype was dropped — it's already covered by the apical diagnosis)
- 🩹 Merged "Root and periodontium" card (single collapsible section for root/periapical and periodontal findings)
- ⚕️ Modifications: periapical inflammation (shown only on missing/extraction-socket teeth; hidden on present teeth, where `apicalDx` alone drives the periapical glyph, and on implants, where `periImplant` covers it), periodontal disease, mobility grades (M1/M2/M3, hidden on implants)
- 🦷🔩 Peri-implant status (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — 2018 World Workshop staging, shown as a dedicated selector on implants; mucositis reuses the periodontal gum glyph, peri-implantitis adds a graded `peri-implant-bone-loss` layer (opacity 0.4/0.7/1.0). Implants no longer render the periapical lesion glyph — their inflammation is expressed through this axis instead — and the periodontal-modifier checkboxes are hidden on implants (the ad-hoc "Peri-implantitis" checkbox relabel is retired)
- 🏷️ Special indicators: crown needed, crown replacement needed, missing closed gap, extraction plan, fissure sealing, contact point loss
- 👁️ Occlusal view, wisdom teeth, bone and pulp visibility toggles
- 🔢 12 selection filters (all, present, permanent, milk, implants, missing, upper/lower, front/molars)
- 📊 Predefined status presets (reset, primary dentition, mixed dentition, edentulous)
- 📦 34 predefined restoration templates (bridges, removable dentures, bar dentures with implants)
- 💾 Status export/import in JSON (version 2.22; imports still accept legacy 1.4 and 2.0 through 2.21 and migrate automatically, with plugin custom states and per-tooth notes)
- 💽 Opt-in localStorage persistence (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — disabled by default; auto-saves the status chart (and, optionally, the plan chart) on every state change and restores it the next time the component mounts, with a 4 MB size guard and storage/parse errors routed to an `onError` callback (or `console.warn`) instead of throwing
- 🔗 HL7 FHIR R4 export (collection Bundle of per-tooth Observations, ISO 3950 tooth coding for permanent dentition **and** deciduous milk teeth (51-85, lossless round-trip on import), local code system, plus an opt-in SNOMED CT overlay (Settings → SNOMED CT)); a caries component with a charted severity also carries a scoring-system coding — ICDAS on a primary (unfilled) surface, CARS on a recurrent (filled) one
- ✚ Cross/plus surface selection UI (B/M/O/D/L) for caries and fillings
- 🧱 Per-surface restoration materials (mixed fillings, e.g. buccal amalgam + distal composite)
- 🖼️ PNG/JPG/SVG image export of the chart (downloadable; PNG/JPG rasterized from vector SVG)
- 🦷 Caries/subcaries is a per-surface state machine: a caried surface with no filling renders as primary caries (ICDAS-tiered opacity); once a filling is present on that surface it renders as recurrent caries instead (the `subcaries-{surface}` layer, CARS-scored) — the two are never both active on the same surface
- 🎯 Unified per-surface severity (`cariesSeverity`, 0–6, replacing the old separate ICDAS-depth + CARS fields): read as ICDAS depth on a primary surface, as a named CARS score (Sound … Extensive cavity) on a recurrent one, via a contextual popup that shows only the scale relevant to the surface's current state
- 🌱 Root caries (`rootCaries`: none / active / arrested / active-cavitated), wiring the dedicated root-caries artwork layer at a severity-driven opacity (active 0.5 / arrested 0.7 / active-cavitated full)
- 📡 Radiographic caries depth (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 per surface), independent of the visual ICDAS/CARS severity scale, surfaced as a badge and round-tripped through its own FHIR Observation
- 🎚️ Three caries granularity settings (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus a `cariesDepthEnabled` toggle, collapsing each scale to a simpler picker view without losing the stored value
- 🩹 Fillings-panel subcaries summary line: lists any selected tooth with recurrent caries and its surfaces below the filling controls (e.g. "36 (O) has subcaries set on its filling.")
- 🪛 Per-surface filling defects (`fillingDefect`: none / marginal / fracture / wear) on direct restorations, independent of recurrent caries — authored via a per-surface indicator on the Fillings card (mirroring the caries-depth indicator, its option list stacked vertically), rendered on the chart, and shown in the tooltip and the whole-mouth fillings summary with an explicit label (e.g. "36 (O) – Filling defect: O: marginal"), the same way recurrent caries is labeled on the Caries line; the Fillings card also shows a hint note for any selected tooth with a recorded filling defect (e.g. "36 has a filling defect recorded."), parallel to the existing subcaries hint note
- 🦷💥 Tooth wear typed by clinical cause and location (`wearEdge`: none / attrition / erosion, incisal/occlusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical) — replacing the two on/off bruxism-wear flags; authored via two dropdowns on the wear row, reuses the existing wear artwork, and shown in the tooltip and a new whole-mouth "Wear" summary section
- 🎨 Tooth discoloration by cause (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) on permanent and milk teeth — tints the shown natural crown a representative colour when the tooth has no restoration and natural substrate; shown in the tooltip and a new whole-mouth "Discoloration" summary section; completes the surface & structural conditions set alongside filling defects and wear
- ✏️ Anterior teeth (incisors/canines) label their occlusal surface "incisal" throughout the UI (picker, popup, summaries); the stored surface key stays `occlusal`
- 🔤 Position-aware surface notation (Settings → Tooth details → "Surface notation", simple/full, default full): in full mode the caries/filling surface letter and label follow tooth anatomy — occlusal → I/incisal on anterior teeth, buccal → L/labial on anterior teeth, lingual → P/palatal on upper teeth and L/lingual on lower teeth (mesial/distal/subcrown are unaffected); simple mode always uses the generic B/M/O/D/L/SC set regardless of tooth position. Applies to the whole-mouth summary and to both the caries and filling-defect surface pickers (letter + caption); the stored surface key is unaffected
- 🦷↕️ Per-tooth orthodontic charting (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) on a present natural tooth (permanent or milk) — reuses the dormant v2.5.0 ortho artwork (no new SVG); shown on the chart, in the tooltip, and a new whole-mouth "Orthodontics" summary section
- 🪨 Calculus, and root resorption typed as internal or external-cervical (`resorptionType`)
- 📏 Per-surface caries depth (superficial / dentin / deep), or optional ICDAS II scoring (0–6) via `enableIcdas`
- 🩹 Crown marginal-leakage toggle, shown only for a crown or bridge restoration
- 🧬 Standards-based diagnosis coding (WHO ICD-10, always on): every charted finding derives an ICD-10-coded diagnosis — caries (K02), root/cementum & arrested caries (K02.2/.3), pulpitis & pulp necrosis (K04.0/.1), apical periodontitis, periapical abscess and radicular cyst (K04.4–.9), attrition/abrasion/erosion/abfraction (K03.0–.8), calculus (K03.6), resorption (K03.3), discoloration (K00.3/K00.8/K03.7), tooth loss (K08.1), retained root (K08.3) and tooth fracture (S02.5) — surfaced in the tooltip and whole-mouth summary and exported as FHIR Conditions.
- 🩺 Per-tooth Diagnoses card: view a tooth's derived ICD-10 diagnoses and curate them — suppress a wrongly-derived one or add one the chart does not represent. The effective set (derived − suppressed + added) drives the FHIR export.
- 🗺️ Case / regional conditions: author whole-mouth diagnoses not tied to a single tooth — malocclusion & TMJ (K07), oral cysts (K09), salivary-gland disease (K11), stomatitis & oral mucosa (K12/K13), and arch-level developmental anomalies (K00) — each optionally lateralized (left / right / bilateral).
- 🌍 National coding packs (Settings → Diagnosis coding): overlay a national code system on the WHO ICD-10 base — BNO-10 (Hungarian, localized displays; keeps the WHO code) or US ICD-10-CM (remapped codes, e.g. the K07 dentofacial range → M26). Adding another country's pack is a small `CodingPack` entry — see `CODING_PACKS.md`.
- 🔬 SNOMED CT overlay (Settings → SNOMED CT, opt-in, off by default): adds a SNOMED CT coding alongside the WHO and any national-pack coding, and codes the peri-implant findings that have no WHO ICD-10 code. The ICD-10-CM and SNOMED concept IDs are reference/best-effort — verify against the official ICD-10-CM tabular list / SNOMED CT browser before clinical use.
- 🔁 FHIR Condition round-trip: diagnoses export as FHIR `Condition` resources (tooth-linked, plus patient-level case conditions with a laterality bodySite) alongside the Observations, and import reconstructs them — the case conditions directly, and the per-tooth add/suppress overrides by diffing the imported Conditions against the re-derived chart.
- 🩺 **Diagnoses card, revised:** every per-tooth diagnosis row shows the ICD-10 code first (`K04.0 Pulpitis`) and rows are sorted by code. Each row has an **exclude** toggle (drops the diagnosis from the FHIR export but keeps it on the chart) and a **delete** (×) that removes the diagnosis *and* its finding on the tooth. Adding a diagnosis from the picker writes the underlying chart finding, so the glyph appears at once.
- 🗂️ **Case / regional diagnoses pop-up:** the whole-mouth and regional diagnoses (jaw anomalies, cysts, salivary and mucosal conditions…) moved out of the periodontal sidebar into their own dialog, opened from the **Diagnoses** button beside the Odontogram / Periodontal-status toggle; its picker is code-first and code-sorted.
- 🇭🇺 **BNO-10 pack:** the Hungarian display strings are now the official NEAK BNO-10 titles, and the pack uses the standard ICD-10 system URI (BNO-X is identical to WHO ICD-10).
- ✅ **HL7-validator-clean FHIR export:** every Bundle entry carries a deterministic `id` and an absolute `fullUrl` (no `urn:uuid` placeholders), and the Bundle embeds the engine's own **CodeSystem** so its local codes resolve during validation; the same CodeSystem is published in the repository as `fhir/CodeSystem-odontogram.json` (pass `includeCodeSystem: false` in the FHIR export options to omit it).
- 🎯 **ICD codes that follow the chart (data-driven specificity).** Caries depth comes from the radiographic depth when it is charted (E1/E2 → enamel, D1–D3 → dentine) and falls back to the ICDAS severity (1–3 → enamel, 4–6 → dentine), refining WHO `K02` to `K02.0` / `K02.1` and ICD-10-CM `K02.9` to `K02.51/.52` (pit-and-fissure) or `K02.61/.62` (smooth surface) by surface × depth. Chronic periodontitis takes its ICD-10-CM code from the 2017 stage and extent (`K05.311`–`K05.329`). One Condition per tooth, carrying the deepest involvement.
- 🔄 **Periodontal data round-trips through FHIR.** The importer reads the LOINC 74029-0 periodontal panels back into each tooth — probing depth, gingival margin (reconstructed from CAL, so pseudopocket values survive), BOP, furcation, O'Leary plaque, the PI/GI and implant mPI/mBI indices and keratinized-gingiva width — plus the smoking-status and HbA1c evidence Observations. Conditions coded only in ICD-10-CM or SNOMED CT are recognised too, so a foreign bundle imports what it can.
- 🧬 **SNOMED CT for the whole diagnosis catalog.** 48 of the 50 slots now carry a verified SNOMED CT International concept (active, core module, matching FSN). Two stay deliberately unset because SNOMED International has no umbrella concept for them: jaw-size anomaly (K07.0) and dentofacial functional abnormalities (K07.5). The SNOMED overlay remains opt-in in Settings.
- 📦 **A loadable FHIR terminology package.** The repository's `fhir/` folder is a FHIR NPM package (`react-advanced-odontogram.fhir`, FHIR 4.0.1) holding the engine CodeSystem plus generated ValueSets — one per clinical-axis value group, one for the finding types and an all-codes set. Point a validator at it with `-ig ./fhir`.
- 🧰 Unified topbar icon row with a tabbed Settings modal (General / Panels / Tooth details / Caries / Pulpa / Notes / Periodontal — numbering, notes, panel visibility, ICDAS, caries-depth toggle, root/radiographic caries granularity, pulp detail level, tooth wear/discoloration detail level, tooth information)
- 🗂️ Settings → "Panels" tab: independently show/hide the Statuses and Orthodontics whole-mouth summary panels
- 🦷🩺 Settings → "Periodontal" tab: 16 per-index show/hide toggles for the perio-chart rows (grouped pocket/hygiene/mucogingival/support/peri-implant — PD/GM/CAL/BOP, plaque, PI, GI, CEJ visibility, root concavity, KG, GT, furcation, mobility, Miller class, mPI, mBI), each with a description, plus a translated-vs-canonical index-name display option (canonical = a fixed English/Latin scientific name in every UI language; tooltips always stay localized regardless of this setting). Both are app-level preferences (like `perioViewMode`) — never part of the export payload
- 🩹 Secondary-caries (CARS) settings control merged into the Caries settings tab, positioned above Radiographic depth (the separate "Secondary caries" tab is retired)
- 🎚️ Tooth details detail level (Settings → Tooth details): a simple/complex setting for tooth wear and for discoloration. Simple mode shows a yes/no toggle per finding (wear on → attrition/abrasion, discoloration on → other); complex mode (default) keeps the type/cause dropdowns, and the stored value is preserved when switching levels
- 📋 Tooth information panel: live text summary of the whole chart (tooth counts, present/missing lists, caries incl. secondary, fillings, root canals, prosthetics, implants, periodontal status) — shown by default, toggleable in Settings
- 🗂️ Consolidated Export dropdown (Status JSON / FHIR / PNG / JPG)
- 📥 Import dropdown with FHIR import (round-trips exported Bundles)
- ⏳ Progress overlay during image export
- 🎓 18-step interactive intro tour
- 🔢 Three numbering systems (FDI, Universal, Palmer)
- 🌐 I18n — 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) with a language switcher; Arabic renders the UI right-to-left with the dental/perio charts pinned left-to-right (machine-translated, native-speaker review pending for AR/ZH/FR)
- 🌗 Dark mode support with toggle button (standalone or controlled by parent app)
- 🎨 Custom theme configuration (`themeConfig` prop) with CSS custom properties (`--odon-*`)
- 📱 Mobile touch UX: tap-to-zoom popover, long-press context menu, pinch-to-zoom, WCAG 44px touch targets, arch toggle navigation
- 🔌 Custom SVG plugin system: inject visual overlays, per-tooth custom state, JSON export/import support — plugin `renderSvg()` output is sanitized with DOMPurify (SVG profile) before insertion into the live chart; plugins still run as trusted code, so only load plugins from sources you trust
- 🛡️ Content-Security-Policy: the demo's production build injects a CSP meta tag (dev server unaffected) — host apps embedding the component should set their own
- ⚠️ State validation warnings for incompatible tooth state combinations
- 🏷️ Automatic state tooltip on tooth tiles (shows all active states)
- 🩺 Modernized per-tooth tooltip and whole-mouth summary panel: both surface the full set of clinical findings (pulp/apical diagnosis + lesion subtype, root resorption, peri-implant status, graded root caries, calculus, crown marginal leakage, fracture, contact loss, typed edge/cervical wear), with a dedicated "Diagnoses" section in the panel, a dedicated "Wear" section, and a coarse caries-severity qualifier (superficial/moderate/deep)
- ♿ Keyboard accessibility (WCAG): ARIA listbox/option roles, Enter/Space selection, arrow key navigation, focus-visible outlines
- 🔒 Read-only mode: disable all interactions for print/report/view use cases
- ✨ Selection animations: pulsing dashed border and glowing drop-shadow on selected teeth (with prefers-reduced-motion support)
- 📝 Per-tooth notes: double-click to add/edit notes, note icon next to tooth number, hover tooltip with note text, an "Individual notes" line in the whole-mouth summary panel, inclusion in the PDF report, JSON export/import
- 🔀 Status ↔ Plan chart split: a `Status | Plan` toggle in the chart header switches between a current-**status** chart and a **plan** (intended post-treatment) chart, each with its own tooth states; the plan chart starts as a copy of status the first time you switch to it, and edits in one chart never affect the other. Export/import (`exportStatus`/`exportFhir`/file import) always target the status chart; the plan chart is read/written separately via its own API (see Public API below) and — when it differs from status — is included as an additive `plan` section in the JSON export
- 📝 "What changes" box: whenever the plan differs from the current status, a box under the Tooth-information panel lists every difference per tooth and per treatment axis (presence, substrate, restoration, prosthesis, planned crown, orthodontics, pulp/endo, apical) as a `tooth: axis  from → to` line; also available programmatically via `getPlanChanges()`

![Full-mouth periodontal chart — English](screenshot_en_perio.png)

- 🩺 Periodontal charting: per-site **probing depth**, **gingival margin**, **bleeding on probing** (+ suppuration) at the six standard sites per tooth, with derived **clinical attachment level (CAL = PD + gingival margin)**, recession, and whole-mouth **%BOP**. A **graphical full-mouth perio chart** — each arch drawn as **two separate buccal/palatal(lingual) SVGs** (reusing the tooth artwork with a uniform crowns-to-band orientation on both aspects; an **implant graphic** for implant teeth) with a red **CEJ line**, a **numbered millimeter guide grid**, and a **gingival-margin / pocket-depth curve** over the teeth, split by a **central perio index band** (labeled `▲ Buccal … Lingual/Palatal ▼`) that carries the shared per-tooth indices — **Miller class** at the very top, and **Plaque/PI/GI/mPI/mBI** rendered as an **anatomical diamond tile** per tooth (buccal tip up, lingual tip down, mesial/distal on the middle row swapped per side so mesial always points toward the arch midline); the number rows (full index names — PD/GM/CAL/BOP + mobility + furcation — in larger, more touch-friendly cells) aligned in columns and a summary (avg PD/CAL, %BOP, PI%), with **keyboard auto-advance** entry; the chart **dynamically scales to fill the available width**, responsive at any window size. Presented as an `Odontogram | Periodontal Status` **view toggle**, whose right panel is repurposed into a **perio-context sidebar** (patient data, the 2017 classification, and the whole-mouth summary) while that view is active (a Settings option switches the whole presentation back to a **popup**), and still a **separately-invocable component** (`PerioChart` export) so a host app can call up the perio chart independently of the base odontogram. Per-site **FHIR** export via the LOINC periodontal panel (`74029-0`; PD `32910-2`, recession `32911-0`, CAL `32912-8`)
- 🅿️ Proposed styling: in Plan mode, findings the plan **adds** vs the current status (planned crown, extraction, orthodontic movement, prosthesis, …) render with a distinct **dashed, tinted "proposed" outline** so the plan reads as intent, not fact — with a "dashed = proposed" legend in the chart card. Status-mode rendering is byte-identical; the treatment is plan-only and fully reset on switching back
- 🚦 Plan-mode gating: the Plan chart shows only what a dentist can *do* — the base picker offers only Missing / Permanent / Implant, and status-only findings (caries, tooth wear, discoloration, and the whole periodontal block — mobility, six-site probing grid, inflammation/parodontal mods, calculus, peri-implant status) are hidden; the pulp/endo control keeps endodontic **treatment** (root canal / post / apicoectomy / parapulpal pin) while hiding pulp/apical **diagnosis** and root resorption. Restoration, prosthesis, orthodontics, crown-need/replace and extraction-plan stay plannable
- 🧪 An extensive automated Vitest test suite covering numbering, translations, presets, i18n, App component, theme, touch, plugins, accessibility, and clinical-axis/diagnosis parity
- 📖 TypeDoc API documentation with JSDoc comments on all public exports (`npm run docs`)

### 📦 Modules
- 🦷 Odontogram grid and tooth tile UI
- 🎛️ Controls and status panel
- 🎨 SVG layering engine and templates
- 🔢 Tooth numbering and label mapping (FDI/Universal/Palmer)
- 🌐 Localization — 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), including Arabic (RTL)
- 💾 Status export/import
- 📋 Status extras: predefined restoration templates
- 🎨 Theme configuration: customizable color palette via `--odon-*` CSS properties
- 📱 Mobile touch interactions (tap-to-zoom, long-press, pinch-to-zoom, arch toggle)
- 🔌 Custom SVG plugin system
- ⚠️ State validation and tooltip system
- ♿ Keyboard accessibility and ARIA support
- 🔒 Read-only mode
- ✨ Selection animations
- 📝 Per-tooth notes system
- 🧪 Automated test suite (Vitest + Testing Library)

### 🛠️ UI Controls

**🔝 Topbar:**
- Language switcher (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR dropdown)
- Dark mode toggle button (sun/moon icon, switches between light and dark theme)
- Numbering system switcher (FDI/Universal/Palmer dropdown)
- Export Status / Import Status buttons

**📊 Chart header:**
- Occlusal view toggle
- Wisdom teeth visibility toggle
- Bone visibility toggle
- Pulp visibility toggle
- Clear selection button

**🔍 Selection filters:**
- Select All / All Present / Permanent / Milk / Implants / All Missing
- Select Upper / Upper Front 6 / Upper Molars
- Select Lower / Lower Front 6 / Lower Molars

**📋 Status presets:**
- Reset All (reset mouth)
- Primary Dentition
- Mixed Dentition
- Edentulous toggle

**📦 Status extras dropdown:**
- Upper/Lower zircon bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower metal bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower partial removable dentures
- Upper/Lower full removable dentures
- Upper/Lower bar dentures with implants

**🦷 Tooth editor panel** (for the selected tooth/teeth, grouped into collapsible cards):
- **Base row:** tooth selection (base type incl. broken-crown variants) and tooth substrate (natural/radix/broken/crownprep)
- **Restoration row:** the combined "Fix: …" / "Kivehető: …" restoration dropdown (`restorationType`×`restorationMaterial` fixed options plus the `prosthesis` attachment/removable options, gated by tooth kind); crown marginal-leakage checkbox (crown/bridge only); broken-crown location checkboxes; crown needed / crown replacement needed toggles
- **Wear & discoloration row:** incisal/occlusal wear type dropdown, cervical wear type dropdown, discoloration cause dropdown (each swaps to a simple yes/no toggle under Settings → Tooth details → simple mode)
- **Orthodontics card:** appliance, mesial/distal drift, vertical movement (extrusion/intrusion), rotation toggle — shown on a present natural tooth
- **Caries card:** caries-depth mode dropdown, subcrown caries checkbox, root-caries severity dropdown, and the B/M/O/D/L per-surface caries picker with a contextual ICDAS-depth/CARS popup and a radiographic-depth badge
- **Fillings card:** filling-material dropdown, per-surface filling picker (with per-surface material), per-surface filling-defect indicator (marginal/fracture/wear), subcaries and filling-defect hint notes
- **Root and periodontium card:** merged "Pulp / Endo status" selector, apical diagnosis selector, periapical lesion subtype selector (symptomatic/asymptomatic apical periodontitis only), root resorption type selector, mobility grade selector, peri-implant status selector (implants only)
- **Special indicators:** extraction plan/wound, missing-closed, fissure sealing, contact-point loss, calculus, parapulpal pin, endo resection, bridge pillar

### 🦷 Tooth Types and States

**Tooth selection (base type):**
| Value | Description |
|---|---|
| `none` | Missing tooth |
| `tooth-base` | Permanent tooth |
| `milktooth` | Primary (deciduous) tooth |
| `implant` | Dental implant |
| `tooth-under-gum` | Subgingival (unerupted) tooth |

**Broken tooth variants:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Tooth substrate (permanent teeth):**
`natural` (default), `radix` (root remnant), `broken`, `crownprep` (prepared for crown)

**Restoration type (permanent teeth):**
`none`, `crown`, `inlay`, `onlay` (occlusal view only), `veneer`, `bridge`

**Restoration material (permanent teeth):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (legacy `metal` crowns migrate here), `telescope`, `temporary`

**Restoration options are gated by tooth kind** (`restorationOptions()` in `src/registry/restorations.ts`): an implant offers only `crown`/`bridge` restoration types (composed with an implant connector layer) plus the five `prosthesis` attachment entries below; a missing/gap tooth offers only a `bridge` pontic plus the two removable-denture `prosthesis` entries; a `radix` substrate hides the restoration control entirely. The legacy flat `crownMaterial`/`bridgeUnit` fields (pre-v1.14 implant/bridge attachment values) are retired from the live model — only accepted as a read-only migration path for old payloads.

**Prosthesis** (`prosthesis`; orthogonal removable/attachment axis, surfaced as "Kivehető:" entries in the combined restoration dropdown):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (implant attachments, with or without an overdenture), `removable-partial`, `removable-full` (tooth-supported dentures on a missing/gap tooth). A tooth has either a fixed restoration or a prosthesis, never both — setting one clears the other.

**Crown marginal leakage** (`crownLeakage`; boolean): shown only when `restorationType` is `crown` or `bridge`; activates the `crown-leakage` artwork layer.

**Endodontic options (permanent teeth):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontic options (milk teeth):**
`none`, `endo-medical-filling`

`endo` and `pulpDx` are surfaced through one merged "Pulp / Endo status" `<select>` (grouped: vital pulp vs. treated/endo) and are mutually exclusive — choosing a treated (`endo != none`) option resets `pulpDx` to `normal` and choosing a pulp diagnosis resets `endo` to `none`.

**Filling materials (permanent teeth):**
`amalgam`, `composite`, `gic`, `temporary`

**Filling materials (milk teeth):**
`composite`, `gic`, `temporary`

**Filling/caries surfaces:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (caries only)

**Modifications:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Periapical lesion type** (`periapicalType`; qualifies the periapical glyph, shown only under symptomatic/asymptomatic apical periodontitis):
`none`, `granuloma`, `cyst` — authoring options; the legacy `abscess` value is still accepted/stored but no longer offered in the picker, since it duplicates the apical diagnosis. On import it is dropped: folded into `apicalDx` when the tooth carries the inflammation modifier, otherwise cleared to `none`

**Pulp diagnosis** (AAE terminology; `pulpDx`):
`normal`, `reversible-pulpitis` (renders a reduced pulp glyph), `irreversible-pulpitis`, `necrosis` — mutually exclusive with `endo`; normalized to `normal` on a root-treated tooth

**Pulp diagnosis, practical Latin** (`pulpLatin`; shown by the pulp picker only when `pulpDetailLevel` is `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulp detail level** (`pulpDetailLevel`, global setting): `simple`, `aae` (default), `latin` — controls which pulp vocabulary the picker offers

**Apical diagnosis** (`apicalDx`; drives the periapical glyph):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Root resorption type** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Peri-implant status** (`periImplant`; implant-only, 2018 World Workshop staging): `mucositis` reuses the periodontal gum glyph; `peri-implantitis-*` adds the `peri-implant-bone-loss` layer at severity-scaled opacity (mild 0.4 / moderate 0.7 / severe 1.0). Implants no longer render the periapical lesion glyph (their inflammation is expressed via this axis instead), and the `mods` inflammation/parodontal checkboxes are hidden on implants:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Caries severity** (`cariesSeverity`; unified per-surface field, `0`–`6`): on a surface with no filling it is read as the ICDAS caries-depth scale (`superficial` / `dentin` / `deep`, or the raw ICDAS II codes `0–6` when `enableIcdas` is set) and renders the primary `caries-{surface}` layer; on a surface with a filling it is read as a named CARS score (`0` sound … `6` extensive cavity) and renders the `subcaries-{surface}` (recurrent-caries) layer instead — a surface is never both primary and recurrent at once

**Root caries** (`rootCaries`; wires the `caries-root` artwork layer on a present tooth, opacity driven by severity — `active` 0.5 / `arrested` 0.7 / `active-cavitated` full):
`none`, `active`, `arrested`, `active-cavitated`

**Radiographic caries depth** (`radiographicDepth`; per surface, independent of the visual ICDAS/CARS `cariesSeverity` scale):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Caries granularity settings** (global): `secondaryCariesMode` (`simple`/`standard`/`full`, default `standard`), `rootCariesMode` (`simple`/`severity`, default `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, default `off`), `cariesDepthEnabled` (boolean, default `true`) — each collapses its scale to a simpler picker view without altering the stored value

**Special indicators:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Tooth wear** (`wearEdge`, `wearCervical`; per-location clinical type, gated on tooth-base + no restoration + natural substrate; render the existing `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` layers):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discoloration** (`discoloration`; per-tooth cause, gated on a natural tooth-base or milk tooth + no restoration + natural substrate; tints the shown natural crown's fill — no new SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Filling defect** (`fillingDefect`; per surface, direct-restoration finding independent of recurrent caries — gated to surfaces present in `fillingSurfaceMaterials`; renders the `defect-{surface}` artwork layer):
`none`, `marginal`, `fracture`, `wear`

**Orthodontics** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; per-tooth, gated on a present natural tooth — permanent or milk):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (arrow-up glyph), `intrusion` (arrow-down glyph) — `orthoRotation`: boolean

**Tooth detail / notation settings** (global session settings, Settings → Tooth details): `wearDetailLevel` and `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, default `complex` — simple mode shows a yes/no toggle instead of the full type/cause dropdown, without mutating the stored value) and `surfaceNotation` (`simple`/`full`, default `full` — controls whether caries/filling surface letters/labels are position-aware; see "Position-aware surface notation" above)

### ⚙️ Settings
Opened from the topbar gear icon; a focus-trapped, ARIA `dialog` with a tabbed layout (Esc/backdrop-click to close, arrow keys to switch tabs). All settings are session-level UI state only, unless noted — none of them mutate per-tooth data or the export payload.

- **General:** numbering system (FDI/Universal/Palmer), language, dark/light theme, tooth-information panel visibility
- **Odontogram:** tooth anatomy profile (`classic` default / `measured`) — `measured` renders nine literature-measured tooth templates in a two-arch, per-tooth-width layout; switchable at runtime, no effect on the classic default; its artwork is a separate chunk, fetched only when you switch to it, so the classic default costs nothing
- **Panels:** independently show/hide the whole-mouth Statuses card and the Orthodontics card (both default visible)
- **Tooth details:** wear detail level and discoloration detail level (simple/complex, each default complex), surface notation (simple/full, default full)
- **Caries:** ICDAS II scoring toggle (`enableIcdas`), caries-depth toggle (`cariesDepthEnabled`), root-caries granularity (`rootCariesMode`: simple/severity), secondary/CARS granularity (`secondaryCariesMode`: simple/standard/full), radiographic-depth granularity (`radiographicDepthMode`: off/threeLevel/detailed) — the former separate "Secondary caries" tab is merged into this one, with the CARS control positioned directly above radiographic depth
- **Pulpa:** pulp detail level (`pulpDetailLevel`: simple/AAE/practical-Latin, default AAE) — controls which vocabulary the "Pulp / Endo status" picker offers; changing it live-refreshes the whole-mouth summary and every open tooltip
- **Notes:** enable/disable per-tooth notes (`enableNotes`)
- **Periodontal:** per-index show/hide toggles for all 16 perio-chart rows (`perioRowVisibility`, default all visible), grouped Pocket (PD/GM/CAL/BOP) / Hygiene (Plaque/PI/GI) / Mucogingival (CEJ visibility/Root concavity/KG/GT) / Support (Furcation/Mobility/Miller class) / Peri-implant (mPI/mBI), each row with its own description; plus a translated-vs-canonical index-name mode (`perioIndexNameMode`: `translated` default / `canonical` — a fixed English/Latin scientific name shown in every UI language). App-level preferences only (mirrors `perioViewMode`) — never serialized, tooltips stay localized in either mode

### 🖼️ SVG Template System

**Tooth templates** (in `src/assets/teeth-svgs/`):
| Template | Teeth using it |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisors) |
| `13.svg` | 13, 23, 33, 43 (canines) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolars) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molars) |

Templates are rotated 180 degrees for the lower jaw and mirrored horizontally for the left side.

**Icon SVGs** (in `src/assets/icon-svgs/`):
`icon_8.svg` (wisdom), `icon_gum.svg` (bone), `icon_no_selection.svg` (clear), `icon_occl.svg` (occlusal view), `icon_pulp.svg` (pulp)

### 🔢 Numbering Systems

**FDI (ISO 3950):** Adult teeth 11-18, 21-28, 31-38, 41-48. Primary teeth 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Adult teeth numbered 1-32. Primary teeth lettered A-T.

**Palmer (Zsigmondy-Palmer):** Quadrant + position format (e.g. UR-1, LL-5). Primary teeth use letters A-E per quadrant.

### 🚀 Usage
Development:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Preview:
```bash
npm run preview
```

### 🔗 Integration
The component can be embedded in any React app.
Example:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="en"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Dark mode integration:**
- **Standalone mode:** Omit `darkMode` prop — the component manages its own theme state via the topbar toggle button and adds/removes the `.dark` class on `<html>`.
- **Controlled mode:** Pass `darkMode` and `onDarkModeChange` — the parent app controls the theme. The toggle button still appears but calls `onDarkModeChange` instead of managing internal state. The parent is responsible for adding/removing the `.dark` class on `<html>`.

**Custom theme:**
```tsx
<App
  themeConfig={{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
  }}
/>
```

**Plugin integration:**
```tsx
import App, { type OdontogramPlugin, setPluginState } from "./App";

const myPlugin: OdontogramPlugin = {
  id: "implant-brand",
  label: { en: "Implant Brand", hu: "Implantátum márka" },
  layer: "overlay",
  renderSvg: (toothNo, _quadrant, state) => {
    if (!state) return null;
    return `<text x="16" y="60" font-size="6" fill="#3b7bff">${state}</text>`;
  },
};

<App plugins={[myPlugin]} />

// Set plugin state for a tooth:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Testing
```bash
npm run test           # Run the full Vitest suite
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### 📖 API Documentation

🅰️ **Angular version:** an official Angular port, [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` on npm), is available — JSON and FHIR R4 exports round-trip between the two libraries.

```bash
npm run docs           # Generate TypeDoc docs in docs/
```

### 📡 Public API

**Component props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI language (hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr) |
| `onLanguageChange` | `(lang) => void` | — | Callback when language changes |
| `numberingSystem` | `string` | `'FDI'` | Numbering system (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback when numbering changes |
| `darkMode` | `boolean` | `undefined` | Dark mode state. Omit for standalone mode. |
| `onDarkModeChange` | `(dark) => void` | — | Callback when dark mode toggles. Required for controlled mode. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Custom color overrides via CSS custom properties (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Custom SVG plugins for visual overlays and per-tooth custom state. |
| `readOnly` | `boolean` | `undefined` | Disable all interactions (click, touch, keyboard). Useful for print/report views. |
| `enableNotes` | `boolean` | `undefined` | Enable per-tooth notes. Double-click a tooth to add/edit notes. |

**Exported functions for external control:**

| Function | Description |
|---|---|
| `initOdontogram()` | Initialize the engine and render all teeth |
| `destroyOdontogram()` | Clean up the engine and remove event listeners |
| `setNumberingSystem(system)` | Switch between FDI, Universal, Palmer |
| `clearSelection()` | Deselect all teeth |
| `setOcclusalVisible(on)` | Toggle occlusal view on/off |
| `setWisdomVisible(on)` | Show/hide wisdom teeth |
| `setShowBase(on)` | Show/hide bone layer |
| `setHealthyPulpVisible(on)` | Show/hide healthy pulp |
| `registerPlugins(plugins)` | Register custom SVG plugins |
| `setPluginState(toothNo, pluginId, value)` | Set a plugin's custom state for a tooth |
| `getPluginState(toothNo, pluginId)` | Get a plugin's custom state for a tooth |
| `getToothStateSummary(toothNo)` | Get localized summary of all active states |
| `getOdontogramSummary()` | Get a structured, localized text summary of the whole chart (counts, sections) |
| `onStateChange(callback)` | Subscribe to state changes; returns an unsubscribe function |
| `setReadOnly(value)` | Enable/disable read-only mode |
| `getReadOnly()` | Get current read-only state |
| `setNotesEnabled(value)` | Enable/disable per-tooth notes |
| `getNotesEnabled()` | Get current notes-enabled state |
| `setPulpDetailLevel(level)` | Set the pulp picker's vocabulary — `"simple"`, `"aae"`, or `"latin"` |
| `getPulpDetailLevel()` | Get the current pulp detail level |
| `getChartMode()` | Get the currently active chart — `"status"` or `"plan"` |
| `setChartMode(mode)` | Switch the active chart to `"status"` or `"plan"`; the plan chart is deep-copied from status the first time it's entered |
| `getStatusChart()` | Get the status chart's payload (`{version, globals, teeth}`), independent of which chart is currently active |
| `getPlanChart()` | Get the plan chart's payload (`{version, globals, teeth}`), independent of which chart is currently active |
| `setPlanChart(payload)` | Replace the plan chart's teeth from a payload (status is left untouched); marks the plan chart initialized |
| `getPlanChanges()` | Get the structured status→plan diff (`{ toothNo, axis, from, to }[]`) — one entry per tooth per treatment axis that differs between the status and plan charts; empty when no plan exists. Also surfaced on `getOdontogramSummary()` as `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Set periodontal data for one of the six sites (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` null/`<1` un-charts the site. Validates + clamps (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Get a tooth's per-site periodontal record (charted sites only) |
| `getToothCal(toothNo)` | Get derived per-site CAL (`pd + gingival margin`) for a tooth |
| `getPerioSummary()` | Whole-mouth periodontal aggregates: charted-site count, bleeding count, %BOP, worst CAL, max PD |
| `getPerioChart()` | Get the active chart's per-tooth periodontal records |
| `PerioChart` | React component (named export) — the full-mouth perio-chart overlay (`{ open, onClose }`), mountable independently of `OdontogramShell` for host integration |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Programmatically open/close/query the perio-chart overlay — lets a host call up the periodontal chart separately from the base odontogram (shared case state) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Get/set how the perio chart is surfaced — `"toggle"` (an `Odontogram \| Dental Chart` view toggle, default) or `"popup"` (the overlay) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Get/set the Dental Chart highlight overlay — `"none"` (default) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; repaints the teeth by that measure (display-only over existing data) |
| `getToothRecessionType(toothNo)` | Get the derived **Cairo recession type** — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (computed from the tooth's interproximal vs buccal CAL) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Per-tooth CEJ visibility — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Per-tooth root-surface concavity — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Per-surface Silness-Löe Plaque Index grade — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Per-surface Löe-Silness Gingival Index grade — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Per-tooth buccal keratinized gingiva width in mm — `0`-`15`, or `null` if not charted |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Per-tooth gingival thickness phenotype — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Per-tooth Miller recession class — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Implant-only — per-surface Mombelli modified Plaque Index (mPI) grade — `0`-`3`; no-op on a non-implant tooth |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Implant-only — per-surface Mombelli modified Sulcus Bleeding Index (mBI) grade — `0`-`3`; no-op on a non-implant tooth |
| `furcationEntrances(toothNo)` | The furcation entrances for a tooth — `["mesial","distal","buccal"]` (upper molars), `["buccal","lingual"]` (lower molars), `["mesial","distal"]` (upper first premolars), else `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Set/get per-entrance furcation involvement (Glickman `1`–`4`; `null` clears) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Set/get O'Leary plaque presence per surface (mesial/distal/buccal/lingual); feeds the whole-mouth PI% in `getPerioSummary()` |
| `getCaseMeta()` | Get the case-level metadata object (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — a single shared block, not per-tooth/dual-state (mirrors the top-level `globals` payload key); feeds the periodontal staging/grading classification and the PDF report header |
| `setPatientName(v)` | Set the case's patient name (trimmed; empty string or `null` clears it) — identity-only, never fed into the periodontal derivation |
| `setPatientDob(v)` | Set the case's patient date of birth (`YYYY-MM-DD`; invalid/empty clears it) — PDF-report identity only |
| `setExamDate(v)` | Set the case's exam date (`YYYY-MM-DD`; invalid/empty clears it) |
| `setCaseAge(v)` | Set the case's patient age in years — `0`-`120`, or `null` to clear |
| `setSmokingStatus(v)` | Set the case's smoking status — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Set cigarettes/day (only meaningful when smoking status is `"current"`) — `0`-`99`, or `null` to clear |
| `setDiabetesStatus(v)` | Set the case's diabetes status — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Set HbA1c % (only meaningful when diabetes status is `"present"`) — `3.0`-`20.0` (one decimal), or `null` to clear |
| `setToothLossPerio(v)` | Set teeth lost to periodontitis — `0`-`32`, or `null` to clear |
| `setMaxRblPercent(v)` | Set max radiographic bone loss % — `0`-`100`, or `null` to clear |
| `resetCaseMeta()` | Reset the case-level metadata object to its empty defaults |
| `getPerioClassification()` | Get the 2017 World Workshop periodontal classification (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnosis/stage/grade/extent derived from the charted perio data and case metadata, each axis replaced by its clinician override when set (`derived` always exposes the untouched computed values, `overridden` flags which axes were overridden) |
| `setDiagnosisOverride(v)` | Override the derived periodontal diagnosis — `"health"` / `"gingivitis"` / `"periodontitis"`, or `null` to clear (revert to derived) |
| `setStageOverride(v)` | Override the derived periodontal stage — `"I"` / `"II"` / `"III"` / `"IV"`, or `null` to clear (revert to derived) |
| `setGradeOverride(v)` | Override the derived periodontal grade — `"A"` / `"B"` / `"C"`, or `null` to clear (revert to derived) |
| `setExtentOverride(v)` | Override the derived periodontal extent — `"localized"` / `"generalized"` / `"molar-incisor"`, or `null` to clear (revert to derived) |
| `exportFhir(options?)` | Export the chart as an HL7 FHIR R4 collection Bundle (JSON download). Optional `{ subject }` reference; otherwise a placeholder Patient is embedded |
| `exportImage(format)` | Download the chart as an image — `"png"` or `"jpg"` |
| `exportSvg()` | Download the chart as a scalable SVG (vector) |
| `hasAnyPerioData()` | `true` iff any periodontal axis is charted anywhere in the mouth — drives the perio export auto-skip and disables the perio export-menu items on a blank chart |
| `exportPerioSvg()` | Download the full periodontal chart (tooth graphics + numeric rows + 2017 classification) as one standalone vector SVG, built headlessly from state via `buildPerioSvg()` |
| `exportPerioImage(format)` | Download the periodontal chart as a rasterized image — `"png"` or `"jpg"` |
| `exportPdf(opts)` | Download a jsPDF-native PDF report (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, each section optional) — vector text plus raster tooth/perio-chart images; the individual-notes section auto-skips when no tooth has a note, and the two perio sections auto-skip whenever `hasAnyPerioData()` is false, regardless of `opts` |
| `importFhirBundle(input)` | Import a FHIR R4 Bundle (object or JSON string) produced by this module |
| `setImportFormat(format)` | Set the next file import's parser — `"status"` or `"fhir"` |
| `startIntroTour()` | Launch the 18-step interactive intro tour |

### 💾 State persistence (localStorage)

Opt-in `localStorage` persistence for the odontogram's case state (`src/persistence.ts`, re-exported from the package entry point). Disabled by default — existing integrations are unaffected unless a host app explicitly enables it, and it should be called **after** the odontogram has mounted (restore repaints the live DOM via `importStatus()`):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // default: "react-advanced-odontogram"
  includePlan: true,          // also persist the plan chart; default: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Function | Description |
|---|---|
| `enablePersistence(options?)` | Restores a previously saved case (if any) via `importStatus()`, then saves the status chart to `localStorage` on every state change. Idempotent — calling it again replaces the previous subscription/options. **Must be called after the odontogram has mounted.** |
| `disablePersistence()` | Stops persisting; the stored entry is left in place. |
| `clearPersistedState()` | Removes the stored entry for the active (or default) key. |
| `isPersistenceEnabled()` | `true` while a state-change subscription is active. |

**`PersistenceOptions`:**

| Field | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | The `localStorage` key. |
| `includePlan` | `boolean` | `false` | Also persist the plan chart (the payload's `plan` field). |
| `onError` | `(err: Error) => void` | — | Called on any storage/parse error instead of `console.warn`. |

Notes: nothing is read from or written to `localStorage` unless `enablePersistence()` is called; a 4 MB size guard skips an oversized save (reported via `onError`/`console.warn`) rather than throwing; every storage/JSON failure — quota exceeded, a locked-down iframe, corrupt or unrecognized stored data, etc. — is caught and reported. This module never throws.

Note: enabling persistence restores the saved case via `importStatus()`, which replaces the current case — including an in-progress plan chart if the saved payload has none. Enable persistence at startup (right after mount), not mid-session.

Note: the persisted payload can include patient-identifying case data (patient name, exam date) in plaintext `localStorage`. If you chart such data, ensure device-level protection or clear it with `clearPersistedState()` when appropriate.

### 💾 Status Export/Import Format
The export creates a JSON file (version `2.22`; imports also accept legacy `1.4` and `2.0` through `2.21` and migrate automatically) containing:

**Global fields:**
- `wisdomVisible` - wisdom teeth visible
- `showBase` - bone layer visible
- `occlusalVisible` - occlusal view active
- `showHealthyPulp` - healthy pulp visible
- `edentulous` - edentulous mode active

**Per-tooth fields (32 teeth):**
- `toothSelection` - base tooth type
- `toothSubstrate` - tooth substrate (natural/radix/broken/crownprep), orthogonal to any restoration
- `restorationType` - restoration type (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - restoration material (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), paired with `restorationType`
- `prosthesis` - removable/attachment axis (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutually exclusive with a fixed `restorationType` of crown/bridge
- `crownLeakage` - crown marginal-leakage flag, meaningful only when `restorationType` is crown or bridge
- `endo` - endodontic state; mutually exclusive with `pulpDx` (surfaced together via one merged "Pulp / Endo status" picker — treating a tooth normalizes `pulpDx` to `normal`)
- `mods` - modifications array (inflammation, parodontal); `inflammation` is retired from the UI on present teeth (`apicalDx` drives the glyph there) but still applies to missing/extraction-socket teeth
- `caries` - active caries surfaces
- `cariesActiveDepth` - the ICDAS depth value staged by the caries-depth picker when a new surface is applied (not a per-surface stored value; see `cariesSeverity` for the stored per-surface field)
- `rootCaries` - root caries severity (none/active/arrested/active-cavitated)
- `cariesSeverity` - unified per-surface severity (0-6): ICDAS depth on a primary (unfilled) surface, CARS score on a recurrent (filled) surface
- `radiographicDepth` - per-surface radiographic caries depth (none/E1/E2/D1/D2/D3), independent of the visual ICDAS/CARS scale
- `fillingMaterial` - filling material
- `fillingSurfaces` - filled surfaces
- `fillingSurfaceMaterials` - per-surface filling material (mixed fillings, e.g. buccal amalgam + distal composite)
- `fillingDefect` - per-surface filling defect (none/marginal/fracture/wear), filled-surface-gated, independent of recurrent caries
- `pulpDx` - AAE pulp diagnosis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis renders a reduced glyph
- `pulpLatin` - practical-Latin pulp subtype (shown by the pulp picker only when `pulpDetailLevel` is `latin`)
- `apicalDx` - apical diagnosis driving the periapical glyph
- `periapicalType` - periapical lesion subtype (none/granuloma/cyst), shown only under symptomatic/asymptomatic apical periodontitis; legacy `abscess` still accepted on import
- `resorptionType` - root resorption type (none/internal/external-cervical)
- `periImplant` - implant-only peri-implant status (none/mucositis/peri-implantitis-mild/-moderate/-severe), 2018 World Workshop staging
- `dxOverrides` - per-tooth diagnosis-coding overrides (version 2.21): an object keyed by ICD-10 diagnosis key → `add` | `suppress`, forcing a coded diagnosis on despite no matching chart finding, or off despite one; shapes the effective coded set exported as FHIR `Condition`s
- `endoResection` - apicoectomy flag
- `fissureSealing` - fissure sealant flag
- `calculus` - calculus flag
- `contactMesial` - mesial contact point loss
- `contactDistal` - distal contact point loss
- `wearEdge` - incisal/occlusal wear type (none/attrition/erosion)
- `wearCervical` - cervical wear type (none/abrasion/abfraction/erosion)
- `discoloration` - per-tooth discoloration cause (none/tetracycline/fluorosis/nonvital/extrinsic/other), tints the natural crown fill on a natural tooth-base/milk tooth with no restoration
- `orthoAppliance` - orthodontic appliance (none/bracket/band)
- `orthoDrift` - orthodontic drift (none/mesial/distal)
- `orthoVertical` - orthodontic vertical movement (none/extrusion/intrusion)
- `orthoRotation` - orthodontic rotation flag
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - fracture locations
- `extractionWound` - post-extraction wound
- `extractionPlan` - planned extraction
- `parapulpalPin` - parapulpal pin flag
- `bridgePillar` - bridge abutment tooth
- `mobility` - mobility grade (none/m1/m2/m3)
- `crownNeeded` - crown needed indicator
- `crownReplace` - crown replacement needed indicator
- `missingClosed` - gap closed after extraction
- `customStates` - plugin custom states (object, keyed by plugin ID)
- `note` - per-tooth text note (string, optional — only present when non-empty)

**Top-level `plan` field (version 2.11+):**
- `plan` - optional object, same shape as `teeth` (per-tooth fields above), holding the **plan** (intended post-treatment) chart. Present only when the plan chart has been initialized (the `Status | Plan` toggle has been switched to Plan at least once) AND its content differs from the status chart — a status-only export omits it entirely and stays byte-identical to a pre-2.11 export apart from the version number. On import, an absent `plan` clears/uninitializes the plan chart (it never resurrects a stale plan left over from before the import); a present `plan` restores the plan chart alongside status. The plan chart can also be read/written independently of import/export via `getPlanChart()`/`setPlanChart()` (see Public API above), and `getStatusChart()` always returns the status-primary payload regardless of the active chart mode.

**Top-level `case` field (version 2.17+, extended in 2.18, 2.19, 2.20 and 2.22):**
- `case` - optional object holding case-level (not per-tooth) metadata, shared by both the status and plan charts (mirrors the top-level `globals` key). Omit-when-empty: absent entirely when every field is at its default, so a case-less export stays byte-identical apart from the version number. Fields (each omitted when at its default): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; the four 2017-classification per-axis clinician overrides `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; (version 2.19) `patientName` / `examDate`; and (version 2.20) `patientDob`; and (version 2.22) `caseConditions` — case/regional diagnoses (malocclusion & TMJ K07, oral cysts K09, salivary-gland disease K11, stomatitis & oral mucosa K12/K13, arch-level developmental K00), each mapped to a laterality (unspecified / left / right / bilateral). It feeds the periodontal staging/grading classification and the PDF report header; read/written via `getCaseMeta()` and the `setCase*` setters (see Public API above). Patient name, date of birth and exam date are chart-identity metadata only — they are **not** part of the FHIR export.

### 🖨️ Export
`exportFhir()` is HL7-validator-clean: every Bundle entry carries a deterministic `id` and an absolute `fullUrl` (no `urn:uuid` placeholders), and the Bundle embeds the engine's own CodeSystem so its local codes resolve during validation (also published as `fhir/CodeSystem-odontogram.json`; pass `includeCodeSystem: false` to omit it).

Periodontal data now round-trips through FHIR import too, not only through the JSON payload: `importFhirBundle()` reads the LOINC `74029-0` periodontal panels back into each tooth's perio record — probing depth, gingival margin (reconstructed from CAL, so pseudopocket values survive), BOP, furcation, O'Leary plaque, the PI/GI and implant mPI/mBI indices and keratinized-gingiva width — plus the case-level smoking-status and HbA1c evidence Observations. Suppuration is the one exception: it stays JSON-only, since it is not part of the FHIR export.

Beyond the odontogram's own Status JSON / FHIR / PNG / JPG / SVG export, the **periodontal chart** has its own export path:
- **Perio SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` render the full perio chart (tooth graphics + numeric rows + the 2017 classification) as one standalone vector SVG (`buildPerioSvg()`), independent of the mounted `PerioChart` DOM. The three export-menu items are disabled whenever `hasAnyPerioData()` is false (a blank chart has nothing perio to export).
- **PDF report:** the export menu's "PDF report…" item opens `ExportOptionsModal` — a settings dialog (patient name + date of birth + exam date fields, wired straight to the case metadata, with exam date defaulting to today; section checkboxes: patient data, odontogram chart, odontogram description, individual notes — disabled when no tooth has a note — perio status, perio description) before calling `exportPdf(opts)`. Empty identity fields fall back to placeholders ("John Doe" / "1980-01-01") so export always succeeds. The PDF is assembled jsPDF-natively — vector text via `.text()`, raster tooth/perio-chart images via `.addImage()` — with **no svg2pdf.js dependency**. The individual-notes section is auto-skipped when no tooth has a note, and the two perio sections whenever `hasAnyPerioData()` is false, regardless of the dialog's checkboxes.
- **mPI/mBI implant-gating:** the peri-implant Mombelli indices (mPI/mBI) only render as rows in an arch that contains at least one implant tooth — on both the live perio chart and the SVG/PDF exports.
- Patient name, date of birth and exam date are chart-identity metadata only (payload `2.20`, additive) — they are **not** part of the FHIR export.

### 📁 Folder Structure
- `src/App.tsx` - shell UI, topbar controls, language/numbering/dark mode/theme/plugin switcher
- `src/odontogram.ts` - SVG layering engine, tooth state management, touch interactions, plugin overlays, UI wiring
- `src/plugin.ts` - `OdontogramPlugin` type, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index priorities
- `src/theme.ts` - `OdontogramThemeConfig` type and `applyThemeConfig()` utility
- `src/status_extras.ts` - 34 predefined restoration templates (bridges, dentures, bar constructions)
- `src/i18n/` - translations (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) and i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer numbering conversion
- `src/registry/` - declarative clinical-axis registry: FHIR field mappings, SVG-clear-set/boolean-flag activation, restoration type×material matrix, UI option lists (single source of truth generating export/import, FHIR, and picker UI)
- `src/fhir/` - HL7 FHIR R4 export/import: `toFhir.ts`/`fromFhir.ts`, code systems, field mappings, primitives
- `src/bridgeOverlay.ts` - multi-tooth bridge-span connector overlay (arch-aware saddle geometry)
- `src/SettingsModal.tsx` - tabbed Settings dialog (General/Panels/Tooth details/Caries/Pulpa/Notes/Periodontal)
- `src/perioExport.ts` - `buildPerioSvg()`: the full perio chart as one standalone vector SVG
- `src/perioPdf.ts` - `exportPdf()`'s pure jsPDF report assembler (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - the "PDF report…" export-settings dialog
- `src/__tests__/` + `src/registry/__tests__/` - extensive automated Vitest test suite
- `src/assets/teeth-svgs/` - SVG tooth templates (6 files: incisors, canines, premolars, molars + occlusal views)
- `src/assets/icon-svgs/` - toolbar icon SVGs (5 files)

### ⚙️ Tech Stack
- React 18 + Vite + TypeScript
- Tailwind CSS for UI styling
- SVG layering via DOM manipulation (non-React state for performance)
- Lightweight custom i18n system
- Vitest + Testing Library for automated tests
- TypeDoc for API documentation
- Vite path alias: `@` mapped to `./src`

### 📝 Notes
- SVG templates are loaded from `src/assets/teeth-svgs` and `src/assets/icon-svgs`, so static hosting must serve the public folder.
- The odontogram engine uses its own internal state (not React state) for performance and simplicity.
- Milk teeth have a reduced set of available materials (no amalgam fillings, no pin-based endo).
- Implant teeth have a different set of crown/abutment options than natural teeth.

### 🔒 Security notes

- **Plugins run as trusted code.** A plugin's `renderSvg()` return value is injected into the live chart's SVG. That output is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) (SVG profile, plus `svgFilters`) before insertion — `<script>`, `<iframe>`, `<object>`, `<embed>` and `<foreignObject>` are forbidden outright, and wholly-malicious output is dropped rather than partially rendered. This reduces the blast radius of a compromised or buggy plugin, but plugins should still only be loaded from sources you trust — sanitization is a safety net, not a substitute for vetting.
- **Content-Security-Policy.** The demo's **production build** injects this policy via a `<meta http-equiv="Content-Security-Policy">` tag (the dev server is unaffected):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Host applications embedding `OdontogramShell` should set their own CSP appropriate to their deployment — the component does not inject one when used as a library.

### 📖 How to cite

If you use this module in your work, please cite it.

**This version (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**All versions (concept DOI):** https://doi.org/10.5281/zenodo.21156787

> The all-versions concept DOI above always resolves to the most recent archived
> release; a version-specific DOI is minted per release when it is archived on
> Zenodo. Until v2.4.0 is archived, cite it via the concept DOI.

Machine-readable citation metadata is in [`CITATION.cff`](CITATION.cff).

## 🙌 Credits

React Advanced Odontogram is created and maintained by Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), the creator and lead developer of the whole engine. With the valued help of the contributors listed below. Thank you to everyone who has contributed.

**Contributors**

- [@odontodev](https://github.com/odontodev): state hydration and lifecycle API, fillings settings as controlled props, idempotent setters and collapsible cards
- [@JulianoBazzi](https://github.com/JulianoBazzi): Brazilian Portuguese translation
- [@yassine-bhn](https://github.com/yassine-bhn): French translation and the candidate measured anatomy
- [@saegerdirk-star](https://github.com/saegerdirk-star): measured tooth anatomy and the tooth generator, plus the composable interface proposal

**Built with** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) and [Tailwind CSS](https://tailwindcss.com).

Contributions are welcome. Open a pull request on GitHub and you will be credited here. If the project is useful to you, please [star it on GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).

