"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/dashboard/nav-items";
import { hasGrowthAccess, type Plan } from "@/lib/types";
import { LogoMark } from "@/components/brand/logo-mark";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type SidebarDict = Pick<Dictionary["dashboard"], "nav" | "backToSite" | "planUsage" | "planLabels"> & {
  viewPlans: string;
};

export function Sidebar({
  plan,
  usage,
  dict,
}: {
  plan: Plan;
  usage: { used: number; cap: number | null };
  dict: SidebarDict;
}) {
  const pathname = usePathname();
  const unlocked = hasGrowthAccess(plan);
  const pct = usage.cap == null ? null : Math.min(100, Math.round((usage.used / usage.cap) * 100));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/40 md:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <LogoMark size={32} />
        <span className="font-semibold tracking-tight">Kelsira</span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {navItems.map(({ href, key, icon: Icon, growthOnly }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          const locked = growthOnly && !unlocked;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-cobalt/10 text-cobalt"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{dict.nav[key]}</span>
              {locked && <Lock size={12} className="shrink-0 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-4">
        <Link href="/dashboard/settings" className="block rounded-lg border border-border px-3 py-2.5 text-xs transition-colors hover:bg-surface-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground/85">
              {pct == null
                ? dict.planUsage.compactUnlimited
                : dict.planUsage.usageOf.replace("{used}", String(usage.used)).replace("{cap}", String(usage.cap))}
            </span>
            <span className="shrink-0 text-muted">{dict.planLabels[plan]}</span>
          </div>
          {pct != null && (
            <>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn("h-full rounded-full", pct >= 100 ? "bg-rose" : pct >= 80 ? "bg-amber" : "bg-cobalt")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="mt-2 block text-muted underline underline-offset-2">{dict.viewPlans}</span>
            </>
          )}
        </Link>

        <Link
          href="/"
          className="block rounded-lg border border-border px-3 py-2.5 text-center text-xs text-muted transition-colors hover:text-foreground"
        >
          {dict.backToSite}
        </Link>
      </div>
    </aside>
  );
}
