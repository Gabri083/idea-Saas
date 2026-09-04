"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Copy, Loader2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformInstructions } from "@/components/dashboard/platform-instructions";
import { cn, isConfirmed, recencyWeightedAverage } from "@/lib/utils";
import type { Review, WidgetConfig } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CategoryBenchmark } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

type WidgetDict = Dictionary["dashboard"]["widget"];

/** Only used to fill the live preview when the business has no real reviews yet. */
const SAMPLE_REVIEWS: Review[] = [
  {
    id: "sample-1",
    business_id: "sample",
    customer_name: "Camila R.",
    customer_email: "",
    review_text:
      "Compré hace poco y quedé muy conforme con la calidad, la atención fue excelente. Lo único es que el envío se demoró un poco más de lo esperado.",
    customer_product_rating: 5,
    customer_service_rating: 5,
    customer_delivery_rating: 2,
    customer_star_rating: 4.1,
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
    customer_product_rating: 5,
    customer_service_rating: 4,
    customer_delivery_rating: 5,
    customer_star_rating: 4.7,
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
    customer_product_rating: 4,
    customer_service_rating: 2,
    customer_delivery_rating: 5,
    customer_star_rating: 3.7,
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
const layoutIds: WidgetConfig["layout"][] = [
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
const cardStyleIds: WidgetConfig["card_style"][] = ["recibo", "medidor"];
// grid/wall/carousel repeat one card per review — the other four layouts are
// single aggregate displays, so the card-style choice doesn't apply to them.
const CARD_STYLE_LAYOUTS: WidgetConfig["layout"][] = ["carousel", "grid", "wall"];

// "Bordes" doesn't mean anything for El Sello (always a circle), El Recibo
// (its cut corner is a fixed part of the style), La Barra Superior / La
// Franja de Pie de Página (full-bleed, no visible corners), La Fila de
// Producto (no box at all) or El Comparador (always a pill) — show the
// control only where it actually changes something.
function radiusApplies(layout: WidgetConfig["layout"], cardStyle: WidgetConfig["card_style"]) {
  if (layout === "sello" || layout === "barra" || layout === "fila" || layout === "franja" || layout === "comparador") {
    return false;
  }
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

function AiTag({ dict }: { dict: WidgetDict }) {
  return (
    <span
      className="rounded border border-current px-1 py-px text-[9px] font-bold leading-tight tracking-wide opacity-45"
      title={dict.aiTagTitle}
    >
      {dict.aiLabel}
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

function Breakdown({ review, pillBg, dict }: { review: Review; pillBg: string; dict: WidgetDict }) {
  const pills = [
    { value: review.product_score, label: dict.breakdownProduct },
    { value: review.service_score, label: dict.breakdownService },
    { value: review.delivery_score, label: dict.breakdownDelivery },
  ].filter((p): p is { value: number; label: string } => p.value != null);

  if (pills.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {pills.map((p) => (
        <span key={p.label} className="rounded-full px-2.5 py-0.5 text-[10.5px] opacity-85" style={{ background: pillBg }}>
          {p.label} {p.value}★
        </span>
      ))}
    </div>
  );
}

function Reply({
  review,
  businessName,
  pillBg,
  dict,
}: {
  review: Review;
  businessName: string;
  pillBg: string;
  dict: WidgetDict;
}) {
  if (!review.business_reply) return null;
  return (
    <div className="mt-3 rounded-lg px-3 py-2.5" style={{ background: pillBg }}>
      <p className="text-[11px] font-bold opacity-70">{dict.replyFrom.replace("{name}", businessName)}</p>
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
  dict,
}: {
  review: Review;
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  businessName: string;
  dict: WidgetDict;
}) {
  const borderColor = isDark ? "#232529" : "#e5e7eb";
  const starBg = isDark ? "#3a3d44" : "#e2e4e8";
  const pillBg = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  const confirmed = isConfirmed(review);
  // Same rule as the embeddable widget and the public reviews page: the
  // number shown by default is always the customer's own pick — Kelsira
  // never swaps in a different one. When the AI reads the text differently,
  // a small "!" appears next to it; its own take is one tap/hover away.
  const big = review.customer_star_rating ?? review.overall_ai_rating;
  const cut = TICKET_CUT_PX;
  const clipPath = `polygon(0 ${cut}px, ${cut}px 0, calc(100% - ${cut}px) 0, 100% ${cut}px, 100% 100%, 0 100%)`;
  return (
    <div
      className="min-w-0 overflow-hidden border text-sm shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.16)] transition-transform hover:-translate-y-0.5"
      style={{ borderColor, clipPath }}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Stars value={big} size={20} accent={accent} bg={starBg} />
          <span className="text-sm font-medium opacity-60">{big.toFixed(1)}</span>
          {!confirmed && (
            <details className="group relative inline-block align-middle">
              <summary
                className="flex h-[18px] w-[18px] list-none items-center justify-center rounded-full border border-current text-[11px] font-extrabold opacity-55 [&::-webkit-details-marker]:hidden [&::marker]:hidden group-hover:opacity-90 group-open:opacity-90"
                title={dict.fairIconTitle}
              >
                !
              </summary>
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-10 hidden w-[210px] rounded-lg border px-2.5 py-2 text-[11.5px] font-normal leading-snug shadow-lg group-hover:block group-open:block"
                style={{ background: isDark ? "#101114" : "#ffffff", borderColor }}
              >
                {dict.fairNoteText.replace("{score}", review.overall_ai_rating.toFixed(1))}
              </div>
            </details>
          )}
        </div>
      </div>
      <div style={{ margin: "0 16px", borderTop: `1.5px dashed ${borderColor}` }} />
      <div className="px-4 pt-3.5 pb-4">
        <p className="line-clamp-3 opacity-90">&ldquo;{review.review_text}&rdquo;</p>
        {showBreakdown && <Breakdown review={review} pillBg={pillBg} dict={dict} />}
        <div className="mt-3.5 flex items-center gap-2.5">
          <Avatar name={review.customer_name} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-medium">{review.customer_name}</span>
            <span className="text-[11px] opacity-55">{formatDate(review.created_at)}</span>
          </div>
        </div>
        <Reply review={review} businessName={businessName} pillBg={pillBg} dict={dict} />
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
  dict,
}: {
  review: Review;
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  radius: string;
  businessName: string;
  dict: WidgetDict;
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
        <AiTag dict={dict} />
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
            {dict.clientAndAi} <b style={{ color: accent }}>{review.overall_ai_rating.toFixed(1)}</b>
          </span>
        ) : (
          <>
            <span>
              {dict.clientLabel} <b>{review.customer_star_rating!.toFixed(1)}</b>
            </span>
            <span style={{ color: accent }}>
              {dict.aiLabel} <b style={{ color: accent }}>{review.overall_ai_rating.toFixed(1)}</b>
            </span>
          </>
        )}
      </div>
      {showBreakdown && <Breakdown review={review} pillBg={pillBg} dict={dict} />}
      <div className="mt-3.5 flex items-center gap-2.5">
        <Avatar name={review.customer_name} />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[12.5px] font-medium">{review.customer_name}</span>
          <span className="text-[11px] opacity-55">{formatDate(review.created_at)}</span>
        </div>
      </div>
      <Reply review={review} businessName={businessName} pillBg={pillBg} dict={dict} />
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
  dict,
}: {
  average: number;
  count: number;
  accent: string;
  borderColor: string;
  starBg: string;
  radius: string;
  showBranding: boolean;
  dict: WidgetDict;
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
          <AiTag dict={dict} />
        </div>
        <span className="text-[11.5px] opacity-60">
          {dict.reviewsVerifiedCount.replace("{n}", String(count))}
          {showBranding ? " · Kelsira" : ""}
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
  dict,
}: {
  average: number;
  count: number;
  accent: string;
  starBg: string;
  showBranding: boolean;
  dict: WidgetDict;
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
        <span className="mt-1.5 text-[9px] uppercase tracking-wide opacity-50">
          {dict.reviewsCountAi.replace("{n}", String(count))}
        </span>
      </div>
      {showBranding && (
        <div className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" width={16} height={16} alt="" className="rounded" />
          <span className="text-[11.5px] opacity-70">{dict.verifiedByKelsira}</span>
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
  dict,
}: {
  reviews: Review[];
  accent: string;
  borderColor: string;
  radius: string;
  dict: WidgetDict;
}) {
  return (
    <div
      className="overflow-hidden border shadow-[0_1px_2px_rgba(0,0,0,.04),0_10px_24px_-14px_rgba(0,0,0,.16)]"
      style={{ borderColor, borderRadius: radius }}
    >
      <div className="px-3.5 pt-2.5 text-[9.5px] uppercase tracking-wide opacity-45">{dict.mosaicHeader}</div>
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

// La Cinta is deliberately a fixed dark ribbon regardless of theme_mode — like
// El Recibo's cut corner and El Sello's circle, its identity doesn't flex with
// light/dark, it's meant to read as a bold ticker on any storefront background.
function Ticker({
  reviews,
  average,
  count,
  accent,
  radius,
  dict,
}: {
  reviews: Review[];
  average: number;
  count: number;
  accent: string;
  radius: string;
  dict: WidgetDict;
}) {
  const items = reviews.map((r) => (
    <span key={r.id} className="inline-flex shrink-0 items-center gap-1">
      <b className="font-semibold text-white">{r.customer_name}</b>
      <b style={{ color: accent }}>{r.overall_ai_rating.toFixed(1)}</b>
      <span>· {r.review_text.length > 70 ? `${r.review_text.slice(0, 70).trim()}…` : r.review_text}</span>
      <span className="opacity-30">●</span>
    </span>
  ));

  return (
    <div
      className="flex items-center overflow-hidden text-white shadow-[0_12px_32px_-16px_rgba(0,0,0,.5)]"
      style={{ background: "#14161c", borderRadius: radius }}
    >
      <div
        className="flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3"
        style={{ background: "rgba(255,255,255,.06)", borderRight: "1px solid rgba(255,255,255,.08)" }}
      >
        <b style={{ color: accent }}>{average.toFixed(1)}★</b>
        <span className="text-[11px] opacity-55">{dict.tickerCount.replace("{n}", String(count))}</span>
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div
          className="kelsira-ticker-track flex items-center gap-10 whitespace-nowrap px-5 text-[12.5px]"
          style={{ animation: "kelsira-ticker-scroll 26s linear infinite" }}
        >
          {items}
          {items}
        </div>
      </div>
    </div>
  );
}

// La Fila de Producto — no box, no border: just the inline star-row a shopper
// already expects right under a product title, before the price.
function ProductRow({
  average,
  count,
  accent,
  starBg,
  dict,
}: {
  average: number;
  count: number;
  accent: string;
  starBg: string;
  dict: WidgetDict;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <Stars value={average} size={16} accent={accent} bg={starBg} />
      <b style={{ color: accent }}>{average.toFixed(1)}</b>
      <AiTag dict={dict} />
      <span className="underline decoration-current/40 underline-offset-2 opacity-70">
        {dict.rowCount.replace("{n}", String(count))}
      </span>
    </div>
  );
}

// La Barra Superior — full-bleed bar meant to sit pinned above the page, in
// the same slot as a free-shipping promo bar. Folds the Kelsira mark inline
// (like El Clásico) since a separate footer line would be orphaned once this
// bar is unpinned from where the widget script sits in the DOM.
function TopBar({
  average,
  count,
  accent,
  starBg,
  bg,
  fg,
  borderColor,
  showBranding,
  dict,
}: {
  average: number;
  count: number;
  accent: string;
  starBg: string;
  bg: string;
  fg: string;
  borderColor: string;
  showBranding: boolean;
  dict: WidgetDict;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 border-b px-4 py-2.5 text-[13px]"
      style={{ background: bg, color: fg, borderColor }}
    >
      <Stars value={average} size={13} accent={accent} bg={starBg} />
      <b>{average.toFixed(1)}</b>
      <span className="opacity-70">
        · {dict.reviewsVerifiedCount.replace("{n}", String(count))}
        {showBranding ? " · Kelsira" : ""}
      </span>
      <span className="underline decoration-current/40 underline-offset-2 opacity-80">{dict.barViewLink}</span>
    </div>
  );
}

// El Lanzador — floating corner bubble + popover panel, the same slot a
// support-chat launcher already occupies. Branding folds into the panel
// footer instead of the separate global line, for the same reason as La
// Barra Superior.
function Launcher({
  reviews,
  average,
  count,
  accent,
  businessName,
  isDark,
  radius,
  showBranding,
  dict,
}: {
  reviews: Review[];
  average: number;
  count: number;
  accent: string;
  businessName: string;
  isDark: boolean;
  radius: string;
  showBranding: boolean;
  dict: WidgetDict;
}) {
  const [open, setOpen] = useState(true);
  const bg = isDark ? "#101114" : "#ffffff";
  const fg = isDark ? "#f4f5f7" : "#111318";
  const borderColor = isDark ? "#232529" : "#e5e7eb";

  return (
    <div className="absolute right-5 bottom-5 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-64 overflow-hidden border shadow-[0_20px_50px_-18px_rgba(0,0,0,.4)]"
          style={{ background: bg, color: fg, borderColor, borderRadius: radius }}
        >
          <div className="flex items-center justify-between px-3.5 py-3 text-white" style={{ background: accent }}>
            <b className="text-sm">
              {average.toFixed(1)}★ {businessName}
            </b>
            <span className="text-xs opacity-75">{count}</span>
          </div>
          {reviews.slice(0, 3).map((r, i) => (
            <div
              key={r.id}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs"
              style={i > 0 ? { borderTop: `1px solid ${borderColor}` } : undefined}
            >
              <b className="shrink-0">{r.customer_name}</b>
              <span className="min-w-0 flex-1 truncate opacity-65">
                {r.overall_ai_rating.toFixed(1)} · {r.review_text}
              </span>
            </div>
          ))}
          <div
            className="px-3.5 py-2.5 text-center text-xs font-medium"
            style={{ color: accent, borderTop: `1px solid ${borderColor}` }}
          >
            {dict.launcherViewAll.replace("{n}", String(count))}
          </div>
          {showBranding && (
            <div
              className="px-3.5 py-2 text-center text-[10.5px] opacity-55"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              {dict.verifiedByKelsira}
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-[0_10px_26px_-8px_rgba(0,0,0,.4)]"
        style={{ background: accent }}
      >
        {average.toFixed(1)}★
      </button>
    </div>
  );
}

// La Notificación — a live social-proof toast, the same fixed corner slot as
// El Lanzador (but the opposite side, so the two never collide if a business
// somehow had both). Cycles through recent reviews on its own; branding folds
// into the toast itself for the same reason as La Barra Superior.
function Notification({
  reviews,
  isDark,
  radius,
  showBranding,
  dict,
}: {
  reviews: Review[];
  isDark: boolean;
  radius: string;
  showBranding: boolean;
  dict: WidgetDict;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reviews.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 4500);
    return () => clearInterval(id);
  }, [reviews.length]);

  const review = reviews[Math.min(index, reviews.length - 1)];
  const bg = isDark ? "#101114" : "#ffffff";
  const fg = isDark ? "#f4f5f7" : "#111318";
  const borderColor = isDark ? "#232529" : "#e5e7eb";

  return (
    <div className="absolute bottom-5 left-5 max-w-[270px]">
      <div
        className="flex items-center gap-2.5 border p-3 shadow-[0_10px_26px_-10px_rgba(0,0,0,.35)]"
        style={{ background: bg, color: fg, borderColor, borderRadius: radius }}
      >
        <Avatar name={review.customer_name} />
        <div className="min-w-0">
          <p className="text-xs leading-snug">
            {dict.notificationJustLeft
              .replace("{name}", review.customer_name)
              .replace("{score}", `${review.overall_ai_rating.toFixed(1)}★`)}
          </p>
          {showBranding && (
            <p className="mt-0.5 truncate text-[10.5px] opacity-55">
              {dict.verifiedByKelsira} · {formatDate(review.created_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const COMPARATOR_EMERALD = "#16a34a";
const COMPARATOR_ROSE = "#e11d48";

// El Comparador — turns the industry benchmark already computed on the
// dashboard into a public trust argument. Falls back to an illustrative
// example whenever real peer data isn't available yet (too few businesses
// or reviews in the category), so it never renders broken or empty.
function Comparator({
  average,
  benchmark,
  categoryLabel,
  accent,
  borderColor,
  dict,
}: {
  average: number;
  benchmark: CategoryBenchmark;
  categoryLabel: string;
  accent: string;
  borderColor: string;
  dict: WidgetDict;
}) {
  const illustrative = !benchmark.available;
  const delta = illustrative
    ? 15
    : Math.round(((average - benchmark.average) / benchmark.average) * 100);
  const isAbove = delta > 2;
  const isBelow = delta < -2;
  const tone = isAbove ? COMPARATOR_EMERALD : isBelow ? COMPARATOR_ROSE : undefined;
  const label = isAbove
    ? dict.comparatorAbove.replace("{delta}", String(Math.abs(delta))).replace("{category}", categoryLabel)
    : isBelow
      ? dict.comparatorBelow.replace("{delta}", String(Math.abs(delta))).replace("{category}", categoryLabel)
      : dict.comparatorOnPar.replace("{category}", categoryLabel);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border py-1.5 pl-4 pr-1.5 text-sm" style={{ borderColor }}>
      <b style={{ color: accent }}>{average.toFixed(1)}★</b>
      <span className="h-4 w-px" style={{ background: borderColor }} />
      <span
        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={tone ? { color: tone, background: `${tone}1f` } : undefined}
      >
        {isAbove ? "↑ " : isBelow ? "↓ " : ""}
        {label}
      </span>
    </div>
  );
}

// La Franja de Pie de Página — sits inline wherever the script tag is placed
// in the footer, instead of pinned like La Barra Superior. Deliberately
// quiet: a reputation line meant to blend in, not compete for attention.
function FooterStrip({
  reviews,
  count,
  accent,
  borderColor,
  bg,
  fg,
  showBranding,
  dict,
}: {
  reviews: Review[];
  count: number;
  accent: string;
  borderColor: string;
  bg: string;
  fg: string;
  showBranding: boolean;
  dict: WidgetDict;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 border-t px-1 py-3"
      style={{ borderColor, background: bg, color: fg }}
    >
      <div className="flex items-center gap-2.5">
        {showBranding && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold text-white"
            style={{ background: accent }}
          >
            K
          </span>
        )}
        <span className="text-xs opacity-75">
          {dict.reviewsVerifiedCount.replace("{n}", String(count))}
          {showBranding ? " · Kelsira" : ""}
        </span>
      </div>
      <div className="flex -space-x-2">
        {reviews.slice(0, 3).map((r) => (
          <Avatar key={r.id} name={r.customer_name} />
        ))}
      </div>
    </div>
  );
}

// El Cierre — a compact reassurance block meant to sit right above the buy
// button on a checkout page, the exact moment doubts show up that no other
// layout ever reaches.
function CheckoutTrust({
  count,
  accent,
  isDark,
  showBranding,
  dict,
}: {
  count: number;
  accent: string;
  isDark: boolean;
  showBranding: boolean;
  dict: WidgetDict;
}) {
  const pillBg = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3.5 py-3 text-xs" style={{ background: pillBg }}>
      <Check size={16} className="shrink-0" style={{ color: accent }} />
      <span className="opacity-85">
        {dict.checkoutTrustText.replace("{n}", String(count))}
        {showBranding ? " · Kelsira" : ""}
      </span>
    </div>
  );
}

function Spotlight({
  reviews,
  showBreakdown,
  accent,
  isDark,
  businessName,
  dict,
}: {
  reviews: Review[];
  showBreakdown: boolean;
  accent: string;
  isDark: boolean;
  businessName: string;
  dict: WidgetDict;
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
          <AiTag dict={dict} />
        </span>
      </div>
      {showBreakdown && (
        <div className="flex justify-center">
          <Breakdown review={review} pillBg={pillBg} dict={dict} />
        </div>
      )}
      {review.business_reply && (
        <div className="flex justify-center">
          <div className="mt-1 max-w-sm">
            <Reply review={review} businessName={businessName} pillBg={pillBg} dict={dict} />
          </div>
        </div>
      )}
      {reviews.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={dict.reviewAriaLabel.replace("{n}", String(i + 1))}
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
  benchmark,
  categoryLabel,
  dict,
}: {
  businessId: string;
  businessName: string;
  initialConfig: WidgetConfig;
  reviews: Review[];
  canCustomize: boolean;
  benchmark: CategoryBenchmark;
  categoryLabel: string;
  dict: WidgetDict;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="${SITE_URL}/widget.js" data-business-id="${businessId}"></script>`;

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
  // Cosmetic only — makes the preview read as "this is your actual site",
  // not a real domain lookup.
  const previewDomain =
    businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "") + ".com";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="flex flex-col gap-6 p-6">
        {!canCustomize && (
          <div className="flex items-center gap-2 rounded-lg border border-cobalt/30 bg-cobalt/10 px-3 py-2.5 text-xs text-cobalt">
            <Sparkles size={14} className="shrink-0" />
            {dict.gateBanner}
          </div>
        )}
        <fieldset disabled={!canCustomize} className={cn("contents border-0 p-0 m-0", !canCustomize && "opacity-50")}>
        <div>
          <p className="text-sm font-medium">{dict.accentColorLabel}</p>
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
          <p className="text-sm font-medium">{dict.modeLabel}</p>
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
                {mode === "light" ? dict.modeLight : dict.modeDark}
              </button>
            ))}
          </div>
        </div>

        {radiusApplies(config.layout, config.card_style) && (
          <div>
            <p className="text-sm font-medium">{dict.bordersLabel}</p>
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
          <p className="text-sm font-medium">{dict.fontLabel}</p>
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
          <p className="text-sm font-medium">{dict.layoutLabel}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {layoutIds.map((id) => (
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
                {dict.layoutOptions[id]}
              </button>
            ))}
          </div>
        </div>

        {CARD_STYLE_LAYOUTS.includes(config.layout) && (
          <div>
            <p className="text-sm font-medium">{dict.cardStyleLabel}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {cardStyleIds.map((id) => (
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
                  {dict.cardStyleOptions[id]}
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
          {dict.showBreakdownLabel}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!config.show_branding}
            onChange={(e) => setConfig((p) => ({ ...p, show_branding: !e.target.checked }))}
            className="h-4 w-4 rounded accent-cobalt"
          />
          {dict.hideBrandingLabel}
        </label>

        <div>
          <p className="text-sm font-medium">{dict.welcomeMessageLabel}</p>
          <textarea
            value={config.review_form_welcome ?? ""}
            onChange={(e) => setConfig((p) => ({ ...p, review_form_welcome: e.target.value }))}
            maxLength={200}
            rows={2}
            placeholder={dict.welcomeMessagePlaceholder}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />
          <p className="mt-1 text-xs text-muted">{dict.welcomeMessageHint}</p>
        </div>

        <div>
          <p className="text-sm font-medium">{dict.thanksMessageLabel}</p>
          <textarea
            value={config.review_form_thanks ?? ""}
            onChange={(e) => setConfig((p) => ({ ...p, review_form_thanks: e.target.value }))}
            maxLength={200}
            rows={2}
            placeholder={dict.thanksMessagePlaceholder}
            className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none ring-cobalt/40 placeholder:text-muted focus:ring-2"
          />
          <p className="mt-1 text-xs text-muted">{dict.thanksMessageHint}</p>
        </div>

        <Button onClick={save} disabled={saveStatus === "saving"} className="w-full">
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" /> {dict.saving}
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check size={16} /> {dict.saved}
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertTriangle size={16} /> {dict.saveError}
            </>
          ) : (
            dict.saveIdle
          )}
        </Button>
        </fieldset>
      </Card>

      <div className="flex min-w-0 flex-col gap-6">
        <Card className="min-w-0 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-muted">{dict.livePreviewLabel}</p>
            {usingSampleReviews && (
              <span className="rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 text-xs text-amber">
                {dict.sampleDataBadge}
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e2e4ea] shadow-[0_20px_45px_-30px_rgba(20,30,70,.4)]">
            <div className="flex items-center gap-1.5 border-b border-[#e5e7ec] bg-white px-3.5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-[#dcdee4]" />
              <span className="h-2 w-2 rounded-full bg-[#dcdee4]" />
              <span className="h-2 w-2 rounded-full bg-[#dcdee4]" />
              <span className="ml-2 truncate rounded-md bg-[#f2f3f6] px-2.5 py-1 font-mono text-[10.5px] text-[#6b6e78]">
                {previewDomain}
              </span>
            </div>
            <div
              className="p-6"
              style={{
                position: "relative",
                background: isDark ? "#101114" : "#ffffff",
                color: isDark ? "#f4f5f7" : "#111318",
                fontFamily: fontStack[config.font_family] ?? undefined,
                ...(config.layout === "lanzador" && { overflow: "hidden", minHeight: 400 }),
                ...(config.layout === "barra" && { overflow: "hidden", minHeight: 220 }),
                ...(config.layout === "notificacion" && { overflow: "hidden", minHeight: 180 }),
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
                dict={dict}
              />
            ) : config.layout === "sello" ? (
              <SealBadge
                average={average}
                count={previewReviews.length}
                accent={config.accent_color}
                starBg={starBg}
                showBranding={config.show_branding}
                dict={dict}
              />
            ) : config.layout === "mosaico" ? (
              <MosaicList
                reviews={previewReviews.slice(0, 6)}
                accent={config.accent_color}
                borderColor={borderColor}
                radius={radius}
                dict={dict}
              />
            ) : config.layout === "cinta" ? (
              <Ticker
                reviews={previewReviews.slice(0, 6)}
                average={average}
                count={previewReviews.length}
                accent={config.accent_color}
                radius={radius}
                dict={dict}
              />
            ) : config.layout === "spotlight" ? (
              <Spotlight
                reviews={previewReviews}
                showBreakdown={config.show_breakdown}
                accent={config.accent_color}
                isDark={isDark}
                businessName={businessName}
                dict={dict}
              />
            ) : config.layout === "fila" ? (
              <ProductRow
                average={average}
                count={previewReviews.length}
                accent={config.accent_color}
                starBg={starBg}
                dict={dict}
              />
            ) : config.layout === "barra" ? (
              <div className="absolute inset-x-0 top-0">
                <TopBar
                  average={average}
                  count={previewReviews.length}
                  accent={config.accent_color}
                  starBg={starBg}
                  bg={isDark ? "#101114" : "#ffffff"}
                  fg={isDark ? "#f4f5f7" : "#111318"}
                  borderColor={borderColor}
                  showBranding={config.show_branding}
                  dict={dict}
                />
              </div>
            ) : config.layout === "lanzador" ? (
              <Launcher
                reviews={previewReviews}
                average={average}
                count={previewReviews.length}
                accent={config.accent_color}
                businessName={businessName}
                isDark={isDark}
                radius={radius}
                showBranding={config.show_branding}
                dict={dict}
              />
            ) : config.layout === "notificacion" ? (
              <Notification
                reviews={previewReviews}
                isDark={isDark}
                radius={radius}
                showBranding={config.show_branding}
                dict={dict}
              />
            ) : config.layout === "comparador" ? (
              <Comparator
                average={average}
                benchmark={benchmark}
                categoryLabel={categoryLabel}
                accent={config.accent_color}
                borderColor={borderColor}
                dict={dict}
              />
            ) : config.layout === "franja" ? (
              <FooterStrip
                reviews={previewReviews}
                count={previewReviews.length}
                accent={config.accent_color}
                borderColor={borderColor}
                bg={isDark ? "#101114" : "#ffffff"}
                fg={isDark ? "#f4f5f7" : "#111318"}
                showBranding={config.show_branding}
                dict={dict}
              />
            ) : config.layout === "cierre" ? (
              <CheckoutTrust
                count={previewReviews.length}
                accent={config.accent_color}
                isDark={isDark}
                showBranding={config.show_branding}
                dict={dict}
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
                {/* The preview only needs enough cards to show the layout's
                    shape — not to replicate the widget's real 20-review cap,
                    which would just make the config page scroll forever. */}
                {(config.layout === "wall" ? previewReviews.slice(0, 5) : previewReviews.slice(0, 4)).map((r) =>
                  config.card_style === "medidor" ? (
                    <div key={r.id} className={config.layout === "carousel" ? "min-w-[240px] flex-1" : undefined}>
                      <GaugeCard
                        review={r}
                        showBreakdown={config.show_breakdown}
                        accent={config.accent_color}
                        isDark={isDark}
                        radius={radius}
                        businessName={businessName}
                        dict={dict}
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
                        dict={dict}
                      />
                    </div>
                  ),
                )}
              </div>
            )}
            {config.show_branding &&
              config.layout !== "badge" &&
              config.layout !== "sello" &&
              config.layout !== "barra" &&
              config.layout !== "lanzador" &&
              config.layout !== "notificacion" &&
              config.layout !== "comparador" &&
              config.layout !== "franja" &&
              config.layout !== "cierre" && (
                <p className="mt-4 text-right text-[10px] opacity-50">{dict.footerBranding}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="min-w-0 p-6">
          <p className="mb-3 text-sm font-medium text-muted">{dict.codeSectionTitle}</p>
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
              aria-label={dict.copyCodeAria}
            >
              {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">{dict.codeSectionHint}</p>
        </Card>

        <Card className="min-w-0 p-6">
          <p className="mb-3 text-sm font-medium text-muted">{dict.installStepsTitle}</p>
          <PlatformInstructions dict={dict.platform} />
        </Card>
      </div>
    </div>
  );
}
