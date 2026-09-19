// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Periodontal-arc "Dental Chart" graphical redesign, Task 3: the curve
// overlay — a CEJ line + gingival-margin line + pocket-base line + a filled
// band, driven by the per-site PD/GM data, drawn OVER the T2 tooth arch.
//
// `perioCurve` is a PURE function (no DOM) turning ordered per-site
// {pd,gm} readings into margin/pocket point arrays in the SAME row-local
// coordinate space T2 lays the arch out in (crown up = smaller y, root down
// = larger y; the shared CEJ baseline at `cejY`). `buildPerioCurveLayer` is
// a pure DOM builder (jsdom `document` only — no perio module, no fetch) that
// turns that result into the overlay <g> (CEJ line + polylines + band path),
// so both are fast/deterministic in vitest/jsdom.
import { describe, it, expect } from "vitest";
import { perioCurve, buildPerioCurveLayer } from "../perioGraphic";

const MM = 4; // an arbitrary mm->px scale for the math tests
const identityX = (i: number) => i * 10; // deterministic, spread-out x's

describe("perioCurve (pure math + orientation)", () => {
  it("recession (gm=+2) drops the margin below the CEJ, pocket below that by pd", () => {
    const cejY = 40;
    const res = perioCurve([{ site: "B", pd: 5, gm: 2 }], { cejY, mmPx: MM, siteX: identityX });
    expect(res.cejY).toBe(cejY);
    // margin: recession pushes it toward the root (LARGER y on the buccal row)
    expect(res.marginPts[0]).toEqual({ x: 0, y: cejY + 2 * MM });
    // pocket: another pd deeper still (margin + pd), i.e. cejY + (2+5)*mmPx
    expect(res.pocketPts[0]).toEqual({ x: 0, y: cejY + (2 + 5) * MM });
  });

  it("coronal margin (gm=-1) sits ABOVE the CEJ (smaller y)", () => {
    const cejY = 40;
    const res = perioCurve([{ site: "B", pd: 3, gm: -1 }], { cejY, mmPx: MM, siteX: identityX });
    expect(res.marginPts[0]).toEqual({ x: 0, y: cejY - 1 * MM });
    expect(res.pocketPts[0]).toEqual({ x: 0, y: cejY - 1 * MM + 3 * MM });
  });

  it("gm defaults to 0 when omitted (margin sits on the CEJ)", () => {
    const cejY = 40;
    const res = perioCurve([{ site: "B", pd: 4 }], { cejY, mmPx: MM, siteX: identityX });
    expect(res.marginPts[0]).toEqual({ x: 0, y: cejY });
    expect(res.pocketPts[0]).toEqual({ x: 0, y: cejY + 4 * MM });
  });

  it("an uncharted site (no pd) is a null gap at that index in BOTH arrays", () => {
    const cejY = 40;
    const res = perioCurve(
      [{ site: "MB", pd: 3 }, { site: "B" /* uncharted */ }, { site: "DB", pd: 5 }],
      { cejY, mmPx: MM, siteX: identityX },
    );
    expect(res.marginPts[1]).toBeNull();
    expect(res.pocketPts[1]).toBeNull();
    // neighbours still charted (the gap breaks the line, not the whole curve)
    expect(res.pocketPts[0]).not.toBeNull();
    expect(res.pocketPts[2]).not.toBeNull();
  });

  it("a deeper PD dips the pocket point FURTHER from the CEJ than a shallow one", () => {
    const cejY = 40;
    const shallow = perioCurve([{ site: "B", pd: 3 }], { cejY, mmPx: MM, siteX: identityX });
    const deep = perioCurve([{ site: "B", pd: 9 }], { cejY, mmPx: MM, siteX: identityX });
    expect(deep.pocketPts[0]!.y).toBeGreaterThan(shallow.pocketPts[0]!.y);
    // and both are on the root side (below the CEJ) for a zero-gm margin
    expect(shallow.pocketPts[0]!.y).toBeGreaterThan(cejY);
  });

  it("uses the provided siteX for x placement", () => {
    const res = perioCurve([{ site: "B", pd: 2 }], { cejY: 40, mmPx: MM, siteX: (i) => 100 + i });
    expect(res.marginPts[0]!.x).toBe(100);
    expect(res.pocketPts[0]!.x).toBe(100);
  });
});

describe("buildPerioCurveLayer (pure DOM overlay) — charting a site draws/moves the pocket point", () => {
  const cejY = 40;
  const width = 120;

  it("renders a red CEJ line spanning the row width", () => {
    const res = perioCurve([{ site: "B", pd: 4 }], { cejY, mmPx: MM, siteX: identityX });
    const g = buildPerioCurveLayer(res, { width });
    const cej = g.querySelector(".perio-curve-cej");
    expect(cej).toBeTruthy();
    expect(cej!.getAttribute("y1")).toBe(String(cejY));
    expect(cej!.getAttribute("y2")).toBe(String(cejY));
    expect(cej!.getAttribute("x2")).toBe(String(width));
  });

  it("charting a site draws a pocket point; charting DEEPER moves it further from the CEJ", () => {
    const shallow = perioCurve([{ site: "B", pd: 3 }], { cejY, mmPx: MM, siteX: identityX });
    const gShallow = buildPerioCurveLayer(shallow, { width });
    const pocketShallow = gShallow.querySelector(".perio-curve-pocket");
    expect(pocketShallow, "a charted site produces a pocket polyline").toBeTruthy();
    const yShallow = Number(pocketShallow!.getAttribute("points")!.trim().split(",")[1]);
    expect(yShallow).toBe(cejY + 3 * MM);

    const deep = perioCurve([{ site: "B", pd: 8 }], { cejY, mmPx: MM, siteX: identityX });
    const gDeep = buildPerioCurveLayer(deep, { width });
    const yDeep = Number(gDeep.querySelector(".perio-curve-pocket")!.getAttribute("points")!.trim().split(",")[1]);
    expect(yDeep).toBeGreaterThan(yShallow);
  });

  it("breaks the polylines at null gaps into separate segments (no line drawn across an uncharted site)", () => {
    const res = perioCurve(
      [{ site: "MB", pd: 3 }, { site: "B" }, { site: "DB", pd: 4 }],
      { cejY, mmPx: MM, siteX: identityX },
    );
    const g = buildPerioCurveLayer(res, { width });
    // Two isolated charted points -> two single-point pocket segments, never
    // one polyline bridging the gap.
    const pockets = g.querySelectorAll(".perio-curve-pocket");
    expect(pockets.length).toBe(2);
  });

  it("draws a filled band <path> between the margin and pocket lines", () => {
    const res = perioCurve(
      [{ site: "MB", pd: 3 }, { site: "B", pd: 4 }, { site: "DB", pd: 5 }],
      { cejY, mmPx: MM, siteX: identityX },
    );
    const g = buildPerioCurveLayer(res, { width });
    const band = g.querySelector(".perio-curve-band");
    expect(band).toBeTruthy();
    expect(band!.getAttribute("d") || "").toMatch(/^M/);
    expect((band!.getAttribute("d") || "").endsWith("Z")).toBe(true);
  });

  it("an all-uncharted arch draws only the CEJ line (no margin/pocket/band)", () => {
    const res = perioCurve([{ site: "MB" }, { site: "B" }, { site: "DB" }], { cejY, mmPx: MM, siteX: identityX });
    const g = buildPerioCurveLayer(res, { width });
    expect(g.querySelector(".perio-curve-cej")).toBeTruthy();
    expect(g.querySelector(".perio-curve-margin")).toBeNull();
    expect(g.querySelector(".perio-curve-pocket")).toBeNull();
    expect(g.querySelector(".perio-curve-band")).toBeNull();
  });
});
