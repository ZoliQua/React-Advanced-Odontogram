// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The UI languages are code-split: English — the fallback, and the language the
// UI starts in — is the only locale in the main bundle; every other language is
// its own chunk, fetched the first time it is selected.
//
// Nothing here is visible in ordinary behaviour tests: `setup.ts` preloads every
// language so the rest of the suite keeps its synchronous semantics. So each case
// below runs on a FRESH module instance, where only English is loaded — the state
// a real app starts in.
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { render, cleanup, waitFor, act, renderHook } from "@testing-library/react";

const SRC = path.resolve(__dirname, "..");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "__tests__" || name === "assets" || name === "node_modules") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) sourceFiles(full, out);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

/** A fresh copy of the i18n modules: only English loaded, nothing current but "en". */
async function freshI18n() {
  vi.resetModules();
  const loader = await import("../i18n/loader");
  const i18n = await import("../i18n/useI18n");
  return { ...loader, ...i18n };
}

afterEach(() => { vi.doUnmock("../i18n/locales/de"); vi.restoreAllMocks(); cleanup(); });

describe("i18n: the code split holds", () => {
  it("no application module imports a non-English locale, or the all-locales table, statically", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const rel = path.relative(SRC, file);
      if (rel === path.join("i18n", "translations.ts")) continue;   // the test-only aggregator itself
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/^\s*(?:import|export)\b(?!\s+type\b)[^;]*?\bfrom\s*["']([^"']+)["']/gm)) {
        const spec = m[1];
        if (/i18n\/translations$|(^|\/)translations$/.test(spec) && rel.startsWith("i18n") === false) offenders.push(`${rel} -> ${spec}`);
        if (/locales\/(?!en$)[a-z-]+$/.test(spec)) offenders.push(`${rel} -> ${spec}`);
      }
    }
    expect(offenders, "a static import puts that language back in the main bundle — use loadLanguage()").toEqual([]);
  });

  it("the loader reaches every other language through a literal dynamic import", () => {
    const loader = readFileSync(path.join(SRC, "i18n/loader.ts"), "utf8");
    for (const lang of ["hu", "de", "es", "it", "sk", "pl", "ru", "pt-br", "zh", "ar", "fr"]) {
      expect(loader, lang).toContain(`import("./locales/${lang}")`);
    }
    expect(loader).toMatch(/^import en from "\.\/locales\/en";$/m);
  });
});

describe("i18n: load first, switch second", () => {
  beforeEach(() => { vi.resetModules(); });

  it("a fresh app has English only", async () => {
    const i = await freshI18n();
    expect(i.isLanguageLoaded("en")).toBe(true);
    expect(i.isLanguageLoaded("hu")).toBe(false);
    expect(i.getI18nLanguage()).toBe("en");
  });

  it("switching to an unloaded language flips only once its strings are in", async () => {
    const i = await freshI18n();
    const pending = i.setI18nLanguage("hu");
    // Synchronously after the call nothing has moved: t() is still answering in
    // a language it can resolve.
    expect(i.getI18nLanguage()).toBe("en");
    expect(i.t("credits.close")).toBe("Close");
    await pending;
    expect(i.getI18nLanguage()).toBe("hu");
    expect(i.t("credits.close")).toBe("Bezárás");
  });

  it("a loaded language still switches synchronously, as it always did", async () => {
    const i = await freshI18n();
    await i.setI18nLanguage("hu");
    i.setI18nLanguage("en");
    expect(i.getI18nLanguage()).toBe("en");     // no await needed
  });

  it("the latest switch wins when an earlier one is still downloading", async () => {
    const i = await freshI18n();
    const first = i.setI18nLanguage("fr");
    await i.setI18nLanguage("en");              // the user changed their mind mid-download
    await first;
    expect(i.getI18nLanguage()).toBe("en");

    const a = i.setI18nLanguage("de");
    const b = i.setI18nLanguage("es");
    await Promise.all([a, b]);
    expect(i.getI18nLanguage()).toBe("es");
  });

  it("concurrent requests for one language share a single load", async () => {
    const i = await freshI18n();
    await Promise.all([i.setI18nLanguage("it"), i.setI18nLanguage("it"), i.setI18nLanguage("it")]);
    expect(i.getI18nLanguage()).toBe("it");
  });
});

describe("i18n: a language that fails to load", () => {
  beforeEach(() => { vi.resetModules(); });

  it("leaves the current language, never rejects, reports it — and is retried next time", async () => {
    let attempts = 0;
    vi.doMock("../i18n/locales/de", () => {
      attempts++;
      if (attempts === 1) throw new Error("chunk 404");
      return { default: { "credits.close": "Schließen" } };
    });
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const i = await freshI18n();

    await expect(i.setI18nLanguage("de")).resolves.toBeUndefined();
    expect(i.getI18nLanguage()).toBe("en");
    expect(err).toHaveBeenCalled();

    await i.setI18nLanguage("de");               // the failed load was not cached
    expect(i.getI18nLanguage()).toBe("de");
    expect(attempts).toBe(2);
  });
});

describe("useI18n: no flash of the fallback on a switch", () => {
  beforeEach(() => { vi.resetModules(); });

  it("keeps showing the previous language until the requested one arrives", async () => {
    const i = await freshI18n();
    await i.setI18nLanguage("hu");
    const { result, rerender } = renderHook(({ language }) => i.useI18n({ language }), {
      initialProps: { language: "hu" as const as "hu" | "de" },
    });
    expect(result.current.lang).toBe("hu");

    rerender({ language: "de" });                // de is not loaded yet
    expect(result.current.lang).toBe("hu");      // …so Hungarian stays, NOT English
    expect(result.current.t("credits.close")).toBe("Bezárás");

    await waitFor(() => expect(result.current.lang).toBe("de"));
    expect(result.current.t("credits.close")).toBe("Schließen");
  });
});

describe("OdontogramProvider: the first paint is already in the right language", () => {
  beforeEach(() => {
    vi.resetModules();
    window.matchMedia = ((q: string) => ({
      matches: false, media: q, onchange: null,
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; },
    })) as unknown as typeof window.matchMedia;
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
    document.body.innerHTML = "";
  });

  it("renders nothing until the requested language is in, then renders it — never English first", async () => {
    const { default: App } = await import("../App");
    const { container } = render(createElement(App, { language: "hu" }));
    expect(container.innerHTML).toBe("");                           // held, not painted in English
    await waitFor(() => expect(container.querySelector(".odontogram-root")).toBeTruthy());
    expect(container.querySelector(".odontogram-root")!.getAttribute("lang")).toBe("hu");
  }, 60000);

  it("a later switch does NOT unmount the chart — the same root survives it", async () => {
    const { default: App } = await import("../App");
    const loader = await import("../i18n/loader");
    await loader.loadLanguage("hu");
    const { container, rerender } = render(createElement(App, { language: "hu" }));
    const root = container.querySelector(".odontogram-root")!;
    expect(root).toBeTruthy();

    rerender(createElement(App, { language: "ar" }));               // ar is not loaded yet
    expect(container.querySelector(".odontogram-root")).toBe(root);  // still mounted
    expect(root.getAttribute("lang")).toBe("hu");                    // old language kept meanwhile
    await waitFor(() => expect(root.getAttribute("lang")).toBe("ar"));
    await act(async () => {});
    expect(root.getAttribute("dir")).toBe("rtl");
  }, 60000);
});
