// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import type { Bundle, Observation, Patient, OdontogramExportPayload, ToothRecord, FhirExportOptions } from "../fhir/types";
import { LOCAL_SYSTEM, ICDAS_SYSTEM, ICDAS_DISPLAYS } from "../fhir/codesystems";
import {
  valueConcept, findingConcept, baseObservation, EXAM_CATEGORY,
  PLACEHOLDER_PATIENT_ID, PLACEHOLDER_PATIENT_FULLURL,
} from "../fhir/primitives";
import { AXES } from "./axes";
import type { ClinicalAxis } from "./types";
import { toothBodySiteCode } from "../fhir/iso3950";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

/** Emit zero or more Observations for one tooth field, per its axis. */
function emitForAxis(subjectRef: string, tooth: string, rec: ToothRecord, axis: ClinicalAxis): Observation[] {
  const raw = (rec as Record<string, unknown>)[axis.field];
  const finding = () => findingConcept(axis.finding.local, axis.finding.display);
  switch (axis.kind) {
    case "enum": {
      const value = typeof raw === "string" ? raw : "";
      if (!value || value === axis.skipValue) return [];
      const obs = baseObservation(subjectRef, tooth, finding());
      obs.valueCodeableConcept = valueConcept(axis.valueGroup as string, value);
      return [obs];
    }
    case "boolean": {
      if (raw !== true) return [];
      const obs = baseObservation(subjectRef, tooth, finding());
      obs.valueBoolean = true;
      return [obs];
    }
    case "set": {
      const arr = Array.isArray(raw) ? (raw as unknown[]).filter((v): v is string => typeof v === "string") : [];
      if (arr.length === 0) return [];
      const obs = baseObservation(subjectRef, tooth, finding());
      // The unified per-surface `cariesSeverity` (0..6) rides on each caries
      // component as `valueInteger`. Primary vs recurrent is distinguished by the
      // filling coincidence (the separate restoration Observation), not by a
      // distinct finding code.
      const severity = axis.field === "caries"
        ? ((rec as Record<string, unknown>).cariesSeverity as Record<string, number> | undefined)
        : undefined;
      obs.component = arr.map((v) => {
        const comp: Any = { code: valueConcept(axis.valueGroup as string, v), valueBoolean: true };
        if (severity) {
          const surface = String(v).replace("caries-", "");
          const code = severity[surface];
          if (typeof code === "number") {
            comp.valueInteger = code; delete comp.valueBoolean;
            // The scoring-system coding rides on the component's code alongside
            // the surface coding: ICDAS on a primary (unfilled) surface, CARS on
            // a recurrent (filled) one — same predicate as the engine's own
            // primary-vs-recurrent render split. Import is unaffected: localCode()
            // matches the FIRST LOCAL_SYSTEM coding (the surface, index 0).
            const fsm = (rec as Record<string, unknown>).fillingSurfaceMaterials;
            const filled = !!fsm && typeof fsm === "object" && surface in (fsm as Record<string, unknown>);
            const scoring = filled
              ? { system: LOCAL_SYSTEM, code: `cars-${code}`, display: `CARS score ${code}` }
              : { system: ICDAS_SYSTEM, code: `ICDAS-${code}`, display: ICDAS_DISPLAYS[code] ?? `ICDAS ${code}` };
            comp.code = { ...comp.code, coding: [...(comp.code.coding ?? []), scoring] };
          }
        }
        return comp;
      });
      return [obs];
    }
    case "restoration": {
      const fsm = (rec as Record<string, unknown>).fillingSurfaceMaterials;
      const perSurface: Array<[string, string]> = [];
      if (fsm && typeof fsm === "object") {
        for (const [surf, mat] of Object.entries(fsm as Record<string, unknown>))
          if (typeof mat === "string" && mat) perSurface.push([surf, mat]);
      }
      if (perSurface.length === 0) {
        const material = typeof raw === "string" ? raw : "";
        const surfaces = Array.isArray(rec[axis.surfacesField as keyof ToothRecord] as unknown)
          ? ((rec[axis.surfacesField as keyof ToothRecord] as unknown[]).filter((v): v is string => typeof v === "string"))
          : [];
        if (material && material !== axis.skipValue) for (const s of surfaces) perSurface.push([s, material]);
      }
      if (perSurface.length === 0) return [];
      const obs = baseObservation(subjectRef, tooth, finding());
      obs.component = perSurface.map(([surf, mat]) => ({
        code: valueConcept("fillingSurfaces", surf),
        valueCodeableConcept: valueConcept("fillingMaterial", mat),
      }));
      return [obs];
    }
    default:
      return [];
  }
}

/** Registry-driven FHIR bundle build from an export payload. */
export function buildFhirBundleFromRegistry(payload: OdontogramExportPayload, options: FhirExportOptions = {}): Bundle {
  const teeth = payload && typeof payload === "object" && payload.teeth && typeof payload.teeth === "object" ? payload.teeth : {};
  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  const entries: Bundle["entry"] = [];

  if (!options.subject) {
    const patient: Patient = { resourceType: "Patient", id: PLACEHOLDER_PATIENT_ID };
    entries.push({ fullUrl: PLACEHOLDER_PATIENT_FULLURL, resource: patient });
  }

  const globals: Record<string, boolean> =
    payload && typeof payload === "object" && payload.globals && typeof payload.globals === "object" ? payload.globals : {};
  if (globals.edentulous === true) {
    const edentulousObs: Observation = {
      resourceType: "Observation", status: "final", category: EXAM_CATEGORY,
      code: { coding: [{ system: LOCAL_SYSTEM, code: "edentulous", display: "Edentulous (whole mouth)" }], text: "Edentulous (whole mouth)" },
      subject: { reference: subjectRef }, valueBoolean: true,
    };
    entries.push({ resource: edentulousObs });
  }

  for (const [tooth, recRaw] of Object.entries(teeth)) {
    const rec = (recRaw && typeof recRaw === "object" ? recRaw : {}) as ToothRecord;
    const siteTooth = toothBodySiteCode(tooth, rec);
    for (const axis of AXES) for (const obs of emitForAxis(subjectRef, siteTooth, rec, axis)) entries.push({ resource: obs });
    // The unified caries severity rides on the `caries` set's components (see
    // emitForAxis above); there is no standalone `secondary-caries` Observation.
    // `radiographicDepth` remains a separate per-surface scalar map with its own
    // finding code.
    const radiographicDepth = rec.radiographicDepth;
    if (radiographicDepth && typeof radiographicDepth === "object") {
      const comps = Object.entries(radiographicDepth).filter((e): e is [string, string] => typeof e[1] === "string");
      if (comps.length) {
        const obs = baseObservation(subjectRef, siteTooth, findingConcept("radiographic-caries-depth", "Radiographic caries depth"));
        obs.component = comps.map(([surf, val]) => ({
          code: valueConcept("fillingSurfaces", surf),
          valueCodeableConcept: valueConcept("radiographicDepth", val),
        }));
        entries.push({ resource: obs });
      }
    }
    const fillingDefect = rec.fillingDefect;
    if (fillingDefect && typeof fillingDefect === "object") {
      const comps = Object.entries(fillingDefect).filter((e): e is [string, string] => typeof e[1] === "string");
      if (comps.length) {
        const obs = baseObservation(subjectRef, siteTooth, findingConcept("filling-defect", "Filling defect"));
        obs.component = comps.map(([surf, val]) => ({
          code: valueConcept("fillingSurfaces", surf),
          valueCodeableConcept: valueConcept("fillingDefect", val),
        }));
        entries.push({ resource: obs });
      }
    }
    if (typeof rec.note === "string" && rec.note.trim().length > 0) {
      const noteObs = baseObservation(subjectRef, siteTooth, findingConcept("tooth-note", "Tooth note"));
      noteObs.note = [{ text: rec.note }];
      entries.push({ resource: noteObs });
    }
    const custom = rec.customStates;
    if (custom && typeof custom === "object") {
      for (const [pluginId, value] of Object.entries(custom)) {
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;
        const obs = baseObservation(subjectRef, siteTooth, {
          coding: [{ system: LOCAL_SYSTEM, code: `custom-state:${pluginId}`, display: `Custom state: ${pluginId}` }],
          text: `Custom state: ${pluginId}`,
        });
        if (typeof value === "string") obs.valueString = value;
        else if (typeof value === "number") obs.valueQuantity = { value };
        else obs.valueBoolean = value;
        entries.push({ resource: obs });
      }
    }
  }
  return { resourceType: "Bundle", type: "collection", entry: entries };
}
