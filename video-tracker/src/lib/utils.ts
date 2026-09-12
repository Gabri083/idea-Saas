import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PaymentStatus, VideoStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(amount ?? 0);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export const STATUS_LABELS: Record<VideoStatus, string> = {
  pendiente: "Pendiente",
  en_edicion: "En edición",
  en_revision: "En revisión",
  aprobado: "Aprobado",
  publicado: "Publicado",
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  no_pagado: "No pagado",
  pendiente: "Pendiente",
  pagado: "Pagado",
};

export const STATUS_BADGE_CLASSES: Record<VideoStatus, string> = {
  pendiente: "bg-slate-100 text-slate-700",
  en_edicion: "bg-blue-100 text-blue-700",
  en_revision: "bg-amber-100 text-amber-700",
  aprobado: "bg-violet-100 text-violet-700",
  publicado: "bg-emerald-100 text-emerald-700",
};

export const PAYMENT_BADGE_CLASSES: Record<PaymentStatus, string> = {
  no_pagado: "bg-rose-100 text-rose-700",
  pendiente: "bg-amber-100 text-amber-700",
  pagado: "bg-emerald-100 text-emerald-700",
};

export function currentMonthRange(monthValue?: string) {
  const now = monthValue ? new Date(`${monthValue}-01T00:00:00`) : new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function monthValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
