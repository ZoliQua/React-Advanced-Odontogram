// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { namespaceIds, pruneHiddenClone } from "../odontogram";

const SVG_NS = "http://www.w3.org/2000/svg";

function svg(html: string): SVGElement {
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NS}">${html}</svg>`,
    "image/svg+xml",
  );
  return doc.documentElement as unknown as SVGElement;
}

describe("namespaceIds", () => {
  it("prefixes ids and rewrites url(#id) references so combined tiles don't collide", () => {
    const el = svg(
      `<defs><linearGradient id="g1"/></defs><rect id="r1" fill="url(#g1)" style="stroke:url(#g1)"/>`,
    );
    namespaceIds(el, "t3-");
    expect(el.querySelector("#t3-g1")).toBeTruthy();
    expect(el.querySelector("#g1")).toBeNull();
    const rect = el.querySelector("rect")!;
    expect(rect.getAttribute("id")).toBe("t3-r1");
    expect(rect.getAttribute("fill")).toBe("url(#t3-g1)");
    expect(rect.getAttribute("style")).toContain("url(#t3-g1)");
  });

  it("rewrites href='#id' references", () => {
    const el = svg(`<path id="p1"/><use href="#p1"/>`);
    namespaceIds(el, "t0-");
    expect(el.querySelector("use")!.getAttribute("href")).toBe("#t0-p1");
  });

  it("two independently namespaced clones keep distinct ids", () => {
    const a = svg(`<g id="x"/>`); namespaceIds(a, "t0-");
    const b = svg(`<g id="x"/>`); namespaceIds(b, "t1-");
    expect(a.querySelector("#t0-x")).toBeTruthy();
    expect(b.querySelector("#t1-x")).toBeTruthy();
    expect(a.querySelector("#t1-x")).toBeNull();
  });
});

describe("pruneHiddenClone", () => {
  // getComputedStyle only reflects styles on an element created in the SVG
  // namespace within THIS document and connected to it — mirroring the real app
  // where the live tooth SVG is in the page. (DOMParser yields a separate
  // document where jsdom's getComputedStyle does not resolve.)
  function g(id: string, hidden = false): SVGElement {
    const e = document.createElementNS(SVG_NS, "g");
    e.setAttribute("id", id);
    if(hidden) e.setAttribute("style", "display:none");
    return e;
  }

  it("drops clone nodes whose original is display:none, keeps visible ones", () => {
    const original = document.createElementNS(SVG_NS, "svg");
    original.appendChild(g("visible"));
    original.appendChild(g("hidden", true));
    document.body.appendChild(original);
    const clone = original.cloneNode(true) as Element;
    pruneHiddenClone(original, clone);
    expect(clone.querySelector("#visible")).toBeTruthy();
    expect(clone.querySelector("#hidden")).toBeNull();
    original.remove();
  });

  it("recurses into visible groups", () => {
    const original = document.createElementNS(SVG_NS, "svg");
    const outer = g("outer");
    const keep = document.createElementNS(SVG_NS, "path"); keep.setAttribute("id", "keep");
    const drop = document.createElementNS(SVG_NS, "path"); drop.setAttribute("id", "drop"); drop.setAttribute("style", "display:none");
    outer.appendChild(keep); outer.appendChild(drop);
    original.appendChild(outer);
    document.body.appendChild(original);
    const clone = original.cloneNode(true) as Element;
    pruneHiddenClone(original, clone);
    expect(clone.querySelector("#keep")).toBeTruthy();
    expect(clone.querySelector("#drop")).toBeNull();
    original.remove();
  });
});
