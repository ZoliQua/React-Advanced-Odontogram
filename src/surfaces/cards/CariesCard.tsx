// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3c — the declarative Caries card BODY. Replaces the
// former imperative `wireControls()` caries block + its `syncControlsFromState()`
// counterpart: it subscribes to engine state (`useEngineState(getActiveCaries)`),
// renders the depth select, the 5-cell surface cross (via the shared
// `<SurfaceCross>`), the subcrown row, and the root-caries select as controlled
// inputs, and writes through the `setCaries*ForSelection` setters — which wrap
// the exact `applyToSelected(...)` closures the imperative handlers used, so
// behavior is identical. The per-surface `.surf-depth` severity indicator keeps
// the SAME markup (`data-depth`/`data-icdas`/`data-radio` + badge-or-bars) the
// imperative `syncSurfaceDepthIndicator()` produced; clicking it opens the
// existing (still-imperative) severity popup via `openCariesDepthPopup()`.
//
// The `#rootCariesSelect` shows the NON-collapsing `rootCariesDisplayValue`
// (folded into the getter) — never written back to state. Row visibility
// (`#cariesDepthRow`/`#rootCariesRow`) comes from the getter's flags. The
// `.card#cariesSection` wrapper, `.card-title`, and `#btnToggleCariesCard`
// collapse toggle stay STATIC in `ToothControlsSurface` (collapse is shared
// delegated infra); this card only owns the body — and it drives the section's
// `hidden` visibility gate (`cariesSectionVisible`) via a layout effect on its
// nearest `#cariesSection` ancestor, since the section element itself is static.

import { useLayoutEffect, useRef } from "react";
import { t } from "../../i18n/useI18n";
import {
  getActiveCaries,
  getCariesDepthOptions,
  rootCariesOptions,
  setCariesSurfaceForSelection,
  setCariesActiveDepthForSelection,
  setRootCariesForSelection,
  openCariesDepthPopup,
  getReadOnly,
} from "../../odontogram";
import { useEngineState } from "../useEngineState";
import SurfaceCross, { type SurfaceCell } from "./SurfaceCross";

export default function CariesCard() {
  const caries = useEngineState(getActiveCaries);
  const hintRef = useRef<HTMLDivElement>(null);

  // The #cariesSection visibility gate lived on the section element in the
  // imperative sync; the section stays static (shared collapse infra), so apply
  // its `hidden` class here. Run on EVERY render (no dep array) so a parent
  // re-render that reconciles the section's className back to "card" is
  // immediately re-corrected.
  useLayoutEffect(() => {
    const section = hintRef.current?.closest("#cariesSection");
    section?.classList.toggle("hidden", !caries.cariesSectionVisible);
  });

  const cells: SurfaceCell[] = caries.surfaces.map((s) => ({
    value: s.value,
    pos: s.pos,
    letter: s.letter,
    label: s.label,
    labelId: `lbl-${s.value}`,
    checked: s.checked,
    disabled: s.disabled,
    onToggle: (checked) => setCariesSurfaceForSelection(s.value, checked),
    indicators: [
      {
        key: "surf-depth",
        className: s.isIcdas ? "surf-depth icdas" : "surf-depth",
        title: t("caries.detailsHint"),
        side: "right" as const,
        attrs: {
          "data-depth": s.depth,
          "data-icdas": String(s.icdas),
          ...(s.radio ? { "data-radio": s.radio } : {}),
        },
        children: s.isIcdas ? String(s.icdas) : <><i /><i /><i /></>,
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
      <div className="hint" ref={hintRef}>{t("caries.hint")}</div>
      <div id="cariesDepthRow" className={caries.cariesDepthVisible ? "row" : "row hidden"}>
        <span>{t("caries.depthLabel")}</span>
        <select
          id="cariesDepthSelect"
          value={String(caries.cariesActiveDepth)}
          onChange={(e) => setCariesActiveDepthForSelection(Number(e.target.value))}
        >
          {getCariesDepthOptions().map((o) => (
            <option key={o.value} value={o.value} title={o.title}>{o.label}</option>
          ))}
        </select>
      </div>
      <div id="cariesChecks">
        <SurfaceCross cells={cells} />
      </div>
      <div id="cariesSubcrownRow" className="check-grid subcrown-row">
        <label style={caries.subcrownDisabled ? { display: "none" } : undefined}>
          <input
            type="checkbox"
            id="chk-caries-subcrown"
            value="caries-subcrown"
            checked={caries.subcrownChecked}
            disabled={caries.subcrownDisabled}
            onChange={(e) => setCariesSurfaceForSelection("caries-subcrown", e.target.checked)}
          />
          <span id="lbl-caries-subcrown">{caries.subcrownLabel}</span>
        </label>
      </div>
      <div id="rootCariesRow" className={caries.rootCariesVisible ? "row" : "row hidden"}>
        <span>{t("caries.rootLabel")}</span>
        <select
          id="rootCariesSelect"
          value={caries.rootCariesDisplay}
          onChange={(e) => setRootCariesForSelection(e.target.value)}
        >
          {rootCariesOptions().map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}
