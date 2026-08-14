import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Footer } from "@/components/landing/footer";

const links = [
  { href: "/legal/terminos", label: "Términos del Servicio" },
  { href: "/legal/privacidad", label: "Política de Privacidad" },
  { href: "/legal/transparencia-ia", label: "Transparencia de la IA" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
              <ShieldCheck size={18} />
            </span>
            Veris
          </Link>
          <nav className="hidden gap-6 text-sm text-muted sm:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-grid">
        <div className="mx-auto max-w-3xl px-6 py-16">{children}</div>
      </main>
      <Footer />
    </>
  );
}
