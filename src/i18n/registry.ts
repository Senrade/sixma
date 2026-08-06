import enResources from "./locales/en";
import viResources from "./locales/vi";

export const LOCALES = {
  en: {
    label: "English",
    htmlLang: "en",
    status: "complete",
    fallback: null,
    load: async () => enResources,
  },
  vi: {
    label: "Tiếng Việt",
    htmlLang: "vi",
    status: "complete",
    fallback: "en",
    load: async () => viResources,
  },
} as const;

export type Locale = keyof typeof LOCALES;
export type LocaleStatus = (typeof LOCALES)[Locale]["status"];

export const DEFAULT_LOCALE: Locale = "vi";
export const SUPPORTED_LOCALES = Object.keys(LOCALES) as Locale[];

export interface LocaleOption {
  code: Locale;
  label: string;
}

export function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === "string" && value in LOCALES;
}

export function getLocaleOptions(): LocaleOption[] {
  return SUPPORTED_LOCALES.map((code) => ({ code, label: LOCALES[code].label }));
}

export async function loadLocale(locale: Locale) {
  return LOCALES[locale].load();
}
