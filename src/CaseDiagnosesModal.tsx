// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { getCaseConditions, setCaseCondition, getReadOnly, onStateChange } from "./odontogram";
import { CASE_DX_CODES, type CaseConditionKey, type Laterality } from "./dx/caseCodes";

/** Translation function signature (subset of `useI18n`'s `t`). */
type TFn = (key: string, params?: Record<string, string | number>) => string;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type CaseConditionsData = ReturnType<typeof getCaseConditions>;

/**
 * The "Case / regional diagnoses" pop-up. Moved out of the perio-status sidebar
 * (`PerioSidebar`) into its own dialog, opened from the "Diagnoses" button next
 * to the Odontogram / Periodontal-status view toggle. Mirrors {@link CreditsModal}'s
 * dialog contract: `role="dialog"` + `aria-modal`, Escape closes, backdrop click
 * closes, focus is trapped while open and returned to the opener on close.
 *
 * Owns its own `caseConds` state + a single `onStateChange` subscription (like
 * `PerioSidebar` did), so it stays live while open. Rows are code-first and
 * code-sorted (`getCaseConditions` sorts by ICD-10); the add-picker options are
 * code-first (`{icd10} {label}`) and code-sorted too.
 */
export default function CaseDiagnosesModal({
  open,
  t,
  onClose,
}: {
  open: boolean;
  t: TFn;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [caseConds, setCaseConds] = useState<CaseConditionsData>([]);

  // Subscribe only while open — no engine reads (getCaseConditions/onStateChange)
  // when the dialog is closed, so a host that mounts the modal closed (and any
  // partial-mock test) never touches those setters.
  useEffect(() => {
    if (!open) return;
    setCaseConds(getCaseConditions());
    return onStateChange(() => setCaseConds(getCaseConditions()));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();
    return () => {
      openerRef.current?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    },
    [onClose],
  );

  if (!open) return null;

  const readOnly = getReadOnly();
  const addable = (Object.keys(CASE_DX_CODES) as CaseConditionKey[])
    .filter((k) => !caseConds.some((c) => c.key === k))
    .map((k) => ({ key: k, icd10: CASE_DX_CODES[k].icd10 }))
    .sort((a, b) => a.icd10.localeCompare(b.icd10));

  return (
    <div
      className="odon-confirm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="caseDiagnosesModal"
        ref={dialogRef}
        className="odon-credits-modal odon-casedx-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <button type="button" className="odon-settings-close" onClick={onClose} aria-label={t("case.diagnoses.close")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <h2 className="odon-credits-title" id={titleId}>{t("case.diagnoses.section")}</h2>

        <div id="caseDiagnosesSection" className="case-diagnoses odon-casedx-body">
          {caseConds.map((c) => (
            <div className="case-diagnoses-row dx-row" key={c.key}>
              <span className="dx-name">
                {c.icd10 ? <span className="dx-code">{c.icd10}</span> : null}
                <span className="dx-label">{t(`dx.case.${c.key}`)}</span>
              </span>
              {c.lateralizable && (
                <select
                  value={c.laterality}
                  disabled={readOnly}
                  onChange={(e) => setCaseCondition(c.key, e.target.value as Laterality)}
                >
                  {(["unspecified", "left", "right", "bilateral"] as Laterality[]).map((l) => (
                    <option key={l} value={l}>{t(`caseDx.laterality.${l}`)}</option>
                  ))}
                </select>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-danger dx-delete case-dx-remove"
                disabled={readOnly}
                aria-label={t("case.diagnoses.remove")}
                title={t("case.diagnoses.remove")}
                onClick={() => setCaseCondition(c.key, null)}
              >
                ×
              </button>
            </div>
          ))}
          <select
            id="caseDxAddSelect"
            value=""
            disabled={readOnly}
            onChange={(e) => { if (e.target.value) setCaseCondition(e.target.value, "unspecified"); }}
          >
            <option value="">{t("case.diagnoses.add")}</option>
            {addable.map(({ key, icd10 }) => (
              <option key={key} value={key}>{icd10 ? `${icd10} ${t(`dx.case.${key}`)}` : t(`dx.case.${key}`)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
