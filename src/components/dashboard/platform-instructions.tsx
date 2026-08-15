"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Platform = "shopify" | "wordpress" | "other";

const TABS: { id: Platform; label: string }[] = [
  { id: "shopify", label: "Shopify" },
  { id: "wordpress", label: "WordPress" },
  { id: "other", label: "Otro / HTML" },
];

const STEPS: Record<Platform, string[]> = {
  shopify: [
    "Entra a tu panel de Shopify y ve a “Tienda online” → “Temas”.",
    "En tu tema activo, haz click en el botón “Personalizar”.",
    "En la página donde quieras mostrar las reseñas (ej. tu página de inicio, o la ficha de un producto), busca el botón “Agregar sección” en el panel izquierdo — normalmente está al final de la lista de secciones.",
    "En el buscador que aparece, escribe “Liquid personalizado” (en inglés: “Custom Liquid”) y selecciónalo.",
    "Se abre un cuadro de texto — pega ahí el código que copiaste arriba.",
    "Arriba a la derecha, haz click en “Guardar”.",
  ],
  wordpress: [
    "Entra a tu escritorio de WordPress (normalmente en tudominio.com/wp-admin).",
    "Ve a “Páginas” (o “Entradas”) y abre la página donde quieras mostrar las reseñas, o crea una nueva.",
    "Dentro del editor, haz click en el botón “+” (Agregar bloque) donde quieras insertar el widget.",
    "Busca el bloque “HTML personalizado” (en inglés: “Custom HTML”) y selecciónalo.",
    "Pega el código que copiaste arriba dentro de ese bloque.",
    "Haz click en “Actualizar” o “Publicar” arriba a la derecha.",
  ],
  other: [
    "Abre el archivo o editor de código de tu sitio.",
    "Busca la etiqueta de cierre </body> (normalmente al final del archivo).",
    "Pega el código que copiaste arriba justo antes de esa línea.",
    "Guarda y publica los cambios.",
  ],
};

const NOTES: Record<Platform, string> = {
  shopify:
    "Si no encuentras “Liquid personalizado” en tu tema, es porque algunos temas no lo incluyen por defecto — escríbenos y te ayudamos con otra alternativa.",
  wordpress:
    "¿Usas WooCommerce y quieres que el widget aparezca en todas las páginas (ej. en el pie de página)? Ve a “Apariencia” → “Widgets”, busca “HTML personalizado”, arrástralo a la zona que quieras, pega el código ahí y guarda.",
  other:
    "Si tu sitio está hecho con otra plataforma (Wix, Squarespace, etc.), busca la opción para agregar “código personalizado” o “HTML embebido” — casi todas lo ofrecen.",
};

export function PlatformInstructions() {
  const [platform, setPlatform] = useState<Platform>("shopify");

  return (
    <div>
      <div className="flex gap-1.5 rounded-lg border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPlatform(tab.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              platform === tab.id
                ? "bg-cobalt/15 text-cobalt"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ol className="mt-4 flex flex-col gap-2.5">
        {STEPS[platform].map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cobalt/10 text-[11px] font-medium text-cobalt">
              {i + 1}
            </span>
            <span className="text-foreground/90">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">{NOTES[platform]}</p>
    </div>
  );
}
