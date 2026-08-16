"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformInstructions } from "@/components/dashboard/platform-instructions";
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
    created_at: new Date(Date.now() - 6 * 86_400_000).toISOString(),
  },
  {
    id: "sample-3",
    business_id: "sample",
    customer_name: "Fernanda A.",
    customer_email: "",
    review_text: "Buena calidad, pero tuve que escribir dos veces para que me respondieran.",
    customer_star_rating: null,
    product_score: 4,
    service_score: 3,
    delivery_score: 5,
    detected_issues: [],
    ai_summary: null,
    overall_ai_rating: 4.0,
    penalty_applied: 0,
    status: "published",
    created_at: new Date(Date.now() - 13 * 86_400_000).toISOString(),
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
const layoutOptions: { id: WidgetConfig["layout"]; label: string }[] = [
  { id: "carousel", label: "Carrusel" },
  { id: "badge", label: "Badge" },
  { id: "grid", label: "Grilla" },
  { id: "wall", label: "Muro" },
  { id: "spotlight", label: "Destacada" },
];

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z";

function StarIcon({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d={STAR_PATH} />
    </svg>
  );
}

function Stars({ value, size = 15, accent, bg }: { value: number; size?: number; accent: string; bg: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const pct = Math.max(0, Math.min(100, (value - i) * 100));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <span className="absolute inset-0">
              <StarIcon size={size} fill={bg} />
            </span>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <StarIcon size={size} fill={accent} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const AVATAR_HUES = [210, 260, 330, 20, 160, 40, 280, 190];
function hashStr(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
function Avatar({ name }: { name: string }) {
  const hue = AVATAR_HUES[hashStr(name) % AVATAR_HUES.length];
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
      style={{ background: `hsl(${hue},65%,50%)` }}
    >
      {initials(name)}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function Breakdown({ review, pillBg }: { review: Review; pillBg: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      <span className="rounded-full px-2.5 py-0.5 text-[10.5px] opacity-85" style={{ background: pillBg }}>
        Producto {review.product_score}★
      </span>
      <span className="rounded-full px-2.5 py-0.5 text-[10.5px] opacity-85" style={{ background: pillBg }}>
        Atención {review.service_score}★
      </span>
      <span className="rounded-full px-2.5 py-0.5 text-[10.5px] opacity-85" style={{ background: pillBg }}>
        Envío {review.delivery_score}★
      </span>
    </div>
  );
}

function ReviewCard({
  review,
  showBreakdown,
  accent,
  isDark,
  radius,
}: {
  review: Review;
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  radius: string;
}) {
  const borderColor = isDark ? "#232529" : "#e5e7eb";
  const starBg = isDark ? "#3a3d44" : "#e2e4e8";
  const pillBg = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  return (
    <div
      className="min-w-0 border p-4 text-sm shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.16)] transition-transform hover:-translate-y-0.5"
      style={{ borderRadius: radius, borderColor }}
    >
      <div className="flex items-center gap-1.5">
        <Stars value={review.overall_ai_rating} accent={accent} bg={starBg} />
        <span className="text-[13px] font-semibold" style={{ color: accent }}>
          {review.overall_ai_rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-2.5 line-clamp-3 opacity-90">&ldquo;{review.review_text}&rdquo;</p>
      <div className="mt-3.5 flex items-center gap-2.5">
        <Avatar name={review.customer_name} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[12.5px] font-medium">{review.customer_name}</span>
          <span className="text-[11px] opacity-55">{formatDate(review.created_at)}</span>
        </div>
      </div>
      {showBreakdown && <Breakdown review={review} pillBg={pillBg} />}
    </div>
  );
}

function Spotlight({
  reviews,
  showBreakdown,
  accent,
  isDark,
}: {
  reviews: Review[];
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(id);
  }, [reviews.length]);

  const review = reviews[Math.min(index, reviews.length - 1)];
  const starBg = isDark ? "#3a3d44" : "#e2e4e8";
  const pillBg = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";

  return (
    <div className="text-center">
      <div className="flex justify-center">
        <Stars value={review.overall_ai_rating} size={18} accent={accent} bg={starBg} />
      </div>
      <p className="mt-3.5 text-base opacity-90">&ldquo;{review.review_text}&rdquo;</p>
      <div className="mt-4 flex items-center justify-center gap-2.5">
        <Avatar name={review.customer_name} />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[12.5px] font-medium">{review.customer_name}</span>
          <span className="text-[11px] opacity-55">{formatDate(review.created_at)}</span>
        </div>
      </div>
      {showBreakdown && (
        <div className="flex justify-center">
          <Breakdown review={review} pillBg={pillBg} />
        </div>
      )}
      {reviews.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Reseña ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 18 : 6,
                background: i === index ? accent : isDark ? "#232529" : "#e5e7eb",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WidgetConfigurator({
  businessId,
  initialConfig,
  reviews,
  canCustomize,
}: {
  businessId: string;
  initialConfig: WidgetConfig;
  reviews: Review[];
  canCustomize: boolean;
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
  const borderColor = isDark ? "#232529" : "#e5e7eb";
  const starBg = isDark ? "#3a3d44" : "#e2e4e8";
  const radius = radiusPx[config.border_radius];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="flex flex-col gap-6 p-6">
        {!canCustomize && (
          <div className="flex items-center gap-2 rounded-lg border border-cobalt/30 bg-cobalt/10 px-3 py-2.5 text-xs text-cobalt">
            <Sparkles size={14} className="shrink-0" />
            Personalizar el widget es parte del plan Growth. Mientras tanto se usa el estilo
            predeterminado.
          </div>
        )}
        <fieldset disabled={!canCustomize} className={cn("contents border-0 p-0 m-0", !canCustomize && "opacity-50")}>
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
          <div className="mt-2 grid grid-cols-3 gap-2">
            {layoutOptions.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setConfig((p) => ({ ...p, layout: id }))}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs transition-colors",
                  config.layout === id
                    ? "border-cobalt/40 bg-cobalt/10 text-cobalt"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {label}
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!config.show_branding}
            onChange={(e) => setConfig((p) => ({ ...p, show_branding: !e.target.checked }))}
            className="h-4 w-4 rounded accent-cobalt"
          />
          Ocultar marca &ldquo;Verificado por Kelsira&rdquo;
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
        </fieldset>
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
              borderColor,
              fontFamily: fontStack[config.font_family] ?? undefined,
            }}
          >
            {config.layout === "badge" ? (
              <div
                className="inline-flex items-center gap-2.5 border px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,.05),0_6px_18px_-10px_rgba(0,0,0,.18)]"
                style={{ borderRadius: radius, borderColor }}
              >
                <Stars value={average} accent={config.accent_color} bg={starBg} />
                <strong style={{ color: config.accent_color }}>{average.toFixed(1)}/5</strong>
                <span className="text-xs opacity-60">
                  ({previewReviews.length} reseñas · Puntaje Objetivo IA)
                </span>
              </div>
            ) : config.layout === "spotlight" ? (
              <Spotlight
                reviews={previewReviews}
                showBreakdown={config.show_breakdown}
                accent={config.accent_color}
                isDark={isDark}
              />
            ) : (
              <div
                className={cn(
                  config.layout === "grid"
                    ? "grid grid-cols-2 gap-3"
                    : config.layout === "wall"
                      ? "flex flex-col gap-3"
                      : "flex gap-3 overflow-x-auto",
                )}
              >
                {(config.layout === "wall" ? previewReviews : previewReviews.slice(0, 4)).map((r) => (
                  <div key={r.id} className={config.layout === "carousel" ? "min-w-[240px] flex-1" : undefined}>
                    <ReviewCard
                      review={r}
                      showBreakdown={config.show_breakdown}
                      accent={config.accent_color}
                      isDark={isDark}
                      radius={radius}
                    />
                  </div>
                ))}
              </div>
            )}
            {config.show_branding && (
              <p className="mt-4 text-right text-[10px] opacity-50">
                Reseñas verificadas por Kelsira — Puntaje Objetivo IA
              </p>
            )}
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
            Copia el código de arriba y sigue los pasos según dónde tengas tu tienda:
          </p>
        </Card>

        <Card className="min-w-0 p-6">
          <p className="mb-3 text-sm font-medium text-muted">Cómo instalarlo paso a paso</p>
          <PlatformInstructions />
        </Card>
      </div>
    </div>
  );
}
