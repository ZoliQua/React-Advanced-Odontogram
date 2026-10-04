// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * DX-11 — the PLAN chart as FHIR.
 *
 * The export has always been status-only: what the mouth IS. The plan chart —
 * the same mouth as it will be after treatment — had no FHIR representation at
 * all, so the half of the record a receiving system most wants (what is going
 * to be done) never left the engine.
 *
 * Each tooth axis whose planned value differs from the status value becomes one
 * `ServiceRequest` with `intent: "plan"`: the thing the clinician intends to
 * bring about on that tooth.
 *
 * Two deliberate limits, both about not inventing what we cannot verify:
 *
 *  - **The code is the intended clinical STATE, not a procedure nomenclature.**
 *    It is the engine's own axis-value concept — exactly the coding the status
 *    export already emits for that value (local, plus SNOMED where the registry
 *    has a verified id). Dental procedure nomenclatures (CDT is proprietary and
 *    US-only; SNOMED's procedure hierarchy is unmapped here) are out of scope,
 *    and a made-up procedure code would be worse than an honest state code. No
 *    new codes are introduced: the CodeSystem is unchanged.
 *  - **Only interventions are emitted** ({@link PLAN_SERVICE_AXES}). A plan
 *    chart can differ on a diagnosis or a measurement too (the pulp is normal
 *    again after endodontic treatment, the pocket is shallower); those are
 *    expected OUTCOMES, not services, and a `ServiceRequest` asking for
 *    "pulp: normal" would be nonsense. They stay in the JSON payload's `plan`.
 *
 * A flag that is switched OFF in the plan (an intention withdrawn) emits
 * nothing — there is no service to request. Pure aside from the `bundle.entry`
 * mutation, deterministic (fixed ids, no Date/random), and tolerant of a
 * malformed payload.
 */
import type { Bundle, OdontogramExportPayload, ServiceRequest, ToothRecord, FhirExportOptions } from "./types";
import { FDI_SYSTEM } from "./codesystems";
import { valueConcept, findingConcept, fhirFullUrl, PLACEHOLDER_PATIENT_FULLURL } from "./primitives";
import { toothBodySiteCode } from "./iso3950";
import { AXES } from "../registry/axes";
import type { ClinicalAxis } from "../registry/types";
import { ALL_TEETH } from "../anatomy/profiles";

/**
 * The axes that describe an INTERVENTION — the only ones a planned difference
 * turns into a `ServiceRequest`. Everything else the plan chart can differ on
 * is a finding or an expected outcome (see the module docstring).
 */
export const PLAN_SERVICE_AXES: readonly string[] = [
  "toothSelection",       // extraction, implant placement, a pontic
  "toothSubstrate",       // preparing the tooth (crownprep), a post-and-core root
  "restorationType",      // crown, bridge, inlay, onlay, veneer, filling
  "restorationMaterial",  // what it is made of
  "prosthesis",           // removable denture, locator, bar, healing abutment
  "endo",                 // root-canal treatment
  "endoResection",        // apicoectomy
  "fissureSealing",       // sealant
  "bridgePillar",         // abutment role in a span
  "parapulpalPin",        // pin-retained build-up
  "crownNeeded",          // an explicit "this tooth needs a crown" plan flag
  "crownReplace",         // …and "the crown must be replaced"
  "extractionPlan",       // …and "this tooth is to be extracted"
  "orthoAppliance",       // bracket / band
];

const PLAN_AXES: ClinicalAxis[] = AXES.filter((a) => PLAN_SERVICE_AXES.includes(a.id));

/** The plan chart's teeth, as the payload carries them — `payload.plan` is
 *  present only when a plan exists AND differs from the status chart, which is
 *  exactly when there is something to request. */
const planTeethOf = (payload: unknown): Record<string, ToothRecord> | null => {
  const p = payload as { plan?: unknown } | null | undefined;
  return p && typeof p === "object" && p.plan && typeof p.plan === "object"
    ? (p.plan as Record<string, ToothRecord>) : null;
};

const teethOf = (payload: unknown): Record<string, ToothRecord> => {
  const p = payload as { teeth?: unknown } | null | undefined;
  return p && typeof p === "object" && p.teeth && typeof p.teeth === "object"
    ? (p.teeth as Record<string, ToothRecord>) : {};
};

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** The English display of an axis value, for the human-readable note. */
function displayOf(axis: ClinicalAxis, value: string): string {
  if (!value) return "none";
  const found = axis.values?.find((v) => v.id === value);
  return found?.coding.display ?? value;
}

/**
 * Append one `ServiceRequest` per tooth per planned axis change.
 *
 * Reads both charts from the one payload: `teeth` is the mouth as it is,
 * `payload.plan` the mouth as it is meant to become (the export writes that key
 * only when a plan exists and differs). Contributes nothing when there is no
 * plan, or when the only differences are outside {@link PLAN_SERVICE_AXES}.
 */
export function appendPlanServiceRequests(
  bundle: Bundle,
  payload: OdontogramExportPayload,
  options: FhirExportOptions = {},
): void {
  const planTeeth = planTeethOf(payload);
  if (!planTeeth) return;
  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  const statusTeeth = teethOf(payload);

  for (const toothNo of ALL_TEETH) {
    const key = String(toothNo);
    const was = (statusTeeth[key] ?? {}) as Record<string, unknown>;
    const now = (planTeeth[key] ?? {}) as Record<string, unknown>;

    for (const axis of PLAN_AXES) {
      const before = was[axis.field];
      const after = now[axis.field];

      let code;
      if (axis.kind === "boolean") {
        // A flag RAISED in the plan is the request; lowering one withdraws an
        // intention and has no service to ask for.
        if (after !== true || before === true) continue;
        code = findingConcept(axis.finding.local, axis.finding.display);
      } else {
        const target = str(after);
        if (target === str(before)) continue;
        // A value cleared back to the axis default (the finding is gone in the
        // plan) is an outcome of some other planned service, not one itself.
        if (!target || target === axis.skipValue) continue;
        code = valueConcept(axis.valueGroup as string, target);
      }

      const request: ServiceRequest = {
        resourceType: "ServiceRequest",
        id: `odontogram-plan-${axis.id}-${key}`,
        status: "active",
        intent: "plan",
        code,
        subject: { reference: subjectRef },
        bodySite: [{ coding: [{ system: FDI_SYSTEM, code: toothBodySiteCode(key, now as { toothSelection?: string }) }] }],
        note: [{
          text: axis.kind === "boolean"
            ? `${axis.finding.display}: planned`
            : `${axis.finding.display}: ${displayOf(axis, str(before))} → ${displayOf(axis, str(after))}`,
        }],
      };
      (bundle.entry ??= []).push({ fullUrl: fhirFullUrl("ServiceRequest", request.id as string), resource: request });
    }
  }
}
