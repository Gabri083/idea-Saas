import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";

const links = [
  { href: "#problema-solucion", label: "Producto" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
];

export function Navbar() {
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
          <Link href="/login" className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block">
            Iniciar sesión
          </Link>
          <LinkButton href="/signup" size="sm">
            Empezar gratis
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
