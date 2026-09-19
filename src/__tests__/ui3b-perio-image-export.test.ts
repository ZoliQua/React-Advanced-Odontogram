// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-3b Task 5: `exportPerioSvg()`/`exportPerioImage()` — the perio-chart
// export menu items. `exportPerioSvg` awaits T4's `buildPerioSvg()`, which
// itself awaits `loadTemplateCache()` (perioGraphic.ts) — jsdom has no real
// network, so this suite stubs `global.fetch` to serve the real on-disk SVG
// assets, the SAME seam `ui3b-build-perio-svg.test.ts` already uses.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { exportPerioSvg, __resetChartStateForTest, setPerioSite } from "../odontogram";

const testFileUrl = import.meta.url;
function svgFor(name: string): string {
  return readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}`, testFileUrl)), "utf8");
}

describe("UI-3b T5: perio image export", () => {
  beforeEach(() => {
    __resetChartStateForTest();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown) => {
        const m = String(url).match(/(\d+\.svg)(?:\?.*)?$/);
        if (!m) throw new Error(`unexpected fetch: ${String(url)}`);
        return { ok: true, status: 200, text: async () => svgFor(m[1]) } as unknown as Response;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exportPerioSvg triggers a download when perio data exists", async () => {
    setPerioSite(11, "MB", { pd: 4 });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await exportPerioSvg();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
