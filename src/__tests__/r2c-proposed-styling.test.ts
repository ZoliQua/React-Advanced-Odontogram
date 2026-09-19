// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-C Task 1: proposed-layer detection + dashed+tint treatment + reset.
//
// In Plan mode, a layer that is active in the PLAN chart but NOT in the
// STATUS chart (a "plan add") gets a distinct dashed+tinted "proposed" look
// so a plan reads as PROPOSED treatment, not as-if-already-done findings.
//
// Test strategy: this engine has no test seam that mounts a full grid (that
// requires async SVG template fetches — see addTile()/toothSvgRoot in
// odontogram.ts), and `applyProposedStyling` is wired into `applyStateToSvg`
// (the roots loop), not into `applyStateToSvgSingle`. So instead of mounting
// a live grid, each test:
//   1. Sets STATUS state via `__setToothStateForTest` (chartMode starts
//      "status" after `__resetChartStateForTest`).
//   2. Optionally `setChartMode("plan")` (clones status -> plan) and edits
//      the PLAN state via the same seam.
//   3. Paints a detached, parsed SVG node with the ACTIVE chart's state via
//      `__renderActiveLayersOnNode` (mirrors the `applyStateToSvgSingle`
//      call `applyStateToSvg`'s roots loop makes for each root).
//   4. Calls `__applyProposedStylingForTest(toothNo, node)` (mirrors the
//      `applyProposedStyling(toothNo, svg)` call the SAME loop makes right
//      after, reading the module's live `charts`/`chartMode`/`planInitialized`).
// This reproduces the exact two-step sequence `applyStateToSvg` performs,
// without requiring a live DOM grid.
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import {
  setChartMode,
  __setToothStateForTest,
  __resetChartStateForTest,
  __parseSvgForTest,
  __renderActiveLayersOnNode,
  __applyProposedStylingForTest,
} from "../odontogram";

const svg11 = readFileSync(fileURLToPath(new NodeURL("../assets/teeth-svgs/11.svg", import.meta.url)), "utf8");

const TOOTH = 11;
// composeRestorationLayers("crown", "zircon", ...) -> crownLayerIds("zircon")
// -> ["zircon-crown"] (src/registry/restorations.ts) — a plain <path>, not a
// group, in 11.svg (grepped: `<path id="zircon-crown" ... />`).
const CROWN_LAYER_ID = "zircon-crown";
const SOUND_STATE = { toothSelection: "tooth-base", restorationType: "none", restorationMaterial: "none" };
const CROWN_STATE = { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" };

const dashOf = (node: any, id: string) => (node.querySelector("#" + id) as any)?.style.strokeDasharray ?? "";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("R2-C Task 1: applyProposedStyling — plan-add detection + dashed+tint + reset", () => {
  it("A) crown layer added only in plan gets a non-empty strokeDasharray in plan mode", () => {
    __setToothStateForTest(TOOTH, SOUND_STATE); // status: sound
    setChartMode("plan"); // clone status -> plan
    __setToothStateForTest(TOOTH, CROWN_STATE); // plan: crown (status stays sound)

    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, TOOTH, CROWN_STATE); // paint the ACTIVE (plan) state
    __applyProposedStylingForTest(TOOTH, node);

    expect(dashOf(node, CROWN_LAYER_ID)).not.toBe("");
  });

  it("B) a layer active in BOTH status and plan (tooth-base) stays solid (no strokeDasharray)", () => {
    __setToothStateForTest(TOOTH, SOUND_STATE);
    setChartMode("plan");
    __setToothStateForTest(TOOTH, CROWN_STATE);

    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, TOOTH, CROWN_STATE);
    __applyProposedStylingForTest(TOOTH, node);

    expect(dashOf(node, "tooth-base")).toBe("");
  });

  it("C) plan == status (no edits after clone) -> nothing is marked proposed", () => {
    __setToothStateForTest(TOOTH, CROWN_STATE); // status already has the crown
    setChartMode("plan"); // clone -> plan is identical to status, no further edits

    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, TOOTH, CROWN_STATE);
    __applyProposedStylingForTest(TOOTH, node);

    expect(dashOf(node, CROWN_LAYER_ID)).toBe("");
    expect(dashOf(node, "tooth-base")).toBe("");
  });

  it("D) switching back to status mode + repaint clears the previously-proposed layer's strokeDasharray (equals captured base)", () => {
    __setToothStateForTest(TOOTH, SOUND_STATE);
    setChartMode("plan");
    __setToothStateForTest(TOOTH, CROWN_STATE);

    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, TOOTH, CROWN_STATE);
    __applyProposedStylingForTest(TOOTH, node);
    expect(dashOf(node, CROWN_LAYER_ID)).not.toBe(""); // proposed, as in (A)

    const baseDashBeforeMark = node.querySelector("#" + CROWN_LAYER_ID)?.getAttribute("data-base-dash");

    setChartMode("status"); // back to status — status is still sound
    __renderActiveLayersOnNode(node, TOOTH, SOUND_STATE); // repaint with the now-active (status) state
    __applyProposedStylingForTest(TOOTH, node); // reset pass: chartMode !== "plan" -> clear only

    expect(dashOf(node, CROWN_LAYER_ID)).toBe(baseDashBeforeMark || "");
    expect(dashOf(node, CROWN_LAYER_ID)).toBe("");
  });

  it("E) in status mode from the start (plan never entered), applyProposedStyling marks nothing", () => {
    __setToothStateForTest(TOOTH, CROWN_STATE); // status has a crown; plan was never touched

    const node = __parseSvgForTest(svg11);
    __renderActiveLayersOnNode(node, TOOTH, CROWN_STATE);
    __applyProposedStylingForTest(TOOTH, node);

    expect(dashOf(node, CROWN_LAYER_ID)).toBe("");
    expect(dashOf(node, "tooth-base")).toBe("");
  });
});
