import { describe, it, expect, beforeEach } from "vitest";
import { importStatus, __collectExportPayloadForTest, __resetChartStateForTest } from "../odontogram";
describe("dxOverrides payload round-trip", () => {
  beforeEach(() => __resetChartStateForTest());
  it("serializes omit-when-empty, hydrates valid entries, rejects invalid, bumps to 2.21", () => {
    importStatus({ version: "2.20", globals: {}, teeth: {
      "16": { toothSelection: "tooth-base", dxOverrides: { calculus: "add", caries: "suppress", nope: "add", pulpitis: "bogus" } },
      "17": { toothSelection: "tooth-base" },
    } });
    // exportStatus() triggers a browser download and returns void; the
    // official test seam __collectExportPayloadForTest() returns the SAME
    // payload exportStatus()/exportFhir() would serialize, without the
    // download side effect.
    const p = __collectExportPayloadForTest() as { version: string; teeth: Record<string, { dxOverrides?: Record<string, string> }> };
    expect(p.version).toBe("2.22");
    expect(p.teeth["16"].dxOverrides).toEqual({ calculus: "add", caries: "suppress" }); // invalid key/value dropped
    expect(p.teeth["17"].dxOverrides).toBeUndefined(); // omit-when-empty
  });
});
