"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { THEME_COOKIE, type DashboardTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  theme,
  lightLabel,
  darkLabel,
}: {
  theme: DashboardTheme;
  lightLabel: string;
  darkLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingTheme, setPendingTheme] = useState<DashboardTheme | null>(null);

  useEffect(() => {
    if (!pendingTheme || pendingTheme === theme) return;
    document.cookie = `${THEME_COOKIE}=${pendingTheme};path=/;max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => router.refresh());
  }, [pendingTheme, theme, router]);

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs">
      {([
        ["dark", darkLabel],
        ["light", lightLabel],
      ] as const).map(([value, label]) => (
        <button
          key={value}
          onClick={() => setPendingTheme(value)}
          disabled={isPending}
          aria-current={theme === value}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition-colors disabled:opacity-60",
            theme === value ? "bg-cobalt/15 text-cobalt" : "text-muted hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
