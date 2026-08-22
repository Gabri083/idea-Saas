import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES } from "@/lib/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Picks a default language from the browser's Accept-Language header the
 * first time a visitor shows up, without touching the URL (no /en or /es
 * prefix) — every route stays locale-agnostic, only the cookie decides
 * which dictionary a Server Component reads. An explicit choice from the
 * language switcher always overrides this afterwards.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(LOCALE_COOKIE)) return NextResponse.next();

  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferred = acceptLanguage.toLowerCase().split(",")[0]?.split("-")[0];
  const locale = LOCALES.includes(preferred as (typeof LOCALES)[number]) ? preferred! : DEFAULT_LOCALE;

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, locale, { maxAge: ONE_YEAR, path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|svg|ico)).*)"],
};
