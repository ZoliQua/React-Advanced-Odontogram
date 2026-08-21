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

## 📑 Conteúdo

- [📋 Visão geral](#-visão-geral)
- [📦 Usar como pacote npm](#-usar-como-pacote-npm)
- [✨ Principais recursos](#-principais-recursos)
- [📦 Módulos](#-módulos)
- [🛠️ Controles da interface](#-controles-da-interface)
- [🦷 Tipos e estados de dente](#-tipos-e-estados-de-dente)
- [⚙️ Configurações](#-configurações)
- [🖼️ Sistema de modelos SVG](#-sistema-de-modelos-svg)
- [🔢 Sistemas de numeração](#-sistemas-de-numeração)
- [🚀 Uso](#-uso)
- [🔗 Integração](#-integração)
- [🧪 Testes](#-testes)
- [📖 Documentação da API](#-documentação-da-api)
- [📡 API pública](#-api-pública)
- [💾 Persistência de estado (localStorage)](#-persistência-de-estado-localstorage)
- [💾 Formato de exportação/importação de status](#-formato-de-exportaçãoimportação-de-status)
- [🖨️ Exportação](#-exportação)
- [📁 Estrutura de pastas](#-estrutura-de-pastas)
- [⚙️ Stack tecnológica](#-stack-tecnológica)
- [📝 Notas](#-notas)
- [🔒 Notas de segurança](#-notas-de-segurança)
- [📖 Como citar](#-como-citar)

## 🇧🇷 Português (Brasil)

### 📋 Visão geral
Este projeto é um editor de odontograma interativo, executado no navegador, que agiliza o registro dentário com uma interface limpa. Ele renderiza modelos de dentes em SVG por camadas para representar restaurações, cáries, estado endodôntico, mobilidade e outros detalhes clínicos, oferecendo seleção múltipla, filtros de seleção e predefinições de estado prontas para uso.

---
![Odontograma – prévia (português)](screenshot_pt-br_odontogram.png)

🔗 **URL de teste:** https://react-odontogram-modul.vercel.app/

---

### 📦 Usar como pacote npm

O odontograma é distribuído como uma biblioteca de componentes React autocontida no npm:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Requisitos
- **React 18 ou 19** (declarado como peer dependency — fornecido pela sua aplicação).
- Um **bundler** que entenda o campo `exports` e ESM: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. O pacote é **somente ESM**.
- Node **≥ 18** para as ferramentas.

#### Instalação

```bash
npm install react-advanced-odontogram react react-dom
```

#### Uso básico

Renderize o `OdontogramShell` e importe a folha de estilos **uma única vez** em qualquer lugar da sua aplicação:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="pt-br"       // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Props do componente

`OdontogramShell` é um componente controlado. As props mais comuns:

| Prop | Tipo | Padrão | Descrição |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Idioma da interface (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Sistema de numeração dentária. |
| `darkMode` | `boolean` | `false` | Alternância de tema escuro. |
| `readOnly` | `boolean` | `false` | Desativa toda a edição (somente visualização). |
| `themeConfig` | `OdontogramThemeConfig` | — | Sobrescreve variáveis CSS do tema (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Registra plugins de estado personalizados / camadas extras. |
| `enableNotes` | `boolean` | `false` | Habilita anotações por dente. |
| `enableIcdas` | `boolean` | `false` | Habilita a pontuação de cáries ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complexidade da restauração: `"simple"` (um material por dente) ou `"complex"` (materiais por superfície). |
| `fillingDefectEnabled` | `boolean` | `true` | Habilita achados de defeito de restauração no cartão Restaurações. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | todos disponíveis | Materiais de restauração disponíveis como um mapa booleano sobre `amalgam`/`composite`/`gic`/`temporary` (chaves desconhecidas são ignoradas). |
| `fissureSealingEnabled` | `boolean` | `true` | Habilita o selante de fissura no cartão Restaurações. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Disparam quando o usuário altera a configuração correspondente em Configurações → Restaurações. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Disparam quando o usuário altera a configuração pela interface. |

Props de nível de detalhe mais granulares (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) também são aceitas — consulte os tipos `.d.ts` incluídos para a lista completa e tipada.

As quatro props de restauração acima são **apenas de recuperação**: uma prop omitida nunca escreve no motor (uma chamada imperativa a `setFillingComplexity()` antes da montagem é preservada e o modo autônomo permanece inalterado), enquanto uma prop fornecida escreve no motor e no estado do modal Configurações juntos, de modo que o modal nunca mostra um valor obsoleto. `fillingMaterialAvailability` é aplicada por diff via uma chave serializada canônica — re-renders com um literal inline de conteúdo idêntico nunca reescrevem o motor. Os callbacks `on*Change` correspondentes disparam em Configurações → Restaurações: o caminho de escrita para hosts persistirem preferências.

#### API pública (exports nomeados)

`OdontogramShell` é ao mesmo tempo o export padrão e um export nomeado. A API imperativa de estado, o componente autônomo `PerioChart`, o tour guiado e todos os tipos públicos são exports nomeados do mesmo ponto de entrada:

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

A superfície completa (≈ 44 funções + tipos como `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) é totalmente tipada nas declarações incluídas.

#### Superfícies componíveis (avançado)

`OdontogramShell` é o componente tudo-em-um suportado e não requer configuração adicional. Se você precisar posicionar as regiões do odontograma em áreas diferentes do seu próprio layout, as quatro superfícies de interface da shell também são exportadas e podem ser compostas sob um único `OdontogramProvider`, todas compartilhando uma única sessão gerenciada pelo pacote:

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

`OdontogramProvider` recebe as mesmas props que `OdontogramShell`. Um hook `useOdontogramUi()` (e o tipo `OdontogramUiContextValue`) está disponível para construir suas próprias superfícies. Restrição atual: use um provider por página. As superfícies podem ser montadas e desmontadas sob demanda — elas se revinculam automaticamente ao remontar. O próprio `OdontogramShell` permanece inalterado — é exatamente essa composição no arranjo padrão.

Para uma composição ainda mais fina, os cartões de controle individuais também são exportados — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` e `ToothDetailsCard` —, cada um um componente declarativo autônomo que lê e grava a sessão compartilhada por meio da API do motor (um hook `useEngineState()` é exportado para construir as suas próprias). Monte apenas os cartões de que um determinado layout precisa, em qualquer arranjo, sob um único `OdontogramProvider`.

#### Usando com Next.js (App Router)

O componente é somente cliente, então renderize-o a partir de um Client Component:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="pt-br" numberingSystem="FDI" />;
}
```

Ou carregue-o com um dynamic import somente cliente: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Notas importantes e limitações atuais
- **Somente ESM** — o pacote publica um único módulo ES (`dist/odontogram.js`) mais uma entrada de declaração de tipos (`dist/index.d.ts`). Ele mira a resolução de módulos de bundler; não há build CommonJS.
- **A folha de estilos é separada** — você **precisa** importar `react-advanced-odontogram/style.css` uma vez; ela não é injetada automaticamente. A estilização é CSS global com escopo sob `.odontogram-root` e controlada por variáveis CSS `--odon-*`.
- **SSR / somente cliente** — o componente lê o DOM na montagem (`document`), então precisa rodar no navegador. Em frameworks SSR, renderize-o em um Client Component (`"use client"`) ou via um dynamic import somente cliente.
- **Assets autocontidos** — os SVGs de dentes e ícones são embutidos (inline) no bundle JavaScript em tempo de build; **não há busca de asset em runtime** para configurar e nada extra a copiar para sua pasta pública.
- **Uma instância por página** — o estado do motor é atualmente um singleton em nível de módulo, então renderizar duas instâncias `<OdontogramShell>` na mesma página faria com que compartilhassem o estado de um único gráfico. Suporte a múltiplas instâncias está planejado para uma versão futura.

---

### ✨ Principais recursos
- 🖱️ Seleção rápida e seleção múltipla (CMD/CTRL + clique)
- 🦷 Tipos de dente: permanente, decíduo (de leite), implante, subgengival, ausente
- 🦷 Substrato dentário (ortogonal a qualquer restauração): natural, radix (resto radicular), fraturado, preparado para coroa
- 👑 Restaurações por tipo × material: coroa / inlay / onlay / faceta / ponte em e.max, ouro, gradia, zircônia, metal, metalo-cerâmica, telescópica ou provisória (onlay é apenas na vista oclusal) — escolhidas em um único seletor combinado de poucos cliques "Fix: Crown – …"; coroas `metal` legadas migram para `metal-ceramic` (PFM); implantes usam o mesmo modelo tipo × material, composto com uma camada de conector de implante. O seletor é limitado pelo tipo de dente: um implante oferece apenas coroa/ponte (mais suas cinco opções de attachment, abaixo); um dente ausente/vão oferece apenas um pôntico de ponte (mais prótese parcial/total removível); um substrato `radix` oculta o controle de restauração por completo (nenhuma restauração pode ser registrada em um resto radicular)
- 🦿 Próteses removíveis/attachments no eixo dedicado `prosthesis` (entradas "Kivehető:" no seletor combinado): cicatrizador de implante, locator, locator com overdenture, barra, barra com overdenture; prótese parcial ou total removível dento-suportada
- 🌉 Dentes de ponte renderizam tanto a capa da coroa quanto o conector em sela; uma sobreposição de vão de ponte multi-dente renderiza um conector contínuo e ciente da arcada ao longo de dentes de ponte consecutivos (pônticos + pilares) e dos vãos interdentários entre eles (as arcadas superior e inferior usam geometria de sela espelhada, mantendo o conector alinhado em ambas), incluída na exportação PNG/JPG/SVG; aplicar uma ponte via uma predefinição de Statuses recalcula a sobreposição imediatamente
- 🔍 Registro de cáries em 6 superfícies: mesial, distal, vestibular, lingual, oclusal, subcoronária
- 🪥 Materiais de restauração por superfície: amálgama, resina composta, CIV (GIC), provisório
- 🏥 Um seletor unificado "Pulp / Endo status" (agrupado: polpa vital vs. tratado/endo): estados endodônticos (curativo, obturação de canal, obturação de canal incompleta, pino de fibra de vidro, pino metálico) e o diagnóstico pulpar da AAE (`pulpDx`: normal / pulpite reversível / irreversível / necrose) são mutuamente exclusivos — um dente tratado endodonticamente (`endo` definido) não pode carregar também um diagnóstico de polpa vital; ao tratar, `pulpDx` é normalizado para `normal` e o glifo de polpa doente é suprimido. A pulpite reversível renderiza um glifo pulpar reduzido. Uma configuração opcional de detalhe pulpar em 3 níveis (`pulpDetailLevel`: simple / AAE / prático-latim) expõe 9 subtipos pulpares em latim prático (pulpa sana … gangraena pulpae) via `pulpLatin`; ressecção e pino parapulpar permanecem como indicadores especiais separados
- 🦴 Diagnóstico apical (`apicalDx`: periodontite apical sintomática/assintomática, abscesso apical agudo/crônico, osteíte condensante) controla o glifo periapical diretamente; um qualificador de subtipo de lesão granuloma/cisto é exibido apenas em periodontite apical sintomática/assintomática (o subtipo redundante "abscesso" foi removido — já coberto pelo diagnóstico apical)
- 🩹 Cartão unificado "Raiz e periodonto" (uma única seção recolhível para achados radiculares/periapicais e periodontais)
- ⚕️ Modificações: inflamação periapical (mostrada apenas em dentes ausentes/alvéolos de extração; oculta em dentes presentes, onde `apicalDx` sozinho controla o glifo periapical, e em implantes, onde `periImplant` a cobre), doença periodontal, graus de mobilidade (M1/M2/M3, ocultos em implantes)
- 🦷🔩 Estado peri-implantar (`periImplant`: none / mucosite / peri-implantite-leve / -moderada / -grave) — estadiamento do World Workshop 2018, mostrado como um seletor dedicado em implantes; a mucosite reutiliza o glifo gengival periodontal, a peri-implantite adiciona uma camada graduada `peri-implant-bone-loss` (opacidade 0.4/0.7/1.0). Implantes não renderizam mais o glifo de lesão periapical — sua inflamação é expressa por este eixo — e os checkboxes de modificadores periodontais ficam ocultos em implantes (a antiga renomeação ad-hoc do checkbox "Peri-implantite" foi aposentada)
- 🏷️ Indicadores especiais: coroa necessária, substituição de coroa necessária, vão fechado ausente, plano de extração, selante de fóssulas e fissuras, perda de ponto de contato
- 👁️ Alternâncias de visibilidade: vista oclusal, dentes do siso, osso e polpa
- 🔢 12 filtros de seleção (todos, presentes, permanentes, decíduos, implantes, ausentes, superior/inferior, anteriores/molares)
- 📊 Predefinições de estado prontas (reset, dentição decídua, dentição mista, edêntulo)
- 📦 34 modelos de restauração predefinidos (pontes, próteses removíveis, próteses tipo barra com implantes)
- 💾 Exportação/importação de estado em JSON (versão 2.22; a importação ainda aceita as versões legadas 1.4 e 2.0 até 2.21 e migra automaticamente, com estados personalizados de plugins e anotações por dente)
- 💽 Persistência opcional em localStorage (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — desativada por padrão; salva automaticamente o gráfico de status (e, opcionalmente, o gráfico de plano) a cada mudança de estado e o restaura na próxima vez que o componente é montado, com um limite de tamanho de 4 MB e erros de storage/parse encaminhados a um callback `onError` (ou `console.warn`) em vez de lançar exceção
- 🔗 Exportação HL7 FHIR R4 (Bundle collection de Observations por dente, codificação dentária ISO 3950 para a dentição permanente **e também** dentes decíduos (51-85, round-trip sem perda na importação), sistema de código local, além de uma sobreposição SNOMED CT opcional (Configurações → SNOMED CT)); um componente de cárie com uma severidade registrada também carrega uma codificação de sistema de pontuação — ICDAS em uma superfície primária (não restaurada), CARS em uma recorrente (restaurada)
- ✚ Interface de seleção de superfície em cruz/mais (B/M/O/D/L) para cáries e restaurações
- 🧱 Materiais de restauração por superfície (restaurações mistas, ex.: amálgama vestibular + resina composta distal)
- 🖼️ Exportação de imagem PNG/JPG/SVG do gráfico (baixável; PNG/JPG rasterizados a partir do SVG vetorial)
- 🦷 Cárie/subcárie é uma máquina de estados por superfície: uma superfície cariada sem restauração renderiza como cárie primária (opacidade escalonada por ICDAS); uma vez que uma restauração esteja presente naquela superfície, ela renderiza como cárie recorrente (a camada `subcaries-{surface}`, pontuada por CARS) — as duas nunca estão ativas ao mesmo tempo na mesma superfície
- 🎯 Severidade unificada por superfície (`cariesSeverity`, 0–6, substituindo os antigos campos separados de profundidade ICDAS + CARS): lida como profundidade ICDAS em uma superfície primária, como uma pontuação CARS nomeada (Hígido … Cavidade extensa) em uma recorrente, via um popup contextual que mostra apenas a escala relevante ao estado atual da superfície
- 🌱 Cárie radicular (`rootCaries`: none / ativa / paralisada / ativa-cavitada), acionando a camada de artwork dedicada de cárie radicular com opacidade orientada pela severidade (ativa 0.5 / paralisada 0.7 / ativa-cavitada total)
- 📡 Profundidade radiográfica de cárie (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 por superfície), independente da escala visual de severidade ICDAS/CARS, exibida como um badge e com round-trip por sua própria Observation FHIR
- 🎚️ Três configurações de granularidade de cárie (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) mais uma alternância `cariesDepthEnabled`, reduzindo cada escala a uma visão de seletor mais simples sem perder o valor armazenado
- 🩹 Linha-resumo de subcárie no painel de restaurações: lista qualquer dente selecionado com cárie recorrente e suas superfícies abaixo dos controles de restauração (ex.: "36 (O) has subcaries set on its filling.")
- 🪛 Defeitos de restauração por superfície (`fillingDefect`: none / marginal / fratura / desgaste) em restaurações diretas, independentes da cárie recorrente — registrados via um indicador por superfície no cartão de Restaurações (espelhando o indicador de profundidade de cárie, com sua lista de opções empilhada verticalmente), renderizados no gráfico e mostrados no tooltip e no resumo de restaurações de boca completa com um rótulo explícito (ex.: "36 (O) – Filling defect: O: marginal"), da mesma forma que a cárie recorrente é rotulada na linha de Cáries; o cartão de Restaurações também mostra uma nota de dica para qualquer dente selecionado com um defeito de restauração registrado (ex.: "36 has a filling defect recorded."), paralela à nota de dica de subcárie existente
- 🦷💥 Desgaste dentário tipado por causa clínica e localização (`wearEdge`: none / atrição / erosão, incisal/oclusal; `wearCervical`: none / abrasão / abfração / erosão, cervical) — substituindo as duas flags on/off de desgaste por bruxismo; registrado via dois dropdowns na linha de desgaste, reutiliza a artwork de desgaste existente e é mostrado no tooltip e em uma nova seção de resumo de boca completa "Wear"
- 🎨 Descoloração dentária por causa (`discoloration`: none / tetraciclina / fluorose / não-vital / extrínseca / outra) em dentes permanentes e decíduos — tinge a coroa natural exibida com uma cor representativa quando o dente não tem restauração e tem substrato natural; mostrada no tooltip e em uma nova seção de resumo de boca completa "Discoloration"; completa o conjunto de condições de superfície e estruturais junto com defeitos de restauração e desgaste
- ✏️ Dentes anteriores (incisivos/caninos) rotulam sua superfície oclusal como "incisal" em toda a interface (seletor, popup, resumos); a chave de superfície armazenada permanece `occlusal`
- 🔤 Notação de superfície ciente da posição (Settings → Tooth details → "Surface notation", simple/full, padrão full): no modo full a letra e o rótulo da superfície de cárie/restauração seguem a anatomia dentária — oclusal → I/incisal em dentes anteriores, vestibular → L/labial em dentes anteriores, lingual → P/palatina em dentes superiores e L/lingual em dentes inferiores (mesial/distal/subcoronária não são afetados); o modo simple sempre usa o conjunto genérico B/M/O/D/L/SC independentemente da posição do dente. Aplica-se ao resumo de boca completa e a ambos os seletores de superfície de cárie e de defeito de restauração (letra + legenda); a chave de superfície armazenada não é afetada
- 🦷↕️ Registro ortodôntico por dente (`orthoAppliance`: none / bracket / banda; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusão / intrusão; `orthoRotation`: booleano) em um dente natural presente (permanente ou decíduo) — reutiliza a artwork ortodôntica dormente da v2.5.0 (nenhum SVG novo); mostrado no gráfico, no tooltip e em uma nova seção de resumo de boca completa "Orthodontics"
- 🪨 Cálculo dentário e reabsorção radicular tipada como interna ou externa-cervical (`resorptionType`)
- 📏 Profundidade de cárie por superfície (superficial / dentina / profunda), ou pontuação ICDAS II opcional (0–6) via `enableIcdas`
- 🩹 Alternância de infiltração marginal de coroa, mostrada apenas para uma restauração de coroa ou ponte
- 🧬 Codificação de diagnóstico baseada em padrões (WHO ICD-10, sempre ativa): cada achado registrado no gráfico deriva um diagnóstico codificado em ICD-10 — cárie dentária (K02), cárie radicular/cementária e cárie paralisada (K02.2/.3), pulpite e necrose pulpar (K04.0/.1), periodontite apical, abscesso periapical e cisto radicular (K04.4–.9), atrição/abrasão/erosão/abfração (K03.0–.8), cálculo dentário (K03.6), reabsorção dentária (K03.3), descoloração dentária (K00.3/K00.8/K03.7), perda dentária (K08.1), raiz residual (K08.3) e fratura dentária (S02.5) — exibido no tooltip e no resumo de boca completa, e exportado como FHIR Conditions.
- 🩺 Cartão de Diagnósticos por dente: veja os diagnósticos ICD-10 derivados de um dente e cure-os — suprima um derivado incorretamente ou adicione um que o gráfico não representa. O conjunto efetivo (derivado − suprimido + adicionado) direciona a exportação FHIR.
- 🗺️ Condições de caso/regionais: registre diagnósticos de boca completa não vinculados a um único dente — má oclusão e transtornos da articulação temporomandibular (K07), cistos orais (K09), doenças da glândula salivar (K11), estomatite e mucosa oral (K12/K13), e anomalias de desenvolvimento em nível de arcada (K00) — cada uma opcionalmente lateralizada (esquerda / direita / bilateral).
- 🌍 Pacotes de codificação nacionais (Configurações → Sistema de codificação de diagnóstico): sobrepõe um sistema de código nacional à base WHO ICD-10 — BNO-10 (húngaro, exibições localizadas; mantém o código WHO) ou US ICD-10-CM (códigos remapeados, ex.: a faixa dentofacial K07 → M26). Adicionar o pacote de outro país é uma pequena entrada `CodingPack` — veja `CODING_PACKS.md`.
- 🔬 Sobreposição SNOMED CT (Configurações → SNOMED CT, opcional, desativada por padrão): adiciona uma codificação SNOMED CT junto à codificação WHO e de qualquer pacote nacional, e codifica os achados peri-implantares que não têm código WHO ICD-10. Os IDs de conceito ICD-10-CM e SNOMED são de referência/melhor esforço — verifique na lista tabular oficial do ICD-10-CM / no navegador do SNOMED CT antes do uso clínico.
- 🔁 Round-trip de Condition FHIR: os diagnósticos são exportados como recursos FHIR `Condition` (vinculados ao dente, além de condições de caso em nível de paciente com um bodySite de lateralidade) junto com as Observations, e a importação os reconstrói — as condições de caso diretamente, e as substituições de adição/supressão por dente comparando as Conditions importadas com o gráfico rederivado.
- 🧰 Linha de ícones unificada na barra superior com um modal de Configurações em abas (General / Panels / Tooth details / Caries / Pulpa / Notes / Periodontal — numeração, anotações, visibilidade de painéis, ICDAS, alternância de profundidade de cárie, granularidade de cárie radicular/radiográfica, nível de detalhe pulpar, nível de detalhe de desgaste/descoloração dentária, informações do dente)
- 🗂️ Aba Settings → "Panels": mostra/oculta de forma independente os painéis de resumo de boca completa Statuses e Orthodontics
- 🦷🩺 Aba Settings → "Periodontal": 16 alternâncias mostrar/ocultar por índice para as linhas do gráfico perio (agrupadas bolsa/higiene/mucogengival/suporte/peri-implantar — PD/GM/CAL/BOP, placa, PI, GI, visibilidade da JEC, concavidade radicular, KG, GT, furca, mobilidade, classe de Miller, mPI, mBI), cada uma com uma descrição, mais uma opção de exibição do nome do índice traduzido-vs-canônico (canônico = um nome científico fixo em inglês/latim em todos os idiomas da interface; os tooltips permanecem sempre localizados independentemente desta configuração). Ambas são preferências de nível de aplicação (como `perioViewMode`) — nunca fazem parte do payload de exportação
- 🩹 Controle de configurações de cárie secundária (CARS) mesclado à aba de configurações de Cáries, posicionado acima de Profundidade radiográfica (a aba separada "Secondary caries" foi aposentada)
- 🎚️ Nível de detalhe em Tooth details (Settings → Tooth details): uma configuração simple/complex para desgaste dentário e para descoloração. O modo simple mostra uma alternância sim/não por achado (desgaste ligado → atrição/abrasão, descoloração ligada → outra); o modo complex (padrão) mantém os dropdowns de tipo/causa, e o valor armazenado é preservado ao alternar os níveis
- 📋 Painel de informações do dente: resumo textual ao vivo de todo o gráfico (contagens de dentes, listas de presentes/ausentes, cáries incl. secundárias, restaurações, tratamentos de canal, próteses, implantes, estado periodontal) — mostrado por padrão, alternável em Settings
- 🗂️ Dropdown de Exportação consolidado (Status JSON / FHIR / PNG / JPG)
- 📥 Dropdown de Importação com importação FHIR (faz round-trip de Bundles exportados)
- ⏳ Overlay de progresso durante a exportação de imagem
- 🎓 Tour interativo de introdução em 12 passos
- 🔢 Três sistemas de numeração (FDI, Universal, Palmer)
- 🌐 I18n — 12 idiomas de interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) com um seletor de idioma; o árabe renderiza a interface da direita para a esquerda com os gráficos dentário/perio fixados da esquerda para a direita (tradução automática, revisão por falante nativo pendente para AR/ZH/FR)
- 🌗 Suporte a modo escuro com botão de alternância (autônomo ou controlado pela aplicação pai)
- 🎨 Configuração de tema personalizada (prop `themeConfig`) com propriedades CSS personalizadas (`--odon-*`)
- 📱 UX de toque para dispositivos móveis: popover de tocar-para-zoom, menu de contexto por pressão longa, pinça-para-zoom, alvos de toque WCAG de 44px, navegação por alternância de arcada
- 🔌 Sistema de plugins SVG personalizados: injete sobreposições visuais, estado personalizado por dente, suporte a exportação/importação JSON — a saída de `renderSvg()` do plugin é sanitizada com DOMPurify (perfil SVG) antes da inserção no gráfico ao vivo; os plugins ainda rodam como código confiável, então carregue plugins apenas de fontes em que você confia
- 🛡️ Content-Security-Policy: o build de produção do demo injeta uma tag meta CSP (o dev server não é afetado) — aplicações hospedeiras que incorporam o componente devem definir a sua própria
- ⚠️ Avisos de validação de estado para combinações incompatíveis de estado do dente
- 🏷️ Tooltip automático de estado nos ladrilhos de dente (mostra todos os estados ativos)
- 🩺 Tooltip por dente e painel de resumo de boca completa modernizados: ambos expõem o conjunto completo de achados clínicos (diagnóstico pulpar/apical + subtipo de lesão, reabsorção radicular, estado peri-implantar, cárie radicular graduada, cálculo, infiltração marginal de coroa, fratura, perda de contato, desgaste incisal/cervical tipado), com uma seção dedicada "Diagnoses" no painel, uma seção dedicada "Wear" e um qualificador grosso de severidade de cárie (superficial/moderada/profunda)
- ♿ Acessibilidade por teclado (WCAG): papéis ARIA listbox/option, seleção com Enter/Espaço, navegação por setas, contornos focus-visible
- 🔒 Modo somente leitura: desativa todas as interações para casos de impressão/relatório/visualização
- ✨ Animações de seleção: borda tracejada pulsante e drop-shadow brilhante em dentes selecionados (com suporte a prefers-reduced-motion)
- 📝 Anotações por dente: clique duplo para adicionar/editar anotações, ícone de nota ao lado do número do dente, tooltip ao passar o mouse com o texto da nota, uma linha "Individual notes" no painel de resumo de boca completa, inclusão no relatório PDF, exportação/importação JSON
- 🔀 Divisão gráfico Status ↔ Plan: uma alternância `Status | Plan` no cabeçalho do gráfico troca entre um gráfico de **status** atual e um gráfico de **plano** (pós-tratamento pretendido), cada um com seus próprios estados de dente; o gráfico de plano começa como uma cópia do status na primeira vez que você alterna para ele, e edições em um gráfico nunca afetam o outro. Exportação/importação (`exportStatus`/`exportFhir`/importação de arquivo) sempre miram o gráfico de status; o gráfico de plano é lido/escrito separadamente via sua própria API (veja API pública abaixo) e — quando difere do status — é incluído como uma seção `plan` aditiva na exportação JSON
- 📝 Caixa "What changes": sempre que o plano difere do status atual, uma caixa sob o painel de informações do dente lista cada diferença por dente e por eixo de tratamento (presença, substrato, restauração, prótese, coroa planejada, ortodontia, polpa/endo, apical) como uma linha `tooth: axis  from → to`; também disponível programaticamente via `getPlanChanges()`

![Gráfico periodontal de boca completa (português)](screenshot_pt-br_perio.png)

- 🩺 Registro periodontal: **profundidade de sondagem** por sítio, **margem gengival**, **sangramento à sondagem** (+ supuração) nos seis sítios padrão por dente, com **nível de inserção clínica derivado (CAL = PD + margem gengival)**, recessão e **%BOP** de boca completa. Um **gráfico perio gráfico de boca completa** — cada arcada desenhada como **dois SVGs vestibular/palatino(lingual) separados** (reutilizando a artwork do dente com uma orientação uniforme coroas-para-a-banda em ambos os aspectos; um **gráfico de implante** para dentes de implante) com uma **linha JEC** vermelha, uma **grade guia milimétrica numerada** e uma **curva de margem gengival / profundidade de bolsa** sobre os dentes, dividida por uma **banda central de índices perio** (rotulada `▲ Buccal … Lingual/Palatal ▼`) que carrega os índices compartilhados por dente — **classe de Miller** bem no topo, e **Plaque/PI/GI/mPI/mBI** renderizados como um **ladrilho em diamante anatômico** por dente (ponta vestibular para cima, ponta lingual para baixo, mesial/distal na linha do meio trocados por lado de modo que o mesial sempre aponta para a linha média da arcada); as linhas de números (nomes completos dos índices — PD/GM/CAL/BOP + mobilidade + furca — em células maiores e mais adequadas ao toque) alinhadas em colunas e um resumo (média PD/CAL, %BOP, PI%), com entrada de **auto-avanço por teclado**; o gráfico **escala dinamicamente para preencher a largura disponível**, responsivo em qualquer tamanho de janela. Apresentado como uma **alternância de visão** `Odontogram | Periodontal Status`, cujo painel direito é reaproveitado em uma **barra lateral de contexto perio** (dados do paciente, a classificação de 2017 e o resumo de boca completa) enquanto essa visão está ativa (uma opção em Settings troca toda a apresentação de volta para um **popup**), e ainda um **componente invocável separadamente** (export `PerioChart`) para que uma aplicação hospedeira possa chamar o gráfico perio independentemente do odontograma base. Exportação **FHIR** por sítio via o painel periodontal LOINC (`74029-0`; PD `32910-2`, recessão `32911-0`, CAL `32912-8`)
- 🅿️ Estilização proposta: no modo Plan, os achados que o plano **adiciona** em relação ao status atual (coroa planejada, extração, movimento ortodôntico, prótese, …) renderizam com um **contorno "proposto" tracejado e tingido** distinto, de modo que o plano seja lido como intenção, não como fato — com uma legenda "dashed = proposed" no cartão do gráfico. A renderização no modo Status é idêntica byte a byte; o tratamento é somente do plano e totalmente resetado ao voltar
- 🚦 Gating do modo Plan: o gráfico Plan mostra apenas o que um dentista pode *fazer* — o seletor base oferece apenas Missing / Permanent / Implant, e achados que só existem no status (cáries, desgaste dentário, descoloração e todo o bloco periodontal — mobilidade, grade de sondagem de seis sítios, inflamação/modificadores periodontais, cálculo, estado peri-implantar) ficam ocultos; o controle de polpa/endo mantém o **tratamento** endodôntico (canal / pino / apicectomia / pino parapulpar) enquanto oculta o **diagnóstico** pulpar/apical e a reabsorção radicular. Restauração, prótese, ortodontia, necessidade/substituição de coroa e plano de extração permanecem planejáveis
- 🧪 Uma extensa suíte de testes automatizados em Vitest cobrindo numeração, traduções, predefinições, i18n, componente App, tema, toque, plugins, acessibilidade e paridade de eixo-clínico/diagnóstico
- 📖 Documentação de API em TypeDoc com comentários JSDoc em todos os exports públicos (`npm run docs`)

### 📦 Módulos
- 🦷 Grade do odontograma e interface do ladrilho de dente
- 🎛️ Controles e painel de status
- 🎨 Motor de camadas SVG e modelos
- 🔢 Numeração de dentes e mapeamento de rótulos (FDI/Universal/Palmer)
- 🌐 Localização — 12 idiomas de interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), incluindo árabe (RTL)
- 💾 Exportação/importação de estado
- 📋 Extras de status: modelos de restauração predefinidos
- 🎨 Configuração de tema: paleta de cores personalizável via propriedades CSS `--odon-*`
- 📱 Interações de toque para dispositivos móveis (tocar-para-zoom, pressão longa, pinça-para-zoom, alternância de arcada)
- 🔌 Sistema de plugins SVG personalizados
- ⚠️ Sistema de validação de estado e tooltip
- ♿ Acessibilidade por teclado e suporte ARIA
- 🔒 Modo somente leitura
- ✨ Animações de seleção
- 📝 Sistema de anotações por dente
- 🧪 Suíte de testes automatizados (Vitest + Testing Library)

### 🛠️ Controles da interface

**🔝 Barra superior:**
- Seletor de idioma (dropdown HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Botão de alternância de modo escuro (ícone sol/lua, alterna entre tema claro e escuro)
- Seletor de sistema de numeração (dropdown FDI/Universal/Palmer)
- Botões Export Status / Import Status

**📊 Cabeçalho do gráfico:**
- Alternância de vista oclusal
- Alternância de visibilidade dos dentes do siso
- Alternância de visibilidade do osso
- Alternância de visibilidade da polpa
- Botão de limpar seleção

**🔍 Filtros de seleção:**
- Select All / All Present / Permanent / Milk / Implants / All Missing
- Select Upper / Upper Front 6 / Upper Molars
- Select Lower / Lower Front 6 / Lower Molars

**📋 Predefinições de status:**
- Reset All (resetar a boca)
- Primary Dentition (dentição decídua)
- Mixed Dentition (dentição mista)
- Alternância Edentulous (edêntulo)

**📦 Dropdown de extras de status:**
- Pontes de zircônia superior/inferior (12-22, 13-23, 16-26, arcada completa)
- Pontes de metal superior/inferior (12-22, 13-23, 16-26, arcada completa)
- Próteses parciais removíveis superior/inferior
- Próteses totais removíveis superior/inferior
- Próteses tipo barra com implantes superior/inferior

**🦷 Painel de edição do dente** (para o(s) dente(s) selecionado(s), agrupado em cartões recolhíveis):
- **Linha base:** seleção do dente (tipo base incl. variantes de coroa fraturada) e substrato do dente (natural/radix/broken/crownprep)
- **Linha de restauração:** o dropdown combinado de restauração "Fix: …" / "Kivehető: …" (opções fixas `restorationType`×`restorationMaterial` mais as opções de attachment/removível de `prosthesis`, condicionadas pelo tipo de dente); checkbox de infiltração marginal de coroa (apenas coroa/ponte); checkboxes de localização da coroa fraturada; alternâncias coroa necessária / substituição de coroa necessária
- **Linha de desgaste & descoloração:** dropdown de tipo de desgaste incisal/oclusal, dropdown de tipo de desgaste cervical, dropdown de causa de descoloração (cada um troca para uma alternância simples sim/não em Settings → Tooth details → modo simple)
- **Cartão de ortodontia:** aparelho, deriva mesial/distal, movimento vertical (extrusão/intrusão), alternância de rotação — mostrado em um dente natural presente
- **Cartão de cáries:** dropdown de modo de profundidade de cárie, checkbox de cárie subcoronária, dropdown de severidade de cárie radicular e o seletor de cárie por superfície B/M/O/D/L com um popup contextual de profundidade ICDAS/CARS e um badge de profundidade radiográfica
- **Cartão de restaurações:** dropdown de material de restauração, seletor de restauração por superfície (com material por superfície), indicador de defeito de restauração por superfície (marginal/fratura/desgaste), notas de dica de subcárie e de defeito de restauração
- **Cartão de raiz e periodonto:** seletor unificado "Pulp / Endo status", seletor de diagnóstico apical, seletor de subtipo de lesão periapical (apenas periodontite apical sintomática/assintomática), seletor de tipo de reabsorção radicular, seletor de grau de mobilidade, seletor de estado peri-implantar (apenas implantes)
- **Indicadores especiais:** plano/ferida de extração, vão fechado ausente, selante de fissuras, perda de ponto de contato, cálculo, pino parapulpar, ressecção endodôntica, pilar de ponte

### 🦷 Tipos e estados de dente

**Seleção do dente (tipo base):**
| Valor | Descrição |
|---|---|
| `none` | Dente ausente |
| `tooth-base` | Dente permanente |
| `milktooth` | Dente decíduo (de leite) |
| `implant` | Implante dentário |
| `tooth-under-gum` | Dente subgengival (não irrompido) |

**Variantes de dente fraturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrato do dente (dentes permanentes):**
`natural` (padrão), `radix` (resto radicular), `broken`, `crownprep` (preparado para coroa)

**Tipo de restauração (dentes permanentes):**
`none`, `crown`, `inlay`, `onlay` (apenas vista oclusal), `veneer`, `bridge`

**Material de restauração (dentes permanentes):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (coroas `metal` legadas migram para cá), `telescope`, `temporary`

**As opções de restauração são condicionadas pelo tipo de dente** (`restorationOptions()` em `src/registry/restorations.ts`): um implante oferece apenas os tipos de restauração `crown`/`bridge` (compostos com uma camada de conector de implante) mais as cinco entradas de attachment de `prosthesis` abaixo; um dente ausente/vão oferece apenas um pôntico `bridge` mais as duas entradas de prótese removível de `prosthesis`; um substrato `radix` oculta o controle de restauração por completo. Os antigos campos planos `crownMaterial`/`bridgeUnit` (valores de attachment de implante/ponte pré-v1.14) foram aposentados do modelo ativo — aceitos apenas como um caminho de migração somente leitura para payloads antigos.

**Prótese** (`prosthesis`; eixo removível/attachment ortogonal, exibido como entradas "Kivehető:" no dropdown de restauração combinado):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attachments de implante, com ou sem uma overdenture), `removable-partial`, `removable-full` (próteses dento-suportadas em um dente ausente/vão). Um dente tem ou uma restauração fixa ou uma prótese, nunca ambas — definir uma limpa a outra.

**Infiltração marginal de coroa** (`crownLeakage`; booleano): mostrada apenas quando `restorationType` é `crown` ou `bridge`; ativa a camada de artwork `crown-leakage`.

**Opções endodônticas (dentes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opções endodônticas (dentes decíduos):**
`none`, `endo-medical-filling`

`endo` e `pulpDx` são exibidos através de um único `<select>` unificado "Pulp / Endo status" (agrupado: polpa vital vs. tratado/endo) e são mutuamente exclusivos — escolher uma opção tratada (`endo != none`) reseta `pulpDx` para `normal` e escolher um diagnóstico pulpar reseta `endo` para `none`.

**Materiais de restauração (dentes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiais de restauração (dentes decíduos):**
`composite`, `gic`, `temporary`

**Superfícies de restauração/cárie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (apenas cárie)

**Modificações:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesão periapical** (`periapicalType`; qualifica o glifo periapical, mostrado apenas em periodontite apical sintomática/assintomática):
`none`, `granuloma`, `cyst` — opções de registro; o valor legado `abscess` ainda é aceito/armazenado mas não é mais oferecido no seletor, pois duplica o diagnóstico apical. Na importação ele é descartado: incorporado a `apicalDx` quando o dente carrega o modificador de inflamação, caso contrário limpo para `none`

**Diagnóstico pulpar** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (renderiza um glifo pulpar reduzido), `irreversible-pulpitis`, `necrosis` — mutuamente exclusivo com `endo`; normalizado para `normal` em um dente tratado endodonticamente

**Diagnóstico pulpar, latim prático** (`pulpLatin`; mostrado pelo seletor de polpa apenas quando `pulpDetailLevel` é `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Nível de detalhe pulpar** (`pulpDetailLevel`, configuração global): `simple`, `aae` (padrão), `latin` — controla qual vocabulário pulpar o seletor oferece

**Diagnóstico apical** (`apicalDx`; controla o glifo periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo de reabsorção radicular** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Estado peri-implantar** (`periImplant`; apenas implantes, estadiamento do World Workshop 2018): `mucositis` reutiliza o glifo gengival periodontal; `peri-implantitis-*` adiciona a camada `peri-implant-bone-loss` em opacidade escalonada por severidade (leve 0.4 / moderada 0.7 / grave 1.0). Implantes não renderizam mais o glifo de lesão periapical (sua inflamação é expressa por este eixo), e os checkboxes de inflamação/parodontal de `mods` ficam ocultos em implantes:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Severidade de cárie** (`cariesSeverity`; campo unificado por superfície, `0`–`6`): em uma superfície sem restauração é lida como a escala de profundidade de cárie ICDAS (`superficial` / `dentin` / `deep`, ou os códigos brutos ICDAS II `0–6` quando `enableIcdas` está ativo) e renderiza a camada primária `caries-{surface}`; em uma superfície com restauração é lida como uma pontuação CARS nomeada (`0` hígido … `6` cavidade extensa) e renderiza a camada `subcaries-{surface}` (cárie recorrente) — uma superfície nunca é primária e recorrente ao mesmo tempo

**Cárie radicular** (`rootCaries`; aciona a camada de artwork `caries-root` em um dente presente, opacidade orientada pela severidade — `active` 0.5 / `arrested` 0.7 / `active-cavitated` total):
`none`, `active`, `arrested`, `active-cavitated`

**Profundidade radiográfica de cárie** (`radiographicDepth`; por superfície, independente da escala visual de severidade ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Configurações de granularidade de cárie** (globais): `secondaryCariesMode` (`simple`/`standard`/`full`, padrão `standard`), `rootCariesMode` (`simple`/`severity`, padrão `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, padrão `off`), `cariesDepthEnabled` (booleano, padrão `true`) — cada uma reduz sua escala a uma visão de seletor mais simples sem alterar o valor armazenado

**Indicadores especiais:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Desgaste dentário** (`wearEdge`, `wearCervical`; tipo clínico por localização, condicionado a tooth-base + sem restauração + substrato natural; renderizam as camadas existentes `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Descoloração** (`discoloration`; causa por dente, condicionada a um tooth-base natural ou dente decíduo + sem restauração + substrato natural; tinge o preenchimento da coroa natural exibida — sem novo SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Defeito de restauração** (`fillingDefect`; por superfície, achado de restauração direta independente da cárie recorrente — condicionado às superfícies presentes em `fillingSurfaceMaterials`; renderiza a camada de artwork `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodontia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; por dente, condicionado a um dente natural presente — permanente ou decíduo):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glifo de seta para cima), `intrusion` (glifo de seta para baixo) — `orthoRotation`: booleano

**Configurações de detalhe / notação do dente** (configurações globais de sessão, Settings → Tooth details): `wearDetailLevel` e `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, padrão `complex` — o modo simple mostra uma alternância sim/não em vez do dropdown completo de tipo/causa, sem alterar o valor armazenado) e `surfaceNotation` (`simple`/`full`, padrão `full` — controla se as letras/rótulos de superfície de cárie/restauração são cientes da posição; veja "Notação de superfície ciente da posição" acima)

### ⚙️ Configurações
Abertas pelo ícone de engrenagem na barra superior; um `dialog` ARIA com foco preso e layout em abas (Esc/clique no fundo para fechar, setas para trocar de aba). Todas as configurações são apenas estado de interface em nível de sessão, salvo indicação — nenhuma delas altera dados por dente ou o payload de exportação.

- **General:** sistema de numeração (FDI/Universal/Palmer), idioma, tema claro/escuro, visibilidade do painel de informações do dente
- **Odontogram:** perfil de anatomia dental (`classic` padrão / `measured`) — `measured` renderiza nove modelos de dentes medidos pela literatura em um layout de dois arcos com largura por dente; alternável em tempo de execução, sem efeito sobre o padrão `classic`
- **Panels:** mostra/oculta de forma independente o cartão de Statuses de boca completa e o cartão de Orthodontics (ambos visíveis por padrão)
- **Tooth details:** nível de detalhe de desgaste e nível de detalhe de descoloração (simple/complex, cada um padrão complex), notação de superfície (simple/full, padrão full)
- **Caries:** alternância de pontuação ICDAS II (`enableIcdas`), alternância de profundidade de cárie (`cariesDepthEnabled`), granularidade de cárie radicular (`rootCariesMode`: simple/severity), granularidade secundária/CARS (`secondaryCariesMode`: simple/standard/full), granularidade de profundidade radiográfica (`radiographicDepthMode`: off/threeLevel/detailed) — a antiga aba separada "Secondary caries" foi mesclada nesta, com o controle CARS posicionado diretamente acima de profundidade radiográfica
- **Pulpa:** nível de detalhe pulpar (`pulpDetailLevel`: simple/AAE/prático-latim, padrão AAE) — controla qual vocabulário o seletor "Pulp / Endo status" oferece; alterá-lo atualiza ao vivo o resumo de boca completa e todo tooltip aberto
- **Notes:** habilita/desabilita anotações por dente (`enableNotes`)
- **Periodontal:** alternâncias mostrar/ocultar por índice para todas as 16 linhas do gráfico perio (`perioRowVisibility`, padrão todas visíveis), agrupadas Pocket (PD/GM/CAL/BOP) / Hygiene (Plaque/PI/GI) / Mucogingival (visibilidade da JEC/Concavidade radicular/KG/GT) / Support (Furca/Mobilidade/Classe de Miller) / Peri-implant (mPI/mBI), cada linha com sua própria descrição; mais um modo de nome de índice traduzido-vs-canônico (`perioIndexNameMode`: `translated` padrão / `canonical` — um nome científico fixo em inglês/latim mostrado em todos os idiomas da interface). Apenas preferências de nível de aplicação (espelha `perioViewMode`) — nunca serializadas, os tooltips permanecem localizados em qualquer modo

### 🖼️ Sistema de modelos SVG

**Modelos de dente** (em `src/assets/teeth-svgs/`):
| Modelo | Dentes que o usam |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivos) |
| `13.svg` | 13, 23, 33, 43 (caninos) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (pré-molares) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molares) |

Os modelos são rotacionados 180 graus para a arcada inferior e espelhados horizontalmente para o lado esquerdo.

**SVGs de ícones** (em `src/assets/icon-svgs/`):
`icon_8.svg` (siso), `icon_gum.svg` (osso), `icon_no_selection.svg` (limpar), `icon_occl.svg` (vista oclusal), `icon_pulp.svg` (polpa)

### 🔢 Sistemas de numeração

**FDI (ISO 3950):** Dentes adultos 11-18, 21-28, 31-38, 41-48. Dentes decíduos 51-55, 61-65, 71-75, 81-85.

**Universal (EUA):** Dentes adultos numerados 1-32. Dentes decíduos com letras A-T.

**Palmer (Zsigmondy-Palmer):** Formato quadrante + posição (ex.: UR-1, LL-5). Dentes decíduos usam letras A-E por quadrante.

### 🚀 Uso
Desenvolvimento:
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

### 🔗 Integração
O componente pode ser incorporado em qualquer aplicação React.
Exemplo:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="pt-br"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integração do modo escuro:**
- **Modo autônomo:** Omita a prop `darkMode` — o componente gerencia seu próprio estado de tema via o botão de alternância na barra superior e adiciona/remove a classe `.dark` no `<html>`.
- **Modo controlado:** Passe `darkMode` e `onDarkModeChange` — a aplicação pai controla o tema. O botão de alternância ainda aparece mas chama `onDarkModeChange` em vez de gerenciar estado interno. A aplicação pai é responsável por adicionar/remover a classe `.dark` no `<html>`.

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

**Integração de plugins:**
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

### 🧪 Testes
```bash
npm run test           # Run the full Vitest suite
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### 📖 Documentação da API
```bash
npm run docs           # Generate TypeDoc docs in docs/
```

### 📡 API pública

**Props do componente:**

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `language` | `string` | `'hu'` | Idioma da interface (hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr) |
| `onLanguageChange` | `(lang) => void` | — | Callback quando o idioma muda |
| `numberingSystem` | `string` | `'FDI'` | Sistema de numeração (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback quando a numeração muda |
| `darkMode` | `boolean` | `undefined` | Estado do modo escuro. Omita para o modo autônomo. |
| `onDarkModeChange` | `(dark) => void` | — | Callback quando o modo escuro alterna. Obrigatório para o modo controlado. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Sobrescritas de cor personalizadas via propriedades CSS personalizadas (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugins SVG personalizados para sobreposições visuais e estado personalizado por dente. |
| `readOnly` | `boolean` | `undefined` | Desativa todas as interações (clique, toque, teclado). Útil para vistas de impressão/relatório. |
| `enableNotes` | `boolean` | `undefined` | Habilita anotações por dente. Clique duplo em um dente para adicionar/editar anotações. |

**Funções exportadas para controle externo:**

| Função | Descrição |
|---|---|
| `initOdontogram()` | Inicializa o motor e renderiza todos os dentes |
| `destroyOdontogram()` | Limpa o motor e remove os event listeners |
| `setNumberingSystem(system)` | Alterna entre FDI, Universal, Palmer |
| `clearSelection()` | Deseleciona todos os dentes |
| `setOcclusalVisible(on)` | Liga/desliga a vista oclusal |
| `setWisdomVisible(on)` | Mostra/oculta os dentes do siso |
| `setShowBase(on)` | Mostra/oculta a camada de osso |
| `setHealthyPulpVisible(on)` | Mostra/oculta a polpa saudável |
| `registerPlugins(plugins)` | Registra plugins SVG personalizados |
| `setPluginState(toothNo, pluginId, value)` | Define o estado personalizado de um plugin para um dente |
| `getPluginState(toothNo, pluginId)` | Obtém o estado personalizado de um plugin para um dente |
| `getToothStateSummary(toothNo)` | Obtém o resumo localizado de todos os estados ativos |
| `getOdontogramSummary()` | Obtém um resumo textual estruturado e localizado de todo o gráfico (contagens, seções) |
| `onStateChange(callback)` | Assina mudanças de estado; retorna uma função de cancelamento |
| `setReadOnly(value)` | Habilita/desabilita o modo somente leitura |
| `getReadOnly()` | Obtém o estado somente leitura atual |
| `setNotesEnabled(value)` | Habilita/desabilita anotações por dente |
| `getNotesEnabled()` | Obtém o estado atual de anotações habilitadas |
| `setPulpDetailLevel(level)` | Define o vocabulário do seletor de polpa — `"simple"`, `"aae"` ou `"latin"` |
| `getPulpDetailLevel()` | Obtém o nível de detalhe pulpar atual |
| `getChartMode()` | Obtém o gráfico atualmente ativo — `"status"` ou `"plan"` |
| `setChartMode(mode)` | Alterna o gráfico ativo para `"status"` ou `"plan"`; o gráfico de plano é copiado em profundidade do status na primeira vez que é acessado |
| `getStatusChart()` | Obtém o payload do gráfico de status (`{version, globals, teeth}`), independentemente de qual gráfico está ativo |
| `getPlanChart()` | Obtém o payload do gráfico de plano (`{version, globals, teeth}`), independentemente de qual gráfico está ativo |
| `setPlanChart(payload)` | Substitui os dentes do gráfico de plano a partir de um payload (o status permanece intocado); marca o gráfico de plano como inicializado |
| `getPlanChanges()` | Obtém o diff estruturado status→plan (`{ toothNo, axis, from, to }[]`) — uma entrada por dente por eixo de tratamento que difere entre os gráficos de status e plano; vazio quando não existe plano. Também exposto em `getOdontogramSummary()` como `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Define dados periodontais para um dos seis sítios (`patch` = `{ pd?, gm?, bop?, sup? }`); `pd` null/`<1` descarta o registro do sítio. Valida + limita (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Obtém o registro periodontal por sítio de um dente (apenas sítios registrados) |
| `getToothCal(toothNo)` | Obtém o CAL derivado por sítio (`pd + margem gengival`) para um dente |
| `getPerioSummary()` | Agregados periodontais de boca completa: contagem de sítios registrados, contagem de sangramento, %BOP, pior CAL, PD máximo |
| `getPerioChart()` | Obtém os registros periodontais por dente do gráfico ativo |
| `PerioChart` | Componente React (export nomeado) — a sobreposição de gráfico perio de boca completa (`{ open, onClose }`), montável independentemente do `OdontogramShell` para integração hospedeira |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Abre/fecha/consulta programaticamente a sobreposição do gráfico perio — permite que um host chame o gráfico periodontal separadamente do odontograma base (estado do caso compartilhado) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Obtém/define como o gráfico perio é exibido — `"toggle"` (uma alternância de visão `Odontogram \| Dental Chart`, padrão) ou `"popup"` (a sobreposição) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Obtém/define a sobreposição de destaque do Dental Chart — `"none"` (padrão) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`; repinta os dentes por essa medida (apenas visual sobre dados existentes) |
| `getToothRecessionType(toothNo)` | Obtém o **tipo de recessão de Cairo** derivado — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (calculado a partir do CAL interproximal vs vestibular do dente) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Visibilidade da JEC por dente — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Concavidade da superfície radicular por dente — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Grau do Índice de Placa de Silness-Löe por superfície — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Grau do Índice Gengival de Löe-Silness por superfície — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Largura da gengiva queratinizada vestibular por dente em mm — `0`-`15`, ou `null` se não registrado |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Fenótipo de espessura gengival por dente — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Classe de recessão de Miller por dente — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Apenas implantes — grau do Índice de Placa modificado de Mombelli (mPI) por superfície — `0`-`3`; sem efeito em um dente não-implante |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Apenas implantes — grau do Índice de Sangramento Sulcular modificado de Mombelli (mBI) por superfície — `0`-`3`; sem efeito em um dente não-implante |
| `furcationEntrances(toothNo)` | As entradas de furca de um dente — `["mesial","distal","buccal"]` (molares superiores), `["buccal","lingual"]` (molares inferiores), `["mesial","distal"]` (primeiros pré-molares superiores), caso contrário `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Define/obtém o envolvimento de furca por entrada (Glickman `1`–`4`; `null` limpa) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Define/obtém a presença de placa de O'Leary por superfície (mesial/distal/vestibular/lingual); alimenta o PI% de boca completa em `getPerioSummary()` |
| `getCaseMeta()` | Obtém o objeto de metadados em nível de caso (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — um único bloco compartilhado, não por dente/dual-state (espelha a chave de payload `globals` de nível superior); alimenta a classificação de estadiamento/graduação periodontal e o cabeçalho do relatório PDF |
| `setPatientName(v)` | Define o nome do paciente do caso (aparado; string vazia ou `null` limpa) — apenas identidade, nunca alimentado na derivação periodontal |
| `setPatientDob(v)` | Define a data de nascimento do paciente do caso (`YYYY-MM-DD`; inválido/vazio limpa) — apenas identidade do relatório PDF |
| `setExamDate(v)` | Define a data do exame do caso (`YYYY-MM-DD`; inválido/vazio limpa) |
| `setCaseAge(v)` | Define a idade do paciente do caso em anos — `0`-`120`, ou `null` para limpar |
| `setSmokingStatus(v)` | Define o status de tabagismo do caso — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Define cigarros/dia (só relevante quando o status de tabagismo é `"current"`) — `0`-`99`, ou `null` para limpar |
| `setDiabetesStatus(v)` | Define o status de diabetes do caso — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Define HbA1c % (só relevante quando o status de diabetes é `"present"`) — `3.0`-`20.0` (uma casa decimal), ou `null` para limpar |
| `setToothLossPerio(v)` | Define os dentes perdidos por periodontite — `0`-`32`, ou `null` para limpar |
| `setMaxRblPercent(v)` | Define a perda óssea radiográfica máxima % — `0`-`100`, ou `null` para limpar |
| `resetCaseMeta()` | Reseta o objeto de metadados em nível de caso para seus padrões vazios |
| `getPerioClassification()` | Obtém a classificação periodontal do World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnóstico/estágio/grau/extensão derivados dos dados perio registrados e dos metadados do caso, cada eixo substituído por sua sobrescrita clínica quando definida (`derived` sempre expõe os valores calculados intocados, `overridden` sinaliza quais eixos foram sobrescritos) |
| `setDiagnosisOverride(v)` | Sobrescreve o diagnóstico periodontal derivado — `"health"` / `"gingivitis"` / `"periodontitis"`, ou `null` para limpar (reverter ao derivado) |
| `setStageOverride(v)` | Sobrescreve o estágio periodontal derivado — `"I"` / `"II"` / `"III"` / `"IV"`, ou `null` para limpar (reverter ao derivado) |
| `setGradeOverride(v)` | Sobrescreve o grau periodontal derivado — `"A"` / `"B"` / `"C"`, ou `null` para limpar (reverter ao derivado) |
| `setExtentOverride(v)` | Sobrescreve a extensão periodontal derivada — `"localized"` / `"generalized"` / `"molar-incisor"`, ou `null` para limpar (reverter ao derivado) |
| `exportFhir(options?)` | Exporta o gráfico como um Bundle collection HL7 FHIR R4 (download JSON). Referência `{ subject }` opcional; caso contrário um Patient placeholder é embutido |
| `exportImage(format)` | Baixa o gráfico como uma imagem — `"png"` ou `"jpg"` |
| `exportSvg()` | Baixa o gráfico como um SVG escalável (vetorial) |
| `hasAnyPerioData()` | `true` se e somente se algum eixo periodontal estiver registrado em qualquer lugar da boca — controla o auto-skip da exportação perio e desabilita os itens de menu de exportação perio em um gráfico em branco |
| `exportPerioSvg()` | Baixa o gráfico periodontal completo (gráficos de dentes + linhas numéricas + classificação 2017) como um único SVG vetorial autônomo, construído headless a partir do estado via `buildPerioSvg()` |
| `exportPerioImage(format)` | Baixa o gráfico periodontal como uma imagem rasterizada — `"png"` ou `"jpg"` |
| `exportPdf(opts)` | Baixa um relatório PDF nativo em jsPDF (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, cada seção opcional) — texto vetorial mais imagens rasterizadas de dentes/gráfico perio; a seção de anotações individuais é pulada automaticamente quando nenhum dente tem nota, e as duas seções perio são puladas sempre que `hasAnyPerioData()` for falso, independentemente de `opts` |
| `importFhirBundle(input)` | Importa um Bundle FHIR R4 (objeto ou string JSON) produzido por este módulo |
| `setImportFormat(format)` | Define o parser da próxima importação de arquivo — `"status"` ou `"fhir"` |
| `startIntroTour()` | Inicia o tour interativo de introdução em 12 passos |

### 💾 Persistência de estado (localStorage)

Persistência opcional em `localStorage` para o estado de caso do odontograma (`src/persistence.ts`, reexportado do ponto de entrada do pacote). Desativada por padrão — integrações existentes não são afetadas a menos que uma aplicação hospedeira a habilite explicitamente, e deve ser chamada **após** o odontograma ter sido montado (a restauração repinta o DOM ao vivo via `importStatus()`):

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

| Função | Descrição |
|---|---|
| `enablePersistence(options?)` | Restaura um caso salvo anteriormente (se houver) via `importStatus()`, depois salva o gráfico de status no `localStorage` a cada mudança de estado. Idempotente — chamá-la novamente substitui a assinatura/opções anteriores. **Deve ser chamada após o odontograma ter sido montado.** |
| `disablePersistence()` | Para de persistir; a entrada armazenada é deixada no lugar. |
| `clearPersistedState()` | Remove a entrada armazenada para a chave ativa (ou padrão). |
| `isPersistenceEnabled()` | `true` enquanto uma assinatura de mudança de estado estiver ativa. |

**`PersistenceOptions`:**

| Campo | Tipo | Padrão | Descrição |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | A chave do `localStorage`. |
| `includePlan` | `boolean` | `false` | Também persiste o gráfico de plano (o campo `plan` do payload). |
| `onError` | `(err: Error) => void` | — | Chamado em qualquer erro de storage/parse em vez de `console.warn`. |

Notas: nada é lido de ou escrito no `localStorage` a menos que `enablePersistence()` seja chamada; um limite de tamanho de 4 MB pula um salvamento excessivamente grande (reportado via `onError`/`console.warn`) em vez de lançar exceção; toda falha de storage/JSON — cota excedida, um iframe bloqueado, dados armazenados corrompidos ou não reconhecidos, etc. — é capturada e reportada. Este módulo nunca lança exceção.

Nota: habilitar a persistência restaura o caso salvo via `importStatus()`, que substitui o caso atual — incluindo um gráfico de plano em andamento se o payload salvo não tiver nenhum. Habilite a persistência na inicialização (logo após a montagem), não no meio da sessão.

Nota: o payload persistido pode incluir dados de caso que identificam o paciente (nome do paciente, data do exame) em texto simples no `localStorage`. Se você registrar tais dados, garanta proteção em nível de dispositivo ou limpe-os com `clearPersistedState()` quando apropriado.

### 💾 Formato de exportação/importação de status
A exportação cria um arquivo JSON (versão `2.22`; a importação também aceita as versões legadas `1.4` e `2.0` até `2.21` e migra automaticamente) contendo:

**Campos globais:**
- `wisdomVisible` - dentes do siso visíveis
- `showBase` - camada de osso visível
- `occlusalVisible` - vista oclusal ativa
- `showHealthyPulp` - polpa saudável visível
- `edentulous` - modo edêntulo ativo

**Campos por dente (32 dentes):**
- `toothSelection` - tipo base do dente
- `toothSubstrate` - substrato do dente (natural/radix/broken/crownprep), ortogonal a qualquer restauração
- `restorationType` - tipo de restauração (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - material de restauração (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), pareado com `restorationType`
- `prosthesis` - eixo removível/attachment (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuamente exclusivo com um `restorationType` fixo de crown/bridge
- `crownLeakage` - flag de infiltração marginal de coroa, significativa apenas quando `restorationType` é crown ou bridge
- `endo` - estado endodôntico; mutuamente exclusivo com `pulpDx` (exibidos juntos via um único seletor unificado "Pulp / Endo status" — tratar um dente normaliza `pulpDx` para `normal`)
- `mods` - array de modificações (inflammation, parodontal); `inflammation` foi aposentado da interface em dentes presentes (`apicalDx` controla o glifo lá) mas ainda se aplica a dentes ausentes/alvéolos de extração
- `caries` - superfícies de cárie ativas
- `cariesActiveDepth` - o valor de profundidade ICDAS preparado pelo seletor de profundidade de cárie quando uma nova superfície é aplicada (não um valor armazenado por superfície; veja `cariesSeverity` para o campo armazenado por superfície)
- `rootCaries` - severidade de cárie radicular (none/active/arrested/active-cavitated)
- `cariesSeverity` - severidade unificada por superfície (0-6): profundidade ICDAS em uma superfície primária (não restaurada), pontuação CARS em uma superfície recorrente (restaurada)
- `radiographicDepth` - profundidade radiográfica de cárie por superfície (none/E1/E2/D1/D2/D3), independente da escala visual ICDAS/CARS
- `fillingMaterial` - material de restauração
- `fillingSurfaces` - superfícies restauradas
- `fillingSurfaceMaterials` - material de restauração por superfície (restaurações mistas, ex.: amálgama vestibular + resina composta distal)
- `fillingDefect` - defeito de restauração por superfície (none/marginal/fracture/wear), condicionado a superfície restaurada, independente da cárie recorrente
- `pulpDx` - diagnóstico pulpar AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis renderiza um glifo reduzido
- `pulpLatin` - subtipo pulpar em latim prático (mostrado pelo seletor de polpa apenas quando `pulpDetailLevel` é `latin`)
- `apicalDx` - diagnóstico apical que controla o glifo periapical
- `periapicalType` - subtipo de lesão periapical (none/granuloma/cyst), mostrado apenas em periodontite apical sintomática/assintomática; `abscess` legado ainda aceito na importação
- `resorptionType` - tipo de reabsorção radicular (none/internal/external-cervical)
- `periImplant` - estado peri-implantar apenas em implantes (none/mucositis/peri-implantitis-mild/-moderate/-severe), estadiamento do World Workshop 2018
- `dxOverrides` - sobrescritas de codificação diagnóstica por dente (versão 2.21): um objeto indexado pela chave de diagnóstico ICD-10 → `add` | `suppress`, forçando um diagnóstico codificado mesmo sem um achado correspondente no gráfico, ou suprimindo-o mesmo havendo um; molda o conjunto codificado efetivo exportado como `Condition`s do FHIR
- `endoResection` - flag de apicectomia
- `fissureSealing` - flag de selante de fissuras
- `calculus` - flag de cálculo
- `contactMesial` - perda de ponto de contato mesial
- `contactDistal` - perda de ponto de contato distal
- `wearEdge` - tipo de desgaste incisal/oclusal (none/attrition/erosion)
- `wearCervical` - tipo de desgaste cervical (none/abrasion/abfraction/erosion)
- `discoloration` - causa de descoloração por dente (none/tetracycline/fluorosis/nonvital/extrinsic/other), tinge o preenchimento da coroa natural em um tooth-base natural/dente decíduo sem restauração
- `orthoAppliance` - aparelho ortodôntico (none/bracket/band)
- `orthoDrift` - deriva ortodôntica (none/mesial/distal)
- `orthoVertical` - movimento vertical ortodôntico (none/extrusion/intrusion)
- `orthoRotation` - flag de rotação ortodôntica
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - localizações de fratura
- `extractionWound` - ferida pós-extração
- `extractionPlan` - extração planejada
- `parapulpalPin` - flag de pino parapulpar
- `bridgePillar` - dente pilar de ponte
- `mobility` - grau de mobilidade (none/m1/m2/m3)
- `crownNeeded` - indicador de coroa necessária
- `crownReplace` - indicador de substituição de coroa necessária
- `missingClosed` - vão fechado após extração
- `customStates` - estados personalizados de plugin (objeto, chaveado por ID de plugin)
- `note` - nota textual por dente (string, opcional — presente apenas quando não vazia)

**Campo `plan` de nível superior (versão 2.11+):**
- `plan` - objeto opcional, mesmo formato de `teeth` (campos por dente acima), contendo o gráfico de **plano** (pós-tratamento pretendido). Presente apenas quando o gráfico de plano foi inicializado (a alternância `Status | Plan` foi trocada para Plan pelo menos uma vez) E seu conteúdo difere do gráfico de status — uma exportação apenas de status o omite por completo e permanece idêntica byte a byte a uma exportação pré-2.11 exceto pelo número de versão. Na importação, um `plan` ausente limpa/descarta a inicialização do gráfico de plano (nunca ressuscita um plano obsoleto deixado antes da importação); um `plan` presente restaura o gráfico de plano junto com o status. O gráfico de plano também pode ser lido/escrito independentemente da importação/exportação via `getPlanChart()`/`setPlanChart()` (veja API pública acima), e `getStatusChart()` sempre retorna o payload status-primário independentemente do modo de gráfico ativo.

**Campo `case` de nível superior (versão 2.17+, estendido em 2.18, 2.19, 2.20 e 2.22):**
- `case` - objeto opcional contendo metadados em nível de caso (não por dente), compartilhado por ambos os gráficos de status e plano (espelha a chave `globals` de nível superior). Omite-quando-vazio: ausente por completo quando cada campo está em seu padrão, de modo que uma exportação sem caso permanece idêntica byte a byte exceto pelo número de versão. Campos (cada um omitido quando em seu padrão): `age`; `smokingStatus` (+ `cigarettesPerDay`); `diabetesStatus` (+ `hba1c`); `toothLossPerio`; `maxRblPercent`; as quatro sobrescritas clínicas por eixo da classificação 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`; (versão 2.19) `patientName` / `examDate`; e (versão 2.20) `patientDob`; e (versão 2.22) `caseConditions` — diagnósticos de caso/regionais (má oclusão e transtornos da articulação temporomandibular K07, cistos orais K09, doenças da glândula salivar K11, estomatite e mucosa oral K12/K13, anomalias de desenvolvimento em nível de arcada K00), cada um mapeado a uma lateralidade (não especificada / esquerda / direita / bilateral). Ele alimenta a classificação de estadiamento/graduação periodontal e o cabeçalho do relatório PDF; lido/escrito via `getCaseMeta()` e os setters `setCase*` (veja API pública acima). Nome do paciente, data de nascimento e data do exame são apenas metadados de identidade do gráfico — eles **não** fazem parte da exportação FHIR.

### 🖨️ Exportação
Além da própria exportação Status JSON / FHIR / PNG / JPG / SVG do odontograma, o **gráfico periodontal** tem seu próprio caminho de exportação:
- **Perio SVG/PNG/JPG:** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` renderizam o gráfico perio completo (gráficos de dentes + linhas numéricas + a classificação 2017) como um único SVG vetorial autônomo (`buildPerioSvg()`), independente do DOM do `PerioChart` montado. Os três itens de menu de exportação ficam desabilitados sempre que `hasAnyPerioData()` for falso (um gráfico em branco não tem nada perio para exportar).
- **Relatório PDF:** o item "PDF report…" do menu de exportação abre o `ExportOptionsModal` — um diálogo de configurações (campos de nome do paciente + data de nascimento + data do exame, ligados diretamente aos metadados do caso, com a data do exame assumindo hoje por padrão; checkboxes de seção: dados do paciente, gráfico do odontograma, descrição do odontograma, anotações individuais — desabilitado quando nenhum dente tem nota — status perio, descrição perio) antes de chamar `exportPdf(opts)`. Campos de identidade vazios recorrem a placeholders ("John Doe" / "1980-01-01") de modo que a exportação sempre tenha sucesso. O PDF é montado nativamente em jsPDF — texto vetorial via `.text()`, imagens rasterizadas de dentes/gráfico perio via `.addImage()` — **sem dependência de svg2pdf.js**. A seção de anotações individuais é pulada automaticamente quando nenhum dente tem nota, e as duas seções perio sempre que `hasAnyPerioData()` for falso, independentemente dos checkboxes do diálogo.
- **Gating de implante mPI/mBI:** os índices peri-implantares de Mombelli (mPI/mBI) só renderizam como linhas em uma arcada que contém pelo menos um dente de implante — tanto no gráfico perio ao vivo quanto nas exportações SVG/PDF.
- Nome do paciente, data de nascimento e data do exame são apenas metadados de identidade do gráfico (payload `2.20`, aditivo) — eles **não** fazem parte da exportação FHIR.

### 📁 Estrutura de pastas
- `src/App.tsx` - interface do shell, controles da barra superior, seletor de idioma/numeração/modo escuro/tema/plugin
- `src/odontogram.ts` - motor de camadas SVG, gerenciamento de estado do dente, interações de toque, sobreposições de plugin, wiring da interface
- `src/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, prioridades de z-index `LAYER_Z`
- `src/theme.ts` - tipo `OdontogramThemeConfig` e utilitário `applyThemeConfig()`
- `src/status_extras.ts` - 34 modelos de restauração predefinidos (pontes, próteses, construções tipo barra)
- `src/i18n/` - traduções (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) e hook de i18n
- `src/utils/numbering.ts` - conversão de numeração FDI, Universal, Palmer
- `src/registry/` - registry declarativo de eixos clínicos: mapeamentos de campo FHIR, ativação de SVG-clear-set/boolean-flag, matriz tipo×material de restauração, listas de opções de interface (fonte única de verdade gerando exportação/importação, FHIR e a interface do seletor)
- `src/fhir/` - exportação/importação HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemas de código, mapeamentos de campo, primitivos
- `src/bridgeOverlay.ts` - sobreposição de conector de vão de ponte multi-dente (geometria de sela ciente da arcada)
- `src/SettingsModal.tsx` - diálogo de Configurações em abas (General/Panels/Tooth details/Caries/Pulpa/Notes/Periodontal)
- `src/perioExport.ts` - `buildPerioSvg()`: o gráfico perio completo como um único SVG vetorial autônomo
- `src/perioPdf.ts` - o montador puro de relatório jsPDF de `exportPdf()` (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - o diálogo de configurações de exportação "PDF report…"
- `src/__tests__/` + `src/registry/__tests__/` - extensa suíte de testes automatizados em Vitest
- `src/assets/teeth-svgs/` - modelos SVG de dente (6 arquivos: incisivos, caninos, pré-molares, molares + vistas oclusais)
- `src/assets/icon-svgs/` - SVGs de ícones da barra de ferramentas (5 arquivos)

### ⚙️ Stack tecnológica
- React 18 + Vite + TypeScript
- Tailwind CSS para a estilização da interface
- Camadas SVG via manipulação do DOM (estado não-React para desempenho)
- Sistema de i18n personalizado e leve
- Vitest + Testing Library para testes automatizados
- TypeDoc para a documentação da API
- Alias de caminho do Vite: `@` mapeado para `./src`

### 📝 Notas
- Os modelos SVG são carregados de `src/assets/teeth-svgs` e `src/assets/icon-svgs`, então a hospedagem estática deve servir a pasta pública.
- O motor do odontograma usa seu próprio estado interno (não o estado do React) por desempenho e simplicidade.
- Dentes decíduos têm um conjunto reduzido de materiais disponíveis (sem restaurações de amálgama, sem endo baseado em pino).
- Dentes de implante têm um conjunto de opções de coroa/pilar diferente dos dentes naturais.

### 🔒 Notas de segurança

- **Plugins rodam como código confiável.** O valor de retorno de `renderSvg()` de um plugin é injetado no SVG do gráfico ao vivo. Essa saída é sanitizada com [DOMPurify](https://github.com/cure53/DOMPurify) (perfil SVG, mais `svgFilters`) antes da inserção — `<script>`, `<iframe>`, `<object>`, `<embed>` e `<foreignObject>` são proibidos por completo, e saídas totalmente maliciosas são descartadas em vez de parcialmente renderizadas. Isso reduz o raio de impacto de um plugin comprometido ou com bugs, mas os plugins ainda devem ser carregados apenas de fontes em que você confia — a sanitização é uma rede de segurança, não um substituto para a análise cuidadosa.
- **Content-Security-Policy.** O **build de produção** do demo injeta esta política via uma tag `<meta http-equiv="Content-Security-Policy">` (o dev server não é afetado):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Aplicações hospedeiras que incorporam `OdontogramShell` devem definir sua própria CSP apropriada ao seu deployment — o componente não injeta uma quando usado como biblioteca.

### 📖 Como citar

Se você usar este módulo em seu trabalho, por favor cite-o.

**Esta versão (v2.4.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Todas as versões (DOI conceitual):** https://doi.org/10.5281/zenodo.21156787

> O DOI conceitual de todas as versões acima sempre resolve para o release arquivado
> mais recente; um DOI específico de versão é gerado por release quando ele é
> arquivado no Zenodo. Até que a v2.4.0 seja arquivada, cite-a via o DOI conceitual.

Metadados de citação legíveis por máquina estão em [`CITATION.cff`](CITATION.cff).

## 🙌 Créditos

React Advanced Odontogram é criado e mantido por Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), criador e desenvolvedor principal de todo o motor. Com a valiosa ajuda dos colaboradores listados abaixo. Obrigado a todos que contribuíram.

**Colaboradores**

- [@odontodev](https://github.com/odontodev): hidratação de estado e API de ciclo de vida, configurações de restaurações como props controladas, setters idempotentes e cartões recolhíveis
- [@JulianoBazzi](https://github.com/JulianoBazzi): tradução para o português brasileiro
- [@yassine-bhn](https://github.com/yassine-bhn): tradução para o francês e a anatomia medida proposta
- [@saegerdirk-star](https://github.com/saegerdirk-star): anatomia dental medida e o gerador de dentes, além da proposta de interface componível

**Construído com** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) e [Tailwind CSS](https://tailwindcss.com).

As contribuições são bem-vindas. Abra um pull request no GitHub e você será creditado aqui. Se o projeto for útil para você, por favor [dê uma estrela no GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).
