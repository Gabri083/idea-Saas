"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Review, WidgetConfig } from "@/lib/types";

/** Only used to fill the live preview when the business has no real reviews yet. */
const SAMPLE_REVIEWS: Review[] = [
  {
    id: "sample-1",
    business_id: "sample",
    customer_name: "Camila R.",
    customer_email: "",
    review_text:
      "Compré hace poco y quedé muy conforme con la calidad, la atención fue excelente. Lo único es que el envío se demoró un poco más de lo esperado.",
    customer_star_rating: null,
    product_score: 5,
    service_score: 5,
    delivery_score: 3,
    detected_issues: [],
    ai_summary: null,
    overall_ai_rating: 4.4,
    penalty_applied: 0,
    status: "published",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    business_id: "sample",
    customer_name: "Diego M.",
    customer_email: "",
    review_text: "Todo perfecto, superó mis expectativas. Llegó rápido y bien embalado.",
    customer_star_rating: null,
    product_score: 5,
    service_score: 4,
    delivery_score: 5,
    detected_issues: [],
    ai_summary: null,
    overall_ai_rating: 4.7,
    penalty_applied: 0,
    status: "published",
    created_at: new Date().toISOString(),
  },
];

const accentPresets = ["#4f7cff", "#34d399", "#fbbf24", "#fb7185", "#8b5cf6"];
const radiusOptions: WidgetConfig["border_radius"][] = ["none", "sm", "md", "lg", "full"];
const radiusPx: Record<WidgetConfig["border_radius"], string> = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "16px",
  full: "28px", // capped: literal 999px pill-rounds badges nicely but mangles multi-line cards
};
const fontOptions = ["inter", "system-ui", "georgia", "mono"];
const fontStack: Record<string, string> = {
  inter: "Inter, ui-sans-serif, sans-serif",
  "system-ui": "system-ui, sans-serif",
  georgia: "Georgia, serif",
  mono: "ui-monospace, monospace",
};

export function WidgetConfigurator({
  businessId,
  initialConfig,
  reviews,
}: {
  businessId: string;
  initialConfig: WidgetConfig;
  reviews: Review[];
}) {
  const [config, setConfig] = useState(initialConfig);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copied, setCopied] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "https://cdn.tusaas.com",
  );

  const snippet = `<script src="${origin}/widget.js" data-business-id="${businessId}"></script>`;

  async function save() {
    setSaveStatus("saving");
    try {
      await fetch("/api/widget-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, business_id: businessId }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
    }
  }

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const usingSampleReviews = reviews.length === 0;
  const previewReviews = usingSampleReviews ? SAMPLE_REVIEWS : reviews;

  const average =
    previewReviews.reduce((s, r) => s + r.overall_ai_rating, 0) / previewReviews.length;

  const isDark = config.theme_mode === "dark";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="flex flex-col gap-6 p-6">
        <div>
          <p className="text-sm font-medium">Color de acento</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {accentPresets.map((c) => (
              <button
                key={c}
                onClick={() => setConfig((p) => ({ ...p, accent_color: c }))}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-transform",
                  config.accent_color === c ? "scale-110 border-foreground" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              value={config.accent_color}
              onChange={(e) => setConfig((p) => ({ ...p, accent_color: e.target.value }))}
              className="h-8 w-8 cursor-pointer rounded-full border border-border bg-transparent p-0"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Modo</p>
          <div className="mt-2 flex gap-2">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setConfig((p) => ({ ...p, theme_mode: mode }))}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors",
                  config.theme_mode === mode
                    ? "border-cobalt/40 bg-cobalt/10 text-cobalt"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {mode === "light" ? "Claro" : "Oscuro"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Bordes</p>
          <div className="mt-2 flex gap-2">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setConfig((p) => ({ ...p, border_radius: r }))}
                className={cn(
                  "flex-1 border px-2 py-2 text-xs uppercase transition-colors",
                  config.border_radius === r
                    ? "border-cobalt/40 bg-cobalt/10 text-cobalt"
                    : "border-border text-muted hover:text-foreground",
                )}
                style={{ borderRadius: radiusPx[r] }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Tipografía</p>
          <select
            value={config.font_family}
            onChange={(e) => setConfig((p) => ({ ...p, font_family: e.target.value }))}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {fontOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium">Diseño</p>
          <div className="mt-2 flex gap-2">
            {(["carousel", "badge", "grid"] as const).map((layout) => (
              <button
                key={layout}
                onClick={() => setConfig((p) => ({ ...p, layout }))}
                className={cn(
                  "flex-1 rounded-lg border px-2 py-2 text-xs capitalize transition-colors",
                  config.layout === layout
                    ? "border-cobalt/40 bg-cobalt/10 text-cobalt"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {layout === "carousel" ? "Carrusel" : layout === "badge" ? "Badge" : "Grilla"}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.show_breakdown}
            onChange={(e) => setConfig((p) => ({ ...p, show_breakdown: e.target.checked }))}
            className="h-4 w-4 rounded accent-cobalt"
          />
          Mostrar desglose por categoría
        </label>

        <Button onClick={save} disabled={saveStatus === "saving"} className="w-full">
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando…
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check size={16} /> Guardado
            </>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </Card>

      <div className="flex min-w-0 flex-col gap-6">
        <Card className="min-w-0 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-muted">Previsualización en vivo</p>
            {usingSampleReviews && (
              <span className="rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 text-xs text-amber">
                Datos de ejemplo — se reemplaza con tus reseñas reales
              </span>
            )}
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{
              background: isDark ? "#101114" : "#ffffff",
              color: isDark ? "#f4f5f7" : "#111318",
              borderColor: isDark ? "#232529" : "#e5e7eb",
              fontFamily: fontStack[config.font_family] ?? undefined,
            }}
          >
            {config.layout === "badge" ? (
              <div
                className="inline-flex items-center gap-2 border px-4 py-2.5"
                style={{ borderRadius: radiusPx[config.border_radius], borderColor: isDark ? "#232529" : "#e5e7eb" }}
              >
                <span style={{ color: config.accent_color }}>{"★".repeat(Math.round(average))}</span>
                <strong>{average.toFixed(1)}/5</strong>
                <span className="text-xs opacity-60">
                  ({previewReviews.length} reseñas · Puntaje Objetivo IA)
                </span>
              </div>
            ) : (
              <div
                className={cn(
                  config.layout === "grid" ? "grid grid-cols-2 gap-3" : "flex gap-3 overflow-x-auto",
                )}
              >
                {previewReviews.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="min-w-[220px] flex-1 overflow-hidden border p-4 text-sm"
                    style={{ borderRadius: radiusPx[config.border_radius], borderColor: isDark ? "#232529" : "#e5e7eb" }}
                  >
                    <span style={{ color: config.accent_color }}>
                      {"★".repeat(Math.round(r.overall_ai_rating))}
                    </span>{" "}
                    {r.overall_ai_rating.toFixed(1)}/5
                    <p className="mt-2 line-clamp-3 opacity-90">{r.review_text}</p>
                    <p className="mt-2 text-xs opacity-60">— {r.customer_name}</p>
                    {config.show_breakdown && (
                      <div className="mt-2 flex gap-3 text-[11px] opacity-70">
                        <span>Producto {r.product_score}★</span>
                        <span>Atención {r.service_score}★</span>
                        <span>Envío {r.delivery_score}★</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-right text-[10px] opacity-50">
              Reseñas verificadas por Veris — Puntaje Objetivo IA
            </p>
          </div>
        </Card>

        <Card className="min-w-0 p-6">
          <p className="mb-3 text-sm font-medium text-muted">Código para tu tienda</p>
          <div className="flex min-w-0 items-start gap-2 rounded-xl border border-border bg-surface p-4">
            <code
              suppressHydrationWarning
              className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-xs text-foreground/90"
            >
              {snippet}
            </code>
            <button
              onClick={copySnippet}
              className="shrink-0 rounded-lg border border-border p-2 transition-colors hover:bg-surface-2"
              aria-label="Copiar código"
            >
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Pega este bloque justo antes de {"</body>"} en tu tema de Shopify, WooCommerce o tu
            sitio propio.
          </p>
        </Card>
      </div>
    </div>
  );
}
