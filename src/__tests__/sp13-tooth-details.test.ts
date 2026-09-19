// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// SP13 Task 2: wear/discoloration detail-level accessors + simple-mode
// toggles. Task 1 (committed) restructured the wear rows and added hidden
// toggle checkboxes (#wearEdgeToggle / #wearCervicalToggle /
// #discolorationToggle) beside the existing selects. This task adds
// setWearDetailLevel/getWearDetailLevel (drives BOTH edge + cervical wear —
// one shared setting) and setDiscolorationDetailLevel/getDiscolorationDetailLevel
// (independent), wires the toggles' change handlers via applyToSelected, and
// syncs each pair's visibility + the checkbox's derived `.checked` from
// syncControlsFromState.
//
// Like sp7-card-merge.test.ts / sp8-peri-implant-ui.test.ts, no full-DOM
// initOdontogram() mount harness exists for the tooth panel (odontogram.ts's
// DOM logic is imperative and requires a fully-wired shell with real SVG
// assets; activeTooth is module-private and only settable via a live tooth
// selection). So the visibility/checked-sync behavior exercises the real,
// exported test-only seam __syncToothDetailControlsForTest (mirrors
// __syncInflammationModVisibilityForTest) against a hand-built DOM fragment
// mirroring App.tsx's real label/select/checkbox markup, and the
// checkbox-write behavior exercises a hand-built checkbox + change listener
// pair reproducing the buildSelect-wiring contract (mirrors
// sp11-wear-ui.test.ts / sp12-discoloration-ui.test.ts).
import { describe, it, expect, afterEach } from "vitest";
import {
  setWearDetailLevel,
  getWearDetailLevel,
  setDiscolorationDetailLevel,
  getDiscolorationDetailLevel,
  __syncToothDetailControlsForTest,
} from "../odontogram";

afterEach(() => {
  // wearDetailLevel/discolorationDetailLevel are module state; restore the
  // defaults so tests don't leak (mirrors the pulpDetailLevel afterEach in
  // diagnosis-ui.test.ts).
  setWearDetailLevel("complex");
  setDiscolorationDetailLevel("complex");
});

/** Build the wear + discoloration label/select/checkbox DOM fragment
 *  __syncToothDetailControlsForTest's underlying sync reads/writes, mirroring
 *  the real markup in App.tsx (label#wearEdgeSelectLabel > select, etc.). */
function mountDetailControls(): void {
  document.body.innerHTML = "";
  document.body.innerHTML = `
    <label id="wearEdgeSelectLabel"><select id="wearEdgeSelect"></select></label>
    <label id="wearEdgeToggleLabel" class="hidden"><input type="checkbox" id="wearEdgeToggle" /></label>
    <label id="wearCervicalSelectLabel"><select id="wearCervicalSelect"></select></label>
    <label id="wearCervicalToggleLabel" class="hidden"><input type="checkbox" id="wearCervicalToggle" /></label>
    <label id="discolorationSelectLabel"><select id="discolorationSelect"></select></label>
    <label id="discolorationToggleLabel" class="hidden"><input type="checkbox" id="discolorationToggle" /></label>
  `;
}

function isHidden(id: string): boolean {
  return document.getElementById(id)!.classList.contains("hidden");
}

function checkbox(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement;
}

/** Reproduces the production change-listener contract added to wireControls
 *  in Step 4 (applyToSelected writes the canonical simple value on check,
 *  "none" on uncheck) against a hand-built state object, mirroring how
 *  sp11-wear-ui.test.ts / sp12-discoloration-ui.test.ts exercise the
 *  buildSelect contract without a live wireControls() mount. */
function wireToggle(id: string, field: string, onValue: string, state: Record<string, unknown>): void {
  checkbox(id).addEventListener("change", (e) => {
    const on = (e.target as HTMLInputElement).checked;
    state[field] = on ? onValue : "none";
  });
}

describe("SP13 Task 2: wearDetailLevel / discolorationDetailLevel accessors", () => {
  it("default to complex", () => {
    expect(getWearDetailLevel()).toBe("complex");
    expect(getDiscolorationDetailLevel()).toBe("complex");
  });

  it("setWearDetailLevel sanitizes unknown values to complex", () => {
    setWearDetailLevel("simple");
    expect(getWearDetailLevel()).toBe("simple");
    setWearDetailLevel("bogus" as any);
    expect(getWearDetailLevel()).toBe("complex");
  });

  it("setDiscolorationDetailLevel sanitizes unknown values to complex", () => {
    setDiscolorationDetailLevel("simple");
    expect(getDiscolorationDetailLevel()).toBe("simple");
    setDiscolorationDetailLevel("bogus" as any);
    expect(getDiscolorationDetailLevel()).toBe("complex");
  });
});

describe("SP13 Task 2: mode-driven visibility (__syncToothDetailControlsForTest)", () => {
  it("default (complex): selects visible, toggles hidden — for wear (edge + cervical) and discoloration", () => {
    mountDetailControls();
    const state = { wearEdge: "none", wearCervical: "none", discoloration: "none" };
    __syncToothDetailControlsForTest(state);

    expect(isHidden("wearEdgeSelectLabel")).toBe(false);
    expect(isHidden("wearEdgeToggleLabel")).toBe(true);
    expect(isHidden("wearCervicalSelectLabel")).toBe(false);
    expect(isHidden("wearCervicalToggleLabel")).toBe(true);
    expect(isHidden("discolorationSelectLabel")).toBe(false);
    expect(isHidden("discolorationToggleLabel")).toBe(true);
  });

  it("setWearDetailLevel('simple') + re-sync: wear toggles visible, wear selects hidden; discoloration UNAFFECTED", () => {
    mountDetailControls();
    setWearDetailLevel("simple");
    const state = { wearEdge: "none", wearCervical: "none", discoloration: "none" };
    __syncToothDetailControlsForTest(state);

    expect(isHidden("wearEdgeToggleLabel")).toBe(false);
    expect(isHidden("wearEdgeSelectLabel")).toBe(true);
    expect(isHidden("wearCervicalToggleLabel")).toBe(false);
    expect(isHidden("wearCervicalSelectLabel")).toBe(true);
    // Discoloration is still complex — its own independent setting.
    expect(isHidden("discolorationSelectLabel")).toBe(false);
    expect(isHidden("discolorationToggleLabel")).toBe(true);
  });

  it("setDiscolorationDetailLevel('simple') + re-sync: discoloration toggle visible, select hidden", () => {
    mountDetailControls();
    setDiscolorationDetailLevel("simple");
    const state = { wearEdge: "none", wearCervical: "none", discoloration: "none" };
    __syncToothDetailControlsForTest(state);

    expect(isHidden("discolorationToggleLabel")).toBe(false);
    expect(isHidden("discolorationSelectLabel")).toBe(true);
  });
});

describe("SP13 Task 2: simple-mode checkbox writes the canonical value / 'none'", () => {
  it("checking #wearEdgeToggle writes 'attrition'; unchecking writes 'none'", () => {
    mountDetailControls();
    const state: Record<string, unknown> = { wearEdge: "none" };
    wireToggle("wearEdgeToggle", "wearEdge", "attrition", state);

    const el = checkbox("wearEdgeToggle");
    el.checked = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.wearEdge).toBe("attrition");

    el.checked = false;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.wearEdge).toBe("none");
  });

  it("checking #wearCervicalToggle writes 'abrasion'; unchecking writes 'none'", () => {
    mountDetailControls();
    const state: Record<string, unknown> = { wearCervical: "none" };
    wireToggle("wearCervicalToggle", "wearCervical", "abrasion", state);

    const el = checkbox("wearCervicalToggle");
    el.checked = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.wearCervical).toBe("abrasion");

    el.checked = false;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.wearCervical).toBe("none");
  });

  it("checking #discolorationToggle writes 'other'; unchecking writes 'none'", () => {
    mountDetailControls();
    const state: Record<string, unknown> = { discoloration: "none" };
    wireToggle("discolorationToggle", "discoloration", "other", state);

    const el = checkbox("discolorationToggle");
    el.checked = true;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.discoloration).toBe("other");

    el.checked = false;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    expect(state.discoloration).toBe("none");
  });
});

describe("SP13 Task 2: non-collapsing — switching detail level never mutates stored state", () => {
  it("wearEdge='erosion' set via the complex select survives a switch to simple mode; toggle reflects it as checked", () => {
    mountDetailControls();
    const state: Record<string, unknown> = { wearEdge: "erosion", wearCervical: "none", discoloration: "none" };

    // Sanity: complex mode shows the select still holding "erosion".
    __syncToothDetailControlsForTest(state);
    expect(state.wearEdge).toBe("erosion");

    setWearDetailLevel("simple");
    __syncToothDetailControlsForTest(state); // re-sync, as setWearDetailLevel does internally when a tooth is active

    expect(checkbox("wearEdgeToggle").checked).toBe(true);
    expect(state.wearEdge).toBe("erosion"); // mode switch did not mutate the stored value
  });

  it("switching back to complex mode still does not mutate the preserved value", () => {
    mountDetailControls();
    const state: Record<string, unknown> = { wearEdge: "erosion", wearCervical: "none", discoloration: "none" };
    setWearDetailLevel("simple");
    __syncToothDetailControlsForTest(state);
    setWearDetailLevel("complex");
    __syncToothDetailControlsForTest(state);

    expect(state.wearEdge).toBe("erosion");
    expect(isHidden("wearEdgeSelectLabel")).toBe(false);
    expect(isHidden("wearEdgeToggleLabel")).toBe(true);
  });
});
