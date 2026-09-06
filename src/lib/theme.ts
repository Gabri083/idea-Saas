import type { CSSProperties } from "react";
import { LIGHT_TOKENS } from "@/lib/public-page-theme";

// Mirrors lib/i18n/config.ts's LOCALE_COOKIE pattern: a plain, client-safe
// constant + type guard here, with the actual cookies() read living in the
// one server component that needs it (dashboard/layout.tsx) — same split as
// getLocale(), just without a dedicated get-theme.ts since there's only one
// call site so far.
export const THEME_COOKIE = "kelsira_theme";
export type DashboardTheme = "dark" | "light";
export const DEFAULT_DASHBOARD_THEME: DashboardTheme = "dark";

export function isDashboardTheme(value: string | undefined | null): value is DashboardTheme {
  return value === "dark" || value === "light";
}

/**
 * CSS custom-property overrides for the dashboard shell itself (sidebar,
 * topbar, every /dashboard/* page) — separate from publicPageThemeStyle,
 * which themes the two customer-facing pages (/review, /resenas) per the
 * business's own widget accent/font choice. This one is Kelsira's own app
 * chrome: no accent/font override, just light vs. dark backgrounds.
 */
export function dashboardThemeStyle(theme: DashboardTheme): CSSProperties {
  return {
    ...(theme === "light" ? LIGHT_TOKENS : {}),
    colorScheme: theme,
  } as CSSProperties;
}
