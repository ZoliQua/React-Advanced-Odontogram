// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Pulp / apical / resorption diagnosis authoring — the option lists, labels and
 * value maps behind the merged Pulp-Endo picker, the apical-diagnosis picker and
 * the wear/discoloration/ortho pickers, plus the `pulpDetailLevel` setting the
 * pulp picker is driven by. Extracted from odontogram.ts.
 *
 * The setting lives here because this is the domain that reads it; odontogram.ts
 * keeps the public `setPulpDetailLevel()`, which calls {@link applyPulpDetailLevel}
 * and then does the DOM work (re-sync the active tooth's controls, refresh every
 * tooltip) that cannot move with it.
 *
 * Pure: option/label builders over the registry and i18n, with no chart state
 * and no DOM, so it never imports odontogram.ts back.
 */

import { t } from "../i18n/useI18n";
import { optionsFor, isAxisFlagSatisfied } from "../registry/uiOptions";
import {
  VALID_APICAL_DX, VALID_DISCOLORATION, VALID_ENDO, VALID_ORTHO_APPLIANCE,
  VALID_ORTHO_DRIFT, VALID_ORTHO_VERTICAL, VALID_PULP_DX, VALID_PULP_LATIN,
  VALID_RESORPTION_TYPE, VALID_WEAR_CERVICAL, VALID_WEAR_EDGE,
} from "./payload";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors the engine-wide `Any` alias
type Any = any;

export function getEndoOptions(isMilktooth: Any){
  return optionsFor("endo", { isMilktooth: !!isMilktooth }).map(o => ({ value: o.value, label: t(o.labelKey) }));
}

// ---- Pulp detail level (the setting this domain is driven by) ----
// "simple" (healthy/pulpitis), "aae" (4 AAE pulpDx values, default) or "latin"
// (9 practical-Latin pulpLatin subtypes).
let pulpDetailLevel: PulpDetailLevel = "aae";

/** Set the level, coercing anything unknown to "aae". Returns `true` when the
 *  value actually changed — odontogram.ts's `setPulpDetailLevel()` uses that to
 *  decide whether the (DOM-side) re-sync and tooltip refresh are needed. */
export function applyPulpDetailLevel(value: PulpDetailLevel): boolean {
  const next = (value === "simple" || value === "latin") ? value : "aae";
  if(next === pulpDetailLevel) return false;
  pulpDetailLevel = next;
  return true;
}
export function getPulpDetailLevel(): PulpDetailLevel { return pulpDetailLevel; }

// ---- Pulp/apical/resorption diagnosis authoring ----
export type PulpDetailLevel = "simple" | "aae" | "latin";

// kebab-case value id -> camelCase i18n key suffix (e.g. "reversible-pulpitis"
// -> "reversiblePulpitis", "external-cervical" -> "externalCervical").
export function kebabToCamel(id: string): string {
  return String(id).replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
}

// Each practical-Latin pulp subtype collapses to exactly one AAE `pulpDx`
// parent: pulpa-sana = normal; hyperaemia =
// reversible; every "pulpitis acuta/chronica" = irreversible; necrosis /
// gangraena = necrosis. "none" (no Latin subtype recorded) maps to the
// healthy parent.
export const PULP_LATIN_PARENT: Record<string, string> = {
  "none": "normal",
  "pulpa-sana": "normal",
  "hyperaemia-pulpae": "reversible-pulpitis",
  "pulpitis-acuta-serosa": "irreversible-pulpitis",
  "pulpitis-acuta-purulenta": "irreversible-pulpitis",
  "pulpitis-chronica-clausa": "irreversible-pulpitis",
  "pulpitis-chronica-ulcerosa": "irreversible-pulpitis",
  "pulpitis-chronica-hyperplastica": "irreversible-pulpitis",
  "necrosis-pulpae": "necrosis",
  "gangraena-pulpae": "necrosis",
};

// Representative Latin subtype per AAE parent — used ONLY to display an
// AAE/simple-authored value (pulpLatin:"none") when the panel is in "latin"
// mode. Never written back to state (display-only collapse).
export const PULP_DX_TO_LATIN: Record<string, string> = {
  "normal": "pulpa-sana",
  "reversible-pulpitis": "hyperaemia-pulpae",
  "irreversible-pulpitis": "pulpitis-acuta-serosa",
  "necrosis": "necrosis-pulpae",
};

/** Option {value,labelKey} list for the pulp control at a given detail level.
 *  simple -> 2 (healthy / pulpitis); aae -> the 4 pulpDx values; latin -> the 9
 *  pulpLatin subtypes. The "latin" branch consults `ClinicalAxis.flag`
 *  (`isAxisFlagSatisfied` — the first consumer of the registry feature-flag
 *  gate). Pure; reads no module state. */
export function pulpSelectOptionValues(level: PulpDetailLevel): { value: string; labelKey: string }[] {
  if(level === "latin" && isAxisFlagSatisfied("pulpLatin", { latinPulpDetail: true })){
    return Array.from(VALID_PULP_LATIN).filter(v => v !== "none")
      .map(v => ({ value: v, labelKey: "pulpLatin." + kebabToCamel(v) }));
  }
  if(level === "simple"){
    return [
      { value: "normal", labelKey: "pulpDx.normal" },
      { value: "irreversible-pulpitis", labelKey: "pulpDx.irreversiblePulpitis" },
    ];
  }
  return Array.from(VALID_PULP_DX).map(v => ({ value: v, labelKey: "pulpDx." + kebabToCamel(v) }));
}

/** Maps a pulp-control selection to the {pulpDx,pulpLatin} it writes. At "latin"
 *  the selected Latin value sets `pulpLatin` and its parent `pulpDx`; at
 *  "simple"/"aae" the value is a `pulpDx` and `pulpLatin` is cleared to "none". */
/** The periapical lesion subtype (granuloma / cyst) is a refinement of
 *  apical periodontitis, so its row (#periapicalTypeRow) shows only when the
 *  apical diagnosis is symptomatic or asymptomatic apical periodontitis. Other
 *  apicalDx values (abscess forms, condensing osteitis, normal) carry no
 *  granuloma/cyst refinement. Non-present teeth keep apicalDx="normal" (their
 *  glyph is driven by mods.inflammation in the render, unchanged) so the row is
 *  hidden for them — subtype authoring on implant/missing is deferred to the
 *  peri-implantitis sub-project. */
export function periapicalRowVisible(state: Any): boolean {
  return state.apicalDx === "symptomatic-apical-periodontitis"
    || state.apicalDx === "asymptomatic-apical-periodontitis";
}

export function pulpSelectionToState(level: PulpDetailLevel, value: string): { pulpDx: string; pulpLatin: string }{
  if(level === "latin"){
    return { pulpLatin: value, pulpDx: PULP_LATIN_PARENT[value] ?? "normal" };
  }
  return { pulpDx: value, pulpLatin: "none" };
}

/** The option value to SHOW for a stored state at a given level (display-only
 *  collapse; never mutates state). latin -> stored pulpLatin (or a representative
 *  for pulpDx when only pulpDx is set); aae -> pulpDx; simple -> healthy vs. the
 *  single pulpitis bucket. */
export function pulpDisplayValue(level: PulpDetailLevel, state: { pulpDx?: string; pulpLatin?: string }): string {
  const pulpDx = state.pulpDx ?? "normal";
  const pulpLatin = state.pulpLatin ?? "none";
  if(level === "simple") return pulpDx === "normal" ? "normal" : "irreversible-pulpitis";
  if(level === "latin") return pulpLatin !== "none" ? pulpLatin : (PULP_DX_TO_LATIN[pulpDx] ?? "pulpa-sana");
  return pulpDx;
}

export function getPulpOptions(): { value: string; label: string }[]{
  return pulpSelectOptionValues(pulpDetailLevel).map(o => ({ value: o.value, label: t(o.labelKey) }));
}

// A value belongs to the "treated (endo)" branch iff it is a non-"none" endo
// value; otherwise it is a vital pulp value. `endo`/`pulpDx` never share a
// value, so this disambiguation is total.
export function isEndoValue(value: string): boolean {
  return value !== "none" && VALID_ENDO.has(value);
}

// The merged selector's displayed value. A treated tooth shows its endo value;
// otherwise the pulp value collapsed to the active detail level.
export function pulpEndoDisplayValue(state: Any): string {
  if(state.endo && state.endo !== "none") return state.endo;
  return pulpDisplayValue(pulpDetailLevel, state);
}

// Build/refresh the grouped #pulpEndoSelect. Two <optgroup>s: vital pulp
// diagnoses (at the active detail level) and treated endo options (non-"none",
// milktooth-filtered). Selection is applied by pulpEndoOnSelect.
export function buildPulpEndoSelect(sel: Any, isMilktooth: boolean, selected: string, omitPulpDx: boolean = false): void {
  if(!sel) return;
  sel.innerHTML = "";
  const mkGroup = (labelKey: string, opts: { value: string; label: string }[]) => {
    const g = document.createElement("optgroup");
    g.label = t(labelKey);
    for(const o of opts){
      const el = document.createElement("option");
      el.value = o.value; el.textContent = o.label;
      g.appendChild(el);
    }
    sel.appendChild(g);
  };
  if(!omitPulpDx){
    // Status: the vital-pulp DIAGNOSIS group + the treated-endo group.
    mkGroup("pulpEndo.groupVital", getPulpOptions());
    mkGroup("pulpEndo.groupTreated", getEndoOptions(isMilktooth).filter(o => o.value !== "none"));
    sel.value = selected;
  }else{
    // Plan-mode: an ENDO TREATMENT picker only — the vital-pulp diagnosis
    // group (pulpitis/necrosis) is a status finding, out of scope for a plan.
    // A standalone "none" (no endo planned) plus the treated-endo options; the
    // displayed value collapses any non-endo (healthy/diseased-pulp) state to
    // "none" so a plan never shows a pulp diagnosis.
    const endoOpts = getEndoOptions(isMilktooth);
    const none = endoOpts.find(o => o.value === "none");
    if(none){
      const el = document.createElement("option");
      el.value = none.value; el.textContent = none.label;
      sel.appendChild(el);
    }
    mkGroup("pulpEndo.groupTreated", endoOpts.filter(o => o.value !== "none"));
    sel.value = isEndoValue(selected) ? selected : "none";
  }
}

// Apply a merged-selector choice, enforcing the mutual-exclusion invariant
// (mirrors the hydrate-time normalize at s.endo assignment, above).
export function pulpEndoOnSelect(s: Any, value: string): void {
  if(value === "none"){
    // Plan-mode "no endo planned": clear the endo treatment, leave the
    // (Plan-hidden) pulp diagnosis untouched. In Status the vital group's
    // healthy option is used instead, so this branch is Plan-only in practice.
    s.endo = "none";
    return;
  }
  if(isEndoValue(value)){
    s.endo = value;
    s.pulpDx = "normal";
    s.pulpLatin = "none";
  }else{
    s.endo = "none";
    const mapped = pulpSelectionToState(pulpDetailLevel, value);
    s.pulpDx = mapped.pulpDx;
    s.pulpLatin = mapped.pulpLatin;
  }
}

export function getApicalDxOptions(): { value: string; label: string }[]{
  return Array.from(VALID_APICAL_DX).map(v => ({ value: v, label: t("apicalDx." + kebabToCamel(v)) }));
}
export function getResorptionOptions(): { value: string; label: string }[]{
  return Array.from(VALID_RESORPTION_TYPE).map(v => ({ value: v, label: t("resorption.type." + kebabToCamel(v)) }));
}
export function getWearEdgeOptions(): { value: string; label: string }[]{
  return Array.from(VALID_WEAR_EDGE).map(v => ({ value: v, label: t("wearType." + v) }));
}
export function getWearCervicalOptions(): { value: string; label: string }[]{
  return Array.from(VALID_WEAR_CERVICAL).map(v => ({ value: v, label: t("wearType." + v) }));
}
export function getDiscolorationOptions(): { value: string; label: string }[]{
  return Array.from(VALID_DISCOLORATION).map(v => ({ value: v, label: t("discoloration." + v) }));
}

// Orthodontic axis option builders. Exported so the declarative
// `OrthodonticsCard` (composable-UI Tier 3) renders the same `<option>` sets the
// imperative `buildSelect(...)` wiring produced.
export function getOrthoApplianceOptions(): { value: string; label: string }[]{
  return Array.from(VALID_ORTHO_APPLIANCE).map(v => ({ value: v, label: t("ortho.appliance." + v) }));
}
export function getOrthoDriftOptions(): { value: string; label: string }[]{
  return Array.from(VALID_ORTHO_DRIFT).map(v => ({ value: v, label: t("ortho.drift." + v) }));
}
export function getOrthoVerticalOptions(): { value: string; label: string }[]{
  return Array.from(VALID_ORTHO_VERTICAL).map(v => ({ value: v, label: t("ortho.vertical." + v) }));
}

// #bruxismRow visibility gate — aligned to the render gate
// (__renderActiveLayers' wearAllowed) by requiring toothSubstrate === "natural".
export function wearRowAllowed(s: Any): boolean{
  return s?.toothSelection === "tooth-base" && s?.restorationType === "none" && s?.toothSubstrate === "natural";
}
export function __wearRowAllowedForTest(s: Record<string, unknown>): boolean {
  return wearRowAllowed(s);
}

// Discoloration crown tint. Fill is NOT recorded by the SVG-fingerprint
// (collectActiveLayers captures id/opacity/cls only) — parity-safe. Applies to the
// natural crown of a permanent OR milk tooth (no restoration, natural substrate).
export const DISCOLORATION_TINT: Record<string, string> = {
  tetracycline: "#9c8f7a", fluorosis: "#d9c9a3", nonvital: "#a89a8a", extrinsic: "#c2a86a", other: "#b5a894",
};
export function discolorationAllowed(s: Any): boolean {
  return (s?.toothSelection === "tooth-base" || s?.toothSelection === "milktooth")
    && s?.restorationType === "none" && s?.toothSubstrate === "natural";
}
export function __discolorationAllowedForTest(s: Record<string, unknown>): boolean { return discolorationAllowed(s); }
// Named alias for the #discolorationRow visibility-gate test seam (mirrors
// __wearRowAllowedForTest); same underlying predicate as the render gate above —
// the row's visibility must never contradict the chart.
export function __discolorationRowAllowedForTest(s: Record<string, unknown>): boolean { return discolorationAllowed(s); }

// Orthodontic glyphs (appliance/drift/vertical/rotation) — gated to a present
// natural tooth (permanent or milk), same shape as discolorationAllowed above
// minus the restoration/substrate constraints (ortho hardware can sit on a
// restored tooth). ONE shared predicate reused by the UI picker and the
// whole-mouth summary, so the gate never forks.
export function orthoAllowed(s: Any): boolean {
  return s?.toothSelection === "tooth-base" || s?.toothSelection === "milktooth";
}
export function __orthoAllowedForTest(s: Record<string, unknown>): boolean { return orthoAllowed(s); }
// Named alias for the #orthoCard visibility-gate test seam (mirrors
// __discolorationRowAllowedForTest); same underlying predicate as the render
// gate above — the card's visibility must never contradict the chart.
export function __orthoCardAllowedForTest(s: Record<string, unknown>): boolean { return orthoAllowed(s); }

