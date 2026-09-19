// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

/**
 * Supported UI languages.
 *
 * | Code  | Language             |
 * |-------|-----------------------|
 * | hu    | Hungarian             |
 * | en    | English               |
 * | de    | German                |
 * | es    | Spanish               |
 * | it    | Italian               |
 * | sk    | Slovak                |
 * | pl    | Polish                |
 * | ru    | Russian               |
 * | pt-br | Portuguese (Brazil)   |
 * | zh    | Chinese (Simplified) |
 * | ar    | Arabic (RTL — UI mirrors, dental/perio charts pinned LTR) |
 * | fr    | French                |
 *
 * The strings themselves live one file per language in `./locales/`. Only
 * English is bundled statically; every other language is a separate chunk
 * fetched the first time it is selected (see `./loader.ts`).
 */
export type Language = "hu" | "en" | "de" | "es" | "it" | "sk" | "pl" | "ru" | "pt-br" | "zh" | "ar" | "fr";

/** Every supported language, in the order the language menu lists them. */
export const LANGUAGES: readonly Language[] = ["hu", "en", "de", "es", "it", "sk", "pl", "ru", "pt-br", "zh", "ar", "fr"];

/** The language every missing key resolves against, and the one the UI starts in. */
export const FALLBACK_LANGUAGE: Language = "en";
