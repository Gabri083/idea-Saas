import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function Navbar({ dict, locale }: { dict: Dictionary["nav"]; locale: Locale }) {
  const links = [
    { href: "#problema-solucion", label: dict.product },
    { href: "#como-funciona", label: dict.howItWorks },
    { href: "#precios", label: dict.pricing },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <LogoMark size={32} />
          Kelsira
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} className="hidden sm:inline-flex" />
          <Link href="/login" className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block">
            {dict.login}
          </Link>
          <LinkButton href="/signup" size="sm">
            {dict.cta}
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
