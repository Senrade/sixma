"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { en } from "./messages/en";
import type { MessageKey, Messages } from "./messages/types";
import { vi } from "./messages/vi";

export type Locale = "vi" | "en";

const STORAGE_KEY = "veritas-lang";
const LANGUAGE_EVENT = "veritas-language-change";
const DEFAULT_LOCALE: Locale = "vi";
const messages: Record<Locale, Partial<Messages>> = { vi, en };
let fallbackLocale: Locale = DEFAULT_LOCALE;

type Replacements = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, replacements?: Replacements) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "vi" || value === "en";
}

function getLocaleSnapshot(): Locale {
  try {
    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(storedLocale) ? storedLocale : fallbackLocale;
  } catch {
    return fallbackLocale;
  }
}

function subscribeToLocale(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(LANGUAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANGUAGE_EVENT, callback);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    () => DEFAULT_LOCALE,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    fallbackLocale = nextLocale;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Keep the in-memory selection when storage is unavailable.
    }
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }, []);

  const t = useCallback(
    (key: MessageKey, replacements?: Replacements) => {
      const message = messages[locale][key] ?? en[key];
      if (!replacements) return message;

      return Object.entries(replacements).reduce(
        (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
        message,
      );
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
