// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; stub it so code paths that call it
// (e.g. the intro tour) do not crash during tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Every UI language is a lazily loaded chunk in the app (only English is
// bundled statically). Load them all up front so the suite keeps the
// synchronous semantics it was written against: `setI18nLanguage("hu")` switches
// at once and `t()` answers in Hungarian on the next line. The lazy path itself
// is covered on a fresh module instance in `i18n-lazy-load.test.ts`.
import { LANGUAGES } from "../i18n/languages";
import { loadLanguage } from "../i18n/loader";
await Promise.all(LANGUAGES.map((lang) => loadLanguage(lang)));
