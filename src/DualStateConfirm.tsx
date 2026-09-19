// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useCallback, useEffect, useRef, useId } from "react";

/** Translation function signature (subset of `useI18n`'s `t`). */
type TFn = (key: string, params?: Record<string, string | number>) => string;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Blocking confirm dialog shown BEFORE a status-mode edit is applied to a tooth
 * the user has already planned (which would make the status chart diverge from
 * the plan). Mirrors {@link SettingsModal}'s dialog contract:
 *
 * - `role="dialog"` + `aria-modal`, labelled by its message; root id
 *   `#dualStateConfirm`.
 * - Esc cancels; backdrop click cancels; focus is trapped inside while open and
 *   returned to the opener element on close.
 * - Accept applies the divergent edit, cancel reverts the control. Both labels
 *   and the message come through `t`.
 *
 * The dialog owns no state — accept/cancel are driven entirely by the caller
 * (the odontogram module's deferred `apply`/`revert`), so the same instance can
 * back a single-tooth edit or a whole batch.
 */
export default function DualStateConfirm({
  open,
  t,
  onAccept,
  onCancel,
}: {
  open: boolean;
  t: TFn;
  onAccept: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Capture the opener + move focus into the dialog when it opens; restore
  // focus to the opener when it closes/unmounts.
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
        onCancel();
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
    [onCancel],
  );

  if (!open) return null;

  return (
    <div
      className="odon-confirm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        id="dualStateConfirm"
        ref={dialogRef}
        className="odon-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <p className="odon-confirm-message" id={titleId}>
          {t("dualState.confirmPlannedStatusEdit")}
        </p>
        <div className="odon-confirm-actions">
          <button
            type="button"
            className="odon-confirm-btn odon-confirm-cancel"
            onClick={onCancel}
          >
            {t("dualState.cancel")}
          </button>
          <button
            type="button"
            className="odon-confirm-btn odon-confirm-accept"
            onClick={onAccept}
          >
            {t("dualState.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
