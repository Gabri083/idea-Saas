"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformInstructions } from "@/components/dashboard/platform-instructions";
import { cn, isConfirmed, recencyWeightedAverage } from "@/lib/utils";
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
    customer_star_rating: 1,
    product_score: 5,
    service_score: 5,
    delivery_score: 3,
    detected_issues: [],
    ai_summary: null,
    overall_ai_rating: 4.4,
    penalty_applied: 0,
    status: "published",
    business_reply:
      "¡Gracias por tu comentario! Ya estamos trabajando con nuestro courier para mejorar los tiempos de entrega.",
    business_reply_at: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    business_id: "sample",
    customer_name: "Diego M.",
    customer_email: "",
    review_text: "Todo perfecto, superó mis expectativas. Llegó rápido y bien embalado.",
    customer_star_rating: 5,
    product_score: 5,
    service_score: 4,
    delivery_score: 5,
    detected_issues: [],
    ai_summary: null,
    overall_ai_rating: 4.7,
    penalty_applied: 0,
    status: "published",
    business_reply: null,
    business_reply_at: null,
    created_at: new Date(Date.now() - 6 * 86_400_000).toISOString(),
  },
  {
    id: "sample-3",
    business_id: "sample",
    customer_name: "Fernanda A.",
    customer_email: "",
    review_text: "Buena calidad, pero tuve que escribir dos veces para que me respondieran.",
    customer_star_rating: 3,
    product_score: 4,
    service_score: 3,
    delivery_score: 5,
    detected_issues: [],
    ai_summary: null,
    overall_ai_rating: 4.0,
    penalty_applied: 0,
    status: "published",
    business_reply: null,
    business_reply_at: null,
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
// El Recibo's signature cut corner is a fixed, deliberate 8px — it's part of
// the style's identity, not a generic "roundness" the Bordes control tunes.
// Scaling it with Bordes (0–12px) was too subtle to read as working next to
// every other style's dramatic 0–28px rounding, so it's fixed instead of
// pretending to be configurable.
const TICKET_CUT_PX = 8;
const fontOptions = ["inter", "system-ui", "georgia", "mono"];
const fontStack: Record<string, string> = {
  inter: "Inter, ui-sans-serif, sans-serif",
  "system-ui": "system-ui, sans-serif",
  georgia: "Georgia, serif",
  mono: "ui-monospace, monospace",
};
const layoutOptions: { id: WidgetConfig["layout"]; label: string }[] = [
  { id: "carousel", label: "Carrusel" },
  { id: "grid", label: "Grilla" },
  { id: "wall", label: "Muro" },
  { id: "spotlight", label: "Cita" },
  { id: "badge", label: "Clásico" },
  { id: "sello", label: "Sello" },
  { id: "mosaico", label: "Mosaico" },
];
const cardStyleOptions: { id: WidgetConfig["card_style"]; label: string }[] = [
  { id: "recibo", label: "Recibo" },
  { id: "medidor", label: "Medidor" },
];
// grid/wall/carousel repeat one card per review — the other four layouts are
// single aggregate displays, so the card-style choice doesn't apply to them.
const CARD_STYLE_LAYOUTS: WidgetConfig["layout"][] = ["carousel", "grid", "wall"];

// "Bordes" doesn't mean anything for El Sello (always a circle) or El Recibo
// (its cut corner is a fixed part of the style, not a tunable roundness) —
// show the control only where it actually changes something.
function radiusApplies(layout: WidgetConfig["layout"], cardStyle: WidgetConfig["card_style"]) {
  if (layout === "sello") return false;
  if (CARD_STYLE_LAYOUTS.includes(layout) && cardStyle === "recibo") return false;
  return true;
}


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

function AiTag() {
  return (
    <span
      className="rounded border border-current px-1 py-px text-[9px] font-bold leading-tight tracking-wide opacity-45"
      title="Puntaje calculado por IA a partir del texto de la reseña"
    >
      IA
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

function Reply({ review, businessName, pillBg }: { review: Review; businessName: string; pillBg: string }) {
  if (!review.business_reply) return null;
  return (
    <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: pillBg }}>
      <p className="text-[11px] font-bold opacity-70">Respuesta de {businessName}</p>
      <p className="mt-0.5 text-[12.5px] leading-relaxed opacity-85">{review.business_reply}</p>
    </div>
  );
}

function TicketCard({
  review,
  showBreakdown,
  accent,
  isDark,
  businessName,
}: {
  review: Review;
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  businessName: string;
}) {
  const borderColor = isDark ? "#232529" : "#e5e7eb";
  const starBg = isDark ? "#3a3d44" : "#e2e4e8";
  const pillBg = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  const confirmed = isConfirmed(review);
  const cut = TICKET_CUT_PX;
  const clipPath = `polygon(0 ${cut}px, ${cut}px 0, calc(100% - ${cut}px) 0, 100% ${cut}px, 100% 100%, 0 100%)`;
  return (
    <div
      className="min-w-0 overflow-hidden border text-sm shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.16)] transition-transform hover:-translate-y-0.5"
      style={{ borderColor, clipPath }}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex flex-wrap items-baseline gap-2">
          {confirmed ? (
            <span className="text-lg font-bold" style={{ color: accent }}>
              {review.overall_ai_rating.toFixed(1)}
            </span>
          ) : (
            <>
              <span className="text-[13px] opacity-50 line-through">{review.customer_star_rating!.toFixed(1)}★</span>
              <span className="text-xs opacity-40">→</span>
              <span className="text-lg font-bold" style={{ color: accent }}>
                {review.overall_ai_rating.toFixed(1)}
              </span>
            </>
          )}
          <AiTag />
        </div>
        <p className="mt-1 mb-2.5 text-[10px] uppercase tracking-wide opacity-45">
          {confirmed ? "Confirmado por IA" : "Corrección por hechos, no por enojo"}
        </p>
        <Stars value={review.overall_ai_rating} size={14} accent={accent} bg={starBg} />
      </div>
      <div style={{ margin: "0 16px", borderTop: `1.5px dashed ${borderColor}` }} />
      <div className="px-4 pt-3.5 pb-4">
        <p className="line-clamp-3 opacity-90">&ldquo;{review.review_text}&rdquo;</p>
        {showBreakdown && <Breakdown review={review} pillBg={pillBg} />}
        <div className="mt-3.5 flex items-center gap-2.5">
          <Avatar name={review.customer_name} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-medium">{review.customer_name}</span>
            <span className="text-[11px] opacity-55">{formatDate(review.created_at)}</span>
          </div>
        </div>
        <Reply review={review} businessName={businessName} pillBg={pillBg} />
      </div>
    </div>
  );
}

function GaugeCard({
  review,
  showBreakdown,
  accent,
  isDark,
  radius,
  businessName,
}: {
  review: Review;
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  radius: string;
  businessName: string;
}) {
  const borderColor = isDark ? "#232529" : "#e5e7eb";
  const starBg = isDark ? "#3a3d44" : "#e2e4e8";
  const pillBg = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  const confirmed = isConfirmed(review);
  const rawPct = confirmed ? null : Math.max(0, Math.min(100, ((review.customer_star_rating! - 1) / 4) * 100));
  const finalPct = Math.max(0, Math.min(100, ((review.overall_ai_rating - 1) / 4) * 100));
  const fillLeft = confirmed ? 0 : Math.min(rawPct!, finalPct);
  const fillWidth = confirmed ? finalPct : Math.abs(finalPct - rawPct!);
  return (
    <div
      className="min-w-0 border p-4 text-sm shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.16)] transition-transform hover:-translate-y-0.5"
      style={{ borderRadius: radius, borderColor }}
    >
      <div className="flex items-center gap-2">
        <Stars value={review.overall_ai_rating} size={14} accent={accent} bg={starBg} />
        <AiTag />
      </div>
      <p className="mt-2.5 line-clamp-2 text-[13.5px] opacity-90">&ldquo;{review.review_text}&rdquo;</p>
      <div className="relative mx-0.5 mt-4 mb-2 h-1 rounded-full" style={{ background: pillBg }}>
        <div
          className="absolute top-0 bottom-0 rounded-full opacity-30"
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%`, background: isDark ? "#fff" : "#000" }}
        />
        {!confirmed && (
          <div
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${rawPct}%`, background: isDark ? "#6d707a" : "#9a9da5", border: `2px solid ${isDark ? "#101114" : "#fff"}` }}
          />
        )}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${finalPct}%`, background: accent, border: `2px solid ${isDark ? "#101114" : "#fff"}` }}
        />
      </div>
      <div className="mb-1 flex justify-between text-[11px] opacity-70">
        {confirmed ? (
          <span>
            Cliente e IA: <b style={{ color: accent }}>{review.overall_ai_rating.toFixed(1)}</b>
          </span>
        ) : (
          <>
            <span>
              Cliente <b>{review.customer_star_rating!.toFixed(1)}</b>
            </span>
            <span style={{ color: accent }}>
              IA <b style={{ color: accent }}>{review.overall_ai_rating.toFixed(1)}</b>
            </span>
          </>
        )}
      </div>
      {showBreakdown && <Breakdown review={review} pillBg={pillBg} />}
      <div className="mt-3.5 flex items-center gap-2.5">
        <Avatar name={review.customer_name} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[12.5px] font-medium">{review.customer_name}</span>
          <span className="text-[11px] opacity-55">{formatDate(review.created_at)}</span>
        </div>
      </div>
      <Reply review={review} businessName={businessName} pillBg={pillBg} />
    </div>
  );
}

function ClassicBadge({
  average,
  count,
  accent,
  borderColor,
  starBg,
  radius,
  showBranding,
}: {
  average: number;
  count: number;
  accent: string;
  borderColor: string;
  starBg: string;
  radius: string;
  showBranding: boolean;
}) {
  return (
    <div
      className="inline-flex items-center gap-3 border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,.05),0_6px_18px_-10px_rgba(0,0,0,.18)]"
      style={{ borderRadius: radius, borderColor }}
    >
      {showBranding && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo-mark.png" width={22} height={22} alt="" className="shrink-0 rounded-md" />
      )}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Stars value={average} size={16} accent={accent} bg={starBg} />
          <strong style={{ color: accent }}>{average.toFixed(1)}</strong>
          <AiTag />
        </div>
        <span className="text-[11.5px] opacity-60">
          {count} reseñas verificadas{showBranding ? " · Kelsira" : ""}
        </span>
      </div>
    </div>
  );
}

function SealBadge({
  average,
  count,
  accent,
  starBg,
  showBranding,
}: {
  average: number;
  count: number;
  accent: string;
  starBg: string;
  showBranding: boolean;
}) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div
        className="flex flex-col items-center justify-center rounded-full border shadow-[0_1px_2px_rgba(0,0,0,.05),0_10px_24px_-14px_rgba(0,0,0,.2)]"
        style={{ width: 140, height: 140, borderColor: accent, borderWidth: 1.5 }}
      >
        <span className="text-[28px] font-bold leading-none">{average.toFixed(1)}</span>
        <div className="mt-1.5">
          <Stars value={average} size={12} accent={accent} bg={starBg} />
        </div>
        <span className="mt-1.5 text-[9px] uppercase tracking-wide opacity-50">{count} reseñas · IA</span>
      </div>
      {showBranding && (
        <div className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" width={16} height={16} alt="" className="rounded" />
          <span className="text-[11.5px] opacity-70">Verificado por Kelsira</span>
        </div>
      )}
    </div>
  );
}

function MosaicList({
  reviews,
  accent,
  borderColor,
  radius,
}: {
  reviews: Review[];
  accent: string;
  borderColor: string;
  radius: string;
}) {
  return (
    <div
      className="overflow-hidden border shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.16)]"
      style={{ borderColor, borderRadius: radius }}
    >
      <div className="px-3.5 pt-2.5 text-[9.5px] uppercase tracking-wide opacity-45">Puntajes objetivo IA</div>
      <div className="flex flex-col">
        {reviews.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center gap-2.5 px-3.5 py-2.5"
            style={i > 0 ? { borderTop: `1px solid ${borderColor}` } : undefined}
          >
            <Avatar name={r.customer_name} />
            <div className="flex w-20 shrink-0 flex-col leading-tight">
              <span className="truncate text-[11.5px] font-semibold">{r.customer_name}</span>
              <span className="text-[9.5px] opacity-55">{formatDate(r.created_at)}</span>
            </div>
            <span className="w-7 shrink-0 text-[12.5px] font-bold" style={{ color: accent }}>
              {r.overall_ai_rating.toFixed(1)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11.5px] opacity-70">{r.review_text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spotlight({
  reviews,
  showBreakdown,
  accent,
  isDark,
  businessName,
}: {
  reviews: Review[];
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  businessName: string;
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
  const confirmed = isConfirmed(review);

  return (
    <div className="text-center">
      <p className="text-lg font-medium leading-snug opacity-95">&ldquo;{review.review_text}&rdquo;</p>
      <div className="mt-4 flex items-center justify-center gap-2.5">
        <Avatar name={review.customer_name} />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[12.5px] font-medium">{review.customer_name}</span>
          <Stars value={review.overall_ai_rating} size={12} accent={accent} bg={starBg} />
        </div>
        <span className="ml-1.5 inline-flex items-center gap-1.5 text-[13px]">
          {confirmed ? (
            <span className="font-bold" style={{ color: accent }}>
              {review.overall_ai_rating.toFixed(1)}
            </span>
          ) : (
            <>
              <span className="opacity-50 line-through">{review.customer_star_rating!.toFixed(1)}★</span>
              <span className="opacity-40">→</span>
              <span className="font-bold" style={{ color: accent }}>
                {review.overall_ai_rating.toFixed(1)}
              </span>
            </>
          )}
          <AiTag />
        </span>
      </div>
      {showBreakdown && (
        <div className="flex justify-center">
          <Breakdown review={review} pillBg={pillBg} />
        </div>
      )}
      {review.business_reply && (
        <div className="flex justify-center">
          <div className="mt-1 max-w-sm">
            <Reply review={review} businessName={businessName} pillBg={pillBg} />
          </div>
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
  businessName,
  initialConfig,
  reviews,
  canCustomize,
}: {
  businessId: string;
  businessName: string;
  initialConfig: WidgetConfig;
  reviews: Review[];
  canCustomize: boolean;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [origin] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : "https://cdn.tusaas.com",
  );

  const snippet = `<script src="${origin}/widget.js" data-business-id="${businessId}"></script>`;

  async function save() {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/widget-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, business_id: businessId }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const usingSampleReviews = reviews.length === 0;
  const previewReviews = usingSampleReviews ? SAMPLE_REVIEWS : reviews;

  const average = recencyWeightedAverage(previewReviews, (r) => r.overall_ai_rating);

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

        {radiusApplies(config.layout, config.card_style) && (
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
        )}

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

        {CARD_STYLE_LAYOUTS.includes(config.layout) && (
          <div>
            <p className="text-sm font-medium">Estilo de tarjeta</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {cardStyleOptions.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setConfig((p) => ({ ...p, card_style: id }))}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs transition-colors",
                    config.card_style === id
                      ? "border-cobalt/40 bg-cobalt/10 text-cobalt"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

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
          ) : saveStatus === "error" ? (
            <>
              <AlertTriangle size={16} /> No se pudo guardar, intenta de nuevo
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
              <ClassicBadge
                average={average}
                count={previewReviews.length}
                accent={config.accent_color}
                borderColor={borderColor}
                starBg={starBg}
                radius={radius}
                showBranding={config.show_branding}
              />
            ) : config.layout === "sello" ? (
              <SealBadge
                average={average}
                count={previewReviews.length}
                accent={config.accent_color}
                starBg={starBg}
                showBranding={config.show_branding}
              />
            ) : config.layout === "mosaico" ? (
              <MosaicList reviews={previewReviews.slice(0, 6)} accent={config.accent_color} borderColor={borderColor} radius={radius} />
            ) : config.layout === "spotlight" ? (
              <Spotlight
                reviews={previewReviews}
                showBreakdown={config.show_breakdown}
                accent={config.accent_color}
                isDark={isDark}
                businessName={businessName}
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
                {(config.layout === "wall" ? previewReviews : previewReviews.slice(0, 4)).map((r) =>
                  config.card_style === "medidor" ? (
                    <div key={r.id} className={config.layout === "carousel" ? "min-w-[240px] flex-1" : undefined}>
                      <GaugeCard
                        review={r}
                        showBreakdown={config.show_breakdown}
                        accent={config.accent_color}
                        isDark={isDark}
                        radius={radius}
                        businessName={businessName}
                      />
                    </div>
                  ) : (
                    <div key={r.id} className={config.layout === "carousel" ? "min-w-[240px] flex-1" : undefined}>
                      <TicketCard
                        review={r}
                        showBreakdown={config.show_breakdown}
                        accent={config.accent_color}
                        isDark={isDark}
                        businessName={businessName}
                      />
                    </div>
                  ),
                )}
              </div>
            )}
            {config.show_branding && config.layout !== "badge" && config.layout !== "sello" && (
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
