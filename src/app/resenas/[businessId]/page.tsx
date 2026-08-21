import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { getBusiness, getReviews } from "@/lib/data";
import { resolveBusinessId } from "@/lib/demo";
import { BUSINESS_CATEGORY_LABELS, type Review } from "@/lib/types";
import { formatDate, isConfirmed, recencyWeightedAverage } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo-mark";

const PAGE_SIZE = 10;

async function loadData(businessIdParam: string) {
  const businessId = resolveBusinessId(businessIdParam);
  const [business, reviews] = await Promise.all([getBusiness(businessId), getReviews(businessId)]);
  const publicReviews = reviews.filter((r) => r.status === "published" || r.status === "resolved");
  return { business, publicReviews };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessId: string }>;
}): Promise<Metadata> {
  const { businessId } = await params;
  const { business, publicReviews } = await loadData(businessId);
  const average = recencyWeightedAverage(publicReviews, (r) => r.overall_ai_rating);
  const title = `Reseñas de ${business.name} — ${average.toFixed(1)}★ en Kelsira`;
  const description = `${publicReviews.length} reseñas verificadas de ${business.name}, con puntaje calculado por IA a partir de los hechos descritos por cada cliente.`;
  return { title, description };
}

export default async function PublicReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { businessId } = await params;
  const { page: pageParam } = await searchParams;
  const { business, publicReviews } = await loadData(businessId);

  const average = recencyWeightedAverage(publicReviews, (r) => r.overall_ai_rating);
  const totalPages = Math.max(1, Math.ceil(publicReviews.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageReviews = publicReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    ...(publicReviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: publicReviews.length,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    review: pageReviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.customer_name },
      datePublished: r.created_at,
      reviewBody: r.review_text,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.overall_ai_rating.toFixed(1),
        bestRating: "5",
        worstRating: "1",
      },
    })),
  };

  return (
    <main className="flex flex-1 flex-col items-center bg-grid px-4 py-12 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center justify-center gap-2 text-sm font-semibold">
          <LogoMark size={28} />
          Kelsira
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{business.name}</h1>
              {business.category && (
                <p className="mt-1 text-sm text-muted">{BUSINESS_CATEGORY_LABELS[business.category]}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-cobalt/30 bg-cobalt/[0.06] px-3 py-1.5 text-xs text-cobalt">
              <ShieldCheck size={13} /> Verificado por Kelsira
            </div>
          </div>

          {publicReviews.length > 0 ? (
            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-semibold tracking-tight">{average.toFixed(1)}</span>
              <div>
                <StarRating value={average} size={16} />
                <p className="mt-0.5 text-xs text-muted">
                  {publicReviews.length} reseña{publicReviews.length === 1 ? "" : "s"} verificada
                  {publicReviews.length === 1 ? "" : "s"} · Puntaje Objetivo IA
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">Este negocio aún no tiene reseñas verificadas.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {pageReviews.map((review) => (
            <ReviewEntry key={review.id} review={review} businessName={business.name} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm">
            <PageLink page={page - 1} disabled={page <= 1}>
              <ChevronLeft size={15} /> Anteriores
            </PageLink>
            <span className="text-xs text-muted">
              Página {page} de {totalPages}
            </span>
            <PageLink page={page + 1} disabled={page >= totalPages}>
              Siguientes <ChevronRight size={15} />
            </PageLink>
          </div>
        )}
      </div>
    </main>
  );
}

function PageLink({ page, disabled, children }: { page: number; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return <span className="flex items-center gap-1 text-muted/40">{children}</span>;
  }
  return (
    <Link href={`?page=${page}`} className="flex items-center gap-1 text-foreground/80 hover:text-cobalt">
      {children}
    </Link>
  );
}

function ReviewEntry({ review, businessName }: { review: Review; businessName: string }) {
  const confirmed = isConfirmed(review);
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        {confirmed ? (
          <span className="text-lg font-bold text-cobalt">{review.overall_ai_rating.toFixed(1)}</span>
        ) : (
          <>
            <span className="text-[13px] text-muted line-through">{review.customer_star_rating!.toFixed(1)}★</span>
            <span className="text-xs text-muted">→</span>
            <span className="text-lg font-bold text-cobalt">{review.overall_ai_rating.toFixed(1)}</span>
          </>
        )}
        <span className="rounded border border-current px-1 py-px text-[9px] font-bold uppercase leading-tight tracking-wide text-muted opacity-80">
          IA
        </span>
      </div>
      <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-muted opacity-70">
        {confirmed ? "Confirmado por IA" : "Corrección por hechos, no por enojo"}
      </p>
      <div className="mt-2">
        <StarRating value={review.overall_ai_rating} size={14} />
      </div>
      <p className="mt-3 text-sm text-foreground/90">{review.review_text}</p>
      {review.detected_issues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.detected_issues.map((issue) => (
            <Badge key={issue} tone="amber">
              {issue}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium">{review.customer_name}</span>
        <span className="text-xs text-muted">{formatDate(review.created_at)}</span>
      </div>
      {review.business_reply && (
        <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5">
          <p className="text-[11px] font-bold text-muted">Respuesta de {businessName}</p>
          <p className="mt-0.5 text-[12.5px] text-foreground/85">{review.business_reply}</p>
        </div>
      )}
    </Card>
  );
}
