// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// The tooth artwork carries its colours as palette tokens with today's colour
// as the fallback, so a host can retheme the drawings through the same
// `themeConfig` prop it already uses for the UI chrome. These tests pin the
// three halves of that: the assets really are tokenized, the config really
// sets the variables, and an unset config really changes nothing.

import { describe, it, expect } from "vitest";
import { applyThemeConfig, flattenThemeTokens } from "../theme";
import { buildPerioSvg } from "../perioExport";
import { __resetChartStateForTest, setPerioSite } from "../odontogram";
import tooth11 from "../assets/teeth-svgs/11.svg?raw";
import measured11 from "../assets/teeth-svgs/measured/11.svg?raw";
import measured16Occl from "../assets/teeth-svgs/measured/16_occl.svg?raw";

import { readFileSync } from "node:fs";

/** Relative luminance / WCAG contrast — used to assert the dark palette keeps
 *  the light palette's RELATIONSHIPS, which is the actual design rule. */
function luminance(hex: string): number {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const ch = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [0, 2, 4].map((i) => ch(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function inlineFill(svg: string, layerId: string): string {
  const el = new RegExp(`id="${layerId}"[^>]*style="([^"]*)"`).exec(svg);
  const fill = /(?:^|;)\s*fill:\s*([^;]+)/.exec(el?.[1] ?? "");
  if (!fill) throw new Error(`no inline fill on #${layerId}`);
  return fill[1].trim();
}

describe("tooth artwork: the drawings are tokenized", () => {
  it("paints the crown, gum and bone through tokens in BOTH profiles", () => {
    for (const [name, svg] of [["classic", tooth11], ["measured", measured11]] as const) {
      expect(inlineFill(svg, "tooth-base"), name).toBe("var(--odon-tooth-body, #ebebeb)");
      expect(inlineFill(svg, "gum-base"), name).toBe("var(--odon-gum, #f79f9a)");
      expect(inlineFill(svg, "bone-base"), name).toBe("var(--odon-bone, #fdecc5)");
    }
  });

  it("tokenizes the colours the generator synthesizes itself", () => {
    // The occlusal cusps and grooves are drawn by occlusal.py, not copied from
    // a donor, so they are tokenized in the Python rather than in an asset.
    expect(measured16Occl).toContain("var(--odon-tooth-cusp, #f4f1e8)");
    expect(measured16Occl).toContain("var(--odon-tooth-groove, #8f8f8f)");
  });

  it("keeps one token across profiles that are drawn in different shades", () => {
    // Classic zircon is #feffbf, measured zircon is #cfe3ee — a pre-existing
    // divergence. One token drives both, so a host that sets it gets a
    // consistent zircon in either profile while each keeps its own default.
    expect(inlineFill(tooth11, "zircon-crown")).toBe("var(--odon-rest-zircon, #feffbf)");
    expect(inlineFill(measured11, "zircon-crown")).toBe("var(--odon-rest-zircon, #cfe3ee)");
  });

  it("leaves the photorealistic implant shading literal, by design", () => {
    // ~65 near-identical metal greys encoding a light source, not a surface.
    // #b7c0c3 is one of the fixture's shading greys: still a bare literal,
    // and never wrapped in a token.
    expect(measured11).toContain("fill: #b7c0c3");
    expect(measured11).not.toContain("#b7c0c3)");
    expect(measured11).not.toContain("var(--odon-implant");
  });
});

describe("tooth artwork: applyThemeConfig", () => {
  const host = () => document.createElement("div");

  it("sets a curated field's token, and nothing for omitted keys", () => {
    const el = host();
    applyThemeConfig(el, { tooth: { body: "#102030" } });
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("#102030");
    expect(el.style.getPropertyValue("--odon-gum")).toBe("");
  });

  it("applies a config that carries ONLY tooth colours", () => {
    // Regression: the function used to return early unless `colors` was
    // present, which would have made the whole tooth group a no-op.
    const el = host();
    applyThemeConfig(el, { tooth: { gum: "#aabbcc" } });
    expect(el.style.getPropertyValue("--odon-gum")).toBe("#aabbcc");
  });

  it("sets any token by name, and ignores keys outside the --odon- prefix", () => {
    const el = host();
    applyThemeConfig(el, { tokens: { "--odon-rest-gold": "#d4af37", "--evil": "red", "color": "red" } });
    expect(el.style.getPropertyValue("--odon-rest-gold")).toBe("#d4af37");
    expect(el.style.getPropertyValue("--evil")).toBe("");
    expect(el.style.getPropertyValue("color")).toBe("");
  });

  it("lets a raw token win over the curated field naming the same one", () => {
    const el = host();
    applyThemeConfig(el, {
      tooth: { body: "#111111" },
      tokens: { "--odon-tooth-body": "#222222" },
    });
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("#222222");
  });

  it("clears what the previous call set, including raw tokens", () => {
    const el = host();
    applyThemeConfig(el, { tooth: { body: "#102030" }, tokens: { "--odon-rest-gold": "#d4af37" } });
    applyThemeConfig(el, { tooth: { gum: "#aabbcc" } });
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("");
    expect(el.style.getPropertyValue("--odon-rest-gold")).toBe("");
    expect(el.style.getPropertyValue("--odon-gum")).toBe("#aabbcc");
  });

  it("leaves an --odon-* property the host set outside the config alone", () => {
    const el = host();
    el.style.setProperty("--odon-something-of-mine", "#abcdef");
    applyThemeConfig(el, { tooth: { body: "#102030" } });
    applyThemeConfig(el, null);
    expect(el.style.getPropertyValue("--odon-something-of-mine")).toBe("#abcdef");
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("");
  });

  it("still applies the UI chrome colours", () => {
    const el = host();
    applyThemeConfig(el, { colors: { accent: "#ff0000" }, tooth: { body: "#102030" } });
    expect(el.style.getPropertyValue("--odon-accent")).toBe("#ff0000");
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("#102030");
  });
});

describe("tooth artwork: exports flatten the tokens", () => {
  it("resolves a themed token to its value, and an unset one to its fallback", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    applyThemeConfig(el, { tooth: { body: "#102030" } });
    const xml = '<path style="fill: var(--odon-tooth-body, #ebebeb); stroke: var(--odon-gum, #f79f9a)"/>';
    const out = flattenThemeTokens(xml, el);
    expect(out).toContain("fill: #102030");
    expect(out).toContain("stroke: #f79f9a");
    expect(out).not.toContain("var(");
    el.remove();
  });

  it("leaves markup without tokens untouched, byte for byte", () => {
    const xml = '<path style="fill: #ebebeb"/>';
    expect(flattenThemeTokens(xml, document.documentElement)).toBe(xml);
  });

  it("an UNTHEMED export flattens to exactly the fallbacks", () => {
    // This is what makes the change invisible to anyone who never themes:
    // the exported markup carries the same colours it always did.
    const el = document.createElement("div");
    document.body.appendChild(el);
    const xml = '<path style="fill: var(--odon-tooth-body, #ebebeb)"/>';
    expect(flattenThemeTokens(xml, el)).toBe('<path style="fill: #ebebeb"/>');
    el.remove();
  });
});

describe("tooth artwork: the dentin core follows the body unless it is set", () => {
  // `--odon-tooth-dentin` is the only token whose default is another token, so
  // it is the only one whose export goes through a nested fallback.
  const CORE = '<path style="fill: var(--odon-tooth-dentin, var(--odon-tooth-body, #ebebeb))"/>';

  it("the measured assets paint the core through the nested token", () => {
    expect(measured11).toContain(
      'fill: var(--odon-tooth-dentin, var(--odon-tooth-body, #ebebeb))',
    );
    // Nothing of the dentin is visible from above.
    expect(measured16Occl).not.toContain("--odon-tooth-dentin");
  });

  it("an unthemed export resolves the whole chain to the body's own colour", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(flattenThemeTokens(CORE, el)).toBe('<path style="fill: #ebebeb"/>');
    el.remove();
  });

  it("setting the body alone carries the core with it", () => {
    // The point of the nesting: colouring the tooth through the documented
    // field must not expose a boundary the host never asked about.
    const el = document.createElement("div");
    document.body.appendChild(el);
    applyThemeConfig(el, { tooth: { body: "#273140" } });
    expect(flattenThemeTokens(CORE, el)).toBe('<path style="fill: #273140"/>');
    el.remove();
  });

  it("setting the dentin wins over the body", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    applyThemeConfig(el, { tooth: { body: "#273140", dentin: "#8a6b45" } });
    expect(flattenThemeTokens(CORE, el)).toBe('<path style="fill: #8a6b45"/>');
    el.remove();
  });

  it("leaves no inner reference behind — the failure mode that exports black", () => {
    // A fallback group that stops at the first ')' passes the inner var()
    // through into the exported file, where nothing resolves it and the fill
    // falls back to the SVG initial value: black, with no error anywhere.
    const el = document.createElement("div");
    document.body.appendChild(el);
    for (const xml of [
      CORE,
      '<path style="fill: var(--odon-tooth-dentin, var(--odon-tooth-body, var(--odon-gum, #f79f9a)))"/>',
      '<g><path style="fill: var(--odon-tooth-dentin, var(--odon-tooth-body, #ebebeb))"/>' +
        '<path style="stroke: var(--odon-tooth-outline, #c8c9c9)"/></g>',
    ]) {
      expect(flattenThemeTokens(xml, el)).not.toContain("var(");
    }
    el.remove();
  });

  it("leaves markup it cannot parse alone instead of mangling it", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const broken = '<path style="fill: var(--odon-tooth-body, #ebebeb"/>';
    expect(flattenThemeTokens(broken, el)).toBe(broken);
    el.remove();
  });
});

describe("tooth artwork: the export path is actually wired", () => {
  it("buildPerioSvg emits no unresolved token", async () => {
    // The unit tests above prove the flattener; this proves it is CALLED.
    // A serialized SVG that still carried `var(--odon-…)` would render in the
    // fallback colours wherever it is opened, silently dropping the theme.
    __resetChartStateForTest();
    setPerioSite(11, "MB", { pd: 4 });
    const built = await buildPerioSvg();
    expect(built).not.toBeNull();
    expect(built!.xml).not.toContain("var(--odon-");
    // …and the artwork is still painted: the flattened fallback is there.
    expect(built!.xml).toContain("#ebebeb");
  });
});

describe("tooth artwork: the default dark palette", () => {
  // Vitest runs with the engine root as cwd, so these resolve without a
  // file-URL dance (import.meta.url is not a file: URL under the transform).
  const CSS = readFileSync("src/index.css", "utf8");
  const PALETTE = readFileSync("tools/toothgen/palette.py", "utf8");

  /** The `--odon-*` declarations inside the dark artwork block. */
  const darkBlock = (): Map<string, string> => {
    const start = CSS.indexOf("/* ── Dark mode: tooth artwork");
    expect(start, "dark artwork block").toBeGreaterThan(-1);
    const open = CSS.indexOf("{", CSS.indexOf(".dark{", start));
    const body = CSS.slice(open + 1, CSS.indexOf("}", open));
    const out = new Map<string, string>();
    for (const m of body.matchAll(/(--odon-[\w-]+)\s*:\s*([^;]+);/g)) out.set(m[1], m[2].trim());
    return out;
  };

  it("declares only tokens the palette table actually defines", () => {
    // A typo here would be silent: the artwork would keep its light fallback
    // and nothing would error. This is the guard for that.
    const known = new Set([...PALETTE.matchAll(/"(--odon-[\w-]+)":/g)].map((m) => m[1]));
    expect(known.size).toBeGreaterThan(40);
    for (const token of darkBlock().keys()) {
      expect(known.has(token), `${token} is not in palette.py`).toBe(true);
    }
  });

  it("covers the surfaces that would otherwise glare, and flips caries", () => {
    const dark = darkBlock();
    for (const token of [
      "--odon-tooth-body", "--odon-tooth-outline", "--odon-tooth-highlight",
      "--odon-milktooth-body", "--odon-tooth-cusp", "--odon-gum", "--odon-bone",
      "--odon-caries", "--odon-caries-outline", "--odon-wear",
    ]) {
      expect(dark.has(token), `dark mode should redeclare ${token}`).toBe(true);
    }
    // Caries is near-black on a light crown; on a dark crown it must be light
    // or it vanishes into the tooth it marks.
    expect(luminance(dark.get("--odon-caries")!)).toBeGreaterThan(
      luminance(dark.get("--odon-tooth-body")!),
    );
  });

  it("keeps the clinical signal colours out of the dark block", () => {
    const dark = darkBlock();
    for (const token of [
      "--odon-pulp-inflamed", "--odon-calculus", "--odon-fracture", "--odon-crown-leakage",
      "--odon-plan-extraction", "--odon-endo-filling", "--odon-ortho-arrow",
      "--odon-rest-gold", "--odon-fill-composite",
    ]) {
      expect(dark.has(token), `${token} should keep its light-mode colour`).toBe(false);
    }
  });

  it("preserves the light-mode relationship: the crown barely separates from the page", () => {
    const dark = darkBlock();
    // Light mode: enamel #ebebeb on page #f3f6fb is 1.10:1 — the tooth is read
    // from its outline, not from background contrast. Leaving the artwork
    // alone in dark mode would put it at ~15:1.
    const ratio = contrast(dark.get("--odon-tooth-body")!, "#0f172a");
    expect(ratio).toBeGreaterThan(1.1);
    expect(ratio).toBeLessThan(2.0);
  });

  it("lets a host theme override the dark default", () => {
    // The dark block sets the property on <html>; applyThemeConfig sets it on
    // the chart element, which is nearer in the inheritance chain and wins.
    const el = document.createElement("div");
    document.documentElement.classList.add("dark");
    document.body.appendChild(el);
    applyThemeConfig(el, { tooth: { body: "#123456" } });
    expect(el.style.getPropertyValue("--odon-tooth-body")).toBe("#123456");
    document.documentElement.classList.remove("dark");
    el.remove();
  });
});

describe("themeConfig.selection", () => {
  it("is not a CSS variable — applyThemeConfig leaves the element untouched", () => {
    // Selection is an interaction state applied through the session setters,
    // so it must not leak onto the themed element as a custom property.
    const el = document.createElement("div");
    applyThemeConfig(el, { selection: { color: "#ff0000", borderStyle: "solid" } });
    expect(el.getAttribute("style") ?? "").not.toContain("selection");
    expect(el.style.getPropertyValue("--odon-selection-color")).toBe("");
  });

  it("the provider applies it, and a dedicated prop still wins", async () => {
    const { render, cleanup } = await import("@testing-library/react");
    const { createElement } = await import("react");
    const App = (await import("../App")).default;
    const { getSelectionColor } = await import("../odontogram");

    cleanup();
    render(createElement(App, { language: "en", themeConfig: { selection: { color: "#abcdef" } } }));
    expect(getSelectionColor()).toBe("#abcdef");

    cleanup();
    render(createElement(App, {
      language: "en",
      themeConfig: { selection: { color: "#abcdef" } },
      selectionColor: "#123456",
    }));
    expect(getSelectionColor(), "the explicit prop is the more specific control").toBe("#123456");
    cleanup();
  });
});
