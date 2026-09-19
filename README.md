<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/src/assets/react-module-logo.png" alt="React Advanced Odontogram logo" width="160" />
</p>

# 🦷 React Advanced Odontogram

[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![Version](https://img.shields.io/badge/version-2.6.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Advanced-Odontogram/releases)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/LICENSE)
[![DOI](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📖 Full documentation is available per language:**

🇬🇧 [English](lang/README-en.md) · 🇩🇪 [Deutsch](lang/README-de.md) · 🇪🇸 [Español](lang/README-es.md) · 🇫🇷 [Français](lang/README-fr.md) · 🇮🇹 [Italiano](lang/README-it.md) · 🇭🇺 [Magyar](lang/README-hu.md) · 🇵🇱 [Polski](lang/README-pl.md) · 🇧🇷 [Português (BR)](lang/README-pt-br.md) · 🇸🇰 [Slovenčina](lang/README-sk.md) · 🇷🇺 [Русский](lang/README-ru.md) · 🇸🇦 [العربية](lang/README-ar.md) · 🇨🇳 [简体中文](lang/README-zh.md)

An interactive, SVG-based **dental odontogram (dental chart) editor** for **React + TypeScript** — with a full **periodontal charting module**, multi-surface caries/restorations, endodontic/prosthetic states, FDI/Universal/Palmer numbering, **HL7 FHIR R4** export/import, optional ICDAS scoring, and a 12-language UI.

🔗 **Live demo:** https://react-advanced-odontogram.vercel.app/ \
📚 **API docs:** https://zoliqua.github.io/React-Advanced-Odontogram/ \
🅰️ **Angular version:** an official Angular port, [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` on npm), is available — JSON and FHIR R4 exports round-trip between the two libraries.

![Odontogram editor preview](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_odontogram.png)

---

## 📦 Installation

```bash
npm install react-advanced-odontogram react react-dom
```

**Requirements:** React **18 or 19** (peer dependency); a bundler that supports the `exports` field and ESM (Vite, webpack 5, Next.js, Rollup, esbuild, Parcel). The package is **ESM-only**.

## 🚀 Quick start

Render `OdontogramShell` and import the stylesheet **once**:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return <OdontogramShell language="en" numberingSystem="FDI" darkMode={false} />;
}
```

The imperative state API, the standalone `PerioChart` component, the guided tour, and all public types are named exports from the same entry point (`OdontogramShell` is also the default export):

```ts
import {
  OdontogramShell,        // also the default export
  PerioChart,             // standalone periodontal chart
  getOdontogramSummary,
  exportStatus, importStatus,   // JSON state serialization / hydration
  exportFhir, exportSvg, exportImage,
  setReadOnly, startIntroTour,
} from "react-advanced-odontogram";
```

> **SSR:** the component is client-only (reads the DOM on mount). In Next.js render it in a Client Component (`"use client"`) or via a client-only dynamic import.
> **Assets are self-contained** — tooth/icon SVGs are inlined into the bundle; there is no runtime asset fetch to configure.
> **One instance per page** in this release (engine state is a module-level singleton).

## 🦷 Periodontal charting

![Full-mouth periodontal chart](https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/lang/screenshot_en_perio.png)

Per-site probing depth, gingival margin, bleeding on probing (+ suppuration) at the six standard sites, with derived CAL, recession and whole-mouth %BOP; a graphical full-mouth perio chart (CEJ line, mm guide grid, pocket/margin curve, anatomical diamond index tiles), 2017 staging/grading, and per-site FHIR export (LOINC periodontal panel `74029-0`). Available as an `Odontogram | Periodontal Status` view toggle and as a separately-invocable `PerioChart` component. Periodontal data now round-trips through FHIR import too, not only through the JSON payload — suppuration is the one exception and stays JSON-only.

## ✨ Highlights

- 🦷 Permanent / primary / implant / missing teeth; substrate, restorations (crown/inlay/onlay/veneer/bridge × materials), removable & implant prosthetics
- 🔍 Multi-surface caries & fillings (ICDAS / CARS severity, root & radiographic caries), endo & AAE pulp diagnosis, apical diagnosis, peri-implant status, wear, discoloration, orthodontics
- 🩺 Full periodontal module (see above) + 2017 classification
- 🔗 **HL7 FHIR R4** export/import; JSON export/import with migrations
- 🧬 **Standards-based diagnosis coding** — WHO ICD-10 always on, per-tooth & case/regional diagnoses, selectable national packs (BNO-10, US ICD-10-CM), an opt-in SNOMED CT overlay, and full FHIR `Condition` export/import round-trip
- 🩺 **Diagnoses card, revised:** every per-tooth diagnosis row shows the ICD-10 code first (`K04.0 Pulpitis`) and rows are sorted by code. Each row has an **exclude** toggle (drops the diagnosis from the FHIR export but keeps it on the chart) and a **delete** (×) that removes the diagnosis *and* its finding on the tooth. Adding a diagnosis from the picker writes the underlying chart finding, so the glyph appears at once.
- 🗂️ **Case / regional diagnoses pop-up:** the whole-mouth and regional diagnoses (jaw anomalies, cysts, salivary and mucosal conditions…) moved out of the periodontal sidebar into their own dialog, opened from the **Diagnoses** button beside the Odontogram / Periodontal-status toggle; its picker is code-first and code-sorted.
- 🇭🇺 **BNO-10 pack:** the Hungarian display strings are now the official NEAK BNO-10 titles, and the pack uses the standard ICD-10 system URI (BNO-X is identical to WHO ICD-10).
- ✅ **HL7-validator-clean FHIR export:** every Bundle entry carries a deterministic `id` and an absolute `fullUrl` (no `urn:uuid` placeholders), and the Bundle embeds the engine's own **CodeSystem** so its local codes resolve during validation; the same CodeSystem is published in the repository as `fhir/CodeSystem-odontogram.json` (pass `includeCodeSystem: false` in the FHIR export options to omit it).
- 🎯 **ICD codes that follow the chart (data-driven specificity).** Caries depth comes from the radiographic depth when it is charted (E1/E2 → enamel, D1–D3 → dentine) and falls back to the ICDAS severity (1–3 → enamel, 4–6 → dentine), refining WHO `K02` to `K02.0` / `K02.1` and ICD-10-CM `K02.9` to `K02.51/.52` (pit-and-fissure) or `K02.61/.62` (smooth surface) by surface × depth. Chronic periodontitis takes its ICD-10-CM code from the 2017 stage and extent (`K05.311`–`K05.329`). One Condition per tooth, carrying the deepest involvement.
- 🔄 **Periodontal data round-trips through FHIR.** The importer reads the LOINC 74029-0 periodontal panels back into each tooth — probing depth, gingival margin (reconstructed from CAL, so pseudopocket values survive), BOP, furcation, O'Leary plaque, the PI/GI and implant mPI/mBI indices and keratinized-gingiva width — plus the smoking-status and HbA1c evidence Observations. Conditions coded only in ICD-10-CM or SNOMED CT are recognised too, so a foreign bundle imports what it can.
- 🧬 **SNOMED CT for the whole diagnosis catalog.** 48 of the 50 slots now carry a verified SNOMED CT International concept (active, core module, matching FSN). Two stay deliberately unset because SNOMED International has no umbrella concept for them: jaw-size anomaly (K07.0) and dentofacial functional abnormalities (K07.5). The SNOMED overlay remains opt-in in Settings.
- 📦 **A loadable FHIR terminology package.** The repository's `fhir/` folder is a FHIR NPM package (`react-advanced-odontogram.fhir`, FHIR 4.0.1) holding the engine CodeSystem plus generated ValueSets — one per clinical-axis value group, one for the finding types and an all-codes set. Point a validator at it with `-ig ./fhir`.
- 🖼️ PNG / JPG / SVG chart export and a customizable, **multilingual PDF report** (jsPDF, lazy-loaded) — colour themes, a grouped dentition-summary table, a periodontal chart/description, and bundled Unicode fonts so every UI language (incl. Hungarian accents, Cyrillic, Arabic RTL and Chinese) renders correctly
- 🔢 FDI / Universal / Palmer numbering · 🌐 12 UI languages (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR, Arabic RTL) · 🎨 theming via `--odon-*` CSS variables · 🧩 plugin system · ⌨️ keyboard accessibility

## 📖 Documentation

Per-language guides are linked at the top of this file. Full API reference (TypeDoc):

📚 **https://zoliqua.github.io/React-Advanced-Odontogram/**

## 📄 License & citation

MIT © [Zoltán Dul](https://www.linkedin.com/in/zoltandul/). If you use this software in research, please cite it — see [`CITATION.cff`](CITATION.cff) and the [Zenodo record](https://doi.org/10.5281/zenodo.21156787).
