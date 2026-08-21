# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-2.4.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md)

---

## 📑 Contenido

- [📋 Descripción general](#-descripción-general)
- [📦 Uso como paquete npm](#-uso-como-paquete-npm)
- [✨ Características principales](#-características-principales)
- [📦 Módulos](#-módulos)
- [🛠️ Controles de interfaz](#-controles-de-interfaz)
- [🦷 Tipos de dientes y estados](#-tipos-de-dientes-y-estados)
- [⚙️ Ajustes](#-ajustes)
- [🖼️ Sistema de plantillas SVG](#-sistema-de-plantillas-svg)
- [🔢 Sistemas de numeración](#-sistemas-de-numeración)
- [🚀 Uso](#-uso)
- [🔗 Integración](#-integración)
- [🧪 Pruebas](#-pruebas)
- [📖 Documentación API](#-documentación-api)
- [📡 API pública](#-api-pública)
- [💾 Persistencia de estado (localStorage)](#-persistencia-de-estado-localstorage)
- [💾 Formato de exportación/importación de estado](#-formato-de-exportaciónimportación-de-estado)
- [🖨️ Exportación](#-exportación)
- [📁 Estructura de carpetas](#-estructura-de-carpetas)
- [⚙️ Stack tecnológico](#-stack-tecnológico)
- [📝 Notas](#-notas)
- [🔒 Notas de seguridad](#-notas-de-seguridad)
- [📖 Cómo citar](#-cómo-citar)

## 🇪🇸 Español

### 📋 Descripción general
Este proyecto es un editor de odontograma interactivo basado en navegador que permite un registro rápido del estado dental con una interfaz limpia. Renderiza plantillas SVG de dientes en capas para representar restauraciones, caries, estado endodóntico, movilidad y otros detalles clínicos, proporcionando selección múltiple, filtros de selección y estados predefinidos.

---
![Editor de odontograma — vista previa en español](screenshot_es_odontogram.png)

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### 📦 Uso como paquete npm

El odontograma se publica como una biblioteca de componentes React autocontenida en npm:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Requisitos
- **React 18 o 19** (declarado como dependencia peer — lo proporciona tu aplicación).
- Un **bundler** que entienda el campo `exports` y ESM: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. El paquete es **solo ESM**.
- Node **≥ 18** para las herramientas.

#### Instalación

```bash
npm install react-advanced-odontogram react react-dom
```

#### Uso básico

Renderiza `OdontogramShell` e importa la hoja de estilos **una sola vez** en tu aplicación:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="es"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Props del componente

`OdontogramShell` es un componente controlado. Las props más habituales:

| Prop | Tipo | Por defecto | Descripción |
|------|------|-------------|-------------|
| `language` | `Language` | `"hu"` | Idioma de la interfaz (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Sistema de numeración dental. |
| `darkMode` | `boolean` | `false` | Activa el tema oscuro. |
| `readOnly` | `boolean` | `false` | Desactiva toda edición (solo lectura). |
| `themeConfig` | `OdontogramThemeConfig` | — | Sobrescribe las variables CSS del tema (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registra plugins de estado / capas adicionales. |
| `enableNotes` | `boolean` | `false` | Habilita las notas por diente. |
| `enableIcdas` | `boolean` | `false` | Habilita la puntuación de caries ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complejidad de la obturación: `"simple"` (un material por diente) o `"complex"` (materiales por superficie). |
| `fillingDefectEnabled` | `boolean` | `true` | Activa los hallazgos de defectos de obturación en la tarjeta Obturaciones. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | todos disponibles | Materiales de obturación disponibles como un mapa booleano sobre `amalgam`/`composite`/`gic`/`temporary` (se ignoran claves desconocidas). |
| `fissureSealingEnabled` | `boolean` | `true` | Activa el sellado de fisuras en la tarjeta Obturaciones. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Se disparan cuando el usuario cambia el ajuste correspondiente desde Ajustes → Obturaciones. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Se disparan cuando el usuario cambia el ajuste desde la interfaz. |

También se aceptan props de nivel de detalle más finas (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) — consulta los tipos `.d.ts` incluidos para la lista completa y tipada.

Las cuatro props de obturación anteriores son **solo de restauración**: una prop omitida nunca escribe en el motor (se conserva una llamada imperativa a `setFillingComplexity()` antes del montaje y el modo independiente no cambia), mientras que una prop proporcionada escribe el motor y el estado del modal de Ajustes a la vez, de modo que el modal nunca muestra un valor obsoleto. `fillingMaterialAvailability` se aplica como diff mediante una clave serializada canónica, por lo que volver a renderizar con un literal inline de contenido idéntico nunca reescribe el motor. Las devoluciones `on*Change` se disparan desde Ajustes → Obturaciones: la vía de escritura para que los hosts persistan preferencias.

#### API pública (exports con nombre)

`OdontogramShell` es a la vez el export por defecto y un export con nombre. La API de estado imperativa, el componente `PerioChart` independiente, el tour guiado y todos los tipos públicos son exports con nombre del mismo punto de entrada:

```ts
import {
  OdontogramShell,           // también el export por defecto
  PerioChart,                // gráfico periodontal independiente
  // leer estado
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // suscribirse a los cambios de estado
  // exportar / importar
  exportFhir,                // bundle HL7 FHIR R4
  exportSvg, exportImage,    // exportación vectorial / ráster
  setImportFormat,
  // control
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // lanzar el tour de introducción
  // …y muchas más funciones setX/getX de ajustes
} from "react-advanced-odontogram";
```

Toda la superficie (≈ 44 funciones + tipos como `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) está completamente tipada en las declaraciones incluidas.

#### Superficies componibles (avanzado)

`OdontogramShell` es el componente todo en uno compatible y no requiere configuración adicional. Si necesita colocar las regiones del odontograma en distintas áreas de su propio diseño, las cuatro superficies de interfaz de la shell también se exportan y pueden componerse bajo un único `OdontogramProvider`, compartiendo todas una única sesión gestionada por el paquete:

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

`OdontogramProvider` acepta las mismas props que `OdontogramShell`. Hay disponible un hook `useOdontogramUi()` (y el tipo `OdontogramUiContextValue`) para crear sus propias superficies. Restricción actual: use un proveedor por página. Las superficies se pueden montar y desmontar bajo demanda: se revinculan automáticamente al volver a montarse. `OdontogramShell` en sí no ha cambiado: es exactamente esta composición en la disposición predeterminada.

Para una composición aún más fina, las tarjetas de control individuales también se exportan — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` y `ToothDetailsCard` —, cada una un componente declarativo autónomo que lee y escribe la sesión compartida a través de la API del motor (se exporta un hook `useEngineState()` para construir las suyas propias). Monte solo las tarjetas que necesite un diseño dado, en cualquier disposición, bajo un único `OdontogramProvider`.

#### Uso con Next.js (App Router)

El componente es solo de cliente, así que renderízalo desde un Client Component:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="es" numberingSystem="FDI" />;
}
```

O cárgalo con un import dinámico solo de cliente: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Notas importantes y limitaciones actuales
- **Solo ESM** — el paquete publica un único módulo ES (`dist/odontogram.js`) más un punto de entrada de tipos (`dist/index.d.ts`). Está pensado para la resolución de módulos de un bundler; no hay build CommonJS.
- **La hoja de estilos es aparte** — **debes** importar `react-advanced-odontogram/style.css` una vez; no se inyecta automáticamente. Los estilos son CSS global bajo `.odontogram-root`, gobernados por variables CSS `--odon-*`.
- **SSR / solo cliente** — el componente lee el DOM al montarse (`document`), por lo que debe ejecutarse en el navegador. En frameworks con SSR, renderízalo en un Client Component (`"use client"`) o mediante un import dinámico solo de cliente.
- **Recursos autocontenidos** — los SVG de dientes e iconos se incrustan en el bundle de JavaScript en tiempo de compilación; **no hay ninguna descarga de recursos en tiempo de ejecución** que configurar ni nada extra que copiar a tu carpeta pública.
- **Una instancia por página** — el estado del motor es actualmente un singleton a nivel de módulo, por lo que renderizar dos instancias de `<OdontogramShell>` en la misma página haría que compartieran el estado de un único gráfico. El soporte multi-instancia está previsto para una versión futura.

---

### ✨ Características principales
- 🖱️ Selección rápida y selección múltiple (CMD/CTRL + clic)
- 🦷 Tipos de dientes: permanente, primario (de leche), implante, subgingival, ausente
- 🦷 Sustrato dental (ortogonal a cualquier restauración): natural, radix (resto radicular), fracturado, preparado para corona
- 👑 Restauraciones por tipo × material: corona / incrustación (inlay) / incrustación oclusal (onlay) / carilla / puente en e.max, oro, gradia, circonio, metal, metal-cerámica, telescópica o temporal (el onlay es solo de vista oclusal) — se eligen desde un único selector combinado "Fix: Corona – …" de pocos clics; las coronas `metal` heredadas migran a `metal-ceramic` (metal-cerámica); los implantes usan el mismo modelo tipo × material, compuesto con una capa de conector de implante. El selector se acota según el tipo de diente: un implante solo ofrece corona/puente (más sus cinco opciones de anclaje, ver abajo); un diente ausente/hueco solo ofrece póntico de puente (más removible parcial/completa); un sustrato `radix` oculta por completo el control de restauración (no se puede registrar restauración sobre un resto radicular)
- 🦿 Prótesis removibles/de anclaje en el eje dedicado `prosthesis` (entradas "Kivehető:" en el selector combinado): pilar de cicatrización del implante, localizador, localizador con sobredentadura, barra, barra con sobredentadura; prótesis parcial o completa removible soportada por dientes
- 🌉 Los dientes de puente renderizan tanto la corona como el conector de silla de montar; una superposición de tramo de puente multidiente renderiza un conector continuo y adaptado a la arcada a través de los dientes de puente consecutivos (pónticos + pilares) y los espacios entre ellos (la arcada superior e inferior usan geometría de silla espejada, manteniendo el conector alineado en ambas arcadas), incluido en la exportación PNG/JPG/SVG; añadir un puente mediante un estado predefinido recalcula la superposición de inmediato
- 🔍 Registro de caries en 6 superficies: mesial, distal, bucal, lingual, oclusal, subcoronal
- 🪥 Materiales de obturación por superficie: amalgama, composite, ionómero de vidrio, temporal
- 🏥 Un único selector combinado "Estado pulpar / endo" (agrupado: pulpa vital vs. tratada/endo): los estados endodónticos (obturación medicinal, tratamiento de conductos, obturación incompleta, poste de fibra de vidrio, poste metálico) y el diagnóstico pulpar AAE (`pulpDx`: normal / pulpitis reversible / irreversible / necrosis) son mutuamente excluyentes — un diente con tratamiento de conducto (`endo` distinto de `none`) no puede tener a la vez un diagnóstico pulpar vital; al tratarlo, `pulpDx` se normaliza a `normal` y se suprime el glifo de pulpa enferma. La pulpitis reversible se renderiza con un glifo reducido. Un ajuste opcional de 3 niveles de detalle pulpar (`pulpDetailLevel`: simple / AAE / latín práctico) muestra 9 subtipos en latín práctico (pulpa sana … gangraena pulpae) mediante `pulpLatin`; resección y pin parapulpar siguen siendo indicadores especiales aparte
- 🦴 Diagnóstico apical (`apicalDx`: periodontitis apical sintomática/asintomática, absceso apical agudo/crónico, osteítis condensante) determina directamente el glifo periapical; el subtipo de lesión granuloma/quiste solo se muestra bajo periodontitis apical sintomática/asintomática (se eliminó el subtipo redundante "absceso", ya cubierto por el diagnóstico apical)
- 🩹 Tarjeta combinada "Raíz y periodonto" (sección colapsable única para hallazgos radiculares/periapicales y periodontales)
- ⚕️ Modificaciones: inflamación periapical (visible solo en dientes ausentes/alvéolo de extracción; oculta en dientes presentes, donde el glifo periapical lo determina únicamente `apicalDx`, y en implantes, donde lo cubre `periImplant`), enfermedad periodontal, grados de movilidad (M1/M2/M3, ocultos en implantes)
- 🦷🔩 Estado periimplantario (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — clasificación del World Workshop 2018, mostrada como un selector dedicado en los implantes; la mucositis reutiliza el glifo gingival periodontal, y la periimplantitis añade una capa graduada `peri-implant-bone-loss` (opacidad 0.4/0.7/1.0). Los implantes ya no renderizan el glifo de lesión periapical — su inflamación se expresa mediante este eje — y las casillas de modificadores periodontales quedan ocultas en los implantes (se retira el renombrado ad-hoc "Peri-implantitis" de la casilla)
- 🏷️ Indicadores especiales: corona necesaria, reemplazo de corona necesario, espacio cerrado, plan de extracción, sellado de fisuras, pérdida de punto de contacto
- 👁️ Vista oclusal, muelas del juicio, visibilidad de hueso y pulpa
- 🔢 12 filtros de selección (todos, presentes, permanentes, de leche, implantes, ausentes, superior/inferior, frontales/molares)
- 📊 Estados predefinidos (restablecer, dentición primaria, dentición mixta, edéntulo)
- 📦 34 plantillas de restauración predefinidas (puentes, prótesis removibles, prótesis con barra e implantes)
- 💾 Exportación/importación de estado en JSON (versión 2.22; las importaciones siguen aceptando las versiones heredadas 1.4 y 2.0 a 2.21, y se migran automáticamente, con estados personalizados de plugins y notas por diente)
- 💽 Persistencia opcional (opt-in) en localStorage (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — desactivada por defecto; guarda automáticamente el estado (y, opcionalmente, el plan) en cada cambio y lo restaura la próxima vez que se monta el componente, con un límite de tamaño de 4 MB y los errores de almacenamiento/análisis enviados a un callback `onError` (o `console.warn`) en lugar de lanzar una excepción
- 🔗 Exportación HL7 FHIR R4 (Bundle de colección con Observations por diente, codificación dental ISO 3950 para dentición permanente **y** dientes de leche deciduos (51-85, con importación sin pérdida de datos), sistema de códigos local, además de una superposición opcional de SNOMED CT (Ajustes → SNOMED CT)); un componente de caries con severidad registrada también incluye una codificación del sistema de puntuación — ICDAS en una superficie primaria (sin obturar), CARS en una recurrente (obturada)
- ✚ Selección de superficies en cruz (B/M/O/D/L) para caries y obturaciones
- 🧱 Materiales de obturación por superficie (obturaciones mixtas, p. ej. bucal amalgama + distal composite)
- 🖼️ Exportación de imagen PNG/JPG/SVG del odontograma (descargable; PNG/JPG rasterizado desde SVG vectorial)
- 🦷 Caries/subcaries como máquina de estados por superficie: una superficie cariada sin obturación se renderiza como caries primaria (opacidad por niveles ICDAS); en cuanto esa superficie tiene una obturación, se renderiza como caries recurrente (capa `subcaries-{surface}`, puntuada con CARS) — ambas nunca están activas a la vez en la misma superficie
- 🎯 Severidad unificada por superficie (`cariesSeverity`, 0–6, sustituye los antiguos campos separados de profundidad ICDAS + CARS): se lee como profundidad ICDAS en una superficie primaria y como puntuación CARS con nombre (Sana … Cavidad extensa) en una recurrente, mediante un popup contextual que muestra solo la escala relevante para el estado actual de la superficie
- 🌱 Caries radicular (`rootCaries`: none / active / arrested / active-cavitated), que activa la capa de ilustración dedicada de caries radicular con una opacidad según la severidad (active 0.5 / arrested 0.7 / active-cavitated completa)
- 📡 Profundidad radiográfica de caries (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 por superficie), independiente de la escala visual ICDAS/CARS, mostrada como una insignia y recuperable mediante su propia Observation FHIR
- 🎚️ Tres ajustes de granularidad de caries (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) más un interruptor `cariesDepthEnabled`, que reducen cada escala a una vista de selector más simple sin perder el valor almacenado
- 🩹 Línea de resumen de subcaries en el panel de obturaciones: lista, debajo de los controles de obturación, cualquier diente seleccionado con caries recurrente y sus superficies (p. ej. "36 (O) tiene subcaries junto a su obturación.")
- 🪛 Defectos de obturación por superficie (`fillingDefect`: none / marginal / fracture / wear) en restauraciones directas, independientes de la caries recurrente — se registran mediante un indicador por superficie en la tarjeta de Obturaciones (espejo del indicador de profundidad de caries, con su lista de opciones apilada verticalmente), se renderizan en el odontograma y se muestran en el tooltip y en el resumen de obturaciones de toda la boca con una etiqueta explícita (p. ej. "36 (O) – Defecto de obturación: O: marginal"), igual que la caries recurrente se etiqueta en la línea de Caries; la tarjeta de Obturaciones también muestra una nota para cualquier diente seleccionado con un defecto de obturación registrado (p. ej. "En 36 hay un defecto de obturación registrado."), en paralelo a la nota de subcaries ya existente
- 🦷💥 Desgaste dental tipificado por causa clínica y localización (`wearEdge`: none / attrition / erosion, incisal/oclusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical) — sustituye los dos indicadores on/off de desgaste por bruxismo; se registra mediante dos menús desplegables en la fila de desgaste, reutiliza el arte existente y se muestra en el tooltip y en una nueva sección de resumen "Desgaste" de toda la boca
- 🎨 Decoloración dental por causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) en dientes permanentes y temporales — tiñe la corona natural mostrada con un color representativo cuando el diente no tiene restauración y su sustrato es natural; se muestra en el tooltip y en una nueva sección de resumen "Decoloración" de toda la boca; completa el conjunto de condiciones de superficie y estructurales junto con los defectos de obturación y el desgaste
- ✏️ Los dientes anteriores (incisivos/caninos) rotulan su superficie oclusal como "incisal" en toda la interfaz (selector, popup, resúmenes); la clave de superficie almacenada sigue siendo `occlusal`
- 🔤 Notación de superficie según la posición del diente (Ajustes → Detalles del diente → "Notación de superficie", simple/completa, por defecto completa): en modo completo, la letra y la etiqueta de superficie de caries/obturación siguen la anatomía dental — oclusal → I/incisal en dientes anteriores, bucal → L/labial en dientes anteriores, lingual → P/palatino en dientes superiores y L/lingual en dientes inferiores (mesial/distal/subcoronal no cambian); el modo simple usa siempre el conjunto genérico B/M/O/D/L/SC, sin importar la posición del diente. Se aplica al resumen de toda la boca y a ambos selectores de superficie (caries y defecto de obturación), tanto la letra como el texto; la clave de superficie almacenada no se ve afectada
- 🦷↕️ Registro ortodóntico por diente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) en un diente natural presente (permanente o temporal) — reutiliza el arte ortodóntico inactivo de la v2.5.0 (sin SVG nuevo); se muestra en el gráfico, en el tooltip y en una nueva sección de resumen "Ortodoncia" de toda la boca
- 🪨 Cálculo, y reabsorción radicular tipificada como interna o cervical externa (`resorptionType`)
- 📏 Profundidad de caries por superficie (superficial / dentina / profunda), o puntuación ICDAS II opcional (0–6) con `enableIcdas`
- 🩹 Indicador de filtración marginal de corona, visible solo con una restauración de corona o puente
- 🧬 Codificación diagnóstica basada en estándares (WHO ICD-10, siempre activa): cada hallazgo registrado deriva un diagnóstico codificado en ICD-10 — caries (K02), caries radicular/del cemento y caries detenida (K02.2/.3), pulpitis y necrosis pulpar (K04.0/.1), periodontitis apical, absceso periapical y quiste radicular (K04.4–.9), atrición/abrasión/erosión/abfracción (K03.0–.8), cálculo (K03.6), reabsorción (K03.3), decoloración (K00.3/K00.8/K03.7), pérdida dental (K08.1), resto radicular (K08.3) y fractura dental (S02.5) — que se muestra en el tooltip y en el resumen de toda la boca, y se exporta como FHIR Conditions.
- 🩺 Tarjeta de Diagnósticos por diente: consulta los diagnósticos ICD-10 derivados de un diente y edítalos — suprime uno derivado incorrectamente o añade uno que el odontograma no representa. El conjunto efectivo (derivados − suprimidos + añadidos) determina la exportación FHIR.
- 🗺️ Condiciones de caso / regionales: registra diagnósticos de toda la boca no ligados a un diente concreto — maloclusión y trastornos de la ATM (K07), quistes orales (K09), enfermedades de las glándulas salivales (K11), estomatitis y mucosa oral (K12/K13), y anomalías del desarrollo a nivel de arcada (K00) — cada una lateralizable opcionalmente (izquierda / derecha / bilateral).
- 🌍 Paquetes de codificación nacionales (Ajustes → Codificación de diagnóstico): superpone un sistema de códigos nacional sobre la base WHO ICD-10 — BNO-10 (húngaro, con etiquetas localizadas; conserva el código WHO) o US ICD-10-CM (códigos remapeados, p. ej. el rango dentofacial K07 → M26). Añadir el paquete de otro país es una pequeña entrada `CodingPack` — consulta `CODING_PACKS.md`.
- 🔬 Superposición SNOMED CT (Ajustes → SNOMED CT, opcional, desactivada por defecto): añade una codificación SNOMED CT junto a la del WHO y la de cualquier paquete nacional, y codifica los hallazgos periimplantarios que no tienen código WHO ICD-10. Los ID de concepto ICD-10-CM y SNOMED son de referencia/mejor esfuerzo — verifícalos con la lista tabular oficial de ICD-10-CM / el navegador de SNOMED CT antes de su uso clínico.
- 🔁 Ida y vuelta de FHIR Condition: los diagnósticos se exportan como recursos FHIR `Condition` (vinculados a un diente, más condiciones de caso a nivel de paciente con un `bodySite` de lateralidad) junto a las Observations, y la importación los reconstruye — las condiciones de caso directamente, y las anulaciones de añadir/suprimir por diente comparando las Conditions importadas con el odontograma re-derivado.
- 🧰 Barra superior unificada de iconos con un modal de Ajustes por pestañas (General / Paneles / Detalles del diente / Caries / Pulpa / Notas / Periodontal — numeración, notas, visibilidad de paneles, ICDAS, interruptor de profundidad de caries, granularidad de caries radicular/radiográfica, nivel de detalle pulpar, nivel de detalle de desgaste/decoloración dental, información dental)
- 🗂️ Ajustes → pestaña "Paneles": muestra/oculta de forma independiente los paneles de resumen de Estados y de Ortodoncia
- 🦷🩺 Ajustes → pestaña "Periodontal": 16 interruptores de mostrar/ocultar por índice para las filas del odontograma periodontal (agrupados en bolsa/higiene/mucogingival/soporte/periimplantario — PD/GM/CAL/BOP, placa, PI, GI, visibilidad de CEJ, concavidad radicular, KG, GT, furca, movilidad, clase de Miller, mPI, mBI), cada uno con su propia descripción, más una opción de nombre de índice traducido frente a canónico (canónico = un nombre científico fijo en inglés/latín en todos los idiomas de la interfaz; los tooltips siempre permanecen localizados con independencia de este ajuste). Ambas son preferencias a nivel de aplicación (como `perioViewMode`) — nunca forman parte de la carga de exportación
- 🩹 El control de caries secundaria (CARS) se fusionó en la pestaña de Ajustes de Caries, colocado encima de Profundidad radiográfica (se retira la pestaña separada "Caries secundaria")
- 🎚️ Nivel de detalle dental: un ajuste simple/complejo para el desgaste dental y la decoloración (Ajustes → Detalles del diente). El modo simple muestra un interruptor sí/no por hallazgo (desgaste activado → attrition/abrasion, decoloración activada → other); el modo complejo (por defecto) conserva los menús desplegables de tipo/causa, y el valor almacenado se conserva al cambiar de nivel
- 📋 Panel de información dental: resumen de texto en vivo de todo el odontograma (recuentos de dientes, listas presentes/ausentes, caries incl. secundaria, obturaciones, endodoncias, prótesis, implantes, estado periodontal) — visible por defecto, conmutable en Ajustes
- 🗂️ Menú de exportación unificado (Estado JSON / FHIR / PNG / JPG)
- 📥 Menú de importación con importación FHIR (recupera Bundles exportados)
- ⏳ Superposición de progreso durante la exportación de imagen
- 🎓 Tour interactivo de introducción de 12 pasos
- 🔢 Tres sistemas de numeración (FDI, Universal, Palmer)
- 🌐 I18n — 12 idiomas de interfaz (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) con selector de idioma; el árabe muestra la interfaz de derecha a izquierda, con los odontogramas periodontal y dental fijados de izquierda a derecha (AR/ZH/FR son traducciones automáticas, pendientes de revisión por hablantes nativos)
- 🌗 Modo oscuro con botón de alternancia (independiente o controlado por la aplicación principal)
- 🎨 Configuración de tema personalizado (prop `themeConfig`) con CSS custom properties (`--odon-*`)
- 📱 UX táctil móvil: popover de zoom al tocar, menú contextual con pulsación larga, zoom con pellizco, áreas táctiles WCAG 44px, navegación por arcada
- 🔌 Sistema de plugins SVG personalizados: superposiciones visuales, estado personalizado por diente, soporte de exportación/importación JSON — la salida de `renderSvg()` de los plugins se sanea con DOMPurify (perfil SVG) antes de insertarse en el odontograma en vivo; los plugins siguen ejecutándose como código de confianza, así que solo deben cargarse desde fuentes fiables
- 🛡️ Content-Security-Policy: la compilación de producción de la demo inyecta una etiqueta meta de CSP (el servidor de desarrollo no se ve afectado) — las aplicaciones anfitrionas que integren el componente deben establecer su propia CSP
- ⚠️ Validación de estado con advertencias para combinaciones incompatibles
- 🏷️ Tooltip automático de estado en las losetas dentales (muestra todos los estados activos)
- 🩺 Tooltip por diente y panel de resumen de toda la boca modernizados: ambos muestran el conjunto completo de hallazgos clínicos (diagnóstico pulpar/apical + subtipo de lesión, reabsorción radicular, estado periimplantario, caries radicular graduada, cálculo, filtración marginal de corona, fractura, pérdida de contacto, desgaste tipificado incisal/oclusal y cervical), con una sección "Diagnósticos" dedicada, una sección "Desgaste" dedicada en el panel y un calificador de gravedad de caries de grano grueso (superficial/moderada/profunda)
- ♿ Accesibilidad por teclado (WCAG): roles ARIA listbox/option, selección con Enter/Espacio, navegación con flechas, contornos focus-visible
- 🔒 Modo solo lectura: desactivar todas las interacciones para vistas de impresión/informes
- ✨ Animaciones de selección: borde punteado pulsante y sombra brillante en los dientes seleccionados (compatible con prefers-reduced-motion)
- 📝 Notas por diente: doble clic para añadir/editar notas, icono de nota junto al número de diente, tooltip con texto de nota, una línea "Notas individuales" en el panel de resumen de toda la boca, inclusión en el informe PDF, exportación/importación JSON
- 🔀 División de odontograma Estado ↔ Plan: un selector `Estado | Plan` en la cabecera del odontograma alterna entre un odontograma de **estado** actual y un odontograma de **plan** (tratamiento propuesto), cada uno con sus propios estados por diente; el odontograma de plan se inicia como copia del de estado la primera vez que se cambia a él, y las ediciones en uno nunca afectan al otro. La exportación/importación (`exportStatus`/`exportFhir`/importación de archivo) siempre operan sobre el odontograma de estado; el odontograma de plan se lee/escribe por separado mediante su propia API (ver API pública más abajo) y — cuando difiere del estado — se incluye como sección adicional `plan` en la exportación JSON
- 📝 Cuadro "Qué cambia": cuando el plan difiere del estado actual, un cuadro bajo el panel de información dental enumera cada diferencia por diente y por eje de tratamiento (presencia, sustrato, restauración, prótesis, corona planificada, ortodoncia, pulpa/endo, apical) como una línea `diente: eje  de → a`; también disponible mediante programación a través de `getPlanChanges()`

![Odontograma periodontal de boca completa — español](screenshot_es_perio.png)

- 🩺 Registro periodontal: **profundidad de sondaje**, **margen gingival** y **sangrado al sondaje** (+ supuración) por sitio, en los seis sitios estándar de cada diente, con un **nivel de inserción clínica derivado (CAL = PD + margen gingival)**, recesión y **%BOP** de toda la boca. Un **odontograma periodontal gráfico de boca completa** — cada arcada se dibuja como **dos SVG independientes, bucal y palatino/lingual** (reutilizando el arte dental con una orientación uniforme de corona hacia la banda en ambos aspectos; un **gráfico de implante** para los dientes con implante) con una **línea CEJ** roja, una **cuadrícula numerada en milímetros** y una **curva de margen gingival/profundidad de bolsa** sobre los dientes, dividida por una **banda central de índices periodontales** (etiquetada `▲ Buccal … Lingual/Palatal ▼`) que agrupa los índices compartidos por diente — la **clase de Miller** en la parte superior, y **Placa/PI/GI/mPI/mBI** representados como una **loseta romboidal anatómica** por diente (vértice bucal arriba, vértice lingual abajo, mesial/distal de la fila central intercambiados según el lado para que mesial siempre apunte hacia la línea media de la arcada); las filas numéricas (con los nombres completos de los índices — PD/GM/CAL/BOP + movilidad + furca — en celdas más grandes y táctiles) alineadas en columnas, y un resumen (PD/CAL promedio, %BOP, %PI), con entrada por **avance automático de teclado**; el odontograma **se escala dinámicamente para llenar el ancho disponible**, siendo responsivo en cualquier tamaño de ventana. Se presenta como un **selector de vista** `Odontogram | Periodontal Status`, cuyo panel derecho se reconvierte en una **barra lateral de contexto periodontal** (datos del paciente, la clasificación de 2017 y el resumen de toda la boca) mientras esa vista está activa (una opción de Ajustes permite volver a toda la presentación como **ventana emergente**), y sigue siendo un **componente invocable por separado** (exportación `PerioChart`) para que una aplicación anfitriona pueda abrir el odontograma periodontal de forma independiente del odontograma base. Exportación **FHIR** por sitio mediante el panel periodontal LOINC (`74029-0`; PD `32910-2`, recesión `32911-0`, CAL `32912-8`)
- 🅿️ Estilo de propuesta: en el modo Plan, los hallazgos que el plan **añade** respecto al estado actual (corona planificada, extracción, movimiento ortodóntico, prótesis, …) se renderizan con un **contorno "propuesto" distintivo, punteado y con tinte**, de modo que el plan se lea como intención y no como hecho — con una leyenda "punteado = propuesto" en la tarjeta del odontograma. El renderizado en modo Estado es idéntico byte a byte; el tratamiento visual es exclusivo del plan y se restablece por completo al volver al estado
- 🚦 Restricción del modo Plan: el odontograma de Plan solo muestra lo que un dentista puede *hacer* — el selector base ofrece únicamente Ausente / Permanente / Implante, y los hallazgos de solo estado (caries, desgaste dental, decoloración, y todo el bloque periodontal — movilidad, cuadrícula de sondaje de seis sitios, modificadores de inflamación/periodontales, cálculo, estado periimplantario) quedan ocultos; el control de pulpa/endo conserva el **tratamiento** endodóntico (conducto / poste / apicectomía / pin parapulpar) mientras oculta el **diagnóstico** pulpar/apical y la reabsorción radicular. La restauración, la prótesis, la ortodoncia, la necesidad/reemplazo de corona y el plan de extracción siguen siendo planificables
- 🧪 Una amplia suite de pruebas automatizadas de Vitest para numeración, traducciones, plantillas, i18n, componente App, tema, táctil, plugins, accesibilidad y paridad de ejes clínicos/diagnósticos
- 📖 Documentación API TypeDoc con comentarios JSDoc en todas las exportaciones públicas (`npm run docs`)

### 📦 Módulos
- 🦷 Cuadrícula del odontograma e interfaz de mosaicos dentales
- 🎛️ Panel de controles y estado
- 🎨 Motor de capas SVG y plantillas
- 🔢 Numeración dental y mapeo de etiquetas (FDI/Universal/Palmer)
- 🌐 Localización — 12 idiomas de interfaz (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), incluyendo árabe (RTL)
- 💾 Exportación/importación de estado
- 📋 Extras de estado: plantillas de restauración predefinidas
- 🎨 Configuración de tema: paleta de colores personalizable mediante propiedades CSS `--odon-*`
- 📱 Interacciones táctiles móviles (zoom al tocar, pulsación larga, zoom con pellizco, alternador de arcada)
- 🔌 Sistema de plugins SVG personalizados
- ⚠️ Sistema de validación de estado y tooltips
- ♿ Accesibilidad por teclado y soporte ARIA
- 🔒 Modo solo lectura
- ✨ Animaciones de selección
- 📝 Notas por diente
- 🧪 Suite de pruebas automatizadas (Vitest + Testing Library)

### 🛠️ Controles de interfaz

**🔝 Barra superior:**
- Selector de idioma (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR desplegable)
- Botón de modo oscuro (icono sol/luna, alterna entre tema claro y oscuro)
- Selector de sistema de numeración (FDI/Universal/Palmer desplegable)
- Botones Exportar estado / Importar estado

**📊 Encabezado del gráfico:**
- Alternador de vista oclusal
- Alternador de visibilidad de muelas del juicio
- Alternador de visibilidad de hueso
- Alternador de visibilidad de pulpa
- Botón borrar selección

**🔍 Filtros de selección:**
- Seleccionar todos / Todos presentes / Permanentes / De leche / Implantes / Todos ausentes
- Superior / Superior 6 frontales / Molares superiores
- Inferior / Inferior 6 frontales / Molares inferiores

**📋 Estados predefinidos:**
- Restablecer todo (restablecer boca)
- Dentición primaria
- Dentición mixta
- Edéntulo alternador

**📦 Desplegable de extras de estado:**
- Puentes de circonio superiores/inferiores (12-22, 13-23, 16-26, arco completo)
- Puentes metálicos superiores/inferiores (12-22, 13-23, 16-26, arco completo)
- Prótesis parciales removibles superiores/inferiores
- Prótesis completas removibles superiores/inferiores
- Prótesis con barra superiores/inferiores con implantes

**🦷 Panel editor de diente** (para el diente/dientes seleccionados, agrupado en tarjetas colapsables):
- **Fila base:** selección de diente (tipo base incl. variantes de corona fracturada) y sustrato dental (natural/radix/fracturado/preparación de corona)
- **Fila de restauración:** el menú desplegable combinado de restauración "Fix: …" / "Kivehető: …" (opciones fijas `restorationType`×`restorationMaterial` más las opciones de anclaje/removible de `prosthesis`, condicionadas por el tipo de diente); casilla de filtración marginal de corona (solo corona/puente); casillas de ubicación de corona fracturada; interruptores de corona necesaria / reemplazo de corona necesario
- **Fila de desgaste y decoloración:** menú desplegable de tipo de desgaste incisal/oclusal, menú desplegable de tipo de desgaste cervical, menú desplegable de causa de decoloración (cada uno cambia a un interruptor simple sí/no en Ajustes → Detalles del diente → modo simple)
- **Tarjeta de ortodoncia:** aparato, desplazamiento mesial/distal, movimiento vertical (extrusión/intrusión), interruptor de rotación — visible en un diente natural presente
- **Tarjeta de caries:** menú desplegable de modo de profundidad de caries, casilla de caries subcoronal, menú desplegable de severidad de caries radicular, y el selector de caries por superficie B/M/O/D/L con un popup contextual de profundidad ICDAS/CARS y una insignia de profundidad radiográfica
- **Tarjeta de obturaciones:** menú desplegable de material de obturación, selector de obturación por superficie (con material por superficie), indicador de defecto de obturación por superficie (marginal/fractura/desgaste), notas de subcaries y de defecto de obturación
- **Tarjeta de raíz y periodonto:** selector combinado "Estado pulpar / endo", selector de diagnóstico apical, selector de subtipo de lesión periapical (solo periodontitis apical sintomática/asintomática), selector de tipo de reabsorción radicular, selector de grado de movilidad, selector de estado periimplantario (solo implantes)
- **Indicadores especiales:** plan/herida de extracción, espacio cerrado, sellado de fisuras, pérdida de punto de contacto, cálculo, pin parapulpar, resección endodóntica, pilar de puente

### 🦷 Tipos de dientes y estados

**Selección de diente (tipo base):**
| Valor | Descripción |
|---|---|
| `none` | Diente ausente |
| `tooth-base` | Diente permanente |
| `milktooth` | Diente primario (deciduo) |
| `implant` | Implante dental |
| `tooth-under-gum` | Diente subgingival (no erupcionado) |

**Variantes de diente fracturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Sustrato dental (dientes permanentes):**
`natural` (predeterminado), `radix` (resto radicular), `broken`, `crownprep` (preparado para corona)

**Tipo de restauración (dientes permanentes):**
`none`, `crown`, `inlay`, `onlay` (solo vista oclusal), `veneer`, `bridge`

**Material de restauración (dientes permanentes):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (las coronas `metal` heredadas migran aquí), `telescope`, `temporary`

**Las opciones de restauración están condicionadas por el tipo de diente** (`restorationOptions()` en `src/registry/restorations.ts`): un implante solo ofrece los tipos de restauración `crown`/`bridge` (compuestos con una capa de conector de implante) más las cinco entradas de anclaje `prosthesis` descritas abajo; un diente ausente/hueco solo ofrece un póntico `bridge` más las dos entradas de prótesis removible de `prosthesis`; un sustrato `radix` oculta por completo el control de restauración. Los campos planos heredados `crownMaterial`/`bridgeUnit` (valores de anclaje de implante/puente previos a v1.14) se retiran del modelo activo — solo se aceptan como ruta de migración de solo lectura para payloads antiguos.

**Prótesis** (`prosthesis`; eje ortogonal removible/de anclaje, mostrado como entradas "Kivehető:" en el menú desplegable combinado de restauración):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (anclajes de implante, con o sin sobredentadura), `removable-partial`, `removable-full` (prótesis soportadas por dientes en un diente ausente/hueco). Un diente tiene una restauración fija o una prótesis, nunca ambas — establecer una borra la otra.

**Filtración marginal de corona** (`crownLeakage`; booleano): solo se muestra cuando `restorationType` es `crown` o `bridge`; activa la capa de ilustración `crown-leakage`.

**Opciones endodónticas (dientes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opciones endodónticas (dientes de leche):**
`none`, `endo-medical-filling`

`endo` y `pulpDx` se presentan mediante un único `<select>` combinado "Estado pulpar / endo" (agrupado: pulpa vital vs. tratada/endo) y son mutuamente excluyentes — elegir una opción tratada (`endo` distinto de `none`) restablece `pulpDx` a `normal`, y elegir un diagnóstico pulpar restablece `endo` a `none`.

**Materiales de obturación (dientes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiales de obturación (dientes de leche):**
`composite`, `gic`, `temporary`

**Superficies de obturación/caries:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo caries)

**Modificaciones:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesión periapical** (`periapicalType`; califica el glifo periapical, solo se muestra bajo periodontitis apical sintomática/asintomática):
`none`, `granuloma`, `cyst` — opciones del selector; el valor heredado `abscess` sigue aceptándose/almacenándose pero ya no se ofrece en el selector, por ser redundante con el diagnóstico apical. Al importar se descarta: se incorpora a `apicalDx` si el diente tiene el modificador de inflamación, o se limpia a `none` en caso contrario

**Diagnóstico pulpar** (terminología AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (renderiza un glifo reducido), `irreversible-pulpitis`, `necrosis` — mutuamente excluyente con `endo`; se normaliza a `normal` en un diente con tratamiento de conducto

**Diagnóstico pulpar, latín práctico** (`pulpLatin`; el selector de pulpa solo lo muestra cuando `pulpDetailLevel` es `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Nivel de detalle pulpar** (`pulpDetailLevel`, ajuste global): `simple`, `aae` (por defecto), `latin` — controla el vocabulario que ofrece el selector de pulpa

**Diagnóstico apical** (`apicalDx`; determina el glifo periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo de reabsorción radicular** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Estado periimplantario** (`periImplant`; solo implantes, clasificación del World Workshop 2018): `mucositis` reutiliza el glifo gingival periodontal; `peri-implantitis-*` añade la capa `peri-implant-bone-loss` con opacidad graduada por severidad (leve 0.4 / moderada 0.7 / severa 1.0). Los implantes ya no renderizan el glifo de lesión periapical (su inflamación se expresa mediante este eje), y las casillas de modificadores inflamación/periodontal quedan ocultas en los implantes:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Severidad de caries** (`cariesSeverity`; campo unificado por superficie, `0`–`6`): en una superficie sin obturación se lee como escala de profundidad ICDAS (`superficial` / `dentin` / `deep`, o los códigos ICDAS II sin procesar `0–6` cuando `enableIcdas` está activado) y renderiza la capa primaria `caries-{surface}`; en una superficie con obturación se lee como una puntuación CARS con nombre (`0` sana … `6` cavidad extensa) y renderiza en su lugar la capa `subcaries-{surface}` (caries recurrente) — una superficie nunca es primaria y recurrente a la vez

**Caries radicular** (`rootCaries`; activa la capa de ilustración `caries-root` en un diente presente, con opacidad según la severidad — `active` 0.5 / `arrested` 0.7 / `active-cavitated` completa):
`none`, `active`, `arrested`, `active-cavitated`

**Profundidad radiográfica de caries** (`radiographicDepth`; por superficie, independiente de la escala visual ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Ajustes de granularidad de caries** (globales): `secondaryCariesMode` (`simple`/`standard`/`full`, por defecto `standard`), `rootCariesMode` (`simple`/`severity`, por defecto `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, por defecto `off`), `cariesDepthEnabled` (booleano, por defecto `true`) — cada uno reduce su escala a una vista de selector más simple sin alterar el valor almacenado

**Indicadores especiales:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Desgaste dental** (`wearEdge`, `wearCervical`; tipo clínico por localización, condicionado a diente natural + sin restauración + sustrato natural; renderizan las capas existentes `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Decoloración** (`discoloration`; causa por diente, condicionada a un diente natural (permanente o temporal) sin restauración y sustrato natural; tiñe el relleno de la corona natural mostrada — sin SVG nuevo):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Defecto de obturación** (`fillingDefect`; por superficie, hallazgo de restauración directa independiente de la caries recurrente — condicionado a las superficies presentes en `fillingSurfaceMaterials`; renderiza la capa de ilustración `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; por diente, condicionado a un diente natural presente — permanente o de leche):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glifo de flecha hacia arriba), `intrusion` (glifo de flecha hacia abajo) — `orthoRotation`: booleano

**Ajustes de detalle / notación dental** (ajustes de sesión globales, Ajustes → Detalles del diente): `wearDetailLevel` y `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, por defecto `complex` — el modo simple muestra un interruptor sí/no en lugar del menú desplegable completo de tipo/causa, sin alterar el valor almacenado) y `surfaceNotation` (`simple`/`full`, por defecto `full` — controla si las letras/etiquetas de superficie de caries/obturación son sensibles a la posición del diente; ver "Notación de superficie según la posición del diente" arriba)

### ⚙️ Ajustes
Se abre desde el icono de engranaje de la barra superior; un `dialog` ARIA con foco atrapado y diseño por pestañas (Esc/clic en el fondo para cerrar, flechas para cambiar de pestaña). Todos los ajustes son solo estado de UI a nivel de sesión, salvo que se indique lo contrario — ninguno modifica los datos por diente ni el payload de exportación.

- **General:** sistema de numeración (FDI/Universal/Palmer), idioma, tema claro/oscuro, visibilidad del panel de información dental
- **Odontograma:** perfil de anatomía dental (`classic` por defecto / `measured`) — `measured` representa nueve plantillas dentales medidas según la literatura en una disposición de dos arcadas con ancho por diente; conmutable en tiempo de ejecución, sin efecto sobre el valor por defecto `classic`
- **Paneles:** muestra/oculta de forma independiente la tarjeta de resumen de Estados de toda la boca y la tarjeta de Ortodoncia (ambas visibles por defecto)
- **Detalles del diente:** nivel de detalle de desgaste y nivel de detalle de decoloración (simple/complejo, ambos por defecto complejo), notación de superficie (simple/completa, por defecto completa)
- **Caries:** interruptor de puntuación ICDAS II (`enableIcdas`), interruptor de profundidad de caries (`cariesDepthEnabled`), granularidad de caries radicular (`rootCariesMode`: simple/severidad), granularidad secundaria/CARS (`secondaryCariesMode`: simple/estándar/completa), granularidad de profundidad radiográfica (`radiographicDepthMode`: desactivada/tresNiveles/detallada) — la antigua pestaña separada "Caries secundaria" se fusiona en esta, con el control CARS colocado justo encima de la profundidad radiográfica
- **Pulpa:** nivel de detalle pulpar (`pulpDetailLevel`: simple/AAE/latín práctico, por defecto AAE) — controla el vocabulario que ofrece el selector "Estado pulpar / endo"; al cambiarlo se actualiza en vivo el resumen de toda la boca y todos los tooltips abiertos
- **Notas:** activar/desactivar notas por diente (`enableNotes`)
- **Periodontal:** interruptores de mostrar/ocultar por índice para las 16 filas del gráfico periodontal (`perioRowVisibility`, por defecto todas visibles), agrupados en Bolsa (PD/GM/CAL/BOP) / Higiene (Placa/PI/GI) / Mucogingival (visibilidad de CEJ/Concavidad radicular/KG/GT) / Soporte (Furcación/Movilidad/Clase de Miller) / Periimplantario (mPI/mBI), cada fila con su propia descripción; además de un modo de nombre de índice traducido-vs-canónico (`perioIndexNameMode`: `translated` por defecto / `canonical` — un nombre científico fijo en inglés/latín mostrado en todos los idiomas de la interfaz). Preferencias solo a nivel de aplicación (refleja `perioViewMode`) — nunca se serializa, los tooltips permanecen localizados en ambos modos

### 🖼️ Sistema de plantillas SVG

**Plantillas dentales** (`src/assets/teeth-svgs/`):
| Plantilla | Dientes que la usan |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivos) |
| `13.svg` | 13, 23, 33, 43 (caninos) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolares) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molares) |

Las plantillas se rotan 180 grados para la mandíbula inferior y se reflejan horizontalmente para el lado izquierdo.

**SVGs de iconos** (`src/assets/icon-svgs/`):
`icon_8.svg` (muela del juicio), `icon_gum.svg` (hueso), `icon_no_selection.svg` (borrar), `icon_occl.svg` (vista oclusal), `icon_pulp.svg` (pulpa)

### 🔢 Sistemas de numeración

**FDI (ISO 3950):** Dientes adultos 11-18, 21-28, 31-38, 41-48. Dientes primarios 51-55, 61-65, 71-75, 81-85.

**Universal (EE.UU.):** Dientes adultos numerados 1-32. Dientes primarios con letras A-T.

**Palmer (Zsigmondy-Palmer):** Formato cuadrante + posición (ej. UR-1, LL-5). Dientes primarios usan letras A-E por cuadrante.

### 🚀 Uso
Desarrollo:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Vista previa:
```bash
npm run preview
```

### 🔗 Integración
El componente se puede integrar en cualquier aplicación React.
Ejemplo:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="es"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integración del modo oscuro:**
- **Modo independiente:** Omitir la prop `darkMode` — el componente gestiona su propio estado de tema a través del botón en la barra superior y añade/elimina la clase `.dark` en `<html>`.
- **Modo controlado:** Pasar `darkMode` y `onDarkModeChange` — la aplicación principal controla el tema. El botón de alternancia sigue apareciendo pero llama a `onDarkModeChange` en lugar de gestionar el estado interno. La aplicación principal es responsable de añadir/eliminar la clase `.dark` en `<html>`.

**Tema personalizado:**
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

**Integración de plugins:**
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

// Establecer el estado del plugin para un diente:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Pruebas
```bash
npm run test           # Ejecutar la amplia suite de pruebas automatizadas de Vitest
npm run test:watch     # Modo watch
npm run test:coverage  # Informe de cobertura
```

### 📖 Documentación API
```bash
npm run docs           # Generar documentación TypeDoc en docs/
```

### 📡 API pública

**Props del componente:**

| Prop | Tipo | Predeterminado | Descripción |
|---|---|---|---|
| `language` | `string` | `'hu'` | Idioma de la UI (hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr) |
| `onLanguageChange` | `(lang) => void` | — | Callback cuando cambia el idioma |
| `numberingSystem` | `string` | `'FDI'` | Sistema de numeración (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback cuando cambia la numeración |
| `darkMode` | `boolean` | `undefined` | Estado del modo oscuro. Omitir para modo independiente. |
| `onDarkModeChange` | `(dark) => void` | — | Callback al alternar modo oscuro. Requerido para modo controlado. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Personalización de colores mediante CSS custom properties (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugins SVG personalizados para superposiciones visuales y estado personalizado por diente. |
| `readOnly` | `boolean` | `undefined` | Desactivar todas las interacciones (clic, táctil, teclado). Útil para vistas de impresión/informes. |
| `enableNotes` | `boolean` | `undefined` | Activar notas por diente. Doble clic en un diente para añadir/editar notas. |

**Funciones exportadas para control externo:**

| Función | Descripción |
|---|---|
| `initOdontogram()` | Inicializar el motor y renderizar todos los dientes |
| `destroyOdontogram()` | Limpiar el motor y eliminar los event listeners |
| `setNumberingSystem(system)` | Cambiar entre FDI, Universal, Palmer |
| `clearSelection()` | Deseleccionar todos los dientes |
| `setOcclusalVisible(on)` | Alternar vista oclusal on/off |
| `setWisdomVisible(on)` | Mostrar/ocultar muelas del juicio |
| `setShowBase(on)` | Mostrar/ocultar capa de hueso |
| `setHealthyPulpVisible(on)` | Mostrar/ocultar pulpa sana |
| `registerPlugins(plugins)` | Registrar plugins SVG personalizados |
| `setPluginState(toothNo, pluginId, value)` | Establecer estado personalizado del plugin para un diente |
| `getPluginState(toothNo, pluginId)` | Obtener estado personalizado del plugin de un diente |
| `getToothStateSummary(toothNo)` | Obtener resumen localizado de todos los estados activos |
| `getOdontogramSummary()` | Obtener un resumen de texto estructurado y localizado de todo el odontograma (recuentos, secciones) |
| `onStateChange(callback)` | Suscribirse a los cambios de estado; devuelve una función para cancelar la suscripción |
| `setReadOnly(value)` | Activar/desactivar modo solo lectura |
| `getReadOnly()` | Obtener estado actual de solo lectura |
| `setNotesEnabled(value)` | Activar/desactivar notas por diente |
| `getNotesEnabled()` | Obtener estado actual de notas |
| `setPulpDetailLevel(level)` | Definir el vocabulario del selector de pulpa — `"simple"`, `"aae"` o `"latin"` |
| `getPulpDetailLevel()` | Obtener el nivel de detalle pulpar actual |
| `getChartMode()` | Obtener el odontograma actualmente activo — `"status"` o `"plan"` |
| `setChartMode(mode)` | Cambiar el odontograma activo a `"status"` o `"plan"`; el odontograma de plan se copia del de estado la primera vez que se activa |
| `getStatusChart()` | Obtener el payload del odontograma de estado (`{version, globals, teeth}`), independientemente de cuál esté activo |
| `getPlanChart()` | Obtener el payload del odontograma de plan (`{version, globals, teeth}`), independientemente de cuál esté activo |
| `setPlanChart(payload)` | Reemplazar los dientes del odontograma de plan a partir de un payload (el estado no se modifica); marca el odontograma de plan como inicializado |
| `getPlanChanges()` | Obtener el diff estructurado estado→plan (`{ toothNo, axis, from, to }[]`) — una entrada por diente y por eje de tratamiento que difiere entre los odontogramas de estado y de plan; vacío cuando no hay plan. También expuesto en `getOdontogramSummary()` como `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Establecer los datos periodontales de uno de los seis sitios (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` nulo/`<1` descarta el registro del sitio. Valida y limita los valores (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Obtener el registro periodontal por sitio de un diente (solo los sitios registrados) |
| `getToothCal(toothNo)` | Obtener el CAL derivado por sitio (`pd + margen gingival`) de un diente |
| `getPerioSummary()` | Agregados periodontales de toda la boca: recuento de sitios registrados, recuento de sangrado, %BOP, peor CAL, PD máxima |
| `getPerioChart()` | Obtener los registros periodontales por diente del odontograma activo |
| `PerioChart` | Componente React (exportación con nombre) — la superposición del odontograma periodontal de boca completa (`{ open, onClose }`), montable de forma independiente de `OdontogramShell` para integración con la aplicación anfitriona |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Abrir/cerrar/consultar programáticamente la superposición del odontograma periodontal — permite que una aplicación anfitriona invoque el odontograma periodontal por separado del odontograma base (estado de caso compartido) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Obtener/definir cómo se presenta el odontograma periodontal — `"toggle"` (un selector de vista `Odontogram \| Dental Chart`, predeterminado) o `"popup"` (la superposición) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Obtener/definir la superposición de resaltado del odontograma dental — `"none"` (predeterminado) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; repinta los dientes según esa medida (solo visualización sobre los datos existentes) |
| `getToothRecessionType(toothNo)` | Obtener el **tipo de recesión de Cairo** derivado — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (calculado a partir del CAL interproximal frente al bucal del diente) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Visibilidad de la CEJ por diente — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Concavidad de la superficie radicular por diente — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Grado del Índice de Placa de Silness-Löe por superficie — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Grado del Índice Gingival de Löe-Silness por superficie — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Ancho de encía queratinizada bucal por diente, en mm — `0`-`15`, o `null` si no está registrado |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Fenotipo de grosor gingival por diente — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Clase de recesión de Miller por diente — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Solo implantes — grado del Índice de Placa modificado de Mombelli (mPI) por superficie — `0`-`3`; no hace nada en un diente que no sea implante |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Solo implantes — grado del Índice de Sangrado del Surco modificado de Mombelli (mBI) por superficie — `0`-`3`; no hace nada en un diente que no sea implante |
| `furcationEntrances(toothNo)` | Las entradas de furca de un diente — `["mesial","distal","buccal"]` (molares superiores), `["buccal","lingual"]` (molares inferiores), `["mesial","distal"]` (primeros premolares superiores), si no `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Establecer/obtener la afectación de furca por entrada (Glickman `1`–`4`; `null` la borra) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Establecer/obtener la presencia de placa de O'Leary por superficie (mesial/distal/bucal/lingual); alimenta el %PI de toda la boca en `getPerioSummary()` |
| `getCaseMeta()` | Obtener el objeto de metadatos a nivel de caso (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — un único bloque compartido, no por diente ni de doble estado (refleja la clave `globals` del payload de nivel superior); alimenta la clasificación de estadificación/graduación periodontal y el encabezado del informe PDF |
| `setPatientName(v)` | Establecer el nombre del paciente del caso (recortado; una cadena vacía o `null` lo borra) — solo identidad, nunca se introduce en la derivación periodontal |
| `setPatientDob(v)` | Establecer la fecha de nacimiento del paciente del caso (`YYYY-MM-DD`; un valor inválido/vacío la borra) — identidad exclusiva del informe PDF |
| `setExamDate(v)` | Establecer la fecha de examen del caso (`YYYY-MM-DD`; un valor inválido/vacío lo borra) |
| `setCaseAge(v)` | Establecer la edad del paciente del caso en años — `0`-`120`, o `null` para borrarla |
| `setSmokingStatus(v)` | Establecer el estado de tabaquismo del caso — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Establecer los cigarrillos/día (solo relevante cuando el estado de tabaquismo es `"current"`) — `0`-`99`, o `null` para borrarlo |
| `setDiabetesStatus(v)` | Establecer el estado de diabetes del caso — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Establecer el % de HbA1c (solo relevante cuando el estado de diabetes es `"present"`) — `3.0`-`20.0` (un decimal), o `null` para borrarlo |
| `setToothLossPerio(v)` | Establecer los dientes perdidos por periodontitis — `0`-`32`, o `null` para borrarlo |
| `setMaxRblPercent(v)` | Establecer el % máximo de pérdida ósea radiográfica — `0`-`100`, o `null` para borrarlo |
| `resetCaseMeta()` | Restablecer el objeto de metadatos a nivel de caso a sus valores predeterminados vacíos |
| `getPerioClassification()` | Obtener la clasificación periodontal del World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnóstico/estadio/grado/extensión derivados de los datos periodontales registrados y los metadatos del caso, cada eje reemplazado por su anulación clínica cuando está definida (`derived` siempre expone los valores calculados sin modificar, `overridden` indica qué ejes fueron anulados) |
| `setDiagnosisOverride(v)` | Anular el diagnóstico periodontal derivado — `"health"` / `"gingivitis"` / `"periodontitis"`, o `null` para borrarlo (revertir al derivado) |
| `setStageOverride(v)` | Anular el estadio periodontal derivado — `"I"` / `"II"` / `"III"` / `"IV"`, o `null` para borrarlo (revertir al derivado) |
| `setGradeOverride(v)` | Anular el grado periodontal derivado — `"A"` / `"B"` / `"C"`, o `null` para borrarlo (revertir al derivado) |
| `setExtentOverride(v)` | Anular la extensión periodontal derivada — `"localized"` / `"generalized"` / `"molar-incisor"`, o `null` para borrarlo (revertir al derivado) |
| `exportFhir(options?)` | Exportar el odontograma como Bundle de colección HL7 FHIR R4 (descarga JSON). Referencia `{ subject }` opcional; si no, se incluye un Patient de marcador |
| `exportImage(format)` | Descargar el odontograma como imagen — `"png"` o `"jpg"` |
| `exportSvg()` | Descargar el odontograma como SVG escalable (vectorial) |
| `hasAnyPerioData()` | `true` si hay algún eje periodontal registrado en cualquier parte de la boca — determina la omisión automática de la exportación periodontal y desactiva los elementos del menú de exportación periodontal en un odontograma vacío |
| `exportPerioSvg()` | Descargar el odontograma periodontal completo (gráficos dentales + filas numéricas + clasificación de 2017) como un único SVG vectorial independiente, construido sin interfaz a partir del estado mediante `buildPerioSvg()` |
| `exportPerioImage(format)` | Descargar el odontograma periodontal como imagen rasterizada — `"png"` o `"jpg"` |
| `exportPdf(opts)` | Descargar un informe PDF nativo de jsPDF (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, cada sección opcional) — texto vectorial más imágenes rasterizadas del odontograma/odontograma periodontal; la sección de notas individuales se omite automáticamente cuando ningún diente tiene una nota, y las dos secciones periodontales se omiten automáticamente siempre que `hasAnyPerioData()` sea `false`, independientemente de `opts` |
| `importFhirBundle(input)` | Importar un Bundle FHIR R4 (objeto o cadena JSON) producido por este módulo |
| `setImportFormat(format)` | Definir el parser de la próxima importación — `"status"` o `"fhir"` |
| `startIntroTour()` | Iniciar el tour interactivo de introducción de 12 pasos |

### 💾 Persistencia de estado (localStorage)

Persistencia opcional (opt-in) en `localStorage` para el estado del caso del odontograma (`src/persistence.ts`, reexportado desde el punto de entrada del paquete). Desactivada por defecto — las integraciones existentes no se ven afectadas a menos que una aplicación anfitriona la active explícitamente, y debe llamarse **después** de que el odontograma se haya montado (la restauración repinta el DOM en vivo mediante `importStatus()`):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // por defecto: "react-advanced-odontogram"
  includePlan: true,          // también persiste el plan; por defecto: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Función | Descripción |
|---|---|
| `enablePersistence(options?)` | Restaura un caso previamente guardado (si existe) mediante `importStatus()`, y a partir de ahí guarda el estado en `localStorage` en cada cambio. Idempotente — llamarla de nuevo reemplaza la suscripción/opciones anteriores. **Debe llamarse después de que el odontograma se haya montado.** |
| `disablePersistence()` | Detiene la persistencia; la entrada guardada permanece intacta. |
| `clearPersistedState()` | Elimina la entrada guardada para la clave activa (o la predeterminada). |
| `isPersistenceEnabled()` | `true` mientras haya una suscripción a cambios de estado activa. |

**`PersistenceOptions`:**

| Campo | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | La clave de `localStorage`. |
| `includePlan` | `boolean` | `false` | También persiste el plan (el campo `plan` de la carga exportada). |
| `onError` | `(err: Error) => void` | — | Se invoca ante cualquier error de almacenamiento/análisis en lugar de `console.warn`. |

Notas: no se lee ni se escribe nada en `localStorage` a menos que se llame a `enablePersistence()`; un límite de tamaño de 4 MB omite un guardado demasiado grande (reportado vía `onError`/`console.warn`) en lugar de lanzar una excepción; cualquier fallo de almacenamiento/JSON —cuota excedida, un iframe restringido, datos guardados corruptos o no reconocidos, etc.— se captura y se reporta. Este módulo nunca lanza excepciones.

Nota: activar la persistencia restaura el caso guardado mediante `importStatus()`, lo que reemplaza el caso actual — incluyendo un plan en curso si el payload guardado no tiene ninguno. Active la persistencia al iniciar (justo después del montaje), no a mitad de sesión.

Nota: el payload persistido puede incluir datos identificativos del paciente (nombre del paciente, fecha del examen) en texto plano en `localStorage`. Si registra dichos datos, asegúrese de contar con protección a nivel de dispositivo o bórrelos con `clearPersistedState()` cuando corresponda.

### 💾 Formato de exportación/importación de estado
La exportación genera un archivo JSON (versión `2.20`; las importaciones también aceptan las versiones heredadas `1.4` y de `2.0` a `2.19`, migrando automáticamente) que contiene:

**Campos globales:**
- `wisdomVisible` - muelas del juicio visibles
- `showBase` - capa de hueso visible
- `occlusalVisible` - vista oclusal activa
- `showHealthyPulp` - pulpa sana visible
- `edentulous` - modo edéntulo activo

**Campos por diente (32 dientes):**
- `toothSelection` - tipo base del diente
- `toothSubstrate` - sustrato dental (natural/radix/fracturado/preparación de corona), ortogonal a cualquier restauración
- `restorationType` - tipo de restauración (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - material de restauración (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), emparejado con `restorationType`
- `prosthesis` - eje removible/de anclaje (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuamente excluyente con un `restorationType` fijo de corona/puente
- `crownLeakage` - indicador de filtración marginal de corona, significativo solo cuando `restorationType` es corona o puente
- `endo` - estado endodóntico; mutuamente excluyente con `pulpDx` (mostrados juntos mediante un único selector combinado "Estado pulpar / endo" — tratar un diente normaliza `pulpDx` a `normal`)
- `mods` - array de modificaciones (inflammation, parodontal); `inflammation` se retira de la UI en dientes presentes (allí el glifo lo determina `apicalDx`) pero sigue aplicándose a dientes ausentes/alvéolo de extracción
- `caries` - superficies con caries activa
- `cariesActiveDepth` - el valor de profundidad ICDAS preparado por el selector de profundidad de caries al aplicar una nueva superficie (no es un valor almacenado por superficie; ver `cariesSeverity` para el campo almacenado por superficie)
- `rootCaries` - severidad de la caries radicular (none/active/arrested/active-cavitated)
- `cariesSeverity` - severidad unificada por superficie (0-6): profundidad ICDAS en una superficie primaria (sin obturar), puntuación CARS en una superficie recurrente (obturada)
- `radiographicDepth` - profundidad radiográfica de caries por superficie (none/E1/E2/D1/D2/D3), independiente de la escala visual ICDAS/CARS
- `fillingMaterial` - material de obturación
- `fillingSurfaces` - superficies obturadas
- `fillingSurfaceMaterials` - material de obturación por superficie (obturaciones mixtas, p. ej. bucal amalgama + distal composite)
- `fillingDefect` - defecto de obturación por superficie (none/marginal/fracture/wear), condicionado a superficie obturada, independiente de la caries recurrente
- `pulpDx` - diagnóstico pulpar AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); pulpitis reversible renderiza un glifo reducido
- `pulpLatin` - subtipo pulpar en latín práctico (el selector de pulpa solo lo muestra cuando `pulpDetailLevel` es `latin`)
- `apicalDx` - diagnóstico apical que determina el glifo periapical
- `periapicalType` - subtipo de lesión periapical (none/granuloma/cyst), solo se muestra bajo periodontitis apical sintomática/asintomática; el valor heredado `abscess` sigue aceptándose al importar
- `resorptionType` - tipo de reabsorción radicular (none/internal/external-cervical)
- `periImplant` - estado periimplantario, solo implantes (none/mucositis/peri-implantitis-mild/-moderate/-severe), clasificación del World Workshop 2018
- `endoResection` - indicador de apicectomía
- `fissureSealing` - indicador de sellado de fisuras
- `calculus` - indicador de cálculo
- `contactMesial` - pérdida de punto de contacto mesial
- `contactDistal` - pérdida de punto de contacto distal
- `wearEdge` - tipo de desgaste incisal/oclusal (none/attrition/erosion)
- `wearCervical` - tipo de desgaste cervical (none/abrasion/abfraction/erosion)
- `discoloration` - causa de decoloración por diente (none/tetracycline/fluorosis/nonvital/extrinsic/other), tiñe el relleno de la corona natural en un diente con sustrato natural/de leche sin restauración
- `orthoAppliance` - aparato de ortodoncia (none/bracket/band)
- `orthoDrift` - desplazamiento ortodóntico (none/mesial/distal)
- `orthoVertical` - movimiento vertical ortodóntico (none/extrusion/intrusion)
- `orthoRotation` - indicador de rotación ortodóntica
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - ubicaciones de fractura
- `extractionWound` - herida post-extracción
- `extractionPlan` - extracción planificada
- `parapulpalPin` - indicador de pin parapulpar
- `bridgePillar` - diente pilar de puente
- `mobility` - grado de movilidad (none/m1/m2/m3)
- `crownNeeded` - indicador de corona necesaria
- `crownReplace` - indicador de reemplazo de corona necesario
- `missingClosed` - espacio cerrado tras extracción
- `customStates` - estados personalizados de plugins (objeto, indexado por ID de plugin)
- `note` - nota de texto por diente (cadena, opcional — presente solo cuando no está vacía)

**Campo de nivel superior `plan` (versión 2.11+):**
- `plan` - objeto opcional, con la misma forma que `teeth` (campos por diente arriba), que contiene el odontograma de **plan** (tratamiento propuesto). Presente solo cuando el odontograma de plan se ha inicializado (se ha activado el selector `Estado | Plan` a Plan al menos una vez) Y su contenido difiere del odontograma de estado — una exportación solo de estado lo omite por completo y se mantiene idéntica byte a byte a una exportación anterior a 2.11 salvo por el número de versión. Al importar, la ausencia de `plan` limpia/desinicializa el odontograma de plan (nunca resucita un plan obsoleto de una importación anterior); si `plan` está presente, restaura el odontograma de plan junto con el de estado. El odontograma de plan también puede leerse/escribirse de forma independiente a la importación/exportación mediante `getPlanChart()`/`setPlanChart()` (ver API pública arriba), y `getStatusChart()` siempre devuelve el payload de estado, sin importar cuál odontograma esté activo.

**Objeto de nivel superior `case` (versión 2.17+, ampliado en 2.18, 2.19 y 2.20):**
- `case` - objeto opcional de metadatos a nivel de caso — NO es por diente ni de doble estado (el mismo objeto se comparte entre los odontogramas de estado y de plan, reflejando la clave `globals` de nivel superior). Contiene la edad del paciente (`age`, 0-120), el estado de tabaquismo (`smokingStatus`: unknown/never/former/current, con `cigarettesPerDay` 0-99), el estado de diabetes (`diabetesStatus`: unknown/none/present, con `hba1c` 3.0-20.0), dos estadísticas resumen del resultado periodontal (`toothLossPerio` 0-32 y `maxRblPercent` 0-100), las anulaciones clínicas de la clasificación periodontal 2017 (`diagnosisOverride`/`stageOverride`/`gradeOverride`/`extentOverride`), y tres campos de identidad del caso — `patientName` (cadena recortada o `null`), `patientDob` (`AAAA-MM-DD` o `null`) y `examDate` (`AAAA-MM-DD` o `null`) — usados únicamente en el encabezado del informe PDF y en ningún otro sitio; ninguno de los tres forma parte de la exportación FHIR. Se serializa omitiendo los campos vacíos, y el objeto `case` completo está ausente cuando todos sus campos están en su valor predeterminado. Se gestiona mediante `getCaseMeta()`/`resetCaseMeta()` y los setters individuales (ver API pública arriba).

### 🖨️ Exportación
Además de la propia exportación de Estado JSON / FHIR / PNG / JPG / SVG del odontograma, el **gráfico periodontal** cuenta con su propia vía de exportación:
- **SVG/PNG/JPG periodontal:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderizan el gráfico periodontal completo (gráficos dentales + filas numéricas + la clasificación de 2017) como un único SVG vectorial independiente (`buildPerioSvg()`), sin depender del DOM montado de `PerioChart`. Los tres elementos del menú de exportación se desactivan siempre que `hasAnyPerioData()` sea `false` (un gráfico en blanco no tiene nada periodontal que exportar).
- **Informe PDF:** el elemento "Informe PDF…" del menú de exportación abre `ExportOptionsModal` — un diálogo de ajustes (campos de nombre del paciente + fecha de nacimiento + fecha de examen, conectados directamente a los metadatos del caso, con la fecha de examen predeterminada al día de hoy; casillas de sección: datos del paciente, odontograma, descripción del odontograma, notas individuales — desactivada cuando ningún diente tiene una nota —, estado periodontal, descripción periodontal) antes de llamar a `exportPdf(opts)`. Los campos de identidad vacíos recurren a valores de marcador ("John Doe" / "1980-01-01") para que la exportación siempre se complete. El PDF se ensambla de forma nativa con jsPDF — texto vectorial mediante `.text()`, imágenes rasterizadas del odontograma/gráfico periodontal mediante `.addImage()` — **sin dependencia de svg2pdf.js**. La sección de notas individuales se omite automáticamente cuando ningún diente tiene una nota, y las dos secciones periodontales cuando `hasAnyPerioData()` es `false`, independientemente de las casillas del diálogo.
- **Restricción de implante para mPI/mBI:** los índices de Mombelli periimplantarios (mPI/mBI) solo se renderizan como filas en una arcada que contenga al menos un diente con implante — tanto en el gráfico periodontal en vivo como en las exportaciones SVG/PDF.
- El nombre del paciente, la fecha de nacimiento y la fecha de examen son solo metadatos de identidad del caso (payload `2.20`, aditivo) — **no** forman parte de la exportación FHIR.

### 📁 Estructura de carpetas
- `src/App.tsx` - UI principal, controles de barra superior, selector de idioma/numeración/modo oscuro/tema/plugins
- `src/odontogram.ts` - motor de capas SVG, gestión de estado dental, interacciones táctiles, superposiciones de plugins, cableado UI
- `src/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, prioridades Z `LAYER_Z`
- `src/theme.ts` - tipo `OdontogramThemeConfig` y función `applyThemeConfig()`
- `src/status_extras.ts` - 34 plantillas de restauración predefinidas (puentes, prótesis, construcciones con barra)
- `src/i18n/` - traducciones (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) y hook i18n
- `src/utils/numbering.ts` - conversión de numeración FDI, Universal, Palmer
- `src/registry/` - registro declarativo de ejes clínicos: mapeos de campos FHIR, conjunto de limpieza SVG/activación de indicadores booleanos, matriz tipo×material de restauración, listas de opciones de UI (fuente única de verdad que genera la UI de exportación/importación, FHIR y de selectores)
- `src/fhir/` - exportación/importación HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemas de códigos, mapeos de campos, primitivas
- `src/bridgeOverlay.ts` - superposición de conector de tramo de puente multidiente (geometría de silla adaptada a la arcada)
- `src/SettingsModal.tsx` - diálogo de Ajustes por pestañas (General/Paneles/Detalles del diente/Caries/Pulpa/Notas/Periodontal)
- `src/perioExport.ts` - `buildPerioSvg()`: el gráfico periodontal completo como un único SVG vectorial independiente
- `src/perioPdf.ts` - ensamblador puro jsPDF del informe de `exportPdf()` (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - el diálogo de ajustes de exportación "Informe PDF…"
- `src/__tests__/` + `src/registry/__tests__/` - una amplia suite de pruebas automatizadas de Vitest
- `src/assets/teeth-svgs/` - plantillas SVG dentales (6 archivos: incisivos, caninos, premolares, molares + vistas oclusales)
- `src/assets/icon-svgs/` - SVGs de iconos de barra de herramientas (5 archivos)

### ⚙️ Stack tecnológico
- React 18 + Vite + TypeScript
- Tailwind CSS para estilos de UI
- Capas SVG mediante manipulación del DOM (no React state por rendimiento)
- Sistema i18n propio ligero
- Vitest + Testing Library para pruebas automatizadas
- TypeDoc para documentación de API
- Alias de ruta Vite: `@` mapeado a `./src`

### 📝 Notas
- Las plantillas SVG se cargan desde `src/assets/teeth-svgs` y `src/assets/icon-svgs`, por lo que el hosting estático debe servir la carpeta pública.
- El motor del odontograma usa su propio estado interno (no el estado de React) por rendimiento y simplicidad.
- Los dientes de leche tienen un conjunto reducido de materiales disponibles (sin obturaciones de amalgama, sin endodoncia con pines).
- Los dientes con implante tienen un conjunto diferente de opciones de corona/pilar que los dientes naturales.

### 🔒 Notas de seguridad

- **Los plugins se ejecutan como código de confianza.** El valor devuelto por el `renderSvg()` de un plugin se inyecta en el SVG del odontograma en vivo. Esa salida se sanea con [DOMPurify](https://github.com/cure53/DOMPurify) (perfil SVG, más `svgFilters`) antes de insertarse — `<script>`, `<iframe>`, `<object>`, `<embed>` y `<foreignObject>` están prohibidos por completo, y una salida totalmente maliciosa se descarta en lugar de renderizarse parcialmente. Esto reduce el radio de impacto de un plugin comprometido o con errores, pero los plugins solo deben cargarse desde fuentes de confianza — el saneamiento es una red de seguridad, no un sustituto de la verificación.
- **Content-Security-Policy.** La **compilación de producción** de la demo inyecta esta política mediante una etiqueta `<meta http-equiv="Content-Security-Policy">` (el servidor de desarrollo no se ve afectado):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Las aplicaciones anfitrionas que integren `OdontogramShell` deben establecer su propia CSP adecuada a su despliegue — el componente no inyecta ninguna cuando se usa como librería.

### 📖 Cómo citar

Si utilizas este módulo en tu trabajo, por favor cítalo.

**Esta versión (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Todas las versiones (DOI de concepto):** https://doi.org/10.5281/zenodo.21156787

> El DOI de concepto de todas las versiones anterior siempre resuelve a la versión
> archivada más reciente; se emite un DOI específico de versión por cada lanzamiento
> cuando se archiva en Zenodo. Hasta que la v2.4.0 sea archivada, cítala mediante
> el DOI de concepto.

Los metadatos de citación legibles por máquina están en [`CITATION.cff`](CITATION.cff).

## 📄 License

Created with ❤️ by Zoltan Dul (2026)
Released under the MIT License.

## 🙌 Créditos

React Advanced Odontogram es creado y mantenido por Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), creador y desarrollador principal de todo el motor. Con la valiosa ayuda de los colaboradores indicados a continuación. Gracias a todos los que han contribuido.

**Colaboradores**

- [@odontodev](https://github.com/odontodev): hidratación de estado y API de ciclo de vida, ajustes de obturaciones como props controladas, setters idempotentes y tarjetas plegables
- [@JulianoBazzi](https://github.com/JulianoBazzi): traducción al portugués brasileño
- [@yassine-bhn](https://github.com/yassine-bhn): traducción al francés y la anatomía medida candidata
- [@saegerdirk-star](https://github.com/saegerdirk-star): anatomía dental medida y el generador de dientes, además de la propuesta de interfaz componible

**Construido con** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) y [Tailwind CSS](https://tailwindcss.com).

Las contribuciones son bienvenidas. Abre un pull request en GitHub y aparecerás aquí acreditado. Si el proyecto te resulta útil, por favor [dale una estrella en GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).
