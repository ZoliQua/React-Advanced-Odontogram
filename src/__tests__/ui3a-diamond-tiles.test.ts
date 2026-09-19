// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3a Task 3: the 4-surface graded cells (Plaque/PI/GI/mPI/mBI) render as
// an anatomical DIAMOND — buccal top-centered, mesial+distal middle,
// lingual bottom-centered — via `style.gridArea` set per button, instead of
// the old 2x2 grid. Mesial/distal additionally swap visual columns per FDI
// quadrant so mesial always points toward the arch midline. Structural DOM
// assertions only (grid-area + data-* wiring) — visual placement is a
// browser check (see the controller's verification pass), not asserted
// here.
//
// PerioChart is rendered directly, same precedent as ui3a-central-band.test.ts
// / perio-graphic-rows.test.ts.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import PerioChart from "../PerioChart";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  type PerioRowId,
  setPerioRowVisibility,
} from "../odontogram";
import { setI18nLanguage } from "../i18n/useI18n";

const ALL_ROW_IDS: PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

function openGrid() {
  return render(createElement(PerioChart, { open: true, onClose: () => {} }));
}


beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  setI18nLanguage("en");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  for (const id of ALL_ROW_IDS) setPerioRowVisibility(id, true);
});

/** Plaque-row surface button for a tooth. */
function plaqueBtn(toothNo: number, surface: string): HTMLButtonElement {
  const el = document.getElementById(`perio-fg-plaque-${toothNo}-${surface}`);
  expect(el, `plaque button not found for ${toothNo}/${surface}`).toBeTruthy();
  return el as HTMLButtonElement;
}

/** PI-row (grade) surface button for a tooth — same 4-surface shape as plaque. */
function piBtn(toothNo: number, surface: string): HTMLButtonElement {
  const el = document.getElementById(`perio-fg-pi-${toothNo}-${surface}`);
  expect(el, `pi button not found for ${toothNo}/${surface}`).toBeTruthy();
  return el as HTMLButtonElement;
}

describe("UI-3a Task 3: diamond layout for 4-surface plaque/grade cells", () => {
  it("plaque cell: buccal top, mesial+distal middle, lingual bottom (by grid-area)", () => {
    openGrid();
    const buccal = plaqueBtn(16, "buccal");
    const mesial = plaqueBtn(16, "mesial");
    const distal = plaqueBtn(16, "distal");
    const lingual = plaqueBtn(16, "lingual");

    expect(buccal.style.gridArea).toBe("buc");
    expect(lingual.style.gridArea).toBe("lin");
    // mesial/distal occupy the two middle-row areas (mes/dis), never buc/lin.
    expect(["mes", "dis"]).toContain(mesial.style.gridArea);
    expect(["mes", "dis"]).toContain(distal.style.gridArea);
    expect(mesial.style.gridArea).not.toBe(distal.style.gridArea);
  });

  it("grade cell (PI): same diamond grid-area shape as plaque", () => {
    openGrid();
    const buccal = piBtn(16, "buccal");
    const mesial = piBtn(16, "mesial");
    const distal = piBtn(16, "distal");
    const lingual = piBtn(16, "lingual");

    expect(buccal.style.gridArea).toBe("buc");
    expect(lingual.style.gridArea).toBe("lin");
    expect(["mes", "dis"]).toContain(mesial.style.gridArea);
    expect(["mes", "dis"]).toContain(distal.style.gridArea);
    expect(mesial.style.gridArea).not.toBe(distal.style.gridArea);
  });

  it("button surface/data wiring is unchanged regardless of visual position", () => {
    openGrid();
    for (const surface of ["mesial", "distal", "buccal", "lingual"]) {
      expect(plaqueBtn(16, surface).dataset.plaqueSurface).toBe(surface);
      expect(plaqueBtn(26, surface).dataset.plaqueSurface).toBe(surface);
      expect(piBtn(16, surface).dataset.gradeSurface).toBe(surface);
      expect(piBtn(26, surface).dataset.gradeSurface).toBe(surface);
    }
  });

  it("mesial/distal visual columns swap between a RIGHT-quadrant tooth (16) and a LEFT-quadrant tooth (26), mesial toward the midline", () => {
    openGrid();
    const rightMesial = plaqueBtn(16, "mesial"); // FDI quadrant 1
    const leftMesial = plaqueBtn(26, "mesial"); // FDI quadrant 2

    // Both are still wired to the "mesial" surface...
    expect(rightMesial.dataset.plaqueSurface).toBe("mesial");
    expect(leftMesial.dataset.plaqueSurface).toBe("mesial");
    // ...but their visual column differs: quadrant 1 sits screen-left of the
    // upper-arch midline (11|21 boundary), so mesial (toward the midline) is
    // on the RIGHT ("dis" column); quadrant 2 sits screen-right of the
    // midline, so mesial is on the LEFT ("mes" column).
    expect(rightMesial.style.gridArea).toBe("dis");
    expect(leftMesial.style.gridArea).toBe("mes");
    expect(rightMesial.style.gridArea).not.toBe(leftMesial.style.gridArea);

    // Distal is the mirror image of mesial on both teeth.
    expect(plaqueBtn(16, "distal").style.gridArea).toBe("mes");
    expect(plaqueBtn(26, "distal").style.gridArea).toBe("dis");
  });

  it("mesial/distal swap also applies to the graded (PI) cells", () => {
    openGrid();
    expect(piBtn(16, "mesial").style.gridArea).toBe("dis");
    expect(piBtn(26, "mesial").style.gridArea).toBe("mes");
  });

  it("buccal/lingual visual position never swaps by quadrant", () => {
    openGrid();
    expect(plaqueBtn(16, "buccal").style.gridArea).toBe("buc");
    expect(plaqueBtn(26, "buccal").style.gridArea).toBe("buc");
    expect(plaqueBtn(16, "lingual").style.gridArea).toBe("lin");
    expect(plaqueBtn(26, "lingual").style.gridArea).toBe("lin");
  });

  it("lower-arch quadrants (3x/4x) follow the same mesial-toward-midline rule", () => {
    openGrid();
    // Tooth 46 = FDI quadrant 4 (screen-left half, right quadrant) -> mesial right.
    // Tooth 36 = FDI quadrant 3 (screen-right half, left quadrant) -> mesial left.
    expect(plaqueBtn(46, "mesial").style.gridArea).toBe("dis");
    expect(plaqueBtn(36, "mesial").style.gridArea).toBe("mes");
  });
});
