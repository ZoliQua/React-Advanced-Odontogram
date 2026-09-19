// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3 — the declarative `#orthoCard`. Replaces the former
// imperative `wireControls()`/`syncControlsFromState()` `#orthoCard` block: it
// subscribes to engine state (`useEngineState(getActiveOrtho)`), renders the
// three ortho selects + the rotation toggle from the shared option getters as
// controlled inputs, and writes through the `setOrtho*ForSelection` setters —
// which wrap the exact same `applyToSelected(...)` closures the imperative
// handlers used, so behavior is identical. Same DOM ids/classes/markup as the
// static shell (so id-based tests and host CSS keep resolving); it is hidden via
// the same class-based hide the sync used (`getActiveOrtho().visible`), keeping
// `#orthoCard` in the DOM either way.

import { t } from "../../i18n/useI18n";
import {
  getActiveOrtho,
  getOrthoApplianceOptions,
  getOrthoDriftOptions,
  getOrthoVerticalOptions,
  setOrthoApplianceForSelection,
  setOrthoDriftForSelection,
  setOrthoVerticalForSelection,
  setOrthoRotationForSelection,
} from "../../odontogram";
import { useEngineState } from "../useEngineState";

export default function OrthodonticsCard() {
  const ortho = useEngineState(getActiveOrtho);
  // Match the sync's class-based hide: hidden only when there IS an active tooth
  // whose selection fails `orthoAllowed` (no active tooth → card shown, same as
  // the pre-Tier-3 static shell before any sync ran).
  const hidden = ortho ? !ortho.visible : false;
  const appliance = ortho?.appliance ?? "none";
  const drift = ortho?.drift ?? "none";
  const vertical = ortho?.vertical ?? "none";
  const rotation = ortho?.rotation ?? false;

  return (
    <section id="orthoCard" className={hidden ? "card hidden" : "card"}>
      <div className="card-title card-title-row">
        <span>{t("toothInfo.orthodontics")}</span>
      </div>
      <div id="orthoApplianceRow" className="row">
        <span>{t("ortho.appliance.label")}</span>
        <select
          id="orthoApplianceSelect"
          value={appliance}
          onChange={(e) => setOrthoApplianceForSelection(e.target.value)}
        >
          {getOrthoApplianceOptions().map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div id="orthoDriftRow" className="row">
        <span>{t("ortho.drift.label")}</span>
        <select
          id="orthoDriftSelect"
          value={drift}
          onChange={(e) => setOrthoDriftForSelection(e.target.value)}
        >
          {getOrthoDriftOptions().map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div id="orthoVerticalRow" className="row">
        <span>{t("ortho.vertical.label")}</span>
        <select
          id="orthoVerticalSelect"
          value={vertical}
          onChange={(e) => setOrthoVerticalForSelection(e.target.value)}
        >
          {getOrthoVerticalOptions().map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <label id="orthoRotationRow" className="row inline-check">
        <input
          type="checkbox"
          id="orthoRotationToggle"
          checked={rotation}
          onChange={(e) => setOrthoRotationForSelection(e.target.checked)}
        />
        <span>{t("ortho.rotation.label")}</span>
      </label>
    </section>
  );
}
