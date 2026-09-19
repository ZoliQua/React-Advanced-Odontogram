// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3b — the declarative Statuses card BODY. Replaces the
// former imperative `wireControls()` Statuses block: the whole-mouth action
// buttons (#btnResetAll / #btnPrimaryDentition / #btnMixedDentition) call the
// engine wrappers directly, #btnEdentulous is a toggle whose `aria-pressed`
// comes from `useEngineState(getEdentulous)` (every engine path that flips
// `edentulous` fires `notifyStateChange()`, so this re-renders — replacing the
// six scattered `setToggleButton($("#btnEdentulous"), …)` imperative syncs), and
// the status-extra row renders its options from `getStatusExtras()` and applies
// the selected preset via `applyStatusExtra()`. The selected preset id is
// TRANSIENT local UI state (not tooth state). The `.card#statusCard` wrapper,
// `.card-title`, and the `#btnToggleStatusCard` collapse toggle stay STATIC in
// `ToothControlsSurface` (collapse is shared delegated infra, orthogonal to this
// card). Same DOM ids/classes/markup as the static shell.

import { useState } from "react";
import { t } from "../../i18n/useI18n";
import {
  getEdentulous,
  setEdentulous,
  resetMouth,
  applyPrimaryDentition,
  applyMixedDentition,
  getStatusExtras,
  applyStatusExtra,
} from "../../odontogram";
import { useEngineState } from "../useEngineState";

export default function StatusesCard() {
  const edentulous = useEngineState(getEdentulous);
  const statusExtras = getStatusExtras();
  const options = statusExtras.map((opt) => ({ value: opt.id, label: opt.label }));
  // Transient LOCAL selection for the status-extra dropdown — NOT tooth state.
  // Defaults to the first option, matching the imperative `setSelectOptions(...,
  // statusOptions[0]?.value)` the removed `wireControls()` block used.
  const [selected, setSelected] = useState<string>(options[0]?.value ?? "");
  const applySelected = () => {
    const option = statusExtras.find((o) => o.id === selected);
    applyStatusExtra(option);
  };

  return (
    <>
      <div className="row status-actions" id="statusCardBody">
        <button id="btnResetAll" className="btn btn-ghost btn-sm" onClick={() => resetMouth()}>{t("status.resetAll")}</button>
        <button id="btnPrimaryDentition" className="btn btn-ghost btn-sm" onClick={() => applyPrimaryDentition()}>{t("status.primaryDentition")}</button>
        <button id="btnMixedDentition" className="btn btn-ghost btn-sm" onClick={() => applyMixedDentition()}>{t("status.mixedDentition")}</button>
        <button
          id="btnEdentulous"
          className="btn btn-toggle btn-sm"
          aria-pressed={edentulous}
          onClick={() => setEdentulous(!edentulous)}
        >{t("status.edentulous")}</button>
      </div>
      <div className="row status-extra-row">
        <span>{t("status.extraLabel")}</span>
        <select id="statusExtraSelect" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button id="statusExtraApply" className="btn btn-ghost btn-sm" onClick={() => applySelected()}>{t("status.extraApply")}</button>
      </div>
    </>
  );
}
