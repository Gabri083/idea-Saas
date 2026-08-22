"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);

  useEffect(() => {
    if (!pendingLocale || pendingLocale === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${pendingLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    // Best-effort: persists the choice on the business record (if signed in)
    // so async transactional emails can match it later. No-ops silently on
    // the public marketing site, where there's no session to attach it to.
    fetch("/api/business/locale", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: pendingLocale }),
    }).catch(() => {});
    startTransition(() => router.refresh());
  }, [pendingLocale, locale, router]);

  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs", className)}>
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setPendingLocale(l)}
          disabled={isPending}
          aria-current={locale === l}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium uppercase transition-colors disabled:opacity-60",
            locale === l ? "bg-cobalt/15 text-cobalt" : "text-muted hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
