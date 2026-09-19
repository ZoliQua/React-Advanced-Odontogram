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

## 📑 Inhaltsverzeichnis

- [📋 Übersicht](#-übersicht)
- [📦 Als npm-Paket verwenden](#-als-npm-paket-verwenden)
- [✨ Hauptmerkmale](#-hauptmerkmale)
- [📦 Module](#-module)
- [🛠️ UI-Steuerung](#-ui-steuerung)
- [🦷 Zahntypen und Zustände](#-zahntypen-und-zustände)
- [⚙️ Einstellungen](#-einstellungen)
- [🖼️ SVG-Vorlagensystem](#-svg-vorlagensystem)
- [🔢 Nummerierungssysteme](#-nummerierungssysteme)
- [🚀 Verwendung](#-verwendung)
- [🔗 Integration](#-integration)
- [🧪 Tests](#-tests)
- [📖 API-Dokumentation](#-api-dokumentation)
- [📡 Öffentliche API](#-öffentliche-api)
- [💾 Zustandspersistenz (localStorage)](#-zustandspersistenz-localstorage)
- [💾 Status Export-/Importformat](#-status-export-importformat)
- [🖨️ Export](#-export)
- [📁 Ordnerstruktur](#-ordnerstruktur)
- [⚙️ Technologie-Stack](#-technologie-stack)
- [📝 Hinweise](#-hinweise)
- [🔒 Sicherheitshinweise](#-sicherheitshinweise)
- [📖 Zitierung](#-zitierung)

## 🇩🇪 Deutsch

*(Deutsche Version des README — übersetzt aus der englischen Ausgangsversion, Stand v2.4.0)*

### 📋 Übersicht
Dieses Projekt ist ein interaktiver, browserbasierter Odontogramm-Editor, der eine schnelle Zahnstatuserfassung mit einer übersichtlichen Benutzeroberfläche unterstützt. Es rendert geschichtete SVG-Zahnvorlagen zur Darstellung von Restaurationen, Karies, endodontischem Status, Mobilität und anderen klinischen Details, und bietet Mehrfachauswahl, Auswahlfilter und vordefinierte Statusvorlagen.

---
![Odontogram – Vorschau (Deutsch)](screenshot_de_odontogram.png)

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### 📦 Als npm-Paket verwenden

Das Odontogramm wird als eigenständige React-Komponentenbibliothek auf npm veröffentlicht:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Voraussetzungen
- **React 18 oder 19** (als Peer-Dependency deklariert — wird von Ihrer App bereitgestellt).
- Ein **Bundler**, der das `exports`-Feld und ESM versteht: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. Das Paket ist **nur ESM**.
- Node **≥ 18** für das Tooling.

#### Installation

```bash
npm install react-advanced-odontogram react react-dom
```

#### Grundlegende Verwendung

Rendern Sie `OdontogramShell` und importieren Sie das Stylesheet **einmal** irgendwo in Ihrer App:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="de"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Komponenten-Props

`OdontogramShell` ist eine kontrollierte Komponente. Die gebräuchlichsten Props:

| Prop | Typ | Standard | Beschreibung |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI-Sprache (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Zahnnummerierungssystem. |
| `darkMode` | `boolean` | `false` | Umschalter für dunkles Design. |
| `readOnly` | `boolean` | `false` | Deaktiviert jegliche Bearbeitung (nur Ansicht). |
| `themeConfig` | `OdontogramThemeConfig` | — | Überschreibt Theme-CSS-Variablen (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registriert benutzerdefinierte Zustands-Plugins / zusätzliche Ebenen. |
| `enableNotes` | `boolean` | `false` | Aktiviert Notizen pro Zahn. |
| `enableIcdas` | `boolean` | `false` | Aktiviert ICDAS-II-Kariesbewertung. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Füllungskomplexität: `"simple"` (ein Material pro Zahn) oder `"complex"` (Materialien pro Fläche). |
| `fillingDefectEnabled` | `boolean` | `true` | Aktiviert Füllungsdefekt-Befunde auf der Füllungs-Karte. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | alle verfügbar | Verfügbare Füllungsmaterialien als boolesche Zuordnung über `amalgam`/`composite`/`gic`/`temporary` (unbekannte Schlüssel werden ignoriert). |
| `fissureSealingEnabled` | `boolean` | `true` | Aktiviert die Fissurenversiegelung auf der Füllungs-Karte. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Wird ausgelöst, wenn der Benutzer die entsprechende Einstellung über Einstellungen → Füllungen ändert. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Wird ausgelöst, wenn der Benutzer die Einstellung über die UI ändert. |

Feiner granulare Detailstufen-Props (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) werden ebenfalls akzeptiert — die vollständige, typisierte Liste finden Sie in den mitgelieferten `.d.ts`-Typen.

Die vier Füllungs-Props oben sind **reine Wiederherstellungs-Props**: Ein weggelassenes Prop schreibt nie in die Engine (ein imperativer `setFillingComplexity()`-Aufruf vor dem Mount bleibt erhalten, der Einzelbetrieb bleibt unverändert), während ein bereitgestelltes Prop Engine und Einstellungs-Modal-Zustand gemeinsam schreibt, sodass das Modal nie einen veralteten Wert anzeigt. `fillingMaterialAvailability` wird per Diff über einen kanonischen serialisierten Schlüssel angewendet — ein erneutes Rendern mit einem Inline-Literal identischen Inhalts schreibt die Engine nie neu. Die passenden `on*Change`-Callbacks werden über Einstellungen → Füllungen ausgelöst — der Rückschreibpfad für Hosts, die Präferenzen speichern.

#### Öffentliche API (benannte Exporte)

`OdontogramShell` ist sowohl der Standardexport als auch ein benannter Export. Die imperative Zustands-API, die eigenständige `PerioChart`-Komponente, die geführte Tour und alle öffentlichen Typen sind benannte Exporte desselben Einstiegspunkts:

```ts
import {
  OdontogramShell,           // auch der Standardexport
  PerioChart,                // eigenständige Parodontalstatus-Komponente
  // Zustand lesen
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // Zustandsänderungen abonnieren
  // Export / Import
  exportFhir,                // HL7-FHIR-R4-Bundle
  exportSvg, exportImage,    // Vektor-/Raster-Befundexport
  setImportFormat,
  // Steuerung
  setReadOnly, getReadOnly,
  clearSelection, getSelectedTeeth,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // startet die Einführungstour
  // …und viele weitere setX/getX-Einstellungsfunktionen
} from "react-advanced-odontogram";
```

Die vollständige Oberfläche (≈ 44 Funktionen + Typen wie `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) ist in den mitgelieferten Deklarationen vollständig typisiert.

#### Zusammensetzbare Oberflächen (fortgeschritten)

`OdontogramShell` ist die unterstützte All-in-one-Komponente und benötigt keine zusätzliche Einrichtung. Wenn Sie die Bereiche des Odontogramms an verschiedenen Stellen Ihres eigenen Layouts platzieren müssen, werden die vier UI-Oberflächen der Shell ebenfalls exportiert und lassen sich unter einem einzigen `OdontogramProvider` zusammensetzen, wobei sie alle eine vom Paket verwaltete Sitzung teilen:

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

`OdontogramProvider` nimmt dieselben Props wie `OdontogramShell` entgegen. Ein `useOdontogramUi()`-Hook (und der Typ `OdontogramUiContextValue`) steht zum Erstellen eigener Oberflächen zur Verfügung. Aktuelle Einschränkung: Verwenden Sie einen Provider pro Seite. Oberflächen können bei Bedarf ein- und ausgehängt werden — sie binden sich beim erneuten Einhängen automatisch wieder an. `OdontogramShell` selbst ist unverändert — es ist genau diese Zusammensetzung in der Standardanordnung.

Für eine noch feinere Zusammensetzung werden auch die einzelnen Steuerungskarten exportiert — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` und `ToothDetailsCard` — jede eine eigenständige deklarative Komponente, die die gemeinsame Sitzung über die Engine-API liest und schreibt (ein `useEngineState()`-Hook wird zum Erstellen eigener bereitgestellt). Binden Sie nur die Karten ein, die ein bestimmtes Layout benötigt, in beliebiger Anordnung, unter einem einzigen `OdontogramProvider`.

#### Verwendung mit Next.js (App Router)

Die Komponente ist nur clientseitig, rendern Sie sie daher aus einer Client-Komponente:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="de" numberingSystem="FDI" />;
}
```

Oder laden Sie sie mit einem rein clientseitigen dynamischen Import: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Wichtige Hinweise & aktuelle Einschränkungen
- **Nur ESM** — das Paket veröffentlicht ein einzelnes ES-Modul (`dist/odontogram.js`) plus einen Typdeklarations-Einstiegspunkt (`dist/index.d.ts`). Es zielt auf die Bundler-Modulauflösung ab; es gibt keinen CommonJS-Build.
- **Das Stylesheet ist separat** — Sie **müssen** `react-advanced-odontogram/style.css` einmal importieren; es wird nicht automatisch eingebunden. Das Styling ist globales CSS, das unter `.odontogram-root` skoped ist und von `--odon-*`-CSS-Variablen gesteuert wird.
- **SSR / nur clientseitig** — die Komponente liest beim Mounten das DOM (`document`), daher muss sie im Browser laufen. Rendern Sie sie in SSR-Frameworks in einer Client-Komponente (`"use client"`) oder über einen rein clientseitigen dynamischen Import.
- **Assets sind eigenständig** — die Zahn- und Icon-SVGs werden zur Build-Zeit in das JavaScript-Bundle eingebettet; es gibt **keinen Laufzeit-Asset-Abruf**, den man konfigurieren müsste, und nichts Zusätzliches, das in Ihren öffentlichen Ordner kopiert werden müsste.
- **Eine Instanz pro Seite** — der Engine-Zustand ist derzeit ein Singleton auf Modulebene, daher würden zwei `<OdontogramShell>`-Instanzen auf derselben Seite den Zustand eines einzigen Befunds gemeinsam nutzen. Unterstützung für mehrere Instanzen ist für eine zukünftige Version geplant.

---

### ✨ Hauptmerkmale
- 🖱️ Schnelle Auswahl und Mehrfachauswahl (CMD/CTRL + Klick)
- 🦷 Zahntypen: bleibend, Milchzahn, Implantat, subgingival, fehlend
- 🦷 Zahnsubstrat (unabhängig von jeder Restauration): natürlich, Radix (Wurzelrest), frakturiert, für Krone präpariert
- 👑 Restaurationen nach Typ × Material: Krone / Inlay / Onlay / Veneer / Brücke in e.max, Gold, Gradia, Zirkon, Metall, Metallkeramik, Teleskop oder provisorisch (Onlay nur okklusale Ansicht) — Auswahl über einen einzigen kombinierten „Fix: Krone – …"-Picker mit wenigen Klicks; bestehende `metal`-Kronen migrieren zu `metal-ceramic` (Metallkeramik); Implantate verwenden dasselbe Typ-×-Material-Modell, kombiniert mit einer Implantat-Verbinder-Ebene. Der Picker ist nach Zahnart gestaffelt: ein Implantat bietet nur Krone/Brücke (plus die fünf Attachment-Optionen weiter unten); ein fehlender/Lücken-Zahn bietet nur ein Brückenglied (plus herausnehmbare Teil-/Vollprothese); ein `radix`-Substrat blendet die Restaurationssteuerung vollständig aus (an einem Wurzelrest kann keine Restauration angelegt werden)
- 🦿 Herausnehmbare/Abutment-Prothetik auf der eigenen `prosthesis`-Achse („Kivehető:"-Einträge im kombinierten Picker): Implantat-Heilabutment, Locator, Locator mit Suprakonstruktion, Steg, Steg mit Suprakonstruktion; zahngetragene herausnehmbare Teil- oder Vollprothese
- 🌉 Brückenzähne rendern sowohl die Kronenkappe als auch den Sattel-Verbinder; ein Mehrzahn-Brückenspann-Overlay rendert einen durchgehenden, bogenbewussten Verbinder über aufeinanderfolgende Brückenzähne (Glieder + Pfeiler) sowie die dazwischenliegenden Zahnzwischenräume (Ober- und Unterkiefer verwenden gespiegelte Sattelgeometrie, sodass der Verbinder auf beiden Bögen ausgerichtet bleibt), im PNG/JPG/SVG-Export enthalten; das Anwenden einer Brücke über eine Statusvorlage berechnet das Overlay sofort neu
- 🔍 Karieskartierung auf 6 Flächen: mesial, distal, bukkal, lingual, okklusal, subkronal
- 🪥 Füllungsmaterialien pro Fläche: Amalgam, Komposit, GIZ, provisorisch
- 🏥 Ein zusammengeführter „Pulpa-/Endo-Status"-Auswähler (gruppiert: vitale Pulpa vs. behandelt/endodontisch): endodontische Zustände (medikamentöse Füllung, Wurzelfüllung, inkomplette Wurzelfüllung, Glasfaserstift, Metallstift) und die AAE-Pulpadiagnose (`pulpDx`: normal / reversible / irreversible Pulpitis / Nekrose) schließen sich gegenseitig aus — ein wurzelbehandelter Zahn (`endo` gesetzt) kann nicht gleichzeitig eine vitale Pulpadiagnose tragen; bei einer Behandlung wird `pulpDx` auf `normal` normalisiert und das Glyph für die erkrankte Pulpa unterdrückt. Reversible Pulpitis rendert ein reduziertes Pulpa-Glyph. Eine optionale 3-stufige Pulpa-Detailstufe (`pulpDetailLevel`: simple / AAE / praktisches Latein) zeigt über `pulpLatin` 9 praktische lateinische Pulpa-Subtypen an (pulpa sana … gangraena pulpae); Resektion und parapulpaler Stift bleiben eigenständige Sonderindikatoren
- 🦴 Apikale Diagnose (`apicalDx`: symptomatische/asymptomatische apikale Parodontitis, akuter/chronischer apikaler Abszess, kondensierende Osteitis) steuert direkt den periapikalen Glyphen; ein Granulom-/Zysten-Läsionssubtyp-Qualifikator wird nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt (der redundante „Abszess"-Subtyp wurde entfernt — er ist bereits durch die apikale Diagnose abgedeckt)
- 🩹 Zusammengeführte Karte „Wurzel und Parodontium" (ein einzelner ausklappbarer Abschnitt für Wurzel-/periapikale und parodontale Befunde)
- ⚕️ Modifikationen: periapikale Entzündung (nur bei fehlenden/Extraktionsalveolen-Zähnen angezeigt; bei vorhandenen Zähnen ausgeblendet, wo `apicalDx` allein den periapikalen Glyphen steuert, sowie bei Implantaten, wo `periImplant` dies übernimmt), Parodontalerkrankung, Mobilitätsgrade (M1/M2/M3, bei Implantaten ausgeblendet)
- 🦷🔩 Periimplantärer Status (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — Staging nach dem World Workshop 2018, angezeigt als eigener Auswähler bei Implantaten; Mukositis verwendet das parodontale Zahnfleisch-Glyph weiter, Periimplantitis fügt eine abgestufte `peri-implant-bone-loss`-Ebene hinzu (Deckkraft 0,4/0,7/1,0). Implantate rendern das periapikale Läsions-Glyph nicht mehr — ihre Entzündung wird stattdessen über diese Achse ausgedrückt — und die parodontalen Modifikator-Checkboxen sind bei Implantaten ausgeblendet (die behelfsmäßige Umbenennung der „Periimplantitis"-Checkbox entfällt)
- 🏷️ Spezielle Indikatoren: Krone erforderlich, Kronenwechsel erforderlich, geschlossene Lücke nach Extraktion, Extraktionsplan, Fissurenversiegelung, Kontaktpunktverlust
- 👁️ Okklusionsansicht, Weisheitszähne, Knochen- und Pulpa-Sichtbarkeit umschaltbar
- 🔢 12 Auswahlfilter (alle, vorhandene, bleibende, Milch, Implantate, fehlende, Ober-/Unterkiefer, Front/Molaren)
- 📊 Vordefinierte Statusvorlagen (Zurücksetzen, Milchgebiss, Wechselgebiss, zahnlos)
- 📦 34 vordefinierte Restaurationsvorlagen (Brücken, herausnehmbare Prothesen, Stegprothesen mit Implantaten)
- 💾 Status-Export/Import in JSON (Version 2.22; Importe akzeptieren weiterhin die Legacy-Version 1.4 sowie 2.0 bis 2.21 und werden automatisch migriert, mit Plugin Custom States und per-Zahn Notizen)
- 💽 Opt-in localStorage-Persistenz (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — standardmäßig deaktiviert; speichert den Status-Befund (und optional den Plan-Befund) bei jeder Zustandsänderung automatisch und stellt ihn beim nächsten Mounten der Komponente wieder her, mit einer 4-MB-Größenbeschränkung und Speicher-/Parse-Fehlern, die an einen `onError`-Callback (oder `console.warn`) weitergeleitet werden, statt eine Exception auszulösen
- 🔗 HL7 FHIR R4 Export (Collection-Bundle aus Observations pro Zahn, ISO 3950 Zahnkodierung für das bleibende Gebiss **und** für Milchzähne (51-85, verlustfreier Rückweg beim Import), lokales Codesystem, plus ein optionales SNOMED-CT-Overlay (Einstellungen → SNOMED CT)); eine erfasste Kariesschwere an einer Kariologie-Komponente trägt zusätzlich eine Bewertungssystem-Kodierung — ICDAS an einer primären (ungefüllten) Fläche, CARS an einer rezidivierenden (gefüllten) Fläche
- ✚ Kreuz-/Plus-Oberflächenauswahl (B/M/O/D/L) für Karies und Füllungen
- 🧱 Füllungsmaterialien pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- 🖼️ PNG/JPG/SVG-Bildexport des Befunds (herunterladbar; PNG/JPG aus Vektor-SVG gerastert)
- 🦷 Karies/Sekundärkaries als Zustandsautomat pro Fläche: eine kariöse Fläche ohne Füllung wird als primäre Karies dargestellt (ICDAS-gestufte Deckkraft); sobald diese Fläche eine Füllung hat, wird sie stattdessen als Sekundärkaries (rezidivierende Karies) dargestellt (`subcaries-{surface}`-Ebene, CARS-bewertet) — beide sind nie gleichzeitig auf derselben Fläche aktiv
- 🎯 Vereinheitlichter Schweregrad pro Fläche (`cariesSeverity`, 0–6, ersetzt die früheren getrennten ICDAS-Tiefe- und CARS-Felder): wird auf einer primären Fläche als ICDAS-Tiefe gelesen, auf einer rezidivierenden Fläche als benannter CARS-Score (Gesund … Ausgedehnte Kavität), über ein kontextabhängiges Popup, das jeweils nur die zum aktuellen Zustand der Fläche passende Skala zeigt
- 🌱 Wurzelkaries (`rootCaries`: none / active / arrested / active-cavitated), steuert die dedizierte Wurzelkaries-Bildebene mit einer vom Schweregrad abhängigen Deckkraft (active 0,5 / arrested 0,7 / active-cavitated volle Deckkraft)
- 📡 Radiologische Kariestiefe (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 pro Fläche), unabhängig von der visuellen ICDAS-/CARS-Schweregradskala, dargestellt als Badge und über eine eigene FHIR-Observation rückführbar
- 🎚️ Drei Karies-Granularitätseinstellungen (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) sowie ein `cariesDepthEnabled`-Umschalter, die jede Skala auf eine einfachere Auswahlansicht reduzieren, ohne den gespeicherten Wert zu verlieren
- 🩹 Sekundärkaries-Zusammenfassung im Füllungspanel: eine Zeile unterhalb der Füllungssteuerung listet jeden ausgewählten Zahn mit Sekundärkaries samt Flächen auf (z. B. „36 (O) hat Sekundärkaries an der Füllung.")
- 🪛 Füllungsdefekte pro Fläche (`fillingDefect`: none / marginal / fracture / wear) an direkten Restaurationen, unabhängig von Sekundärkaries — erfasst über einen Flächenindikator auf der Füllungskarte (analog zum Kariestiefe-Indikator, die Optionsliste vertikal gestapelt), auf dem Befund dargestellt und im Tooltip sowie in der Ganzmund-Füllungszusammenfassung mit einer expliziten Beschriftung angezeigt (z. B. „36 (O) – Füllungsdefekt: O: marginal"), auf dieselbe Weise, wie Sekundärkaries in der Kariologie-Zeile beschriftet wird; die Füllungskarte zeigt außerdem einen Hinweis für jeden ausgewählten Zahn mit erfasstem Füllungsdefekt (z. B. „36 hat einen erfassten Füllungsdefekt."), parallel zum bestehenden Sekundärkaries-Hinweis
- 🦷💥 Zahnabrieb typisiert nach klinischer Ursache und Lokalisation (`wearEdge`: none / attrition / erosion, inzisal/okklusal; `wearCervical`: none / abrasion / abfraction / erosion, zervikal) — ersetzt die beiden Ein-/Aus-Bruxismus-Abrieb-Flags; erfasst über zwei Dropdowns in der Abrieb-Zeile, verwendet die bestehende Abrieb-Grafik weiter und wird im Tooltip sowie in einem neuen Ganzmund-Zusammenfassungsabschnitt „Abrieb" angezeigt
- 🎨 Zahnverfärbung nach Ursache (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) bei bleibenden und Milchzähnen — färbt die dargestellte natürliche Zahnkrone in einer repräsentativen Farbe ein, wenn der Zahn keine Restauration und natürliches Substrat hat; wird im Tooltip und in einem neuen Ganzmund-Zusammenfassungsabschnitt „Verfärbung" angezeigt; vervollständigt zusammen mit Füllungsdefekten und Abrieb den Satz an Oberflächen- und Strukturbefunden
- ✏️ Frontzähne (Schneide- und Eckzähne) beschriften ihre Kaufläche in der gesamten Oberfläche (Auswahl, Popup, Zusammenfassungen) als „inzisal"; der gespeicherte Flächenschlüssel bleibt `occlusal`
- 🔤 Positionsbewusste Flächenbezeichnung (Einstellungen → Zahndetails → „Flächenbezeichnung", einfach/vollständig, Standard vollständig): im vollständigen Modus folgen der Kariologie-/Füllungs-Flächenbuchstabe und die -bezeichnung der Zahnanatomie — okklusal → I/inzisal bei Frontzähnen, bukkal → L/labial bei Frontzähnen, lingual → P/palatinal bei Oberkieferzähnen und L/lingual bei Unterkieferzähnen (mesial/distal/subkronal sind nicht betroffen); der einfache Modus verwendet immer den generischen B/M/O/D/L/SC-Satz unabhängig von der Zahnposition. Gilt für die Ganzmund-Zusammenfassung sowie für die Kariologie- und Füllungsdefekt-Flächenauswähler (Buchstabe + Beschriftung); der gespeicherte Flächenschlüssel bleibt unverändert
- 🦷↕️ Kieferorthopädische Erfassung pro Zahn (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) an einem vorhandenen natürlichen Zahn (bleibend oder Milchzahn) — verwendet die seit v2.5.0 ungenutzte KFO-Grafik weiter (keine neue SVG); wird auf dem Befund, im Tooltip und in einem neuen Ganzmund-Zusammenfassungsabschnitt „Kieferorthopädie" angezeigt
- 🪨 Zahnstein sowie Wurzelresorption, typisiert als intern oder extern-zervikal (`resorptionType`)
- 📏 Kariestiefe pro Fläche (oberflächlich / Dentin / tief), oder optionales ICDAS-II-Scoring (0–6) via `enableIcdas`
- 🩹 Kronenrand-Undichtigkeits-Umschalter, nur sichtbar bei Kronen- oder Brückenrestauration
- 🧬 Standardbasierte Diagnose-Kodierung (WHO ICD-10, immer aktiv): jeder erfasste Befund leitet eine ICD-10-kodierte Diagnose ab — Karies (K02), Wurzel-/Zementkaries und arretierte Karies (K02.2/.3), Pulpitis und Pulpanekrose (K04.0/.1), apikale Parodontitis, periapikaler Abszess und radikuläre Zyste (K04.4–.9), Attrition/Abrasion/Erosion/Abfraktion (K03.0–.8), Zahnstein (K03.6), Resorption (K03.3), Verfärbung (K00.3/K00.8/K03.7), Zahnverlust (K08.1), Wurzelrest (K08.3) und Zahnfraktur (S02.5) — angezeigt im Tooltip und in der Ganzmund-Zusammenfassung sowie als FHIR Conditions exportiert.
- 🩺 Diagnosen-Karte pro Zahn: die abgeleiteten ICD-10-Diagnosen eines Zahns ansehen und kuratieren — eine falsch abgeleitete unterdrücken oder eine hinzufügen, die der Befund nicht abbildet. Die effektive Menge (abgeleitet − unterdrückt + hinzugefügt) steuert den FHIR-Export.
- 🗺️ Fall-/regionale Befunde: ganzmundweite Diagnosen erfassen, die nicht an einen einzelnen Zahn gebunden sind — Malokklusion und Kiefergelenkerkrankungen (K07), Mundzysten (K09), Speicheldrüsenerkrankungen (K11), Stomatitis und Mundschleimhaut (K12/K13), sowie zahnbogenweite Entwicklungsanomalien (K00) — jeweils optional lateralisierbar (links / rechts / beidseitig).
- 🌍 Nationale Kodierungspakete (Einstellungen → Diagnose-Kodierung): überlagert die WHO-ICD-10-Basis mit einem nationalen Codesystem — BNO-10 (ungarisch, lokalisierte Anzeigen; behält den WHO-Code bei) oder US ICD-10-CM (neu zugeordnete Codes, z. B. der dentofaziale K07-Bereich → M26). Das Paket eines weiteren Landes hinzuzufügen ist ein kleiner `CodingPack`-Eintrag — siehe `CODING_PACKS.md`.
- 🔬 SNOMED-CT-Overlay (Einstellungen → SNOMED CT, optional, standardmäßig aus): fügt eine SNOMED-CT-Kodierung zusätzlich zur WHO- und einer eventuellen nationalen Paket-Kodierung hinzu und kodiert die periimplantären Befunde, für die es keinen WHO-ICD-10-Code gibt. Die ICD-10-CM- und SNOMED-Konzept-IDs sind Referenzwerte nach bestem Wissen — vor klinischer Nutzung gegen die offizielle ICD-10-CM-Tabellenliste / den SNOMED-CT-Browser prüfen.
- 🔁 FHIR-Condition-Roundtrip: Diagnosen werden als FHIR-`Condition`-Ressourcen exportiert (zahnbezogen, plus patientenweite Fall-Conditions mit einem Lateralitäts-`bodySite`) zusätzlich zu den Observations, und der Import rekonstruiert sie — die Fall-Conditions direkt, und die Hinzufügen-/Unterdrücken-Übersteuerungen pro Zahn durch Abgleich der importierten Conditions mit dem neu abgeleiteten Befund.
- 🩺 **Überarbeitete Diagnosen-Karte:** jede Diagnosezeile pro Zahn zeigt zuerst den ICD-10-Code (`K04.0 Pulpitis`), die Zeilen sind nach Code sortiert. Jede Zeile hat einen **Ausschließen**-Schalter (entfernt die Diagnose aus dem FHIR-Export, behält sie aber im Befund) und ein **Löschen**-Symbol (×), das die Diagnose *und* den zugehörigen Befund am Zahn entfernt. Das Hinzufügen einer Diagnose über den Picker schreibt den zugrunde liegenden Befund gleich mit, sodass das Glyph sofort erscheint.
- 🗂️ **Popup für Fall-/regionale Diagnosen:** die Ganzmund- und regionalen Diagnosen (Kieferanomalien, Zysten, Speichel- und Schleimhauterkrankungen …) sind aus der parodontalen Seitenleiste in einen eigenen Dialog gewandert, der über die Schaltfläche **Diagnosen** neben dem Umschalter Odontogramm / Parodontalstatus geöffnet wird; der zugehörige Picker ist code-first und nach Code sortiert.
- 🇭🇺 **BNO-10-Paket:** die ungarischen Anzeigetexte sind jetzt die offiziellen NEAK-BNO-10-Bezeichnungen, und das Paket verwendet die Standard-ICD-10-System-URI (BNO-X ist identisch mit dem WHO-ICD-10).
- ✅ **HL7-Validator-sauberer FHIR-Export:** jeder Bundle-Eintrag trägt eine deterministische `id` und eine absolute `fullUrl` (keine `urn:uuid`-Platzhalter), und das Bundle bettet das eigene **CodeSystem** der Engine ein, damit ihre lokalen Codes bei der Validierung aufgelöst werden können; dasselbe CodeSystem wird auch im Repository als `fhir/CodeSystem-odontogram.json` veröffentlicht (mit `includeCodeSystem: false` in den FHIR-Export-Optionen weglassbar).
- 🎯 **ICD-Codes, die dem Chart folgen (datengetriebene Spezifität).** Die Kariestiefe stammt aus der radiologischen Tiefe, sobald sie erfasst ist (E1/E2 → Schmelz, D1–D3 → Dentin), und fällt sonst auf die ICDAS-Schwere zurück (1–3 → Schmelz, 4–6 → Dentin); das verfeinert WHO `K02` zu `K02.0` / `K02.1` und ICD-10-CM `K02.9` zu `K02.51/.52` (Grübchen und Fissuren) oder `K02.61/.62` (glatte Fläche) je nach Fläche × Tiefe. Die chronische Parodontitis erhält ihren ICD-10-CM-Code aus dem Stadium und der Ausdehnung nach 2017 (`K05.311`–`K05.329`). Eine Condition pro Zahn, mit der jeweils tiefsten Beteiligung.
- 🔄 **Parodontale Daten laufen jetzt über FHIR im Kreis.** Der Import liest die LOINC-74029-0-Parodontal-Panels wieder in jeden Zahn ein — Sondierungstiefe, Gingivarand (aus dem CAL rekonstruiert, sodass Pseudotaschen-Werte erhalten bleiben), BOP, Furkation, O'Leary-Plaque, die PI-/GI- und die implantatspezifischen mPI-/mBI-Indizes sowie die keratinisierte Gingivabreite — dazu die Raucherstatus- und HbA1c-Evidence-Observations. Auch nur in ICD-10-CM oder SNOMED CT kodierte Conditions werden erkannt, sodass ein fremdes Bundle importiert, was es kann.
- 🧬 **SNOMED CT für den gesamten Diagnosekatalog.** 48 der 50 Einträge tragen jetzt ein verifiziertes SNOMED-CT-International-Konzept (aktiv, im Core-Modul, mit passender FSN). Zwei bleiben bewusst unbesetzt, weil SNOMED International kein Oberbegriffskonzept dafür hat: Kieferanomalie (K07.0) und dentofaziale Funktionsstörungen (K07.5). Das SNOMED-Overlay bleibt in den Einstellungen optional.
- 📦 **Ein ladbares FHIR-Terminologiepaket.** Der Ordner `fhir/` im Repository ist ein FHIR-NPM-Paket (`react-advanced-odontogram.fhir`, FHIR 4.0.1) mit dem Engine-CodeSystem sowie generierten ValueSets — je eines pro klinischer Achsen-Wertegruppe, eines für die Befundtypen und ein Gesamtcode-Set. Einem Validator mit `-ig ./fhir` übergeben.
- 🧰 Vereinheitlichte Topbar-Icon-Leiste mit einem tabbasierten Einstellungsdialog (Allgemein / Panels / Zahndetails / Karies / Pulpa / Notizen / Parodontal — Nummerierung, Notizen, Panel-Sichtbarkeit, ICDAS, Kariestiefe-Umschalter, Wurzel-/Radiologische-Karies-Granularität, Pulpa-Detailstufe, Zahnabrieb-/Verfärbungs-Detailstufe, Zahninformationen)
- 🗂️ Einstellungen → Tab „Panels": Ganzmund-Zusammenfassungspanels für Status und Kieferorthopädie unabhängig ein-/ausblenden
- 🦷🩺 Einstellungen → Tab „Parodontal": 16 Ein-/Ausblend-Umschalter pro Index für die Zeilen des Parodontalstatus-Charts (gruppiert nach Tasche/Hygiene/Mukogingival/Halt/Periimplantär — PD/GM/CAL/BOP, Plaque, PI, GI, CEJ-Sichtbarkeit, Wurzelkonkavität, KG, GT, Furkation, Mobilität, Miller-Klasse, mPI, mBI), jeweils mit einer Beschreibung, sowie eine Option für übersetzte vs. kanonische Indexnamen-Anzeige (kanonisch = ein fester englisch-lateinischer wissenschaftlicher Name in jeder UI-Sprache; Tooltips bleiben unabhängig von dieser Einstellung stets lokalisiert). Beide sind App-weite Einstellungen (wie `perioViewMode`) — nie Teil des Export-Payloads
- 🩹 Die Sekundärkaries-(CARS-)Einstellungen wurden in den Karies-Tab der Einstellungen zusammengeführt, oberhalb der radiologischen Tiefe positioniert (der separate „Sekundärkaries"-Tab entfällt)
- 🎚️ Zahndetails-Detailstufe (Einstellungen → Zahndetails): eine einfache/komplexe Einstellung für Zahnabrieb und für Verfärbung. Der einfache Modus zeigt pro Befund einen Ja/Nein-Umschalter (Abrieb an → Attrition/Abrasion, Verfärbung an → Sonstige); der komplexe Modus (Standard) behält die Typ-/Ursache-Dropdowns bei, und der gespeicherte Wert bleibt beim Wechsel der Stufe erhalten
- 📋 Zahninformationen-Panel: textuelle Live-Zusammenfassung des gesamten Befunds (Zahnzahlen, vorhandene/fehlende Zähne, Karies inkl. Sekundärkaries, Füllungen, Wurzelbehandlungen, Zahnersatz, Implantate, Parodontalstatus) — standardmäßig sichtbar, in den Einstellungen umschaltbar
- 🗂️ Konsolidiertes Export-Dropdown (Status JSON / FHIR / PNG / JPG)
- 📥 Import-Dropdown mit FHIR-Import (liest exportierte Bundles zurück)
- ⏳ Fortschrittsanzeige beim Bildexport
- 🎓 18-stufige interaktive Einführungstour
- 🔢 Drei Nummerierungssysteme (FDI, Universal, Palmer)
- 🌐 I18n — 12 UI-Sprachen (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) mit Sprachumschalter; Arabisch stellt die Oberfläche von rechts nach links dar, wobei die Zahn-/Parodontalstatus-Charts von links nach rechts fixiert bleiben (AR/ZH/FR sind maschinell übersetzt, muttersprachliche Überprüfung ausstehend); nur Englisch ist im Hauptbundle enthalten — jede andere Sprache ist ein eigener Chunk, der bei der ersten Auswahl nachgeladen wird
- 🌗 Dunkler Modus mit Umschalt-Button (eigenständig oder von der übergeordneten App gesteuert)
- 🎨 Benutzerdefinierte Theme-Konfiguration (`themeConfig`-Prop) mit CSS Custom Properties (`--odon-*`)
- 📱 Mobile Touch-UX: Tap-to-Zoom-Popover, Langes-Drücken-Kontextmenü, Pinch-to-Zoom, WCAG 44px Berührungsziele, Kieferbogen-Umschalter
- 🔌 Benutzerdefiniertes SVG-Plugin-System: visuelle Overlays, per-Zahn Custom State, JSON Export/Import-Unterstützung — die Rückgabe von `renderSvg()` eines Plugins wird vor dem Einfügen in den Live-Befund mit DOMPurify (SVG-Profil) bereinigt; Plugins laufen dennoch als vertrauenswürdiger Code, also nur Plugins aus vertrauenswürdigen Quellen einbinden
- 🛡️ Content-Security-Policy: Der Produktions-Build der Demo fügt ein CSP-Meta-Tag ein (der Dev-Server ist davon nicht betroffen) — Host-Apps, die die Komponente einbetten, sollten ihre eigene CSP setzen
- ⚠️ Statusvalidierung mit Warnungen bei inkompatiblen Zahnzustandskombinationen
- 🏷️ Automatische Status-Tooltips auf Zahnkacheln (zeigt alle aktiven Zustände)
- 🩺 Modernisierter Tooltip pro Zahn und Ganzmund-Zusammenfassungspanel: beide zeigen den vollständigen Satz klinischer Befunde (Pulpa-/apikale Diagnose + Läsionssubtyp, Wurzelresorption, periimplantärer Status, abgestufte Wurzelkaries, Zahnstein, Kronenrand-Undichtigkeit, Fraktur, Kontaktverlust, typisierter Kanten-/Zervikalabrieb), mit einem eigenen Abschnitt „Diagnosen" im Panel, einem eigenen Abschnitt „Abrieb" und einem groben Kariesschweregrad-Qualifikator (oberflächlich/mäßig/tief)
- ♿ Tastaturzugänglichkeit (WCAG): ARIA listbox/option Rollen, Enter/Leertaste Auswahl, Pfeiltasten-Navigation, focus-visible Umrisse
- 🔒 Schreibgeschützter Modus: alle Interaktionen deaktivieren für Druck-/Berichtsansichten
- ✨ Auswahl-Animationen: pulsierende gestrichelte Umrandung und leuchtender Schatten auf ausgewählten Zähnen (mit Unterstützung für prefers-reduced-motion)
- 📝 Per-Zahn Notizen: Doppelklick zum Hinzufügen/Bearbeiten, Notiz-Symbol neben der Zahnnummer, Hover-Tooltip mit Notiztext, eine „Individuelle Notizen"-Zeile im Ganzmund-Zusammenfassungspanel, Aufnahme in den PDF-Bericht, JSON Export/Import
- 🔀 Trennung Status- und Plan-Chart: ein `Status | Plan`-Umschalter im Diagramm-Header wechselt zwischen einem aktuellen **Status**-Chart und einem **Plan**-Chart (beabsichtigte Behandlung), jeweils mit eigenen Zahnzuständen; das Plan-Chart startet beim ersten Wechsel dorthin als Kopie des Status-Charts, und Änderungen in einem Chart wirken sich nie auf das andere aus. Export/Import (`exportStatus`/`exportFhir`/Datei-Import) beziehen sich immer auf das Status-Chart; das Plan-Chart wird über eine eigene API separat gelesen/geschrieben (siehe Öffentliche API weiter unten) und ist — sofern es vom Status abweicht — als zusätzlicher `plan`-Abschnitt im JSON-Export enthalten
- 📝 „Was ändert sich"-Box: sobald sich der Plan vom aktuellen Status unterscheidet, listet eine Box unterhalb des Zahninformationen-Panels jede Abweichung pro Zahn und pro Behandlungsachse (Vorhandensein, Substrat, Restauration, Prothetik, geplante Krone, Kieferorthopädie, Pulpa/Endo, apikal) als `Zahn: Achse  von → nach`-Zeile auf; auch programmatisch über `getPlanChanges()` verfügbar

![Parodontalstatus-Chart (Deutsch)](screenshot_de_perio.png)

- 🩺 Parodontale Erfassung: pro Messstelle **Sondierungstiefe**, **Gingivarand**, **Blutung bei Sondierung** (+ Suppuration) an den sechs Standardmessstellen je Zahn, mit abgeleitetem **klinischem Attachmentniveau (CAL = PD + Gingivarand)**, Rezession und Ganzmund-**%BOP**. Ein **grafisches Ganzmund-Parodontalstatus-Chart** — jeder Kieferbogen als **zwei separate bukkale/palatinale(linguale) SVGs** gezeichnet (unter Wiederverwendung der Zahngrafik mit einheitlicher Kronen-zum-Band-Ausrichtung auf beiden Seiten; eine **Implantatgrafik** für Implantatzähne) mit einer roten **CEJ-Linie**, einem **nummerierten Millimeter-Rasterraster** und einer **Gingivarand-/Taschentiefe-Kurve** über den Zähnen, unterteilt durch ein **zentrales Parodontal-Index-Band** (beschriftet mit `▲ Buccal … Lingual/Palatal ▼`), das die gemeinsamen Indizes pro Zahn trägt — **Miller-Klasse** ganz oben, sowie **Plaque/PI/GI/mPI/mBI**, dargestellt als **anatomische Rauten-Kachel** pro Zahn (bukkale Spitze oben, linguale Spitze unten, mesial/distal in der mittleren Reihe je nach Seite vertauscht, sodass mesial immer zur Zahnbogenmitte zeigt); die Zahlenreihen (vollständige Indexnamen — PD/GM/CAL/BOP + Mobilität + Furkation — in größeren, touch-freundlicheren Zellen) in Spalten ausgerichtet sowie eine Zusammenfassung (Ø PD/CAL, %BOP, PI%), mit **automatischem Tastatur-Weitersprung** bei der Eingabe; das Chart **skaliert dynamisch auf die verfügbare Breite** und ist bei jeder Fenstergröße responsiv. Dargestellt als `Odontogram | Periodontal Status`-**Ansichtsumschalter**, dessen rechtes Panel während dieser Ansicht zu einer **Parodontal-Kontext-Seitenleiste** umfunktioniert wird (Patientendaten, die Klassifikation nach 2017 und die Ganzmund-Zusammenfassung; eine Einstellungsoption schaltet die gesamte Darstellung stattdessen auf ein **Popup** um), und weiterhin eine **eigenständig aufrufbare Komponente** (`PerioChart`-Export), sodass eine Host-App das Parodontalstatus-Chart unabhängig vom Basis-Odontogramm aufrufen kann. Export pro Messstelle via **FHIR** über das LOINC-Parodontal-Panel (`74029-0`; PD `32910-2`, Rezession `32911-0`, CAL `32912-8`)
- 🅿️ Vorschlags-Darstellung: im Plan-Modus rendern Befunde, die der Plan **gegenüber** dem aktuellen Status **hinzufügt** (geplante Krone, Extraktion, kieferorthopädische Bewegung, Prothetik, …) mit einer unterscheidbaren **gestrichelten, eingefärbten „Vorschlags"-Umrandung**, damit der Plan als Absicht und nicht als Tatsache gelesen wird — mit einer „gestrichelt = vorgeschlagen"-Legende in der Diagramm-Karte. Die Darstellung im Status-Modus ist byte-identisch; die Behandlung existiert nur im Plan und wird beim Zurückwechseln vollständig zurückgesetzt
- 🚦 Plan-Modus-Gating: das Plan-Chart zeigt nur, was ein Zahnarzt *tun* kann — der Basis-Auswähler bietet nur Fehlend / Bleibend / Implantat, und reine Statusbefunde (Karies, Zahnabrieb, Verfärbung sowie der gesamte parodontale Block — Mobilität, sechs-Punkte-Sondierungsraster, Entzündungs-/parodontale Modifikatoren, Zahnstein, periimplantärer Status) sind ausgeblendet; die Pulpa-/Endo-Steuerung behält die endodontische **Behandlung** (Wurzelkanal / Stift / Wurzelspitzenresektion / parapulpaler Stift) bei, während die Pulpa-/apikale **Diagnose** und die Wurzelresorption ausgeblendet werden. Restauration, Prothetik, Kieferorthopädie, Kronenbedarf/-wechsel und Extraktionsplan bleiben weiterhin planbar
- 🧪 Eine umfangreiche automatisierte Vitest-Testsuite für Nummerierung, Übersetzungen, Vorlagen, i18n, App-Komponente, Theme, Touch, Plugins, Barrierefreiheit sowie Parität der klinischen Diagnose-/Befund-Achsen
- 📖 TypeDoc API-Dokumentation mit JSDoc-Kommentaren für alle öffentlichen Exporte (`npm run docs`)

### 📦 Module
- 🦷 Odontogramm-Raster und Zahngitter-UI
- 🎛️ Steuerung und Statuspanel
- 🎨 SVG-Schichtungsmotor und Vorlagen
- 🔢 Zahnnummerierung und Beschriftung (FDI/Universal/Palmer)
- 🌐 Lokalisierung — 12 UI-Sprachen (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), einschließlich Arabisch (RTL)
- 💾 Status-Export/Import
- 📋 Status-Extras: vordefinierte Restaurationsvorlagen
- 🎨 Theme-Konfiguration: anpassbare Farbpalette über `--odon-*` CSS-Eigenschaften
- 📱 Mobile Touch-Interaktionen (Tap-to-Zoom, Langes Drücken, Pinch-to-Zoom, Kieferbogen-Umschalter)
- 🔌 Benutzerdefiniertes SVG-Plugin-System
- ⚠️ Statusvalidierung und Tooltip-System
- ♿ Tastaturzugänglichkeit und ARIA-Unterstützung
- 🔒 Schreibgeschützter Modus
- ✨ Auswahl-Animationen
- 📝 Per-Zahn Notizen
- 🧪 Automatisierte Testsuite (Vitest + Testing Library)

### 🛠️ UI-Steuerung

**🔝 Kopfleiste:**
- Sprachumschalter (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR Dropdown)
- Dunkelmodus-Umschalter (Sonnen-/Mond-Symbol, wechselt zwischen hellem und dunklem Thema)
- Nummerierungssystem-Umschalter (FDI/Universal/Palmer Dropdown)
- Status exportieren / Status importieren Buttons

**📊 Diagramm-Kopfzeile:**
- Okklusionsansicht-Umschalter
- Weisheitszahn-Sichtbarkeit-Umschalter
- Knochen-Sichtbarkeit-Umschalter
- Pulpa-Sichtbarkeit-Umschalter
- Auswahl löschen Button

**🔍 Auswahlfilter:**
- Alle auswählen / Alle vorhandenen / Bleibende / Milch / Implantate / Alle fehlenden
- Oberkiefer / Oberkiefer Front 6 / Oberkiefer Molaren
- Unterkiefer / Unterkiefer Front 6 / Unterkiefer Molaren

**📋 Statusvorlagen:**
- Alles zurücksetzen (Mund zurücksetzen)
- Milchgebiss
- Wechselgebiss
- Zahnlos-Umschalter

**📦 Status-Extras Dropdown:**
- Obere/Untere Zirkon-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Obere/Untere Metall-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Obere/Untere Teilprothesen
- Obere/Untere Totalprothesen
- Obere/Untere Stegprothesen mit Implantaten

**🦷 Zahn-Editor-Panel** (für den/die ausgewählten Zahn/Zähne, in ausklappbare Karten gruppiert):
- **Basis-Zeile:** Zahnauswahl (Basistyp inkl. Varianten mit gebrochener Krone) und Zahnsubstrat (natürlich/Radix/frakturiert/crownprep)
- **Restaurations-Zeile:** das kombinierte „Fix: …"/„Kivehető: …"-Restaurations-Dropdown (feste `restorationType`×`restorationMaterial`-Optionen plus die `prosthesis`-Attachment-/Herausnehmbar-Optionen, gestaffelt nach Zahnart); Kronenrand-Undichtigkeits-Checkbox (nur Krone/Brücke); Checkboxen für die Lage der gebrochenen Krone; Umschalter „Krone erforderlich"/„Kronenwechsel erforderlich"
- **Abrieb- und Verfärbungs-Zeile:** Dropdown für inzisalen/okklusalen Abriebtyp, Dropdown für zervikalen Abriebtyp, Dropdown für Verfärbungsursache (jedes wechselt unter Einstellungen → Zahndetails → einfacher Modus zu einem einfachen Ja/Nein-Umschalter)
- **Kieferorthopädie-Karte:** Apparatur, mesiale/distale Drift, vertikale Bewegung (Extrusion/Intrusion), Rotations-Umschalter — angezeigt bei einem vorhandenen natürlichen Zahn
- **Karies-Karte:** Dropdown für den Kariestiefe-Modus, Subkronal-Karies-Checkbox, Dropdown für den Wurzelkaries-Schweregrad sowie der B/M/O/D/L-Flächenauswähler für Karies mit einem kontextabhängigen ICDAS-Tiefe-/CARS-Popup und einem Badge für die radiologische Tiefe
- **Füllungen-Karte:** Dropdown für das Füllungsmaterial, Flächenauswähler für Füllungen (mit Material pro Fläche), Flächenindikator für Füllungsdefekte (marginal/Fraktur/Abrieb), Hinweise zu Sekundärkaries und Füllungsdefekten
- **Wurzel-und-Parodontium-Karte:** zusammengeführter „Pulpa-/Endo-Status"-Auswähler, Auswähler für apikale Diagnose, Auswähler für periapikalen Läsionssubtyp (nur symptomatische/asymptomatische apikale Parodontitis), Auswähler für den Wurzelresorptionstyp, Auswähler für den Mobilitätsgrad, Auswähler für den periimplantären Status (nur Implantate)
- **Spezielle Indikatoren:** Extraktionsplan/-wunde, Lücke geschlossen, Fissurenversiegelung, Kontaktpunktverlust, Zahnstein, parapulpaler Stift, Endo-Resektion, Brückenpfeiler

### 🦷 Zahntypen und Zustände

**Zahnauswahl (Basistyp):**
| Wert | Beschreibung |
|---|---|
| `none` | Fehlender Zahn |
| `tooth-base` | Bleibender Zahn |
| `milktooth` | Milchzahn |
| `implant` | Zahnimplantat |
| `tooth-under-gum` | Subgingivaler (nicht durchgebrochener) Zahn |

**Gebrochene Zahnvarianten:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Zahnsubstrat (bleibende Zähne):**
`natural` (Standard), `radix` (Wurzelrest), `broken`, `crownprep` (für Krone präpariert)

**Restaurationstyp (bleibende Zähne):**
`none`, `crown`, `inlay`, `onlay` (nur okklusale Ansicht), `veneer`, `bridge`

**Restaurationsmaterial (bleibende Zähne):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (bestehende `metal`-Kronen migrieren hierher), `telescope`, `temporary`

**Restaurationsoptionen sind nach Zahnart gestaffelt** (`restorationOptions()` in `src/registry/restorations.ts`): ein Implantat bietet nur die Restaurationstypen `crown`/`bridge` (kombiniert mit einer Implantat-Verbinder-Ebene) plus die fünf `prosthesis`-Attachment-Einträge unten; ein fehlender/Lücken-Zahn bietet nur ein `bridge`-Brückenglied plus die zwei herausnehmbaren `prosthesis`-Prothesen-Einträge; ein `radix`-Substrat blendet die Restaurationssteuerung vollständig aus. Die alten flachen Felder `crownMaterial`/`bridgeUnit` (Implantat-/Brücken-Attachment-Werte vor v1.14) sind aus dem aktiven Modell entfernt — sie werden nur noch als schreibgeschützter Migrationspfad für alte Payloads akzeptiert.

**Prothetik** (`prosthesis`; eigenständige herausnehmbare/Attachment-Achse, als „Kivehető:"-Einträge im kombinierten Restaurations-Dropdown dargestellt):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (Implantat-Attachments, mit oder ohne Suprakonstruktion), `removable-partial`, `removable-full` (zahngetragene Prothesen an einem fehlenden/Lücken-Zahn). Ein Zahn hat entweder eine feste Restauration oder eine Prothetik, nie beides — das Setzen des einen löscht das andere.

**Kronenrand-Undichtigkeit** (`crownLeakage`; boolean): nur sichtbar, wenn `restorationType` gleich `crown` oder `bridge` ist; aktiviert die `crown-leakage`-Bildebene.

**Endodontische Optionen (bleibende Zähne):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontische Optionen (Milchzähne):**
`none`, `endo-medical-filling`

`endo` und `pulpDx` werden über ein zusammengeführtes „Pulpa-/Endo-Status"-`<select>` dargestellt (gruppiert: vitale Pulpa vs. behandelt/endodontisch) und schließen sich gegenseitig aus — die Wahl einer behandelten Option (`endo != none`) setzt `pulpDx` auf `normal` zurück, und die Wahl einer Pulpadiagnose setzt `endo` auf `none` zurück.

**Füllungsmaterialien (bleibende Zähne):**
`amalgam`, `composite`, `gic`, `temporary`

**Füllungsmaterialien (Milchzähne):**
`composite`, `gic`, `temporary`

**Füllungs-/Kariesflächen:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (nur Karies)

**Modifikationen:**
`inflammation` (periapikale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Periapikaler Läsionstyp** (`periapicalType`; qualifiziert den periapikalen Glyphen, nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt):
`none`, `granuloma`, `cyst` — Erfassungsoptionen; der alte Wert `abscess` wird weiterhin akzeptiert/gespeichert, aber im Auswähler nicht mehr angeboten, da er die apikale Diagnose dupliziert. Beim Import wird er verworfen: bei einem Zahn mit dem Entzündungs-Modifikator in `apicalDx` eingefaltet, andernfalls auf `none` zurückgesetzt

**Pulpadiagnose** (AAE-Terminologie; `pulpDx`):
`normal`, `reversible-pulpitis` (rendert ein reduziertes Pulpa-Glyph), `irreversible-pulpitis`, `necrosis` — schließt sich gegenseitig mit `endo` aus; wird bei einem wurzelbehandelten Zahn auf `normal` normalisiert

**Pulpadiagnose, praktisches Latein** (`pulpLatin`; wird vom Pulpa-Auswähler nur angezeigt, wenn `pulpDetailLevel` gleich `latin` ist):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa-Detailstufe** (`pulpDetailLevel`, globale Einstellung): `simple`, `aae` (Standard), `latin` — steuert, welches Pulpa-Vokabular der Auswähler anbietet

**Apikale Diagnose** (`apicalDx`; steuert den periapikalen Glyphen):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Wurzelresorptionstyp** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Periimplantärer Status** (`periImplant`; nur Implantate, Staging nach dem World Workshop 2018): `mucositis` verwendet das parodontale Zahnfleisch-Glyph weiter; `peri-implantitis-*` fügt die `peri-implant-bone-loss`-Ebene mit schweregradabhängiger Deckkraft hinzu (leicht 0,4 / mäßig 0,7 / schwer 1,0). Implantate rendern das periapikale Läsions-Glyph nicht mehr (ihre Entzündung wird stattdessen über diese Achse ausgedrückt), und die `mods`-Checkboxen für Entzündung/parodontal sind bei Implantaten ausgeblendet:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Kariesschweregrad** (`cariesSeverity`; vereinheitlichtes Feld pro Fläche, `0`–`6`): auf einer Fläche ohne Füllung wird er als ICDAS-Kariestiefenskala gelesen (`superficial` / `dentin` / `deep`, oder die rohen ICDAS-II-Codes `0–6` bei aktiviertem `enableIcdas`) und steuert die primäre `caries-{surface}`-Ebene; auf einer Fläche mit Füllung wird er als benannter CARS-Score gelesen (`0` gesund … `6` ausgedehnte Kavität) und steuert stattdessen die `subcaries-{surface}`-Ebene (Sekundärkaries) — eine Fläche ist nie gleichzeitig primär und rezidivierend

**Wurzelkaries** (`rootCaries`; steuert die `caries-root`-Bildebene bei einem vorhandenen Zahn, Deckkraft abhängig vom Schweregrad — `active` 0,5 / `arrested` 0,7 / `active-cavitated` volle Deckkraft):
`none`, `active`, `arrested`, `active-cavitated`

**Radiologische Kariestiefe** (`radiographicDepth`; pro Fläche, unabhängig von der visuellen ICDAS-/CARS-Skala `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Karies-Granularitätseinstellungen** (global): `secondaryCariesMode` (`simple`/`standard`/`full`, Standard `standard`), `rootCariesMode` (`simple`/`severity`, Standard `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, Standard `off`), `cariesDepthEnabled` (boolean, Standard `true`) — jede reduziert ihre Skala auf eine einfachere Auswahlansicht, ohne den gespeicherten Wert zu verändern

**Spezielle Indikatoren:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Zahnabrieb** (`wearEdge`, `wearCervical`; klinischer Typ je Lokalisation, gestaffelt auf Zahnbasis + keine Restauration + natürliches Substrat; rendert die bestehenden `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`-Ebenen):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Verfärbung** (`discoloration`; Ursache pro Zahn, gestaffelt auf einen natürlichen Zahn (bleibend) oder Milchzahn + keine Restauration + natürliches Substrat; färbt die Füllfarbe der dargestellten natürlichen Zahnkrone ein — keine neue SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Füllungsdefekt** (`fillingDefect`; pro Fläche, Befund an direkten Restaurationen unabhängig von Sekundärkaries — gestaffelt auf die in `fillingSurfaceMaterials` vorhandenen Flächen; rendert die `defect-{surface}`-Bildebene):
`none`, `marginal`, `fracture`, `wear`

**Kieferorthopädie** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; pro Zahn, gestaffelt auf einen vorhandenen natürlichen Zahn — bleibend oder Milchzahn):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (Pfeil-nach-oben-Glyph), `intrusion` (Pfeil-nach-unten-Glyph) — `orthoRotation`: boolean

**Zahndetail-/Notationseinstellungen** (globale Sitzungseinstellungen, Einstellungen → Zahndetails): `wearDetailLevel` und `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, Standard `complex` — der einfache Modus zeigt statt des vollständigen Typ-/Ursache-Dropdowns einen Ja/Nein-Umschalter, ohne den gespeicherten Wert zu verändern) sowie `surfaceNotation` (`simple`/`full`, Standard `full` — steuert, ob Kariologie-/Füllungs-Flächenbuchstaben/-bezeichnungen positionsbewusst sind; siehe „Positionsbewusste Flächenbezeichnung" oben)

### ⚙️ Einstellungen
Wird über das Zahnrad-Symbol in der Kopfleiste geöffnet; ein fokus-gefangener, ARIA-`dialog` mit tabbasiertem Layout (Esc/Klick auf den Hintergrund zum Schließen, Pfeiltasten zum Wechseln der Tabs). Alle Einstellungen sind, sofern nicht anders angegeben, reiner Sitzungs-UI-Zustand — keine davon verändert Pro-Zahn-Daten oder den Export-Payload.

- **Allgemein:** Nummerierungssystem (FDI/Universal/Palmer), Sprache, dunkles/helles Theme, Sichtbarkeit des Zahninformationen-Panels
- **Odontogramm:** Zahnanatomie-Profil (`classic` Standard / `measured`) — `measured` rendert neun literaturvermessene Zahnvorlagen in einem Zwei-Kiefer-Layout mit zahnindividueller Breite; zur Laufzeit umschaltbar, ohne Auswirkung auf den `classic`-Standard; seine Grafik ist ein eigener Chunk, der erst beim Umschalten geladen wird, sodass der `classic`-Standard nichts kostet
- **Panels:** Ganzmund-Statuskarte und Kieferorthopädie-Karte unabhängig ein-/ausblenden (beide standardmäßig sichtbar)
- **Zahndetails:** Abrieb-Detailstufe und Verfärbungs-Detailstufe (einfach/komplex, jeweils Standard komplex), Flächenbezeichnung (einfach/vollständig, Standard vollständig)
- **Karies:** ICDAS-II-Scoring-Umschalter (`enableIcdas`), Kariestiefe-Umschalter (`cariesDepthEnabled`), Wurzelkaries-Granularität (`rootCariesMode`: simple/severity), Sekundärkaries-/CARS-Granularität (`secondaryCariesMode`: simple/standard/full), Granularität der radiologischen Tiefe (`radiographicDepthMode`: off/threeLevel/detailed) — der frühere separate „Sekundärkaries"-Tab ist in diesen zusammengeführt, wobei die CARS-Steuerung direkt oberhalb der radiologischen Tiefe positioniert ist
- **Pulpa:** Pulpa-Detailstufe (`pulpDetailLevel`: simple/AAE/praktisches Latein, Standard AAE) — steuert, welches Vokabular der „Pulpa-/Endo-Status"-Auswähler anbietet; eine Änderung aktualisiert die Ganzmund-Zusammenfassung und jeden geöffneten Tooltip live
- **Notizen:** Per-Zahn-Notizen aktivieren/deaktivieren (`enableNotes`)
- **Parodontal:** Ein-/Ausblend-Umschalter pro Index für alle 16 Zeilen des Parodontalstatus-Charts (`perioRowVisibility`, Standard alle sichtbar), gruppiert nach Tasche (PD/GM/CAL/BOP) / Hygiene (Plaque/PI/GI) / Mukogingival (CEJ-Sichtbarkeit/Wurzelkonkavität/KG/GT) / Halt (Furkation/Mobilität/Miller-Klasse) / Periimplantär (mPI/mBI), jede Zeile mit eigener Beschreibung; zusätzlich ein Modus für übersetzte vs. kanonische Indexnamen (`perioIndexNameMode`: `translated` Standard / `canonical` — ein fester englisch-lateinischer wissenschaftlicher Name, angezeigt in jeder UI-Sprache). Nur App-weite Einstellungen (spiegelt `perioViewMode`) — werden nie serialisiert, Tooltips bleiben in beiden Modi lokalisiert

### 🖼️ SVG-Vorlagensystem

**Zahnvorlagen** (in `src/assets/teeth-svgs/`):
| Vorlage | Verwendende Zähne |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (Schneidezähne) |
| `13.svg` | 13, 23, 33, 43 (Eckzähne) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (Prämolaren) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (Molaren) |

Vorlagen werden für den Unterkiefer um 180 Grad gedreht und für die linke Seite horizontal gespiegelt.

**Icon-SVGs** (in `src/assets/icon-svgs/`):
`icon_8.svg` (Weisheitszahn), `icon_gum.svg` (Knochen), `icon_no_selection.svg` (Auswahl löschen), `icon_occl.svg` (Okklusionsansicht), `icon_pulp.svg` (Pulpa)

### 🔢 Nummerierungssysteme

**FDI (ISO 3950):** Erwachsenenzähne 11-18, 21-28, 31-38, 41-48. Milchzähne 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Erwachsenenzähne nummeriert 1-32. Milchzähne mit Buchstaben A-T.

**Palmer (Zsigmondy-Palmer):** Quadrant + Positionsformat (z. B. UR-1, LL-5). Milchzähne verwenden Buchstaben A-E pro Quadrant.

### 🚀 Verwendung
Entwicklung:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Vorschau:
```bash
npm run preview
```

### 🔗 Integration
Die Komponente kann in jede React-App eingebettet werden.
Beispiel:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="de"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Dunkelmodus-Integration:**
- **Eigenständiger Modus:** `darkMode`-Prop weglassen — die Komponente verwaltet ihren eigenen Theme-Zustand über den Umschalter in der Kopfleiste und fügt die `.dark`-Klasse auf `<html>` hinzu bzw. entfernt sie.
- **Gesteuerter Modus:** `darkMode` und `onDarkModeChange` übergeben — die übergeordnete App steuert das Theme. Der Umschalter erscheint weiterhin, ruft aber `onDarkModeChange` auf, anstatt den internen Zustand zu verwalten. Die übergeordnete App ist für das Hinzufügen/Entfernen der `.dark`-Klasse auf `<html>` verantwortlich.

**Benutzerdefiniertes Theme:**
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

**Plugin-Integration:**
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

// Plugin-Zustand für einen Zahn setzen:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Tests
```bash
npm run test           # Die umfangreiche automatisierte Vitest-Testsuite ausführen
npm run test:watch     # Watch-Modus
npm run test:coverage  # Coverage-Bericht
```

### 📖 API-Dokumentation

🅰️ **Angular-Version:** ein offizieller Angular-Port, [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` auf npm), ist verfügbar — JSON- und FHIR-R4-Exporte lassen sich zwischen beiden Bibliotheken hin- und herübertragen.

```bash
npm run docs           # TypeDoc-Dokumentation in docs/ generieren
```

### 📡 Öffentliche API

**Komponenten-Props:**

| Prop | Typ | Standard | Beschreibung |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI-Sprache (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback bei Sprachänderung |
| `numberingSystem` | `string` | `'FDI'` | Nummerierungssystem (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback bei Nummerierungsänderung |
| `darkMode` | `boolean` | `undefined` | Dunkelmodus-Zustand. Weglassen für eigenständigen Modus. |
| `onDarkModeChange` | `(dark) => void` | — | Callback beim Umschalten des Dunkelmodus. Erforderlich für gesteuerten Modus. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Benutzerdefinierte Farbüberschreibungen über CSS Custom Properties (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Benutzerdefinierte SVG-Plugins für visuelle Overlays und per-Zahn Custom State. |
| `readOnly` | `boolean` | `undefined` | Alle Interaktionen deaktivieren (Klick, Touch, Tastatur). Nützlich für Druck-/Berichtsansichten. |
| `enableNotes` | `boolean` | `undefined` | Per-Zahn Notizen aktivieren. Doppelklick auf einen Zahn zum Hinzufügen/Bearbeiten. |

**Exportierte Funktionen zur externen Steuerung:**

| Funktion | Beschreibung |
|---|---|
| `initOdontogram()` | Motor initialisieren und alle Zähne rendern |
| `destroyOdontogram()` | Motor aufräumen und Ereignisbehandler entfernen |
| `setNumberingSystem(system)` | Zwischen FDI, Universal, Palmer wechseln |
| `clearSelection()` | Alle Zähne abwählen |
| `getSelectedTeeth()` | Aktuell ausgewählte Zähne (FDI-Nummern), in Auswahlreihenfolge |
| `setOcclusalVisible(on)` | Okklusionsansicht ein-/ausschalten |
| `setWisdomVisible(on)` | Weisheitszähne anzeigen/verbergen |
| `setShowBase(on)` | Knochenschicht anzeigen/verbergen |
| `setHealthyPulpVisible(on)` | Gesunde Pulpa anzeigen/verbergen |
| `registerPlugins(plugins)` | Benutzerdefinierte SVG-Plugins registrieren |
| `setPluginState(toothNo, pluginId, value)` | Plugin Custom State für einen Zahn setzen |
| `getPluginState(toothNo, pluginId)` | Plugin Custom State eines Zahns abrufen |
| `getToothStateSummary(toothNo)` | Lokalisierte Zusammenfassung aller aktiven Zustände eines Zahns abrufen |
| `getOdontogramSummary()` | Strukturierte, lokalisierte Textzusammenfassung des gesamten Befunds abrufen (Zählungen, Abschnitte) |
| `onStateChange(callback)` | Auf Zustandsänderungen abonnieren; gibt eine Abmeldefunktion zurück |
| `setReadOnly(value)` | Schreibgeschützten Modus aktivieren/deaktivieren |
| `getReadOnly()` | Aktuellen Schreibgeschützt-Zustand abrufen |
| `setNotesEnabled(value)` | Per-Zahn Notizen aktivieren/deaktivieren |
| `getNotesEnabled()` | Aktuellen Notizen-Status abrufen |
| `setPulpDetailLevel(level)` | Vokabular des Pulpa-Auswählers festlegen — `"simple"`, `"aae"` oder `"latin"` |
| `getPulpDetailLevel()` | Aktuelle Pulpa-Detailstufe abrufen |
| `getChartMode()` | Das aktuell aktive Chart abrufen — `"status"` oder `"plan"` |
| `setChartMode(mode)` | Das aktive Chart auf `"status"` oder `"plan"` umschalten; das Plan-Chart wird beim ersten Betreten als Tiefenkopie des Status-Charts erstellt |
| `getStatusChart()` | Das Payload des Status-Charts abrufen (`{version, globals, teeth}`), unabhängig davon, welches Chart gerade aktiv ist |
| `getPlanChart()` | Das Payload des Plan-Charts abrufen (`{version, globals, teeth}`), unabhängig davon, welches Chart gerade aktiv ist |
| `setPlanChart(payload)` | Die Zähne des Plan-Charts aus einem Payload ersetzen (der Status bleibt unangetastet); markiert das Plan-Chart als initialisiert |
| `getPlanChanges()` | Den strukturierten Status→Plan-Diff abrufen (`{ toothNo, axis, from, to }[]`) — ein Eintrag pro Zahn und pro Behandlungsachse, die sich zwischen Status- und Plan-Chart unterscheidet; leer, wenn kein Plan existiert. Auch auf `getOdontogramSummary()` als `plannedChanges` verfügbar |
| `setPerioSite(toothNo, site, patch)` | Parodontale Daten für eine der sechs Messstellen setzen (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` null/`<1` löscht die Messstelle wieder aus der Erfassung. Validiert + begrenzt (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Den parodontalen Datensatz eines Zahns pro Messstelle abrufen (nur erfasste Messstellen) |
| `getToothCal(toothNo)` | Das abgeleitete CAL pro Messstelle (`pd + Gingivarand`) für einen Zahn abrufen |
| `getPerioSummary()` | Ganzmund-parodontale Kennzahlen: Anzahl erfasster Messstellen, Anzahl blutender Stellen, %BOP, schlechtestes CAL, maximale PD |
| `getPerioChart()` | Die parodontalen Datensätze pro Zahn des aktiven Charts abrufen |
| `PerioChart` | React-Komponente (benannter Export) — das Ganzmund-Parodontalstatus-Chart-Overlay (`{ open, onClose }`), unabhängig von `OdontogramShell` einbindbar für die Host-Integration |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Das Parodontalstatus-Chart-Overlay programmgesteuert öffnen/schließen/abfragen — erlaubt einer Host-App, das Parodontalstatus-Chart getrennt vom Basis-Odontogramm aufzurufen (gemeinsamer Fall-Zustand) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Abrufen/Setzen, wie das Parodontalstatus-Chart dargestellt wird — `"toggle"` (ein `Odontogram \| Dental Chart`-Ansichtsumschalter, Standard) oder `"popup"` (das Overlay) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Das Hervorhebungs-Overlay des Dental Chart abrufen/setzen — `"none"` (Standard) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; färbt die Zähne nach diesem Maß neu ein (rein darstellend, über den vorhandenen Daten) |
| `getToothRecessionType(toothNo)` | Den abgeleiteten **Cairo-Rezessionstyp** abrufen — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (berechnet aus dem interproximalen vs. bukkalen CAL des Zahns) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | CEJ-Sichtbarkeit pro Zahn — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Wurzeloberflächen-Konkavität pro Zahn — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Silness-Löe-Plaque-Index-Grad pro Fläche — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Löe-Silness-Gingiva-Index-Grad pro Fläche — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Breite der bukkalen keratinisierten Gingiva pro Zahn in mm — `0`-`15`, oder `null`, falls nicht erfasst |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Gingivadicke-Phänotyp pro Zahn — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Miller-Rezessionsklasse pro Zahn — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Nur Implantate — Mombelli modifizierter Plaque-Index (mPI) pro Fläche — `0`-`3`; wirkungslos an einem Nicht-Implantatzahn |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Nur Implantate — Mombelli modifizierter Sulkus-Blutungs-Index (mBI) pro Fläche — `0`-`3`; wirkungslos an einem Nicht-Implantatzahn |
| `furcationEntrances(toothNo)` | Die Furkationseingänge eines Zahns — `["mesial","distal","buccal"]` (obere Molaren), `["buccal","lingual"]` (untere Molaren), `["mesial","distal"]` (obere erste Prämolaren), sonst `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Furkationsbeteiligung pro Eingang setzen/abrufen (Glickman `1`–`4`; `null` löscht) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | O'Leary-Plaquevorkommen pro Fläche setzen/abrufen (mesial/distal/bukkal/lingual); speist die Ganzmund-PI% in `getPerioSummary()` |
| `getCaseMeta()` | Das fallbezogene Metadaten-Objekt abrufen (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — ein einziger gemeinsamer Block, nicht pro Zahn/dual-state (spiegelt den obersten `globals`-Payload-Schlüssel); speist die parodontale Staging-/Grading-Klassifikation und die PDF-Berichtskopfzeile |
| `setPatientName(v)` | Den Patientennamen des Falls setzen (getrimmt; leerer String oder `null` löscht ihn) — nur Identität, fließt nie in die parodontale Ableitung ein |
| `setPatientDob(v)` | Das Geburtsdatum des Patienten im Fall setzen (`YYYY-MM-DD`; ungültig/leer löscht es) — nur für die PDF-Berichts-Identität |
| `setExamDate(v)` | Das Untersuchungsdatum des Falls setzen (`YYYY-MM-DD`; ungültig/leer löscht es) |
| `setCaseAge(v)` | Das Patientenalter des Falls in Jahren setzen — `0`-`120`, oder `null` zum Löschen |
| `setSmokingStatus(v)` | Den Raucherstatus des Falls setzen — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Zigaretten/Tag setzen (nur relevant, wenn der Raucherstatus `"current"` ist) — `0`-`99`, oder `null` zum Löschen |
| `setDiabetesStatus(v)` | Den Diabetesstatus des Falls setzen — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | HbA1c % setzen (nur relevant, wenn der Diabetesstatus `"present"` ist) — `3.0`-`20.0` (eine Nachkommastelle), oder `null` zum Löschen |
| `setToothLossPerio(v)` | Durch Parodontitis verlorene Zähne setzen — `0`-`32`, oder `null` zum Löschen |
| `setMaxRblPercent(v)` | Maximalen radiologischen Knochenverlust % setzen — `0`-`100`, oder `null` zum Löschen |
| `resetCaseMeta()` | Das fallbezogene Metadaten-Objekt auf seine leeren Standardwerte zurücksetzen |
| `getPerioClassification()` | Die parodontale Klassifikation nach dem World Workshop 2017 abrufen (`{diagnosis, stage, grade, extent, derived, overridden}`) — Diagnose/Stadium/Grad/Ausdehnung werden aus den erfassten parodontalen Daten und den Fall-Metadaten abgeleitet, wobei jede Achse durch eine klinische Übersteuerung ersetzt wird, sobald diese gesetzt ist (`derived` liefert immer die unveränderten berechneten Werte, `overridden` markiert, welche Achsen übersteuert wurden) |
| `setDiagnosisOverride(v)` | Die abgeleitete parodontale Diagnose übersteuern — `"health"` / `"gingivitis"` / `"periodontitis"`, oder `null` zum Löschen (zurück zum abgeleiteten Wert) |
| `setStageOverride(v)` | Das abgeleitete parodontale Stadium übersteuern — `"I"` / `"II"` / `"III"` / `"IV"`, oder `null` zum Löschen (zurück zum abgeleiteten Wert) |
| `setGradeOverride(v)` | Den abgeleiteten parodontalen Grad übersteuern — `"A"` / `"B"` / `"C"`, oder `null` zum Löschen (zurück zum abgeleiteten Wert) |
| `setExtentOverride(v)` | Die abgeleitete parodontale Ausdehnung übersteuern — `"localized"` / `"generalized"` / `"molar-incisor"`, oder `null` zum Löschen (zurück zum abgeleiteten Wert) |
| `exportFhir(options?)` | Befund als HL7 FHIR R4 Collection-Bundle exportieren (JSON-Download). Optionale `{ subject }`-Referenz; sonst wird ein Platzhalter-Patient eingebettet |
| `exportImage(format)` | Befund als Bild herunterladen — `"png"` oder `"jpg"` |
| `exportSvg()` | Befund als skalierbares SVG (Vektor) herunterladen |
| `hasAnyPerioData()` | `true`, sofern irgendeine parodontale Achse irgendwo im Mund erfasst ist — steuert das automatische Überspringen beim Parodontal-Export und deaktiviert die Parodontal-Export-Menüpunkte bei einem leeren Chart |
| `exportPerioSvg()` | Das vollständige Parodontalstatus-Chart (Zahngrafiken + Zahlenreihen + Klassifikation nach 2017) als eigenständiges Vektor-SVG herunterladen, headless aus dem Zustand über `buildPerioSvg()` erstellt |
| `exportPerioImage(format)` | Das Parodontalstatus-Chart als gerastertes Bild herunterladen — `"png"` oder `"jpg"` |
| `exportPdf(opts)` | Einen jsPDF-nativen PDF-Bericht herunterladen (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, jeder Abschnitt optional) — Vektortext plus gerasterte Zahn-/Parodontalstatus-Chart-Bilder; der Abschnitt der individuellen Notizen wird automatisch übersprungen, wenn kein Zahn eine Notiz hat, und die beiden Parodontal-Abschnitte werden automatisch übersprungen, sobald `hasAnyPerioData()` `false` ist, unabhängig von `opts` |
| `importFhirBundle(input)` | Ein von diesem Modul erzeugtes FHIR-R4-Bundle importieren (Objekt oder JSON-String) |
| `setImportFormat(format)` | Parser für den nächsten Datei-Import festlegen — `"status"` oder `"fhir"` |
| `startIntroTour()` | Die 18-stufige interaktive Einführungstour starten |

### 💾 Zustandspersistenz (localStorage)

Opt-in `localStorage`-Persistenz für den Fallzustand des Odontogramms (`src/persistence.ts`, aus dem Paket-Einstiegspunkt re-exportiert). Standardmäßig deaktiviert — bestehende Integrationen sind nicht betroffen, solange eine Host-App sie nicht ausdrücklich aktiviert; der Aufruf sollte **nach** dem Mounten des Odontogramms erfolgen (die Wiederherstellung zeichnet das Live-DOM über `importStatus()` neu):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // Standard: "react-advanced-odontogram"
  includePlan: true,          // auch den Plan-Befund speichern; Standard: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Funktion | Beschreibung |
|---|---|
| `enablePersistence(options?)` | Stellt einen zuvor gespeicherten Fall (falls vorhanden) über `importStatus()` wieder her und speichert danach den Status-Befund bei jeder Zustandsänderung in `localStorage`. Idempotent — ein erneuter Aufruf ersetzt die vorherige Subscription/Optionen. **Muss nach dem Mounten des Odontogramms aufgerufen werden.** |
| `disablePersistence()` | Beendet die Persistenz; der gespeicherte Eintrag bleibt erhalten. |
| `clearPersistedState()` | Entfernt den gespeicherten Eintrag für den aktiven (oder Standard-)Schlüssel. |
| `isPersistenceEnabled()` | `true`, solange eine Zustandsänderungs-Subscription aktiv ist. |

**`PersistenceOptions`:**

| Feld | Typ | Standard | Beschreibung |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | Der `localStorage`-Schlüssel. |
| `includePlan` | `boolean` | `false` | Auch den Plan-Befund speichern (das `plan`-Feld des Payloads). |
| `onError` | `(err: Error) => void` | — | Wird bei jedem Speicher-/Parse-Fehler aufgerufen, statt `console.warn` zu nutzen. |

Hinweise: Ohne Aufruf von `enablePersistence()` wird nichts aus `localStorage` gelesen oder dorthin geschrieben; eine 4-MB-Größenbeschränkung überspringt ein zu großes Speichern (gemeldet über `onError`/`console.warn`), statt eine Exception auszulösen; jeder Speicher-/JSON-Fehler — Kontingent überschritten, ein abgeschottetes iframe, beschädigte oder unbekannte gespeicherte Daten usw. — wird abgefangen und gemeldet. Dieses Modul löst nie eine Exception aus.

Hinweis: Das Aktivieren der Persistenz stellt den gespeicherten Fall über `importStatus()` wieder her, wodurch der aktuelle Fall ersetzt wird — einschließlich eines laufenden Plan-Befunds, falls die gespeicherten Daten keinen enthalten. Aktivieren Sie die Persistenz beim Start (direkt nach dem Mounten), nicht während einer laufenden Sitzung.

Hinweis: Die gespeicherten Daten können patientenbezogene Falldaten (Patientenname, Untersuchungsdatum) im Klartext im `localStorage` enthalten. Wenn Sie solche Daten erfassen, sorgen Sie für einen geräteseitigen Schutz oder löschen Sie sie bei Bedarf mit `clearPersistedState()`.

### 💾 Status Export-/Importformat
Der Export erzeugt eine JSON-Datei (Version `2.22`; Importe akzeptieren weiterhin die Legacy-Version `1.4` sowie `2.0` bis `2.21` und werden automatisch migriert) mit folgenden Feldern:

**Globale Felder:**
- `wisdomVisible` - Weisheitszähne sichtbar
- `showBase` - Knochenschicht sichtbar
- `occlusalVisible` - Okklusionsansicht aktiv
- `showHealthyPulp` - Gesunde Pulpa sichtbar
- `edentulous` - Zahnloser Modus aktiv

**Pro-Zahn-Felder (32 Zähne):**
- `toothSelection` - Basiszahntyp
- `toothSubstrate` - Zahnsubstrat (natural/radix/broken/crownprep), unabhängig von jeder Restauration
- `restorationType` - Restaurationstyp (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - Restaurationsmaterial (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), gekoppelt an `restorationType`
- `prosthesis` - herausnehmbare/Attachment-Achse (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), schließt sich mit einer festen `restorationType` von Krone/Brücke gegenseitig aus
- `crownLeakage` - Kronenrand-Undichtigkeits-Flag, nur relevant, wenn `restorationType` gleich Krone oder Brücke ist
- `endo` - endodontischer Zustand; schließt sich mit `pulpDx` gegenseitig aus (über einen zusammengeführten „Pulpa-/Endo-Status"-Auswähler gemeinsam dargestellt — das Behandeln eines Zahns normalisiert `pulpDx` auf `normal`)
- `mods` - Modifikations-Array (Entzündung, parodontal); `inflammation` ist bei vorhandenen Zähnen aus der UI entfernt (dort steuert `apicalDx` den Glyphen), gilt aber weiterhin für fehlende/Extraktionsalveolen-Zähne
- `caries` - aktive Kariesflächen
- `cariesActiveDepth` - der vom Kariestiefe-Auswähler vorgehaltene ICDAS-Tiefenwert beim Anwenden einer neuen Fläche (kein gespeicherter Wert pro Fläche; siehe `cariesSeverity` für das gespeicherte Feld pro Fläche)
- `rootCaries` - Wurzelkaries-Schweregrad (none/active/arrested/active-cavitated)
- `cariesSeverity` - vereinheitlichter Schweregrad pro Fläche (0-6): ICDAS-Tiefe auf einer primären (ungefüllten) Fläche, CARS-Score auf einer rezidivierenden (gefüllten) Fläche
- `radiographicDepth` - radiologische Kariestiefe pro Fläche (none/E1/E2/D1/D2/D3), unabhängig von der visuellen ICDAS-/CARS-Skala
- `fillingMaterial` - Füllungsmaterial
- `fillingSurfaces` - gefüllte Flächen
- `fillingSurfaceMaterials` - Füllungsmaterial pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- `fillingDefect` - Füllungsdefekt pro Fläche (none/marginal/fracture/wear), an gefüllte Flächen gebunden, unabhängig von Sekundärkaries
- `pulpDx` - AAE-Pulpadiagnose (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis rendert ein reduziertes Glyph
- `pulpLatin` - praktischer lateinischer Pulpa-Subtyp (wird vom Pulpa-Auswähler nur angezeigt, wenn `pulpDetailLevel` gleich `latin` ist)
- `apicalDx` - apikale Diagnose, steuert den periapikalen Glyphen
- `periapicalType` - periapikaler Läsionssubtyp (none/granuloma/cyst), nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt; der alte Wert `abscess` wird beim Import weiterhin akzeptiert
- `resorptionType` - Wurzelresorptionstyp (none/internal/external-cervical)
- `periImplant` - periimplantärer Status nur bei Implantaten (none/mucositis/peri-implantitis-mild/-moderate/-severe), Staging nach dem World Workshop 2018
- `dxOverrides` - Zahnbezogene Überschreibungen der Diagnose-Kodierung (Version 2.21): ein Objekt, indiziert nach ICD-10-Diagnoseschlüssel → `add` | `suppress`, das eine kodierte Diagnose erzwungen aktiviert, obwohl kein passender Befund vorliegt, oder deaktiviert, obwohl einer vorliegt; bestimmt die effektiv als FHIR-`Condition`s exportierte kodierte Menge
- `endoResection` - Wurzelspitzenresektions-Flag
- `fissureSealing` - Fissurenversiegelungs-Flag
- `calculus` - Zahnstein-Flag
- `contactMesial` - mesialer Kontaktpunktverlust
- `contactDistal` - distaler Kontaktpunktverlust
- `wearEdge` - inzisaler/okklusaler Abriebtyp (none/attrition/erosion)
- `wearCervical` - zervikaler Abriebtyp (none/abrasion/abfraction/erosion)
- `discoloration` - Verfärbungsursache pro Zahn (none/tetracycline/fluorosis/nonvital/extrinsic/other), färbt die Füllfarbe der natürlichen Zahnkrone bei einem natürlichen Zahn (bleibend/Milchzahn) ohne Restauration
- `orthoAppliance` - kieferorthopädische Apparatur (none/bracket/band)
- `orthoDrift` - kieferorthopädische Drift (none/mesial/distal)
- `orthoVertical` - kieferorthopädische vertikale Bewegung (none/extrusion/intrusion)
- `orthoRotation` - kieferorthopädisches Rotations-Flag
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - Fraktur-Lokalisierungen
- `extractionWound` - Post-Extraktionswunde
- `extractionPlan` - geplante Extraktion
- `parapulpalPin` - parapulpaler Stift-Flag
- `bridgePillar` - Brückenpfeilerzahn
- `mobility` - Mobilitätsgrad (none/m1/m2/m3)
- `crownNeeded` - Indikator „Krone erforderlich"
- `crownReplace` - Indikator „Kronenwechsel erforderlich"
- `missingClosed` - Lücke nach Extraktion geschlossen
- `customStates` - Plugin Custom States (Objekt, nach Plugin-ID indiziert)
- `note` - Textnotiz pro Zahn (String, optional — nur vorhanden, wenn nicht leer)

**Oberstes `plan`-Feld (ab Version 2.11):**
- `plan` - optionales Objekt, gleiche Struktur wie `teeth` (Pro-Zahn-Felder oben), enthält das **Plan**-Chart (beabsichtigte Behandlung). Nur vorhanden, wenn das Plan-Chart initialisiert wurde (der `Status | Plan`-Umschalter wurde mindestens einmal auf Plan gestellt) UND sich sein Inhalt vom Status-Chart unterscheidet — ein reiner Status-Export lässt es vollständig weg und bleibt bis auf die Versionsnummer byte-identisch zu einem Export vor Version 2.11. Beim Import löscht ein fehlendes `plan` das Plan-Chart bzw. macht es uninitialisiert (es lässt niemals einen veralteten Plan von vor dem Import wiederaufleben); ein vorhandenes `plan` stellt das Plan-Chart neben dem Status wieder her. Das Plan-Chart kann auch unabhängig von Export/Import über `getPlanChart()`/`setPlanChart()` gelesen/geschrieben werden (siehe Öffentliche API oben), und `getStatusChart()` liefert unabhängig vom aktiven Chart-Modus immer den status-primären Payload.

**Oberstes `case`-Feld (Version 2.17+, in 2.18, 2.19, 2.20 und 2.22 erweitert):**
- `case` - optionales Objekt mit fallbezogenen (nicht pro Zahn) Metadaten, gemeinsam genutzt vom Status- und vom Plan-Chart (spiegelt den obersten `globals`-Schlüssel). Omit-when-empty: fehlt vollständig, wenn jedes Feld auf seinem Standardwert steht, sodass ein Export ohne Fallmetadaten bis auf die Versionsnummer byte-identisch bleibt. Felder (jeweils weggelassen, wenn auf Standardwert): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; die vier klinischen Übersteuerungen der 2017-Klassifikation pro Achse `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; sowie (ab Version 2.19) `patientName` / `examDate`; und (ab Version 2.20) `patientDob`; sowie (ab Version 2.22) `caseConditions` — Fall-/regionale Diagnosen (Malokklusion & Kiefergelenk K07, Mundzysten K09, Speicheldrüsenerkrankungen K11, Stomatitis & Mundschleimhaut K12/K13, bogenweite Entwicklungsanomalien K00), jeweils einer Lateralität zugeordnet (nicht spezifiziert / links / rechts / beidseitig). Es speist die parodontale Staging-/Grading-Klassifikation und die PDF-Berichtskopfzeile; gelesen/geschrieben über `getCaseMeta()` und die `setCase*`-Setter (siehe Öffentliche API oben). Patientenname, Geburtsdatum und Untersuchungsdatum sind reine Chart-Identitätsmetadaten — sie sind **nicht** Teil des FHIR-Exports.

### 🖨️ Export
`exportFhir()` liefert ein HL7-validator-sauberes Bundle: jeder Eintrag trägt eine deterministische `id` und eine absolute `fullUrl` (keine `urn:uuid`-Platzhalter), und das Bundle bettet das eigene CodeSystem der Engine ein, damit ihre lokalen Codes bei der Validierung aufgelöst werden können (auch als `fhir/CodeSystem-odontogram.json` im Repository veröffentlicht; mit `includeCodeSystem: false` weglassbar).

Parodontale Daten laufen jetzt auch über den FHIR-Import im Kreis, nicht nur über das JSON-Payload: `importFhirBundle()` liest die LOINC-`74029-0`-Parodontal-Panels wieder in den Parodontal-Datensatz jedes Zahns ein — Sondierungstiefe, Gingivarand (aus dem CAL rekonstruiert, sodass Pseudotaschen-Werte erhalten bleiben), BOP, Furkation, O'Leary-Plaque, die PI-/GI- und die implantatspezifischen mPI-/mBI-Indizes sowie die keratinisierte Gingivabreite — dazu die fallbezogenen Raucherstatus- und HbA1c-Evidence-Observations. Die einzige Ausnahme ist die Suppuration: Sie bleibt reines JSON, da sie nicht Teil des FHIR-Exports ist.

Über den eigenen Status-JSON-/FHIR-/PNG-/JPG-/SVG-Export des Odontogramms hinaus hat das **Parodontalstatus-Chart** einen eigenen Exportpfad:
- **Parodontal-SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` rendern das vollständige Parodontalstatus-Chart (Zahngrafiken + Zahlenreihen + die Klassifikation nach 2017) als ein eigenständiges Vektor-SVG (`buildPerioSvg()`), unabhängig vom gemounteten `PerioChart`-DOM. Die drei Export-Menüpunkte sind deaktiviert, sobald `hasAnyPerioData()` `false` ist (bei einem leeren Chart gibt es nichts Parodontales zu exportieren).
- **PDF-Bericht:** der Menüpunkt „PDF-Bericht…" im Export-Menü öffnet `ExportOptionsModal` — einen Einstellungsdialog (Felder für Patientenname + Geburtsdatum + Untersuchungsdatum, direkt mit den Fall-Metadaten verknüpft, wobei das Untersuchungsdatum standardmäßig auf heute gesetzt ist; Abschnitts-Checkboxen: Patientendaten, Odontogramm-Chart, Odontogramm-Beschreibung, individuelle Notizen — deaktiviert, wenn kein Zahn eine Notiz hat —, Parodontalstatus, Parodontal-Beschreibung), bevor `exportPdf(opts)` aufgerufen wird. Leere Identitätsfelder fallen auf Platzhalter zurück („John Doe" / „1980-01-01"), sodass der Export immer gelingt. Das PDF wird jsPDF-nativ zusammengestellt — Vektortext über `.text()`, gerasterte Zahn-/Parodontalstatus-Chart-Bilder über `.addImage()` — **ohne Abhängigkeit von svg2pdf.js**. Der Abschnitt der individuellen Notizen wird automatisch übersprungen, wenn kein Zahn eine Notiz hat, und die beiden Parodontal-Abschnitte werden automatisch übersprungen, sobald `hasAnyPerioData()` `false` ist, unabhängig von den Checkboxen des Dialogs.
- **mPI/mBI-Implantat-Gating:** die periimplantären Mombelli-Indizes (mPI/mBI) werden nur als Zeilen in einem Kieferbogen dargestellt, der mindestens einen Implantatzahn enthält — sowohl im laufenden Parodontalstatus-Chart als auch in den SVG-/PDF-Exporten.
- Patientenname, Geburtsdatum und Untersuchungsdatum sind reine chart-identitätsbezogene Metadaten (Payload `2.20`, additiv) — sie sind **nicht** Teil des FHIR-Exports.

### 📁 Ordnerstruktur
- `src/App.tsx` - UI-Hülle, Kopfleisten-Steuerung, Sprach-/Nummerierungs-/Dunkelmodus-/Theme-/Plugin-Umschalter
- `src/odontogram.ts` - SVG-Schichtungsmotor, Zahnstatusmanagement, Touch-Interaktionen, Plugin-Overlays, UI-Verdrahtung
- `src/plugin.ts` - `OdontogramPlugin`-Typ, `PluginLayer`, `getQuadrant()`, `LAYER_Z` Z-Index-Prioritäten
- `src/theme.ts` - `OdontogramThemeConfig`-Typ und `applyThemeConfig()`-Hilfsfunktion
- `src/status_extras.ts` - 34 vordefinierte Restaurationsvorlagen (Brücken, Prothesen, Stegkonstruktionen)
- `src/i18n/` - Übersetzungen (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) und i18n-Hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer Nummerierungskonvertierung
- `src/registry/` - deklaratives Register der klinischen Achsen: FHIR-Feldzuordnungen, SVG-Clear-Set/Boolean-Flag-Aktivierung, Restaurationstyp×Material-Matrix, UI-Optionslisten (eine einzige Quelle der Wahrheit, die Export/Import, FHIR und die Auswähler-UI erzeugt)
- `src/fhir/` - HL7-FHIR-R4-Export/Import: `toFhir.ts`/`fromFhir.ts`, Codesysteme, Feldzuordnungen, Primitive
- `src/bridgeOverlay.ts` - Mehrzahn-Brückenspann-Verbinder-Overlay (bogenbewusste Sattelgeometrie)
- `src/SettingsModal.tsx` - tabbasierter Einstellungsdialog (Allgemein/Panels/Zahndetails/Karies/Pulpa/Notizen/Parodontal)
- `src/perioExport.ts` - `buildPerioSvg()`: das vollständige Parodontalstatus-Chart als ein eigenständiges Vektor-SVG
- `src/perioPdf.ts` - der reine jsPDF-Berichts-Assembler von `exportPdf()` (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - der Export-Einstellungsdialog des Menüpunkts „PDF-Bericht…"
- `src/__tests__/` + `src/registry/__tests__/` - eine umfangreiche automatisierte Vitest-Testsuite
- `src/assets/teeth-svgs/` - SVG-Zahnvorlagen (6 Dateien: Schneide-, Eck-, Prämolaren, Molaren + Okklusionsansichten)
- `src/assets/icon-svgs/` - Toolbar-Icon-SVGs (5 Dateien)

### ⚙️ Technologie-Stack
- React 18 + Vite + TypeScript
- Tailwind CSS für UI-Styling
- SVG-Schichtung über DOM-Manipulation (kein React-State für Performance)
- Leichtgewichtiges eigenes i18n-System
- Vitest + Testing Library für automatisierte Tests
- TypeDoc für API-Dokumentation
- Vite-Pfadalias: `@` auf `./src` abgebildet

### 📝 Hinweise
- SVG-Vorlagen werden aus `src/assets/teeth-svgs` und `src/assets/icon-svgs` geladen; daher muss statisches Hosting den öffentlichen Ordner bereitstellen.
- Der Odontogramm-Motor verwendet einen eigenen internen Zustand (kein React-State) für Performance und Einfachheit.
- Milchzähne verfügen über einen reduzierten Satz verfügbarer Materialien (kein Amalgam, kein stiftbasiertes Endo).
- Implantatzähne haben andere Kronen-/Abutment-Optionen als natürliche Zähne.

### 🔒 Sicherheitshinweise

- **Plugins laufen als vertrauenswürdiger Code.** Der Rückgabewert von `renderSvg()` eines Plugins wird in das SVG des Live-Befunds eingefügt. Diese Ausgabe wird vor dem Einfügen mit [DOMPurify](https://github.com/cure53/DOMPurify) (SVG-Profil, plus `svgFilters`) bereinigt — `<script>`, `<iframe>`, `<object>`, `<embed>` und `<foreignObject>` sind grundsätzlich verboten, und vollständig bösartige Ausgaben werden verworfen statt teilweise gerendert. Das verringert die Angriffsfläche eines kompromittierten oder fehlerhaften Plugins, aber Plugins sollten dennoch nur aus vertrauenswürdigen Quellen geladen werden — die Bereinigung ist ein Sicherheitsnetz, kein Ersatz für eine Prüfung.
- **Content-Security-Policy.** Der **Produktions-Build** der Demo fügt über ein `<meta http-equiv="Content-Security-Policy">`-Tag folgende Policy ein (der Dev-Server ist davon nicht betroffen):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Host-Anwendungen, die `OdontogramShell` einbetten, sollten eine eigene, zu ihrem Einsatz passende CSP setzen — die Komponente selbst fügt bei Verwendung als Bibliothek keine ein.

### 📖 Zitierung

Wenn Sie dieses Modul in Ihrer Arbeit verwenden, zitieren Sie es bitte.

**Diese Version (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Alle Versionen (Konzept-DOI):** https://doi.org/10.5281/zenodo.21156787

> Die obige versionsübergreifende Konzept-DOI verweist immer auf die zuletzt
> archivierte Version; eine versionsspezifische DOI wird bei jeder Version erst
> vergeben, wenn diese auf Zenodo archiviert wird. Solange v2.4.0 nicht archiviert
> ist, zitieren Sie sie bitte über die Konzept-DOI.

Maschinenlesbare Zitationsmetadaten finden Sie in [`CITATION.cff`](../CITATION.cff).

## 🙌 Danksagung

React Advanced Odontogram wird von Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)) erstellt und gepflegt, dem Schöpfer und leitenden Entwickler der gesamten Engine. Mit der wertvollen Hilfe der unten aufgeführten Mitwirkenden. Vielen Dank an alle, die beigetragen haben.

**Mitwirkende**

- [@odontodev](https://github.com/odontodev): State-Hydration und Lifecycle-API, Füllungseinstellungen als kontrollierte Props, idempotente Setter und einklappbare Karten
- [@JulianoBazzi](https://github.com/JulianoBazzi): Übersetzung ins brasilianische Portugiesisch
- [@yassine-bhn](https://github.com/yassine-bhn): französische Übersetzung und die vorgeschlagene vermessene Anatomie
- [@saegerdirk-star](https://github.com/saegerdirk-star): vermessene Zahnanatomie und der Zahngenerator sowie der Vorschlag für die komponierbare Schnittstelle; drei aus ihrem Fork übernommene Korrekturen (Patientenangaben im PDF, Zahnausrichtung im Parodontalbefund, Auswahlgeschwindigkeit)
- [@sofia-cluadette](https://github.com/sofia-cluadette): die Auswahl-API `getSelectedTeeth()`

**Erstellt mit** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) und [Tailwind CSS](https://tailwindcss.com).

Beiträge sind willkommen. Öffnen Sie einen pull request auf GitHub, dann werden Sie hier genannt. Wenn Ihnen das Projekt nützt, geben Sie ihm bitte [einen Stern auf GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).
