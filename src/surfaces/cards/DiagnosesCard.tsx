// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI DX-2 Task 4 — the declarative Diagnoses card BODY. Surfaces the
// active tooth's EFFECTIVE coded diagnoses (`getActiveDiagnoses`, DX-2 Task 3):
// one row per rule-derived key (whether or not currently suppressed) plus any
// explicitly `add`-mode key no rule derived, with an "add a diagnosis" picker
// over `addableKeys`. Follows `RootPeriodontiumCard`/`CariesCard` exactly — it
// subscribes to engine state via `useEngineState`, drives the section's `hidden`
// visibility (`#diagnosesSection`) via a layout effect on its nearest ancestor,
// since the section element itself stays static in `ToothControlsSurface`
// (shared collapse infra).
//
// Each row is three explicit parts: (1) the code-first text (`{icd10} {label}`,
// falling back to the label alone when a row has no code); (2) an EXCLUDE toggle
// (derived rows only) — an eye/eye-off icon button reflecting the suppressed
// state, toggling `setDxOverrideForSelection(key, "suppress"|null)` (keeps the
// glyph, drops the finding from the FHIR export); (3) a DELETE (×) button calling
// `removeDiagnosisFromSelection(key)`, which clears the underlying chart axis so
// the diagnosis AND its glyph are removed. The add `<select id="dxAddSelect">` is
// a controlled component pinned to the empty placeholder (`diagnoses.add`) — its
// options render code-first too, and selecting one of `addableKeys` calls
// `addDiagnosisToSelection` (writes the underlying chart axis through the
// repainting apply path); it snaps back to the placeholder on the next render.

import { useLayoutEffect, useRef } from "react";
import { t } from "../../i18n/useI18n";
import { getActiveDiagnoses, setDxOverrideForSelection, addDiagnosisToSelection, removeDiagnosisFromSelection } from "../../odontogram";
import { useEngineState } from "../useEngineState";

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
      <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" />
      <circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
      <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M4 4l12 12M8.2 8.3A2.4 2.4 0 0010 12.4M6 6.1C3.4 7.4 1.5 10 1.5 10s3 5.5 8.5 5.5c1.3 0 2.5-.3 3.5-.8M9 4.6c.3 0 .6-.1 1-.1 5.5 0 8.5 5.5 8.5 5.5s-.8 1.4-2.2 2.8" />
    </svg>
  );
}

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
          <div
            key={row.key}
            id={`dxRow-${row.key}`}
            className="row dx-row"
            data-source={row.source}
            data-suppressed={row.suppressed ? "true" : undefined}
          >
            <span className="dx-name">
              {row.icd10 ? <span className="dx-code">{row.icd10}</span> : null}
              <span className="dx-label">{t("dx." + row.key)}</span>
              {row.source === "added" ? <span className="pill dx-added-tag">{t("diagnoses.added")}</span> : null}
            </span>
            <span className="dx-actions">
              {row.source === "derived" ? (
                <button
                  type="button"
                  id={`dxSuppress-${row.key}`}
                  className={`btn btn-ghost btn-icon dx-exclude${row.suppressed ? " is-active" : ""}`}
                  aria-pressed={row.suppressed}
                  aria-label={t("diagnoses.suppress")}
                  title={row.suppressed ? t("diagnoses.includeHint") : t("diagnoses.excludeHint")}
                  onClick={() => setDxOverrideForSelection(row.key, row.suppressed ? null : "suppress")}
                >
                  {row.suppressed ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : null}
              <button
                type="button"
                id={`dxRemove-${row.key}`}
                className="btn btn-ghost btn-icon btn-danger dx-delete"
                aria-label={t("diagnoses.delete")}
                title={t("diagnoses.deleteHint")}
                onClick={() => removeDiagnosisFromSelection(row.key)}
              >
                ×
              </button>
            </span>
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
