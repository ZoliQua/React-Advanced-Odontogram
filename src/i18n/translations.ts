// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// EVERY locale, statically imported — for tests and tooling only.
//
// Application code must never import this module's value: doing so would pull
// all twelve languages back into the main bundle, which is exactly what
// `./loader.ts` exists to avoid. The UI reads strings through `t()` in
// `./useI18n.ts`. A guard test (`i18n-lazy-load.test.ts`) fails if any
// non-test module imports this file.
//
// The key-completeness tests use it to check that every language carries the
// same set of keys as Hungarian, the authoritative source.
import type { Language } from "./languages";
import hu from "./locales/hu";
import en from "./locales/en";
import de from "./locales/de";
import es from "./locales/es";
import it from "./locales/it";
import sk from "./locales/sk";
import pl from "./locales/pl";
import ru from "./locales/ru";
import ptBr from "./locales/pt-br";
import zh from "./locales/zh";
import ar from "./locales/ar";
import fr from "./locales/fr";

export type { Language } from "./languages";

/**
 * Master translation table keyed by {@link Language}. Hungarian (`hu`) is the
 * authoritative source — every other language must contain exactly the same
 * set of keys. Template placeholders use `{{name}}` syntax.
 */
export const translations: Record<Language, Record<string, string>> = {
  hu, en, de, es, it, sk, pl, ru, "pt-br": ptBr, zh, ar, fr,
};
