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

## 📑 Spis treści

- [📋 Przegląd](#-przegląd)
- [📦 Użycie jako pakiet npm](#-użycie-jako-pakiet-npm)
- [✨ Kluczowe funkcje](#-kluczowe-funkcje)
- [📦 Moduły](#-moduły)
- [🛠️ Kontrolki interfejsu](#-kontrolki-interfejsu)
- [🦷 Typy zębów i stany](#-typy-zębów-i-stany)
- [⚙️ Ustawienia](#-ustawienia)
- [🖼️ System szablonów SVG](#-system-szablonów-svg)
- [🔢 Systemy numeracji](#-systemy-numeracji)
- [🚀 Użycie](#-użycie)
- [🔗 Integracja](#-integracja)
- [🧪 Testowanie](#-testowanie)
- [📖 Dokumentacja API](#-dokumentacja-api)
- [📡 Publiczne API](#-publiczne-api)
- [💾 Trwałość stanu (localStorage)](#-trwałość-stanu-localstorage)
- [💾 Format eksportu/importu statusu](#-format-eksportuimportu-statusu)
- [🖨️ Eksport](#-eksport)
- [📁 Struktura folderów](#-struktura-folderów)
- [⚙️ Stos technologiczny](#-stos-technologiczny)
- [📝 Uwagi](#-uwagi)
- [🔒 Uwagi dotyczące bezpieczeństwa](#-uwagi-dotyczące-bezpieczeństwa)
- [📖 Jak cytować](#-jak-cytować)

## 🇵🇱 Polski

### 📋 Przegląd
Ten projekt to interaktywny edytor odontogramu oparty na przeglądarce, umożliwiający szybkie dokumentowanie statusu stomatologicznego w przejrzystym interfejsie. Renderuje warstwowe szablony SVG zębów w celu reprezentowania uzupełnień, próchnicy, stanu endodontycznego, ruchomości i innych szczegółów klinicznych, oferując wielokrotne zaznaczanie, filtry wyboru i predefiniowane presety statusu.

---
![Odontogram – podgląd (polski)](screenshot_pl_odontogram.png)

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### 📦 Użycie jako pakiet npm

Odontogram jest dostępny jako samodzielna biblioteka komponentów React na npm:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Wymagania
- **React 18 lub 19** (zadeklarowany jako peer dependency — dostarczany przez Twoją aplikację).
- **Bundler** rozumiejący pole `exports` oraz ESM: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. Pakiet jest dostępny **wyłącznie jako ESM**.
- Node **≥ 18** do narzędzi deweloperskich.

#### Instalacja

```bash
npm install react-advanced-odontogram react react-dom
```

#### Podstawowe użycie

Wyrenderuj `OdontogramShell` i zaimportuj arkusz stylów **raz** w dowolnym miejscu swojej aplikacji:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="pl"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Właściwości (props) komponentu

`OdontogramShell` jest komponentem kontrolowanym. Najczęściej używane propsy:

| Prop | Typ | Domyślnie | Opis |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Język interfejsu (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | System numeracji zębów. |
| `darkMode` | `boolean` | `false` | Przełącznik trybu ciemnego. |
| `readOnly` | `boolean` | `false` | Wyłącza całą edycję (tylko podgląd). |
| `themeConfig` | `OdontogramThemeConfig` | — | Nadpisuje zmienne CSS motywu (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Rejestruje niestandardowe wtyczki stanu / dodatkowe warstwy. |
| `enableNotes` | `boolean` | `false` | Włącza notatki dla poszczególnych zębów. |
| `enableIcdas` | `boolean` | `false` | Włącza ocenę próchnicy wg ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Złożoność wypełnienia: `"simple"` (jeden materiał na ząb) lub `"complex"` (materiały na powierzchnię). |
| `fillingDefectEnabled` | `boolean` | `true` | Włącza wykrywanie defektów wypełnienia na karcie Wypełnienia. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | wszystkie dostępne | Dostępne materiały wypełnień jako mapa wartości logicznych nad `amalgam`/`composite`/`gic`/`temporary` (nieznane klucze są ignorowane). |
| `fissureSealingEnabled` | `boolean` | `true` | Włącza lakowanie bruzd na karcie Wypełnienia. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Wywoływane, gdy użytkownik zmienia odpowiednie ustawienie w Ustawienia → Wypełnienia. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Wywoływane, gdy użytkownik zmienia ustawienie z poziomu interfejsu. |

Akceptowane są także bardziej szczegółowe propsy poziomu detali (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — pełną, otypowaną listę znajdziesz w dołączonych typach `.d.ts`.

Cztery propsy wypełnień powyżej służą **wyłącznie do przywracania**: pominięty prop nigdy nie zapisuje do silnika (imperatywne wywołanie `setFillingComplexity()` przed montażem jest zachowane, a tryb samodzielny pozostaje niezmieniony), natomiast dostarczony prop zapisuje silnik i stan modala Ustawienia razem, dzięki czemu modal nigdy nie pokazuje nieaktualnej wartości. `fillingMaterialAvailability` jest stosowana różnicowo za pomocą kanonicznego, serializowanego klucza — ponowne renderowanie z literałem inline o identycznej zawartości nigdy nie przepisuje silnika. Pasujące wywołania `on*Change` uruchamiają się z Ustawienia → Wypełnienia: to ścieżka zapisu zwrotnego dla hostów zapisujących preferencje.

#### Publiczne API (eksporty nazwane)

`OdontogramShell` jest zarówno eksportem domyślnym, jak i eksportem nazwanym. Imperatywne API stanu, samodzielny komponent `PerioChart`, prowadzona wycieczka po interfejsie oraz wszystkie publiczne typy są eksportami nazwanymi z tego samego punktu wejścia:

```ts
import {
  OdontogramShell,           // również eksport domyślny
  PerioChart,                // samodzielny komponent karty periodontologicznej
  // odczyt stanu
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // subskrypcja zmian stanu
  // eksport / import
  exportFhir,                // pakiet HL7 FHIR R4
  exportSvg, exportImage,    // eksport wykresu wektorowy / rastrowy
  setImportFormat,
  // sterowanie
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // uruchamia wprowadzającą wycieczkę
  // …i wiele innych funkcji ustawień setX/getX
} from "react-advanced-odontogram";
```

Pełny zakres API (≈ 44 funkcje + typy takie jak `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) jest w pełni otypowany w dołączonych deklaracjach.

#### Komponowalne powierzchnie (zaawansowane)

`OdontogramShell` to obsługiwany komponent typu wszystko w jednym i nie wymaga dodatkowej konfiguracji. Jeśli chcesz umieścić regiony odontogramu w różnych obszarach własnego układu, cztery powierzchnie interfejsu powłoki są również eksportowane i można je komponować pod jednym `OdontogramProvider`, wszystkie współdzieląc jedną sesję zarządzaną przez pakiet:

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

`OdontogramProvider` przyjmuje te same propsy co `OdontogramShell`. Dostępny jest hook `useOdontogramUi()` (oraz typ `OdontogramUiContextValue`) do budowania własnych powierzchni. Aktualne ograniczenie: używaj jednego dostawcy na stronę. Powierzchnie można montować i odmontowywać na żądanie — po ponownym zamontowaniu automatycznie się ponownie wiążą. Sam `OdontogramShell` jest niezmieniony — to dokładnie ta kompozycja w domyślnym układzie.

Aby uzyskać jeszcze bardziej precyzyjną kompozycję, eksportowane są również poszczególne karty sterujące — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` i `ToothDetailsCard` — każda samodzielny, deklaratywny komponent, który odczytuje i zapisuje współdzieloną sesję za pośrednictwem API silnika (eksportowany jest hook `useEngineState()` do budowania własnych). Montuj tylko te karty, których potrzebuje dany układ, w dowolnej konfiguracji, pod jednym `OdontogramProvider`.

#### Użycie z Next.js (App Router)

Komponent działa wyłącznie po stronie klienta, dlatego renderuj go w komponencie klienckim:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="pl" numberingSystem="FDI" />;
}
```

Ewentualnie załaduj go za pomocą dynamicznego importu tylko po stronie klienta: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Ważne uwagi i obecne ograniczenia
- **Wyłącznie ESM** — pakiet publikuje pojedynczy moduł ES (`dist/odontogram.js`) oraz punkt wejścia deklaracji typów (`dist/index.d.ts`). Jest przeznaczony dla rozwiązywania modułów przez bundler; nie ma builda CommonJS.
- **Arkusz stylów jest oddzielny** — **musisz** zaimportować `react-advanced-odontogram/style.css` raz; nie jest on wstrzykiwany automatycznie. Stylowanie to globalny CSS ograniczony do `.odontogram-root` i sterowany zmiennymi CSS `--odon-*`.
- **SSR / tylko po stronie klienta** — komponent odczytuje DOM przy montowaniu (`document`), więc musi działać w przeglądarce. W frameworkach SSR renderuj go w komponencie klienckim (`"use client"`) lub poprzez dynamiczny import tylko po stronie klienta.
- **Zasoby są samodzielne** — pliki SVG zębów i ikon są osadzane w pakiecie JavaScript w czasie budowania; **nie ma żadnego pobierania zasobów w czasie działania** do konfigurowania ani niczego dodatkowego do skopiowania do folderu publicznego.
- **Jedna instancja na stronę** — stan silnika jest obecnie singletonem na poziomie modułu, więc renderowanie dwóch instancji `<OdontogramShell>` na tej samej stronie spowodowałoby współdzielenie przez nie stanu jednego wykresu. Obsługa wielu instancji jest planowana w przyszłej wersji.

---

### ✨ Kluczowe funkcje
- 🖱️ Szybkie zaznaczanie i wielokrotne zaznaczanie (CMD/CTRL + klik)
- 🦷 Typy zębów: stały, mleczny, implant, poddziąsłowy, brakujący
- 🦷 Podłoże zęba (niezależne od jakiejkolwiek odbudowy): naturalne, radix (pozostałość korzenia), złamane, przygotowane pod koronę
- 👑 Odbudowy według typu × materiału: korona / wkład (inlay) / nakład (onlay) / licówka / most z e.max, złota, gradii, cyrkonu, metalu, metalowo-ceramicznego, teleskopowego lub tymczasowego (nakład dostępny tylko w widoku okluzyjnym) — wybierane z jednego połączonego, niskoklikowego selektora „Fix: Korona – …”; istniejące korony `metal` migrują automatycznie do `metal-ceramic` (metalowo-ceramicznej); implanty korzystają z tego samego modelu typ × materiał, złożonego z warstwą łącznika implantu. Selektor jest zawężany wg rodzaju zęba: implant oferuje tylko koronę/most (plus pięć opcji łącznikowych opisanych poniżej); ząb brakujący/luka oferuje tylko przęsło mostowe (plus protezę ruchomą częściową/całkowitą); podłoże `radix` całkowicie ukrywa kontrolkę odbudowy (na pozostałości korzenia nie można zapisać żadnej odbudowy)
- 🦿 Protetyka ruchoma/na łącznikach na dedykowanej osi `prosthesis` (wpisy „Kivehető:” w połączonym selektorze): śruba gojąca implantu, lokator, lokator z protezą nakładaną, belka, belka z protezą nakładaną; ruchoma proteza częściowa lub całkowita wsparta na zębach
- 🌉 Zęby mostowe renderują zarówno koronę, jak i łącznik siodłowy; nakładka odcinka mostu wielozębowego renderuje jeden ciągły, uwzględniający łuk łącznik przez kolejne zęby mostu (przęsła + filary) oraz przerwy między nimi (górny i dolny łuk używają lustrzanej geometrii siodła, dzięki czemu łącznik pozostaje wyrównany na obu łukach), uwzględniona w eksporcie PNG/JPG/SVG; zastosowanie mostu przez preset Statusów natychmiast przelicza nakładkę na nowo
- 🔍 Dokumentowanie próchnicy na 6 powierzchniach: mezjalnej, dystalnej, policzkowej, językowej, okluzyjnej, podkoronowej
- 🪥 Materiały wypełnień na powierzchnię: amalgamat, kompozyt, GIC, tymczasowe
- 🏥 Jeden połączony selektor „Stan miazgi / endodontyczny” (zgrupowany: żywa miazga vs. leczona/endo): stany endodontyczne (wypełnienie lecznicze, wypełnienie kanałowe, niekompletne wypełnienie kanałowe, wkład z włókna szklanego, wkład metalowy) i diagnoza miazgi wg AAE (`pulpDx`: normalna / odwracalne / nieodwracalne zapalenie miazgi / martwica) wykluczają się wzajemnie — ząb leczony kanałowo (ustawione `endo`) nie może jednocześnie mieć diagnozy żywej miazgi; przy leczeniu `pulpDx` jest normalizowane do wartości `normal`, a symbol chorej miazgi jest ukrywany. Odwracalne zapalenie miazgi renderuje zredukowany symbol miazgi. Opcjonalne 3-poziomowe ustawienie szczegółowości miazgi (`pulpDetailLevel`: proste / AAE / praktyczna łacina) udostępnia 9 praktycznych łacińskich podtypów miazgi (pulpa sana … gangraena pulpae) za pomocą `pulpLatin`; resekcja i wkład parapulpalny pozostają osobnymi wskaźnikami specjalnymi
- 🦴 Diagnoza okołowierzchołkowa (`apicalDx`: objawowe/bezobjawowe zapalenie ozębnej wierzchołkowej, ostry/przewlekły ropień okołowierzchołkowy, osteoskleroza) bezpośrednio determinuje symbol okołowierzchołkowy; kwalifikator podtypu zmiany ziarniniak/torbiel jest pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej (zbędny podtyp „ropień” został usunięty — jest już pokryty przez diagnozę okołowierzchołkową)
- 🩹 Połączona karta „Korzeń i przyzębie” (jedna zwijana sekcja dla wyników dotyczących korzenia/okołowierzchołkowych i przyzębia)
- ⚕️ Modyfikacje: zapalenie okołowierzchołkowe (widoczne tylko przy zębach brakujących/w zębodole poekstrakcyjnym; ukryte przy zębach obecnych, gdzie symbol okołowierzchołkowy determinuje wyłącznie `apicalDx`, oraz przy implantach, gdzie pokrywa to `periImplant`), choroba przyzębia, stopnie ruchomości (M1/M2/M3, ukryte przy implantach)
- 🦷🔩 Stan okołowszczepowy (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — klasyfikacja wg World Workshop 2018, pokazywana jako dedykowany selektor przy implantach; zapalenie śluzówki wykorzystuje symbol dziąsła przyzębnego, zapalenie tkanek okołowszczepowych dodaje stopniowaną warstwę `peri-implant-bone-loss` (nieprzezroczystość 0,4/0,7/1,0). Implanty nie renderują już symbolu zmiany okołowierzchołkowej — ich stan zapalny jest teraz wyrażany przez tę oś — a pola wyboru modyfikatorów przyzębnych są ukryte przy implantach (doraźne przeetykietowanie pola wyboru „Zapalenie tkanek okołowszczepowych” zostało wycofane)
- 🏷️ Wskaźniki specjalne: korona wymagana, wymiana korony konieczna, zamknięta luka, plan ekstrakcji, lakowanie bruzd, utrata punktu stycznego
- 👁️ Przełączniki widoku okluzyjnego, zębów mądrości, widoczności kości i miazgi
- 🔢 12 filtrów wyboru (wszystkie, obecne, stałe, mleczne, implanty, brakujące, górne/dolne, przednie/trzonowe)
- 📊 Predefiniowane presety statusu (reset, uzębienie mleczne, uzębienie mieszane, bezzębny)
- 📦 34 predefiniowane szablony uzupełnień (mosty, protezy ruchome, protezy na belce z implantami)
- 💾 Eksport/import statusu w formacie JSON (wersja 2.22; import nadal akceptuje starsze wersje 1.4 oraz 2.0 do 2.21 i migruje je automatycznie, wraz z niestandardowymi stanami wtyczek i notatkami do zębów)
- 💽 Opcjonalna (wyłączona domyślnie) trwałość stanu w `localStorage` (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — automatycznie zapisuje wykres statusu (a opcjonalnie także wykres planu) przy każdej zmianie stanu i przywraca go przy kolejnym zamontowaniu komponentu, z zabezpieczeniem rozmiaru 4 MB oraz błędami przekazywanymi do wywołania zwrotnego `onError` (lub `console.warn`) zamiast rzucania wyjątku
- 🔗 Eksport HL7 FHIR R4 (kolekcja Bundle z obserwacjami na ząb, kodowanie zębów wg ISO 3950 dla uzębienia stałego **i** mlecznego (51-85, bezstratny odzwrotny import), lokalny system kodów, a także opcjonalna warstwa SNOMED CT (Ustawienia → SNOMED CT)); komponent próchnicy z zapisaną ciężkością niesie też kodowanie systemu punktacji — ICDAS na powierzchni pierwotnej (bez wypełnienia), CARS na powierzchni wtórnej (z wypełnieniem)
- ✚ Interfejs wyboru powierzchni w układzie krzyżowym (B/M/O/D/L) dla próchnicy i wypełnień
- 🧱 Materiały wypełnień na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- 🖼️ Eksport obrazu PNG/JPG/SVG wykresu (do pobrania; PNG/JPG rastrowane z wektorowego SVG)
- 🦷 Próchnica/próchnica wtórna jako maszyna stanów per powierzchnia: spróchniała powierzchnia bez wypełnienia jest renderowana jako próchnica pierwotna (nieprzezroczystość warstwowana wg ICDAS); gdy tylko ta powierzchnia ma wypełnienie, jest renderowana zamiast tego jako próchnica wtórna (nawracająca) (warstwa `subcaries-{surface}`, punktowana wg CARS) — obie nigdy nie są aktywne jednocześnie na tej samej powierzchni
- 🎯 Ujednolicona wartość ciężkości na powierzchnię (`cariesSeverity`, 0–6, zastępująca dawne osobne pola głębokości ICDAS i CARS): odczytywana jako głębokość ICDAS na powierzchni pierwotnej, jako nazwany wynik CARS (Zdrowy … Rozległy ubytek) na powierzchni wtórnej, poprzez kontekstowy popup pokazujący tylko skalę odpowiednią dla aktualnego stanu powierzchni
- 🌱 Próchnica korzenia (`rootCaries`: `none` / `active` / `arrested` / `active-cavitated`), uruchamiająca dedykowaną warstwę grafiki próchnicy korzenia z nieprzezroczystością zależną od ciężkości (active 0,5 / arrested 0,7 / active-cavitated pełna nieprzezroczystość)
- 📡 Radiologiczna głębokość próchnicy (`radiographicDepth`: brak / E1 / E2 / D1 / D2 / D3 na powierzchnię), niezależna od wizualnej skali ciężkości ICDAS/CARS, prezentowana jako odznaka i zwrotnie zapisywana we własnej obserwacji FHIR
- 🎚️ Trzy ustawienia szczegółowości próchnicy (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) oraz przełącznik `cariesDepthEnabled`, zwijające każdą skalę do prostszego widoku wyboru bez utraty zapisanej wartości
- 🩹 Wiersz podsumowania próchnicy wtórnej w panelu wypełnień: pod kontrolkami wypełnień wymienia każdy wybrany ząb z próchnicą wtórną i jego powierzchnie (np. „36 (O) ma próchnicę wtórną przy wypełnieniu.”)
- 🪛 Wady wypełnienia na powierzchnię (`fillingDefect`: `none` / `marginal` / `fracture` / `wear`) w bezpośrednich odbudowach, niezależne od próchnicy wtórnej — dokumentowane za pomocą wskaźnika na powierzchnię na karcie Wypełnień (analogicznie do wskaźnika głębokości próchnicy, z listą opcji ułożoną pionowo), renderowane na wykresie oraz pokazywane w etykietce i w podsumowaniu wypełnień całej jamy ustnej z jawną etykietą (np. „36 (O) – Wada wypełnienia: O: brzeżna”), w ten sam sposób, w jaki próchnica wtórna jest opisywana w wierszu Próchnicy; karta Wypełnień pokazuje też notatkę pomocniczą dla każdego wybranego zęba z odnotowaną wadą wypełnienia (np. „36 ma odnotowaną wadę wypełnienia.”), analogicznie do istniejącej notatki pomocniczej dot. próchnicy wtórnej
- 🦷💥 Starcie zęba typowane wg przyczyny klinicznej i lokalizacji (`wearEdge`: `none` / `attrition` / `erosion`, sieczne/okluzyjne; `wearCervical`: `none` / `abrasion` / `abfraction` / `erosion`, szyjkowe) — zastępujące dwie dawne flagi włącz/wyłącz starcia bruksistycznego; dokumentowane za pomocą dwóch list rozwijanych w wierszu starcia, wykorzystuje istniejącą grafikę starcia i jest pokazywane w etykietce oraz w nowej sekcji podsumowania „Starcie” dla całej jamy ustnej
- 🎨 Przebarwienie zęba wg przyczyny (`discoloration`: `none` / `tetracycline` / `fluorosis` / `nonvital` / `extrinsic` / `other`) na zębach stałych i mlecznych — zabarwia widoczną naturalną koronę reprezentatywnym kolorem, gdy ząb nie ma odbudowy i ma naturalne podłoże; pokazywane w etykietce oraz w nowej sekcji podsumowania „Przebarwienie” dla całej jamy ustnej; uzupełnia zestaw stanów powierzchniowych i strukturalnych obok wad wypełnienia i starcia
- ✏️ Zęby przednie (siekacze/kły) etykietują swoją powierzchnię żującą jako „sieczną” w całym interfejsie (selektor, popup, podsumowania); przechowywany klucz powierzchni pozostaje `occlusal`
- 🔤 Notacja powierzchni zależna od pozycji zęba (Ustawienia → Szczegóły zęba → „Notacja powierzchni”, prosta/pełna, domyślnie pełna): w trybie pełnym litera i etykieta powierzchni próchnicy/wypełnienia podążają za anatomią zęba — okluzyjna → I/sieczna na zębach przednich, policzkowa → L/wargowa na zębach przednich, językowa → P/podniebienna na zębach górnych i L/językowa na zębach dolnych (mezjalna/dystalna/podkoronowa są niezmienione); tryb prosty zawsze używa ogólnego zestawu B/M/O/D/L/SC niezależnie od pozycji zęba. Dotyczy podsumowania całej jamy ustnej oraz obu selektorów powierzchni (próchnicy i wady wypełnienia) (litera + podpis); przechowywany klucz powierzchni pozostaje bez zmian
- 🦷↕️ Dokumentowanie ortodontyczne na ząb (`orthoAppliance`: `none` / `bracket` / `band`; `orthoDrift`: `none` / `mesial` / `distal`; `orthoVertical`: `none` / `extrusion` / `intrusion`; `orthoRotation`: wartość logiczna) na obecnym, naturalnym zębie (stałym lub mlecznym) — wykorzystuje uśpioną grafikę ortodontyczną z wersji 2.5.0 (bez nowego SVG); pokazywane na wykresie, w etykietce oraz w nowej sekcji podsumowania „Ortodoncja” dla całej jamy ustnej
- 🪨 Kamień nazębny oraz resorpcja korzenia typowana jako wewnętrzna lub zewnętrzna szyjkowa (`resorptionType`)
- 📏 Głębokość próchnicy na powierzchnię (powierzchowna / zębina / głęboka), lub opcjonalne punktowanie ICDAS II (0–6) za pomocą `enableIcdas`
- 🩹 Przełącznik nieszczelności brzeżnej korony, widoczny tylko przy odbudowie koronowej lub mostowej
- 🧬 Kodowanie diagnoz oparte na standardach (WHO ICD-10, zawsze aktywne): każde odnotowane rozpoznanie generuje diagnozę zakodowaną w ICD-10 — próchnica zębów (K02), próchnica korzenia i próchnica zatrzymana (K02.2/.3), zapalenie miazgi i martwica miazgi (K04.0/.1), zapalenie ozębnej okołowierzchołkowej, ropień okołowierzchołkowy i torbiel korzeniowa (K04.4–.9), atrycja/abrazja/erozja/abfrakcja (K03.0–.8), kamień nazębny (K03.6), resorpcja zęba (K03.3), przebarwienie zęba (K00.3/K00.8/K03.7), utrata zęba (K08.1), korzeń resztkowy (K08.3) i złamanie zęba (S02.5) — widoczne w dymku podpowiedzi i podsumowaniu całej jamy ustnej oraz eksportowane jako zasoby FHIR Condition.
- 🩺 Karta Diagnozy dla zęba: przeglądaj wyprowadzone diagnozy ICD-10 dla danego zęba i zarządzaj nimi — pomiń błędnie wyprowadzoną diagnozę lub dodaj taką, której wykres nie odzwierciedla. Zbiór efektywny (wyprowadzone − pominięte + dodane) steruje eksportem FHIR.
- 🗺️ Stany przypadku / regionalne: odnotowuj diagnozy dla całej jamy ustnej, niezwiązane z jednym zębem — wada zgryzu i zaburzenie stawu skroniowo-żuchwowego (K07), torbiele jamy ustnej (K09), choroby gruczołów ślinowych (K11), zapalenie jamy ustnej i błony śluzowej (K12/K13) oraz rozwojowe anomalie uzębienia na poziomie łuku (K00) — każde opcjonalnie z lateralizacją (lewa / prawa / obustronna).
- 🌍 Krajowe pakiety kodowania (Ustawienia → System kodowania diagnoz): nakłada krajowy system kodowania na podstawę WHO ICD-10 — BNO-10 (węgierski, zlokalizowane wyświetlanie; zachowuje kod WHO) lub US ICD-10-CM (przemapowane kody, np. zakres dentofacjalny K07 → M26). Dodanie pakietu dla kolejnego kraju to niewielki wpis `CodingPack` — zobacz `CODING_PACKS.md`.
- 🔬 Warstwa SNOMED CT (Ustawienia → SNOMED CT, opcjonalna, domyślnie wyłączona): dodaje kodowanie SNOMED CT obok kodowania WHO i ewentualnego krajowego pakietu oraz koduje wyniki periimplantologiczne, które nie mają kodu WHO ICD-10. Kody ICD-10-CM i identyfikatory pojęć SNOMED mają charakter referencyjny/orientacyjny — przed użyciem klinicznym zweryfikuj je względem oficjalnej listy tabelarycznej ICD-10-CM / przeglądarki SNOMED CT.
- 🔁 Dwukierunkowa wymiana FHIR Condition: diagnozy są eksportowane jako zasoby FHIR `Condition` (powiązane z zębem, a także stany na poziomie przypadku pacjenta z polem `bodySite` określającym lateralizację) obok obserwacji, a import je odtwarza — stany przypadku bezpośrednio, a nadpisania dodania/pominięcia dla poszczególnych zębów przez porównanie (diff) zaimportowanych zasobów Condition z ponownie wyprowadzonym wykresem.
- 🩺 **Karta Diagnozy, zmieniona:** każdy wiersz diagnozy dla zęba pokazuje najpierw kod ICD-10 (`K04.0 Pulpitis`), a wiersze są sortowane wg kodu. Każdy wiersz ma przełącznik **wyklucz** (usuwa diagnozę z eksportu FHIR, ale pozostawia ją na wykresie) i przycisk **usuń** (×), który usuwa diagnozę *oraz* odpowiadający jej wynik na zębie. Dodanie diagnozy z selektora zapisuje też leżący u jej podstaw wynik na wykresie, więc symbol pojawia się od razu.
- 🗂️ **Okno diagnoz przypadku/regionalnych:** diagnozy obejmujące całą jamę ustną i regionalne (anomalie szczękowe, torbiele, schorzenia ślinianek i błony śluzowej…) przeniesiono z paska bocznego periodontalnego do osobnego okna dialogowego, otwieranego przyciskiem **Diagnozy** obok przełącznika Odontogram / Status periodontalny; jego selektor jest sortowany wg kodu, z kodem na pierwszym miejscu.
- 🇭🇺 **Pakiet BNO-10:** węgierskie teksty wyświetlane to teraz oficjalne nazwy BNO-10 NEAK, a pakiet używa standardowego URI systemu ICD-10 (BNO-X jest identyczny z ICD-10 WHO).
- ✅ **Eksport FHIR czysty dla walidatorów HL7:** każdy wpis w Bundle nosi deterministyczny `id` i bezwzględny `fullUrl` (bez zastępczych `urn:uuid`), a Bundle osadza własny **CodeSystem** silnika, dzięki czemu jego lokalne kody dają się rozwiązać podczas walidacji; ten sam CodeSystem jest publikowany w repozytorium jako `fhir/CodeSystem-odontogram.json` (przekaż `includeCodeSystem: false` w opcjach eksportu FHIR, aby go pominąć).
- 🎯 **Kody ICD podążające za wykresem (specyficzność sterowana danymi).** Głębokość próchnicy pochodzi z głębokości radiograficznej, gdy jest udokumentowana (E1/E2 → szkliwo, D1–D3 → zębina), a w innym wypadku z ciężkości ICDAS jako rezerwowego źródła (1–3 → szkliwo, 4–6 → zębina), doprecyzowując WHO `K02` do `K02.0` / `K02.1`, a ICD-10-CM `K02.9` do `K02.51/.52` (bruzdy i zagłębienia) lub `K02.61/.62` (powierzchnia gładka) w zależności od powierzchni × głębokości. Przewlekłe zapalenie przyzębia otrzymuje swój kod ICD-10-CM na podstawie stopnia i zasięgu z 2017 r. (`K05.311`–`K05.329`). Jedna Condition na ząb, niosąca najgłębsze zajęcie.
- 🔄 **Dane periodontologiczne teraz krążą tam i z powrotem przez FHIR.** Import odczytuje panele periodontalne LOINC 74029-0 z powrotem do każdego zęba — głębokość sondowania, brzeg dziąsłowy (odtworzony z CAL, dzięki czemu wartości pseudokieszonek przetrwają), BOP, furkację, płytkę wg O'Leary'ego, wskaźniki PI/GI oraz implantologiczne mPI/mBI, a także szerokość dziąsła zrogowaciałego — plus dowodowe Observation statusu palenia i HbA1c. Rozpoznawane są też Condition kodowane wyłącznie w ICD-10-CM lub SNOMED CT, więc obcy bundle importuje to, co potrafi.
- 🧬 **SNOMED CT dla całego katalogu diagnoz.** 48 z 50 pozycji nosi teraz zweryfikowane pojęcie SNOMED CT International (aktywne, w module core, z pasującą FSN). Dwie pozostają celowo nieustawione, ponieważ SNOMED International nie ma dla nich pojęcia nadrzędnego: anomalia wielkości szczęki (K07.0) i zaburzenia czynnościowe zębowo-twarzowe (K07.5). Nakładka SNOMED pozostaje opcjonalna w Ustawieniach.
- 📦 **Ładowalny pakiet terminologii FHIR.** Folder `fhir/` w repozytorium to pakiet NPM FHIR (`react-advanced-odontogram.fhir`, FHIR 4.0.1) zawierający CodeSystem silnika oraz wygenerowane ValueSet — po jednym na grupę wartości osi klinicznej, jeden dla typów znalezisk i jeden zbiorczy ze wszystkimi kodami. Wskaż na niego walidatorowi przez `-ig ./fhir`.
- 🧰 Ujednolicony wiersz ikon paska górnego z zakładkowym oknem modalnym Ustawień (Ogólne / Panele / Szczegóły zęba / Próchnica / Miazga / Notatki / Periodontologia — numeracja, notatki, widoczność paneli, ICDAS, przełącznik głębokości próchnicy, szczegółowość próchnicy korzenia/radiologicznej, poziom szczegółowości miazgi, poziom szczegółowości starcia/przebarwienia zęba, informacje o zębach)
- 🗂️ Zakładka Ustawienia → „Panele”: niezależne pokazywanie/ukrywanie paneli podsumowania Statusów i Ortodoncji dla całej jamy ustnej
- 🦷🩺 Zakładka Ustawienia → „Periodontologia”: 16 przełączników pokazywania/ukrywania na indeks dla wierszy odontogramu periodontalnego (zgrupowanych: kieszonka/higiena/śluzówkowo-dziąsłowe/podparcie/okołowszczepowe — PD/GM/CAL/BOP, płytka, PI, GI, widoczność CEJ, konkawność korzenia, KG, GT, furkacja, ruchomość, klasa Millera, mPI, mBI), każdy z własnym opisem, oraz opcja wyświetlania nazw indeksów przetłumaczonych vs. kanonicznych (kanoniczna = stała naukowa nazwa angielska/łacińska w każdym języku interfejsu; etykietki zawsze pozostają zlokalizowane niezależnie od tego ustawienia). Oba są preferencjami na poziomie aplikacji (jak `perioViewMode`) — nigdy nie stanowią części ładunku eksportu
- 🩹 Kontrolka ustawień próchnicy wtórnej (CARS) połączona z zakładką ustawień Próchnicy, umieszczona nad Głębokością radiologiczną (osobna zakładka „Próchnica wtórna” została wycofana)
- 🎚️ Poziom szczegółowości szczegółów zęba (Ustawienia → Szczegóły zęba): ustawienie prosty/złożony dla starcia zęba i dla przebarwienia. Tryb prosty pokazuje przełącznik tak/nie dla każdego wyniku (starcie włączone → atrycja/abrazja, przebarwienie włączone → inne); tryb złożony (domyślny) zachowuje listy rozwijane typu/przyczyny, a zapisana wartość jest zachowywana przy przełączaniu poziomów
- 📋 Panel informacji o zębach: na żywo tekstowe podsumowanie całego wykresu (liczba zębów, listy obecnych/brakujących, próchnica w tym wtórna, wypełnienia, kanały korzeniowe, protetyka, implanty, stan przyzębia) — wyświetlany domyślnie, przełączany w Ustawieniach
- 🗂️ Skonsolidowane menu Eksportu (Status JSON / FHIR / PNG / JPG)
- 📥 Menu Importu z importem FHIR (zwrotne wczytywanie wyeksportowanych Bundli)
- ⏳ Nakładka postępu podczas eksportu obrazu
- 🎓 18-krokowy interaktywny samouczek wprowadzający
- 🔢 Trzy systemy numeracji (FDI, Universal, Palmer)
- 🌐 I18n — 12 języków interfejsu (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) z przełącznikiem języka; arabski wyświetla interfejs od prawej do lewej, a wykresy zębowe/periodontologiczne pozostają od lewej do prawej (tłumaczenie maszynowe, weryfikacja przez rodzimego użytkownika dla AR/ZH/FR w toku)
- 🌗 Obsługa trybu ciemnego z przyciskiem przełączania (samodzielny lub kontrolowany przez aplikację nadrzędną)
- 🎨 Konfiguracja niestandardowego motywu (właściwość `themeConfig`) z właściwościami niestandardowymi CSS (`--odon-*`)
- 📱 Mobilny interfejs dotykowy: wyskakujące okno powiększenia przy dotknięciu, menu kontekstowe przy długim przytrzymaniu, powiększanie szczypnięciem, cele dotykowe WCAG 44px, nawigacja po łukach
- 🔌 Niestandardowy system wtyczek SVG: wstrzykiwanie nakładek wizualnych, niestandardowy stan na ząb, obsługa eksportu/importu JSON — dane wyjściowe `renderSvg()` wtyczki są oczyszczane przez DOMPurify (profil SVG) przed wstawieniem do aktywnego wykresu; wtyczki nadal działają jako zaufany kod, więc należy ładować wtyczki wyłącznie z zaufanych źródeł
- 🛡️ Content-Security-Policy: produkcyjna wersja buildu wersji demo wstawia znacznik meta CSP (serwer deweloperski jest nieobjęty) — aplikacje hosta osadzające komponent powinny ustawić własną politykę CSP
- ⚠️ Ostrzeżenia walidacyjne stanu dla niezgodnych kombinacji stanów zębów
- 🏷️ Automatyczna etykietka stanu na kafelkach zębów (pokazuje wszystkie aktywne stany)
- 🩺 Zmodernizowana etykietka na ząb i panel podsumowania całej jamy ustnej: oba prezentują pełny zestaw wyników klinicznych (diagnoza miazgi/okołowierzchołkowa + podtyp zmiany, resorpcja korzenia, stan okołowszczepowy, stopniowana próchnica korzenia, kamień nazębny, nieszczelność brzeżna korony, złamanie, utrata punktu stycznego, typowane starcie sieczne/szyjkowe), z dedykowaną sekcją „Diagnozy” w panelu, dedykowaną sekcją „Starcie” oraz ogólnym kwalifikatorem ciężkości próchnicy (powierzchowna/umiarkowana/głęboka)
- ♿ Dostępność klawiaturowa (WCAG): role ARIA listbox/option, wybór Enter/Spacja, nawigacja strzałkami, kontury focus-visible
- 🔒 Tryb tylko do odczytu: wyłączenie wszystkich interakcji do drukowania/raportowania/przeglądania
- ✨ Animacje zaznaczenia: pulsująca przerywana ramka i świecący cień na zaznaczonych zębach (z obsługą prefers-reduced-motion)
- 📝 Notatki do zębów: dwuklik, aby dodać/edytować notatki, ikona notatki obok numeru zęba, etykietka po najechaniu z tekstem notatki, wiersz „Notatki indywidualne” w panelu podsumowania całej jamy ustnej, uwzględnienie w raporcie PDF, eksport/import JSON
- 🔀 Podział odontogramu Status ↔ Plan: przełącznik `Status | Plan` w nagłówku wykresu przełącza między wykresem bieżącego **statusu** a wykresem **planu** (zamierzonego leczenia), każdy z własnymi stanami zębów; wykres planu przy pierwszym przełączeniu startuje jako kopia statusu, a edycje w jednym wykresie nigdy nie wpływają na drugi. Eksport/import (`exportStatus`/`exportFhir`/import pliku) zawsze dotyczą wykresu statusu; wykres planu jest odczytywany/zapisywany osobno za pomocą własnego API (zob. Publiczne API poniżej) i — gdy różni się od statusu — jest dołączany jako dodatkowa sekcja `plan` w eksporcie JSON
- 📝 Panel „Co się zmienia”: gdy plan różni się od bieżącego statusu, panel pod panelem informacji o zębach wymienia każdą różnicę na ząb i oś leczenia (obecność, podłoże, odbudowa, protetyka, planowana korona, ortodoncja, miazga/endo, okołowierzchołkowe) jako wiersz `ząb: oś  z → na`; dostępne również programowo za pomocą `getPlanChanges()`

![Wykres periodontologiczny całej jamy ustnej (polski)](screenshot_pl_perio.png)

- 🩺 Dokumentowanie periodontologiczne: **głębokość sondowania**, **brzeg dziąsłowy**, **krwawienie przy sondowaniu** (+ ropienie) na miejsce, w sześciu standardowych miejscach na ząb, z pochodnym **klinicznym poziomem przyczepu (CAL = PD + brzeg dziąsłowy)**, recesją i **%BOP** dla całej jamy ustnej. **Graficzny odontogram periodontalny całej jamy ustnej** — każdy łuk rysowany jako **dwa osobne SVG, policzkowy i podniebienny/językowy** (wykorzystujące grafikę zębów z jednolitą orientacją korony w stronę pasma na obu aspektach; **grafika implantu** dla zębów z implantem) z czerwoną **linią CEJ**, **numerowaną siatką milimetrową** i **krzywą brzegu dziąsłowego/głębokości kieszonki** nad zębami, rozdzieloną przez **centralne pasmo indeksów periodontalnych** (oznaczone `▲ Buccal … Lingual/Palatal ▼`), które grupuje wspólne indeksy na ząb — **klasa Millera** na samej górze, a **Płytka/PI/GI/mPI/mBI** renderowane jako **anatomiczny romboidalny kafelek** na ząb (wierzchołek policzkowy u góry, wierzchołek językowy u dołu, mezjalny/dystalny w środkowym rzędzie zamienione stronami tak, aby mezjalny zawsze wskazywał w stronę linii środkowej łuku); wiersze liczbowe (pełne nazwy indeksów — PD/GM/CAL/BOP + ruchomość + furkacja — w większych, bardziej dotykowych komórkach) wyrównane w kolumnach oraz podsumowanie (średnie PD/CAL, %BOP, %PI), z wprowadzaniem danych przez **automatyczne przechodzenie klawiaturą**; wykres **dynamicznie skaluje się, aby wypełnić dostępną szerokość**, responsywny przy dowolnym rozmiarze okna. Prezentowany jako **przełącznik widoku** `Odontogram | Periodontal Status`, którego prawy panel jest przekształcany w **pasek boczny kontekstu periodontalnego** (dane pacjenta, klasyfikacja z 2017 r. oraz podsumowanie całej jamy ustnej), gdy ten widok jest aktywny (opcja w Ustawieniach przełącza całą prezentację z powrotem na **okno wyskakujące**), a nadal pozostaje **komponentem wywoływanym osobno** (eksport `PerioChart`), dzięki czemu aplikacja hostująca może wywołać odontogram periodontalny niezależnie od podstawowego odontogramu. Eksport **FHIR** na miejsce za pomocą panelu periodontalnego LOINC (`74029-0`; PD `32910-2`, recesja `32911-0`, CAL `32912-8`)
- 🅿️ Stylizacja propozycji: w trybie Plan wyniki, które plan **dodaje** względem bieżącego statusu (planowana korona, ekstrakcja, ruch ortodontyczny, protetyka, …) są renderowane z wyraźnym **przerywanym, zabarwionym konturem „propozycji”**, dzięki czemu plan czyta się jako zamiar, a nie fakt — z legendą „przerywana linia = propozycja” na karcie wykresu. Renderowanie w trybie Status jest identyczne co do bajtu; leczenie dotyczy wyłącznie planu i jest w pełni resetowane przy powrocie do statusu
- 🚦 Blokowanie trybu Plan: wykres Planu pokazuje tylko to, co dentysta może *zrobić* — podstawowy selektor oferuje wyłącznie Brak / Stały / Implant, a wyniki dotyczące wyłącznie statusu (próchnica, starcie zęba, przebarwienie oraz cały blok periodontologiczny — ruchomość, sześciopunktowa siatka sondowania, modyfikatory zapalenia/przyzębia, kamień nazębny, stan okołowszczepowy) są ukryte; kontrolka miazgi/endo zachowuje endodontyczne **leczenie** (leczenie kanałowe / wkład / resekcja endodontyczna / wkład parapulpalny), ukrywając jednocześnie **diagnozę** miazgi/okołowierzchołkową oraz resorpcję korzenia. Odbudowa, protetyka, ortodoncja, potrzeba/wymiana korony oraz plan ekstrakcji pozostają możliwe do zaplanowania
- 🧪 Obszerny zautomatyzowany zestaw testów Vitest obejmujący numerację, tłumaczenia, presety, i18n, komponent App, motyw, dotyk, wtyczki, dostępność oraz parytet osi klinicznych/diagnostycznych
- 📖 Dokumentacja API TypeDoc z komentarzami JSDoc dla wszystkich publicznych eksportów (`npm run docs`)

### 📦 Moduły
- 🦷 Siatka odontogramu i interfejs kafelków zębów
- 🎛️ Panel sterowania i statusu
- 🎨 Silnik warstwowania SVG i szablony
- 🔢 Numeracja zębów i mapowanie etykiet (FDI/Universal/Palmer)
- 🌐 Lokalizacja — 12 języków interfejsu (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), w tym arabski (RTL)
- 💾 Eksport/import statusu
- 📋 Dodatki statusu: predefiniowane szablony uzupełnień
- 🎨 Konfiguracja motywu: konfigurowalna paleta kolorów za pomocą właściwości CSS `--odon-*`
- 📱 Mobilne interakcje dotykowe (powiększenie przy dotknięciu, długie przytrzymanie, powiększanie szczypnięciem, przełącznik łuku)
- 🔌 Niestandardowy system wtyczek SVG
- ⚠️ System walidacji stanu i etykietek
- ♿ Dostępność klawiaturowa i obsługa ARIA
- 🔒 Tryb tylko do odczytu
- ✨ Animacje zaznaczenia
- 📝 System notatek do zębów
- 🧪 Zautomatyzowany zestaw testów (Vitest + Testing Library)

### 🛠️ Kontrolki interfejsu

**🔝 Pasek górny:**
- Przełącznik języka (lista rozwijana HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Przycisk przełączania trybu ciemnego (ikona słońca/księżyca, przełącza między jasnym i ciemnym motywem)
- Przełącznik systemu numeracji (lista rozwijana FDI/Universal/Palmer)
- Przyciski Eksportuj status / Importuj status

**📊 Nagłówek wykresu:**
- Przełącznik widoku okluzyjnego
- Przełącznik widoczności zębów mądrości
- Przełącznik widoczności kości
- Przełącznik widoczności miazgi
- Przycisk wyczyść zaznaczenie

**🔍 Filtry wyboru:**
- Zaznacz wszystkie / Wszystkie obecne / Stałe / Mleczne / Implanty / Wszystkie brakujące
- Zaznacz górne / Górne 6 przednich / Trzonowce górne
- Zaznacz dolne / Dolne 6 przednich / Trzonowce dolne

**📋 Presety statusu:**
- Resetuj wszystko (resetuj jamę ustną)
- Uzębienie mleczne
- Uzębienie mieszane
- Przełącznik bezzębności

**📦 Lista rozwijana Dodatki statusu:**
- Górne/dolne mosty cyrkonowe (12-22, 13-23, 16-26, pełny łuk)
- Górne/dolne mosty metalowe (12-22, 13-23, 16-26, pełny łuk)
- Górne/dolne częściowe protezy ruchome
- Górne/dolne całkowite protezy ruchome
- Górne/dolne protezy na belce z implantami

**🦷 Panel edycji zęba** (dla wybranego zęba/zębów, pogrupowany w zwijane karty):
- **Wiersz podstawowy:** wybór zęba (typ podstawowy z wariantami złamanej korony) i podłoże zęba (naturalne/radix/złamane/crownprep)
- **Wiersz odbudowy:** połączona lista rozwijana odbudowy „Fix: …” / „Kivehető: …” (stałe opcje `restorationType`×`restorationMaterial` plus opcje łącznikowe/ruchome `prosthesis`, zawężane wg rodzaju zęba); pole wyboru nieszczelności brzeżnej korony (tylko korona/most); pola wyboru lokalizacji złamanej korony; przełączniki korona wymagana / wymiana korony konieczna
- **Wiersz starcia i przebarwienia:** lista rozwijana typu starcia siecznego/okluzyjnego, lista rozwijana typu starcia szyjkowego, lista rozwijana przyczyny przebarwienia (każda zamienia się na prosty przełącznik tak/nie w trybie Ustawienia → Szczegóły zęba → tryb prosty)
- **Karta Ortodoncja:** aparat, przemieszczenie mezjalne/dystalne, ruch pionowy (ekstruzja/intruzja), przełącznik rotacji — pokazywana przy obecnym, naturalnym zębie
- **Karta Próchnica:** lista rozwijana trybu głębokości próchnicy, pole wyboru próchnicy podkoronowej, lista rozwijana ciężkości próchnicy korzenia oraz selektor powierzchni próchnicy B/M/O/D/L z kontekstowym popupem ICDAS-głębokość/CARS i odznaką głębokości radiologicznej
- **Karta Wypełnienia:** lista rozwijana materiału wypełnienia, selektor wypełnień na powierzchnię (z materiałem na powierzchnię), wskaźnik wady wypełnienia na powierzchnię (brzeżna/złamanie/starcie), notatki pomocnicze dot. próchnicy wtórnej i wady wypełnienia
- **Karta Korzeń i przyzębie:** połączony selektor „Stan miazgi / endodontyczny”, selektor diagnozy okołowierzchołkowej, selektor podtypu zmiany okołowierzchołkowej (tylko objawowe/bezobjawowe zapalenie ozębnej wierzchołkowej), selektor typu resorpcji korzenia, selektor stopnia ruchomości, selektor stanu okołowszczepowego (tylko implanty)
- **Wskaźniki specjalne:** plan ekstrakcji/rana, luka zamknięta, lakowanie bruzd, utrata punktu stycznego, kamień nazębny, wkład parapulpalny, resekcja endodontyczna, filar mostu

### 🦷 Typy zębów i stany

**Wybór zęba (typ podstawowy):**
| Wartość | Opis |
|---|---|
| `none` | Ząb brakujący |
| `tooth-base` | Ząb stały |
| `milktooth` | Ząb mleczny (mleczak) |
| `implant` | Implant stomatologiczny |
| `tooth-under-gum` | Ząb poddziąsłowy (niewyrznienty) |

**Warianty zęba złamanego:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Podłoże zęba (zęby stałe):**
`natural` (domyślne), `radix` (pozostałość korzenia), `broken`, `crownprep` (przygotowany pod koronę)

**Typ odbudowy (zęby stałe):**
`none`, `crown`, `inlay`, `onlay` (tylko widok okluzyjny), `veneer`, `bridge`

**Materiał odbudowy (zęby stałe):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (istniejące korony `metal` migrują tutaj), `telescope`, `temporary`

**Opcje odbudowy są zawężane wg rodzaju zęba** (`restorationOptions()` w `src/registry/restorations.ts`): implant oferuje tylko typy odbudowy `crown`/`bridge` (złożone z warstwą łącznika implantu) plus pięć poniższych wpisów łącznikowych `prosthesis`; ząb brakujący/luka oferuje tylko przęsło `bridge` plus dwa wpisy protez ruchomych `prosthesis`; podłoże `radix` całkowicie ukrywa kontrolkę odbudowy. Dawne płaskie pola `crownMaterial`/`bridgeUnit` (wartości łączników implantu/mostu sprzed v1.14) zostały wycofane z aktywnego modelu — są akceptowane wyłącznie jako tylko-do-odczytu ścieżka migracji dla starych danych.

**Protetyka ruchoma** (`prosthesis`; niezależna oś ruchoma/łącznikowa, prezentowana jako wpisy „Kivehető:” w połączonej liście rozwijanej odbudowy):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (łączniki implantu, z protezą nakładaną lub bez), `removable-partial`, `removable-full` (protezy wsparte na zębach przy zębie brakującym/luce). Ząb ma albo stałą odbudowę, albo protezę ruchomą, nigdy jedno i drugie jednocześnie — ustawienie jednej opcji czyści drugą.

**Nieszczelność brzeżna korony** (`crownLeakage`; wartość logiczna): pokazywana tylko gdy `restorationType` to `crown` lub `bridge`; aktywuje warstwę grafiki `crown-leakage`.

**Opcje endodontyczne (zęby stałe):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opcje endodontyczne (zęby mleczne):**
`none`, `endo-medical-filling`

`endo` i `pulpDx` są prezentowane przez jeden połączony `<select>` „Stan miazgi / endodontyczny” (zgrupowany: żywa miazga vs. leczona/endo) i wykluczają się wzajemnie — wybór opcji leczonej (`endo != none`) resetuje `pulpDx` do `normal`, a wybór diagnozy miazgi resetuje `endo` do `none`.

**Materiały wypełnień (zęby stałe):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiały wypełnień (zęby mleczne):**
`composite`, `gic`, `temporary`

**Powierzchnie wypełnienia/próchnicy:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (tylko próchnica)

**Modyfikacje:**
`inflammation` (okołowierzchołkowe), `parodontal` (przyzębia), `mobility` (M1/M2/M3)

**Typ zmiany okołowierzchołkowej** (`periapicalType`; kwalifikuje symbol okołowierzchołkowy, pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej):
`none`, `granuloma`, `cyst` — opcje dostępne do wyboru; dawna wartość `abscess` jest nadal akceptowana/przechowywana, ale nie jest już oferowana w selektorze, ponieważ dubluje diagnozę okołowierzchołkową. Przy imporcie jest usuwana: włączana do `apicalDx`, gdy ząb ma modyfikator zapalenia, w przeciwnym razie czyszczona do `none`

**Diagnoza miazgi** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (renderuje zredukowany symbol miazgi), `irreversible-pulpitis`, `necrosis` — wyklucza się wzajemnie z `endo`; normalizowana do `normal` przy zębie leczonym kanałowo

**Diagnoza miazgi, praktyczna łacina** (`pulpLatin`; selektor miazgi pokazuje ją tylko wtedy, gdy `pulpDetailLevel` ma wartość `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Poziom szczegółowości miazgi** (`pulpDetailLevel`, ustawienie globalne): `simple`, `aae` (domyślne), `latin` — kontroluje słownictwo oferowane przez selektor miazgi

**Diagnoza okołowierzchołkowa** (`apicalDx`; determinuje symbol okołowierzchołkowy):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Typ resorpcji korzenia** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stan okołowszczepowy** (`periImplant`; tylko przy implantach, klasyfikacja World Workshop 2018): `mucositis` wykorzystuje symbol dziąsła przyzębnego; `peri-implantitis-*` dodaje warstwę `peri-implant-bone-loss` przy nieprzezroczystości skalowanej wg ciężkości (łagodne 0,4 / umiarkowane 0,7 / ciężkie 1,0). Implanty nie renderują już symbolu zmiany okołowierzchołkowej (ich stan zapalny jest teraz wyrażany za pomocą tej osi), a pola wyboru `mods` zapalenie/przyzębie są ukryte przy implantach:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Ciężkość próchnicy** (`cariesSeverity`; ujednolicone pole na powierzchnię, `0`–`6`): na powierzchni bez wypełnienia jest odczytywana jako skala głębokości ICDAS (`superficial` / `dentin` / `deep`, lub surowe kody ICDAS II `0–6` przy włączonym `enableIcdas`) i renderuje warstwę pierwotną `caries-{surface}`; na powierzchni z wypełnieniem jest odczytywana jako nazwany wynik CARS (`0` zdrowa … `6` rozległy ubytek) i renderuje zamiast tego warstwę `subcaries-{surface}` (próchnica wtórna) — powierzchnia nigdy nie jest jednocześnie pierwotna i wtórna

**Próchnica korzenia** (`rootCaries`; uruchamia warstwę grafiki `caries-root` na obecnym zębie, z nieprzezroczystością zależną od ciężkości — `active` 0,5 / `arrested` 0,7 / `active-cavitated` pełna nieprzezroczystość):
`none`, `active`, `arrested`, `active-cavitated`

**Radiologiczna głębokość próchnicy** (`radiographicDepth`; na powierzchnię, niezależna od wizualnej skali ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Ustawienia szczegółowości próchnicy** (globalne): `secondaryCariesMode` (`simple`/`standard`/`full`, domyślnie `standard`), `rootCariesMode` (`simple`/`severity`, domyślnie `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, domyślnie `off`), `cariesDepthEnabled` (wartość logiczna, domyślnie `true`) — każde z nich zwija odpowiednią skalę do prostszego widoku wyboru bez zmiany zapisanej wartości

**Wskaźniki specjalne:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Starcie zęba** (`wearEdge`, `wearCervical`; typ kliniczny wg lokalizacji, uwarunkowane obecnością zęba podstawowego + brakiem odbudowy + naturalnym podłożem; renderuje istniejące warstwy `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Przebarwienie** (`discoloration`; przyczyna na ząb, uwarunkowane naturalnym zębem stałym lub mlecznym + brakiem odbudowy + naturalnym podłożem; zabarwia wypełnienie widocznej naturalnej korony — bez nowego SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Wada wypełnienia** (`fillingDefect`; na powierzchnię, wynik dotyczący bezpośredniej odbudowy, niezależny od próchnicy wtórnej — uwarunkowany obecnością powierzchni w `fillingSurfaceMaterials`; renderuje warstwę grafiki `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncja** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; na ząb, uwarunkowane obecnym, naturalnym zębem — stałym lub mlecznym):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (symbol strzałki w górę), `intrusion` (symbol strzałki w dół) — `orthoRotation`: wartość logiczna

**Ustawienia szczegółów / notacji zęba** (globalne ustawienia sesji, Ustawienia → Szczegóły zęba): `wearDetailLevel` i `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, domyślnie `complex` — tryb prosty pokazuje przełącznik tak/nie zamiast pełnej listy rozwijanej typu/przyczyny, bez zmiany zapisanej wartości) oraz `surfaceNotation` (`simple`/`full`, domyślnie `full` — kontroluje, czy litery/etykiety powierzchni próchnicy/wypełnienia są zależne od pozycji zęba; zob. „Notacja powierzchni zależna od pozycji zęba” powyżej)

### ⚙️ Ustawienia
Otwierane za pomocą ikony trybika na pasku górnym; okno dialogowe ARIA `dialog` z pułapką fokusu i układem zakładkowym (Esc/klik w tło zamyka, strzałki przełączają zakładki). Wszystkie ustawienia są wyłącznie stanem interfejsu na poziomie sesji, chyba że zaznaczono inaczej — żadne z nich nie zmienia danych na ząb ani struktury eksportu.

- **Ogólne:** system numeracji (FDI/Universal/Palmer), język, motyw jasny/ciemny, widoczność panelu informacji o zębach
- **Odontogram:** profil anatomii zębów (`classic` domyślny / `measured`) — `measured` renderuje dziewięć szablonów zębów zmierzonych na podstawie literatury w układzie dwułukowym z szerokością na ząb; przełączalny w czasie działania, bez wpływu na domyślny `classic`; jego grafika to osobny chunk pobierany dopiero przy przełączeniu, więc domyślny `classic` nic nie kosztuje
- **Panele:** niezależne pokazywanie/ukrywanie karty podsumowania Statusów oraz karty Ortodoncji dla całej jamy ustnej (obie domyślnie widoczne)
- **Szczegóły zęba:** poziom szczegółowości starcia i poziom szczegółowości przebarwienia (prosty/złożony, oba domyślnie złożone), notacja powierzchni (prosta/pełna, domyślnie pełna)
- **Próchnica:** przełącznik punktowania ICDAS II (`enableIcdas`), przełącznik głębokości próchnicy (`cariesDepthEnabled`), szczegółowość próchnicy korzenia (`rootCariesMode`: simple/severity), szczegółowość wtórna/CARS (`secondaryCariesMode`: simple/standard/full), szczegółowość głębokości radiologicznej (`radiographicDepthMode`: off/threeLevel/detailed) — dawna osobna zakładka „Próchnica wtórna” została połączona z tą zakładką, a kontrolka CARS umieszczona bezpośrednio nad głębokością radiologiczną
- **Miazga:** poziom szczegółowości miazgi (`pulpDetailLevel`: simple/AAE/practical-Latin, domyślnie AAE) — kontroluje, jakie słownictwo oferuje selektor „Stan miazgi / endodontyczny”; zmiana na żywo odświeża podsumowanie całej jamy ustnej oraz każdą otwartą etykietkę
- **Notatki:** włącz/wyłącz notatki do zębów (`enableNotes`)
- **Periodontologia:** przełączniki pokazywania/ukrywania na indeks dla wszystkich 16 wierszy odontogramu periodontalnego (`perioRowVisibility`, domyślnie wszystkie widoczne), zgrupowane Kieszonka (PD/GM/CAL/BOP) / Higiena (Płytka/PI/GI) / Śluzówkowo-dziąsłowe (widoczność CEJ/konkawność korzenia/KG/GT) / Podparcie (Furkacja/Ruchomość/Klasa Millera) / Okołowszczepowe (mPI/mBI), każdy wiersz z własnym opisem; plus tryb nazw indeksów przetłumaczonych vs. kanonicznych (`perioIndexNameMode`: `translated` domyślnie / `canonical` — stała naukowa nazwa angielska/łacińska pokazywana w każdym języku interfejsu). Wyłącznie preferencje na poziomie aplikacji (odzwierciedla `perioViewMode`) — nigdy nie są serializowane, etykietki pozostają zlokalizowane w obu trybach

### 🖼️ System szablonów SVG

**Szablony zębów** (w `src/assets/teeth-svgs/`):
| Szablon | Zęby używające go |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (siekacze) |
| `13.svg` | 13, 23, 33, 43 (kły) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (zęby przedtrzonowe) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (trzonowce) |

Szablony są obracane o 180 stopni dla żuchwy i odbijane poziomo dla lewej strony.

**Ikony SVG** (w `src/assets/icon-svgs/`):
`icon_8.svg` (mądrość), `icon_gum.svg` (kość), `icon_no_selection.svg` (wyczyść), `icon_occl.svg` (widok okluzyjny), `icon_pulp.svg` (miazga)

### 🔢 Systemy numeracji

**FDI (ISO 3950):** Zęby dorosłych 11-18, 21-28, 31-38, 41-48. Zęby mleczne 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Zęby dorosłych numerowane 1-32. Zęby mleczne oznaczone literami A-T.

**Palmer (Zsigmondy-Palmer):** Format kwadrant + pozycja (np. UR-1, LL-5). Zęby mleczne używają liter A-E na kwadrant.

### 🚀 Użycie
Programowanie:
```bash
npm install
npm run dev
```
Kompilacja:
```bash
npm run build
```
Podgląd:
```bash
npm run preview
```

### 🔗 Integracja
Komponent może być osadzony w dowolnej aplikacji React.
Przykład:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="pl"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integracja trybu ciemnego:**
- **Tryb samodzielny:** Pomiń właściwość `darkMode` — komponent zarządza własnym stanem motywu za pomocą przycisku przełączania na pasku górnym i dodaje/usuwa klasę `.dark` na `<html>`.
- **Tryb kontrolowany:** Przekaż `darkMode` i `onDarkModeChange` — aplikacja nadrzędna kontroluje motyw. Przycisk przełączania nadal jest widoczny, ale wywołuje `onDarkModeChange` zamiast zarządzać stanem wewnętrznym. Aplikacja nadrzędna jest odpowiedzialna za dodawanie/usuwanie klasy `.dark` na `<html>`.

**Niestandardowy motyw:**
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

**Integracja wtyczki:**
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

### 🧪 Testowanie
```bash
npm run test           # Uruchom pełny zestaw testów Vitest
npm run test:watch     # Tryb obserwowania
npm run test:coverage  # Raport pokrycia
```

### 📖 Dokumentacja API

🅰️ **Wersja Angular:** dostępny jest oficjalny port dla Angulara, [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` w npm) — eksporty JSON i FHIR R4 są wymienne między obiema bibliotekami.

```bash
npm run docs           # Generuj dokumentację TypeDoc w docs/
```

### 📡 Publiczne API

**Właściwości komponentu:**

| Właściwość | Typ | Domyślna | Opis |
|---|---|---|---|
| `language` | `string` | `'hu'` | Język interfejsu (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Wywołanie zwrotne przy zmianie języka |
| `numberingSystem` | `string` | `'FDI'` | System numeracji (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Wywołanie zwrotne przy zmianie numeracji |
| `darkMode` | `boolean` | `undefined` | Stan trybu ciemnego. Pomiń dla trybu samodzielnego. |
| `onDarkModeChange` | `(dark) => void` | — | Wywołanie zwrotne przy przełączeniu trybu ciemnego. Wymagane dla trybu kontrolowanego. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Niestandardowe zastąpienia kolorów za pomocą właściwości niestandardowych CSS (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Niestandardowe wtyczki SVG do nakładek wizualnych i niestandardowego stanu na ząb. |
| `readOnly` | `boolean` | `undefined` | Wyłączenie wszystkich interakcji (klik, dotyk, klawiatura). Przydatne do drukowania/raportowania. |
| `enableNotes` | `boolean` | `undefined` | Włącz notatki do zębów. Dwuklik na ząb, aby dodać/edytować notatki. |

**Eksportowane funkcje do kontroli zewnętrznej:**

| Funkcja | Opis |
|---|---|
| `initOdontogram()` | Zainicjuj silnik i wyrenderuj wszystkie zęby |
| `destroyOdontogram()` | Wyczyść silnik i usuń nasłuchiwacze zdarzeń |
| `setNumberingSystem(system)` | Przełącz między FDI, Universal, Palmer |
| `clearSelection()` | Odznacz wszystkie zęby |
| `setOcclusalVisible(on)` | Włącz/wyłącz widok okluzyjny |
| `setWisdomVisible(on)` | Pokaż/ukryj zęby mądrości |
| `setShowBase(on)` | Pokaż/ukryj warstwę kości |
| `setHealthyPulpVisible(on)` | Pokaż/ukryj zdrową miazgę |
| `registerPlugins(plugins)` | Zarejestruj niestandardowe wtyczki SVG |
| `setPluginState(toothNo, pluginId, value)` | Ustaw niestandardowy stan wtyczki dla zęba |
| `getPluginState(toothNo, pluginId)` | Pobierz niestandardowy stan wtyczki dla zęba |
| `getToothStateSummary(toothNo)` | Pobierz zlokalizowane podsumowanie wszystkich aktywnych stanów |
| `getOdontogramSummary()` | Pobierz ustrukturyzowane, zlokalizowane tekstowe podsumowanie całego wykresu (liczby, sekcje) |
| `onStateChange(callback)` | Subskrybuj zmiany stanu; zwraca funkcję anulowania subskrypcji |
| `setReadOnly(value)` | Włącz/wyłącz tryb tylko do odczytu |
| `getReadOnly()` | Pobierz bieżący stan tylko do odczytu |
| `setNotesEnabled(value)` | Włącz/wyłącz notatki do zębów |
| `getNotesEnabled()` | Pobierz bieżący stan włączenia notatek |
| `setPulpDetailLevel(level)` | Ustaw słownictwo selektora miazgi — `"simple"`, `"aae"` lub `"latin"` |
| `getPulpDetailLevel()` | Pobierz bieżący poziom szczegółowości miazgi |
| `getChartMode()` | Pobierz aktualnie aktywny wykres — `"status"` lub `"plan"` |
| `setChartMode(mode)` | Przełącz aktywny wykres na `"status"` lub `"plan"`; wykres planu jest głęboko kopiowany ze statusu przy pierwszym wejściu |
| `getStatusChart()` | Pobierz ładunek wykresu statusu (`{version, globals, teeth}`), niezależnie od tego, który wykres jest aktualnie aktywny |
| `getPlanChart()` | Pobierz ładunek wykresu planu (`{version, globals, teeth}`), niezależnie od tego, który wykres jest aktualnie aktywny |
| `setPlanChart(payload)` | Zastąp zęby wykresu planu na podstawie ładunku (status pozostaje nietknięty); oznacza wykres planu jako zainicjowany |
| `getPlanChanges()` | Pobierz ustrukturyzowaną różnicę status→plan (`{ toothNo, axis, from, to }[]`) — jeden wpis na ząb i na oś leczenia różniącą się między wykresem statusu a planu; pusta tablica, gdy plan nie istnieje. Dostępne również w `getOdontogramSummary()` jako `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Ustaw dane periodontalne dla jednego z sześciu miejsc (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` równe null/`<1` usuwa dokumentację miejsca. Waliduje i ogranicza (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Pobierz rekord periodontalny zęba na miejsce (tylko udokumentowane miejsca) |
| `getToothCal(toothNo)` | Pobierz pochodny CAL na miejsce (`pd + brzeg dziąsłowy`) dla zęba |
| `getPerioSummary()` | Zbiorcze dane periodontalne całej jamy ustnej: liczba udokumentowanych miejsc, liczba krwawień, %BOP, najgorszy CAL, maksymalne PD |
| `getPerioChart()` | Pobierz rekordy periodontalne na ząb aktywnego wykresu |
| `PerioChart` | Komponent React (eksport nazwany) — nakładka odontogramu periodontalnego całej jamy ustnej (`{ open, onClose }`), montowalna niezależnie od `OdontogramShell` do integracji z aplikacją hostującą |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Programowo otwórz/zamknij/sprawdź nakładkę odontogramu periodontalnego — pozwala aplikacji hostującej wywołać wykres periodontalny osobno od podstawowego odontogramu (współdzielony stan przypadku) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Pobierz/ustaw sposób prezentacji wykresu periodontalnego — `"toggle"` (przełącznik widoku `Odontogram \| Dental Chart`, domyślny) lub `"popup"` (nakładka) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Pobierz/ustaw nakładkę podświetlenia Dental Chart — `"none"` (domyślnie) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; przemalowuje zęby wg tej miary (tylko wyświetlanie na podstawie istniejących danych) |
| `getToothRecessionType(toothNo)` | Pobierz pochodny **typ recesji wg Cairo** — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (obliczany z CAL międzyzębowego vs. policzkowego zęba) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Widoczność CEJ na ząb — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Konkawność powierzchni korzenia na ząb — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Ocena wskaźnika płytki Silness-Löe na powierzchnię — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Ocena wskaźnika dziąsłowego Löe-Silness na powierzchnię — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Szerokość dziąsła zrogowaciałego policzkowego na ząb w mm — `0`-`15`, lub `null`, jeśli nie udokumentowano |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Fenotyp grubości dziąsła na ząb — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Klasa recesji wg Millera na ząb — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Tylko implanty — ocena zmodyfikowanego wskaźnika płytki Mombelli (mPI) na powierzchnię — `0`-`3`; brak działania na zębie nieimplantowym |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Tylko implanty — ocena zmodyfikowanego wskaźnika krwawienia z bruzdy Mombelli (mBI) na powierzchnię — `0`-`3`; brak działania na zębie nieimplantowym |
| `furcationEntrances(toothNo)` | Wejścia furkacji dla zęba — `["mesial","distal","buccal"]` (górne trzonowce), `["buccal","lingual"]` (dolne trzonowce), `["mesial","distal"]` (górne pierwsze przedtrzonowce), w innym wypadku `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Ustaw/pobierz zajęcie furkacji na wejście (Glickman `1`–`4`; `null` czyści) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Ustaw/pobierz obecność płytki wg O'Leary'ego na powierzchnię (mezjalna/dystalna/policzkowa/językowa); zasila wskaźnik PI% całej jamy ustnej w `getPerioSummary()` |
| `getCaseMeta()` | Pobierz obiekt metadanych na poziomie przypadku (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — jeden współdzielony blok, nie na ząb/dual-state (odzwierciedla klucz najwyższego poziomu `globals`); zasila klasyfikację stopnia/klasy periodontalnej oraz nagłówek raportu PDF |
| `setPatientName(v)` | Ustaw imię i nazwisko pacjenta w przypadku (przycięte; pusty ciąg lub `null` czyści) — wyłącznie tożsamość, nigdy nie wpływa na wyprowadzenie periodontalne |
| `setPatientDob(v)` | Ustaw datę urodzenia pacjenta w przypadku (`YYYY-MM-DD`; nieprawidłowa/pusta czyści) — wyłącznie tożsamość na potrzeby raportu PDF |
| `setExamDate(v)` | Ustaw datę badania przypadku (`YYYY-MM-DD`; nieprawidłowa/pusta czyści) |
| `setCaseAge(v)` | Ustaw wiek pacjenta w przypadku, w latach — `0`-`120`, lub `null`, aby wyczyścić |
| `setSmokingStatus(v)` | Ustaw status palenia przypadku — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Ustaw liczbę papierosów dziennie (istotne tylko przy statusie palenia `"current"`) — `0`-`99`, lub `null`, aby wyczyścić |
| `setDiabetesStatus(v)` | Ustaw status cukrzycy przypadku — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Ustaw HbA1c % (istotne tylko przy statusie cukrzycy `"present"`) — `3.0`-`20.0` (jedno miejsce po przecinku), lub `null`, aby wyczyścić |
| `setToothLossPerio(v)` | Ustaw liczbę zębów utraconych z powodu periodontitis — `0`-`32`, lub `null`, aby wyczyścić |
| `setMaxRblPercent(v)` | Ustaw maksymalny procent radiologicznego zaniku kości — `0`-`100`, lub `null`, aby wyczyścić |
| `resetCaseMeta()` | Zresetuj obiekt metadanych na poziomie przypadku do jego pustych wartości domyślnych |
| `getPerioClassification()` | Pobierz klasyfikację periodontalną World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnoza/stopień/klasa/zasięg wyprowadzone z udokumentowanych danych periodontalnych i metadanych przypadku, każda oś zastąpiona przeceną klinicysty, gdy jest ustawiona (`derived` zawsze udostępnia nienaruszone wartości obliczone, `overridden` oznacza, które osie zostały nadpisane) |
| `setDiagnosisOverride(v)` | Nadpisz wyprowadzoną diagnozę periodontalną — `"health"` / `"gingivitis"` / `"periodontitis"`, lub `null`, aby wyczyścić (powrót do wyprowadzonej) |
| `setStageOverride(v)` | Nadpisz wyprowadzony stopień periodontalny — `"I"` / `"II"` / `"III"` / `"IV"`, lub `null`, aby wyczyścić (powrót do wyprowadzonego) |
| `setGradeOverride(v)` | Nadpisz wyprowadzoną klasę periodontalną — `"A"` / `"B"` / `"C"`, lub `null`, aby wyczyścić (powrót do wyprowadzonej) |
| `setExtentOverride(v)` | Nadpisz wyprowadzony zasięg periodontalny — `"localized"` / `"generalized"` / `"molar-incisor"`, lub `null`, aby wyczyścić (powrót do wyprowadzonego) |
| `exportFhir(options?)` | Eksportuj wykres jako kolekcję HL7 FHIR R4 Bundle (pobieranie JSON). Opcjonalne odwołanie `{ subject }`; w przeciwnym razie osadzany jest zastępczy pacjent |
| `exportImage(format)` | Pobierz wykres jako obraz — `"png"` lub `"jpg"` |
| `exportSvg()` | Pobierz wykres jako skalowalny SVG (wektorowy) |
| `hasAnyPerioData()` | `true`, jeśli jakakolwiek oś periodontalna jest udokumentowana gdziekolwiek w jamie ustnej — steruje automatycznym pominięciem eksportu periodontalnego i wyłącza pozycje menu eksportu periodontalnego na pustym wykresie |
| `exportPerioSvg()` | Pobierz pełny odontogram periodontalny (grafika zębów + wiersze liczbowe + klasyfikacja z 2017 r.) jako jeden samodzielny wektorowy SVG, budowany bez interfejsu ze stanu za pomocą `buildPerioSvg()` |
| `exportPerioImage(format)` | Pobierz odontogram periodontalny jako zrastrowany obraz — `"png"` lub `"jpg"` |
| `exportPdf(opts)` | Pobierz raport PDF natywny dla jsPDF (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, każda sekcja opcjonalna) — tekst wektorowy plus rastrowe obrazy zęba/wykresu periodontalnego; sekcja notatek indywidualnych jest automatycznie pomijana, gdy żaden ząb nie ma notatki, a obie sekcje periodontalne są automatycznie pomijane, gdy `hasAnyPerioData()` zwraca false, niezależnie od `opts` |
| `importFhirBundle(input)` | Zaimportuj pakiet FHIR R4 Bundle (obiekt lub ciąg JSON) wygenerowany przez ten moduł |
| `setImportFormat(format)` | Ustaw parser dla następnego importu pliku — `"status"` lub `"fhir"` |
| `startIntroTour()` | Uruchom 18-krokowy interaktywny samouczek wprowadzający |

### 💾 Trwałość stanu (localStorage)

Opcjonalna trwałość stanu przypadku odontogramu w `localStorage` (`src/persistence.ts`, reeksportowane z punktu wejścia pakietu). Domyślnie wyłączona — istniejące integracje nie są dotknięte, dopóki aplikacja hosta jej wyraźnie nie włączy, i powinna być wywołana **po** zamontowaniu odontogramu (przywrócenie odmalowuje aktywny DOM przez `importStatus()`):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // domyślnie: "react-advanced-odontogram"
  includePlan: true,          // zapisuj też wykres planu; domyślnie: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Funkcja | Opis |
|---|---|
| `enablePersistence(options?)` | Przywraca wcześniej zapisany przypadek (jeśli istnieje) przez `importStatus()`, a następnie zapisuje wykres statusu do `localStorage` przy każdej zmianie stanu. Idempotentna — ponowne wywołanie zastępuje poprzednią subskrypcję/opcje. **Musi być wywołana po zamontowaniu odontogramu.** |
| `disablePersistence()` | Zatrzymuje zapisywanie; zapisany wpis pozostaje na miejscu. |
| `clearPersistedState()` | Usuwa zapisany wpis dla aktywnego (lub domyślnego) klucza. |
| `isPersistenceEnabled()` | `true`, gdy subskrypcja zmian stanu jest aktywna. |

**`PersistenceOptions`:**

| Pole | Typ | Domyślnie | Opis |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | Klucz `localStorage`. |
| `includePlan` | `boolean` | `false` | Zapisuj też wykres planu (pole `plan` ładunku). |
| `onError` | `(err: Error) => void` | — | Wywoływana przy każdym błędzie zapisu/parsowania zamiast `console.warn`. |

Uwagi: nic nie jest odczytywane ani zapisywane w `localStorage`, dopóki nie zostanie wywołana `enablePersistence()`; zabezpieczenie rozmiaru 4 MB pomija zbyt duży zapis (zgłaszany przez `onError`/`console.warn`) zamiast rzucać wyjątek; każdy błąd zapisu/JSON — przekroczenie limitu, zablokowany iframe, uszkodzone lub nierozpoznane zapisane dane itd. — jest przechwytywany i zgłaszany. Ten moduł nigdy nie rzuca wyjątku.

Uwaga: włączenie trwałości przywraca zapisany przypadek za pomocą `importStatus()`, co zastępuje bieżący przypadek — łącznie z trwającym wykresem planu, jeśli zapisany ładunek go nie zawiera. Włączaj trwałość przy starcie (zaraz po zamontowaniu), a nie w trakcie sesji.

Uwaga: zapisany ładunek może zawierać dane identyfikujące pacjenta (imię i nazwisko pacjenta, data badania) w postaci jawnego tekstu w `localStorage`. Jeśli rejestrujesz takie dane, zapewnij ochronę na poziomie urządzenia lub usuń je za pomocą `clearPersistedState()`, gdy jest to właściwe.

### 💾 Format eksportu/importu statusu
Eksport tworzy plik JSON (wersja `2.22`; import akceptuje też starsze wersje `1.4` oraz `2.0` do `2.21` i migruje je automatycznie) zawierający:

**Pola globalne:**
- `wisdomVisible` - widoczność zębów mądrości
- `showBase` - widoczność warstwy kości
- `occlusalVisible` - aktywny widok okluzyjny
- `showHealthyPulp` - widoczność zdrowej miazgi
- `edentulous` - aktywny tryb bezzębności

**Pola na ząb (32 zęby):**
- `toothSelection` - podstawowy typ zęba
- `toothSubstrate` - podłoże zęba (naturalne/radix/złamane/crownprep), niezależne od jakiejkolwiek odbudowy
- `restorationType` - typ odbudowy (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiał odbudowy (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), powiązany z `restorationType`
- `prosthesis` - oś ruchoma/łącznikowa (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), wykluczająca się wzajemnie ze stałym `restorationType` korona/most
- `crownLeakage` - flaga nieszczelności brzeżnej korony, istotna tylko gdy `restorationType` to korona lub most
- `endo` - stan endodontyczny; wyklucza się wzajemnie z `pulpDx` (prezentowane razem za pomocą jednego połączonego selektora „Stan miazgi / endodontyczny” — leczenie zęba normalizuje `pulpDx` do `normal`)
- `mods` - tablica modyfikacji (zapalenie, przyzębie); `inflammation` zostało wycofane z interfejsu przy zębach obecnych (tam symbol determinuje `apicalDx`), ale nadal dotyczy zębów brakujących/w zębodole poekstrakcyjnym
- `caries` - aktywne powierzchnie z próchnicą
- `cariesActiveDepth` - wartość głębokości ICDAS przygotowywana przez selektor głębokości próchnicy przy zastosowaniu nowej powierzchni (nie jest wartością przechowywaną na powierzchnię; zob. `cariesSeverity` dla przechowywanego pola na powierzchnię)
- `rootCaries` - stopień zaawansowania próchnicy korzenia (none/active/arrested/active-cavitated)
- `cariesSeverity` - ujednolicona ciężkość na powierzchnię (0-6): głębokość ICDAS na powierzchni pierwotnej (bez wypełnienia), wynik CARS na powierzchni wtórnej (z wypełnieniem)
- `radiographicDepth` - radiologiczna głębokość próchnicy na powierzchnię (none/E1/E2/D1/D2/D3), niezależna od wizualnej skali ICDAS/CARS
- `fillingMaterial` - materiał wypełnienia
- `fillingSurfaces` - powierzchnie wypełnione
- `fillingSurfaceMaterials` - materiał wypełnienia na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- `fillingDefect` - wada wypełnienia na powierzchnię (none/marginal/fracture/wear), uwarunkowana wypełnioną powierzchnią, niezależna od próchnicy wtórnej
- `pulpDx` - diagnoza miazgi wg AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); odwracalne zapalenie miazgi renderuje zredukowany symbol
- `pulpLatin` - praktyczny łaciński podtyp miazgi (pokazywany przez selektor miazgi tylko gdy `pulpDetailLevel` ma wartość `latin`)
- `apicalDx` - diagnoza okołowierzchołkowa determinująca symbol okołowierzchołkowy
- `periapicalType` - podtyp zmiany okołowierzchołkowej (none/granuloma/cyst), pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej; dawna wartość `abscess` nadal akceptowana przy imporcie
- `resorptionType` - typ resorpcji korzenia (none/internal/external-cervical)
- `periImplant` - stan okołowszczepowy tylko dla implantów (none/mucositis/peri-implantitis-mild/-moderate/-severe), klasyfikacja World Workshop 2018
- `dxOverrides` - zastąpienia kodowania diagnozy na poziomie zęba (wersja 2.21): obiekt indeksowany kluczem diagnozy ICD-10 → `add` | `suppress`, wymuszający zakodowaną diagnozę mimo braku odpowiadającego wyniku na wykresie lub jej wyłączenie mimo jego obecności; kształtuje efektywny zestaw zakodowanych diagnoz eksportowany jako FHIR `Condition`
- `endoResection` - flaga apikoektomii
- `fissureSealing` - flaga lakowania bruzd
- `calculus` - flaga kamienia nazębnego
- `contactMesial` - utrata punktu stycznego mezjalnego
- `contactDistal` - utrata punktu stycznego dystalnego
- `wearEdge` - typ starcia siecznego/okluzyjnego (none/attrition/erosion)
- `wearCervical` - typ starcia szyjkowego (none/abrasion/abfraction/erosion)
- `discoloration` - przyczyna przebarwienia na ząb (none/tetracycline/fluorosis/nonvital/extrinsic/other), zabarwia wypełnienie naturalnej korony przy naturalnym zębie stałym/mlecznym bez odbudowy
- `orthoAppliance` - aparat ortodontyczny (none/bracket/band)
- `orthoDrift` - przemieszczenie ortodontyczne (none/mesial/distal)
- `orthoVertical` - pionowy ruch ortodontyczny (none/extrusion/intrusion)
- `orthoRotation` - flaga rotacji ortodontycznej
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - lokalizacje złamań
- `extractionWound` - rana po ekstrakcji
- `extractionPlan` - planowana ekstrakcja
- `parapulpalPin` - flaga wkładu parapulpalnego
- `bridgePillar` - ząb jako filar mostu
- `mobility` - stopień ruchomości (none/m1/m2/m3)
- `crownNeeded` - wskaźnik wymaganej korony
- `crownReplace` - wskaźnik konieczności wymiany korony
- `missingClosed` - luka zamknięta po ekstrakcji
- `customStates` - niestandardowe stany wtyczek (obiekt, indeksowany po identyfikatorze wtyczki)
- `note` - tekstowa notatka do zęba (ciąg znakowy, opcjonalny — obecny tylko gdy niepusty)

**Pole najwyższego poziomu `plan` (wersja 2.11+):**
- `plan` - opcjonalny obiekt o tym samym kształcie co `teeth` (pola na ząb powyżej), przechowujący wykres **planu** (zamierzonego leczenia). Obecny tylko wtedy, gdy wykres planu został zainicjowany (przełącznik `Status | Plan` został przynajmniej raz przełączony na Plan) ORAZ jego zawartość różni się od wykresu statusu — eksport zawierający wyłącznie status całkowicie go pomija i pozostaje identyczny co do bajtu z eksportem sprzed wersji 2.11, poza numerem wersji. Przy imporcie brak `plan` czyści/dezinicjalizuje wykres planu (nigdy nie przywraca nieaktualnego planu sprzed importu); obecność `plan` przywraca wykres planu obok statusu. Wykres planu można też odczytywać/zapisywać niezależnie od importu/eksportu za pomocą `getPlanChart()`/`setPlanChart()` (zob. Publiczne API powyżej), a `getStatusChart()` zawsze zwraca ładunek statusu, niezależnie od aktywnego trybu wykresu.

**Pole najwyższego poziomu `case` (wersja 2.17+, rozszerzone w 2.18, 2.19, 2.20 i 2.22):**
- `case` - opcjonalny obiekt przechowujący metadane na poziomie przypadku (nie na ząb), współdzielone zarówno przez wykres statusu, jak i planu (odzwierciedla klucz najwyższego poziomu `globals`). Pomijany, gdy pusty: całkowicie nieobecny, gdy każde pole ma wartość domyślną, dzięki czemu eksport bez przypadku pozostaje identyczny co do bajtu poza numerem wersji. Pola (każde pomijane, gdy ma wartość domyślną): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; cztery przeceny klinicysty na oś klasyfikacji z 2017 r. — `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; (wersja 2.19) `patientName` / `examDate`; oraz (wersja 2.20) `patientDob`; oraz (wersja 2.22) `caseConditions` — diagnozy na poziomie przypadku/regionu (wada zgryzu i zaburzenie stawu skroniowo-żuchwowego K07, torbiele jamy ustnej K09, choroby gruczołów ślinowych K11, zapalenie jamy ustnej i błony śluzowej K12/K13, rozwojowe anomalie łuku zębowego K00), z których każda jest przypisana do strony (nieokreślona / lewa / prawa / obustronna). Zasila klasyfikację stopnia/klasy periodontalnej oraz nagłówek raportu PDF; odczytywane/zapisywane za pomocą `getCaseMeta()` oraz metod `setCase*` (zob. Publiczne API powyżej). Imię i nazwisko pacjenta, data urodzenia oraz data badania to wyłącznie metadane tożsamości wykresu — **nie** są częścią eksportu FHIR.

### 🖨️ Eksport
`exportFhir()` tworzy Bundle czysty dla walidatorów HL7: każdy wpis nosi deterministyczny `id` i bezwzględny `fullUrl` (bez zastępczych `urn:uuid`), a Bundle osadza własny CodeSystem silnika, dzięki czemu jego lokalne kody dają się rozwiązać podczas walidacji (publikowany też jako `fhir/CodeSystem-odontogram.json` w repozytorium; można go pominąć przez `includeCodeSystem: false`).

Dane periodontologiczne teraz krążą tam i z powrotem także przez import FHIR, nie tylko przez ładunek JSON: `importFhirBundle()` odczytuje panele periodontalne LOINC `74029-0` z powrotem do rekordu periodontalnego każdego zęba — głębokość sondowania, brzeg dziąsłowy (odtworzony z CAL, dzięki czemu wartości pseudokieszonek przetrwają), BOP, furkację, płytkę wg O'Leary'ego, wskaźniki PI/GI oraz implantologiczne mPI/mBI, a także szerokość dziąsła zrogowaciałego — plus dowodowe Observation statusu palenia i HbA1c na poziomie przypadku. Ropienie jest jedynym wyjątkiem: pozostaje tylko w JSON, ponieważ nie jest częścią eksportu FHIR.

Poza własnym eksportem Status JSON / FHIR / PNG / JPG / SVG odontogramu, **wykres periodontalny** ma własną ścieżkę eksportu:
- **Perio SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderują pełny wykres periodontalny (grafika zębów + wiersze liczbowe + klasyfikacja z 2017 r.) jako jeden samodzielny wektorowy SVG (`buildPerioSvg()`), niezależnie od zamontowanego DOM `PerioChart`. Trzy pozycje menu eksportu są wyłączone, gdy `hasAnyPerioData()` zwraca false (pusty wykres nie ma nic periodontalnego do wyeksportowania).
- **Raport PDF:** pozycja menu eksportu „Raport PDF…” otwiera `ExportOptionsModal` — okno dialogowe ustawień (pola imienia pacjenta, daty urodzenia i daty badania, połączone bezpośrednio z metadanymi przypadku, przy czym data badania domyślnie ustawiana jest na dzisiejszą; pola wyboru sekcji: dane pacjenta, odontogram, opis odontogramu, notatki indywidualne — wyłączone, gdy żaden ząb nie ma notatki — status periodontalny, opis periodontalny) przed wywołaniem `exportPdf(opts)`. Puste pola tożsamości zastępowane są wartościami domyślnymi („John Doe” / „1980-01-01”), dzięki czemu eksport zawsze się powiedzie. PDF jest składany natywnie w jsPDF — tekst wektorowy za pomocą `.text()`, rastrowe obrazy zęba/wykresu periodontalnego za pomocą `.addImage()` — **bez zależności od svg2pdf.js**. Sekcja notatek indywidualnych jest automatycznie pomijana, gdy żaden ząb nie ma notatki, a obie sekcje periodontalne — gdy `hasAnyPerioData()` zwraca false, niezależnie od pól wyboru w oknie dialogowym.
- **Ograniczenie mPI/mBI do implantów:** wskaźniki Mombelli okołowszczepowe (mPI/mBI) są renderowane jako wiersze tylko w łuku zawierającym co najmniej jeden ząb z implantem — zarówno na żywym wykresie periodontalnym, jak i w eksportach SVG/PDF.
- Imię i nazwisko pacjenta, data urodzenia oraz data badania to wyłącznie metadane tożsamości wykresu (ładunek `2.20`, addytywny) — **nie** są częścią eksportu FHIR.

### 📁 Struktura folderów
- `src/App.tsx` - powłoka interfejsu, kontrolki paska górnego, przełącznik języka/numeracji/trybu ciemnego/motywu/wtyczki
- `src/odontogram.ts` - silnik warstwowania SVG, zarządzanie stanem zębów, interakcje dotykowe, nakładki wtyczek, okablowanie interfejsu
- `src/plugin.ts` - typ `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priorytety z-index `LAYER_Z`
- `src/theme.ts` - typ `OdontogramThemeConfig` i narzędzie `applyThemeConfig()`
- `src/status_extras.ts` - 34 predefiniowane szablony uzupełnień (mosty, protezy, konstrukcje belkowe)
- `src/i18n/` - tłumaczenia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) i hook i18n
- `src/utils/numbering.ts` - konwersja numeracji FDI, Universal, Palmer
- `src/registry/` - deklaratywny rejestr osi klinicznych: mapowania pól FHIR, aktywacja zestawu czyszczenia SVG/flag logicznych, macierz typ×materiał odbudowy, listy opcji interfejsu (jedno źródło prawdy generujące eksport/import, FHIR i interfejs selektorów)
- `src/fhir/` - eksport/import HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, systemy kodów, mapowania pól, prymitywy
- `src/bridgeOverlay.ts` - nakładka łącznika odcinka mostu wielozębowego (geometria siodła uwzględniająca łuk)
- `src/SettingsModal.tsx` - zakładkowe okno dialogowe Ustawień (Ogólne/Panele/Szczegóły zęba/Próchnica/Miazga/Notatki/Periodontologia)
- `src/perioExport.ts` - `buildPerioSvg()`: pełny wykres periodontalny jako jeden samodzielny wektorowy SVG
- `src/perioPdf.ts` - czysty składacz raportu jsPDF dla `exportPdf()` (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - okno dialogowe ustawień eksportu „Raport PDF…”
- `src/__tests__/` + `src/registry/__tests__/` - obszerny zautomatyzowany zestaw testów Vitest
- `src/assets/teeth-svgs/` - szablony SVG zębów (6 plików: siekacze, kły, zęby przedtrzonowe, trzonowce + widoki okluzyjne)
- `src/assets/icon-svgs/` - ikony SVG paska narzędzi (5 plików)

### ⚙️ Stos technologiczny
- React 18 + Vite + TypeScript
- Tailwind CSS do stylowania interfejsu
- Warstwowanie SVG przez manipulację DOM (nie stan React dla wydajności)
- Lekki niestandardowy system i18n
- Vitest + Testing Library do testów automatycznych
- TypeDoc do dokumentacji API
- Alias ścieżki Vite: `@` mapowany na `./src`

### 📝 Uwagi
- Szablony SVG są ładowane z `src/assets/teeth-svgs` i `src/assets/icon-svgs`, więc statyczny hosting musi serwować folder publiczny.
- Silnik odontogramu używa własnego stanu wewnętrznego (nie stanu React) dla wydajności i prostoty.
- Zęby mleczne mają ograniczony zestaw dostępnych materiałów (bez wypełnień amalgamatowych, bez endodoncji opartej na wkładach).
- Zęby z implantami mają inny zestaw opcji korony/filara niż zęby naturalne.

### 🔒 Uwagi dotyczące bezpieczeństwa

- **Wtyczki działają jako zaufany kod.** Zwracana wartość `renderSvg()` wtyczki jest wstrzykiwana do SVG aktywnego wykresu. To wyjście jest oczyszczane przez [DOMPurify](https://github.com/cure53/DOMPurify) (profil SVG, plus `svgFilters`) przed wstawieniem — `<script>`, `<iframe>`, `<object>`, `<embed>` i `<foreignObject>` są całkowicie zabronione, a w pełni złośliwe dane wyjściowe są odrzucane zamiast częściowo renderowane. Zmniejsza to zasięg skutków skompromitowanej lub błędnej wtyczki, ale wtyczki nadal powinny być ładowane wyłącznie z zaufanych źródeł — sanityzacja to siatka bezpieczeństwa, a nie substytut weryfikacji.
- **Content-Security-Policy.** **Produkcyjny build** wersji demo wstawia poniższą politykę przez znacznik `<meta http-equiv="Content-Security-Policy">` (serwer deweloperski jest nieobjęty):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Aplikacje hosta osadzające `OdontogramShell` powinny ustawić własną politykę CSP odpowiednią dla swojego wdrożenia — komponent nie wstawia własnej polityki, gdy jest używany jako biblioteka.

### 📖 Jak cytować

Jeśli używasz tego modułu w swojej pracy, zacytuj go.

**Ta wersja (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Wszystkie wersje (DOI koncepcyjny):** https://doi.org/10.5281/zenodo.21156787

> Powyższy koncepcyjny DOI obejmujący wszystkie wersje zawsze prowadzi do najnowszego
> zarchiwizowanego wydania; DOI dla konkretnej wersji jest nadawany przy każdym wydaniu
> w momencie jego archiwizacji na Zenodo. Do czasu zarchiwizowania wersji v2.4.0 należy
> cytować ją za pomocą DOI koncepcyjnego.

Metadane cytowania w formacie maszynowym znajdują się w [`CITATION.cff`](../CITATION.cff).

## 🙌 Podziękowania

React Advanced Odontogram jest tworzony i utrzymywany przez Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), twórcę i głównego programistę całego silnika. Z cenną pomocą współtwórców wymienionych poniżej. Dziękujemy wszystkim, którzy wnieśli swój wkład.

**Współautorzy**

- [@odontodev](https://github.com/odontodev): hydratacja stanu i API cyklu życia, ustawienia wypełnień jako kontrolowane props, idempotentne settery i zwijane karty
- [@JulianoBazzi](https://github.com/JulianoBazzi): tłumaczenie na brazylijski portugalski
- [@yassine-bhn](https://github.com/yassine-bhn): tłumaczenie na francuski i proponowana zmierzona anatomia
- [@saegerdirk-star](https://github.com/saegerdirk-star): zmierzona anatomia zęba i generator zębów, a także propozycja komponowalnego interfejsu

**Zbudowano przy użyciu** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) i [Tailwind CSS](https://tailwindcss.com).

Wkład jest mile widziany. Otwórz pull request na GitHub, a zostaniesz tu wymieniony. Jeśli projekt jest dla Ciebie przydatny, [zostaw mu gwiazdkę na GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).
