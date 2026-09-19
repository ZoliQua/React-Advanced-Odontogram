// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

export type RestorationType = "none" | "crown" | "inlay" | "onlay" | "veneer" | "bridge";
export type RestorationMaterial =
  | "none" | "emax" | "gold" | "gradia" | "zircon" | "metal" | "metal-ceramic" | "telescope" | "temporary";
export type ToothView = "front" | "occlusal";

// Single source of truth: which materials each restoration type supports, and view gating.
export const RESTORATION_MATRIX: Record<Exclude<RestorationType, "none">,
  { materials: RestorationMaterial[]; occlusalOnly?: boolean }> = {
  crown:  { materials: ["emax","gold","gradia","zircon","metal","metal-ceramic","telescope","temporary"] },
  bridge: { materials: ["emax","gold","gradia","zircon","metal","metal-ceramic","telescope","temporary"] },
  inlay:  { materials: ["emax","gold","gradia","zircon","temporary"] },
  onlay:  { materials: ["emax","gold","gradia","zircon","temporary"], occlusalOnly: true },
  veneer: { materials: ["emax","gold","gradia","zircon","temporary"] },
};

const LABEL_KEY = {
  type: (t: RestorationType) => `restoration.type.${t}`,
  material: (m: RestorationMaterial) => `restoration.material.${m === "metal-ceramic" ? "metalCeramic" : m}`,
};

export function isValidRestoration(type: RestorationType, material: RestorationMaterial, view: ToothView): boolean {
  if (type === "none") return material === "none";
  const spec = RESTORATION_MATRIX[type];
  if (!spec) return false;
  if (spec.occlusalOnly && view !== "occlusal") return false;
  return spec.materials.includes(material);
}

// Telescope crowns are a wrapper <g id="telescope-crown"> around two child
// paths (inside/outside) that each carry their own independent data-active
// attribute in the SVG; allClearLayers() resets all three ids to inactive
// every render, so all three must be turned back on explicitly (the parent
// group's data-active does not cascade visibility to its children here).
function crownLayerIds(material: RestorationMaterial): string[] {
  return material === "telescope"
    ? ["telescope-crown", "telescope-crown-inside", "telescope-crown-outside"]
    : [`${material}-crown`];
}

export function composeRestorationLayers(type: RestorationType, material: RestorationMaterial, view: ToothView): string[] {
  if (type === "none" || material === "none") return [];
  // An onlay is authored occlusal-only (it is never offered in the lateral-view
  // dropdown), but a tooth bearing one must still render in the lateral (front)
  // view, where an onlay is visually identical to an inlay. Fall back to the
  // material's inlay layer there — every onlay material is also a valid inlay
  // material, and the front-view tooth SVGs carry the `{material}-inlay` layers.
  if (type === "onlay" && view !== "occlusal") {
    return isValidRestoration("inlay", material, view) ? [`${material}-inlay`] : [];
  }
  if (!isValidRestoration(type, material, view)) return [];
  // B8: a bridge tooth shows both the crown cap and the saddle connector.
  // composeRestorationLayers has no pillar-vs-pontic context (that lives in
  // caller state), so this applies to every bridge tooth uniformly: a present
  // pillar reads as crown+connector (desired); a gap pontic activates the
  // crown-shaped body too, which reads as the pontic crown (acceptable —
  // see .superpowers/sdd/task-2-brief.md Step 3). `${material}-crown` (or the
  // 3-id telescope set) is confirmed to exist for every bridge material
  // (grepped teeth-svgs/11.svg).
  if (type === "bridge") return [...crownLayerIds(material), `${material}-bridge-connector`];
  if (type === "crown") return crownLayerIds(material);
  return [`${material}-${type}`];
}

// Every valid (type,material) combo layer id, for the render clear-set.
export function allRestorationLayers(): string[] {
  const out = new Set<string>();
  for (const type of Object.keys(RESTORATION_MATRIX) as (keyof typeof RESTORATION_MATRIX)[])
    for (const material of RESTORATION_MATRIX[type].materials)
      for (const view of ["front","occlusal"] as ToothView[])
        composeRestorationLayers(type, material, view).forEach(id => out.add(id));
  return [...out];
}

export interface RestorationOption {
  restorationType: RestorationType; restorationMaterial: RestorationMaterial;
  labelKey: string; // for "none"; combos carry typeLabelKey+materialLabelKey instead
  typeLabelKey?: string; materialLabelKey?: string; prefixKey?: string;
  // Set on a "Kivehető:" (removable) entry — selecting it writes `s.prosthesis`
  // and clears restorationType/material (a tooth has EITHER a fixed restoration
  // OR a prosthesis, never both). `restorationType`/`restorationMaterial` stay
  // "none" on these options so the shape is uniform.
  prosthesis?: ProsthesisValue;
}

export type ProsthesisValue =
  | "healing-abutment" | "locator" | "locator-denture" | "bar" | "bar-denture"
  | "removable-partial" | "removable-full";

// Gate the prosthesis half of the combined dropdown: `isImplant` for an implant
// tooth, `toothSelection === "none"` (a gap) for a removable denture.
export interface RestorationOptionsCtx { isImplant?: boolean; view?: ToothView; toothSelection?: string }

// Implants carry a fixed crown/bridge on an abutment, never an inlay/onlay/
// veneer (those need natural tooth substrate) — so the dropdown for an implant
// tooth is restricted to those two restoration types.
const IMPLANT_RESTORATION_TYPES: (keyof typeof RESTORATION_MATRIX)[] = ["crown", "bridge"];

// "Kivehető:" (removable) prosthesis entries appended after the fixed ones.
// Implant abutments carry attachments; a gap carries a removable denture.
const IMPLANT_PROSTHESIS: ProsthesisValue[] = ["healing-abutment", "locator", "locator-denture", "bar", "bar-denture"];
const GAP_PROSTHESIS: ProsthesisValue[] = ["removable-partial", "removable-full"];

// A gap (missing tooth, `toothSelection === "none"`) can only carry a bridge
// pontic among the fixed types — a standalone crown/inlay/onlay/veneer needs
// tooth substrate that isn't there. (Not applicable when isImplant is set —
// that ctx combination doesn't occur, but isImplant still takes precedence.)
const GAP_RESTORATION_TYPES: (keyof typeof RESTORATION_MATRIX)[] = ["bridge"];

export function restorationOptions(view: ToothView, ctx: RestorationOptionsCtx = {}): RestorationOption[] {
  const opts: RestorationOption[] = [
    { restorationType: "none", restorationMaterial: "none", labelKey: "restoration.none" },
  ];
  const isGap = !ctx.isImplant && ctx.toothSelection === "none";
  const types = ctx.isImplant
    ? IMPLANT_RESTORATION_TYPES
    : isGap
      ? GAP_RESTORATION_TYPES
      : (Object.keys(RESTORATION_MATRIX) as (keyof typeof RESTORATION_MATRIX)[]);
  for (const type of types) {
    const spec = RESTORATION_MATRIX[type];
    if (spec.occlusalOnly && view !== "occlusal") continue;
    for (const material of spec.materials) {
      opts.push({
        restorationType: type, restorationMaterial: material,
        labelKey: "", prefixKey: "restoration.prefix.fixed",
        typeLabelKey: LABEL_KEY.type(type), materialLabelKey: LABEL_KEY.material(material),
      });
    }
  }
  // "Kivehető:" (removable) prosthesis half of the combined dropdown.
  const prosthesisValues = ctx.isImplant
    ? IMPLANT_PROSTHESIS
    : (isGap ? GAP_PROSTHESIS : []);
  for (const p of prosthesisValues) {
    opts.push({
      restorationType: "none", restorationMaterial: "none",
      labelKey: "", prefixKey: "restoration.prefix.removable",
      prosthesis: p,
    });
  }
  return opts;
}
