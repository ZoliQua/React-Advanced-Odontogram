<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/src/assets/react-module-logo.png" alt="React Advanced Odontogram logo" width="160" />
</p>

# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Advanced-Odontogram/releases)
[![Version](https://img.shields.io/badge/version-2.6.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Advanced-Odontogram)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md)

---

## 📑 Obsah

- [📋 Prehľad](#-prehľad)
- [📦 Použitie ako npm balík](#-použitie-ako-npm-balík)
- [✨ Kľúčové funkcie](#-kľúčové-funkcie)
- [📦 Moduly](#-moduly)
- [🛠️ Ovládacie prvky rozhrania](#-ovládacie-prvky-rozhrania)
- [🦷 Typy a stavy zubov](#-typy-a-stavy-zubov)
- [⚙️ Nastavenia](#-nastavenia)
- [🖼️ Systém SVG šablón](#-systém-svg-šablón)
- [🔢 Systémy číslovania](#-systémy-číslovania)
- [🚀 Použitie](#-použitie)
- [🔗 Integrácia](#-integrácia)
- [🧪 Testovanie](#-testovanie)
- [📖 Dokumentácia API](#-dokumentácia-api)
- [📡 Verejné API](#-verejné-api)
- [💾 Perzistencia stavu (localStorage)](#-perzistencia-stavu-localstorage)
- [💾 Formát exportu/importu stavu](#-formát-exportuimportu-stavu)
- [🖨️ Export](#-export)
- [📁 Štruktúra priečinkov](#-štruktúra-priečinkov)
- [⚙️ Technologický zásobník](#-technologický-zásobník)
- [📝 Poznámky](#-poznámky)
- [🔒 Bezpečnostné poznámky](#-bezpečnostné-poznámky)
- [📖 Ako citovať](#-ako-citovať)

## 🇸🇰 Slovenčina

### 📋 Prehľad
Tento projekt je interaktívny, prehliadačovo orientovaný editor odontogramu, ktorý umožňuje rýchle zaznamenávanie zubného statusu s prehľadným rozhraním. Vykresľuje vrstvené SVG šablóny zubov na reprezentáciu reštaurácií, kazu, endodontického stavu, mobility a ďalších klinických detailov, pričom poskytuje viacnásobný výber, filtre výberu a preddefinované stavové predvoľby.

---
![Odontogram – náhľad (slovenčina)](screenshot_sk_odontogram.png)

🔗 **Test URL:** https://react-advanced-odontogram.vercel.app/

---

### 📦 Použitie ako npm balík

Odontogram sa distribuuje ako samostatná knižnica React komponentov na npm:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Požiadavky
- **React 18 alebo 19** (deklarovaný ako peer dependency — zabezpečuje ho vaša aplikácia).
- **Bundler**, ktorý rozumie poľu `exports` a formátu ESM: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. Balík je **iba ESM**.
- Node **≥ 18** pre nástroje.

#### Inštalácia

```bash
npm install react-advanced-odontogram react react-dom
```

#### Základné použitie

Vykreslite `OdontogramShell` a **raz** kdekoľvek vo vašej aplikácii importujte hárok štýlov:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="sk"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Vlastnosti (props) komponentu

`OdontogramShell` je riadený (controlled) komponent. Najbežnejšie vlastnosti:

| Vlastnosť | Typ | Predvolená hodnota | Popis |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Jazyk používateľského rozhrania (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Systém číslovania zubov. |
| `darkMode` | `boolean` | `false` | Prepínač tmavého motívu. |
| `readOnly` | `boolean` | `false` | Vypne všetko úpravy (iba na zobrazenie). |
| `themeConfig` | `OdontogramThemeConfig` | — | Prepíše CSS premenné motívu (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registrácia vlastných stavových pluginov / ďalších vrstiev. |
| `enableNotes` | `boolean` | `false` | Povolí poznámky pre jednotlivé zuby. |
| `enableIcdas` | `boolean` | `false` | Povolí hodnotenie kazu podľa ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Zložitosť výplne: `"simple"` (jeden materiál na zub) alebo `"complex"` (materiály podľa plôch). |
| `fillingDefectEnabled` | `boolean` | `true` | Zapína záchyt defektov výplne na karte Výplne. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | všetky dostupné | Dostupné výplňové materiály ako boolovská mapa nad `amalgam`/`composite`/`gic`/`temporary` (neznáme kľúče sa ignorujú). |
| `fissureSealingEnabled` | `boolean` | `true` | Zapína zapečatenie fisúr na karte Výplne. |
| `screenToothSpacing` | `"wide" \| "normal" \| "close"` | `"normal"` | Rozostup zubov na obrazovke. |
| `screenToothNumberSize` | `"small" \| "normal" \| "xlarge"` | `"normal"` | Veľkosť čísla zuba v mriežke. |
| `selectionColor` | `string` | `"#3b7bff"` | Farba výberového prstenca (`#rrggbb`). |
| `selectionBorderStyle` | `"solid" \| "dashed" \| "dotted"` | `"dashed"` | Štýl okraja výberového prstenca. |
| `toothInfo` | `boolean` | `true` | Zobraziť panel informácií o zube. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Spustí sa, keď používateľ zmení príslušné nastavenie v Nastavenia → Výplne. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Spustí sa, keď používateľ zmení nastavenie z rozhrania. |

Akceptujú sa aj jemnejšie vlastnosti úrovne detailu (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — úplný, typovaný zoznam nájdete v dodaných typoch `.d.ts`.

Štyri vlastnosti výplní vyššie slúžia **iba na obnovenie**: vynechaná vlastnosť nikdy nezapisuje do enginu (imperatívne volanie `setFillingComplexity()` pred pripojením sa zachová, samostatný režim sa nemení), zatiaľ čo dodaná vlastnosť zapisuje engine aj stav modalu Nastavenia súčasne, takže modal nikdy nezobrazuje zastaranú hodnotu. `fillingMaterialAvailability` sa aplikuje rozdielovo cez kanonický serializovaný kľúč — opätovné vykreslenie s inline literálom rovnakého obsahu nikdy neprepisuje engine. Príslušné spätné volania `on*Change` sa spúšťajú z Nastavenia → Výplne: cesta spätného zápisu pre hostiteľov ukladajúcich preferencie.

#### Verejné API (pomenované exporty)

`OdontogramShell` je zároveň predvoleným aj pomenovaným exportom. Imperatívne stavové API, samostatný komponent `PerioChart`, sprievodná prehliadka a všetky verejné typy sú pomenované exporty z rovnakého vstupného bodu:

```ts
import {
  OdontogramShell,           // aj predvolený export
  PerioChart,                // samostatný komponent parodontálnej karty
  // čítanie stavu
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // odber zmien stavu
  // export / import
  exportFhir,                // balík HL7 FHIR R4
  exportSvg, exportImage,    // vektorový / rastrový export karty
  setImportFormat,
  // ovládanie
  setReadOnly, getReadOnly,
  clearSelection, getSelectedTeeth,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // spustenie úvodnej prehliadky
  // …a mnoho ďalších funkcií nastavení setX/getX
} from "react-advanced-odontogram";
```

Celý rozsah (≈ 44 funkcií + typy ako `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) je plne typovaný v priložených deklaráciách.

#### Skladateľné povrchy (pokročilé)

`OdontogramShell` je podporovaný komponent všetko v jednom a nevyžaduje žiadne ďalšie nastavenie. Ak potrebujete umiestniť oblasti odontogramu do rôznych častí vlastného rozloženia, štyri používateľské povrchy shellu sú tiež exportované a možno ich poskladať pod jediným `OdontogramProvider`, pričom všetky zdieľajú jednu reláciu spravovanú balíkom:

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

`OdontogramProvider` prijíma rovnaké props ako `OdontogramShell`. Na tvorbu vlastných povrchov je k dispozícii hook `useOdontogramUi()` (a typ `OdontogramUiContextValue`). Aktuálne obmedzenie: použite jeden provider na stránku. Povrchy možno pripájať a odpájať podľa potreby — pri opätovnom pripojení sa automaticky znova naviažu. Samotný `OdontogramShell` je nezmenený — je to presne táto kompozícia v predvolenom usporiadaní.

Pre ešte jemnejšie skladanie sú exportované aj jednotlivé ovládacie karty — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` a `ToothDetailsCard` — každá je samostatný deklaratívny komponent, ktorý číta a zapisuje zdieľanú reláciu cez API motora (na tvorbu vlastných je exportovaný hook `useEngineState()`). Pripojte len tie karty, ktoré dané rozloženie potrebuje, v ľubovoľnom usporiadaní, pod jediným `OdontogramProvider`.

#### Použitie s Next.js (App Router)

Komponent funguje iba na strane klienta, preto ho vykresľujte z klientskeho komponentu:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="sk" numberingSystem="FDI" />;
}
```

Alebo ho načítajte pomocou dynamického importu iba na strane klienta: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Dôležité poznámky a súčasné obmedzenia
- **Iba ESM** — balík publikuje jeden ES modul (`dist/odontogram.js`) plus vstupný bod deklarácie typov (`dist/index.d.ts`). Je cielený na rozlíšenie modulov bundlerom; neexistuje CommonJS zostavenie.
- **Hárok štýlov je samostatný** — **musíte** raz importovať `react-advanced-odontogram/style.css`; nevkladá sa automaticky. Štýlovanie je globálne CSS ohraničené pod `.odontogram-root` a riadené CSS premennými `--odon-*`.
- **SSR / iba klient** — komponent pri pripojení číta DOM (`document`), preto musí bežať v prehliadači. V SSR frameworkoch ho vykresľujte v klientskom komponente (`"use client"`) alebo cez dynamický import iba na strane klienta.
- **Zdroje sú samostatné** — SVG súbory zubov a ikon sú pri zostavení vložené priamo do JavaScriptového balíka; **nie je potrebné konfigurovať žiadne získavanie zdrojov za behu** a nič netreba kopírovať do vášho verejného priečinka.
- **Jedna inštancia na stránku** — stav enginu je momentálne singleton na úrovni modulu, takže vykreslenie dvoch inštancií `<OdontogramShell>` na tej istej stránke by spôsobilo, že by zdieľali stav jednej karty. Podpora viacerých inštancií je plánovaná pre budúce vydanie.

---

### ✨ Kľúčové funkcie
- 🖱️ Rýchly výber a viacnásobný výber (CMD/CTRL + klik)
- 🦷 Typy zubov: trvalý, mliečny, implantát, subgingiválny, chýbajúci
- 🦷 Substrát zuba (nezávislý od akejkoľvek náhrady): prirodzený, radix (zvyšok koreňa), zlomený, preparovaný na korunku
- 👑 Náhrady podľa typu × materiálu: korunka / inlay / onlay / fazeta / mostík z e.max, zlata, gradie, zirkónu, kovu, kovovo-keramického materiálu, teleskopu alebo dočasného materiálu (onlay je dostupný len v okluzálnom zobrazení) — vyberané z jedného kombinovaného výberu s nízkym počtom klikov „Fix: Korunka – …"; staršie korunky `metal` sa automaticky migrujú na `metal-ceramic` (kovovo-keramickú); implantáty používajú rovnaký model typ × materiál, doplnený o vrstvu konektora implantátu. Výber je obmedzený podľa druhu zuba: implantát ponúka iba korunku/mostík (plus svojich päť možností upevnenia, pozri nižšie); chýbajúci/medzerový zub ponúka iba článok mostíka (plus snímateľnú čiastočnú/celkovú protézu); substrát `radix` úplne skrýva ovládací prvok náhrady (na zvyšku koreňa nemožno zaznamenať žiadnu náhradu)
- 🦿 Snímateľná/náustavcová protetika na vyhradenej osi `prosthesis` (položky „Kivehető:" v kombinovanom výbere): hojivý abutment implantátu, lokátor, lokátor s protézou (overdenture), steg, steg s protézou; zubami podopretá snímateľná čiastočná alebo celková náhrada
- 🌉 Zuby mostíka vykresľujú súčasne korunkový uzáver aj sedlový konektor; prekrytie viaczubového mostíkového úseku vykresľuje jeden súvislý, oblúku prispôsobený konektor cez po sebe idúce zuby mostíka (články + piliere) a medzizubné medzery medzi nimi (horný a dolný oblúk používajú zrkadlenú geometriu sedla, čím zostáva konektor zarovnaný na oboch oblúkoch), zahrnuté v exporte PNG/JPG/SVG; aplikovanie mostíka cez predvoľbu stavov okamžite prepočíta prekrytie
- 🔍 Zaznamenávanie kazu na 6 plochách: meziálne, distálne, bukálne, linguálne, oklúzne, subkoronálne
- 🪥 Materiály výplní na každú plochu: amalgám, kompozit, GIC, dočasný
- 🏥 Jeden zlúčený výber „Stav drene / endo" (zoskupený: vitálna dreň vs. liečená/endo): endodontické stavy (liečivá výplň, koreňová výplň, nekompletná koreňová výplň, sklený kolík, kovový kolík) a AAE diagnóza drene (`pulpDx`: normálna / reverzibilná / ireverzibilná pulpitída / nekróza) sa navzájom vylučujú — zub s ošetreným koreňovým kanálikom (nastavené `endo`) nemôže mať zároveň diagnózu vitálnej drene; pri ošetrení sa `pulpDx` normalizuje na `normal` a glyf chorej drene sa potlačí. Reverzibilná pulpitída sa zobrazuje ako zmenšený glyf drene. Voliteľné 3-úrovňové nastavenie podrobnosti drene (`pulpDetailLevel`: simple / AAE / praktická latinčina) cez `pulpLatin` sprístupňuje 9 praktických latinských podtypov drene (pulpa sana … gangraena pulpae); resekcia a parapulpálny kolík zostávajú samostatnými špeciálnymi indikátormi
- 🦴 Apikálna diagnóza (`apicalDx`: symptomatická/asymptomatická apikálna parodontitída, akútny/chronický apikálny absces, kondenzujúca osteitída) priamo určuje periapikálny glyf; kvalifikátor podtypu lézie granulóm/cysta sa zobrazuje iba pri symptomatickej/asymptomatickej apikálnej parodontitíde (redundantný podtyp „absces" bol odstránený — je už pokrytý apikálnou diagnózou)
- 🩹 Zlúčená karta „Koreň a parodont" (jedna zbaliteľná sekcia pre nálezy koreňa/periapikálnej oblasti a parodontu)
- ⚕️ Modifikácie: periapikálny zápal (zobrazený iba na chýbajúcich zuboch/zuboch s extrakčnou ranou; skrytý na prítomných zuboch, kde periapikálny glyf priamo určuje `apicalDx`, a na implantátoch, kde ho pokrýva `periImplant`), parodontálne ochorenie, stupne mobility (M1/M2/M3, skryté na implantátoch)
- 🦷🔩 Stav peri-implantátu (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — stagingovanie podľa 2018 World Workshop, zobrazené ako vyhradený výber na implantátoch; mukozitída opätovne používa parodontálny glyf ďasna, peri-implantitída pridáva odstupňovanú vrstvu `peri-implant-bone-loss` (priehľadnosť 0,4/0,7/1,0). Implantáty už nezobrazujú glyf periapikálnej lézie — ich zápal sa namiesto toho vyjadruje touto osou — a modifikátorové zaškrtávacie políčka parodontu sú na implantátoch skryté (provizórne premenovanie zaškrtávacieho políčka „Peri-implantitída" bolo zrušené)
- 🏷️ Špeciálne indikátory: potrebná korunka, potrebná výmena korunky, uzavretá medzera po strate zuba, plán extrakcie, zapečatenie fisúr, strata kontaktného bodu
- 👁️ Oklúzny pohľad, zuby múdrosti, prepínače viditeľnosti kosti a drene
- 🔢 12 filtrov výberu (všetky, prítomné, trvalé, mliečne, implantáty, chýbajúce, horné/dolné, predné/moláre)
- 📊 Preddefinované stavové predvoľby (obnoviť, mliečny chrup, zmiešaný chrup, bezzubý)
- 📦 34 preddefinovaných šablón reštaurácií (mostíky, snímateľné protézy, stegové protézy s implantátmi)
- 💾 Export/import stavu v JSON (verzia 2.22; import stále akceptuje staršie verzie 1.4 a 2.0 až 2.21 a automaticky ich migruje, s vlastnými stavmi pluginov a poznámkami ku každému zubu)
- 💽 Voliteľná (opt-in) perzistencia stavu v `localStorage` (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — predvolene vypnutá; automaticky ukladá stavový graf (a voliteľne aj plánovací graf) pri každej zmene stavu a obnoví ho pri ďalšom pripojení komponentu, s limitom veľkosti 4 MB a chybami pri ukladaní/parsovaní smerovanými do callbacku `onError` (alebo `console.warn`) namiesto vyhodenia výnimky
- 🔗 Export HL7 FHIR R4 (kolekcia Bundle s Observations pre každý zub, kódovanie zubov ISO 3950 pre trvalý chrup **aj** mliečne zuby (51-85, obojsmerne bezstratovo pri importe), lokálny systém kódov, plus voliteľná vrstva SNOMED CT (Nastavenia → SNOMED CT)); komponent kazu so zaznamenanou závažnosťou nesie aj kódovanie skórovacieho systému — ICDAS na primárnej (nevyplnenej) ploche, CARS na rekurentnej (vyplnenej)
- ✚ Krížový výber plôch (B/M/O/D/L) pre kaz a výplne
- 🧱 Materiály reštaurácie pre každú plochu (zmiešané výplne, napr. bukálny amalgám + distálny kompozit)
- 🖼️ Export obrázka odontogramu vo formáte PNG/JPG/SVG (na stiahnutie; PNG/JPG rastrovaný z vektorového SVG)
- 🦷 Kaz/sekundárny kaz ako stavový automat na každú plochu: kazivá plocha bez výplne sa zobrazuje ako primárny kaz (priehľadnosť odstupňovaná podľa ICDAS); hneď ako má táto plocha výplň, zobrazuje sa namiesto toho ako sekundárny (rekurentný) kaz (vrstva `subcaries-{surface}`, so skóre CARS) — obidva nikdy nie sú aktívne súčasne na tej istej ploche
- 🎯 Zjednotená závažnosť na plochu (`cariesSeverity`, 0–6, nahrádza pôvodné oddelené polia hĺbky ICDAS a CARS): na primárnej ploche sa číta ako hĺbka ICDAS, na rekurentnej ako pomenované skóre CARS (Zdravý … Rozsiahla kavita), prostredníctvom kontextového popupu, ktorý zobrazuje iba škálu relevantnú pre aktuálny stav plochy
- 🌱 Kaz koreňa (`rootCaries`: none / active / arrested / active-cavitated), aktivujúci vyhradenú vrstvu ilustrácie kazu koreňa s priehľadnosťou závislou od závažnosti (active 0,5 / arrested 0,7 / active-cavitated plná priehľadnosť)
- 📡 Rádiografická hĺbka kazu (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 na plochu), nezávislá od vizuálnej škály závažnosti ICDAS/CARS, zobrazená ako odznak a obojsmerne prenášaná cez vlastný FHIR Observation
- 🎚️ Tri nastavenia podrobnosti kazu (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) a prepínač `cariesDepthEnabled`, ktoré zbaľujú každú škálu do jednoduchšieho výberu bez straty uloženej hodnoty
- 🩹 Súhrnný riadok sekundárneho kazu v paneli výplní: pod ovládacími prvkami výplní vypíše každý vybraný zub so sekundárnym kazom a jeho plochy (napr. „36 (O) má pri výplni nastavený sekundárny kaz.")
- 🪛 Poruchy výplne na každú plochu (`fillingDefect`: none / marginal / fracture / wear) na priamych reštauráciách, nezávislé od sekundárneho kazu — zaznamenávané cez indikátor pre každú plochu na karte Výplne (podľa vzoru indikátora hĺbky kazu, so zvislo usporiadaným zoznamom možností), zobrazené na odontograme a v tooltipe aj v súhrne výplní za celé ústa s explicitným popiskom (napr. „36 (O) – Porucha výplne: O: okrajová"), rovnakým spôsobom, akým je označený sekundárny kaz v riadku Kaz; karta Výplne tiež zobrazuje upozorňujúcu poznámku pre každý vybraný zub so zaznamenanou poruchou výplne (napr. „36 má zaznamenanú poruchu výplne."), paralelne s existujúcou poznámkou o sekundárnom kaze
- 🦷💥 Opotrebenie zuba typizované podľa klinickej príčiny a miesta (`wearEdge`: none / attrition / erosion, incizálne/oklúzne; `wearCervical`: none / abrasion / abfraction / erosion, cervikálne) — nahrádza dva staré prepínače opotrebenia zap/vyp z bruxizmu; zaznamenávané cez dva rozbaľovacie zoznamy v riadku opotrebenia, opätovne používa existujúcu ilustráciu opotrebenia a zobrazuje sa v tooltipe a novej sekcii súhrnu „Opotrebenie" za celé ústa
- 🎨 Zafarbenie zuba podľa príčiny (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) na trvalých aj mliečnych zuboch — zafarbí zobrazenú prirodzenú korunku reprezentatívnou farbou, keď zub nemá náhradu a má prirodzený substrát; zobrazené v tooltipe a novej sekcii súhrnu „Zafarbenie" za celé ústa; dopĺňa sadu povrchových a štrukturálnych nálezov popri poruchách výplne a opotrebení
- ✏️ Predné zuby (rezáky/špičáky) označujú svoju hryzaciu plochu v celom rozhraní ako „incizálnu" (výber, popup, súhrny); uložený kľúč plochy zostáva `occlusal`
- 🔤 Notácia plôch citlivá na polohu zuba (Nastavenia → Detaily zuba → „Notácia plôch", simple/full, predvolené full): v režime full sa písmeno a popisok plochy kazu/výplne riadia zubnou anatómiou — okluzálna → I/incizálna na predných zuboch, bukálna → L/labiálna na predných zuboch, linguálna → P/palatinálna na horných zuboch a L/linguálna na dolných zuboch (meziálna/distálna/subkoronálna nie sú ovplyvnené); v režime simple sa vždy používa všeobecná sada B/M/O/D/L/SC bez ohľadu na polohu zuba. Platí pre súhrn za celé ústa aj pre oba výbery plôch — kazu a poruchy výplne (písmeno + popisok); uložený kľúč plochy nie je ovplyvnený
- 🦷↕️ Ortodontické zaznamenávanie na každý zub (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) na prítomnom prirodzenom zube (trvalom alebo mliečnom) — opätovne používa nevyužitú ilustráciu ortodoncie z v2.5.0 (žiadne nové SVG); zobrazené na odontograme, v tooltipe a novej sekcii súhrnu „Ortodoncia" za celé ústa
- 🪨 Zubný kameň a resorpcia koreňa typizovaná ako interná alebo externá cervikálna (`resorptionType`)
- 📏 Hĺbka kazu na každú plochu (povrchový / dentín / hlboký), alebo voliteľné skórovanie ICDAS II (0–6) cez `enableIcdas`
- 🩹 Prepínač okrajovej netesnosti korunky, zobrazený len pri korunkovej alebo mostíkovej náhrade
- 🧬 Kódovanie diagnóz podľa štandardov (WHO ICD-10, vždy aktívne): každý zaznamenaný nález odvodí diagnózu kódovanú podľa ICD-10 — zubný kaz (K02), koreňový a zastavený kaz (K02.2/.3), pulpitída a nekróza pulpy (K04.0/.1), apikálna periodontitída, periapikálny absces a radikulárna cysta (K04.4–.9), atrícia/abrázia/erózia/abfrakcia (K03.0–.8), zubný kameň (K03.6), resorpcia zuba (K03.3), sfarbenie zuba (K00.3/K00.8/K03.7), strata zuba (K08.1), zvyšok koreňa (K08.3) a zlomenina zuba (S02.5) — zobrazuje sa v popise (tooltip) a v súhrne za celý chrup a exportuje sa ako FHIR Condition.
- 🩺 Karta Diagnózy pre daný zub: zobrazte si odvodené ICD-10 diagnózy zuba a upravte ich — potlačte nesprávne odvodenú diagnózu alebo pridajte takú, ktorú diagram nezachytáva. Výsledná množina (odvodené − potlačené + pridané) riadi FHIR export.
- 🗺️ Prípadové / regionálne stavy: zaznamenajte diagnózy pre celý chrup, ktoré nie sú viazané na jeden zub — malokluzia a porucha temporomandibulárneho kĺbu (K07), cysty ústnej dutiny (K09), choroby slinných žliaz (K11), stomatitída a ochorenia ústnej sliznice (K12/K13) a vývojové anomálie chrupu na úrovni oblúka (K00) — každý voliteľne so stranovosťou (vľavo / vpravo / obojstranne).
- 🌍 Národné kódovacie balíky (Nastavenia → Systém kódovania diagnóz): prekryje základ WHO ICD-10 národným kódovacím systémom — BNO-10 (maďarský, lokalizované zobrazenie; zachováva kód WHO) alebo US ICD-10-CM (prekódované kódy, napr. dentofaciálny rozsah K07 → M26). Pridanie balíka pre ďalšiu krajinu je malý záznam typu `CodingPack` — pozri `CODING_PACKS.md`.
- 🔬 Vrstva SNOMED CT (Nastavenia → SNOMED CT, voliteľné, predvolene vypnuté): pridáva kódovanie SNOMED CT popri kóde WHO a prípadnom národnom balíku a kóduje aj periimplantátové nálezy, ktoré nemajú kód WHO ICD-10. Kódy ICD-10-CM a koncepty SNOMED sú orientačné/na základe najlepšieho odhadu — pred klinickým použitím ich overte podľa oficiálneho tabuľkového zoznamu ICD-10-CM / prehliadača SNOMED CT.
- 🔁 Obojsmerný prenos FHIR Condition: diagnózy sa exportujú ako zdroje FHIR `Condition` (viazané na zub, plus stavy na úrovni pacienta s poľom `bodySite` pre stranovosť) popri Observation, a import ich rekonštruuje — prípadové stavy priamo a úpravy pridania/potlačenia pre jednotlivé zuby porovnaním (diff) importovaných Condition s novo odvodeným diagramom.
- 🩺 **Karta diagnóz, prepracovaná:** každý riadok diagnózy pre zub zobrazuje najprv kód ICD-10 (`K04.0 Pulpitis`) a riadky sú zoradené podľa kódu. Každý riadok má prepínač **vylúčiť** (odstráni diagnózu z exportu FHIR, ale ponechá ju v diagrame) a tlačidlo **odstrániť** (×), ktoré odstráni diagnózu *aj* jej nález na zube. Pridanie diagnózy z výberu zapíše aj podkladový nález v diagrame, takže značka sa zobrazí okamžite.
- 🗂️ **Vyskakovacie okno prípadových/regionálnych diagnóz:** celoústne a regionálne diagnózy (čeľustné anomálie, cysty, ochorenia slinných žliaz a sliznice…) sa presunuli z parodontálneho bočného panela do vlastného dialógu, ktorý sa otvára tlačidlom **Diagnózy** vedľa prepínača Odontogram / Parodontálny stav; jeho výber je zoradený podľa kódu, s kódom na prvom mieste.
- 🇭🇺 **Balík BNO-10:** zobrazené maďarské texty sú teraz oficiálne názvy BNO-10 podľa NEAK a balík používa štandardné URI systému ICD-10 (BNO-X je zhodné s ICD-10 WHO).
- ✅ **Export FHIR čistý pre validátory HL7:** každý záznam v Bundle nesie deterministické `id` a absolútnu `fullUrl` (žiadne zástupné `urn:uuid`), a Bundle obsahuje vlastný **CodeSystem** enginu, aby sa jeho lokálne kódy dali pri validácii vyriešiť; rovnaký CodeSystem je publikovaný v repozitári ako `fhir/CodeSystem-odontogram.json` (odovzdaním `includeCodeSystem: false` v možnostiach exportu FHIR ho možno vynechať).
- 🎯 **ICD kódy, ktoré sledujú kartu (na dátach založená špecifickosť).** Hĺbka kazu vychádza z rádiografickej hĺbky, ak je zaznamenaná (E1/E2 → sklovina, D1–D3 → dentín), inak sa použije závažnosť ICDAS ako záloha (1–3 → sklovina, 4–6 → dentín); tým sa WHO kód `K02` spresňuje na `K02.0` / `K02.1` a ICD-10-CM kód `K02.9` na `K02.51/.52` (jamky a fisúry) alebo `K02.61/.62` (hladká plocha) podľa plochy × hĺbky. Chronická parodontitída získava svoj ICD-10-CM kód zo štádia a rozsahu podľa klasifikácie 2017 (`K05.311`–`K05.329`). Jedna Condition na zub, nesúca najhlbšie postihnutie.
- 🔄 **Parodontálne údaje sa teraz vracajú aj cez FHIR.** Import načíta parodontálne panely LOINC 74029-0 späť do každého zuba — hĺbka sondáže, gingiválny okraj (rekonštruovaný z CAL, takže hodnoty pseudovačku prežijú), BOP, furkácia, plak podľa O'Learyho, indexy PI/GI a implantátové mPI/mBI, a šírka keratinizovanej gingívy — plus dôkazové Observation o stave fajčenia a HbA1c. Rozpoznávajú sa aj Condition kódované iba v ICD-10-CM alebo SNOMED CT, takže cudzí bundle importuje, čo dokáže.
- 🧬 **SNOMED CT pre celý katalóg diagnóz.** 48 z 50 pozícií teraz nesie overený koncept SNOMED CT International (aktívny, v core module, so zodpovedajúcim FSN). Dve zostávajú zámerne neobsadené, pretože SNOMED International pre ne nemá zastrešujúci koncept: anomália veľkosti čeľuste (K07.0) a dentofaciálne funkčné poruchy (K07.5). Prekrytie SNOMED zostáva voliteľné v Nastaveniach.
- 📦 **Načítateľný balík terminológie FHIR.** Priečinok `fhir/` v repozitári je NPM balík FHIR (`react-advanced-odontogram.fhir`, FHIR 4.0.1) obsahujúci CodeSystem enginu a generované ValueSet — po jednom pre každú skupinu hodnôt klinickej osi, jeden pre typy nálezov a jeden súhrnný so všetkými kódmi. Nasmerujte naň validátor pomocou `-ig ./fhir`.
- 🧰 Zjednotená lišta ikon v hornej časti so záložkovým modálnym oknom Nastavenia (Všeobecné / Panely / Detaily zuba / Kaz / Dreň / Poznámky / Periodontálne — číslovanie, poznámky, viditeľnosť panelov, ICDAS, prepínač hĺbky kazu, podrobnosť kazu koreňa/rádiografického kazu, úroveň podrobnosti drene, úroveň podrobnosti opotrebenia/zafarbenia zuba, informácie o zuboch)
- 🗂️ Nastavenia → záložka „Panely": nezávisle zobraziť/skryť panely súhrnu za celé ústa Stavy a Ortodoncia
- 🦷🩺 Nastavenia → záložka „Periodontálne": 16 prepínačov zobraziť/skryť pre jednotlivé indexy riadkov parodontálneho grafu (zoskupené Vrecko/Hygiena/Mukogingválne/Podpora/Peri-implantátové — PD/GM/CAL/BOP, plak, PI, GI, viditeľnosť CEJ, koreňová konkavita, KG, GT, furkácia, mobilita, Millerova trieda, mPI, mBI), každý s vlastným popisom, plus možnosť zobrazenia názvov indexov preložené vs. kanonické (kanonický = pevný anglicko-latinský vedecký názov vo všetkých jazykoch rozhrania; tooltipy zostávajú vždy lokalizované bez ohľadu na toto nastavenie). Obe sú preferencie na úrovni aplikácie (podobne ako `perioViewMode`) — nikdy nie sú súčasťou exportného payloadu
- 🩹 Nastavenia sekundárneho kazu (CARS) zlúčené do záložky Nastavení Kaz, umiestnené nad Rádiografickou hĺbkou (samostatná záložka „Sekundárny kaz" bola zrušená)
- 🎚️ Úroveň podrobnosti detailov zuba (Nastavenia → Detaily zuba): nastavenie simple/complex pre opotrebenie zuba a pre zafarbenie. Jednoduchý režim zobrazuje prepínač áno/nie pre každý nález (opotrebenie zapnuté → attrition/abrasion, zafarbenie zapnuté → other); zložitý režim (predvolený) zachováva rozbaľovacie zoznamy typu/príčiny, pričom uložená hodnota sa pri prepínaní úrovní zachováva
- 📋 Panel informácií o zuboch: živý textový súhrn celého odontogramu (počty zubov, zoznamy prítomných/chýbajúcich, kaz vrátane sekundárneho, výplne, koreňové kanáliky, protetika, implantáty, stav parodontu) — zobrazený predvolene, prepínateľný v Nastaveniach
- 🗂️ Konsolidovaný rozbaľovací zoznam Exportu (Stav JSON / FHIR / PNG / JPG)
- 📥 Rozbaľovací zoznam Importu s importom FHIR (spätne načítava exportované Bundles)
- ⏳ Prekrytie priebehom počas exportu obrázka
- 🎓 18-krokový interaktívny úvodný sprievodca
- 🔢 Tri systémy číslovania (FDI, Universal, Palmer)
- 🌐 I18n — 12 jazykov rozhrania (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) s prepínačom jazyka; arabčina vykresľuje rozhranie sprava doľava, pričom zubné/parodontálne grafy zostávajú zľava doprava (strojovo preložené, kontrola rodeným hovorcom pre AR/ZH/FR zatiaľ neprebehla); v hlavnom balíku je len angličtina — každý ďalší jazyk je samostatný chunk, stiahnutý pri prvom výbere
- 🌗 Podpora tmavého režimu s prepínacím tlačidlom (samostatný alebo riadený nadradenou aplikáciou)
- 🎨 Vlastná konfigurácia témy (prop `themeConfig`) s CSS vlastnými vlastnosťami (`--odon-*`)
- 📱 Mobilné dotykové UX: vyskakovacie okno pre priblíženie kliknutím, kontextová ponuka dlhým stlačením, priblíženie štipnutím, WCAG 44px dotykové ciele, navigácia prepínania oblúka
- 🔌 Vlastný SVG systém pluginov: vkladanie vizuálnych prekrytí, vlastný stav pre každý zub, podpora exportu/importu JSON — výstup `renderSvg()` pluginu je pred vložením do živého grafu sanitizovaný knižnicou DOMPurify (SVG profil); pluginy naďalej bežia ako dôveryhodný kód, preto načítavajte iba pluginy zo zdrojov, ktorým dôverujete
- 🛡️ Content-Security-Policy: produkčný build dema vkladá CSP meta tag (vývojový server nie je ovplyvnený) — hostiteľské aplikácie vkladajúce komponent by si mali nastaviť vlastný CSP
- ⚠️ Varovania validácie stavu pre nekompatibilné kombinácie zubných stavov
- 🏷️ Automatický tooltip stavu na dlaždiciach zubov (zobrazuje všetky aktívne stavy)
- 🩺 Modernizovaný tooltip pre každý zub a panel súhrnu za celé ústa: obidva zobrazujú kompletnú sadu klinických nálezov (diagnóza drene/apikálna + podtyp lézie, resorpcia koreňa, stav peri-implantátu, odstupňovaný kaz koreňa, zubný kameň, okrajová netesnosť korunky, zlomenina, strata kontaktu, typizované okrajové/cervikálne opotrebenie), s vyhradenou sekciou „Diagnózy" v paneli, vyhradenou sekciou „Opotrebenie" a hrubým kvalifikátorom závažnosti kazu (povrchový/stredný/hlboký)
- ♿ Klávesnicová prístupnosť (WCAG): ARIA role listbox/option, výber klávesmi Enter/Medzera, navigácia šípkami, obrysy focus-visible
- 🔒 Režim iba na čítanie: zakázanie všetkých interakcií pre prípady tlače/správ/prezerania
- ✨ Animácie výberu: pulzujúci prerušovaný okraj a žiariaci tieň na vybraných zuboch (s podporou prefers-reduced-motion)
- 📝 Poznámky ku každému zubu: dvojklik pre pridanie/úpravu poznámok, ikona poznámky vedľa čísla zuba, tooltip pri najetí s textom poznámky, riadok „Individuálne poznámky" v súhrnnom paneli za celé ústa, zahrnutie do PDF správy, export/import JSON
- 🔀 Rozdelenie grafu Stav ↔ Plán: prepínač `Status | Plan` v hlavičke grafu prepína medzi aktuálnym grafom **stavu** (status) a grafom **plánu** (plan, zamýšľaný stav po ošetrení), pričom každý má vlastné stavy zubov; graf plánu sa pri prvom prepnutí naň vytvorí ako kópia stavu a úpravy v jednom grafe nikdy neovplyvnia druhý. Export/import (`exportStatus`/`exportFhir`/import súboru) sa vždy vzťahuje na graf stavu; graf plánu sa číta/zapisuje samostatne cez vlastné API (pozri Verejné API nižšie) a — keď sa líši od stavu — je zahrnutý ako doplnková sekcia `plan` v exporte JSON
- 📝 Rámček „Čo sa zmenilo": kedykoľvek sa plán líši od aktuálneho stavu, rámček pod panelom informácií o zuboch vypíše každý rozdiel podľa zuba a osi ošetrenia (prítomnosť, substrát, náhrada, protetika, plánovaná korunka, ortodoncia, dreň/endo, apikálna) ako riadok `zub: os  z → na`; dostupné aj programovo cez `getPlanChanges()`

![Parodontologická karta celých úst (slovenčina)](screenshot_sk_perio.png)

- 🩺 Parodontálne vyšetrenie: pre každé miesto **hĺbka sondáže (PD)**, **gingiválny okraj**, **krvácanie pri sondáži** (+ supurácia) na šiestich štandardných miestach na zub, s odvodenou **klinickou úrovňou prichytenia (CAL = PD + gingiválny okraj)**, recesiou a celoústnym **%BOP**. **Grafický parodontálny graf pre celé ústa** — každý oblúk je vykreslený ako **dve samostatné bukálne/palatinálne(linguálne) SVG** (opätovne využívajúce ilustráciu zuba s jednotnou orientáciou korunky smerom k pásu na oboch stranách; **grafika implantátu** pre implantátové zuby) s červenou **CEJ čiarou**, **číslovanou milimetrovou vodiacou mriežkou** a **krivkou gingiválneho okraja / hĺbky vačku** nad zubmi, oddelenou **centrálnym pásom parodontálnych indexov** (s popiskom `▲ Buccal … Lingual/Palatal ▼`), ktorý nesie spoločné indexy pre každý zub — **Millerova trieda** úplne navrchu a **Plak/PI/GI/mPI/mBI** vykreslené ako **anatomická dlaždica v tvare diamantu** pre každý zub (bukálny hrot hore, linguálny dole, meziálna/distálna strana v strednom riadku prehodené podľa strany, takže meziálna vždy smeruje k stredovej línii oblúka); riadky s číslami (plné názvy indexov — PD/GM/CAL/BOP + mobilita + furkácia — vo väčších, dotyku prívetivejších bunkách) zarovnané do stĺpcov a súhrn (priemerné PD/CAL, %BOP, PI%), so zadávaním s **automatickým posunom klávesnicou**; graf sa **dynamicky prispôsobuje dostupnej šírke**, responzívny pri akejkoľvek veľkosti okna. Prezentovaný ako **prepínač zobrazenia** `Odontogram | Periodontal Status`, ktorého pravý panel sa počas tohto zobrazenia mení na **bočný panel parodontálneho kontextu** (údaje pacienta, klasifikácia 2017 a súhrn za celé ústa) (voľba v Nastaveniach prepína celé zobrazenie späť na **vyskakovacie okno**), a stále ide o **samostatne vyvolateľný komponent** (export `PerioChart`), takže hostiteľská aplikácia môže vyvolať parodontálny graf nezávisle od základného odontogramu. Export **FHIR** pre každé miesto cez parodontálny panel LOINC (`74029-0`; PD `32910-2`, recesia `32911-0`, CAL `32912-8`)
- 🅿️ Navrhovaný štýl: v režime Plán sa nálezy, ktoré plán **pridáva** oproti aktuálnemu stavu (plánovaná korunka, extrakcia, ortodontický pohyb, protetika, …), vykresľujú s výrazným prerušovaným, tónovaným „navrhovaným" obrysom, aby bolo zrejmé, že ide o zámer, nie fakt — s legendou „prerušovane = navrhované" na karte grafu. Vykresľovanie v režime Stav je bajtovo identické; ošetrenie existuje iba v pláne a pri prepnutí späť sa úplne resetuje
- 🚦 Obmedzenie v režime Plán: graf Plán zobrazuje iba to, čo zubár môže *vykonať* — základný výber ponúka iba Chýbajúci / Trvalý / Implantát a nálezy iba pre stav (kaz, opotrebenie zuba, zafarbenie a celý parodontálny blok — mobilita, šesťmiestna sondovacia mriežka, modifikácie zápalu/parodontu, zubný kameň, stav peri-implantátu) sú skryté; ovládací prvok drene/endo ponecháva endodontické **ošetrenie** (koreňový kanálik / kolík / apikektómia / parapulpálny kolík), pričom skrýva **diagnózu** drene/apikálnej oblasti a resorpciu koreňa. Náhrada, protetika, ortodoncia, potreba/výmena korunky a plán extrakcie zostávajú plánovateľné
- 🧪 Rozsiahly automatizovaný testovací balík Vitest pokrývajúci číslovanie, preklady, predvoľby, i18n, komponent App, tému, dotyk, pluginy, prístupnosť a paritu klinických osí/diagnóz
- 📖 Dokumentácia API TypeDoc s komentármi JSDoc pre všetky verejné exporty (`npm run docs`)

### 📦 Moduly
- 🦷 Mriežka odontogramu a rozhranie dlaždíc zubov
- 🎛️ Ovládacie prvky a stavový panel
- 🎨 SVG vrstevnací modul a šablóny
- 🔢 Číslovanie zubov a mapovanie popiskov (FDI/Universal/Palmer)
- 🌐 Lokalizácia — 12 jazykov rozhrania (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), vrátane arabčiny (RTL)
- 💾 Export/import stavu
- 📋 Doplnky stavu: preddefinované šablóny reštaurácií
- 🎨 Konfigurácia témy: prispôsobiteľná farebná paleta cez CSS vlastnosti `--odon-*`
- 📱 Mobilné dotykové interakcie (priblíženie kliknutím, dlhé stlačenie, priblíženie štipnutím, prepínanie oblúka)
- 🔌 Vlastný SVG systém pluginov
- ⚠️ Systém validácie stavu a tooltipov
- ♿ Klávesnicová prístupnosť a podpora ARIA
- 🔒 Režim iba na čítanie
- ✨ Animácie výberu
- 📝 Systém poznámok ku každému zubu
- 🧪 Automatizovaná testovacia sada (Vitest + Testing Library)

### 🛠️ Ovládacie prvky rozhrania

**🔝 Horná lišta:**
- Prepínač jazyka (rozbaľovací zoznam HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Prepínacie tlačidlo tmavého režimu (ikona slnka/mesiaca, prepína medzi svetlou a tmavou témou)
- Prepínač systému číslovania (rozbaľovací zoznam FDI/Universal/Palmer)
- Tlačidlá Exportovať stav / Importovať stav

**📊 Hlavička grafu:**
- Prepínač oklúzneho pohľadu
- Prepínač viditeľnosti zubov múdrosti
- Prepínač viditeľnosti kosti
- Prepínač viditeľnosti drene
- Tlačidlo zrušiť výber

**🔍 Filtre výberu:**
- Vybrať všetky / Všetky prítomné / Trvalé / Mliečne / Implantáty / Všetky chýbajúce
- Vybrať horné / Horné 6 predných / Horné moláre
- Vybrať dolné / Dolné 6 predných / Dolné moláre

**📋 Stavové predvoľby:**
- Obnoviť všetko (obnoviť ústa)
- Mliečny chrup
- Zmiešaný chrup
- Prepínač bezzubého

**📦 Rozbaľovací zoznam doplnkov stavu:**
- Horné/dolné zirkónové mostíky (12-22, 13-23, 16-26, celý oblúk)
- Horné/dolné kovové mostíky (12-22, 13-23, 16-26, celý oblúk)
- Horné/dolné čiastočné snímateľné protézy
- Horné/dolné celkové snímateľné protézy
- Horné/dolné stegové protézy s implantátmi

**🦷 Panel editora zuba** (pre vybraný zub/zuby, zoskupené do zbaliteľných kariet):
- **Základný riadok:** výber zuba (základný typ vrátane variantov zlomenej korunky) a substrát zuba (natural/radix/broken/crownprep)
- **Riadok náhrady:** kombinovaný rozbaľovací zoznam náhrady „Fix: …" / „Kivehető: …" (pevné možnosti `restorationType`×`restorationMaterial` plus možnosti upevnenia/snímateľné z osi `prosthesis`, obmedzené podľa druhu zuba); zaškrtávacie políčko okrajovej netesnosti korunky (len korunka/mostík); zaškrtávacie políčka miesta zlomenej korunky; prepínače potrebná korunka / potrebná výmena korunky
- **Riadok opotrebenia a zafarbenia:** rozbaľovací zoznam typu incizálneho/oklúzneho opotrebenia, rozbaľovací zoznam typu cervikálneho opotrebenia, rozbaľovací zoznam príčiny zafarbenia (každý sa v Nastaveniach → Detaily zuba → jednoduchom režime prepína na jednoduchý prepínač áno/nie)
- **Karta Ortodoncia:** pomôcka, meziálny/distálny drift, vertikálny pohyb (extrúzia/intrúzia), prepínač rotácie — zobrazená na prítomnom prirodzenom zube
- **Karta Kaz:** rozbaľovací zoznam režimu hĺbky kazu, zaškrtávacie políčko subkoronálneho kazu, rozbaľovací zoznam závažnosti kazu koreňa a výber plôch kazu B/M/O/D/L s kontextovým popupom hĺbky ICDAS/CARS a odznakom rádiografickej hĺbky
- **Karta Výplne:** rozbaľovací zoznam materiálu výplne, výber výplní na každú plochu (s materiálom pre každú plochu), indikátor poruchy výplne pre každú plochu (marginal/fracture/wear), upozorňujúce poznámky o sekundárnom kaze a poruche výplne
- **Karta Koreň a parodont:** zlúčený výber „Stav drene / endo", výber apikálnej diagnózy, výber podtypu periapikálnej lézie (iba symptomatická/asymptomatická apikálna parodontitída), výber typu resorpcie koreňa, výber stupňa mobility, výber stavu peri-implantátu (iba implantáty)
- **Špeciálne indikátory:** plán extrakcie/rana, uzavretá medzera, zapečatenie fisúr, strata kontaktného bodu, zubný kameň, parapulpálny kolík, endo resekcia, pilier mostíka

### 🦷 Typy a stavy zubov

**Výber zuba (základný typ):**
| Hodnota | Popis |
|---|---|
| `none` | Chýbajúci zub |
| `tooth-base` | Trvalý zub |
| `milktooth` | Mliečny (dočasný) zub |
| `implant` | Dentálny implantát |
| `tooth-under-gum` | Subgingiválny (nevyrastený) zub |

**Varianty zlomeného zuba:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrát zuba (trvalé zuby):**
`natural` (predvolené), `radix` (zvyšok koreňa), `broken`, `crownprep` (preparovaná na korunku)

**Typ náhrady (trvalé zuby):**
`none`, `crown`, `inlay`, `onlay` (len okluzálne zobrazenie), `veneer`, `bridge`

**Materiál náhrady (trvalé zuby):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (staršie korunky `metal` sa migrujú sem), `telescope`, `temporary`

**Možnosti náhrady sú obmedzené podľa druhu zuba** (`restorationOptions()` v `src/registry/restorations.ts`): implantát ponúka iba typy náhrady `crown`/`bridge` (doplnené o vrstvu konektora implantátu) plus päť nižšie uvedených položiek upevnenia `prosthesis`; chýbajúci/medzerový zub ponúka iba článok `bridge` plus dve položky snímateľnej protézy `prosthesis`; substrát `radix` úplne skrýva ovládací prvok náhrady. Staršie ploché polia `crownMaterial`/`bridgeUnit` (hodnoty upevnenia implantátu/mostíka spred v1.14) sú z aktívneho modelu zrušené — akceptované sú už iba ako migračná cesta na čítanie pre staré dáta.

**Prosthesis** (`prosthesis`; nezávislá os snímateľnej protetiky/upevnenia, zobrazovaná ako položky „Kivehető:" v kombinovanom rozbaľovacom zozname náhrady):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (upevnenia implantátu, s protézou alebo bez nej), `removable-partial`, `removable-full` (zubami podopreté protézy na chýbajúcom/medzerovom zube). Zub má buď pevnú náhradu, alebo protetiku, nikdy oboje — nastavenie jednej vynuluje druhú.

**Okrajová netesnosť korunky** (`crownLeakage`; boolean): zobrazená iba keď je `restorationType` typu `crown` alebo `bridge`; aktivuje vrstvu ilustrácie `crown-leakage`.

**Endodontické možnosti (trvalé zuby):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontické možnosti (mliečne zuby):**
`none`, `endo-medical-filling`

Polia `endo` a `pulpDx` sa zobrazujú cez jeden zlúčený výber „Stav drene / endo" (`<select>`, zoskupený: vitálna dreň vs. liečená/endo) a navzájom sa vylučujú — výber ošetreného stavu (`endo != none`) vynuluje `pulpDx` na `normal` a výber diagnózy drene vynuluje `endo` na `none`.

**Materiály výplní (trvalé zuby):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiály výplní (mliečne zuby):**
`composite`, `gic`, `temporary`

**Plochy výplní/kazu:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (iba kaz)

**Modifikácie:**
`inflammation` (periapikálny), `parodontal` (parodontálny), `mobility` (M1/M2/M3)

**Typ periapikálnej lézie** (`periapicalType`; upresňuje periapikálny glyf, zobrazený iba pri symptomatickej/asymptomatickej apikálnej parodontitíde):
`none`, `granuloma`, `cyst` — možnosti na zaznamenávanie; staršia hodnota `abscess` sa stále akceptuje/ukladá, ale vo výbere sa už neponúka, keďže duplikuje apikálnu diagnózu. Pri importe sa zahodí: zahrnutá do `apicalDx`, ak zub má nastavený modifikátor zápalu, inak vynulovaná na `none`

**Diagnóza drene** (terminológia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (zobrazuje zmenšený glyf drene), `irreversible-pulpitis`, `necrosis` — navzájom sa vylučuje s `endo`; na zube s ošetreným koreňovým kanálikom sa normalizuje na `normal`

**Diagnóza drene, praktická latinčina** (`pulpLatin`; výber drene ju zobrazuje iba keď je `pulpDetailLevel` nastavené na `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Úroveň podrobnosti drene** (`pulpDetailLevel`, globálne nastavenie): `simple`, `aae` (predvolené), `latin` — určuje, aký slovník drene výber ponúka

**Apikálna diagnóza** (`apicalDx`; určuje periapikálny glyf):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Typ resorpcie koreňa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stav peri-implantátu** (`periImplant`; iba implantáty, stagingovanie podľa 2018 World Workshop): `mucositis` opätovne používa parodontálny glyf ďasna; `peri-implantitis-*` pridáva vrstvu `peri-implant-bone-loss` s priehľadnosťou odstupňovanou podľa závažnosti (mierna 0,4 / stredná 0,7 / ťažká 1,0). Implantáty už nezobrazujú glyf periapikálnej lézie (ich zápal sa namiesto toho vyjadruje touto osou) a zaškrtávacie políčka `mods` zápal/parodont sú na implantátoch skryté:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Závažnosť kazu** (`cariesSeverity`; zjednotené pole na plochu, `0`–`6`): na ploche bez výplne sa číta ako škála hĺbky ICDAS (`superficial` / `dentin` / `deep`, alebo surové kódy ICDAS II `0–6`, keď je zapnuté `enableIcdas`) a zobrazuje primárnu vrstvu `caries-{surface}`; na ploche s výplňou sa číta ako pomenované skóre CARS (`0` zdravý … `6` rozsiahla kavita) a namiesto toho zobrazuje vrstvu `subcaries-{surface}` (sekundárny kaz) — plocha nikdy nie je primárna a rekurentná zároveň

**Kaz koreňa** (`rootCaries`; aktivuje vrstvu ilustrácie `caries-root` na prítomnom zube, s priehľadnosťou závislou od závažnosti — `active` 0,5 / `arrested` 0,7 / `active-cavitated` plná priehľadnosť):
`none`, `active`, `arrested`, `active-cavitated`

**Rádiografická hĺbka kazu** (`radiographicDepth`; na plochu, nezávislá od vizuálnej škály ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Nastavenia podrobnosti kazu** (globálne): `secondaryCariesMode` (`simple`/`standard`/`full`, predvolené `standard`), `rootCariesMode` (`simple`/`severity`, predvolené `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, predvolené `off`), `cariesDepthEnabled` (boolean, predvolené `true`) — každé zbaľuje svoju škálu do jednoduchšieho výberu bez zmeny uloženej hodnoty

**Špeciálne indikátory:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Opotrebenie zuba** (`wearEdge`, `wearCervical`; klinický typ na každé miesto, obmedzené na tooth-base + bez náhrady + prirodzený substrát; vykresľujú existujúce vrstvy `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Zafarbenie** (`discoloration`; príčina na každý zub, obmedzené na prirodzený tooth-base alebo mliečny zub + bez náhrady + prirodzený substrát; zafarbuje výplň zobrazenej prirodzenej korunky — žiadne nové SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Porucha výplne** (`fillingDefect`; na každú plochu, nález priamej reštaurácie nezávislý od sekundárneho kazu — obmedzený na plochy prítomné v `fillingSurfaceMaterials`; vykresľuje vrstvu ilustrácie `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; na každý zub, obmedzené na prítomný prirodzený zub — trvalý alebo mliečny):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glyf šípky nahor), `intrusion` (glyf šípky nadol) — `orthoRotation`: boolean

**Nastavenia detailov zuba / notácie** (globálne nastavenia relácie, Nastavenia → Detaily zuba): `wearDetailLevel` a `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, predvolené `complex` — jednoduchý režim zobrazuje prepínač áno/nie namiesto plného rozbaľovacieho zoznamu typu/príčiny, bez zmeny uloženej hodnoty) a `surfaceNotation` (`simple`/`full`, predvolené `full` — určuje, či sú písmená/popisky plôch kazu/výplne citlivé na polohu zuba; pozri „Notácia plôch citlivá na polohu zuba" vyššie)

### ⚙️ Nastavenia
Otvárané cez ikonu ozubeného kolieska na hornej lište; dialóg s uzamknutým fokusom, ARIA `dialog` so záložkovým rozložením (Esc/klik mimo okna na zatvorenie, šípky na prepínanie záložiek). Všetky nastavenia sú iba stav rozhrania na úrovni relácie, pokiaľ nie je uvedené inak — žiadne z nich nemenia dáta jednotlivých zubov ani exportný payload.

- **Všeobecné:** systém číslovania (FDI/Universal/Palmer), jazyk, tmavá/svetlá téma, viditeľnosť panela informácií o zuboch
- **Odontogram:** profil anatómie zubov (`classic` predvolený / `measured`) — `measured` vykresľuje deväť zubných šablón odmeraných podľa literatúry v rozložení dvoch oblúkov so šírkou na zub; prepínateľný za behu, bez vplyvu na predvolený `classic`; jeho grafika je samostatný chunk, ktorý sa stiahne až pri prepnutí, takže predvolený `classic` nič nestojí
- **Panely:** nezávisle zobraziť/skryť kartu súhrnu za celé ústa Stavy a kartu Ortodoncia (obe predvolene viditeľné)
- **Detaily zuba:** úroveň podrobnosti opotrebenia a úroveň podrobnosti zafarbenia (simple/complex, obe predvolene complex), notácia plôch (simple/full, predvolené full)
- **Kaz:** prepínač skórovania ICDAS II (`enableIcdas`), prepínač hĺbky kazu (`cariesDepthEnabled`), podrobnosť kazu koreňa (`rootCariesMode`: simple/severity), podrobnosť sekundárneho kazu/CARS (`secondaryCariesMode`: simple/standard/full), podrobnosť rádiografickej hĺbky (`radiographicDepthMode`: off/threeLevel/detailed) — bývalá samostatná záložka „Sekundárny kaz" je zlúčená do tejto, pričom ovládací prvok CARS je umiestnený priamo nad rádiografickou hĺbkou
- **Dreň:** úroveň podrobnosti drene (`pulpDetailLevel`: simple/AAE/praktická latinčina, predvolené AAE) — určuje, aký slovník ponúka výber „Stav drene / endo"; zmena okamžite obnoví súhrn za celé ústa a každý otvorený tooltip
- **Poznámky:** povoliť/zakázať poznámky ku každému zubu (`enableNotes`)
- **Periodontálne:** prepínače zobraziť/skryť pre každý index zo všetkých 16 riadkov parodontálneho grafu (`perioRowVisibility`, predvolene všetky viditeľné), zoskupené Vrecko (PD/GM/CAL/BOP) / Hygiena (Plak/PI/GI) / Mukogingválne (viditeľnosť CEJ/koreňová konkavita/KG/GT) / Podpora (Furkácia/Mobilita/Millerova trieda) / Peri-implantátové (mPI/mBI), každý riadok s vlastným popisom; plus režim názvov indexov preložené vs. kanonické (`perioIndexNameMode`: `translated` predvolené / `canonical` — pevný anglicko-latinský vedecký názov zobrazený vo všetkých jazykoch rozhrania). Iba preferencie na úrovni aplikácie (zrkadlí `perioViewMode`) — nikdy sa neserializuje, tooltipy zostávajú lokalizované v oboch režimoch

### 🖼️ Systém SVG šablón

**Šablóny zubov** (v `src/assets/teeth-svgs/`):
| Šablóna | Zuby, ktoré ju používajú |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (rezáky) |
| `13.svg` | 13, 23, 33, 43 (špičáky) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premoláre) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (moláre) |

Šablóny sú pre dolnú čeľusť otočené o 180 stupňov a pre ľavú stranu horizontálne zrkadlové.

**Ikony SVG** (v `src/assets/icon-svgs/`):
`icon_8.svg` (múdrosť), `icon_gum.svg` (kosť), `icon_no_selection.svg` (zrušiť), `icon_occl.svg` (oklúzny pohľad), `icon_pulp.svg` (dreň)

### 🔢 Systémy číslovania

**FDI (ISO 3950):** Trvalé zuby 11-18, 21-28, 31-38, 41-48. Mliečne zuby 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Trvalé zuby číslované 1-32. Mliečne zuby označené písmenami A-T.

**Palmer (Zsigmondy-Palmer):** Formát kvadrant + pozícia (napr. UR-1, LL-5). Mliečne zuby používajú písmená A-E na kvadrant.

### 🚀 Použitie
Vývoj:
```bash
npm install
npm run dev
```
Zostavenie:
```bash
npm run build
```
Náhľad:
```bash
npm run preview
```

### 🔗 Integrácia
Komponent je možné vložiť do ľubovoľnej React aplikácie.
Príklad:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="sk"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integrácia tmavého režimu:**
- **Samostatný režim:** Vynechajte prop `darkMode` — komponent spravuje vlastný stav témy cez prepínacie tlačidlo v hornej lište a pridáva/odstraňuje triedu `.dark` na `<html>`.
- **Riadený režim:** Odovzdajte `darkMode` a `onDarkModeChange` — nadradená aplikácia riadi tému. Prepínacie tlačidlo sa stále zobrazuje, ale volá `onDarkModeChange` namiesto správy interného stavu. Nadradená aplikácia je zodpovedná za pridávanie/odstraňovanie triedy `.dark` na `<html>`.

**Vlastná téma:**
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

**Integrácia pluginu:**
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

### 🧪 Testovanie
```bash
npm run test           # Spustiť celý testovací balík Vitest
npm run test:watch     # Sledovací režim
npm run test:coverage  # Správa pokrytia
npm run test:e2e       # Testy v prehliadači (Playwright; raz: npx playwright install chromium)
```

### 📖 Dokumentácia API

🅰️ **Verzia pre Angular:** k dispozícii je oficiálny port pre Angular, [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` na npm) — exporty JSON a FHIR R4 sú vzájomne prenosné medzi oboma knižnicami.

```bash
npm run docs           # Generovať dokumentáciu TypeDoc v docs/
```

### 📡 Verejné API

**Props komponentu:**

| Prop | Typ | Predvolené | Popis |
|---|---|---|---|
| `language` | `string` | `'hu'` | Jazyk rozhrania (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Spätné volanie pri zmene jazyka |
| `numberingSystem` | `string` | `'FDI'` | Systém číslovania (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Spätné volanie pri zmene číslovania |
| `darkMode` | `boolean` | `undefined` | Stav tmavého režimu. Vynechajte pre samostatný režim. |
| `onDarkModeChange` | `(dark) => void` | — | Spätné volanie pri prepnutí tmavého režimu. Vyžadované pre riadený režim. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Vlastné prepísanie farieb cez CSS vlastné vlastnosti (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Vlastné SVG pluginy pre vizuálne prekrytia a vlastný stav každého zuba. |
| `readOnly` | `boolean` | `undefined` | Zakázanie všetkých interakcií (klik, dotyk, klávesnica). Užitočné pre zobrazenia tlače/správ. |
| `enableNotes` | `boolean` | `undefined` | Povolenie poznámok ku každému zubu. Dvojklik na zub pre pridanie/úpravu poznámok. |

**Exportované funkcie pre externú kontrolu:**

| Funkcia | Popis |
|---|---|
| `initOdontogram()` | Inicializovať modul a vykresliť všetky zuby |
| `destroyOdontogram()` | Vyčistiť modul a odstrániť poslucháčov udalostí |
| `setNumberingSystem(system)` | Prepínanie medzi FDI, Universal, Palmer |
| `clearSelection()` | Zrušiť výber všetkých zubov |
| `getSelectedTeeth()` | Aktuálne vybrané zuby (čísla FDI) v poradí výberu |
| `getNumberingSystem()` | Aktuálne aktívny systém číslovania zubov |
| `getScreenToothSpacing()` / `setScreenToothSpacing(v)` | Získať/nastaviť rozostup zubov na obrazovke |
| `getScreenToothNumberSize()` / `setScreenToothNumberSize(v)` | Získať/nastaviť veľkosť čísla zuba |
| `getSelectionColor()` / `setSelectionColor(hex)` | Získať/nastaviť farbu výberového prstenca (`#rrggbb`) |
| `getSelectionBorderStyle()` / `setSelectionBorderStyle(v)` | Získať/nastaviť štýl okraja výberového prstenca |
| `getToothInfoVisible()` / `setToothInfoVisible(on)` | Získať/nastaviť, či sa zobrazuje panel informácií o zube |
| `setOcclusalVisible(on)` | Prepínanie oklúzneho pohľadu zap/vyp |
| `setWisdomVisible(on)` | Zobraziť/skryť zuby múdrosti |
| `setShowBase(on)` | Zobraziť/skryť vrstvu kosti |
| `setHealthyPulpVisible(on)` | Zobraziť/skryť zdravú dreň |
| `registerPlugins(plugins)` | Registrovať vlastné SVG pluginy |
| `setPluginState(toothNo, pluginId, value)` | Nastaviť vlastný stav pluginu pre zub |
| `getPluginState(toothNo, pluginId)` | Získať vlastný stav pluginu pre zub |
| `getToothStateSummary(toothNo)` | Získať lokalizovaný súhrn všetkých aktívnych stavov |
| `getOdontogramSummary()` | Získať štruktúrovaný, lokalizovaný textový súhrn celého odontogramu (počty, sekcie) |
| `onStateChange(callback)` | Prihlásiť sa na odber zmien stavu; vracia funkciu na odhlásenie |
| `setReadOnly(value)` | Povolenie/zakázanie režimu iba na čítanie |
| `getReadOnly()` | Získať aktuálny stav iba na čítanie |
| `setNotesEnabled(value)` | Povolenie/zakázanie poznámok ku každému zubu |
| `getNotesEnabled()` | Získať aktuálny stav povolenosti poznámok |
| `setPulpDetailLevel(level)` | Nastaviť slovník výberu drene — `"simple"`, `"aae"` alebo `"latin"` |
| `getPulpDetailLevel()` | Získať aktuálnu úroveň podrobnosti drene |
| `getChartMode()` | Získať aktuálne aktívny graf — `"status"` alebo `"plan"` |
| `setChartMode(mode)` | Prepnúť aktívny graf na `"status"` alebo `"plan"`; graf plánu sa pri prvom vstupe hĺbkovo skopíruje zo stavu |
| `getStatusChart()` | Získať payload grafu stavu (`{version, globals, teeth}`), nezávisle od toho, ktorý graf je aktuálne aktívny |
| `getPlanChart()` | Získať payload grafu plánu (`{version, globals, teeth}`), nezávisle od toho, ktorý graf je aktuálne aktívny |
| `setPlanChart(payload)` | Nahradiť zuby grafu plánu z payloadu (stav zostane nedotknutý); označí graf plánu ako inicializovaný |
| `getPlanChanges()` | Získať štruktúrovaný rozdiel stav→plán (`{ toothNo, axis, from, to }[]`) — jeden záznam na zub a os ošetrenia, ktoré sa líšia medzi grafom stavu a plánu; prázdne, ak plán neexistuje. Zobrazuje sa aj v `getOdontogramSummary()` ako `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Nastaviť parodontálne údaje pre jedno zo šiestich miest (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` null/`<1` zruší zaznamenanie miesta. Validuje + orezáva (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Získať parodontálny záznam zuba pre jednotlivé miesta (iba zaznamenané miesta) |
| `getToothCal(toothNo)` | Získať odvodenú CAL pre jednotlivé miesta (`pd + gingiválny okraj`) daného zuba |
| `getPerioSummary()` | Súhrnné parodontálne údaje za celé ústa: počet zaznamenaných miest, počet krvácajúcich miest, %BOP, najhoršia CAL, max. PD |
| `getPerioChart()` | Získať parodontálne záznamy aktívneho grafu pre jednotlivé zuby |
| `PerioChart` | Komponent React (pomenovaný export) — prekrytie parodontálneho grafu za celé ústa (`{ open, onClose }`), možno ho pripojiť nezávisle od `OdontogramShell` pre integráciu s hostiteľskou aplikáciou |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Programové otvorenie/zatvorenie/zistenie stavu prekrytia parodontálneho grafu — umožňuje hostiteľovi vyvolať parodontálny graf nezávisle od základného odontogramu (zdieľaný stav prípadu) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Získať/nastaviť spôsob zobrazenia parodontálneho grafu — `"toggle"` (prepínač zobrazenia `Odontogram \| Dental Chart`, predvolené) alebo `"popup"` (vyskakovacie okno) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Získať/nastaviť zvýrazňovacie prekrytie Dental Chart — `"none"` (predvolené) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; prekreslí zuby podľa danej miery (iba zobrazenie nad existujúcimi dátami) |
| `getToothRecessionType(toothNo)` | Získať odvodený **Cairo typ recesie** — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (vypočítaný z interproximálnej vs. bukálnej CAL zuba) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Viditeľnosť CEJ pre každý zub — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Konkavita povrchu koreňa pre každý zub — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Stupeň Silness-Löeho Plakového indexu pre každú plochu — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Stupeň Löe-Silnessovho Gingiválneho indexu pre každú plochu — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Šírka bukálnej keratinizovanej gingívy pre každý zub v mm — `0`-`15`, alebo `null`, ak nie je zaznamenaná |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Fenotyp hrúbky gingívy pre každý zub — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Millerova trieda recesie pre každý zub — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Iba implantáty — stupeň Mombelliho modifikovaného Plakového indexu (mPI) pre každú plochu — `0`-`3`; na neimplantátovom zube bez účinku |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Iba implantáty — stupeň Mombelliho modifikovaného indexu krvácania zo sulku (mBI) pre každú plochu — `0`-`3`; na neimplantátovom zube bez účinku |
| `furcationEntrances(toothNo)` | Vstupy do furkácie pre daný zub — `["mesial","distal","buccal"]` (horné moláre), `["buccal","lingual"]` (dolné moláre), `["mesial","distal"]` (horné prvé premoláre), inak `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Nastaviť/získať postihnutie furkácie pre jednotlivé vstupy (Glickman `1`–`4`; `null` vymaže) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Nastaviť/získať prítomnosť plaku podľa O'Learyho pre každú plochu (mesial/distal/buccal/lingual); vstupuje do celoústneho PI% v `getPerioSummary()` |
| `getCaseMeta()` | Získať objekt metadát na úrovni prípadu (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — jeden zdieľaný blok, nie na úrovni zuba/dvojstavový (zrkadlí kľúč `globals` na najvyššej úrovni payloadu); vstupuje do parodontálnej klasifikácie štádia/stupňa a hlavičky PDF správy |
| `setPatientName(v)` | Nastaviť meno pacienta v prípade (orezané; prázdny reťazec alebo `null` ho vymaže) — iba identifikačný údaj, nikdy nevstupuje do parodontálnej derivácie |
| `setPatientDob(v)` | Nastaviť dátum narodenia pacienta v prípade (`YYYY-MM-DD`; neplatný/prázdny ho vymaže) — iba identifikačný údaj pre PDF správu |
| `setExamDate(v)` | Nastaviť dátum vyšetrenia prípadu (`YYYY-MM-DD`; neplatný/prázdny ho vymaže) |
| `setCaseAge(v)` | Nastaviť vek pacienta v prípade v rokoch — `0`-`120`, alebo `null` na vymazanie |
| `setSmokingStatus(v)` | Nastaviť fajčiarsky stav prípadu — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Nastaviť počet cigariet denne (zmysluplné iba pri fajčiarskom stave `"current"`) — `0`-`99`, alebo `null` na vymazanie |
| `setDiabetesStatus(v)` | Nastaviť diabetický stav prípadu — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Nastaviť HbA1c % (zmysluplné iba pri diabetickom stave `"present"`) — `3.0`-`20.0` (jedno desatinné miesto), alebo `null` na vymazanie |
| `setToothLossPerio(v)` | Nastaviť počet zubov stratených v dôsledku parodontitídy — `0`-`32`, alebo `null` na vymazanie |
| `setMaxRblPercent(v)` | Nastaviť max. % rádiografickej straty kosti — `0`-`100`, alebo `null` na vymazanie |
| `resetCaseMeta()` | Resetovať objekt metadát na úrovni prípadu na prázdne predvolené hodnoty |
| `getPerioClassification()` | Získať parodontálnu klasifikáciu podľa 2017 World Workshop (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnóza/štádium/stupeň/rozsah odvodené zo zaznamenaných parodontálnych dát a metadát prípadu, každá os nahradená prepísaním od klinika, ak je nastavené (`derived` vždy sprístupňuje nedotknuté vypočítané hodnoty, `overridden` označuje, ktoré osi boli prepísané) |
| `setDiagnosisOverride(v)` | Prepísať odvodenú parodontálnu diagnózu — `"health"` / `"gingivitis"` / `"periodontitis"`, alebo `null` na vymazanie (návrat k odvodenej hodnote) |
| `setStageOverride(v)` | Prepísať odvodené parodontálne štádium — `"I"` / `"II"` / `"III"` / `"IV"`, alebo `null` na vymazanie (návrat k odvodenej hodnote) |
| `setGradeOverride(v)` | Prepísať odvodený parodontálny stupeň — `"A"` / `"B"` / `"C"`, alebo `null` na vymazanie (návrat k odvodenej hodnote) |
| `setExtentOverride(v)` | Prepísať odvodený parodontálny rozsah — `"localized"` / `"generalized"` / `"molar-incisor"`, alebo `null` na vymazanie (návrat k odvodenej hodnote) |
| `exportFhir(options?)` | Export odontogramu ako kolekcia HL7 FHIR R4 Bundle (stiahnutie JSON). Voliteľná referencia `{ subject }`; inak je vložený zástupný Patient |
| `exportImage(format)` | Stiahnuť odontogram ako obrázok — `"png"` alebo `"jpg"` |
| `exportSvg()` | Stiahnuť odontogram ako škálovateľný SVG (vektor) |
| `hasAnyPerioData()` | `true`, ak je v ústach kdekoľvek zaznamenaná aspoň jedna parodontálna os — riadi automatické preskočenie parodontálneho exportu a deaktivuje položky ponuky parodontálneho exportu pri prázdnom grafe |
| `exportPerioSvg()` | Stiahnuť celý parodontálny graf (grafika zubov + číselné riadky + klasifikácia 2017) ako jeden samostatný vektorový SVG, zostavený bez zobrazenia priamo zo stavu cez `buildPerioSvg()` |
| `exportPerioImage(format)` | Stiahnuť parodontálny graf ako rastrovaný obrázok — `"png"` alebo `"jpg"` |
| `exportPdf(opts)` | Stiahnuť PDF správu natívne cez jsPDF (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, každá sekcia voliteľná) — vektorový text plus rastrové obrázky zuba/parodontálneho grafu; sekcia individuálnych poznámok sa automaticky preskočí, keď žiadny zub nemá poznámku, a obe parodontálne sekcie sa automaticky preskočia, keď je `hasAnyPerioData()` false, bez ohľadu na `opts` |
| `importFhirBundle(input)` | Importovať FHIR R4 Bundle (objekt alebo reťazec JSON) produkovaný týmto modulom |
| `setImportFormat(format)` | Nastaviť analyzátor pre nasledujúci import súboru — `"status"` alebo `"fhir"` |
| `startIntroTour()` | Spustiť 18-krokový interaktívny úvodný sprievodca |

### 💾 Perzistencia stavu (localStorage)

Voliteľná (opt-in) perzistencia stavu prípadu odontogramu v `localStorage` (`src/persistence.ts`, reexportované z hlavného vstupného bodu balíka). Predvolene vypnutá — existujúce integrácie nie sú ovplyvnené, pokiaľ ju hostiteľská aplikácia explicitne nezapne, a mala by sa volať **až po** pripojení odontogramu (obnova prekreslí živý DOM cez `importStatus()`):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // predvolené: "react-advanced-odontogram"
  includePlan: true,          // uložiť aj plánovací graf; predvolené: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Funkcia | Popis |
|---|---|
| `enablePersistence(options?)` | Obnoví predtým uložený prípad (ak existuje) cez `importStatus()`, potom pri každej zmene stavu uloží stavový graf do `localStorage`. Idempotentné — opätovné volanie nahradí predchádzajúci odber/možnosti. **Musí sa volať až po pripojení odontogramu.** |
| `disablePersistence()` | Zastaví perzistenciu; uložená položka zostáva zachovaná. |
| `clearPersistedState()` | Odstráni uloženú položku pre aktívny (alebo predvolený) kľúč. |
| `isPersistenceEnabled()` | `true`, kým je aktívny odber zmien stavu. |

**`PersistenceOptions`:**

| Pole | Typ | Predvolené | Popis |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | Kľúč v `localStorage`. |
| `includePlan` | `boolean` | `false` | Uložiť aj plánovací graf (pole `plan` v payloade). |
| `onError` | `(err: Error) => void` | — | Volané pri akejkoľvek chybe ukladania/parsovania namiesto `console.warn`. |

Poznámky: pokiaľ nie je zavolané `enablePersistence()`, do `localStorage` sa nič nezapisuje ani z neho nečíta; limit veľkosti 4 MB preskočí príliš veľké uloženie (nahlásené cez `onError`/`console.warn`) namiesto vyhodenia výnimky; každá chyba ukladania/JSON — prekročená kvóta, uzamknutý iframe, poškodené alebo nerozpoznané uložené dáta atď. — je zachytená a nahlásená. Tento modul nikdy nevyhadzuje výnimku.

Poznámka: zapnutie perzistencie obnoví uložený prípad cez `importStatus()`, čím sa nahradí aktuálny prípad — vrátane rozpracovaného plánovacieho grafu, ak uložený payload žiadny neobsahuje. Zapnite perzistenciu pri štarte (hneď po pripojení), nie uprostred relácie.

Poznámka: uložený payload môže obsahovať identifikačné údaje pacienta (meno pacienta, dátum vyšetrenia) v čistom texte v `localStorage`. Ak zaznamenávate takéto údaje, zabezpečte ochranu na úrovni zariadenia alebo ich podľa potreby vymažte pomocou `clearPersistedState()`.

### 💾 Formát exportu/importu stavu
Export vytvorí súbor JSON (verzia `2.22`; import tiež akceptuje staršie verzie `1.4` a `2.0` až `2.21` a automaticky ich migruje) obsahujúci:

**Globálne polia:**
- `wisdomVisible` - zuby múdrosti viditeľné
- `showBase` - vrstva kosti viditeľná
- `occlusalVisible` - oklúzny pohľad aktívny
- `showHealthyPulp` - zdravá dreň viditeľná
- `edentulous` - bezzubý režim aktívny

**Polia pre každý zub (32 zubov):**
- `toothSelection` - základný typ zuba
- `toothSubstrate` - substrát zuba (natural/radix/broken/crownprep), nezávislý od akejkoľvek náhrady
- `restorationType` - typ náhrady (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiál náhrady (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), spárovaný s `restorationType`
- `prosthesis` - os snímateľnej protetiky/upevnenia (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), navzájom sa vylučuje s pevným `restorationType` typu korunka/mostík
- `crownLeakage` - príznak okrajovej netesnosti korunky, zmysluplný iba keď je `restorationType` typu korunka alebo mostík
- `endo` - endodontický stav; navzájom sa vylučuje s `pulpDx` (zobrazované spoločne cez jeden zlúčený výber „Stav drene / endo" — ošetrenie zuba normalizuje `pulpDx` na `normal`)
- `mods` - pole modifikácií (zápal, parodontálny); `inflammation` je z rozhrania na prítomných zuboch zrušený (periapikálny glyf tam určuje `apicalDx`), ale stále sa vzťahuje na chýbajúce zuby/zuby s extrakčnou ranou
- `caries` - aktívne plochy kazu
- `cariesActiveDepth` - hodnota hĺbky ICDAS pripravená výberom hĺbky kazu pri aplikovaní novej plochy (nie je uložená hodnota pre každú plochu; pozri `cariesSeverity` pre uložené pole pre každú plochu)
- `rootCaries` - závažnosť kazu koreňa (none/active/arrested/active-cavitated)
- `cariesSeverity` - zjednotená závažnosť na každú plochu (0-6): hĺbka ICDAS na primárnej (bez výplne) ploche, skóre CARS na rekurentnej (s výplňou) ploche
- `radiographicDepth` - rádiografická hĺbka kazu na každú plochu (none/E1/E2/D1/D2/D3), nezávislá od vizuálnej škály ICDAS/CARS
- `fillingMaterial` - materiál výplne
- `fillingSurfaces` - plombované plochy
- `fillingSurfaceMaterials` - materiál výplne pre každú plochu (zmiešané výplne, napr. bukálny amalgám + distálny kompozit)
- `fillingDefect` - porucha výplne pre každú plochu (none/marginal/fracture/wear), obmedzená na plombované plochy, nezávislá od sekundárneho kazu
- `pulpDx` - AAE diagnóza drene (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis zobrazuje zmenšený glyf
- `pulpLatin` - praktický latinský podtyp drene (zobrazený vo výbere drene iba keď je `pulpDetailLevel` nastavené na `latin`)
- `apicalDx` - apikálna diagnóza určujúca periapikálny glyf
- `periapicalType` - podtyp periapikálnej lézie (none/granuloma/cyst), zobrazený iba pri symptomatickej/asymptomatickej apikálnej parodontitíde; staršia hodnota `abscess` je pri importe stále akceptovaná
- `resorptionType` - typ resorpcie koreňa (none/internal/external-cervical)
- `periImplant` - stav peri-implantátu iba pre implantáty (none/mucositis/peri-implantitis-mild/-moderate/-severe), stagingovanie podľa 2018 World Workshop
- `dxOverrides` - diagnostické prepísania kódovania na úrovni zuba (verzia 2.21): objekt indexovaný kľúčom ICD-10 diagnózy → `add` | `suppress`, ktorý vynúti kódovanú diagnózu napriek chýbajúcemu zodpovedajúcemu nálezu v karte, alebo ju vypne napriek jeho prítomnosti; formuje efektívnu množinu kódovaných diagnóz exportovanú ako FHIR `Condition`
- `endoResection` - príznak apikektómie
- `fissureSealing` - príznak zapečatenia fisúr
- `calculus` - príznak zubného kameňa
- `contactMesial` - strata meziálneho kontaktného bodu
- `contactDistal` - strata distálneho kontaktného bodu
- `wearEdge` - typ incizálneho/oklúzneho opotrebenia (none/attrition/erosion)
- `wearCervical` - typ cervikálneho opotrebenia (none/abrasion/abfraction/erosion)
- `discoloration` - príčina zafarbenia zuba (none/tetracycline/fluorosis/nonvital/extrinsic/other), zafarbuje výplň prirodzenej korunky na prirodzenom tooth-base/mliečnom zube bez náhrady
- `orthoAppliance` - ortodontická pomôcka (none/bracket/band)
- `orthoDrift` - ortodontický drift (none/mesial/distal)
- `orthoVertical` - ortodontický vertikálny pohyb (none/extrusion/intrusion)
- `orthoRotation` - príznak ortodontickej rotácie
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - miesta zlomenín
- `extractionWound` - poextrakčná rana
- `extractionPlan` - plánovaná extrakcia
- `parapulpalPin` - príznak parapulpálneho kolíka
- `bridgePillar` - pilierový zub mostíka
- `mobility` - stupeň mobility (none/m1/m2/m3)
- `crownNeeded` - indikátor potreby korunky
- `crownReplace` - indikátor potreby výmeny korunky
- `missingClosed` - uzavretá medzera po extrakcii
- `customStates` - vlastné stavy pluginov (objekt, kľúčovaný ID pluginu)
- `note` - textová poznámka ku každému zubu (reťazec, voliteľný — prítomný iba keď nie je prázdny)

**Pole `plan` na najvyššej úrovni (verzia 2.11+):**
- `plan` - voliteľný objekt s rovnakým tvarom ako `teeth` (polia pre každý zub vyššie), obsahujúci graf **plánu** (plan, zamýšľaný stav po ošetrení). Prítomný iba vtedy, keď bol graf plánu inicializovaný (prepínač `Status | Plan` bol aspoň raz prepnutý na Plan) A jeho obsah sa líši od grafu stavu — export iba so stavom ho úplne vynechá a zostáva bajtovo identický s exportom pred verziou 2.11 okrem čísla verzie. Pri importe chýbajúce `plan` vymaže/zruší inicializáciu grafu plánu (nikdy neobnoví zastaraný plán ponechaný spred importu); prítomné `plan` obnoví graf plánu popri stave. Graf plánu je možné čítať/zapisovať aj nezávisle od exportu/importu cez `getPlanChart()`/`setPlanChart()` (pozri Verejné API vyššie), a `getStatusChart()` vždy vracia payload primárne založený na stave, bez ohľadu na aktívny režim grafu.

**Pole `case` na najvyššej úrovni (verzia 2.17+, rozšírené vo verziách 2.18, 2.19, 2.20 a 2.22):**
- `case` - voliteľný objekt s metadátami na úrovni prípadu (nie na úrovni zuba), zdieľaný grafom stavu aj plánu (zrkadlí kľúč `globals` na najvyššej úrovni). Vynechaný, keď je prázdny: úplne chýba, keď je každé pole na svojej predvolenej hodnote, takže export bez údajov o prípade zostáva bajtovo identický okrem čísla verzie. Polia (každé vynechané pri predvolenej hodnote): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; štyri klinické prepísania podľa jednotlivých osí klasifikácie 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; (verzia 2.19) `patientName` / `examDate`; a (verzia 2.20) `patientDob`; a (verzia 2.22) `caseConditions` — diagnózy na úrovni prípadu/regiónu (porucha skusu a temporomandibulárneho kĺbu K07, cysty ústnej dutiny K09, ochorenia slinných žliaz K11, stomatitída a ochorenia ústnej sliznice K12/K13, vývojové anomálie zubného oblúka K00), z ktorých každá je priradená k strane postihnutia (bližšie neurčené / vľavo / vpravo / obojstranné). Vstupuje do parodontálnej klasifikácie štádia/stupňa a do hlavičky PDF správy; čítaný/zapisovaný cez `getCaseMeta()` a settery `setCase*` (pozri Verejné API vyššie). Meno pacienta, dátum narodenia a dátum vyšetrenia sú iba identifikačné metadáta grafu — **nie sú** súčasťou exportu FHIR.

### 🖨️ Export
`exportFhir()` vytvára Bundle čistý pre validátory HL7: každý záznam nesie deterministické `id` a absolútnu `fullUrl` (žiadne zástupné `urn:uuid`), a Bundle obsahuje vlastný CodeSystem enginu, aby sa jeho lokálne kódy dali pri validácii vyriešiť (publikovaný aj ako `fhir/CodeSystem-odontogram.json` v repozitári; možno ho vynechať pomocou `includeCodeSystem: false`).

Parodontálne údaje sa teraz vracajú aj cez FHIR import, nielen cez JSON payload: `importFhirBundle()` načíta parodontálne panely LOINC `74029-0` späť do parodontálneho záznamu každého zuba — hĺbka sondáže, gingiválny okraj (rekonštruovaný z CAL, takže hodnoty pseudovačku prežijú), BOP, furkácia, plak podľa O'Learyho, indexy PI/GI a implantátové mPI/mBI, a šírka keratinizovanej gingívy — plus dôkazové Observation o stave fajčenia a HbA1c na úrovni prípadu. Supurácia je jedinou výnimkou: zostáva iba v JSON, keďže nie je súčasťou exportu FHIR.

Okrem vlastného exportu odontogramu Stav JSON / FHIR / PNG / JPG / SVG má **parodontálny graf** vlastnú exportnú cestu:
- **Parodontálny SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` vykresľujú celý parodontálny graf (grafika zubov + číselné riadky + klasifikácia 2017) ako jeden samostatný vektorový SVG (`buildPerioSvg()`), nezávisle od pripojeného DOM komponentu `PerioChart`. Tieto tri položky exportnej ponuky sú deaktivované, keď je `hasAnyPerioData()` false (prázdny graf nemá čo parodontálne exportovať).
- **PDF správa:** položka „Správa PDF…" v exportnej ponuke otvorí `ExportOptionsModal` — nastavovací dialóg (polia mena pacienta + dátumu narodenia + dátumu vyšetrenia, priamo prepojené s metadátami prípadu, pričom dátum vyšetrenia je predvolene nastavený na dnešný deň; zaškrtávacie políčka sekcií: údaje pacienta, graf odontogramu, popis odontogramu, individuálne poznámky — deaktivované, ak žiadny zub nemá poznámku — parodontálny stav, parodontálny popis) pred volaním `exportPdf(opts)`. Prázdne identifikačné polia sa vrátia k zástupným hodnotám („John Doe" / „1980-01-01"), takže export vždy prebehne úspešne. PDF sa zostavuje natívne cez jsPDF — vektorový text cez `.text()`, rastrové obrázky zuba/parodontálneho grafu cez `.addImage()` — **bez závislosti na svg2pdf.js**. Sekcia individuálnych poznámok sa automaticky preskočí, keď žiadny zub nemá poznámku, a obe parodontálne sekcie sa preskočia, keď je `hasAnyPerioData()` false, bez ohľadu na zaškrtávacie políčka dialógu.
- **Obmedzenie mPI/mBI na implantáty:** peri-implantátové Mombelliho indexy (mPI/mBI) sa vykresľujú ako riadky iba v oblúku, ktorý obsahuje aspoň jeden implantátový zub — platí to pre živý parodontálny graf aj pre exporty SVG/PDF.
- Meno pacienta, dátum narodenia a dátum vyšetrenia sú iba identifikačné metadáta grafu (payload `2.20`, doplnkové) — **nie sú** súčasťou exportu FHIR.

### 📁 Štruktúra priečinkov
- `src/App.tsx` - rozhranie shellu, ovládacie prvky hornej lišty, prepínač jazyka/číslovania/tmavého režimu/témy/pluginu
- `src/odontogram.ts` - SVG vrstevnací modul, správa stavu zubov, dotykové interakcie, prekrytia pluginov, zapojenie rozhrania
- `src/plugin.ts` - typ `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priority z-indexu `LAYER_Z`
- `src/theme.ts` - typ `OdontogramThemeConfig` a pomocná funkcia `applyThemeConfig()`
- `src/status_extras.ts` - 34 preddefinovaných šablón reštaurácií (mostíky, protézy, stegové konštrukcie)
- `src/i18n/` - preklady (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) a i18n hook
- `src/utils/numbering.ts` - konverzia číslovania FDI, Universal, Palmer
- `src/registry/` - deklaratívny register klinických osí: mapovania polí FHIR, aktivácia SVG-clear-set/boolean príznakov, matica typ×materiál náhrady, zoznamy možností rozhrania (jediný zdroj pravdy generujúci export/import, FHIR aj rozhranie výberov)
- `src/fhir/` - export/import HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, systémy kódov, mapovania polí, primitíva
- `src/bridgeOverlay.ts` - prekrytie konektora viaczubového mostíkového úseku (geometria sedla prispôsobená oblúku)
- `src/SettingsModal.tsx` - záložkový dialóg Nastavenia (Všeobecné/Panely/Detaily zuba/Kaz/Dreň/Poznámky/Periodontálne)
- `src/perioExport.ts` - `buildPerioSvg()`: celý parodontálny graf ako jeden samostatný vektorový SVG
- `src/perioPdf.ts` - čistý zostavovač PDF správy pre `exportPdf()` cez jsPDF (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - nastavovací dialóg exportu „Správa PDF…"
- `src/__tests__/` + `src/registry/__tests__/` - rozsiahly automatizovaný testovací balík Vitest
- `src/assets/teeth-svgs/` - SVG šablóny zubov (6 súborov: rezáky, špičáky, premoláre, moláre + oklúzne pohľady)
- `src/assets/icon-svgs/` - SVG ikony panela nástrojov (5 súborov)

### ⚙️ Technologický zásobník
- React 18 + Vite + TypeScript
- Tailwind CSS pre štýlovanie rozhrania
- Vrstvenie SVG cez manipuláciu DOM (nie React stav pre výkon)
- Ľahký vlastný systém i18n
- Vitest + Testing Library pre automatizované testy
- TypeDoc pre dokumentáciu API
- Vite alias cesty: `@` mapovaný na `./src`

### 📝 Poznámky
- SVG šablóny sa načítavajú z `src/assets/teeth-svgs` a `src/assets/icon-svgs`, takže statický hosting musí poskytovať priečinok public.
- Modul odontogramu používa vlastný interný stav (nie React stav) pre výkon a jednoduchosť.
- Mliečne zuby majú obmedzenú sadu dostupných materiálov (žiadne amalgámové výplne, žiadne endodontické kolíky).
- Implantátové zuby majú inú sadu možností korunky/abutmentu ako prirodzené zuby.

### 🔒 Bezpečnostné poznámky

- **Pluginy bežia ako dôveryhodný kód.** Návratová hodnota `renderSvg()` pluginu sa vkladá do SVG živého grafu. Tento výstup je pred vložením sanitizovaný knižnicou [DOMPurify](https://github.com/cure53/DOMPurify) (SVG profil plus `svgFilters`) — `<script>`, `<iframe>`, `<object>`, `<embed>` a `<foreignObject>` sú úplne zakázané a úplne škodlivý výstup je zahodený namiesto čiastočného vykreslenia. Toto znižuje dosah kompromitovaného alebo chybného pluginu, no pluginy by sa mali naďalej načítavať iba zo zdrojov, ktorým dôverujete — sanitizácia je poistka, nie náhrada za preverenie.
- **Content-Security-Policy.** Produkčný build dema vkladá túto politiku cez tag `<meta http-equiv="Content-Security-Policy">` (vývojový server nie je ovplyvnený):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Hostiteľské aplikácie vkladajúce `OdontogramShell` by si mali nastaviť vlastný CSP zodpovedajúci ich nasadeniu — komponent žiadny nevkladá, keď sa používa ako knižnica.

### 📖 Ako citovať

Ak tento modul použijete vo svojej práci, prosím, citujte ho.

**Táto verzia (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Všetky verzie (konceptové DOI):** https://doi.org/10.5281/zenodo.21156787

> Konceptové DOI pre všetky verzie vyššie sa vždy odkazuje na najnovšie archivované
> vydanie; DOI špecifické pre danú verziu sa vytvára pri každom vydaní v čase jeho
> archivácie na Zenodo. Kým nie je v2.4.0 archivovaná, citujte ju cez konceptové DOI.

Strojovo čitateľné citačné metadáta sú v súbore [`CITATION.cff`](../CITATION.cff).

## 🙌 Poďakovanie

React Advanced Odontogram vytvára a spravuje Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), tvorca a hlavný vývojár celého enginu. S cennou pomocou prispievateľov uvedených nižšie. Ďakujeme všetkým, ktorí prispeli.

**Prispievatelia**

- [@odontodev](https://github.com/odontodev): hydratácia stavu a API životného cyklu, nastavenia výplní ako riadené props, idempotentné settery a zbaliteľné karty; nastavenia zobrazenia grafu a `getNumberingSystem()` sprístupnené hostiteľskej aplikácii, plus chýbajúce `onStateChange` notifikácie pre nastavenia relácie a poznámky k zubom
- [@JulianoBazzi](https://github.com/JulianoBazzi): preklad do brazílskej portugalčiny
- [@yassine-bhn](https://github.com/yassine-bhn): preklad do francúzštiny a navrhovaná meraná anatómia
- [@saegerdirk-star](https://github.com/saegerdirk-star): meraná anatómia zuba a generátor zubov, plus návrh skladateľného rozhrania; tri opravy prevzaté z ich forku (údaje pacienta v PDF, orientácia zubov v parodontálnom zázname, rýchlosť výberu)
- [@sofia-cluadette](https://github.com/sofia-cluadette): API výberu `getSelectedTeeth()`

**Vytvorené pomocou** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) a [Tailwind CSS](https://tailwindcss.com).

Príspevky sú vítané. Otvorte pull request na GitHub a budete tu uvedení. Ak je pre vás projekt užitočný, [pridajte mu hviezdu na GitHub](https://github.com/ZoliQua/React-Advanced-Odontogram).
