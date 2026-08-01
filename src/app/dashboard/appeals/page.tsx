import { AppealsManager } from "@/components/dashboard/appeals-manager";
import { getAppeals, getReviews } from "@/lib/data";
import { DEMO_BUSINESS_ID } from "@/lib/demo";

export default async function AppealsPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewId?: string }>;
}) {
  const { reviewId } = await searchParams;
  const [reviews, appeals] = await Promise.all([
    getReviews(DEMO_BUSINESS_ID),
    getAppeals(DEMO_BUSINESS_ID),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestor de apelaciones</h1>
        <p className="mt-1 text-sm text-muted">
          Solicita la revisión de una reseña adjuntando evidencia verificable.
        </p>
      </div>

      <AppealsManager
        businessId={DEMO_BUSINESS_ID}
        reviews={reviews}
        initialAppeals={appeals}
        defaultReviewId={reviewId}
      />
    </div>
  );
}
