// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Plugin renderSvg() output is third-party content injected into the live SVG
// via innerHTML — it MUST pass through DOMPurify first. SVG profile only;
// script-capable elements are forbidden outright (foreignObject added on top
// of the spec's list because it can smuggle arbitrary HTML into an SVG).

import DOMPurify, { type Config } from "dompurify";

// Typed via dompurify's own `Config` (not `as const`) — `FORBID_TAGS` is a
// mutable `string[]` in that interface, so a `readonly` tuple from `as const`
// does not structurally match it.
const PLUGIN_SVG_CONFIG: Config = {
  USE_PROFILES: { svg: true, svgFilters: true },
  FORBID_TAGS: ["script", "iframe", "object", "embed", "foreignObject"],
};

// DOMPurify parses its input with the HTML parser. A bare SVG fragment (no
// enclosing <svg> root) therefore lands in the HTML namespace rather than the
// SVG namespace, and DOMPurify's SVG profile then strips every element as
// "unknown" — silently discarding legitimate plugin output, not just
// malicious content. Wrapping in a throwaway <svg> root before sanitizing
// keeps elements in the correct namespace so the allowlist actually applies.
// This affects real browsers the same way it affects jsdom — it is not a
// test-environment quirk.
//
// Unwrapping is done STRUCTURALLY (RETURN_DOM + walking the parsed tree), not
// via string/regex slicing on the sanitized output. A regex unwrap is
// vulnerable to an attacker-supplied `</svg>`/`<svg>` breakout inside the
// fragment (e.g. `<circle/></svg><svg onload=...>`), which DOMPurify parses
// as sibling nodes of our wrapper rather than as literal text — a regex only
// strips the FIRST `<svg...>`/LAST `</svg>` and lets everything the parser
// hung outside our wrapper leak into the sink. Walking the DOM instead only
// ever serializes the wrapper element's own children, so any breakout
// sibling the parser created is structurally excluded, never just filtered
// out of a string.
export function sanitizePluginSvg(svgContent: string): string {
  const wrapped = `<svg xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
  // Runtime value is always an Element (DOMPurify's document-body-equivalent
  // wrapper) for our string input; the `Node` return type in dompurify's
  // typings is the general case shared with the Node-input overload.
  const root = DOMPurify.sanitize(wrapped, {
    ...PLUGIN_SVG_CONFIG,
    RETURN_DOM: true,
  }) as Element;

  // `root` is the parser's document-body-equivalent wrapping our sanitized
  // markup; its FIRST element child is our own `<svg>` wrapper. Anything else
  // (further siblings) can only be parser-created breakout artifacts from
  // malformed/adversarial input and is deliberately never consulted.
  const wrapperSvg = root.firstElementChild;
  if (!wrapperSvg || wrapperSvg.tagName.toLowerCase() !== "svg") return "";

  // Serialization-format note: each child is serialized independently via
  // XMLSerializer, so every top-level child re-declares its own
  // `xmlns="http://www.w3.org/2000/svg"` (namespace context is lost once a
  // node is serialized outside its parent). This is harmless — redundant but
  // valid — and the caller (`applyPluginOverlays`) inserts the result via
  // innerHTML on an already SVG-namespaced <g>, where a repeated xmlns
  // attribute on a child element is standards-valid and ignored either way.
  const serializer = new XMLSerializer();
  let out = "";
  for (const child of Array.from(wrapperSvg.childNodes)) {
    out += serializer.serializeToString(child);
  }
  return out;
}
