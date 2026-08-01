import { NextRequest, NextResponse } from "next/server";
import { getBusiness, getReviews, getWidgetConfig } from "@/lib/data";
import { resolveBusinessId } from "@/lib/demo";

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
  const { businessId: rawId } = await params;
  const businessId = resolveBusinessId(rawId);

  const [business, reviews, config] = await Promise.all([
    getBusiness(businessId),
    getReviews(businessId),
    getWidgetConfig(businessId),
  ]);

  const publicReviews = reviews
    .filter((r) => r.status === "published" || r.status === "resolved")
    .slice(0, 12);

  const average = publicReviews.length
    ? publicReviews.reduce((sum, r) => sum + r.overall_ai_rating, 0) / publicReviews.length
    : 0;

  return withCors(
    NextResponse.json({
      business: { name: business.name },
      config,
      average_rating: Math.round(average * 10) / 10,
      total_reviews: publicReviews.length,
      reviews: publicReviews.map((r) => ({
        id: r.id,
        customer_name: r.customer_name,
        review_text: r.review_text,
        overall_ai_rating: r.overall_ai_rating,
        product_score: r.product_score,
        service_score: r.service_score,
        delivery_score: r.delivery_score,
        created_at: r.created_at,
      })),
    }),
  );
}
