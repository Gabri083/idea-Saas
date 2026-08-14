import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
            <ShieldCheck size={18} />
          </span>
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
            Prueba gratuita
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
