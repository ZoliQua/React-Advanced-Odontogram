// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 4: `buildPerioSvg()` — the full perio chart (teeth graphic +
// numeric rows + 2017 classification) built headlessly, as ONE standalone
// vector SVG, from state (not the mounted `PerioChart` DOM).
//
// `buildPerioSvg()` awaits the SAME `loadTemplateCache()` `perioGraphic.ts`
// exports. Tooth templates are now INLINED into the bundle (via `?raw` imports
// in `odontogram.ts`) and parsed directly — no `fetch()` — so this suite needs
// no network/asset stub; the cache resolves from the inlined markup. The
// template-load FAILURE path is exercised by spying on `loadTemplateCache` and
// forcing a rejection (see first test), instead of the old fetch-404 stub.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as perioGraphic from "../perioGraphic";
import { buildPerioSvg } from "../perioExport";
import { __resetChartStateForTest, __setToothStateForTest, setPerioSite, setPlaque } from "../odontogram";
import { t } from "../i18n/useI18n";

beforeEach(() => {
  __resetChartStateForTest();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UI-3b T4: buildPerioSvg", () => {
  it("returns null gracefully when the tooth-template cache cannot be loaded", async () => {
    // Templates are inlined now, so a load failure is only possible via an
    // internal fault in `loadTemplateCache` (e.g. a parse error). Force it to
    // reject to prove `buildPerioSvg`'s null-guard still holds. `mockRestore`
    // (in afterEach) hands subsequent tests the real, successful loader.
    vi.spyOn(perioGraphic, "loadTemplateCache").mockRejectedValueOnce(
      new Error("forced template-load failure"),
    );
    const built = await buildPerioSvg();
    expect(built).toBeNull();
  });

  it("returns a serialized SVG with positive dimensions", async () => {
    setPerioSite(11, "MB", { pd: 4 });
    const built = await buildPerioSvg();
    expect(built).not.toBeNull();
    expect(built!.xml.startsWith("<?xml") || built!.xml.includes("<svg")).toBe(true);
    expect(built!.width).toBeGreaterThan(0);
    expect(built!.height).toBeGreaterThan(0);
  });

  it("2.2.2: embeds the perio curve/mm-grid stylesheet so it rasterizes without the app CSS", async () => {
    setPerioSite(11, "MB", { pd: 4 });
    const built = await buildPerioSvg();
    expect(built!.xml).toContain("<style");
    // The band must be styled (translucent blue), not fall back to a solid-black
    // SVG default; the mm labels must carry the small font-size.
    expect(built!.xml).toContain(".perio-curve-band");
    expect(built!.xml).toContain("fill-opacity:0.18");
    expect(built!.xml).toContain(".perio-mm-line");
    expect(built!.xml).toContain(".perio-mm-label");
    expect(built!.xml).toContain("font-size:5px");
  });

  it("emits <text> for charted numeric values", async () => {
    // PD 7 is a DISTINCTIVE probe value: the mm-guide grid only ever labels
    // 5/10/15, and permanent tooth numbers containing 7 (17/27/37/47)
    // serialize as ">17<" etc. (never ">7<"), so a ">7<" text node can ONLY
    // come from the charted PD value actually rendering — guards against a
    // false-positive where a grid/tooth-number label coincidentally matches.
    setPerioSite(11, "MB", { pd: 7 });
    const built = await buildPerioSvg();
    expect(built!.xml).toContain("<text");
    expect(built!.xml).toContain(">7<"); // the charted PD value rendered as text
  });

  it("2.2.3: does NOT embed the 2017-classification block in the chart image", async () => {
    // The classification (Diagnosis/Stage/Grade/Extent) now lives ONLY in the
    // PDF's "Periodontal description" metrics table — repeating it inside the
    // chart image was redundant, so it must not appear here.
    const built = await buildPerioSvg();
    expect(built!.xml).not.toContain(`${t("perio.class.diagnosis")}:`);
    expect(built!.xml).not.toContain(`${t("perio.class.stage")}:`);
  });

  it("2.2.3: renders centered arch titles (Upper/Lower Teeth)", async () => {
    const built = await buildPerioSvg();
    expect(built!.xml).toContain(t("perio.export.upperTeeth"));
    expect(built!.xml).toContain(t("perio.export.lowerTeeth"));
  });

  it("2.2.3 (round 2): tooth-spacing packs the ARCH graphic too (teeth + rows share one geometry)", async () => {
    // Regression for the spacing bug: the arch artwork used a FIXED gap while the
    // number rows re-spaced, so a tighter setting drifted the teeth out of
    // alignment. Now buildBuccalArchSvg honours the same gap, so a tighter gap
    // must shrink the nested arch <svg>'s own width (proof it re-packed).
    setPerioSite(11, "MB", { pd: 4 });
    const archWidth = (xml: string): number => {
      // First nested arch band svg: <svg class="perio-tooth-arch ..." ... width="N">
      const m = xml.match(/class="perio-tooth-arch[^"]*"[^>]*\bwidth="([\d.]+)"/)
        ?? xml.match(/\bwidth="([\d.]+)"[^>]*class="perio-tooth-arch/);
      return m ? Number(m[1]) : NaN;
    };
    const wide = await buildPerioSvg({ toothGap: 8 });
    const close = await buildPerioSvg({ toothGap: -2 });
    const wW = archWidth(wide!.xml);
    const cW = archWidth(close!.xml);
    expect(wW).toBeGreaterThan(0);
    expect(cW).toBeGreaterThan(0);
    expect(cW).toBeLessThan(wW); // tighter gap → narrower arch graphic
  });

  it("2.2.3 (round 2): a MISSING tooth draws no crown (kept out of the arch artwork)", async () => {
    // 16 present by default → its data-tooth group exists; mark it missing → gone.
    const present = await buildPerioSvg();
    expect(present!.xml).toContain('data-tooth="16"');
    __setToothStateForTest(16, { toothSelection: "none" });
    const missing = await buildPerioSvg();
    expect(missing!.xml).not.toContain('data-tooth="16"');
    // Its number header column still renders (odontogram shows missing numbers too).
    expect(missing!.xml).toContain(">16<");
  });

  it("2.2.3 (round 2): a MILKTOOTH renders the deciduous artwork (data-milktooth)", async () => {
    // Tooth 11 is a primary position (template 11 carries #milktooth-base).
    __setToothStateForTest(11, { toothSelection: "milktooth" });
    const built = await buildPerioSvg();
    expect(built!.xml).toContain('data-milktooth="1"');
    expect(built!.xml).toContain('data-tooth="11"');
  });

  it("2.2.3 (round 2): renders faint surface-letter guides (M/D/B/L) on a charted plaque row", async () => {
    setPlaque(18, "mesial", true);
    const built = await buildPerioSvg();
    expect(built!.xml).toContain("perio-surface-letter");
    // All four surface letters appear as guide text on the plaque row.
    for (const letter of ["M", "D", "B", "L"]) {
      expect(built!.xml).toContain(`>${letter}</text>`);
    }
  });
});
