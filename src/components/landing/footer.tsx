import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const columns = [
  {
    title: "Producto",
    links: [
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Precios", href: "#precios" },
      { label: "Programa de afiliados", href: "/afiliados" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos del Servicio", href: "/legal/terminos" },
      { label: "Política de Privacidad", href: "/legal/privacidad" },
      { label: "Política de Transparencia de la IA", href: "/legal/transparencia-ia" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "hola@kelsira.app", href: "mailto:hola@kelsira.app" },
      { label: "Soporte", href: "mailto:soporte@kelsira.app" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt/15 text-cobalt">
                <ShieldCheck size={18} />
              </span>
              Kelsira
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Reputación justa y reseñas asistidas por IA para e-commerce.
            </p>
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
          <span>© {new Date().getFullYear()} Kelsira. Todos los derechos reservados.</span>
          <span>Cada calificación IA es auditable y explicable.</span>
        </div>
      </div>
    </footer>
  );
}
