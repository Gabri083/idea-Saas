"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  Wrench,
  ShieldQuestion,
  History,
  Code2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/reviews", label: "Reseñas", icon: MessagesSquare },
  { href: "/dashboard/consultant", label: "Consultor IA", icon: Wrench },
  { href: "/dashboard/appeals", label: "Apelaciones", icon: ShieldQuestion },
  { href: "/dashboard/calibration", label: "Calibración", icon: History },
  { href: "/dashboard/widget", label: "Widget", icon: Code2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/40 md:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
          <ShieldCheck size={18} />
        </span>
        <span className="font-semibold tracking-tight">Veris</span>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
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
              {label}
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
