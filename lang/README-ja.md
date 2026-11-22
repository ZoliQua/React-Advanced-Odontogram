<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/React-Advanced-Odontogram/main/src/assets/react-module-logo.png" alt="React Advanced Odontogram ロゴ" width="160" />
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

## 📑 目次

- [📋 概要](#-概要)
- [📦 npm パッケージとして使う](#-npm-パッケージとして使う)
- [✨ 主な機能](#-主な機能)
- [📦 モジュール](#-モジュール)
- [🛠️ UI コントロール](#-ui-コントロール)
- [🦷 歯の種類と状態](#-歯の種類と状態)
- [⚙️ 設定](#-設定)
- [🖼️ SVG テンプレートシステム](#-svg-テンプレートシステム)
- [🔢 歯式表記](#-歯式表記)
- [🚀 使い方](#-使い方)
- [🔗 連携](#-連携)
- [🧪 テスト](#-テスト)
- [📖 API ドキュメント](#-api-ドキュメント)
- [📡 公開 API](#-公開-api)
- [💾 状態の永続化（localStorage）](#-状態の永続化localstorage)
- [💾 状態のエクスポート／インポート形式](#-状態のエクスポートインポート形式)
- [🖨️ エクスポート](#-エクスポート)
- [📁 フォルダ構成](#-フォルダ構成)
- [⚙️ 技術スタック](#-技術スタック)
- [📝 補足](#-補足)
- [🔒 セキュリティに関する注意](#-セキュリティに関する注意)
- [📖 引用方法](#-引用方法)

## 🇯🇵 日本語

### 📋 概要
本プロジェクトは、ブラウザで動作する対話型の歯式図（オドントグラム）エディタであり、すっきりした UI で素早い歯式記録を支援します。修復物、う蝕、根管の状態、動揺度、その他の臨床的な詳細を表現するために階層化された SVG の歯テンプレートを描画し、同時に複数選択、選択フィルタ、定義済みの状態プリセットを提供します。

---
![歯式図エディタ — 英語版プレビュー](screenshot_en_odontogram.png)

🔗 **テスト用 URL:** https://react-advanced-odontogram.vercel.app/

---

### 📦 npm パッケージとして使う

本歯式図は、自己完結した React コンポーネントライブラリとして npm で配布されています:
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)。

#### 要件
- **React 18 または 19**（peer dependency として宣言 — アプリ側が提供します）。
- `exports` フィールドと ESM を理解する**バンドラ**: Vite、webpack 5、Next.js、Rollup、esbuild、Parcel。本パッケージは **ESM 専用**です。
- ツール実行のため Node **18 以上**。

#### インストール

```bash
npm install react-advanced-odontogram react react-dom
```

#### 基本的な使い方

`OdontogramShell` を描画し、スタイルシートをアプリ内のどこかで**一度だけ**読み込みます:

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="ja"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr | ja | ko
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### コンポーネントの props

`OdontogramShell` は制御コンポーネントです。よく使う props:

| Prop | 型 | 既定値 | 説明 |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | UI の言語（`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`/`fr`/`ja`/`ko`）。 |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | 歯式表記の方式。 |
| `darkMode` | `boolean` | `false` | ダークテーマの切り替え。 |
| `readOnly` | `boolean` | `false` | すべての編集を無効化（閲覧専用）。 |
| `themeConfig` | `OdontogramThemeConfig` | — | テーマの CSS 変数（`--odon-*`）を上書き。 |
| `plugins` | `OdontogramPlugin[]` | — | 独自の状態プラグイン／追加レイヤーを登録。 |
| `enableNotes` | `boolean` | `false` | 歯ごとのメモを有効化。 |
| `enableIcdas` | `boolean` | `false` | ICDAS II のう蝕評価を有効化。 |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | 充填カードの詳細度: `"simple"`（歯ごとに 1 材料）または `"complex"`（面ごとの材料）。 |
| `fillingDefectEnabled` | `boolean` | `true` | 充填カードで充填物の欠陥所見を有効化。 |
| `fillingMaterialAvailability` | `Record<string, boolean>` | すべて利用可 | `amalgam`/`composite`/`gic`/`temporary` に対する真偽値マップとして、利用可能な充填材料を指定（未知のキーは無視）。 |
| `fissureSealingEnabled` | `boolean` | `true` | 充填カードで小窩裂溝填塞を有効化。 |
| `screenToothSpacing` | `"wide" \| "normal" \| "close"` | `"normal"` | 画面上の歯と歯の間隔。 |
| `screenToothNumberSize` | `"small" \| "normal" \| "xlarge"` | `"normal"` | 画面グリッドにおける歯番号の大きさ。 |
| `selectionColor` | `string` | `"#3b7bff"` | 選択リングの色（`#rrggbb`）。 |
| `selectionBorderStyle` | `"solid" \| "dashed" \| "dotted"` | `"dashed"` | 選択リングの線種。 |
| `toothInfo` | `boolean` | `true` | 歯の情報パネルを表示。 |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | 利用者が設定 → 充填で該当設定を変更したときに発火。 |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | 利用者が UI から設定を変更したときに発火。 |

より細かい詳細度の props（`pulpDetailLevel`、`secondaryCariesMode`、`rootCariesMode`、`radiographicDepthMode`、`wearDetailLevel`、`discolorationDetailLevel`、`surfaceNotation`、`showStatusCard`、`showOrthoCard`）も受け付けます — 完全で型付きの一覧は同梱の `.d.ts` 型定義を参照してください。

上記 4 つの充填関連 props は**復元専用**です: 省略した prop はエンジンに書き込みません（マウント前の命令的な `setFillingComplexity()` 呼び出しは保持され、スタンドアロンモードも変わりません）。一方、与えた prop はエンジンと設定モーダルの状態を同時に書き換えるため、モーダルが古い値を表示することはありません。`fillingMaterialAvailability` は正規化したシリアライズ済みキーに対して差分適用されるため、内容が同一のインラインリテラルで再レンダリングしてもエンジンへの再書き込みは起きません。対応する `on*Change` コールバックは設定 → 充填から発火します — 設定を永続化するホストのための書き戻し経路です。

#### 公開 API（名前付きエクスポート）

`OdontogramShell` は既定エクスポートでもあり、名前付きエクスポートでもあります。命令的な状態 API、単独利用できる `PerioChart` コンポーネント、ガイドツアー、そしてすべての公開型は、同じエントリポイントからの名前付きエクスポートです:

```ts
import {
  OdontogramShell,           // 既定エクスポートでもある
  PerioChart,                // 単独利用できる歯周チャートコンポーネント
  // 状態の読み取り
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // 状態変化を購読
  // エクスポート／インポート
  exportFhir,                // HL7 FHIR R4 バンドル
  exportSvg, exportImage,    // ベクター／ラスターでのチャート出力
  setImportFormat,
  // 制御
  setReadOnly, getReadOnly,
  clearSelection, getSelectedTeeth,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // オンボーディングツアーを開始
  // …その他多数の setX/getX 設定関数
} from "react-advanced-odontogram";
```

全体（約 44 の関数に加え、`OdontogramSummary`、`OdontogramThemeConfig`、`OdontogramPlugin`、`FhirExportOptions`、`PerioViewMode` などの型）は同梱の型定義で完全に型付けされています。

#### 組み合わせ可能なサーフェス（上級）

`OdontogramShell` はサポート対象のオールインワンコンポーネントであり、追加の設定を必要としません。歯式図の各領域を独自レイアウトの別の場所に配置したい場合は、シェルの 4 つの UI サーフェスもエクスポートされており、1 つの `OdontogramProvider` の下で組み合わせられます。いずれもパッケージが所有する単一のセッションを共有します:

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
    <OdontogramProvider language="ja" numberingSystem="FDI">
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

`OdontogramProvider` は `OdontogramShell` と同じ props を取ります。独自サーフェスを構築するための `useOdontogramUi()` フック（および `OdontogramUiContextValue` 型）も利用できます。現在の制約: 1 ページにプロバイダは 1 つだけ使用してください。サーフェスは必要に応じてマウント／アンマウントできます — 再マウント時に自動で再バインドされます。`OdontogramShell` 自体は変わっていません — まさにこの組み合わせを既定の配置で構成したものです。

さらに細かく組み合わせたい場合、個々のコントロールカードもエクスポートされています — `OrthodonticsCard`、`StatusesCard`、`CariesCard`、`FillingsCard`、`RootPeriodontiumCard`、`DiagnosesCard`、`ToothDetailsCard` — いずれも自己完結した宣言的コンポーネントで、エンジン API を通じて共有セッションを読み書きします（独自構築用に `useEngineState()` フックもエクスポートされています）。あるレイアウトで必要なカードだけを、任意の配置で、1 つの `OdontogramProvider` の下にマウントしてください。歯周コンテキストのサイドバーと症例診断ダイアログもエクスポートされています — `PerioSidebar` と `CaseDiagnosesModal` — ので、シェルを置き換えるレイアウトでも両方を描画できます。

#### Next.js（App Router）で使う

本コンポーネントはクライアント専用なので、Client Component から描画してください:

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="ja" numberingSystem="FDI" />;
}
```

あるいはクライアント専用の動的インポートで読み込みます: `dynamic(() => import("./OdontogramClient"), { ssr: false })`。

#### 重要な注意と現時点の制約
- **ESM 専用** — 本パッケージは単一の ES モジュール（`dist/odontogram.js`）と型定義エントリ（`dist/index.d.ts`）を公開します。バンドラのモジュール解決を対象としており、CommonJS ビルドはありません。
- **スタイルシートは別** — `react-advanced-odontogram/style.css` を**必ず**一度読み込んでください。自動では注入されません。スタイルは `.odontogram-root` 配下にスコープされたグローバル CSS で、`--odon-*` CSS 変数で制御します。
- **SSR / クライアント専用** — 本コンポーネントはマウント時に DOM（`document`）を読むため、ブラウザで動作する必要があります。SSR フレームワークでは Client Component（`"use client"`）内で描画するか、クライアント専用の動的インポートを使ってください。
- **アセットは自己完結** — 歯とアイコンの SVG はビルド時に JavaScript バンドルへインライン化されます。**実行時のアセット取得はなく**、設定も、public フォルダへの追加コピーも不要です。
- **1 ページに 1 インスタンス** — エンジンの状態は現在モジュールレベルのシングルトンなので、同一ページに 2 つの `<OdontogramShell>` を描画すると 1 つのチャートの状態を共有してしまいます。複数インスタンス対応は将来のリリースで予定しています。

---

### ✨ 主な機能
- 🖱️ 素早い選択と複数選択（CMD／CTRL ＋ クリック）
- 🦷 歯種: 永久歯、乳歯、インプラント、歯肉下、欠損
- 🦷 歯質（修復物とは直交する軸）: 健全、残根、破損、支台歯形成済み
- 👑 修復物は種類 × 材料で指定: クラウン／インレー／アンレー／ラミネートベニア／ブリッジ体を e.max、金、グラディア、ジルコニア、メタル、メタルセラミック、テレスコープ、暫間のいずれかで（アンレーは咬合面ビュー専用）— クリック数を抑えた「固定: クラウン – …」の統合ピッカーから選択します。従来の `metal` クラウンは `metal-ceramic`（メタルセラミック）へ移行します。インプラントも同じ種類 × 材料モデルを用い、インプラントコネクタ層と合成されます。ピッカーは歯種でスコープされます: インプラントはクラウン／ブリッジのみ（加えて後述の 5 つのアタッチメント）、欠損歯はブリッジのポンティックのみ（加えて部分床／全部床）、`radix`（残根）の歯質では修復物コントロールそのものを隠します（残根に修復物は記録できません）
- 🦿 可撤性・アタッチメント系の補綴は専用の `prosthesis` 軸に（統合ピッカーの「可撤性:」項目）: インプラントのヒーリングアバットメント、ロケーター、ロケーター併用オーバーデンチャー、バー、バー併用オーバーデンチャー、そして歯牙支持の部分床・全部床義歯
- 🌉 ブリッジの歯はクラウンキャップとサドルコネクタの両方を描画します。複数歯にわたるブリッジスパンのオーバーレイは、連続するブリッジ歯（ポンティック＋支台歯）とその間の歯間部をまたいで、歯列弓を考慮した 1 本の連続コネクタを描きます（上顎と下顎ではサドル形状を鏡像にし、どちらの歯列弓でもコネクタの位置が揃います）。PNG／JPG／SVG エクスポートにも含まれ、状態プリセットからブリッジを適用した場合もオーバーレイは即座に再計算されます
- 🔍 6 面のう蝕記録: 近心、遠心、頬側、舌側、咬合面、歯冠下
- 🪥 面ごとの充填材料: アマルガム、コンポジットレジン、グラスアイオノマー、仮充填
- 🏥 「歯髄／根管の状態」を 1 つに統合したセレクタ（生活歯髄と治療済み／根管でグループ分け）: 根管の状態（薬剤根管充填、根管充填、不完全根管充填、グラスファイバーポスト、メタルポスト）と AAE の歯髄診断（`pulpDx`: 正常／可逆性／不可逆性歯髄炎／壊死）は相互排他です — 根管治療済みの歯（`endo` が設定済み）は生活歯髄の診断を併せ持てません。治療を設定すると `pulpDx` は `normal` に正規化され、病的歯髄のグリフは抑制されます。可逆性歯髄炎は縮小した歯髄グリフを描画します。3 段階の歯髄詳細度設定（`pulpDetailLevel`: 簡易／AAE／実用ラテン語）を有効にすると、`pulpLatin` を介して 9 種の実用ラテン語の歯髄サブタイプ（pulpa sana … gangraena pulpae）が選べます。歯根端切除とパラパルパルピンは独立した特別指標のままです
- 🦴 根尖診断（`apicalDx`: 症状のある／ない根尖性歯周炎、急性／慢性根尖性膿瘍、硬化性骨炎）が根尖グリフを直接駆動します。肉芽腫／嚢胞という病変サブタイプの修飾子は、症状のある／ない根尖性歯周炎の下でのみ表示されます（冗長な「膿瘍」サブタイプは廃止されました — 根尖診断で既に表現されています）
- 🩹 「歯根と歯周組織」カードを統合（根／根尖と歯周の所見を 1 つの折りたたみ可能なセクションに）
- ⚕️ 修飾: 根尖性炎症（欠損歯と抜歯創の歯にのみ表示。現存歯では `apicalDx` のみが根尖グリフを駆動するため非表示、インプラントでは `periImplant` が担うため非表示）、歯周疾患、動揺度（M1／M2／M3、インプラントでは非表示）
- 🦷🔩 インプラント周囲の状態（`periImplant`: なし／粘膜炎／インプラント周囲炎 軽度・中等度・重度）— 2018 年 World Workshop の病期分類に基づき、インプラントで専用セレクタとして表示されます。粘膜炎は既存の歯周の歯肉グリフを再利用し、インプラント周囲炎はさらに段階づけられた `peri-implant-bone-loss` 層を不透明度 0.4／0.7／1.0 で有効化します。インプラントは根尖病変グリフを描画しなくなり（炎症はこの軸で表現されます）、歯周修飾のチェックボックスもインプラントでは非表示になります（その場しのぎだった「インプラント周囲炎」チェックボックスのラベル変更は廃止）
- 🏷️ 特別指標: 歯冠が必要、歯冠の再製が必要、閉鎖した欠損、抜歯予定、小窩裂溝填塞、コンタクトの喪失
- 👁️ 咬合面ビュー、第三大臼歯、骨、歯髄の表示切り替え
- 🔢 12 種の選択フィルタ（すべて、現存歯、永久歯、乳歯、インプラント、欠損、上顎／下顎、前歯／大臼歯）
- 📊 定義済みの状態プリセット（リセット、乳歯列、混合歯列、無歯顎）
- 📦 34 種の定義済み修復テンプレート（ブリッジ、可撤性義歯、インプラント併用のバーオーバーデンチャー）
- 💾 状態の JSON エクスポート／インポート（バージョン 2.22。旧来の 1.4 および 2.0〜2.21 も読み込み可能で自動移行します。プラグインのカスタム状態と歯ごとのメモを含みます）
- 💽 オプトインの localStorage 永続化（`enablePersistence`／`disablePersistence`／`clearPersistedState`／`isPersistenceEnabled`）— 既定では無効。有効にすると状態変化ごとに現状チャート（および任意で計画チャート）を自動保存し、次回マウント時に復元します。4 MB のサイズガードを備え、ストレージや解析のエラーは例外を投げずに `onError` コールバック（または `console.warn`）へ回されます
- 🔗 HL7 FHIR R4 エクスポート（歯ごとの Observation を収めた collection Bundle、永久歯**および**乳歯（51-85、インポート時に無損失で往復）の ISO 3950 歯コード、ローカルコードシステム、さらにオプトインの SNOMED CT オーバーレイ（設定 → SNOMED CT））。重症度が記録されたう蝕コンポーネントはスコアリング体系のコーディングも併せ持ちます — 未充填（一次）面では ICDAS、充填済み（二次）面では CARS。DX-11 以降、計画チャートも一緒に出力されます: 計画された各介入は、その歯の意図された臨床状態でコード化された `ServiceRequest`（`intent: "plan"`）になります。
- ✚ う蝕と充填のための十字型の面選択 UI（B／M／O／D／L）
- 🧱 面ごとの修復材料（混在する充填、例: 頬側アマルガム＋遠心コンポジット）
- 🖼️ チャートの PNG／JPG／SVG 画像エクスポート（ダウンロード可能。PNG／JPG はベクター SVG からラスタライズ）
- 🦷 う蝕／二次う蝕は面ごとの状態機械です: 充填のない有う蝕面は一次う蝕として描画され（ICDAS に応じた不透明度）、その面に充填が存在すると二次う蝕として描画されます（`subcaries-{surface}` 層、CARS でスコア化）— 同じ面で両方が同時に有効になることはありません
- 🎯 面ごとの統一重症度（`cariesSeverity`、0–6。従来の ICDAS 深さと CARS の別フィールドを置き換え）: 一次面では ICDAS の深さとして、二次面では名前付きの CARS スコア（健全 … 広範な齲窩）として読まれ、その面の現在の状態に関係するスケールだけを表示する文脈依存のポップアップから入力します
- 🌱 根面う蝕（`rootCaries`: なし／活動性／停止性／齲窩を伴う活動性）。専用の根面う蝕アートワーク層を重症度に応じた不透明度で有効化します（活動性 0.5／停止性 0.7／齲窩を伴う活動性は完全）
- 📡 エックス線的う蝕深さ（`radiographicDepth`: 面ごとに なし／E1／E2／D1／D2／D3）。視覚的な ICDAS／CARS 重症度スケールとは独立で、バッジとして表示され、専用の FHIR Observation で往復します
- 🎚️ 3 つのう蝕粒度設定（`secondaryCariesMode`、`rootCariesMode`、`radiographicDepthMode`）と `cariesDepthEnabled` トグル。保存値を失うことなく、各スケールをより単純なピッカー表示に畳めます
- 🩹 充填パネルの二次う蝕サマリー行: 二次う蝕がある選択中の歯とその面を、充填コントロールの下に列挙します（例: 「36 (O) の充填物に二次う蝕が記録されています。」）
- 🪛 面ごとの充填物の欠陥（`fillingDefect`: なし／辺縁の欠陥／破折／摩耗）を直接修復に。二次う蝕とは独立で、充填カードの面ごとインジケータから入力し（う蝕深さのインジケータと対称、選択肢は縦積み）、チャートに描画され、ツールチップと全顎の充填サマリーに明示的なラベル付きで表示されます（例: 「36 (O) – 充填物の欠陥: O: 辺縁の欠陥」）。う蝕の行で二次う蝕にラベルが付くのと同じ方式です。充填カードは、充填物の欠陥が記録された選択中の歯についてヒント注記も表示します（例: 「36 に充填物の欠陥が記録されています。」）。既存の二次う蝕のヒント注記と対になります
- 🦷💥 臨床的な原因と部位で型付けされた歯の摩耗（`wearEdge`: なし／咬耗／酸蝕、切縁・咬合面。`wearCervical`: なし／摩耗／アブフラクション／酸蝕、歯頸部）— 2 つのオン・オフのブラキシズム摩耗フラグを置き換えます。摩耗行の 2 つのドロップダウンから入力し、既存の摩耗アートワークを再利用し、ツールチップと新しい全顎「摩耗」サマリーセクションに表示されます
- 🎨 原因別の歯の変色（`discoloration`: なし／テトラサイクリン／歯のフッ素症／失活／外来性／その他）を永久歯と乳歯に。修復物がなく歯質が健全な歯では、表示中の天然歯冠を代表的な色で着色します。ツールチップと新しい全顎「変色」サマリーセクションに表示され、充填物の欠陥と摩耗と並んで表面・構造的病態のセットを完成させます
- ✏️ 前歯（切歯・犬歯）は UI 全体（ピッカー、ポップアップ、サマリー）で咬合面を「切縁」と表示します。保存される面キーは `occlusal` のままです
- 🔤 位置を考慮した歯面表記（設定 → 歯の詳細 → 「歯面の表記」、簡易／完全、既定は完全）: 完全モードではう蝕・充填の面の記号とラベルが歯の解剖に従います — 咬合面 → 前歯では I／切縁、頬側 → 前歯では L／唇側、舌側 → 上顎では P／口蓋側、下顎では L／舌側（近心・遠心・歯冠下は影響を受けません）。簡易モードは歯の位置に関係なく常に汎用の B／M／O／D／L／SC を用います。全顎サマリーと、う蝕および充填物欠陥の面ピッカー（記号＋見出し）に適用されます。保存される面キーは影響を受けません
- 🦷↕️ 歯ごとの矯正記録（`orthoAppliance`: なし／ブラケット／バンド。`orthoDrift`: なし／近心／遠心。`orthoVertical`: なし／挺出／圧下。`orthoRotation`: 真偽値）を現存する天然歯（永久歯または乳歯）に — v2.5.0 以来休眠していた矯正アートワークを再利用します（新規 SVG なし）。チャート、ツールチップ、新しい全顎「矯正」サマリーセクションに表示されます
- 🪨 歯石、および内部性／外部（歯頸部）性で型付けされた歯根吸収（`resorptionType`）
- 📏 面ごとのう蝕深さ（表層／象牙質／深在性）、または `enableIcdas` による任意の ICDAS II スコアリング（0–6）
- 🩹 歯冠辺縁の漏洩トグル。クラウンまたはブリッジの修復がある場合のみ表示されます
- 🧬 標準準拠の診断コーディング（WHO ICD-10、常時有効）: 記録された各所見から ICD-10 コード付きの診断を導きます — う蝕（K02）、根面／セメント質および停止性う蝕（K02.2／.3）、歯髄炎と歯髄壊死（K04.0／.1）、根尖性歯周炎、根尖性膿瘍と歯根嚢胞（K04.4–.9）、咬耗／摩耗／酸蝕／アブフラクション（K03.0–.8）、歯石（K03.6）、吸収（K03.3）、変色（K00.3／K00.8／K03.7）、歯の喪失（K08.1）、残根（K08.3）、歯の破折（S02.5）— ツールチップと全顎サマリーに表示され、FHIR Condition として出力されます。
- 🩺 歯ごとの診断カード: その歯から導かれた ICD-10 診断を確認し、調整できます — 誤って導かれたものを抑制し、チャートが表現していないものを追加できます。実効集合（導出 − 抑制 ＋ 追加）が FHIR エクスポートを駆動します。
- 🗺️ 症例／領域の病態: 単一の歯に紐づかない全顎診断を記録できます — 不正咬合と顎関節（K07）、口腔の嚢胞（K09）、唾液腺疾患（K11）、口内炎と口腔粘膜（K12／K13）、歯列弓レベルの発育異常（K00）— それぞれ任意で左右（左／右／両側）を指定できます。
- 🌍 各国のコードパック（設定 → 診断コード体系）: WHO ICD-10 を基礎に各国のコード体系を重ねます — BNO-10（ハンガリー、ローカライズされた表示。WHO コードは保持）または米国 ICD-10-CM（コードを再マッピング、例: K07 の歯顎顔面域 → M26）。別の国のパックを追加するのは小さな `CodingPack` エントリの追加です — `CODING_PACKS.md` を参照。
- 🔬 SNOMED CT オーバーレイ（設定 → SNOMED CT、オプトイン、既定はオフ）: WHO および各国パックのコーディングと並べて SNOMED CT のコーディングを追加し、WHO ICD-10 コードを持たないインプラント周囲の所見もコード化します。ICD-10-CM と SNOMED のコンセプト ID は参考値・最善努力です — 臨床利用の前に公式の ICD-10-CM 一覧／SNOMED CT ブラウザで検証してください。
- 🔁 FHIR Condition の往復: 診断は Observation と並んで FHIR `Condition` リソースとして出力され（歯に紐づくもの、および左右を bodySite に持つ患者レベルの症例病態）、インポートでそれらを再構成します — 症例病態は直接、歯ごとの追加／抑制の上書きは、インポートした Condition と再導出したチャートを差分して復元します。
- 🩺 **診断カード、改訂:** 歯ごとの各診断行は ICD-10 コードを先に表示し（`K04.0 歯髄炎`）、行はコード順に並びます。各行には**除外**トグル（FHIR エクスポートから外しつつチャートには残す）と**削除**（×、診断*と*その歯の所見をまとめて削除）があります。ピッカーから診断を追加すると裏側のチャート所見が書き込まれるため、グリフは即座に現れます。
- 🗂️ **症例／領域の診断ポップアップ:** 全顎および領域の診断（顎の異常、嚢胞、唾液腺や粘膜の疾患…）は歯周サイドバーから独立したダイアログへ移り、歯式図／歯周状態トグルの横の**診断**ボタンから開きます。そのピッカーもコード先出し・コード順です。
- 🇭🇺 **BNO-10 パック:** ハンガリー語の表示文字列は公式の NEAK BNO-10 名称になり、パックは標準の ICD-10 システム URI を使用します（BNO-X は WHO ICD-10 と同一です）。
- ✅ **HL7 バリデータでクリーンな FHIR エクスポート:** Bundle の各エントリは決定的な `id` と絶対 `fullUrl` を持ち（`urn:uuid` のプレースホルダは使いません）、Bundle はエンジン自身の **CodeSystem** を埋め込むため、検証時にローカルコードが解決します。同じ CodeSystem はリポジトリに `fhir/CodeSystem-odontogram.json` として公開されています（FHIR エクスポートのオプションで `includeCodeSystem: false` を渡すと省略できます）。
- 🎯 **チャートに追従する ICD コード（データ駆動の特異性）。** う蝕の深さは、エックス線的深さが記録されていればそれを用い（E1／E2 → エナメル質、D1–D3 → 象牙質）、なければ ICDAS 重症度にフォールバックします（1–3 → エナメル質、4–6 → 象牙質）。これにより WHO の `K02` は `K02.0`／`K02.1` へ、ICD-10-CM の `K02.9` は面 × 深さに応じて `K02.51/.52`（小窩裂溝）または `K02.61/.62`（平滑面）へ精緻化されます。慢性歯周炎は 2017 年の病期と広がりから ICD-10-CM コード（`K05.311`–`K05.329`）を取ります。歯ごとに 1 つの Condition が、最も深い病変を担います。
- 🔄 **歯周データが FHIR で往復します。** インポータは LOINC 74029-0 の歯周パネルを各歯へ読み戻します — プロービング深さ、歯肉辺縁（CAL から再構成するため偽ポケットの値も保たれます）、BOP、根分岐部、O'Leary のプラーク、PI／GI とインプラントの mPI／mBI 指数、付着歯肉幅 — さらに喫煙状況と HbA1c のエビデンス Observation も含みます。ICD-10-CM または SNOMED CT のみでコード化された Condition も認識するため、外部のバンドルでも読み取れるものは読み取ります。
- 🧬 **診断カタログ全体に SNOMED CT。** 50 枠のうち 48 が検証済みの SNOMED CT International コンセプト（アクティブ、コアモジュール、FSN 一致）を持ちます。2 つは意図的に未設定です — SNOMED International に包括コンセプトが存在しないためで、顎の大きさの異常（K07.0）と歯顎顔面の機能異常（K07.5）です。SNOMED オーバーレイは設定でのオプトインのままです。
- 📦 **読み込み可能な FHIR 用語パッケージ。** リポジトリの `fhir/` フォルダは FHIR NPM パッケージ（`react-advanced-odontogram.fhir`、FHIR 4.0.1）で、エンジンの CodeSystem と生成された ValueSet を収めています — 臨床軸の値グループごとに 1 つ、所見タイプ用に 1 つ、全コードのセットが 1 つ。バリデータに `-ig ./fhir` で渡せます。
- 🧰 統一されたトップバーのアイコン列と、タブ付きの設定モーダル（一般／パネル／歯の詳細／う蝕／歯髄／メモ／歯周 — 歯式表記、メモ、パネルの表示、ICDAS、う蝕深さトグル、根面／エックス線的う蝕の粒度、歯髄の詳細度、歯の摩耗・変色の詳細度、歯の情報）
- 🗂️ 設定 → 「パネル」タブ: 状態と矯正の全顎サマリーパネルを個別に表示／非表示
- 🦷🩺 設定 → 「歯周」タブ: 歯周チャートの行に対する 16 個の指数ごとの表示／非表示トグル（ポケット／口腔衛生／歯肉粘膜／支持組織／インプラント周囲にグループ分け — PD／GM／CAL／BOP、プラーク、PI、GI、CEJ の視認性、歯根の陥凹、KG、GT、根分岐部、動揺度、Miller 分類、mPI、mBI）。それぞれ説明が付き、加えて指数名を翻訳するか標準表記にするかの表示オプションがあります（標準表記＝どの UI 言語でも固定の英語／ラテン語の学術名。ツールチップはこの設定にかかわらず常にローカライズされます）。どちらもアプリレベルの設定（`perioViewMode` と同様）で、エクスポートのペイロードには一切含まれません
- 🩹 二次う蝕（CARS）の設定コントロールをう蝕設定タブへ統合し、エックス線的深さの上に配置（独立した「二次う蝕」タブは廃止）
- 🎚️ 歯の詳細の詳細度（設定 → 歯の詳細）: 歯の摩耗と変色に対する簡易／詳細の設定。簡易モードは所見ごとに有無のトグルを表示し（摩耗オン → 咬耗／摩耗、変色オン → その他）、詳細モード（既定）は種類・原因のドロップダウンを保ちます。詳細度を切り替えても保存値は保持されます
- 📋 歯の情報パネル: チャート全体のライブなテキストサマリー（歯数、現存／欠損の一覧、二次を含むう蝕、充填、根管治療、補綴、インプラント、歯周状態）— 既定で表示され、設定で切り替えられます
- 🗂️ エクスポートのドロップダウンを統合（状態 JSON／FHIR／PNG／JPG）
- 📥 FHIR インポートを備えたインポートのドロップダウン（出力した Bundle を往復できます）
- ⏳ 画像エクスポート中の進捗オーバーレイ
- 🎓 18 ステップの対話的な導入ツアー
- 🔢 3 つの歯式表記（FDI、ユニバーサル、パルマー）
- 🌐 多言語対応 — 14 の UI 言語（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO）と言語切り替え。アラビア語は UI を右から左に描画し、歯式／歯周チャートは左から右に固定します（機械翻訳であり、AR/ZH/FR/JA/KO は母語話者によるレビュー待ちです）。主バンドルに含まれるのは英語のみ — 他のすべての言語は別チャンクで、最初に選択された時点で取得されます
- 🌗 トグルボタン付きのダークモード対応（単独利用、または親アプリからの制御）
- 🎨 CSS カスタムプロパティ（`--odon-*`）によるテーマ設定（`themeConfig` prop）
- 📱 モバイルのタッチ UX: タップで拡大するポップオーバー、長押しのコンテキストメニュー、ピンチズーム、WCAG 準拠の 44px タッチターゲット、歯列弓切り替えによるナビゲーション
- 🔌 カスタム SVG プラグインシステム: 視覚的オーバーレイの注入、歯ごとのカスタム状態、JSON エクスポート／インポートへの対応 — プラグインの `renderSvg()` 出力はライブチャートへの挿入前に DOMPurify（SVG プロファイル）で無害化されます。それでもプラグインは信頼されたコードとして実行されるため、信頼できる提供元のプラグインのみを読み込んでください
- 🛡️ Content-Security-Policy: デモの本番ビルドは CSP メタタグを注入します（開発サーバーは影響を受けません）— 本コンポーネントを埋め込むホストアプリは自身の CSP を設定してください
- ⚠️ 両立しない歯の状態の組み合わせに対する状態検証の警告
- 🏷️ 歯のタイルに自動で出る状態ツールチップ（有効なすべての状態を表示）
- 🩺 刷新された歯ごとのツールチップと全顎サマリーパネル: どちらも臨床所見の全体を表示します（歯髄／根尖診断＋病変サブタイプ、歯根吸収、インプラント周囲の状態、段階づけられた根面う蝕、歯石、歯冠辺縁の漏洩、破折、コンタクトの喪失、型付けされた切縁・歯頸部の摩耗）。パネルには専用の「診断」セクションと「摩耗」セクション、さらに粗いう蝕重症度の修飾子（表層／中等度／深在性）が付きます
- ♿ キーボードアクセシビリティ（WCAG）: ARIA の listbox／option ロール、Enter／Space での選択、矢印キーでの移動、focus-visible のアウトライン
- 🔒 読み取り専用モード: 印刷・レポート・閲覧用途のためにすべての操作を無効化
- ✨ 選択のアニメーション: 選択された歯の脈動する破線枠と発光するドロップシャドウ（prefers-reduced-motion に対応）
- 📝 歯ごとのメモ: ダブルクリックでメモを追加・編集、歯番号の横にメモアイコン、ホバーでメモ本文のツールチップ、全顎サマリーパネルの「個別メモ」行、PDF レポートへの収録、JSON エクスポート／インポート
- 🔀 現状 ↔ 計画のチャート分離: チャートヘッダーの `現状 | 計画` トグルが、現在の**状態**チャートと**計画**（治療後に意図する状態）チャートを切り替えます。それぞれが独自の歯の状態を持ちます。計画チャートは最初に切り替えた時点で現状の複製として始まり、一方のチャートでの編集が他方に影響することはありません。エクスポート／インポート（`exportStatus`／`exportFhir`／ファイルインポート）は常に現状チャートを対象とし、計画チャートは独自の API で個別に読み書きします（後述の公開 API を参照）。現状と異なる場合には、JSON エクスポートに追加の `plan` セクションとして含まれます
- 📝 「何が変わるか」ボックス: 計画が現状と異なるとき、歯の情報パネルの下のボックスに、歯ごと・治療軸ごと（有無、歯質、修復物、補綴、計画された歯冠、矯正、歯髄／根管、根尖）のすべての差分を `歯: 軸  変更前 → 変更後` の行として列挙します。`getPlanChanges()` でプログラムからも取得できます

![全顎の歯周チャート — 英語版](screenshot_en_perio.png)

- 🩺 歯周記録: 歯ごとに標準の 6 部位で**プロービング深さ**、**歯肉辺縁**、**プロービング時の出血**（＋排膿）を記録し、**クリニカルアタッチメントレベル（CAL ＝ PD ＋ 歯肉辺縁）**、歯肉退縮、全顎の **%BOP** を導出します。**グラフィカルな全顎歯周チャート**では、各歯列弓を**頬側と口蓋（舌）側の 2 つの独立した SVG**として描画し（歯のアートワークを再利用し、どちらの面も歯冠を中央のバンドへ向ける統一した向きで。インプラントの歯には**インプラントの図**）、赤い **CEJ 線**、**数値付きのミリ単位ガイドグリッド**、歯の上に重なる**歯肉辺縁／ポケット深さの曲線**を備え、**中央の歯周指数バンド**（`▲ 頬側 … 舌側／口蓋側 ▼` と表示）で上下に分けられます。このバンドは歯全体に共通する指数を担い、**Miller 分類**を歯列弓のすぐ上に、**プラーク／PI／GI／mPI／mBI** を歯ごとの**解剖学的なひし形タイル**として描画します（頬側が上の頂点、舌側が下の頂点、中段の近心・遠心は側ごとに入れ替わり、近心が常に歯列弓の正中を向きます）。数値行（完全な指数名 — PD／GM／CAL／BOP ＋ 動揺度 ＋ 根分岐部 — をタッチしやすい大きめのセルで）は列で揃い、サマリー（平均 PD／CAL、%BOP、PI%）が付きます。入力は**キーボードで自動送り**できます。チャートは**利用可能な幅いっぱいに動的に拡大縮小**し、どのウィンドウサイズでも応答的です。`歯式図 | 歯周状態` の**ビュー切り替え**として提示され、そのビューが有効な間、右パネルは**歯周コンテキストのサイドバー**（患者データ、2017 年の分類、全顎サマリー）に転用されます（設定のオプションで提示方法全体を**ポップアップ**に戻せます）。また依然として**単独で呼び出せるコンポーネント**（`PerioChart` エクスポート）なので、ホストアプリは基本の歯式図とは独立に歯周チャートを呼び出せます。部位ごとの **FHIR** エクスポートは LOINC の歯周パネル（`74029-0`。PD `32910-2`、歯肉退縮 `32911-0`、CAL `32912-8`）経由です
- 🅿️ 提案のスタイリング: 計画モードでは、計画が現状に対して**追加**する所見（計画された歯冠、抜歯、矯正的移動、補綴 …）が、はっきりした**破線で色味を帯びた「提案」の輪郭**で描画され、計画が事実ではなく意図として読めるようになります。チャートカードには「破線＝提案」の凡例が付きます。現状モードの描画はバイト単位で同一であり、この処理は計画モード専用で、戻すと完全にリセットされます
- 🚦 計画モードのゲート: 計画チャートは歯科医が*行える*ことだけを示します — 基本のピッカーは 欠損／永久歯／インプラント のみを提供し、現状専用の所見（う蝕、歯の摩耗、変色、および歯周ブロック全体 — 動揺度、6 部位のプロービンググリッド、炎症／歯周の修飾、歯石、インプラント周囲の状態）は非表示になります。歯髄／根管のコントロールは根管**治療**（根管治療／ポスト／歯根端切除／パラパルパルピン）を残しつつ、歯髄／根尖の**診断**と歯根吸収を隠します。修復物、補綴、矯正、歯冠の必要・再製、抜歯予定は計画可能なままです
- 🧪 歯式表記、翻訳、プリセット、多言語対応、App コンポーネント、テーマ、タッチ、プラグイン、アクセシビリティ、臨床軸・診断のパリティを網羅する広範な Vitest 自動テスト群
- 📖 すべての公開エクスポートに JSDoc コメントを備えた TypeDoc API ドキュメント（`npm run docs`）

### 📦 モジュール
- 🦷 歯式図のグリッドと歯タイルの UI
- 🎛️ コントロールと状態パネル
- 🎨 SVG レイヤリングエンジンとテンプレート
- 🔢 歯の番号付けとラベルの対応（FDI／ユニバーサル／パルマー）
- 🌐 ローカライズ — 14 の UI 言語（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO）。アラビア語（RTL）を含みます
- 💾 状態のエクスポート／インポート
- 📋 状態の追加プリセット: 定義済みの修復テンプレート
- 🎨 テーマ設定: `--odon-*` CSS プロパティでカスタマイズできるカラーパレット
- 📱 モバイルのタッチ操作（タップで拡大、長押し、ピンチズーム、歯列弓切り替え）
- 🔌 カスタム SVG プラグインシステム
- ⚠️ 状態の検証とツールチップの仕組み
- ♿ キーボードアクセシビリティと ARIA 対応
- 🔒 読み取り専用モード
- ✨ 選択のアニメーション
- 📝 歯ごとのメモ機能
- 🧪 自動テスト群（Vitest ＋ Testing Library）

### 🛠️ UI コントロール

**🔝 トップバー:**
- 言語切り替え（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO のドロップダウン）
- ダークモード切り替えボタン（太陽／月のアイコン。ライトとダークのテーマを切り替えます）
- 歯式表記の切り替え（FDI／ユニバーサル／パルマーのドロップダウン）
- 状態のエクスポート／インポートのボタン

**📊 チャートのヘッダー:**
- 咬合面ビューの切り替え
- 第三大臼歯の表示切り替え
- 骨の表示切り替え
- 歯髄の表示切り替え
- 選択解除のボタン

**🔍 選択フィルタ:**
- すべて選択／現存歯すべて／永久歯／乳歯／インプラント／欠損歯すべて
- 上顎を選択／上顎前歯 6 本／上顎大臼歯
- 下顎を選択／下顎前歯 6 本／下顎大臼歯

**📋 状態プリセット:**
- すべてリセット（口腔内をリセット）
- 乳歯列
- 混合歯列
- 無歯顎の切り替え

**📦 状態の追加プリセットのドロップダウン:**
- 上顎／下顎のジルコニアブリッジ（12-22、13-23、16-26、全歯列弓）
- 上顎／下顎のメタルブリッジ（12-22、13-23、16-26、全歯列弓）
- 上顎／下顎の部分床義歯
- 上顎／下顎の全部床義歯
- 上顎／下顎のインプラント併用バーオーバーデンチャー

**🦷 歯のエディタパネル**（選択した歯に対して。折りたたみ可能なカードにまとめられています）:
- **歯種の行:** 歯の選択（破損歯冠のバリエーションを含む基本の種類）と歯質（健全／残根／破損／支台歯形成済み）
- **修復物の行:** 統合された「固定: …」／「可撤性: …」の修復ドロップダウン（`restorationType`×`restorationMaterial` の固定修復の選択肢に加え、`prosthesis` のアタッチメント・可撤性の選択肢。歯種でゲートされます）、歯冠辺縁の漏洩チェックボックス（クラウン／ブリッジのみ）、破損歯冠の部位チェックボックス、歯冠が必要／歯冠の再製が必要のトグル
- **摩耗と変色の行:** 切縁・咬合面の摩耗種類ドロップダウン、歯頸部の摩耗種類ドロップダウン、変色の原因ドロップダウン（設定 → 歯の詳細 → 簡易モードでは、それぞれ有無のトグルに切り替わります）
- **矯正カード:** 装置、近心／遠心への移動、垂直的移動（挺出／圧下）、捻転のトグル — 現存する天然歯で表示されます
- **う蝕カード:** う蝕深さのモードのドロップダウン、歯冠下う蝕のチェックボックス、根面う蝕の重症度ドロップダウン、そして B／M／O／D／L の面ごとのう蝕ピッカー（文脈依存の ICDAS 深さ／CARS ポップアップとエックス線的深さのバッジ付き）
- **充填カード:** 充填材料のドロップダウン、面ごとの充填ピッカー（面ごとの材料付き）、面ごとの充填物欠陥インジケータ（辺縁の欠陥／破折／摩耗）、二次う蝕と充填物欠陥のヒント注記
- **歯根と歯周組織のカード:** 統合された「歯髄／根管の状態」セレクタ、根尖診断のセレクタ、根尖病変のサブタイプセレクタ（症状のある／ない根尖性歯周炎のみ）、歯根吸収の種類セレクタ、動揺度のセレクタ、インプラント周囲の状態セレクタ（インプラントのみ）
- **特別指標:** 抜歯予定／抜歯創、閉鎖した欠損、小窩裂溝填塞、コンタクトの喪失、歯石、パラパルパルピン、歯根端切除、ブリッジ支台歯

### 🦷 歯の種類と状態

**歯の選択（基本の種類）:**
| 値 | 説明 |
|---|---|
| `none` | 欠損歯 |
| `tooth-base` | 永久歯 |
| `milktooth` | 乳歯 |
| `implant` | 歯科インプラント |
| `tooth-under-gum` | 歯肉下（未萌出）の歯 |

**破損歯のバリエーション:**
`tooth-broken-inicisal`、`tooth-broken-distal-inicisal`、`tooth-broken-distal`、`tooth-broken-mesial-distal-inicisal`、`tooth-broken-mesial-distal`、`tooth-broken-mesial-inicisal`、`tooth-broken-mesial`、`no-tooth-after-extraction`

**歯質（永久歯）:**
`natural`（既定）、`radix`（残根）、`broken`、`crownprep`（支台歯形成済み）

**修復物の種類（永久歯）:**
`none`、`crown`、`inlay`、`onlay`（咬合面ビュー専用）、`veneer`、`bridge`

**修復物の材料（永久歯）:**
`none`、`emax`、`gold`、`gradia`、`zircon`、`metal`、`metal-ceramic`（従来の `metal` クラウンはここへ移行）、`telescope`、`temporary`

**修復物の選択肢は歯種でゲートされます**（`src/registry/restorations.ts` の `restorationOptions()`）: インプラントは `crown`／`bridge` の修復種類のみ（インプラントコネクタ層と合成）に加えて後述の 5 つの `prosthesis` アタッチメント項目、欠損歯は `bridge` のポンティックのみに加えて 2 つの可撤性義歯の `prosthesis` 項目、`radix` の歯質では修復物コントロールそのものを隠します。従来の平坦な `crownMaterial`／`bridgeUnit` フィールド（v1.14 以前のインプラント／ブリッジのアタッチメント値）はライブモデルから廃止され、古いペイロードの読み取り専用の移行経路としてのみ受け付けます。

**補綴装置**（`prosthesis`。直交する可撤性・アタッチメント軸。統合された修復ドロップダウンの「可撤性:」項目として表示されます）:
`none`、`healing-abutment`、`locator`、`locator-denture`、`bar`、`bar-denture`（インプラントのアタッチメント。オーバーデンチャーの有無あり）、`removable-partial`、`removable-full`（欠損歯の上の歯牙支持義歯）。1 本の歯は固定修復か補綴装置のいずれかを持ち、両方は持ちません — 一方を設定すると他方は解除されます。

**歯冠辺縁の漏洩**（`crownLeakage`。真偽値）: `restorationType` が `crown` または `bridge` のときのみ表示され、`crown-leakage` のアートワーク層を有効化します。

**根管の選択肢（永久歯）:**
`none`、`endo-medical-filling`、`endo-filling`、`endo-filling-incomplete`、`endo-glass-pin`、`endo-metal-pin`

**根管の選択肢（乳歯）:**
`none`、`endo-medical-filling`

`endo` と `pulpDx` は 1 つに統合された「歯髄／根管の状態」`<select>`（生活歯髄と治療済み／根管でグループ分け）で表示され、相互排他です — 治療済み（`endo != none`）の選択肢を選ぶと `pulpDx` は `normal` に戻り、歯髄診断を選ぶと `endo` は `none` に戻ります。

**充填材料（永久歯）:**
`amalgam`、`composite`、`gic`、`temporary`

**充填材料（乳歯）:**
`composite`、`gic`、`temporary`

**充填／う蝕の面:**
`mesial`、`distal`、`buccal`、`lingual`、`occlusal`、`subcrown`（う蝕のみ）

**修飾:**
`inflammation`（根尖性）、`parodontal`（歯周）、`mobility`（M1／M2／M3）

**根尖病変の種類**（`periapicalType`。根尖グリフを修飾し、症状のある／ない根尖性歯周炎の下でのみ表示されます）:
`none`、`granuloma`、`cyst` — 入力可能な選択肢です。従来の `abscess` 値は依然として受け付け・保存されますが、根尖診断と重複するためピッカーには提示されません。インポート時には破棄されます: その歯が炎症の修飾を持つ場合は `apicalDx` へ畳み込まれ、そうでなければ `none` にクリアされます

**歯髄診断**（AAE の用語。`pulpDx`）:
`normal`、`reversible-pulpitis`（縮小した歯髄グリフを描画）、`irreversible-pulpitis`、`necrosis` — `endo` と相互排他で、根管治療済みの歯では `normal` に正規化されます

**歯髄診断、実用ラテン語**（`pulpLatin`。`pulpDetailLevel` が `latin` のときのみ歯髄ピッカーに表示されます）:
`none`、`pulpa-sana`、`hyperaemia-pulpae`、`pulpitis-acuta-serosa`、`pulpitis-acuta-purulenta`、`pulpitis-chronica-clausa`、`pulpitis-chronica-ulcerosa`、`pulpitis-chronica-hyperplastica`、`necrosis-pulpae`、`gangraena-pulpae`

**歯髄の詳細度**（`pulpDetailLevel`、全体設定）: `simple`、`aae`（既定）、`latin` — ピッカーが提示する歯髄の語彙を制御します

**根尖診断**（`apicalDx`。根尖グリフを駆動します）:
`normal`、`symptomatic-apical-periodontitis`、`asymptomatic-apical-periodontitis`、`acute-apical-abscess`、`chronic-apical-abscess`、`condensing-osteitis`

**歯根吸収の種類**（`resorptionType`）:
`none`、`internal`、`external-cervical`

**インプラント周囲の状態**（`periImplant`。インプラント専用、2018 年 World Workshop の病期分類）: `mucositis` は既存の歯周の歯肉グリフを再利用します。`peri-implantitis-*` は `peri-implant-bone-loss` 層を重症度に応じた不透明度で追加します（軽度 0.4／中等度 0.7／重度 1.0）。インプラントは根尖病変グリフを描画しなくなり（炎症はこの軸で表現されます）、`mods` の炎症／歯周のチェックボックスもインプラントでは非表示です:
`none`、`mucositis`、`peri-implantitis-mild`、`peri-implantitis-moderate`、`peri-implantitis-severe`

**う蝕の重症度**（`cariesSeverity`。面ごとの統一フィールド、`0`–`6`）: 充填のない面では ICDAS のう蝕深さスケール（`superficial`／`dentin`／`deep`、`enableIcdas` が設定されている場合は生の ICDAS II コード `0–6`）として読まれ、一次の `caries-{surface}` 層を描画します。充填のある面では名前付きの CARS スコア（`0` 健全 … `6` 広範な齲窩）として読まれ、代わりに `subcaries-{surface}`（二次う蝕）層を描画します — ある面が一次と二次を同時に取ることはありません

**根面う蝕**（`rootCaries`。現存歯で `caries-root` のアートワーク層を有効化し、不透明度は重症度で決まります — `active` 0.5／`arrested` 0.7／`active-cavitated` は完全）:
`none`、`active`、`arrested`、`active-cavitated`

**エックス線的う蝕深さ**（`radiographicDepth`。面ごと、視覚的な ICDAS／CARS の `cariesSeverity` スケールとは独立）:
`none`、`E1`、`E2`、`D1`、`D2`、`D3`

**う蝕の粒度設定**（全体）: `secondaryCariesMode`（`simple`／`standard`／`full`、既定 `standard`）、`rootCariesMode`（`simple`／`severity`、既定 `simple`）、`radiographicDepthMode`（`off`／`threeLevel`／`detailed`、既定 `off`）、`cariesDepthEnabled`（真偽値、既定 `true`）— それぞれ保存値を変えずにスケールをより単純なピッカー表示へ畳みます

**特別指標:**
`crownNeeded`、`crownReplace`、`missingClosed`、`extractionPlan`、`extractionWound`、`bridgePillar`、`fissureSealing`、`contactMesial`、`contactDistal`、`endoResection`、`calculus`、`parapulpalPin`

**歯の摩耗**（`wearEdge`、`wearCervical`。部位ごとの臨床的な型。歯種が tooth-base ＋ 修復物なし ＋ 歯質が健全であることを条件とし、既存の `tooth-bruxism-wear`／`tooth-bruxism-neck-wear` 層を描画します）:
`wearEdge`: `none`、`attrition`、`erosion` — `wearCervical`: `none`、`abrasion`、`abfraction`、`erosion`

**変色**（`discoloration`。歯ごとの原因。天然の tooth-base または乳歯 ＋ 修復物なし ＋ 歯質が健全であることを条件とし、表示中の天然歯冠の塗りを着色します — 新規 SVG はありません）:
`none`、`tetracycline`、`fluorosis`、`nonvital`、`extrinsic`、`other`

**充填物の欠陥**（`fillingDefect`。面ごと、二次う蝕とは独立した直接修復の所見 — `fillingSurfaceMaterials` に存在する面に限定され、`defect-{surface}` のアートワーク層を描画します）:
`none`、`marginal`、`fracture`、`wear`

**矯正**（`orthoAppliance`、`orthoDrift`、`orthoVertical`、`orthoRotation`。歯ごと、現存する天然歯 — 永久歯または乳歯 — を条件とします）:
`orthoAppliance`: `none`、`bracket`、`band` — `orthoDrift`: `none`、`mesial`、`distal` — `orthoVertical`: `none`、`extrusion`（上向き矢印のグリフ）、`intrusion`（下向き矢印のグリフ）— `orthoRotation`: 真偽値

**歯の詳細／表記の設定**（全体のセッション設定、設定 → 歯の詳細）: `wearDetailLevel` と `discolorationDetailLevel`（`ToothDetailLevel`: `simple`／`complex`、既定 `complex` — 簡易モードは完全な種類・原因ドロップダウンの代わりに有無のトグルを表示し、保存値は変えません）、および `surfaceNotation`（`simple`／`full`、既定 `full` — う蝕・充填の面の記号・ラベルを位置依存にするかを制御します。上記「位置を考慮した歯面表記」を参照）

### ⚙️ 設定
トップバーの歯車アイコンから開きます。フォーカストラップされた ARIA の `dialog` で、タブ付きのレイアウトです（Esc または背景クリックで閉じ、矢印キーでタブを切り替えます）。注記のない限り、すべての設定はセッションレベルの UI 状態にすぎません — どれも歯ごとのデータやエクスポートのペイロードを書き換えません。

- **一般:** 歯式表記（FDI／ユニバーサル／パルマー）、言語、ダーク／ライトのテーマ、歯の情報パネルの表示
- **歯式図:** 歯の形態プロファイル（既定の `classic`／`measured`）— `measured` は文献に基づき実測された 16 種の歯テンプレート（臨床的に区別される位置ごとに 1 つ。各大臼歯が独自の歯冠輪郭と根の本数を持ちます）を、2 つの歯列弓・歯ごとの幅のレイアウトで描画します。実行時に切り替え可能で、クラシックの既定には影響しません。そのアートワークは別チャンクで、切り替えたときにのみ取得されるため、クラシックの既定にコストはかかりません。乳歯として記録された歯は、永久歯の描画の中の層ではなく、独自の乳歯テンプレート（位置 1-5）から描画されます。チャートでも歯周チャートでも同様です
- **パネル:** 全顎の状態カードと矯正カードを個別に表示／非表示（どちらも既定は表示）
- **歯の詳細:** 摩耗の詳細度と変色の詳細度（簡易／詳細、いずれも既定は詳細）、歯面の表記（簡易／完全、既定は完全）
- **う蝕:** ICDAS II スコアリングのトグル（`enableIcdas`）、う蝕深さのトグル（`cariesDepthEnabled`）、根面う蝕の粒度（`rootCariesMode`: 簡易／重症度）、二次／CARS の粒度（`secondaryCariesMode`: 簡易／標準／完全）、エックス線的深さの粒度（`radiographicDepthMode`: オフ／3 段階／詳細）— 以前の独立した「二次う蝕」タブはこのタブに統合され、CARS のコントロールはエックス線的深さの直上に配置されています
- **歯髄:** 歯髄の詳細度（`pulpDetailLevel`: 簡易／AAE／実用ラテン語、既定 AAE）— 「歯髄／根管の状態」ピッカーが提示する語彙を制御します。変更すると全顎サマリーと開いているすべてのツールチップが即時更新されます
- **メモ:** 歯ごとのメモの有効・無効（`enableNotes`）
- **歯周:** 歯周チャートの 16 行すべてに対する指数ごとの表示／非表示トグル（`perioRowVisibility`、既定はすべて表示）。ポケット（PD／GM／CAL／BOP）／口腔衛生（プラーク／PI／GI）／歯肉粘膜（CEJ の視認性／歯根の陥凹／KG／GT）／支持組織（根分岐部／動揺度／Miller 分類）／インプラント周囲（mPI／mBI）にグループ分けされ、各行に独自の説明が付きます。加えて指数名を翻訳するか標準表記にするかのモード（`perioIndexNameMode`: 既定の `translated`／`canonical` — どの UI 言語でも表示される固定の英語／ラテン語の学術名）。アプリレベルの設定のみ（`perioViewMode` と同様）— 一切シリアライズされず、どちらのモードでもツールチップはローカライズされたままです

### 🖼️ SVG テンプレートシステム

**歯のテンプレート**（`src/assets/teeth-svgs/` 内）:
| テンプレート | 使用する歯 |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42（切歯） |
| `13.svg` | 13, 23, 33, 43（犬歯） |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45（小臼歯） |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48（大臼歯） |

テンプレートは下顎では 180 度回転し、左側では水平に反転します。

**アイコン SVG**（`src/assets/icon-svgs/` 内）:
`icon_8.svg`（第三大臼歯）、`icon_gum.svg`（骨）、`icon_no_selection.svg`（選択解除）、`icon_occl.svg`（咬合面ビュー）、`icon_pulp.svg`（歯髄）

**ホストが供給する描画**。ホストアプリは、ライブラリをフォークすることなく、`setToothTemplateOverrides()` または `toothTemplates` prop を通じて、これらのテンプレートを独自の SVG に置き換えられます。上書きは**形態プロファイルごと**にキー付けされます。テンプレート番号 N は `classic` と `measured` で別の描画だからです:

```ts
import { setToothTemplateOverrides, getToothTemplateRejections } from "react-advanced-odontogram";

setToothTemplateOverrides({
  classic:  { templates: { 11: myIncisorSvg }, templatesOccl: { 16: myMolarOcclusalSvg } },
  measured: { templates: { 11: myMeasuredIncisorSvg } },
});

getToothTemplateRejections(); // [] — すべて受け入れられました
```

各プロファイルは 4 つのマップを取ります — `templates`、`templatesOccl`、そして乳歯を独自のアートワークとして描画するプロファイル（`measured`）では `primaryTemplates` と `primaryTemplatesOccl`。上書きは形態プロファイルの変更を越えて保持され、`null` は工場出荷のアートワークを復元します。何も供給しなければ、エンジンは従来どおりの描画をそのまま提供します。

テンプレートはライブ DOM に入る信頼できないマークアップなので、**描画できるようになる前に検査されます** — 後述のセキュリティに関する注意を参照してください。拒否されたテンプレートは `getToothTemplateRejections()` で一覧でき、工場出荷の描画がそのまま残ります: チャートが歯のない状態になることはありません。

### 🔢 歯式表記

**FDI（ISO 3950）:** 永久歯 11-18、21-28、31-38、41-48。乳歯 51-55、61-65、71-75、81-85。

**ユニバーサル（米国）:** 永久歯は 1-32 の番号。乳歯は A-T の文字。

**パルマー（ジグモンディ・パルマー）:** 象限＋位置の形式（例: UR-1、LL-5）。乳歯は象限ごとに A-E の文字を使います。

### 🚀 使い方
開発:
```bash
npm install
npm run dev
```
ビルド:
```bash
npm run build
```
プレビュー:
```bash
npm run preview
```

### 🔗 連携
本コンポーネントはどの React アプリにも埋め込めます。
例:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="ja"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**ダークモードの連携:**
- **単独モード:** `darkMode` prop を省略します — コンポーネントがトップバーの切り替えボタンで自身のテーマ状態を管理し、`<html>` の `.dark` クラスを付け外しします。
- **制御モード:** `darkMode` と `onDarkModeChange` を渡します — 親アプリがテーマを制御します。切り替えボタンは表示されますが、内部状態を管理する代わりに `onDarkModeChange` を呼びます。`<html>` の `.dark` クラスの付け外しは親の責任です。

**カスタムテーマ:**
```tsx
<App
  themeConfig={{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
    // 歯の描画もテーマ設定できます。省略したキーはアートワークが描かれている色を
    // そのまま保つので、この設定は加算的です — 何も設定しなければ何も動きません。
    tooth: {
      // `body` は歯自身のシルエット — 歯冠と歯根の両方です。`classic` では
      // それが歯の全体で、`measured` では `dentin` を囲む外殻にあたり、
      // `dentin` を設定しない限りその色を受け継ぎます。
      body: '#f2f2f2',
      dentin: '#e6d7bf',
      outline: '#b9bdc2',
      // 色ではありません: その輪郭線の幅（SVG ユーザー単位）。
      outlineWidth: '1.4',
      gum: '#e8a5a0',
      bone: '#f6e6c8',
    },
    // `tooth` が扱わない面（材料ごとの修復色、グラデーションの停止点）向けに、
    // 任意のパレットトークンを名前で指定できます。
    tokens: {
      '--odon-rest-gold': '#d4af37',
      // 色ではありません: インプラントのフィクスチャ全体にかける CSS フィルタ。
      '--odon-implant-tint': 'hue-rotate(205deg) saturate(.85)',
      // …またはティントの代わりに、フィクスチャ全体を 1 色でフラットに。
      '--odon-implant-fill': '#8fa6b8',
    },
    // 選択のハイライト。アートワークではなく（チャートがタイルの周りに描きます）、
    // 1 つのオブジェクトでパレット全体を覆うためにここに置かれています。
    selection: { color: '#3b7bff', borderStyle: 'dashed' },
  }}
/>
```

描画は色を CSS カスタムプロパティとして保持し、出荷時の色をフォールバックに持つため、2 つの形態プロファイルが 1 つの設定に従い、エクスポートはページを離れる前にそれらを解決します。トークンの完全な表は `tools/toothgen/palette.py` にあります。ダークモードには専用のアートワークパレットが既に同梱されているので、チャートはぎらつかずにインターフェースの残りと一緒に暗くなります。`measured` プロファイルでは歯冠と歯根に象牙質のコアも入ります: `dentin` を設定するまでは本体の色を取るため、境界は求めたときにだけ現れます。ダークモードでは咬合面のタイルも側面ビューと一緒に暗くなり、う蝕病変は暗い塗りを保ちます — 輪郭が明色に反転して形を担うのです。「う蝕＝暗い」はどんなコントラスト比よりも先に読まれるからです。

**インプラントのフィクスチャは色を置き換えるのではなく、ティントをかけます**。その描画は光源を符号化した約 65 のほぼ同一の金属グレーを持つため、1 つずつテーマ設定できるようには意図的にしていません: 個別に設定すると、再テーマではなく陰影を平坦化してしまいます。`--odon-implant-tint` はフィクスチャ全体にかかる CSS フィルタなので、すべてのグレーが一緒に動き、それらの関係が保たれます — `hue-rotate(205deg) saturate(.85)`、あるいは独自の `url(#…)` フィルタでも構いません。設定しない限り `none` で、インプラント周囲の骨吸収オーバーレイには触れません: その層はフィルタ対象のグループの外にあるため、装飾的な設定が臨床的なシグナルを動かすことは決してありません。

**…あるいはパレットがそうであるなら、フラットにもできます。** `--odon-implant-fill` はフィクスチャ内のすべての図形の塗りを一度に置き換えるため、フラットな臨床パレットに独自のフィルタは不要です。各図形は自分が描かれているグレーにフォールバックするので、このトークンを設定しなければフィクスチャは従来どおりの描画そのままです — 単一の既定値を述べる余地がありません。2 つは合成されます: 塗りがフラットにし、続いてティントがシフトさせます。影響するのは `fill` のみなので、咬合面のスクリューホールの縁は輪郭を保ち、インプラント周囲の骨吸収オーバーレイはティントと同様にそのまま残ります。

**輪郭の幅もテーマ設定できます**。描画は `stroke-width` を一切宣言していないため、SVG の初期値 `1` で描かれます。`themeConfig.tooth.outlineWidth`（または `--odon-tooth-outline-width`）がそれを変えます。歯自身のシルエットであるすべての層に適用されます: 天然歯冠と乳歯の歯冠、残根、支台歯形成済みの歯、歯肉下の歯、7 つの破折状態すべて、そして咬合面の投影。したがって輪郭は、歯が残根や破折として記録された瞬間に `1` へ戻ることなく、どのように記録されていても 1 つの太さを保ちます — そしてチャート上で隣に並ぶ側面ビューと一緒に、咬合面のタイルも太くなります。固定幅のままなのは咬合面の溝だけです。

**プラグインの連携:**
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

// ある歯にプラグインの状態を設定する:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 テスト
```bash
npm run test           # Vitest の全テストを実行
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジレポート
npm run test:e2e       # ブラウザテスト（Playwright。初回は npx playwright install chromium）
```

### 📖 API ドキュメント

🅰️ **Angular 版:** 公式の Angular 移植版 [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram)（npm では `angular-advanced-odontogram`）が利用できます — JSON と FHIR R4 のエクスポートは 2 つのライブラリ間で往復します。

```bash
npm run docs           # TypeDoc のドキュメントを docs/ に生成
```

### 📡 公開 API

**コンポーネントの props:**

| Prop | 型 | 既定値 | 説明 |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI の言語（hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr/ja/ko） |
| `onLanguageChange` | `(lang) => void` | — | 言語が変わったときのコールバック |
| `numberingSystem` | `string` | `'FDI'` | 歯式表記（FDI／ユニバーサル／パルマー） |
| `onNumberingChange` | `(system) => void` | — | 歯式表記が変わったときのコールバック |
| `darkMode` | `boolean` | `undefined` | ダークモードの状態。単独モードでは省略します。 |
| `onDarkModeChange` | `(dark) => void` | — | ダークモードが切り替わったときのコールバック。制御モードでは必須です。 |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | CSS カスタムプロパティ（`--odon-*`）による色の上書き。 |
| `plugins` | `OdontogramPlugin[]` | `undefined` | 視覚的オーバーレイと歯ごとのカスタム状態のためのカスタム SVG プラグイン。 |
| `toothTemplates` | `ToothTemplateOverrides` | `undefined` | 工場出荷の描画の代わりにホストが供給する歯の描画（SVG テキスト）。形態プロファイルごと。検査され、拒否されたテンプレートは工場出荷の描画を保ちます。 |
| `readOnly` | `boolean` | `undefined` | すべての操作（クリック、タッチ、キーボード）を無効化。印刷・レポート表示に有用です。 |
| `enableNotes` | `boolean` | `undefined` | 歯ごとのメモを有効化。歯をダブルクリックしてメモを追加・編集します。 |

**外部制御のためにエクスポートされた関数:**

| 関数 | 説明 |
|---|---|
| `initOdontogram()` | エンジンを初期化し、すべての歯を描画します |
| `destroyOdontogram()` | エンジンを片付け、イベントリスナを取り除きます |
| `setNumberingSystem(system)` | FDI、ユニバーサル、パルマーを切り替えます |
| `clearSelection()` | すべての歯の選択を解除します |
| `getSelectedTeeth()` | 現在選択されている歯（FDI 番号）を選択順で返します |
| `getNumberingSystem()` | 現在有効な歯式表記 |
| `getScreenToothSpacing()` / `setScreenToothSpacing(v)` | 画面上の歯と歯の間隔の取得／設定 |
| `getScreenToothNumberSize()` / `setScreenToothNumberSize(v)` | 歯番号の大きさの取得／設定 |
| `getSelectionColor()` / `setSelectionColor(hex)` | 選択リングの色（`#rrggbb`）の取得／設定 |
| `getSelectionBorderStyle()` / `setSelectionBorderStyle(v)` | 選択リングの線種の取得／設定 |
| `getToothInfoVisible()` / `setToothInfoVisible(on)` | 歯の情報パネルを表示するかの取得／設定 |
| `setOcclusalVisible(on)` | 咬合面ビューのオン／オフ |
| `setWisdomVisible(on)` | 第三大臼歯の表示／非表示 |
| `setShowBase(on)` | 骨の層の表示／非表示 |
| `setHealthyPulpVisible(on)` | 健全歯髄の表示／非表示 |
| `registerPlugins(plugins)` | カスタム SVG プラグインを登録します |
| `setPluginState(toothNo, pluginId, value)` | ある歯のプラグインのカスタム状態を設定します |
| `getPluginState(toothNo, pluginId)` | ある歯のプラグインのカスタム状態を取得します |
| `setToothTemplateOverrides(overrides)` | 工場出荷の歯の描画を、ホストが供給する SVG に形態プロファイルごとに差し替えます。`null` は工場出荷のアートワークを復元します。マークアップは検査され、拒否されたテンプレートは工場出荷の描画を保ちます |
| `getToothTemplateRejections()` | これまでに拒否されたホストのテンプレートとその理由 — `{ profile, set, key, reason }[]` |
| `getToothStateSummary(toothNo)` | 有効なすべての状態のローカライズされた要約を取得します |
| `getOdontogramSummary()` | チャート全体の構造化・ローカライズされたテキスト要約（件数、セクション）を取得します |
| `onStateChange(callback)` | 状態変化を購読します。購読解除の関数を返します |
| `setReadOnly(value)` | 読み取り専用モードの有効／無効 |
| `getReadOnly()` | 現在の読み取り専用の状態を取得します |
| `setNotesEnabled(value)` | 歯ごとのメモの有効／無効 |
| `getNotesEnabled()` | 現在のメモ有効状態を取得します |
| `setPulpDetailLevel(level)` | 歯髄ピッカーの語彙を設定します — `"simple"`、`"aae"`、`"latin"` |
| `getPulpDetailLevel()` | 現在の歯髄の詳細度を取得します |
| `getChartMode()` | 現在有効なチャートを取得します — `"status"` または `"plan"` |
| `setChartMode(mode)` | 有効なチャートを `"status"` または `"plan"` に切り替えます。計画チャートは最初に入った時点で現状から深いコピーが作られます |
| `getStatusChart()` | 現状チャートのペイロード（`{version, globals, teeth}`）を、どちらのチャートが有効かに関係なく取得します |
| `getPlanChart()` | 計画チャートのペイロード（`{version, globals, teeth}`）を、どちらのチャートが有効かに関係なく取得します |
| `setPlanChart(payload)` | ペイロードから計画チャートの歯を置き換えます（現状はそのまま）。計画チャートを初期化済みとして印をつけます |
| `getPlanChanges()` | 構造化された現状→計画の差分（`{ toothNo, axis, from, to }[]`）を取得します — 現状チャートと計画チャートで異なる治療軸について、歯ごと・軸ごとに 1 エントリ。計画が存在しない場合は空です。`getOdontogramSummary()` の `plannedChanges` としても表示されます |
| `compareExams(before, after)` | 同一口腔の**エクスポート済み**の 2 つの検査を比較します — 軸レベルの変化（`getPlanChanges()` と同じ形）、部位ごとの歯周数値（プロービング深さとアタッチメントレベル、2 mm 以上動いたものを示します）、各検査の 2017 年分類。純粋関数で、ライブチャートには一切触れません |
| `setPerioSite(toothNo, site, patch)` | 6 部位のうち 1 つの歯周データを設定します（`patch` ＝ `{ pd?, gm?, bop?, sup? }`）。`pd` が null または `<1` のときその部位の記録を解除します。検証とクランプを行います（PD 1–15、GM −10…+20） |
| `getToothPerio(toothNo)` | ある歯の部位ごとの歯周記録（記録済みの部位のみ）を取得します |
| `getToothCal(toothNo)` | ある歯の部位ごとの導出 CAL（`pd ＋ 歯肉辺縁`）を取得します |
| `getPerioSummary()` | 全顎の歯周集計: 記録部位数、出血部位数、%BOP、最悪 CAL、最大 PD |
| `getPerioChart()` | 有効なチャートの歯ごとの歯周記録を取得します |
| `PerioChart` | React コンポーネント（名前付きエクスポート）— 全顎の歯周チャートのオーバーレイ（`{ open, onClose }`）。ホスト連携のため `OdontogramShell` とは独立にマウントできます |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | 歯周チャートのオーバーレイをプログラムから開く／閉じる／問い合わせます — ホストが基本の歯式図とは別に歯周チャートを呼び出せます（症例の状態は共有されます） |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | 歯周チャートの提示方法の取得／設定 — `"toggle"`（`歯式図 \| 歯周状態` のビュー切り替え、既定）または `"popup"`（オーバーレイ） |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | 歯周チャートのハイライトオーバーレイの取得／設定 — `"none"`（既定）／`"pd"`／`"cal"`／`"gr"`／`"plaque"`／`"bop"`／`"pd5"`／`"pd6"`／`"cairo"`。その指標で歯を塗り直します（既存データに対する表示専用） |
| `getToothRecessionType(toothNo)` | 導出された **Cairo の歯肉退縮型**を取得します — `"none"`／`"rt1"`／`"rt2"`／`"rt3"`（その歯の隣接面 CAL と頬側 CAL から計算されます） |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | 歯ごとの CEJ の視認性 — `"none"`／`"detectable"`／`"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | 歯ごとの歯根面の陥凹 — `"none"`／`"mild"`／`"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | 面ごとの Silness-Löe プラーク指数の等級 — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | 面ごとの Löe-Silness 歯肉指数の等級 — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | 歯ごとの頬側の付着歯肉幅（mm）— `0`-`15`、未記録の場合は `null` |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | 歯ごとの歯肉の厚さ表現型 — `"unknown"`／`"thin"`／`"medium"`／`"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | 歯ごとの Miller 歯肉退縮分類 — `"none"`／`"i"`／`"ii"`／`"iii"`／`"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | インプラント専用 — 面ごとの Mombelli 改変プラーク指数（mPI）の等級 — `0`-`3`。インプラント以外の歯では何もしません |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | インプラント専用 — 面ごとの Mombelli 改変歯肉溝出血指数（mBI）の等級 — `0`-`3`。インプラント以外の歯では何もしません |
| `furcationEntrances(toothNo)` | ある歯の根分岐部の入口 — `["mesial","distal","buccal"]`（上顎大臼歯）、`["buccal","lingual"]`（下顎大臼歯）、`["mesial","distal"]`（上顎第一小臼歯）、それ以外は `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | 入口ごとの根分岐部病変の設定／取得（Glickman `1`–`4`。`null` でクリア） |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | 面ごとの O'Leary プラークの有無の設定／取得（近心／遠心／頬側／舌側）。`getPerioSummary()` の全顎 PI% に反映されます |
| `getCaseMeta()` | 症例レベルのメタデータオブジェクト（`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`）を取得します — 歯ごとでも二重状態でもない、単一の共有ブロックです（ペイロード最上位の `globals` キーと同様）。歯周の病期・グレード分類と PDF レポートのヘッダーに反映されます |
| `setPatientName(v)` | 症例の患者氏名を設定します（前後の空白は除去。空文字列または `null` でクリア）— 識別目的のみで、歯周の導出には一切使われません |
| `setPatientDob(v)` | 症例の患者生年月日を設定します（`YYYY-MM-DD`。無効または空でクリア）— PDF レポートの識別目的のみ |
| `setExamDate(v)` | 症例の検査日を設定します（`YYYY-MM-DD`。無効または空でクリア） |
| `setCaseAge(v)` | 症例の患者年齢（年）を設定します — `0`-`120`、`null` でクリア |
| `setSmokingStatus(v)` | 症例の喫煙状況を設定します — `"unknown"`／`"never"`／`"former"`／`"current"` |
| `setCigarettesPerDay(v)` | 1 日の喫煙本数を設定します（喫煙状況が `"current"` のときのみ意味を持ちます）— `0`-`99`、`null` でクリア |
| `setDiabetesStatus(v)` | 症例の糖尿病の状況を設定します — `"unknown"`／`"none"`／`"present"` |
| `setHba1c(v)` | HbA1c ％を設定します（糖尿病の状況が `"present"` のときのみ意味を持ちます）— `3.0`-`20.0`（小数 1 桁）、`null` でクリア |
| `setToothLossPerio(v)` | 歯周炎による喪失歯数を設定します — `0`-`32`、`null` でクリア |
| `setMaxRblPercent(v)` | 最大エックス線的骨吸収％を設定します — `0`-`100`、`null` でクリア |
| `resetCaseMeta()` | 症例レベルのメタデータオブジェクトを空の既定値に戻します |
| `getPerioClassification()` | 2017 年 World Workshop の歯周病分類（`{diagnosis, stage, grade, extent, derived, overridden}`）を取得します — 診断・病期・グレード・広がりは記録された歯周データと症例メタデータから導出され、臨床医の上書きが設定されている軸はそれで置き換えられます（`derived` は常に手を加えていない計算値を、`overridden` はどの軸が上書きされたかを示します） |
| `setDiagnosisOverride(v)` | 導出された歯周診断を上書きします — `"health"`／`"gingivitis"`／`"periodontitis"`、`null` でクリア（導出値に戻します） |
| `setStageOverride(v)` | 導出された歯周の病期を上書きします — `"I"`／`"II"`／`"III"`／`"IV"`、`null` でクリア（導出値に戻します） |
| `setGradeOverride(v)` | 導出された歯周のグレードを上書きします — `"A"`／`"B"`／`"C"`、`null` でクリア（導出値に戻します） |
| `setExtentOverride(v)` | 導出された歯周の広がりを上書きします — `"localized"`／`"generalized"`／`"molar-incisor"`、`null` でクリア（導出値に戻します） |
| `exportFhir(options?)` | チャートを HL7 FHIR R4 の collection Bundle としてエクスポートします（JSON ダウンロード）。任意の `{ subject }` 参照を渡せます。渡さない場合はプレースホルダの Patient が埋め込まれます |
| `exportImage(format)` | チャートを画像としてダウンロードします — `"png"` または `"jpg"` |
| `exportSvg()` | チャートを拡大縮小可能な SVG（ベクター）としてダウンロードします |
| `hasAnyPerioData()` | 口腔内のどこかに歯周の軸が記録されている場合に限り `true` — 歯周エクスポートの自動スキップを駆動し、空のチャートでは歯周のエクスポートメニュー項目を無効化します |
| `exportPerioSvg()` | 歯周チャート全体（歯の図＋数値行＋2017 年分類）を 1 つの独立したベクター SVG としてダウンロードします。`buildPerioSvg()` により状態からヘッドレスに構築されます |
| `exportPerioImage(format)` | 歯周チャートをラスタライズした画像としてダウンロードします — `"png"` または `"jpg"` |
| `exportPdf(opts)` | jsPDF ネイティブの PDF レポートをダウンロードします（`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`、各セクションは任意）— ベクターのテキストとラスターの歯・歯周チャート画像です。個別メモのセクションはメモを持つ歯がない場合に自動でスキップされ、歯周の 2 セクションは `hasAnyPerioData()` が false のとき `opts` にかかわらず自動でスキップされます |
| `importFhirBundle(input)` | 本モジュールが生成した FHIR R4 Bundle（オブジェクトまたは JSON 文字列）をインポートします |
| `setImportFormat(format)` | 次回のファイルインポートのパーサを設定します — `"status"` または `"fhir"` |
| `startIntroTour()` | 18 ステップの対話的な導入ツアーを開始します |

### 💾 状態の永続化（localStorage）

歯式図の症例状態に対するオプトインの `localStorage` 永続化です（`src/persistence.ts`。パッケージのエントリポイントから再エクスポートされています）。既定では無効なので、ホストアプリが明示的に有効化しない限り既存の連携に影響はありません。また、歯式図がマウントされた**後**に呼ぶべきです（復元は `importStatus()` を介してライブ DOM を塗り直します）:

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";
enablePersistence({
  key: "my-app-odontogram",   // 既定: "react-advanced-odontogram"
  includePlan: true,          // 計画チャートも永続化する。既定: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| 関数 | 説明 |
|---|---|
| `enablePersistence(options?)` | 以前に保存された症例があれば `importStatus()` で復元し、その後は状態変化ごとに現状チャートを `localStorage` へ保存します。冪等です — 再度呼ぶと以前の購読・オプションを置き換えます。**歯式図がマウントされた後に呼ぶ必要があります。** |
| `disablePersistence()` | 永続化を停止します。保存済みのエントリはそのまま残ります。 |
| `clearPersistedState()` | 有効な（または既定の）キーの保存済みエントリを削除します。 |
| `isPersistenceEnabled()` | 状態変化の購読が有効な間 `true` です。 |

**`PersistenceOptions`:**

| フィールド | 型 | 既定値 | 説明 |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | `localStorage` のキー。 |
| `includePlan` | `boolean` | `false` | 計画チャート（ペイロードの `plan` フィールド）も永続化します。 |
| `onError` | `(err: Error) => void` | — | ストレージや解析のエラー時に `console.warn` の代わりに呼ばれます。 |

補足: `enablePersistence()` を呼ばない限り、`localStorage` からの読み取りも書き込みも一切行われません。4 MB のサイズガードが、大きすぎる保存を例外ではなくスキップで処理します（`onError`／`console.warn` で報告されます）。ストレージや JSON の失敗 — 容量超過、制限されたままの iframe、壊れた、あるいは認識できない保存データなど — はすべて捕捉して報告されます。本モジュールは例外を投げません。

補足: 永続化を有効にすると保存済みの症例が `importStatus()` で復元され、現在の症例が置き換えられます — 保存されたペイロードに計画チャートがなければ、作業中の計画チャートも含めてです。永続化はセッションの途中ではなく、起動時（マウント直後）に有効化してください。

補足: 永続化されるペイロードには、患者を識別しうる症例データ（患者氏名、検査日）が平文の `localStorage` に含まれ得ます。そのようなデータを記録する場合は、端末レベルの保護を確保するか、適切なタイミングで `clearPersistedState()` を使って消去してください。

### 💾 状態のエクスポート／インポート形式
エクスポートは JSON ファイルを作ります（バージョン `2.22`。インポートは旧来の `1.4` および `2.0`〜`2.21` も受け付け、自動で移行します）。内容:

**全体のフィールド:**
- `wisdomVisible` - 第三大臼歯の表示
- `showBase` - 骨の層の表示
- `occlusalVisible` - 咬合面ビューが有効
- `showHealthyPulp` - 健全歯髄の表示
- `edentulous` - 無歯顎モードが有効

**歯ごとのフィールド（32 歯）:**
- `toothSelection` - 基本の歯種
- `toothSubstrate` - 歯質（natural／radix／broken／crownprep）。修復物とは直交します
- `restorationType` - 修復物の種類（none／crown／inlay／onlay／veneer／bridge）
- `restorationMaterial` - 修復物の材料（emax／gold／gradia／zircon／metal／metal-ceramic／telescope／temporary）。`restorationType` と対で使います
- `prosthesis` - 可撤性・アタッチメント軸（none／healing-abutment／locator／locator-denture／bar／bar-denture／removable-partial／removable-full）。crown／bridge の固定 `restorationType` とは相互排他です
- `crownLeakage` - 歯冠辺縁の漏洩フラグ。`restorationType` が crown または bridge のときのみ意味を持ちます
- `endo` - 根管の状態。`pulpDx` と相互排他です（統合された「歯髄／根管の状態」ピッカーで一緒に表示されます — 歯を治療済みにすると `pulpDx` は `normal` に正規化されます）
- `mods` - 修飾の配列（inflammation、parodontal）。`inflammation` は現存歯の UI からは廃止されましたが（そこでは `apicalDx` がグリフを駆動します）、欠損歯と抜歯創の歯には依然として適用されます
- `caries` - 有う蝕の面
- `cariesActiveDepth` - 新しい面を適用するときに、う蝕深さピッカーが用意している ICDAS の深さ値（面ごとの保存値ではありません。保存される面ごとのフィールドは `cariesSeverity` を参照）
- `rootCaries` - 根面う蝕の重症度（none／active／arrested／active-cavitated）
- `cariesSeverity` - 面ごとの統一重症度（0-6）: 一次（未充填）面では ICDAS の深さ、二次（充填済み）面では CARS スコア
- `radiographicDepth` - 面ごとのエックス線的う蝕深さ（none／E1／E2／D1／D2／D3）。視覚的な ICDAS／CARS スケールとは独立です
- `fillingMaterial` - 充填材料
- `fillingSurfaces` - 充填された面
- `fillingSurfaceMaterials` - 面ごとの充填材料（混在する充填、例: 頬側アマルガム＋遠心コンポジット）
- `fillingDefect` - 面ごとの充填物の欠陥（none／marginal／fracture／wear）。充填された面に限定され、二次う蝕とは独立です
- `pulpDx` - AAE の歯髄診断（normal／reversible-pulpitis／irreversible-pulpitis／necrosis）。reversible-pulpitis は縮小したグリフを描画します
- `pulpLatin` - 実用ラテン語の歯髄サブタイプ（`pulpDetailLevel` が `latin` のときのみ歯髄ピッカーに表示されます）
- `apicalDx` - 根尖グリフを駆動する根尖診断
- `periapicalType` - 根尖病変のサブタイプ（none／granuloma／cyst）。症状のある／ない根尖性歯周炎の下でのみ表示されます。旧来の `abscess` もインポート時には受け付けます
- `resorptionType` - 歯根吸収の種類（none／internal／external-cervical）
- `periImplant` - インプラント専用のインプラント周囲の状態（none／mucositis／peri-implantitis-mild／-moderate／-severe）。2018 年 World Workshop の病期分類
- `dxOverrides` - 歯ごとの診断コーディングの上書き（バージョン 2.21）: ICD-10 診断キー → `add` | `suppress` のオブジェクトで、該当するチャート所見がなくてもコード化された診断を有効にしたり、あっても無効にしたりします。FHIR の `Condition` として出力される実効集合を形作ります
- `endoResection` - 歯根端切除のフラグ
- `fissureSealing` - 小窩裂溝填塞のフラグ
- `calculus` - 歯石のフラグ
- `contactMesial` - 近心コンタクトの喪失
- `contactDistal` - 遠心コンタクトの喪失
- `wearEdge` - 切縁・咬合面の摩耗の種類（none／attrition／erosion）
- `wearCervical` - 歯頸部の摩耗の種類（none／abrasion／abfraction／erosion）
- `discoloration` - 歯ごとの変色の原因（none／tetracycline／fluorosis／nonvital／extrinsic／other）。修復物のない天然の tooth-base／乳歯で、天然歯冠の塗りを着色します
- `orthoAppliance` - 矯正装置（none／bracket／band）
- `orthoDrift` - 矯正的な移動（none／mesial／distal）
- `orthoVertical` - 矯正的な垂直移動（none／extrusion／intrusion）
- `orthoRotation` - 矯正的な捻転のフラグ
- `brokenMesial`、`brokenIncisal`、`brokenDistal` - 破折の部位
- `extractionWound` - 抜歯後の創
- `extractionPlan` - 抜歯予定
- `parapulpalPin` - パラパルパルピンのフラグ
- `bridgePillar` - ブリッジの支台歯
- `mobility` - 動揺度（none／m1／m2／m3）
- `crownNeeded` - 歯冠が必要の指標
- `crownReplace` - 歯冠の再製が必要の指標
- `missingClosed` - 抜歯後に閉鎖した欠損
- `customStates` - プラグインのカスタム状態（プラグイン ID をキーとするオブジェクト）
- `note` - 歯ごとのテキストメモ（文字列、任意 — 空でないときのみ存在します）

**最上位の `plan` フィールド（バージョン 2.11 以降）:**
- `plan` - 任意のオブジェクトで、`teeth`（上記の歯ごとのフィールド）と同じ形を持ち、**計画**（治療後に意図する状態）チャートを保持します。計画チャートが初期化されている（`現状 | 計画` トグルが少なくとも一度計画側に切り替えられた）**かつ**その内容が現状チャートと異なる場合にのみ存在します — 現状のみのエクスポートはこれを完全に省略し、バージョン番号を除けば 2.11 より前のエクスポートとバイト単位で同一のままです。インポート時、`plan` がなければ計画チャートはクリア・未初期化になります（インポート前の古い計画が復活することはありません）。`plan` があれば現状と並んで計画チャートも復元されます。計画チャートはインポート／エクスポートとは独立に `getPlanChart()`／`setPlanChart()` で読み書きできます（上記の公開 API を参照）。また `getStatusChart()` は、どちらのチャートモードが有効かに関係なく常に現状優先のペイロードを返します。

**最上位の `case` フィールド（バージョン 2.17 以降。2.18、2.19、2.20、2.22 で拡張）:**
- `case` - 症例レベル（歯ごとではない）のメタデータを保持する任意のオブジェクトで、現状チャートと計画チャートの両方で共有されます（最上位の `globals` キーと同様）。空のときは省略されます: すべてのフィールドが既定値のときは完全に存在せず、症例データのないエクスポートはバージョン番号を除いてバイト単位で同一のままです。フィールド（それぞれ既定値のときは省略されます）: `age`、`smokingStatus`（＋ `cigarettesPerDay`）、`diabetesStatus`（＋ `hba1c`）、`toothLossPerio`、`maxRblPercent`、2017 年分類の 4 つの軸ごとの臨床医による上書き `diagnosisOverride`／`stageOverride`／`gradeOverride`／`extentOverride`、（バージョン 2.19）`patientName`／`examDate`、（バージョン 2.20）`patientDob`、（バージョン 2.22）`caseConditions` — 症例／領域の診断（不正咬合と顎関節 K07、口腔の嚢胞 K09、唾液腺疾患 K11、口内炎と口腔粘膜 K12／K13、歯列弓レベルの発育性 K00）で、それぞれ左右（指定なし／左／右／両側）に対応づけられます。歯周の病期・グレード分類と PDF レポートのヘッダーに反映され、`getCaseMeta()` と `setCase*` 系のセッターで読み書きします（上記の公開 API を参照）。患者氏名、生年月日、検査日はチャートの識別メタデータにすぎません — FHIR エクスポートには**含まれません**。

### 🖨️ エクスポート
`exportFhir()` は HL7 バリデータでクリーンです: Bundle の各エントリは決定的な `id` と絶対 `fullUrl` を持ち（`urn:uuid` のプレースホルダは使いません）、Bundle はエンジン自身の CodeSystem を埋め込むため、検証時にローカルコードが解決します（`fhir/CodeSystem-odontogram.json` としても公開されています。`includeCodeSystem: false` を渡すと省略できます）。

歯周データは JSON ペイロードだけでなく、FHIR のインポートでも往復するようになりました: `importFhirBundle()` は LOINC `74029-0` の歯周パネルを各歯の歯周記録へ読み戻します — プロービング深さ、歯肉辺縁（CAL から再構成するため偽ポケットの値も保たれます）、BOP、根分岐部、O'Leary のプラーク、PI／GI とインプラントの mPI／mBI 指数、付着歯肉幅 — さらに症例レベルの喫煙状況と HbA1c のエビデンス Observation も含みます。排膿は唯一の例外で、FHIR エクスポートに含まれないため JSON 専用のままです。

歯式図自身の 状態 JSON／FHIR／PNG／JPG／SVG のエクスポートに加えて、**歯周チャート**には独自のエクスポート経路があります:
- **歯周 SVG／PNG／JPG:** `exportPerioSvg()`／`exportPerioImage("png"|"jpg")` は、マウントされた `PerioChart` の DOM とは独立に、歯周チャート全体（歯の図＋数値行＋2017 年分類）を 1 つの独立したベクター SVG（`buildPerioSvg()`）として描画します。3 つのエクスポートメニュー項目は `hasAnyPerioData()` が false のとき無効になります（空のチャートにはエクスポートすべき歯周データがありません）。
- **PDF レポート:** エクスポートメニューの「PDF レポート…」項目は `ExportOptionsModal` を開きます — 症例メタデータに直結した患者氏名・生年月日・検査日の入力欄（検査日は既定で当日）と、セクションのチェックボックス（患者データ、歯式チャート、歯式図の記述、個別メモ — メモを持つ歯がない場合は無効 — 歯周状態、歯周の記述）を備えた設定ダイアログで、その後に `exportPdf(opts)` を呼びます。識別欄が空のときはプレースホルダ（「John Doe」／「1980-01-01」）にフォールバックするため、エクスポートは常に成功します。PDF は jsPDF ネイティブに組み立てられます — ベクターのテキストは `.text()`、ラスターの歯・歯周チャート画像は `.addImage()` — **svg2pdf.js への依存はありません**。個別メモのセクションはメモを持つ歯がないときに自動でスキップされ、歯周の 2 セクションは `hasAnyPerioData()` が false のとき、ダイアログのチェックボックスにかかわらず自動でスキップされます。
- **mPI／mBI のインプラントによるゲート:** インプラント周囲の Mombelli 指数（mPI／mBI）は、少なくとも 1 本のインプラントを含む歯列弓にのみ行として描画されます — ライブの歯周チャートでも SVG／PDF のエクスポートでも同様です。
- 患者氏名、生年月日、検査日はチャートの識別メタデータにすぎません（ペイロード `2.20`、加算的）— FHIR エクスポートには**含まれません**。

### 📁 フォルダ構成
- `src/App.tsx` - シェルの UI、トップバーのコントロール、言語／歯式表記／ダークモード／テーマ／プラグインの切り替え
- `src/odontogram.ts` - SVG レイヤリングエンジン、歯の状態管理、タッチ操作、プラグインのオーバーレイ、UI の配線
- `src/plugin.ts` - `OdontogramPlugin` 型、`PluginLayer`、`getQuadrant()`、`LAYER_Z` の z-index 優先度
- `src/theme.ts` - `OdontogramThemeConfig` 型と `applyThemeConfig()` ユーティリティ
- `src/status_extras.ts` - 34 種の定義済み修復テンプレート（ブリッジ、義歯、バー構造）
- `src/i18n/` - 翻訳（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR/JA/KO）と i18n フック
- `src/utils/numbering.ts` - FDI、ユニバーサル、パルマーの歯式変換
- `src/registry/` - 宣言的な臨床軸レジストリ: FHIR のフィールド対応、SVG のクリアセット／真偽フラグの有効化、修復物の 種類×材料 行列、UI の選択肢一覧（エクスポート／インポート、FHIR、ピッカー UI を生成する唯一の真実の源）
- `src/fhir/` - HL7 FHIR R4 のエクスポート／インポート: `toFhir.ts`／`fromFhir.ts`、コード体系、フィールド対応、プリミティブ
- `src/bridgeOverlay.ts` - 複数歯にわたるブリッジスパンのコネクタオーバーレイ（歯列弓を考慮したサドル形状）
- `src/SettingsModal.tsx` - タブ付きの設定ダイアログ（一般／パネル／歯の詳細／う蝕／歯髄／メモ／歯周）
- `src/perioExport.ts` - `buildPerioSvg()`: 歯周チャート全体を 1 つの独立したベクター SVG として
- `src/perioPdf.ts` - `exportPdf()` の純粋な jsPDF レポート組み立て（`assemblePdf`）
- `src/ExportOptionsModal.tsx` - 「PDF レポート…」のエクスポート設定ダイアログ
- `src/__tests__/` ＋ `src/registry/__tests__/` - 広範な Vitest 自動テスト群
- `src/assets/teeth-svgs/` - SVG の歯テンプレート（6 ファイル: 切歯、犬歯、小臼歯、大臼歯＋咬合面ビュー）
- `src/assets/icon-svgs/` - ツールバーのアイコン SVG（5 ファイル）

### ⚙️ 技術スタック
- React 18 ＋ Vite ＋ TypeScript
- UI のスタイリングに Tailwind CSS
- DOM 操作による SVG レイヤリング（性能のため React の状態は使いません）
- 軽量な自作 i18n システム
- 自動テストに Vitest ＋ Testing Library
- API ドキュメントに TypeDoc
- Vite のパスエイリアス: `@` を `./src` に対応

### 📝 補足
- SVG テンプレートは `src/assets/teeth-svgs` と `src/assets/icon-svgs` から読み込まれるため、静的ホスティングでは public フォルダを配信する必要があります。
- 歯式図のエンジンは、性能と単純さのために独自の内部状態（React の状態ではありません）を使います。
- 乳歯で利用できる材料は限られています（アマルガム充填なし、ポストを用いる根管処置なし）。
- インプラントの歯は、天然歯とは異なる歯冠・アバットメントの選択肢を持ちます。

### 🔒 セキュリティに関する注意

- **プラグインは信頼されたコードとして実行されます。** プラグインの `renderSvg()` の戻り値はライブチャートの SVG へ注入されます。その出力は挿入前に [DOMPurify](https://github.com/cure53/DOMPurify)（SVG プロファイルと `svgFilters`）で無害化されます — `<script>`、`<iframe>`、`<object>`、`<embed>`、`<foreignObject>` は完全に禁止され、全体が悪意ある出力は部分的に描画されるのではなく破棄されます。これは侵害された、あるいはバグのあるプラグインの影響範囲を狭めますが、それでもプラグインは信頼できる提供元からのみ読み込むべきです — 無害化は安全網であり、審査の代わりにはなりません。
- **ホストが供給する歯のテンプレートは、清掃ではなく拒否されます。** `setToothTemplateOverrides()` に渡された描画は、描画できるようになる前に検査されます: 単一の `<svg>` ルート、DOMPurify（SVG プロファイルで `<script>`、`<iframe>`、`<object>`、`<embed>`、`<foreignObject>`、`<image>`、`<a>` とアニメーション要素を禁止）— そして DOMPurify が*何かを*取り除かなければならない場合、テンプレート全体が静かに無害化されるのではなく**拒否されます**。ホストが供給したものと異なるマークアップを描画することが決してないようにするためです。`href` は `#id` フラグメントのみ、`<style>` 要素や `style` 属性に `url(` や `@import` を含めないこと — テンプレートの内容からネットワークに到達できないようにするためです。そして置き換える工場出荷の描画のすべての層 id を持っていなければなりません。エンジンは層を id で切り替えるからです。拒否されたテンプレートは `getToothTemplateRejections()` で報告され、工場出荷の描画が保たれます。
- **Content-Security-Policy。** デモの**本番ビルド**は、このポリシーを `<meta http-equiv="Content-Security-Policy">` タグで注入します（開発サーバーは影響を受けません）:

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  `OdontogramShell` を埋め込むホストアプリケーションは、自身の配信環境に適した CSP を設定すべきです — ライブラリとして使われるとき、本コンポーネントは CSP を注入しません。

### 📖 引用方法

本モジュールを研究や業務で利用する場合は、引用をお願いします。

**このバージョン（v2.9.0）:**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.9.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**すべてのバージョン（コンセプト DOI）:** https://doi.org/10.5281/zenodo.21156787

> 上記のすべてのバージョンを指すコンセプト DOI は、常に最新のアーカイブ済み
> リリースに解決します。バージョン固有の DOI は、Zenodo にアーカイブされた
> 時点でリリースごとに発行されます。v2.9.0 がアーカイブされるまでは、
> コンセプト DOI で引用してください。

機械可読な引用メタデータは [`CITATION.cff`](CITATION.cff) にあります。

## 🙌 クレジット

React Advanced Odontogram は、エンジン全体の作者でありリード開発者である Zoltan Dul（[@ZoliQua](https://github.com/ZoliQua)）が制作・保守しています。以下に挙げる貢献者の方々の貴重な助力を得ています。貢献してくださったすべての方に感謝します。

**貢献者**

- [@odontodev](https://github.com/odontodev): 状態のハイドレーションとライフサイクル API、制御プロパティとしての充填設定、冪等なセッター、折りたたみ可能なカード。チャートの表示設定と `getNumberingSystem()` のホストへの公開、そしてセッション設定と歯のメモに欠けていた `onStateChange` 通知
- [@JulianoBazzi](https://github.com/JulianoBazzi): ブラジルポルトガル語訳
- [@yassine-bhn](https://github.com/yassine-bhn): フランス語訳と、実測形態の候補データ
- [@saegerdirk-star](https://github.com/saegerdirk-star): 実測の歯形態と歯生成ツール、およびコンポーザブルなインターフェースの提案。そのフォークから採り入れた 3 つの修正（PDF の患者識別、歯周チャートの歯の向き、選択の速度）
- [@sofia-cluadette](https://github.com/sofia-cluadette): `getSelectedTeeth()` の選択 API
- [@Ditherys](https://github.com/Ditherys): 拡張された実測の歯セット — 形態生成ツールの永久歯と乳歯の完全な仕様、そのオーバーレイ登録メタデータと検証スイート。そのフォークから移植しました

**使用技術** [jsPDF](https://github.com/parallax/jsPDF)、[DOMPurify](https://github.com/cure53/DOMPurify)、[React](https://react.dev)、[Vite](https://vite.dev)、[TypeScript](https://www.typescriptlang.org)、[Tailwind CSS](https://tailwindcss.com)。

**ライセンス。** 本プロジェクトは MIT ライセンスで、商用利用も含みます — そしてそれは歯の描画にも及びます（オリジナルの制作物です）。埋め込まれた PDF フォントと実行時の依存関係は、それぞれ独自の（同様に寛容な）条項に従います: [THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md) を参照してください。

貢献を歓迎します。GitHub でプルリクエストを送っていただければ、ここにクレジットを記載します。本プロジェクトがお役に立ったなら、[GitHub でスターを付けて](https://github.com/ZoliQua/React-Advanced-Odontogram)いただけると嬉しいです。
