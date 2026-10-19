// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Host-supplied tooth templates (`setToothTemplateOverrides`).
 *
 * A template is SVG text that ends up injected into the live DOM, so a host-supplied one is untrusted
 * markup exactly like a plugin overlay (see `pluginSanitize.ts`), and is vetted before it can be used:
 *
 *  1. It must be a string of reasonable size whose root is a single `<svg>`.
 *  2. It goes through DOMPurify (SVG profile, script-capable elements forbidden). Unlike a plugin overlay
 *     it is NOT silently cleaned: if DOMPurify has to remove anything, the template is REJECTED, so a host
 *     never believes it is drawing markup that differs from what it supplied.
 *  3. `href` / `xlink:href` may only point at a fragment (`#id`), and a `<style>` element may not fetch
 *     (`url(`, `@import`) — nothing a template contains can reach the network.
 *  4. It must carry every layer id of the factory template it replaces (the engine toggles layers by id).
 *
 * A rejected template is reported and the factory one stays in use; the chart is never left without a tooth.
 * Overrides are keyed per ANATOMY PROFILE, because template numbers mean different drawings in `classic` and
 * `measured`; they survive a change of profile (each profile resolves its own) and never leak into the other.
 */

import DOMPurify from "dompurify";

/** The profile names a host can address. (Declared here, not imported from `profiles.ts`, which imports this module.) */
type ProfileName = "classic" | "measured";
/** The shape of a profile this module needs: its four template maps. */
type TemplateHolder = { [K in "templates" | "templatesOccl" | "primaryTemplates" | "primaryTemplatesOccl"]?: Record<number, string> };

/** The four template maps of a profile that a host may replace. Keys are the template numbers of THAT profile;
 *  the `primary*` maps are the deciduous artwork of a profile that has it (`measured`), keyed by the permanent
 *  FDI position the milk tooth occupies. */
export type ToothTemplateSet = {
  templates?: Record<number, string>;
  templatesOccl?: Record<number, string>;
  primaryTemplates?: Record<number, string>;
  primaryTemplatesOccl?: Record<number, string>;
};
export type ToothTemplateOverrides = Partial<Record<ProfileName, ToothTemplateSet>>;

export type TemplateRejection = { profile: ProfileName; set: keyof ToothTemplateSet; key: number; reason: string };

const SETS = ["templates", "templatesOccl", "primaryTemplates", "primaryTemplatesOccl"] as const;
const MAX_TEMPLATE_CHARS = 1_000_000;
const FORBID_TAGS = ["script", "iframe", "object", "embed", "foreignObject", "image", "a", "animate", "set", "animateTransform"];

const idsOf = (root: Element): Set<string> => new Set([...root.querySelectorAll("[id]")].map((e) => e.id).concat(root.id ? [root.id] : []));

/** Vet one template against the factory template it replaces. Returns the sanitized markup, or the reason it was refused. */
export function vetTemplate(candidate: unknown, factory: string): { svg: string } | { reason: string } {
  if (typeof candidate !== "string") return { reason: "not a string" };
  if (candidate.length > MAX_TEMPLATE_CHARS) return { reason: "too large" };
  // The XML prolog and comments are not markup the engine draws; DOMPurify drops them, so take them out first
  // (only those, so that anything else it removes is a real finding).
  const text = candidate.replace(/^\s*<\?xml[^?]*\?>/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  if (!/^<svg[\s>]/i.test(text)) return { reason: "root element is not <svg>" };

  const clean = DOMPurify.sanitize(text, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS, RETURN_DOM: true }) as Element;
  // The HTML parser's own scaffolding (<html>, <head>, <body>) is not something the host wrote.
  const removed = DOMPurify.removed
    .map((r) => ("element" in r ? `<${(r.element as Element).nodeName.toLowerCase()}>` : `@${r.attribute?.name ?? "?"}`))
    .filter((r) => !["<html>", "<head>", "<body>"].includes(r));
  if (removed.length) return { reason: `unsafe markup: ${[...new Set(removed)].slice(0, 5).join(", ")}` };
  const svg = clean.firstElementChild;
  if (!svg || svg.nodeName.toLowerCase() !== "svg" || clean.children.length !== 1) return { reason: "root element is not a single <svg>" };

  for (const el of svg.querySelectorAll("[href], [*|href]")) {
    const target = el.getAttribute("href") ?? el.getAttribute("xlink:href") ?? "";
    if (!target.startsWith("#")) return { reason: `external reference: ${target.slice(0, 40)}` };
  }
  for (const style of svg.querySelectorAll("style")) {
    if (/url\s*\(|@import/i.test(style.textContent ?? "")) return { reason: "<style> that fetches (url( / @import)" };
  }
  for (const el of svg.querySelectorAll("[style]")) {
    if (/url\s*\(\s*['"]?\s*(?!#)/i.test(el.getAttribute("style") ?? "")) return { reason: "style attribute that fetches (url()" };
  }

  const factoryDoc = new DOMParser().parseFromString(factory, "image/svg+xml").documentElement;
  const have = idsOf(svg);
  const missing = [...idsOf(factoryDoc)].filter((id) => !have.has(id));
  if (missing.length) return { reason: `missing layer ids (${missing.length}): ${missing.slice(0, 4).join(", ")}` };

  return { svg: new XMLSerializer().serializeToString(svg) };
}

/** `base` with the vetted templates of `overrides` in place of the factory ones; rejections are appended to `report`. With nothing
 *  to apply, `base` itself (same object) is returned, so an unused feature changes nothing. */
export function resolveOverrides<P extends TemplateHolder>(base: P, profile: ProfileName, overrides: ToothTemplateOverrides | null, report: TemplateRejection[]): P {
  const wanted = overrides?.[profile];
  if (!wanted) return base;
  const out: P = { ...base };
  let changed = false;
  for (const set of SETS) {
    const supplied = wanted[set];
    if (!supplied) continue;
    const factory = base[set];
    const merged: Record<number, string> = { ...(factory ?? {}) };
    for (const [k, v] of Object.entries(supplied)) {
      const key = Number(k);
      const original = factory?.[key];
      if (original === undefined) { report.push({ profile, set, key, reason: "no such template in this profile" }); continue; }
      const vetted = vetTemplate(v, original);
      if ("reason" in vetted) { report.push({ profile, set, key, reason: vetted.reason }); continue; }
      merged[key] = vetted.svg;
      changed = true;
    }
    out[set] = merged;
  }
  return changed ? out : base;
}
