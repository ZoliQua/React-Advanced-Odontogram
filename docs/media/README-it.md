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

## 📑 Indice

- [📋 Panoramica](#-panoramica)
- [📦 Utilizzo come pacchetto npm](#-utilizzo-come-pacchetto-npm)
- [✨ Funzionalità principali](#-funzionalità-principali)
- [📦 Moduli](#-moduli)
- [🛠️ Controlli dell'interfaccia](#-controlli-dellinterfaccia)
- [🦷 Tipi di dente e stati](#-tipi-di-dente-e-stati)
- [⚙️ Impostazioni](#-impostazioni)
- [🖼️ Sistema di template SVG](#-sistema-di-template-svg)
- [🔢 Sistemi di numerazione](#-sistemi-di-numerazione)
- [🚀 Utilizzo](#-utilizzo)
- [🔗 Integrazione](#-integrazione)
- [🧪 Test](#-test)
- [📖 Documentazione API](#-documentazione-api)
- [📡 API pubblica](#-api-pubblica)
- [💾 Persistenza dello stato (localStorage)](#-persistenza-dello-stato-localstorage)
- [💾 Formato di esportazione/importazione dello stato](#-formato-di-esportazioneimportazione-dello-stato)
- [🖨️ Esportazione](#-esportazione)
- [📁 Struttura delle cartelle](#-struttura-delle-cartelle)
- [⚙️ Stack tecnologico](#-stack-tecnologico)
- [📝 Note](#-note)
- [🔒 Note sulla sicurezza](#-note-sulla-sicurezza)
- [📖 Come citare](#-come-citare)

## 🇮🇹 Italiano

### 📋 Panoramica
Questo progetto è un editor di odontogramma interattivo basato su browser che supporta la registrazione rapida dello stato dentale con un'interfaccia pulita. Renderizza template SVG dentali a strati per rappresentare restauri, carie, stato endodontico, mobilità e altri dettagli clinici, offrendo selezione multipla, filtri di selezione e preset di stato predefiniti.

---
![Odontogramma – anteprima (italiano)](screenshot_it_odontogram.png)

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### 📦 Utilizzo come pacchetto npm

L'odontogramma è distribuito come libreria di componenti React autonoma su npm:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Requisiti
- **React 18 o 19** (dichiarato come peer dependency — fornito dalla tua app).
- Un **bundler** che comprenda il campo `exports` ed ESM: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. Il pacchetto è **solo ESM**.
- Node **≥ 18** per gli strumenti di build.

#### Installazione

```bash
npm install react-advanced-odontogram react react-dom
```

#### Utilizzo di base

Renderizza `OdontogramShell` e importa il foglio di stile **una sola volta** ovunque nella tua app:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="it"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Proprietà del componente

`OdontogramShell` è un componente controllato. Le proprietà più comuni:

| Proprietà | Tipo | Predefinito | Descrizione |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Lingua dell'interfaccia (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Sistema di numerazione dei denti. |
| `darkMode` | `boolean` | `false` | Attivazione del tema scuro. |
| `readOnly` | `boolean` | `false` | Disabilita tutte le modifiche (sola visualizzazione). |
| `themeConfig` | `OdontogramThemeConfig` | — | Sovrascrive le variabili CSS del tema (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registra plugin di stato personalizzati / livelli aggiuntivi. |
| `enableNotes` | `boolean` | `false` | Abilita le note per dente. |
| `enableIcdas` | `boolean` | `false` | Abilita il punteggio delle carie ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complessità dell'otturazione: `"simple"` (un materiale per dente) o `"complex"` (materiali per superficie). |
| `fillingDefectEnabled` | `boolean` | `true` | Abilita i riscontri di difetti dell'otturazione sulla scheda Otturazioni. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | tutti disponibili | Materiali di otturazione disponibili come mappa booleana su `amalgam`/`composite`/`gic`/`temporary` (le chiavi sconosciute vengono ignorate). |
| `fissureSealingEnabled` | `boolean` | `true` | Abilita la sigillatura dei solchi sulla scheda Otturazioni. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Si attivano quando l'utente modifica l'impostazione corrispondente da Impostazioni → Otturazioni. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Si attivano quando l'utente cambia l'impostazione dall'interfaccia. |

Sono accettate anche proprietà più granulari a livello di dettaglio (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — consulta i tipi `.d.ts` distribuiti per l'elenco completo e tipizzato.

Le quattro prop di otturazione sopra sono **solo di ripristino**: una prop omessa non scrive mai nel motore (una chiamata imperativa a `setFillingComplexity()` prima del montaggio viene preservata e la modalità autonoma è invariata), mentre una prop fornita scrive insieme il motore e lo stato del modal Impostazioni, così il modal non mostra mai un valore obsoleto. `fillingMaterialAvailability` viene applicata per diff tramite una chiave serializzata canonica — un re-render con un letterale inline di contenuto identico non riscrive mai il motore. I callback `on*Change` scattano da Impostazioni → Otturazioni: il percorso di riscrittura per gli host che persistono le preferenze.

#### API pubblica (export con nome)

`OdontogramShell` è sia l'export predefinito sia un export con nome. L'API di stato imperativa, il componente autonomo `PerioChart`, il tour guidato e tutti i tipi pubblici sono export con nome dallo stesso punto di ingresso:

```ts
import {
  OdontogramShell,           // anche export predefinito
  PerioChart,                // componente grafico parodontale autonomo
  // lettura dello stato
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // sottoscrizione ai cambiamenti di stato
  // esportazione / importazione
  exportFhir,                // bundle HL7 FHIR R4
  exportSvg, exportImage,    // esportazione vettoriale / raster del grafico
  setImportFormat,
  // controllo
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // avvia il tour di onboarding
  // …e molte altre funzioni di impostazione setX/getX
} from "react-advanced-odontogram";
```

La superficie completa (≈ 44 funzioni + tipi come `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) è completamente tipizzata nelle dichiarazioni incluse.

#### Superfici componibili (avanzato)

`OdontogramShell` è il componente all-in-one supportato e non richiede alcuna configurazione aggiuntiva. Se hai bisogno di collocare le regioni dell'odontogramma in aree diverse del tuo layout, anche le quattro superfici dell'interfaccia della shell vengono esportate e possono essere composte sotto un unico `OdontogramProvider`, condividendo tutte un'unica sessione gestita dal pacchetto:

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

`OdontogramProvider` accetta le stesse props di `OdontogramShell`. È disponibile un hook `useOdontogramUi()` (e il tipo `OdontogramUiContextValue`) per costruire le tue superfici. Vincolo attuale: usa un solo provider per pagina. Le superfici possono essere montate e smontate su richiesta — si ricollegano automaticamente al rimontaggio. `OdontogramShell` stesso è invariato — è esattamente questa composizione nella disposizione predefinita.

Per una composizione ancora più fine, vengono esportate anche le singole schede di controllo — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` e `ToothDetailsCard` —, ciascuna un componente dichiarativo autonomo che legge e scrive la sessione condivisa tramite l'API del motore (viene esportato un hook `useEngineState()` per costruire le tue). Monta solo le schede di cui un determinato layout ha bisogno, in qualsiasi disposizione, sotto un unico `OdontogramProvider`.

#### Utilizzo con Next.js (App Router)

Il componente è solo client-side, quindi renderizzalo da un Client Component:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="it" numberingSystem="FDI" />;
}
```

Oppure caricalo con un import dinamico solo client-side: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Note importanti e limitazioni attuali
- **Solo ESM** — il pacchetto pubblica un singolo modulo ES (`dist/odontogram.js`) più una voce di dichiarazione dei tipi (`dist/index.d.ts`). È destinato alla risoluzione dei moduli tramite bundler; non esiste una build CommonJS.
- **Il foglio di stile è separato** — **devi** importare `react-advanced-odontogram/style.css` una sola volta; non viene iniettato automaticamente. Lo stile è CSS globale ambito sotto `.odontogram-root` e guidato dalle variabili CSS `--odon-*`.
- **SSR / solo client** — il componente legge il DOM al montaggio (`document`), quindi deve essere eseguito nel browser. Nei framework SSR, renderizzalo in un Client Component (`"use client"`) oppure tramite un import dinamico solo client-side.
- **Risorse autonome** — gli SVG dei denti e delle icone sono incorporati nel bundle JavaScript in fase di build; non c'è **nessuna richiesta di risorse a runtime** da configurare e nulla da copiare in più nella tua cartella pubblica.
- **Un'istanza per pagina** — lo stato del motore è attualmente un singleton a livello di modulo, quindi renderizzare due istanze di `<OdontogramShell>` sulla stessa pagina le farebbe condividere lo stato di un unico grafico. Il supporto multi-istanza è pianificato per una versione futura.

---

### ✨ Funzionalità principali
- 🖱️ Selezione rapida e selezione multipla (CMD/CTRL + clic)
- 🦷 Tipi di dente: permanente, deciduo (da latte), impianto, sottogengivale, mancante
- 🦷 Substrato dentale (ortogonale a qualsiasi restauro): naturale, radix (residuo radicolare), fratturato, preparato per corona
- 👑 Restauri per tipo × materiale: corona / inlay / onlay / faccetta / ponte in e.max, oro, gradia, zirconio, metallo, metalloceramica, telescopico o provvisorio (l'onlay è disponibile solo in vista occlusale) — scelti da un unico selettore combinato a basso numero di clic "Fix: Corona – …"; le corone `metal` esistenti migrano a `metal-ceramic` (PFM, metalloceramica); gli impianti utilizzano lo stesso modello tipo × materiale, composto con un livello connettore per impianto. Il selettore è delimitato in base al tipo di dente: un impianto offre solo corona/ponte (più le sue cinque opzioni di attacco, di seguito); un dente mancante/spazio offre solo un elemento intermedio di ponte (più protesi parziale/totale rimovibile); un substrato `radix` nasconde interamente il controllo del restauro (nessun restauro può essere assegnato a un residuo radicolare)
- 🦿 Protesi rimovibili/su attacco sull'asse dedicato `prosthesis` (voci "Kivehető:" nel selettore combinato): abutment di guarigione dell'impianto, locator, locator con overdenture, barra, barra con overdenture; protesi parziale o totale rimovibile supportata dai denti
- 🌉 I denti di ponte visualizzano sia la cappa della corona sia il connettore a sella; un overlay del tratto di ponte multi-dente disegna un unico connettore continuo, sensibile all'arcata, attraverso i denti di ponte consecutivi (elementi intermedi + pilastri) e gli spazi tra i denti (arcata superiore e inferiore usano una geometria a sella speculare, mantenendo il connettore allineato su entrambe le arcate), incluso nell'esportazione PNG/JPG/SVG; l'applicazione di un ponte tramite un preset di Stati ricalcola immediatamente l'overlay
- 🔍 Registrazione delle carie su 6 superfici: mesiale, distale, buccale, linguale, occlusale, sottocoronale
- 🪥 Materiali di otturazione per superficie: amalgama, composito, vetroionomero (GIC), provvisorio
- 🏥 Un unico selettore combinato "Stato polpa / endodonzia" (raggruppato: polpa vitale vs. trattata/endodonzia): gli stati endodontici (otturazione medicinale, otturazione canalare, otturazione canalare incompleta, perno in fibra di vetro, perno metallico) e la diagnosi pulpare AAE (`pulpDx`: normale / pulpite reversibile / irreversibile / necrosi) si escludono a vicenda — un dente trattato endodonticamente (`endo` impostato) non può avere anche una diagnosi di polpa vitale; al momento del trattamento, `pulpDx` viene normalizzato a `normal` e il glifo di polpa malata viene soppresso. La pulpite reversibile visualizza un glifo di polpa ridotto. Un'impostazione opzionale a 3 livelli di dettaglio pulpare (`pulpDetailLevel`: simple / AAE / latino pratico) mostra 9 sottotipi in latino pratico (pulpa sana … gangraena pulpae) tramite `pulpLatin`; la resezione e il perno parapulpale restano indicatori speciali separati
- 🦴 La diagnosi apicale (`apicalDx`: parodontite apicale sintomatica/asintomatica, ascesso apicale acuto/cronico, osteite condensante) determina direttamente il glifo periapicale; un qualificatore di sottotipo di lesione granuloma/cisti viene mostrato solo in presenza di parodontite apicale sintomatica/asintomatica (il sottotipo ridondante "ascesso" è stato rimosso — è già coperto dalla diagnosi apicale)
- 🩹 Scheda unificata "Radice e parodonto" (un'unica sezione a comparsa per i reperti radicolari/periapicali e parodontali)
- ⚕️ Modifiche: infiammazione periapicale (mostrata solo sui denti mancanti/con alveolo post-estrattivo; nascosta sui denti presenti, dove è solo `apicalDx` a determinare il glifo periapicale, e sugli impianti, dove se ne occupa `periImplant`), malattia parodontale, gradi di mobilità (M1/M2/M3, nascosti sugli impianti)
- 🦷🔩 Stato peri-implantare (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — stadiazione del World Workshop 2018, mostrata come selettore dedicato sugli impianti; la mucosite riutilizza il glifo gengivale parodontale, la perimplantite aggiunge un livello graduato `peri-implant-bone-loss` (opacità 0,4/0,7/1,0). Gli impianti non visualizzano più il glifo della lesione periapicale — la loro infiammazione viene invece espressa tramite questo asse — e le caselle di spunta dei modificatori parodontali sono nascoste sugli impianti (la rietichettatura ad hoc della casella "Perimplantite" è stata ritirata)
- 🏷️ Indicatori speciali: corona necessaria, sostituzione corona necessaria, spazio chiuso dopo estrazione, estrazione pianificata, sigillatura dei solchi, perdita del punto di contatto
- 👁️ Vista occlusale, denti del giudizio, attivazione/disattivazione visibilità di osso e polpa
- 🔢 12 filtri di selezione (tutti, presenti, permanenti, decidui, impianti, mancanti, superiori/inferiori, frontali/molari)
- 📊 Preset di stato predefiniti (ripristino, dentizione primaria, dentizione mista, edentulo)
- 📦 34 template di restauro predefiniti (ponti, protesi rimovibili, protesi su barra con impianti)
- 💾 Esportazione/importazione dello stato in JSON (versione 2.22; le importazioni continuano ad accettare le versioni legacy 1.4 e da 2.0 a 2.21 e vengono migrate automaticamente, con stati personalizzati dei plugin e note per dente)
- 💽 Persistenza opzionale su localStorage (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — disattivata per impostazione predefinita; salva automaticamente l'odontogramma di stato (e, opzionalmente, il piano) a ogni cambiamento di stato e lo ripristina al successivo montaggio del componente, con un limite di sicurezza di 4 MB e gli errori di archiviazione/parsing instradati a un callback `onError` (o a `console.warn`) invece di generare un'eccezione
- 🔗 Esportazione HL7 FHIR R4 (Bundle di raccolta di Observation per dente, codifica dentale ISO 3950 per la dentizione permanente **e** per i denti decidui (51-85, con corrispondenza senza perdita di dati in importazione), sistema di codici locale, più un overlay SNOMED CT opzionale (Impostazioni → SNOMED CT)); un componente di carie con una gravità registrata riporta anche una codifica del sistema di punteggio — ICDAS su una superficie primaria (non otturata), CARS su una ricorrente (otturata)
- ✚ Interfaccia di selezione superfici a croce (B/M/O/D/L) per carie e otturazioni
- 🧱 Materiali di restauro per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- 🖼️ Esportazione immagine PNG/JPG/SVG dell'odontogramma (scaricabile; PNG/JPG rasterizzato da SVG vettoriale)
- 🦷 Carie/carie secondaria è una macchina a stati per superficie: una superficie cariata senza otturazione viene visualizzata come carie primaria (opacità a livelli ICDAS); non appena quella superficie ha un'otturazione, viene visualizzata invece come carie secondaria (ricorrente) (livello `subcaries-{surface}`, punteggio CARS) — le due non sono mai attive contemporaneamente sulla stessa superficie
- 🎯 Gravità unificata per superficie (`cariesSeverity`, 0–6, sostituisce i precedenti campi separati di profondità ICDAS e CARS): letta come profondità ICDAS su una superficie primaria, come punteggio CARS con nome (Sano … Cavità estesa) su una ricorrente, tramite un popup contestuale che mostra solo la scala pertinente allo stato attuale della superficie
- 🌱 Carie radicolare (`rootCaries`: none / active / arrested / active-cavitated), che attiva il livello grafico dedicato alla carie radicolare con un'opacità determinata dalla gravità (active 0,5 / arrested 0,7 / active-cavitated opacità piena)
- 📡 Profondità radiografica della carie (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 per superficie), indipendente dalla scala di gravità visiva ICDAS/CARS, mostrata come badge e sincronizzata tramite una propria Observation FHIR
- 🎚️ Tre impostazioni di granularità della carie (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) più un interruttore `cariesDepthEnabled`, che riducono ciascuna scala a una selezione più semplice senza perdere il valore memorizzato
- 🩹 Riga di riepilogo delle carie secondarie nel pannello otturazioni: elenca, sotto i controlli delle otturazioni, ogni dente selezionato con carie secondaria e le relative superfici (es. "36 (O) ha carie secondaria sulla sua otturazione.")
- 🪛 Difetti di otturazione per superficie (`fillingDefect`: none / marginal / fracture / wear) sui restauri diretti, indipendenti dalla carie secondaria — inseriti tramite un indicatore per superficie sulla scheda Otturazioni (speculare all'indicatore di profondità carie, con il suo elenco di opzioni disposto verticalmente), visualizzati sull'odontogramma e mostrati nel tooltip e nel riepilogo otturazioni dell'intera bocca con un'etichetta esplicita (es. "36 (O) – Difetto di otturazione: O: marginal"), allo stesso modo in cui la carie secondaria viene etichettata sulla riga Carie; la scheda Otturazioni mostra anche una nota di suggerimento per ogni dente selezionato con un difetto di otturazione registrato (es. "36 ha un difetto di otturazione registrato."), analogamente alla nota di suggerimento esistente per la carie secondaria
- 🦷💥 Usura dentale tipizzata per causa clinica e localizzazione (`wearEdge`: none / attrition / erosion, incisale/occlusale; `wearCervical`: none / abrasion / abfraction / erosion, cervicale) — sostituisce i due flag on/off di usura da bruxismo; inserita tramite due menu a tendina sulla riga usura, riutilizza la grafica esistente e viene mostrata nel tooltip e in una nuova sezione di riepilogo "Usura" per l'intera bocca
- 🎨 Discromia dentale per causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) su denti permanenti e decidui — colora la corona naturale visualizzata con un colore rappresentativo quando il dente non ha restauro e ha substrato naturale; mostrata nel tooltip e in una nuova sezione di riepilogo "Discromia" per l'intera bocca; completa l'insieme delle condizioni di superficie e strutturali insieme ai difetti di otturazione e all'usura
- ✏️ I denti anteriori (incisivi/canini) etichettano la loro superficie occlusale come "incisale" in tutta l'interfaccia (selettore, popup, riepiloghi); la chiave di superficie memorizzata resta `occlusal`
- 🔤 Notazione delle superfici sensibile alla posizione (Impostazioni → Dettagli dentali → "Notazione superfici", simple/full, predefinito full): in modalità full la lettera e l'etichetta della superficie di carie/otturazione seguono l'anatomia del dente — occlusale → I/incisale sui denti anteriori, buccale → L/labiale sui denti anteriori, linguale → P/palatale sui denti superiori e L/linguale sui denti inferiori (mesiale/distale/sottocoronale non sono interessati); la modalità simple usa sempre l'insieme generico B/M/O/D/L/SC indipendentemente dalla posizione del dente. Si applica al riepilogo dell'intera bocca e a entrambi i selettori di superficie per carie e difetti di otturazione (lettera + didascalia); la chiave di superficie memorizzata non è interessata
- 🦷↕️ Registrazione ortodontica per dente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) su un dente naturale presente (permanente o deciduo) — riutilizza la grafica ortodontica dormiente della v2.5.0 (nessun nuovo SVG); mostrata sull'odontogramma, nel tooltip e in una nuova sezione di riepilogo "Ortodonzia" per l'intera bocca
- 🪨 Tartaro, e riassorbimento radicolare tipizzato come interno o cervicale esterno (`resorptionType`)
- 📏 Profondità della carie per superficie (superficiale / dentina / profonda), o punteggio ICDAS II opzionale (0–6) tramite `enableIcdas`
- 🩹 Interruttore di microinfiltrazione marginale della corona, visibile solo con restauro a corona o ponte
- 🧬 Codifica diagnostica basata su standard (WHO ICD-10, sempre attiva): ogni reperto registrato deriva una diagnosi codificata ICD-10 — carie (K02), carie radicolare/del cemento e carie arrestata (K02.2/.3), pulpite e necrosi pulpare (K04.0/.1), parodontite apicale, ascesso periapicale e cisti radicolare (K04.4–.9), attrito/abrasione/erosione/abfrazione (K03.0–.8), tartaro (K03.6), riassorbimento (K03.3), discromia (K00.3/K00.8/K03.7), perdita dentale (K08.1), radice residua (K08.3) e frattura dentale (S02.5) — mostrata nel tooltip e nel riepilogo dell'intera bocca, ed esportata come FHIR Conditions.
- 🩺 Scheda Diagnosi per dente: consulta le diagnosi ICD-10 derivate di un dente e curale — sopprimi una diagnosi derivata erroneamente o aggiungine una che l'odontogramma non rappresenta. L'insieme effettivo (derivate − soppresse + aggiunte) guida l'esportazione FHIR.
- 🗺️ Condizioni di caso / regionali: registra diagnosi dell'intera bocca non legate a un singolo dente — malocclusione e disturbi dell'ATM (K07), cisti della regione orale (K09), malattie delle ghiandole salivari (K11), stomatite e mucosa orale (K12/K13), e anomalie dello sviluppo a livello di arcata (K00) — ciascuna eventualmente lateralizzabile (sinistra / destra / bilaterale).
- 🌍 Pacchetti di codifica nazionali (Impostazioni → Codifica diagnosi): sovrappone un sistema di codici nazionale alla base WHO ICD-10 — BNO-10 (ungherese, etichette localizzate; mantiene il codice WHO) o US ICD-10-CM (codici rimappati, ad es. l'intervallo dentofacciale K07 → M26). Aggiungere il pacchetto di un altro paese è una piccola voce `CodingPack` — vedi `CODING_PACKS.md`.
- 🔬 Overlay SNOMED CT (Impostazioni → SNOMED CT, opzionale, disattivato per impostazione predefinita): aggiunge una codifica SNOMED CT accanto a quella WHO e a quella di un eventuale pacchetto nazionale, e codifica i reperti peri-implantari privi di un codice WHO ICD-10. Gli ID concetto ICD-10-CM e SNOMED sono di riferimento/best-effort — verificarli rispetto all'elenco tabellare ufficiale ICD-10-CM / al browser SNOMED CT prima dell'uso clinico.
- 🔁 Round-trip FHIR Condition: le diagnosi vengono esportate come risorse FHIR `Condition` (collegate al dente, più condizioni di caso a livello di paziente con un `bodySite` di lateralità) accanto alle Observation, e l'importazione le ricostruisce — le condizioni di caso direttamente, e le sovrascritture di aggiunta/soppressione per dente confrontando le Condition importate con l'odontogramma ri-derivato.
- 🩺 **Scheda Diagnosi, rivista:** ogni riga di diagnosi per dente mostra prima il codice ICD-10 (`K04.0 Pulpitis`) e le righe sono ordinate per codice. Ogni riga ha un interruttore di **esclusione** (rimuove la diagnosi dall'esportazione FHIR ma la mantiene sull'odontogramma) e un pulsante di **eliminazione** (×) che rimuove la diagnosi *e* il reperto corrispondente sul dente. Aggiungere una diagnosi dal selettore scrive anche il reperto sottostante, così il simbolo appare subito.
- 🗂️ **Finestra diagnosi di caso/regionali:** le diagnosi a bocca intera e regionali (anomalie mascellari, cisti, condizioni salivari e della mucosa…) sono state spostate dalla barra laterale parodontale a una finestra di dialogo dedicata, apribile dal pulsante **Diagnosi** accanto al selettore Odontogramma / Stato parodontale; il suo selettore è ordinato per codice.
- 🇭🇺 **Pacchetto BNO-10:** i testi visualizzati in ungherese sono ora i titoli ufficiali NEAK BNO-10, e il pacchetto usa l'URI standard del sistema ICD-10 (BNO-X è identico all'ICD-10 dell'OMS).
- ✅ **Esportazione FHIR pulita per i validatori HL7:** ogni voce del Bundle porta un `id` deterministico e un `fullUrl` assoluto (nessun segnaposto `urn:uuid`), e il Bundle incorpora il **CodeSystem** proprio del motore in modo che i suoi codici locali siano risolvibili durante la validazione; lo stesso CodeSystem è pubblicato nel repository come `fhir/CodeSystem-odontogram.json` (passa `includeCodeSystem: false` nelle opzioni di esportazione FHIR per ometterlo).
- 🎯 **Codici ICD che seguono il grafico (specificità guidata dai dati).** La profondità della carie deriva dalla profondità radiografica quando è registrata (E1/E2 → smalto, D1–D3 → dentina) e ricade sulla gravità ICDAS come fallback (1–3 → smalto, 4–6 → dentina), raffinando il `K02` dell'OMS in `K02.0` / `K02.1` e il `K02.9` ICD-10-CM in `K02.51/.52` (fossette e solchi) o `K02.61/.62` (superficie liscia) in base a superficie × profondità. La parodontite cronica ricava il proprio codice ICD-10-CM dallo stadio e dall'estensione 2017 (`K05.311`–`K05.329`). Una Condition per dente, con il coinvolgimento più profondo.
- 🔄 **I dati parodontali fanno ora andata e ritorno tramite FHIR.** L'importazione rilegge i pannelli parodontali LOINC 74029-0 in ogni dente — profondità di sondaggio, margine gengivale (ricostruito dal CAL, così i valori di pseudotasca sopravvivono), BOP, forcazione, placca O'Leary, gli indici PI/GI e mPI/mBI implantari, e la larghezza della gengiva cheratinizzata — oltre alle Observation di evidenza su stato di fumatore e HbA1c. Vengono riconosciute anche le Condition codificate solo in ICD-10-CM o SNOMED CT, così un bundle esterno importa ciò che può.
- 🧬 **SNOMED CT per l'intero catalogo diagnostico.** 48 delle 50 voci portano ora un concetto SNOMED CT International verificato (attivo, nel modulo core, con FSN corrispondente). Due restano deliberatamente non impostate perché SNOMED International non ha un concetto ombrello per esse: anomalia dimensionale mascellare (K07.0) e anomalie funzionali dentofacciali (K07.5). L'overlay SNOMED resta opzionale nelle Impostazioni.
- 📦 **Un pacchetto di terminologia FHIR caricabile.** La cartella `fhir/` del repository è un pacchetto NPM FHIR (`react-advanced-odontogram.fhir`, FHIR 4.0.1) che contiene il CodeSystem del motore più i ValueSet generati — uno per ogni gruppo di valori dell'asse clinico, uno per i tipi di reperto e un insieme con tutti i codici. Puntaci un validatore con `-ig ./fhir`.
- 🧰 Barra superiore di icone unificata con una finestra modale Impostazioni a schede (Generale / Pannelli / Dettagli dentali / Carie / Polpa / Note / Parodontale — numerazione, note, visibilità pannelli, ICDAS, interruttore profondità carie, granularità carie radicolare/radiografica, livello di dettaglio pulpare, livello di dettaglio usura/discromia dentale, informazioni dentali)
- 🗂️ Impostazioni → scheda "Pannelli": mostra/nasconde in modo indipendente i pannelli di riepilogo Stati e Ortodonzia per l'intera bocca
- 🦷🩺 Impostazioni → scheda "Parodontale": 16 interruttori mostra/nascondi per indice per le righe del grafico parodontale (raggruppati in tasca/igiene/mucogengivale/supporto/peri-implantare — PD/GM/CAL/BOP, placca, PI, GI, visibilità CEJ, concavità radicolare, KG, GT, forcazione, mobilità, classe di Miller, mPI, mBI), ciascuno con una descrizione, più un'opzione di visualizzazione del nome degli indici tradotta-vs-canonica (canonica = un nome scientifico fisso in inglese/latino in ogni lingua dell'interfaccia; i tooltip restano sempre localizzati indipendentemente da questa impostazione). Entrambe sono preferenze a livello di applicazione (come `perioViewMode`) — mai parte del payload di esportazione
- 🩹 Il controllo delle impostazioni di carie secondaria (CARS) è stato unito alla scheda Impostazioni Carie, posizionato sopra Profondità radiografica (la scheda separata "Carie secondaria" è stata ritirata)
- 🎚️ Livello di dettaglio dei dettagli dentali (Impostazioni → Dettagli dentali): un'impostazione simple/complex per l'usura dentale e per la discromia. La modalità simple mostra un interruttore sì/no per ciascun reperto (usura attiva → attrition/abrasion, discromia attiva → other); la modalità complex (predefinita) mantiene i menu a tendina di tipo/causa, e il valore memorizzato viene conservato passando da un livello all'altro
- 📋 Pannello informazioni dentali: riepilogo testuale in tempo reale dell'intero odontogramma (conteggio denti, elenchi presenti/mancanti, carie incl. secondaria, otturazioni, trattamenti canalari, protesi, impianti, stato parodontale) — visibile per impostazione predefinita, attivabile/disattivabile nelle Impostazioni
- 🗂️ Menu di esportazione unificato (Stato JSON / FHIR / PNG / JPG)
- 📥 Menu di importazione con importazione FHIR (ricarica Bundle esportati)
- ⏳ Overlay di avanzamento durante l'esportazione delle immagini
- 🎓 Tour introduttivo interattivo in 18 passi
- 🔢 Tre sistemi di numerazione (FDI, Universal, Palmer)
- 🌐 I18n — 12 lingue dell'interfaccia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) con selettore di lingua; l'arabo visualizza l'interfaccia da destra a sinistra, con i grafici dentale e parodontale fissati da sinistra a destra (AR/ZH/FR sono traduzioni automatiche, in attesa di revisione da parte di madrelingua)
- 🌗 Supporto modalità scura con pulsante di attivazione (autonoma o controllata dall'app principale)
- 🎨 Configurazione tema personalizzato (prop `themeConfig`) con proprietà CSS personalizzate (`--odon-*`)
- 📱 UX touch su mobile: popover zoom al tocco, menu contestuale con pressione prolungata, zoom a pizzico, target touch WCAG 44px, navigazione per arcata
- 🔌 Sistema di plugin SVG personalizzati: overlay visivi, stato personalizzato per dente, supporto esportazione/importazione JSON — l'output di `renderSvg()` dei plugin viene sanificato con DOMPurify (profilo SVG) prima di essere inserito nell'odontogramma live; i plugin continuano comunque a essere eseguiti come codice fidato, quindi vanno caricati solo da fonti attendibili
- 🛡️ Content-Security-Policy: la build di produzione della demo inserisce un tag meta CSP (il server di sviluppo non è interessato) — le applicazioni ospitanti che integrano il componente dovrebbero impostare la propria CSP
- ⚠️ Avvisi di validazione dello stato per combinazioni di stati dentali incompatibili
- 🏷️ Tooltip automatico dello stato sui riquadri dentali (mostra tutti gli stati attivi)
- 🩺 Tooltip per dente e pannello di riepilogo per l'intera bocca modernizzati: entrambi mostrano l'intero set di reperti clinici (diagnosi pulpare/apicale + sottotipo di lesione, riassorbimento radicolare, stato peri-implantare, carie radicolare graduata, tartaro, microinfiltrazione marginale della corona, frattura, perdita di contatto, usura tipizzata del bordo/cervicale), con una sezione dedicata "Diagnosi" nel pannello, una sezione dedicata "Usura", e un qualificatore grossolano di gravità della carie (superficiale/moderata/profonda)
- ♿ Accessibilità da tastiera (WCAG): ruoli ARIA listbox/option, selezione con Invio/Spazio, navigazione con tasti freccia, contorni focus-visible
- 🔒 Modalità sola lettura: disabilita tutte le interazioni per casi d'uso di stampa/report/visualizzazione
- ✨ Animazioni di selezione: bordo tratteggiato pulsante e ombra luminosa sui denti selezionati (con supporto prefers-reduced-motion)
- 📝 Note per dente: doppio clic per aggiungere/modificare note, icona nota accanto al numero del dente, tooltip al passaggio del cursore con il testo della nota, una riga "Note individuali" nel pannello di riepilogo dell'intera bocca, inclusione nel report PDF, esportazione/importazione JSON
- 🔀 Divisione tra grafico Stato e Piano: un interruttore `Status | Plan` nell'intestazione del grafico passa tra un grafico dello **stato** attuale e un grafico del **piano** (trattamento post-operatorio previsto), ciascuno con i propri stati dentali; il grafico del piano parte come copia dello stato la prima volta che vi si passa, e le modifiche in un grafico non influenzano mai l'altro. Esportazione/importazione (`exportStatus`/`exportFhir`/importazione file) hanno sempre come destinazione il grafico dello stato; il grafico del piano viene letto/scritto separatamente tramite la propria API (vedi API pubblica di seguito) e — quando differisce dallo stato — viene incluso come sezione aggiuntiva `plan` nell'esportazione JSON
- 📝 Riquadro "Cosa cambia": ogni volta che il piano differisce dallo stato attuale, un riquadro sotto il pannello informazioni dentali elenca ogni differenza per dente e per asse di trattamento (presenza, substrato, restauro, protesi, corona pianificata, ortodonzia, polpa/endodonzia, apicale) come riga `dente: asse  da → a`; disponibile anche a livello di programmazione tramite `getPlanChanges()`

![Grafico parodontale a bocca intera (italiano)](screenshot_it_perio.png)

- 🩺 Registrazione parodontale: per sito, **profondità di sondaggio (PD)**, **margine gengivale (GM)**, **sanguinamento al sondaggio (BOP)** (+ suppurazione) nei sei siti standard per dente, con **livello di attacco clinico derivato (CAL = PD + margine gengivale)**, recessione e **%BOP** per l'intera bocca. Un **grafico parodontale per l'intera bocca** — ogni arcata disegnata come **due SVG separati, buccale e palatale/linguale** (che riutilizzano la grafica dentale con un orientamento uniforme corona-verso-fascia su entrambi gli aspetti; una **grafica per impianto** per i denti con impianto) con una **linea CEJ** rossa, una **griglia guida in millimetri numerata**, e una **curva margine gengivale / profondità della tasca** sovrapposta ai denti, divisa da una **fascia centrale degli indici parodontali** (etichettata `▲ Buccale … Linguale/Palatale ▼`) che porta gli indici condivisi per dente — la **classe di Miller** in cima, e **Placca/PI/GI/mPI/mBI** visualizzati come una **tessera a diamante anatomica** per dente (punta buccale in alto, punta linguale in basso, mesiale/distale sulla riga centrale scambiati per lato in modo che il mesiale punti sempre verso la linea mediana dell'arcata); le righe numeriche (nomi completi degli indici — PD/GM/CAL/BOP + mobilità + forcazione — in celle più grandi e più adatte al tocco) allineate in colonne e un riepilogo (PD/CAL medi, %BOP, PI%), con inserimento tramite **avanzamento automatico da tastiera**; il grafico **si adatta dinamicamente riempiendo la larghezza disponibile**, responsivo a qualsiasi dimensione della finestra. Presentato come un **interruttore di visualizzazione** `Odontogramma | Stato parodontale`, il cui pannello destro viene riconvertito in una **barra laterale con contesto parodontale** (dati paziente, la classificazione 2017 e il riepilogo per l'intera bocca) mentre quella vista è attiva (un'opzione nelle Impostazioni riporta l'intera presentazione a un **popup**), e resta comunque un **componente invocabile separatamente** (export `PerioChart`) così un'app ospitante può richiamare il grafico parodontale indipendentemente dall'odontogramma di base. Esportazione **FHIR** per sito tramite il pannello parodontale LOINC (`74029-0`; PD `32910-2`, recessione `32911-0`, CAL `32912-8`)
- 🅿️ Stile "proposto": in modalità Piano, i reperti che il piano **aggiunge** rispetto allo stato attuale (corona pianificata, estrazione, movimento ortodontico, protesi, …) vengono visualizzati con un distinto **contorno tratteggiato e colorato "proposto"**, in modo che il piano si legga come intenzione e non come fatto — con una legenda "tratteggiato = proposto" nella scheda del grafico. Il rendering in modalità Stato è identico byte per byte; il trattamento è solo del piano e viene completamente ripristinato tornando indietro
- 🚦 Restrizioni in modalità Piano: il grafico del Piano mostra solo ciò che un dentista può *fare* — il selettore di base offre solo Assente / Permanente / Impianto, e i reperti di sola diagnosi (carie, usura dentale, discromia, e l'intero blocco parodontale — mobilità, griglia di sondaggio a sei siti, modificatori di infiammazione/parodontali, tartaro, stato peri-implantare) sono nascosti; il controllo polpa/endodonzia mantiene il **trattamento** endodontico (canalare / perno / apicectomia / perno parapulpare) nascondendo invece la **diagnosi** pulpare/apicale e il riassorbimento radicolare. Restauro, protesi, ortodonzia, necessità/sostituzione della corona e piano di estrazione restano pianificabili
- 🧪 Un'ampia suite di test automatizzati Vitest che copre numerazione, traduzioni, preset, i18n, componente App, tema, touch, plugin, accessibilità e parità degli assi clinici/diagnosi
- 📖 Documentazione API TypeDoc con commenti JSDoc su tutti gli export pubblici (`npm run docs`)

### 📦 Moduli
- 🦷 Griglia dell'odontogramma e interfaccia dei riquadri dentali
- 🎛️ Pannello di controllo e stato
- 🎨 Motore di stratificazione SVG e template
- 🔢 Numerazione dentale e mappatura delle etichette (FDI/Universal/Palmer)
- 🌐 Localizzazione — 12 lingue dell'interfaccia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), incluso l'arabo (RTL)
- 💾 Esportazione/importazione dello stato
- 📋 Extra di stato: template di restauro predefiniti
- 🎨 Configurazione del tema: palette di colori personalizzabile tramite proprietà CSS `--odon-*`
- 📱 Interazioni touch su mobile (zoom al tocco, pressione prolungata, zoom a pizzico, selettore arcata)
- 🔌 Sistema di plugin SVG personalizzati
- ⚠️ Sistema di validazione dello stato e tooltip
- ♿ Accessibilità da tastiera e supporto ARIA
- 🔒 Modalità sola lettura
- ✨ Animazioni di selezione
- 📝 Sistema di note per dente
- 🧪 Suite di test automatizzati (Vitest + Testing Library)

### 🛠️ Controlli dell'interfaccia

**🔝 Barra superiore:**
- Selettore di lingua (menu a tendina HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Pulsante modalità scura (icona sole/luna, alterna tra tema chiaro e scuro)
- Selettore del sistema di numerazione (menu a tendina FDI/Universal/Palmer)
- Pulsanti Esporta stato / Importa stato

**📊 Intestazione del grafico:**
- Attivazione/disattivazione vista occlusale
- Attivazione/disattivazione visibilità denti del giudizio
- Attivazione/disattivazione visibilità osso
- Attivazione/disattivazione visibilità polpa
- Pulsante cancella selezione

**🔍 Filtri di selezione:**
- Seleziona tutti / Tutti i presenti / Permanenti / Decidui / Impianti / Tutti i mancanti
- Superiori / Superiori 6 frontali / Molari superiori
- Inferiori / Inferiori 6 frontali / Molari inferiori

**📋 Preset di stato:**
- Ripristina tutto (ripristina bocca)
- Dentizione primaria
- Dentizione mista
- Attivazione/disattivazione edentulo

**📦 Menu a tendina extra di stato:**
- Ponti in zirconio superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Ponti in metallo superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Protesi parziali rimovibili superiori/inferiori
- Protesi totali rimovibili superiori/inferiori
- Protesi su barra superiori/inferiori con impianti

**🦷 Pannello editor dente** (per il dente/i denti selezionati, raggruppato in schede a comparsa):
- **Riga base:** selezione del dente (tipo base incl. varianti di corona fratturata) e substrato dentale (natural/radix/broken/crownprep)
- **Riga restauro:** il menu a tendina combinato di restauro "Fix: …" / "Kivehető: …" (opzioni fisse `restorationType`×`restorationMaterial` più le opzioni di attacco/rimovibili `prosthesis`, filtrate in base al tipo di dente); casella di spunta microinfiltrazione marginale della corona (solo corona/ponte); caselle di spunta per la localizzazione della corona fratturata; interruttori corona necessaria / sostituzione corona necessaria
- **Riga usura e discromia:** menu a tendina tipo di usura incisale/occlusale, menu a tendina tipo di usura cervicale, menu a tendina causa di discromia (ciascuno si trasforma in un semplice interruttore sì/no in Impostazioni → Dettagli dentali → modalità simple)
- **Scheda Ortodonzia:** apparecchio, deriva mesiale/distale, movimento verticale (estrusione/intrusione), interruttore rotazione — mostrata su un dente naturale presente
- **Scheda Carie:** menu a tendina modalità profondità carie, casella di spunta carie sottocoronale, menu a tendina gravità carie radicolare, e il selettore di carie per superficie B/M/O/D/L con un popup contestuale profondità ICDAS/CARS e un badge di profondità radiografica
- **Scheda Otturazioni:** menu a tendina materiale otturazione, selettore otturazione per superficie (con materiale per superficie), indicatore di difetto di otturazione per superficie (marginal/fracture/wear), note di suggerimento per carie secondaria e difetto di otturazione
- **Scheda Radice e parodonto:** selettore combinato "Stato polpa / endodonzia", selettore diagnosi apicale, selettore sottotipo di lesione periapicale (solo parodontite apicale sintomatica/asintomatica), selettore tipo di riassorbimento radicolare, selettore grado di mobilità, selettore stato peri-implantare (solo impianti)
- **Indicatori speciali:** piano/ferita di estrazione, spazio chiuso, sigillatura dei solchi, perdita del punto di contatto, tartaro, perno parapulpale, resezione endodontica, pilastro di ponte

### 🦷 Tipi di dente e stati

**Selezione del dente (tipo base):**
| Valore | Descrizione |
|---|---|
| `none` | Dente mancante |
| `tooth-base` | Dente permanente |
| `milktooth` | Dente deciduo (da latte) |
| `implant` | Impianto dentale |
| `tooth-under-gum` | Dente sottogengivale (non erotto) |

**Varianti di dente fratturato:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrato dentale (denti permanenti):**
`natural` (predefinito), `radix` (residuo radicolare), `broken`, `crownprep` (preparato per corona)

**Tipo di restauro (denti permanenti):**
`none`, `crown`, `inlay`, `onlay` (solo vista occlusale), `veneer`, `bridge`

**Materiale del restauro (denti permanenti):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (le corone `metal` esistenti migrano qui), `telescope`, `temporary`

**Le opzioni di restauro sono filtrate in base al tipo di dente** (`restorationOptions()` in `src/registry/restorations.ts`): un impianto offre solo i tipi di restauro `crown`/`bridge` (composti con un livello connettore per impianto) più le cinque voci di attacco `prosthesis` di seguito; un dente mancante/spazio offre solo un elemento intermedio `bridge` più le due voci di protesi rimovibile `prosthesis`; un substrato `radix` nasconde interamente il controllo del restauro. I vecchi campi piatti `crownMaterial`/`bridgeUnit` (valori di attacco impianto/ponte precedenti alla v1.14) sono stati ritirati dal modello attivo — vengono accettati solo come percorso di migrazione in sola lettura per i vecchi payload.

**Protesi** (`prosthesis`; asse ortogonale rimovibile/attacco, mostrato come voci "Kivehető:" nel menu a tendina di restauro combinato):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attacchi implantari, con o senza overdenture), `removable-partial`, `removable-full` (protesi supportate dai denti su un dente mancante/spazio). Un dente ha o un restauro fisso o una protesi, mai entrambi — impostarne uno cancella l'altro.

**Microinfiltrazione marginale della corona** (`crownLeakage`; booleano): mostrata solo quando `restorationType` è `crown` o `bridge`; attiva il livello grafico `crown-leakage`.

**Opzioni endodontiche (denti permanenti):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opzioni endodontiche (denti decidui):**
`none`, `endo-medical-filling`

`endo` e `pulpDx` vengono presentati tramite un unico `<select>` combinato "Stato polpa / endodonzia" (raggruppato: polpa vitale vs. trattata/endodonzia) e si escludono a vicenda — scegliendo un'opzione trattata (`endo != none`) `pulpDx` viene reimpostato a `normal`, e scegliendo una diagnosi pulpare `endo` viene reimpostato a `none`.

**Materiali di otturazione (denti permanenti):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiali di otturazione (denti decidui):**
`composite`, `gic`, `temporary`

**Superfici di otturazione/carie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo carie)

**Modifiche:**
`inflammation` (periapicale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Tipo di lesione periapicale** (`periapicalType`; qualifica il glifo periapicale, mostrato solo in presenza di parodontite apicale sintomatica/asintomatica):
`none`, `granuloma`, `cyst` — opzioni disponibili nel selettore; il vecchio valore `abscess` è ancora accettato/memorizzato ma non più offerto nel selettore, poiché duplica la diagnosi apicale. In importazione viene eliminato: incorporato in `apicalDx` quando il dente presenta il modificatore di infiammazione, altrimenti azzerato a `none`

**Diagnosi pulpare** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (visualizza un glifo di polpa ridotto), `irreversible-pulpitis`, `necrosis` — si esclude reciprocamente con `endo`; normalizzata a `normal` su un dente trattato endodonticamente

**Diagnosi pulpare, latino pratico** (`pulpLatin`; mostrata dal selettore di pulpa solo quando `pulpDetailLevel` è `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Livello di dettaglio pulpare** (`pulpDetailLevel`, impostazione globale): `simple`, `aae` (predefinito), `latin` — controlla il vocabolario offerto dal selettore di pulpa

**Diagnosi apicale** (`apicalDx`; determina il glifo periapicale):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo di riassorbimento radicolare** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stato peri-implantare** (`periImplant`; solo impianti, stadiazione del World Workshop 2018): `mucositis` riutilizza il glifo gengivale parodontale; `peri-implantitis-*` aggiunge il livello `peri-implant-bone-loss` con un'opacità scalata in base alla gravità (mild 0,4 / moderate 0,7 / severe 1,0). Gli impianti non visualizzano più il glifo della lesione periapicale (la loro infiammazione viene invece espressa tramite questo asse), e le caselle di spunta `mods` di infiammazione/parodontale sono nascoste sugli impianti:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Gravità della carie** (`cariesSeverity`; campo unificato per superficie, `0`–`6`): su una superficie senza otturazione viene letta come scala di profondità ICDAS (`superficial` / `dentin` / `deep`, oppure i codici ICDAS II grezzi `0–6` quando `enableIcdas` è attivo) e visualizza il livello primario `caries-{surface}`; su una superficie con otturazione viene letta come punteggio CARS con nome (`0` sano … `6` cavità estesa) e visualizza invece il livello `subcaries-{surface}` (carie ricorrente) — una superficie non è mai contemporaneamente primaria e ricorrente

**Carie radicolare** (`rootCaries`; attiva il livello grafico `caries-root` su un dente presente, con opacità determinata dalla gravità — `active` 0,5 / `arrested` 0,7 / `active-cavitated` opacità piena):
`none`, `active`, `arrested`, `active-cavitated`

**Profondità radiografica della carie** (`radiographicDepth`; per superficie, indipendente dalla scala visiva ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Impostazioni di granularità della carie** (globali): `secondaryCariesMode` (`simple`/`standard`/`full`, predefinito `standard`), `rootCariesMode` (`simple`/`severity`, predefinito `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, predefinito `off`), `cariesDepthEnabled` (booleano, predefinito `true`) — ciascuna riduce la propria scala a una selezione più semplice senza alterare il valore memorizzato

**Indicatori speciali:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Usura dentale** (`wearEdge`, `wearCervical`; tipo clinico per localizzazione, condizionato a dente-base + nessun restauro + substrato naturale; attiva i livelli esistenti `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discromia** (`discoloration`; causa per dente, condizionata a un dente-base naturale o dente deciduo + nessun restauro + substrato naturale; colora il riempimento della corona naturale visualizzata — nessun nuovo SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Difetto di otturazione** (`fillingDefect`; per superficie, reperto su restauro diretto indipendente dalla carie ricorrente — condizionato alle superfici presenti in `fillingSurfaceMaterials`; attiva il livello grafico `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodonzia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; per dente, condizionata a un dente naturale presente — permanente o deciduo):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glifo freccia su), `intrusion` (glifo freccia giù) — `orthoRotation`: booleano

**Impostazioni di dettaglio/notazione dentale** (impostazioni globali di sessione, Impostazioni → Dettagli dentali): `wearDetailLevel` e `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, predefinito `complex` — la modalità simple mostra un interruttore sì/no invece del menu a tendina completo di tipo/causa, senza modificare il valore memorizzato) e `surfaceNotation` (`simple`/`full`, predefinito `full` — controlla se le lettere/etichette di superficie di carie/otturazione sono sensibili alla posizione; vedi "Notazione delle superfici sensibile alla posizione" sopra)

### ⚙️ Impostazioni
Si apre dall'icona a ingranaggio nella barra superiore; un `dialog` ARIA con focus intrappolato e layout a schede (Esc/clic sullo sfondo per chiudere, tasti freccia per cambiare scheda). Tutte le impostazioni sono stato dell'interfaccia a livello di sessione, salvo diversa indicazione — nessuna di esse modifica i dati per dente o il payload di esportazione.

- **Generale:** sistema di numerazione (FDI/Universal/Palmer), lingua, tema chiaro/scuro, visibilità del pannello informazioni dentali
- **Odontogramma:** profilo di anatomia dentale (`classic` predefinito / `measured`) — `measured` rende nove modelli dentali misurati dalla letteratura in un layout a due arcate con larghezza per dente; commutabile a runtime, senza effetto sul valore predefinito `classic`
- **Pannelli:** mostra/nasconde in modo indipendente la scheda Stati per l'intera bocca e la scheda Ortodonzia (entrambe visibili per impostazione predefinita)
- **Dettagli dentali:** livello di dettaglio dell'usura e livello di dettaglio della discromia (simple/complex, ciascuno predefinito complex), notazione delle superfici (simple/full, predefinito full)
- **Carie:** interruttore punteggio ICDAS II (`enableIcdas`), interruttore profondità carie (`cariesDepthEnabled`), granularità carie radicolare (`rootCariesMode`: simple/severity), granularità secondaria/CARS (`secondaryCariesMode`: simple/standard/full), granularità profondità radiografica (`radiographicDepthMode`: off/threeLevel/detailed) — la precedente scheda separata "Carie secondaria" è stata unita a questa, con il controllo CARS posizionato direttamente sopra la profondità radiografica
- **Polpa:** livello di dettaglio pulpare (`pulpDetailLevel`: simple/AAE/latino pratico, predefinito AAE) — controlla quale vocabolario offre il selettore "Stato polpa / endodonzia"; modificarlo aggiorna in tempo reale il riepilogo dell'intera bocca e ogni tooltip aperto
- **Note:** abilita/disabilita le note per dente (`enableNotes`)
- **Parodontale:** interruttori mostra/nascondi per indice per tutte le 16 righe del grafico parodontale (`perioRowVisibility`, predefinito tutte visibili), raggruppate in Tasca (PD/GM/CAL/BOP) / Igiene (Placca/PI/GI) / Mucogengivale (visibilità CEJ/concavità radicolare/KG/GT) / Supporto (Forcazione/Mobilità/Classe di Miller) / Peri-implantare (mPI/mBI), ciascuna riga con la propria descrizione; più una modalità tradotta-vs-canonica per il nome degli indici (`perioIndexNameMode`: `translated` predefinito / `canonical` — un nome scientifico fisso in inglese/latino mostrato in ogni lingua dell'interfaccia). Solo preferenze a livello di applicazione (rispecchia `perioViewMode`) — mai serializzate, i tooltip restano localizzati in entrambe le modalità

### 🖼️ Sistema di template SVG

**Template dentali** (in `src/assets/teeth-svgs/`):
| Template | Denti che lo utilizzano |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivi) |
| `13.svg` | 13, 23, 33, 43 (canini) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolari) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molari) |

I template vengono ruotati di 180 gradi per la mascella inferiore e specchiati orizzontalmente per il lato sinistro.

**SVG icone** (in `src/assets/icon-svgs/`):
`icon_8.svg` (giudizio), `icon_gum.svg` (osso), `icon_no_selection.svg` (cancella), `icon_occl.svg` (vista occlusale), `icon_pulp.svg` (polpa)

### 🔢 Sistemi di numerazione

**FDI (ISO 3950):** Denti adulti 11-18, 21-28, 31-38, 41-48. Denti decidui 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Denti adulti numerati 1-32. Denti decidui con lettere A-T.

**Palmer (Zsigmondy-Palmer):** Formato quadrante + posizione (es. UR-1, LL-5). I denti decidui usano le lettere A-E per quadrante.

### 🚀 Utilizzo
Sviluppo:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Anteprima:
```bash
npm run preview
```

### 🔗 Integrazione
Il componente può essere incorporato in qualsiasi app React.
Esempio:
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

**Integrazione modalità scura:**
- **Modalità autonoma:** Omettere la prop `darkMode` — il componente gestisce il proprio stato del tema tramite il pulsante di attivazione nella barra superiore e aggiunge/rimuove la classe `.dark` sull'elemento `<html>`.
- **Modalità controllata:** Passare `darkMode` e `onDarkModeChange` — l'app principale controlla il tema. Il pulsante di attivazione continua ad apparire, ma chiama `onDarkModeChange` invece di gestire lo stato interno. L'app principale è responsabile dell'aggiunta/rimozione della classe `.dark` sull'elemento `<html>`.

**Tema personalizzato:**
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

**Integrazione plugin:**
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

### 🧪 Test
```bash
npm run test           # Esegui l'ampia suite di test automatizzati Vitest
npm run test:watch     # Modalità watch
npm run test:coverage  # Report di copertura
```

### 📖 Documentazione API

🅰️ **Versione Angular:** è disponibile un port ufficiale per Angular, [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram) (`angular-advanced-odontogram` su npm) — le esportazioni JSON e FHIR R4 sono interscambiabili tra le due librerie.

```bash
npm run docs           # Genera la documentazione TypeDoc in docs/
```

### 📡 API pubblica

**Props del componente:**

| Prop | Tipo | Predefinito | Descrizione |
|---|---|---|---|
| `language` | `string` | `'hu'` | Lingua dell'interfaccia (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback quando cambia la lingua |
| `numberingSystem` | `string` | `'FDI'` | Sistema di numerazione (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback quando cambia la numerazione |
| `darkMode` | `boolean` | `undefined` | Stato modalità scura. Omettere per la modalità autonoma. |
| `onDarkModeChange` | `(dark) => void` | — | Callback quando si attiva/disattiva la modalità scura. Obbligatorio per la modalità controllata. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Override dei colori personalizzati tramite proprietà CSS personalizzate (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugin SVG personalizzati per overlay visivi e stato personalizzato per dente. |
| `readOnly` | `boolean` | `undefined` | Disabilita tutte le interazioni (clic, touch, tastiera). Utile per visualizzazioni di stampa/report. |
| `enableNotes` | `boolean` | `undefined` | Abilita le note per dente. Doppio clic su un dente per aggiungere/modificare note. |

**Funzioni esportate per il controllo esterno:**

| Funzione | Descrizione |
|---|---|
| `initOdontogram()` | Inizializza il motore e renderizza tutti i denti |
| `destroyOdontogram()` | Arresta il motore e rimuove i listener degli eventi |
| `setNumberingSystem(system)` | Passa tra FDI, Universal, Palmer |
| `clearSelection()` | Deseleziona tutti i denti |
| `setOcclusalVisible(on)` | Attiva/disattiva la vista occlusale |
| `setWisdomVisible(on)` | Mostra/nasconde i denti del giudizio |
| `setShowBase(on)` | Mostra/nasconde il livello osseo |
| `setHealthyPulpVisible(on)` | Mostra/nasconde la polpa sana |
| `registerPlugins(plugins)` | Registra plugin SVG personalizzati |
| `setPluginState(toothNo, pluginId, value)` | Imposta lo stato personalizzato di un plugin per un dente |
| `getPluginState(toothNo, pluginId)` | Ottiene lo stato personalizzato di un plugin per un dente |
| `getToothStateSummary(toothNo)` | Ottiene un riepilogo localizzato di tutti gli stati attivi |
| `getOdontogramSummary()` | Ottiene un riepilogo testuale strutturato e localizzato dell'intero odontogramma (conteggi, sezioni) |
| `onStateChange(callback)` | Sottoscrive le modifiche di stato; restituisce una funzione di annullamento |
| `setReadOnly(value)` | Abilita/disabilita la modalità sola lettura |
| `getReadOnly()` | Ottiene lo stato corrente di sola lettura |
| `setNotesEnabled(value)` | Abilita/disabilita le note per dente |
| `getNotesEnabled()` | Ottiene lo stato corrente delle note |
| `setPulpDetailLevel(level)` | Imposta il vocabolario del selettore di pulpa — `"simple"`, `"aae"` o `"latin"` |
| `getPulpDetailLevel()` | Ottiene il livello di dettaglio pulpare corrente |
| `getChartMode()` | Ottiene il grafico attualmente attivo — `"status"` o `"plan"` |
| `setChartMode(mode)` | Passa il grafico attivo a `"status"` o `"plan"`; il grafico del piano viene copiato in profondità dallo stato la prima volta che viene attivato |
| `getStatusChart()` | Ottiene il payload del grafico dello stato (`{version, globals, teeth}`), indipendentemente da quale grafico sia attualmente attivo |
| `getPlanChart()` | Ottiene il payload del grafico del piano (`{version, globals, teeth}`), indipendentemente da quale grafico sia attualmente attivo |
| `setPlanChart(payload)` | Sostituisce i denti del grafico del piano a partire da un payload (lo stato resta invariato); segna il grafico del piano come inizializzato |
| `getPlanChanges()` | Ottiene il diff strutturato stato→piano (`{ toothNo, axis, from, to }[]`) — una voce per dente per ogni asse di trattamento che differisce tra il grafico dello stato e quello del piano; vuoto quando non esiste ancora un piano. Disponibile anche su `getOdontogramSummary()` come `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Imposta i dati parodontali per uno dei sei siti (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` null/`<1` de-registra il sito. Valida e limita (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Ottiene il record parodontale per sito di un dente (solo siti registrati) |
| `getToothCal(toothNo)` | Ottiene il CAL derivato per sito (`pd + margine gengivale`) di un dente |
| `getPerioSummary()` | Aggregati parodontali per l'intera bocca: numero di siti registrati, numero di siti sanguinanti, %BOP, CAL peggiore, PD massimo |
| `getPerioChart()` | Ottiene i record parodontali per dente del grafico attivo |
| `PerioChart` | Componente React (export con nome) — l'overlay del grafico parodontale per l'intera bocca (`{ open, onClose }`), montabile indipendentemente da `OdontogramShell` per l'integrazione con l'app ospitante |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Apre/chiude/interroga a livello di programmazione l'overlay del grafico parodontale — permette a un'app ospitante di richiamare il grafico parodontale separatamente dall'odontogramma di base (stato del caso condiviso) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Ottiene/imposta come viene presentato il grafico parodontale — `"toggle"` (un interruttore di visualizzazione `Odontogramma \| Grafico dentale`, predefinito) o `"popup"` (l'overlay) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Ottiene/imposta l'overlay evidenziato del Grafico dentale — `"none"` (predefinito) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; ridisegna i denti secondo quella misura (solo visualizzazione sui dati esistenti) |
| `getToothRecessionType(toothNo)` | Ottiene il **tipo di recessione di Cairo** derivato — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (calcolato dal CAL interprossimale rispetto a quello buccale del dente) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Visibilità della CEJ per dente — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Concavità della superficie radicolare per dente — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Grado dell'Indice di Placca di Silness-Löe per superficie — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Grado dell'Indice Gengivale di Löe-Silness per superficie — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Larghezza della gengiva cheratinizzata buccale per dente in mm — `0`-`15`, o `null` se non registrata |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Fenotipo di spessore gengivale per dente — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Classe di recessione di Miller per dente — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Solo impianti — grado dell'Indice di Placca modificato di Mombelli (mPI) per superficie — `0`-`3`; nessun effetto su un dente non implantare |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Solo impianti — grado dell'Indice di Sanguinamento del Solco modificato di Mombelli (mBI) per superficie — `0`-`3`; nessun effetto su un dente non implantare |
| `furcationEntrances(toothNo)` | Gli ingressi di forcazione per un dente — `["mesial","distal","buccal"]` (molari superiori), `["buccal","lingual"]` (molari inferiori), `["mesial","distal"]` (primi premolari superiori), altrimenti `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Imposta/ottiene il coinvolgimento di forcazione per ingresso (Glickman `1`–`4`; `null` cancella) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Imposta/ottiene la presenza di placca O'Leary per superficie (mesiale/distale/buccale/linguale); alimenta il PI% per l'intera bocca in `getPerioSummary()` |
| `getCaseMeta()` | Ottiene l'oggetto di metadati a livello di caso (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — un unico blocco condiviso, non per dente/a doppio stato (rispecchia la chiave `globals` di livello superiore del payload); alimenta la classificazione di stadiazione/grading parodontale e l'intestazione del report PDF |
| `setPatientName(v)` | Imposta il nome del paziente del caso (troncato; stringa vuota o `null` lo cancella) — solo identità, mai utilizzato nella derivazione parodontale |
| `setPatientDob(v)` | Imposta la data di nascita del paziente del caso (`YYYY-MM-DD`; non valida/vuota la cancella) — solo per l'identità del report PDF |
| `setExamDate(v)` | Imposta la data dell'esame del caso (`YYYY-MM-DD`; non valida/vuota la cancella) |
| `setCaseAge(v)` | Imposta l'età del paziente del caso in anni — `0`-`120`, o `null` per cancellare |
| `setSmokingStatus(v)` | Imposta lo stato di fumatore del caso — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Imposta le sigarette/giorno (significativo solo quando lo stato di fumatore è `"current"`) — `0`-`99`, o `null` per cancellare |
| `setDiabetesStatus(v)` | Imposta lo stato diabetico del caso — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Imposta l'HbA1c % (significativo solo quando lo stato diabetico è `"present"`) — `3.0`-`20.0` (una cifra decimale), o `null` per cancellare |
| `setToothLossPerio(v)` | Imposta i denti persi per parodontite — `0`-`32`, o `null` per cancellare |
| `setMaxRblPercent(v)` | Imposta la percentuale massima di perdita ossea radiografica — `0`-`100`, o `null` per cancellare |
| `resetCaseMeta()` | Ripristina l'oggetto di metadati a livello di caso ai suoi valori predefiniti vuoti |
| `getPerioClassification()` | Ottiene la classificazione parodontale del World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnosi/stadio/grado/estensione derivati dai dati parodontali registrati e dai metadati del caso, ciascun asse sostituito dall'override del clinico quando impostato (`derived` espone sempre i valori calcolati non modificati, `overridden` indica quali assi sono stati sovrascritti) |
| `setDiagnosisOverride(v)` | Sovrascrive la diagnosi parodontale derivata — `"health"` / `"gingivitis"` / `"periodontitis"`, o `null` per cancellare (ripristina il valore derivato) |
| `setStageOverride(v)` | Sovrascrive lo stadio parodontale derivato — `"I"` / `"II"` / `"III"` / `"IV"`, o `null` per cancellare (ripristina il valore derivato) |
| `setGradeOverride(v)` | Sovrascrive il grado parodontale derivato — `"A"` / `"B"` / `"C"`, o `null` per cancellare (ripristina il valore derivato) |
| `setExtentOverride(v)` | Sovrascrive l'estensione parodontale derivata — `"localized"` / `"generalized"` / `"molar-incisor"`, o `null` per cancellare (ripristina il valore derivato) |
| `exportFhir(options?)` | Esporta l'odontogramma come Bundle HL7 FHIR R4 (download JSON). Riferimento `{ subject }` opzionale; altrimenti viene incorporato un Paziente segnaposto |
| `exportImage(format)` | Scarica l'odontogramma come immagine — `"png"` o `"jpg"` |
| `exportSvg()` | Scarica l'odontogramma come SVG scalabile (vettoriale) |
| `hasAnyPerioData()` | `true` se e solo se è registrato qualsiasi asse parodontale in un punto qualsiasi della bocca — determina il salto automatico dell'esportazione parodontale e disabilita le voci del menu di esportazione parodontale su un grafico vuoto |
| `exportPerioSvg()` | Scarica il grafico parodontale completo (grafica dentale + righe numeriche + classificazione 2017) come un unico SVG vettoriale autonomo, costruito senza interfaccia grafica dallo stato tramite `buildPerioSvg()` |
| `exportPerioImage(format)` | Scarica il grafico parodontale come immagine rasterizzata — `"png"` o `"jpg"` |
| `exportPdf(opts)` | Scarica un report PDF nativo jsPDF (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, ciascuna sezione opzionale) — testo vettoriale più immagini rasterizzate di denti/grafico parodontale; la sezione delle note individuali viene saltata automaticamente quando nessun dente ha una nota, e le due sezioni parodontali vengono saltate automaticamente ogni volta che `hasAnyPerioData()` è falso, indipendentemente da `opts` |
| `importFhirBundle(input)` | Importa un Bundle FHIR R4 (oggetto o stringa JSON) prodotto da questo modulo |
| `setImportFormat(format)` | Imposta il parser per la prossima importazione file — `"status"` o `"fhir"` |
| `startIntroTour()` | Avvia il tour introduttivo interattivo in 18 passi |

### 💾 Persistenza dello stato (localStorage)

Persistenza opzionale su `localStorage` per lo stato del caso dell'odontogramma (`src/persistence.ts`, ri-esportata dal punto di ingresso del pacchetto). Disattivata per impostazione predefinita — le integrazioni esistenti non sono interessate a meno che un'applicazione ospitante non la attivi esplicitamente, e va richiamata **dopo** che l'odontogramma è stato montato (il ripristino ridisegna il DOM live tramite `importStatus()`):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // predefinito: "react-advanced-odontogram"
  includePlan: true,          // persiste anche il piano; predefinito: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Funzione | Descrizione |
|---|---|
| `enablePersistence(options?)` | Ripristina un caso salvato in precedenza (se presente) tramite `importStatus()`, quindi salva l'odontogramma di stato su `localStorage` a ogni cambiamento di stato. Idempotente — richiamarla di nuovo sostituisce la sottoscrizione/le opzioni precedenti. **Deve essere richiamata dopo che l'odontogramma è stato montato.** |
| `disablePersistence()` | Interrompe la persistenza; la voce salvata resta invariata. |
| `clearPersistedState()` | Rimuove la voce salvata per la chiave attiva (o predefinita). |
| `isPersistenceEnabled()` | `true` mentre una sottoscrizione ai cambiamenti di stato è attiva. |

**`PersistenceOptions`:**

| Campo | Tipo | Predefinito | Descrizione |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | La chiave `localStorage`. |
| `includePlan` | `boolean` | `false` | Persiste anche il piano (il campo `plan` del payload). |
| `onError` | `(err: Error) => void` | — | Richiamata su qualsiasi errore di archiviazione/parsing invece di `console.warn`. |

Note: non viene letto né scritto nulla su `localStorage` a meno che `enablePersistence()` non venga richiamata; un limite di sicurezza di 4 MB salta un salvataggio troppo grande (segnalato tramite `onError`/`console.warn`) invece di generare un'eccezione; ogni errore di archiviazione/JSON — quota superata, un iframe bloccato, dati salvati corrotti o non riconosciuti, ecc. — viene intercettato e segnalato. Questo modulo non genera mai eccezioni.

Nota: l'attivazione della persistenza ripristina il caso salvato tramite `importStatus()`, sostituendo il caso corrente — incluso un piano in corso se il payload salvato non ne contiene uno. Attivare la persistenza all'avvio (subito dopo il montaggio), non a metà sessione.

Nota: il payload persistito può includere dati identificativi del paziente (nome del paziente, data dell'esame) in chiaro nel `localStorage`. Se si registrano tali dati, assicurarsi di una protezione a livello di dispositivo o cancellarli con `clearPersistedState()` quando opportuno.

### 💾 Formato di esportazione/importazione dello stato
L'esportazione crea un file JSON (versione `2.22`; le importazioni accettano anche le versioni legacy `1.4` e da `2.0` a `2.21` e vengono migrate automaticamente) contenente:

**Campi globali:**
- `wisdomVisible` - denti del giudizio visibili
- `showBase` - livello osseo visibile
- `occlusalVisible` - vista occlusale attiva
- `showHealthyPulp` - polpa sana visibile
- `edentulous` - modalità edentulo attiva

**Campi per dente (32 denti):**
- `toothSelection` - tipo base del dente
- `toothSubstrate` - substrato dentale (natural/radix/broken/crownprep), ortogonale a qualsiasi restauro
- `restorationType` - tipo di restauro (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiale del restauro (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), abbinato a `restorationType`
- `prosthesis` - asse rimovibile/attacco (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), si esclude reciprocamente con un `restorationType` fisso di crown/bridge
- `crownLeakage` - flag di microinfiltrazione marginale della corona, significativo solo quando `restorationType` è crown o bridge
- `endo` - stato endodontico; si esclude reciprocamente con `pulpDx` (presentati insieme tramite un unico selettore combinato "Stato polpa / endodonzia" — trattare un dente normalizza `pulpDx` a `normal`)
- `mods` - array di modifiche (inflammation, parodontal); `inflammation` è stato ritirato dall'interfaccia sui denti presenti (lì è `apicalDx` a determinare il glifo) ma si applica ancora ai denti mancanti/con alveolo post-estrattivo
- `caries` - superfici con carie attiva
- `cariesActiveDepth` - il valore di profondità ICDAS predisposto dal selettore di profondità carie quando viene applicata una nuova superficie (non è un valore memorizzato per superficie; vedi `cariesSeverity` per il campo memorizzato per superficie)
- `rootCaries` - gravità della carie radicolare (none/active/arrested/active-cavitated)
- `cariesSeverity` - gravità unificata per superficie (0-6): profondità ICDAS su una superficie primaria (senza otturazione), punteggio CARS su una superficie ricorrente (con otturazione)
- `radiographicDepth` - profondità radiografica della carie per superficie (none/E1/E2/D1/D2/D3), indipendente dalla scala visiva ICDAS/CARS
- `fillingMaterial` - materiale dell'otturazione
- `fillingSurfaces` - superfici otturate
- `fillingSurfaceMaterials` - materiale dell'otturazione per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- `fillingDefect` - difetto di otturazione per superficie (none/marginal/fracture/wear), condizionato alla presenza di una superficie otturata, indipendente dalla carie ricorrente
- `pulpDx` - diagnosi pulpare AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis visualizza un glifo ridotto
- `pulpLatin` - sottotipo pulpare in latino pratico (mostrato dal selettore di pulpa solo quando `pulpDetailLevel` è `latin`)
- `apicalDx` - diagnosi apicale che determina il glifo periapicale
- `periapicalType` - sottotipo di lesione periapicale (none/granuloma/cyst), mostrato solo in presenza di parodontite apicale sintomatica/asintomatica; il vecchio valore `abscess` è ancora accettato in importazione
- `resorptionType` - tipo di riassorbimento radicolare (none/internal/external-cervical)
- `periImplant` - stato peri-implantare solo per impianti (none/mucositis/peri-implantitis-mild/-moderate/-severe), stadiazione del World Workshop 2018
- `dxOverrides` - override della codifica diagnostica per dente (versione 2.21): un oggetto indicizzato per chiave di diagnosi ICD-10 → `add` | `suppress`, che forza l'attivazione di una diagnosi codificata nonostante l'assenza di un reperto corrispondente, o la sua disattivazione nonostante la presenza di uno; determina l'insieme codificato effettivo esportato come `Condition` FHIR
- `endoResection` - flag apicectomia
- `fissureSealing` - flag sigillante per solchi
- `calculus` - flag tartaro
- `contactMesial` - perdita del punto di contatto mesiale
- `contactDistal` - perdita del punto di contatto distale
- `wearEdge` - tipo di usura incisale/occlusale (none/attrition/erosion)
- `wearCervical` - tipo di usura cervicale (none/abrasion/abfraction/erosion)
- `discoloration` - causa di discromia per dente (none/tetracycline/fluorosis/nonvital/extrinsic/other), colora il riempimento della corona naturale su un dente-base naturale/dente deciduo senza restauro
- `orthoAppliance` - apparecchio ortodontico (none/bracket/band)
- `orthoDrift` - deriva ortodontica (none/mesial/distal)
- `orthoVertical` - movimento verticale ortodontico (none/extrusion/intrusion)
- `orthoRotation` - flag di rotazione ortodontica
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - posizioni delle fratture
- `extractionWound` - ferita post-estrazione
- `extractionPlan` - estrazione pianificata
- `parapulpalPin` - flag perno parapulpale
- `bridgePillar` - dente pilastro del ponte
- `mobility` - grado di mobilità (none/m1/m2/m3)
- `crownNeeded` - indicatore corona necessaria
- `crownReplace` - indicatore sostituzione corona necessaria
- `missingClosed` - spazio chiuso dopo estrazione
- `customStates` - stati personalizzati del plugin (oggetto, indicizzato per ID plugin)
- `note` - nota testuale per dente (stringa, opzionale — presente solo se non vuota)

**Campo di livello superiore `plan` (versione 2.11+):**
- `plan` - oggetto opzionale, con la stessa forma di `teeth` (i campi per dente sopra), che contiene il grafico del **piano** (trattamento post-operatorio previsto). Presente solo quando il grafico del piano è stato inizializzato (l'interruttore `Status | Plan` è stato commutato su Plan almeno una volta) E il suo contenuto differisce dal grafico dello stato — un'esportazione di solo stato lo omette interamente e resta identica byte per byte a un'esportazione precedente alla 2.11, a parte il numero di versione. In importazione, un `plan` assente cancella/deinizializza il grafico del piano (non fa mai risorgere un piano obsoleto rimasto da prima dell'importazione); un `plan` presente ripristina il grafico del piano insieme allo stato. Il grafico del piano può anche essere letto/scritto indipendentemente dall'importazione/esportazione tramite `getPlanChart()`/`setPlanChart()` (vedi API pubblica sopra), e `getStatusChart()` restituisce sempre il payload primario dello stato indipendentemente dalla modalità di grafico attiva.

**Oggetto di livello superiore `case` (versione 2.17+, ampliato in 2.18, 2.19, 2.20 e 2.22):**
- `case` - oggetto opzionale di metadati a livello di caso — NON è per dente né a doppio stato (lo stesso oggetto è condiviso tra il grafico dello stato e quello del piano, rispecchiando la chiave `globals` di livello superiore). Contiene l'età del paziente (`age`, 0-120), lo stato di fumatore (`smokingStatus`: unknown/never/former/current, con `cigarettesPerDay` 0-99), lo stato diabetico (`diabetesStatus`: unknown/none/present, con `hba1c` 3.0-20.0), due statistiche riassuntive dell'esito parodontale (`toothLossPerio` 0-32 e `maxRblPercent` 0-100), le sovrascritture cliniche della classificazione parodontale 2017 (`diagnosisOverride`/`stageOverride`/`gradeOverride`/`extentOverride`), e tre campi di identità del caso — `patientName` (stringa troncata o `null`), `patientDob` (`YYYY-MM-DD` o `null`) e `examDate` (`YYYY-MM-DD` o `null`) — usati esclusivamente nell'intestazione del report PDF e in nessun altro punto; nessuno dei tre fa parte dell'esportazione FHIR; e (versione 2.22) `caseConditions` — diagnosi del caso/regionali (malocclusione e ATM K07, cisti orali K09, malattie delle ghiandole salivari K11, stomatite e mucosa orale K12/K13, anomalie dello sviluppo a livello di arcata K00), ciascuna associata a una lateralità (non specificato / sinistro / destro / bilaterale). Viene serializzato omettendo i campi vuoti, e l'intero oggetto `case` è assente quando tutti i suoi campi sono al valore predefinito. Viene gestito tramite `getCaseMeta()`/`resetCaseMeta()` e i singoli setter (vedi API pubblica sopra).

### 🖨️ Esportazione
`exportFhir()` produce un Bundle pulito per i validatori HL7: ogni voce porta un `id` deterministico e un `fullUrl` assoluto (nessun segnaposto `urn:uuid`), e il Bundle incorpora il CodeSystem proprio del motore in modo che i suoi codici locali siano risolvibili durante la validazione (pubblicato anche come `fhir/CodeSystem-odontogram.json` nel repository; omettibile con `includeCodeSystem: false`).

I dati parodontali ora fanno andata e ritorno anche tramite l'importazione FHIR, non solo tramite il payload JSON: `importFhirBundle()` rilegge i pannelli parodontali LOINC `74029-0` nel record parodontale di ogni dente — profondità di sondaggio, margine gengivale (ricostruito dal CAL, così i valori di pseudotasca sopravvivono), BOP, forcazione, placca O'Leary, gli indici PI/GI e mPI/mBI implantari, e la larghezza della gengiva cheratinizzata — oltre alle Observation di evidenza su stato di fumatore e HbA1c a livello di caso. La suppurazione è l'unica eccezione: resta solo in JSON, perché non fa parte dell'esportazione FHIR.

Oltre all'esportazione propria dell'odontogramma in Stato JSON / FHIR / PNG / JPG / SVG, il **grafico parodontale** ha un proprio percorso di esportazione:
- **SVG/PNG/JPG parodontale:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderizzano il grafico parodontale completo (grafica dentale + righe numeriche + la classificazione 2017) come un unico SVG vettoriale autonomo (`buildPerioSvg()`), indipendente dal DOM montato di `PerioChart`. Le tre voci del menu di esportazione sono disabilitate ogni volta che `hasAnyPerioData()` è falso (un grafico vuoto non ha nulla di parodontale da esportare).
- **Report PDF:** la voce "PDF report…" del menu di esportazione apre `ExportOptionsModal` — una finestra di dialogo delle impostazioni (campi nome paziente + data di nascita + data esame, collegati direttamente ai metadati del caso, con la data esame che ha come valore predefinito la data odierna; caselle di spunta per sezione: dati paziente, odontogramma, descrizione odontogramma, note individuali — disabilitata quando nessun dente ha una nota — stato parodontale, descrizione parodontale) prima di chiamare `exportPdf(opts)`. I campi di identità vuoti ricadono su valori segnaposto ("John Doe" / "1980-01-01") in modo che l'esportazione riesca sempre. Il PDF viene assemblato in modo nativo jsPDF — testo vettoriale tramite `.text()`, immagini rasterizzate di denti/grafico parodontale tramite `.addImage()` — **senza alcuna dipendenza da svg2pdf.js**. La sezione delle note individuali viene saltata automaticamente quando nessun dente ha una nota, e le due sezioni parodontali ogni volta che `hasAnyPerioData()` è falso, indipendentemente dalle caselle di spunta della finestra di dialogo.
- **Gating implantare mPI/mBI:** gli indici peri-implantari di Mombelli (mPI/mBI) vengono renderizzati come righe solo in un'arcata che contiene almeno un dente con impianto — sia nel grafico parodontale dal vivo sia nelle esportazioni SVG/PDF.
- Il nome del paziente, la data di nascita e la data dell'esame sono solo metadati di identità del caso (payload `2.20`, additivi) — **non** fanno parte dell'esportazione FHIR.

### 📁 Struttura delle cartelle
- `src/App.tsx` - interfaccia della shell, controlli della barra superiore, selettore lingua/numerazione/modalità scura/tema/plugin
- `src/odontogram.ts` - motore di stratificazione SVG, gestione dello stato dentale, interazioni touch, overlay plugin, collegamento UI
- `src/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priorità z-index `LAYER_Z`
- `src/theme.ts` - tipo `OdontogramThemeConfig` e utilità `applyThemeConfig()`
- `src/status_extras.ts` - 34 template di restauro predefiniti (ponti, protesi, costruzioni su barra)
- `src/i18n/` - traduzioni (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) e hook i18n
- `src/utils/numbering.ts` - conversione della numerazione FDI, Universal, Palmer
- `src/registry/` - registro dichiarativo degli assi clinici: mappature dei campi FHIR, attivazione di clear-set SVG/flag booleani, matrice tipo×materiale del restauro, elenchi di opzioni UI (unica fonte di verità che genera esportazione/importazione, FHIR e interfaccia dei selettori)
- `src/fhir/` - esportazione/importazione HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemi di codici, mappature dei campi, primitive
- `src/bridgeOverlay.ts` - overlay connettore del tratto di ponte multi-dente (geometria a sella sensibile all'arcata)
- `src/SettingsModal.tsx` - finestra di dialogo Impostazioni a schede (Generale/Pannelli/Dettagli dentali/Carie/Polpa/Note/Parodontale)
- `src/perioExport.ts` - `buildPerioSvg()`: il grafico parodontale completo come un unico SVG vettoriale autonomo
- `src/perioPdf.ts` - l'assemblatore puro del report jsPDF di `exportPdf()` (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - la finestra di dialogo delle impostazioni di esportazione "PDF report…"
- `src/__tests__/` + `src/registry/__tests__/` - un'ampia suite di test automatizzati Vitest
- `src/assets/teeth-svgs/` - template SVG dentali (6 file: incisivi, canini, premolari, molari + viste occlusali)
- `src/assets/icon-svgs/` - SVG delle icone della barra degli strumenti (5 file)

### ⚙️ Stack tecnologico
- React 18 + Vite + TypeScript
- Tailwind CSS per lo stile dell'interfaccia
- Stratificazione SVG tramite manipolazione del DOM (stato non-React per le prestazioni)
- Sistema i18n personalizzato leggero
- Vitest + Testing Library per i test automatizzati
- TypeDoc per la documentazione API
- Alias di percorso Vite: `@` mappato su `./src`

### 📝 Note
- I template SVG vengono caricati da `src/assets/teeth-svgs` e `src/assets/icon-svgs`, pertanto l'hosting statico deve servire la cartella pubblica.
- Il motore dell'odontogramma utilizza il proprio stato interno (non lo stato React) per prestazioni e semplicità.
- I denti decidui dispongono di un set ridotto di materiali disponibili (nessuna otturazione in amalgama, nessun trattamento endodontico con perni).
- I denti con impianto dispongono di un diverso set di opzioni per corona/abutment rispetto ai denti naturali.

### 🔒 Note sulla sicurezza

- **I plugin vengono eseguiti come codice fidato.** Il valore restituito da `renderSvg()` di un plugin viene inserito nell'SVG dell'odontogramma live. Quell'output viene sanificato con [DOMPurify](https://github.com/cure53/DOMPurify) (profilo SVG, più `svgFilters`) prima dell'inserimento — `<script>`, `<iframe>`, `<object>`, `<embed>` e `<foreignObject>` sono vietati a priori, e un output completamente malevolo viene scartato invece di essere renderizzato parzialmente. Questo riduce il raggio d'azione di un plugin compromesso o difettoso, ma i plugin dovrebbero comunque essere caricati solo da fonti attendibili — la sanificazione è una rete di sicurezza, non un sostituto della verifica.
- **Content-Security-Policy.** La **build di produzione** della demo inserisce questa policy tramite un tag `<meta http-equiv="Content-Security-Policy">` (il server di sviluppo non è interessato):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Le applicazioni ospitanti che integrano `OdontogramShell` dovrebbero impostare la propria CSP adatta al loro deployment — il componente non ne inserisce una quando è usato come libreria.

### 📖 Come citare

Se utilizzi questo modulo nel tuo lavoro, per favore citalo.

**Questa versione (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Tutte le versioni (DOI concettuale):** https://doi.org/10.5281/zenodo.21156787

> Il DOI concettuale per tutte le versioni riportato sopra rimanda sempre alla release
> archiviata più recente; un DOI specifico per versione viene assegnato a ogni release
> quando viene archiviata su Zenodo. Finché la v2.4.0 non sarà archiviata, citarla
> tramite il DOI concettuale.

I metadati di citazione leggibili dalla macchina si trovano in [`CITATION.cff`](../CITATION.cff).

## 🙌 Crediti

React Advanced Odontogram è creato e mantenuto da Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), creatore e sviluppatore principale dell'intero motore. Con il prezioso aiuto dei collaboratori elencati di seguito. Grazie a tutti coloro che hanno contribuito.

**Contributori**

- [@odontodev](https://github.com/odontodev): idratazione dello stato e API del ciclo di vita, impostazioni delle otturazioni come props controllate, setter idempotenti e schede comprimibili
- [@JulianoBazzi](https://github.com/JulianoBazzi): traduzione in portoghese brasiliano
- [@yassine-bhn](https://github.com/yassine-bhn): traduzione in francese e l'anatomia misurata proposta
- [@saegerdirk-star](https://github.com/saegerdirk-star): anatomia dentale misurata e il generatore di denti, oltre alla proposta di interfaccia componibile

**Realizzato con** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) e [Tailwind CSS](https://tailwindcss.com).

I contributi sono benvenuti. Apri una pull request su GitHub e verrai accreditato qui. Se il progetto ti è utile, per favore [mettici una stella su GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).
