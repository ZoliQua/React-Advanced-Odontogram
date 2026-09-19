// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP7 Task 4: merged #pulpEndoSelect (root/periodontium/endo-pulp
// consolidation). Like diagnosis-ui.test.ts and sp6-task2-caries-popup.test.ts,
// no full-DOM harness exists for the tooth panel (odontogram.ts's DOM logic is
// imperative and requires a fully-wired shell; App.test.tsx mocks odontogram.ts
// out entirely to test App.tsx's JSX in isolation, which would shadow the real
// exports these tests need). So these tests build a real <select> DOM node
// (mirroring the SP6 buildFillingCell pattern) and exercise the merged-selector
// builder/handler directly — the actual behavioral contract.
//
// The companion "App.tsx no longer renders #endoSelect/#pulpSelect, only
// #pulpEndoSelect" regression guard lives in App.test.tsx (mocked-odontogram
// render), see "renders the merged pulp/endo select dropdown, not the old
// separate ones".
import { describe, it, expect, afterEach } from "vitest";
import {
  buildPulpEndoSelect,
  pulpEndoOnSelect,
  pulpEndoDisplayValue,
  isEndoValue,
  pulpSelectOptionValues,
  getPulpDetailLevel,
  setPulpDetailLevel,
  VALID_ENDO,
} from "../odontogram";

afterEach(() => {
  // pulpDetailLevel is module state; restore the default so tests don't leak.
  setPulpDetailLevel("aae");
});

function mountPulpEndoSelect(): HTMLSelectElement {
  document.body.innerHTML = "";
  const sel = document.createElement("select");
  sel.id = "pulpEndoSelect";
  document.body.appendChild(sel);
  return sel;
}

describe("SP7 Task 4: merged pulp/endo selector", () => {
  it("renders one #pulpEndoSelect with two optgroups and no #endoSelect/#pulpSelect", () => {
    const sel = mountPulpEndoSelect();
    buildPulpEndoSelect(sel, /* isMilktooth */ false, "normal");

    expect(document.querySelector("#pulpEndoSelect")).toBeTruthy();
    expect(document.querySelector("#endoSelect")).toBeNull();
    expect(document.querySelector("#pulpSelect")).toBeNull();

    const groups = document.querySelectorAll("#pulpEndoSelect optgroup");
    expect(groups.length).toBe(2);
    // Group 1: vital pulp diagnoses, at the active detail level (default "aae" -> 4).
    expect(groups[0].children.length).toBe(pulpSelectOptionValues(getPulpDetailLevel()).length);
    // Group 2: treated endo options — "none" is excluded, everything else present.
    expect(groups[1].children.length).toBe(VALID_ENDO.size - 1);
    const groupTwoValues = Array.from(groups[1].children).map(o => (o as HTMLOptionElement).value);
    expect(groupTwoValues).not.toContain("none");
    for(const v of VALID_ENDO){
      if(v === "none") continue;
      expect(groupTwoValues).toContain(v);
    }

    expect(sel.value).toBe("normal");
  });

  it("selecting a treated value sets endo and normalizes pulpDx", () => {
    const sel = mountPulpEndoSelect();
    const state: Record<string, unknown> = { endo: "none", pulpDx: "irreversible-pulpitis", pulpLatin: "pulpitis-acuta-purulenta" };
    buildPulpEndoSelect(sel, false, pulpEndoDisplayValue(state));

    // "endo-filling" is a real VALID_ENDO value (see registry/axes.ts).
    expect(VALID_ENDO.has("endo-filling")).toBe(true);
    sel.value = "endo-filling";
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    pulpEndoOnSelect(state, sel.value);

    expect(state.endo).toBe("endo-filling");
    expect(state.pulpDx).toBe("normal");
    expect(state.pulpLatin).toBe("none");
  });

  it("selecting a vital value sets pulpDx and clears endo", () => {
    const sel = mountPulpEndoSelect();
    const state: Record<string, unknown> = { endo: "endo-filling", pulpDx: "normal", pulpLatin: "none" };
    buildPulpEndoSelect(sel, false, pulpEndoDisplayValue(state));

    sel.value = "irreversible-pulpitis";
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    pulpEndoOnSelect(state, sel.value);

    expect(state.pulpDx).toBe("irreversible-pulpitis");
    expect(state.endo).toBe("none");
    expect(state.pulpLatin).toBe("none");
  });

  it("isEndoValue disambiguates endo values from vital pulp values (and 'none')", () => {
    expect(isEndoValue("endo-filling")).toBe(true);
    expect(isEndoValue("endo-medical-filling")).toBe(true);
    expect(isEndoValue("none")).toBe(false);
    expect(isEndoValue("irreversible-pulpitis")).toBe(false);
    expect(isEndoValue("normal")).toBe(false);
  });

  it("pulpEndoDisplayValue shows the endo value when treated, else the pulp value at the active detail level", () => {
    expect(pulpEndoDisplayValue({ endo: "endo-glass-pin", pulpDx: "normal", pulpLatin: "none" })).toBe("endo-glass-pin");
    expect(pulpEndoDisplayValue({ endo: "none", pulpDx: "necrosis", pulpLatin: "none" })).toBe("necrosis");
    setPulpDetailLevel("simple");
    expect(pulpEndoDisplayValue({ endo: "none", pulpDx: "reversible-pulpitis", pulpLatin: "none" })).toBe("irreversible-pulpitis");
  });

  // 2.2.1 Plan-mode: the pulp/endo picker becomes an ENDO-TREATMENT-only
  // selector (omitPulpDx=true) — the vital-pulp DIAGNOSIS optgroup is dropped
  // and a standalone "none" (no endo planned) is offered instead.
  describe("2.2.1 Plan-mode (omitPulpDx)", () => {
    it("omits the vital-pulp diagnosis group, leaving one treated group + a standalone 'none'", () => {
      const sel = mountPulpEndoSelect();
      buildPulpEndoSelect(sel, /* isMilktooth */ false, "none", /* omitPulpDx */ true);

      const groups = document.querySelectorAll("#pulpEndoSelect optgroup");
      expect(groups.length).toBe(1); // treated only — no vital-pulp group
      // A standalone "none" option is a DIRECT child of the select (not in the group).
      const directNone = Array.from(sel.children).some(
        (c) => c.tagName === "OPTION" && (c as HTMLOptionElement).value === "none",
      );
      expect(directNone).toBe(true);
      // The treated group still excludes "none".
      const treatedValues = Array.from(groups[0].children).map((o) => (o as HTMLOptionElement).value);
      expect(treatedValues).not.toContain("none");
      expect(treatedValues).toContain("endo-filling");
    });

    it("collapses a non-endo (pulp-diagnosis) state to 'none' so a plan never shows a diagnosis", () => {
      const sel = mountPulpEndoSelect();
      const state = { endo: "none", pulpDx: "necrosis", pulpLatin: "none" };
      buildPulpEndoSelect(sel, false, pulpEndoDisplayValue(state), true);
      expect(sel.value).toBe("none");
    });

    it("keeps an existing endo treatment value selected", () => {
      const sel = mountPulpEndoSelect();
      const state = { endo: "endo-filling", pulpDx: "normal", pulpLatin: "none" };
      buildPulpEndoSelect(sel, false, pulpEndoDisplayValue(state), true);
      expect(sel.value).toBe("endo-filling");
    });

    it("selecting 'none' clears the endo treatment and leaves the pulp diagnosis untouched", () => {
      const state: Record<string, unknown> = { endo: "endo-filling", pulpDx: "irreversible-pulpitis", pulpLatin: "none" };
      pulpEndoOnSelect(state, "none");
      expect(state.endo).toBe("none");
      // pulp diagnosis is Plan-hidden but not mutated by the clear
      expect(state.pulpDx).toBe("irreversible-pulpitis");
    });
  });

  it("milktooth-gated endo options are excluded from the treated optgroup for a milk tooth", () => {
    const nonMilk = mountPulpEndoSelect();
    buildPulpEndoSelect(nonMilk, false, "normal");
    const nonMilkCount = document.querySelectorAll("#pulpEndoSelect optgroup")[1].children.length;

    const milk = mountPulpEndoSelect();
    buildPulpEndoSelect(milk, true, "normal");
    const milkGroups = document.querySelectorAll("#pulpEndoSelect optgroup");
    const milkValues = Array.from(milkGroups[1].children).map(o => (o as HTMLOptionElement).value);

    // Milk-tooth gating strictly narrows the treated options (never widens it),
    // and "endo-medical-filling" — the one endo value available to milk teeth
    // (registry/axes.ts) — is always present.
    expect(milkGroups[1].children.length).toBeLessThan(nonMilkCount);
    expect(milkValues).toContain("endo-medical-filling");
    expect(milkValues).not.toContain("none");
  });
});
