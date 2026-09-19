// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3d — the declarative Fillings card BODY. Replaces the
// former imperative `wireControls()` fillings block + its
// `syncControlsFromState()` counterpart: it subscribes to engine state
// (`useEngineState(getActiveFillings)`), renders the material select, the 5-cell
// surface cross (via the shared `<SurfaceCross>`) with its TWO per-cell
// indicators — a RIGHT-side `.surf-depth` recurrent-caries affordance and a
// LEFT-side `.surf-defect` structural-defect affordance — the simple/complex
// swap (`#fillingSimpleRow`/`#fillingSimpleDefectRow` instead of the grid when
// `fillingComplexity === "simple"`), the fissure-sealing toggle, and the two
// whole-selection summary lines, all as controlled inputs, and writes through
// the `setFilling*ForSelection`/`setFissureSealingForSelection` setters — which
// wrap the exact `applyToSelected(...)` closures the imperative handlers used,
// so behavior is identical.
//
// The `.surf-depth` indicator keeps the SAME markup
// `syncFillingSubcariesIndicator()` produced (neutral 3-bar affordance, or the
// CARS `.has-subcaries` badge/bars when the filled surface also carries caries);
// clicking it opens the shared (still-imperative) caries-depth popup via
// `openCariesDepthPopup()`. The `.surf-defect` indicator keeps the markup
// `syncFillingDefectIndicator()` produced (a single `<i>` bar, `.has-defect` +
// `data-defect` when set); clicking it opens the filling-defect popup via
// `openFillingDefectPopup()`, gated on the `fillingDefectEnabled` setting.
//
// The `.card#fillingSection` wrapper, `.card-title`, and `#btnToggleFillingCard`
// collapse toggle stay STATIC in `ToothControlsSurface`; this card only owns the
// body — and it drives the section's `hidden` visibility gate
// (`fillingSectionVisible`) via a layout effect on its nearest `#fillingSection`
// ancestor, since the section element itself is static (mirrors `CariesCard`).

import { useLayoutEffect, useRef } from "react";
import { t } from "../../i18n/useI18n";
import {
  getActiveFillings,
  setFillingMaterialForSelection,
  setFillingSurfaceForSelection,
  setFillingSimpleToggleForSelection,
  setFillingSimpleDefectForSelection,
  setFissureSealingForSelection,
  openCariesDepthPopup,
  openFillingDefectPopup,
  getFillingDefectEnabled,
  getReadOnly,
} from "../../odontogram";
import { useEngineState } from "../useEngineState";
import SurfaceCross, { type SurfaceCell } from "./SurfaceCross";

export default function FillingsCard() {
  const fillings = useEngineState(getActiveFillings);
  const rootRef = useRef<HTMLDivElement>(null);

  // The #fillingSection visibility gate lived on the section element in the
  // imperative sync; the section stays static (shared collapse infra), so apply
  // its `hidden` class here. Run on EVERY render (no dep array) so a parent
  // re-render that reconciles the section's className back to "card" is
  // immediately re-corrected (mirrors CariesCard's #cariesSection layout effect).
  useLayoutEffect(() => {
    const section = rootRef.current?.closest("#fillingSection");
    section?.classList.toggle("hidden", !fillings.fillingSectionVisible);
  });

  const cells: SurfaceCell[] = fillings.surfaces.map((s) => ({
    value: s.value,
    pos: s.pos,
    letter: s.letter,
    label: s.label,
    labelId: s.labelId,
    checked: s.checked,
    disabled: false,
    attrs: { "data-material": s.material },
    onToggle: (checked) => setFillingSurfaceForSelection(s.surface, checked),
    indicators: [
      // LEFT-side structural filling-defect indicator (single `<i>` bar).
      {
        key: "surf-defect",
        className: s.hasDefect ? "surf-defect has-defect" : "surf-defect",
        title: t("fillingDefect.label"),
        side: "left" as const,
        attrs: s.hasDefect && s.defectValue ? { "data-defect": s.defectValue } : {},
        children: <i />,
        onClick: (anchor: HTMLElement) => {
          // Same guard the imperative indicator handler used.
          if (!s.checked || getReadOnly() || !getFillingDefectEnabled()) return;
          openFillingDefectPopup(s.surface, anchor);
        },
      },
      // RIGHT-side recurrent-caries indicator (CARS badge/bars when the filled
      // surface also has caries, else a neutral 3-bar affordance).
      {
        key: "surf-depth",
        className: s.hasSubcaries
          ? (s.isIcdas ? "surf-depth has-subcaries icdas" : "surf-depth has-subcaries")
          : "surf-depth",
        title: t("caries.recurrentHint"),
        side: "right" as const,
        attrs: s.hasSubcaries
          ? { "data-depth": s.subDepth, "data-icdas": String(s.subIcdas) }
          : {},
        children: s.hasSubcaries && s.isIcdas ? String(s.subIcdas) : <><i /><i /><i /></>,
        onClick: (anchor: HTMLElement) => {
          // Same guard the imperative indicator handler used.
          if (!s.checked || getReadOnly()) return;
          openCariesDepthPopup(s.surface, anchor);
        },
      },
    ],
  }));

  return (
    <>
      <div className="row" ref={rootRef}>
        <span>{t("filling.typeLabel")}</span>
        <select
          id="fillingSelect"
          value={fillings.fillingMaterial}
          onChange={(e) => setFillingMaterialForSelection(e.target.value)}
        >
          {fillings.fillingOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div
        id="fillingSurfaceChecks"
        className={[fillings.surfaceGridVisible ? null : "hidden", fillings.defectDisabled ? "defect-disabled" : null].filter(Boolean).join(" ")}
      >
        <SurfaceCross cells={cells} />
      </div>
      {/* "simple" complexity: one filled/not-filled toggle shown instead of the
          5-surface grid (the simple/grid swap). */}
      <label id="fillingSimpleRow" className={fillings.simpleRowVisible ? "row fissure-row" : "row fissure-row hidden"}>
        <input
          type="checkbox"
          id="fillingSimpleToggle"
          checked={fillings.simpleToggleChecked}
          onChange={(e) => setFillingSimpleToggleForSelection(e.target.checked)}
        />
        <span>{t("filling.simpleToggle")}</span>
      </label>
      {/* When the filling-defect feature is on, a defect select applies a defect
          to ALL filled surfaces (simple mode has no per-surface cells). */}
      <div id="fillingSimpleDefectRow" className={fillings.simpleDefectRowVisible ? "row" : "row hidden"}>
        <span>{t("fillingDefect.label")}</span>
        <select
          id="fillingSimpleDefectSelect"
          value={fillings.simpleDefectValue}
          onChange={(e) => setFillingSimpleDefectForSelection(e.target.value)}
        >
          {fillings.simpleDefectOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <label id="fissureSealingRow" className={fillings.fissureRowVisible ? "row fissure-row" : "row fissure-row hidden"}>
        <input
          type="checkbox"
          id="fissureSealing"
          checked={fillings.fissureSealing}
          onChange={(e) => setFissureSealingForSelection(e.target.checked)}
        />
        <span>{t("filling.fissureSealing")}</span>
      </label>
      <div id="fillingSubcariesSummary" className={fillings.subcariesSummary ? "hint" : "hint hidden"}>{fillings.subcariesSummary}</div>
      <div id="fillingDefectSummary" className={fillings.defectSummary ? "hint" : "hint hidden"}>{fillings.defectSummary}</div>
    </>
  );
}
