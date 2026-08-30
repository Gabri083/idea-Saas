import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { getBusiness, getReviews, getWidgetConfig } from "@/lib/data";
import { resolveBusinessId } from "@/lib/demo";
import { getCategoryLabels, type Review } from "@/lib/types";
import { formatDate, isConfirmed, recencyWeightedAverage, RATING_TIER_COLORS } from "@/lib/utils";
import { publicPageThemeStyle } from "@/lib/public-page-theme";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo-mark";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getDictionary, getLocale } from "@/lib/i18n/get-locale";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const PAGE_SIZE = 10;

type Attribute = "producto" | "atencion" | "envio";

const ATTRIBUTE_SCORE: Record<Attribute, (r: Review) => number | null> = {
  producto: (r) => r.product_score,
  atencion: (r) => r.service_score,
  envio: (r) => r.delivery_score,
};

// A shopper picking an attribute wants to know if this business has fallen
// short there specifically — so this filters to actual complaints (score ≤ 3)
// and sorts worst-first, instead of just re-sorting the full list.
const ATTRIBUTE_COMPLAINT_THRESHOLD = 3;

// null means the review said nothing about that dimension — never counts as
// either a complaint or a compliment for it.
function isAttributeComplaint(value: number | null): value is number {
  return value != null && value <= ATTRIBUTE_COMPLAINT_THRESHOLD;
}

function isAttribute(value: string | undefined): value is Attribute {
  return value === "producto" || value === "atencion" || value === "envio";
}

/** How many reviews landed at each whole-star count (1-5), for the
 * color-coded distribution bars — same rating each review already shows
 * (customer's own pick, or the AI's read for reviews with no customer pick). */
function computeRatingDistribution(reviews: Review[]): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const rounded = Math.round(r.customer_star_rating ?? r.overall_ai_rating);
    const bucket = Math.min(5, Math.max(1, rounded));
    counts[bucket - 1] += 1;
  }
  return counts;
}

async function loadData(businessIdParam: string) {
  const businessId = resolveBusinessId(businessIdParam);
  const [business, reviews, config] = await Promise.all([
    getBusiness(businessId),
    getReviews(businessId),
    getWidgetConfig(businessId),
  ]);
  const publicReviews = reviews.filter((r) => r.status === "published" || r.status === "resolved");
  return { business, publicReviews, config };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessId: string }>;
}): Promise<Metadata> {
  const { businessId } = await params;
  const [{ business, publicReviews }, dict] = await Promise.all([loadData(businessId), getDictionary()]);
  const t = dict.publicReviews;
  const average = recencyWeightedAverage(publicReviews, (r) => r.overall_ai_rating);
  const title = t.metaTitleTemplate.replace("{name}", business.name).replace("{rating}", average.toFixed(1));
  const description = t.metaDescriptionTemplate
    .replace("{count}", String(publicReviews.length))
    .replace("{name}", business.name);
  return { title, description };
}

export default async function PublicReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const { businessId } = await params;
  const { page: pageParam, filter: filterParam } = await searchParams;
  const [{ business, publicReviews, config }, dict, locale] = await Promise.all([
    loadData(businessId),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.publicReviews;
  const attributeLabels: Record<Attribute, string> = {
    producto: t.attributeProduct,
    atencion: t.attributeService,
    envio: t.attributeDelivery,
  };

  const average = recencyWeightedAverage(publicReviews, (r) => r.overall_ai_rating);
  const ratingDistribution = computeRatingDistribution(publicReviews);

  const activeAttribute = isAttribute(filterParam) ? filterParam : null;
  const showCorrectedOnly = filterParam === "corregidas";
  const currentFilter: Attribute | "corregidas" | null = activeAttribute ?? (showCorrectedOnly ? "corregidas" : null);
  const attributeCounts: Record<Attribute, number> = {
    producto: publicReviews.filter((r) => isAttributeComplaint(r.product_score)).length,
    atencion: publicReviews.filter((r) => isAttributeComplaint(r.service_score)).length,
    envio: publicReviews.filter((r) => isAttributeComplaint(r.delivery_score)).length,
  };
  // Lets a skeptical shopper verify the AI-calculated score for themselves,
  // instead of just being told to trust it: every review where the AI's read
  // didn't match the customer's own pick, in one place.
  const correctedCount = publicReviews.filter((r) => !isConfirmed(r)).length;
  const visibleReviews = activeAttribute
    ? publicReviews
        .filter((r) => isAttributeComplaint(ATTRIBUTE_SCORE[activeAttribute](r)))
        .sort((a, b) => ATTRIBUTE_SCORE[activeAttribute](a)! - ATTRIBUTE_SCORE[activeAttribute](b)!)
    : showCorrectedOnly
      ? publicReviews.filter((r) => !isConfirmed(r))
      : publicReviews;

  const totalPages = Math.max(1, Math.ceil(visibleReviews.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageReviews = visibleReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <main
      className="flex flex-1 flex-col items-center bg-background bg-grid px-4 py-12 text-foreground sm:py-20"
      style={publicPageThemeStyle(config)}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <LogoMark size={28} />
            Kelsira
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {business.logo_url && (
                <Image
                  src={business.logo_url}
                  alt=""
                  width={40}
                  height={40}
                  className="mt-0.5 shrink-0 rounded-lg object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{business.name}</h1>
                {business.category && (
                  <p className="mt-1 text-sm text-muted">{getCategoryLabels(locale)[business.category]}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-cobalt/30 bg-cobalt/[0.06] px-3 py-1.5 text-xs text-cobalt">
              <ShieldCheck size={13} /> {t.verifiedBadge}
            </div>
          </div>

          {publicReviews.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold tracking-tight">{average.toFixed(1)}</span>
                <div>
                  <StarRating value={average} size={16} mode="aggregate" />
                  <Link href="/legal/transparencia-ia" className="mt-0.5 block text-xs text-muted hover:text-cobalt hover:underline">
                    {publicReviews.length === 1
                      ? t.reviewCountSingular
                      : t.reviewCountPlural.replace("{n}", String(publicReviews.length))}
                  </Link>
                </div>
              </div>
              <RatingDistribution counts={ratingDistribution} total={publicReviews.length} dict={t} />
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">{t.noReviewsYet}</p>
          )}
        </div>

        {publicReviews.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-muted">{t.filterHeading}</p>
            <div className="flex flex-wrap gap-2">
              <AttributeChip active={!activeAttribute && !showCorrectedOnly} href="?">
                {t.allChip.replace("{n}", String(publicReviews.length))}
              </AttributeChip>
              {(Object.keys(attributeLabels) as Attribute[]).map((attr) => (
                <AttributeChip key={attr} active={activeAttribute === attr} href={`?filter=${attr}`}>
                  {t.attributeChip
                    .replace("{label}", attributeLabels[attr])
                    .replace("{n}", String(attributeCounts[attr]))}
                </AttributeChip>
              ))}
              <AttributeChip active={showCorrectedOnly} href="?filter=corregidas">
                {t.correctedChip.replace("{n}", String(correctedCount))}
              </AttributeChip>
            </div>
            {activeAttribute && (
              <p className="mt-2 text-xs text-muted">
                {t.activeFilterExplanation.replace("{attribute}", attributeLabels[activeAttribute].toLowerCase())}
              </p>
            )}
            {showCorrectedOnly && <p className="mt-2 text-xs text-muted">{t.correctedFilterExplanation}</p>}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4">
          {(activeAttribute || showCorrectedOnly) && visibleReviews.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted">
              {activeAttribute
                ? t.emptyFilterState.replace("{attribute}", attributeLabels[activeAttribute].toLowerCase())
                : t.emptyCorrectedFilterState}{" "}
              <Link href="?" className="text-cobalt hover:underline">
                {t.emptyFilterCta}
              </Link>
              .
            </Card>
          ) : (
            pageReviews.map((review) => (
              <ReviewEntry key={review.id} review={review} businessName={business.name} locale={locale} dict={t} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm">
            <PageLink page={page - 1} disabled={page <= 1} filter={currentFilter}>
              <ChevronLeft size={15} /> {t.paginationPrev}
            </PageLink>
            <span className="text-xs text-muted">
              {t.paginationPage.replace("{page}", String(page)).replace("{total}", String(totalPages))}
            </span>
            <PageLink page={page + 1} disabled={page >= totalPages} filter={currentFilter}>
              {t.paginationNext} <ChevronRight size={15} />
            </PageLink>
          </div>
        )}
      </div>
    </main>
  );
}

function RatingDistribution({
  counts,
  total,
  dict,
}: {
  counts: number[];
  total: number;
  dict: Dictionary["publicReviews"];
}) {
  const labels = [
    dict.ratingTier5,
    dict.ratingTier4,
    dict.ratingTier3,
    dict.ratingTier2,
    dict.ratingTier1,
  ];
  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
      {([5, 4, 3, 2, 1] as const).map((stars, i) => {
        const count = counts[stars - 1];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={stars} className="grid grid-cols-[minmax(0,72px)_1fr_30px] items-center gap-2.5">
            <span className="truncate text-[11.5px] text-muted">{labels[i]}</span>
            <div className="h-[6px] overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${pct}%`, background: RATING_TIER_COLORS[stars] }}
              />
            </div>
            <span className="text-right text-[11px] text-muted">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function AttributeChip({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-cobalt/15 px-3 py-1.5 text-xs font-medium text-cobalt"
          : "rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}

function PageLink({
  page,
  disabled,
  filter,
  children,
}: {
  page: number;
  disabled: boolean;
  filter: Attribute | "corregidas" | null;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="flex items-center gap-1 text-muted/40">{children}</span>;
  }
  const query = filter ? `?page=${page}&filter=${filter}` : `?page=${page}`;
  return (
    <Link href={query} className="flex items-center gap-1 text-foreground/80 hover:text-cobalt">
      {children}
    </Link>
  );
}

function ReviewEntry({
  review,
  businessName,
  locale,
  dict,
}: {
  review: Review;
  businessName: string;
  locale: "es" | "en";
  dict: Dictionary["publicReviews"];
}) {
  const confirmed = isConfirmed(review);
  // Same rule as the embeddable widget: the number shown by default is
  // always the customer's own pick, like any other review platform — never
  // a different number swapped in. When the AI reads the text differently,
  // a small "!" appears next to it; its own take is one tap/hover away
  // (native <details>), never pushed in front of anyone.
  const big = review.customer_star_rating ?? review.overall_ai_rating;
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StarRating value={big} size={20} mode="review" />
        <span className="text-sm font-medium text-muted">{big.toFixed(1)}</span>
        {!confirmed && (
          <details className="group relative inline-block align-middle">
            <summary
              className="flex h-[18px] w-[18px] list-none items-center justify-center rounded-full border border-current text-[11px] font-extrabold text-muted opacity-60 [&::-webkit-details-marker]:hidden [&::marker]:hidden group-hover:opacity-90 group-open:opacity-90"
              title={dict.fairIconTitle}
            >
              !
            </summary>
            <div className="absolute left-0 top-[calc(100%+6px)] z-10 hidden w-[210px] rounded-lg border border-border bg-surface px-2.5 py-2 text-[11.5px] font-normal leading-snug text-foreground/90 shadow-lg group-hover:block group-open:block">
              {dict.fairNoteText.replace("{score}", review.overall_ai_rating.toFixed(1))}
            </div>
          </details>
        )}
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
        <span className="text-xs text-muted">{formatDate(review.created_at, locale)}</span>
      </div>
      {review.business_reply && (
        <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5">
          <p className="text-[11px] font-bold text-muted">{dict.replyFrom.replace("{name}", businessName)}</p>
          <p className="mt-0.5 text-[12.5px] text-foreground/85">{review.business_reply}</p>
        </div>
      )}
    </Card>
  );
}
