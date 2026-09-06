import type { WidgetLayout } from "@/lib/types";

/** Same order as the layout picker in the widget configurator and widget.js's LAYOUT_VALUES. */
export const WIDGET_LAYOUT_ORDER: WidgetLayout[] = [
  "carousel",
  "grid",
  "wall",
  "spotlight",
  "badge",
  "sello",
  "mosaico",
  "cinta",
  "lanzador",
  "barra",
  "fila",
  "notificacion",
  "comparador",
  "franja",
  "cierre",
];

export type WidgetPlacement = "page" | "product" | "sitewide";

// Where each layout actually needs to live in a real storefront — this is the
// one thing the old one-size-fits-all install instructions got wrong. A
// "sitewide" widget (fixed-position, or meant to repeat on every page) pasted
// into a single Custom Liquid/HTML block only shows up on that one page; a
// "product" widget needs to live in the product template itself so it renders
// once per product automatically, not be hand-pasted onto every product.
export const WIDGET_PLACEMENT: Record<WidgetLayout, WidgetPlacement> = {
  carousel: "page",
  grid: "page",
  wall: "page",
  spotlight: "page",
  badge: "page",
  sello: "page",
  mosaico: "page",
  fila: "product",
  comparador: "product",
  cierre: "product",
  cinta: "sitewide",
  lanzador: "sitewide",
  barra: "sitewide",
  notificacion: "sitewide",
  franja: "sitewide",
};
