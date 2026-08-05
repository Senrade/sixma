"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCALE_COOKIE, type Locale, type LocaleOption } from "./config";
import type { MessageKey, Messages } from "./messages/types";
import { localizePath, replaceLocalePrefix } from "./routing";

const STORAGE_KEY = "veritas-lang";

type Replacements = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  localeOptions: LocaleOption[];
  setLocale: (locale: Locale) => void;
  localizePath: (href: string) => string;
  t: (key: MessageKey, replacements?: Replacements) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
  localeOptions,
  messages,
}: {
  children: ReactNode;
  initialLocale: Locale;
  localeOptions: LocaleOption[];
  messages: Messages;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = initialLocale;

  const setLocale = useCallback((nextLocale: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // The cookie and in-memory selection remain the sources of truth.
    }
    const query = searchParams.toString();
    const hash = window.location.hash;
    router.push(`${replaceLocalePrefix(pathname, nextLocale)}${query ? `?${query}` : ""}${hash}`);
  }, [pathname, router, searchParams]);

  const getLocalizedPath = useCallback(
    (href: string) => localizePath(locale, href),
    [locale],
  );

  const t = useCallback(
    (key: MessageKey, replacements?: Replacements) => {
      const message = messages[key];
      if (!replacements) return message;

      return Object.entries(replacements).reduce(
        (result, [name, value]) => result.replaceAll(`{{${name}}}`, String(value)),
        message,
      );
    },
    [messages],
  );

  const value = useMemo(
    () => ({ locale, localeOptions, localizePath: getLocalizedPath, setLocale, t }),
    [getLocalizedPath, locale, localeOptions, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
