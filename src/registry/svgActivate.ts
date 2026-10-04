// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Generic AXES-driven activation pass: applies the boolean-flag layer toggles and
 * the `mods` set toggle in one order-independent sweep (enforced by
 * `src/__tests__/parity.test.ts`).
 */
import { AXES } from "./axes";
import type { FlagCtx } from "./types";

// The tooth STATE is the engine's plain, untyped per-tooth object (Sets and
// Maps mixed with scalars, see `ToothRecord` for its serialized shape) — the
// one `any` the registry keeps, deliberately: giving it a type here would mean
// duplicating the live-state shape that `odontogram.ts` owns.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToothState = any;

interface Deps {
  setActive: (el: Element | null, on: boolean) => void;
  svgGetById: (root: ParentNode, id: string) => Element | null;
  isToothPresent: (sel: string) => boolean;
  isUnderGum: (sel: string) => boolean;
  isExtraction: (sel: string) => boolean;
  fissureAllowedTeeth: Set<number>;
  brokenVariants: Set<string>;
}

/** Compute the render's derived booleans (mirrors applyStateToSvgSingle). */
export function buildFlagCtx(state: ToothState, toothNo: number, d: Deps): FlagCtx {
  const sel = state.toothSelection;
  return {
    isImplant: sel === "implant",
    isMilktooth: sel === "milktooth",
    underGum: d.isUnderGum(sel),
    extraction: d.isExtraction(sel) || (sel === "none" && state.extractionWound),
    isNone: sel === "none",
    toothPresent: d.isToothPresent(sel),
    fissureAllowed: sel === "tooth-base" && d.fissureAllowedTeeth.has(toothNo),
    contactAllowed: sel === "tooth-base" || sel === "milktooth" || d.brokenVariants.has(sel),
    bruxismAllowed: sel === "tooth-base" && state.restorationType === "none" && state.toothSubstrate === "natural",
    extractionPlanAllowed: ["tooth-base","milktooth","implant","tooth-under-gum"].includes(sel),
  };
}

/** Activate the in-scope boolean-flag layers + the mods set layers. Order-independent. */
export function applyFlagLayers(svg: ParentNode, state: ToothState, ctx: FlagCtx, d: Deps): void {
  for (const ax of AXES) {
    if (ax.kind === "boolean" && ax.svgLayer) {
      const on = state[ax.field] === true && (ax.appliesWhen ? ax.appliesWhen(ctx, state) : true);
      if (on) d.setActive(d.svgGetById(svg, ax.svgLayer), true);
    } else if (ax.kind === "set" && ax.id === "mods") {
      const mods: Iterable<string> = state.mods ?? [];
      for (const m of mods) {
        const v = ax.values?.find(x => x.id === m);
        const layers = v?.svgLayer == null ? [m] : Array.isArray(v.svgLayer) ? v.svgLayer : [v.svgLayer];
        for (const id of layers) d.setActive(d.svgGetById(svg, id), true);
      }
    }
  }
}
