import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/i18n/registry";
import { LOCALE_COOKIE } from "@/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const acceptedLanguages = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((entry) => entry.split(";", 1)[0].trim().toLowerCase());

  return SUPPORTED_LOCALES.find((locale) =>
    acceptedLanguages.some(
      (accepted) => accepted === locale || accepted.startsWith(`${locale}-`),
    ),
  ) ?? DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferredLocale(request);
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(destination);
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
