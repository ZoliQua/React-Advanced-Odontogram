// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { OdontogramExportPayload, ToothRecord } from "../fhir/types";
import { localCode, ensureTooth } from "../fhir/primitives";
import { AXES } from "./axes";
import type { ClinicalAxis } from "./types";
import { deciduousToFdi } from "../fhir/iso3950";
import { importDiagnosisConditions } from "../fhir/importConditions";
import { importPerioObservations } from "../fhir/importPerio";

// Reverse lookup: finding code -> axis.
const BY_FINDING: Record<string, ClinicalAxis> = {};
for (const a of AXES) BY_FINDING[a.finding.local] = a;

/** A syntactically valid tooth code: exactly two digits. Tooth codes (FDI
 *  permanent 11-48, ISO 3950 deciduous, and the odd synthetic key) are always
 *  numeric, so this stays lenient on the numeric range while REJECTING the
 *  prototype-polluting keys an untrusted `bodySite` could carry — `"__proto__"`,
 *  `"constructor"`, `"prototype"` are non-numeric and would otherwise reach
 *  {@link ensureTooth} and pollute `Object.prototype`. */
function isToothCode(id: string): boolean {
  return /^\d{2}$/.test(id);
}

/** Registry-driven inverse of buildFhirBundleFromRegistry: parse a FHIR bundle into an export payload. */
export function parseFhirBundleFromRegistry(bundle: unknown): OdontogramExportPayload {
  const teeth: Record<string, ToothRecord> = {};
  const globals: Record<string, boolean> = {};
  const entries = (bundle as { entry?: unknown })?.entry;
  if (Array.isArray(entries)) {
    for (const e of entries) {
      const res = (e as { resource?: unknown })?.resource as {
        resourceType?: string; code?: unknown;
        bodySite?: { coding?: Array<{ system?: string; code?: string }> };
        valueCodeableConcept?: unknown; valueBoolean?: unknown; valueString?: unknown;
        valueQuantity?: { value?: unknown };
        component?: Array<{ code?: unknown; valueCodeableConcept?: unknown; valueBoolean?: unknown; valueInteger?: unknown }>;
        note?: Array<{ text?: unknown }>;
      } | undefined;
      if (!res || res.resourceType !== "Observation") continue;

      const findingCode = localCode(res.code);
      if (!findingCode) continue;
      const rawToothCode = res.bodySite?.coding?.find((c) => typeof c.code === "string")?.code;
      const toothId = rawToothCode ? (deciduousToFdi(rawToothCode) ?? rawToothCode) : undefined;

      if (findingCode === "edentulous") { globals.edentulous = res.valueBoolean === true; continue; }
      if (!toothId || !isToothCode(toothId)) continue;
      const rec = ensureTooth(teeth, toothId);

      if (findingCode === "tooth-note") {
        const text = res.note?.[0]?.text;
        if (typeof text === "string") rec.note = text;
        continue;
      }
      if (findingCode.startsWith("custom-state:")) {
        const id = findingCode.slice("custom-state:".length);
        const val = typeof res.valueString === "string" ? res.valueString
          : typeof res.valueBoolean === "boolean" ? res.valueBoolean
          : typeof res.valueQuantity?.value === "number" ? res.valueQuantity.value
          : undefined;
        if (val !== undefined) { (rec.customStates ??= {})[id] = val; }
        continue;
      }
      // Recurrent-caries severity rides on the `caries` set's components (parsed
      // into `cariesSeverity` below) for native (>=2.4) bundles, so the emit side
      // (registry/fhir.ts) no longer produces a `secondary-caries` Observation. A
      // legacy bundle still carries it as a standalone per-surface Observation
      // (CARS score), separate from the `caries` set's `valueInteger` (ICDAS
      // depth) — so this reader must stay to avoid silently dropping the
      // recurrent-caries score on import. It's parsed into the legacy
      // `rec.secondaryCaries` map; `hydrateState`'s migration merge (odontogram.ts)
      // folds it into the unified `cariesSeverity`, preferring it over the `caries`
      // component's ICDAS depth on a recurrent (caried + filled) surface.
      if (findingCode === "secondary-caries") {
        const vals: Record<string, number> = {};
        for (const c of res.component ?? []) {
          const surf = localCode(c.code);
          const vi = c.valueInteger;
          if (surf && typeof vi === "number") vals[surf] = vi;
        }
        if (Object.keys(vals).length) rec.secondaryCaries = vals;
        continue;
      }
      if (findingCode === "radiographic-caries-depth") {
        const vals: Record<string, string> = {};
        for (const c of res.component ?? []) {
          const surf = localCode(c.code);
          const val = localCode(c.valueCodeableConcept);
          if (surf && val) vals[surf] = val;
        }
        if (Object.keys(vals).length) rec.radiographicDepth = vals;
        continue;
      }
      if (findingCode === "filling-defect") {
        const vals: Record<string, string> = {};
        for (const c of res.component ?? []) {
          const surf = localCode(c.code);
          const val = localCode(c.valueCodeableConcept);
          if (surf && val) vals[surf] = val;
        }
        if (Object.keys(vals).length) rec.fillingDefect = vals;
        continue;
      }

      const axis = BY_FINDING[findingCode];
      if (!axis) continue;

      if (axis.kind === "enum") {
        const v = localCode(res.valueCodeableConcept);
        if (v) (rec as Record<string, unknown>)[axis.field] = v;
      } else if (axis.kind === "boolean") {
        if (res.valueBoolean === true) (rec as Record<string, unknown>)[axis.field] = true;
      } else if (axis.kind === "set") {
        const vals = (res.component ?? []).map((c) => localCode(c.code)).filter((x): x is string => !!x);
        if (vals.length) (rec as Record<string, unknown>)[axis.field] = vals;
        if (axis.field === "caries") {
          // The caries components' `valueInteger` is the unified per-surface
          // `cariesSeverity`.
          const severity: Record<string, number> = {};
          for (const c of res.component ?? []) {
            const code = localCode(c.code);
            if (!code) continue;
            const vi = c.valueInteger;
            if (typeof vi === "number") severity[String(code).replace("caries-", "")] = vi;
          }
          if (Object.keys(severity).length) rec.cariesSeverity = severity;
        }
      } else if (axis.kind === "restoration") {
        const fsm: Record<string, string> = {};
        for (const c of res.component ?? []) {
          const surf = localCode(c.code);
          const mat = localCode(c.valueCodeableConcept);
          if (surf && mat) fsm[surf] = mat;
        }
        if (Object.keys(fsm).length) rec.fillingSurfaceMaterials = fsm;
      }
    }
  }
  // Reconcile a legacy bundle's ambiguous `cariesSeverity` guess (populated above
  // straight off the `caries` component's `valueInteger` — correct for a native
  // >=2.4 bundle, but actually the ICDAS depth on a legacy bundle) against an
  // explicit `secondary-caries` CARS reading on the same surface. A native bundle
  // never emits `secondary-caries` (see registry/fhir.ts), so `rec.secondaryCaries`
  // is only ever populated here for a legacy import — this is a no-op for every
  // native round-trip. Where both exist, drop the ambiguous guess for that surface
  // so `hydrateState`'s raw-source priority (odontogram.ts: no explicit
  // `cariesSeverity` -> prefer `secondaryCaries` over `cariesDepths` on a
  // filled/recurrent surface) resolves it correctly to the CARS score, not the
  // ICDAS depth.
  for (const rec of Object.values(teeth)) {
    if (!rec.secondaryCaries || !rec.cariesSeverity) continue;
    for (const surf of Object.keys(rec.secondaryCaries)) delete rec.cariesSeverity[surf];
    if (Object.keys(rec.cariesSeverity).length === 0) delete rec.cariesSeverity;
  }
  // DX-9: the LOINC periodontal panels (per-tooth perio record) and the
  // smoking/HbA1c evidence Observations (case block).
  const perio = importPerioObservations(entries, teeth);
  // DX-7: reconstruct the diagnosis layer from Condition resources — case
  // conditions (direct) + per-tooth dxOverrides (diff vs the re-derived chart).
  const { caseConditions, dxOverridesByTooth } = importDiagnosisConditions(entries, teeth);
  for (const [toothId, ov] of Object.entries(dxOverridesByTooth)) {
    ensureTooth(teeth, toothId).dxOverrides = ov;
  }
  const payload: OdontogramExportPayload = { version: "2.20", globals, teeth };
  const caseBlock: NonNullable<OdontogramExportPayload["case"]> = { ...perio.case };
  if (Object.keys(caseConditions).length > 0) caseBlock.caseConditions = caseConditions;
  if (Object.keys(caseBlock).length > 0) payload.case = caseBlock;
  return payload;
}
