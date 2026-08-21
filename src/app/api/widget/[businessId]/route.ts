import { NextRequest, NextResponse } from "next/server";
import { getBusiness, getReviews, getWidgetConfig } from "@/lib/data";
import { resolveBusinessId } from "@/lib/demo";
import { hasGrowthAccess } from "@/lib/types";
import { recencyWeightedAverage } from "@/lib/utils";

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

/** Public, CORS-enabled endpoint consumed by the embeddable widget.js on any storefront. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId: rawId } = await params;
    const businessId = resolveBusinessId(rawId);

    const [business, reviews, config] = await Promise.all([
      getBusiness(businessId),
      getReviews(businessId),
      getWidgetConfig(businessId),
    ]);

    // The full public history — never trimmed, never hidden — is what the
    // count and the headline average are computed from. Only the list of
    // cards actually rendered is capped, further down.
    const allPublicReviews = reviews.filter((r) => r.status === "published" || r.status === "resolved");
    const displayReviews = allPublicReviews.slice(0, 12);

    const average = recencyWeightedAverage(allPublicReviews, (r) => r.overall_ai_rating);

    // Free/Starter always carry the "Verificado por Kelsira" branding, no matter what's
    // stored — e.g. a business that saved show_branding:false while on Growth and later
    // downgraded shouldn't keep hiding it.
    const effectiveConfig = hasGrowthAccess(business.plan) ? config : { ...config, show_branding: true };

    return withCors(
      NextResponse.json({
        business: { name: business.name },
        config: effectiveConfig,
        average_rating: Math.round(average * 10) / 10,
        total_reviews: allPublicReviews.length,
        reviews: displayReviews.map((r) => ({
          id: r.id,
          customer_name: r.customer_name,
          review_text: r.review_text,
          customer_star_rating: r.customer_star_rating,
          overall_ai_rating: r.overall_ai_rating,
          product_score: r.product_score,
          service_score: r.service_score,
          delivery_score: r.delivery_score,
          business_reply: r.business_reply,
          created_at: r.created_at,
        })),
      }),
    );
  } catch (err) {
    // Any thrown error here previously produced Next's default error page, which
    // has no CORS headers — the browser then reports a misleading "CORS policy"
    // error instead of the real cause. Always answer with CORS headers so the
    // embedding site's fetch() can actually read (and we can debug) the failure.
    console.error("widget API failed", err);
    return withCors(NextResponse.json({ error: "No se pudo cargar el widget." }, { status: 500 }));
  }
}
