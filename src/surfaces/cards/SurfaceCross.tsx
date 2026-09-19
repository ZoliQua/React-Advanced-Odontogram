// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Composable-UI Tier 3, PR 3c — the declarative equivalent of the imperative
// `buildSurfaceCross()` UI builder in `odontogram.ts`. It renders the anatomical
// 5-cell cross grid (mesial/occlusal/distal/buccal/lingual) with the SAME markup,
// classes and ids the builder emitted:
//
//   <div class="surface-cross">
//     <label class="surface-cell pos-{pos}" [style="display:none"]>
//       {left indicators…}
//       <input type="checkbox" id="chk-{value}" value="{value}">
//       <span class="surf-letter">{letter}</span>
//       <span id="lbl-{value}" class="surf-name">{label}</span>
//       {right indicators…}
//     </label>
//     …
//   </div>
//
// so id-based tests and the host CSS (`.surface-cross`/`.surface-cell`/
// `.surf-letter`/`.surf-name`/`.surf-depth`) keep resolving. The per-cell
// `.surf-depth`/`.surf-defect` severity/defect indicators the builder injected
// afterwards are parameterised (`indicators`, each with a `side`) so BOTH the
// Caries card (PR 3c, one right-side `.surf-depth`) and the upcoming Fillings
// card (PR 3d, a left-side `.surf-defect` + a right-side `.surf-depth`) can reuse
// this one component. A disabled cell is rendered `display:none`, exactly as the
// imperative `setDisabled()`→`syncControlLabelVisibility()` path hid it.

import type { ReactNode } from "react";

/** One injected per-cell indicator span (e.g. the `.surf-depth` severity popup
 *  affordance). `side` decides whether it renders before the checkbox (left) or
 *  after the caption (right), matching the imperative insert order. */
export type SurfaceIndicator = {
  key: string;
  className: string;                 // full className, incl. any state class
  title: string;
  side: "left" | "right";
  attrs?: Record<string, string>;    // data-depth / data-icdas / data-radio / …
  children?: ReactNode;              // badge number or the 3 `<i>` bars
  onClick?: (anchor: HTMLElement) => void;
};

/** One surface-cross cell's fully-resolved render state. */
export type SurfaceCell = {
  value: string;                     // checkbox value + id source (chk-{value})
  pos: string;                       // grid position (pos-{pos})
  letter: string;                    // boxed `.surf-letter` glyph
  label: string;                     // `.surf-name` caption
  labelId: string;                   // id on the caption span (lbl-{value})
  checked: boolean;
  disabled: boolean;                 // true → whole cell display:none
  onToggle: (checked: boolean) => void;
  indicators?: SurfaceIndicator[];
  attrs?: Record<string, string>;    // extra attributes on the cell <label>
                                     // (e.g. the Fillings card's data-material)
};

function Indicator({ ind }: { ind: SurfaceIndicator }) {
  return (
    <span
      className={ind.className}
      title={ind.title}
      {...(ind.attrs ?? {})}
      onClick={ind.onClick ? (e) => {
        // The indicator sits INSIDE the cell <label>, so a bare click would also
        // toggle the label's checkbox (native behavior). The imperative handlers
        // guarded against this with preventDefault()+stopPropagation(); preserve
        // that so opening the popup never flips the surface on/off.
        e.preventDefault();
        e.stopPropagation();
        ind.onClick!(e.currentTarget as HTMLElement);
      } : undefined}
    >
      {ind.children}
    </span>
  );
}

export default function SurfaceCross({ cells }: { cells: SurfaceCell[] }) {
  return (
    <div className="surface-cross">
      {cells.map((cell) => {
        const left = (cell.indicators ?? []).filter((i) => i.side === "left");
        const right = (cell.indicators ?? []).filter((i) => i.side === "right");
        return (
          <label
            key={cell.value}
            className={`surface-cell pos-${cell.pos}`}
            style={cell.disabled ? { display: "none" } : undefined}
            {...(cell.attrs ?? {})}
          >
            {left.map((ind) => (
              <Indicator key={ind.key} ind={ind} />
            ))}
            <input
              type="checkbox"
              id={`chk-${cell.value}`}
              value={cell.value}
              checked={cell.checked}
              disabled={cell.disabled}
              onChange={(e) => cell.onToggle(e.target.checked)}
            />
            <span className="surf-letter">{cell.letter}</span>
            <span id={cell.labelId} className="surf-name">{cell.label}</span>
            {right.map((ind) => (
              <Indicator key={ind.key} ind={ind} />
            ))}
          </label>
        );
      })}
    </div>
  );
}
