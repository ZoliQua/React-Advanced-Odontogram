// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI DX-2 Task 4 — the declarative Diagnoses card BODY. Surfaces the
// active tooth's EFFECTIVE coded diagnoses (`getActiveDiagnoses`, DX-2 Task 3):
// one row per rule-derived key (whether or not currently suppressed) plus any
// explicitly `add`-mode key no rule derived, with an "add a diagnosis" picker
// over `addableKeys`. Follows `RootPeriodontiumCard`/`CariesCard` exactly — it
// subscribes to engine state via `useEngineState`, writes through the single
// `setDxOverrideForSelection(key, mode)` gate setter, and drives the section's
// `hidden` visibility (`#diagnosesSection`) via a layout effect on its nearest
// ancestor, since the section element itself stays static in
// `ToothControlsSurface` (shared collapse infra).
//
// A `derived` row shows a suppress checkbox (`diagnoses.suppress`) toggling the
// override between `"suppress"` and `null`. An `added` row shows a
// `diagnoses.added` tag + a remove button clearing the override (`null`). Both
// row kinds render CODE-FIRST — the ICD-10 code precedes the localized label
// (falling back to the label alone when a row has no code). The add
// `<select id="dxAddSelect">` is a controlled component pinned to the empty
// placeholder value (`diagnoses.add`) — its options render code-first too
// (task 2), and selecting one of `addableKeys` calls `addDiagnosisToSelection`
// (task 1), which writes the underlying chart axis directly (a real finding,
// through the repainting apply path) rather than `setDxOverrideForSelection`'s
// `"add"` override; the select still snaps straight back to the placeholder on
// the next render (no held selection to clear manually).

import { useLayoutEffect, useRef } from "react";
import { t } from "../../i18n/useI18n";
import { getActiveDiagnoses, setDxOverrideForSelection, addDiagnosisToSelection } from "../../odontogram";
import { useEngineState } from "../useEngineState";

export default function DiagnosesCard() {
  const dx = useEngineState(getActiveDiagnoses);
  const rowsRef = useRef<HTMLDivElement>(null);

  // The #diagnosesSection visibility gate lived on the section element in the
  // imperative sync equivalent; the section stays static (shared collapse
  // infra), so apply its `hidden` class here. Run on EVERY render (no dep
  // array) so a parent re-render that reconciles the section's className back
  // to "card" is immediately re-corrected (mirrors CariesCard/RootPeriodontiumCard).
  useLayoutEffect(() => {
    const section = rowsRef.current?.closest("#diagnosesSection");
    section?.classList.toggle("hidden", !dx.visible);
  });

  return (
    <>
      <div id="diagnosesRows" ref={rowsRef}>
        {dx.rows.map((row) => (
          <div key={row.key} id={`dxRow-${row.key}`} className="row" data-source={row.source}>
            {row.icd10 ? <span className="dx-code">{row.icd10}</span> : null}
            <span className="dx-label">{t("dx." + row.key)}</span>
            {row.source === "added" ? (
              <>
                <span className="pill dx-added-tag">{t("diagnoses.added")}</span>
                <button
                  type="button"
                  id={`dxRemove-${row.key}`}
                  className="btn btn-ghost btn-icon btn-danger"
                  title={t("diagnoses.added")}
                  aria-label={t("diagnoses.added")}
                  onClick={() => setDxOverrideForSelection(row.key, null)}
                >
                  ×
                </button>
              </>
            ) : (
              <label>
                <input
                  type="checkbox"
                  id={`dxSuppress-${row.key}`}
                  checked={row.suppressed}
                  onChange={() => setDxOverrideForSelection(row.key, row.suppressed ? null : "suppress")}
                />
                <span>{t("diagnoses.suppress")}</span>
              </label>
            )}
          </div>
        ))}
      </div>
      <div id="dxAddRow" className="row">
        <select
          id="dxAddSelect"
          value=""
          disabled={dx.addableKeys.length === 0}
          onChange={(e) => {
            const key = e.target.value;
            if (key) addDiagnosisToSelection(key);
          }}
        >
          <option value="">{t("diagnoses.add")}</option>
          {dx.addableKeys.map(({ key, icd10 }) => (
            <option key={key} value={key}>{icd10 ? `${icd10} ${t("dx." + key)}` : t("dx." + key)}</option>
          ))}
        </select>
      </div>
    </>
  );
}
