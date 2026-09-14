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

## 📑 Tartalomjegyzék

- [📋 Áttekintés](#-áttekintés)
- [📦 Használat npm csomagként](#-használat-npm-csomagként)
- [✨ Főbb funkciók](#-főbb-funkciók)
- [📦 Modulok](#-modulok)
- [🛠️ UI vezérlők](#-ui-vezérlők)
- [🦷 Fogtípusok és állapotok](#-fogtípusok-és-állapotok)
- [⚙️ Beállítások](#-beállítások)
- [🖼️ SVG sablon rendszer](#-svg-sablon-rendszer)
- [🔢 Számozási rendszerek](#-számozási-rendszerek)
- [🚀 Használat](#-használat)
- [🔗 Integráció](#-integráció)
- [🧪 Tesztelés](#-tesztelés)
- [📖 API Dokumentáció](#-api-dokumentáció)
- [📡 Nyilvános API](#-nyilvános-api)
- [💾 Állapotmentés (localStorage)](#-állapotmentés-localstorage)
- [💾 Állapot Export/Import formátum](#-állapot-exportimport-formátum)
- [🖨️ Export](#-export)
- [📁 Mappastruktúra](#-mappastruktúra)
- [⚙️ Technológia](#-technológia)
- [📝 Megjegyzések](#-megjegyzések)
- [🔒 Biztonsági megjegyzések](#-biztonsági-megjegyzések)
- [📖 Hivatkozás](#-hivatkozás)

## 🇭🇺 Magyar

### 📋 Áttekintés
Ez a projekt egy interaktív, böngészőben futó odontogram szerkesztő, amely a fogazati státuszrögzítést áttekinthető kezelőfelülettel támogatja. A rendszer rétegzett SVG fogsablonok segítségével jeleníti meg a pótlásokat, szuvasodásokat, endodonciai állapotokat, mobilitást és egyéb klinikai jellemzőket, miközben többfogos kiválasztást, kiválasztási szűrőket és előre definiált státusz mintákat is biztosít.

---
![Odontogram – előnézet (magyar)](screenshot_hu_odontogram.png)

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### 📦 Használat npm csomagként

Az odontogram önálló React komponenskönyvtárként érhető el az npm-en:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Követelmények
- **React 18 vagy 19** (peer dependency-ként deklarálva — az alkalmazásod biztosítja).
- Egy **bundler**, amely érti az `exports` mezőt és az ESM-et: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. A csomag **kizárólag ESM**.
- Node **≥ 18** az eszközökhöz.

#### Telepítés

```bash
npm install react-advanced-odontogram react react-dom
```

#### Alapvető használat

Renderelj `OdontogramShell`-t, és importáld a stíluslapot **egyszer**, bárhol az alkalmazásodban:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="hu"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Komponens propok

Az `OdontogramShell` egy vezérelt (controlled) komponens. A leggyakoribb propok:

| Prop | Típus | Alapértelmezett | Leírás |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI nyelv (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Fogszámozási rendszer. |
| `darkMode` | `boolean` | `false` | Sötét téma kapcsoló. |
| `readOnly` | `boolean` | `false` | Minden szerkesztés letiltása (csak megtekintés). |
| `themeConfig` | `OdontogramThemeConfig` | — | Téma CSS változók felülírása (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Egyedi állapot pluginek / extra rétegek regisztrálása. |
| `enableNotes` | `boolean` | `false` | Fogankénti megjegyzések engedélyezése. |
| `enableIcdas` | `boolean` | `false` | ICDAS II caries pontozás engedélyezése. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | A tömés komplexitása: `"simple"` (egy anyag foganként) vagy `"complex"` (anyagok felületenként). |
| `fillingDefectEnabled` | `boolean` | `true` | Bekapcsolja a tömési defektusok rögzítését a Tömések kártyán. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | mind elérhető | Elérhető tömőanyagok logikai leképezésként a `amalgam`/`composite`/`gic`/`temporary` kulcsokon (ismeretlen kulcsok figyelmen kívül hagyva). |
| `fissureSealingEnabled` | `boolean` | `true` | Bekapcsolja a barázdazárást a Tömések kártyán. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Akkor aktiválódik, amikor a felhasználó módosítja az adott beállítást a Beállítások → Tömések menüben. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Akkor hívódik meg, amikor a felhasználó módosítja a beállítást a felületen. |

Finomabb részletezettségi szintet meghatározó propok (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) is elfogadottak — a teljes, típusos listáért lásd a mellékelt `.d.ts` típusdefiníciókat.

A fenti négy tömésekkel kapcsolatos prop **csak visszaállításra** szolgál: a kihagyott prop soha nem ír a motorba (a mount előtti imperatív `setFillingComplexity()` hívás megmarad, a standalone mód pedig változatlan), míg a megadott prop a motorba és a Beállítások modál állapotába egyszerre ír, így a modál soha nem mutat elavult értéket. A `fillingMaterialAvailability` diff-szerűen, kanonikus szerializált kulcson keresztül kerül alkalmazásra — az azonos tartalmú inline literállal történő újrarenderelés soha nem írja újra a motort. A hozzá tartozó `on*Change` visszahívások a Beállítások → Tömések menüből aktiválódnak: ez a visszaírási út a preferenciákat mentő hosztok számára.

#### Nyilvános API (elnevezett exportok)

Az `OdontogramShell` egyszerre alapértelmezett (default) export és elnevezett (named) export is. Az imperatív állapot API, az önálló `PerioChart` komponens, az irányított bemutató túra, valamint az összes nyilvános típus ugyanabból a belépési pontból elérhető elnevezett exportként:

```ts
import {
  OdontogramShell,           // egyben az alapértelmezett export is
  PerioChart,                // önálló parodontális diagram komponens
  // állapot olvasása
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // feliratkozás állapotváltozásokra
  // export / import
  exportFhir,                // HL7 FHIR R4 bundle
  exportSvg, exportImage,    // vektoros / raszteres diagram export
  setImportFormat,
  // vezérlés
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // bemutató túra indítása
  // …és még sok további setX/getX beállítás függvény
} from "react-advanced-odontogram";
```

A teljes felület (≈ 44 függvény + olyan típusok, mint az `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) teljesen típusosan szerepel a mellékelt deklarációkban.

#### Összeállítható felületek (haladó)

Az `OdontogramShell` a támogatott, mindent egyben komponens, és nem igényel további beállítást. Ha az odontogram régióit a saját elrendezésének különböző területein szeretné elhelyezni, a shell négy felhasználói felületi felülete is exportálva van, és egyetlen `OdontogramProvider` alatt állítható össze, mindegyik ugyanazon a csomag által kezelt munkameneten osztozva:

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

Az `OdontogramProvider` ugyanazokat a propokat fogadja, mint az `OdontogramShell`. Egy `useOdontogramUi()` hook (és az `OdontogramUiContextValue` típus) is elérhető saját felületek építéséhez. Jelenlegi korlát: oldalanként egy providert használjon. A felületek igény szerint fel- és leválaszthatók — újracsatoláskor automatikusan visszakapcsolódnak. Maga az `OdontogramShell` változatlan — pontosan ez az összeállítás az alapértelmezett elrendezésben.

A még finomabb összeállításhoz az egyes vezérlőkártyák is exportálva vannak — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` és `ToothDetailsCard` —, mindegyik önálló, deklaratív komponens, amely a motor API-ján keresztül olvassa és írja a megosztott munkamenetet (a saját felületek építéséhez egy `useEngineState()` hook is exportálva van). Csak azokat a kártyákat csatolja, amelyekre az adott elrendezésnek szüksége van, tetszőleges elrendezésben, egyetlen `OdontogramProvider` alatt.

#### Használat Next.js-szel (App Router)

A komponens kizárólag kliensoldali, ezért egy Client Component-ből kell renderelni:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="hu" numberingSystem="FDI" />;
}
```

Vagy töltsd be egy kizárólag kliensoldali dinamikus importtal: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Fontos megjegyzések és jelenlegi korlátok
- **Kizárólag ESM** — a csomag egyetlen ES modult (`dist/odontogram.js`) publikál, kiegészítve egy típusdeklarációs belépési ponttal (`dist/index.d.ts`). A bundler modulfeloldást célozza; nincs CommonJS build.
- **A stíluslap külön van** — kötelező egyszer importálnod a `react-advanced-odontogram/style.css` fájlt; ez nem töltődik be automatikusan. A stílus globális CSS, amely a `.odontogram-root` alá van skálázva, és `--odon-*` CSS változók vezérlik.
- **SSR / kizárólag kliensoldali** — a komponens csatoláskor (mount) olvassa a DOM-ot (`document`), ezért a böngészőben kell futnia. SSR keretrendszerekben egy Client Component-ben (`"use client"`) vagy kizárólag kliensoldali dinamikus importon keresztül kell renderelni.
- **Az eszközök (assets) önállóak** — a fog- és ikon-SVG-k build időben be vannak ágyazva a JavaScript bundle-be; **nincs futásidejű asset lekérés**, amit be kellene állítani, és semmi extrát nem kell átmásolni a public mappádba.
- **Oldalanként egy példány** — a motor állapota jelenleg modul-szintű singleton, ezért ha ugyanazon az oldalon két `<OdontogramShell>` példányt renderelsz, azok egyetlen diagram állapotát osztanák meg egymással. A több példány támogatása egy jövőbeli kiadásban tervezett.

---

### ✨ Főbb funkciók
- 🖱️ Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- 🦷 Fogtípusok: maradó, tejfog, implantátum, ínyalatti, hiányzó
- 🦷 Fogszubsztrátum (bármely pótlástól függetlenül): természetes, radix (gyökércsonk), törött, koronára előkészített
- 👑 Pótlások típus × anyag szerint: korona / inlay / onlay / héj (veneer) / híd e.max, arany, gradia, cirkon, fém, fémkerámia, teleszkópos vagy ideiglenes anyagból (az onlay csak okkluzális nézetben érhető el) — egyetlen kombinált, kevés kattintást igénylő „Fix: Korona – …” választóból kiválasztva; a korábbi `metal` koronák automatikusan `metal-ceramic` (fémkerámia) típusra migrálódnak; az implantátumok ugyanazt a típus × anyag modellt használják, kiegészítve egy implantátum-csatlakozó réteggel. A választó a fog típusától függően szűkül: implantátum esetén csak korona/híd választható (plusz az alábbi öt csatlakozási lehetőség), hiányzó/foghiány fog esetén csak híd-pontik (plusz kivehető részleges/teljes fogsor), `radix` szubsztrátum esetén a pótlás-választó teljesen elrejtve (gyökércsonkra nem rögzíthető pótlás)
- 🦿 Kivehető/csatlakozós protetika a dedikált `prosthesis` tengelyen (a kombinált választó „Kivehető:” bejegyzései): implantátum gyógyuló csavarja, lokátor, lokátor protézissel (overdenture), bár, bár protézissel; fogtámasztékú kivehető részleges vagy teljes fogsor
- 🌉 A hídtag fogak megjelenítik mind a koronát, mind a nyeregpántos (saddle) csatlakozót; egy több fogra kiterjedő híd-overlay egyetlen folytonos, ívhez igazodó csatlakozót jelenít meg az egymást követő hídtagokon (pontikok + pillérek) és a köztük lévő fogközi réseken keresztül (a felső és alsó fogsor tükrözött nyereg-geometriát használ, így a csatlakozó mindkét fogsoron illeszkedik), és a PNG/JPG/SVG exportban is szerepel; a híd Státusz mintán keresztüli alkalmazása azonnal újraszámítja az overlay-t
- 🔍 Szuvasodás rögzítése 6 felületen: meziális, disztális, bukkális, linguális, okkluzális, korona alatti
- 🪥 Tömőanyagok felületenként: amalgám, kompozit, GIC, ideiglenes
- 🏥 Egyetlen összevont "Pulpa / Endo státusz" választó (csoportosítva: vitális pulpa vs. kezelt/endo): az endodonciai állapotok (gyógyszeres tömés, gyökértömés, nem teljes gyökértömés, üvegszálas csap, fémcsap) és az AAE pulpa diagnózis (`pulpDx`: normal / reverzibilis / irreverzibilis pulpitis / necrosis) kölcsönösen kizárják egymást — egy gyökérkezelt fogon (`endo` beállítva) nem szerepelhet egyidejűleg vitális pulpa diagnózis; kezelés esetén a `pulpDx` automatikusan `normal`-ra áll vissza, és a beteg pulpa jelölés eltűnik. A reverzibilis pulpitis csökkentett méretű pulpa jelölést jelenít meg. Az opcionális, 3 szintű pulpa részletezettségi beállítás (`pulpDetailLevel`: simple / AAE / gyakorlati latin) 9 gyakorlati latin pulpa altípust jelenít meg (pulpa sana … gangraena pulpae) a `pulpLatin` mezőn keresztül; a rezekció és a parapulpális csap továbbra is külön speciális jelzőként szerepel
- 🦴 Apikális diagnózis (`apicalDx`: tünetekkel járó/tünetmentes apikális periodontitis, akut/krónikus apikális tályog, condensing osteitis) közvetlenül meghatározza a periapikális jelölést; a granuloma/ciszta lézió-altípus minősítő csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg (a redundáns "tályog" altípus törölve lett — ezt már az apikális diagnózis lefedi)
- 🩹 Összevont "Gyökér és fogágy" kártya (egyetlen összecsukható szekció a gyökér-/periapikális és parodontális leletekhez)
- ⚕️ Módosítók: periapikális gyulladás (csak hiányzó/extrakciós alveolus fogakon jelenik meg; meglévő fogakon rejtett, ahol az `apicalDx` önmagában határozza meg a periapikális jelölést, és implantátumokon, ahol a `periImplant` fedi le), parodontális betegség, mobilitási fokok (M1/M2/M3, implantátumokon rejtett)
- 🦷🔩 Peri-implantáris státusz (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — 2018-as World Workshop staging, dedikált választóként jelenik meg implantátumokon; a mucositis újrahasznosítja a parodontális íny jelölést, a peri-implantitis egy fokozatos `peri-implant-bone-loss` réteget ad hozzá (átlátszóság 0,4/0,7/1,0). Az implantátumok többé nem jelenítik meg a periapikális lézió jelölést — a gyulladásukat ehelyett ez a tengely fejezi ki —, és a parodontális módosító jelölőnégyzetek rejtve vannak implantátumokon (az ad-hoc "Peri-implantitis" jelölőnégyzet-átcímkézés megszűnt)
- 🏷️ Speciális jelzők: korona szükséges, koronacsere szükséges, zárt foghiány, fogeltávolítási terv, barázdazárás, kontaktpont veszteség
- 👁️ Okkluzális nézet, bölcsességfog, csont és pulpa láthatóság kapcsolók
- 🔢 12 kiválasztási szűrő (összes, jelenlévő, maradó, tej, implantátum, hiányzó, felső/alsó, front/molárisok)
- 📊 Előre definiált státusz minták (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 📦 34 előre definiált restaurációs sablon (hidak, kivehető protézisek, bár protézisek implantátumokkal)
- 💾 Állapot export/import JSON formátumban (2.22 verzió; az importálás továbbra is elfogadja a korábbi 1.4 és 2.0–2.21 verziókat, és automatikusan migrálja, plugin egyedi állapotokkal és fogankénti megjegyzésekkel)
- 💽 Opcionálisan bekapcsolható localStorage-perzisztencia (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — alapértelmezetten kikapcsolva; minden állapotváltozáskor elmenti a státusz-diagramot (és opcionálisan a terv-diagramot is), majd a komponens legközelebbi mountolásakor visszaállítja azt, 4 MB-os méretkorláttal, a tárolási/feldolgozási hibákat pedig dobás helyett egy `onError` callbacknek (vagy a `console.warn`-nak) adja tovább
- 🔗 HL7 FHIR R4 export (collection Bundle fogankénti Observation-ökkel, ISO 3950 fogkódolás a maradó fogazatra **és** a tejfogakra (51–85, veszteségmentes oda-vissza konverzió importáláskor), lokális kódrendszer, valamint egy opcionálisan bekapcsolható SNOMED CT réteg (Beállítások → SNOMED CT)); egy rögzített súlyosságú caries komponens egy pontozási-rendszer kódolást is hordoz — ICDAS-t egy elsődleges (tömés nélküli) felületen, CARS-t egy szekunder (tömött) felületen
- ✚ Kereszt/plusz felület-választó UI (B/M/O/D/L) szuvasodáshoz és tömésekhez
- 🧱 Felületenkénti tömőanyagok (vegyes tömések, pl. bukkális amalgám + disztális kompozit)
- 🖼️ PNG/JPG/SVG képexport az odontogramról (letölthető; a PNG/JPG vektoros SVG-ből raszterizált)
- 🦷 A caries/subcaries felületenkénti állapotgép: egy tömés nélküli szuvas felület elsődleges caries-ként jelenik meg (ICDAS-szintezett átlátszósággal); amint a felületen tömés is van, helyette szekunder (visszatérő) caries-ként jelenik meg (`subcaries-{surface}` réteg, CARS-pontszámmal) — a kettő soha nem lehet egyszerre aktív ugyanazon a felületen
- 🎯 Egységesített, felületenkénti súlyossági érték (`cariesSeverity`, 0–6, amely felváltja a korábbi külön ICDAS-mélység és CARS mezőket): elsődleges felületen ICDAS mélységként, szekunder felületen elnevezett CARS pontszámként (Ép … Kiterjedt üreg) olvasandó, egy kontextusfüggő felugró ablakon keresztül, amely mindig csak a felület aktuális állapotához tartozó skálát mutatja
- 🌱 Gyökér szuvasodás (`rootCaries`: none / active / arrested / active-cavitated), amely bekapcsolja a dedikált gyökér-szuvasodás grafikai réteget, a súlyosságtól függő átlátszósággal (active 0,5 / arrested 0,7 / active-cavitated teljes átlátszóság)
- 📡 Radiológiai szuvasodás mélység (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 felületenként), független a vizuális ICDAS/CARS súlyossági skálától, jelvényként (badge) jelenik meg, és saját FHIR Observation-jén keresztül is vissza-visszatölthető (round-trip)
- 🎚️ Három szuvasodás-részletezettségi beállítás (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`), valamint egy `cariesDepthEnabled` kapcsoló, amelyek mindegyike egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték elvesztése nélkül
- 🩹 Subcaries-összegző sor a tömés panelen: a tömés vezérlők alatt felsorolja a kijelölt fogak közül azokat, amelyeken szekunder caries van, a felületeikkel együtt (pl. "36 (O) tömése mellett subcaries van beállítva.")
- 🪛 Felületenkénti tömésdefektus (`fillingDefect`: none / marginal / fracture / wear) közvetlen restaurációkon, függetlenül a szekunder caries-tól — a Tömések kártyán egy felületenkénti jelzővel rögzíthető (a caries-mélység jelzőt tükrözve, opciólistája függőlegesen egymás alatt), megjelenik a diagramon, valamint a tooltipben és a teljes szájüreg tömés-összegzésben explicit felirattal (pl. "36 (O) – Tömésdefektus: O: marginális"), ugyanúgy, ahogy a szekunder caries is fel van tüntetve a Caries soron; a Tömések kártya emellett egy figyelmeztető megjegyzést is mutat minden olyan kijelölt fogra, amelyen tömésdefektus van rögzítve (pl. "36-on tömésdefektus van rögzítve."), a meglévő subcaries figyelmeztető megjegyzéssel párhuzamosan
- 🦷💥 Fogkopás klinikai ok és hely szerint típusolva (`wearEdge`: none / attrition / erosion, metszőéli/rágófelszíni; `wearCervical`: none / abrasion / abfraction / erosion, cervikális) — felváltja a korábbi két be/ki bruxizmus-kopás jelzőt; két legördülő menüvel rögzíthető a kopás sorban, az eddigi kopás-grafikát használja, és megjelenik a tooltipben, valamint egy új, teljes szájüregre vonatkozó "Kopás" összegző szekcióban
- 🎨 Fogelszíneződés ok szerint (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) maradó és tejfogakon — a megjelenő természetes koronát egy jellemző színnel árnyalja, ha a fogon nincs pótlás és a szubsztrátuma természetes; megjelenik a tooltipben és egy új, teljes szájüregre vonatkozó "Elszíneződés" összegző szekcióban; a tömésdefektusok és a kopás mellett kiegészíti a felszíni és strukturális állapotok körét
- ✏️ A frontfogak (metszőfogak/szemfogak) a teljes felületen "metszőéli"-ként ("incisal") jelölik a rágófelszínüket (választó, felugró ablak, összegzések); a tárolt felület-kulcs továbbra is `occlusal` marad
- 🔤 Pozíciófüggő felület-jelölés (Beállítások → Fogadatok → "Felület-jelölés", egyszerű/teljes, alapértelmezett: teljes): teljes módban a caries/tömés felület betűjele és felirata a fog anatómiáját követi — okkluzális → I/metszőéli a frontfogakon, bukkális → L/labiális a frontfogakon, linguális → P/palatinális a felső fogakon és L/linguális az alsó fogakon (a meziális/disztális/korona alatti felületeket ez nem érinti); egyszerű mód mindig az általános B/M/O/D/L/SC jelölést használja, a fog pozíciójától függetlenül. A teljes szájüreg összegzésre, valamint mind a caries, mind a tömésdefektus felület-választóra vonatkozik (betű + felirat); a tárolt felület-kulcsot ez nem érinti
- 🦷↕️ Fogankénti ortodonciai rögzítés (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: logikai) egy meglévő természetes fogon (maradó vagy tejfog) — az alvó v2.5.0-s ortodonciai grafikát használja fel (nincs új SVG); megjelenik a diagramon, a tooltipben, és egy új, teljes szájüregre vonatkozó "Ortodoncia" összegző szekcióban
- 🪨 Fogkő, valamint belső vagy külső cervikális típusú gyökérreszorpció (`resorptionType`)
- 📏 Felületenkénti szuvasodás mélysége (felületes / dentin / mély), vagy opcionális ICDAS II pontozás (0–6) az `enableIcdas` proppal
- 🩹 Korona szegélyi rés (leakage) kapcsoló, csak korona vagy híd pótlás esetén jelenik meg
- 🧬 Szabványalapú diagnóziskódolás (WHO ICD-10, mindig aktív): minden rögzített lelet ICD-10 kódolt diagnózist eredményez — fogszuvasodás (K02), gyökérfelszíni és megállt szuvasodás (K02.2/.3), pulpitis és pulpanekrózis (K04.0/.1), apikális periodontitis, periapikális tályog és radikuláris ciszta (K04.4–.9), attríció/abrázió/erózió/abfrakció (K03.0–.8), fogkő (K03.6), fogreszorpció (K03.3), elszíneződés (K00.3/K00.8/K03.7), fogvesztés (K08.1), visszamaradt gyökér (K08.3) és fogtörés (S02.5) — megjelenik a tooltipben és a teljes szájüreg összegzésben, és FHIR Condition-ként exportálódik.
- 🩺 Fogankénti Diagnózisok kártya: megtekintheti egy fog levezetett ICD-10 diagnózisait, és szerkesztheti azokat — elnyomhat egy tévesen levezetett diagnózist, vagy hozzáadhat olyat, amit a diagram nem ábrázol. A hatályos halmaz (levezetett − elnyomott + hozzáadott) vezérli a FHIR exportot.
- 🗺️ Eset- / regionális állapotok: rögzíthet olyan teljes szájüregre vonatkozó diagnózisokat, amelyek nincsenek egyetlen foghoz kötve — malocclusio és TMJ-rendellenesség (K07), szájüregi ciszták (K09), nyálmirigy-betegségek (K11), stomatitis és szájnyálkahártya-elváltozások (K12/K13), valamint fogazati fejlődési rendellenességek (K00) — mindegyik opcionálisan oldalasított (bal / jobb / kétoldali).
- 🌍 Nemzeti kódcsomagok (Beállítások → Diagnózis kódrendszer): egy nemzeti kódrendszert helyez a WHO ICD-10 alap fölé — BNO-10 (magyar, lokalizált megjelenítés; megtartja a WHO kódot) vagy US ICD-10-CM (átleképzett kódok, pl. a K07 dentofaciális tartomány → M26). Egy újabb ország csomagjának hozzáadása egy apró `CodingPack` bejegyzés — lásd a `CODING_PACKS.md` fájlt.
- 🔬 SNOMED CT réteg (Beállítások → SNOMED CT, opcionálisan bekapcsolható, alapértelmezetten kikapcsolva): a WHO és bármely nemzeti kódcsomag kódolása mellé SNOMED CT kódolást is hozzáad, és kódolja azokat a peri-implantáris leleteket is, amelyeknek nincs WHO ICD-10 kódjuk. Az ICD-10-CM és SNOMED fogalomazonosítók referencia jellegűek, legjobb tudás szerintiek — klinikai használat előtt ellenőrizze őket a hivatalos ICD-10-CM táblázatos listával / SNOMED CT böngészővel szemben.
- 🔁 FHIR Condition oda-vissza konverzió: a diagnózisok FHIR `Condition` erőforrásként exportálódnak (fogankénti kötésű, valamint páciensszintű eseti állapotok egy oldalasítást jelző `bodySite` mezővel) az Observation-ök mellett, importáláskor pedig visszaépülnek — az eseti állapotok közvetlenül, a fogankénti hozzáadás/elnyomás felülbírálások pedig az importált Condition-ök és az újra levezetett diagram összevetésével (diff).
- 🩺 **Megújított Diagnózisok kártya:** minden fogankénti diagnózis-sor elöl mutatja az ICD-10 kódot (`K04.0 Pulpitis`), és a sorok kód szerint vannak rendezve. Minden sorhoz tartozik egy **kizárás** kapcsoló (kiveszi a diagnózist a FHIR exportból, de a diagramon marad) és egy **törlés** (×) gomb, amely a diagnózist *és* a hozzá tartozó leletet is eltávolítja a fogról. A választóból hozzáadott diagnózis megírja a mögöttes diagram-leletet is, így a jel azonnal megjelenik.
- 🗂️ **Eseti / regionális diagnózisok felugró ablaka:** a teljes szájüregre és régiókra vonatkozó diagnózisok (állcsonti rendellenességek, ciszták, nyálmirigy- és nyálkahártya-elváltozások…) kikerültek a parodontális oldalsávból egy önálló párbeszédablakba, amely az Odontogram / Parodontális státusz váltó melletti **Diagnózisok** gombbal nyitható meg; a választója kód szerint rendezett és kód-elsőbbségű.
- 🇭🇺 **BNO-10 csomag:** a magyar megjelenítési szövegek immár a hivatalos NEAK BNO-10 megnevezések, és a csomag a szabványos ICD-10 rendszer-URI-t használja (a BNO-X megegyezik a WHO ICD-10-zel).
- ✅ **HL7-validátor-tiszta FHIR export:** minden Bundle-bejegyzés determinisztikus `id`-t és abszolút `fullUrl`-t kap (nincs `urn:uuid` helyőrző), és a Bundle tartalmazza a motor saját **CodeSystem**-jét, hogy a helyi kódjai validáláskor feloldhatók legyenek; ugyanez a CodeSystem a repóban is közzé van téve `fhir/CodeSystem-odontogram.json` néven (a `includeCodeSystem: false` beállítással a FHIR export opciói között kihagyható).
- 🎯 **A diagramot követő ICD-kódok (adatvezérelt pontosság).** A szuvasodás mélysége a rögzített radiológiai mélységből származik (E1/E2 → zománc, D1–D3 → dentin), ennek hiányában az ICDAS súlyosságból (1–3 → zománc, 4–6 → dentin); ez finomítja a WHO `K02` kódját `K02.0` / `K02.1` kódra, az ICD-10-CM `K02.9` kódját pedig `K02.51/.52` (gödröcske-barázda) vagy `K02.61/.62` (sima felszín) kódra, felszín × mélység szerint. A krónikus parodontitisz ICD-10-CM kódját a 2017-es stádium és kiterjedtség adja (`K05.311`–`K05.329`). Fogankénti egy Condition, a legmélyebb érintettséggel.
- 🔄 **A parodontális adatok most már FHIR-en keresztül is oda-vissza konvertálhatók.** Az importálás visszaolvassa a LOINC 74029-0 parodontális paneleket minden fogba — tasakmélység, ínyszél (a CAL-ból visszaszámolva, így a pszeudotasak-értékek is megmaradnak), BOP, furkáció, O'Leary-plakk, a PI/GI és az implantátumos mPI/mBI indexek, valamint a keratinizált íny szélessége —, illetve a dohányzási státusz és a HbA1c evidencia-Observationök. A csak ICD-10-CM-ben vagy SNOMED CT-ben kódolt Conditionöket is felismeri, így egy idegen bundle azt importálja, amit tud.
- 🧬 **SNOMED CT a teljes diagnóziskatalógushoz.** Az 50 helyből 48 mostantól ellenőrzött SNOMED CT International koncepciót hordoz (aktív, a core modulban, egyező FSN-nel). Kettő szándékosan üresen marad, mert a SNOMED International nem rendelkezik rájuk ernyőfogalommal: állcsont-méretbeli rendellenesség (K07.0) és dentofaciális funkcionális rendellenességek (K07.5). A SNOMED overlay továbbra is opcionális marad a Beállításokban.
- 📦 **Betölthető FHIR terminológiai csomag.** A repó `fhir/` mappája egy FHIR NPM-csomag (`react-advanced-odontogram.fhir`, FHIR 4.0.1), amely tartalmazza a motor CodeSystem-jét, valamint a generált ValueSet-eket — klinikai tengelyenkénti értékcsoportonként egyet, egyet a lelet-típusokhoz, és egy összes-kódot tartalmazót. Egy validátort a `-ig ./fhir` kapcsolóval lehet ráirányítani.
- 🧰 Egységes ikon-fejléc sor lapozott (tabos) Beállítások ablakkal (Általános / Panelek / Fogadatok / Caries / Pulpa / Jegyzetek / Periodontal — számozás, jegyzetek, panel-láthatóság, ICDAS, szuvasodás-mélység kapcsoló, gyökér-/radiológiai szuvasodás részletezettség, pulpa részletezettségi szint, fogkopás/elszíneződés részletezettségi szint, fogadatok)
- 🗂️ Beállítások → "Panelek" fül: a teljes szájüreg Státusz és Ortodoncia összegző panelek egymástól függetlenül elrejthetők/megjeleníthetők
- 🦷🩺 Beállítások → "Periodontal" fül: 16 index-szintű mutatás/elrejtés kapcsoló a parodontális diagram soraihoz (csoportosítva: tasak/higiénia/mukogingivális/tartás/peri-implantáris — PD/GM/CAL/BOP, plakk, PI, GI, CEJ láthatóság, gyökér-konkavitás, KG, GT, furkáció, mobilitás, Miller-osztály, mPI, mBI), mindegyik saját leírással, valamint egy fordított-vs-kanonikus index-név megjelenítési opcióval (kanonikus = egy rögzített angol/latin tudományos név minden UI-nyelven; a tooltipek ettől a beállítástól függetlenül mindig lokalizáltak maradnak). Mindkettő alkalmazás-szintű beállítás (mint a `perioViewMode`) — sosem része az export payloadnak
- 🩹 A szekunder caries (CARS) beállítások a Caries beállítási fülbe kerültek, a Radiológiai mélység fölé pozicionálva (a korábban különálló "Szekunder caries" fül megszűnt)
- 🎚️ Fogadatok részletezettségi szint (Beállítások → Fogadatok): egy egyszerű/összetett beállítás a fogkopásra és az elszíneződésre. Egyszerű mód igen/nem kapcsolót mutat leletenként (kopás be → attrition/abrasion, elszíneződés be → other); az összetett mód (alapértelmezett) megtartja a típus/ok legördülő menüket, és a tárolt érték megmarad a szintek közti váltáskor
- 📋 Fogadatok panel: élő szöveges összegzés a teljes státuszról (fogszámok, meglévő/hiányzó listák, szuvasodás beleértve a szekundert, tömések, gyökérkezelések, fogpótlások, implantátumok, parodontális státusz) — alaphelyzetben látszik, a Beállításokban kapcsolható
- 🗂️ Egységes Export legördülő menü (Státusz JSON / FHIR / PNG / JPG)
- 📥 Import legördülő menü FHIR importtal (visszatölti az exportált Bundle-öket)
- ⏳ Folyamatjelző overlay a képexport alatt
- 🎓 18 lépéses interaktív bemutató túra
- 🔢 Három számozási rendszer (FDI, Universal, Palmer)
- 🌐 I18n — 12 UI nyelv (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) nyelvváltóval; az arab a felületet jobbról balra rendereli, a fog-/parodontális diagramokat balról jobbra rögzítve (gépi fordítás, anyanyelvi lektorálás az AR/ZH/FR nyelveknél még várat magára)
- 🌗 Sötét mód támogatás váltógombbal (önálló vagy szülő alkalmazás által vezérelt)
- 🎨 Egyedi téma konfiguráció (`themeConfig` prop) CSS custom property-kkel (`--odon-*`)
- 📱 Mobil érintéses UX: koppintásos nagyítós felugró, hosszú nyomás helyi menü, csípéses zoom, WCAG 44px érintési célpontok, fogív navigáció
- 🔌 Egyedi SVG plugin rendszer: vizuális fedvények, foganként egyedi állapot, JSON export/import támogatás — a plugin `renderSvg()` kimenete DOMPurify-jal (SVG profil) van megtisztítva, mielőtt beszúrásra kerülne az élő diagramba; a pluginok továbbra is megbízható kódként futnak, ezért csak olyan forrásból származó pluginokat töltsön be, amelyben megbízik
- 🛡️ Content-Security-Policy: a demó production build-je beszúr egy CSP meta taget (a dev szervert ez nem érinti) — a komponenst beágyazó alkalmazásoknak saját CSP-t kell beállítaniuk
- ⚠️ Állapot validáció figyelmeztetésekkel inkompatibilis fogállapot-kombinációkra
- 🏷️ Automatikus állapot tooltip a fogcsempéken (összes aktív állapot megjelenítése)
- 🩺 Modernizált fogankénti tooltip és teljes szájüreg összegző panel: mindkettő megjeleníti a klinikai leletek teljes körét (pulpa/apikális diagnózis + lézió altípus, gyökérreszorpció, peri-implantáris státusz, fokozatos gyökér szuvasodás, fogkő, korona szegélyi rés, törés, kontaktpont veszteség, típusolt metszőéli/rágófelszíni és cervikális kopás), a panelben egy dedikált "Diagnózisok" szekcióval, egy dedikált "Kopás" szekcióval, valamint egy durva caries-súlyossági minősítővel (felületes/közepes/mély)
- ♿ Billentyűzet akadálymentesítés (WCAG): ARIA listbox/option szerepkörök, Enter/Space kijelölés, nyílbillentyűs navigáció, focus-visible körvonalak
- 🔒 Csak olvasható mód: összes interakció letiltása nyomtatási/jelentés/megtekintési nézetekhez
- ✨ Kijelölési animációk: pulzáló szaggatott keret és ragyogó árnyék a kijelölt fogakon (prefers-reduced-motion támogatással)
- 📝 Fogankénti megjegyzések: dupla kattintás megjegyzés hozzáadásához/szerkesztéséhez, megjegyzés ikon a fogszám mellett, hover tooltip a megjegyzés szövegével, egy "Egyedi megjegyzések" sor a teljes szájüreg összegző panelen, szerepeltetés a PDF jelentésben, JSON export/import
- 🔀 Státusz ↔ Terv diagram-felosztás: a diagram fejlécében lévő `Státusz | Terv` kapcsoló egy aktuális **státusz** diagram és egy **terv** (tervezett, kezelés utáni állapot) diagram között vált, mindkettő saját fogállapotokkal; a terv diagram az első váltáskor a státusz másolataként indul, és az egyik diagramon végzett szerkesztés sosem hat a másikra. Az export/import (`exportStatus`/`exportFhir`/fájl import) mindig a státusz diagramot célozza; a terv diagram külön, saját API-n keresztül olvasható/írható (lásd a Nyilvános API-t lentebb), és — ha eltér a státusztól — kiegészítő `plan` szekcióként szerepel a JSON exportban
- 📝 "Mi változik" doboz: amikor a terv eltér az aktuális státusztól, a Fogadatok panel alatti doboz fogankénti és kezelési tengelyenkénti (jelenlét, szubsztrátum, pótlás, protetika, tervezett korona, ortodoncia, pulpa/endo, apikális) bontásban felsorol minden eltérést `fog: tengely  ettől → erre` sor formájában; programozottan is elérhető a `getPlanChanges()` függvényen keresztül

![Parodontális státusz diagram (magyar)](screenshot_hu_perio.png)

- 🩺 Parodontális státuszrögzítés: fogankénti hat standard ponton mért **tasakmélység (probing depth)**, **ínyszél (gingival margin)**, **véreztethetőség szondázásra (bleeding on probing)** (+ suppuráció), levezetett **klinikai tapadásvesztéssel (CAL = PD + ínyszél)**, recesszióval és teljes szájüregi **%BOP**-pal. Egy **grafikus, teljes szájüregre kiterjedő parodontális diagram** — minden fogsor **két külön, bukkális/palatinális(linguális) SVG-ként** rajzolódik (a meglévő fog-grafikát felhasználva, mindkét nézetben egységes korona-a-sáv-felé orientációval; **implantátum grafikával** az implantátum fogakhoz), piros **CEJ-vonallal**, egy **számozott milliméteres segédráccsal**, és egy, a fogak felett húzódó **ínyszél/tasakmélység görbével**, amelyet egy **központi parodontális index-sáv** (felirat: `▲ Buccal … Lingual/Palatal ▼`) oszt ketté, és amely a fogankénti közös indexeket hordozza — a **Miller-osztály** egészen felül, a **Plakk/PI/GI/mPI/mBI** pedig **anatómiai rombusz csempeként** jelenik meg foganként (bukkális csúcs felül, linguális csúcs alul, a középső sor meziális/disztális értékei oldalanként felcserélve, hogy a meziális mindig a fogív középvonala felé mutasson); a számsorok (teljes index-nevekkel — PD/GM/CAL/BOP + mobilitás + furkáció — nagyobb, érintésbarátabb cellákban) oszlopokba rendezve, összegzéssel (átlag PD/CAL, %BOP, PI%), **billentyűzetes automatikus továbblépéssel** történő rögzítéssel; a diagram **dinamikusan a rendelkezésre álló szélességhez igazodik**, bármilyen ablakméretnél reszponzív. Egy `Odontogram | Periodontal Status` **nézetváltóként** jelenik meg, amelynek jobb oldali panelje — amíg ez a nézet aktív — egy **parodontális kontextus oldalsávvá** alakul (páciens adatok, a 2017-es klasszifikáció és a teljes szájüreg összegzés) (egy Beállítás opció visszaváltja az egész megjelenítést **felugró ablakra**), és továbbra is **önállóan meghívható komponens** (`PerioChart` export), így egy befogadó alkalmazás a parodontális diagramot az odontogramtól függetlenül is előhívhatja. Fogankénti **FHIR** export a LOINC parodontális panelen keresztül (`74029-0`; PD `32910-2`, recesszió `32911-0`, CAL `32912-8`)
- 🅿️ Javasolt (proposed) stílus: Terv módban azok a leletek, amelyeket a terv **hozzáad** az aktuális státuszhoz képest (tervezett korona, extrakció, ortodonciai elmozdulás, protetika, …), egy jellegzetes **szaggatott, színezett "javasolt" körvonallal** jelennek meg, hogy a terv szándékként és ne tényként olvasható — egy "szaggatott = javasolt" jelmagyarázattal a diagram kártyán. A Státusz módú megjelenítés byte-azonos marad; a kezelés csak a tervben létezik, és visszaváltáskor teljesen visszaáll
- 🚦 Terv módú szűrés (gating): a Terv diagram csak azt mutatja, amit a fogorvos *tenni* tud — az alap választó csak Hiányzó / Maradó / Implantátum opciókat kínál, és a csak-státusz leletek (caries, fogkopás, elszíneződés, valamint a teljes parodontális blokk — mobilitás, hat pontos szondázási rács, gyulladásos/parodontális módosítók, fogkő, peri-implantáris státusz) rejtve vannak; a Pulpa/Endo kezelőelem megtartja az endodonciai **kezelést** (gyökértömés / csap / rezekció / parapulpális csap), miközben elrejti a pulpa/apikális **diagnózist** és a gyökérreszorpciót. A pótlás, protetika, ortodoncia, korona-szükséges/csere és a fogeltávolítási terv továbbra is tervezhető marad
- 🧪 Kiterjedt automatizált Vitest tesztcsomag, amely lefedi a számozást, fordításokat, preseteket, i18n-t, App komponenst, témát, érintést, plugineket, akadálymentesítést és a klinikai tengelyek/diagnózisok paritását
- 📖 TypeDoc API dokumentáció JSDoc kommentekkel minden publikus exporton (`npm run docs`)

### 📦 Modulok
- 🦷 Odontogram rács és fogcsempe UI
- 🎛️ Vezérlők és státusz panel
- 🎨 SVG rétegelő motor és fogsablonok
- 🔢 Fogszámozás és címke generálás (FDI/Universal/Palmer)
- 🌐 Lokalizáció — 12 UI nyelv (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), beleértve az arabot (RTL)
- 💾 Státusz export/import
- 📋 Státusz extrák: előre definiált restaurációs sablonok
- 🎨 Téma konfiguráció: testreszabható színpaletta `--odon-*` CSS property-kkel
- 📱 Mobil érintéses interakciók (koppintásos nagyító, hosszú nyomás, csípéses zoom, fogív váltó)
- 🔌 Egyedi SVG plugin rendszer
- ⚠️ Állapot validáció és tooltip rendszer
- ♿ Billentyűzet akadálymentesítés és ARIA támogatás
- 🔒 Csak olvasható mód
- ✨ Kijelölési animációk
- 📝 Fogankénti megjegyzés rendszer
- 🧪 Automatizált tesztcsomag (Vitest + Testing Library)

### 🛠️ UI vezérlők

**🔝 Fejléc sáv:**
- Nyelvválasztó (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR legördülő)
- Sötét mód váltógomb (nap/hold ikon, világos és sötét téma között vált)
- Számozási rendszer választó (FDI/Universal/Palmer legördülő)
- Státusz exportálás / Státusz importálás gombok

**📊 Diagram fejléc:**
- Okkluzális nézet kapcsoló
- Bölcsességfog láthatóság kapcsoló
- Csont láthatóság kapcsoló
- Pulpa láthatóság kapcsoló
- Kiválasztás törlése gomb

**🔍 Kiválasztási szűrők:**
- Összes kiválasztása / Összes jelenlévő / Maradó / Tej / Implantátumok / Összes hiányzó
- Felső / Felső front 6 / Felső molárisok
- Alsó / Alsó front 6 / Alsó molárisok

**📋 Státusz minták:**
- Összes visszaállítása (szájüreg alaphelyzet)
- Tejfogazat
- Vegyes fogazat
- Fogatlan kapcsoló

**📦 Státusz extrák legördülő:**
- Felső/Alsó cirkon hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó fém hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó részleges kivehető protézisek
- Felső/Alsó teljes kivehető protézisek
- Felső/Alsó bár protézisek implantátumokkal

**🦷 Fog szerkesztő panel** (a kijelölt fog(ak)hoz, összecsukható kártyákba csoportosítva):
- **Alap sor:** fog kiválasztás (alaptípus, beleértve a törött-korona változatokat) és fogszubsztrátum (natural/radix/broken/crownprep)
- **Pótlás sor:** a kombinált "Fix: …" / "Kivehető: …" pótlás legördülő menü (`restorationType`×`restorationMaterial` fix opciók, plusz a `prosthesis` csatlakozós/kivehető opciók, a fog típusa szerint szűrve); korona szegélyi rés jelölőnégyzet (csak korona/híd); törött-korona hely jelölőnégyzetek; korona szükséges / koronacsere szükséges kapcsolók
- **Kopás és elszíneződés sor:** metszőéli/rágófelszíni kopás típus legördülő menü, cervikális kopás típus legördülő menü, elszíneződés ok legördülő menü (mindegyik egyszerű igen/nem kapcsolóra vált a Beállítások → Fogadatok → egyszerű mód alatt)
- **Ortodoncia kártya:** készülék, meziális/disztális elmozdulás, vertikális mozgás (extrúzió/intrúzió), rotáció kapcsoló — egy meglévő természetes fogon jelenik meg
- **Caries kártya:** caries-mélység mód legördülő menü, korona alatti caries jelölőnégyzet, gyökér-caries súlyosság legördülő menü, valamint a B/M/O/D/L felületenkénti caries választó egy kontextusfüggő ICDAS-mélység/CARS felugró ablakkal és egy radiológiai-mélység jelvénnyel
- **Tömések kártya:** tömőanyag legördülő menü, felületenkénti tömés választó (felületenkénti anyaggal), felületenkénti tömésdefektus jelző (marginális/törés/kopás), subcaries és tömésdefektus figyelmeztető megjegyzések
- **Gyökér és fogágy kártya:** összevont "Pulpa / Endo státusz" választó, apikális diagnózis választó, periapikális lézió altípus választó (csak tünetekkel járó/tünetmentes apikális periodontitis esetén), gyökérreszorpció típus választó, mobilitási fok választó, peri-implantáris státusz választó (csak implantátumokon)
- **Speciális jelzők:** fogeltávolítási terv/seb, zárt foghiány, barázdazárás, kontaktpont veszteség, fogkő, parapulpális csap, endo rezekció, hídpillér

### 🦷 Fogtípusok és állapotok

**Fog kiválasztás (alaptípus):**
| Érték | Leírás |
|---|---|
| `none` | Hiányzó fog |
| `tooth-base` | Maradó fog |
| `milktooth` | Tejfog |
| `implant` | Fogimplantátum |
| `tooth-under-gum` | Íny alatti (előbújatlan) fog |

**Tört fog változatok:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Fogszubsztrátum (maradó fogak):**
`natural` (alapértelmezett), `radix` (gyökércsonk), `broken`, `crownprep` (koronaelőkészített)

**Pótlás típusa (maradó fogak):**
`none`, `crown`, `inlay`, `onlay` (csak okkluzális nézet), `veneer`, `bridge`

**Pótlás anyaga (maradó fogak):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (a korábbi `metal` koronák ide migrálódnak), `telescope`, `temporary`

**A pótlási opciókat a fog típusa szűkíti** (`restorationOptions()`, `src/registry/restorations.ts`): egy implantátum csak `crown`/`bridge` pótlás típusokat kínál (kiegészítve egy implantátum-csatlakozó réteggel), plusz az alábbi öt `prosthesis` csatlakozási bejegyzést; egy hiányzó/foghiány fog csak `bridge` pontikot kínál, plusz a két kivehető fogsor `prosthesis` bejegyzést; egy `radix` szubsztrátum teljesen elrejti a pótlás-vezérlőt. A korábbi lapos `crownMaterial`/`bridgeUnit` mezők (a v1.14 előtti implantátum/híd csatlakozási értékek) megszűntek az élő modellből — csak írásvédett migrációs útként fogadja el a régi payloadokat.

**Protetika** (`prosthesis`; független kivehető/csatlakozós tengely, a kombinált pótlás legördülő menüben "Kivehető:" bejegyzésekként jelenik meg):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (implantátum csatlakozók, overdenture-rel vagy anélkül), `removable-partial`, `removable-full` (fogtámasztékú fogsorok egy hiányzó/foghiány fogon). Egy fognak vagy fix pótlása, vagy protetikája van, sosem mindkettő — az egyik beállítása törli a másikat.

**Korona szegélyi rés** (`crownLeakage`; logikai): csak akkor jelenik meg, ha a `restorationType` értéke `crown` vagy `bridge`; aktiválja a `crown-leakage` grafikai réteget.

**Endodonciai lehetőségek (maradó fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetőségek (tejfogak):**
`none`, `endo-medical-filling`

Az `endo` és a `pulpDx` egyetlen összevont "Pulpa / Endo státusz" `<select>` mezőn keresztül érhető el (csoportosítva: vitális pulpa vs. kezelt/endo), és kölcsönösen kizárják egymást — egy kezelt (`endo != none`) opció kiválasztása a `pulpDx` értékét `normal`-ra állítja vissza, egy pulpa diagnózis kiválasztása pedig az `endo` értékét `none`-ra állítja vissza.

**Tömőanyagok (maradó fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tömőanyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tömés/szuvasodás felületek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak szuvasodáshoz)

**Módosítók:**
`inflammation` (periapikális), `parodontal` (parodontális), `mobility` (M1/M2/M3)

**Periapikális lézió típusa** (`periapicalType`; a periapikális jelölést minősíti, csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg):
`none`, `granuloma`, `cyst` — rögzíthető opciók; a korábbi `abscess` érték továbbra is elfogadott/tárolt, de a választóban már nem kínált fel, mivel duplikálja az apikális diagnózist. Importáláskor eldobásra kerül: ha a fogon szerepel a gyulladás módosító, beleolvad az `apicalDx`-be, egyébként `none`-ra törlődik

**Pulpa diagnózis** (AAE terminológia; `pulpDx`):
`normal`, `reversible-pulpitis` (csökkentett méretű pulpa jelölést jelenít meg), `irreversible-pulpitis`, `necrosis` — kölcsönösen kizárja az `endo`-t; gyökérkezelt fogon `normal`-ra normalizálódik

**Pulpa diagnózis, gyakorlati latin** (`pulpLatin`; a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa részletezettségi szint** (`pulpDetailLevel`, globális beállítás): `simple`, `aae` (alapértelmezett), `latin` — meghatározza, hogy a választó milyen pulpa terminológiát kínál

**Apikális diagnózis** (`apicalDx`; a periapikális jelölést határozza meg):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Gyökérreszorpció típusa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Peri-implantáris státusz** (`periImplant`; csak implantátumokon, 2018-as World Workshop staging): a `mucositis` újrahasznosítja a parodontális íny jelölést; a `peri-implantitis-*` hozzáadja a `peri-implant-bone-loss` réteget, súlyosság szerint skálázott átlátszósággal (enyhe 0,4 / közepes 0,7 / súlyos 1,0). Az implantátumok többé nem jelenítik meg a periapikális lézió jelölést (a gyulladásukat ehelyett ez a tengely fejezi ki), és a `mods` gyulladás/parodontális jelölőnégyzetek rejtve vannak implantátumokon:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Caries súlyosság** (`cariesSeverity`; egységesített, felületenkénti mező, `0`–`6`): tömés nélküli felületen az ICDAS caries-mélység skálaként olvasandó (`superficial` / `dentin` / `deep`, vagy a nyers ICDAS II kódok `0–6`, ha az `enableIcdas` be van kapcsolva), és az elsődleges `caries-{surface}` réteget jeleníti meg; tömött felületen elnevezett CARS pontszámként olvasandó (`0` ép … `6` kiterjedt üreg), és helyette a `subcaries-{surface}` (szekunder caries) réteget jeleníti meg — egy felület soha nem elsődleges és szekunder egyszerre

**Gyökér szuvasodás** (`rootCaries`; bekapcsolja a `caries-root` grafikai réteget egy meglévő fogon, a súlyosságtól függő átlátszósággal — `active` 0,5 / `arrested` 0,7 / `active-cavitated` teljes átlátszóság):
`none`, `active`, `arrested`, `active-cavitated`

**Radiológiai szuvasodás mélység** (`radiographicDepth`; felületenként, független a vizuális ICDAS/CARS `cariesSeverity` skálától):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Szuvasodás-részletezettségi beállítások** (globális): `secondaryCariesMode` (`simple`/`standard`/`full`, alapértelmezett `standard`), `rootCariesMode` (`simple`/`severity`, alapértelmezett `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, alapértelmezett `off`), `cariesDepthEnabled` (logikai, alapértelmezett `true`) — mindegyik egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték módosítása nélkül

**Speciális jelzők:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Fogkopás** (`wearEdge`, `wearCervical`; hely szerinti klinikai típus, feltétele: tooth-base + nincs pótlás + természetes szubsztrátum; a meglévő `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` rétegeket rendereli):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Elszíneződés** (`discoloration`; fogankénti ok, feltétele: természetes tooth-base vagy tejfog + nincs pótlás + természetes szubsztrátum; a megjelenő természetes korona kitöltését árnyalja — nincs új SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Tömésdefektus** (`fillingDefect`; felületenként, közvetlen restauráció lelet, függetlenül a szekunder caries-tól — feltétele, hogy a felület szerepeljen a `fillingSurfaceMaterials`-ban; a `defect-{surface}` grafikai réteget rendereli):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; fogankénti, feltétele egy meglévő természetes fog — maradó vagy tej):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (felfelé mutató nyíl jelölés), `intrusion` (lefelé mutató nyíl jelölés) — `orthoRotation`: logikai

**Fogadatok / jelölés beállítások** (globális munkamenet-beállítások, Beállítások → Fogadatok): `wearDetailLevel` és `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, alapértelmezett `complex` — egyszerű mód igen/nem kapcsolót mutat a teljes típus/ok legördülő menü helyett, a tárolt érték módosítása nélkül), valamint `surfaceNotation` (`simple`/`full`, alapértelmezett `full` — meghatározza, hogy a caries/tömés felület betűjelek/feliratok pozíciófüggőek-e; lásd a fenti "Pozíciófüggő felület-jelölés" részt)

### ⚙️ Beállítások
A fejléc fogaskerék ikonjával nyitható; egy focus-trapped, ARIA `dialog` lapozott (tabos) elrendezéssel (Esc/háttérre kattintás a bezáráshoz, nyílbillentyűk a fülek közti váltáshoz). Minden beállítás csak munkamenet-szintű UI állapot, hacsak másképp nincs jelezve — egyik sem módosítja a fogankénti adatokat vagy az export payloadot.

- **Általános:** számozási rendszer (FDI/Universal/Palmer), nyelv, sötét/világos téma, fogadatok panel láthatósága
- **Odontogram:** fogazatanatómia-profil (`classic` alapértelmezett / `measured`) — a `measured` kilenc, szakirodalom alapján bemért fogsablont jelenít meg két fogív, fogankénti szélesség elrendezésben; futásidőben váltható, a `classic` alapértelmezésre nincs hatással
- **Panelek:** a teljes szájüreg Státusz kártya és az Ortodoncia kártya egymástól függetlenül elrejthető/megjeleníthető (mindkettő alapértelmezésben látható)
- **Fogadatok:** kopás részletezettségi szint és elszíneződés részletezettségi szint (egyszerű/összetett, mindkettő alapértelmezetten összetett), felület-jelölés (egyszerű/teljes, alapértelmezett: teljes)
- **Caries:** ICDAS II pontozás kapcsoló (`enableIcdas`), caries-mélység kapcsoló (`cariesDepthEnabled`), gyökér-caries részletezettség (`rootCariesMode`: simple/severity), szekunder/CARS részletezettség (`secondaryCariesMode`: simple/standard/full), radiológiai-mélység részletezettség (`radiographicDepthMode`: off/threeLevel/detailed) — a korábban különálló "Szekunder caries" fül ebbe olvadt bele, a CARS vezérlő közvetlenül a radiológiai mélység fölé kerülve
- **Pulpa:** pulpa részletezettségi szint (`pulpDetailLevel`: simple/AAE/gyakorlati latin, alapértelmezett AAE) — meghatározza, hogy a "Pulpa / Endo státusz" választó milyen terminológiát kínál; módosításakor a teljes szájüreg összegzés és minden nyitott tooltip azonnal frissül
- **Jegyzetek:** fogankénti megjegyzések be/kikapcsolása (`enableNotes`)
- **Periodontal:** index-szintű mutatás/elrejtés kapcsolók mind a 16 parodontális diagram sorhoz (`perioRowVisibility`, alapértelmezetten mind látható), csoportosítva Tasak (PD/GM/CAL/BOP) / Higiénia (Plakk/PI/GI) / Mukogingivális (CEJ láthatóság/Gyökér-konkavitás/KG/GT) / Tartás (Furkáció/Mobilitás/Miller-osztály) / Peri-implantáris (mPI/mBI) csoportokba, mindegyik saját leírással; valamint egy fordított-vs-kanonikus index-név mód (`perioIndexNameMode`: alapértelmezetten `translated` / `canonical` — egy rögzített angol/latin tudományos név minden UI-nyelven). Csak alkalmazás-szintű beállítások (a `perioViewMode`-ot tükrözve) — sosem szerializálódnak, a tooltipek mindkét módban lokalizáltak maradnak

### 🖼️ SVG sablon rendszer

**Fogsablonok** (`src/assets/teeth-svgs/`):
| Sablon | Használó fogak |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (metszőfogak) |
| `13.svg` | 13, 23, 33, 43 (szemfogak) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (kis őrlőfogak) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (nagy őrlőfogak) |

A sablonok az alsó állcsontnál 180 fokkal elforgatva, a bal oldalnál vízszintesen tükrözve jelennek meg.

**Ikon SVG-k** (`src/assets/icon-svgs/`):
`icon_8.svg` (bölcsesség), `icon_gum.svg` (csont), `icon_no_selection.svg` (törlés), `icon_occl.svg` (okkluzális nézet), `icon_pulp.svg` (pulpa)

### 🔢 Számozási rendszerek

**FDI (ISO 3950):** Felnőtt fogak 11-18, 21-28, 31-38, 41-48. Tejfogak 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Felnőtt fogak 1-32 számozással. Tejfogak A-T betűkkel.

**Palmer (Zsigmondy-Palmer):** Kvadráns + pozíció formátum (pl. UR-1, LL-5). Tejfogak kvadránsonként A-E betűkkel.

### 🚀 Használat
Fejlesztés indítása:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Előzetes megtekintés:
```bash
npm run preview
```

### 🔗 Integráció
A komponens beágyazható bármely React alkalmazásba.
Példa:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="hu"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Sötét mód integráció:**
- **Önálló mód:** A `darkMode` prop elhagyása — a komponens saját maga kezeli a téma állapotát a fejléc váltógombján keresztül, és hozzáadja/eltávolítja a `.dark` osztályt a `<html>` elemen.
- **Vezérelt mód:** A `darkMode` és `onDarkModeChange` átadása — a szülő alkalmazás vezérli a témát. A váltógomb továbbra is megjelenik, de a `onDarkModeChange` callbacket hívja a belső állapot kezelése helyett. A szülő alkalmazás felelős a `.dark` osztály hozzáadásáért/eltávolításáért a `<html>` elemen.

**Egyedi téma:**
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

**Plugin integráció:**
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

// Plugin állapot beállítása egy foghoz:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Tesztelés
```bash
npm run test           # A teljes Vitest tesztcsomag futtatása
npm run test:watch     # Figyelési mód
npm run test:coverage  # Lefedettségi jelentés
```

### 📖 API Dokumentáció

🅰️ **Angular verzió:** elérhető egy hivatalos Angular port, az [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` néven az npm-en) — a JSON és FHIR R4 exportok kölcsönösen visszatölthetők a két könyvtár között.

```bash
npm run docs           # TypeDoc dokumentáció generálása a docs/ mappába
```

### 📡 Nyilvános API

**Komponens propok:**

| Prop | Típus | Alapértelmezett | Leírás |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI nyelv (hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr) |
| `onLanguageChange` | `(lang) => void` | — | Callback nyelvváltáskor |
| `numberingSystem` | `string` | `'FDI'` | Számozási rendszer (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback számozásváltáskor |
| `darkMode` | `boolean` | `undefined` | Sötét mód állapot. Elhagyva: önálló mód. |
| `onDarkModeChange` | `(dark) => void` | — | Callback sötét mód váltáskor. Szükséges vezérelt módhoz. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Egyedi szín felülírások CSS custom property-kkel (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Egyedi SVG pluginek vizuális fedvényekhez és foganként egyedi állapothoz. |
| `readOnly` | `boolean` | `undefined` | Összes interakció letiltása (kattintás, érintés, billentyűzet). Nyomtatási/jelentés nézetekhez. |
| `enableNotes` | `boolean` | `undefined` | Fogankénti megjegyzések engedélyezése. Dupla kattintás a fogra megjegyzés hozzáadásához/szerkesztéséhez. |

**Exportált függvények külső vezérléshez:**

| Függvény | Leírás |
|---|---|
| `initOdontogram()` | Motor inicializálása és összes fog renderelése |
| `destroyOdontogram()` | Motor leállítása és eseménykezelők eltávolítása |
| `setNumberingSystem(system)` | Váltás FDI, Universal, Palmer között |
| `clearSelection()` | Összes fog kiválasztásának törlése |
| `setOcclusalVisible(on)` | Okkluzális nézet be/ki |
| `setWisdomVisible(on)` | Bölcsességfogak mutatása/elrejtése |
| `setShowBase(on)` | Csont réteg mutatása/elrejtése |
| `setHealthyPulpVisible(on)` | Egészséges pulpa mutatása/elrejtése |
| `registerPlugins(plugins)` | Egyedi SVG pluginek regisztrálása |
| `setPluginState(toothNo, pluginId, value)` | Plugin egyedi állapot beállítása egy foghoz |
| `getPluginState(toothNo, pluginId)` | Plugin egyedi állapot lekérdezése egy foghoz |
| `getToothStateSummary(toothNo)` | Lokalizált összesítés az összes aktív állapotról |
| `getOdontogramSummary()` | Strukturált, lokalizált szöveges összegzés a teljes státuszról (fogszámok, szekciók) |
| `onStateChange(callback)` | Feliratkozás állapotváltozásra; leiratkozó függvényt ad vissza |
| `setReadOnly(value)` | Csak olvasható mód be/kikapcsolása |
| `getReadOnly()` | Aktuális csak olvasható állapot lekérdezése |
| `setNotesEnabled(value)` | Fogankénti megjegyzések be/kikapcsolása |
| `getNotesEnabled()` | Aktuális megjegyzés-engedélyezés állapot lekérdezése |
| `setPulpDetailLevel(level)` | A pulpa választó terminológiájának beállítása — `"simple"`, `"aae"` vagy `"latin"` |
| `getPulpDetailLevel()` | Aktuális pulpa részletezettségi szint lekérdezése |
| `getChartMode()` | Az aktuálisan aktív diagram lekérdezése — `"status"` vagy `"plan"` |
| `setChartMode(mode)` | Az aktív diagram átváltása `"status"`-ra vagy `"plan"`-re; a terv diagram az első belépéskor mélymásolatként jön létre a státuszból |
| `getStatusChart()` | A státusz diagram payloadjának lekérdezése (`{version, globals, teeth}`), függetlenül attól, melyik diagram aktív éppen |
| `getPlanChart()` | A terv diagram payloadjának lekérdezése (`{version, globals, teeth}`), függetlenül attól, melyik diagram aktív éppen |
| `setPlanChart(payload)` | A terv diagram fogainak cseréje egy payloadból (a státusz érintetlen marad); a terv diagramot inicializáltnak jelöli |
| `getPlanChanges()` | A strukturált státusz→terv eltérés lekérdezése (`{ toothNo, axis, from, to }[]`) — egy bejegyzés fogankénti és kezelési tengelyenkénti eltérésre a státusz és terv diagram között; üres, ha nincs terv. A `getOdontogramSummary()`-n is megjelenik `plannedChanges` néven |
| `setPerioSite(toothNo, site, patch)` | Parodontális adat beállítása a hat pont egyikén (`patch` = `{ pd?, gm?, bop?, sup? }`); a `pd` null/`<1` értéke törli a pont rögzítettségét. Validál és korlátoz (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Egy fog pontonkénti parodontális rekordjának lekérdezése (csak a rögzített pontok) |
| `getToothCal(toothNo)` | Egy fog pontonkénti, levezetett CAL értékének lekérdezése (`pd + ínyszél`) |
| `getPerioSummary()` | Teljes szájüregi parodontális összesítők: rögzített pontok száma, vérzések száma, %BOP, legrosszabb CAL, max PD |
| `getPerioChart()` | Az aktív diagram fogankénti parodontális rekordjainak lekérdezése |
| `PerioChart` | React komponens (nevesített export) — a teljes szájüregre kiterjedő parodontális diagram overlay (`{ open, onClose }`), amely az `OdontogramShell`-től függetlenül is beágyazható a befogadó alkalmazás integrációjához |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | A parodontális diagram overlay programozott megnyitása/bezárása/lekérdezése — lehetővé teszi, hogy a befogadó alkalmazás az odontogramtól külön hívja elő a parodontális diagramot (megosztott eset-állapot) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | A parodontális diagram megjelenítési módjának lekérdezése/beállítása — `"toggle"` (egy `Odontogram \| Dental Chart` nézetváltó, alapértelmezett) vagy `"popup"` (az overlay) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | A Dental Chart kiemelő overlay lekérdezése/beállítása — `"none"` (alapértelmezett) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; az adott mérték szerint újrafesti a fogakat (csak megjelenítés, a meglévő adatok felett) |
| `getToothRecessionType(toothNo)` | A levezetett **Cairo recesszió típus** lekérdezése — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (a fog interproximális vs. bukkális CAL értékéből számítva) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Fogankénti CEJ láthatóság — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Fogankénti gyökérfelszíni konkavitás — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Felületenkénti Silness-Löe Plakk Index fokozat — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Felületenkénti Löe-Silness Gingivális Index fokozat — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Fogankénti bukkális keratinizált íny szélesség mm-ben — `0`-`15`, vagy `null`, ha nincs rögzítve |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Fogankénti íny vastagsági fenotípus — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Fogankénti Miller recesszió osztály — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Csak implantátumon — felületenkénti Mombelli módosított Plakk Index (mPI) fokozat — `0`-`3`; nem-implantátum fogon hatástalan |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Csak implantátumon — felületenkénti Mombelli módosított Sulcus Vérzési Index (mBI) fokozat — `0`-`3`; nem-implantátum fogon hatástalan |
| `furcationEntrances(toothNo)` | Egy fog furkáció-bejáratai — `["mesial","distal","buccal"]` (felső őrlők), `["buccal","lingual"]` (alsó őrlők), `["mesial","distal"]` (felső első kis őrlők), egyébként `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Bejáratonkénti furkáció-érintettség beállítása/lekérdezése (Glickman `1`–`4`; `null` törli) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | O'Leary plakk-jelenlét beállítása/lekérdezése felületenként (meziális/disztális/bukkális/linguális); a teljes szájüregi PI%-ot táplálja a `getPerioSummary()`-ban |
| `getCaseMeta()` | Az eset-szintű metaadat objektum lekérdezése (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — egyetlen megosztott blokk, nem fogankénti/kettős állapotú (a felső szintű `globals` payload kulcsot tükrözi); a parodontális stádium/grádus klasszifikációt és a PDF jelentés fejlécét táplálja |
| `setPatientName(v)` | Az eset páciensnevének beállítása (körbevágva; üres string vagy `null` törli) — csak azonosítási adat, sosem kerül be a parodontális levezetésbe |
| `setPatientDob(v)` | Az eset páciens születési dátumának beállítása (`ÉÉÉÉ-HH-NN`; érvénytelen/üres törli) — csak a PDF jelentéshez tartozó azonosítási adat |
| `setExamDate(v)` | Az eset vizsgálati dátumának beállítása (`ÉÉÉÉ-HH-NN`; érvénytelen/üres törli) |
| `setCaseAge(v)` | Az eset páciens életkorának beállítása években — `0`-`120`, vagy `null` a törléshez |
| `setSmokingStatus(v)` | Az eset dohányzási státuszának beállítása — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Napi cigaretta-szám beállítása (csak `"current"` dohányzási státusz esetén értelmezhető) — `0`-`99`, vagy `null` a törléshez |
| `setDiabetesStatus(v)` | Az eset diabétesz-státuszának beállítása — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | HbA1c % beállítása (csak `"present"` diabétesz-státusz esetén értelmezhető) — `3.0`-`20.0` (egy tizedesjeggyel), vagy `null` a törléshez |
| `setToothLossPerio(v)` | Parodontitis miatt elveszített fogak számának beállítása — `0`-`32`, vagy `null` a törléshez |
| `setMaxRblPercent(v)` | Maximális radiológiai csontveszteség %-ának beállítása — `0`-`100`, vagy `null` a törléshez |
| `resetCaseMeta()` | Az eset-szintű metaadat objektum visszaállítása üres alapértékekre |
| `getPerioClassification()` | A 2017-es World Workshop parodontális klasszifikáció lekérdezése (`{diagnosis, stage, grade, extent, derived, overridden}`) — a diagnózis/stádium/grádus/kiterjedtség a rögzített parodontális adatokból és az eset metaadatokból van levezetve, mindegyik tengelyt a klinikus felülbírálása vált fel, ha be van állítva (a `derived` mindig az érintetlen számított értékeket adja, az `overridden` jelzi, mely tengelyek lettek felülbírálva) |
| `setDiagnosisOverride(v)` | A levezetett parodontális diagnózis felülbírálása — `"health"` / `"gingivitis"` / `"periodontitis"`, vagy `null` a törléshez (visszaáll a levezetett értékre) |
| `setStageOverride(v)` | A levezetett parodontális stádium felülbírálása — `"I"` / `"II"` / `"III"` / `"IV"`, vagy `null` a törléshez (visszaáll a levezetett értékre) |
| `setGradeOverride(v)` | A levezetett parodontális grádus felülbírálása — `"A"` / `"B"` / `"C"`, vagy `null` a törléshez (visszaáll a levezetett értékre) |
| `setExtentOverride(v)` | A levezetett parodontális kiterjedtség felülbírálása — `"localized"` / `"generalized"` / `"molar-incisor"`, vagy `null` a törléshez (visszaáll a levezetett értékre) |
| `exportFhir(options?)` | Az odontogram exportálása HL7 FHIR R4 collection Bundle-ként (JSON letöltés). Opcionális `{ subject }` referencia; egyébként placeholder Patient kerül be |
| `exportImage(format)` | Az odontogram letöltése képként — `"png"` vagy `"jpg"` |
| `exportSvg()` | Az odontogram letöltése méretezhető SVG-ként (vektoros) |
| `hasAnyPerioData()` | `true`, ha bármely parodontális tengely rögzítve van bárhol a szájüregben — ez vezérli a parodontális export automatikus kihagyását, és üres diagram esetén letiltja a parodontális export-menüpontokat |
| `exportPerioSvg()` | A teljes parodontális diagram (fog-grafikák + számsorok + 2017-es klasszifikáció) letöltése egyetlen önálló vektoros SVG-ként, amely az állapotból, DOM nélkül épül fel a `buildPerioSvg()` segítségével |
| `exportPerioImage(format)` | A parodontális diagram letöltése raszterizált képként — `"png"` vagy `"jpg"` |
| `exportPdf(opts)` | Egy jsPDF-natív PDF jelentés letöltése (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, mindegyik szekció opcionális) — vektoros szöveg plusz raszterizált fog-/parodontális diagram képek; az egyedi megjegyzések szekció automatikusan kimarad, ha egyetlen fogon sincs megjegyzés, a két parodontális szekció pedig akkor, amikor a `hasAnyPerioData()` hamis, függetlenül az `opts`-tól |
| `importFhirBundle(input)` | A modul által készített FHIR R4 Bundle importálása (objektum vagy JSON szöveg) |
| `setImportFormat(format)` | A következő fájlimport értelmezőjének beállítása — `"status"` vagy `"fhir"` |
| `startIntroTour()` | A 18 lépéses interaktív bemutató túra indítása |

### 💾 Állapotmentés (localStorage)

Opcionálisan bekapcsolható `localStorage`-perzisztencia az odontogram eset-állapotához (`src/persistence.ts`, a csomag belépési pontjáról újraexportálva). Alapértelmezetten kikapcsolva — a meglévő integrációkat nem érinti, amíg egy host alkalmazás explicit módon be nem kapcsolja, és a bekapcsolást az odontogram mountolása **után** kell meghívni (a visszaállítás az `importStatus()`-on keresztül újrarajzolja az élő DOM-ot):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // alapértelmezett: "react-advanced-odontogram"
  includePlan: true,          // a terv-diagram mentése is; alapértelmezett: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Függvény | Leírás |
|---|---|
| `enablePersistence(options?)` | Visszaállít egy korábban mentett esetet (ha van) az `importStatus()`-on keresztül, majd minden állapotváltozáskor elmenti a státusz-diagramot a `localStorage`-ba. Idempotens — ismételt hívása lecseréli az előző feliratkozást/beállításokat. **Az odontogram mountolása után kell meghívni.** |
| `disablePersistence()` | Leállítja a mentést; a tárolt bejegyzés a helyén marad. |
| `clearPersistedState()` | Törli az aktív (vagy alapértelmezett) kulcshoz tartozó tárolt bejegyzést. |
| `isPersistenceEnabled()` | `true`, amíg egy állapotváltozás-feliratkozás aktív. |

**`PersistenceOptions`:**

| Mező | Típus | Alapértelmezett | Leírás |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | A `localStorage` kulcs. |
| `includePlan` | `boolean` | `false` | A terv-diagram (a payload `plan` mezője) mentése is. |
| `onError` | `(err: Error) => void` | — | Bármilyen tárolási/feldolgozási hiba esetén ez hívódik meg a `console.warn` helyett. |

Megjegyzések: a `localStorage`-ba semmi nem kerül beolvasásra vagy kiírásra, amíg meg nem hívja az `enablePersistence()`-t; egy 4 MB-os méretkorlát dobás helyett kihagyja a túl nagy mentést (az `onError`/`console.warn`-on keresztül jelezve); minden tárolási/JSON hiba — kvóta túllépés, lezárt iframe, sérült vagy fel nem ismert tárolt adat stb. — el van kapva és jelentve. Ez a modul soha nem dob kivételt.

Megjegyzés: a perzisztencia bekapcsolása az `importStatus()`-on keresztül visszaállítja a mentett esetet, ami lecseréli az aktuális esetet — beleértve egy folyamatban lévő terv-diagramot is, ha a mentett payloadban nincs terv. A perzisztenciát induláskor (közvetlenül a mountolás után) kapcsolja be, ne munkamenet közben.

Megjegyzés: a mentett payload tartalmazhat beteg-azonosító eset-adatokat (betegnév, vizsgálat dátuma) egyszerű szövegként a `localStorage`-ban. Ha ilyen adatokat rögzít, gondoskodjon eszközszintű védelemről, vagy törölje a `clearPersistedState()` függvénnyel, amikor szükséges.

### 💾 Állapot Export/Import formátum
Az export egy JSON fájlt hoz létre (`2.22` verziójú; az importálás továbbra is elfogadja a korábbi `1.4` és `2.0`–`2.21` verziókat, és automatikusan migrálja őket), amely tartalmazza:

**Globális mezők:**
- `wisdomVisible` - bölcsességfogak láthatók
- `showBase` - csont réteg látható
- `occlusalVisible` - okkluzális nézet aktív
- `showHealthyPulp` - egészséges pulpa látható
- `edentulous` - fogatlan mód aktív

**Fogankénti mezők (32 fog):**
- `toothSelection` - alap fog típusa
- `toothSubstrate` - fogszubsztrátum (natural/radix/broken/crownprep), bármely pótlástól függetlenül
- `restorationType` - pótlás típusa (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - pótlás anyaga (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), a `restorationType`-hoz párosítva
- `prosthesis` - kivehető/csatlakozós tengely (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), kölcsönösen kizárja a fix korona/híd `restorationType`-ot
- `crownLeakage` - korona szegélyi rés jelző, csak akkor releváns, ha a `restorationType` korona vagy híd
- `endo` - endodonciai állapot; kölcsönösen kizárja a `pulpDx`-et (egyetlen összevont "Pulpa / Endo státusz" választón keresztül érhetők el együtt — egy fog kezelése a `pulpDx`-et `normal`-ra normalizálja)
- `mods` - módosítók tömbje (inflammation, parodontal); az `inflammation` megszűnt a felületen meglévő fogaknál (ott az `apicalDx` határozza meg a jelölést), de továbbra is érvényes hiányzó/extrakciós alveolus fogaknál
- `caries` - aktív szuvasodási felületek
- `cariesActiveDepth` - a caries-mélység választó által ideiglenesen tárolt ICDAS-mélység érték új felület alkalmazásakor (nem felületenkénti tárolt érték; a felületenkénti mezőhöz lásd a `cariesSeverity`-t)
- `rootCaries` - gyökér szuvasodás súlyossága (none/active/arrested/active-cavitated)
- `cariesSeverity` - egységesített, felületenkénti súlyossági érték (0-6): ICDAS mélység egy elsődleges (tömés nélküli) felületen, CARS pontszám egy szekunder (tömött) felületen
- `radiographicDepth` - felületenkénti radiológiai szuvasodás mélység (none/E1/E2/D1/D2/D3), független a vizuális ICDAS/CARS skálától
- `fillingMaterial` - tömőanyag
- `fillingSurfaces` - tömött felületek
- `fillingSurfaceMaterials` - felületenkénti tömőanyag (vegyes tömések, pl. bukkális amalgám + disztális kompozit)
- `fillingDefect` - felületenkénti tömésdefektus (none/marginal/fracture/wear), feltétele egy tömött felület, függetlenül a szekunder caries-tól
- `pulpDx` - AAE pulpa diagnózis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); a reversible-pulpitis csökkentett méretű jelölést jelenít meg
- `pulpLatin` - gyakorlati latin pulpa altípus (a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`)
- `apicalDx` - apikális diagnózis, amely meghatározza a periapikális jelölést
- `periapicalType` - periapikális lézió altípus (none/granuloma/cyst), csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg; a korábbi `abscess` érték importáláskor még elfogadott
- `resorptionType` - gyökérreszorpció típusa (none/internal/external-cervical)
- `periImplant` - csak implantátumon értelmezett peri-implantáris státusz (none/mucositis/peri-implantitis-mild/-moderate/-severe), 2018-as World Workshop staging
- `dxOverrides` - fogankénti diagnóziskódolási felülbírálás (2.21-es verziótól): egy objektum, amely ICD-10 diagnóziskulcsonként `add` | `suppress` értéket tartalmaz, kényszerítve egy kódolt diagnózist annak ellenére, hogy nincs hozzá illeszkedő leletezett elváltozás, vagy kikapcsolva azt annak ellenére, hogy van; ez alakítja ki az FHIR `Condition`-ként exportált tényleges kódolt diagnózishalmazt
- `endoResection` - rezekció jelzője
- `fissureSealing` - barázdazárás jelzője
- `calculus` - fogkő jelzője
- `contactMesial` - meziális kontaktpont veszteség
- `contactDistal` - disztális kontaktpont veszteség
- `wearEdge` - metszőéli/rágófelszíni kopás típusa (none/attrition/erosion)
- `wearCervical` - cervikális kopás típusa (none/abrasion/abfraction/erosion)
- `discoloration` - fogankénti elszíneződés oka (none/tetracycline/fluorosis/nonvital/extrinsic/other), a természetes koronát árnyalja egy pótlás nélküli, természetes szubsztrátumú tooth-base/tejfogon
- `orthoAppliance` - ortodonciai készülék (none/bracket/band)
- `orthoDrift` - ortodonciai elmozdulás (none/mesial/distal)
- `orthoVertical` - ortodonciai vertikális mozgás (none/extrusion/intrusion)
- `orthoRotation` - ortodonciai rotáció jelző
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - törési helyek
- `extractionWound` - fogeltávolítás utáni seb
- `extractionPlan` - tervezett fogeltávolítás
- `parapulpalPin` - parapulpális csap jelzője
- `bridgePillar` - hídpillér fog
- `mobility` - mobilitási fok (none/m1/m2/m3)
- `crownNeeded` - korona szükséges jelzője
- `crownReplace` - koronacsere szükséges jelzője
- `missingClosed` - záródott foghiány a fogeltávolítás után
- `customStates` - plugin egyedi állapotok (objektum, plugin azonosító szerint kulcsozva)
- `note` - fogankénti szöveges megjegyzés (szöveg, opcionális — csak ha nem üres)

**Felső szintű `plan` mező (2.11-es verziótól):**
- `plan` - opcionális objektum, ugyanolyan alakú, mint a `teeth` (a fenti fogankénti mezők), amely a **terv** (tervezett, kezelés utáni állapot) diagramot tartalmazza. Csak akkor jelenik meg, ha a terv diagram inicializálva lett (a `Státusz | Terv` kapcsolót legalább egyszer Tervre váltották) ÉS tartalma eltér a státusz diagramtól — egy csak-státusz export teljesen kihagyja, és a verziószámon kívül byte-azonos marad egy 2.11 előtti exporttal. Importáláskor a `plan` hiánya törli/deinicializálja a terv diagramot (sosem éleszt fel egy, az import előttről megmaradt elavult tervet); a jelenlévő `plan` a státusszal együtt visszaállítja a terv diagramot is. A terv diagram az import/export mezőtől függetlenül is olvasható/írható a `getPlanChart()`/`setPlanChart()` függvényekkel (lásd a Nyilvános API-t fentebb), és a `getStatusChart()` mindig a státusz-elsődleges payloadot adja vissza, függetlenül az aktív diagram módtól.

**Felső szintű `case` objektum (2.17-es verziótól, bővítve 2.18-ban, 2.19-ben, 2.20-ban és 2.22-ben):**
- `case` - opcionális, eset-szintű metaadat objektum — NEM fogankénti és NEM kettős állapotú (ugyanaz az objektum osztott a státusz és a terv diagram között, a felső szintű `globals` payload kulcsot tükrözve). Tartalmazza a páciens életkorát (`age`, 0-120), a dohányzási státuszt (`smokingStatus`: unknown/never/former/current, `cigarettesPerDay` 0-99 értékkel), a diabétesz-státuszt (`diabetesStatus`: unknown/none/present, `hba1c` 3.0-20.0 értékkel), két parodontális kimenet-összegző mutatót (`toothLossPerio` 0-32 és `maxRblPercent` 0-100), a 2017-es parodontális klasszifikáció klinikusi felülbírálásait (`diagnosisOverride`/`stageOverride`/`gradeOverride`/`extentOverride`), valamint három eset-azonosító mezőt — (2.19-es verziótól) `patientName` (körbevágott szöveg vagy `null`) / `examDate` (`ÉÉÉÉ-HH-NN` vagy `null`); és (2.20-as verziótól) `patientDob` (`ÉÉÉÉ-HH-NN` vagy `null`) — amelyeket kizárólag a PDF jelentés fejléce használ, máshol nem; egyik sem része a FHIR exportnak. Emellett (2.22-es verziótól) tartalmazza a `caseConditions` mezőt is — eset-/regionális diagnózisok (maloklúzió és állkapocsízületi (TMJ) rendellenesség K07, szájüregi ciszták K09, nyálmirigy-betegségek K11, stomatitis és szájnyálkahártya-elváltozások K12/K13, fogazati fejlődési rendellenességek K00), mindegyik oldaliság szerint besorolva (nem meghatározott / bal / jobb / kétoldali). Az üres mezők kihagyásával szerializálódik, és a teljes `case` objektum hiányzik, ha minden mezője az alapértékén van. A `getCaseMeta()`/`resetCaseMeta()` és az egyedi setterek kezelik (lásd a Nyilvános API-t fentebb).

### 🖨️ Export
Az `exportFhir()` HL7-validátor-tiszta Bundle-t készít: minden bejegyzés determinisztikus `id`-t és abszolút `fullUrl`-t kap (nincs `urn:uuid` helyőrző), és a Bundle tartalmazza a motor saját CodeSystem-jét, hogy a helyi kódjai validáláskor feloldhatók legyenek (ugyanez `fhir/CodeSystem-odontogram.json` néven a repóban is elérhető; a `includeCodeSystem: false` beállítással kihagyható).

A parodontális adatok mostantól a FHIR importon keresztül is oda-vissza konvertálhatók, nem csak a JSON payloadon át: az `importFhirBundle()` visszaolvassa a LOINC `74029-0` parodontális paneleket minden fog parodontális rekordjába — tasakmélység, ínyszél (a CAL-ból visszaszámolva, így a pszeudotasak-értékek is megmaradnak), BOP, furkáció, O'Leary-plakk, a PI/GI és az implantátumos mPI/mBI indexek, valamint a keratinizált íny szélessége —, illetve az eset szintű dohányzási státusz és HbA1c evidencia-Observationök. A suppuráció az egyetlen kivétel: az csak JSON-ban marad, mivel nem része a FHIR exportnak.

Az odontogram saját Státusz JSON / FHIR / PNG / JPG / SVG exportján túl a **parodontális diagramnak** saját export útvonala van:
- **Parodontális SVG/PNG/JPG:** az `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` a teljes parodontális diagramot (fog-grafikák + számsorok + a 2017-es klasszifikáció) egyetlen önálló vektoros SVG-ként rendereli (`buildPerioSvg()`), a beágyazott `PerioChart` DOM-tól függetlenül. A három export-menüpont le van tiltva, amikor a `hasAnyPerioData()` hamis (egy üres diagramnak nincs mit exportálnia parodontálisan).
- **PDF jelentés:** az export menü "PDF report…" pontja megnyitja az `ExportOptionsModal`-t — egy beállítás-ablakot (páciensnév + születési dátum + vizsgálati dátum mezők, közvetlenül az eset metaadatokhoz kötve, a vizsgálati dátum alapértelmezetten a mai napra áll; szekció-jelölőnégyzetek: páciens adatok, odontogram diagram, odontogram leírás, egyedi megjegyzések — letiltva, ha egyetlen fogon sincs megjegyzés —, parodontális státusz, parodontális leírás), mielőtt meghívná az `exportPdf(opts)`-ot. Az üres azonosító mezők helyettesítő értékre esnek vissza ("John Doe" / "1980-01-01"), így az export mindig sikeres. A PDF jsPDF-natívan épül fel — vektoros szöveg `.text()`-tel, raszterizált fog-/parodontális diagram képek `.addImage()`-dzsel — **svg2pdf.js függőség nélkül**. Az egyedi megjegyzések szekció automatikusan kimarad, ha egyetlen fogon sincs megjegyzés, a két parodontális szekció pedig akkor, amikor a `hasAnyPerioData()` hamis, függetlenül az ablak jelölőnégyzeteitől.
- **mPI/mBI implantátum-szűrés:** a peri-implantáris Mombelli indexek (mPI/mBI) csak olyan fogsorban jelennek meg sorként, amely tartalmaz legalább egy implantátum fogat — mind az élő parodontális diagramon, mind az SVG/PDF exportokban.
- A páciensnév, a születési dátum és a vizsgálati dátum csak diagram-azonosító metaadat (payload `2.20`, additív) — **nem** része a FHIR exportnak.

### 📁 Mappastruktúra
- `src/App.tsx` - UI váz, fejléc vezérlők, nyelv/számozás/sötét mód/téma/plugin választó
- `src/odontogram.ts` - SVG rétegelő motor, fog állapotkezelés, érintéses interakciók, plugin fedvények, UI összekötés
- `src/plugin.ts` - `OdontogramPlugin` típus, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index prioritások
- `src/theme.ts` - `OdontogramThemeConfig` típus és `applyThemeConfig()` segédfüggvény
- `src/status_extras.ts` - 34 előre definiált restaurációs sablon (hidak, protézisek, bár konstrukciók)
- `src/i18n/` - fordítások (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) és i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer számozási konverzió
- `src/registry/` - deklaratív klinikai-tengely registry: FHIR mezőmegfeleltetések, SVG-törlési-halmaz/logikai-jelző aktiválás, pótlás típus×anyag mátrix, UI opciólisták (egyetlen forrás, amely generálja az export/import, FHIR és a választó UI-t)
- `src/fhir/` - HL7 FHIR R4 export/import: `toFhir.ts`/`fromFhir.ts`, kódrendszerek, mezőmegfeleltetések, primitívek
- `src/bridgeOverlay.ts` - több fogra kiterjedő híd-csatlakozó overlay (ívhez igazodó nyereg-geometria)
- `src/SettingsModal.tsx` - lapozott (tabos) Beállítások ablak (Általános/Panelek/Fogadatok/Caries/Pulpa/Jegyzetek/Periodontal)
- `src/perioExport.ts` - `buildPerioSvg()`: a teljes parodontális diagram egyetlen önálló vektoros SVG-ként
- `src/perioPdf.ts` - az `exportPdf()` tiszta jsPDF jelentés-összeállítója (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - a "PDF report…" export-beállítási ablak
- `src/__tests__/` + `src/registry/__tests__/` - kiterjedt automatizált Vitest tesztcsomag
- `src/assets/teeth-svgs/` - SVG fogsablonok (6 fájl: metszők, szemfogak, kis őrlők, nagy őrlők + okkluzális nézetek)
- `src/assets/icon-svgs/` - eszköztár ikon SVG-k (5 fájl)

### ⚙️ Technológia
- React 18 + Vite + TypeScript
- Tailwind CSS a UI stílusokhoz
- SVG rétegelés DOM manipulációval (nem React state, a teljesítmény érdekében)
- Egyszerű egyedi i18n rendszer
- Vitest + Testing Library automatizált tesztekhez
- TypeDoc API dokumentációhoz
- Vite útvonal alias: `@` a `./src` mappára képezve

### 📝 Megjegyzések
- A SVG sablonok `src/assets/teeth-svgs` és `src/assets/icon-svgs` mappa alól kerülnek betöltésre, ezért statikus hostingnál a public mappa elérhetősége kötelező.
- Az odontogram motor saját belső állapotot használ (nem React state) a teljesítmény és egyszerűség érdekében.
- A tejfogaknál szűkebb anyagválaszték áll rendelkezésre (nincs amalgám tömés, nincs csapos endodonciai kezelés).
- Az implantátum fogaknál a korona/felépítmény lehetőségek eltérnek a természetes fogakétól.

---

### 🔒 Biztonsági megjegyzések

- **A pluginok megbízható kódként futnak.** Egy plugin `renderSvg()` visszatérési értéke bekerül az élő diagram SVG-jébe. Ez a kimenet a beszúrás előtt [DOMPurify](https://github.com/cure53/DOMPurify)-jal van megtisztítva (SVG profil, plusz `svgFilters`) — a `<script>`, `<iframe>`, `<object>`, `<embed>` és `<foreignObject>` elemek eleve tiltottak, és egy teljesen rosszindulatú kimenet inkább eldobásra kerül, mintsem részlegesen renderelődjön. Ez csökkenti egy kompromittált vagy hibás plugin okozta kárt, de a pluginokat továbbra is csak megbízható forrásból szabad betölteni — a tisztítás egy biztonsági háló, nem az ellenőrzés helyettesítője.
- **Content-Security-Policy.** A demó **production build-je** ezt a szabályzatot szúrja be egy `<meta http-equiv="Content-Security-Policy">` tag formájában (a dev szervert ez nem érinti):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Az `OdontogramShell`-t beágyazó alkalmazásoknak a saját telepítésükhöz illő CSP-t kell beállítaniuk — a komponens könyvtárként való használat esetén nem szúr be sajátot.

### 📖 Hivatkozás

Ha ezt a modult használod a munkádban, kérlek hivatkozz rá.

**Ez a verzió (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Összes verzió (koncepció DOI):** https://doi.org/10.5281/zenodo.21156787

> A fenti, összes verzióra vonatkozó koncepció DOI mindig a legutóbb archivált
> kiadásra mutat; egy verzió-specifikus DOI minden kiadáshoz akkor jön létre,
> amikor azt archiválják a Zenodón. Amíg a v2.4.0 nincs archiválva, a koncepció
> DOI-val hivatkozz rá.

A géppel olvasható hivatkozási metaadatok a [`CITATION.cff`](../CITATION.cff) fájlban találhatók.

## 📄 License

Created with ❤️ by [Zoltan Dul](https://www.linkedin.com/in/zoltandul/) (2026)
Released under the MIT License.

## 🙌 Köszönet

A React Advanced Odontogramot Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)) készíti és tartja karban, ő a teljes motor megalkotója és vezető fejlesztője. Az alább felsorolt közreműködők értékes segítségével. Köszönet mindenkinek, aki hozzájárult.

**Közreműködők**

- [@odontodev](https://github.com/odontodev): állapot hidratálás és életciklus API, tömésbeállítások vezérelt propként, idempotens setterek és összecsukható kártyák
- [@JulianoBazzi](https://github.com/JulianoBazzi): brazil portugál fordítás
- [@yassine-bhn](https://github.com/yassine-bhn): francia fordítás és a felmért anatómia jelöltje
- [@saegerdirk-star](https://github.com/saegerdirk-star): felmért foganatómia és a foggenerátor, valamint a komponálható felület javaslata

**Felhasznált eszközök:** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) és [Tailwind CSS](https://tailwindcss.com).

A hozzájárulásokat szívesen fogadjuk. Nyiss egy pull requestet a GitHubon, és itt feltüntetünk. Ha hasznosnak találod a projektet, kérlek [csillagozd a GitHubon](https://github.com/ZoliQua/React-Odontogram-Modul).
