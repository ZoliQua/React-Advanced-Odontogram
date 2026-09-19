// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Composable surface — the `<section className="chart">` region (chart header,
// Status|Plan toggle, chart actions, and the `#toothGrid` mount node the engine
// wires imperatively). Presentational: it reads everything from
// `useOdontogramUi()` and holds no state of its own.

import { type CSSProperties, useEffect } from "react";
import { useOdontogramUi } from "../OdontogramContext";
import { rewireControls, rebuildGrid } from "../odontogram";
// Toolbar icons rendered as inline SVG (via `loadInlineIcon`, which parses the
// `data-icon-src` markup) are imported `?raw` so they inline into the JS bundle
// as strings — no runtime fetch. `iconNoSelectionUrl` is rendered as an
// `<img src>` instead, so it stays a URL import.
import icon8Svg from "../assets/icon-svgs/icon_8.svg?raw";
import iconGumSvg from "../assets/icon-svgs/icon_gum.svg?raw";
import iconNoSelectionUrl from "../assets/icon-svgs/icon_no_selection.svg";
import iconOcclSvg from "../assets/icon-svgs/icon_occl.svg?raw";
import iconPulpSvg from "../assets/icon-svgs/icon_pulp.svg?raw";

/** Parse a `#rgb`/`#rrggbb` hex colour to a CSS `"r,g,b"` channel string for
 *  `rgba(var(--odon-select-rgb), α)`. Falls back to the blue default on a
 *  malformed value. */
function hexToRgbCss(hex: string): string {
  let h = (hex || "").replace("#", "").trim();
  if(h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if(h.length !== 6 || !Number.isFinite(n)) return "59,123,255";
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export default function OdontogramChartSurface() {
  const {
    t,
    planModeAvailable,
    screenSpacing,
    screenNumberSize,
    selectionColor,
    selectionBorderStyle,
    toothAnatomy,
  } = useOdontogramUi();

  // Re-wire the chart-header controls whenever this surface (re)mounts, and also
  // when `planModeAvailable` flips (the #chartModeToggle is conditionally mounted
  // on it, so its buttons are fresh nodes each time it reappears). No-op before
  // init; acts only on later remounts / toggles.
  useEffect(() => { rewireControls(); }, [planModeAvailable]);
  // Rebuild the SVG grid whenever the chart column (re)mounts — e.g. returning
  // from the perio view, where the column is unmounted. No-op before init.
  useEffect(() => { void rebuildGrid(); }, []);

  return (
        <section className="chart">
          <div className="chart-header">
            <div>
              <div className="chart-title">{t("chart.title")}</div>
              <div className="chart-hint">{t("chart.hint")}</div>
            </div>
            {/* The Status|Plan toggle is unmounted when plan mode is turned off
                in Settings → Odontogram. Composable-UI Tier 2 made the click
                wiring re-runnable, so the toggle can remount cleanly (this
                surface re-runs rewireControls() on the planModeAvailable flip)
                instead of being hidden with a CSS class. */}
            {planModeAvailable && (
              <div id="chartModeToggle" className="chart-mode-toggle" role="tablist">
                <button id="chartModeStatus" type="button" className="chart-mode-btn is-active" role="tab" aria-selected="true">{t("chartMode.status")}</button>
                <button id="chartModePlan" type="button" className="chart-mode-btn" role="tab" aria-selected="false">{t("chartMode.plan")}</button>
                <span id="chartModePlanBadge" className="plan-badge hidden">{t("chartMode.planBadge")}</span>
              </div>
            )}
            {/* "dashed = proposed" legend. Always rendered — its visibility is
                pure CSS, scoped by the `.chart.plan-mode #proposedLegend`
                selector (src/index.css), which reuses the same `.plan-mode` cue
                the chart card gets from syncChartModeUi() in odontogram.ts.
                No new React state, no new engine call. */}
            <div id="proposedLegend" className="proposed-legend">
              <span className="proposed-legend-swatch" aria-hidden="true"></span>
              {t("chart.proposedLegend")}
            </div>
            <div className="chart-actions">
              <button id="btnOcclView" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.occlusal")} aria-label={t("chart.actions.occlusal")} data-icon-src={iconOcclSvg} data-xline="1"></button>
              <button id="btnWisdomVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.wisdom")} aria-label={t("chart.actions.wisdom")} data-icon-src={icon8Svg} data-xline="1"></button>
              <button id="btnBoneVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.bone")} aria-label={t("chart.actions.bone")} data-icon-src={iconGumSvg} data-xline="1"></button>
              <button id="btnPulpVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.pulp")} aria-label={t("chart.actions.pulp")} data-icon-src={iconPulpSvg} data-xline="1"></button>
              <button id="btnSelectNoneChart" className="btn btn-ghost btn-icon" title={t("chart.actions.clearSelection")} aria-label={t("chart.actions.clearSelection")}>
                <img className="icon-img" src={iconNoSelectionUrl} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* `data-anatomy` is emitted ONLY for the measured profile so the
              classic shell-DOM golden stays byte-identical (classic renders no
              data-anatomy attribute at all). The measured CSS keys off it. */}
          <div
            id="toothGrid"
            className="tooth-grid"
            dir="ltr"
            data-screen-spacing={screenSpacing}
            data-tooth-num={screenNumberSize}
            data-anatomy={toothAnatomy === "measured" ? "measured" : undefined}
            style={{
              "--odon-select-rgb": hexToRgbCss(selectionColor),
              "--odon-select-border-style": selectionBorderStyle,
            } as CSSProperties}
            aria-label={t("chart.aria.toothGrid")}
          ></div>
        </section>
  );
}
