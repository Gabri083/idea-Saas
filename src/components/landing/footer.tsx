import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Footer({ dict }: { dict: Dictionary["footer"] }) {
  const columns = [dict.columns.product, dict.columns.legal, dict.columns.contact];

  return (
    <footer className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <LogoMark size={32} />
              Kelsira
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{dict.tagline}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted sm:flex-row">
          <span>{dict.rights(new Date().getFullYear())}</span>
          <span>{dict.auditable}</span>
        </div>
      </div>
    </footer>
  );
}
