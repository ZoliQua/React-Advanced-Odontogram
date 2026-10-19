// Host-supplied tooth templates: vetting of untrusted markup, per-profile keys (classic / measured / deciduous),
// and survival across a change of profile. See anatomy/templateOverrides.ts.
import { afterEach, describe, expect, it } from "vitest";
import {
  activeAnatomyProfile,
  getToothTemplateRejections,
  setToothAnatomy,
  setToothTemplateOverrides,
} from "../odontogram";
import { CLASSIC_PROFILE } from "../anatomy/profiles";
import { vetTemplate } from "../anatomy/templateOverrides";

const FACTORY_11 = CLASSIC_PROFILE.templates[11];
/** A harmless change of the factory drawing: same layers, the tooth outline painted red. */
const RED_11 = FACTORY_11.replace("<defs>", `<defs><!-- host drawing -->`).replace(/(<g id="tooth-base"[^>]*>)/, `$1`).replace("</svg>", `<g id="host-mark"><rect id="host-rect" width="1" height="1" fill="#f00"/></g></svg>`);
const inject = (markup: string) => FACTORY_11.replace("</svg>", `${markup}</svg>`);

afterEach(async () => {
  setToothTemplateOverrides(null);
  await setToothAnatomy("classic");
});

describe("the markup of a host template is vetted, not trusted", () => {
  it("every factory template of both profiles passes its own vetting (no false rejections)", async () => {
    for (const [k, v] of Object.entries(CLASSIC_PROFILE.templates)) expect(vetTemplate(v, v), `classic ${k}`).toHaveProperty("svg");
    for (const [k, v] of Object.entries(CLASSIC_PROFILE.templatesOccl)) expect(vetTemplate(v, v), `classic occl ${k}`).toHaveProperty("svg");
    await setToothAnatomy("measured");
    const m = activeAnatomyProfile();
    for (const set of ["templates", "templatesOccl", "primaryTemplates", "primaryTemplatesOccl"] as const) {
      for (const [k, v] of Object.entries(m[set] ?? {})) expect(vetTemplate(v, v), `measured ${set} ${k}`).toHaveProperty("svg");
    }
  }, 30_000);

  it.each([
    ["a script element", inject(`<script>alert(1)</script>`), /script/],
    ["an event handler", inject(`<circle r="1" onload="alert(1)"/>`), /onload/],
    ["a foreignObject", inject(`<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject>`), /foreignobject/i],
    ["an image that loads from the network", inject(`<image href="https://evil.example/x.png"/>`), /image/],
    ["a link", inject(`<a href="javascript:alert(1)"><circle r="1"/></a>`), /<a>/],
    ["a use pointing outside the document", inject(`<use href="https://evil.example/s.svg#a"/>`), /<use>/],
    ["a gradient that inherits from an external document", inject(`<linearGradient id="g" href="https://evil.example/s.svg#a"/>`), /external reference|@href/],
    ["a stylesheet that fetches", inject(`<style>.x{fill:url(https://evil.example/p)}</style>`), /fetches/],
    ["an inline style that fetches", inject(`<rect width="1" height="1" style="fill:url(https://evil.example/p)"/>`), /fetches/],
    ["an animation that rewrites an href", inject(`<animate attributeName="href" to="javascript:alert(1)"/>`), /animate/],
  ])("refuses %s and keeps the factory drawing", (_name, markup, why) => {
    setToothTemplateOverrides({ classic: { templates: { 11: markup } } });
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
    const rejected = getToothTemplateRejections();
    expect(rejected).toHaveLength(1);
    expect(rejected[0]).toMatchObject({ profile: "classic", set: "templates", key: 11 });
    expect(rejected[0].reason).toMatch(why);
  });

  it("refuses what is not an <svg> document, and what is not a string", () => {
    expect(vetTemplate("<div>x</div>", FACTORY_11)).toEqual({ reason: "root element is not <svg>" });
    expect(vetTemplate(42, FACTORY_11)).toEqual({ reason: "not a string" });
  });

  it("refuses a template that lacks layers of the factory one (the engine toggles layers by id)", () => {
    const r = vetTemplate(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g id="only-this"/></svg>`, FACTORY_11);
    expect(r).toHaveProperty("reason");
    expect((r as { reason: string }).reason).toMatch(/missing layer ids/);
  });

  it("accepts a drawing that keeps every layer, and serves it to the engine", () => {
    setToothTemplateOverrides({ classic: { templates: { 11: RED_11 } } });
    const p = activeAnatomyProfile();
    expect(getToothTemplateRejections()).toEqual([]);
    expect(p).not.toBe(CLASSIC_PROFILE);
    expect(p.templates[11]).toContain("host-rect");
    expect(p.templates[13]).toBe(CLASSIC_PROFILE.templates[13]);
    expect(p.toothTemplate).toBe(CLASSIC_PROFILE.toothTemplate);
  });

  it("with nothing supplied, or after clearing, the profile is the very same object", () => {
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
    setToothTemplateOverrides({ classic: { templates: { 11: RED_11 } } });
    setToothTemplateOverrides(null);
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
  });

  it("a key that does not exist in the profile is reported, not invented", () => {
    setToothTemplateOverrides({ classic: { templates: { 12: RED_11 } } });
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
    expect(getToothTemplateRejections()[0]).toMatchObject({ key: 12, reason: "no such template in this profile" });
  });
});

describe("classic, measured and milk teeth", () => {
  it("overrides are per profile: a classic template 11 never reaches measured, and vice versa", async () => {
    setToothTemplateOverrides({ classic: { templates: { 11: RED_11 } } });
    await setToothAnatomy("measured");
    const measured = activeAnatomyProfile();
    expect(Object.values(measured.templates).some((t) => t.includes("host-rect"))).toBe(false);
    setToothTemplateOverrides({ measured: { templates: { 11: measuredRed(measured.templates[11]) } } });
    expect(activeAnatomyProfile().templates[11]).toContain("host-rect");
    await setToothAnatomy("classic");
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
  });

  it("the deciduous artwork of measured is overridable under its own keys, and a profile without it rejects those keys", async () => {
    await setToothAnatomy("measured");
    const base = activeAnatomyProfile();
    const milkKey = Number(Object.keys(base.primaryTemplates!)[0]);
    const factory = base.primaryTemplates![milkKey];
    setToothTemplateOverrides({ measured: { primaryTemplates: { [milkKey]: factory.replace("</svg>", `<g id="host-mark"><rect id="host-rect" width="1" height="1"/></g></svg>`) } } });
    const p = activeAnatomyProfile();
    expect(p.primaryTemplates![milkKey]).toContain("host-rect");
    expect(p.templates).toBe(base.templates);
    setToothTemplateOverrides({ classic: { primaryTemplates: { 11: RED_11 } } });
    await setToothAnatomy("classic");
    expect(activeAnatomyProfile()).toBe(CLASSIC_PROFILE);
    expect(getToothTemplateRejections()[0]).toMatchObject({ profile: "classic", set: "primaryTemplates", reason: "no such template in this profile" });
  });

  it("classic draws the milk tooth inside the permanent drawing, so a classic override must keep its milk-tooth layers (they are part of the factory ids)", () => {
    const milkIds = [...FACTORY_11.matchAll(/id="(milktooth[^"]*)"/g)].map((m) => m[1]);
    expect(milkIds.length).toBeGreaterThan(0);
    const broken = FACTORY_11.replace(new RegExp(`id="${milkIds[0]}"`), 'id="renamed"');
    expect(vetTemplate(broken, FACTORY_11)).toHaveProperty("reason");
  });
});

describe("an override survives a change of profile", () => {
  it("both profiles keep their own override while the host switches back and forth", async () => {
    await setToothAnatomy("measured");
    const mFactory = activeAnatomyProfile().templates[11];
    await setToothAnatomy("classic");
    setToothTemplateOverrides({ classic: { templates: { 11: RED_11 } }, measured: { templates: { 11: measuredRed(mFactory) } } });
    for (let i = 0; i < 3; i++) {
      await setToothAnatomy("measured");
      expect(activeAnatomyProfile().templates[11]).toContain("host-rect");
      expect(activeAnatomyProfile().templates[11]).not.toBe(mFactory);
      await setToothAnatomy("classic");
      expect(activeAnatomyProfile().templates[11]).toContain("host-rect");
    }
  });

  it("an override set BEFORE the measured artwork is loaded applies once it loads (and is vetted then)", async () => {
    setToothTemplateOverrides({ measured: { templates: { 11: "<svg xmlns='http://www.w3.org/2000/svg'><g id='x'/></svg>" } } });
    await setToothAnatomy("measured");
    expect(activeAnatomyProfile().templates[11]).not.toContain("id=\"x\"");
    expect(getToothTemplateRejections().some((r) => r.profile === "measured" && /missing layer ids/.test(r.reason))).toBe(true);
  });
});

function measuredRed(factory: string): string {
  return factory.replace("</svg>", `<g id="host-mark"><rect id="host-rect" width="1" height="1" fill="#f00"/></g></svg>`);
}
