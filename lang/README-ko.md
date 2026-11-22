<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/src/assets/react-module-logo.png" alt="React Advanced Odontogram 로고" width="160" />
</p>

# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Advanced-Odontogram/releases)
[![Version](https://img.shields.io/badge/version-2.9.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Advanced-Odontogram)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Advanced-Odontogram/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md) | 🇯🇵 [日本語](README-ja.md) | 🇰🇷 [한국어](README-ko.md)

---

## 📑 목차

- [📋 개요](#-개요)
- [📦 npm 패키지로 사용하기](#-npm-패키지로-사용하기)
- [✨ 주요 기능](#-주요-기능)
- [📦 모듈](#-모듈)
- [🛠️ UI 컨트롤](#-ui-컨트롤)
- [🦷 치아 종류와 상태](#-치아-종류와-상태)
- [⚙️ 설정](#-설정)
- [🖼️ SVG 템플릿 시스템](#-svg-템플릿-시스템)
- [🔢 치식 표기](#-치식-표기)
- [🚀 사용법](#-사용법)
- [🔗 통합](#-통합)
- [🧪 테스트](#-테스트)
- [📖 API 문서](#-api-문서)
- [📡 공개 API](#-공개-api)
- [💾 상태 유지(localStorage)](#-상태-유지localstorage)
- [💾 상태 내보내기/가져오기 형식](#-상태-내보내기가져오기-형식)
- [🖨️ 내보내기](#-내보내기)
- [📁 폴더 구조](#-폴더-구조)
- [⚙️ 기술 스택](#-기술-스택)
- [📝 참고](#-참고)
- [🔒 보안 관련 참고](#-보안-관련-참고)
- [📖 인용 방법](#-인용-방법)

## 🇰🇷 한국어

### 📋 개요
이 프로젝트는 브라우저에서 동작하는 대화형 치식도(odontogram) 편집기로, 깔끔한 UI로 빠른 치식 기록을 지원합니다. 수복물, 치아우식, 근관 상태, 동요도, 그 밖의 임상 세부사항을 표현하기 위해 레이어로 구성된 SVG 치아 템플릿을 그리며, 동시에 다중 선택, 선택 필터, 미리 정의된 상태 프리셋을 제공합니다.

---
![치식도 편집기 — 영어 미리보기](screenshot_en_odontogram.png)

🔗 **테스트 URL:** https://react-advanced-odontogram.vercel.app/

---

### 📦 npm 패키지로 사용하기

이 치식도는 자체 완결형 React 컴포넌트 라이브러리로 npm에 배포되어 있습니다:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### 요구 사항
- **React 18 또는 19**(peer dependency로 선언 — 애플리케이션이 제공합니다).
- `exports` 필드와 ESM을 이해하는 **번들러**: Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. 이 패키지는 **ESM 전용**입니다.
- 도구 실행을 위한 Node **18 이상**.

#### 설치

```bash
npm install react-advanced-odontogram react react-dom
```

#### 기본 사용법

`OdontogramShell`을 렌더링하고, 스타일시트를 애플리케이션 어딘가에서 **한 번만** 불러옵니다:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="ko"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr | ja | ko
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### 컴포넌트 props

`OdontogramShell`은 제어 컴포넌트입니다. 자주 쓰는 props:

| Prop | 타입 | 기본값 | 설명 |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI 언어(`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`/`fr`/`ja`/`ko`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | 치식 표기 방식. |
| `darkMode` | `boolean` | `false` | 다크 테마 전환. |
| `readOnly` | `boolean` | `false` | 모든 편집 비활성화(보기 전용). |
| `themeConfig` | `OdontogramThemeConfig` | — | 테마 CSS 변수(`--odon-*`) 재정의. |
| `plugins` | `OdontogramPlugin[]` | — | 사용자 정의 상태 플러그인/추가 레이어 등록. |
| `enableNotes` | `boolean` | `false` | 치아별 메모 활성화. |
| `enableIcdas` | `boolean` | `false` | ICDAS II 우식 평가 활성화. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | 충전 카드의 상세 수준: `"simple"`(치아당 재료 하나) 또는 `"complex"`(면별 재료). |
| `fillingDefectEnabled` | `boolean` | `true` | 충전 카드에서 충전물 결함 소견 활성화. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | 전부 사용 가능 | `amalgam`/`composite`/`gic`/`temporary`에 대한 불리언 맵으로 사용 가능한 충전 재료를 지정(알 수 없는 키는 무시). |
| `fissureSealingEnabled` | `boolean` | `true` | 충전 카드에서 치면열구전색 활성화. |
| `screenToothSpacing` | `"wide" \| "normal" \| "close"` | `"normal"` | 화면상 치아 간 간격. |
| `screenToothNumberSize` | `"small" \| "normal" \| "xlarge"` | `"normal"` | 화면 격자에서 치아 번호 크기. |
| `selectionColor` | `string` | `"#3b7bff"` | 선택 링 색상(`#rrggbb`). |
| `selectionBorderStyle` | `"solid" \| "dashed" \| "dotted"` | `"dashed"` | 선택 링 선 종류. |
| `toothInfo` | `boolean` | `true` | 치아 정보 패널 표시. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | 사용자가 설정 → 충전에서 해당 설정을 바꿀 때 발생. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | 사용자가 UI에서 설정을 바꿀 때 발생. |

더 세분화된 상세 수준 props(`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`)도 받습니다 — 완전하고 타입이 붙은 목록은 함께 배포되는 `.d.ts` 타입을 참고하세요.

위의 충전 관련 props 네 개는 **복원 전용**입니다: 생략한 prop은 엔진에 쓰지 않습니다(마운트 전에 명령형으로 호출한 `setFillingComplexity()`는 유지되며 독립 실행 모드도 그대로입니다). 반면 전달한 prop은 엔진과 설정 모달의 상태를 함께 바꾸므로, 모달이 오래된 값을 보여주는 일이 없습니다. `fillingMaterialAvailability`는 정규화된 직렬화 키를 기준으로 차이만 적용하므로, 내용이 동일한 인라인 리터럴로 다시 렌더링해도 엔진에 다시 쓰지 않습니다. 대응하는 `on*Change` 콜백은 설정 → 충전에서 발생합니다 — 설정을 저장하는 호스트를 위한 되쓰기 경로입니다.

#### 공개 API(명명된 익스포트)

`OdontogramShell`은 기본 익스포트이면서 명명된 익스포트이기도 합니다. 명령형 상태 API, 단독으로 쓸 수 있는 `PerioChart` 컴포넌트, 안내 투어, 그리고 모든 공개 타입은 같은 엔트리 포인트의 명명된 익스포트입니다:

```ts
import {
  OdontogramShell,           // 기본 익스포트이기도 함
  PerioChart,                // 단독으로 쓸 수 있는 치주 차트 컴포넌트
  // 상태 읽기
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // 상태 변화 구독
  // 내보내기 / 가져오기
  exportFhir,                // HL7 FHIR R4 번들
  exportSvg, exportImage,    // 벡터 / 래스터 차트 내보내기
  setImportFormat,
  // 제어
  setReadOnly, getReadOnly,
  clearSelection, getSelectedTeeth,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // 온보딩 투어 시작
  // …그 밖의 많은 setX/getX 설정 함수
} from "react-advanced-odontogram";
```

전체 표면(약 44개의 함수와 `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode` 등의 타입)은 함께 배포되는 선언 파일에 완전히 타입이 붙어 있습니다.

#### 조합 가능한 서피스(고급)

`OdontogramShell`은 지원되는 올인원 컴포넌트이며 추가 설정이 필요하지 않습니다. 치식도의 각 영역을 직접 만든 레이아웃의 다른 위치에 배치해야 한다면, 셸의 UI 서피스 네 개도 익스포트되어 있어 하나의 `OdontogramProvider` 아래에서 조합할 수 있습니다. 모두 패키지가 소유한 단일 세션을 공유합니다:

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
    <OdontogramProvider language="ko" numberingSystem="FDI">
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

`OdontogramProvider`는 `OdontogramShell`과 같은 props를 받습니다. 직접 서피스를 만들기 위한 `useOdontogramUi()` 훅(과 `OdontogramUiContextValue` 타입)도 제공됩니다. 현재 제약: 한 페이지에 프로바이더는 하나만 사용하세요. 서피스는 필요에 따라 마운트/언마운트할 수 있습니다 — 다시 마운트될 때 자동으로 재바인딩됩니다. `OdontogramShell` 자체는 달라지지 않았습니다 — 바로 이 조합을 기본 배치로 구성한 것입니다.

더 세밀하게 조합하려면 개별 컨트롤 카드도 익스포트되어 있습니다 — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard`, `DiagnosesCard`, `ToothDetailsCard` — 모두 자체 완결형 선언적 컴포넌트로, 엔진 API를 통해 공유 세션을 읽고 씁니다(직접 만들 때 쓸 `useEngineState()` 훅도 익스포트됩니다). 특정 레이아웃에 필요한 카드만, 원하는 배치로, 하나의 `OdontogramProvider` 아래에 마운트하세요. 치주 컨텍스트 사이드바와 증례 진단 대화상자도 익스포트됩니다 — `PerioSidebar`와 `CaseDiagnosesModal` — 따라서 셸을 대체하는 레이아웃에서도 둘 다 렌더링할 수 있습니다.

#### Next.js(App Router)에서 사용하기

이 컴포넌트는 클라이언트 전용이므로 Client Component에서 렌더링하세요:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="ko" numberingSystem="FDI" />;
}
```

또는 클라이언트 전용 동적 임포트로 불러옵니다: `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### 중요한 참고 사항과 현재 제약
- **ESM 전용** — 이 패키지는 단일 ES 모듈(`dist/odontogram.js`)과 타입 선언 엔트리(`dist/index.d.ts`)를 공개합니다. 번들러의 모듈 해석을 대상으로 하며, CommonJS 빌드는 없습니다.
- **스타일시트는 별도** — `react-advanced-odontogram/style.css`를 **반드시** 한 번 불러와야 합니다. 자동으로 주입되지 않습니다. 스타일은 `.odontogram-root` 아래로 범위가 지정된 전역 CSS이며 `--odon-*` CSS 변수로 제어합니다.
- **SSR / 클라이언트 전용** — 이 컴포넌트는 마운트 시 DOM(`document`)을 읽으므로 브라우저에서 실행되어야 합니다. SSR 프레임워크에서는 Client Component(`"use client"`) 안에서 렌더링하거나 클라이언트 전용 동적 임포트를 사용하세요.
- **애셋은 자체 완결형** — 치아와 아이콘 SVG는 빌드 시 JavaScript 번들에 인라인됩니다. **런타임 애셋 요청이 없으므로** 설정할 것도, public 폴더로 따로 복사할 것도 없습니다.
- **페이지당 인스턴스 하나** — 엔진 상태는 현재 모듈 수준 싱글턴이므로, 같은 페이지에 `<OdontogramShell>`을 두 개 렌더링하면 하나의 차트 상태를 공유하게 됩니다. 다중 인스턴스 지원은 향후 릴리스에서 예정되어 있습니다.

---

### ✨ 주요 기능
- 🖱️ 빠른 선택과 다중 선택(CMD/CTRL + 클릭)
- 🦷 치아 종류: 영구치, 유치, 임플란트, 치은 아래, 상실
- 🦷 치질(수복물과 직교하는 축): 건전, 잔존치근, 파절, 치관 형성 완료
- 👑 수복물은 종류 × 재료로 지정: 크라운/인레이/온레이/라미네이트 베니어/브리지체를 e.max, 금, 그라디아, 지르코니아, 메탈, 메탈세라믹, 텔레스코프, 임시 중 하나로(온레이는 교합면 보기 전용) — 클릭 수를 줄인 「고정: 크라운 – …」 통합 선택기에서 고릅니다. 기존 `metal` 크라운은 `metal-ceramic`(메탈세라믹)으로 이행합니다. 임플란트도 같은 종류 × 재료 모델을 쓰며 임플란트 커넥터 레이어와 합성됩니다. 선택기는 치아 종류로 범위가 정해집니다: 임플란트는 크라운/브리지만(그리고 아래의 다섯 가지 어태치먼트), 상실치는 브리지 폰틱만(그리고 국소의치/총의치), `radix`(잔존치근) 치질에서는 수복물 컨트롤 자체를 숨깁니다(잔존치근에는 수복물을 기록할 수 없습니다)
- 🦿 가철성·어태치먼트 보철은 전용 `prosthesis` 축에(통합 선택기의 「가철성:」 항목): 임플란트 힐링 어버트먼트, 로케이터, 로케이터 병용 피개의치, 바, 바 병용 피개의치, 그리고 치아 지지 국소의치 또는 총의치
- 🌉 브리지 치아는 크라운 캡과 새들 커넥터를 모두 그립니다. 여러 치아에 걸친 브리지 스팬 오버레이는 연속된 브리지 치아(폰틱 + 지대치)와 그 사이의 치간부를 가로질러, 치열궁을 고려한 하나의 연속 커넥터를 그립니다(상악과 하악은 새들 형상을 거울상으로 써서 어느 치열궁에서도 커넥터가 정렬됩니다). PNG/JPG/SVG 내보내기에도 포함되며, 상태 프리셋으로 브리지를 적용해도 오버레이가 즉시 재계산됩니다
- 🔍 6개 면의 우식 기록: 근심, 원심, 협면, 설면, 교합면, 치관 하부
- 🪥 면별 충전 재료: 아말감, 콤포지트 레진, 글라스아이오노머, 임시
- 🏥 「치수/근관 상태」를 하나로 통합한 선택기(생활 치수와 치료 완료/근관으로 묶음): 근관 상태(약제 근관충전, 근관충전, 불완전 근관충전, 글라스파이버 포스트, 메탈 포스트)와 AAE 치수 진단(`pulpDx`: 정상/가역성/비가역성 치수염/괴사)은 상호 배타적입니다 — 근관치료를 받은 치아(`endo` 설정됨)는 생활 치수 진단을 함께 가질 수 없습니다. 치료를 설정하면 `pulpDx`는 `normal`로 정규화되고 병적 치수 글리프는 억제됩니다. 가역성 치수염은 축소된 치수 글리프를 그립니다. 3단계 치수 상세 수준 설정(`pulpDetailLevel`: 간단/AAE/실용 라틴어)을 켜면 `pulpLatin`을 통해 9가지 실용 라틴어 치수 하위 유형(pulpa sana … gangraena pulpae)을 선택할 수 있습니다. 치근단절제와 치수인접 핀은 독립된 특수 지표로 남습니다
- 🦴 치근단 진단(`apicalDx`: 증상이 있는/없는 치근단 치주염, 급성/만성 치근단 농양, 경화성 골염)이 치근단 글리프를 직접 구동합니다. 육아종/치근낭이라는 병소 하위 유형 수식자는 증상이 있는/없는 치근단 치주염 아래에서만 표시됩니다(중복되던 「농양」 하위 유형은 폐지되었습니다 — 치근단 진단으로 이미 표현됩니다)
- 🩹 「치근과 치주 조직」 카드 통합(치근/치근단과 치주 소견을 하나의 접을 수 있는 섹션으로)
- ⚕️ 수식: 치근단 염증(상실치와 발치창 치아에만 표시. 현존치에서는 `apicalDx`만이 치근단 글리프를 구동하므로 숨기고, 임플란트에서는 `periImplant`가 담당하므로 숨깁니다), 치주 질환, 동요도(M1/M2/M3, 임플란트에서는 숨김)
- 🦷🔩 임플란트 주위 상태(`periImplant`: 없음/점막염/임플란트 주위염 경도·중등도·중증) — 2018년 World Workshop 병기 분류에 따라 임플란트에서 전용 선택기로 표시됩니다. 점막염은 기존 치주 치은 글리프를 재사용하고, 임플란트 주위염은 등급에 따른 `peri-implant-bone-loss` 레이어를 불투명도 0.4/0.7/1.0으로 활성화합니다. 임플란트는 더 이상 치근단 병소 글리프를 그리지 않으며(염증은 이 축으로 표현됩니다), 치주 수식 체크박스도 임플란트에서는 숨겨집니다(임시방편이던 「임플란트 주위염」 체크박스 라벨 변경은 폐지)
- 🏷️ 특수 지표: 치관 필요, 치관 재제작 필요, 폐쇄된 결손, 발치 예정, 치면열구전색, 접촉점 상실
- 👁️ 교합면 보기, 제3대구치, 골, 치수 표시 전환
- 🔢 12가지 선택 필터(전체, 현존치, 영구치, 유치, 임플란트, 상실, 상악/하악, 전치/대구치)
- 📊 미리 정의된 상태 프리셋(초기화, 유치열, 혼합치열, 무치악)
- 📦 34가지 미리 정의된 수복 템플릿(브리지, 가철성 의치, 임플란트 병용 바 피개의치)
- 💾 상태의 JSON 내보내기/가져오기(버전 2.22. 기존 1.4 및 2.0~2.21도 읽을 수 있고 자동으로 이행합니다. 플러그인의 사용자 정의 상태와 치아별 메모를 포함합니다)
- 💽 선택적 localStorage 유지(`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — 기본은 비활성. 켜면 상태가 바뀔 때마다 현재 차트(그리고 선택적으로 계획 차트)를 자동 저장하고 다음 마운트 때 복원합니다. 4 MB 크기 가드가 있고, 저장소나 파싱 오류는 예외를 던지지 않고 `onError` 콜백(또는 `console.warn`)으로 전달됩니다
- 🔗 HL7 FHIR R4 내보내기(치아별 Observation을 담은 collection Bundle, 영구치 **및** 유치(51-85, 가져올 때 무손실 왕복)의 ISO 3950 치아 코드, 로컬 코드 체계, 그리고 선택적 SNOMED CT 오버레이(설정 → SNOMED CT)). 중증도가 기록된 우식 컴포넌트는 점수 체계 코딩도 함께 갖습니다 — 충전되지 않은(일차) 면에서는 ICDAS, 충전된(이차) 면에서는 CARS. DX-11 이후 계획 차트도 함께 나갑니다: 계획된 각 처치는 해당 치아의 의도된 임상 상태로 코딩된 `ServiceRequest`(`intent: "plan"`)가 됩니다.
- ✚ 우식과 충전을 위한 십자형 면 선택 UI(B/M/O/D/L)
- 🧱 면별 수복 재료(혼합 충전, 예: 협면 아말감 + 원심 콤포지트)
- 🖼️ 차트의 PNG/JPG/SVG 이미지 내보내기(다운로드 가능. PNG/JPG는 벡터 SVG에서 래스터화)
- 🦷 우식/이차우식은 면별 상태 기계입니다: 충전이 없는 우식 면은 일차 우식으로 그려지고(ICDAS에 따른 불투명도), 그 면에 충전이 있으면 이차 우식으로 그려집니다(`subcaries-{surface}` 레이어, CARS로 점수화) — 같은 면에서 둘이 동시에 활성화되는 일은 없습니다
- 🎯 면별 통합 중증도(`cariesSeverity`, 0–6. 기존의 별도 ICDAS 깊이 + CARS 필드를 대체): 일차 면에서는 ICDAS 깊이로, 이차 면에서는 이름이 붙은 CARS 점수(건전 … 광범위한 우식공)로 읽히며, 그 면의 현재 상태에 해당하는 척도만 보여주는 맥락형 팝업으로 입력합니다
- 🌱 치근면 우식(`rootCaries`: 없음/활성/정지성/우식공을 동반한 활성). 전용 치근면 우식 아트워크 레이어를 중증도에 따른 불투명도로 활성화합니다(활성 0.5/정지성 0.7/우식공을 동반한 활성은 완전)
- 📡 방사선학적 우식 깊이(`radiographicDepth`: 면별로 없음/E1/E2/D1/D2/D3). 시각적 ICDAS/CARS 중증도 척도와 독립적이며, 배지로 표시되고 전용 FHIR Observation으로 왕복합니다
- 🎚️ 세 가지 우식 세분화 설정(`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`)과 `cariesDepthEnabled` 토글. 저장된 값을 잃지 않고 각 척도를 더 단순한 선택기 보기로 접을 수 있습니다
- 🩹 충전 패널의 이차우식 요약 줄: 이차우식이 있는 선택된 치아와 그 면을 충전 컨트롤 아래에 나열합니다(예: 「36 (O)의 충전물에 이차우식이 기록되어 있습니다.」)
- 🪛 면별 충전물 결함(`fillingDefect`: 없음/변연 결함/파절/마모)을 직접 수복물에. 이차우식과 독립적이며, 충전 카드의 면별 표시기로 입력하고(우식 깊이 표시기와 대칭, 선택 목록은 수직 배치), 차트에 그려지고, 툴팁과 전악 충전 요약에 명시적인 라벨과 함께 표시됩니다(예: 「36 (O) – 충전물 결함: O: 변연 결함」). 우식 줄에서 이차우식에 라벨이 붙는 것과 같은 방식입니다. 충전 카드는 충전물 결함이 기록된 선택된 치아에 대해 힌트 메모도 보여줍니다(예: 「36에 충전물 결함이 기록되어 있습니다.」). 기존 이차우식 힌트 메모와 짝을 이룹니다
- 🦷💥 임상적 원인과 위치로 유형화된 치아 마모(`wearEdge`: 없음/교모/부식, 절단·교합면. `wearCervical`: 없음/마모/굴곡파절/부식, 치경부) — 두 개의 켜고 끄는 이갈이 마모 플래그를 대체합니다. 마모 행의 두 드롭다운으로 입력하고, 기존 마모 아트워크를 재사용하며, 툴팁과 새로운 전악 「마모」 요약 섹션에 표시됩니다
- 🎨 원인별 치아 변색(`discoloration`: 없음/테트라사이클린/불소증/실활/외인성/기타)을 영구치와 유치에. 수복물이 없고 치질이 건전한 치아에서는 표시되는 자연 치관을 대표 색으로 착색합니다. 툴팁과 새로운 전악 「변색」 요약 섹션에 표시되며, 충전물 결함과 마모와 함께 표면·구조적 병태 집합을 완성합니다
- ✏️ 전치(절치·견치)는 UI 전체(선택기, 팝업, 요약)에서 교합면을 「절단」으로 표시합니다. 저장되는 면 키는 `occlusal` 그대로입니다
- 🔤 위치를 고려한 치면 표기(설정 → 치아 상세 → 「치면 표기」, 간단/전체, 기본은 전체): 전체 모드에서는 우식·충전 면의 기호와 라벨이 치아 해부를 따릅니다 — 교합면 → 전치에서는 I/절단, 협면 → 전치에서는 L/순면, 설면 → 상악에서는 P/구개면, 하악에서는 L/설면(근심·원심·치관 하부는 영향을 받지 않습니다). 간단 모드는 치아 위치와 무관하게 항상 일반적인 B/M/O/D/L/SC를 씁니다. 전악 요약과 우식 및 충전물 결함 면 선택기(기호 + 설명)에 적용됩니다. 저장되는 면 키는 영향을 받지 않습니다
- 🦷↕️ 치아별 교정 기록(`orthoAppliance`: 없음/브라켓/밴드. `orthoDrift`: 없음/근심/원심. `orthoVertical`: 없음/정출/압하. `orthoRotation`: 불리언)을 현존하는 자연 치아(영구치 또는 유치)에 — v2.5.0 이후 잠들어 있던 교정 아트워크를 재사용합니다(새 SVG 없음). 차트, 툴팁, 새로운 전악 「교정」 요약 섹션에 표시됩니다
- 🪨 치석, 그리고 내부성/외부(치경부)성으로 유형화된 치근 흡수(`resorptionType`)
- 📏 면별 우식 깊이(표층/상아질/심층), 또는 `enableIcdas`로 선택적인 ICDAS II 점수화(0–6)
- 🩹 치관 변연 누출 토글. 크라운 또는 브리지 수복이 있을 때만 표시됩니다
- 🧬 표준 기반 진단 코딩(WHO ICD-10, 항상 활성): 기록된 각 소견에서 ICD-10 코드가 붙은 진단을 도출합니다 — 우식(K02), 치근면/백악질 및 정지성 우식(K02.2/.3), 치수염과 치수 괴사(K04.0/.1), 치근단 치주염, 치근단 농양과 치근낭(K04.4–.9), 교모/마모/부식/굴곡파절(K03.0–.8), 치석(K03.6), 흡수(K03.3), 변색(K00.3/K00.8/K03.7), 치아 상실(K08.1), 잔존치근(K08.3), 치아 파절(S02.5) — 툴팁과 전악 요약에 표시되고 FHIR Condition으로 내보내집니다.
- 🩺 치아별 진단 카드: 그 치아에서 도출된 ICD-10 진단을 확인하고 조정할 수 있습니다 — 잘못 도출된 것을 억제하고, 차트가 표현하지 못하는 것을 추가할 수 있습니다. 실효 집합(도출 − 억제 + 추가)이 FHIR 내보내기를 구동합니다.
- 🗺️ 증례/영역 병태: 단일 치아에 묶이지 않는 전악 진단을 기록할 수 있습니다 — 부정교합과 측두하악관절(K07), 구강의 낭(K09), 타액선 질환(K11), 구내염과 구강 점막(K12/K13), 치열궁 수준의 발육 이상(K00) — 각각 선택적으로 좌/우/양측을 지정할 수 있습니다.
- 🌍 국가별 코드 팩(설정 → 진단 코드 체계): WHO ICD-10을 기반으로 국가별 코드 체계를 덧씌웁니다 — BNO-10(헝가리, 현지화된 표시. WHO 코드는 유지) 또는 미국 ICD-10-CM(코드 재매핑, 예: K07 치아악안면 범위 → M26). 다른 국가의 팩을 추가하는 일은 작은 `CodingPack` 항목을 추가하는 것입니다 — `CODING_PACKS.md`를 참고하세요.
- 🔬 SNOMED CT 오버레이(설정 → SNOMED CT, 선택적, 기본 꺼짐): WHO 및 국가별 팩 코딩과 나란히 SNOMED CT 코딩을 추가하고, WHO ICD-10 코드가 없는 임플란트 주위 소견도 코딩합니다. ICD-10-CM과 SNOMED 개념 ID는 참고용·최선 노력입니다 — 임상 사용 전에 공식 ICD-10-CM 목록/SNOMED CT 브라우저로 검증하세요.
- 🔁 FHIR Condition 왕복: 진단은 Observation과 나란히 FHIR `Condition` 리소스로 내보내지고(치아에 연결된 것, 그리고 좌우를 bodySite로 갖는 환자 수준의 증례 병태), 가져올 때 이를 재구성합니다 — 증례 병태는 직접, 치아별 추가/억제 재정의는 가져온 Condition과 다시 도출한 차트를 비교해 복원합니다.
- 🩺 **진단 카드, 개정:** 치아별 각 진단 행은 ICD-10 코드를 먼저 보여주고(`K04.0 치수염`) 행은 코드순으로 정렬됩니다. 각 행에는 **제외** 토글(FHIR 내보내기에서 빼면서 차트에는 남김)과 **삭제**(×, 진단*과* 그 치아의 소견을 함께 삭제)가 있습니다. 선택기에서 진단을 추가하면 뒤에 있는 차트 소견이 기록되므로 글리프가 즉시 나타납니다.
- 🗂️ **증례/영역 진단 팝업:** 전악 및 영역 진단(악골 이상, 낭, 타액선과 점막 질환…)은 치주 사이드바에서 독립된 대화상자로 옮겨졌고, 치식도/치주 상태 토글 옆의 **진단** 버튼으로 엽니다. 그 선택기도 코드 우선·코드순입니다.
- 🇭🇺 **BNO-10 팩:** 헝가리어 표시 문자열은 공식 NEAK BNO-10 명칭이 되었고, 팩은 표준 ICD-10 시스템 URI를 사용합니다(BNO-X는 WHO ICD-10과 동일합니다).
- ✅ **HL7 검증기에서 깔끔한 FHIR 내보내기:** Bundle의 각 항목은 결정적인 `id`와 절대 `fullUrl`을 가지며(`urn:uuid` 자리표시자를 쓰지 않습니다), Bundle은 엔진 자신의 **CodeSystem**을 포함하므로 검증 중에 로컬 코드가 해석됩니다. 같은 CodeSystem은 저장소에 `fhir/CodeSystem-odontogram.json`으로 공개되어 있습니다(FHIR 내보내기 옵션에서 `includeCodeSystem: false`를 전달하면 생략할 수 있습니다).
- 🎯 **차트를 따라가는 ICD 코드(데이터 기반 특이성).** 우식 깊이는 방사선학적 깊이가 기록되어 있으면 그것을 쓰고(E1/E2 → 법랑질, D1–D3 → 상아질), 없으면 ICDAS 중증도로 돌아갑니다(1–3 → 법랑질, 4–6 → 상아질). 이로써 WHO의 `K02`는 `K02.0`/`K02.1`로, ICD-10-CM의 `K02.9`는 면 × 깊이에 따라 `K02.51/.52`(소와열구) 또는 `K02.61/.62`(평활면)로 정밀해집니다. 만성 치주염은 2017년 병기와 분포에서 ICD-10-CM 코드(`K05.311`–`K05.329`)를 가져옵니다. 치아당 하나의 Condition이 가장 깊은 병변을 담습니다.
- 🔄 **치주 데이터가 FHIR로 왕복합니다.** 가져오기는 LOINC 74029-0 치주 패널을 각 치아로 되읽습니다 — 치주낭 깊이, 치은 변연(CAL에서 재구성하므로 가성낭 값도 보존됩니다), BOP, 치근분지부, O'Leary 치태, PI/GI와 임플란트 mPI/mBI 지수, 부착치은 폭 — 그리고 흡연 상태와 HbA1c 근거 Observation까지. ICD-10-CM 또는 SNOMED CT로만 코딩된 Condition도 인식하므로, 외부 번들에서도 읽을 수 있는 것은 읽습니다.
- 🧬 **진단 카탈로그 전체에 SNOMED CT.** 50개 자리 중 48개가 검증된 SNOMED CT International 개념(활성, 코어 모듈, FSN 일치)을 갖습니다. 두 개는 의도적으로 비워 두었습니다 — SNOMED International에 포괄 개념이 없기 때문으로, 악골 크기 이상(K07.0)과 치아악안면 기능 이상(K07.5)입니다. SNOMED 오버레이는 설정에서 선택하는 방식 그대로입니다.
- 📦 **불러올 수 있는 FHIR 용어 패키지.** 저장소의 `fhir/` 폴더는 FHIR NPM 패키지(`react-advanced-odontogram.fhir`, FHIR 4.0.1)로, 엔진 CodeSystem과 생성된 ValueSet을 담고 있습니다 — 임상 축의 값 그룹마다 하나, 소견 유형용 하나, 전체 코드 집합 하나. 검증기에 `-ig ./fhir`로 전달할 수 있습니다.
- 🧰 통합된 상단 바 아이콘 줄과 탭이 있는 설정 모달(일반/패널/치아 상세/우식/치수/메모/치주 — 치식 표기, 메모, 패널 표시, ICDAS, 우식 깊이 토글, 치근면/방사선학적 우식 세분화, 치수 상세 수준, 치아 마모·변색 상세 수준, 치아 정보)
- 🗂️ 설정 → 「패널」 탭: 상태와 교정 전악 요약 패널을 개별적으로 표시/숨김
- 🦷🩺 설정 → 「치주」 탭: 치주 차트 행에 대한 16개의 지수별 표시/숨김 토글(치주낭/구강 위생/치은점막/지지 조직/임플란트 주위로 묶음 — PD/GM/CAL/BOP, 치태, PI, GI, CEJ 식별성, 치근 함몰, KG, GT, 치근분지부, 동요도, Miller 분류, mPI, mBI). 각각 설명이 붙고, 지수 명칭을 번역할지 표준 표기로 쓸지 선택하는 표시 옵션이 더해집니다(표준 표기 = 어떤 UI 언어에서도 고정된 영어/라틴어 학술명. 툴팁은 이 설정과 무관하게 항상 현지화됩니다). 둘 다 앱 수준 설정(`perioViewMode`와 같이)이며 내보내기 페이로드에는 전혀 포함되지 않습니다
- 🩹 이차우식(CARS) 설정 컨트롤을 우식 설정 탭으로 통합하고 방사선학적 깊이 위에 배치(별도 「이차우식」 탭은 폐지)
- 🎚️ 치아 상세의 상세 수준(설정 → 치아 상세): 치아 마모와 변색에 대한 간단/상세 설정. 간단 모드는 소견별로 유/무 토글을 보여주고(마모 켜짐 → 교모/마모, 변색 켜짐 → 기타), 상세 모드(기본)는 종류·원인 드롭다운을 유지합니다. 상세 수준을 바꿔도 저장된 값은 보존됩니다
- 📋 치아 정보 패널: 차트 전체의 실시간 텍스트 요약(치아 수, 현존/상실 목록, 이차를 포함한 우식, 충전, 근관치료, 보철, 임플란트, 치주 상태) — 기본으로 표시되며 설정에서 전환할 수 있습니다
- 🗂️ 내보내기 드롭다운 통합(상태 JSON/FHIR/PNG/JPG)
- 📥 FHIR 가져오기를 갖춘 가져오기 드롭다운(내보낸 Bundle을 왕복할 수 있습니다)
- ⏳ 이미지 내보내기 중 진행 오버레이
- 🎓 18단계 대화형 소개 투어
- 🔢 세 가지 치식 표기(FDI, 유니버설, 팔머)
- 🌐 다국어 지원 — 14개 UI 언어(HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO)와 언어 전환기. 아랍어는 UI를 오른쪽에서 왼쪽으로 그리고 치식/치주 차트는 왼쪽에서 오른쪽으로 고정합니다(기계 번역이며 AR/ZH/FR/JA/KO는 모국어 화자 검토 대기 중입니다). 주 번들에는 영어만 들어갑니다 — 다른 모든 언어는 별도 청크로, 처음 선택될 때 받아옵니다
- 🌗 토글 버튼이 있는 다크 모드 지원(단독 또는 상위 앱이 제어)
- 🎨 CSS 사용자 정의 속성(`--odon-*`)을 통한 테마 설정(`themeConfig` prop)
- 📱 모바일 터치 UX: 탭하면 확대되는 팝오버, 길게 눌러 여는 컨텍스트 메뉴, 핀치 줌, WCAG 44px 터치 영역, 치열궁 전환 내비게이션
- 🔌 사용자 정의 SVG 플러그인 시스템: 시각 오버레이 주입, 치아별 사용자 정의 상태, JSON 내보내기/가져오기 지원 — 플러그인의 `renderSvg()` 출력은 라이브 차트에 삽입되기 전에 DOMPurify(SVG 프로필)로 소독됩니다. 그래도 플러그인은 신뢰된 코드로 실행되므로, 신뢰할 수 있는 출처의 플러그인만 불러오세요
- 🛡️ Content-Security-Policy: 데모의 프로덕션 빌드는 CSP 메타 태그를 주입합니다(개발 서버는 영향 없음) — 이 컴포넌트를 임베드하는 호스트 앱은 자체 CSP를 설정해야 합니다
- ⚠️ 양립할 수 없는 치아 상태 조합에 대한 상태 검증 경고
- 🏷️ 치아 타일에 자동으로 나타나는 상태 툴팁(활성화된 모든 상태를 표시)
- 🩺 현대화된 치아별 툴팁과 전악 요약 패널: 둘 다 임상 소견 전체를 보여줍니다(치수/치근단 진단 + 병소 하위 유형, 치근 흡수, 임플란트 주위 상태, 등급이 붙은 치근면 우식, 치석, 치관 변연 누출, 파절, 접촉 상실, 유형화된 절단·치경부 마모). 패널에는 전용 「진단」 섹션과 「마모」 섹션, 그리고 거친 우식 중증도 수식자(표층/중등도/심층)가 붙습니다
- ♿ 키보드 접근성(WCAG): ARIA listbox/option 역할, Enter/Space 선택, 화살표 키 이동, focus-visible 외곽선
- 🔒 읽기 전용 모드: 인쇄·보고서·열람 용도로 모든 상호작용을 비활성화
- ✨ 선택 애니메이션: 선택된 치아의 맥동하는 파선 테두리와 빛나는 그림자(prefers-reduced-motion 지원)
- 📝 치아별 메모: 두 번 클릭해 메모 추가·수정, 치아 번호 옆 메모 아이콘, 마우스를 올리면 메모 본문 툴팁, 전악 요약 패널의 「개별 메모」 줄, PDF 보고서 포함, JSON 내보내기/가져오기
- 🔀 현재 ↔ 계획 차트 분리: 차트 머리글의 `현재 | 계획` 토글이 현재 **상태** 차트와 **계획**(치료 후 의도하는 상태) 차트를 전환합니다. 각각 고유한 치아 상태를 가집니다. 계획 차트는 처음 전환할 때 현재 상태의 복사본으로 시작하며, 한쪽 차트의 편집이 다른 쪽에 영향을 주지 않습니다. 내보내기/가져오기(`exportStatus`/`exportFhir`/파일 가져오기)는 항상 현재 상태 차트를 대상으로 하고, 계획 차트는 고유한 API로 따로 읽고 씁니다(아래 공개 API 참고). 현재 상태와 다를 때는 JSON 내보내기에 추가 `plan` 섹션으로 포함됩니다
- 📝 「무엇이 바뀌는가」 상자: 계획이 현재 상태와 다를 때, 치아 정보 패널 아래 상자에 치아별·처치 축별(유무, 치질, 수복물, 보철, 계획된 치관, 교정, 치수/근관, 치근단) 모든 차이를 `치아: 축  변경 전 → 변경 후` 줄로 나열합니다. `getPlanChanges()`로 프로그램에서도 가져올 수 있습니다

![전악 치주 차트 — 영어](screenshot_en_perio.png)

- 🩺 치주 기록: 치아별 표준 6개 부위에서 **치주낭 깊이**, **치은 변연**, **탐침 시 출혈**(+ 배농)을 기록하고, **임상적 부착 수준(CAL = PD + 치은 변연)**, 치은퇴축, 전악 **%BOP**를 도출합니다. **그래픽 전악 치주 차트**는 각 치열궁을 **협면과 구개(설)면의 독립된 두 SVG**로 그리고(치아 아트워크를 재사용하며 두 면 모두 치관이 중앙 띠를 향하는 일관된 방향으로. 임플란트 치아에는 **임플란트 그래픽**), 붉은 **CEJ 선**, **숫자가 붙은 밀리미터 안내 격자**, 치아 위에 겹치는 **치은 변연/치주낭 깊이 곡선**을 갖추고, **중앙 치주 지수 띠**(`▲ 협면 … 설면/구개면 ▼`로 표시)로 위아래가 나뉩니다. 이 띠는 치아 전체에 공통인 지수를 담아 **Miller 분류**를 치열궁 바로 위에, **치태/PI/GI/mPI/mBI**를 치아별 **해부학적 다이아몬드 타일**로 그립니다(협면이 위 꼭지점, 설면이 아래 꼭지점, 가운데 줄의 근심·원심은 좌우에 따라 뒤바뀌어 근심이 항상 치열궁 정중선을 향합니다). 숫자 행(완전한 지수 이름 — PD/GM/CAL/BOP + 동요도 + 치근분지부 — 을 터치하기 쉬운 큰 셀로)은 열로 정렬되고 요약(평균 PD/CAL, %BOP, PI%)이 붙습니다. 입력은 **키보드 자동 이동**으로 할 수 있습니다. 차트는 **사용 가능한 너비를 채우도록 동적으로 크기가 조절되며** 어떤 창 크기에서도 반응합니다. `치식도 | 치주 상태` **보기 전환**으로 제시되며, 그 보기가 활성인 동안 오른쪽 패널은 **치주 컨텍스트 사이드바**(환자 정보, 2017년 분류, 전악 요약)로 전환됩니다(설정 옵션으로 전체 제시 방식을 **팝업**으로 되돌릴 수 있습니다). 또한 여전히 **단독으로 호출할 수 있는 컴포넌트**(`PerioChart` 익스포트)이므로, 호스트 앱은 기본 치식도와 독립적으로 치주 차트를 띄울 수 있습니다. 부위별 **FHIR** 내보내기는 LOINC 치주 패널(`74029-0`. PD `32910-2`, 치은퇴축 `32911-0`, CAL `32912-8`)을 통합니다
- 🅿️ 제안 스타일링: 계획 모드에서는 계획이 현재 상태에 **추가**하는 소견(계획된 치관, 발치, 교정적 이동, 보철 …)이 뚜렷한 **파선의 색조가 들어간 「제안」 외곽선**으로 그려져, 계획이 사실이 아니라 의도로 읽히게 합니다. 차트 카드에는 「파선 = 제안」 범례가 붙습니다. 현재 상태 모드의 렌더링은 바이트 단위로 동일하며, 이 처리는 계획 모드 전용이고 되돌리면 완전히 초기화됩니다
- 🚦 계획 모드의 제한: 계획 차트는 치과의사가 *할 수 있는* 것만 보여줍니다 — 기본 선택기는 상실/영구치/임플란트만 제공하고, 현재 상태 전용 소견(우식, 치아 마모, 변색, 그리고 치주 블록 전체 — 동요도, 6부위 탐침 격자, 염증/치주 수식, 치석, 임플란트 주위 상태)은 숨겨집니다. 치수/근관 컨트롤은 근관 **치료**(근관치료/포스트/치근단절제/치수인접 핀)를 남기고 치수/치근단 **진단**과 치근 흡수를 숨깁니다. 수복물, 보철, 교정, 치관 필요·재제작, 발치 예정은 계획 가능한 상태로 남습니다
- 🧪 치식 표기, 번역, 프리셋, 다국어, App 컴포넌트, 테마, 터치, 플러그인, 접근성, 임상 축·진단 패리티를 포괄하는 광범위한 Vitest 자동 테스트 모음
- 📖 모든 공개 익스포트에 JSDoc 주석을 붙인 TypeDoc API 문서(`npm run docs`)

### 📦 모듈
- 🦷 치식도 격자와 치아 타일 UI
- 🎛️ 컨트롤과 상태 패널
- 🎨 SVG 레이어링 엔진과 템플릿
- 🔢 치아 번호와 라벨 매핑(FDI/유니버설/팔머)
- 🌐 현지화 — 14개 UI 언어(HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO). 아랍어(RTL) 포함
- 💾 상태 내보내기/가져오기
- 📋 상태 추가 프리셋: 미리 정의된 수복 템플릿
- 🎨 테마 설정: `--odon-*` CSS 속성으로 조정할 수 있는 색상 팔레트
- 📱 모바일 터치 상호작용(탭하면 확대, 길게 누르기, 핀치 줌, 치열궁 전환)
- 🔌 사용자 정의 SVG 플러그인 시스템
- ⚠️ 상태 검증과 툴팁 체계
- ♿ 키보드 접근성과 ARIA 지원
- 🔒 읽기 전용 모드
- ✨ 선택 애니메이션
- 📝 치아별 메모 기능
- 🧪 자동 테스트 모음(Vitest + Testing Library)

### 🛠️ UI 컨트롤

**🔝 상단 바:**
- 언어 전환기(HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO 드롭다운)
- 다크 모드 전환 버튼(해/달 아이콘. 라이트와 다크 테마를 전환합니다)
- 치식 표기 전환기(FDI/유니버설/팔머 드롭다운)
- 상태 내보내기 / 상태 가져오기 버튼

**📊 차트 머리글:**
- 교합면 보기 전환
- 제3대구치 표시 전환
- 골 표시 전환
- 치수 표시 전환
- 선택 해제 버튼

**🔍 선택 필터:**
- 전체 선택 / 현존치 전체 / 영구치 / 유치 / 임플란트 / 상실치 전체
- 상악 선택 / 상악 전치 6개 / 상악 대구치
- 하악 선택 / 하악 전치 6개 / 하악 대구치

**📋 상태 프리셋:**
- 전체 초기화(구강 초기화)
- 유치열
- 혼합치열
- 무치악 전환

**📦 상태 추가 프리셋 드롭다운:**
- 상악/하악 지르코니아 브리지(12-22, 13-23, 16-26, 전체 치열궁)
- 상악/하악 메탈 브리지(12-22, 13-23, 16-26, 전체 치열궁)
- 상악/하악 국소의치
- 상악/하악 총의치
- 상악/하악 임플란트 병용 바 피개의치

**🦷 치아 편집 패널**(선택한 치아에 대해. 접을 수 있는 카드로 묶여 있습니다):
- **치아 종류 행:** 치아 선택(파절 치관 변형을 포함한 기본 종류)과 치질(건전/잔존치근/파절/치관 형성 완료)
- **수복물 행:** 통합된 「고정: …」/「가철성: …」 수복 드롭다운(`restorationType`×`restorationMaterial`의 고정 수복 선택지와 `prosthesis`의 어태치먼트·가철성 선택지. 치아 종류로 제한됩니다), 치관 변연 누출 체크박스(크라운/브리지만), 파절 치관 위치 체크박스, 치관 필요 / 치관 재제작 필요 토글
- **마모와 변색 행:** 절단·교합면 마모 종류 드롭다운, 치경부 마모 종류 드롭다운, 변색 원인 드롭다운(설정 → 치아 상세 → 간단 모드에서는 각각 유/무 토글로 바뀝니다)
- **교정 카드:** 장치, 근심/원심 이동, 수직 이동(정출/압하), 회전 토글 — 현존하는 자연 치아에서 표시됩니다
- **우식 카드:** 우식 깊이 모드 드롭다운, 치관 하부 우식 체크박스, 치근면 우식 중증도 드롭다운, 그리고 B/M/O/D/L 면별 우식 선택기(맥락형 ICDAS 깊이/CARS 팝업과 방사선학적 깊이 배지 포함)
- **충전 카드:** 충전 재료 드롭다운, 면별 충전 선택기(면별 재료 포함), 면별 충전물 결함 표시기(변연 결함/파절/마모), 이차우식과 충전물 결함 힌트 메모
- **치근과 치주 조직 카드:** 통합된 「치수/근관 상태」 선택기, 치근단 진단 선택기, 치근단 병소 하위 유형 선택기(증상이 있는/없는 치근단 치주염만), 치근 흡수 종류 선택기, 동요도 선택기, 임플란트 주위 상태 선택기(임플란트만)
- **특수 지표:** 발치 예정/발치창, 폐쇄된 결손, 치면열구전색, 접촉점 상실, 치석, 치수인접 핀, 치근단절제, 브리지 지대치

### 🦷 치아 종류와 상태

**치아 선택(기본 종류):**
| 값 | 설명 |
|---|---|
| `none` | 상실치 |
| `tooth-base` | 영구치 |
| `milktooth` | 유치 |
| `implant` | 치과 임플란트 |
| `tooth-under-gum` | 치은 아래(미맹출) 치아 |

**파절 치아 변형:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**치질(영구치):**
`natural`(기본), `radix`(잔존치근), `broken`, `crownprep`(치관 형성 완료)

**수복물 종류(영구치):**
`none`, `crown`, `inlay`, `onlay`(교합면 보기 전용), `veneer`, `bridge`

**수복물 재료(영구치):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic`(기존 `metal` 크라운이 이쪽으로 이행), `telescope`, `temporary`

**수복물 선택지는 치아 종류로 제한됩니다**(`src/registry/restorations.ts`의 `restorationOptions()`): 임플란트는 `crown`/`bridge` 수복 종류만(임플란트 커넥터 레이어와 합성) 그리고 아래의 다섯 가지 `prosthesis` 어태치먼트 항목, 상실치는 `bridge` 폰틱만 그리고 두 가지 가철성 의치 `prosthesis` 항목, `radix` 치질에서는 수복물 컨트롤 자체를 숨깁니다. 기존의 평면적인 `crownMaterial`/`bridgeUnit` 필드(v1.14 이전의 임플란트/브리지 어태치먼트 값)는 라이브 모델에서 폐지되었고, 오래된 페이로드의 읽기 전용 이행 경로로만 받아들입니다.

**보철장치**(`prosthesis`. 직교하는 가철성·어태치먼트 축. 통합된 수복 드롭다운의 「가철성:」 항목으로 표시됩니다):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture`(임플란트 어태치먼트. 피개의치 유무에 따라), `removable-partial`, `removable-full`(상실치 위의 치아 지지 의치). 한 치아는 고정 수복물이나 보철장치 중 하나만 가지며 둘 다 갖지는 않습니다 — 한쪽을 설정하면 다른 쪽은 해제됩니다.

**치관 변연 누출**(`crownLeakage`. 불리언): `restorationType`이 `crown` 또는 `bridge`일 때만 표시되며, `crown-leakage` 아트워크 레이어를 활성화합니다.

**근관 선택지(영구치):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**근관 선택지(유치):**
`none`, `endo-medical-filling`

`endo`와 `pulpDx`는 하나로 통합된 「치수/근관 상태」 `<select>`(생활 치수와 치료 완료/근관으로 묶음)로 표시되며 상호 배타적입니다 — 치료 완료(`endo != none`) 선택지를 고르면 `pulpDx`가 `normal`로 돌아가고, 치수 진단을 고르면 `endo`가 `none`으로 돌아갑니다.

**충전 재료(영구치):**
`amalgam`, `composite`, `gic`, `temporary`

**충전 재료(유치):**
`composite`, `gic`, `temporary`

**충전/우식 면:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown`(우식만)

**수식:**
`inflammation`(치근단), `parodontal`(치주), `mobility`(M1/M2/M3)

**치근단 병소 종류**(`periapicalType`. 치근단 글리프를 수식하며, 증상이 있는/없는 치근단 치주염 아래에서만 표시됩니다):
`none`, `granuloma`, `cyst` — 입력 가능한 선택지입니다. 기존 `abscess` 값은 여전히 받아들이고 저장하지만, 치근단 진단과 중복되므로 선택기에는 제시되지 않습니다. 가져올 때는 버려집니다: 그 치아가 염증 수식을 가지면 `apicalDx`로 접히고, 그렇지 않으면 `none`으로 지워집니다

**치수 진단**(AAE 용어. `pulpDx`):
`normal`, `reversible-pulpitis`(축소된 치수 글리프를 그림), `irreversible-pulpitis`, `necrosis` — `endo`와 상호 배타적이며, 근관치료를 받은 치아에서는 `normal`로 정규화됩니다

**치수 진단, 실용 라틴어**(`pulpLatin`. `pulpDetailLevel`이 `latin`일 때만 치수 선택기에 표시됩니다):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**치수 상세 수준**(`pulpDetailLevel`, 전역 설정): `simple`, `aae`(기본), `latin` — 선택기가 제시하는 치수 용어 체계를 제어합니다

**치근단 진단**(`apicalDx`. 치근단 글리프를 구동합니다):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**치근 흡수 종류**(`resorptionType`):
`none`, `internal`, `external-cervical`

**임플란트 주위 상태**(`periImplant`. 임플란트 전용, 2018년 World Workshop 병기 분류): `mucositis`는 기존 치주 치은 글리프를 재사용합니다. `peri-implantitis-*`는 `peri-implant-bone-loss` 레이어를 중증도에 따른 불투명도로 추가합니다(경도 0.4/중등도 0.7/중증 1.0). 임플란트는 더 이상 치근단 병소 글리프를 그리지 않으며(염증은 이 축으로 표현됩니다), `mods`의 염증/치주 체크박스도 임플란트에서는 숨겨집니다:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**우식 중증도**(`cariesSeverity`. 면별 통합 필드, `0`–`6`): 충전이 없는 면에서는 ICDAS 우식 깊이 척도(`superficial`/`dentin`/`deep`, `enableIcdas`가 설정된 경우 원시 ICDAS II 코드 `0–6`)로 읽혀 일차 `caries-{surface}` 레이어를 그립니다. 충전이 있는 면에서는 이름이 붙은 CARS 점수(`0` 건전 … `6` 광범위한 우식공)로 읽혀 대신 `subcaries-{surface}`(이차우식) 레이어를 그립니다 — 한 면이 일차와 이차를 동시에 갖는 일은 없습니다

**치근면 우식**(`rootCaries`. 현존치에서 `caries-root` 아트워크 레이어를 활성화하며, 불투명도는 중증도로 결정됩니다 — `active` 0.5/`arrested` 0.7/`active-cavitated`는 완전):
`none`, `active`, `arrested`, `active-cavitated`

**방사선학적 우식 깊이**(`radiographicDepth`. 면별, 시각적 ICDAS/CARS `cariesSeverity` 척도와 독립적):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**우식 세분화 설정**(전역): `secondaryCariesMode`(`simple`/`standard`/`full`, 기본 `standard`), `rootCariesMode`(`simple`/`severity`, 기본 `simple`), `radiographicDepthMode`(`off`/`threeLevel`/`detailed`, 기본 `off`), `cariesDepthEnabled`(불리언, 기본 `true`) — 각각 저장된 값을 바꾸지 않고 척도를 더 단순한 선택기 보기로 접습니다

**특수 지표:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**치아 마모**(`wearEdge`, `wearCervical`. 위치별 임상 유형. 치아 종류가 tooth-base + 수복물 없음 + 치질이 건전할 때로 제한되며, 기존 `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` 레이어를 그립니다):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**변색**(`discoloration`. 치아별 원인. 자연 tooth-base 또는 유치 + 수복물 없음 + 치질이 건전할 때로 제한되며, 표시되는 자연 치관의 채움을 착색합니다 — 새 SVG는 없습니다):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**충전물 결함**(`fillingDefect`. 면별, 이차우식과 독립적인 직접 수복물 소견 — `fillingSurfaceMaterials`에 있는 면으로 제한되며, `defect-{surface}` 아트워크 레이어를 그립니다):
`none`, `marginal`, `fracture`, `wear`

**교정**(`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`. 치아별, 현존하는 자연 치아 — 영구치 또는 유치 — 로 제한됩니다):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion`(위쪽 화살표 글리프), `intrusion`(아래쪽 화살표 글리프) — `orthoRotation`: 불리언

**치아 상세/표기 설정**(전역 세션 설정, 설정 → 치아 상세): `wearDetailLevel`과 `discolorationDetailLevel`(`ToothDetailLevel`: `simple`/`complex`, 기본 `complex` — 간단 모드는 전체 종류·원인 드롭다운 대신 유/무 토글을 보여주며 저장된 값은 바꾸지 않습니다), 그리고 `surfaceNotation`(`simple`/`full`, 기본 `full` — 우식/충전 면의 기호·라벨을 위치에 따라 달라지게 할지 제어합니다. 위의 「위치를 고려한 치면 표기」 참고)

### ⚙️ 설정
상단 바의 톱니바퀴 아이콘으로 엽니다. 포커스가 갇히는 ARIA `dialog`이며 탭이 있는 레이아웃입니다(Esc 또는 배경 클릭으로 닫고, 화살표 키로 탭을 전환합니다). 별도 언급이 없으면 모든 설정은 세션 수준의 UI 상태일 뿐입니다 — 어느 것도 치아별 데이터나 내보내기 페이로드를 바꾸지 않습니다.

- **일반:** 치식 표기(FDI/유니버설/팔머), 언어, 다크/라이트 테마, 치아 정보 패널 표시
- **치식도:** 치아 형태 프로필(기본 `classic`/`measured`) — `measured`는 문헌에서 실측한 16가지 치아 템플릿(임상적으로 구별되는 위치마다 하나로, 각 대구치가 고유한 치관 외형과 치근 수를 가집니다)을 두 치열궁·치아별 너비 레이아웃으로 그립니다. 런타임에 전환할 수 있고 클래식 기본에는 영향이 없습니다. 그 아트워크는 별도 청크로, 전환할 때만 받아오므로 클래식 기본에는 비용이 들지 않습니다. 유치로 기록된 치아는 영구치 도안 안의 레이어가 아니라 고유한 유치 템플릿(위치 1-5)에서 그려집니다. 차트에서든 치주 차트에서든 마찬가지입니다
- **패널:** 전악 상태 카드와 교정 카드를 개별적으로 표시/숨김(둘 다 기본은 표시)
- **치아 상세:** 마모 상세 수준과 변색 상세 수준(간단/상세, 둘 다 기본은 상세), 치면 표기(간단/전체, 기본은 전체)
- **우식:** ICDAS II 점수화 토글(`enableIcdas`), 우식 깊이 토글(`cariesDepthEnabled`), 치근면 우식 세분화(`rootCariesMode`: 간단/중증도), 이차/CARS 세분화(`secondaryCariesMode`: 간단/표준/전체), 방사선학적 깊이 세분화(`radiographicDepthMode`: 꺼짐/3단계/상세) — 이전의 별도 「이차우식」 탭은 이 탭으로 통합되었고, CARS 컨트롤은 방사선학적 깊이 바로 위에 배치되어 있습니다
- **치수:** 치수 상세 수준(`pulpDetailLevel`: 간단/AAE/실용 라틴어, 기본 AAE) — 「치수/근관 상태」 선택기가 제시하는 용어 체계를 제어합니다. 바꾸면 전악 요약과 열려 있는 모든 툴팁이 즉시 갱신됩니다
- **메모:** 치아별 메모 활성/비활성(`enableNotes`)
- **치주:** 치주 차트의 16개 행 전체에 대한 지수별 표시/숨김 토글(`perioRowVisibility`, 기본은 전부 표시). 치주낭(PD/GM/CAL/BOP)/구강 위생(치태/PI/GI)/치은점막(CEJ 식별성/치근 함몰/KG/GT)/지지 조직(치근분지부/동요도/Miller 분류)/임플란트 주위(mPI/mBI)로 묶이며, 각 행에 고유한 설명이 붙습니다. 더하여 지수 명칭을 번역할지 표준 표기로 쓸지의 모드(`perioIndexNameMode`: 기본 `translated`/`canonical` — 어떤 UI 언어에서도 표시되는 고정된 영어/라틴어 학술명). 앱 수준 설정일 뿐이며(`perioViewMode`와 같이) 결코 직렬화되지 않고, 어느 모드에서든 툴팁은 현지화된 상태로 남습니다

### 🖼️ SVG 템플릿 시스템

**치아 템플릿**(`src/assets/teeth-svgs/` 안):
| 템플릿 | 사용하는 치아 |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42(절치) |
| `13.svg` | 13, 23, 33, 43(견치) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45(소구치) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48(대구치) |

템플릿은 하악에서 180도 회전하고, 좌측에서는 수평으로 반전됩니다.

**아이콘 SVG**(`src/assets/icon-svgs/` 안):
`icon_8.svg`(제3대구치), `icon_gum.svg`(골), `icon_no_selection.svg`(선택 해제), `icon_occl.svg`(교합면 보기), `icon_pulp.svg`(치수)

**호스트가 제공하는 도안**. 호스트 앱은 라이브러리를 포크하지 않고도 `setToothTemplateOverrides()` 또는 `toothTemplates` prop을 통해 이 템플릿들을 자체 SVG로 바꿀 수 있습니다. 재정의는 **형태 프로필별**로 키가 매겨집니다. 템플릿 번호 N은 `classic`과 `measured`에서 서로 다른 도안이기 때문입니다:

```ts
import { setToothTemplateOverrides, getToothTemplateRejections } from "react-advanced-odontogram";

setToothTemplateOverrides({
  classic:  { templates: { 11: myIncisorSvg }, templatesOccl: { 16: myMolarOcclusalSvg } },
  measured: { templates: { 11: myMeasuredIncisorSvg } },
});

getToothTemplateRejections(); // [] — 모두 받아들여졌습니다
```

각 프로필은 네 개의 맵을 받습니다 — `templates`, `templatesOccl`, 그리고 유치를 고유한 아트워크로 그리는 프로필(`measured`)에서는 `primaryTemplates`와 `primaryTemplatesOccl`. 재정의는 형태 프로필을 바꿔도 유지되고, `null`은 공장 출하 아트워크를 복원합니다. 아무것도 제공하지 않으면 엔진은 늘 그래왔던 도안을 그대로 제공합니다.

템플릿은 라이브 DOM에 들어가는 신뢰할 수 없는 마크업이므로 **그려질 수 있게 되기 전에 검사됩니다** — 아래 보안 관련 참고를 보세요. 거부된 템플릿은 `getToothTemplateRejections()`로 확인할 수 있고 공장 출하 도안이 그대로 남습니다: 차트가 치아 없이 남겨지는 일은 없습니다.

### 🔢 치식 표기

**FDI(ISO 3950):** 영구치 11-18, 21-28, 31-38, 41-48. 유치 51-55, 61-65, 71-75, 81-85.

**유니버설(미국):** 영구치는 1-32로 번호를 붙입니다. 유치는 A-T 문자를 씁니다.

**팔머(지그몬디-팔머):** 사분악 + 위치 형식(예: UR-1, LL-5). 유치는 사분악마다 A-E 문자를 씁니다.

### 🚀 사용법
개발:
```bash
npm install
npm run dev
```
빌드:
```bash
npm run build
```
미리보기:
```bash
npm run preview
```

### 🔗 통합
이 컴포넌트는 어떤 React 앱에도 임베드할 수 있습니다.
예:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="ko"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**다크 모드 통합:**
- **단독 모드:** `darkMode` prop을 생략합니다 — 컴포넌트가 상단 바의 전환 버튼으로 자신의 테마 상태를 관리하며 `<html>`의 `.dark` 클래스를 붙이고 뗍니다.
- **제어 모드:** `darkMode`와 `onDarkModeChange`를 전달합니다 — 상위 앱이 테마를 제어합니다. 전환 버튼은 그대로 나타나지만 내부 상태를 관리하는 대신 `onDarkModeChange`를 호출합니다. `<html>`의 `.dark` 클래스를 붙이고 떼는 것은 상위 앱의 책임입니다.

**사용자 정의 테마:**
```tsx
<App
  themeConfig={{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
    // 치아 도안도 테마를 지정할 수 있습니다. 생략한 키는 아트워크가 그려진
    // 색을 그대로 유지하므로 이 설정은 가산적입니다 — 아무것도 설정하지
    // 않으면 아무것도 움직이지 않습니다.
    tooth: {
      // `body`는 치아 자신의 실루엣 — 치관과 치근 모두입니다. `classic`에서는
      // 치아 전체이고, `measured`에서는 `dentin`을 둘러싼 외곽 껍질이며,
      // `dentin`을 설정하지 않으면 그 색을 물려받습니다.
      body: '#f2f2f2',
      dentin: '#e6d7bf',
      outline: '#b9bdc2',
      // 색이 아닙니다: 그 외곽선의 너비(SVG 사용자 단위).
      outlineWidth: '1.4',
      gum: '#e8a5a0',
      bone: '#f6e6c8',
    },
    // `tooth`가 다루지 않는 면(재료별 수복 색, 그라디언트 정지점)을 위해
    // 임의의 팔레트 토큰을 이름으로 지정할 수 있습니다.
    tokens: {
      '--odon-rest-gold': '#d4af37',
      // 색이 아닙니다: 임플란트 픽스처 전체에 적용하는 CSS 필터.
      '--odon-implant-tint': 'hue-rotate(205deg) saturate(.85)',
      // …또는 틴트 대신 픽스처 전체를 한 가지 색으로 평평하게.
      '--odon-implant-fill': '#8fa6b8',
    },
    // 선택 강조. 아트워크가 아니라 차트가 타일 주위에 그리는 것이지만,
    // 하나의 객체로 팔레트 전체를 덮기 위해 여기에 있습니다.
    selection: { color: '#3b7bff', borderStyle: 'dashed' },
  }}
/>
```

도안은 색을 CSS 사용자 정의 속성으로 들고 있으며 출하된 색을 폴백으로 두므로, 두 형태 프로필이 하나의 설정을 따르고 내보내기는 페이지를 떠나기 전에 이를 해석합니다. 토큰 전체 표는 `tools/toothgen/palette.py`에 있습니다. 다크 모드에는 전용 아트워크 팔레트가 이미 포함되어 있어, 차트가 번쩍이지 않고 인터페이스의 나머지와 함께 어두워집니다. `measured` 프로필에서는 치관과 치근에 상아질 코어도 들어갑니다: `dentin`을 설정할 때까지 본체의 색을 따르므로, 경계는 요청했을 때만 나타납니다. 다크 모드에서 교합면 타일은 측면 보기와 함께 어두워지고, 우식 병변은 어두운 채움을 유지합니다 — 외곽선이 밝은 색으로 뒤집혀 형태를 담습니다. 「우식 = 어둡다」가 어떤 명암비보다 먼저 읽히기 때문입니다.

**임플란트 픽스처는 색을 바꾸는 것이 아니라 틴트를 입힙니다**. 그 도안은 광원을 담은 약 65개의 거의 동일한 금속 회색을 갖고 있어서, 하나씩 테마를 지정할 수 있게 만들지 않았습니다: 개별로 설정하면 테마를 바꾸는 대신 음영을 평평하게 만들어 버립니다. `--odon-implant-tint`는 픽스처 전체에 걸리는 CSS 필터이므로 모든 회색이 함께 움직이고 그들 사이의 관계가 보존됩니다 — `hue-rotate(205deg) saturate(.85)`, 또는 직접 만든 `url(#…)` 필터도 됩니다. 설정하지 않으면 `none`이며, 임플란트 주위 골소실 오버레이는 건드리지 않습니다: 그 레이어는 필터가 적용되는 그룹 밖에 있으므로, 장식적인 설정이 임상 신호를 움직이는 일은 결코 없습니다.

**…또는 팔레트가 그런 것이라면 평평하게도 만들 수 있습니다.** `--odon-implant-fill`은 픽스처 안 모든 도형의 채움을 한 번에 바꾸므로, 평평한 임상 팔레트에는 자체 필터가 필요하지 않습니다. 각 도형은 자신이 그려진 회색으로 돌아가므로, 이 토큰을 설정하지 않으면 픽스처는 늘 그래왔던 도안 그대로입니다 — 단일 기본값을 말할 여지가 없습니다. 둘은 합성됩니다: 채움이 평평하게 만들고, 이어서 틴트가 색을 옮깁니다. 영향받는 것은 `fill`뿐이므로 교합면 스크루홀의 테두리는 외곽선을 유지하고, 임플란트 주위 골소실 오버레이는 틴트와 마찬가지로 그대로 남습니다.

**외곽선 너비도 테마를 지정할 수 있습니다**. 도안은 `stroke-width`를 전혀 선언하지 않으므로 SVG 초기값 `1`로 그려집니다. `themeConfig.tooth.outlineWidth`(또는 `--odon-tooth-outline-width`)가 이를 바꿉니다. 치아 자신의 실루엣인 모든 레이어에 적용됩니다: 자연 치관과 유치 치관, 잔존치근, 치관 형성된 치아, 치은 아래 치아, 일곱 가지 파절 상태 전부, 그리고 교합면 투영. 따라서 외곽선은 치아가 잔존치근이나 파절로 기록되는 순간 `1`로 되돌아가지 않고, 어떻게 기록되든 하나의 두께를 유지합니다 — 그리고 차트에서 옆에 놓인 측면 보기와 함께 교합면 타일도 같이 두꺼워집니다. 고정 너비로 남는 것은 교합면 홈뿐입니다.

**플러그인 통합:**
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

// 한 치아에 플러그인 상태를 설정:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 테스트
```bash
npm run test           # Vitest 전체 테스트 실행
npm run test:watch     # 감시 모드
npm run test:coverage  # 커버리지 보고서
npm run test:e2e       # 브라우저 테스트(Playwright. 처음에는 npx playwright install chromium)
```

### 📖 API 문서

🅰️ **Angular 버전:** 공식 Angular 포트인 [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram)(npm에서는 `angular-advanced-odontogram`)을 사용할 수 있습니다 — JSON과 FHIR R4 내보내기는 두 라이브러리 사이를 왕복합니다.

```bash
npm run docs           # TypeDoc 문서를 docs/에 생성
```

### 📡 공개 API

**컴포넌트 props:**

| Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI 언어(hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr/ja/ko) |
| `onLanguageChange` | `(lang) => void` | — | 언어가 바뀔 때의 콜백 |
| `numberingSystem` | `string` | `'FDI'` | 치식 표기(FDI/유니버설/팔머) |
| `onNumberingChange` | `(system) => void` | — | 치식 표기가 바뀔 때의 콜백 |
| `darkMode` | `boolean` | `undefined` | 다크 모드 상태. 단독 모드에서는 생략합니다. |
| `onDarkModeChange` | `(dark) => void` | — | 다크 모드가 전환될 때의 콜백. 제어 모드에서는 필수입니다. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | CSS 사용자 정의 속성(`--odon-*`)을 통한 색 재정의. |
| `plugins` | `OdontogramPlugin[]` | `undefined` | 시각 오버레이와 치아별 사용자 정의 상태를 위한 사용자 정의 SVG 플러그인. |
| `toothTemplates` | `ToothTemplateOverrides` | `undefined` | 공장 출하 도안 대신 호스트가 제공하는 치아 도안(SVG 텍스트). 형태 프로필별. 검사되며, 거부된 템플릿은 공장 출하 도안을 유지합니다. |
| `readOnly` | `boolean` | `undefined` | 모든 상호작용(클릭, 터치, 키보드) 비활성화. 인쇄·보고서 보기에 유용합니다. |
| `enableNotes` | `boolean` | `undefined` | 치아별 메모 활성화. 치아를 두 번 클릭해 메모를 추가·수정합니다. |

**외부 제어를 위해 익스포트된 함수:**

| 함수 | 설명 |
|---|---|
| `initOdontogram()` | 엔진을 초기화하고 모든 치아를 그립니다 |
| `destroyOdontogram()` | 엔진을 정리하고 이벤트 리스너를 제거합니다 |
| `setNumberingSystem(system)` | FDI, 유니버설, 팔머를 전환합니다 |
| `clearSelection()` | 모든 치아의 선택을 해제합니다 |
| `getSelectedTeeth()` | 현재 선택된 치아(FDI 번호)를 선택 순서대로 반환합니다 |
| `getNumberingSystem()` | 현재 활성화된 치식 표기 |
| `getScreenToothSpacing()` / `setScreenToothSpacing(v)` | 화면상 치아 간 간격 조회/설정 |
| `getScreenToothNumberSize()` / `setScreenToothNumberSize(v)` | 치아 번호 크기 조회/설정 |
| `getSelectionColor()` / `setSelectionColor(hex)` | 선택 링 색상(`#rrggbb`) 조회/설정 |
| `getSelectionBorderStyle()` / `setSelectionBorderStyle(v)` | 선택 링 선 종류 조회/설정 |
| `getToothInfoVisible()` / `setToothInfoVisible(on)` | 치아 정보 패널 표시 여부 조회/설정 |
| `setOcclusalVisible(on)` | 교합면 보기 켜기/끄기 |
| `setWisdomVisible(on)` | 제3대구치 표시/숨김 |
| `setShowBase(on)` | 골 레이어 표시/숨김 |
| `setHealthyPulpVisible(on)` | 건전 치수 표시/숨김 |
| `registerPlugins(plugins)` | 사용자 정의 SVG 플러그인을 등록합니다 |
| `setPluginState(toothNo, pluginId, value)` | 한 치아에 플러그인의 사용자 정의 상태를 설정합니다 |
| `getPluginState(toothNo, pluginId)` | 한 치아의 플러그인 사용자 정의 상태를 가져옵니다 |
| `setToothTemplateOverrides(overrides)` | 공장 출하 치아 도안을 호스트가 제공하는 SVG로 형태 프로필별로 바꿉니다. `null`은 공장 출하 아트워크를 복원합니다. 마크업은 검사되며 거부된 템플릿은 공장 출하 도안을 유지합니다 |
| `getToothTemplateRejections()` | 지금까지 거부된 호스트 템플릿과 그 이유 — `{ profile, set, key, reason }[]` |
| `getToothStateSummary(toothNo)` | 활성화된 모든 상태의 현지화된 요약을 가져옵니다 |
| `getOdontogramSummary()` | 차트 전체의 구조화·현지화된 텍스트 요약(개수, 섹션)을 가져옵니다 |
| `onStateChange(callback)` | 상태 변화를 구독합니다. 구독 해제 함수를 반환합니다 |
| `setReadOnly(value)` | 읽기 전용 모드 활성/비활성 |
| `getReadOnly()` | 현재 읽기 전용 상태를 가져옵니다 |
| `setNotesEnabled(value)` | 치아별 메모 활성/비활성 |
| `getNotesEnabled()` | 현재 메모 활성 상태를 가져옵니다 |
| `setPulpDetailLevel(level)` | 치수 선택기의 용어 체계를 설정합니다 — `"simple"`, `"aae"`, `"latin"` |
| `getPulpDetailLevel()` | 현재 치수 상세 수준을 가져옵니다 |
| `getChartMode()` | 현재 활성화된 차트를 가져옵니다 — `"status"` 또는 `"plan"` |
| `setChartMode(mode)` | 활성 차트를 `"status"` 또는 `"plan"`으로 전환합니다. 계획 차트는 처음 들어갈 때 현재 상태에서 깊은 복사가 만들어집니다 |
| `getStatusChart()` | 어느 차트가 활성인지와 무관하게 현재 상태 차트의 페이로드(`{version, globals, teeth}`)를 가져옵니다 |
| `getPlanChart()` | 어느 차트가 활성인지와 무관하게 계획 차트의 페이로드(`{version, globals, teeth}`)를 가져옵니다 |
| `setPlanChart(payload)` | 페이로드로 계획 차트의 치아를 교체합니다(현재 상태는 그대로). 계획 차트를 초기화됨으로 표시합니다 |
| `getPlanChanges()` | 구조화된 현재→계획 차이(`{ toothNo, axis, from, to }[]`)를 가져옵니다 — 현재 상태 차트와 계획 차트가 다른 처치 축에 대해 치아별·축별로 한 항목. 계획이 없으면 비어 있습니다. `getOdontogramSummary()`의 `plannedChanges`로도 노출됩니다 |
| `compareExams(before, after)` | 같은 구강의 **내보낸** 두 검사를 비교합니다 — 축 수준의 변화(`getPlanChanges()`와 같은 형태), 부위별 치주 수치(치주낭 깊이와 부착 수준, 2 mm 이상 움직인 것 표시), 각 검사의 2017년 분류. 순수 함수로 라이브 차트를 전혀 건드리지 않습니다 |
| `setPerioSite(toothNo, site, patch)` | 여섯 부위 중 하나의 치주 데이터를 설정합니다(`patch` = `{ pd?, gm?, bop?, sup? }`). `pd`가 null 또는 `<1`이면 그 부위의 기록을 해제합니다. 검증과 범위 제한을 수행합니다(PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | 한 치아의 부위별 치주 기록(기록된 부위만)을 가져옵니다 |
| `getToothCal(toothNo)` | 한 치아의 부위별 도출 CAL(`pd + 치은 변연`)을 가져옵니다 |
| `getPerioSummary()` | 전악 치주 집계: 기록 부위 수, 출혈 부위 수, %BOP, 최악 CAL, 최대 PD |
| `getPerioChart()` | 활성 차트의 치아별 치주 기록을 가져옵니다 |
| `PerioChart` | React 컴포넌트(명명된 익스포트) — 전악 치주 차트 오버레이(`{ open, onClose }`). 호스트 통합을 위해 `OdontogramShell`과 독립적으로 마운트할 수 있습니다 |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | 치주 차트 오버레이를 프로그램으로 열기/닫기/조회 — 호스트가 기본 치식도와 별개로 치주 차트를 띄울 수 있게 합니다(증례 상태는 공유됩니다) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | 치주 차트 제시 방식 조회/설정 — `"toggle"`(`치식도 \| 치주 상태` 보기 전환, 기본) 또는 `"popup"`(오버레이) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | 치주 차트 강조 오버레이 조회/설정 — `"none"`(기본)/`"pd"`/`"cal"`/`"gr"`/`"plaque"`/`"bop"`/`"pd5"`/`"pd6"`/`"cairo"`. 해당 지표로 치아를 다시 칠합니다(기존 데이터에 대한 표시 전용) |
| `getToothRecessionType(toothNo)` | 도출된 **Cairo 치은퇴축 유형**을 가져옵니다 — `"none"`/`"rt1"`/`"rt2"`/`"rt3"`(그 치아의 인접면 CAL과 협면 CAL에서 계산됩니다) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | 치아별 CEJ 식별성 — `"none"`/`"detectable"`/`"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | 치아별 치근면 함몰 — `"none"`/`"mild"`/`"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | 면별 Silness-Löe 치태지수 등급 — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | 면별 Löe-Silness 치은지수 등급 — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | 치아별 협면 부착치은 폭(mm) — `0`-`15`, 기록되지 않으면 `null` |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | 치아별 치은 두께 표현형 — `"unknown"`/`"thin"`/`"medium"`/`"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | 치아별 Miller 치은퇴축 분류 — `"none"`/`"i"`/`"ii"`/`"iii"`/`"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | 임플란트 전용 — 면별 Mombelli 변형 치태지수(mPI) 등급 — `0`-`3`. 임플란트가 아닌 치아에서는 아무 일도 하지 않습니다 |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | 임플란트 전용 — 면별 Mombelli 변형 치은구 출혈지수(mBI) 등급 — `0`-`3`. 임플란트가 아닌 치아에서는 아무 일도 하지 않습니다 |
| `furcationEntrances(toothNo)` | 한 치아의 치근분지부 입구 — `["mesial","distal","buccal"]`(상악 대구치), `["buccal","lingual"]`(하악 대구치), `["mesial","distal"]`(상악 제1소구치), 그 밖에는 `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | 입구별 치근분지부 병변 설정/조회(Glickman `1`–`4`. `null`로 지움) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | 면별 O'Leary 치태 유무 설정/조회(근심/원심/협면/설면). `getPerioSummary()`의 전악 PI%에 반영됩니다 |
| `getCaseMeta()` | 증례 수준 메타데이터 객체(`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`)를 가져옵니다 — 치아별도 이중 상태도 아닌 하나의 공유 블록입니다(페이로드 최상위 `globals` 키와 같이). 치주 병기·등급 분류와 PDF 보고서 머리글에 반영됩니다 |
| `setPatientName(v)` | 증례의 환자 이름을 설정합니다(앞뒤 공백 제거. 빈 문자열이나 `null`로 지움) — 식별 목적일 뿐 치주 도출에는 전혀 쓰이지 않습니다 |
| `setPatientDob(v)` | 증례의 환자 생년월일을 설정합니다(`YYYY-MM-DD`. 유효하지 않거나 비면 지움) — PDF 보고서 식별 목적만 |
| `setExamDate(v)` | 증례의 검사일을 설정합니다(`YYYY-MM-DD`. 유효하지 않거나 비면 지움) |
| `setCaseAge(v)` | 증례의 환자 나이(년)를 설정합니다 — `0`-`120`, `null`로 지움 |
| `setSmokingStatus(v)` | 증례의 흡연 상태를 설정합니다 — `"unknown"`/`"never"`/`"former"`/`"current"` |
| `setCigarettesPerDay(v)` | 하루 흡연량을 설정합니다(흡연 상태가 `"current"`일 때만 의미가 있습니다) — `0`-`99`, `null`로 지움 |
| `setDiabetesStatus(v)` | 증례의 당뇨 상태를 설정합니다 — `"unknown"`/`"none"`/`"present"` |
| `setHba1c(v)` | HbA1c %를 설정합니다(당뇨 상태가 `"present"`일 때만 의미가 있습니다) — `3.0`-`20.0`(소수 한 자리), `null`로 지움 |
| `setToothLossPerio(v)` | 치주염으로 상실한 치아 수를 설정합니다 — `0`-`32`, `null`로 지움 |
| `setMaxRblPercent(v)` | 최대 방사선학적 골소실 %를 설정합니다 — `0`-`100`, `null`로 지움 |
| `resetCaseMeta()` | 증례 수준 메타데이터 객체를 빈 기본값으로 되돌립니다 |
| `getPerioClassification()` | 2017년 World Workshop 치주질환 분류(`{diagnosis, stage, grade, extent, derived, overridden}`)를 가져옵니다 — 진단·병기·등급·분포는 기록된 치주 데이터와 증례 메타데이터에서 도출되며, 임상의 재정의가 설정된 축은 그것으로 대체됩니다(`derived`는 항상 손대지 않은 계산값을, `overridden`은 어느 축이 재정의되었는지를 알려줍니다) |
| `setDiagnosisOverride(v)` | 도출된 치주 진단을 재정의합니다 — `"health"`/`"gingivitis"`/`"periodontitis"`, `null`로 지움(도출값으로 되돌립니다) |
| `setStageOverride(v)` | 도출된 치주 병기를 재정의합니다 — `"I"`/`"II"`/`"III"`/`"IV"`, `null`로 지움(도출값으로 되돌립니다) |
| `setGradeOverride(v)` | 도출된 치주 등급을 재정의합니다 — `"A"`/`"B"`/`"C"`, `null`로 지움(도출값으로 되돌립니다) |
| `setExtentOverride(v)` | 도출된 치주 분포를 재정의합니다 — `"localized"`/`"generalized"`/`"molar-incisor"`, `null`로 지움(도출값으로 되돌립니다) |
| `exportFhir(options?)` | 차트를 HL7 FHIR R4 collection Bundle로 내보냅니다(JSON 다운로드). 선택적으로 `{ subject }` 참조를 전달할 수 있고, 전달하지 않으면 자리표시자 Patient가 포함됩니다 |
| `exportImage(format)` | 차트를 이미지로 내려받습니다 — `"png"` 또는 `"jpg"` |
| `exportSvg()` | 차트를 확대·축소 가능한 SVG(벡터)로 내려받습니다 |
| `hasAnyPerioData()` | 구강 어디에든 치주 축이 기록되어 있을 때만 `true` — 치주 내보내기의 자동 건너뛰기를 구동하고, 빈 차트에서는 치주 내보내기 메뉴 항목을 비활성화합니다 |
| `exportPerioSvg()` | 치주 차트 전체(치아 그래픽 + 숫자 행 + 2017년 분류)를 하나의 독립된 벡터 SVG로 내려받습니다. `buildPerioSvg()`로 상태에서 헤드리스로 만들어집니다 |
| `exportPerioImage(format)` | 치주 차트를 래스터화한 이미지로 내려받습니다 — `"png"` 또는 `"jpg"` |
| `exportPdf(opts)` | jsPDF 네이티브 PDF 보고서를 내려받습니다(`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, 각 섹션은 선택) — 벡터 텍스트와 래스터 치아·치주 차트 이미지입니다. 개별 메모 섹션은 메모가 있는 치아가 없으면 자동으로 건너뛰고, 치주 두 섹션은 `hasAnyPerioData()`가 false이면 `opts`와 무관하게 자동으로 건너뜁니다 |
| `importFhirBundle(input)` | 이 모듈이 생성한 FHIR R4 Bundle(객체 또는 JSON 문자열)을 가져옵니다 |
| `setImportFormat(format)` | 다음 파일 가져오기의 파서를 설정합니다 — `"status"` 또는 `"fhir"` |
| `startIntroTour()` | 18단계 대화형 소개 투어를 시작합니다 |

### 💾 상태 유지(localStorage)

치식도의 증례 상태에 대한 선택적 `localStorage` 유지입니다(`src/persistence.ts`. 패키지 엔트리 포인트에서 다시 익스포트됩니다). 기본은 비활성이므로 호스트 앱이 명시적으로 켜지 않는 한 기존 통합에는 영향이 없습니다. 또한 치식도가 마운트된 **뒤에** 호출해야 합니다(복원은 `importStatus()`를 통해 라이브 DOM을 다시 칠합니다):

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";
enablePersistence({
  key: "my-app-odontogram",   // 기본: "react-advanced-odontogram"
  includePlan: true,          // 계획 차트도 유지. 기본: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| 함수 | 설명 |
|---|---|
| `enablePersistence(options?)` | 이전에 저장된 증례가 있으면 `importStatus()`로 복원하고, 이후 상태가 바뀔 때마다 현재 상태 차트를 `localStorage`에 저장합니다. 멱등입니다 — 다시 호출하면 이전 구독·옵션을 대체합니다. **치식도가 마운트된 뒤에 호출해야 합니다.** |
| `disablePersistence()` | 유지를 중단합니다. 저장된 항목은 그대로 남습니다. |
| `clearPersistedState()` | 활성(또는 기본) 키의 저장된 항목을 제거합니다. |
| `isPersistenceEnabled()` | 상태 변화 구독이 활성인 동안 `true`입니다. |

**`PersistenceOptions`:**

| 필드 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | `localStorage` 키. |
| `includePlan` | `boolean` | `false` | 계획 차트(페이로드의 `plan` 필드)도 유지합니다. |
| `onError` | `(err: Error) => void` | — | 저장소나 파싱 오류 시 `console.warn` 대신 호출됩니다. |

참고: `enablePersistence()`를 호출하지 않으면 `localStorage`에서 읽지도 쓰지도 않습니다. 4 MB 크기 가드가 지나치게 큰 저장을 예외가 아니라 건너뛰기로 처리합니다(`onError`/`console.warn`으로 보고). 저장소나 JSON 실패 — 용량 초과, 제한된 iframe, 손상되거나 인식할 수 없는 저장 데이터 등 — 는 모두 잡아서 보고합니다. 이 모듈은 예외를 던지지 않습니다.

참고: 유지를 켜면 저장된 증례가 `importStatus()`로 복원되어 현재 증례를 대체합니다 — 저장된 페이로드에 계획 차트가 없으면 작업 중인 계획 차트까지 포함해서입니다. 유지는 세션 중간이 아니라 시작 시(마운트 직후)에 켜세요.

참고: 유지되는 페이로드에는 환자를 식별할 수 있는 증례 데이터(환자 이름, 검사일)가 평문 `localStorage`에 들어갈 수 있습니다. 그런 데이터를 기록한다면 기기 수준의 보호를 확보하거나 적절한 시점에 `clearPersistedState()`로 지우세요.

### 💾 상태 내보내기/가져오기 형식
내보내기는 JSON 파일을 만듭니다(버전 `2.22`. 가져오기는 기존 `1.4` 및 `2.0`~`2.21`도 받아들여 자동으로 이행합니다). 내용:

**전역 필드:**
- `wisdomVisible` - 제3대구치 표시
- `showBase` - 골 레이어 표시
- `occlusalVisible` - 교합면 보기 활성
- `showHealthyPulp` - 건전 치수 표시
- `edentulous` - 무치악 모드 활성

**치아별 필드(32개 치아):**
- `toothSelection` - 기본 치아 종류
- `toothSubstrate` - 치질(natural/radix/broken/crownprep). 수복물과 직교합니다
- `restorationType` - 수복물 종류(none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - 수복물 재료(emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary). `restorationType`과 짝으로 씁니다
- `prosthesis` - 가철성·어태치먼트 축(none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full). crown/bridge의 고정 `restorationType`과는 상호 배타적입니다
- `crownLeakage` - 치관 변연 누출 플래그. `restorationType`이 crown 또는 bridge일 때만 의미가 있습니다
- `endo` - 근관 상태. `pulpDx`와 상호 배타적입니다(통합된 「치수/근관 상태」 선택기로 함께 표시됩니다 — 치아를 치료 완료로 만들면 `pulpDx`가 `normal`로 정규화됩니다)
- `mods` - 수식 배열(inflammation, parodontal). `inflammation`은 현존치 UI에서는 폐지되었지만(거기서는 `apicalDx`가 글리프를 구동합니다) 상실치와 발치창 치아에는 여전히 적용됩니다
- `caries` - 우식이 있는 면
- `cariesActiveDepth` - 새 면을 적용할 때 우식 깊이 선택기가 준비해 둔 ICDAS 깊이 값(면별 저장값이 아닙니다. 저장되는 면별 필드는 `cariesSeverity`를 참고)
- `rootCaries` - 치근면 우식 중증도(none/active/arrested/active-cavitated)
- `cariesSeverity` - 면별 통합 중증도(0-6): 일차(충전되지 않은) 면에서는 ICDAS 깊이, 이차(충전된) 면에서는 CARS 점수
- `radiographicDepth` - 면별 방사선학적 우식 깊이(none/E1/E2/D1/D2/D3). 시각적 ICDAS/CARS 척도와 독립적입니다
- `fillingMaterial` - 충전 재료
- `fillingSurfaces` - 충전된 면
- `fillingSurfaceMaterials` - 면별 충전 재료(혼합 충전, 예: 협면 아말감 + 원심 콤포지트)
- `fillingDefect` - 면별 충전물 결함(none/marginal/fracture/wear). 충전된 면으로 제한되며 이차우식과 독립적입니다
- `pulpDx` - AAE 치수 진단(normal/reversible-pulpitis/irreversible-pulpitis/necrosis). reversible-pulpitis는 축소된 글리프를 그립니다
- `pulpLatin` - 실용 라틴어 치수 하위 유형(`pulpDetailLevel`이 `latin`일 때만 치수 선택기에 표시됩니다)
- `apicalDx` - 치근단 글리프를 구동하는 치근단 진단
- `periapicalType` - 치근단 병소 하위 유형(none/granuloma/cyst). 증상이 있는/없는 치근단 치주염 아래에서만 표시됩니다. 기존 `abscess`도 가져올 때는 받아들입니다
- `resorptionType` - 치근 흡수 종류(none/internal/external-cervical)
- `periImplant` - 임플란트 전용 임플란트 주위 상태(none/mucositis/peri-implantitis-mild/-moderate/-severe). 2018년 World Workshop 병기 분류
- `dxOverrides` - 치아별 진단 코딩 재정의(버전 2.21): ICD-10 진단 키 → `add` | `suppress` 객체로, 해당하는 차트 소견이 없어도 코딩된 진단을 켜거나 있어도 끕니다. FHIR `Condition`으로 내보내지는 실효 집합을 결정합니다
- `endoResection` - 치근단절제 플래그
- `fissureSealing` - 치면열구전색 플래그
- `calculus` - 치석 플래그
- `contactMesial` - 근심 접촉점 상실
- `contactDistal` - 원심 접촉점 상실
- `wearEdge` - 절단·교합면 마모 종류(none/attrition/erosion)
- `wearCervical` - 치경부 마모 종류(none/abrasion/abfraction/erosion)
- `discoloration` - 치아별 변색 원인(none/tetracycline/fluorosis/nonvital/extrinsic/other). 수복물이 없는 자연 tooth-base/유치에서 자연 치관의 채움을 착색합니다
- `orthoAppliance` - 교정 장치(none/bracket/band)
- `orthoDrift` - 교정적 이동(none/mesial/distal)
- `orthoVertical` - 교정적 수직 이동(none/extrusion/intrusion)
- `orthoRotation` - 교정적 회전 플래그
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - 파절 위치
- `extractionWound` - 발치 후 창
- `extractionPlan` - 발치 예정
- `parapulpalPin` - 치수인접 핀 플래그
- `bridgePillar` - 브리지 지대치
- `mobility` - 동요도(none/m1/m2/m3)
- `crownNeeded` - 치관 필요 지표
- `crownReplace` - 치관 재제작 필요 지표
- `missingClosed` - 발치 후 폐쇄된 결손
- `customStates` - 플러그인 사용자 정의 상태(플러그인 ID를 키로 하는 객체)
- `note` - 치아별 텍스트 메모(문자열, 선택 — 비어 있지 않을 때만 존재합니다)

**최상위 `plan` 필드(버전 2.11 이상):**
- `plan` - 선택적 객체로, `teeth`(위의 치아별 필드)와 같은 형태를 가지며 **계획**(치료 후 의도하는 상태) 차트를 담습니다. 계획 차트가 초기화되었고(`현재 | 계획` 토글이 적어도 한 번 계획 쪽으로 전환되었고) **그리고** 그 내용이 현재 상태 차트와 다를 때만 존재합니다 — 현재 상태만 내보내면 이 필드를 완전히 생략하며, 버전 번호를 빼면 2.11 이전의 내보내기와 바이트 단위로 동일합니다. 가져올 때 `plan`이 없으면 계획 차트는 지워지고 초기화 해제됩니다(가져오기 전에 남아 있던 낡은 계획이 되살아나는 일은 없습니다). `plan`이 있으면 현재 상태와 함께 계획 차트도 복원됩니다. 계획 차트는 가져오기/내보내기와 독립적으로 `getPlanChart()`/`setPlanChart()`로 읽고 쓸 수 있고(위의 공개 API 참고), `getStatusChart()`는 어느 차트 모드가 활성인지와 무관하게 항상 현재 상태 우선 페이로드를 반환합니다.

**최상위 `case` 필드(버전 2.17 이상. 2.18, 2.19, 2.20, 2.22에서 확장):**
- `case` - 증례 수준(치아별이 아닌) 메타데이터를 담는 선택적 객체로, 현재 상태 차트와 계획 차트가 함께 공유합니다(최상위 `globals` 키와 같이). 비면 생략됩니다: 모든 필드가 기본값일 때는 아예 존재하지 않으므로, 증례 데이터가 없는 내보내기는 버전 번호를 빼면 바이트 단위로 동일합니다. 필드(각각 기본값일 때 생략됩니다): `age`, `smokingStatus`(+ `cigarettesPerDay`), `diabetesStatus`(+ `hba1c`), `toothLossPerio`, `maxRblPercent`, 2017년 분류의 네 가지 축별 임상의 재정의 `diagnosisOverride`/`stageOverride`/`gradeOverride`/`extentOverride`, (버전 2.19) `patientName`/`examDate`, (버전 2.20) `patientDob`, (버전 2.22) `caseConditions` — 증례/영역 진단(부정교합과 측두하악관절 K07, 구강의 낭 K09, 타액선 질환 K11, 구내염과 구강 점막 K12/K13, 치열궁 수준 발육성 K00)으로, 각각 좌우(미지정/좌/우/양측)에 대응됩니다. 치주 병기·등급 분류와 PDF 보고서 머리글에 반영되며, `getCaseMeta()`와 `setCase*` 세터로 읽고 씁니다(위의 공개 API 참고). 환자 이름, 생년월일, 검사일은 차트 식별 메타데이터일 뿐이며 FHIR 내보내기에는 **포함되지 않습니다**.

### 🖨️ 내보내기
`exportFhir()`는 HL7 검증기에서 깔끔합니다: Bundle의 각 항목은 결정적인 `id`와 절대 `fullUrl`을 가지며(`urn:uuid` 자리표시자를 쓰지 않습니다), Bundle은 엔진 자신의 CodeSystem을 포함하므로 검증 중에 로컬 코드가 해석됩니다(`fhir/CodeSystem-odontogram.json`으로도 공개됩니다. `includeCodeSystem: false`를 전달하면 생략할 수 있습니다).

치주 데이터는 JSON 페이로드만이 아니라 FHIR 가져오기로도 왕복합니다: `importFhirBundle()`은 LOINC `74029-0` 치주 패널을 각 치아의 치주 기록으로 되읽습니다 — 치주낭 깊이, 치은 변연(CAL에서 재구성하므로 가성낭 값도 보존됩니다), BOP, 치근분지부, O'Leary 치태, PI/GI와 임플란트 mPI/mBI 지수, 부착치은 폭 — 그리고 증례 수준의 흡연 상태와 HbA1c 근거 Observation까지. 배농은 유일한 예외로, FHIR 내보내기에 포함되지 않으므로 JSON 전용으로 남습니다.

치식도 자체의 상태 JSON/FHIR/PNG/JPG/SVG 내보내기 외에, **치주 차트**에는 고유한 내보내기 경로가 있습니다:
- **치주 SVG/PNG/JPG:** `exportPerioSvg()`/`exportPerioImage("png"|"jpg")`는 마운트된 `PerioChart`의 DOM과 독립적으로, 치주 차트 전체(치아 그래픽 + 숫자 행 + 2017년 분류)를 하나의 독립된 벡터 SVG(`buildPerioSvg()`)로 그립니다. 세 개의 내보내기 메뉴 항목은 `hasAnyPerioData()`가 false일 때 비활성화됩니다(빈 차트에는 내보낼 치주 데이터가 없습니다).
- **PDF 보고서:** 내보내기 메뉴의 「PDF 보고서…」 항목은 `ExportOptionsModal`을 엽니다 — 증례 메타데이터에 바로 연결된 환자 이름·생년월일·검사일 입력란(검사일은 기본값이 오늘)과 섹션 체크박스(환자 정보, 치식 차트, 치식도 설명, 개별 메모 — 메모가 있는 치아가 없으면 비활성 — 치주 상태, 치주 설명)를 갖춘 설정 대화상자이며, 그 뒤에 `exportPdf(opts)`를 호출합니다. 식별 입력란이 비어 있으면 자리표시자(「John Doe」/「1980-01-01」)로 돌아가므로 내보내기는 항상 성공합니다. PDF는 jsPDF 네이티브로 조립됩니다 — 벡터 텍스트는 `.text()`, 래스터 치아·치주 차트 이미지는 `.addImage()` — **svg2pdf.js 의존성이 없습니다**. 개별 메모 섹션은 메모가 있는 치아가 없으면 자동으로 건너뛰고, 치주 두 섹션은 `hasAnyPerioData()`가 false일 때 대화상자의 체크박스와 무관하게 자동으로 건너뜁니다.
- **mPI/mBI의 임플란트 제한:** 임플란트 주위 Mombelli 지수(mPI/mBI)는 임플란트가 적어도 하나 있는 치열궁에서만 행으로 그려집니다 — 라이브 치주 차트에서든 SVG/PDF 내보내기에서든 마찬가지입니다.
- 환자 이름, 생년월일, 검사일은 차트 식별 메타데이터일 뿐입니다(페이로드 `2.20`, 가산적) — FHIR 내보내기에는 **포함되지 않습니다**.

### 📁 폴더 구조
- `src/App.tsx` - 셸 UI, 상단 바 컨트롤, 언어/치식 표기/다크 모드/테마/플러그인 전환
- `src/odontogram.ts` - SVG 레이어링 엔진, 치아 상태 관리, 터치 상호작용, 플러그인 오버레이, UI 연결
- `src/plugin.ts` - `OdontogramPlugin` 타입, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index 우선순위
- `src/theme.ts` - `OdontogramThemeConfig` 타입과 `applyThemeConfig()` 유틸리티
- `src/status_extras.ts` - 34가지 미리 정의된 수복 템플릿(브리지, 의치, 바 구조)
- `src/i18n/` - 번역(HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO)과 i18n 훅
- `src/utils/numbering.ts` - FDI, 유니버설, 팔머 치식 변환
- `src/registry/` - 선언적 임상 축 레지스트리: FHIR 필드 매핑, SVG 초기화 집합/불리언 플래그 활성화, 수복물 종류×재료 행렬, UI 선택지 목록(내보내기/가져오기, FHIR, 선택기 UI를 생성하는 단일 진실 공급원)
- `src/fhir/` - HL7 FHIR R4 내보내기/가져오기: `toFhir.ts`/`fromFhir.ts`, 코드 체계, 필드 매핑, 프리미티브
- `src/bridgeOverlay.ts` - 여러 치아에 걸친 브리지 스팬 커넥터 오버레이(치열궁을 고려한 새들 형상)
- `src/SettingsModal.tsx` - 탭이 있는 설정 대화상자(일반/패널/치아 상세/우식/치수/메모/치주)
- `src/perioExport.ts` - `buildPerioSvg()`: 치주 차트 전체를 하나의 독립된 벡터 SVG로
- `src/perioPdf.ts` - `exportPdf()`의 순수 jsPDF 보고서 조립기(`assemblePdf`)
- `src/ExportOptionsModal.tsx` - 「PDF 보고서…」 내보내기 설정 대화상자
- `src/__tests__/` + `src/registry/__tests__/` - 광범위한 Vitest 자동 테스트 모음
- `src/assets/teeth-svgs/` - SVG 치아 템플릿(6개 파일: 절치, 견치, 소구치, 대구치 + 교합면 보기)
- `src/assets/icon-svgs/` - 툴바 아이콘 SVG(5개 파일)

### ⚙️ 기술 스택
- React 18 + Vite + TypeScript
- UI 스타일링에 Tailwind CSS
- DOM 조작을 통한 SVG 레이어링(성능을 위해 React 상태를 쓰지 않습니다)
- 가벼운 자체 i18n 시스템
- 자동 테스트에 Vitest + Testing Library
- API 문서에 TypeDoc
- Vite 경로 별칭: `@`를 `./src`에 매핑

### 📝 참고
- SVG 템플릿은 `src/assets/teeth-svgs`와 `src/assets/icon-svgs`에서 불러오므로, 정적 호스팅에서는 public 폴더를 제공해야 합니다.
- 치식도 엔진은 성능과 단순함을 위해 자체 내부 상태(React 상태가 아님)를 사용합니다.
- 유치는 사용할 수 있는 재료가 제한됩니다(아말감 충전 없음, 포스트를 쓰는 근관 처치 없음).
- 임플란트 치아는 자연 치아와는 다른 치관·어버트먼트 선택지를 가집니다.

### 🔒 보안 관련 참고

- **플러그인은 신뢰된 코드로 실행됩니다.** 플러그인의 `renderSvg()` 반환값은 라이브 차트의 SVG에 주입됩니다. 그 출력은 삽입 전에 [DOMPurify](https://github.com/cure53/DOMPurify)(SVG 프로필과 `svgFilters`)로 소독됩니다 — `<script>`, `<iframe>`, `<object>`, `<embed>`, `<foreignObject>`는 전면 금지되고, 전체가 악의적인 출력은 부분적으로 그려지는 대신 버려집니다. 이는 침해되었거나 버그가 있는 플러그인의 영향 범위를 줄이지만, 그래도 플러그인은 신뢰할 수 있는 출처에서만 불러와야 합니다 — 소독은 안전망이며 검증의 대체물이 아닙니다.
- **호스트가 제공하는 치아 템플릿은 정리되지 않고 거부됩니다.** `setToothTemplateOverrides()`에 전달된 도안은 그려질 수 있게 되기 전에 검사됩니다: 단일 `<svg>` 루트, DOMPurify(SVG 프로필에서 `<script>`, `<iframe>`, `<object>`, `<embed>`, `<foreignObject>`, `<image>`, `<a>`와 애니메이션 요소를 금지) — 그리고 DOMPurify가 *무엇이든* 제거해야 한다면, 템플릿 전체가 조용히 소독되는 대신 **거부됩니다**. 호스트가 제공한 것과 다른 마크업을 결코 그리지 않도록 하기 위함입니다. `href`는 `#id` 프래그먼트만, `<style>` 요소나 `style` 속성에 `url(`이나 `@import`를 쓰지 않을 것 — 템플릿의 내용이 네트워크에 닿을 수 없게 하기 위함입니다. 그리고 대체하는 공장 출하 도안의 모든 레이어 id를 가지고 있어야 합니다. 엔진이 레이어를 id로 전환하기 때문입니다. 거부된 템플릿은 `getToothTemplateRejections()`로 보고되고 공장 출하 도안이 유지됩니다.
- **Content-Security-Policy.** 데모의 **프로덕션 빌드**는 이 정책을 `<meta http-equiv="Content-Security-Policy">` 태그로 주입합니다(개발 서버는 영향 없음):

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  `OdontogramShell`을 임베드하는 호스트 애플리케이션은 자신의 배포 환경에 맞는 CSP를 설정해야 합니다 — 라이브러리로 쓰일 때 이 컴포넌트는 CSP를 주입하지 않습니다.

### 📖 인용 방법

이 모듈을 연구나 업무에 사용하신다면 인용을 부탁드립니다.

**이 버전(v2.9.0):**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.9.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**모든 버전(개념 DOI):** https://doi.org/10.5281/zenodo.21156787

> 위의 모든 버전을 가리키는 개념 DOI는 항상 가장 최근에 보관된 릴리스로
> 연결됩니다. 버전별 DOI는 Zenodo에 보관될 때 릴리스마다 발급됩니다.
> v2.9.0이 보관되기 전까지는 개념 DOI로 인용해 주세요.

기계가 읽을 수 있는 인용 메타데이터는 [`CITATION.cff`](CITATION.cff)에 있습니다.

## 🙌 크레딧

React Advanced Odontogram은 엔진 전체의 제작자이자 리드 개발자인 Zoltan Dul([@ZoliQua](https://github.com/ZoliQua))이 만들고 유지합니다. 아래에 적은 기여자들의 귀중한 도움을 받았습니다. 기여해 주신 모든 분께 감사드립니다.

**기여자**

- [@odontodev](https://github.com/odontodev): 상태 하이드레이션과 라이프사이클 API, 제어 속성으로서의 충전 설정, 멱등 세터, 접을 수 있는 카드. 차트 표시 설정과 `getNumberingSystem()`의 호스트 공개, 그리고 세션 설정과 치아 메모에 빠져 있던 `onStateChange` 알림
- [@JulianoBazzi](https://github.com/JulianoBazzi): 브라질 포르투갈어 번역
- [@yassine-bhn](https://github.com/yassine-bhn): 프랑스어 번역과 실측 형태 후보 데이터
- [@saegerdirk-star](https://github.com/saegerdirk-star): 실측 치아 형태와 치아 생성 도구, 그리고 조합 가능한 인터페이스 제안. 그 포크에서 받아들인 세 가지 수정(PDF 환자 식별, 치주 차트 치아 방향, 선택 속도)
- [@sofia-cluadette](https://github.com/sofia-cluadette): `getSelectedTeeth()` 선택 API
- [@Ditherys](https://github.com/Ditherys): 확장된 실측 치아 집합 — 형태 생성기의 영구치와 유치 전체 명세, 그 오버레이 등록 메타데이터와 검증 모음. 그 포크에서 이식했습니다

**사용 기술** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com).

**라이선스.** 이 프로젝트는 MIT 라이선스이며 상업적 이용도 포함합니다 — 그리고 그것은 치아 도안에도 적용됩니다(독자적인 창작물입니다). 포함된 PDF 폰트와 런타임 의존성은 각자의 (역시 허용적인) 조건을 따릅니다: [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md)를 보세요.

기여를 환영합니다. GitHub에서 풀 리퀘스트를 보내 주시면 여기에 크레딧을 기재합니다. 이 프로젝트가 도움이 되었다면 [GitHub에서 스타를 눌러](https://github.com/ZoliQua/React-Advanced-Odontogram) 주세요.
