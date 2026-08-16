"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/dashboard/nav-items";
import { hasGrowthAccess, type Plan } from "@/lib/types";

export function Sidebar({ plan }: { plan: Plan }) {
  const pathname = usePathname();
  const unlocked = hasGrowthAccess(plan);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/40 md:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
          <ShieldCheck size={18} />
        </span>
        <span className="font-semibold tracking-tight">Kelsira</span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon, growthOnly }) => {
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
              <span className="flex-1">{label}</span>
              {locked && <Lock size={12} className="shrink-0 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <Link
          href="/"
          className="block rounded-lg border border-border px-3 py-2.5 text-center text-xs text-muted transition-colors hover:text-foreground"
        >
          ← Volver al sitio
        </Link>
      </div>
    </aside>
  );
}
