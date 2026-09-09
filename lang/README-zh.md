<p align="center">
  <img src="https://raw.githubusercontent.com/ZoliQua/React-Odontogram-Modul/main/src/assets/react-module-logo.png" alt="React Advanced Odontogram logo" width="160" />
</p>

# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-2.5.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md)

---

## 📑 目录

- [📋 概述](#-概述)
- [📦 作为 npm 包使用](#-作为-npm-包使用)
- [✨ 主要功能](#-主要功能)
- [📦 模块组成](#-模块组成)
- [🛠️ 界面控件](#-界面控件)
- [🦷 牙齿类型与状态](#-牙齿类型与状态)
- [⚙️ 设置](#-设置)
- [🖼️ SVG 模板系统](#-svg-模板系统)
- [🔢 编号系统](#-编号系统)
- [🚀 使用方法](#-使用方法)
- [🔗 集成](#-集成)
- [🧪 测试](#-测试)
- [📖 API 文档](#-api-文档)
- [📡 公共 API](#-公共-api)
- [💾 状态持久化（localStorage）](#-状态持久化localstorage)
- [💾 状态导出/导入格式](#-状态导出导入格式)
- [🖨️ 导出](#-导出)
- [📁 目录结构](#-目录结构)
- [⚙️ 技术栈](#-技术栈)
- [📝 说明](#-说明)
- [🔒 安全说明](#-安全说明)
- [📖 如何引用](#-如何引用)

## 🇨🇳 简体中文

*(本文档为 README 的简体中文版本 — 译自英文原版，对应 v2.4.0)*

### 📋 概述
本项目是一款交互式、基于浏览器的牙位图（口腔检查图）编辑器，界面简洁，支持快速的牙科病历记录。它通过分层渲染 SVG 牙齿模板来表现修复体、龋齿、牙髓治疗状态、松动度及其他临床细节，同时提供多选、选择过滤器和预设状态模板。

---
![牙位图 – 预览（简体中文）](screenshot_zh_odontogram.png)

🔗 **测试地址：** https://react-odontogram-modul.vercel.app/

---

### 📦 作为 npm 包使用

该牙位图作为一个独立自包含的 React 组件库发布在 npm 上：
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram)。

#### 环境要求
- **React 18 或 19**（声明为 peer dependency —— 由你的应用提供）。
- 一个能理解 `exports` 字段和 ESM 的**打包工具**：Vite、webpack 5、Next.js、Rollup、esbuild、Parcel。该包**仅支持 ESM**。
- 工具链需要 Node **≥ 18**。

#### 安装

```bash
npm install react-advanced-odontogram react react-dom
```

#### 基本用法

在应用中的任意位置渲染 `OdontogramShell`，并**仅导入一次**样式表：

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="zh"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### 组件 Props

`OdontogramShell` 是一个受控组件。以下是最常用的 props：

| Prop | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `language` | `Language` | `"hu"` | 界面语言（`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`）。 |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | 牙位编号系统。 |
| `darkMode` | `boolean` | `false` | 深色主题切换。 |
| `readOnly` | `boolean` | `false` | 禁用所有编辑（仅查看）。 |
| `themeConfig` | `OdontogramThemeConfig` | — | 覆盖主题 CSS 变量（`--odon-*`）。 |
| `plugins` | `OdontogramPlugin[]` | — | 注册自定义状态插件 / 额外图层。 |
| `enableNotes` | `boolean` | `false` | 启用逐牙备注。 |
| `enableIcdas` | `boolean` | `false` | 启用 ICDAS II 龋齿评分。 |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | 充填复杂度：`"simple"`（每颗牙一种材料）或 `"complex"`（按牙面选择材料）。 |
| `fillingDefectEnabled` | `boolean` | `true` | 在充填卡片上启用充填缺陷发现项。 |
| `fillingMaterialAvailability` | `Record<string, boolean>` | 全部可用 | 可用充填材料，以 `amalgam`/`composite`/`gic`/`temporary` 为键的布尔映射（未知键被忽略）。 |
| `fissureSealingEnabled` | `boolean` | `true` | 在充填卡片上启用窝沟封闭。 |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | 当用户在设置 → 充填中更改相应设置时触发。 |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | 当用户在界面中更改该设置时触发。 |

还接受更细粒度的详情级别 props（`pulpDetailLevel`、`secondaryCariesMode`、`rootCariesMode`、`radiographicDepthMode`、`wearDetailLevel`、`discolorationDetailLevel`、`surfaceNotation`、`showStatusCard`、`showOrthoCard`）——完整的带类型列表请参见随附的 `.d.ts` 类型定义。

上述四个充填 props 仅用于**恢复**：省略时绝不会写入引擎（挂载前的 `setFillingComplexity()` 命令式调用得以保留，独立模式不变）；提供时会同时写入引擎和设置对话框状态，因此对话框永远不会显示过期值。`fillingMaterialAvailability` 通过规范化序列化键按差异应用，因此以内联字面量传入相同内容的重渲染永远不会重写引擎。对应的 `on*Change` 回调在设置 → 充填中触发：这是宿主持久化偏好的回写路径。

#### 公共 API（具名导出）

`OdontogramShell` 既是默认导出，也是具名导出。命令式状态 API、独立的 `PerioChart` 组件、引导式导览以及所有公共类型，均以具名导出的形式从同一入口点提供：

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

完整的 API 表面（约 44 个函数，以及 `OdontogramSummary`、`OdontogramThemeConfig`、`OdontogramPlugin`、`FhirExportOptions`、`PerioViewMode` 等类型）在随附的声明文件中均有完整的类型定义。

#### 可组合的界面区域（高级）

`OdontogramShell` 是受支持的一体化组件，无需额外设置。如果你需要将牙位图的各个区域放置在自己布局中的不同位置，该 shell 的四个 UI 界面区域也已导出，可以在单个 `OdontogramProvider` 下进行组合，它们共享同一个由本包管理的会话：

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

`OdontogramProvider` 接受与 `OdontogramShell` 相同的 props。还提供了 `useOdontogramUi()` hook（以及 `OdontogramUiContextValue` 类型），用于构建你自己的界面区域。当前限制：每个页面只使用一个 provider。界面区域可以按需挂载和卸载——重新挂载时会自动重新绑定。`OdontogramShell` 本身没有变化——它正是这种组合在默认排布下的形态。

为了实现更精细的组合，各个控制卡片也已导出——`OrthodonticsCard`、`StatusesCard`、`CariesCard`、`FillingsCard`、`RootPeriodontiumCard` 和 `ToothDetailsCard`——每一个都是自包含的声明式组件，通过引擎 API 读取和写入共享会话（还导出了 `useEngineState()` hook 供你构建自己的卡片）。只需在单个 `OdontogramProvider` 下按任意排布挂载某个布局所需的卡片即可。

#### 与 Next.js（App Router）搭配使用

该组件仅支持客户端渲染，因此需要在 Client Component 中渲染它：

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="zh" numberingSystem="FDI" />;
}
```

或者使用仅限客户端的动态导入来加载它：`dynamic(() => import("./OdontogramClient"), { ssr: false })`。

#### 重要说明与当前限制
- **仅支持 ESM** —— 该包发布为单个 ES 模块（`dist/odontogram.js`），并附带一个类型声明入口（`dist/index.d.ts`）。它面向打包工具的模块解析方式；不提供 CommonJS 构建版本。
- **样式表是独立的** —— 你**必须**导入一次 `react-advanced-odontogram/style.css`；它不会被自动注入。样式为全局 CSS，作用域限定在 `.odontogram-root` 下，并由 `--odon-*` CSS 变量驱动。
- **SSR / 仅限客户端** —— 该组件在挂载时会读取 DOM（`document`），因此必须在浏览器中运行。在支持 SSR 的框架中，请在 Client Component（`"use client"`）中渲染它，或通过仅限客户端的动态导入方式加载。
- **资源是自包含的** —— 牙齿和图标的 SVG 在构建时被内联到 JavaScript 包中；**无需配置任何运行时资源请求**，也无需向你的 public 文件夹额外复制任何文件。
- **每个页面仅限一个实例** —— 引擎状态目前是模块级单例，因此在同一页面渲染两个 `<OdontogramShell>` 实例会导致它们共享同一份图表状态。多实例支持计划在未来版本中提供。

---

### ✨ 主要功能
- 🖱️ 快速选择与多选（CMD/CTRL + 点击）
- 🦷 牙齿类型：恒牙、乳牙、种植体、龈下（未萌出）、缺失
- 🦷 牙体基质（与任何修复体正交）：天然、残根（radix）、折断、已预备冠
- 👑 按类型 × 材料划分的修复体：牙冠 / 嵌体 / 高嵌体 / 贴面 / 桥，材料涵盖 e.max、金合金、Gradia、氧化锆、金属、金属烤瓷、套筒冠或临时冠（高嵌体仅限咬合面视图）——通过一个合并的低点击次数“Fix: Crown – …”选择器统一选取；旧版 `metal` 牙冠会自动迁移为 `metal-ceramic`（金属烤瓷）；种植体使用相同的类型 × 材料模型，并叠加一个种植体连接体层。选择器按牙齿种类进行限定：种植体仅提供牙冠/桥（以及下文的五种附着方式选项）；缺失/间隙牙位仅提供桥体（pontic）（以及可摘局部/全口义齿）；`radix`（残根）基质会完全隐藏修复体控件（残根上不能设置任何修复体）
- 🦿 专用 `prosthesis`（可摘/附着体）轴上的可摘/附着式修复（合并选择器中的“Kivehető:”条目）：种植体愈合基台、Locator 附着体、带覆盖义齿的 Locator、杆卡附着体、带覆盖义齿的杆卡附着体；牙支持式可摘局部或全口义齿
- 🌉 桥体牙位同时渲染牙冠帽与桥体连接部；多牙位桥跨越叠加层会在连续的桥体牙位（桥体单位 + 基牙）及其间隙上渲染一条连续的、感知牙弓形态的连接体（上颌与下颌使用镜像的桥体几何形状，保证连接体在两侧牙弓上均对齐），并包含在 PNG/JPG/SVG 导出中；通过“状态预设”应用桥修复时会立即重新计算该叠加层
- 🔍 6 个牙面的龋齿记录：近中、远中、颊侧、舌侧、咬合面、冠下
- 🪥 每个牙面的充填材料：银汞合金、复合树脂、玻璃离子（GIC）、临时材料
- 🏥 一个合并的“牙髓 / 根管状态”选择器（分组：活髓 vs. 已治疗/根管）：根管治疗状态（药物充填、根管充填、根管充填不完全、玻璃纤维桩、金属桩）与 AAE 牙髓诊断（`pulpDx`：正常 / 可复性 / 不可复性牙髓炎 / 坏死）互斥——已行根管治疗的牙齿（设置了 `endo`）不能同时携带活髓诊断；进行治疗时，`pulpDx` 会被规范化为 `normal`，且患髓图标会被隐藏。可复性牙髓炎渲染为一个简化的牙髓图标。一个可选的三级牙髓详情设置（`pulpDetailLevel`：simple / AAE / 实用拉丁文）通过 `pulpLatin` 展示 9 种实用拉丁文牙髓亚型（pulpa sana … gangraena pulpae）；根尖切除和髓旁钉仍作为独立的特殊指示项
- 🦴 根尖诊断（`apicalDx`：有症状/无症状根尖周炎，急性/慢性根尖脓肿，致密性骨炎）直接驱动根尖周图标；肉芽肿/囊肿病损亚型限定符仅在有症状/无症状根尖周炎下显示（多余的“脓肿”亚型已被移除——它已被根尖诊断覆盖）
- 🩹 合并的“牙根与牙周组织”卡片（一个可折叠区域，涵盖牙根/根尖周及牙周相关表现）
- ⚕️ 修饰项：根尖周炎症（仅在缺失/拔牙创牙位显示；在现有牙齿上隐藏，此时仅由 `apicalDx` 驱动根尖周图标；在种植体上也隐藏，此时由 `periImplant` 覆盖该表现）、牙周病、松动度分级（M1/M2/M3，种植体上隐藏）
- 🦷🔩 种植体周状态（`periImplant`：无 / 黏膜炎 / 种植体周炎-轻度 / -中度 / -重度）——采用 2018 年世界研讨会分期标准，在种植体上作为专用选择器显示；黏膜炎复用牙周牙龈图标，种植体周炎会叠加一个按等级渲染的 `peri-implant-bone-loss`（种植体周骨吸收）层（不透明度 0.4/0.7/1.0）。种植体不再渲染根尖病损图标——其炎症改由此轴表达——且种植体上会隐藏牙周修饰项复选框（临时性质的“种植体周炎”复选框重命名方案已废除）
- 🏷️ 特殊指示项：需要牙冠、需要更换牙冠、缺失后间隙已关闭、拔牙计划、窝沟封闭、接触点丧失
- 👁️ 咬合面视图、智齿、骨组织与牙髓可见性切换
- 🔢 12 个选择过滤器（全部、现有、恒牙、乳牙、种植体、缺失、上/下颌、前牙/磨牙）
- 📊 预设状态模板（重置、乳牙列、混合牙列、无牙颌）
- 📦 34 种预定义修复体模板（桥、可摘义齿、带种植体的杆卡义齿）
- 💾 JSON 格式的状态导出/导入（版本 2.22；导入仍接受旧版 1.4 及 2.0 至 2.21 版本，并自动迁移，包含插件自定义状态及每颗牙齿的备注）
- 💽 可选的 localStorage 状态持久化（`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`）——默认关闭；启用后会在每次状态变化时自动保存状态图表（可选同时保存计划图表），并在组件下次挂载时自动恢复，附带 4 MB 容量上限，存储/解析错误会通过 `onError` 回调（或 `console.warn`）上报，而不会抛出异常
- 🔗 HL7 FHIR R4 导出（每颗牙齿一个 Observation 组成的 collection Bundle，**恒牙及乳牙**均采用 ISO 3950 牙位编码（乳牙 51-85，导入时可无损还原），使用本地代码系统，另附一个可选启用的 SNOMED CT 叠加编码（设置 → SNOMED CT））；已记录严重度的龋齿分量还会附带评分体系编码——原发（未充填）牙面采用 ICDAS，继发（已充填）牙面采用 CARS
- ✚ 十字/加号式牙面选择界面（B/M/O/D/L）用于龋齿和充填记录
- 🧱 每个牙面独立的修复材料（混合充填，例如颊侧银汞合金 + 远中复合树脂）
- 🖼️ 图表的 PNG/JPG/SVG 图像导出（可下载；PNG/JPG 由矢量 SVG 栅格化而成）
- 🦷 龋齿/继发龋是按牙面划分的状态机：无充填体的患龋牙面渲染为原发龋（按 ICDAS 分级的不透明度）；一旦该牙面存在充填体，则改为渲染继发龋（`subcaries-{surface}` 层，按 CARS 评分）——同一牙面上两者永远不会同时激活
- 🎯 统一的按牙面严重度（`cariesSeverity`，0–6，取代旧有的独立 ICDAS 深度字段和 CARS 字段）：在原发牙面上按 ICDAS 深度解读，在继发（已充填）牙面上按具名 CARS 评分（健康……广泛龋洞）解读，通过一个情境化弹窗仅显示与该牙面当前状态相关的量表
- 🌱 根面龋（`rootCaries`：无 / 活动性 / 静止性 / 活动性伴龋洞），驱动专用的根面龋美术层，其不透明度由严重度决定（活动性 0.5 / 静止性 0.7 / 活动性伴龋洞 完全不透明）
- 📡 影像学龋损深度（`radiographicDepth`：无 / E1 / E2 / D1 / D2 / D3，按牙面记录），独立于视觉上的 ICDAS/CARS 严重度量表，以徽标形式呈现，并通过其自身的 FHIR Observation 往返导出/导入
- 🎚️ 三项龋齿粒度设置（`secondaryCariesMode`、`rootCariesMode`、`radiographicDepthMode`）以及一个 `cariesDepthEnabled` 开关，可将每种量表折叠为更简化的选择视图，而不丢失已存储的数值
- 🩹 充填面板中的继发龋摘要行：在充填控件下方列出任何已选中且带有继发龋的牙齿及其牙面（例如“36 号牙（O 面）的充填体上记录有继发龋。”）
- 🪛 每个牙面的充填缺陷（`fillingDefect`：无 / 边缘 / 折裂 / 磨损），针对直接修复体，独立于继发龋——通过充填卡片上的按牙面指示器记录（与龋齿深度指示器呼应，其选项列表纵向排列），在图表上渲染，并以明确的标签形式显示在提示信息和全口充填摘要中（例如“36（O）– 充填缺陷：O：边缘”），与继发龋在龋齿行中的标注方式一致；充填卡片还会为任何已选中且记录有充填缺陷的牙齿显示提示说明（例如“36 号牙记录有充填缺陷。”），与现有的继发龋提示说明并列
- 🦷💥 按临床病因和部位分类的牙齿磨耗（`wearEdge`：无 / 磨耗（attrition）/ 酸蚀（erosion），切端/咬合面；`wearCervical`：无 / 磨损（abrasion）/ 楔状缺损（abfraction）/ 酸蚀（erosion），颈部）——取代原有的两个开关式磨牙症磨耗标志；通过磨耗行的两个下拉菜单记录，复用现有的磨耗美术效果，并在提示信息和新的全口“磨耗”摘要区域中显示
- 🎨 按病因分类的牙齿变色（`discoloration`：无 / 四环素 / 氟斑牙 / 死髓 / 外源性 / 其他），适用于恒牙和乳牙——当牙齿无修复体且为天然基质时，为所显示的天然牙冠着上代表性颜色；在提示信息和新的全口“变色”摘要区域中显示；与充填缺陷及磨耗一起，完善了表面与结构性状况这一整套指标
- ✏️ 前牙（切牙/尖牙）在整个界面中（选择器、弹窗、摘要）将其咬合面标注为“切端（incisal）”；存储的牙面键仍为 `occlusal`
- 🔤 位置感知型牙面记法（设置 → 牙齿详情 →“牙面记法”，简单/完整，默认完整）：完整模式下，龋齿/充填牙面字母及标签遵循牙齿解剖结构——前牙的咬合面 → I/切端，前牙的颊侧 → L/唇侧，上颌牙的舌侧 → P/腭侧，下颌牙的舌侧 → L/舌侧（近中/远中/冠下不受影响）；简单模式始终使用与牙位无关的通用 B/M/O/D/L/SC 记法。适用于全口摘要以及龋齿和充填缺陷的牙面选择器（字母 + 说明文字）；存储的牙面键不受影响
- 🦷↕️ 按牙位记录的正畸信息（`orthoAppliance`：无 / 托槽 / 带环；`orthoDrift`：无 / 近中 / 远中；`orthoVertical`：无 / 伸长 / 压低；`orthoRotation`：布尔值），适用于现有的天然牙（恒牙或乳牙）——复用自 v2.5.0 起休眠未用的正畸美术资源（无需新增 SVG）；在图表、提示信息及新的全口“正畸”摘要区域中显示
- 🪨 牙石，以及分为内吸收或外颈吸收的牙根吸收（`resorptionType`）
- 📏 按牙面记录的龋齿深度（浅龋/中龋/深龋），或通过 `enableIcdas` 启用可选的 ICDAS II 评分（0–6）
- 🩹 牙冠边缘微渗漏开关，仅在牙冠或桥修复体上显示
- 🧬 基于标准的诊断编码（WHO ICD-10，始终启用）：每一项已记录的临床发现都会推导出一个 ICD-10 编码诊断——龋病（K02）、根面/牙骨质龋及静止龋（K02.2/.3）、牙髓炎与牙髓坏死（K04.0/.1）、根尖周炎、根尖周脓肿及根尖囊肿（K04.4–.9）、磨损/磨耗/酸蚀/楔状缺损（K03.0–.8）、牙石（K03.6）、牙吸收（K03.3）、牙齿变色（K00.3/K00.8/K03.7）、牙齿缺失（K08.1）、残根（K08.3）及牙折（S02.5）——显示在提示信息及全口摘要中，并作为 FHIR Condition 导出。
- 🩺 按牙位的诊断卡片：查看某颗牙齿推导出的 ICD-10 诊断并对其进行整理——抑制一个错误推导的诊断，或添加一个图表未体现的诊断。最终生效的集合（推导 − 已抑制 + 已添加）驱动 FHIR 导出。
- 🗺️ 病例/区域性状况：记录不针对单颗牙齿的全口诊断——错颌畸形与颞下颌关节紊乱（K07）、口腔囊肿（K09）、唾液腺疾病（K11）、口炎与口腔黏膜疾病（K12/K13），以及牙弓层面的发育异常（K00）——每项均可选择标注左侧/右侧/双侧。
- 🌍 国家代码包（设置 → 诊断编码系统）：在 WHO ICD-10 基础编码之上叠加国家代码体系——BNO-10（匈牙利，本地化显示；保留 WHO 编码）或 US ICD-10-CM（重新映射的编码，例如 K07 牙颌面范围 → M26）。添加另一个国家的代码包只需一个小型 `CodingPack` 条目——参见 `CODING_PACKS.md`。
- 🔬 SNOMED CT 叠加编码（设置 → SNOMED CT，可选启用，默认关闭）：在 WHO 编码及任何国家代码包编码基础上同时添加 SNOMED CT 编码，并为没有 WHO ICD-10 编码的种植体周发现提供编码。ICD-10-CM 与 SNOMED 概念 ID 仅供参考/尽力而为——临床使用前请对照官方 ICD-10-CM 列表 / SNOMED CT 浏览器核实。
- 🔁 FHIR Condition 往返：诊断以 FHIR `Condition` 资源导出（按牙位关联，另外还有带侧别 bodySite 的患者层面病例状况），与 Observation 一同导出；导入时会重新构建这些内容——病例状况直接重建，按牙位的添加/抑制覆盖项则通过比对导入的 Condition 与重新推导的图表得出。
- 🩺 **诊断卡片，全新改版：** 每一行按牙位的诊断都先显示 ICD-10 编码（如 `K04.0 Pulpitis`），各行按编码排序。每一行都有一个**排除**开关（将诊断从 FHIR 导出中移除，但保留在图表上）和一个**删除**（×）按钮（同时移除该诊断及其在牙位上的对应临床发现）。从选择器中添加诊断时会同步写入底层的图表临床发现，图符会立即出现。
- 🗂️ **病例/区域性诊断弹窗：** 全口及区域性诊断（颌骨异常、囊肿、唾液腺及黏膜相关病症等）已从牙周侧栏移出，改为独立对话框，通过 Odontogram / Periodontal Status 切换开关旁的**诊断**按钮打开；其选择器以编码为先并按编码排序。
- 🇭🇺 **BNO-10 编码包：** 匈牙利语显示文本现已改为 NEAK 官方 BNO-10 名称，且该编码包使用标准 ICD-10 系统 URI（BNO-X 与 WHO ICD-10 完全一致）。
- ✅ **符合 HL7 校验器要求的干净 FHIR 导出：** 每个 Bundle 条目都带有确定性的 `id` 和绝对 `fullUrl`（不再使用 `urn:uuid` 占位符），且 Bundle 内嵌了引擎自身的 **CodeSystem**，以便校验时能正确解析其本地编码；同一个 CodeSystem 也作为 `fhir/CodeSystem-odontogram.json` 发布在代码仓库中（在 FHIR 导出选项中传入 `includeCodeSystem: false` 可将其省略）。
- 🧰 统一的顶部工具栏图标行，配合带标签页的设置弹窗（常规 / 面板 / 牙齿详情 / 龋齿 / 牙髓 / 备注 / 牙周——编号方式、备注、面板可见性、ICDAS、龋齿深度开关、根面龋/影像学龋损粒度、牙髓详情级别、牙齿磨耗/变色详情级别、牙齿信息）
- 🗂️ 设置 →“面板”标签页：可独立显示/隐藏全口“状态”摘要面板和“正畸”摘要面板
- 🦷🩺 设置 →“牙周”标签页：针对牙周图表各行的 16 个按指标显示/隐藏开关（按牙周袋/口腔卫生/膜龈/支持组织/种植体周分组——PD/GM/CAL/BOP、菌斑、PI、GI、CEJ 可见性、根面凹陷、KG、GT、根分叉、松动度、Miller 分级、mPI、mBI），每项均附说明，另附一个“译文名称 vs. 规范名称”显示选项（规范名称 = 在所有界面语言下均固定使用的英文/拉丁文学术名称；无论此设置如何，提示信息始终保持本地化）。两者均为应用级偏好设置（与 `perioViewMode` 相同）——从不作为导出数据的一部分
- 🩹 继发龋（CARS）设置已合并入“龋齿”设置标签页，位置排在“影像学深度”之上（原独立的“继发龋”标签页已废除）
- 🎚️ 牙齿详情详情级别（设置 → 牙齿详情）：针对牙齿磨耗和变色的简单/复杂设置。简单模式下每项发现显示一个是/否开关（磨耗开启 → 磨耗/磨损，变色开启 → 其他）；复杂模式（默认）保留类型/病因下拉菜单，切换级别时已存储的数值保持不变
- 📋 牙齿信息面板：整个图表的实时文字摘要（牙齿计数、现有/缺失列表、龋齿（含继发龋）、充填、根管治疗、修复体、种植体、牙周状态）——默认显示，可在设置中开关
- 🗂️ 合并的导出下拉菜单（状态 JSON / FHIR / PNG / JPG）
- 📥 带 FHIR 导入功能的导入下拉菜单（可回读已导出的 Bundle）
- ⏳ 图像导出过程中的进度浮层
- 🎓 18 步交互式新手导览
- 🔢 三种牙位编号系统（FDI、通用编号法、Palmer）
- 🌐 国际化（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR），支持语言切换
- 🌗 支持深色模式，附带切换按钮（独立控制或由父应用控制）
- 🎨 通过 CSS 自定义属性（`--odon-*`）实现的自定义主题配置（`themeConfig` 属性）
- 📱 移动端触控体验：点按缩放弹出层、长按上下文菜单、双指缩放、符合 WCAG 标准的 44px 触控目标、牙弓切换导航
- 🔌 自定义 SVG 插件系统：注入视觉叠加层、每颗牙齿的自定义状态、支持 JSON 导出/导入——插件 `renderSvg()` 的输出在插入实时图表前会经过 DOMPurify 净化（SVG 配置文件）；插件本质上仍作为受信任代码运行，因此请仅使用来源可信的插件
- 🛡️ 内容安全策略（CSP）：演示站点的生产构建会注入 CSP meta 标签（开发服务器不受影响）——嵌入本组件的宿主应用应自行设置其 CSP
- ⚠️ 针对不兼容牙齿状态组合的状态校验警告
- 🏷️ 牙齿方块上的自动状态提示（显示所有当前激活的状态）
- 🩺 现代化的按牙位提示信息与全口摘要面板：两者均展示完整的一整套临床发现（牙髓/根尖诊断 + 病损亚型、牙根吸收、种植体周状态、分级根面龋、牙石、牙冠边缘微渗漏、折裂、接触丧失、分类的切端/颈部磨耗），面板中设有专门的“诊断”区块、专门的“磨耗”区块，以及一个粗粒度的龋齿严重度限定符（浅/中/深）
- ♿ 键盘无障碍访问（WCAG）：ARIA listbox/option 角色、回车/空格键选择、方向键导航、focus-visible 轮廓
- 🔒 只读模式：为打印/报告/查看场景禁用所有交互
- ✨ 选中动画：选中牙齿呈现脉动虚线边框和发光阴影效果（支持 prefers-reduced-motion）
- 📝 每颗牙齿的备注：双击添加/编辑备注，牙号旁显示备注图标，悬停提示显示备注文字，全口摘要面板中新增一行“个别备注”，并纳入 PDF 报告，支持 JSON 导出/导入
- 🔀 现状 ↔ 计划图表切换：图表标题栏中的 `Status | Plan`（现状 | 计划）切换开关可在**现状**图表与**计划**（拟定治疗后）图表之间切换，二者各自拥有独立的牙齿状态；首次切换到计划图表时，它会以现状图表为初始副本，此后一个图表中的编辑不会影响另一个图表。导出/导入（`exportStatus`/`exportFhir`/文件导入）始终针对现状图表；计划图表通过其自身的 API 单独读写（见下文“公共 API”）——当其与现状不同时，会作为附加的 `plan` 区块包含在 JSON 导出中
- 📝 “变更内容”提示框：只要计划与当前现状存在差异，牙齿信息面板下方的一个提示框会按牙位、按治疗轴（存在与否、基质、修复体、可摘修复、拟定牙冠、正畸、牙髓/根管、根尖）逐条列出差异，格式为 `牙位: 轴  从 → 到`；也可通过 `getPlanChanges()` 以编程方式获取

![全口牙周图（简体中文）](screenshot_zh_perio.png)

- 🩺 牙周记录：每颗牙齿六个标准位点的**探诊深度**、**龈缘位置**、**探诊出血**（+溢脓），并推算出**临床附着水平（CAL = 探诊深度 + 龈缘位置）**、牙龈退缩量，以及全口**探诊出血百分比（%BOP）**。**图形化全口牙周图**——每侧牙弓分别绘制为**两张独立的颊侧/腭（舌）侧 SVG 图**（复用牙齿美术资源，在两个面上统一采用“牙冠朝向一致”的方向；种植牙位使用**种植体图形**），配有红色的**CEJ 线**、**带毫米刻度编号的参考网格**，以及贯穿各牙的**龈缘/牙周袋深度曲线**，并由一条**中央牙周指标带**（标注为 `▲ 颊侧 … 舌/腭侧 ▼`）将其分隔，该指标带承载共用的按牙位指标——最上方为 **Miller 分级**，**菌斑/PI/GI/mPI/mBI** 则以每颗牙齿一个**解剖学菱形方块**呈现（颊侧尖朝上，舌侧尖朝下，中间行的近中/远中根据左右侧对调，使近中始终指向牙弓中线）；数值行（完整指标名称——PD/GM/CAL/BOP + 松动度 + 根分叉——采用更大、更适合触控的单元格）按列对齐，并附一份摘要（平均 PD/CAL、%BOP、PI%），支持**键盘自动前进**式录入；图表会**动态缩放以填满可用宽度**，在任意窗口尺寸下均具响应式效果。以 `Odontogram | Periodontal Status`（牙位图 | 牙周状态）**视图切换开关**呈现，该视图激活时右侧面板会转用为**牙周情境侧栏**（患者数据、2017 年分类结果及全口摘要），设置选项可将整体呈现方式切回**弹窗**形式；`PerioChart` 依然是一个**可独立调用的组件**（具名导出），使宿主应用可以独立于基础牙位图单独调起牙周图表。按位点的 **FHIR** 导出通过 LOINC 牙周面板代码（`74029-0`；探诊深度 `32910-2`、牙龈退缩 `32911-0`、CAL `32912-8`）
- 🅿️ 拟定样式：在计划模式下，计划相对当前现状**新增**的发现（拟定牙冠、拔牙、正畸移动、修复体等）会以醒目的**虚线、着色“拟定”轮廓**渲染，使计划呈现为意向而非既成事实——图表卡片中附有“虚线 = 拟定”图例说明。现状模式下的渲染保持逐字节一致；治疗方案仅存在于计划图表中，切回现状时会完全重置
- 🚦 计划模式限定：计划图表仅显示牙医实际可以**执行**的操作——基础选择器仅提供缺失 / 恒牙 / 种植体，且仅适用于现状的发现项（龋齿、牙齿磨耗、变色，以及整个牙周区块——松动度、六位点探诊网格、炎症/牙周修饰项、牙石、种植体周状态）均被隐藏；牙髓/根管控件保留根管**治疗**操作（根管治疗/桩钉/根尖切除/髓旁钉），同时隐藏牙髓/根尖**诊断**及牙根吸收。修复体、可摘修复、正畸、需要牙冠/更换牙冠及拔牙计划仍可纳入计划
- 🧪 全面的 Vitest 自动化测试套件，涵盖编号系统、翻译、预设模板、国际化、App 组件、主题、触控、插件、无障碍访问及临床轴/诊断一致性
- 📖 基于 JSDoc 注释、面向所有公共导出项生成的 TypeDoc API 文档（`npm run docs`）

### 📦 模块组成
- 🦷 牙位图网格与牙齿方块界面
- 🎛️ 控件与状态面板
- 🎨 SVG 分层渲染引擎及模板
- 🔢 牙位编号与标签映射（FDI/通用编号法/Palmer）
- 🌐 本地化（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR）
- 💾 状态导出/导入
- 📋 状态附加功能：预定义修复体模板
- 🎨 主题配置：通过 `--odon-*` CSS 属性实现的可自定义配色方案
- 📱 移动端触控交互（点按缩放、长按、双指缩放、牙弓切换）
- 🔌 自定义 SVG 插件系统
- ⚠️ 状态校验与提示系统
- ♿ 键盘无障碍访问与 ARIA 支持
- 🔒 只读模式
- ✨ 选中动画
- 📝 每颗牙齿的备注系统
- 🧪 自动化测试套件（Vitest + Testing Library）

### 🛠️ 界面控件

**🔝 顶部工具栏：**
- 语言切换器（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR 下拉菜单）
- 深色模式切换按钮（太阳/月亮图标，在亮色与深色主题间切换）
- 编号系统切换器（FDI/通用编号法/Palmer 下拉菜单）
- 导出状态 / 导入状态按钮

**📊 图表标题栏：**
- 咬合面视图切换
- 智齿可见性切换
- 骨组织可见性切换
- 牙髓可见性切换
- 清除选择按钮

**🔍 选择过滤器：**
- 全选 / 全部现有 / 恒牙 / 乳牙 / 种植体 / 全部缺失
- 选择上颌 / 上前牙 6 颗 / 上磨牙
- 选择下颌 / 下前牙 6 颗 / 下磨牙

**📋 状态预设：**
- 重置全部（重置整口牙齿）
- 乳牙列
- 混合牙列
- 无牙颌切换

**📦 状态附加项下拉菜单：**
- 上/下颌氧化锆桥（12-22、13-23、16-26、全牙弓）
- 上/下颌金属桥（12-22、13-23、16-26、全牙弓）
- 上/下颌可摘局部义齿
- 上/下颌可摘全口义齿
- 上/下颌带种植体的杆卡义齿

**🦷 牙齿编辑器面板**（针对所选牙齿，按可折叠卡片分组）：
- **基础行：** 牙齿选择（基本类型，含断冠变体）及牙体基质（天然/残根/折断/已预备冠）
- **修复体行：** 合并的“Fix: …” / “Kivehető: …”修复体下拉菜单（`restorationType` × `restorationMaterial` 固定选项，加上按牙齿种类限定的 `prosthesis` 附着体/可摘选项）；牙冠边缘微渗漏复选框（仅限牙冠/桥）；断冠位置复选框；需要牙冠/需要更换牙冠开关
- **磨耗与变色行：** 切端/咬合面磨耗类型下拉菜单、颈部磨耗类型下拉菜单、变色病因下拉菜单（在设置 → 牙齿详情 → 简单模式下，各自切换为简单的是/否开关）
- **正畸卡片：** 矫治器、近中/远中移位、垂直移动（伸长/压低）、扭转开关——显示于现有天然牙上
- **龋齿卡片：** 龋齿深度模式下拉菜单、冠下龋复选框、根面龋严重度下拉菜单，以及带情境化 ICDAS 深度/CARS 弹窗和影像学深度徽标的 B/M/O/D/L 按牙面龋齿选择器
- **充填卡片：** 充填材料下拉菜单、按牙面的充填选择器（含每牙面材料）、按牙面的充填缺陷指示器（边缘/折裂/磨损）、继发龋与充填缺陷提示说明
- **牙根与牙周组织卡片：** 合并的“牙髓 / 根管状态”选择器、根尖诊断选择器、根尖病损亚型选择器（仅限有症状/无症状根尖周炎）、牙根吸收类型选择器、松动度分级选择器、种植体周状态选择器（仅限种植体）
- **特殊指示项：** 拔牙计划/拔牙创、缺失后间隙已关闭、窝沟封闭、接触点丧失、牙石、髓旁钉、根尖切除、桥基牙

### 🦷 牙齿类型与状态

**牙齿选择（基本类型）：**
| 值 | 说明 |
|---|---|
| `none` | 缺失牙 |
| `tooth-base` | 恒牙 |
| `milktooth` | 乳牙 |
| `implant` | 种植体 |
| `tooth-under-gum` | 龈下（未萌出）牙 |

**断冠变体：**
`tooth-broken-inicisal`、`tooth-broken-distal-inicisal`、`tooth-broken-distal`、`tooth-broken-mesial-distal-inicisal`、`tooth-broken-mesial-distal`、`tooth-broken-mesial-inicisal`、`tooth-broken-mesial`、`no-tooth-after-extraction`

**牙体基质（恒牙）：**
`natural`（天然，默认）、`radix`（残根）、`broken`（折断）、`crownprep`（已预备冠）

**修复体类型（恒牙）：**
`none`、`crown`、`inlay`、`onlay`（仅限咬合面视图）、`veneer`、`bridge`

**修复体材料（恒牙）：**
`none`、`emax`、`gold`、`gradia`、`zircon`、`metal`、`metal-ceramic`（旧版 `metal` 牙冠迁移至此）、`telescope`、`temporary`

**修复体选项按牙齿种类限定**（`src/registry/restorations.ts` 中的 `restorationOptions()`）：种植体仅提供 `crown`/`bridge` 修复体类型（叠加种植体连接体层），加上下文的五种 `prosthesis` 附着体条目；缺失/间隙牙位仅提供 `bridge`（桥体），加上两种可摘义齿的 `prosthesis` 条目；`radix`（残根）基质会完全隐藏修复体控件。旧版的扁平字段 `crownMaterial`/`bridgeUnit`（v1.14 之前的种植体/桥附着值）已从当前模型中退役——仅作为旧数据的只读迁移路径予以接受。

**可摘修复**（`prosthesis`；正交的可摘/附着体轴，在合并的修复体下拉菜单中以“Kivehető:”条目呈现）：
`none`、`healing-abutment`、`locator`、`locator-denture`、`bar`、`bar-denture`（种植体附着体，可带或不带覆盖义齿）、`removable-partial`、`removable-full`（缺失/间隙牙位上的牙支持式义齿）。一颗牙要么有固定修复体，要么有可摘修复，二者不能同时存在——设置其一会清除另一个。

**牙冠边缘微渗漏**（`crownLeakage`；布尔值）：仅在 `restorationType` 为 `crown` 或 `bridge` 时显示；激活 `crown-leakage` 美术层。

**根管治疗选项（恒牙）：**
`none`、`endo-medical-filling`、`endo-filling`、`endo-filling-incomplete`、`endo-glass-pin`、`endo-metal-pin`

**根管治疗选项（乳牙）：**
`none`、`endo-medical-filling`

`endo` 与 `pulpDx` 通过一个合并的“牙髓 / 根管状态”下拉框呈现（分组：活髓 vs. 已治疗/根管），二者互斥——选择一个已治疗选项（`endo != none`）会将 `pulpDx` 重置为 `normal`，选择一个牙髓诊断则会将 `endo` 重置为 `none`。

**充填材料（恒牙）：**
`amalgam`（银汞合金）、`composite`（复合树脂）、`gic`（玻璃离子）、`temporary`（临时材料）

**充填材料（乳牙）：**
`composite`、`gic`、`temporary`

**充填/龋齿牙面：**
`mesial`（近中）、`distal`（远中）、`buccal`（颊侧）、`lingual`（舌侧）、`occlusal`（咬合面）、`subcrown`（冠下，仅限龋齿）

**修饰项：**
`inflammation`（根尖周炎症）、`parodontal`（牙周）、`mobility`（松动度，M1/M2/M3）

**根尖病损类型**（`periapicalType`；限定根尖周图标，仅在有症状/无症状根尖周炎下显示）：
`none`、`granuloma`（肉芽肿）、`cyst`（囊肿）——可记录选项；旧版 `abscess`（脓肿）值仍被接受并存储，但选择器中不再提供，因为它与根尖诊断重复。导入时该值会被丢弃：若牙齿携带炎症修饰项，则并入 `apicalDx`，否则清除为 `none`

**牙髓诊断**（AAE 术语；`pulpDx`）：
`normal`（正常）、`reversible-pulpitis`（可复性牙髓炎，渲染为简化牙髓图标）、`irreversible-pulpitis`（不可复性牙髓炎）、`necrosis`（坏死）——与 `endo` 互斥；已行根管治疗的牙齿会被规范化为 `normal`

**牙髓诊断，实用拉丁文**（`pulpLatin`；仅当 `pulpDetailLevel` 为 `latin` 时由牙髓选择器显示）：
`none`、`pulpa-sana`、`hyperaemia-pulpae`、`pulpitis-acuta-serosa`、`pulpitis-acuta-purulenta`、`pulpitis-chronica-clausa`、`pulpitis-chronica-ulcerosa`、`pulpitis-chronica-hyperplastica`、`necrosis-pulpae`、`gangraena-pulpae`

**牙髓详情级别**（`pulpDetailLevel`，全局设置）：`simple`、`aae`（默认）、`latin`——控制选择器提供哪一套牙髓术语

**根尖诊断**（`apicalDx`；驱动根尖周图标）：
`normal`、`symptomatic-apical-periodontitis`（有症状根尖周炎）、`asymptomatic-apical-periodontitis`（无症状根尖周炎）、`acute-apical-abscess`（急性根尖脓肿）、`chronic-apical-abscess`（慢性根尖脓肿）、`condensing-osteitis`（致密性骨炎）

**牙根吸收类型**（`resorptionType`）：
`none`、`internal`（内吸收）、`external-cervical`（外颈吸收）

**种植体周状态**（`periImplant`；仅限种植体，采用 2018 年世界研讨会分期标准）：`mucositis`（黏膜炎）复用牙周牙龈图标；`peri-implantitis-*`（种植体周炎）叠加 `peri-implant-bone-loss` 层，不透明度按严重度分级（轻度 0.4 / 中度 0.7 / 重度 1.0）。种植体不再渲染根尖病损图标（其炎症改由此轴表达），且种植体上的 `mods` 炎症/牙周修饰项复选框已隐藏：
`none`、`mucositis`、`peri-implantitis-mild`、`peri-implantitis-moderate`、`peri-implantitis-severe`

**龋齿严重度**（`cariesSeverity`；统一的按牙面字段，`0`–`6`）：在无充填的牙面上，按 ICDAS 龋齿深度量表解读（`superficial`/浅龋、`dentin`/中龋、`deep`/深龋，或在启用 `enableIcdas` 时使用原始 ICDAS II 代码 `0–6`），并渲染原发 `caries-{surface}` 层；在有充填的牙面上，按具名 CARS 评分解读（`0` 健康……`6` 广泛龋洞），并改为渲染 `subcaries-{surface}`（继发龋）层——同一牙面永远不会同时处于原发和继发状态

**根面龋**（`rootCaries`；驱动现有牙齿上的 `caries-root` 美术层，不透明度由严重度决定——`active` 0.5 / `arrested` 0.7 / `active-cavitated` 完全不透明）：
`none`、`active`、`arrested`、`active-cavitated`

**影像学龋损深度**（`radiographicDepth`；按牙面记录，独立于视觉上的 ICDAS/CARS `cariesSeverity` 量表）：
`none`、`E1`、`E2`、`D1`、`D2`、`D3`

**龋齿粒度设置**（全局）：`secondaryCariesMode`（`simple`/`standard`/`full`，默认 `standard`）、`rootCariesMode`（`simple`/`severity`，默认 `simple`）、`radiographicDepthMode`（`off`/`threeLevel`/`detailed`，默认 `off`）、`cariesDepthEnabled`（布尔值，默认 `true`）——各自将对应量表折叠为更简化的选择视图，而不改变已存储的数值

**特殊指示项：**
`crownNeeded`、`crownReplace`、`missingClosed`、`extractionPlan`、`extractionWound`、`bridgePillar`、`fissureSealing`、`contactMesial`、`contactDistal`、`endoResection`、`calculus`、`parapulpalPin`

**牙齿磨耗**（`wearEdge`、`wearCervical`；按部位划分的临床类型，限定于天然牙基础类型 + 无修复体 + 天然基质；渲染现有的 `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` 层）：
`wearEdge`：`none`、`attrition`（磨耗）、`erosion`（酸蚀）——`wearCervical`：`none`、`abrasion`（磨损）、`abfraction`（楔状缺损）、`erosion`（酸蚀）

**变色**（`discoloration`；按牙齿病因，限定于天然恒牙或乳牙 + 无修复体 + 天然基质；为所显示的天然牙冠着色——无需新增 SVG）：
`none`、`tetracycline`（四环素）、`fluorosis`（氟斑牙）、`nonvital`（死髓）、`extrinsic`（外源性）、`other`（其他）

**充填缺陷**（`fillingDefect`；按牙面，独立于继发龋的直接修复体发现——限定于 `fillingSurfaceMaterials` 中存在的牙面；渲染 `defect-{surface}` 美术层）：
`none`、`marginal`（边缘）、`fracture`（折裂）、`wear`（磨损）

**正畸**（`orthoAppliance`、`orthoDrift`、`orthoVertical`、`orthoRotation`；按牙位，限定于现有天然牙——恒牙或乳牙）：
`orthoAppliance`：`none`、`bracket`（托槽）、`band`（带环）——`orthoDrift`：`none`、`mesial`（近中）、`distal`（远中）——`orthoVertical`：`none`、`extrusion`（伸长，向上箭头图标）、`intrusion`（压低，向下箭头图标）——`orthoRotation`：布尔值

**牙齿详情/记法设置**（全局会话设置，设置 → 牙齿详情）：`wearDetailLevel` 与 `discolorationDetailLevel`（`ToothDetailLevel`：`simple`/`complex`，默认 `complex`——简单模式下显示是/否开关而非完整的类型/病因下拉菜单，且不会改变已存储的值）以及 `surfaceNotation`（`simple`/`full`，默认 `full`——控制龋齿/充填牙面的字母/标签是否具有位置感知性；参见上文“位置感知型牙面记法”）

### ⚙️ 设置
通过顶部工具栏的齿轮图标打开；这是一个具有焦点陷阱、ARIA `dialog` 角色的带标签页弹窗（Esc 键或点击背景可关闭，方向键可切换标签页）。除非另有说明，所有设置均仅为会话级界面状态——都不会修改按牙位数据或导出数据。

- **常规：** 编号系统（FDI/通用编号法/Palmer）、语言、深色/浅色主题、牙齿信息面板可见性
- **牙位图：** 牙齿解剖轮廓（`classic` 默认 / `measured`）——`measured` 以双牙弓、逐牙宽度布局渲染九个依据文献测量的牙齿模板；可在运行时切换，不影响 `classic` 默认值
- **面板：** 独立显示/隐藏全口“状态”卡片和“正畸”卡片（默认均可见）
- **牙齿详情：** 磨耗详情级别与变色详情级别（简单/复杂，默认均为复杂）、牙面记法（简单/完整，默认完整）
- **龋齿：** ICDAS II 评分开关（`enableIcdas`）、龋齿深度开关（`cariesDepthEnabled`）、根面龋粒度（`rootCariesMode`：简单/严重度）、继发龋/CARS 粒度（`secondaryCariesMode`：简单/标准/完整）、影像学深度粒度（`radiographicDepthMode`：关闭/三级/详细）——原先独立的“继发龋”标签页已合并入本标签页，CARS 控件位置紧邻影像学深度之上
- **牙髓：** 牙髓详情级别（`pulpDetailLevel`：简单/AAE/实用拉丁文，默认 AAE）——控制“牙髓 / 根管状态”选择器提供哪一套术语；更改此设置会实时刷新全口摘要和所有已打开的提示信息
- **备注：** 启用/禁用每颗牙齿的备注（`enableNotes`）
- **牙周：** 针对全部 16 个牙周图表行的按指标显示/隐藏开关（`perioRowVisibility`，默认全部可见），按牙周袋（PD/GM/CAL/BOP）/口腔卫生（菌斑/PI/GI）/膜龈（CEJ 可见性/根面凹陷/KG/GT）/支持组织（根分叉/松动度/Miller 分级）/种植体周（mPI/mBI）分组，每行均附各自说明；另有译文名称 vs. 规范名称模式（`perioIndexNameMode`：默认 `translated`（译文） / `canonical`（规范）——规范模式在所有界面语言下均显示固定的英文/拉丁文学术名称）。仅为应用级偏好（与 `perioViewMode` 相同）——从不被序列化，且提示信息在两种模式下均保持本地化

### 🖼️ SVG 模板系统

**牙齿模板**（位于 `src/assets/teeth-svgs/`）：
| 模板 | 使用该模板的牙位 |
|---|---|
| `11.svg` | 11、12、21、22、31、32、41、42（切牙） |
| `13.svg` | 13、23、33、43（尖牙） |
| `14.svg` / `14_occl.svg` | 14、15、24、25、34、35、44、45（前磨牙） |
| `16.svg` / `16_occl.svg` | 16、17、18、26、27、28、36、37、38、46、47、48（磨牙） |

模板在下颌旋转 180 度，在左侧水平镜像。

**图标 SVG**（位于 `src/assets/icon-svgs/`）：
`icon_8.svg`（智齿）、`icon_gum.svg`（骨组织）、`icon_no_selection.svg`（清除）、`icon_occl.svg`（咬合面视图）、`icon_pulp.svg`（牙髓）

### 🔢 编号系统

**FDI（ISO 3950）：** 恒牙 11-18、21-28、31-38、41-48。乳牙 51-55、61-65、71-75、81-85。

**通用编号法（美国）：** 恒牙编号 1-32。乳牙使用字母 A-T。

**Palmer（Zsigmondy-Palmer）：** 象限 + 位置格式（例如 UR-1、LL-5）。乳牙每个象限使用字母 A-E。

### 🚀 使用方法
开发：
```bash
npm install
npm run dev
```
构建：
```bash
npm run build
```
预览：
```bash
npm run preview
```

### 🔗 集成
该组件可嵌入任意 React 应用。
示例：
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

**深色模式集成：**
- **独立模式：** 省略 `darkMode` 属性——组件通过顶部工具栏切换按钮自行管理主题状态，并在 `<html>` 上添加/移除 `.dark` 类。
- **受控模式：** 传入 `darkMode` 和 `onDarkModeChange`——由父应用控制主题。切换按钮仍会显示，但会调用 `onDarkModeChange` 而不是管理内部状态。父应用负责在 `<html>` 上添加/移除 `.dark` 类。

**自定义主题：**
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

**插件集成：**
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

// 为某颗牙齿设置插件状态：
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 测试
```bash
npm run test           # 运行完整的 Vitest 测试套件
npm run test:watch     # 监听模式
npm run test:coverage  # 覆盖率报告
```

### 📖 API 文档

🅰️ **Angular 版本：** 现已提供官方的 Angular 移植版 [Angular Advanced Odontogram](https://github.com/ZoliQua/Angular-Advanced-Odontogram)（npm 包名 `angular-advanced-odontogram`）——JSON 与 FHIR R4 导出可在两个库之间互相导入导出。

```bash
npm run docs           # 在 docs/ 目录生成 TypeDoc 文档
```

### 📡 公共 API

**组件属性：**

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `language` | `string` | `'hu'` | 界面语言（hu/en/de/es/it/sk/pl/ru/pt-br） |
| `onLanguageChange` | `(lang) => void` | — | 语言变更时的回调 |
| `numberingSystem` | `string` | `'FDI'` | 编号系统（FDI/Universal/Palmer） |
| `onNumberingChange` | `(system) => void` | — | 编号系统变更时的回调 |
| `darkMode` | `boolean` | `undefined` | 深色模式状态。独立模式下可省略。 |
| `onDarkModeChange` | `(dark) => void` | — | 深色模式切换时的回调。受控模式下必填。 |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | 通过 CSS 自定义属性（`--odon-*`）自定义配色方案。 |
| `plugins` | `OdontogramPlugin[]` | `undefined` | 用于视觉叠加层和按牙位自定义状态的自定义 SVG 插件。 |
| `readOnly` | `boolean` | `undefined` | 禁用所有交互（点击、触控、键盘）。适用于打印/报告视图。 |
| `enableNotes` | `boolean` | `undefined` | 启用每颗牙齿的备注。双击某颗牙齿即可添加/编辑备注。 |

**用于外部控制的导出函数：**

| 函数 | 说明 |
|---|---|
| `initOdontogram()` | 初始化引擎并渲染所有牙齿 |
| `destroyOdontogram()` | 清理引擎并移除事件监听器 |
| `setNumberingSystem(system)` | 在 FDI、通用编号法、Palmer 之间切换 |
| `clearSelection()` | 取消选择所有牙齿 |
| `setOcclusalVisible(on)` | 切换咬合面视图的开/关 |
| `setWisdomVisible(on)` | 显示/隐藏智齿 |
| `setShowBase(on)` | 显示/隐藏骨组织层 |
| `setHealthyPulpVisible(on)` | 显示/隐藏健康牙髓 |
| `registerPlugins(plugins)` | 注册自定义 SVG 插件 |
| `setPluginState(toothNo, pluginId, value)` | 设置某颗牙齿的插件自定义状态 |
| `getPluginState(toothNo, pluginId)` | 获取某颗牙齿的插件自定义状态 |
| `getToothStateSummary(toothNo)` | 获取某颗牙齿全部当前状态的本地化摘要 |
| `getOdontogramSummary()` | 获取整个图表的结构化本地化文字摘要（计数、各区块） |
| `onStateChange(callback)` | 订阅状态变化；返回一个取消订阅函数 |
| `setReadOnly(value)` | 启用/禁用只读模式 |
| `getReadOnly()` | 获取当前只读状态 |
| `setNotesEnabled(value)` | 启用/禁用每颗牙齿的备注功能 |
| `getNotesEnabled()` | 获取当前备注功能启用状态 |
| `setPulpDetailLevel(level)` | 设置牙髓选择器的术语级别——`"simple"`、`"aae"` 或 `"latin"` |
| `getPulpDetailLevel()` | 获取当前牙髓详情级别 |
| `getChartMode()` | 获取当前激活的图表——`"status"`（现状）或 `"plan"`（计划） |
| `setChartMode(mode)` | 将激活图表切换为 `"status"` 或 `"plan"`；首次进入计划图表时会从现状图表深拷贝而来 |
| `getStatusChart()` | 获取现状图表的数据（`{version, globals, teeth}`），与当前激活哪个图表无关 |
| `getPlanChart()` | 获取计划图表的数据（`{version, globals, teeth}`），与当前激活哪个图表无关 |
| `setPlanChart(payload)` | 用给定数据替换计划图表的牙齿数据（不影响现状图表）；将计划图表标记为已初始化 |
| `getPlanChanges()` | 获取结构化的现状→计划差异（`{ toothNo, axis, from, to }[]`）——每颗牙齿、每个治疗轴一条，仅列出现状图表与计划图表之间存在差异的项；若不存在计划则返回空数组。也会以 `plannedChanges` 的形式出现在 `getOdontogramSummary()` 中 |
| `setPerioSite(toothNo, site, patch)` | 设置六个位点之一的牙周数据（`patch` = `{ pd?, gm?, bop?, sup? }`）；`pd` 为 null 或 `<1` 表示取消该位点的记录。会进行校验并限幅（PD 1–15，GM −10…+20） |
| `getToothPerio(toothNo)` | 获取某颗牙齿按位点记录的牙周数据（仅限已记录的位点） |
| `getToothCal(toothNo)` | 获取某颗牙齿各位点推算得出的 CAL（`探诊深度 + 龈缘位置`） |
| `getPerioSummary()` | 全口牙周汇总数据：已记录位点数、出血位点数、%BOP、最差 CAL、最大 PD |
| `getPerioChart()` | 获取当前激活图表的按牙位牙周记录 |
| `PerioChart` | React 组件（具名导出）——全口牙周图表叠加层（`{ open, onClose }`），可独立于 `OdontogramShell` 挂载，便于宿主应用集成 |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | 以编程方式打开/关闭/查询牙周图表叠加层——使宿主应用可以独立于基础牙位图单独调起牙周图表（共享同一病例状态） |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | 获取/设置牙周图表的呈现方式——`"toggle"`（`Odontogram \| Dental Chart` 视图切换，默认）或 `"popup"`（叠加弹窗） |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | 获取/设置牙周图表的高亮叠加层——`"none"`（默认）/ `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"`；按该指标对牙齿重新着色（仅在现有数据上做展示，不改变数据） |
| `getToothRecessionType(toothNo)` | 获取推算出的 **Cairo（开罗）退缩分类**——`"none"` / `"rt1"` / `"rt2"` / `"rt3"`（根据该牙齿邻面与颊面 CAL 的对比计算得出） |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | 按牙位设置/获取 CEJ 可见性——`"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | 按牙位设置/获取根面凹陷程度——`"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | 按牙面设置/获取 Silness-Löe 菌斑指数分级——`0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | 按牙面设置/获取 Löe-Silness 牙龈指数分级——`0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | 按牙位设置/获取颊侧角化龈宽度（毫米）——`0`-`15`，未记录时为 `null` |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | 按牙位设置/获取牙龈厚度表型——`"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | 按牙位设置/获取 Miller 牙龈退缩分级——`"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | 仅限种植体——按牙面设置/获取 Mombelli 改良菌斑指数（mPI）分级——`0`-`3`；对非种植体牙齿无效 |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | 仅限种植体——按牙面设置/获取 Mombelli 改良龈沟出血指数（mBI）分级——`0`-`3`；对非种植体牙齿无效 |
| `furcationEntrances(toothNo)` | 获取某颗牙齿的根分叉入口位置——`["mesial","distal","buccal"]`（上颌磨牙）、`["buccal","lingual"]`（下颌磨牙）、`["mesial","distal"]`（上颌第一前磨牙），其余为 `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | 设置/获取按入口位置记录的根分叉受累程度（Glickman `1`–`4`；`null` 表示清除） |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | 设置/获取按牙面记录的 O'Leary 菌斑存在情况（近中/远中/颊侧/舌侧）；用于计算 `getPerioSummary()` 中的全口 PI% |
| `getCaseMeta()` | 获取病例级元数据对象（`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`）——一个共享的独立数据块，非按牙位、非双状态（与顶层的 `globals` 数据键类似）；用于牙周分期/分级分类及 PDF 报告标题 |
| `setPatientName(v)` | 设置病例的患者姓名（自动去除首尾空格；空字符串或 `null` 表示清除）——仅为身份标识信息，不参与牙周分类推算 |
| `setPatientDob(v)` | 设置病例的患者出生日期（`YYYY-MM-DD`；无效或空值表示清除）——仅用于 PDF 报告身份信息 |
| `setExamDate(v)` | 设置病例的检查日期（`YYYY-MM-DD`；无效或空值表示清除） |
| `setCaseAge(v)` | 设置病例的患者年龄（岁）——`0`-`120`，`null` 表示清除 |
| `setSmokingStatus(v)` | 设置病例的吸烟状况——`"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | 设置每日吸烟支数（仅在吸烟状况为 `"current"` 时有意义）——`0`-`99`，`null` 表示清除 |
| `setDiabetesStatus(v)` | 设置病例的糖尿病状况——`"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | 设置糖化血红蛋白（HbA1c）百分比（仅在糖尿病状况为 `"present"` 时有意义）——`3.0`-`20.0`（一位小数），`null` 表示清除 |
| `setToothLossPerio(v)` | 设置因牙周炎而丧失的牙齿数——`0`-`32`，`null` 表示清除 |
| `setMaxRblPercent(v)` | 设置最大影像学骨吸收百分比——`0`-`100`，`null` 表示清除 |
| `resetCaseMeta()` | 将病例级元数据对象重置为空默认值 |
| `getPerioClassification()` | 获取 2017 年世界研讨会牙周分类结果（`{diagnosis, stage, grade, extent, derived, overridden}`）——诊断/分期/分级/范围根据已记录的牙周数据及病例元数据推算得出，若设置了临床医生覆盖值，每个轴均以覆盖值为准（`derived` 始终展示未经修改的推算结果，`overridden` 标记哪些轴被覆盖） |
| `setDiagnosisOverride(v)` | 覆盖推算得出的牙周诊断——`"health"`（健康）/ `"gingivitis"`（牙龈炎）/ `"periodontitis"`（牙周炎），`null` 表示清除（恢复为推算值） |
| `setStageOverride(v)` | 覆盖推算得出的牙周分期——`"I"` / `"II"` / `"III"` / `"IV"`，`null` 表示清除（恢复为推算值） |
| `setGradeOverride(v)` | 覆盖推算得出的牙周分级——`"A"` / `"B"` / `"C"`，`null` 表示清除（恢复为推算值） |
| `setExtentOverride(v)` | 覆盖推算得出的牙周范围——`"localized"`（局限型）/ `"generalized"`（广泛型）/ `"molar-incisor"`（磨牙-切牙型），`null` 表示清除（恢复为推算值） |
| `exportFhir(options?)` | 将图表导出为 HL7 FHIR R4 collection Bundle（JSON 下载）。可选 `{ subject }` 引用；否则会嵌入一个占位 Patient 资源 |
| `exportImage(format)` | 将图表下载为图像——`"png"` 或 `"jpg"` |
| `exportSvg()` | 将图表下载为可缩放的矢量 SVG |
| `hasAnyPerioData()` | 只要口腔中任意位置记录了任意牙周轴数据即为 `true`——用于驱动牙周导出的自动跳过逻辑，并在空白图表上禁用牙周导出菜单项 |
| `exportPerioSvg()` | 通过 `buildPerioSvg()` 从状态无头（headless）构建，将完整的牙周图表（牙齿图形 + 数值行 + 2017 年分类结果）下载为一份独立的矢量 SVG |
| `exportPerioImage(format)` | 将牙周图表下载为栅格化图像——`"png"` 或 `"jpg"` |
| `exportPdf(opts)` | 下载一份 jsPDF 原生生成的 PDF 报告（`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`，各区块均为可选）——矢量文字加栅格化的牙齿/牙周图表图像；只要没有任何牙齿记录备注，“个别备注”区块就会自动跳过；只要 `hasAnyPerioData()` 为 false，两个牙周区块也会自动跳过，二者均与 `opts` 设置无关 |
| `importFhirBundle(input)` | 导入由本模块生成的 FHIR R4 Bundle（对象或 JSON 字符串） |
| `setImportFormat(format)` | 设置下一次文件导入所用的解析器——`"status"` 或 `"fhir"` |
| `startIntroTour()` | 启动 18 步交互式新手导览 |

### 💾 状态持久化（localStorage）

为牙位图案例状态提供的可选 `localStorage` 持久化功能（`src/persistence.ts`，从包入口重新导出）。默认关闭——除非宿主应用显式启用，否则不影响现有集成；应在牙位图挂载**之后**调用（恢复操作会通过 `importStatus()` 重绘实时 DOM）：

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // 默认值："react-advanced-odontogram"
  includePlan: true,          // 是否同时持久化计划图表；默认：false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| 函数 | 说明 |
|---|---|
| `enablePersistence(options?)` | 通过 `importStatus()` 恢复此前保存的案例（如果存在），随后在每次状态变化时将状态图表保存到 `localStorage`。幂等——再次调用会替换之前的订阅/选项。**必须在牙位图挂载之后调用。** |
| `disablePersistence()` | 停止持久化；已保存的条目保留不变。 |
| `clearPersistedState()` | 移除当前（或默认）键对应的已保存条目。 |
| `isPersistenceEnabled()` | 当状态变化订阅处于激活状态时为 `true`。 |

**`PersistenceOptions`：**

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | `localStorage` 的键名。 |
| `includePlan` | `boolean` | `false` | 是否同时持久化计划图表（数据中的 `plan` 字段）。 |
| `onError` | `(err: Error) => void` | — | 出现任何存储/解析错误时调用，用于替代 `console.warn`。 |

说明：除非调用 `enablePersistence()`，否则不会对 `localStorage` 进行任何读写；当序列化后的数据超过 4 MB 容量上限时会跳过保存（并通过 `onError`/`console.warn` 上报），而不会抛出异常；任何存储/JSON 相关的失败——例如超出配额、受限的 iframe 环境、已损坏或无法识别的存储数据等——都会被捕获并上报。该模块永远不会抛出异常。

说明：启用持久化会通过 `importStatus()` 恢复已保存的病例，这会替换当前病例——如果已保存的数据中没有计划图表，也会替换正在进行中的计划图表。请在启动时（挂载牙位图后立即）启用持久化，而不要在会话中途启用。

说明：持久化的数据可能以明文形式在 `localStorage` 中包含患者身份信息（患者姓名、检查日期）。如果您在牙位图中记录了此类数据，请确保设备级别的保护，或在适当时使用 `clearPersistedState()` 将其清除。

### 💾 状态导出/导入格式
导出会生成一个 JSON 文件（版本 `2.22`；导入同时也接受旧版 `1.4` 及 `2.0` 至 `2.21`，并自动迁移），其中包含：

**全局字段：**
- `wisdomVisible` - 智齿是否可见
- `showBase` - 骨组织层是否可见
- `occlusalVisible` - 咬合面视图是否激活
- `showHealthyPulp` - 健康牙髓是否可见
- `edentulous` - 无牙颌模式是否激活

**按牙位字段（共 32 颗牙）：**
- `toothSelection` - 基本牙齿类型
- `toothSubstrate` - 牙体基质（天然/残根/折断/已预备冠），与任何修复体正交
- `restorationType` - 修复体类型（none/crown/inlay/onlay/veneer/bridge）
- `restorationMaterial` - 修复体材料（emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary），与 `restorationType` 成对
- `prosthesis` - 可摘/附着体轴（none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full），与 crown/bridge 类型的固定 `restorationType` 互斥
- `crownLeakage` - 牙冠边缘微渗漏标志，仅在 `restorationType` 为 crown 或 bridge 时有意义
- `endo` - 根管治疗状态；与 `pulpDx` 互斥（通过一个合并的“牙髓 / 根管状态”选择器共同呈现——对某颗牙进行根管治疗会将 `pulpDx` 规范化为 `normal`）
- `mods` - 修饰项数组（inflammation、parodontal）；`inflammation` 在现有牙齿的界面上已退役（此处由 `apicalDx` 驱动图标），但对缺失/拔牙创牙位仍然适用
- `caries` - 当前有龋齿的牙面
- `cariesActiveDepth` - 应用新牙面时龋齿深度选择器所暂存的 ICDAS 深度值（并非按牙面存储的数值；按牙面存储的字段见 `cariesSeverity`）
- `rootCaries` - 根面龋严重度（none/active/arrested/active-cavitated）
- `cariesSeverity` - 统一的按牙面严重度（0-6）：原发（未充填）牙面按 ICDAS 深度解读，继发（已充填）牙面按 CARS 评分解读
- `radiographicDepth` - 按牙面记录的影像学龋损深度（none/E1/E2/D1/D2/D3），独立于视觉上的 ICDAS/CARS 量表
- `fillingMaterial` - 充填材料
- `fillingSurfaces` - 已充填的牙面
- `fillingSurfaceMaterials` - 按牙面记录的充填材料（混合充填，例如颊侧银汞合金 + 远中复合树脂）
- `fillingDefect` - 按牙面记录的充填缺陷（none/marginal/fracture/wear），限定于已充填牙面，独立于继发龋
- `pulpDx` - AAE 牙髓诊断（normal/reversible-pulpitis/irreversible-pulpitis/necrosis）；可复性牙髓炎渲染为简化图标
- `pulpLatin` - 实用拉丁文牙髓亚型（仅当 `pulpDetailLevel` 为 `latin` 时由牙髓选择器显示）
- `apicalDx` - 驱动根尖周图标的根尖诊断
- `periapicalType` - 根尖病损亚型（none/granuloma/cyst），仅在有症状/无症状根尖周炎下显示；导入时仍接受旧版 `abscess` 值
- `resorptionType` - 牙根吸收类型（none/internal/external-cervical）
- `periImplant` - 仅限种植体的种植体周状态（none/mucositis/peri-implantitis-mild/-moderate/-severe），采用 2018 年世界研讨会分期标准
- `dxOverrides` - 按牙位的诊断编码覆盖项（版本 2.21）：一个以 ICD-10 诊断键为索引的对象，映射到 `add` | `suppress`，即使没有匹配的临床发现也强制开启某个编码诊断，或即使存在匹配发现也将其强制关闭；决定最终导出为 FHIR `Condition` 的有效编码集合
- `endoResection` - 根尖切除标志
- `fissureSealing` - 窝沟封闭标志
- `calculus` - 牙石标志
- `contactMesial` - 近中接触点丧失
- `contactDistal` - 远中接触点丧失
- `wearEdge` - 切端/咬合面磨耗类型（none/attrition/erosion）
- `wearCervical` - 颈部磨耗类型（none/abrasion/abfraction/erosion）
- `discoloration` - 按牙齿记录的变色病因（none/tetracycline/fluorosis/nonvital/extrinsic/other），对无修复体的天然恒牙/乳牙牙冠着色
- `orthoAppliance` - 正畸矫治器（none/bracket/band）
- `orthoDrift` - 正畸移位（none/mesial/distal）
- `orthoVertical` - 正畸垂直移动（none/extrusion/intrusion）
- `orthoRotation` - 正畸扭转标志
- `brokenMesial`、`brokenIncisal`、`brokenDistal` - 折断部位
- `extractionWound` - 拔牙创
- `extractionPlan` - 拔牙计划
- `parapulpalPin` - 髓旁钉标志
- `bridgePillar` - 桥基牙
- `mobility` - 松动度分级（none/m1/m2/m3）
- `crownNeeded` - 需要牙冠指示项
- `crownReplace` - 需要更换牙冠指示项
- `missingClosed` - 拔牙后间隙已关闭
- `customStates` - 插件自定义状态（对象，按插件 ID 索引）
- `note` - 每颗牙齿的文字备注（字符串，可选——仅在非空时存在）

**顶层 `plan` 字段（版本 2.11+）：**
- `plan` - 可选对象，结构与 `teeth`（上述按牙位字段）相同，保存**计划**（拟定治疗后）图表。仅当计划图表已被初始化（`Status | Plan` 切换开关至少切换到过“计划”一次）**且**其内容与现状图表不同时才会出现——纯现状导出会完全省略此字段，除版本号外与 2.11 之前的导出保持逐字节一致。导入时，若 `plan` 字段缺失，则会清除/取消初始化计划图表（绝不会复活导入前遗留的旧计划）；若 `plan` 字段存在，则在恢复现状图表的同时一并恢复计划图表。计划图表也可以通过 `getPlanChart()`/`setPlanChart()`（见上文“公共 API”）独立于导入/导出进行读写，而 `getStatusChart()` 始终返回以现状为主的数据，与当前激活哪个图表模式无关。

**顶层 `case` 字段（版本 2.17+，在 2.18、2.19、2.20 和 2.22 中扩展）：**
- `case` - 可选对象，保存病例级（非按牙位）元数据，由现状图表和计划图表共享（与顶层的 `globals` 键类似）。空值省略：当所有字段均为默认值时该字段完全不出现，因此无病例数据的导出除版本号外保持逐字节一致。各字段（在默认值时均被省略）：`age`（年龄）；`smokingStatus`（吸烟状况，+ `cigarettesPerDay`）；`diabetesStatus`（糖尿病状况，+ `hba1c`）；`toothLossPerio`（牙周炎致失牙数）；`maxRblPercent`（最大影像学骨吸收百分比）；2017 年分类的四个按轴临床医生覆盖值 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride`；以及（版本 2.19）`patientName` / `examDate`；以及（版本 2.20）`patientDob`；以及（版本 2.22）`caseConditions`——病例/区域性诊断（错颌畸形与颞下颌关节紊乱 K07、口腔囊肿 K09、唾液腺疾病 K11、口炎与口腔黏膜疾病 K12/K13，以及牙弓层面的发育异常 K00），均映射到一个侧别（未指定 / 左侧 / 右侧 / 双侧）。该字段用于牙周分期/分级分类及 PDF 报告标题；通过 `getCaseMeta()` 及 `setCase*` 系列设置函数读写（见上文“公共 API”）。患者姓名、出生日期与检查日期仅为图表身份标识元数据——**不**属于 FHIR 导出的一部分。

### 🖨️ 导出
`exportFhir()` 生成的 Bundle 符合 HL7 校验器要求：每个条目都带有确定性的 `id` 和绝对 `fullUrl`（不使用 `urn:uuid` 占位符），且 Bundle 内嵌了引擎自身的 CodeSystem 以便校验时正确解析其本地编码（该 CodeSystem 同时以 `fhir/CodeSystem-odontogram.json` 的形式发布在代码仓库中；可通过 `includeCodeSystem: false` 省略）。

除了牙位图自身的状态 JSON / FHIR / PNG / JPG / SVG 导出外，**牙周图表**还拥有自己的一套导出路径：
- **牙周图 SVG/PNG/JPG：** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` 将完整的牙周图表（牙齿图形 + 数值行 + 2017 年分类结果）渲染为一份独立的矢量 SVG（`buildPerioSvg()`），不依赖已挂载的 `PerioChart` DOM。只要 `hasAnyPerioData()` 为 false（空白图表没有可导出的牙周数据），这三个导出菜单项就会被禁用。
- **PDF 报告：** 导出菜单中的“PDF report…”（PDF 报告……）项会先打开 `ExportOptionsModal`——一个设置弹窗（患者姓名 + 出生日期 + 检查日期字段，直接绑定到病例元数据，检查日期默认为当天；区块复选框：患者数据、牙位图、牙位图说明、个别备注——未有任何牙齿记录备注时禁用——牙周状态、牙周描述），然后再调用 `exportPdf(opts)`。身份信息字段留空时会回退为占位符（“John Doe” / “1980-01-01”），确保导出始终成功。该 PDF 采用 jsPDF 原生方式组装——矢量文字通过 `.text()`，栅格化的牙齿/牙周图表图像通过 `.addImage()`——**不依赖 svg2pdf.js**。当没有任何牙齿记录备注时，“个别备注”区块会自动跳过；只要 `hasAnyPerioData()` 为 false，两个牙周区块也会自动跳过，二者均与弹窗中的复选框状态无关。
- **mPI/mBI 种植体限定：** 种植体周 Mombelli 指数（mPI/mBI）仅在包含至少一颗种植牙的牙弓中作为行渲染——无论是在实时牙周图表还是 SVG/PDF 导出中均如此。
- 患者姓名、出生日期与检查日期仅为图表身份标识元数据（数据版本 `2.20`，附加字段）——**不**属于 FHIR 导出的一部分。

### 📁 目录结构
- `src/App.tsx` - 外壳界面、顶部工具栏控件、语言/编号/深色模式/主题/插件切换器
- `src/odontogram.ts` - SVG 分层渲染引擎、牙齿状态管理、触控交互、插件叠加层、界面接线逻辑
- `src/plugin.ts` - `OdontogramPlugin` 类型、`PluginLayer`、`getQuadrant()`、`LAYER_Z` 层级优先级
- `src/theme.ts` - `OdontogramThemeConfig` 类型及 `applyThemeConfig()` 工具函数
- `src/status_extras.ts` - 34 种预定义修复体模板（桥、义齿、杆卡结构）
- `src/i18n/` - 翻译文件（HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR）及国际化 hook
- `src/utils/numbering.ts` - FDI、通用编号法、Palmer 编号转换
- `src/registry/` - 声明式临床轴注册表：FHIR 字段映射、SVG 清除集/布尔标志激活、修复体类型×材料矩阵、界面选项列表（生成导出/导入、FHIR 及选择器界面的单一数据来源）
- `src/fhir/` - HL7 FHIR R4 导出/导入：`toFhir.ts`/`fromFhir.ts`、代码系统、字段映射、基础类型
- `src/bridgeOverlay.ts` - 多牙位桥跨越连接体叠加层（感知牙弓形态的桥体几何）
- `src/SettingsModal.tsx` - 带标签页的设置弹窗（常规/面板/牙齿详情/龋齿/牙髓/备注/牙周）
- `src/perioExport.ts` - `buildPerioSvg()`：将完整牙周图表构建为一份独立的矢量 SVG
- `src/perioPdf.ts` - `exportPdf()` 的纯 jsPDF 报告组装器（`assemblePdf`）
- `src/ExportOptionsModal.tsx` - “PDF report…”导出设置弹窗
- `src/__tests__/` + `src/registry/__tests__/` - 全面的 Vitest 自动化测试套件
- `src/assets/teeth-svgs/` - SVG 牙齿模板（6 个文件：切牙、尖牙、前磨牙、磨牙 + 咬合面视图）
- `src/assets/icon-svgs/` - 工具栏图标 SVG（5 个文件）

### ⚙️ 技术栈
- React 18 + Vite + TypeScript
- Tailwind CSS 用于界面样式
- 通过 DOM 操作实现 SVG 分层渲染（出于性能考虑不使用 React 状态）
- 轻量级自研国际化系统
- Vitest + Testing Library 用于自动化测试
- TypeDoc 用于 API 文档生成
- Vite 路径别名：`@` 映射到 `./src`

### 📝 说明
- SVG 模板从 `src/assets/teeth-svgs` 和 `src/assets/icon-svgs` 加载，因此静态托管时必须提供 public 目录的访问。
- 牙位图引擎出于性能和简洁性考虑，使用自身内部状态（而非 React 状态）。
- 乳牙可用材料集合有所精简（不支持银汞合金充填，不支持基于桩钉的根管治疗）。
- 种植牙的牙冠/基台选项集合与天然牙不同。

### 🔒 安全说明

- **插件作为受信任代码运行。** 插件 `renderSvg()` 的返回值会被注入到实时图表的 SVG 中。该输出在插入前会经过 [DOMPurify](https://github.com/cure53/DOMPurify)（SVG 配置文件，含 `svgFilters`）净化——`<script>`、`<iframe>`、`<object>`、`<embed>` 及 `<foreignObject>` 一律被禁止，完全恶意的输出会被整体丢弃，而非部分渲染。此举降低了因插件被攻破或存在缺陷而带来的影响范围，但插件仍应仅从可信来源加载——净化是一道安全防线，而非审查把关的替代品。
- **内容安全策略（CSP）。** 演示站点的**生产构建**会通过 `<meta http-equiv="Content-Security-Policy">` 标签注入以下策略（开发服务器不受影响）：

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  嵌入 `OdontogramShell` 的宿主应用应根据自身部署环境设置相应的 CSP——本组件作为库使用时不会自行注入 CSP。

### 📖 如何引用

如果您在工作中使用了本模块，请引用它。

**本版本（v2.4.0）：**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**所有版本（概念 DOI）：** https://doi.org/10.5281/zenodo.21156787

> 上述概念 DOI 始终指向最新归档的发布版本；每次在 Zenodo 上归档发布时，
> 都会为该版本铸造一个版本专属 DOI。在 v2.4.0 被归档之前，请使用概念 DOI 进行引用。

机器可读的引用元数据位于 [`CITATION.cff`](../CITATION.cff)。

## 🙌 致谢

React Advanced Odontogram 由 Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)) 创建和维护，他是整个引擎的创造者和主要开发者。并得到下列贡献者的宝贵帮助。感谢所有做出贡献的人。

**贡献者**

- [@odontodev](https://github.com/odontodev): 状态注水和生命周期 API，作为受控 props 的充填设置，幂等的 setter 以及可折叠卡片
- [@JulianoBazzi](https://github.com/JulianoBazzi): 巴西葡萄牙语翻译
- [@yassine-bhn](https://github.com/yassine-bhn): 法语翻译以及提议的测量解剖结构
- [@saegerdirk-star](https://github.com/saegerdirk-star): 测量的牙齿解剖结构和牙齿生成器，以及可组合接口的提案

**基于** [jsPDF](https://github.com/parallax/jsPDF)、[DOMPurify](https://github.com/cure53/DOMPurify)、[React](https://react.dev)、[Vite](https://vite.dev)、[TypeScript](https://www.typescriptlang.org) 和 [Tailwind CSS](https://tailwindcss.com) 构建。

欢迎贡献。在 GitHub 上开启一个 pull request，您的名字就会被记入此处。如果本项目对您有用，请[在 GitHub 上给它点亮星标](https://github.com/ZoliQua/React-Odontogram-Modul)。
