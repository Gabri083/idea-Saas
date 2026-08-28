import type { CSSProperties } from "react";
import type { WidgetConfig } from "@/lib/types";

const LIGHT_TOKENS: Record<string, string> = {
  "--background": "#f7f8fa",
  "--surface": "#ffffff",
  "--surface-2": "#f1f2f5",
  "--border": "#e5e7eb",
  "--foreground": "#111318",
  "--muted": "#6b7280",
  "--grid-line": "rgba(0, 0, 0, 0.04)",
};

const FONT_STACK: Record<string, string> = {
  inter: "Inter, ui-sans-serif, sans-serif",
  "system-ui": "system-ui, sans-serif",
  georgia: "Georgia, serif",
  mono: "ui-monospace, monospace",
};

/**
 * CSS custom-property overrides so a business's theme/accent/font choice
 * (the same ones already saved for the embeddable widget) carries onto the
 * two Kelsira-hosted public pages — /review and /resenas. Every color/font
 * utility class on those pages already resolves through these same variable
 * names (see globals.css), so this is the only per-page work needed: no
 * client JS, no extra request, nothing that costs page-load time. Layout,
 * border radius and the "Verificado por Kelsira" branding stay fixed —
 * these remain Kelsira's own pages, only superficially on-brand.
 */
export function publicPageThemeStyle(
  config: Pick<WidgetConfig, "theme_mode" | "accent_color" | "font_family">,
): CSSProperties {
  const isDark = config.theme_mode !== "light";
  return {
    ...(isDark ? {} : LIGHT_TOKENS),
    "--cobalt": config.accent_color,
    "--cobalt-dim": config.accent_color,
    fontFamily: FONT_STACK[config.font_family] ?? undefined,
    colorScheme: isDark ? "dark" : "light",
  } as CSSProperties;
}
