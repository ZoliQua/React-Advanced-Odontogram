// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Composable surface — the tooth-information panel
// (`{toothInfoOn && summary && <section className="tooth-info card">}`).
// Presentational: reads the summary from `useOdontogramUi()` and returns `null`
// when the Tooth-info panel is off or there is no summary yet.

import { useOdontogramUi } from "../OdontogramContext";
import { formatToothLabel } from "../odontogram";

export default function ToothInfoSurface() {
  const { t, toothInfoOn, summary } = useOdontogramUi();

  if (!(toothInfoOn && summary)) return null;

  return (
          <section className="tooth-info card" aria-label={t("toothInfo.title")}>
            <div className="card-title">{t("toothInfo.title")}</div>
            <p className="tooth-info-overview">{summary.overview}</p>
            {/* Grouped dentition table: one column per tooth category, one row
                per anatomical group (whole mouth / jaw / quadrant / sextant per
                the PDF summary-grouping setting). Tooth numbers are coloured by
                status (blue = has content, red+italic = has a problem). */}
            {summary.toothTable.rows.length > 0 && (
              <div className="tooth-info-table-wrap">
                <table className="tooth-info-table">
                  <thead>
                    <tr>
                      <th aria-hidden="true"></th>
                      {summary.toothTable.columns.map((c) => (
                        <th key={c.key} scope="col">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.toothTable.rows.map((row) => (
                      <tr key={row.key}>
                        <th scope="row">{row.label}</th>
                        {summary.toothTable.columns.map((c) => {
                          const cells = row.cells[c.key] ?? [];
                          return (
                            <td key={c.key}>
                              {cells.map((cell, i) => (
                                <span key={cell.toothNo} className={`tooth-cell tooth-cell-${cell.status}`}>
                                  {cell.label}{i < cells.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="tooth-info-table-legend">{summary.toothTable.legend}</p>
              </div>
            )}
            {summary.individualNotes && (
              <div id="toothInfoNotes" className="tooth-info-notes">
                <span className="tooth-info-heading">{summary.individualNotes.heading}:</span>
                {summary.individualNotes.items.map((n, i) => (
                  <p key={i} className="tooth-info-note-item">
                    {n}
                  </p>
                ))}
              </div>
            )}
            {summary.sections.map((sec) => (
              <p key={sec.key} className="tooth-info-line">
                <span className="tooth-info-heading">{sec.heading}:</span>{" "}
                {sec.items.length
                  ? sec.items.join(", ")
                  : <span className="tooth-info-empty">{sec.emptyText}</span>}
              </p>
            ))}
            {summary.plannedChanges && summary.plannedChanges.length > 0 && (
              <div id="plannedChangesBox" className="planned-changes">
                <div className="tooth-info-heading">{t("toothInfo.plannedChanges")}</div>
                {summary.plannedChanges.map((c, i) => (
                  <p key={`${c.toothNo}-${c.axis}-${i}`} className="planned-changes-item">
                    {formatToothLabel(c.toothNo)}: {t(`planChange.axis.${c.axis}`)} {c.from} → {c.to}
                  </p>
                ))}
              </div>
            )}
            {summary.implants && (
              <p className="tooth-info-line">
                <span className="tooth-info-heading">{summary.implants.heading}:</span>{" "}
                {summary.implants.text}
              </p>
            )}
            <p className="tooth-info-line">
              <span className="tooth-info-heading">{summary.periodontalTitle}:</span>{" "}
              {summary.periodontalText}
            </p>
          </section>
  );
}
