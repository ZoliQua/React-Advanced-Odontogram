// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// The UI strings, loaded one language at a time.
//
// Twelve languages used to ship in a single 770 KB module that every app paid
// for, whichever language it showed. Now English — the fallback, and the
// language the UI starts in — is the only locale in the main bundle; each other
// language is its own chunk, fetched the first time it is selected.
//
// `t()` stays synchronous. That works because nothing reads a language before
// it has been loaded: `setI18nLanguage()` loads first and flips second, and the
// React provider holds its first render until the requested language is in.
import en from "./locales/en";
import type { Language } from "./languages";

type Table = Record<string, string>;

const tables: Partial<Record<Language, Table>> = { en };
const inflight = new Map<Language, Promise<Table>>();

// One LITERAL `import()` per language. That is what makes the bundler emit a
// separate chunk for each; a template-string import would be analysed as a glob
// over the folder, which also matches the statically imported `en` above.
const LOADERS: Record<Exclude<Language, "en">, () => Promise<{ default: Table }>> = {
  hu: () => import("./locales/hu"),
  de: () => import("./locales/de"),
  es: () => import("./locales/es"),
  it: () => import("./locales/it"),
  sk: () => import("./locales/sk"),
  pl: () => import("./locales/pl"),
  ru: () => import("./locales/ru"),
  "pt-br": () => import("./locales/pt-br"),
  zh: () => import("./locales/zh"),
  ar: () => import("./locales/ar"),
  fr: () => import("./locales/fr"),
};

/** Whether a language's strings are available (synchronously) right now. */
export function isLanguageLoaded(lang: Language): boolean {
  return tables[lang] !== undefined;
}

/** A loaded language's string table, or `undefined` if it has not arrived yet. */
export function getLoadedTable(lang: Language): Table | undefined {
  return tables[lang];
}

/**
 * Fetch a language's strings. Resolves at once for one already loaded; concurrent
 * calls share a single request. A FAILED load (offline, a chunk missing from a
 * deploy) is not cached, so the next call retries instead of being stuck for the
 * rest of the session. Rejects on failure — `setI18nLanguage()` is the caller
 * that turns that into "stay on the current language".
 */
export function loadLanguage(lang: Language): Promise<void> {
  if(tables[lang]) return Promise.resolve();
  let pending = inflight.get(lang);
  if(!pending){
    pending = LOADERS[lang as Exclude<Language, "en">]()
      .then((m) => (tables[lang] = m.default))
      .finally(() => { inflight.delete(lang); });
    inflight.set(lang, pending);
  }
  return pending.then(() => undefined);
}
