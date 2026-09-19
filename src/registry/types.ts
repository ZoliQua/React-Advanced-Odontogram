// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/** Registry type definitions for the clinical-axis engine. Types only. */

export type AxisKind = "enum" | "boolean" | "set" | "surfaceSet" | "restoration" | "derived" | "global";

/** Context for filtering curated UI option lists (`uiOptions` / `optionsFor`). */
export interface UiOptCtx { isMilktooth?: boolean }

/** A coded concept: local code always present; SNOMED/ICD optional and additive. */
export interface ConceptRef {
  local: string;                 // LOCAL_SYSTEM code — always present, round-trip key
  display: string;               // language-neutral English display
  snomed?: string;               // SNOMED CT id (optional)
  icd?: { system: string; code: string }[]; // ICD codes, system-agnostic (optional)
}

/** One allowed value of an axis. */
export interface AxisValue {
  id: string;                    // engine value id (e.g. "metal", "caries-occlusal")
  coding: ConceptRef;            // additive codings for this value
  labelKey?: string;             // i18n key (added in the UI stage)
  svgLayer?: string | string[];   // SVG layer id(s) this value toggles (render metadata)
}

/** Precomputed render context for flag activation (mirrors the render's derived booleans). */
export interface FlagCtx {
  isImplant: boolean; isMilktooth: boolean; underGum: boolean;
  extraction: boolean; isNone: boolean; toothPresent: boolean;
  fissureAllowed: boolean; contactAllowed: boolean; bruxismAllowed: boolean; extractionPlanAllowed: boolean;
}

/** One chartable tooth axis. */
export interface ClinicalAxis {
  id: string;                    // axis id (e.g. "crownMaterial")
  field: string;                 // ToothRecord field name this axis reads/writes
  kind: AxisKind;
  finding: ConceptRef;           // Observation.code concept (finding type)
  valueGroup?: string;           // LOCAL_VALUE_MAPS group for enum/set/restoration values
  values?: AxisValue[];          // allowed values (enum/set/surfaceSet/restoration)
  skipValue?: string;            // value that emits nothing (enum/restoration)
  surfacesField?: string;        // restoration axis: the ToothRecord field holding the surface list
  flag?: string;                 // feature-flag gate (e.g. "icdasEnabled")
  svgLayer?: string;                                    // boolean axis: the layer it toggles
  appliesWhen?: (ctx: FlagCtx, state: any) => boolean;  // boolean axis: gating predicate
  uiOptions?: { value: string; labelKey: string; when?: (ctx: UiOptCtx) => boolean }[]; // curated UI option list
}

/** Per-tooth rendering context. */
export interface ToothContext {
  fdi: number;
  template: 11 | 13 | 14 | 16;
  view: "front" | "occlusal";
  isAnterior: boolean;
  isMolar: boolean;
  mirror: boolean;
  rot: 0 | 180;
  fissureAllowed: boolean;
  milktoothAllowed: boolean;
}

/** Loosely-typed axis-keyed tooth state container. */
export type ToothState = Record<string, unknown>;
