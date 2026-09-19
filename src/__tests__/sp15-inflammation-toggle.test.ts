// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP15 Task 3 (B4, ratified): scope the "Periapical inflammation" checkbox
// (`input[value="inflammation"]` in `#modsChecks`, on the Root/Periodontium
// card) so it's visible ONLY for a missing tooth or an extraction-socket:
//
//   - present tooth (tooth-base / milktooth): HIDDEN (SP7 — apicalDx drives
//     the periapical glyph there instead; unchanged by this task)
//   - implant: HIDDEN (NEW — the dedicated `periImplant` axis / SP8
//     peri-implantitis staging already covers implant inflammation, so this
//     toggle would be redundant there)
//   - missing tooth (`toothSelection: "none"`): VISIBLE (marks periodontal
//     inflammation in the socket, which `apicalDx` does not cover)
//   - extraction-socket (`toothSelection: "no-tooth-after-extraction"`):
//     VISIBLE (same reasoning — the label itself swaps to "periodontal
//     inflammation" for this case, see the `#lbl-inflammation` relabel in
//     syncControlsFromState())
//
// Exercises the real, exported `__syncInflammationModVisibilityForTest`
// helper against a hand-built `#modsChecks` DOM fragment (mirrors the shape
// buildChecks() produces: a <label> wrapping the checkbox input and a text
// span) — the same no-full-DOM-harness pattern as sp7-card-merge.test.ts and
// sp14-ortho-ui.test.ts, since no full-DOM initOdontogram() mount harness
// exists for the tooth panel.
import { describe, it, expect } from "vitest";
import { __syncInflammationModVisibilityForTest } from "../odontogram";

function buildModsChecksFixture(): { container: HTMLDivElement; label: HTMLLabelElement } {
  const container = document.createElement("div");
  container.id = "modsChecks";
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = "inflammation";
  const span = document.createElement("span");
  span.textContent = "Periapical inflammation";
  label.appendChild(input);
  label.appendChild(span);
  container.appendChild(label);
  document.body.appendChild(container);
  return { container, label };
}

describe("SP15 Task 3 (B4): inflammation mod checkbox visible only for missing/socket teeth", () => {
  it("hides the row for a present tooth (tooth-base)", () => {
    const { container, label } = buildModsChecksFixture();
    __syncInflammationModVisibilityForTest(container, "tooth-base");
    expect(label.classList.contains("hidden")).toBe(true);
    document.body.removeChild(container);
  });

  it("hides the row for a present milk tooth (milktooth)", () => {
    const { container, label } = buildModsChecksFixture();
    __syncInflammationModVisibilityForTest(container, "milktooth");
    expect(label.classList.contains("hidden")).toBe(true);
    document.body.removeChild(container);
  });

  it("hides the row for an implant (NEW in B4 — periImplant covers it instead)", () => {
    const { container, label } = buildModsChecksFixture();
    __syncInflammationModVisibilityForTest(container, "implant");
    expect(label.classList.contains("hidden")).toBe(true);
    document.body.removeChild(container);
  });

  it("shows the row for a missing tooth (toothSelection: \"none\")", () => {
    const { container, label } = buildModsChecksFixture();
    // Start hidden (as it would be after a present-tooth sync) to prove the
    // helper actively un-hides it for "none", not just leaves it alone.
    label.classList.add("hidden");
    __syncInflammationModVisibilityForTest(container, "none");
    expect(label.classList.contains("hidden")).toBe(false);
    document.body.removeChild(container);
  });

  it("shows the row for an extraction-socket (toothSelection: \"no-tooth-after-extraction\")", () => {
    const { container, label } = buildModsChecksFixture();
    label.classList.add("hidden");
    __syncInflammationModVisibilityForTest(container, "no-tooth-after-extraction");
    expect(label.classList.contains("hidden")).toBe(false);
    document.body.removeChild(container);
  });

  it("toggles correctly across repeated calls (present -> missing -> implant -> socket)", () => {
    const { container, label } = buildModsChecksFixture();
    __syncInflammationModVisibilityForTest(container, "tooth-base");
    expect(label.classList.contains("hidden")).toBe(true);

    __syncInflammationModVisibilityForTest(container, "none");
    expect(label.classList.contains("hidden")).toBe(false);

    __syncInflammationModVisibilityForTest(container, "implant");
    expect(label.classList.contains("hidden")).toBe(true);

    __syncInflammationModVisibilityForTest(container, "no-tooth-after-extraction");
    expect(label.classList.contains("hidden")).toBe(false);
    document.body.removeChild(container);
  });
});
