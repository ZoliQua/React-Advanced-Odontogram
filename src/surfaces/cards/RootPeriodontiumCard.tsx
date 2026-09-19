// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3e — the declarative Root / periodontium card BODY.
// Replaces the former imperative `wireControls()` Root/perio block + its
// `syncControlsFromState()` counterpart: it subscribes to engine state
// (`useEngineState(getActiveRootPerio)`) and renders BOTH sub-blocks as
// controlled inputs —
//
//   #rpRootBlock: the merged pulp/endo optgroup select (`#pulpEndoSelect`, whose
//     two `<optgroup>`s + Plan-mode standalone "none" mirror `buildPulpEndoSelect`
//     exactly), the apical-diagnosis / periapical-lesion / root-resorption
//     selects, and the resection + parapulpal-pin checkboxes.
//   #rpPerioBlock: the mobility select, the still-imperative 6-site probing grid
//     (`#perioGrid` + `#perioReadout` — the Tier 3 PR 3e CARVE-OUT, rendered as
//     static empty containers and populated by `buildPerioGrid`/`syncPerioRow`),
//     the inflammation/parodontal mod checkboxes (`#modsChecks`, same ids/markup
//     the removed `buildChecks(MOD_OPTIONS)` emitted), the calculus toggle, and
//     the peri-implant status select.
//
// writing through the `set*ForSelection` setters — which wrap the exact
// `applyToSelected(...)` closures the imperative handlers used (incl. the
// pulp/endo endo↔pulpDx mutual exclusion and the apical→periapical reset), so
// behavior is identical.
//
// ALL row/sub-block visibility, the ordering-dependent mod-checkbox visibility
// (`syncInflammationModVisibility` after `syncPeriImplantVisibility`), the
// dynamic `#lbl-parodontal`/`#lbl-inflammation` label text, and every
// per-control `disabled` flag come pre-resolved from `getActiveRootPerio()`.
//
// The `.card#rootPeriodontiumSection` wrapper, `.card-title`, and
// `#btnToggleRootPeriodontiumCard` collapse toggle stay STATIC in
// `ToothControlsSurface`; this card only owns the body — and it drives the
// section's `hidden` visibility gate (`sectionVisible`) via a layout effect on
// its nearest `#rootPeriodontiumSection` ancestor, since the section element
// itself is static (mirrors `CariesCard`/`FillingsCard`).

import { useLayoutEffect, useRef } from "react";
import { t } from "../../i18n/useI18n";
import {
  getActiveRootPerio,
  setPulpEndoForSelection,
  setApicalDxForSelection,
  setPeriapicalTypeForSelection,
  setResorptionForSelection,
  setEndoResectionForSelection,
  setParapulpalPinForSelection,
  setMobilityForSelection,
  setModForSelection,
  setCalculusForSelection,
  setPeriImplantForSelection,
} from "../../odontogram";
import { useEngineState } from "../useEngineState";

export default function RootPeriodontiumCard() {
  const rp = useEngineState(getActiveRootPerio);
  const rootRef = useRef<HTMLDivElement>(null);

  // The #rootPeriodontiumSection visibility gate lived on the section element in
  // the imperative sync; the section stays static (shared collapse infra), so
  // apply its `hidden` class here. Run on EVERY render (no dep array) so a parent
  // re-render that reconciles the section's className back to "card" is
  // immediately re-corrected (mirrors CariesCard/FillingsCard).
  useLayoutEffect(() => {
    const section = rootRef.current?.closest("#rootPeriodontiumSection");
    section?.classList.toggle("hidden", !rp.sectionVisible);
  });

  return (
    <>
      <div id="rpRootBlock" ref={rootRef} className={rp.rootBlockVisible ? undefined : "hidden"}>
        <div className="hint">{t("endo.hint")}</div>
        <div id="pulpEndoRow" className="row">
          <span>{t("pulpEndo.label")}</span>
          <select
            id="pulpEndoSelect"
            value={rp.pulpEndoValue}
            disabled={rp.pulpEndoDisabled}
            onChange={(e) => setPulpEndoForSelection(e.target.value)}
          >
            {rp.pulpEndoNoneOption && (
              <option value={rp.pulpEndoNoneOption.value}>{rp.pulpEndoNoneOption.label}</option>
            )}
            {rp.pulpEndoGroups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div id="apicalDxRow" className={rp.apicalDxRowVisible ? "row" : "row hidden"}>
          <span>{t("apical.dxLabel")}</span>
          <select
            id="apicalDxSelect"
            value={rp.apicalDxValue}
            disabled={rp.apicalDxDisabled}
            onChange={(e) => setApicalDxForSelection(e.target.value)}
          >
            {rp.apicalDxOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div id="periapicalTypeRow" className={rp.periapicalRowVisible ? "row" : "row hidden"}>
          <span>{t("periapical.typeLabel")}</span>
          <select
            id="periapicalTypeSelect"
            value={rp.periapicalTypeValue}
            onChange={(e) => setPeriapicalTypeForSelection(e.target.value)}
          >
            {rp.periapicalTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div id="resorptionRow" className={rp.resorptionRowVisible ? "row" : "row hidden"}>
          <span>{t("root.resorption")}</span>
          <select
            id="resorptionSelect"
            value={rp.resorptionValue}
            disabled={rp.resorptionDisabled}
            onChange={(e) => setResorptionForSelection(e.target.value)}
          >
            {rp.resorptionOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="row inline-checks">
          <label style={rp.endoResectionDisabled ? { display: "none" } : undefined}>
            <input
              type="checkbox"
              id="endoResection"
              checked={rp.endoResectionChecked}
              disabled={rp.endoResectionDisabled}
              onChange={(e) => setEndoResectionForSelection(e.target.checked)}
            />
            <span>{t("endo.resection")}</span>
          </label>
          <label style={rp.parapulpalPinDisabled ? { display: "none" } : undefined}>
            <input
              type="checkbox"
              id="parapulpalPin"
              checked={rp.parapulpalPinChecked}
              disabled={rp.parapulpalPinDisabled}
              onChange={(e) => setParapulpalPinForSelection(e.target.checked)}
            />
            <span>{t("endo.parapulpalPin")}</span>
          </label>
        </div>
      </div>

      <div id="rpPerioBlock" className={rp.perioBlockVisible ? undefined : "hidden"}>
        <div id="mobilityRow" className={rp.mobilityRowVisible ? "row" : "row hidden"}>
          <span>{t("inflammation.mobilityLabel")}</span>
          <select
            id="mobilitySelect"
            value={rp.mobilityValue}
            disabled={rp.mobilityDisabled}
            onChange={(e) => setMobilityForSelection(e.target.value)}
          >
            {rp.mobilityOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        {/* The 6-site PD/GM/BOP/SUP probing grid + its derived read-out stay
            IMPERATIVE (Tier 3 PR 3e carve-out): rendered as static empty
            containers here, built by `buildPerioGrid` and synced by
            `syncPerioRow` in the engine — exactly as before. */}
        <div id="perioRow" className={rp.perioRowVisible ? "perio-block" : "perio-block hidden"}>
          <div className="perio-block-title">{t("perio.title")}</div>
          <div id="perioGrid" className="perio-grid"></div>
          <div id="perioReadout" className="hint perio-readout"></div>
        </div>
        <div id="modsChecks" className="check-grid">
          {rp.mods.map((m) => (
            <label
              key={m.value}
              className={m.hiddenClass ? "hidden" : undefined}
              style={m.styleHidden ? { display: "none" } : undefined}
            >
              <input
                type="checkbox"
                id={`chk-${m.value}`}
                value={m.value}
                checked={m.checked}
                disabled={m.disabled}
                onChange={(e) => setModForSelection(m.value, e.target.checked)}
              />
              <span id={`lbl-${m.value}`}>{m.label}</span>
            </label>
          ))}
        </div>
        <div id="calculusRow" className={rp.calculusRowVisible ? "row inline-checks" : "row inline-checks hidden"}>
          <label>
            <input
              type="checkbox"
              id="calculusToggle"
              checked={rp.calculusChecked}
              onChange={(e) => setCalculusForSelection(e.target.checked)}
            />
            <span>{t("calculus.label")}</span>
          </label>
        </div>
        <div id="periImplantRow" className={rp.periImplantRowVisible ? "row" : "row hidden"}>
          <span>{t("periImplant.label")}</span>
          <select
            id="periImplantSelect"
            value={rp.periImplantValue}
            onChange={(e) => setPeriImplantForSelection(e.target.value)}
          >
            {rp.periImplantOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
