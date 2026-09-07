// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { assignEntryIdentities } from "../../fhir/primitives";
import { fileURLToPath } from "node:url";
import { payloadCases } from "../../__tests__/parity/matrix";
import { buildFhirBundleFromRegistry } from "../fhir";

const here = import.meta.url;
const golden = JSON.parse(readFileSync(fileURLToPath(new URL("../../__tests__/parity/fhir-golden.json", here)), "utf8"));

// Strip the bespoke Condition resources: buildFhirBundleFromRegistry is the
// registry-only path and never emits them (perio K05 / dental K02 Conditions
// are added by the full buildFhirBundle on top). The golden is captured from
// the full builder, so compare the registry builder against golden-minus-Conditions.
const withoutConditions = (bundle: { entry?: { resource?: { resourceType?: string } }[] }) => ({
  ...bundle,
  entry: (bundle.entry ?? []).filter((e) => e.resource?.resourceType !== "Condition"),
});

describe("registry-driven toFhir matches the pre-rewrite engine", () => {
  it("equals the frozen FHIR golden", () => {
    payloadCases().forEach((p, i) =>
      expect((() => { const b = buildFhirBundleFromRegistry(p.payload); assignEntryIdentities(b); return b; })(), p.name).toEqual(withoutConditions(golden[i].bundle)));
  });
  it("matches frozen snapshots for note / customStates / custom subject (branches outside the matrix)", () => {
    const noteP = { teeth: { "11": { note: "chipped mesial" } } };
    const customP = { teeth: { "11": { customStates: { pluginA: "x", pluginB: 3, pluginC: true } } } };
    // `crownMaterial` is no longer a live FHIR-mapped field (SP3a core swap) —
    // restorationType/restorationMaterial are its replacement axes. Authored
    // directly with the new-model equivalent of the old "metal" (now
    // metal-ceramic) crown, so this still exercises a real restoration
    // finding through the custom-subject option.
    const subjP = { teeth: { "11": { restorationType: "crown", restorationMaterial: "metal-ceramic" } } };
    const opts = { subject: "Patient/xyz" };
    expect(buildFhirBundleFromRegistry(noteP as any)).toMatchInlineSnapshot(`
      {
        "entry": [
          {
            "fullUrl": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/Patient/odontogram-subject",
            "resource": {
              "id": "odontogram-subject",
              "resourceType": "Patient",
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "tooth-note",
                    "display": "Tooth note",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Tooth note",
              },
              "note": [
                {
                  "text": "chipped mesial",
                },
              ],
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/Patient/odontogram-subject",
              },
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      }
    `);
    expect(buildFhirBundleFromRegistry(customP as any)).toMatchInlineSnapshot(`
      {
        "entry": [
          {
            "fullUrl": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/Patient/odontogram-subject",
            "resource": {
              "id": "odontogram-subject",
              "resourceType": "Patient",
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "custom-state:pluginA",
                    "display": "Custom state: pluginA",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Custom state: pluginA",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/Patient/odontogram-subject",
              },
              "valueString": "x",
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "custom-state:pluginB",
                    "display": "Custom state: pluginB",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Custom state: pluginB",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/Patient/odontogram-subject",
              },
              "valueQuantity": {
                "value": 3,
              },
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "custom-state:pluginC",
                    "display": "Custom state: pluginC",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Custom state: pluginC",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/Patient/odontogram-subject",
              },
              "valueBoolean": true,
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      }
    `);
    expect(buildFhirBundleFromRegistry(subjP as any, opts)).toMatchInlineSnapshot(`
      {
        "entry": [
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "restoration-type",
                    "display": "Restoration type",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Restoration type",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "Patient/xyz",
              },
              "valueCodeableConcept": {
                "coding": [
                  {
                    "code": "crown",
                    "display": "Crown",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Crown",
              },
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "restoration-material",
                    "display": "Restoration material",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Restoration material",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "Patient/xyz",
              },
              "valueCodeableConcept": {
                "coding": [
                  {
                    "code": "metal-ceramic",
                    "display": "Metal-ceramic (PFM)",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Metal-ceramic (PFM)",
              },
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      }
    `);
  });
});
