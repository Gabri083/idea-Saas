"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/dashboard/nav-items";
import { hasGrowthAccess, type Plan } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type MobileNavDict = Pick<Dictionary["dashboard"], "nav">;

export function MobileNav({ plan, dict }: { plan: Plan; dict: MobileNavDict }) {
  const pathname = usePathname();
  const unlocked = hasGrowthAccess(plan);

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface/40 px-3 py-2 md:hidden">
      {navItems.map(({ href, key, icon: Icon, growthOnly }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        const locked = growthOnly && !unlocked;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs whitespace-nowrap transition-colors",
              active ? "bg-cobalt/10 text-cobalt" : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <Icon size={14} />
            {dict.nav[key]}
            {locked && <Lock size={11} className="opacity-50" />}
          </Link>
        );
      })}
    </nav>
  );
}
