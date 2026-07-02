// ===========================================================================
// /lib/i18n/index.ts
// ===========================================================================

import type { I18nDictionary, UiLanguage, UiStrings } from "@/lib/types";
import { en } from "./en";
import { hi } from "./hi";
import { hinglish } from "./hinglish";

export { en, hi, hinglish };

export const dictionaries: I18nDictionary = { en, hi, hinglish };

export function getStrings(lang: UiLanguage): UiStrings {
  return dictionaries[lang] ?? en;
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`
  );
}
