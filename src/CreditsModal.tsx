// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useCallback, useEffect, useRef, useId } from "react";

/** Translation function signature (subset of `useI18n`'s `t`). */
type TFn = (key: string, params?: Record<string, string | number>) => string;

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const REPO_URL = "https://github.com/ZoliQua/React-Advanced-Odontogram";

/** The creator / lead developer, called out separately from the contributors. */
const CREATOR = { handle: "ZoliQua", descKey: "credits.contrib.zoliqua" };

/** Human contributors and what each one added. Kept as data so a new
 *  contributor is a one-line addition here (and in the language READMEs).
 *  Claude / the AI assistant is intentionally never listed. */
const CONTRIBUTORS: { handle: string; descKey: string }[] = [
  { handle: "odontodev", descKey: "credits.contrib.odontodev" },
  { handle: "JulianoBazzi", descKey: "credits.contrib.julianobazzi" },
  { handle: "yassine-bhn", descKey: "credits.contrib.yassine" },
  { handle: "saegerdirk-star", descKey: "credits.contrib.saegerdirk" },
];

/** External projects the app is built with. Names are proper nouns (not
 *  translated); each links to its home. */
const LIBRARIES: { name: string; url: string }[] = [
  { name: "jsPDF", url: "https://github.com/parallax/jsPDF" },
  { name: "DOMPurify", url: "https://github.com/cure53/DOMPurify" },
  { name: "React", url: "https://react.dev" },
  { name: "Vite", url: "https://vite.dev" },
  { name: "TypeScript", url: "https://www.typescriptlang.org" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com" },
];

/**
 * The "About and credits" popup. Mirrors {@link DualStateConfirm}'s dialog
 * contract: `role="dialog"` + `aria-modal`, Escape closes, backdrop click
 * closes, focus is trapped while open and returned to the opener on close.
 * Opened from the topbar Credits button (`creditsOpen` in the UI context).
 */
export default function CreditsModal({
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

  return (
    <div
      className="odon-confirm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="creditsModal"
        ref={dialogRef}
        className="odon-credits-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <button type="button" className="odon-settings-close" onClick={onClose} aria-label={t("credits.close")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <h2 className="odon-credits-title" id={titleId}>{t("credits.title")}</h2>

        <div className="odon-credits-body">
          <p className="odon-credits-intro">{t("credits.intro")}</p>

          <section className="odon-credits-section">
            <h3 className="odon-credits-heading">{t("credits.creatorTitle")}</h3>
            <ul className="odon-credits-list">
              <li>
                <a
                  className="odon-credits-link"
                  href={`https://github.com/${CREATOR.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{CREATOR.handle}
                </a>
                <span className="odon-credits-desc">{t(CREATOR.descKey)}</span>
              </li>
            </ul>
          </section>

          <section className="odon-credits-section">
            <h3 className="odon-credits-heading">{t("credits.contributorsTitle")}</h3>
            <ul className="odon-credits-list">
              {CONTRIBUTORS.map((c) => (
                <li key={c.handle}>
                  <a
                    className="odon-credits-link"
                    href={`https://github.com/${c.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{c.handle}
                  </a>
                  <span className="odon-credits-desc">{t(c.descKey)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="odon-credits-section">
            <h3 className="odon-credits-heading">{t("credits.librariesTitle")}</h3>
            <ul className="odon-credits-libs">
              {LIBRARIES.map((l) => (
                <li key={l.name}>
                  <a className="odon-credits-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.name}</a>
                </li>
              ))}
            </ul>
          </section>

          <p className="odon-credits-welcome">{t("credits.welcome")}</p>
        </div>

        <a className="odon-credits-star" href={REPO_URL} target="_blank" rel="noopener noreferrer">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          <span>{t("credits.star")}</span>
        </a>
      </div>
    </div>
  );
}
