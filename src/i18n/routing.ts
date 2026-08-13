import type { Locale } from "./registry";

export function localizePath(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

export function replaceLocalePrefix(pathname: string, locale: Locale): string {
  const nextSlash = pathname.indexOf("/", 1);
  const suffix = nextSlash < 0 ? "" : pathname.slice(nextSlash);
  return `/${locale}${suffix}`;
}
